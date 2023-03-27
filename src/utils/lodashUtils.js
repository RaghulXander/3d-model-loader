/**
 * Validate if a value is a real number
 * From https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
 * With one change - not supporting numeric strings
 * @param {*} n
 * @returns {boolean}
 */
export function isNumber(n) {
  return !Number.isNaN(n) && Number.isFinite(n);
}

/**
 *
 *   boolean isEmpty ( value )
 *
 *   Example:
 *
 *   var a = null;
 *   if (isEmpty(a)) {
 *       alert ('empty variable');
 *   }
 */
export function isEmpty(value) {
  if (value == null || value === undefined) {
    return true;
  }
  if (value.prop && value.prop.constructor === Array) {
    return value.length === 0;
  } else if (typeof value == "object") {
    return Object.keys(value).length === 0 && value.constructor === Object;
  } else if (typeof value == "string") {
    return value.length === 0;
  } else if (typeof value == "number") {
    return value === 0;
  } else if (!value) {
    return true;
  }
  return false;
}

/*
Return true if the value has the typeof "object"
And is not null
And is not an array
This matches the "mental model" that many developers have of what an object is.
console.log(
  isObject({ firstName: "Mike" }), // true
  isObject({}), // true
  isObject([2, 3]), // false
  isObject(null), // false
  isObject(() => true) // false
 );
*/

export const isObject = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
