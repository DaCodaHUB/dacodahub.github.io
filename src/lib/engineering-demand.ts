import type { DemandData, SourceMetadata } from '../../scripts/engineering-demand/types.ts';

export function topTechnologies(data: DemandData, id: string) {
  return data.occupations.find(o => o.id === id)?.technologies.values.slice(0, 10) ?? [];
}

// Display policy only: leave the saved snapshots and delta calculations intact.
export function technologyChanges(data: DemandData, id: string): Map<string, number> {
  const current = data.occupations.find(o => o.id === id);
  const previous = data.previous?.occupations.find(o => o.id === id);
  const now = current?.technologies, before = previous?.technologies;
  if (!current || !previous || current.onetSoc !== previous.onetSoc ||
      now?.status !== 'available' || before?.status !== 'available' ||
      !now.source || !before.source || now.source.url !== before.source.url ||
      now.source.period.start !== before.source.period.start ||
      now.source.period.end !== before.source.period.end) return new Map();

  return new Map(topTechnologies(data, id).map(skill => {
    const baseline = before.values.find(value => value.name === skill.name)?.mentionPercent;
    return { name: skill.name, baseline, difference: Math.abs(skill.mentionPercent - (baseline ?? NaN)) };
  }).filter((skill): skill is { name: string; baseline: number; difference: number } =>
    Number.isFinite(skill.baseline) && Number.isFinite(skill.difference) && skill.difference >= 1)
    .sort((a, b) => b.difference - a.difference || a.name.localeCompare(b.name))
    .slice(0, 3).map(skill => [skill.name, skill.baseline]));
}
export function sourceStatus(source: SourceMetadata | null, kind: 'onet' | 'bls', now = new Date()): string {
  if (!source) return 'Unavailable';
  const age = (+now - Date.parse(source.retrievedAt)) / 86_400_000;
  if (!Number.isFinite(age) || age < 0) return 'Invalid retrieval date';
  const old = kind === 'onet' ? (+now - Date.parse(source.period.end)) / 86_400_000 > 550 : now.getUTCFullYear() - Number(source.period.start.slice(0, 4)) > 2;
  if (old) return 'Older source period — check for a newer release';
  if (age > 35) return 'Update check overdue — showing the dated source';
  return 'Recently retrieved — source period shown below';
}
export const periodLabel = (source: SourceMetadata | null) => source ? `${source.period.start.slice(0, 4)}–${source.period.end.slice(0, 4)}` : 'Unavailable';
export const percentLabel = (value: number | null) => value === null ? 'Unavailable' : `${value > 0 ? '+' : ''}${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
export const openingsLabel = (value: number | null) => value === null ? 'Unavailable' : value.toLocaleString('en-US');

export function selectOccupation(root: HTMLElement, id: string): boolean {
  const panels = [...root.querySelectorAll<HTMLElement>('[data-demand-occupation]')];
  if (!panels.some(panel => panel.dataset.demandOccupation === id)) return false;
  for (const panel of panels) panel.hidden = panel.dataset.demandOccupation !== id;
  for (const row of root.querySelectorAll<HTMLElement>('[data-demand-comparison]')) row.dataset.selected = String(row.dataset.demandComparison === id);
  const status = root.querySelector('[data-demand-selection-status]');
  const selected = panels.find(panel => !panel.hidden);
  if (status) status.textContent = `${selected?.dataset.occupationName}: technology mentions and career outlook shown.`;
  return true;
}
