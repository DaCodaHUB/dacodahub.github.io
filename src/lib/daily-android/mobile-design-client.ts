import { designChallenges } from '../../data/mobile-system-design/challenges';
import { adjacentDesign, createDesignStore, mobileDesignPrefix, recommendedDesign } from './mobile-design';

const root = document.querySelector<HTMLElement>('[data-mobile-design]');
if (root) {
  const slot = root.querySelector<HTMLElement>('[data-md-slot]')!;
  const store = createDesignStore(() => localStorage, message => { root.querySelector('[data-md-storage]')!.textContent = message; });
  const templates = new Map([...root.querySelectorAll<HTMLTemplateElement>('[data-md-template]')].map(t => [t.dataset.mdTemplate!, t]));
  let current = store.current() ?? recommendedDesign(store.progress) ?? designChallenges[0]!;
  const element = <T extends HTMLElement = HTMLElement>(name: string) => slot.querySelector<T>(`[data-md-${name}]`)!;
  function labels() {
    const progress = store.progress(current.id);
    element('status').textContent = progress?.status === 'completed' ? 'Completed · Self-reviewed' : progress?.status === 'needs-review' ? 'Needs Review' : 'Not completed';
    element('complete').setAttribute('aria-pressed', String(progress?.status === 'completed'));
    element('review').setAttribute('aria-pressed', String(progress?.status === 'needs-review'));
    element('progress').textContent = `${designChallenges.filter(c => store.progress(c.id)?.status === 'completed').length} / ${designChallenges.length} completed`;
    const next = recommendedDesign(store.progress);
    element('recommendation').textContent = next ? `Recommended: ${next.title}` : 'All designs completed. Revisit any for unlimited practice.';
    element('position').textContent = `Learning progression · ${designChallenges.indexOf(current) + 1} of ${designChallenges.length}`;
    element<HTMLButtonElement>('previous').disabled = current === designChallenges[0];
    element<HTMLButtonElement>('next').disabled = current === designChallenges.at(-1);
    const select = element<HTMLSelectElement>('select'); select.value = current.id;
    for (const option of select.options) {
      const challenge = designChallenges.find(c => c.id === option.value)!;
      const state = store.progress(challenge.id)?.status;
      option.textContent = `${challenge.title} · ${state === 'completed' ? 'Completed' : state === 'needs-review' ? 'Needs Review' : 'Not completed'}`;
    }
  }
  function mount(focus = false) {
    slot.replaceChildren(templates.get(current.id)!.content.cloneNode(true));
    const notes = element<HTMLTextAreaElement>('notes'); notes.value = store.progress(current.id)?.notes ?? '';
    notes.addEventListener('input', () => {
      store.saveNotes(current.id, notes.value);
      element('save-status').textContent = store.sessionOnly ? 'Notes kept only for this page session.' : 'Notes saved in this browser.';
    });
    const reveal = element<HTMLButtonElement>('reveal');
    function show(visible: boolean) {
      element('reference').hidden = !visible; reveal.setAttribute('aria-expanded', String(visible));
      reveal.textContent = visible ? 'Hide Reference Design' : 'Reveal Reference Design';
    }
    reveal.addEventListener('click', () => show(element('reference').hidden));
    element('hide').addEventListener('click', () => { show(false); reveal.focus({ preventScroll: true }); });
    element('complete').addEventListener('click', () => { store.setStatus(current.id, 'completed'); labels(); });
    element('review').addEventListener('click', () => { store.setStatus(current.id, 'needs-review'); labels(); });
    const visit = (id: string) => { current = designChallenges.find(c => c.id === id)!; store.visit(id); mount(true); };
    for (const [name, offset] of [['previous', -1], ['next', 1]] as const) element(name).addEventListener('click', () => visit(adjacentDesign(current.id, offset).id));
    element('recommended').addEventListener('click', () => visit((recommendedDesign(store.progress) ?? designChallenges[0]!).id));
    element('select').addEventListener('change', () => visit(element<HTMLSelectElement>('select').value));
    labels();
    if (focus) slot.querySelector<HTMLElement>('h2')!.focus({ preventScroll: true });
  }
  window.addEventListener('storage', event => { if (event.key === null || event.key.startsWith(mobileDesignPrefix)) {
    // Status changes in another tab must not discard an actively edited draft.
    labels();
    if (document.activeElement !== element('notes')) element<HTMLTextAreaElement>('notes').value = store.progress(current.id)?.notes ?? '';
  } });
  mount();
}
