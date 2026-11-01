export const habitIds = ['water', 'sleep', 'activity', 'skincare', 'learning'];
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function readDay(storage, day) {
  const value = JSON.parse(storage.getItem(`healthy-habits:${day}`) || '[]');
  return Array.isArray(value) ? [...new Set(value.filter(id => habitIds.includes(id)))] : [];
}
export function writeDay(storage, day, completed) {
  storage.setItem(`healthy-habits:${day}`, JSON.stringify(completed));
}
