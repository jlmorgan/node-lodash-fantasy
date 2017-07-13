"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Applicative", () => {
    const thrush = curry((value, method) => method(value));

    it("should express identity", () => {
      const testValue = true;
      const testLeft = Type.of(testValue).ap(Type.of(identity));
      const testRight = Type.of(testValue);

      expect(testLeft).to.eql(testRight);
    });

    it("should express homomorphism", () => {
      const testValue = true;
      const testLeft = Type.of(testValue).ap(Type.of(identity));
      const testRight = Type.of(identity(testValue));

      expect(testLeft).to.eql(testRight);
    });

    it("should express interchange", () => {
      const testValue = true;
      const testApplicative = Type.of(identity);
      const testLeft = Type.of(testValue).ap(testApplicative);
      const testRight = testApplicative.ap(Type.of(thrush(testValue)));

      expect(testLeft).to.eql(testRight);
    });
  })
);
