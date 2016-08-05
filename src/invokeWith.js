"use strict";

// Third Party
const curryN = require("lodash/fp/curryN");

/**
 * Invokes <code>method</code> in <code>source</code> object with <code>value</code>.
 * @private
 * @param {String} methodName - Method name to invoke.
 * @param {Object} source - The object on which the method is invoked.
 * @param {T} value - Value with which to invoke the method.
 * @return {U} Arbitrary value.
 */
const invokeWith = curryN(3, (methodName, source, value) => source[methodName](value));

module.exports = invokeWith;
