"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Chain", () => {
    it("should express associativity", () => {
      const testValue = true;
      const testLeft = Type.of(testValue).chain(Type.of).chain(Type.of);
      const testRight = Type.of(testValue).chain(value => Type.of(value).chain(Type.of));

      expect(testLeft).to.eql(testRight);
    });
  })
);
