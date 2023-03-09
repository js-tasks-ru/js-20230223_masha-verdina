/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const p = path.split('.');

  return (obj) => {
    let res = obj;
    for (const level of p) {
      if (res.hasOwnProperty(level)) {
        res = res[level];
      } else {
        return;
      }
    }
    return res;
  };
}
