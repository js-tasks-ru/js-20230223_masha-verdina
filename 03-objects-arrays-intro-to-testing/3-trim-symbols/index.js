/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {return string;}
  let res = '';
  for (let i = 0; i < string.length; i++) {
    const repeatCount = countStartRepeats(string.slice(i));
    if (repeatCount <= size) {
      res += string.slice(i, i + repeatCount);
    } else {
      res += string.slice(i, i + size);
    }
    i += repeatCount - 1;
  }
  return res;
}

function countStartRepeats(string) {
  if (string === undefined || string === '') {return 0;}
  const c = string.at(0);
  let count = 0;
  while (c === string.at(count)) {count++;}
  return count;
}
