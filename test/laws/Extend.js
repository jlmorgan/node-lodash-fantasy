"use strict";

// Third Party
const curry = require("lodash/fp/curry");
const identity = require("lodash/fp/identity");

module.exports = curry((expect, Type) =>
  describe("Extend", () => {
    it("should express associativity", () => {
      const testValue = true;
      const testExtend = new Type(testValue);
      const testLeft = testExtend.extend(identity).extend(identity);
      const testRight = testExtend.extend(value => identity(value.extend(identity)));

      expect(testLeft).to.eql(testRight);
    });
  })
);
