import type { DemandData, SourceMetadata, Technologies, Outlook } from './types.ts';
import { occupations, mappingUrl, demandUrl, blsDownloadUrl, blsTableUrl } from './sources.ts';
import { parseOnetPage, parseTechnologies, parseBlsWorkbook, sha256 } from './parse.ts';

export type Fetcher = typeof fetch;
export async function download(url: string, fetcher: Fetcher = fetch): Promise<Response> {
  // A small, sequential annual-data refresh. Respect 403/429 rather than bypassing access restrictions.
  const response = await fetcher(url, { signal: AbortSignal.timeout(30_000), redirect: 'error', headers: { 'User-Agent': 'DacodaHub-Engineering-Demand/1.0 (+https://dacodahub.github.io/market/)' } });
  if (!response.ok) throw new Error(`Official source returned HTTP ${response.status}`);
  const length = Number(response.headers.get('content-length'));
  if (length > 20_000_000) throw new Error('Source exceeds download size limit');
  return response;
}
export async function fetchOnet(at: string, fetcher: Fetcher = fetch): Promise<Record<string, Technologies>> {
  const result: Record<string, Technologies> = {};
  for (const occupation of occupations) {
    const url = demandUrl(occupation.onetSoc);
    const html = await (await download(url, fetcher)).text();
    const source = parseOnetPage(html, occupation, url, at);
    const csv = await (await download(source.downloadUrl, fetcher)).text();
    source.sha256 = sha256(csv);
    result[occupation.id] = parseTechnologies(csv, source);
  }
  if (new Set(Object.values(result).map(row => row.source!.period.start)).size !== 1) throw new Error('O*NET tables have mixed posting years');
  return result;
}
export async function fetchBls(at: string, fetcher: Fetcher = fetch): Promise<Record<string, Outlook>> {
  const buffer = Buffer.from(await (await download(blsDownloadUrl, fetcher)).arrayBuffer());
  if (buffer.length > 20_000_000 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) throw new Error('BLS response is not an XLSX workbook');
  return parseBlsWorkbook(buffer, occupations, at);
}

const validDate = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
function validateSource(source: SourceMetadata, provider: 'onet' | 'bls', now: number) {
  if (!source || !validDate(source.retrievedAt) || Date.parse(source.retrievedAt) > now + 60_000 || !/^[a-f0-9]{64}$/.test(source.sha256)) throw new Error('Invalid source provenance');
  if (!source.period || !/^20\d{2}-01-01$/.test(source.period.start) || !/^20\d{2}-12-31$/.test(source.period.end)) throw new Error('Invalid source period');
  if (Date.parse(source.period.start) > now || Date.parse(source.period.end) < Date.parse(source.period.start)) throw new Error('Invalid source period ordering');
  if (source.publicationDate !== null && (!validDate(source.publicationDate) || Date.parse(source.publicationDate) > now)) throw new Error('Invalid publication date');
  for (const url of [source.url, source.downloadUrl, source.licenseUrl]) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.hostname !== (provider === 'onet' ? 'www.onetonline.org' : 'www.bls.gov')) throw new Error('Invalid source URL');
  }
  if (!source.attribution || !['csv', 'xlsx', 'official-table-extract'].includes(source.retrievalMethod)) throw new Error('Missing source attribution or method');
  if (provider === 'onet' && (source.period.start.slice(0, 4) !== source.period.end.slice(0, 4) || Date.parse(source.period.end) > now || source.retrievalMethod !== 'csv')) throw new Error('Invalid posting period or method');
  if (provider === 'bls' && Number(source.period.end.slice(0, 4)) - Number(source.period.start.slice(0, 4)) !== 10) throw new Error('Invalid projection period');
  if (provider === 'bls' && !['xlsx', 'official-table-extract'].includes(source.retrievalMethod)) throw new Error('Invalid projection retrieval method');
}

