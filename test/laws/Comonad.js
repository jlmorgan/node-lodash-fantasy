"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Comonad", () => {
    it("should express left identity", () => {
      const testValue = true;
      const testExtend = new Type(testValue);
      const testLeft = testExtend.extend(identity).extract();
      const testRight = testExtend;

      expect(testLeft).to.eql(testRight);
    });

    it("should express right identity", () => {
      const testValue = true;
      const testExtend = new Type(testValue);
      const testLeft = testExtend.extend(value => value.extract());
      const testRight = testExtend;

      expect(testLeft).to.eql(testRight);
    });

    it("should express associativity", () => {
      const testValue = true;
      const testExtend = new Type(testValue);
      const testLeft = testExtend.extend(identity);
      const testRight = testExtend.extend(identity).map(identity);

      expect(testLeft).to.eql(testRight);
    });
  })
);
