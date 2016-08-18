"use strict";

/**
 * @typedef Callable
 * @type Function
 * @description A <code>function</code> with no arguments or return value.
 */

/**
 * @typedef Chain
 * @type Function
 * @description A unary <code>function</code> that takes a <code>value</code> and returns a <code>value</code>
 * wrapped in the same type providing the <code>value</code>.
 * @param {T} value - Value on which to chain.
 * @return {Type<T>} <code>value</code> wrapped in a <code>Type</code>.
 */

/**
 * @typedef Consumer
 * @type Function
 * @description A function that takes a <code>value</code> and does not return a value.
 * @param {T} value - Current value.
 */

/**
 * @typedef Extend
 * @type Function
 * @description A unary <code>function</code> that takes a <code>Type</code> and returns a <code>value</code>
 * wrapped in the same type.
 * @param {Type<T>} instance - Instance of <code>Type</code> on which to extend.
 * @return {Type<T>} <code>value</code> wrapped in a <code>Type</code>.
 */

/**
 * @typedef Reduction
 * @type Function
 * @description A binary function that takes an <code>accumulator</code> and a <code>value</code> and
 * returns accumulated value.
 * @param {A} accumulator - The initial value.
 * @param {T} value - Current value.
 * @return {A} The accumulated value.
 */

/**
 * @typedef Predicate
 * @type Function
 * @description A unary function that takes a <code>value</code> and returns the <code>Boolean</code> evaluated result.
 * @param {T} value - Value on which to apply assertions.
 * @return {Boolean} Whether or not the predicate is affirmed or denied.
 */

/**
 * @typedef Supplier
 * @type Function
 * @description A nullary <code>function</code> that returns a <code>value</code>.
 * @return {*}
 */

module.exports = {
  data: require("./data")
};
