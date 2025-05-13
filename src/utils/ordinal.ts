export function getOrdinal(n: number): string {
  if (n < 0) return '';

  const j = n % 10,
    k = n % 100;
  return j === 1 && k !== 11
    ? 'st'
    : j === 2 && k !== 12
      ? 'nd'
      : j === 3 && k !== 13
        ? 'rd'
        : 'th';
}

export function formatOrdinal(n: number): string {
  if (n < 0) return `${n}`;

  const suffix = getOrdinal(n);
  return `${n}${suffix}`;
}
