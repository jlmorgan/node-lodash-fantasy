"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Monad", () => {
    it("should express left identity", () => {
      const testChain = value => Type(value);
      const testValue = true;
      const testLeft = Type.of(testValue).chain(testChain);
      const testRight = testChain(testValue);

      expect(testLeft).to.eql(testRight);
    });

    it("should express right identity", () => {
      const testValue = true;
      const testLeft = Type.of(testValue).chain(Type.of);
      const testRight = Type.of(testValue);

      expect(testLeft).to.eql(testRight);
    });
  })
);