export function validateDemand(input: unknown, now = new Date()): asserts input is DemandData {
  const data = input as DemandData;
  if (!data || data.schemaVersion !== '1.0' || data.methodologyVersion !== 'engineering-demand-1' || !validDate(data.generatedAt) || Date.parse(data.generatedAt) > +now + 60_000 || !Array.isArray(data.occupations) || data.occupations.length !== occupations.length) throw new Error('Invalid demand document');
  if (!data.refresh || !validDate(data.refresh.attemptedAt) || !['updated', 'retained', 'unavailable'].includes(data.refresh.onet) || !['updated', 'retained', 'unavailable'].includes(data.refresh.bls) || !Array.isArray(data.refresh.messages) || data.refresh.messages.some(v => typeof v !== 'string')) throw new Error('Invalid refresh metadata');
  if (data.methodology?.mappingUrl !== mappingUrl || !data.methodology.technologyDefinition || !data.methodology.outlookDefinition || !Array.isArray(data.methodology.transformations) || !Array.isArray(data.methodology.limitations)) throw new Error('Invalid methodology');
  const ids = new Set<string>();
  for (const occupation of data.occupations) {
    const mapping = occupations.find(item => item.id === occupation.id);
    if (!mapping || ids.has(occupation.id) || Object.entries(mapping).some(([key, value]) => occupation[key as keyof typeof mapping] !== value)) throw new Error('Invalid occupation mapping');
    ids.add(occupation.id);
    const tech = occupation.technologies, outlook = occupation.outlook;
    if (!tech || !outlook || !Array.isArray(tech.values)) throw new Error('Missing source section');
    for (const section of [tech, outlook]) {
      if (!['available', 'unavailable'].includes(section.status) || (section.status === 'unavailable' && !section.reason)) throw new Error('Invalid availability state');
      if (section.status === 'available' && !section.source) throw new Error('Available data needs provenance');
    }
    if (tech.source) {
      validateSource(tech.source, 'onet', +now);
      if (tech.source.url !== demandUrl(mapping.onetSoc) || !tech.source.downloadUrl.startsWith(`${demandUrl(mapping.onetSoc)}/`)) throw new Error('Wrong O*NET occupation source');
    }
    const names = new Set<string>();
    let previous = Infinity;
    for (const skill of tech.values) {
      if (typeof skill.name !== 'string' || !skill.name.trim() || !Number.isFinite(skill.mentionPercent) || skill.mentionPercent < 5 || skill.mentionPercent > 100 || skill.mentionPercent > previous || names.has(skill.name.toLowerCase())) throw new Error('Invalid or duplicate skill');
      names.add(skill.name.toLowerCase()); previous = skill.mentionPercent;
    }
    if ((tech.status === 'available') !== (tech.values.length > 0)) throw new Error('Skill availability mismatch');
    if (outlook.source) {
      validateSource(outlook.source, 'bls', +now);
      if (outlook.source.url !== blsTableUrl || outlook.source.downloadUrl !== blsDownloadUrl) throw new Error('Wrong BLS source');
    }
    if (outlook.employmentGrowthPercent !== null && (!Number.isFinite(outlook.employmentGrowthPercent) || outlook.employmentGrowthPercent < -100)) throw new Error('Invalid growth');
    if (outlook.averageAnnualOpenings !== null && (!Number.isSafeInteger(outlook.averageAnnualOpenings) || outlook.averageAnnualOpenings < 0)) throw new Error('Invalid openings');
    if ((outlook.status === 'available') !== (outlook.employmentGrowthPercent !== null || outlook.averageAnnualOpenings !== null)) throw new Error('Outlook availability mismatch');
  }
  for (const key of ['technologies', 'outlook'] as const) {
    const periods = data.occupations.map(o => o[key].source).filter(s => s !== null).map(s => `${s.period.start}/${s.period.end}`);
    if (new Set(periods).size > 1) throw new Error('Mixed periods within a comparison source');
  }
}

