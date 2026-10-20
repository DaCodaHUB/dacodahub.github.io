import { dailySchedule } from '../../data/daily-android-schedule';
import { assignmentForDate, nextDailyReset, dailyDay } from './schedule';
import { createProgressStore, progressPrefix } from './progress';

const root = document.querySelector<HTMLElement>('[data-daily-android]');
if (root) {
  const flashSlot = root.querySelector<HTMLElement>('[data-flashcard-slot]')!;
  const challengeSlot = root.querySelector<HTMLElement>('[data-challenge-slot]')!;
  const notice = root.querySelector<HTMLElement>('[data-storage-status]')!;
  const store = createProgressStore(() => window.localStorage, message => { notice.textContent = message; });
  const flashTemplates = new Map([...root.querySelectorAll<HTMLTemplateElement>('[data-flashcard-template]')].map(template => [template.dataset.flashcardTemplate!, template]));
  const challengeTemplates = new Map([...root.querySelectorAll<HTMLTemplateElement>('[data-challenge-template]')].map(template => [template.dataset.challengeTemplate!, template]));
  let currentDay = '';
  let timer: ReturnType<typeof setTimeout>;

  function progressLabels() {
    const flash = flashSlot.querySelector<HTMLElement>('[data-flashcard]');
    if (flash) {
      const progress = store.flashcard(flash.dataset.flashcard!);
      flash.querySelector('[data-flashcard-progress]')!.textContent = progress ? `${progress.status === 'known' ? 'Known' : 'Review again'} · Reviewed ${progress.reviewedAt.slice(0, 10)} UTC in ${store.sessionOnly ? 'this page session' : 'this browser'}.` : 'Not reviewed on this device.';
      flash.querySelectorAll<HTMLButtonElement>('[data-review]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.review === progress?.status)));
    }
    const challenge = challengeSlot.querySelector<HTMLElement>('[data-challenge]');
    if (challenge) {
      const progress = store.challenge(challenge.dataset.challenge!);
      challenge.querySelector('[data-challenge-progress]')!.textContent = progress?.completedAt ? `Completed ${progress.completedAt.slice(0, 10)} UTC in ${store.sessionOnly ? 'this page session' : 'this browser'}. Self-reviewed, not automatically graded.` : 'Not completed on this device.';
      const complete = challenge.querySelector<HTMLButtonElement>('[data-complete-challenge]')!;
      complete.textContent = progress?.completedAt ? 'Mark reviewed again' : 'Mark challenge complete';
    }
  }
  function mount(flashcardId: string, challengeId: string) {
    const flash = flashTemplates.get(flashcardId), challenge = challengeTemplates.get(challengeId);
    if (!flash || !challenge) throw new Error('Scheduled content is missing');
    flashSlot.replaceChildren(flash.content.cloneNode(true));
    challengeSlot.replaceChildren(challenge.content.cloneNode(true));
    flashSlot.querySelectorAll<HTMLButtonElement>('[data-review]').forEach(button => button.addEventListener('click', () => {
      store.review(flashcardId, button.dataset.review as 'known' | 'review-again'); progressLabels();
    }));
    const response = challengeSlot.querySelector<HTMLTextAreaElement>('[data-response]')!;
    const saveChoice = challengeSlot.querySelector<HTMLInputElement>('[data-save-response]')!;
    const responseStatus = challengeSlot.querySelector<HTMLElement>('[data-response-status]')!;
    const saved = store.challenge(challengeId);
    const savingStatus = () => store.sessionOnly ? 'Storage is unavailable. This response stays only for this page session.' : 'Response saving is enabled on this device.';
    response.value = saved?.response ?? '';
    saveChoice.checked = saved?.response !== undefined;
    if (saveChoice.checked) responseStatus.textContent = savingStatus();
    response.addEventListener('input', () => {
      if (saveChoice.checked) { store.saveResponse(challengeId, response.value); responseStatus.textContent = savingStatus(); }
    });
    saveChoice.addEventListener('change', () => {
      store.saveResponse(challengeId, saveChoice.checked ? response.value : undefined);
      responseStatus.textContent = saveChoice.checked ? savingStatus() : 'Saved response removed. Current text stays only on this page.';
    });
    challengeSlot.querySelector('[data-complete-challenge]')!.addEventListener('click', () => { store.complete(challengeId); progressLabels(); });
    progressLabels();
  }
  function refreshDay() {
    clearTimeout(timer);
    const now = new Date();
    try {
      const day = dailyDay(now);
      if (day !== currentDay) {
        const changed = !!currentDay;
        const assignment = assignmentForDate(day, dailySchedule);
        const pair = root!.querySelector<HTMLElement>('[data-daily-pair]')!;
        const hadDailyFocus = pair.contains(document.activeElement);
        const unavailable = root!.querySelector<HTMLElement>('[data-daily-unavailable]')!;
        if (!assignment) {
          pair.hidden = true;
          flashSlot.replaceChildren(); challengeSlot.replaceChildren();
          unavailable.hidden = false;
          unavailable.textContent = 'Daily practice begins on 2026-10-19 at 1:00 a.m. Pacific. Check your device clock if this seems unexpected.';
        } else {
          mount(assignment.flashcardId, assignment.challengeId);
          pair.hidden = false; unavailable.hidden = true;
        }
        const time = root!.querySelector<HTMLTimeElement>('[data-daily-date]')!;
        time.dateTime = day; time.textContent = `${day} · Pacific`;
        if (changed && hadDailyFocus) { time.tabIndex = -1; time.focus({ preventScroll: true }); }
        root!.querySelector('[data-next-day]')!.textContent = `Next pair: ${new Date(nextDailyReset(now)).toISOString().slice(0, 10)} at 1:00 a.m. Pacific`;
        root!.querySelector('[data-day-announcement]')!.textContent = changed ? 'A new Pacific practice day has started. Today’s flashcard and engineering challenge are ready.' : '';
        currentDay = day;
      }
    } catch {
      root!.querySelector<HTMLElement>('[data-daily-pair]')!.hidden = true;
      const unavailable = root!.querySelector<HTMLElement>('[data-daily-unavailable]')!;
      unavailable.hidden = false; unavailable.textContent = 'Today’s pair could not be selected. Check your device clock and reload the page.';
    }
    // Also check at least once a minute: timers can be suspended in background tabs or clocks adjusted.
    timer = setTimeout(refreshDay, Math.min(60_000, Math.max(100, nextDailyReset(new Date()) - Date.now() + 25)));
  }
  window.addEventListener('focus', refreshDay);
  window.addEventListener('pageshow', refreshDay);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDay(); });
  window.addEventListener('storage', event => { if (event.key?.startsWith(progressPrefix) || event.key === null) progressLabels(); });
  refreshDay();
}
