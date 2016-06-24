"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Monoid", () => {
    it("should express left identity", () => {
      const testValue = true;
      const testLeft = Type.empty().concat(Type.of(testValue));
      const testRight = Type.of(testValue);

      expect(testLeft).to.eql(testRight);
    });

    it("should express right identity", () => {
      const testValue = true;
      const testLeft = Type.of(testValue).concat(Type.empty());
      const testRight = Type.of(testValue);

      expect(testLeft).to.eql(testRight);
    });
  })
);
