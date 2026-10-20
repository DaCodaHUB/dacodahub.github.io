import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Optional built-site smoke test, following the repository's existing Chrome/CDP approach.
const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  try {
    let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, '.' + path);
    if (!file.startsWith(root + sep)) throw Error('Invalid path');
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
await mkdir('.astro/demand-browser-profile', { recursive: true });
const chromePath = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!chromePath) { server.close(); throw Error('Install Chrome/Chromium or set CHROME_PATH. Run npm run build first.'); }
const chrome = spawn(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + resolve('.astro/demand-browser-profile'), 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const browserUrl = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error('Browser startup timeout')), 25000);
    let text = '';
    chrome.stderr.on('data', chunk => { text += chunk; const match = text.match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timeout); resolve(match[1]); } });
    chrome.on('error', reject);
  });
  const targets = await (await fetch('http://127.0.0.1:' + new URL(browserUrl).port + '/json/list')).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const pending = new Map(), errors = [], requests = [];
  let sequence = 0;
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
    const item = pending.get(message.id);
    if (item) { clearTimeout(item.timeout); pending.delete(message.id); message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result); }
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timeout = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 15000);
      pending.set(id, { resolve, reject, timeout }); socket.send(JSON.stringify({ id, method, params }));
    });
  }
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const origin = `http://127.0.0.1:${server.address().port}`;
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/market/' });
  let ready = false;
  for (let i = 0; i < 80; i++) {
    ready = await evaluate(`document.querySelector('[data-demand-controls]')?.hidden === false`);
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Explorer did not initialize');
  const ids = await evaluate(`[...document.querySelector('#demand-occupation').options].map(o=>o.value)`);
  assert.equal(ids.length, 5);
  assert.equal(await evaluate(`document.querySelector('#demand-occupation').labels[0].textContent`), 'Choose an occupation');
  const ax = await send('Accessibility.getFullAXTree');
  assert.ok(ax.nodes.some(n => n.role?.value === 'combobox' && n.name?.value === 'Choose an occupation' && !n.ignored));
  for (const id of ids) {
    await evaluate(`document.querySelector('#demand-occupation').value=${JSON.stringify(id)};document.querySelector('#demand-occupation').dispatchEvent(new Event('change'))`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-demand-occupation]:not([hidden])').length`), 1);
    assert.equal(await evaluate(`document.querySelector('[data-demand-occupation]:not([hidden])').dataset.demandOccupation`), id);
    assert.equal(await evaluate(`document.querySelectorAll('[data-demand-occupation]:not([hidden]) .demand-bars li').length`), 10);
    assert.equal(await evaluate(`document.querySelector('[data-demand-comparison][data-selected="true"]').dataset.demandComparison`), id);
    assert.ok(await evaluate(`[...document.querySelectorAll('[data-demand-occupation]:not([hidden]) .demand-bars li')].every(li=>li.querySelector('strong').textContent.endsWith('%'))`));
    for (const width of [1440, 768, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 641 });
      assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), `${id}: page overflow at ${width}px`);
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate(`document.querySelector('#demand-occupation').value=${JSON.stringify(ids[0])};document.querySelector('#demand-occupation').dispatchEvent(new Event('change'));document.querySelector('#demand-occupation').focus()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  assert.equal(await evaluate(`document.querySelector('#demand-occupation').value`), ids[1]);
  assert.equal(await evaluate(`document.querySelector('[data-demand-occupation]:not([hidden])').dataset.demandOccupation`), ids[1]);
  for (const value of ['light', 'dark']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }] });
    await evaluate(`document.querySelector('#demand-occupation').focus()`);
    const style = await evaluate(`(()=>{const s=getComputedStyle(document.activeElement);return {color:s.color,background:s.backgroundColor,outline:s.outlineWidth}})()`);
    assert.notEqual(style.color, style.background); assert.equal(style.outline, '2px');
  }
  for (const width of [1440, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width < 641 });
    await evaluate(`document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:window.scrollY+document.querySelector('[data-demand-explorer]').getBoundingClientRect().top-110,behavior:'instant'})`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`.astro/demand-${width}.png`, Buffer.from(shot.data, 'base64'));
  }
  assert.ok(requests.every(url => url.startsWith(origin) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)), 'Unexpected external API request');
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url: origin + '/market/' });
  await new Promise(resolve => setTimeout(resolve, 300));
  assert.equal(await evaluate(`document.querySelectorAll('[data-demand-occupation]:not([hidden])').length`), 5);
  assert.equal(await evaluate(`document.querySelector('[data-demand-controls]').hidden`), true);
  assert.deepEqual(errors, []);
  console.log('Passed: five occupations/top-ten bars, exact labels, comparison highlighting, keyboard selector, accessibility tree, visible focus under light/dark preferences, 320–1440px layouts, no external economic APIs, and no-JavaScript fallback.');
  await send('Browser.close').catch(() => {});
} finally { socket?.close(); chrome.kill(); await new Promise(resolve => server.close(resolve)); }
