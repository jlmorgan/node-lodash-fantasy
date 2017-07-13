"use strict";

// Third Party
const compose = require("lodash/fp/flowRight");
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Functor", () => {
    it("should express identity", () => {
      const testValue = true;
      const testLeft = Type(testValue).map(identity);
      const testRight = Type(testValue);

      expect(testLeft).to.eql(testRight);
    });

    it("should express composition", () => {
      const testValue = true;
      const testLeft = Type(testValue).fmap(compose(identity, identity));
      const testRight = Type(testValue).fmap(identity).fmap(identity);

      expect(testLeft).to.eql(testRight);
    });
  })
);
