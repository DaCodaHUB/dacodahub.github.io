import { neetcodeProblems as problems } from '../../data/neetcode/problems';
import { prerequisites } from '../../data/neetcode/roadmap';
import { adjacentProblem, createNeetcodeStore, neetcodePrefix, recommendedProblem } from './neetcode';

const root = document.querySelector<HTMLElement>('[data-neetcode]');
if (root) {
  const element = <T extends HTMLElement = HTMLElement>(name: string) => root.querySelector<T>(`[data-nc-${name}]`)!;
  const store = createNeetcodeStore(() => localStorage, message => { element('storage').textContent = message; });
  let current = store.currentProblem() ?? recommendedProblem(store.status) ?? problems[0]!;
  function render(focus = false) {
    const status = store.status(current.id);
    const recommendation = recommendedProblem(store.status);
    element('title').textContent = current.title;
    element('topic').textContent = `Current topic: ${current.topic} · Problem ${problems.indexOf(current) + 1} of ${problems.length}`;
    element('difficulty').textContent = current.difficulty;
    element('pattern').textContent = current.pattern;
    element<HTMLAnchorElement>('link').href = current.url;
    element('status').textContent = status === 'completed' ? 'Completed' : status === 'needs-review' ? 'Needs Review' : 'Not completed';
    element('complete').setAttribute('aria-pressed', String(status === 'completed'));
    element('review').setAttribute('aria-pressed', String(status === 'needs-review'));
    element<HTMLButtonElement>('previous').disabled = current === problems[0];
    element<HTMLButtonElement>('next').disabled = current === problems.at(-1);
    element('recommendation').textContent = recommendation ? `Next recommended: ${recommendation.topic} · ${recommendation.title}` : `All ${problems.length} completed. Revisit any problem for unlimited practice.`;
    const select = element<HTMLSelectElement>('select'); select.value = current.id;
    for (const option of select.options) {
      const p = problems.find(p => p.id === option.value)!;
      const state = store.status(p.id);
      option.textContent = `${p.topic} · ${p.title} · ${state === 'completed' ? 'Completed' : state === 'needs-review' ? 'Needs Review' : 'Not completed'}`;
    }
    const completed = problems.filter(p => store.status(p.id) === 'completed').length;
    const reviews = problems.filter(p => store.status(p.id) === 'needs-review').length;
    element('progress').textContent = `${completed} / ${problems.length} completed · ${Math.round(completed / problems.length * 100)}% overall · ${reviews} Needs Review`;
    element<HTMLProgressElement>('bar').value = completed;
    const parents = prerequisites[current.topic] ?? [];
    element('prerequisites').textContent = parents.length ? `Prerequisite topics: ${parents.join(', ')}. Practice their problems earlier in the roadmap.` : '';
    if (focus) element('title').focus({ preventScroll: true });
  }
  element('complete').addEventListener('click', () => { store.setStatus(current.id, 'completed'); render(); });
  element('review').addEventListener('click', () => { store.setStatus(current.id, 'needs-review'); render(); });
  const visit = () => { store.visit(current.id); render(true); };
  for (const [name, offset] of [['previous', -1], ['next', 1]] as const) element(name).addEventListener('click', () => { current = adjacentProblem(current.id, offset); visit(); });
  element('recommended').addEventListener('click', () => { current = recommendedProblem(store.status) ?? problems[0]!; visit(); });
  element('select').addEventListener('change', () => { current = problems.find(p => p.id === element<HTMLSelectElement>('select').value)!; visit(); });
  window.addEventListener('storage', event => { if (event.key === null || event.key.startsWith(neetcodePrefix)) render(); });
  render();
}
