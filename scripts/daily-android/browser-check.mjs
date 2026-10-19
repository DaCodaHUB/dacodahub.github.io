import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
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
await mkdir('.astro/daily-browser-profile', { recursive: true });
const chromePath = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!chromePath) { server.close(); throw new Error('Install Chrome/Chromium or set CHROME_PATH. Build first with npm run build.'); }
const chrome = spawn(chromePath, [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--disable-background-networking', '--remote-debugging-port=0',
  '--user-data-dir=' + resolve('.astro/daily-browser-profile'), 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const browserUrl = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error('Browser startup timeout')), 25000);
    let text = '';
    chrome.stderr.on('data', chunk => { text += chunk; const match = text.match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timeout); resolve(match[1]); } });
    chrome.on('error', reject);
  });
  const port = new URL(browserUrl).port;
  const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const target = targets.find(target => target.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const pending = new Map(), errors = [];
  let id = 0;
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    const item = pending.get(message.id);
    if (item) { clearTimeout(item.timeout); pending.delete(message.id); message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result); }
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const next = ++id;
      const timeout = setTimeout(() => { pending.delete(next); reject(Error('CDP timeout: ' + method)); }, 15000);
      pending.set(next, { resolve, reject, timeout }); socket.send(JSON.stringify({ id: next, method, params }));
    });
  }
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const requests = [];
  await send('Network.enable');
  socket.addEventListener('message', event => { const m=JSON.parse(event.data); if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url); });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__dailyTestNow = Date.parse('2026-10-19T12:00:00Z');
    const RealDate = Date;
    window.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : [window.__dailyTestNow])); }
      static now() { return window.__dailyTestNow; }
    };
  ` });
  async function load() {
    await send('Page.navigate', {url:origin+'/daily-android/'});
    let ready=false;
    for(let n=0;n<80;n++) { ready=await evaluate(`document.querySelector('[data-daily-pair]')?.hidden === false`); if(ready)break;await new Promise(r=>setTimeout(r,100)); }
    assert.ok(ready,'Daily pair failed to mount');
  }
  const pair=()=>evaluate(`({flashcard:document.querySelector('[data-flashcard]')?.dataset.flashcard,challenge:document.querySelector('[data-challenge]')?.dataset.challenge,date:document.querySelector('[data-daily-date]').textContent,cards:document.querySelectorAll('[data-flashcard]').length,challenges:document.querySelectorAll('[data-challenge]').length})`);
  await load();await evaluate(`localStorage.clear()`);await load();
  assert.deepEqual(await pair(),{flashcard:'fc-004',challenge:'acr-001',date:'2026-10-19 \u00b7 UTC',cards:1,challenges:1});
  assert.equal(await evaluate(`document.querySelector('[data-flashcard-answer]').open`),false);
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
  assert.equal(await evaluate(`document.querySelector('[data-flashcard] .daily-learn').checkVisibility()`),false);
  assert.equal(await evaluate(`document.querySelector('[data-response]').labels.length`),1);
  assert.equal(await evaluate(`document.querySelector('a[href="/daily-android/"]').getAttribute('aria-current')`),'page');
  await evaluate(`document.querySelector('[data-flashcard-answer] summary').focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await new Promise(r=>setTimeout(r,60));
  assert.equal(await evaluate(`document.querySelector('[data-flashcard-answer]').open`),true);
  assert.equal(await evaluate(`document.querySelector('[data-flashcard] .daily-learn').checkVisibility()`),true);
  await evaluate(`document.querySelector('[data-review="known"]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-flashcard-progress]').textContent`),/Known/);
  await evaluate(`document.querySelector('[data-response]').value='<script>window.injected=true</script>';document.querySelector('[data-response]').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`localStorage.getItem('daily-android:v1:challenge:acr-001')`),null);
  await evaluate(`document.querySelector('[data-save-response]').click();document.querySelector('[data-challenge-solution]').open=true;document.querySelector('[data-complete-challenge]').click()`);
  const ax=await send('Accessibility.getFullAXTree');
  assert.ok(ax.nodes.some(n=>n.role?.value==='button'&&n.name?.value==='Known'&&!n.ignored));
  assert.ok(ax.nodes.some(n=>n.role?.value==='textbox'&&n.name?.value?.includes('Your response')&&!n.ignored));
  await load();
  assert.match(await evaluate(`document.querySelector('[data-challenge-progress]').textContent`),/Completed 2026-10-19/);
  assert.equal(await evaluate(`document.querySelector('[data-response]').value`),'<script>window.injected=true</script>');
  assert.equal(await evaluate(`Boolean(window.injected)`),false);
  assert.equal(await evaluate(`document.querySelector('[data-review="known"]').getAttribute('aria-pressed')`),'true');
  for(const [day,type]of [['2026-10-19','code-review'],['2026-10-20','code-completion'],['2026-10-21','system-design'],['2026-10-22','engineering-scenario']]){
    await evaluate(`window.__dailyTestNow=Date.parse('${day}T12:00:00Z');window.dispatchEvent(new Event('focus'))`);
    assert.equal((await pair()).cards,1);assert.equal((await pair()).challenges,1);
    assert.equal(await evaluate(`document.querySelector('[data-challenge]').dataset.challengeType`),type);
    await evaluate(`document.querySelector('[data-challenge-solution]').open=true`);
    assert.ok(await evaluate(`document.querySelector('[data-challenge-solution]').textContent.includes('Self-evaluation')`));
    if(type==='code-completion')assert.ok(await evaluate(`document.querySelector('[data-challenge] pre').textContent.includes('BLANK:')`));
    if(type==='system-design')assert.ok(await evaluate(`document.querySelector('[data-challenge]').textContent.includes('Functional requirements')&&document.querySelector('[data-challenge-solution]').textContent.includes('Alternatives and trade-offs')`));
    if(type==='engineering-scenario')assert.ok(await evaluate(`document.querySelector('[data-challenge]').textContent.includes('Observations')&&document.querySelector('[data-challenge]').textContent.includes('Your decision')`));
    for(const width of [1440,768,390,320]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<641});
      assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),type+' overflow at '+width);
    }
  }
  const previous=await pair();
  for(const timezoneId of ['America/Los_Angeles','Asia/Tokyo']){await send('Emulation.setTimezoneOverride',{timezoneId});await evaluate(`window.dispatchEvent(new Event('focus'))`);assert.deepEqual(await pair(),previous);}
  await evaluate(`window.__dailyTestNow=Date.parse('2026-10-22T23:59:59.950Z');window.dispatchEvent(new Event('focus'));window.__dailyTestNow=Date.parse('2026-10-23T00:00:00.010Z')`);
  await new Promise(r=>setTimeout(r,250));
  assert.match((await pair()).date,/2026-10-23/);
  assert.match(await evaluate(`document.querySelector('[data-day-announcement]').textContent`),/new UTC day/);
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
  assert.equal(await evaluate(`document.querySelector('template[data-flashcard-template="fc-001"]').content.querySelectorAll('.daily-learn').length`),0);
  await load();await evaluate(`localStorage.setItem('daily-android:v1:flashcard:fc-004','{broken')`);await load();
  assert.match(await evaluate(`document.querySelector('[data-storage-status]').textContent`),/could not be read/);
  await evaluate(`document.querySelector('[data-flashcard-answer]').open=true;document.querySelector('[data-review="review-again"]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-flashcard-progress]').textContent`),/Review again/);
  const denied=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});`});
  await load();assert.match(await evaluate(`document.querySelector('[data-storage-status]').textContent`),/unavailable/);
  await evaluate(`document.querySelector('[data-flashcard-answer]').open=true;document.querySelector('[data-review="known"]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-flashcard-progress]').textContent`),/Known/);
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:denied.identifier});
  await load();
  for(const value of ['light','dark']){
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value}]});
    await evaluate(`document.querySelector('[data-flashcard-answer]').open=true;document.querySelector('[data-review="review-again"]').focus()`);
    const styles=await evaluate(`(()=>{const s=getComputedStyle(document.activeElement);return {color:s.color,background:s.backgroundColor,outline:s.outlineWidth};})()`);
    assert.notEqual(styles.color,styles.background);assert.equal(styles.outline,'2px');
  }
  for(const width of [1440,390]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<641});
    await evaluate(`document.querySelector('[data-flashcard-answer]').open=false;window.scrollTo(0,0)`);
    const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/daily-android-'+width+'.png',Buffer.from(shot.data,'base64'));
  }
  assert.ok(requests.every(url=>url.startsWith(origin)||/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)),'Unexpected external data request');
  await send('Emulation.setScriptExecutionDisabled',{value:true});await send('Page.navigate',{url:origin+'/daily-android/'});await new Promise(r=>setTimeout(r,200));
  assert.equal(await evaluate(`document.querySelectorAll('[data-flashcard]').length`),0);
  assert.ok(await evaluate(`document.querySelector('noscript').textContent.includes('Enable JavaScript')`));
  assert.deepEqual(errors,[]);
  console.log('Passed: one pair, hidden answers/Learn More, keyboard and accessibility tree, opt-in persistence, safe response text, four formats, 320-1440px layouts, UTC timezones/rollover, mapping gaps, corrupt/denied storage, focus styles, no external data API, no-JS fallback.');
  await send('Browser.close').catch(()=>{});
} finally {socket?.close();chrome.kill();await new Promise(resolve=>server.close(resolve));}
