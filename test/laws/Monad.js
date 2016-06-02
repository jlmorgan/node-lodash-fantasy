"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Monad", () => {
    it("should express left identity", () => {
      const testValue = true;
      const testLeft = Type.of(testValue).chain(identity);
      const testRight = Type.of(testValue);

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
