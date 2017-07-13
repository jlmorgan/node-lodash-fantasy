"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Alternative", () => {
    it("should express associativity", () => {
      const testA = Type(0);
      const testB = Type(1);
      const testC = Type(2);
      const testLeft = testA.alt(testB).alt(testC);
      const testRight = testA.alt(testB.alt(testC));

      expect(testLeft).to.eql(testRight);
    });

    it("should express distributivity", () => {
      const testA = Type(0);
      const testB = Type(1);
      const testLeft = testA.alt(testB).map(identity);
      const testRight = testA.map(identity).alt(testB.map(identity));

      expect(testLeft).to.eql(testRight);
    });
  })
);
