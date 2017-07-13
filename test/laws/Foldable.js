"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Foldable", () => {
    it("should express associativity", () => {
      const testValue = true;
      const testLeft = Type(testValue).reduce(identity, testValue);
      const testRight = Type(testValue).toArray().reduce(identity, testValue);

      expect(testLeft).to.eql(testRight);
    });
  })
);
