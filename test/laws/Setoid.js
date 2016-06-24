"use strict";

// Third Party
const curry = require("lodash/fp/curry");

module.exports = curry((expect, Type) =>
  describe("Setoid", () => {
    it("should express reflexivity", () => {
      const testValue = true;
      const testLeft = new Type(testValue);

      expect(testLeft.equals(testLeft)).to.be.true;
    });

    it("should express symmetry", () => {
      const testValue = true;
      const testLeft = new Type(testValue);
      const testRight = new Type(testValue);

      expect(
        testLeft.equals(testRight) &&
        testRight.equals(testLeft)
      ).to.be.true;
    });

    it("should express transivity", () => {
      const testValue = true;
      const testLeft = new Type(testValue);
      const testMiddle = new Type(testValue);
      const testRight = new Type(testValue);

      expect(
        testLeft.equals(testMiddle) &&
        testMiddle.equals(testRight) &&
        testRight.equals(testLeft)
      ).to.be.true;
    });
  })
);
