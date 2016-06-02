"use strict";

// Third Party
const compose = require("lodash/fp/flowRight");
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Apply", () => {
    it("should express composition", () => {
      const testApply = new Type(identity);
      const testLeft = testApply.map(compose).ap(testApply).ap(testApply);
      const testRight = testApply.ap(testApply.ap(testApply));

      expect(testLeft).to.eql(testRight);
    });
  })
);
