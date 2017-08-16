"use strict";

// Third Party
const chai = require("chai");
const F = require("lodash/fp");
const promiseChai = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

// Third Party Setup
chai.use(promiseChai);
chai.use(sinonChai);
const each = F.each;
const expect = chai.expect;

// Project
const Alt = require("./laws/Alt")(expect);
const Applicative = require("./laws/Applicative")(expect);
const Apply = require("./laws/Apply")(expect);
const Chain = require("./laws/Chain")(expect);
const Maybe = require("../data/Maybe");
const Foldable = require("./laws/Foldable")(expect);
const Functor = require("./laws/Functor")(expect);
const Either = require("../data/Either");
const Monad = require("./laws/Monad")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Validation = require("../data/Validation");

// Project Aliases
const left = Either.left;
const right = Either.right;

describe("Either", () => {
  const testMessage = "Test error";
  const testValue = true;

  describe(".all", () => {
    describe("rights", () => {
      it("should return a singular Right of all values", () => {
        const testEithers = [right(testValue), right(!testValue)];
        const expectedResult = right([testValue, !testValue]);
        const actualResult = Either.all(testEithers);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("with a Left", () => {
      it("should return the first Left", () => {
        const testMessage1 = `${testMessage} 1`;
        const testMessage2 = `${testMessage} 2`;
        const testEithers = [left(testMessage1), left(testMessage2), right(testValue)];
        const expectedResult = F.head(testEithers);
        const actualResult = Either.all(testEithers);

        expect(actualResult).to.equal(expectedResult);
      });
    });
  });

  describe(".alt", () => {
    it("should match instance result", () => {
      const testLeft = left(testMessage);
      const testAlt = right(testValue);
      const expectedResult = testLeft.alt(testAlt);
      const actualResult = Either.alt(testAlt)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".any", () => {
    describe("null or undefined list", () => {
      it("should return a Nothing", () => {
        const testEithers = null;
        const expectedResult = Maybe.nothing();
        const actualResult = Either.any(Maybe, testEithers);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("all Left", () => {
      it("should return the first Left", () => {
        const testMessage1 = `${testMessage} 1`;
        const testMessage2 = `${testMessage} 2`;
        const testEithers = [left(testMessage1), left(testMessage2)];
        const expectedResult = Maybe.nothing();
        const actualResult = Either.any(Maybe, testEithers);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("mixed Left and Right", () => {
      const testEithers = [left(testMessage), right(testValue), right(!testValue)];
      const expectedResult = Maybe.just(testValue);
      let actualResult = null;

      before(() => actualResult = Either.any(Maybe, testEithers));

      it("should return the first Right", () => expect(actualResult).to.eql(expectedResult));
    });
  });

  describe(".ap", () => {
    it("should match instance result", () => {
      const testRight = right(testValue);
      const testApply = right(value => !value);
      const expectedResult = testRight.ap(testApply);
      const actualResult = Either.ap(testApply)(testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".attempt", () => {
    it("should return a Left of the error for a caught error", () => {
      const testError = new Error("Test error");
      const testFn = () => {
        throw testError;
      };

      const expectedResult = left(testError);
      const actualResult = Either.attempt(testFn);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return a Right of the value for a normal execution", () => {
      const testFn = () => testValue;
      const expectedResult = right(testValue);
      const actualResult = Either.attempt(testFn);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".chain", () => {
    it("should match instance result", () => {
      const testRight = right(testValue);
      const testChain = value => right(!value);
      const expectedResult = testRight.chain(testChain);
      const actualResult = Either.chain(testChain)(testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".checkedBimap", () => {
    it("should match instance result", () => {
      const testRight = right(testValue);
      const testLeftFold = F.noop;
      const testCheckedMap = () => {
        throw new Error();
      };

      const expectedResult = testRight.checkedBimap(testLeftFold, testCheckedMap);
      const actualResult = Either.checkedBimap(testLeftFold, testCheckedMap)(testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".coalesce", () => {
    it("should alias Either.alt", () => {
      expect(Either.coalesce).to.equal(Either.alt);
    });
  });

  describe(".each", () => {
    const testCollection = [
      left(testMessage),
      right(testValue)
    ];

    describe("early terminate", () => {
      it("should iterate over each item in the collection until Left is returned", () => {
        let testCount = 0;
        const expectedCount = 1;

        Either.each(item => {
          testCount += 1;

          return item;
        }, testCollection);

        expect(testCount).to.equal(expectedCount);
      });
    });

    describe("no early terminate", () => {
      it("should iterate over each item in the collection", () => {
        let testCount = 0;
        const expectedCount = 2;

        Either.each(() => testCount += 1, testCollection);

        expect(testCount).to.equal(expectedCount);
      });
    });
  });

  describe(".either", () => {
    it("should return mapped Left value for Left", () => {
      const testLeft = left(testMessage);
      const expectedResult = F.toUpper(testMessage);
      const actualResult = Either.either(F.toUpper, F.toLower, testLeft);

      expect(actualResult).to.equal(expectedResult);
    });

    it("should return mapped Right value for Right", () => {
      const testRight = right(testMessage);
      const expectedResult = F.toLower(testMessage);
      const actualResult = Either.either(F.toUpper, F.toLower, testRight);

      expect(actualResult).to.equal(expectedResult);
    });
  });

  describe(".equals", () => {
    it("should return true for same values but same types", () =>
      expect(Either.equals(right(testValue), right(testValue))).to.be.true
    );

    it("should return false for same values but different types", () =>
      expect(Either.equals(left(testValue), right(testValue))).to.be.false
    );
  });

  describe(".filter", () => {
    it("should match instance result", () => {
      const testRight = right(testValue);
      const testFilter = F.constant(false);
      const testError = new Error(testMessage);
      const expectedResult = testRight.filter(testFilter, testError);
      const actualResult = Either.filter(testFilter, testError)(testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".flatMap", () => {
    it("should alias Either.chain", () => {
      expect(Either.flatMap).to.equal(Either.chain);
    });
  });

  describe(".fmap", () => {
    it("should match instance result", () => {
      const testRight = right(testValue);
      const testFmap = value => !value;
      const expectedResult = testRight.fmap(testFmap);
      const actualResult = Either.fmap(testFmap)(testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".foldl", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testLeft = left(testMessage);
      const testLeftFold = (value, defaultValue) => defaultValue;
      const expectedResult = testLeft.foldl(testLeftFold, testDefaultValue);
      const actualResult = Either.foldl(testLeftFold, testDefaultValue)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".foldr", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testLeft = left(testMessage);
      const testLeftFold = defaultValue => defaultValue;
      const expectedResult = testLeft.foldr(testLeftFold, testDefaultValue);
      const actualResult = Either.foldr(testLeftFold, testDefaultValue)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".from", () => {
    const testRight = right(testValue);
    const testLeft = left(testMessage);
    const testParams = [
      {
        testValue: testRight,
        expectedResult: testRight
      },
      {
        testValue: testLeft,
        expectedResult: testLeft
      },
      {
        testValue: undefined,
        expectedResult: left(new Error("Either.ofNullable: value is null or undefined"))
      },
      {
        testValue: null,
        expectedResult: left(new Error("Either.ofNullable: value is null or undefined"))
      },
      {
        testValue: true,
        expectedResult: right(true)
      }
    ];

    each(
      testParam => it(
        `should return an Either for '${testParam.testValue}'`,
        () => expect(Either.from(testParam.testValue)).to.eql(testParam.expectedResult)
      ),
      testParams
    );
  });

  describe(".fromLeft", () => {
    it("should return the underlying value for Left", () => {
      const testLeft = left(testMessage);
      const actualResult = Either.fromLeft(testLeft);

      expect(actualResult).to.eql(testMessage);
    });

    it("should throw an error for Right", () => {
      const testRight = right(testValue);
      const testFn = () => Either.fromLeft(testRight);

      expect(testFn).to.throw("Either.fromLeft: instance of either must be a Left");
    });

    it("should throw an error for non-Either", () => {
      const testFn = () => Either.fromLeft(testValue);

      expect(testFn).to.throw("Either.fromLeft: instance of either must be a Left");
    });
  });

  describe(".fromRight", () => {
    it("should return the underlying value for Right", () => {
      const testRight = right(testValue);
      const actualResult = Either.fromRight(testRight);

      expect(actualResult).to.eql(testValue);
    });

    it("should throw an error for Left", () => {
      const testLeft = left(testMessage);
      const testFn = () => Either.fromRight(testLeft);

      expect(testFn).to.throw("Either.fromRight: instance of either must be a Right");
    });

    it("should throw an error for non-Either", () => {
      const testFn = () => Either.fromRight(testValue);

      expect(testFn).to.throw("Either.fromRight: instance of either must be a Right");
    });
  });

  describe(".getOrElse", () => {
    it("should match instance result", () => {
      const testLeft = left(testMessage);
      const expectedResult = testLeft.getOrElse(!testValue);
      const actualResult = Either.getOrElse(!testValue)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".getOrElseGet", () => {
    it("should match instance result", () => {
      const testLeft = left(testMessage);
      const testSupplier = () => !testValue;
      const expectedResult = testLeft.getOrElseGet(testSupplier);
      const actualResult = Either.getOrElseGet(testSupplier)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".ifLeft", () => {
    const testLeft = left(testMessage);
    const testLeftConsumer = sinon.spy(F.noop);
    let actualResult = null;

    before(() => actualResult = Either.ifLeft(testLeftConsumer)(testLeft));

    it("should return the instance", () => expect(actualResult).to.equal(testLeft));
    it("should call the provided ifLeft consumer", () => expect(testLeftConsumer).to.be.calledWith(testMessage));
  });

  describe(".ifRight", () => {
    const testRight = right(testValue);
    const testRightConsumer = sinon.spy(F.noop);
    let actualResult = null;

    before(() => actualResult = Either.ifRight(testRightConsumer)(testRight));

    it("should return the instance", () => expect(actualResult).to.equal(testRight));
    it("should call the provided ifRight consumer", () => expect(testRightConsumer).to.be.calledWith(testValue));
  });

  describe(".isEither", () => {
    it("should return true for a Left", () => expect(Either.isEither(left(testMessage))).to.be.true);
    it("should return false for a Right", () => expect(Either.isEither(right(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Either.isEither(testValue)).to.be.false);
  });

  describe(".isLeft", () => {
    it("should return true for a Left", () => expect(Either.isLeft(left(testMessage))).to.be.true);
    it("should return false for a Right", () => expect(Either.isLeft(right(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Either.isLeft(testValue)).to.be.false);
  });

  describe(".isNotEither", () => {
    it("should return true for a Left", () => expect(Either.isNotEither(left(testMessage))).to.be.false);
    it("should return false for a Right", () => expect(Either.isNotEither(right(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Either.isNotEither(testValue)).to.be.true);
  });

  describe(".isNotLeft", () => {
    it("should return true for a Left", () => expect(Either.isNotLeft(left(testMessage))).to.be.false);
    it("should return false for a Right", () => expect(Either.isNotLeft(right(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Either.isNotLeft(testValue)).to.be.true);
  });

  describe(".isNotRight", () => {
    it("should return false for a Left", () => expect(Either.isNotRight(left(testMessage))).to.be.true);
    it("should return true for a Right", () => expect(Either.isNotRight(right(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Either.isNotRight(testValue)).to.be.true);
  });

  describe(".isRight", () => {
    it("should return false for a Left", () => expect(Either.isRight(left(testMessage))).to.be.false);
    it("should return true for a Right", () => expect(Either.isRight(right(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Either.isRight(testValue)).to.be.false);
  });

  describe(".lefts", () => {
    it("should return empty list for null list", () => {
      const testList = null;
      const expectedResult = [];
      const actualResult = Either.lefts(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for empty list", () => {
      const testList = [];
      const expectedResult = [];
      const actualResult = Either.lefts(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for Right list", () => {
      const testList = [right(!testValue), right(testValue)];
      const expectedResult = [];
      const actualResult = Either.lefts(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return lefts for mixed list", () => {
      const testMessage1 = `${testMessage} 1`;
      const testMessage2 = `${testMessage} 2`;
      const testList = [left(testMessage1), right(testValue), left(testMessage2)];
      const expectedResult = [testMessage1, testMessage2];
      const actualResult = Either.lefts(testList);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".lift", () => {
    it("should return an empty list for null list", () => {
      const testCollection = null;
      const expectedResult = [];
      const actualResult = Either.lift(value => !value, testCollection);

      expect(actualResult).to.be.eql(expectedResult);
    });

    it("should map each value in the collection", () => {
      const testCollection = [left(testMessage), right(testValue)];
      const expectedResult = [left(testMessage), right(!testValue)];
      const actualResult = Either.lift(value => !value, testCollection);

      expect(actualResult).to.be.eql(expectedResult);
    });
  });

  describe(".map", () => {
    it("should alias Either.fmap", () => {
      expect(Either.map).to.equal(Either.fmap);
    });
  });

  describe(".of", () => {
    it("should alias Either.pure", () => expect(Either.of).to.equal(Either.pure));
  });

  describe(".ofNullable", () => {
    const testNullableValues = [undefined, null];
    const testValues = [0, false, true, "", [], {}];
    const expectedLeft = left(new Error("Either.ofNullable: value is null or undefined"));

    each(
      testValue => it(
        `should return an instance of Nullable for '${testValue}'`,
        () => expect(Either.ofNullable(testValue)).to.eql(expectedLeft)
      ),
      testNullableValues
    );

    each(
      testValue => it(
        `should return an instance of Just for '${testValue}'`,
        () => expect(Either.ofNullable(testValue)).to.eql(right(testValue))
      ),
      testValues
    );
  });

  describe(".recover", () => {
    it("should match instance result", () => {
      const testLeft = left(testMessage);
      const expectedResult = testLeft.recover(testValue);
      const actualResult = Either.recover(testValue)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".reduce", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testLeft = left(testMessage);
      const testLeftFold = (value, defaultValue) => defaultValue;
      const expectedResult = testLeft.reduce(testLeftFold, testDefaultValue);
      const actualResult = Either.reduce(testLeftFold, testDefaultValue)(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".right", () => {
    it("should return an instance of Right", () => expect(Either.right().isRight()).to.be.true);
  });

  describe(".rights", () => {
    it("should return empty list for null list", () => {
      const testList = null;
      const expectedResult = [];
      const actualResult = Either.rights(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for empty list", () => {
      const testList = [];
      const expectedResult = [];
      const actualResult = Either.rights(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for Left list", () => {
      const testList = [left(testMessage), left(testMessage)];
      const expectedResult = [];
      const actualResult = Either.rights(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return rights for mixed list", () => {
      const testList = [left(testMessage), right(testValue), left(testMessage)];
      const expectedResult = [testValue];
      const actualResult = Either.rights(testList);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".tap", () => {
    const testRight = right(testValue);
    const testLeftConsumer = sinon.spy(F.noop);
    const testRightConsumer = sinon.spy(F.identity);
    let actualResult = null;

    before(() => actualResult = Either.tap(testLeftConsumer, testRightConsumer)(testRight));

    it("should return the instance", () => expect(actualResult).to.equal(testRight));
    it("should not call the provided left consumer", () => expect(testLeftConsumer).to.not.be.called);
    it("should call the provided right consumer", () => expect(testRightConsumer).to.be.calledWith(testValue));
  });

  describe(".toArray", () => {
    it("should match instance result", () => {
      const testLeft = left(testMessage);
      const expectedResult = testLeft.toArray();
      const actualResult = Either.toArray(testLeft);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toMaybe", () => {
    const testMaybeImplementation = Maybe;

    it("should convert the Left to a Nothing", () => {
      const testLeft = left(testMessage);
      const expectedResult = Maybe.nothing();
      const actualResult = Either.toMaybe(testMaybeImplementation, testLeft);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should convert the Right to a Just", () => {
      const testRight = right(testValue);
      const expectedResult = Maybe.just(testValue);
      const actualResult = Either.toMaybe(testMaybeImplementation, testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toPromise", () => {
    const testLeft = left(testMessage);
    const testRight = right(testValue);
    const testPromiseImplementation = Promise;

    it("should reject with the value of a Left", () =>
      expect(Either.toPromise(testPromiseImplementation, testLeft)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Right", () =>
      expect(Either.toPromise(testPromiseImplementation, testRight)).to.eventually.equal(testValue)
    );
  });

  describe(".toValidation", () => {
    const testValidationImplementation = Validation;

    it("should convert the Left to a Nothing", () => {
      const testLeft = left(testMessage);
      const expectedResult = Validation.failure(testMessage);
      const actualResult = Either.toValidation(testValidationImplementation, testLeft);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should convert the Right to a Just", () => {
      const testRight = right(testValue);
      const expectedResult = Validation.success(testValue);
      const actualResult = Either.toValidation(testValidationImplementation, testRight);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe("Left", () => {
    describe("constructor", () => {
      it("should return a new instance of Left", () => expect(left(testMessage).isLeft()).to.be.true);
    });

    describe("#alt", () => {
      it("should return the Right alternative", () => {
        const testLeft = left(testMessage);
        const testAlt = right(testValue);
        const actualResult = testLeft.alt(testAlt);

        expect(actualResult).to.equal(testAlt);
      });

      it("should return the Right alternative supplier", () => {
        const testLeft = left(testMessage);
        const testAlt = F.constant(right(testValue));
        const expectedResult = right(testValue);
        const actualResult = testLeft.alt(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should throw an error for a non-Either", () => {
        const testLeft = left(testMessage);
        const testAlt = testValue;
        const testFn = () => testLeft.alt(testAlt);

        expect(testFn).to.throw("Either#alt: the provided other value must return an instance of Either");
      });
    });

    describe("#ap", () => {
      describe("with Left", () => {
        it("should return the apply instance", () => {
          const testLeft = left(`${testMessage}1`);
          const testApply = left(`${testMessage}2`);
          const actualResult = testLeft.ap(testApply);

          expect(actualResult).to.equal(testApply);
        });
      });

      describe("with Right", () => {
        const testLeft = left(testMessage);
        const testApplyFunction = sinon.spy(F.constant(true));
        const testApply = right(testApplyFunction);
        let actualResult = null;

        before(() => actualResult = testLeft.ap(testApply));

        it("should return the instance", () => expect(actualResult).to.equal(testLeft));
        it("should not call the provided apply morphism", () => expect(testApplyFunction).to.not.be.called);
      });
    });

    describe("#bimap", () => {
      const testLeft = left(testMessage);
      const testLeftMap = sinon.spy(value => `${value} bimapped`);
      const testRightMap = sinon.spy(value => !value);
      const expectedResult = left(`${testMessage} bimapped`);
      let actualResult = null;

      before(() => actualResult = testLeft.bimap(testLeftMap)(testRightMap));

      it("should call the left bimap method", () => expect(testLeftMap).to.be.calledWith(testMessage));
      it("should not call the right bimap method", () => expect(testRightMap).to.not.be.called);
      it("should return a Left of the mapped value", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("#chain", () => {
      const testLeft = left(testMessage);
      const testChain = sinon.spy(F.constant(true));
      let actualResult = null;

      before(() => actualResult = testLeft.chain(testChain));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided chain method", () => expect(testChain).to.not.be.called);
    });

    describe("#checkedBimap", () => {
      const testLeft = left(testMessage);
      const testError = new Error(`${testMessage} thrown`);
      const testLeftFold = sinon.spy(
        (leftValue, thrownError) => leftValue ? `${leftValue} folded` : thrownError.message
      );
      const testCheckedMap = sinon.spy(function() {
        throw testError;
      });
      const expectedResult = left(`${testMessage} folded`);
      let actualResult = null;

      before(() => actualResult = testLeft.checkedBimap(testLeftFold)(testCheckedMap));

      it("should return Left of value", () => expect(actualResult).to.eql(expectedResult));
      it("should call the provided left fold", () => expect(testLeftFold).to.be.calledWith(testMessage));
      it("should not call the provided morphism", () => expect(testCheckedMap).to.not.be.called);
    });

    describe("#coalesce", () => {
      it("should alias Either#alt", () => {
        const testLeft = left(testMessage);
        const testAlt = right(!testValue);
        const expectedResult = testLeft.alt(testAlt);
        const actualResult = testLeft.coalesce(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#equals", () => {
      it("should return true for instances with the same value", () => {
        const testEither1 = left(testMessage);
        const testEither2 = left(testMessage);

        expect(testEither1.equals(testEither2)).to.be.true;
      });

      it("should return false for differing instances", () => {
        const testEither1 = left(testMessage);
        const testEither2 = right(testValue);

        expect(testEither1.equals(testEither2)).to.be.false;
      });
    });

    describe("#filter", () => {
      const testLeft = left(testMessage);
      const testFilter = sinon.spy(() => false);
      const testFilterValue = `${testMessage} filtered`;
      let actualResult = null;

      before(() => actualResult = testLeft.filter(testFilter)(testFilterValue));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided filter", () => expect(testFilter).to.not.be.called);
    });

    describe("#first", () => {
      it("should return a Left of the mapped value", () => {
        const testLeft = left(testMessage);
        const testLeftMap = value => `${value} mapped`;
        const expectedResult = left(`${testMessage} mapped`);
        const actualResult = testLeft.first(testLeftMap);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#flatMap", () => {
      it("should alias Either#chain", () => {
        const testLeft = left(testMessage);
        const testChain = value => right(!value);
        const expectedResult = testLeft.chain(testChain);
        const actualResult = testLeft.flatMap(testChain);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#fmap", () => {
      const testLeft = left(testMessage);
      const testMap = sinon.spy(F.constant(true));
      let actualResult = null;

      before(() => actualResult = testLeft.fmap(testMap));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided fmap morphism", () => expect(testMap).to.not.be.called);
    });

    describe("#foldl", () => {
      it("should return the default value", () => {
        const testLeft = left(testMessage);
        const testDefaultValue = !testValue;
        const testLeftFold = (value, defaultValue) => defaultValue;
        const actualResult = testLeft.foldl(testLeftFold)(testDefaultValue);

        expect(actualResult).to.eql(testDefaultValue);
      });
    });

    describe("#foldr", () => {
      it("should return the default value", () => {
        const testLeft = left(testMessage);
        const testDefaultValue = !testValue;
        const testRightFold = F.identity;
        const actualResult = testLeft.foldr(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(testDefaultValue);
      });
    });

    describe("#getOrElse", () => {
      it("should return other value", () => {
        const testLeft = left(testMessage);

        expect(testLeft.getOrElse(testValue)).to.equal(testValue);
      });
    });

    describe("#getOrElseGet", () => {
      it("should return other supplied value", () => {
        const testLeft = left(testMessage);
        const testOtherValueSupplier = () => testValue;

        expect(testLeft.getOrElseGet(testOtherValueSupplier)).to.equal(testValue);
      });
    });

    describe("#getOrElseThrow", () => {
      it("should throw an error", () => {
        const testErrorFunction = message => new Error(message);
        const testFn = () => left(testMessage).getOrElseThrow(testErrorFunction);

        expect(testFn).to.throw(testMessage);
      });
    });

    describe("#ifLeft", () => {
      const testLeft = left(testMessage);
      const testIfLeft = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testLeft.ifLeft(testIfLeft));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should call the provided ifLeft method", () => expect(testIfLeft).to.be.calledWith(testMessage));
    });

    describe("#ifRight", () => {
      const testLeft = left(testMessage);
      const testIfRight = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testLeft.ifRight(testIfRight));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided ifRight method", () => expect(testIfRight).to.not.be.called);
    });

    describe("#isLeft", () => {
      it("should return true", () => expect(left(testMessage).isLeft()).to.be.true);
    });

    describe("#isRight", () => {
      it("should return false", () => expect(left(testMessage).isRight()).to.be.false);
    });

    describe("#leftMap", () => {
      it("should alias Left#first", () => {
        const testLeft = left(testMessage);
        const testLeftMap = value => `${value} mapped`;
        const expectedResult = testLeft.first(testLeftMap);
        const actualResult = testLeft.leftMap(testLeftMap);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#length", () => {
      it("should return a length of zero (0)", () => {
        const testLeft = left(testMessage);
        const expectedResult = 0;
        const actualResult = testLeft.length();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#map", () => {
      it("should alias Either#fmap", () => {
        const testLeft = left(testMessage);
        const testMap = value => !value;
        const expectedResult = testLeft.fmap(testMap);
        const actualResult = testLeft.map(testMap);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#of", () => {
      it("should return an instance of Right", () => {
        const testLeft = left(testMessage);
        const expectedResult = right(testValue);
        const actualResult = testLeft.of(testValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#recover", () => {
      it("should return a Just of the recover value", () => {
        const testLeft = left(testMessage);
        const expectedResult = right(testValue);
        const actualResult = testLeft.recover(testValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#reduce", () => {
      it("should alias Either#foldl", () => {
        const testLeft = left(testMessage);
        const testDefaultValue = !testValue;
        const testRightFold = defaultValue => defaultValue;
        const expectedResult = testLeft.foldl(testRightFold, testDefaultValue);
        const actualResult = testLeft.reduce(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#rightMap", () => {
      it("should alias Left#second", () => {
        const testLeft = left(testMessage);
        const testRightMap = value => !value;
        const expectedResult = testLeft.second(testRightMap);
        const actualResult = testLeft.rightMap(testRightMap);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#second", () => {
      it("should return the instance", () => {
        const testLeft = left(testMessage);
        const testRightMap = value => !value;
        const actualResult = testLeft.second(testRightMap);

        expect(actualResult).to.eql(testLeft);
      });
    });

    describe("#tap", () => {
      const testLeft = left(testMessage);
      const testLeftConsumer = sinon.spy(F.identity);
      const testRightConsumer = sinon.spy(F.identity);
      let actualResult = null;

      before(() => actualResult = testLeft.tap(testLeftConsumer)(testRightConsumer));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should call the provided left consumer", () => expect(testLeftConsumer).to.be.calledWith(testMessage));
      it("should not call the provided right consumer", () => expect(testRightConsumer).to.not.be.called);
    });

    describe("#toArray", () => {
      it("should return an empty array", () => {
        const testLeft = left(testMessage);
        const expectedResult = [];
        const actualResult = testLeft.toArray();

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toMaybe", () => {
      it("should return a Maybe instance", () => {
        const testLeft = left(testMessage);
        const testMaybeImplementation = Maybe;
        const expectedResult = Maybe.nothing();
        const actualResult = testLeft.toMaybe(testMaybeImplementation);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#toPromise", () => {
      it("should have rejected the value", () => {
        const testLeft = left(testMessage);
        const testPromiseImplementation = Promise;
        const actualResult = testLeft.toPromise(testPromiseImplementation);

        expect(actualResult).to.be.rejectedWith(testMessage);
      });
    });

    describe("#toString", () => {
      it("should return a string containing the type and the values", () => {
        const testLeft = left(testMessage);
        const expectedResult = `Left(${testMessage})`;
        const actualResult = testLeft.toString();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#toValidation", () => {
      it("should return a Validation instance", () => {
        const testLeft = left(testMessage);
        const testValidationImplementation = Validation;
        const expectedResult = Validation.failure([testMessage]);
        const actualResult = testLeft.toValidation(testValidationImplementation);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });
  });

  describe("Right", () => {
    describe("constructor", () => {
      it("should return a new instance of Right", () => expect(right(testValue).isRight()).to.be.true);
    });

    describe("#alt", () => {
      it("should return the instance", () => {
        const testRight = right(testValue);
        const testAlt = right(!testValue);
        const actualResult = testRight.alt(testAlt);

        expect(actualResult).to.equal(testRight);
      });
    });

    describe("#ap", () => {
      describe("with Left", () => {
        it("should return Left", () => {
          const testRight = right(testValue);
          const testApply = left(testMessage);
          const actualResult = testRight.ap(testApply);

          expect(actualResult).to.equal(testApply);
        });
      });

      describe("with Right", () => {
        const testRight = right(testValue);
        const testApplyFunction = sinon.spy(value => !value);
        const testApply = right(testApplyFunction);
        const expectedResult = right(!testValue);
        let actualResult = null;

        before(() => actualResult = testRight.ap(testApply));

        it("should not call the provided apply morphism", () => expect(testApplyFunction).to.be.calledWith(testValue));
        it("should apply morphism", () => expect(actualResult).to.eql(expectedResult));
      });
    });

    describe("#bimap", () => {
      const testRight = right(testValue);
      const testLeftMap = sinon.spy(value => `${value} bimapped`);
      const testRightMap = sinon.spy(value => !value);
      const expectedResult = right(!testValue);
      let actualResult = null;

      before(() => actualResult = testRight.bimap(testLeftMap)(testRightMap));

      it("should not call the left bimap method", () => expect(testLeftMap).to.not.be.called);
      it("should call the right bimap method", () => expect(testRightMap).to.be.calledWith(testValue));
      it("should return a right of the mapped value", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("#chain", () => {
      const testRight = right(testValue);

      describe("Left result", () => {
        const testChain = sinon.spy(() => left(testMessage));
        const expectedResult = left(testMessage);
        let actualResult = null;

        before(() => actualResult = testRight.chain(testChain));

        it("should return the Left instance", () => expect(actualResult).to.be.eql(expectedResult));
      });

      describe("Right wrapped result", () => {
        const testChain = sinon.spy(value => right(!value));
        const expectedResult = right(!testValue);
        let actualResultJust = null;

        before(() => actualResultJust = testRight.chain(testChain));

        it("should return the Right instance", () => expect(actualResultJust).to.be.eql(expectedResult));
      });

      describe("unwrapped result", () => {
        it("should throw an error", () => {
          const testFunction = sinon.spy(value => !value);
          const testFn = () => testRight.chain(testFunction);

          expect(testFn).to.throw();
        });
      });
    });

    describe("#checkedBimap", () => {
      const testRight = right(testValue);
      const testError = new Error(`${testMessage} thrown`);

      describe("morphism", () => {
        const testLeftFold = sinon.spy(
          (leftValue, thrownError) => leftValue ? `${leftValue} folded` : thrownError.message
        );
        const testCheckedMap = sinon.spy(value => !value);
        const expectedResult = right(!testValue);
        let actualResult = null;

        before(() => actualResult = testRight.checkedBimap(testLeftFold)(testCheckedMap));

        it("should return Right of value", () => expect(actualResult).to.eql(expectedResult));
        it("should not call the provided left fold", () => expect(testLeftFold).to.not.be.called);
        it("should call the provided morphism", () => expect(testCheckedMap).to.be.calledWith(testValue));
      });

      describe("throwing morphism", () => {
        const testLeftFold = sinon.spy(
          (leftValue, thrownError) => leftValue ? `${leftValue} folded` : thrownError.message
        );
        const testCheckedMap = sinon.spy(function() {
          throw testError;
        });
        const expectedResult = left(`${testMessage} thrown`);
        let actualResult = null;

        before(() => actualResult = testRight.checkedBimap(testLeftFold)(testCheckedMap));

        it("should return Left of value", () => expect(actualResult).to.eql(expectedResult));
        it("should call the provided left fold", () => expect(testLeftFold).to.be.calledWith(null, testError));
        it("should not call the provided morphism", () => expect(testCheckedMap).to.be.calledWith(testValue));
      });
    });

    describe("#coalesce", () => {
      it("should alias Either#alt", () => {
        const testRight = right(testValue);
        const testAlt = right(!testValue);
        const expectedResult = testRight.alt(testAlt);
        const actualResult = testRight.coalesce(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#equals", () => {
      const testRight1 = right(testValue);
      const testRight2 = right(testValue);
      const testRight3 = right(!testValue);

      it("should return true for instances with the same value", () =>
        expect(testRight1.equals(testRight2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testRight1.equals(testRight3)).to.be.false
      );
    });

    describe("#filter", () => {
      const testRight = right(testValue);
      const testFilterValue = `${testMessage} filtered`;

      it("should return Left of value for false predicate", () => {
        const testPredicate = F.constant(false);
        const expectedResult = left(testFilterValue);
        const actualResult = testRight.filter(testPredicate)(testFilterValue);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should return Left of supplier value for false predicate", () => {
        const testPredicate = F.constant(false);
        const expectedResult = left(testFilterValue);
        const actualResult = testRight.filter(testPredicate)(F.constant(testFilterValue));

        expect(actualResult).to.eql(expectedResult);
      });

      it("should return Right for true predicate", () => {
        const testPredicate = F.constant(true);
        const actualResult = testRight.filter(testPredicate)(testFilterValue);

        expect(actualResult).to.equal(testRight);
      });
    });

    describe("#flatMap", () => {
      it("should alias Either#chain", () => {
        const testRight = right(testValue);
        const testChain = value => right(!value);
        const expectedResult = testRight.chain(testChain);
        const actualResult = testRight.flatMap(testChain);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#fmap", () => {
      const testRight = right(testValue);
      const testMap = sinon.spy(() => !true);
      const expectedResult = right(!testValue);
      let actualResult = null;

      before(() => actualResult = testRight.fmap(testMap));

      it("should return a Right of value", () => expect(actualResult).to.eql(expectedResult));
      it("should call the provided morphism", () => expect(testMap).to.be.calledWith(testValue));
    });

    describe("#foldl", () => {
      it("should return the default value", () => {
        const testRight = right(testValue);
        const testDefaultValue = !testValue;
        const testLeftFold = (value, defaultValue) => defaultValue;
        const actualResult = testRight.foldl(testLeftFold)(testDefaultValue);

        expect(actualResult).to.eql(testValue);
      });
    });

    describe("#foldr", () => {
      it("should return the default value", () => {
        const testRight = right(testValue);
        const testDefaultValue = !testValue;
        const testRightFold = defaultValue => defaultValue;
        const actualResult = testRight.foldr(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(testValue);
      });
    });

    describe("#getOrElse", () => {
      it("should return other value", () => {
        const testRight = right(testValue);
        const testOtherValue = !testValue;

        expect(testRight.getOrElse(testOtherValue)).to.equal(testValue);
      });
    });

    describe("#getOrElseGet", () => {
      it("should return other supplied value", () => {
        const testRight = right(testValue);
        const testOtherValueSupplier = F.constant(!testValue);

        expect(testRight.getOrElseGet(testOtherValueSupplier)).to.equal(testValue);
      });
    });

    describe("#getOrElseThrow", () => {
      it("should return the value", () => {
        const testRight = right(testValue);
        const testErrorSupplier = F.constant(new Error());

        expect(testRight.getOrElseThrow(testErrorSupplier)).to.equal(testValue);
      });
    });

    describe("#ifLeft", () => {
      const testRight = right(testValue);
      const testIfLeft = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testRight.ifLeft(testIfLeft));

      it("should return the instance", () => expect(actualResult).to.equal(testRight));
      it("should not call the provided ifLeft method", () => expect(testIfLeft).to.not.be.called);
    });

    describe("#ifRight", () => {
      const testRight = right(testValue);
      const testIfRight = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testRight.ifRight(testIfRight));

      it("should return the instance", () => expect(actualResult).to.equal(testRight));
      it("should call the provided ifRight method", () => expect(testIfRight).to.be.calledWith(testValue));
    });

    describe("#isLeft", () => {
      it("should return false", () => expect(right(testValue).isLeft()).to.be.false);
    });

    describe("#isRight", () => {
      it("should return true", () => expect(right(testValue).isRight()).to.be.true);
    });

    describe("#length", () => {
      it("should return a length of one (1)", () => {
        const testRight = right(testValue);
        const expectedResult = 1;
        const actualResult = testRight.length();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#map", () => {
      it("should alias Either#fmap", () => {
        const testRight = right(testValue);
        const testMap = value => !value;
        const expectedResult = testRight.fmap(testMap);
        const actualResult = testRight.map(testMap);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#of", () => {
      it("should return an instance of Right of the value", () => {
        const testRight = right(testValue);
        const expectedResult = right(!testValue);
        const actualResult = testRight.of(!testValue);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#recover", () => {
      it("should return the instance", () => {
        const testRight = right(testValue);
        const actualResult = testRight.recover(!testValue);

        expect(actualResult).to.equal(testRight);
      });
    });

    describe("#reduce", () => {
      it("should alias Either#foldl", () => {
        const testRight = right(testValue);
        const testDefaultValue = !testValue;
        const testRightFold = defaultValue => defaultValue;
        const expectedResult = testRight.foldl(testRightFold, testDefaultValue);
        const actualResult = testRight.reduce(testRightFold, testDefaultValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#tap", () => {
      const testRight = right(testValue);
      const testLeftConsumer = sinon.spy(F.noop);
      const testRightConsumer = sinon.spy(F.identity);
      let actualResult = null;

      before(() => actualResult = testRight.tap(testLeftConsumer, testRightConsumer));

      it("should return the instance", () => expect(actualResult).to.equal(testRight));
      it("should not call the provided left consumer", () => expect(testLeftConsumer).to.not.be.called);
      it("should call the provided right consumer", () => expect(testRightConsumer).to.be.calledWith(testValue));
    });

    describe("#toArray", () => {
      it("should return an array of the value", () => {
        const testRight = right(testValue);
        const expectedResult = [testValue];
        const actualResult = testRight.toArray();

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toMaybe", () => {
      it("should return a Maybe instance", () => {
        const testRight = right(testValue);
        const testMaybeImplementation = Maybe;
        const expectedResult = Maybe.just(testValue);

        expect(testRight.toMaybe(testMaybeImplementation)).to.be.eql(expectedResult);
      });
    });

    describe("#toPromise", () => {
      it("should have resolved the value", () => {
        const testRight = right(testValue);
        const testPromiseImplementation = Promise;
        const actualResult = testRight.toPromise(testPromiseImplementation);

        expect(actualResult).to.eventually.equal(testValue);
      });
    });

    describe("#toString", () => {
      it("should return a string containing the type and the values", () => {
        const testValues = [true, false];
        const testRight = right(testValues);
        const expectedResult = "Right(true,false)";
        const actualResult = testRight.toString();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#toValidation", () => {
      it("should contain the value of the Just", () => {
        const testRight = right(testValue);
        const testValidationImplementation = Validation;
        const expectedResult = Validation.success(testValue);
        const actualResult = testRight.toValidation(testValidationImplementation);

        expect(actualResult).to.eql(expectedResult);
      });
    });
  });

  describe("Algebraic Laws", () => {
    Alt(Either);
    Applicative(Either);
    Apply(Either);
    Chain(Either);
    Foldable(Either);
    Functor(Either);
    Monad(Either);
    Setoid(Either);
  });
});
