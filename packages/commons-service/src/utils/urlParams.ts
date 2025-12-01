export const buildCombinedSearchParams = () => {
  if (typeof window === 'undefined') return new URLSearchParams();
  const combined = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  if (hash.includes('?')) {
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    hashParams.forEach((value, key) => {
      if (!combined.has(key)) combined.set(key, value);
    });
  }
  return combined;
};

export const readParamValue = (params: URLSearchParams, ...names: string[]): string | undefined => {
  for (const name of names) {
    if (!name) continue;
    const value = params.get(name);
    if (value !== null) {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
};

export const normalizeRouteSegment = (input?: string) => {
  if (!input) return '';
  return input.replace(/^#/, '').replace(/\/+$/, '');
};