export async function refreshDemand(previous: DemandData | null, at: string, providers = { onet: fetchOnet, bls: fetchBls }): Promise<DemandData> {
  if (previous) validateDemand(previous, new Date(at));
  const data: DemandData = {
    schemaVersion: '1.0', methodologyVersion: 'engineering-demand-1', generatedAt: at,
    refresh: { attemptedAt: at, onet: 'unavailable', bls: 'unavailable', messages: [] },
    methodology: {
      mappingUrl,
      technologyDefinition: 'Share of unique U.S. Lightcast postings linked to the selected O*NET-SOC occupation that mention each skill. In Demand means at least 5%.',
      outlookDefinition: 'BLS ten-year employment change and annual average occupational openings from net employment change and occupational separations; not current vacancies.',
      transformations: ['Trim whitespace; preserve source technology names.', 'Sort published percentages descending; preserve source order for ties; display first ten.', 'Multiply BLS openings in thousands by 1,000; retain published growth percentages.', 'Keep posting periods and projection periods separate. Never calculate a combined score.'],
      limitations: ['Online postings are platform coverage, not all jobs, hires, or total openings. One posting may mention several technologies, so percentages do not sum to 100.', 'Mention frequency measures neither skill growth nor proficiency. Published rounded percentages can tie; the top ten may cut through a tie.', 'BLS projections are long-term scenarios, not forecasts of current hiring. Openings include occupational exits and transfers, not every job change within an occupation.', 'BLS Data Scientists includes related O*NET specializations. Do not multiply its openings by the selected O*NET technology percentages.', 'Separate source periods describe separate measures; no occupation-specific Market Health score is inferred.', 'O*NET exports are public; underlying Lightcast raw data is not redistributed or claimed to be public domain. Source reuse terms and external-source exceptions still apply.'],
    },
    occupations: occupations.map(mapping => ({ ...mapping, technologies: { status: 'unavailable', reason: 'No validated posting data.', source: null, values: [] }, outlook: { status: 'unavailable', reason: 'No validated projections.', source: null, employmentGrowthPercent: null, averageAnnualOpenings: null } })),
  };
  for (const provider of ['onet', 'bls'] as const) {
    const key = provider === 'onet' ? 'technologies' : 'outlook';
    // Whole-provider transaction: never replace five comparable occupations with a partial fetch.
    const candidate = structuredClone(data);
    try {
      const records = await providers[provider](at);
      for (const occupation of candidate.occupations) {
        if (!records[occupation.id]) throw new Error('Incomplete source response');
        if (provider === 'onet') occupation.technologies = records[occupation.id] as Technologies;
        else occupation.outlook = records[occupation.id] as Outlook;
        const old = previous?.occupations.find(o => o.id === occupation.id)?.[key].source;
        const next = occupation[key].source;
        if (old && next && next.period.start < old.period.start) throw new Error('Source period regressed');
      }
      validateDemand(candidate, new Date(at));
      data.occupations = candidate.occupations;
      data.refresh[provider] = 'updated';
    } catch (error) {
      if (previous) {
        for (const occupation of data.occupations) {
          const old = previous.occupations.find(o => o.id === occupation.id)!;
          if (provider === 'onet') occupation.technologies = structuredClone(old.technologies);
          else occupation.outlook = structuredClone(old.outlook);
        }
      }
      data.refresh[provider] = data.occupations.some(o => o[key].source) ? 'retained' : 'unavailable';
      data.refresh.messages.push(`${provider === 'onet' ? 'O*NET' : 'BLS'} update failed; ${data.refresh[provider]} data. ${error instanceof Error ? error.message : 'Unknown retrieval error'}`);
    }
  }
  if (previous) {
    const snapshot = data.refresh.onet === 'updated' || data.refresh.bls === 'updated'
      ? { occupations: previous.occupations } : previous.previous;
    if (snapshot) data.previous = structuredClone(snapshot);
  }
  validateDemand(data, new Date(at));
  return data;
}

export async function restorePublished(previous: DemandData | null, fetcher: Fetcher = fetch): Promise<DemandData | null> {
  if (previous) validateDemand(previous);
  const response = await fetcher('https://dacodahub.github.io/data/engineering-demand/demand.json', { signal: AbortSignal.timeout(30_000), redirect: 'error' });
  if (response.status === 404) return previous; // First deployment: checked-in snapshot is the bootstrap.
  if (!response.ok) throw new Error(`Published explorer snapshot unavailable (HTTP ${response.status}); deployment blocked to prevent rolling back published data.`);
  const published: unknown = await response.json();
  validateDemand(published);
  if (!previous) return published;
  const restored = structuredClone(published.generatedAt > previous.generatedAt ? published : previous);
  // Each independent provider keeps its newest period, then newest successful retrieval.
  // A recent failed attempt is never evidence that its retained observations are newer.
  for (const provider of ['onet', 'bls'] as const) {
    const key = provider === 'onet' ? 'technologies' : 'outlook';
    const rank = (data: DemandData) => {
      const source = data.occupations.find(o => o[key].source)?.[key].source;
      return source ? `${source.period.start}/${source.retrievedAt}` : '';
    };
    const selected = rank(published) > rank(previous) ? published : previous;
    for (const occupation of restored.occupations) {
      const selectedOccupation = selected.occupations.find(o => o.id === occupation.id)!;
      if (provider === 'onet') occupation.technologies = structuredClone(selectedOccupation.technologies);
      else occupation.outlook = structuredClone(selectedOccupation.outlook);
    }
    restored.refresh[provider] = selected.refresh[provider];
  }
  validateDemand(restored);
  return restored;
}
