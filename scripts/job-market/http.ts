export type Fetcher = typeof fetch;

export async function request(url: URL | string, source: string, fetcher: Fetcher = fetch): Promise<Response> {
  // Never expose request URLs or provider bodies: FRED credentials are query parameters.
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await fetcher(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
    } catch {
      if (attempt === 2) throw new Error(`${source}: network request failed`);
      await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
      continue;
    }
    if (response.ok) return response;
    if (attempt === 2 || (response.status !== 429 && response.status < 500)) {
      throw new Error(`${source}: HTTP ${response.status}`);
    }
    await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
  }
  throw new Error(`${source}: request failed`);
}
