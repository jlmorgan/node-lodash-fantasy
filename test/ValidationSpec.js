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
const Either = require("../data/Either");
const Maybe = require("../data/Maybe");
const Foldable = require("./laws/Foldable")(expect);
const Functor = require("./laws/Functor")(expect);
const Monad = require("./laws/Monad")(expect);
const Semigroup = require("./laws/Semigroup")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Validation = require("../data/Validation");

// Project Aliases
const failure = Validation.failure;
const success = Validation.success;

describe("Validation", () => {
  const testMessage = "Test error";
  const testValue = true;

  describe(".all", () => {
    describe("successs", () => {
      it("should return a singular Success of all values", () => {
        const testValidations = [success(testValue), success(!testValue)];
        const expectedResult = success([testValue, !testValue]);
        const actualResult = Validation.all(testValidations);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("with a Failure", () => {
      it("should return the first Failure", () => {
        const testMessage1 = `${testMessage} 1`;
        const testMessage2 = `${testMessage} 2`;
        const testValidations = [failure(testMessage1), failure(testMessage2), success(testValue)];
        const expectedResult = F.head(testValidations);
        const actualResult = Validation.all(testValidations);

        expect(actualResult).to.equal(expectedResult);
      });
    });
  });

  describe(".alt", () => {
    it("should match instance result", () => {
      const testFailure = failure(testMessage);
      const testAlt = success(testValue);
      const expectedResult = testFailure.alt(testAlt);
      const actualResult = Validation.alt(testAlt)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".any", () => {
    describe("null or undefined list", () => {
      it("should return a Nothing", () => {
        const testValidations = null;
        const expectedResult = Maybe.nothing();
        const actualResult = Validation.any(Maybe, testValidations);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("all Failure", () => {
      it("should return the first Failure", () => {
        const testMessage1 = `${testMessage} 1`;
        const testMessage2 = `${testMessage} 2`;
        const testValidations = [failure(testMessage1), failure(testMessage2)];
        const expectedResult = Maybe.nothing();
        const actualResult = Validation.any(Maybe, testValidations);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("mixed Failure and Success", () => {
      const testValidations = [failure(testMessage), success(testValue), success(!testValue)];
      const expectedResult = Maybe.just(testValue);
      let actualResult = null;

      before(() => actualResult = Validation.any(Maybe, testValidations));

      it("should return the first Success", () => expect(actualResult).to.eql(expectedResult));
    });
  });

  describe(".ap", () => {
    it("should match instance result", () => {
      const testSuccess = success(testValue);
      const testApply = success(value => !value);
      const expectedResult = testSuccess.ap(testApply);
      const actualResult = Validation.ap(testApply)(testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".attempt", () => {
    it("should return a Failure of the error for a caught error", () => {
      const testError = new Error("Test error");
      const testFn = () => {
        throw testError;
      };

      const expectedResult = failure(testError);
      const actualResult = Validation.attempt(testFn);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return a Success of the value for a normal execution", () => {
      const testFn = () => testValue;
      const expectedResult = success(testValue);
      const actualResult = Validation.attempt(testFn);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".chain", () => {
    it("should match instance result", () => {
      const testSuccess = success(testValue);
      const testChain = value => success(!value);
      const expectedResult = testSuccess.chain(testChain);
      const actualResult = Validation.chain(testChain)(testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".checkedBimap", () => {
    it("should match instance result", () => {
      const testSuccess = success(testValue);
      const testFailureFold = F.noop;
      const testCheckedMap = () => {
        throw new Error();
      };

      const expectedResult = testSuccess.checkedBimap(testFailureFold, testCheckedMap);
      const actualResult = Validation.checkedBimap(testFailureFold, testCheckedMap)(testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".coalesce", () => {
    it("should alias Validation.alt", () => {
      expect(Validation.coalesce).to.equal(Validation.alt);
    });
  });

  describe(".concat", () => {
    it("should match instance result", () => {
      const testFailure1 = failure(`${testMessage}1`);
      const testFailure2 = failure(`${testMessage}2`);
      const expectedResult = testFailure1.concat(testFailure2);
      const actualResult = Validation.concat(testFailure2)(testFailure1);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".each", () => {
    const testCollection = [
      failure(testMessage),
      success(testValue)
    ];

    describe("early terminate", () => {
      it("should iterate over each item in the collection until Failure is returned", () => {
        let testCount = 0;
        const expectedCount = 1;

        Validation.each(item => {
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

        Validation.each(() => testCount += 1, testCollection);

        expect(testCount).to.equal(expectedCount);
      });
    });
  });

  describe(".equals", () => {
    it("should return true for same values but same types", () =>
      expect(Validation.equals(success(testValue), success(testValue))).to.be.true
    );

    it("should return false for same values but different types", () =>
      expect(Validation.equals(failure(testValue), success(testValue))).to.be.false
    );
  });

  describe(".failures", () => {
    it("should return empty list for null list", () => {
      const testList = null;
      const expectedResult = [];
      const actualResult = Validation.failures(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for empty list", () => {
      const testList = [];
      const expectedResult = [];
      const actualResult = Validation.failures(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for Success list", () => {
      const testList = [success(!testValue), success(testValue)];
      const expectedResult = [];
      const actualResult = Validation.failures(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return failures for mixed list", () => {
      const testMessage1 = `${testMessage} 1`;
      const testMessage2 = `${testMessage} 2`;
      const testList = [failure(testMessage1), success(testValue), failure(testMessage2)];
      const expectedResult = [testMessage1, testMessage2];
      const actualResult = Validation.failures(testList);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".filter", () => {
    it("should match instance result", () => {
      const testSuccess = success(testValue);
      const testFilter = F.constant(false);
      const testError = new Error(testMessage);
      const expectedResult = testSuccess.filter(testFilter, testError);
      const actualResult = Validation.filter(testFilter, testError)(testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".flatMap", () => {
    it("should alias Validation.chain", () => {
      expect(Validation.flatMap).to.equal(Validation.chain);
    });
  });

  describe(".fmap", () => {
    it("should match instance result", () => {
      const testSuccess = success(testValue);
      const testFmap = value => !value;
      const expectedResult = testSuccess.fmap(testFmap);
      const actualResult = Validation.fmap(testFmap)(testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".foldl", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testFailure = failure(testMessage);
      const testFailureFold = (value, defaultValue) => defaultValue;
      const expectedResult = testFailure.foldl(testFailureFold, testDefaultValue);
      const actualResult = Validation.foldl(testFailureFold, testDefaultValue)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".foldr", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testFailure = failure(testMessage);
      const testFailureFold = defaultValue => defaultValue;
      const expectedResult = testFailure.foldr(testFailureFold, testDefaultValue);
      const actualResult = Validation.foldr(testFailureFold, testDefaultValue)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".from", () => {
    const testSuccess = success(testValue);
    const testFailure = failure(testMessage);
    const testParams = [
      {
        testValue: testSuccess,
        expectedResult: testSuccess
      },
      {
        testValue: testFailure,
        expectedResult: testFailure
      },
      {
        testValue: undefined,
        expectedResult: failure(new Error("Validation.ofNullable: value is null or undefined"))
      },
      {
        testValue: null,
        expectedResult: failure(new Error("Validation.ofNullable: value is null or undefined"))
      },
      {
        testValue: true,
        expectedResult: success(true)
      }
    ];

    each(
      testParam => it(
        `should return an Validation for '${testParam.testValue}'`,
        () => expect(Validation.from(testParam.testValue)).to.eql(testParam.expectedResult)
      ),
      testParams
    );
  });

  describe(".fromFailure", () => {
    it("should return the underlying value for Failure", () => {
      const testFailure = failure(testMessage);
      const actualResult = Validation.fromFailure(testFailure);

      expect(actualResult).to.eql([testMessage]);
    });

    it("should throw an error for Success", () => {
      const testSuccess = success(testValue);
      const testFn = () => Validation.fromFailure(testSuccess);

      expect(testFn).to.throw("Validation.fromFailure: instance of validation must be a Failure");
    });

    it("should throw an error for non-Validation", () => {
      const testFn = () => Validation.fromFailure(testValue);

      expect(testFn).to.throw("Validation.fromFailure: instance of validation must be a Failure");
    });
  });

  describe(".fromSuccess", () => {
    it("should return the underlying value for Success", () => {
      const testSuccess = success(testValue);
      const actualResult = Validation.fromSuccess(testSuccess);

      expect(actualResult).to.eql(testValue);
    });

    it("should throw an error for Failure", () => {
      const testFailure = failure(testMessage);
      const testFn = () => Validation.fromSuccess(testFailure);

      expect(testFn).to.throw("Validation.fromSuccess: instance of validation must be a Success");
    });

    it("should throw an error for non-Validation", () => {
      const testFn = () => Validation.fromSuccess(testValue);

      expect(testFn).to.throw("Validation.fromSuccess: instance of validation must be a Success");
    });
  });

  describe(".getOrElse", () => {
    it("should match instance result", () => {
      const testFailure = failure(testMessage);
      const expectedResult = testFailure.getOrElse(!testValue);
      const actualResult = Validation.getOrElse(!testValue)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".getOrElseGet", () => {
    it("should match instance result", () => {
      const testFailure = failure(testMessage);
      const testSupplier = () => !testValue;
      const expectedResult = testFailure.getOrElseGet(testSupplier);
      const actualResult = Validation.getOrElseGet(testSupplier)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".ifFailure", () => {
    const testFailure = failure(testMessage);
    const testFailureConsumer = sinon.spy(F.noop);
    let actualResult = null;

    before(() => actualResult = Validation.ifFailure(testFailureConsumer)(testFailure));

    it("should return the instance", () => expect(actualResult).to.equal(testFailure));
    it("should call the provided ifFailure consumer",
      () => expect(testFailureConsumer).to.be.calledWith([testMessage])
    );
  });

  describe(".ifSuccess", () => {
    const testSuccess = success(testValue);
    const testSuccessConsumer = sinon.spy(F.noop);
    let actualResult = null;

    before(() => actualResult = Validation.ifSuccess(testSuccessConsumer)(testSuccess));

    it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
    it("should call the provided ifSuccess consumer", () => expect(testSuccessConsumer).to.be.calledWith(testValue));
  });

  describe(".isValidation", () => {
    it("should return true for a Failure", () => expect(Validation.isValidation(failure(testMessage))).to.be.true);
    it("should return false for a Success", () => expect(Validation.isValidation(success(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Validation.isValidation(testValue)).to.be.false);
  });

  describe(".isFailure", () => {
    it("should return true for a Failure", () => expect(Validation.isFailure(failure(testMessage))).to.be.true);
    it("should return false for a Success", () => expect(Validation.isFailure(success(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Validation.isFailure(testValue)).to.be.false);
  });

  describe(".isNotValidation", () => {
    it("should return true for a Failure", () => expect(Validation.isNotValidation(failure(testMessage))).to.be.false);
    it("should return false for a Success", () => expect(Validation.isNotValidation(success(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Validation.isNotValidation(testValue)).to.be.true);
  });

  describe(".isNotFailure", () => {
    it("should return true for a Failure", () => expect(Validation.isNotFailure(failure(testMessage))).to.be.false);
    it("should return false for a Success", () => expect(Validation.isNotFailure(success(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Validation.isNotFailure(testValue)).to.be.true);
  });

  describe(".isNotSuccess", () => {
    it("should return false for a Failure", () => expect(Validation.isNotSuccess(failure(testMessage))).to.be.true);
    it("should return true for a Success", () => expect(Validation.isNotSuccess(success(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Validation.isNotSuccess(testValue)).to.be.true);
  });

  describe(".isSuccess", () => {
    it("should return false for a Failure", () => expect(Validation.isSuccess(failure(testMessage))).to.be.false);
    it("should return true for a Success", () => expect(Validation.isSuccess(success(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Validation.isSuccess(testValue)).to.be.false);
  });

  describe(".lift", () => {
    it("should return an empty list for null list", () => {
      const testCollection = null;
      const expectedResult = [];
      const actualResult = Validation.lift(value => !value, testCollection);

      expect(actualResult).to.be.eql(expectedResult);
    });

    it("should map each value in the collection", () => {
      const testCollection = [failure(testMessage), success(testValue)];
      const expectedResult = [failure(testMessage), success(!testValue)];
      const actualResult = Validation.lift(value => !value, testCollection);

      expect(actualResult).to.be.eql(expectedResult);
    });
  });

  describe(".map", () => {
    it("should alias Validation.fmap", () => {
      expect(Validation.map).to.equal(Validation.fmap);
    });
  });

  describe(".of", () => {
    it("should alias Validation.pure", () => expect(Validation.of).to.equal(Validation.pure));
  });

  describe(".ofNullable", () => {
    const testNullableValues = [undefined, null];
    const testValues = [0, false, true, "", [], {}];
    const expectedFailure = failure(new Error("Validation.ofNullable: value is null or undefined"));

    each(
      testValue => it(
        `should return an instance of Nullable for '${testValue}'`,
        () => expect(Validation.ofNullable(testValue)).to.eql(expectedFailure)
      ),
      testNullableValues
    );

    each(
      testValue => it(
        `should return an instance of Just for '${testValue}'`,
        () => expect(Validation.ofNullable(testValue)).to.eql(success(testValue))
      ),
      testValues
    );
  });

  describe(".recover", () => {
    it("should match instance result", () => {
      const testFailure = failure(testMessage);
      const expectedResult = testFailure.recover(testValue);
      const actualResult = Validation.recover(testValue)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".reduce", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testFailure = failure(testMessage);
      const testLeftFold = (value, defaultValue) => defaultValue;
      const expectedResult = testFailure.reduce(testLeftFold, testDefaultValue);
      const actualResult = Validation.reduce(testLeftFold, testDefaultValue)(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".success", () => {
    it("should return an instance of Success", () => expect(Validation.success().isSuccess()).to.be.true);
  });

  describe(".successs", () => {
    it("should return empty list for null list", () => {
      const testList = null;
      const expectedResult = [];
      const actualResult = Validation.successs(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for empty list", () => {
      const testList = [];
      const expectedResult = [];
      const actualResult = Validation.successs(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return empty list for Failure list", () => {
      const testList = [failure(testMessage), failure(testMessage)];
      const expectedResult = [];
      const actualResult = Validation.successs(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return successs for mixed list", () => {
      const testList = [failure(testMessage), success(testValue), failure(testMessage)];
      const expectedResult = [testValue];
      const actualResult = Validation.successs(testList);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".tap", () => {
    const testSuccess = success(testValue);
    const testFailureConsumer = sinon.spy(F.noop);
    const testSuccessConsumer = sinon.spy(F.identity);
    let actualResult = null;

    before(() => actualResult = Validation.tap(testFailureConsumer, testSuccessConsumer)(testSuccess));

    it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
    it("should not call the provided failure consumer", () => expect(testFailureConsumer).to.not.be.called);
    it("should call the provided success consumer", () => expect(testSuccessConsumer).to.be.calledWith(testValue));
  });

  describe(".toArray", () => {
    it("should match instance result", () => {
      const testFailure = failure(testMessage);
      const expectedResult = testFailure.toArray();
      const actualResult = Validation.toArray(testFailure);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toEither", () => {
    const testEitherImplementation = Either;

    it("should convert the Failure to a Nothing", () => {
      const testFailure = failure(testMessage);
      const expectedResult = Either.left([testMessage]);
      const actualResult = Validation.toEither(testEitherImplementation, testFailure);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should convert the Success to a Just", () => {
      const testSuccess = success(testValue);
      const expectedResult = Either.right(testValue);
      const actualResult = Validation.toEither(testEitherImplementation, testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toMaybe", () => {
    const testMaybeImplementation = Maybe;

    it("should convert the Failure to a Nothing", () => {
      const testFailure = failure(testMessage);
      const expectedResult = Maybe.nothing();
      const actualResult = Validation.toMaybe(testMaybeImplementation, testFailure);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should convert the Success to a Just", () => {
      const testSuccess = success(testValue);
      const expectedResult = Maybe.just(testValue);
      const actualResult = Validation.toMaybe(testMaybeImplementation, testSuccess);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toPromise", () => {
    const testFailure = failure(testMessage);
    const testSuccess = success(testValue);
    const testPromiseImplementation = Promise;

    it("should reject with the value of a Failure", () =>
      expect(Validation.toPromise(testPromiseImplementation, testFailure)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Success", () =>
      expect(Validation.toPromise(testPromiseImplementation, testSuccess)).to.eventually.equal(testValue)
    );
  });

  describe(".validate", () => {
    it("should return mapped Failure value for Failure", () => {
      const testFailure = failure(testMessage);
      const expectedResult = F.toUpper(testMessage);
      const actualResult = Validation.validate(F.toUpper, F.toLower, testFailure);

      expect(actualResult).to.equal(expectedResult);
    });

    it("should return mapped Success value for Success", () => {
      const testSuccess = success(testMessage);
      const expectedResult = F.toLower(testMessage);
      const actualResult = Validation.validate(F.toUpper, F.toLower, testSuccess);

      expect(actualResult).to.equal(expectedResult);
    });
  });

  describe("Failure", () => {
    describe("constructor", () => {
      it("should return a new instance of Failure", () => expect(failure(testMessage).isFailure()).to.be.true);
    });

    describe("#alt", () => {
      it("should return the Success alternative", () => {
        const testFailure = failure(testMessage);
        const testAlt = success(testValue);
        const actualResult = testFailure.alt(testAlt);

        expect(actualResult).to.equal(testAlt);
      });

      it("should return the Success alternative supplier", () => {
        const testFailure = failure(testMessage);
        const testAlt = F.constant(success(testValue));
        const expectedResult = success(testValue);
        const actualResult = testFailure.alt(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should throw an error for a non-Validation", () => {
        const testFailure = failure(testMessage);
        const testAlt = testValue;
        const testFn = () => testFailure.alt(testAlt);

        expect(testFn).to.throw("Validation#alt: the provided other value must return an instance of Validation");
      });
    });

    describe("#ap", () => {
      const testFailure = failure(testMessage);
      const testApplyFunction = sinon.spy(F.constant(true));
      const testApply = success(testApplyFunction);
      let actualResult = null;

      before(() => actualResult = testFailure.ap(testApply));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided apply morphism", () => expect(testApplyFunction).to.not.be.called);
    });

    describe("#bimap", () => {
      const testFailure = failure(testMessage);
      const testFailureMap = sinon.spy(values => `${F.head(values)} bimapped`);
      const testSuccessMap = sinon.spy(value => !value);
      const expectedResult = failure(`${testMessage} bimapped`);
      let actualResult = null;

      before(() => actualResult = testFailure.bimap(testFailureMap)(testSuccessMap));

      it("should call the failure bimap method", () => expect(testFailureMap).to.be.calledWith([testMessage]));
      it("should not call the success bimap method", () => expect(testSuccessMap).to.not.be.called);
      it("should return a Failure of the mapped value", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("#chain", () => {
      const testFailure = failure(testMessage);
      const testChain = sinon.spy(F.constant(true));
      let actualResult = null;

      before(() => actualResult = testFailure.chain(testChain));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided chain method", () => expect(testChain).to.not.be.called);
    });

    describe("#checkedBimap", () => {
      const testFailure = failure(testMessage);
      const testError = new Error(`${testMessage} thrown`);
      const testFailureFold = sinon.spy(
        (failureValues, thrownError) => failureValues ? `${F.head(failureValues)} folded` : thrownError.message
      );
      const testCheckedMap = sinon.spy(function() {
        throw testError;
      });
      const expectedResult = failure(`${testMessage} folded`);
      let actualResult = null;

      before(() => actualResult = testFailure.checkedBimap(testFailureFold)(testCheckedMap));

      it("should return Failure of value", () => expect(actualResult).to.eql(expectedResult));
      it("should call the provided failure fold", () => expect(testFailureFold).to.be.calledWith([testMessage]));
      it("should not call the provided morphism", () => expect(testCheckedMap).to.not.be.called);
    });

    describe("#coalesce", () => {
      it("should alias Validation#alt", () => {
        const testFailure = failure(testMessage);
        const testAlt = success(!testValue);
        const expectedResult = testFailure.alt(testAlt);
        const actualResult = testFailure.coalesce(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#concat", () => {
      describe("Failure with Failure", () => {
        const testFailure1 = failure(`${testMessage}1`);
        const testFailure2 = failure(`${testMessage}2`);
        let actualResult = null;

        before(() => actualResult = testFailure1.concat(testFailure2));

        it("should return a new instance", () =>
          expect(actualResult).to.not.equal(testFailure1).and.not.equal(testFailure2)
        );

        it("should concatenate the two messages", () => {
          const expectedResult = failure([`${testMessage}1`, `${testMessage}2`]);

          expect(actualResult).to.eql(expectedResult);
        });
      });

      describe("Failure with Success", () => {
        it("should return the failure instance", () => {
          const testSuccess = success(testValue);
          const testFailure = failure(testMessage);
          const actualResult = testFailure.concat(testSuccess);

          expect(actualResult).to.equal(testFailure);
        });
      });
    });

    describe("#equals", () => {
      it("should return true for instances with the same value", () => {
        const testValidation1 = failure(testMessage);
        const testValidation2 = failure(testMessage);

        expect(testValidation1.equals(testValidation2)).to.be.true;
      });

      it("should return false for differing instances", () => {
        const testValidation1 = failure(testMessage);
        const testValidation2 = success(testValue);

        expect(testValidation1.equals(testValidation2)).to.be.false;
      });
    });

    describe("#filter", () => {
      const testFailure = failure(testMessage);
      const testFilter = sinon.spy(() => false);
      const testFilterValue = `${testMessage} filtered`;
      let actualResult = null;

      before(() => actualResult = testFailure.filter(testFilter)(testFilterValue));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided filter", () => expect(testFilter).to.not.be.called);
    });

    describe("#first", () => {
      it("should return a Failure of the mapped value", () => {
        const testFailure = failure(testMessage);
        const testFailureMap = value => `${value} mapped`;
        const expectedResult = failure(`${testMessage} mapped`);
        const actualResult = testFailure.first(testFailureMap);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#flatMap", () => {
      it("should alias Validation#chain", () => {
        const testFailure = failure(testMessage);
        const testChain = value => success(!value);
        const expectedResult = testFailure.chain(testChain);
        const actualResult = testFailure.flatMap(testChain);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#fmap", () => {
      const testFailure = failure(testMessage);
      const testMap = sinon.spy(F.constant(true));
      let actualResult = null;

      before(() => actualResult = testFailure.fmap(testMap));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided fmap morphism", () => expect(testMap).to.not.be.called);
    });

    describe("#foldl", () => {
      it("should return the default value", () => {
        const testFailure = failure(testMessage);
        const testDefaultValue = !testValue;
        const testFailureFold = (value, defaultValue) => defaultValue;
        const actualResult = testFailure.foldl(testFailureFold)(testDefaultValue);

        expect(actualResult).to.eql(testDefaultValue);
      });
    });

    describe("#foldr", () => {
      it("should return the default value", () => {
        const testFailure = failure(testMessage);
        const testDefaultValue = !testValue;
        const testSuccessFold = F.identity;
        const actualResult = testFailure.foldr(testSuccessFold)(testDefaultValue);

        expect(actualResult).to.eql(testDefaultValue);
      });
    });

    describe("#getOrElse", () => {
      it("should return other value", () => {
        const testFailure = failure(testMessage);

        expect(testFailure.getOrElse(testValue)).to.equal(testValue);
      });
    });

    describe("#getOrElseGet", () => {
      it("should return other supplied value", () => {
        const testFailure = failure(testMessage);
        const testOtherValueSupplier = () => testValue;

        expect(testFailure.getOrElseGet(testOtherValueSupplier)).to.equal(testValue);
      });
    });

    describe("#getOrElseThrow", () => {
      it("should throw an error", () => {
        const testErrorFunction = message => new Error(message);
        const testFn = () => failure(testMessage).getOrElseThrow(testErrorFunction);

        expect(testFn).to.throw(testMessage);
      });
    });

    describe("#ifFailure", () => {
      const testFailure = failure(testMessage);
      const testIfFailure = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testFailure.ifFailure(testIfFailure));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should call the provided ifFailure method", () => expect(testIfFailure).to.be.calledWith([testMessage]));
    });

    describe("#ifSuccess", () => {
      const testFailure = failure(testMessage);
      const testIfSuccess = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testFailure.ifSuccess(testIfSuccess));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided ifSuccess method", () => expect(testIfSuccess).to.not.be.called);
    });

    describe("#isFailure", () => {
      it("should return true", () => expect(failure(testMessage).isFailure()).to.be.true);
    });

    describe("#isSuccess", () => {
      it("should return false", () => expect(failure(testMessage).isSuccess()).to.be.false);
    });

    describe("#failureMap", () => {
      it("should alias Failure#first", () => {
        const testFailure = failure(testMessage);
        const testFailureMap = value => `${value} mapped`;
        const expectedResult = testFailure.first(testFailureMap);
        const actualResult = testFailure.failureMap(testFailureMap);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#length", () => {
      it("should return a length of zero (0)", () => {
        const testFailure = failure(testMessage);
        const expectedResult = 0;
        const actualResult = testFailure.length();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#map", () => {
      it("should alias Validation#fmap", () => {
        const testFailure = failure(testMessage);
        const testMap = value => !value;
        const expectedResult = testFailure.fmap(testMap);
        const actualResult = testFailure.map(testMap);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#of", () => {
      it("should return an instance of Success", () => {
        const testFailure = failure(testMessage);
        const expectedResult = success(testValue);
        const actualResult = testFailure.of(testValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#recover", () => {
      it("should return a Just of the recover value", () => {
        const testFailure = failure(testMessage);
        const expectedResult = success(testValue);
        const actualResult = testFailure.recover(testValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#reduce", () => {
      it("should alias Validation#foldl", () => {
        const testFailure = failure(testMessage);
        const testDefaultValue = !testValue;
        const testSuccessFold = defaultValue => defaultValue;
        const expectedResult = testFailure.foldl(testSuccessFold, testDefaultValue);
        const actualResult = testFailure.reduce(testSuccessFold)(testDefaultValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#successMap", () => {
      it("should alias Failure#second", () => {
        const testFailure = failure(testMessage);
        const testSuccessMap = value => !value;
        const expectedResult = testFailure.second(testSuccessMap);
        const actualResult = testFailure.successMap(testSuccessMap);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#second", () => {
      it("should return the instance", () => {
        const testFailure = failure(testMessage);
        const testSuccessMap = value => !value;
        const actualResult = testFailure.second(testSuccessMap);

        expect(actualResult).to.eql(testFailure);
      });
    });

    describe("#tap", () => {
      const testFailure = failure(testMessage);
      const testFailureConsumer = sinon.spy(F.identity);
      const testSuccessConsumer = sinon.spy(F.identity);
      let actualResult = null;

      before(() => actualResult = testFailure.tap(testFailureConsumer)(testSuccessConsumer));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should call the provided failure consumer",
        () => expect(testFailureConsumer).to.be.calledWith([testMessage])
      );
      it("should not call the provided success consumer", () => expect(testSuccessConsumer).to.not.be.called);
    });

    describe("#toArray", () => {
      it("should return an empty array", () => {
        const testFailure = failure(testMessage);
        const expectedResult = [];
        const actualResult = testFailure.toArray();

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toEither", () => {
      it("should return a Either instance", () => {
        const testFailure = failure(testMessage);
        const testEitherImplementation = Either;
        const expectedResult = Either.left([testMessage]);
        const actualResult = testFailure.toEither(testEitherImplementation);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#toMaybe", () => {
      it("should return a Maybe instance", () => {
        const testFailure = failure(testMessage);
        const testMaybeImplementation = Maybe;
        const expectedResult = Maybe.nothing();
        const actualResult = testFailure.toMaybe(testMaybeImplementation);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#toPromise", () => {
      it("should have rejected the value", () => {
        const testFailure = failure(testMessage);
        const testPromiseImplementation = Promise;
        const actualResult = testFailure.toPromise(testPromiseImplementation);

        expect(actualResult).to.be.rejectedWith(testMessage);
      });
    });

    describe("#toString", () => {
      it("should return a string containing the type and the values", () => {
        const testFailure = failure(testMessage);
        const expectedResult = `Failure(${testMessage})`;
        const actualResult = testFailure.toString();

        expect(actualResult).to.equal(expectedResult);
      });
    });
  });

  describe("Success", () => {
    describe("constructor", () => {
      it("should return a new instance of Success", () => expect(success(testValue).isSuccess()).to.be.true);
    });

    describe("#alt", () => {
      it("should return the instance", () => {
        const testSuccess = success(testValue);
        const testAlt = success(!testValue);
        const actualResult = testSuccess.alt(testAlt);

        expect(actualResult).to.equal(testSuccess);
      });
    });

    describe("#ap", () => {
      describe("with Failure", () => {
        it("should return Failure", () => {
          const testSuccess = success(testValue);
          const testApply = failure(testMessage);
          const actualResult = testSuccess.ap(testApply);

          expect(actualResult).to.equal(testApply);
        });
      });

      describe("with Success", () => {
        const testSuccess = success(testValue);
        const testApplyFunction = sinon.spy(value => !value);
        const testApply = success(testApplyFunction);
        const expectedResult = success(!testValue);
        let actualResult = null;

        before(() => actualResult = testSuccess.ap(testApply));

        it("should not call the provided apply morphism", () => expect(testApplyFunction).to.be.calledWith(testValue));
        it("should apply morphism", () => expect(actualResult).to.eql(expectedResult));
      });
    });

    describe("#bimap", () => {
      const testSuccess = success(testValue);
      const testFailureMap = sinon.spy(value => `${value} bimapped`);
      const testSuccessMap = sinon.spy(value => !value);
      const expectedResult = success(!testValue);
      let actualResult = null;

      before(() => actualResult = testSuccess.bimap(testFailureMap)(testSuccessMap));

      it("should not call the failure bimap method", () => expect(testFailureMap).to.not.be.called);
      it("should call the success bimap method", () => expect(testSuccessMap).to.be.calledWith(testValue));
      it("should return a success of the mapped value", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("#chain", () => {
      const testSuccess = success(testValue);

      describe("Failure result", () => {
        const testChain = sinon.spy(() => failure(testMessage));
        const expectedResult = failure(testMessage);
        let actualResult = null;

        before(() => actualResult = testSuccess.chain(testChain));

        it("should return the Failure instance", () => expect(actualResult).to.be.eql(expectedResult));
      });

      describe("Success wrapped result", () => {
        const testChain = sinon.spy(value => success(!value));
        const expectedResult = success(!testValue);
        let actualResultJust = null;

        before(() => actualResultJust = testSuccess.chain(testChain));

        it("should return the Success instance", () => expect(actualResultJust).to.be.eql(expectedResult));
      });

      describe("unwrapped result", () => {
        it("should throw an error", () => {
          const testFunction = sinon.spy(value => !value);
          const testFn = () => testSuccess.chain(testFunction);

          expect(testFn).to.throw();
        });
      });
    });

    describe("#checkedBimap", () => {
      const testSuccess = success(testValue);
      const testError = new Error(`${testMessage} thrown`);

      describe("morphism", () => {
        const testFailureFold = sinon.spy(
          (failureValue, thrownError) => failureValue ? `${failureValue} folded` : thrownError.message
        );
        const testCheckedMap = sinon.spy(value => !value);
        const expectedResult = success(!testValue);
        let actualResult = null;

        before(() => actualResult = testSuccess.checkedBimap(testFailureFold)(testCheckedMap));

        it("should return Success of value", () => expect(actualResult).to.eql(expectedResult));
        it("should not call the provided failure fold", () => expect(testFailureFold).to.not.be.called);
        it("should call the provided morphism", () => expect(testCheckedMap).to.be.calledWith(testValue));
      });

      describe("throwing morphism", () => {
        const testFailureFold = sinon.spy(
          (failureValue, thrownError) => failureValue ? `${failureValue} folded` : thrownError.message
        );
        const testCheckedMap = sinon.spy(function() {
          throw testError;
        });
        const expectedResult = failure(`${testMessage} thrown`);
        let actualResult = null;

        before(() => actualResult = testSuccess.checkedBimap(testFailureFold)(testCheckedMap));

        it("should return Failure of value", () => expect(actualResult).to.eql(expectedResult));
        it("should call the provided failure fold", () => expect(testFailureFold).to.be.calledWith(null, testError));
        it("should not call the provided morphism", () => expect(testCheckedMap).to.be.calledWith(testValue));
      });
    });

    describe("#coalesce", () => {
      it("should alias Validation#alt", () => {
        const testSuccess = success(testValue);
        const testAlt = success(!testValue);
        const expectedResult = testSuccess.alt(testAlt);
        const actualResult = testSuccess.coalesce(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#concat", () => {
      describe("Success with Success", () => {
        it("should return the instance", () => {
          const testSuccess1 = success(testValue);
          const testSuccess2 = success(!testValue);
          const actualResult = testSuccess1.concat(testSuccess2);

          expect(actualResult).to.equal(testSuccess1);
        });
      });

      describe("Success with Failure", () => {
        it("should return the failure instance", () => {
          const testSuccess = success(testValue);
          const testFailure = failure(testMessage);
          const actualResult = testSuccess.concat(testFailure);

          expect(actualResult).to.equal(testFailure);
        });
      });
    });

    describe("#equals", () => {
      const testSuccess1 = success(testValue);
      const testSuccess2 = success(testValue);
      const testSuccess3 = success(!testValue);

      it("should return true for instances with the same value", () =>
        expect(testSuccess1.equals(testSuccess2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testSuccess1.equals(testSuccess3)).to.be.false
      );
    });

    describe("#filter", () => {
      const testSuccess = success(testValue);
      const testFilterValue = `${testMessage} filtered`;

      it("should return Failure of value for false predicate", () => {
        const testPredicate = F.constant(false);
        const expectedResult = failure(testFilterValue);
        const actualResult = testSuccess.filter(testPredicate)(testFilterValue);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should return Failure of supplier value for false predicate", () => {
        const testPredicate = F.constant(false);
        const expectedResult = failure(testFilterValue);
        const actualResult = testSuccess.filter(testPredicate)(F.constant(testFilterValue));

        expect(actualResult).to.eql(expectedResult);
      });

      it("should return Success for true predicate", () => {
        const testPredicate = F.constant(true);
        const actualResult = testSuccess.filter(testPredicate)(testFilterValue);

        expect(actualResult).to.equal(testSuccess);
      });
    });

    describe("#flatMap", () => {
      it("should alias Validation#chain", () => {
        const testSuccess = success(testValue);
        const testChain = value => success(!value);
        const expectedResult = testSuccess.chain(testChain);
        const actualResult = testSuccess.flatMap(testChain);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#fmap", () => {
      const testSuccess = success(testValue);
      const testMap = sinon.spy(() => !true);
      const expectedResult = success(!testValue);
      let actualResult = null;

      before(() => actualResult = testSuccess.fmap(testMap));

      it("should return a Success of value", () => expect(actualResult).to.eql(expectedResult));
      it("should call the provided morphism", () => expect(testMap).to.be.calledWith(testValue));
    });

    describe("#foldl", () => {
      it("should return the default value", () => {
        const testSuccess = success(testValue);
        const testDefaultValue = !testValue;
        const testFailureFold = (value, defaultValue) => defaultValue;
        const actualResult = testSuccess.foldl(testFailureFold)(testDefaultValue);

        expect(actualResult).to.eql(testValue);
      });
    });

    describe("#foldr", () => {
      it("should return the default value", () => {
        const testSuccess = success(testValue);
        const testDefaultValue = !testValue;
        const testSuccessFold = defaultValue => defaultValue;
        const actualResult = testSuccess.foldr(testSuccessFold)(testDefaultValue);

        expect(actualResult).to.eql(testValue);
      });
    });

    describe("#getOrElse", () => {
      it("should return other value", () => {
        const testSuccess = success(testValue);
        const testOtherValue = !testValue;

        expect(testSuccess.getOrElse(testOtherValue)).to.equal(testValue);
      });
    });

    describe("#getOrElseGet", () => {
      it("should return other supplied value", () => {
        const testSuccess = success(testValue);
        const testOtherValueSupplier = F.constant(!testValue);

        expect(testSuccess.getOrElseGet(testOtherValueSupplier)).to.equal(testValue);
      });
    });

    describe("#getOrElseThrow", () => {
      it("should return the value", () => {
        const testSuccess = success(testValue);
        const testErrorSupplier = F.constant(new Error());

        expect(testSuccess.getOrElseThrow(testErrorSupplier)).to.equal(testValue);
      });
    });

    describe("#ifFailure", () => {
      const testSuccess = success(testValue);
      const testIfFailure = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testSuccess.ifFailure(testIfFailure));

      it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
      it("should not call the provided ifFailure method", () => expect(testIfFailure).to.not.be.called);
    });

    describe("#ifSuccess", () => {
      const testSuccess = success(testValue);
      const testIfSuccess = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testSuccess.ifSuccess(testIfSuccess));

      it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
      it("should call the provided ifSuccess method", () => expect(testIfSuccess).to.be.calledWith(testValue));
    });

    describe("#isFailure", () => {
      it("should return false", () => expect(success(testValue).isFailure()).to.be.false);
    });

    describe("#isSuccess", () => {
      it("should return true", () => expect(success(testValue).isSuccess()).to.be.true);
    });

    describe("#length", () => {
      it("should return a length of one (1)", () => {
        const testSuccess = success(testValue);
        const expectedResult = 1;
        const actualResult = testSuccess.length();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#map", () => {
      it("should alias Validation#fmap", () => {
        const testSuccess = success(testValue);
        const testMap = value => !value;
        const expectedResult = testSuccess.fmap(testMap);
        const actualResult = testSuccess.map(testMap);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#of", () => {
      it("should return an instance of Success of the value", () => {
        const testSuccess = success(testValue);
        const expectedResult = success(!testValue);
        const actualResult = testSuccess.of(!testValue);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#recover", () => {
      it("should return the instance", () => {
        const testSuccess = success(testValue);
        const actualResult = testSuccess.recover(!testValue);

        expect(actualResult).to.equal(testSuccess);
      });
    });

    describe("#reduce", () => {
      it("should alias Validation#foldl", () => {
        const testSuccess = success(testValue);
        const testDefaultValue = !testValue;
        const testSuccessFold = defaultValue => defaultValue;
        const expectedResult = testSuccess.foldl(testSuccessFold, testDefaultValue);
        const actualResult = testSuccess.reduce(testSuccessFold, testDefaultValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#tap", () => {
      const testSuccess = success(testValue);
      const testFailureConsumer = sinon.spy(F.noop);
      const testSuccessConsumer = sinon.spy(F.identity);
      let actualResult = null;

      before(() => actualResult = testSuccess.tap(testFailureConsumer, testSuccessConsumer));

      it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
      it("should not call the provided failure consumer", () => expect(testFailureConsumer).to.not.be.called);
      it("should call the provided success consumer", () => expect(testSuccessConsumer).to.be.calledWith(testValue));
    });

    describe("#toArray", () => {
      it("should return an array of the value", () => {
        const testSuccess = success(testValue);
        const expectedResult = [testValue];
        const actualResult = testSuccess.toArray();

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toEither", () => {
      it("should return an Either instance", () => {
        const testSuccess = success(testValue);
        const testEitherImplementation = Either;
        const expectedResult = Either.right(testValue);

        expect(testSuccess.toEither(testEitherImplementation)).to.be.eql(expectedResult);
      });
    });

    describe("#toMaybe", () => {
      it("should return a Maybe instance", () => {
        const testSuccess = success(testValue);
        const testMaybeImplementation = Maybe;
        const expectedResult = Maybe.just(testValue);

        expect(testSuccess.toMaybe(testMaybeImplementation)).to.be.eql(expectedResult);
      });
    });

    describe("#toPromise", () => {
      it("should have resolved the value", () => {
        const testSuccess = success(testValue);
        const testPromiseImplementation = Promise;
        const actualResult = testSuccess.toPromise(testPromiseImplementation);

        expect(actualResult).to.eventually.equal(testValue);
      });
    });

    describe("#toString", () => {
      it("should return a string containing the type and the values", () => {
        const testValues = [true, false];
        const testSuccess = success(testValues);
        const expectedResult = "Success(true,false)";
        const actualResult = testSuccess.toString();

        expect(actualResult).to.equal(expectedResult);
      });
    });
  });

  describe("Algebraic Laws", () => {
    Alt(Validation);
    Applicative(Validation);
    Apply(Validation);
    Chain(Validation);
    Foldable(Validation);
    Functor(Validation);
    Monad(Validation);
    Semigroup(Validation);
    Setoid(Validation);
  });
});
