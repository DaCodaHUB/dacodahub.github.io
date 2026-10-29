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
  assert.equal(await evaluate(`document.querySelectorAll('template[data-flashcard-template]').length`),73);
  assert.equal(await evaluate(`document.querySelectorAll('template[data-challenge-template]').length`),30);
  assert.ok(await evaluate(`[...document.querySelectorAll('template[data-challenge-template]')].every(t=>t.dataset.challengeTemplate.startsWith('cr-')&&t.content.querySelector('[data-challenge-solution] summary').textContent==='Reveal Findings')`));
  assert.equal(await evaluate(`[...document.querySelectorAll('template[data-flashcard-template]')].filter(t=>t.content.querySelector('.daily-flashcard-code pre')).length`),17);
  assert.ok(await evaluate(`[...document.querySelectorAll('template[data-flashcard-template]')].every(t=>t.content.textContent.includes('Tradeoffs / follow-up'))`));
  assert.equal(await evaluate(`document.querySelector('template[data-flashcard-template="fc-005"]')`),null);
  const studied=new Set();
  for(let offset=0;offset<73;offset++){
    await evaluate(`window.__dailyTestNow=Date.parse('2026-10-19T12:00:00Z')+${offset}*86400000;window.dispatchEvent(new Event('focus'))`);
    const current=await pair();
    assert.ok(!studied.has(current.flashcard),'Repeated active card within a cycle');
    studied.add(current.flashcard);
  }
  assert.equal(studied.size,73);
  await evaluate(`window.__dailyTestNow=Date.parse('2026-10-19T12:00:00Z');window.dispatchEvent(new Event('focus'))`);
  assert.deepEqual(await pair(),{flashcard:'fc-004',challenge:'cr-001',date:'2026-10-19 \u00b7 Pacific',cards:1,challenges:1});
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
  assert.equal(await evaluate(`localStorage.getItem('daily-android:v2:challenge:cr-001')`),null);
  await evaluate(`document.querySelector('[data-save-response]').click();document.querySelector('[data-challenge-solution]').open=true;document.querySelector('[data-complete-challenge]').click()`);
  const ax=await send('Accessibility.getFullAXTree');
  assert.ok(ax.nodes.some(n=>n.role?.value==='button'&&n.name?.value==='Known'&&!n.ignored));
  assert.ok(ax.nodes.some(n=>n.role?.value==='textbox'&&n.name?.value?.includes('Your response')&&!n.ignored));
  await load();
  assert.match(await evaluate(`document.querySelector('[data-challenge-progress]').textContent`),/Completed 2026-10-19/);
  assert.equal(await evaluate(`document.querySelector('[data-response]').value`),'<script>window.injected=true</script>');
  assert.equal(await evaluate(`Boolean(window.injected)`),false);
  assert.equal(await evaluate(`document.querySelector('[data-review="known"]').getAttribute('aria-pressed')`),'true');
  for(const [day,difficulty] of [['2026-10-19','Easy'],['2026-10-29','Medium'],['2026-11-10','Hard'],['2026-11-28','Medium']]){
    await evaluate(`window.__dailyTestNow=Date.parse('${day}T12:00:00Z');window.dispatchEvent(new Event('focus'))`);
    assert.equal((await pair()).cards,1);assert.equal((await pair()).challenges,1);
    assert.equal(await evaluate(`document.querySelector('[data-challenge]').dataset.challengeType`),'code-review');
    assert.equal(await evaluate(`document.querySelector('[data-challenge]').dataset.difficulty`),difficulty);
    assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
    assert.ok(await evaluate(`document.querySelector('[data-challenge] pre span[style]')!==null`));
    await evaluate(`document.querySelector('[data-challenge-solution]').open=true`);
    assert.ok(await evaluate(`document.querySelector('[data-challenge-solution]').textContent.includes('Expected findings')&&document.querySelector('[data-challenge-solution]').textContent.includes('Engineering tradeoffs')`));
    for(const width of [1440,768,390,320]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<641});
      assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),difficulty+' overflow at '+width);
      if(difficulty==='Hard'&&width===390){
        await evaluate(`document.querySelector('[data-challenge] h2').scrollIntoView({block:'start',behavior:'instant'})`);
        const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/code-review-mobile.png',Buffer.from(shot.data,'base64'));
      }
    }
  }
  const previous=await pair();
  for(const timezoneId of ['America/Los_Angeles','Asia/Tokyo']){await send('Emulation.setTimezoneOverride',{timezoneId});await evaluate(`window.dispatchEvent(new Event('focus'))`);assert.deepEqual(await pair(),previous);}
  await evaluate(`window.__dailyTestNow=Date.parse('2026-10-23T07:59:59.950Z');window.dispatchEvent(new Event('focus'));window.__dailyTestNow=Date.parse('2026-10-23T08:00:00.010Z')`);
  await new Promise(r=>setTimeout(r,250));
  assert.match((await pair()).date,/2026-10-23/);
  assert.match(await evaluate(`document.querySelector('[data-day-announcement]').textContent`),/new Pacific practice day/);
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
  assert.equal(await evaluate(`document.querySelector('template[data-flashcard-template="fc-001"]').content.querySelectorAll('.daily-learn').length`),0);
  await load();await evaluate(`localStorage.setItem('daily-android:v2:flashcard:fc-004','{broken')`);await load();
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
  // Unlimited study is independent of the daily challenge and survives navigation.
  await evaluate(`document.querySelector('[data-challenge-solution]').open=true;document.querySelector('[data-response]').value='Unsaved challenge text';window.__challengeBeforeStudy=document.querySelector('[data-challenge]')`);
  const recommended=(await pair()).flashcard;
  await evaluate(`document.querySelector('[data-study-next]').click()`);
  assert.notEqual((await pair()).flashcard,recommended);
  assert.ok(await evaluate(`document.querySelector('[data-challenge]')===window.__challengeBeforeStudy`));
  assert.equal(await evaluate(`document.querySelector('[data-response]').value`),'Unsaved challenge text');
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),true);
  const sessionCards=new Set();
  for(let i=0;i<73;i++){
    const card=(await pair()).flashcard;
    assert.ok(!sessionCards.has(card),'Study repeated a card before exhausting the collection');
    sessionCards.add(card);
    assert.equal(await evaluate(`document.querySelector('[data-study-next]').disabled`),true);
    await evaluate(`document.querySelector('[data-flashcard-answer]').open=true;document.querySelector('[data-review="known"]').click()`);
    if(i===0||i===36||i===72){
      await load();
      assert.equal((await pair()).flashcard,card);
      assert.equal(await evaluate(`document.querySelector('[data-study-next]').disabled`),false);
      assert.equal(await evaluate(`document.querySelector('[data-review="known"]').getAttribute('aria-pressed')`),'true');
    }
    if(i<72)await evaluate(`document.querySelector('[data-study-next]').click()`);
  }
  assert.equal(sessionCards.size,73);
  assert.match(await evaluate(`document.querySelector('[data-study-status]').textContent`),/Session complete/);
  assert.equal(await evaluate(`document.querySelector('[data-study-next]').textContent`),'Practice again');
  const savedReviews=await evaluate(`JSON.stringify(Object.entries(localStorage).filter(([key])=>key.startsWith('daily-android:v2:flashcard:')).sort())`);
  await evaluate(`document.querySelector('[data-study-next]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-study-status]').textContent`),/1 of 73/);
  assert.equal(await evaluate(`JSON.stringify(Object.entries(localStorage).filter(([key])=>key.startsWith('daily-android:v2:flashcard:')).sort())`),savedReviews);
  const restarted=(await pair()).flashcard;
  await load();assert.equal((await pair()).flashcard,restarted);
  // An active study session continues across the recommendation's reset boundary.
  await evaluate(`window.__dailyTestNow=Date.parse('2026-10-20T12:00:00Z');window.dispatchEvent(new Event('focus'))`);
  assert.equal((await pair()).flashcard,restarted);
  assert.equal((await pair()).challenge,'cr-002');
  await evaluate(`localStorage.removeItem('daily-android:study-session:v1')`);await load();
  for(const width of [1440,390]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<641});
    await evaluate(`document.querySelector('[data-flashcard-answer]').open=false;window.scrollTo(0,0)`);
    const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/daily-android-'+width+'.png',Buffer.from(shot.data,'base64'));
  }
  // Exercise a highlighted example independently of today's scheduled card.
  await evaluate(`(()=>{
    const fixture=document.createElement('div'); fixture.id='flashcard-code-fixture';
    fixture.append(document.querySelector('template[data-flashcard-template="fc-001"]').content.cloneNode(true));
    document.querySelector('[data-flashcard-slot]').append(fixture);
    fixture.querySelector('[data-flashcard-answer]').open=true;
  })()`);
  assert.equal(await evaluate(`document.querySelector('#flashcard-code-fixture .daily-flashcard-extra').open`),false);
  await evaluate(`document.querySelector('#flashcard-code-fixture .daily-flashcard-extra summary').focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  assert.equal(await evaluate(`document.querySelector('#flashcard-code-fixture .daily-flashcard-extra').open`),true);
  assert.ok(await evaluate(`document.querySelector('#flashcard-code-fixture pre span[style]')!==null`),'Missing syntax highlighting');
  assert.equal(await evaluate(`document.querySelector('#flashcard-code-fixture pre').tabIndex`),0);
  assert.match(await evaluate(`document.querySelector('#flashcard-code-fixture pre').getAttribute('aria-label')`),/Kotlin/);
  await evaluate(`document.querySelectorAll('#flashcard-code-fixture .daily-flashcard-extra')[1].querySelector('summary').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('#flashcard-code-fixture .daily-flashcard-extra')[1].open`),true);
  for(const width of [1440,768,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<641});
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),'Expanded flashcard overflow at '+width);
    if(width===320){
      assert.ok(await evaluate(`(()=>{const p=document.querySelector('#flashcard-code-fixture pre');p.scrollLeft=999;return p.scrollLeft>0;})()`),'Code must scroll inside its card');
    }
    if(width===390||width===1440){
      await evaluate(`document.querySelector('#flashcard-code-fixture pre').scrollIntoView({block:'center',behavior:'instant'});new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
      const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/flashcard-code-'+width+'.png',Buffer.from(shot.data,'base64'));
    }
  }
  await evaluate(`document.querySelector('#flashcard-code-fixture').remove()`);
  // Code-review practice must never remount or reset Flashcards.
  await load();
  await evaluate(`document.querySelector('[data-challenge-solution]').open=true;document.querySelector('[data-review-challenge]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-challenge-progress]').textContent`),/Needs review/);
  await load();
  assert.match(await evaluate(`document.querySelector('[data-challenge-progress]').textContent`),/Needs review/);
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
  await evaluate(`document.querySelector('[data-challenge-solution]').open=true;document.querySelector('[data-complete-challenge]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-challenge-progress]').textContent`),/Completed/);
  await evaluate(`window.__flashBeforeReviewPractice=document.querySelector('[data-flashcard]');document.querySelector('[data-review-difficulty]').value='Hard';document.querySelector('[data-review-difficulty]').dispatchEvent(new Event('change'))`);
  const hard=new Set();
  for(let i=0;i<4;i++){
    const current=(await pair()).challenge;
    assert.ok(!hard.has(current));hard.add(current);
    assert.equal(await evaluate(`document.querySelector('[data-challenge]').dataset.difficulty`),'Hard');
    assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
    assert.ok(await evaluate(`document.querySelector('[data-flashcard]')===window.__flashBeforeReviewPractice`));
    if(i<3)await evaluate(`document.querySelector('[data-next-challenge]').click()`);
  }
  assert.equal(hard.size,4);
  const lastHard=(await pair()).challenge;
  await evaluate(`document.querySelector('[data-next-challenge]').click()`);
  assert.notEqual((await pair()).challenge,lastHard);
  const resumed=(await pair()).challenge;
  await load();assert.equal((await pair()).challenge,resumed);
  assert.equal(await evaluate(`document.querySelector('[data-review-difficulty]').value`),'Hard');
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
  await evaluate(`localStorage.removeItem('daily-android:code-review-practice:v1')`);await load();
  const allReviews=new Set([(await pair()).challenge]);
  for(let i=1;i<30;i++){
    await evaluate(`document.querySelector('[data-next-challenge]').click()`);
    const id=(await pair()).challenge;
    assert.ok(!allReviews.has(id),'Repeated review before exhausting active bank');allReviews.add(id);
  }
  assert.equal(allReviews.size,30);
  await evaluate(`document.querySelector('[data-next-challenge]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-challenge-solution]').open`),false);
  assert.ok(requests.every(url=>url.startsWith(origin)||/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)),'Unexpected external data request');
  // NeetCode is independent of Code Review and Flashcard progress and daily rollover.
  await evaluate(`Object.keys(localStorage).filter(k=>k.startsWith('daily-android:neetcode:')).forEach(k=>localStorage.removeItem(k))`);
  await load();
  await evaluate(`window.__reviewBeforeNC=document.querySelector('[data-challenge]');window.__flashBeforeNC=document.querySelector('[data-flashcard]');document.querySelector('[data-challenge-type="neetcode"]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-code-review-panel]').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('[data-neetcode-panel]').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('[data-nc-title]').textContent`),'Contains Duplicate');
  assert.equal(await evaluate(`document.querySelector('[data-nc-previous]').disabled`),true);
  assert.match(await evaluate(`document.querySelector('[data-nc-link]').href`),/problems\/duplicate-integer\/question$/);
  await evaluate(`document.querySelector('[data-nc-complete]').click();document.querySelector('[data-nc-recommended]').click();document.querySelector('[data-nc-review]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-nc-title]').textContent`),'Valid Anagram');
  assert.equal(await evaluate(`document.querySelector('[data-nc-status]').textContent`),'Needs Review');
  assert.match(await evaluate(`document.querySelector('[data-nc-progress]').textContent`),/1 \/ 26 completed/);
  await evaluate(`document.querySelector('[data-nc-next]').click();document.querySelector('[data-nc-previous]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-nc-title]').textContent`),'Valid Anagram');
  assert.ok(await evaluate(`document.querySelector('[data-challenge]')===window.__reviewBeforeNC&&document.querySelector('[data-flashcard]')===window.__flashBeforeNC`));
  await load();
  assert.equal(await evaluate(`document.querySelector('[data-nc-title]').textContent`),'Valid Anagram');
  assert.equal(await evaluate(`document.querySelector('[data-nc-status]').textContent`),'Needs Review');
  await evaluate(`window.__dailyTestNow+=86400000;window.dispatchEvent(new Event('focus'))`);
  assert.equal(await evaluate(`document.querySelector('[data-nc-title]').textContent`),'Valid Anagram');
  await evaluate(`document.querySelector('[data-challenge-type="neetcode"]').click()`);
  for(const width of [1440,768,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<641});
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),'NeetCode overflow at '+width);
    if(width===390||width===1440){
      await evaluate(`document.querySelector('[data-neetcode]').scrollIntoView({block:'start',behavior:'instant'});new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
      const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/neetcode-'+width+'.png',Buffer.from(shot.data,'base64'));
    }
  }
  // Retired acknowledgements cannot skip the six actual prerequisite problems.
  await evaluate(`for(const option of document.querySelector('[data-nc-select]').options){if(!['kth-largest-element-in-a-stream','last-stone-weight','kth-largest-element-in-an-array','subsets','combination-sum','permutations'].includes(option.value))localStorage.setItem('daily-android:neetcode:v1:problem:'+option.value,'completed')}localStorage.setItem('daily-android:neetcode:v1:study:Backtracking','ready');localStorage.setItem('daily-android:neetcode:v1:study:Heap / Priority Queue','ready')`);
  await load();
  await evaluate(`document.querySelector('[data-challenge-type="neetcode"]').click();document.querySelector('[data-nc-recommended]').click()`);
  for(const title of ['Kth Largest Element in a Stream','Last Stone Weight','Kth Largest Element in an Array','Subsets','Combination Sum','Permutations']){
    assert.equal(await evaluate(`document.querySelector('[data-nc-title]').textContent`),title);
    await evaluate(`document.querySelector('[data-nc-complete]').click();document.querySelector('[data-nc-recommended]').click()`);
  }
  assert.match(await evaluate(`document.querySelector('[data-nc-recommendation]').textContent`),/All 26 completed/);
  await evaluate(`document.querySelector('[data-nc-select]').value='merge-intervals';document.querySelector('[data-nc-select]').dispatchEvent(new Event('change'))`);
  assert.match(await evaluate(`document.querySelector('[data-nc-prerequisites]').textContent`),/Heap/);
  assert.equal(await evaluate(`document.querySelector('[data-nc-prerequisites] button')`),null);
  assert.equal(await evaluate(`document.querySelector('[data-nc-next]').disabled`),true);
  await evaluate(`document.querySelector('[data-nc-complete]').click()`);
  await load();
  assert.equal(await evaluate(`document.querySelector('[data-nc-complete]').disabled`),false);
  assert.equal(await evaluate(`document.querySelector('[data-nc-status]').textContent`),'Completed');
  await evaluate(`document.querySelector('[data-challenge-type="neetcode"]').click();document.querySelector('[data-challenge-type="review"]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-code-review-panel]').hidden`),false);
  console.log('Passed: NeetCode next/previous/boundaries, recommendation, Completed/Needs Review, reload and calendar persistence, independent challenge switching, six prerequisite problems without resetting original progress, and 320-1440px layouts.');
  // Mobile System Design owns a third independent panel and store.
  await evaluate(`Object.keys(localStorage).filter(k=>k.startsWith('daily-android:mobile-system-design:')).forEach(k=>localStorage.removeItem(k))`);
  await load();
  await evaluate(`window.__beforeDesignStorage=JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('daily-android:mobile-system-design:'))));window.__beforeDesignFlash=document.querySelector('[data-flashcard]');window.__beforeDesignReview=document.querySelector('[data-challenge]');window.__beforeDesignNC=document.querySelector('[data-nc-title]').textContent;document.querySelector('[data-challenge-type="design"]').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('[data-md-template]').length`),8);
  assert.equal(await evaluate(`document.querySelector('[data-md-challenge]').dataset.mdChallenge`),'msd-001');
  assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('[data-md-previous]').disabled`),true);
  assert.equal(await evaluate(`document.querySelector('[data-code-review-panel]').hidden&&document.querySelector('[data-neetcode-panel]').hidden&&!document.querySelector('[data-mobile-design-panel]').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('[data-mobile-design] textarea')`),null);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('[data-md-practice] a')].map(a=>({href:a.href,target:a.target,rel:a.rel}))`),[
    {href:'https://app.coderpad.io/sandbox',target:'_blank',rel:'noopener noreferrer'},
    {href:'https://excalidraw.com/',target:'_blank',rel:'noopener noreferrer'},
  ]);
  await evaluate(`document.querySelector('[data-md-reveal]').focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('[data-md-reveal]').getAttribute('aria-expanded')`),'true');
  assert.equal(await evaluate(`document.querySelector('[data-md-reveal]').textContent`),'Hide Reference Design');
  await evaluate(`document.querySelector('[data-md-hide]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),true);
  assert.equal(await evaluate(`document.activeElement===document.querySelector('[data-md-reveal]')`),true);
  await evaluate(`document.querySelector('[data-md-complete]').click();document.querySelector('[data-md-next]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-md-challenge]').dataset.mdChallenge`),'msd-002');
  assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),true);
  await evaluate(`document.querySelector('[data-md-review]').click();document.querySelector('[data-md-previous]').click()`);
  assert.match(await evaluate(`document.querySelector('[data-md-status]').textContent`),/Completed/);
  await evaluate(`document.querySelector('[data-md-reveal]').click();document.querySelector('[data-challenge-type="neetcode"]').click();document.querySelector('[data-challenge-type="review"]').click();document.querySelector('[data-challenge-type="design"]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),false);
  assert.ok(await evaluate(`document.querySelector('[data-flashcard]')===window.__beforeDesignFlash&&document.querySelector('[data-challenge]')===window.__beforeDesignReview&&document.querySelector('[data-nc-title]').textContent===window.__beforeDesignNC`));
  assert.equal(await evaluate(`JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('daily-android:mobile-system-design:'))))===window.__beforeDesignStorage`),true);
  await load();
  assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),true);
  assert.match(await evaluate(`document.querySelector('[data-md-status]').textContent`),/Completed/);
  await evaluate(`document.querySelector('[data-challenge-type="design"]').click();document.querySelector('[data-md-recommended]').click()`);
  assert.equal(await evaluate(`document.querySelector('[data-md-challenge]').dataset.mdChallenge`),'msd-002');
  assert.match(await evaluate(`document.querySelector('[data-md-status]').textContent`),/Needs Review/);
  await evaluate(`window.__dailyTestNow+=86400000;window.dispatchEvent(new Event('focus'))`);
  assert.equal(await evaluate(`document.querySelector('[data-md-challenge]').dataset.mdChallenge`),'msd-002');
  for(let cycle=0;cycle<2;cycle++){
    for(let n=1;n<=8;n++){
      await evaluate(`document.querySelector('[data-md-select]').value='msd-00${n}';document.querySelector('[data-md-select]').dispatchEvent(new Event('change'))`);
      assert.equal(await evaluate(`document.querySelector('[data-md-reference]').hidden`),true);
      await evaluate(`document.querySelector('[data-md-complete]').click()`);
    }
  }
  assert.equal(await evaluate(`document.querySelector('[data-md-next]').disabled`),true);
  assert.match(await evaluate(`document.querySelector('[data-md-progress]').textContent`),/8 \/ 8 completed/);
  assert.match(await evaluate(`document.querySelector('[data-md-recommendation]').textContent`),/All designs completed/);
  await evaluate(`document.querySelector('[data-md-reveal]').click()`);
  for(const width of [1440,768,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<641});
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),'System design overflow at '+width);
    if(width===390||width===1440){
      await evaluate(`document.querySelector('[data-md-reference]').scrollIntoView({block:'start',behavior:'instant'});new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
      const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/mobile-design-'+width+'.png',Buffer.from(shot.data,'base64'));
    }
  }
  // Every reference diagram must wrap at narrow widths under both system preferences.
  await evaluate(`document.fonts.ready`);
  for(const scheme of ['dark','light']){
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:scheme}]});
    for(const width of [320,375,1440]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<641});
      for(let n=1;n<=8;n++){
        await evaluate(`document.querySelector('[data-md-select]').value='msd-00${n}';document.querySelector('[data-md-select]').dispatchEvent(new Event('change'));document.querySelector('[data-md-reveal]').click()`);
        const layout=await evaluate(`(()=>{
          const root=document.querySelector('[data-md-reference]'),diagram=root.querySelector('[data-md-diagram]');
          return {diagrams:root.querySelectorAll('[data-md-diagram]').length,sections:root.querySelectorAll('.md-section').length,
            horizontal:document.documentElement.scrollWidth>innerWidth,
            clipped:[...diagram.querySelectorAll('.md-node,.md-edge')].some(e=>e.scrollWidth>e.clientWidth+1),
            unlabeled:[...diagram.querySelectorAll('.md-node')].some(e=>!e.querySelector('small').textContent.trim()||!e.querySelector('strong').textContent.trim()),
            async:diagram.querySelectorAll('.md-connection--async').length};})()`);
        assert.equal(layout.diagrams,1);assert.equal(layout.sections,8);assert.equal(layout.horizontal,false,`Reference overflow ${n} at ${width}`);
        assert.equal(layout.clipped,false,`Diagram clipping ${n} at ${width}`);assert.equal(layout.unlabeled,false);assert.ok(layout.async>0);
        const contrast=await evaluate(`(()=>{
          const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1;
          const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
          const background=e=>{if(!e)return [11,15,20];const c=rgba(getComputedStyle(e).backgroundColor),a=c[3]/255,b=background(e.parentElement);return c.slice(0,3).map((v,i)=>v*a+b[i]*(1-a));};
          const luminance=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
          return Math.min(...[...document.querySelectorAll('[data-md-reference] h3,[data-md-reference] .md-node small,[data-md-reference] .md-node strong,[data-md-reference] .md-edge span:not(.sr-only),[data-md-reference] .md-edge small,[data-md-reference] .md-prose li,[data-md-reference] dt,[data-md-reference] dd')].map(e=>{const fg=luminance(rgba(getComputedStyle(e).color)),bg=luminance(background(e));return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);}));})()`);
        assert.ok(contrast>=4.5,`Contrast ${contrast} for ${n} at ${width} in ${scheme}`);
        if(n===1&&scheme==='dark'&&(width===375||width===1440)){
          await evaluate(`document.querySelector('[data-md-diagram]').scrollIntoView({block:'center',behavior:'instant'});new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
          const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/design-diagram-'+width+'.png',Buffer.from(shot.data,'base64'));
          await evaluate(`document.querySelector('.md-decisions').scrollIntoView({block:'center',behavior:'instant'});new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
          const decisions=await send('Page.captureScreenshot',{format:'png'});await writeFile('.astro/design-decisions-'+width+'.png',Buffer.from(decisions.data,'base64'));
        }
      }
    }
  }
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Passed: all eight architecture diagrams, labeled roles and async paths, eight reference sections, no overflow/clipping at 320/375/1440px, and text contrast >=4.5:1 under light and dark system preferences.');
  console.log('Passed: eight Mobile System Design briefs, third-panel isolation, keyboard reveal/hide, external practice links without answer inputs, statuses, reload and rollover persistence, unlimited navigation/practice, and 320-1440px reference layouts.');
  await send('Emulation.setScriptExecutionDisabled',{value:true});await send('Page.navigate',{url:origin+'/daily-android/'});await new Promise(r=>setTimeout(r,200));
  assert.equal(await evaluate(`document.querySelectorAll('[data-flashcard]').length`),0);
  assert.ok(await evaluate(`document.querySelector('noscript').textContent.includes('Enable JavaScript')`));
  assert.deepEqual(errors,[]);
  console.log('Passed: unlimited 73-card sessions, no repeats before exhaustion, restart and reload persistence without clearing reviews, unchanged challenge DOM/response, active-session rollover, hidden answers/Learn More, keyboard and accessibility tree, opt-in persistence, safe response text, 30 active code reviews and difficulty-filtered unlimited practice, 320-1440px layouts, highlighted expandable code with horizontal scrolling, expandable follow-ups, Pacific timezones/rollover, mapping gaps, corrupt/denied storage, focus styles, no external data API, no-JS fallback.');
  await send('Browser.close').catch(()=>{});
} finally {socket?.close();chrome.kill();await new Promise(resolve=>server.close(resolve));}
