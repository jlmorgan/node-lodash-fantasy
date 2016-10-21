"use strict";

// Third Party
const curryN = require("lodash/fp/curryN");

/**
 * Invokes <code>method</code> with <code>value</code> in <code>source</code> object.
 * @private
 * @param {String} methodName - Method name to invoke.
 * @param {T} value - Value with which to invoke the method.
 * @param {Object} source - The object on which the method is invoked.
 * @return {U} Arbitrary value.
 */
const invokeIn = curryN(3, (methodName, value, source) => source[methodName](value));

module.exports = invokeIn;
