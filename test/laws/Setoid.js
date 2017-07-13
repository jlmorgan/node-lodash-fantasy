"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Setoid", () => {
    it("should express reflexivity", () => {
      const testValue = true;
      const testLeft = Type(testValue);

      expect(testLeft.equals(testLeft)).to.be.true;
    });

    it("should express symmetry", () => {
      const testValue = true;
      const testLeft = Type(testValue);
      const testRight = Type(testValue);

      expect(
        testLeft.equals(testRight) &&
        testRight.equals(testLeft)
      ).to.be.true;
    });

    it("should express transivity", () => {
      const testValue = true;
      const testLeft = Type(testValue);
      const testMiddle = Type(testValue);
      const testRight = Type(testValue);

      expect(
        testLeft.equals(testMiddle) &&
        testMiddle.equals(testRight) &&
        testRight.equals(testLeft)
      ).to.be.true;
    });
  })
);
