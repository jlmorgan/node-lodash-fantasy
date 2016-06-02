"use strict";

// Third Party
const chai = require("chai");
const map = require("lodash/fp/map");
const promiseChai = require("chai-as-promised");
const include = require("include")(__dirname);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

// Third Party Setup
chai.use(promiseChai);
chai.use(sinonChai);
const expect = chai.expect;

// Project
const Apply = require("./laws/Apply")(expect);
const Applicative = require("./laws/Applicative")(expect);
const Chain = require("./laws/Chain")(expect);
const Extend = require("./laws/Extend")(expect);
const Monad = require("./laws/Monad")(expect);
const Functor = require("./laws/Functor")(expect);
const Monoid = require("./laws/Monoid")(expect);
const Semigroup = require("./laws/Semigroup")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Validation = include("data/Validation");

// Project Aliases
const Failure = Validation.Failure;
const Success = Validation.Success;

describe("Validation", () => {
  describe(".all", () => {
    describe("failure(s)", () => {
      const testMessage1 = "Test error 1";
      const testMessage2 = "Test error 2";
      const testValue = true;
      const testValidations = [Failure.from(testMessage1), Failure.from(testMessage2), Success.from(testValue)];
      const expectedValue = [testMessage1, testMessage2];
      let actualResult = null;

      before(() => actualResult = Validation.all(testValidations));

      it("should return an instance of Failure", () => expect(actualResult).to.be.instanceof(Failure));
      it("should return a singular failure of all values", () => expect(actualResult.value).to.eql(expectedValue));
    });

    describe("successes", () => {
      const testValue = true;
      const testValidations = [Success.from(testValue), Success.from(testValue)];
      const expectedValue = [testValue, testValue];
      let actualResult = null;

      before(() => actualResult = Validation.all(testValidations));

      it("should return an instance of Success", () => expect(actualResult).to.be.instanceof(Success));
      it("should return a singular validation of all values", () => expect(actualResult.value).to.eql(expectedValue));
    });
  });

  describe(".any", () => {
    describe("failures", () => {
      const testMessage1 = "Test error 1";
      const testMessage2 = "Test error 2";
      const testValidations = [Failure.from(testMessage1), Failure.from(testMessage2)];
      const expectedValue = [testMessage1, testMessage2];
      let actualResult = null;

      before(() => actualResult = Validation.any(testValidations));

      it("should return an instance of Failure", () => expect(actualResult).to.be.instanceof(Failure));
      it("should return a singular failure of all values", () => expect(actualResult.value).to.eql(expectedValue));
    });

    describe("success(es)", () => {
      const testValue1 = true;
      const testValue2 = false;
      const testMessage1 = "Test error 1";
      const testValidations = [Failure.from(testMessage1), Success.from(testValue1), Success.from(testValue2)];
      let actualResult = null;

      before(() => actualResult = Validation.any(testValidations));

      it("should return an instance of Success", () => expect(actualResult).to.be.instanceof(Success));
      it("should return the first successful validation", () => expect(actualResult.value).to.equal(testValue1));
    });
  });

  describe(".concat", () => {
    describe("Failure with Success", () => {
      const testMessage = "Test error";
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testFailure = new Failure(testMessage);
      const expectedValue = [testMessage];
      let actualResult = null;

      before(() => actualResult = Validation.concat(testFailure, testSuccess));

      it("should return the failure instance", () => expect(actualResult).to.equal(testFailure));
      it("should not change the value of the Failure", () => expect(actualResult.value).to.eql(expectedValue));
    });

    describe("Empty Failure with Failure", () => {
      const testMessage = "Test error";
      const testFailure1 = new Failure();
      const testFailure2 = new Failure(testMessage);
      let actualResult = null;

      before(() => actualResult = Validation.concat(testFailure1, testFailure2));

      it("should return a new instance", () =>
        expect(actualResult).to.not.equal(testFailure1).and.not.equal(testFailure2)
      );

      it("should concatenate the two messages", () => {
        const expectedValue = [testMessage];

        expect(actualResult.value).to.eql(expectedValue);
      });
    });

    describe("Failure with Failure", () => {
      const testMessage = "Test error";
      const testFailure1 = new Failure(`${testMessage}1`);
      const testFailure2 = new Failure(`${testMessage}2`);
      let actualResult = null;

      before(() => actualResult = Validation.concat(testFailure1, testFailure2));

      it("should return a new instance", () =>
        expect(actualResult).to.not.equal(testFailure1).and.not.equal(testFailure2)
      );

      it("should concatenate the two messages", () => {
        const expectedValue = [`${testMessage}1`, `${testMessage}2`];

        expect(actualResult.value).to.eql(expectedValue);
      });
    });

    describe("Empty Success with Success", () => {
      const testValue = true;
      const testSuccess1 = new Success();
      const testSuccess2 = new Success(testValue);
      let actualResult = null;

      before(() => actualResult = Validation.concat(testSuccess1, testSuccess2));

      it("should return the right success instance", () => expect(actualResult).to.equal(testSuccess2));
    });

    describe("Success with Success", () => {
      const testValue = true;
      const testSuccess1 = new Success(testValue);
      const testSuccess2 = new Success(!testValue);
      let actualResult = null;

      before(() => actualResult = Validation.concat(testSuccess1, testSuccess2));

      it("should return the left success instance", () => expect(actualResult).to.equal(testSuccess1));
      it("should not change the value of the left Success", () => expect(actualResult.value).to.eql(testValue));
    });

    describe("Success with Failure", () => {
      const testMessage = "Test error";
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testFailure = new Failure(testMessage);
      const expectedValue = [testMessage];
      let actualResult = null;

      before(() => actualResult = Validation.concat(testSuccess, testFailure));

      it("should return the failure instance", () => expect(actualResult).to.equal(testFailure));
      it("should not change the value of the Failure", () => expect(actualResult.value).to.eql(expectedValue));
    });
  });

  describe(".each", () => {
    const testMessage = "Test error";
    const testValue = false;
    const testCollection = [
      Failure.from(testMessage),
      Success.from(testValue)
    ];

    describe("early terminate", () => {
      it("should iterate over each item in the collection until Failure is returned", () => {
        let testCount = 0;
        const expectedCount = 1;

        Validation.each(validation => {
          testCount += 1;

          return validation;
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
    it("should return true for same values but same types", () => {
      const testValue = true;

      expect(Validation.equals(Success.from(testValue), Success.from(testValue))).to.be.true;
    });

    it("should return false for same values but different types", () => {
      const testValue = true;

      expect(Validation.equals(Failure.from(testValue), Success.from(testValue))).to.be.false;
    });
  });

  describe(".isFailure", () => {
    const testMessage = "Test error";
    const testValue = true;

    it("should return true for a Failure", () => expect(Validation.isFailure(Failure.from(testMessage))).to.be.true);
    it("should return false for a Success", () => expect(Validation.isFailure(Success.from(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Validation.isFailure(testValue)).to.be.false);
  });

  describe(".isSuccess", () => {
    const testMessage = "Test error";
    const testValue = true;

    it("should return false for a Failure", () => expect(Validation.isSuccess(Failure.from(testMessage))).to.be.false);
    it("should return true for a Success", () => expect(Validation.isSuccess(Success.from(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Validation.isSuccess(testValue)).to.be.false);
  });

  describe(".mapIn", () => {
    const testMessage = "Test error";
    const testValue = false;
    const testCollection = [
      Failure.from(testMessage),
      Success.from(testValue)
    ];
    let actualResult = null;

    before(() => actualResult = Validation.mapIn(value => !value, testCollection));

    it("should map each value in the collection", () => {
      const expectedResult = [[testMessage], !testValue];

      expect(map(testValidation => testValidation.value, actualResult)).to.be.eql(expectedResult);
    });
  });

  describe(".of", () => {
    const testValue = true;

    it("should return an instance of Success", () => expect(Validation.of(testValue)).to.be.instanceof(Success));
  });

  describe(".toPromise", () => {
    const testMessage = "Test error";
    const testValue = false;
    const testFailure = Failure.from(testMessage);
    const testSuccess = Success.from(testValue);

    it("should reject with the value of a Failure", () =>
      expect(Validation.toPromise(testFailure)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Success", () =>
      expect(Validation.toPromise(testSuccess)).to.eventually.equal(testValue)
    );
  });

  describe(".toPromiseWith", () => {
    const testMessage = "Test error";
    const testValue = false;
    const testFailure = Failure.from(testMessage);
    const testSuccess = Success.from(testValue);

    it("should reject with the value of a Failure", () =>
      expect(Validation.toPromiseWith(Promise, testFailure)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Success", () =>
      expect(Validation.toPromiseWith(Promise, testSuccess)).to.eventually.equal(testValue)
    );
  });

  describe(".try", () => {
    it("should return a Failure for a caught exception", () => {
      const testFn = () => {
        throw new Error("Test error");
      };

      expect(Validation.try(testFn)).to.be.instanceof(Failure);
    });

    it("should return a Success for a normal execution", () => {
      const testFn = () => true;

      expect(Validation.try(testFn)).to.be.instanceof(Success);
    });
  });

  describe("Failure", () => {
    const testMessage = "Test error";

    describe(".from", () => {
      describe("value", () => {
        const expectedResult = new Failure(testMessage);

        expect(Failure.from(testMessage)).to.eql(expectedResult);
      });

      describe("Failure", () => {
        const testFailure = new Failure(testMessage);

        expect(Failure.from(testFailure)).to.equal(testFailure);
      });

      describe("Success", () => {
        const testValue = true;
        const testSuccess = new Success(testValue);

        expect(Failure.from(testSuccess)).to.equal(testSuccess);
      });
    });

    describe("constructor", () => {
      it("should return a new instance of Failure", () => expect(new Failure(testMessage)).to.be.instanceof(Failure));
    });

    describe("#ap", () => {
      const testFailure = new Failure(testMessage);
      const testApplyValue = new Failure(`${testMessage}1`);
      let actualResult = null;

      before(() => actualResult = testFailure.ap(testApplyValue));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call #map on the provided apply value", () => expect(actualResult.value).to.eql([testMessage]));
    });

    describe("#bimap", () => {
      const testFailure = new Failure(testMessage);
      const testBimapLeft = sinon.spy(value => `${value} bimapped`);
      const testBimapRight = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testFailure.bimap(testBimapLeft, testBimapRight));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Failure)
        .and.to.not.equal(testFailure)
      );
      it("should pass the values to the failure bimap method", () =>
        expect(testBimapLeft).to.be.calledWith(testFailure.value)
      );
      it("should not call the success bimap method", () => expect(testBimapRight).to.not.be.called);
      it("should contain the mapped value", () => expect(actualResult.value).to.eql([`${testMessage} bimapped`]));
    });

    describe("#chain", () => {
      const testFailure = new Failure(testMessage);
      const testChain = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testFailure.chain(testChain));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided chain method", () => expect(testChain).to.not.be.called);
    });

    describe("#concat", () => {
      describe("Failure with Success", () => {
        const testMessage = "Test error";
        const testValue = true;
        const testSuccess = new Success(testValue);
        const testFailure = new Failure(testMessage);
        let actualResult = null;

        before(() => actualResult = testFailure.concat(testSuccess));

        it("should return the failure instance", () => expect(actualResult).to.equal(testFailure));
      });

      describe("Empty Failure with Failure", () => {
        const testMessage = "Test error";
        const testFailure1 = new Failure();
        const testFailure2 = new Failure(testMessage);
        let actualResult = null;

        before(() => actualResult = testFailure1.concat(testFailure2));

        it("should return a new instance", () =>
          expect(actualResult).to.not.equal(testFailure1).and.not.equal(testFailure2)
        );

        it("should concatenate the two messages", () => {
          const expectedValue = [testMessage];

          expect(actualResult.value).to.eql(expectedValue);
        });
      });

      describe("Failure with Failure", () => {
        const testFailure1 = new Failure(`${testMessage}1`);
        const testFailure2 = new Failure(`${testMessage}2`);
        let actualResult = null;

        before(() => actualResult = testFailure1.concat(testFailure2));

        it("should return a new instance", () =>
          expect(actualResult).to.not.equal(testFailure1).and.not.equal(testFailure2)
        );

        it("should concatenate the two messages", () => {
          const expectedValue = [`${testMessage}1`, `${testMessage}2`];

          expect(actualResult.value).to.eql(expectedValue);
        });
      });
    });

    describe("#equals", () => {
      const testFailure1 = new Failure(testMessage);
      const testFailure2 = new Failure(testMessage);
      const testFailure3 = new Failure(`${testMessage}1`);

      it("should return true for instances with the same value", () =>
        expect(testFailure1.equals(testFailure2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testFailure1.equals(testFailure3)).to.be.false
      );
    });

    describe("#ifSuccess", () => {
      const testFailure = new Failure(testMessage);
      const testIfSuccess = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testFailure.ifSuccess(testIfSuccess));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided ifSuccess method", () => expect(testIfSuccess).to.not.be.called);
    });

    describe("#isFailure", () => {
      it("should return true", () => expect(new Failure(testMessage).isFailure()).to.be.true);
    });

    describe("#isSuccess", () => {
      it("should return false", () => expect(new Failure(testMessage).isSuccess()).to.be.false);
    });

    describe("#map", () => {
      const testFailure = new Failure(testMessage);
      const testMap = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testFailure.map(testMap));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should not call the provided map method", () => expect(testMap).to.not.be.called);
    });

    describe("#of", () => {
      it("should return an instance of Success", () => expect(new Failure().of(testMessage)).to.be.instanceof(Success));
    });

    describe("#orElse", () => {
      const testFailure = new Failure(testMessage);
      const testOrElse = sinon.spy(value => `${value} used`);
      let actualResult = null;

      before(() => actualResult = testFailure.orElse(testOrElse));

      it("should return the instance", () => expect(actualResult).to.equal(testFailure));
      it("should pass the values to the orElse method", () => expect(testOrElse).to.be.calledWith(testFailure.value));
    });

    describe("#orElseThrow", () => {
      const testFailure = new Failure(testMessage);

      it("should throw the supplied error", () => {
        const testExceptionSupplier = testMessage => new Error(testMessage);
        const testFn = () => testFailure.orElseThrow(testExceptionSupplier);

        expect(testFn).to.throw(testMessage);
      });
    });

    describe("#toPromise", () => {
      const testFailure = new Failure(testMessage);

      it("should return a Promise instance", () =>
        expect(testFailure.toPromise()).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have rejected the value", () =>
          expect(testFailure.toPromise()).to.be.rejectedWith(testFailure.value)
        );
      });
    });

    describe("#toPromiseWith", () => {
      const testFailure = new Failure(testMessage);
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testFailure.toPromiseWith(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have rejected the value", () =>
          expect(testFailure.toPromiseWith(testPromiseImplementation)).to.be.rejectedWith(testFailure.value)
        );
      });
    });

    describe("#toString", () => {
      const testFailure = new Failure(["testMessage1", "testMessage2"]);

      it("should return a string containing the type and the values", () =>
        expect(testFailure.toString()).to.equal("Validation.Failure(testMessage1; testMessage2)")
      );
    });

    describe("Algebraic Laws", () => {
      Applicative(Failure);
      Apply(Failure);
      Chain(Failure);
      Extend(Failure);
      Functor(Failure);
      Monad(Failure);
      Monoid(Failure);
      Semigroup(Failure);
      Setoid(Failure);
    });
  });

  describe("Success", () => {
    describe(".from", () => {
      const testValue = true;

      describe("value", () => {
        const expectedResult = new Success(testValue);

        expect(Success.from(testValue)).to.eql(expectedResult);
      });

      describe("Failure", () => {
        const testMessage = "Test error";
        const testFailure = new Failure(testMessage);

        expect(Success.from(testFailure)).to.equal(testFailure);
      });

      describe("Success", () => {
        const testSuccess = new Success(testValue);

        expect(Success.from(testSuccess)).to.equal(testSuccess);
      });
    });

    describe("constructor", () => {
      const testValue = value => !value;

      it("should return a new instance of Success", () => expect(new Success(testValue)).to.be.instanceof(Success));
    });

    describe("#ap", () => {
      const testArgument = true;
      const testSuccessFn = value => !value;
      const testSuccess = new Success(testSuccessFn);
      const testApplyValue = new Success(testArgument);
      let actualResult = null;

      before(() => actualResult = testSuccess.ap(testApplyValue));

      it("should return a new instance", () => expect(actualResult).to.not.equal(testSuccess));
      it("should call #map on the provided apply value", () => expect(actualResult.value).to.be.false);
    });

    describe("#bimap", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testBimapLeft = sinon.spy(value => `${value} bimapped`);
      const testBimapRight = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testSuccess.bimap(testBimapLeft, testBimapRight));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Success)
        .and.to.not.equal(testSuccess)
      );
      it("should not call the failure bimap method", () => expect(testBimapLeft).to.not.be.called);
      it("should pass the value to the success bimap method", () =>
        expect(testBimapRight).to.be.calledWith(testSuccess.value)
      );
      it("should contain the mapped value", () => expect(actualResult.value).to.equal(!testValue));
    });

    describe("#chain", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);

      describe("failure wrapped result", () => {
        const testChainFailure = sinon.spy(value => new Failure(`Test error for ${value}`));
        let actualResultFailure = null;

        before(() => actualResultFailure = testSuccess.chain(testChainFailure));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultFailure).to.not.equal(testSuccess)
        );

        it("should return the failure instance", () => expect(actualResultFailure).to.be.instanceof(Failure));
      });

      describe("success wrapped result", () => {
        const testChainWrapped = sinon.spy(value => new Success(!value));
        let actualResultSuccess = null;

        before(() => actualResultSuccess = testSuccess.chain(testChainWrapped));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultSuccess).to.not.equal(testSuccess)
        );

        it("should return the success instance", () => expect(actualResultSuccess).to.be.instanceof(Success));
      });

      describe("unwrapped result", () => {
        const testChainUnwrapped = sinon.spy(value => !value);
        let actualResultUnwrapped = null;

        before(() => actualResultUnwrapped = testSuccess.chain(testChainUnwrapped));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultUnwrapped).to.not.equal(testSuccess)
        );

        it("should return a success instance", () => expect(actualResultUnwrapped).to.be.instanceof(Success));
      });
    });

    describe("#concat", () => {
      describe("Empty Success with Success", () => {
        const testValue = true;
        const testSuccess1 = new Success();
        const testSuccess2 = new Success(testValue);
        let actualResult = null;

        before(() => actualResult = testSuccess1.concat(testSuccess2));

        it("should return the right success instance", () => expect(actualResult).to.equal(testSuccess2));
      });

      describe("Success with Success", () => {
        const testValue = true;
        const testSuccess1 = new Success(testValue);
        const testSuccess2 = new Success(!testValue);
        let actualResult = null;

        before(() => actualResult = testSuccess1.concat(testSuccess2));

        it("should return the left success instance", () => expect(actualResult).to.equal(testSuccess1));
      });

      describe("Success with Failure", () => {
        const testMessage = "Test error";
        const testValue = true;
        const testSuccess = new Success(testValue);
        const testFailure = new Failure(testMessage);
        const expectedValue = [testMessage];
        let actualResult = null;

        before(() => actualResult = testSuccess.concat(testFailure));

        it("should return the failure instance", () => expect(actualResult).to.equal(testFailure));
        it("should not change the value of the Failure", () => expect(actualResult.value).to.eql(expectedValue));
      });
    });

    describe("#equals", () => {
      const testValue = true;
      const testSuccess1 = new Success(testValue);
      const testSuccess2 = new Success(testValue);
      const testSuccess3 = new Success(!testValue);

      it("should return true for instances with the same value", () =>
        expect(testSuccess1.equals(testSuccess2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testSuccess1.equals(testSuccess3)).to.be.false
      );
    });

    describe("#ifSuccess", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testIfSuccess = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testSuccess.ifSuccess(testIfSuccess));

      it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
      it("should call the provided ifSuccess method", () => expect(testIfSuccess).to.be.calledWith(testValue));
    });

    describe("#isFailure", () => {
      const testValue = true;

      it("should return false", () => expect(new Success(testValue).isFailure()).to.be.false);
    });

    describe("#isSuccess", () => {
      const testValue = true;

      it("should return true", () => expect(new Success(testValue).isSuccess()).to.be.true);
    });

    describe("#map", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testMap = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testSuccess.map(testMap));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Success)
        .and.to.not.equal(testSuccess)
      );
      it("should call the provided map method", () => expect(testMap).to.be.calledWith(testSuccess.value));
    });

    describe("#of", () => {
      const testValue = true;

      it("should return an instance of Success", () => expect(new Success().of(testValue)).to.be.instanceof(Success));
    });

    describe("#orElse", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testOrElse = sinon.spy(value => `${value} used`);
      let actualResult = null;

      before(() => actualResult = testSuccess.orElse(testOrElse));

      it("should return the instance", () => expect(actualResult).to.equal(testSuccess));
      it("should not call the provided orElse method", () => expect(testOrElse).to.not.be.called);
    });

    describe("#orElseThrow", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);

      it("should not throw the supplied error", () => {
        const testExceptionSupplier = testValue => new Error(testValue);
        const testFn = () => testSuccess.orElseThrow(testExceptionSupplier);

        expect(testFn).to.not.throw();
      });
    });

    describe("#toPromise", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);

      it("should return a Promise instance", () =>
        expect(testSuccess.toPromise()).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have resolved the value", () =>
          expect(testSuccess.toPromise()).to.eventually.equal(testSuccess.value)
        );
      });
    });

    describe("#toPromiseWith", () => {
      const testValue = true;
      const testSuccess = new Success(testValue);
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testSuccess.toPromiseWith(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have resolved the value", () =>
          expect(testSuccess.toPromiseWith(testPromiseImplementation)).to.eventually.equal(testSuccess.value)
        );
      });
    });

    describe("#toString", () => {
      const testValue = [true, false];
      const testSuccess = new Success(testValue);

      it("should return a string containing the type and the values", () =>
        expect(testSuccess.toString()).to.equal("Validation.Success(true,false)")
      );
    });

    describe(".empty", () => {
      it("should return a new instance of Success", () => expect(Success.empty()).to.be.instanceof(Success));
    });

    describe("Algebraic Laws", () => {
      Applicative(Success);
      Apply(Success);
      Chain(Success);
      Extend(Success);
      Functor(Success);
      Monad(Success);
      Monoid(Success);
      Semigroup(Success);
      Setoid(Success);
    });
  });
});
