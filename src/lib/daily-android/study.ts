export interface StudySession { version: 1; order: string[]; position: number; reviewed: boolean }

/** Session order is separate from lifetime review progress and has no daily cap. */
export function startStudy(ids: readonly string[], after?: string): StudySession {
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('Study requires a unique, nonempty collection');
  const split = after ? ids.indexOf(after) + 1 : 0;
  return { version: 1, order: [...ids.slice(split), ...ids.slice(0, split)], position: 0, reviewed: false };
}
export function parseStudySession(raw: unknown, ids: readonly string[]): StudySession | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const value = raw as StudySession;
  if (value.version !== 1 || !Array.isArray(value.order) || value.order.length !== ids.length || new Set(value.order).size !== ids.length || !value.order.every(id => ids.includes(id)) || !Number.isInteger(value.position) || value.position < 0 || value.position >= ids.length || typeof value.reviewed !== 'boolean') return undefined;
  return { version: 1, order: [...value.order], position: value.position, reviewed: value.reviewed };
}
export function nextStudy(session: StudySession): StudySession {
  if (!session.reviewed) return session;
  return session.position === session.order.length - 1
    ? startStudy(session.order, session.order[session.position])
    : { ...session, position: session.position + 1, reviewed: false };
}
