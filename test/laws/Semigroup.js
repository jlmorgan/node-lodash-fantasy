"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Semigroup", () => {
    it("should express associativity", () => {
      const testValue = true;
      const testLeft = new Type(testValue);
      const testMiddle = new Type(testValue);
      const testRight = new Type(testValue);

      expect(testLeft.concat(testMiddle).concat(testRight))
        .to.eql(testLeft.concat(testMiddle.concat(testRight)));
    });
  })
);
