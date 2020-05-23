/**
 * Uses the Durstenfeld shuffle algorithm,
 * a modern optimized version of the Fisher-Yates
 * (aka Knuth) shuffle.
 *
 * http://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm
 *
 * @param  {Array} Array to shuffle
 * @return {Array} Shuffled array
 */
export const shuffle = (array) => {
  const arr = array.slice(0)
  const len = arr.length
  for (let i = len - 1; i >= 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }

  return arr
}

export const createRange = (len, zeroBased = true) =>
  new Array(len).fill().map((_, i) => zeroBased ? i : i + 1)

/**
 * @param  {Array} Array to pick from
 * @return {Any}   Randomly picked array item
 */
export const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)]

/**
 * @param array {Array}  Array to sum up
 * @param key   {Array}  Key to sum (if array contains objects)
 * @return {Number} Sum of array items
 */
export const sum = (array, key) =>
  array.reduce((acc, item) => acc + (key ? item[key] : item), 0)

/**
 * @param  {Array}
 * @return {Number}
 */
export const average = (array, key) => {
  const arraySum = sum(array, key)
  return arraySum ? (arraySum / array.length) : 0
}

/**
 * Sort an array of objects by the key provided
 *
 * Prefix the key with a "-" to sort in a descending order
 */
export const dynamicSort = (property) => {
  let sortOrder = 1

  if (property[0] === '-') {
    sortOrder = -1
    property = property.substr(1)
  }

  return function (a, b) {
    if (sortOrder === -1) return b[property].localeCompare(a[property])
    else return a[property].localeCompare(b[property])
  }
}

/**
 * Returns all elements that don't occurr in the other array
 */
export const findDiff = (a, b) => [
  ...a.filter(x => !b.includes(x)),
  ...b.filter(x => !a.includes(x))
]

/**
 * Returns true if the given string starts with [any] of the array's members
 */
export const startsWithAny = (arr, str) => arr.some(item => (str || '').startsWith(item))

/**
 * Returns true if the given string does [not] start with any of the array's members
 */
export const doesNotStartWithAny = (arr, str) => arr.every(item => !(str || '').startsWith(item))

/**
 * A queue structure (FIFO), which shifts the bottom element if length is reached
 */
export const queue = (arr, item, len) => {
  if (arr.length >= len) arr.shift()
  arr.push(item)
}

/**
 * @param  {Array|Object}
 * @return {Array|Object}
 */
export const deepCopy = (obj) => {
  if (!obj) return obj

  let v
  let clone = Array.isArray(obj) ? [] : {}

  for (const k in obj) {
    v = obj[k]
    clone[k] = (typeof v === 'object') ? deepCopy(v) : v
  }

  return clone
}

/**
 * @param  {Array}
 * @return {Array}
 *
 * Return only unique members of an array
 * Note! Only works with primitive type members
 */
export const removeDuplicates = (arr) => arr.filter((elem, pos, a) => a.indexOf(elem) === pos)

/**
 * @param  {Array}
 * @return {Array}
 *
 * Return only unique members of an array
 * (uniqueness defined by the provided key)
 * Note! Works with objects
 */
export const removeDuplicatesByKey = (arr, key) => {
  const seen = new Set()
  return arr.filter(el => {
    const duplicate = seen.has(el[key])
    seen.add(el[key])
    return !duplicate
  })
}

/**
 * Creates sub-arrays in an array, grouping items based on similar properties
 *
 * Usage:
 * const nestedArray = groupBy(list, item => [item.age])
 */
export const groupBy = (array, f) => {
  const groups = {}
  array.forEach(o => {
    const group = JSON.stringify(f(o))
    groups[group] = groups[group] || []
    groups[group].push(o)
  })
  return Object.keys(groups).map(group => groups[group])
}

/**
 * Keep all first-occurring array items (objects) with a specific property
 */
export const uniqueBy = (arr, prop) => {
  const uniqueKeys = arr.reduce((a, d) => {
    if (!a[d[prop]]) a[d[prop]] = d
    return a
  }, {})
  return Object.values(uniqueKeys)
}

export const pushStack = (arr, item, size = 10) => {
  if (arr.length > size) arr.shift()
  arr.push(item)
}



const arraygroup = (list, components, children = 'results', excludenulls = true) => {
	let grouping = [...list.reduce((r, o) => {
		const key = components.map(_ => `${o[_]}`).join(' :: ');
		let keyed = r.get(key) || components.reduce((x, y) => { x[y] = o[y]; return x; }, {});
		keyed[children] = keyed[children] || [];
		keyed[children].push(o);
		return r.set(key, keyed);
	}, new Map()).values()];
	let base = excludenulls ? grouping.filter(o => !Object.values(o).some(v => isBlank(v))) : grouping;
	grouping = undefined;
	return base;
};
