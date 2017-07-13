"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Comonad", () => {
    it("should express left identity", () => {
      const testValue = true;
      const testLeft = Type(testValue).extended(identity).extract();
      const testRight = Type(testValue);

      expect(testLeft).to.eql(testRight);
    });

    it("should express right identity", () => {
      const testValue = true;
      const testLeft = Type(testValue).extended(value => value.extract());
      const testRight = Type(testValue);

      expect(testLeft).to.eql(testRight);
    });
  })
);
