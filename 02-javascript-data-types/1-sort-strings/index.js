/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const res = [...arr];
  return res.sort(
    (a, b) => {
      const order = param === 'desc' ? -1 : 1;
      return order * a.localeCompare(b, ['ru', 'en'], { usage: 'sort', caseFirst: 'upper' });
    }
  );
}
