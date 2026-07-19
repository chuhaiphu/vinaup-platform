export function generateUniqueCode() {
  const now = new Date();
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(now.getUTCFullYear()).slice(-2);
  const HH = String(now.getUTCHours()).padStart(2, '0');
  const MM = String(now.getUTCMinutes()).padStart(2, '0');
  const SS = String(now.getUTCSeconds()).padStart(2, '0');
  const mmm = String(now.getUTCMilliseconds()).padStart(3, '0');
  return `${dd}${mm}${yy}${HH}${MM}${SS}${mmm}`;
}
