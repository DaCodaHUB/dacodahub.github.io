// Switching panels preserves each mounted exercise, draft and independent store.
const panels: Record<string, string> = { review: '[data-code-review-panel]', neetcode: '[data-neetcode-panel]', design: '[data-mobile-design-panel]' };
document.querySelectorAll<HTMLButtonElement>('[data-challenge-type]').forEach(button => button.addEventListener('click', () => {
  for (const [type, selector] of Object.entries(panels)) {
    const panel = document.querySelector<HTMLElement>(selector);
    if (panel) panel.hidden = type !== button.dataset.challengeType;
  }
  document.querySelectorAll('[data-challenge-type]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
}));
