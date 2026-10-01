export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "Dr. Aisha Rahman" -> "AR" for the avatar bubble. */
export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
