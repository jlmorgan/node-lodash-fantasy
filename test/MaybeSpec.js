"use strict";

// Third Party
const chai = require("chai");
const each = require("lodash/fp/each");
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
const Applicative = require("./laws/Applicative")(expect);
const Apply = require("./laws/Apply")(expect);
const Chain = require("./laws/Chain")(expect);
const Either = include("data/Either");
const Extend = require("./laws/Extend")(expect);
const Functor = require("./laws/Functor")(expect);
const Maybe = include("data/Maybe");
const Monad = require("./laws/Monad")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Validation = include("data/Validation");

// Project Aliases
const Nothing = Maybe.Nothing;
const Just = Maybe.Just;

describe("Maybe", () => {
  const testValue = true;

  describe(".all", () => {
    describe("justs", () => {
      const testMaybes = [Just.from(testValue), Just.from(testValue)];
      const expectedResult = [testValue, testValue];
      let actualResult = null;

      before(() => actualResult = Maybe.all(testMaybes));

      it("should return an instance of Just", () => expect(actualResult).to.be.instanceof(Just));
      it("should return a singular Just of all values", () => expect(actualResult.value).to.eql(expectedResult));
    });

    describe("nothings", () => {
      const testMaybes = [Nothing.from(), Nothing.from(), Just.from(testValue)];
      const expectedResult = null;
      let actualResult = null;

      before(() => actualResult = Maybe.all(testMaybes));

      it("should return an instance of Nothing", () => expect(actualResult).to.be.instanceof(Nothing));
      it("should return a singular Nothing of all values", () => expect(actualResult.value).to.eql(expectedResult));
    });
  });

  describe(".any", () => {
    describe("nothings", () => {
      const testMaybes = [Nothing.from(), Nothing.from()];
      const expectedResult = null;
      let actualResult = null;

      before(() => actualResult = Maybe.any(testMaybes));

      it("should return an instance of Nothing", () => expect(actualResult).to.be.instanceof(Nothing));
      it("should return a singular nothing of all values", () => expect(actualResult.value).to.eql(expectedResult));
    });

    describe("justs", () => {
      const testValue1 = testValue;
      const testValue2 = !testValue;
      const testMaybes = [Nothing.from(), Just.from(testValue1), Just.from(testValue2)];
      let actualResult = null;

      before(() => actualResult = Maybe.any(testMaybes));

      it("should return an instance of Just", () => expect(actualResult).to.be.instanceof(Just));
      it("should return the first justful validation", () => expect(actualResult.value).to.equal(testValue1));
    });
  });

  describe(".each", () => {
    const testCollection = [
      Nothing.from(),
      Just.from(testValue)
    ];

    describe("early terminate", () => {
      it("should iterate over each item in the collection until Nothing is returned", () => {
        let testCount = 0;
        const expectedCount = 1;

        Maybe.each(validation => {
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

        Maybe.each(() => testCount += 1, testCollection);

        expect(testCount).to.equal(expectedCount);
      });
    });
  });

  describe(".equals", () => {
    it("should return true for same values but same types", () =>
      expect(Maybe.equals(Just.from(testValue), Just.from(testValue))).to.be.true
    );

    it("should return false for same values but different types", () =>
      expect(Maybe.equals(Nothing.from(testValue), Just.from(testValue))).to.be.false
    );
  });

  describe(".isNothing", () => {
    it("should return true for a Nothing", () => expect(Maybe.isNothing(Nothing.from())).to.be.true);
    it("should return false for a Just", () => expect(Maybe.isNothing(Just.from(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Maybe.isNothing(testValue)).to.be.false);
  });

  describe(".isJust", () => {
    it("should return false for a Nothing", () => expect(Maybe.isJust(Nothing.from())).to.be.false);
    it("should return true for a Just", () => expect(Maybe.isJust(Just.from(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Maybe.isJust(testValue)).to.be.false);
  });

  describe(".mapIn", () => {
    const testCollection = [
      Nothing.from(),
      Just.from(testValue)
    ];
    let actualResult = null;

    before(() => actualResult = Maybe.mapIn(value => !value, testCollection));

    it("should map each value in the collection", () => {
      const expectedResult = [null, !testValue];

      expect(map(testMaybe => testMaybe.value, actualResult)).to.be.eql(expectedResult);
    });
  });

  describe(".of", () => {
    it("should return an instance of Just", () => expect(Maybe.of()).to.be.instanceof(Just));
  });

  describe(".ofNullable", () => {
    const testNullableValues = [undefined, null];
    const testValues = [0, false, true, "", [], {}];

    each(
      testValue => it(
        `should return an instance of Nullable for '${testValue}'`,
        () => expect(Maybe.ofNullable(testValue)).to.be.instanceof(Nothing)
      ),
      testNullableValues
    );

    each(
      testValue => it(
        `should return an instance of Just for '${testValue}'`,
        () => expect(Maybe.ofNullable(testValue)).to.be.instanceof(Just)
      ),
      testValues
    );
  });

  describe(".toEither", () => {
    const testNothing = Nothing.from();
    const testJust = Just.from(testValue);
    const testEitherImplementation = Either;

    it("should convert the Nothing to a Left", () =>
      expect(Maybe.toEither(testEitherImplementation, testNothing)).to.be.instanceof(Either.Left)
    );

    it("should convert the Just to a Right", () =>
      expect(Maybe.toEither(testEitherImplementation, testJust)).to.be.instanceof(Either.Right)
    );

    it("should contain the value of the Just", () => {
      const expectedRight = Either.Right.from(testValue);

      expect(Maybe.toEither(testEitherImplementation, testJust)).to.eql(expectedRight);
    });
  });

  describe(".toPromise", () => {
    const testNothing = Nothing.from();
    const testJust = Just.from(testValue);
    const testPromiseImplementation = Promise;

    it("should reject with the value of a Nothing", () =>
      expect(Maybe.toPromise(testPromiseImplementation, testNothing)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Just", () =>
      expect(Maybe.toPromise(testPromiseImplementation, testJust)).to.eventually.equal(testValue)
    );
  });

  describe(".toValidation", () => {
    const testNothing = Nothing.from();
    const testJust = Just.from(testValue);
    const testValidationImplementation = Validation;

    it("should convert the Nothing to a Failure", () =>
      expect(Maybe.toValidation(testValidationImplementation, testNothing)).to.be.instanceof(Validation.Failure)
    );

    it("should convert the Success to a Success", () =>
      expect(Maybe.toValidation(testValidationImplementation, testJust)).to.be.instanceof(Validation.Success)
    );

    it("should contain the value of the Success", () => {
      const expectedRight = Validation.Success.from(testValue);

      expect(Maybe.toValidation(testValidationImplementation, testJust)).to.eql(expectedRight);
    });
  });

  describe(".try", () => {
    it("should return a Nothing for a caught exception", () => {
      const testFn = () => {
        throw new Error("Test error");
      };

      expect(Maybe.try(testFn)).to.be.instanceof(Nothing);
    });

    it("should return a Just for a normal execution", () => {
      const testFn = () => true;

      expect(Maybe.try(testFn)).to.be.instanceof(Just);
    });
  });

  describe("Nothing", () => {
    describe(".from", () => {
      describe("value", () => {
        const expectedResult = new Nothing(testValue);

        expect(Nothing.from()).to.eql(expectedResult);
      });

      describe("Nothing", () => {
        const testNothing = new Nothing();

        expect(Nothing.from(testNothing)).to.equal(testNothing);
      });

      describe("Just", () => {
        const testJust = new Just(testValue);

        expect(Nothing.from(testJust)).to.equal(testJust);
      });
    });

    describe("constructor", () => {
      it("should return a new instance of Nothing", () => expect(new Nothing()).to.be.instanceof(Nothing));
    });

    describe("#ap", () => {
      const testNothing = new Nothing();
      const testApplyValue = new Nothing();
      let actualResult = null;

      before(() => actualResult = testNothing.ap(testApplyValue));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call #map on the provided apply value", () => expect(actualResult.value).to.be.null);
    });

    describe("#chain", () => {
      const testNothing = new Nothing();
      const testChain = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testNothing.chain(testChain));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided chain method", () => expect(testChain).to.not.be.called);
    });

    describe("#equals", () => {
      const testNothing1 = new Nothing();
      const testNothing2 = new Nothing();

      it("should return true for instances with the same value", () =>
        expect(testNothing1.equals(testNothing2)).to.be.true
      );
    });

    describe("#get", () => {
      it("should return null", () => expect(Nothing.from().get()).to.be.null);
    });

    describe("#ifJust", () => {
      const testNothing = new Nothing();
      const testIfJust = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testNothing.ifJust(testIfJust));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided ifJust method", () => expect(testIfJust).to.not.be.called);
    });

    describe("#ifNothing", () => {
      const testNothing = new Nothing();
      const testIfNothing = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testNothing.ifNothing(testIfNothing));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should call the provided ifNothing method", () => expect(testIfNothing).to.be.called);
    });

    describe("#isJust", () => {
      it("should return false", () => expect(new Nothing().isJust()).to.be.false);
    });

    describe("#isNothing", () => {
      it("should return true", () => expect(new Nothing().isNothing()).to.be.true);
    });

    describe("#map", () => {
      const testNothing = new Nothing();
      const testMap = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testNothing.map(testMap));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided map method", () => expect(testMap).to.not.be.called);
    });

    describe("#of", () => {
      it("should return an instance of Just", () => expect(new Nothing().of()).to.be.instanceof(Just));
    });

    describe("#orElse", () => {
      const testNothing = new Nothing();
      const testOrElseValue = testValue;
      const expectedResult = testValue;
      let actualResult = null;

      before(() => actualResult = testNothing.orElse(testOrElseValue));

      it("should return the value passed", () => expect(actualResult).to.equal(expectedResult));
    });

    describe("#orElseGet", () => {
      const testNothing = new Nothing();
      const testValueSupplier = () => testValue;
      const expectedResult = testValue;
      let actualResult = null;

      before(() => actualResult = testNothing.orElseGet(testValueSupplier));

      it("should return the value supplied by the function passed", () =>
        expect(actualResult).to.equal(expectedResult)
      );
    });

    describe("#orElseThrow", () => {
      const testNothing = new Nothing();
      const testExceptionSupplier = () => new Error();

      it("should throw the supplied error", () => {
        const testFn = () => testNothing.orElseThrow(testExceptionSupplier);

        expect(testFn).to.throw();
      });
    });

    describe("#toEither", () => {
      const testNothing = new Nothing();
      const testEitherImplementation = Either;

      it("should return a Either instance", () =>
        expect(testNothing.toEither(testEitherImplementation)).to.be.instanceof(Either.Left)
      );
    });

    describe("#toPromise", () => {
      const testNothing = new Nothing();
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testNothing.toPromise(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have rejected the value", () =>
          expect(testNothing.toPromise(testPromiseImplementation)).to.be.rejectedWith(testNothing.value)
        );
      });
    });

    describe("#toString", () => {
      const testNothing = new Nothing();

      it("should return a string containing the type and the values", () =>
        expect(testNothing.toString()).to.equal("Maybe.Nothing(null)")
      );
    });

    describe("#toValidation", () => {
      const testNothing = new Nothing();
      const testValidationImplementation = Validation;

      it("should return a Validation instance", () =>
        expect(testNothing.toValidation(testValidationImplementation)).to.be.instanceof(Validation.Failure)
      );
    });

    describe("Algebraic Laws", () => {
      Applicative(Nothing);
      Apply(Nothing);
      Chain(Nothing);
      Extend(Nothing);
      Functor(Nothing);
      Monad(Nothing);
      Setoid(Nothing);
    });
  });

  describe("Just", () => {
    describe(".from", () => {
      describe("value", () => {
        const expectedResult = new Just(testValue);

        expect(Just.from(testValue)).to.eql(expectedResult);
      });

      describe("Nothing", () => {
        const testNothing = new Nothing();

        expect(Just.from(testNothing)).to.equal(testNothing);
      });

      describe("Just", () => {
        const testJust = new Just(testValue);

        expect(Just.from(testJust)).to.equal(testJust);
      });
    });

    describe("constructor", () => {
      const testValue = value => !value;

      it("should return a new instance of Just", () => expect(new Just(testValue)).to.be.instanceof(Just));
    });

    describe("#ap", () => {
      const testArgument = testValue;
      const testJustFn = value => !value;
      const testJust = new Just(testJustFn);
      const testApplyValue = new Just(testArgument);
      let actualResult = null;

      before(() => actualResult = testJust.ap(testApplyValue));

      it("should return a new instance", () => expect(actualResult).to.not.equal(testJust));
      it("should call #map on the provided apply value", () => expect(actualResult.value).to.be.false);
    });

    describe("#chain", () => {
      const testJust = new Just(testValue);

      describe("nothing result", () => {
        const testChainNothing = sinon.spy(() => new Nothing());
        let actualResultNothing = null;

        before(() => actualResultNothing = testJust.chain(testChainNothing));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultNothing).to.not.equal(testJust)
        );

        it("should return the nothing instance", () => expect(actualResultNothing).to.be.instanceof(Nothing));
      });

      describe("just wrapped result", () => {
        const testChainWrapped = sinon.spy(value => new Just(!value));
        let actualResultJust = null;

        before(() => actualResultJust = testJust.chain(testChainWrapped));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultJust).to.not.equal(testJust)
        );

        it("should return the just instance", () => expect(actualResultJust).to.be.instanceof(Just));
      });

      describe("unwrapped result", () => {
        const testChainUnwrapped = sinon.spy(value => !value);
        let actualResultUnwrapped = null;

        before(() => actualResultUnwrapped = testJust.chain(testChainUnwrapped));

        it("should return a new instance for a wrapped value", () =>
          expect(actualResultUnwrapped).to.not.equal(testJust)
        );

        it("should return a just instance", () => expect(actualResultUnwrapped).to.be.instanceof(Just));
      });
    });

    describe("#equals", () => {
      const testJust1 = new Just(testValue);
      const testJust2 = new Just(testValue);
      const testJust3 = new Just(!testValue);

      it("should return true for instances with the same value", () =>
        expect(testJust1.equals(testJust2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testJust1.equals(testJust3)).to.be.false
      );
    });

    describe("#get", () => {
      it("should return null", () => expect(Just.from(testValue).get()).to.equal(testValue));
    });

    describe("#ifJust", () => {
      const testJust = new Just(testValue);
      const testIfJust = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testJust.ifJust(testIfJust));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should call the provided ifJust method", () => expect(testIfJust).to.be.calledWith(testValue));
    });

    describe("#ifNothing", () => {
      const testJust = new Just(testValue);
      const testIfNothing = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testJust.ifNothing(testIfNothing));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should not call the provided ifNothing method", () => expect(testIfNothing).to.not.be.called);
    });

    describe("#isJust", () => {
      it("should return true", () => expect(new Just(testValue).isJust()).to.be.true);
    });

    describe("#isNothing", () => {
      it("should return false", () => expect(new Just(testValue).isNothing()).to.be.false);
    });

    describe("#map", () => {
      const testJust = new Just(testValue);
      const testMap = sinon.spy(value => !value);
      let actualResult = null;

      before(() => actualResult = testJust.map(testMap));

      it("should return a new instance", () => expect(actualResult).to.be.instanceof(Just)
        .and.to.not.equal(testJust)
      );
      it("should call the provided map method", () => expect(testMap).to.be.calledWith(testJust.value));
    });

    describe("#of", () => {
      it("should return an instance of Just", () => expect(new Just().of()).to.be.instanceof(Just));
    });

    describe("#orElse", () => {
      const testJust = new Just(testValue);
      const testOrElseValue = !testValue;
      const expectedValue = testValue;
      let actualResult = null;

      before(() => actualResult = testJust.orElse(testOrElseValue));

      it("should return the value of the instance", () => expect(actualResult).to.eql(expectedValue));
    });

    describe("#orElseGet", () => {
      const testJust = new Just(testValue);
      const testValueSupplier = () => !testValue;
      const expectedResult = testValue;
      let actualResult = null;

      before(() => actualResult = testJust.orElseGet(testValueSupplier));

      it("should return the value of the instance", () => expect(actualResult).to.equal(expectedResult));
    });

    describe("#orElseThrow", () => {
      const testJust = new Just(testValue);
      const testOrElseThrow = sinon.spy(() => new Error());
      const expectedResult = testValue;

      it("should not throw the supplied error", () => {
        const testFn = () => testJust.orElseThrow(testOrElseThrow);

        expect(testFn).to.not.throw();
      });

      it("should not call the provided method", () => expect(testOrElseThrow).to.not.be.called);
      it("should return the value of the instance", () => expect(testJust.orElseThrow()).to.eql(expectedResult));
    });

    describe("#toEither", () => {
      const testJust = new Just(testValue);
      const testEitherImplementation = Either;

      it("should convert the Just to a Right", () =>
        expect(testJust.toEither(testEitherImplementation)).to.be.instanceof(Either.Right)
      );

      describe("Either instance", () => {
        it("should contain the value of the Just", () => {
          const expectedRight = Either.Right.from(testValue);

          expect(testJust.toEither(testEitherImplementation)).to.eql(expectedRight);
        });
      });
    });

    describe("#toPromise", () => {
      const testJust = new Just(testValue);
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testJust.toPromise(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have resolved the value", () =>
          expect(testJust.toPromise(testPromiseImplementation)).to.eventually.equal(testJust.value)
        );
      });
    });

    describe("#toString", () => {
      const testValues = [true, false];
      const testJust = new Just(testValues);

      it("should return a string containing the type and the values", () =>
        expect(testJust.toString()).to.equal("Maybe.Just(true,false)")
      );
    });

    describe("#toValidation", () => {
      const testJust = new Just(testValue);
      const testValidationImplementation = Validation;

      it("should convert the Just to a Success", () =>
        expect(testJust.toValidation(testValidationImplementation)).to.be.instanceof(Validation.Success)
      );

      describe("Validation instance", () => {
        it("should contain the value of the Just", () => {
          const expectedRight = Validation.Success.from(testValue);

          expect(testJust.toValidation(testValidationImplementation)).to.eql(expectedRight);
        });
      });
    });

    describe("Algebraic Laws", () => {
      Applicative(Just);
      Apply(Just);
      Chain(Just);
      Extend(Just);
      Functor(Just);
      Monad(Just);
      Setoid(Just);
    });
  });
});
