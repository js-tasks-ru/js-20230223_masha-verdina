/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  if (arr === undefined) {return [];}
  
  const res = [];
  const auxSet = new Set();
  for (const val of arr) {
    if (!auxSet.has(val)) {
      auxSet.add(val);
      res.push(val);
    }
  }
  return res;
}
