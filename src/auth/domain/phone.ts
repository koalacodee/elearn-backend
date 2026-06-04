const EG_E164 = /^\+201[0125][0-9]{8}$/;

export function normalizeEgyptianPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const trimmed = raw.replace(/[\s-]/g, '');
  if (!trimmed) return null;

  let candidate = trimmed;
  if (candidate.startsWith('00')) candidate = '+' + candidate.slice(2);
  if (candidate.startsWith('0')) candidate = '+20' + candidate.slice(1);
  if (!candidate.startsWith('+')) candidate = '+' + candidate;

  return EG_E164.test(candidate) ? candidate : null;
}

export function isEgyptianPhone(raw: unknown): boolean {
  return normalizeEgyptianPhone(raw) !== null;
}
