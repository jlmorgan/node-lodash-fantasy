"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Alternative", () => {
    const testValue = true;

    it("should express distributivity", () => {
      const testType1 = Type(testValue);
      const testType2 = Type(identity);
      const testType3 = Type(identity);
      const testLeft = testType1.ap(testType2.alt(testType3));
      const testRight = testType1.ap(testType2).alt(testType1.ap(testType3));

      expect(testLeft).to.eql(testRight);
    });

    it("should express annihilation", () => {
      const testType = Type(testValue);
      const testLeft = testType.ap(Type.zero());
      const testRight = Type.zero();

      expect(testLeft).to.eql(testRight);
    });
  })
);
