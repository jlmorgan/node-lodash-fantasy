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
const Apply = require("./laws/Apply")(expect);
const Applicative = require("./laws/Applicative")(expect);
const Chain = require("./laws/Chain")(expect);
const Extend = require("./laws/Extend")(expect);
const Monad = require("./laws/Monad")(expect);
const Functor = require("./laws/Functor")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Maybe = include("data/Maybe");

// Project Aliases
const Nothing = Maybe.Nothing;
const Just = Maybe.Just;

describe("Maybe", () => {
  describe(".all", () => {
    describe("nothings", () => {
      const testValue = true;
      const testMaybes = [Nothing.from(), Nothing.from(), Just.from(testValue)];
      const expectedResult = null;
      let actualResult = null;

      before(() => actualResult = Maybe.all(testMaybes));

      it("should return an instance of Nothing", () => expect(actualResult).to.be.instanceof(Nothing));
      it("should return a singular nothing of all values", () => expect(actualResult.value).to.eql(expectedResult));
    });

    describe("justs", () => {
      const testValue = true;
      const testMaybes = [Just.from(testValue), Just.from(testValue)];
      const expectedResult = [testValue, testValue];
      let actualResult = null;

      before(() => actualResult = Maybe.all(testMaybes));

      it("should return an instance of Just", () => expect(actualResult).to.be.instanceof(Just));
      it("should return a singular validation of all values", () => expect(actualResult.value).to.eql(expectedResult));
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
      const testValue1 = true;
      const testValue2 = false;
      const testMessage1 = "Test error 1";
      const testMaybes = [Nothing.from(testMessage1), Just.from(testValue1), Just.from(testValue2)];
      let actualResult = null;

      before(() => actualResult = Maybe.any(testMaybes));

      it("should return an instance of Just", () => expect(actualResult).to.be.instanceof(Just));
      it("should return the first justful validation", () => expect(actualResult.value).to.equal(testValue1));
    });
  });

  describe(".each", () => {
    const testMessage = "Test error";
    const testValue = false;
    const testCollection = [
      Nothing.from(testMessage),
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
    it("should return true for same values but same types", () => {
      const testValue = true;

      expect(Maybe.equals(Just.from(testValue), Just.from(testValue))).to.be.true;
    });

    it("should return false for same values but different types", () => {
      const testValue = true;

      expect(Maybe.equals(Nothing.from(testValue), Just.from(testValue))).to.be.false;
    });
  });

  describe(".isNothing", () => {
    const testMessage = "Test error";
    const testValue = true;

    it("should return true for a Nothing", () => expect(Maybe.isNothing(Nothing.from(testMessage))).to.be.true);
    it("should return false for a Just", () => expect(Maybe.isNothing(Just.from(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Maybe.isNothing(testValue)).to.be.false);
  });

  describe(".isJust", () => {
    const testMessage = "Test error";
    const testValue = true;

    it("should return false for a Nothing", () => expect(Maybe.isJust(Nothing.from(testMessage))).to.be.false);
    it("should return true for a Just", () => expect(Maybe.isJust(Just.from(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Maybe.isJust(testValue)).to.be.false);
  });

  describe(".mapIn", () => {
    const testValue = false;
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

  describe(".toPromise", () => {
    const testValue = false;
    const testNothing = Nothing.from();
    const testJust = Just.from(testValue);

    it("should reject with the value of a Nothing", () =>
      expect(Maybe.toPromise(testNothing)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Just", () =>
      expect(Maybe.toPromise(testJust)).to.eventually.equal(testValue)
    );
  });

  describe(".toPromiseWith", () => {
    const testValue = false;
    const testNothing = Nothing.from();
    const testJust = Just.from(testValue);

    it("should reject with the value of a Nothing", () =>
      expect(Maybe.toPromiseWith(Promise, testNothing)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Just", () =>
      expect(Maybe.toPromiseWith(Promise, testJust)).to.eventually.equal(testValue)
    );
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
        const testValue = true;
        const expectedResult = new Nothing(testValue);

        expect(Nothing.from()).to.eql(expectedResult);
      });

      describe("Nothing", () => {
        const testNothing = new Nothing();

        expect(Nothing.from(testNothing)).to.equal(testNothing);
      });

      describe("Just", () => {
        const testValue = true;
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

    describe("#isNothing", () => {
      it("should return true", () => expect(new Nothing().isNothing()).to.be.true);
    });

    describe("#isJust", () => {
      it("should return false", () => expect(new Nothing().isJust()).to.be.false);
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
      const testOrElse = true;
      let actualResult = null;

      before(() => actualResult = testNothing.orElse(testOrElse));

      it("should return the value passed to the orElse method", () => expect(actualResult).to.equal(testOrElse));
    });

    describe("#orElseGet", () => {
      it("should return the value supplied by the function passed", () => {
        const testValueSupplier = () => true;
        const expectedResult = true;

        expect(Nothing.from().orElseGet(testValueSupplier)).to.equal(expectedResult);
      });
    });

    describe("#orElseThrow", () => {
      const testNothing = new Nothing();

      it("should throw the supplied error", () => {
        const testMessage = "Test error message.";
        const testExceptionSupplier = () => new Error(testMessage);
        const testFn = () => testNothing.orElseThrow(testExceptionSupplier);

        expect(testFn).to.throw(testMessage);
      });
    });

    describe("#toPromise", () => {
      const testNothing = new Nothing();

      it("should return a Promise instance", () =>
        expect(testNothing.toPromise()).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have rejected the value", () =>
          expect(testNothing.toPromise()).to.be.rejectedWith(testNothing.value)
        );
      });
    });

    describe("#toPromiseWith", () => {
      const testNothing = new Nothing();
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testNothing.toPromiseWith(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have rejected the value", () =>
          expect(testNothing.toPromiseWith(testPromiseImplementation)).to.be.rejectedWith(testNothing.value)
        );
      });
    });

    describe("#toString", () => {
      const testNothing = new Nothing();

      it("should return a string containing the type and the values", () =>
        expect(testNothing.toString()).to.equal("Maybe.Nothing(null)")
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
      const testValue = true;

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
      const testArgument = true;
      const testJustFn = value => !value;
      const testJust = new Just(testJustFn);
      const testApplyValue = new Just(testArgument);
      let actualResult = null;

      before(() => actualResult = testJust.ap(testApplyValue));

      it("should return a new instance", () => expect(actualResult).to.not.equal(testJust));
      it("should call #map on the provided apply value", () => expect(actualResult.value).to.be.false);
    });

    describe("#chain", () => {
      const testValue = true;
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
      const testValue = true;
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
      it("should return null", () => {
        const testValue = true;

        expect(Just.from(testValue).get()).to.equal(testValue);
      });
    });

    describe("#ifJust", () => {
      const testValue = true;
      const testJust = new Just(testValue);
      const testIfJust = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testJust.ifJust(testIfJust));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should call the provided ifJust method", () => expect(testIfJust).to.be.calledWith(testValue));
    });

    describe("#ifNothing", () => {
      const testValue = true;
      const testJust = new Just(testValue);
      const testIfNothing = sinon.spy(() => true);
      let actualResult = null;

      before(() => actualResult = testJust.ifNothing(testIfNothing));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should not call the provided ifNothing method", () => expect(testIfNothing).to.not.be.called);
    });

    describe("#isNothing", () => {
      const testValue = true;

      it("should return false", () => expect(new Just(testValue).isNothing()).to.be.false);
    });

    describe("#isJust", () => {
      const testValue = true;

      it("should return true", () => expect(new Just(testValue).isJust()).to.be.true);
    });

    describe("#map", () => {
      const testValue = true;
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
      const testValue = true;
      const testJust = new Just(testValue);
      const testOrElseValue = false;
      let actualResult = null;

      before(() => actualResult = testJust.orElse(testOrElseValue));

      it("should return the value", () => expect(actualResult).to.eql(testValue));
    });

    describe("#orElseGet", () => {
      it("should return the value supplied by the function passed", () => {
        const testValue = true;
        const testValueSupplier = () => false;
        const expectedResult = true;

        expect(Just.from(testValue).orElseGet(testValueSupplier)).to.equal(expectedResult);
      });
    });

    describe("#orElseThrow", () => {
      const testValue = true;
      const testJust = new Just(testValue);
      const testOrElseThrow = sinon.spy(testValue => new Error(testValue));

      it("should not throw the supplied error", () => {
        const testFn = () => testJust.orElseThrow(testOrElseThrow);

        expect(testFn).to.not.throw();
      });

      it("should not call the provided method", () => expect(testOrElseThrow).to.not.be.called);
      it("should return the value", () => expect(testJust.orElseThrow()).to.eql(testValue));
    });

    describe("#toPromise", () => {
      const testValue = true;
      const testJust = new Just(testValue);

      it("should return a Promise instance", () =>
        expect(testJust.toPromise()).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have resolved the value", () =>
          expect(testJust.toPromise()).to.eventually.equal(testJust.value)
        );
      });
    });

    describe("#toPromiseWith", () => {
      const testValue = true;
      const testJust = new Just(testValue);
      const testPromiseImplementation = Promise;

      it("should return a Promise instance", () =>
        expect(testJust.toPromiseWith(testPromiseImplementation)).to.be.instanceof(Promise)
      );

      describe("Promise instance", () => {
        it("should have resolved the value", () =>
          expect(testJust.toPromiseWith(testPromiseImplementation)).to.eventually.equal(testJust.value)
        );
      });
    });

    describe("#toString", () => {
      const testValue = [true, false];
      const testJust = new Just(testValue);

      it("should return a string containing the type and the values", () =>
        expect(testJust.toString()).to.equal("Maybe.Just(true,false)")
      );
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
