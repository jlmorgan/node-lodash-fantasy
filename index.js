"use strict";

/**
 * @typedef Callable
 * @type Function
 * @description A {@code function} with no arguments or return value.
 */

/**
 * @typedef Chain
 * @type Function
 * @description A unary {@code function} that takes a {@code value} and returns a {@code value} wrapped
 * in the same type providing the {@code value}.
 * @param {T} value - Value on which to chain.
 * @return {Type.<T>} {@code value} wrapped in a {@code Type}.
 */

/**
 * @typedef Consumer
 * @type Function
 * @description A function that takes a {@code value} and does not return a value.
 * @param {T} value - Current value.
 */

/**
 * @typedef Extend
 * @type Function
 * @description A unary {@code function} that takes a {@code Type} and returns a {@code value}.
 * @param {Type.<T>} instance - Instance of {@code Type} on which to extend.
 * @return {Type.<T>} {@code value} wrapped in a {@code Type}.
 */

/**
 * @typedef LeftFold
 * @type Function
 * @description A binary function that takes an {@code accumulator} and a {@code value} and returns
 * accumulated value.
 * @param {A} accumulator - The initial value.
 * @param {T} value - Current value.
 * @return {A} The accumulated value.
 */

/**
 * @typedef Predicate
 * @type Function
 * @description A unary function that takes a {@code value} and returns the {@code Boolean} evaluated
 * result.
 * @param {T} value - Value on which to apply assertions.
 * @return {Boolean} Whether or not the predicate is affirmed or denied.
 */

/**
 * @typedef RightFold
 * @type Function
 * @description A binary function that takes an {@code accumulator} and a {@code value} and returns
 * accumulated value.
 * @param {T} value - Current value.
 * @param {A} accumulator - The initial value.
 * @return {A} The accumulated value.
 */

/**
 * @typedef Supplier
 * @type Function
 * @description A nullary {@code function} that returns a {@code value}.
 * @return {*}
 */

/**
 * @typedef Throwable
 * @type Function
 * @description A unary {@code function} that takes a {@code value} and returns a {@code value}
 * possibly throwing an {@link Error}.
 * @param {*} value - Input value.
 * @return {*}
 */

module.exports = {
  data: require("./data")
};
