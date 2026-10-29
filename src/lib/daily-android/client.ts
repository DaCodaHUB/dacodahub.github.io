import { dailySchedule } from '../../data/daily-android-schedule';
import { assignmentForDate, nextDailyReset, dailyDay } from './schedule';
import { createProgressStore, progressPrefix, flashcardProgressPrefix, reviewProgressPrefix } from './progress';
import { startStudy, nextStudy } from './study';
import { nextReview, type ReviewFilter } from './review-practice';

const root = document.querySelector<HTMLElement>('[data-daily-android]');
if (root) {
  const flashSlot = root.querySelector<HTMLElement>('[data-flashcard-slot]')!;
  const challengeSlot = root.querySelector<HTMLElement>('[data-challenge-slot]')!;
  const notice = root.querySelector<HTMLElement>('[data-storage-status]')!;
  const store = createProgressStore(() => window.localStorage, message => { notice.textContent = message; });
  const flashTemplates = new Map([...root.querySelectorAll<HTMLTemplateElement>('[data-flashcard-template]')].map(template => [template.dataset.flashcardTemplate!, template]));
  const challengeTemplates = new Map([...root.querySelectorAll<HTMLTemplateElement>('[data-challenge-template]')].map(template => [template.dataset.challengeTemplate!, template]));
  const studyIds = [...flashTemplates.keys()];
  const reviewChoices = [...challengeTemplates].map(([id, template]) => ({ id, difficulty: template.content.querySelector<HTMLElement>('[data-challenge]')!.dataset.difficulty! }));
  let practice = store.reviewPractice(reviewChoices);
  let study = store.studySession(studyIds);
  let currentDay = '';
  let timer: ReturnType<typeof setTimeout>;

  function progressLabels() {
    const flash = flashSlot.querySelector<HTMLElement>('[data-flashcard]');
    if (flash) {
      const progress = store.flashcard(flash.dataset.flashcard!);
      flash.querySelector('[data-flashcard-progress]')!.textContent = progress ? `${progress.status === 'known' ? 'Known' : 'Review again'} · Reviewed ${progress.reviewedAt.slice(0, 10)} UTC in ${store.sessionOnly ? 'this page session' : 'this browser'}.` : 'Not reviewed on this device.';
      flash.querySelectorAll<HTMLButtonElement>('[data-review]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.review === progress?.status)));
      const next = flash.querySelector<HTMLButtonElement>('[data-study-next]')!;
      const complete = study?.reviewed && study.position === study.order.length - 1;
      next.textContent = !study ? (progress ? 'Practice more' : 'Start study session') : complete ? 'Practice again' : 'Next flashcard';
      next.disabled = !!study && !study.reviewed;
      flash.querySelector('[data-study-status]')!.textContent = study
        ? complete ? `Session complete · ${study.order.length} cards reviewed. Start another session anytime.`
          : `Study session · ${study.position + 1} of ${study.order.length}${study.reviewed ? ' · Reviewed' : ' · Review this card to continue'}.`
        : 'Today’s recommendation. Study more whenever you like.';
    }
    const challenge = challengeSlot.querySelector<HTMLElement>('[data-challenge]');
    if (challenge) {
      const progress = store.challenge(challenge.dataset.challenge!);
      challenge.querySelector('[data-challenge-progress]')!.textContent = progress?.reviewStatus === 'needs-review' ? `Needs review · Updated ${progress.updatedAt.slice(0, 10)} UTC.` : progress?.completedAt ? `Completed ${progress.completedAt.slice(0, 10)} UTC in ${store.sessionOnly ? 'this page session' : 'this browser'}. Self-reviewed, not automatically graded.` : 'Not completed on this device.';
      const complete = challenge.querySelector<HTMLButtonElement>('[data-complete-challenge]')!;
      complete.textContent = progress?.completedAt && progress.reviewStatus !== 'needs-review' ? 'Mark reviewed again' : 'Mark challenge complete';
      challenge.querySelector('[data-review-challenge]')!.setAttribute('aria-pressed', String(progress?.reviewStatus === 'needs-review'));
      const filter = challenge.querySelector<HTMLSelectElement>('[data-review-difficulty]')!;
      filter.value = practice?.difficulty ?? 'all';
      if (practice) challenge.querySelector('[data-challenge-session]')!.textContent = `Additional practice · ${practice.difficulty === 'all' ? 'All difficulties' : practice.difficulty} · ${practice.seen.length} challenges visited. Practice as often as you like.`;
    }
  }
  function mountFlashcard(flashcardId: string, focus = false) {
    const flash = flashTemplates.get(flashcardId);
    if (!flash) throw new Error('Flashcard is missing');
    flashSlot.replaceChildren(flash.content.cloneNode(true));
    flashSlot.querySelectorAll<HTMLButtonElement>('[data-review]').forEach(button => button.addEventListener('click', () => {
      store.review(flashcardId, button.dataset.review as 'known' | 'review-again');
      if (study) { study = { ...study, reviewed: true }; store.saveStudySession(study); }
      progressLabels();
    }));
    flashSlot.querySelector('[data-study-next]')!.addEventListener('click', () => {
      study = study ? nextStudy(study) : startStudy(studyIds, flashcardId);
      store.saveStudySession(study);
      mountFlashcard(study.order[study.position]!, true);
    });
    progressLabels();
    if (focus) {
      const title = flashSlot.querySelector<HTMLElement>('h2')!;
      title.tabIndex = -1; title.focus({ preventScroll: true });
    }
  }
  function mount(flashcardId: string, challengeId: string) {
    mountFlashcard(study ? study.order[study.position]! : flashcardId);
    mountChallenge(practice?.currentId ?? challengeId);
  }
  function mountChallenge(challengeId: string, focus = false) {
    const challenge = challengeTemplates.get(challengeId);
    if (!challenge) throw new Error('Scheduled content is missing');
    challengeSlot.replaceChildren(challenge.content.cloneNode(true));
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
    challengeSlot.querySelector('[data-review-challenge]')!.addEventListener('click', () => { store.needsReview(challengeId); progressLabels(); });
    const next = () => {
      const difficulty = challengeSlot.querySelector<HTMLSelectElement>('[data-review-difficulty]')!.value as ReviewFilter;
      practice = nextReview(reviewChoices, practice, difficulty, challengeId);
      store.saveReviewPractice(practice);
      mountChallenge(practice.currentId, true);
    };
    challengeSlot.querySelector('[data-next-challenge]')!.addEventListener('click', next);
    challengeSlot.querySelector('[data-review-difficulty]')!.addEventListener('change', next);
    progressLabels();
    if (focus) { const title = challengeSlot.querySelector<HTMLElement>('h2')!; title.tabIndex = -1; title.focus({ preventScroll: true }); }
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
        root!.querySelector('[data-next-day]')!.textContent = `Next daily recommendation: ${new Date(nextDailyReset(now)).toISOString().slice(0, 10)} at 1:00 a.m. Pacific`;
        root!.querySelector('[data-day-announcement]')!.textContent = changed ? study
          ? 'A new Pacific practice day has started. Today’s engineering challenge is ready; your flashcard session continues.'
          : 'A new Pacific practice day has started. Today’s recommended flashcard and engineering challenge are ready.' : '';
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
  window.addEventListener('storage', event => { if (event.key?.startsWith(progressPrefix) || event.key?.startsWith(flashcardProgressPrefix) || event.key?.startsWith(reviewProgressPrefix) || event.key === null) progressLabels(); });
  refreshDay();
}
