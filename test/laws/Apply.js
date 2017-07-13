"use strict";

// Third Party
const compose = require("lodash/fp/compose");
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Apply", () => {
    it("should express composition", () => {
      const testApply = Type(identity);
      const testLeft = testApply.ap(testApply.ap(testApply.fmap(compose)));
      const testRight = testApply.ap(testApply).ap(testApply);

      expect(testLeft).to.eql(testRight);
    });
  })
);
