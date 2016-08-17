"use strict";

// Third Party
const chai = require("chai");
const first = require("lodash/fp/first");
const map = require("lodash/fp/map");
const nth = require("lodash/fp/nth");
const promiseChai = require("chai-as-promised");
const include = require("include")(__dirname);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

// Third Party Setup
chai.use(promiseChai);
chai.use(sinonChai);
const expect = chai.expect;
const second = nth(1);

// Project
const Applicative = require("./laws/Applicative")(expect);
const Apply = require("./laws/Apply")(expect);
const Chain = require("./laws/Chain")(expect);
const Maybe = include("data/Maybe");
const Extend = require("./laws/Extend")(expect);
const Functor = require("./laws/Functor")(expect);
const Either = include("data/Either");
const Monad = require("./laws/Monad")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Validation = include("data/Validation");

// Project Aliases
const Left = Either.Left;
const Right = Either.Right;

describe("Either", () => {
  const testMessage = "Test error";
  const testValue = true;

  describe(".all", () => {
    describe("with a Left", () => {
      const testMessage1 = `${testMessage} 1`;
      const testMessage2 = `${testMessage} 2`;
      const testEithers = [Left.from(testMessage1), Left.from(testMessage2), Right.from(testValue)];
      const expectedResult = testEithers[0];
      let actualResult = null;

      before(() => actualResult = Either.all(testEithers));

      it("should return an instance of Left", () => expect(actualResult).to.be.instanceof(Left));
      it("should return the first Left", () => expect(actualResult).to.equal(expectedResult));
    });

    describe("rights", () => {
      const testEithers = [Right.from(testValue), Right.from(!testValue)];
      const expectedResult = Right.from([testValue, !testValue]);
      let actualResult = null;

      before(() => actualResult = Either.all(testEithers));

      it("should return an instance of Right", () => expect(actualResult).to.be.instanceof(Right));
      it("should return a singular Right of all values", () => expect(actualResult).to.eql(expectedResult));
    });
  });

  describe(".any", () => {
    describe("nothings", () => {
      const testEithers = [Left.from(testMessage), Left.from(testMessage)];
      const expectedResult = first(testEithers);
      let actualResult = null;

      before(() => actualResult = Either.any(testEithers));

      it("should return the first Left", () => expect(actualResult).to.equal(expectedResult));
    });

    describe("justs", () => {
      const testEithers = [Left.from(testMessage), Right.from(testValue), Right.from(!testValue)];
      const expectedResult = second(testEithers);
      let actualResult = null;

      before(() => actualResult = Either.any(testEithers));

      it("should return the first Right", () => expect(actualResult).to.equal(expectedResult));
    });
  });

  describe(".each", () => {
    const testCollection = [
      Left.from(testMessage),
      Right.from(testValue)
    ];

    describe("early terminate", () => {
      it("should iterate over each item in the collection until Left is returned", () => {
        let testCount = 0;
        const expectedCount = 1;

        Either.each(validation => {
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

        Either.each(() => testCount += 1, testCollection);

        expect(testCount).to.equal(expectedCount);
      });
    });
  });

  describe(".equals", () => {
    it("should return true for same values but same types", () =>
      expect(Either.equals(Right.from(testValue), Right.from(testValue))).to.be.true
    );

    it("should return false for same values but different types", () =>
      expect(Either.equals(Left.from(testValue), Right.from(testValue))).to.be.false
    );
  });

  describe(".isLeft", () => {
    it("should return true for a Left", () => expect(Either.isLeft(Left.from(testMessage))).to.be.true);
    it("should return false for a Right", () => expect(Either.isLeft(Right.from(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Either.isLeft(testValue)).to.be.false);
  });

  describe(".isRight", () => {
    it("should return false for a Left", () => expect(Either.isRight(Left.from(testMessage))).to.be.false);
    it("should return true for a Right", () => expect(Either.isRight(Right.from(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Either.isRight(testValue)).to.be.false);
  });

  describe(".mapIn", () => {
    const testCollection = [
      Left.from(testMessage),
      Right.from(testValue)
    ];
    let actualResult = null;

    before(() => actualResult = Either.mapIn(value => !value, testCollection));

    it("should map each value in the collection", () => {
      const expectedResult = [testMessage, !testValue];

      expect(map(testEither => testEither.value, actualResult)).to.be.eql(expectedResult);
    });
  });

  describe(".of", () => {
    it("should return an instance of Right", () => expect(Either.of()).to.be.instanceof(Right));
  });

  describe(".toMaybe", () => {
    const testLeft = Left.from(testMessage);
    const testRight = Right.from(testValue);
    const testMaybeImplementation = Maybe;

    it("should convert the Left to a Nothing", () =>
      expect(Either.toMaybe(testMaybeImplementation, testLeft)).to.be.instanceof(Maybe.Nothing)
    );

    it("should convert the Right to a Just", () =>
      expect(Either.toMaybe(testMaybeImplementation, testRight)).to.be.instanceof(Maybe.Just)
    );

    it("should contain the value of the Right", () => {
      const expectedJust = Maybe.Just.from(testValue);

      expect(Either.toMaybe(testMaybeImplementation, testRight)).to.eql(expectedJust);
    });
  });

  describe(".toPromise", () => {
    const testLeft = Left.from(testMessage);
    const testRight = Right.from(testValue);
    const testPromiseImplementation = Promise;

    it("should reject with the value of a Left", () =>
      expect(Either.toPromise(testPromiseImplementation, testLeft)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Right", () =>
      expect(Either.toPromise(testPromiseImplementation, testRight)).to.eventually.equal(testValue)
    );
  });

  describe(".toValidation", () => {
    const testLeft = Left.from(testMessage);
    const testRight = Right.from(testValue);
    const testValidationImplementation = Validation;

    it("should convert the Left to a Failure", () =>
      expect(Either.toValidation(testValidationImplementation, testLeft)).to.be.instanceof(Validation.Failure)
    );

    it("should convert the Success to a Success", () =>
      expect(Either.toValidation(testValidationImplementation, testRight)).to.be.instanceof(Validation.Success)
    );

    it("should contain the value of the Success", () => {
      const expectedJust = Validation.Success.from(testValue);

      expect(Either.toValidation(testValidationImplementation, testRight)).to.eql(expectedJust);
    });
  });

  describe(".try", () => {
    it("should return a Left for a caught exception", () => {
      const testFn = () => {
        throw new Error(testMessage);
      };

      expect(Either.try(testFn)).to.be.instanceof(Left);
    });

    it("should return a Right for a normal execution", () => {
      const testFn = () => true;

      expect(Either.try(testFn)).to.be.instanceof(Right);
    });
  });

  describe("Left", () => {
    describe(".from", () => {
      describe("value", () => {
        const expectedResult = new Left(testMessage);

        expect(Left.from(testMessage)).to.eql(expectedResult);
      });

      describe("Left", () => {
        const testLeft = new Left(testMessage);

        expect(Left.from(testLeft)).to.equal(testLeft);
      });

      describe("Right", () => {
        const testRight = new Right(testValue);

        expect(Left.from(testRight)).to.equal(testRight);
      });
    });

    describe("constructor", () => {
      it("should return a new instance of Left", () => expect(new Left(testMessage)).to.be.instanceof(Left));
    });

    describe("#ap", () => {
      const testLeft = new Left(testMessage);
      const testApplyValue = new Left(testMessage);
      let actualResult = null;

      before(() => actualResult = testLeft.ap(testApplyValue));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call #map on the provided apply value", () => expect(actualResult).to.equal(testLeft));
    });

    describe("#bimap", () => {
      const testLeft = new Left(testMessage);
      const testBimapLeft = sinon.spy(value => `${value} bimapped`);
      const testBimapRight = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testLeft.bimap(testBimapLeft, testBimapRight));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Left)
        .and.to.not.equal(testLeft)
      );
      it("should pass the values to the failure bimap method", () =>
        expect(testBimapLeft).to.be.calledWith(testLeft.value)
      );
      it("should not call the success bimap method", () => expect(testBimapRight).to.not.be.called);
      it("should contain the mapped value", () => expect(actualResult.value).to.eql(`${testMessage} bimapped`));
    });

    describe("#chain", () => {
      const testLeft = new Left(testMessage);
      const testChain = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testLeft.chain(testChain));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided chain method", () => expect(testChain).to.not.be.called);
    });

    describe("#equals", () => {
      const testLeft1 = new Left(testMessage);
      const testLeft2 = new Left(testMessage);

      it("should return true for instances with the same value", () => expect(testLeft1.equals(testLeft2)).to.be.true);
    });

    describe("#get", () => {
      it("should return null", () => expect(Left.from(testMessage).get()).to.be.null);
    });

    describe("#ifRight", () => {
      const testLeft = new Left(testMessage);
      const testIfRight = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testLeft.ifRight(testIfRight));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided ifRight method", () => expect(testIfRight).to.not.be.called);
    });

    describe("#ifLeft", () => {
      const testLeft = new Left(testMessage);
      const testIfLeft = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testLeft.ifLeft(testIfLeft));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should call the provided ifLeft method", () => expect(testIfLeft).to.be.called);
    });

    describe("#isRight", () => {
      it("should return false", () => expect(new Left(testMessage).isRight()).to.be.false);
    });

    describe("#isLeft", () => {
      it("should return true", () => expect(new Left(testMessage).isLeft(testMessage)).to.be.true);
    });

    describe("#map", () => {
      const testLeft = new Left(testMessage);
      const testMap = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testLeft.map(testMap));

      it("should return the instance", () => expect(actualResult).to.equal(testLeft));
      it("should not call the provided map method", () => expect(testMap).to.not.be.called);
    });

    describe("#of", () => {
      it("should return an instance of Right", () => expect(new Left().of()).to.be.instanceof(Right));
    });

    describe("#orElse", () => {
      const testLeft = new Left(testMessage);
      let actualResult = null;

      before(() => actualResult = testLeft.orElse(testValue));

      it("should return the value passed to the orElse method", () => expect(actualResult).to.equal(testValue));
    });

    describe("#orElseGet", () => {
      it("should return the value supplied by the function passed", () => {
        const testValueSupplier = () => testValue;
        const expectedResult = testValue;

        expect(Left.from(testMessage).orElseGet(testValueSupplier)).to.equal(expectedResult);
      });
    });

    describe("#orElseThrow", () => {
      const testLeft = new Left(testMessage);

      it("should throw the supplied error", () => {
        const testExceptionSupplier = () => new Error(testMessage);
        const testFn = () => testLeft.orElseThrow(testExceptionSupplier);

        expect(testFn).to.throw(testMessage);
      });
    });

    describe("#toMaybe", () => {
      const testLeft = new Left(testMessage);
      const testMaybeImplementation = Maybe;

      it("should return a Maybe instance", () =>
        expect(testLeft.toMaybe(testMaybeImplementation)).to.be.instanceof(Maybe.Nothing)
      );
    });

    describe("#toPromise", () => {
      const testLeft = new Left(testMessage);
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testLeft.toPromise(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have rejected the value", () =>
          expect(testLeft.toPromise(testPromiseImplementation)).to.be.rejectedWith(testLeft.value)
        );
      });
    });

    describe("#toString", () => {
      const testLeft = new Left(testMessage);

      it("should return a string containing the type and the values", () =>
        expect(testLeft.toString()).to.equal(`Either.Left(${testMessage})`)
      );
    });

    describe("#toValidation", () => {
      const testLeft = new Left(testMessage);
      const testValidationImplementation = Validation;

      it("should return a Validation instance", () =>
        expect(testLeft.toValidation(testValidationImplementation)).to.be.instanceof(Validation.Failure)
      );
    });

    describe("Algebraic Laws", () => {
      Applicative(Left);
      Apply(Left);
      Chain(Left);
      Extend(Left);
      Functor(Left);
      Monad(Left);
      Setoid(Left);
    });
  });

  describe("Right", () => {
    describe(".from", () => {
      describe("value", () => {
        const expectedResult = new Right(testValue);

        expect(Right.from(testValue)).to.eql(expectedResult);
      });

      describe("Left", () => {
        const testLeft = new Left(testMessage);

        expect(Right.from(testLeft)).to.equal(testLeft);
      });

      describe("Right", () => {
        const testRight = new Right(testValue);

        expect(Right.from(testRight)).to.equal(testRight);
      });
    });

    describe("constructor", () => {
      const testValue = value => !value;

      it("should return a new instance of Right", () => expect(new Right(testValue)).to.be.instanceof(Right));
    });

    describe("#ap", () => {
      const testArgument = testValue;
      const testRightFn = value => !value;
      const testRight = new Right(testRightFn);
      const testApplyValue = new Right(testArgument);
      let actualResult = null;

      before(() => actualResult = testRight.ap(testApplyValue));

      it("should return a new instance", () => expect(actualResult).to.not.equal(testRight));
      it("should call #map on the provided apply value", () => expect(actualResult.value).to.be.false);
    });

    describe("#bimap", () => {
      const testRight = new Right(testValue);
      const testBimapLeft = sinon.spy(value => `${value} bimapped`);
      const testBimapRight = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testRight.bimap(testBimapLeft, testBimapRight));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Right)
        .and.to.not.equal(testRight)
      );
      it("should not call the failure bimap method", () => expect(testBimapLeft).to.not.be.called);
      it("should pass the value to the success bimap method", () =>
        expect(testBimapRight).to.be.calledWith(testRight.value)
      );
      it("should contain the mapped value", () => expect(actualResult.value).to.equal(!testValue));
    });

    describe("#chain", () => {
      const testRight = new Right(testValue);

      describe("nothing result", () => {
        const testChainLeft = sinon.spy(() => new Left(testMessage));
        let actualResultLeft = null;

        before(() => actualResultLeft = testRight.chain(testChainLeft));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultLeft).to.not.equal(testRight)
        );

        it("should return the nothing instance", () => expect(actualResultLeft).to.be.instanceof(Left));
      });

      describe("just wrapped result", () => {
        const testChainWrapped = sinon.spy(value => new Right(!value));
        let actualResultRight = null;

        before(() => actualResultRight = testRight.chain(testChainWrapped));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultRight).to.not.equal(testRight)
        );

        it("should return the just instance", () => expect(actualResultRight).to.be.instanceof(Right));
      });

      describe("unwrapped result", () => {
        const testChainUnwrapped = sinon.spy(value => !value);
        let actualResultUnwrapped = null;

        before(() => actualResultUnwrapped = testRight.chain(testChainUnwrapped));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultUnwrapped).to.not.equal(testRight)
        );

        it("should return a just instance", () => expect(actualResultUnwrapped).to.be.instanceof(Right));
      });
    });

    describe("#equals", () => {
      const testRight1 = new Right(testValue);
      const testRight2 = new Right(testValue);
      const testRight3 = new Right(!testValue);

      it("should return true for instances with the same value", () =>
        expect(testRight1.equals(testRight2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testRight1.equals(testRight3)).to.be.false
      );
    });

    describe("#get", () => {
      it("should return null", () => expect(Right.from(testValue).get()).to.equal(testValue));
    });

    describe("#ifRight", () => {
      const testRight = new Right(testValue);
      const testIfRight = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testRight.ifRight(testIfRight));

      it("should return the instance", () => expect(actualResult).to.equal(testRight));
      it("should call the provided ifRight method", () => expect(testIfRight).to.be.calledWith(testValue));
    });

    describe("#ifLeft", () => {
      const testRight = new Right(testValue);
      const testIfLeft = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testRight.ifLeft(testIfLeft));

      it("should return the instance", () => expect(actualResult).to.equal(testRight));
      it("should not call the provided ifLeft method", () => expect(testIfLeft).to.not.be.called);
    });

    describe("#isRight", () => {
      it("should return true", () => expect(new Right(testValue).isRight()).to.be.true);
    });

    describe("#isLeft", () => {
      it("should return false", () => expect(new Right(testValue).isLeft(testMessage)).to.be.false);
    });

    describe("#map", () => {
      const testRight = new Right(testValue);
      const testMap = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testRight.map(testMap));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Right)
        .and.to.not.equal(testRight)
      );
      it("should call the provided map method", () => expect(testMap).to.be.calledWith(testRight.value));
    });

    describe("#of", () => {
      it("should return an instance of Right", () => expect(new Right().of()).to.be.instanceof(Right));
    });

    describe("#orElse", () => {
      const testRight = new Right(testValue);
      const testOrElseValue = false;
      let actualResult = null;

      before(() => actualResult = testRight.orElse(testOrElseValue));

      it("should return the value", () => expect(actualResult).to.eql(testValue));
    });

    describe("#orElseGet", () => {
      it("should return the value supplied by the function passed", () => {
        const testValueSupplier = () => false;
        const expectedResult = testValue;

        expect(Right.from(testValue).orElseGet(testValueSupplier)).to.equal(expectedResult);
      });
    });

    describe("#orElseThrow", () => {
      const testRight = new Right(testValue);
      const testOrElseThrow = sinon.spy(testValue => new Error(testValue));

      it("should not throw the supplied error", () => {
        const testFn = () => testRight.orElseThrow(testOrElseThrow);

        expect(testFn).to.not.throw();
      });

      it("should not call the provided method", () => expect(testOrElseThrow).to.not.be.called);
      it("should return the value", () => expect(testRight.orElseThrow()).to.eql(testValue));
    });

    describe("#toMaybe", () => {
      const testRight = new Right(testValue);
      const testMaybeImplementation = Maybe;

      it("should convert the Right to a Just", () =>
        expect(testRight.toMaybe(testMaybeImplementation)).to.be.instanceof(Maybe.Just)
      );

      describe("Maybe instance", () => {
        it("should contain the value of the Right", () => {
          const expectedJust = Maybe.Just.from(testValue);

          expect(testRight.toMaybe(testMaybeImplementation)).to.eql(expectedJust);
        });
      });
    });

    describe("#toPromise", () => {
      const testRight = new Right(testValue);
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testRight.toPromise(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have resolved the value", () =>
          expect(testRight.toPromise(testPromiseImplementation)).to.eventually.equal(testRight.value)
        );
      });
    });

    describe("#toString", () => {
      const testValues = [true, false];
      const testRight = new Right(testValues);

      it("should return a string containing the type and the values", () =>
        expect(testRight.toString()).to.equal("Either.Right(true,false)")
      );
    });

    describe("#toValidation", () => {
      const testRight = new Right(testValue);
      const testValidationImplementation = Validation;

      it("should convert the Right to a Success", () =>
        expect(testRight.toValidation(testValidationImplementation)).to.be.instanceof(Validation.Success)
      );

      describe("Validation instance", () => {
        it("should contain the value of the Right", () => {
          const expectedJust = Validation.Success.from(testValue);

          expect(testRight.toValidation(testValidationImplementation)).to.eql(expectedJust);
        });
      });
    });

    describe("Algebraic Laws", () => {
      Applicative(Right);
      Apply(Right);
      Chain(Right);
      Extend(Right);
      Functor(Right);
      Monad(Right);
      Setoid(Right);
    });
  });
});
