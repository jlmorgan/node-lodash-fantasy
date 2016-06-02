"use strict";

// Third Party
const compose = require("lodash/fp/flowRight");
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Functor", () => {
    it("should express identity", () => {
      const testValue = true;
      const testLeft = new Type(testValue).map(identity);
      const testRight = new Type(testValue);

      expect(testLeft).to.eql(testRight);
    });

    it("should express composition", () => {
      const testValue = true;
      const testLeft = new Type(testValue).map(compose(identity, identity));
      const testRight = new Type(testValue).map(identity).map(identity);

      expect(testLeft).to.eql(testRight);
    });
  })
);
