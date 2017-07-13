"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Semigroup", () => {
    it("should express associativity", () => {
      const testValue = true;
      const testLeft = Type(testValue);
      const testMiddle = Type(testValue);
      const testRight = Type(testValue);

      expect(testLeft.concat(testMiddle).concat(testRight))
        .to.eql(testLeft.concat(testMiddle.concat(testRight)));
    });
  })
);
