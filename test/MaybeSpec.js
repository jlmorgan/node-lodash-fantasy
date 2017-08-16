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
const Alternative = require("./laws/Alternative")(expect);
const Applicative = require("./laws/Applicative")(expect);
const Apply = require("./laws/Apply")(expect);
const Chain = require("./laws/Chain")(expect);
const Either = require("../data/Either");
const Foldable = require("./laws/Foldable")(expect);
const Functor = require("./laws/Functor")(expect);
const Maybe = require("../data/Maybe");
const Monad = require("./laws/Monad")(expect);
const Setoid = require("./laws/Setoid")(expect);
const Validation = require("../data/Validation");

// Project Aliases
const nothing = Maybe.nothing;
const just = Maybe.just;

describe("Maybe", () => {
  const testValue = true;

  describe(".all", () => {
    describe("justs", () => {
      const testMaybes = [just(testValue), just(testValue)];
      const expectedResult = just([testValue, testValue]);
      let actualResult = null;

      before(() => actualResult = Maybe.all(testMaybes));

      it("should return a singular Just of all values", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("nothings", () => {
      const testMaybes = [nothing(), nothing(), just(testValue)];
      const expectedResult = nothing();
      let actualResult = null;

      before(() => actualResult = Maybe.all(testMaybes));

      it("should return Nothing", () => expect(actualResult).to.eql(expectedResult));
    });
  });

  describe(".alt", () => {
    it("should match instance result", () => {
      const testNothing = nothing();
      const testAlt = just(testValue);
      const expectedResult = testNothing.alt(testAlt);
      const actualResult = Maybe.alt(testAlt)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".any", () => {
    describe("justs", () => {
      const testValue1 = testValue;
      const testValue2 = !testValue;
      const testMaybes = [nothing(), just(testValue1), just(testValue2)];
      const expectedResult = just(testValue);
      let actualResult = null;

      before(() => actualResult = Maybe.any(testMaybes));

      it("should return the first Just of a value", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("nothings", () => {
      const testMaybes = [nothing(), nothing()];
      const expectedResult = nothing();
      let actualResult = null;

      before(() => actualResult = Maybe.any(testMaybes));

      it("should return Nothing", () => expect(actualResult).to.eql(expectedResult));
    });
  });

  describe(".ap", () => {
    it("should match instance result", () => {
      const testJust = just(testValue);
      const testApply = just(value => !value);
      const expectedResult = testJust.ap(testApply);
      const actualResult = Maybe.ap(testApply)(testJust);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".attempt", () => {
    it("should return a Nothing for a caught error", () => {
      const testFn = () => {
        throw new Error("Test error");
      };

      const expectedResult = nothing();
      const actualResult = Maybe.attempt(testFn);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return a Just of the value for a normal execution", () => {
      const testFn = () => testValue;
      const expectedResult = just(testValue);
      const actualResult = Maybe.attempt(testFn);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".catMaybes", () => {
    it("should return an empty array for a non-array", () => {
      const testList = null;
      const expectedResult = [];
      const actualResult = Maybe.catMaybes(testList);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should return values for populated list", () => {
      const testList = [
        just(1),
        just(2),
        nothing(),
        just(3)
      ];
      const expectedResult = [1, 2, 3];
      const actualResult = Maybe.catMaybes(testList);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".chain", () => {
    it("should match instance result", () => {
      const testJust = just(testValue);
      const testChain = value => just(!value);
      const expectedResult = testJust.chain(testChain);
      const actualResult = Maybe.chain(testChain)(testJust);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".checkedMap", () => {
    it("should match instance result", () => {
      const testJust = just(testValue);
      const testCheckedMap = () => {
        throw new Error();
      };

      const expectedResult = testJust.checkedMap(testCheckedMap);
      const actualResult = Maybe.checkedMap(testCheckedMap)(testJust);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".coalesce", () => {
    it("should alias Maybe.alt", () => {
      expect(Maybe.coalesce).to.equal(Maybe.alt);
    });
  });

  describe(".each", () => {
    const testCollection = [
      nothing(),
      just(testValue)
    ];

    describe("early terminate", () => {
      it("should iterate over each item in the collection until Nothing is returned", () => {
        let testCount = 0;
        const expectedCount = 1;

        Maybe.each(item => {
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

        Maybe.each(() => testCount += 1, testCollection);

        expect(testCount).to.equal(expectedCount);
      });
    });
  });

  describe(".equals", () => {
    it("should return true for same values but same types", () =>
      expect(Maybe.equals(just(testValue), just(testValue))).to.be.true
    );

    it("should return false for same values but different types", () =>
      expect(Maybe.equals(nothing(), just(testValue))).to.be.false
    );
  });

  describe(".empty", () => {
    it("should return Nothing", () => {
      const expectedResult = nothing();
      const actualResult = Maybe.empty();

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".filter", () => {
    it("should match instance result", () => {
      const testJust = just(testValue);
      const testFilter = F.constant(false);
      const expectedResult = testJust.filter(testFilter);
      const actualResult = Maybe.filter(testFilter)(testJust);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".flatMap", () => {
    it("should alias Maybe.chain", () => {
      expect(Maybe.flatMap).to.equal(Maybe.chain);
    });
  });

  describe(".fmap", () => {
    it("should match instance result", () => {
      const testJust = just(testValue);
      const testFmap = value => !value;
      const expectedResult = testJust.fmap(testFmap);
      const actualResult = Maybe.fmap(testFmap)(testJust);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".foldl", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testNothing = nothing();
      const testLeftFold = (value, defaultValue) => defaultValue;
      const expectedResult = testNothing.foldl(testLeftFold, testDefaultValue);
      const actualResult = Maybe.foldl(testLeftFold, testDefaultValue)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".foldr", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testNothing = nothing();
      const testRightFold = defaultValue => defaultValue;
      const expectedResult = testNothing.foldr(testRightFold, testDefaultValue);
      const actualResult = Maybe.foldr(testRightFold, testDefaultValue)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".from", () => {
    const testJust = just(testValue);
    const testNothing = nothing();
    const testParams = [
      {
        testValue: [1, 2, 3],
        expectedResult: just(1)
      },
      {
        testValue: testJust,
        expectedResult: testJust
      },
      {
        testValue: testNothing,
        expectedResult: testNothing
      },
      {
        testValue: undefined,
        expectedResult: nothing()
      },
      {
        testValue: null,
        expectedResult: nothing()
      },
      {
        testValue: true,
        expectedResult: just(true)
      }
    ];

    each(
      testParam => it(
        `should return a Maybe for '${testParam.testValue}'`,
        () => expect(Maybe.from(testParam.testValue)).to.eql(testParam.expectedResult)
      ),
      testParams
    );
  });

  describe(".fromJust", () => {
    it("should return the underlying value for Just", () => {
      const testJust = just(testValue);
      const actualResult = Maybe.fromJust(testJust);

      expect(actualResult).to.eql(testValue);
    });

    it("should throw an error for Nothing", () => {
      const testNothing = nothing();
      const testFn = () => Maybe.fromJust(testNothing);

      expect(testFn).to.throw("Maybe.fromJust: instance of maybe must be a Just");
    });

    it("should throw an error for non-Maybe", () => {
      const testFn = () => Maybe.fromJust(testValue);

      expect(testFn).to.throw("Maybe.fromJust: instance of maybe must be a Just");
    });
  });

  describe(".getOrElse", () => {
    it("should match instance result", () => {
      const testNothing = nothing();
      const expectedResult = testNothing.getOrElse(!testValue);
      const actualResult = Maybe.getOrElse(!testValue)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".getOrElseGet", () => {
    it("should match instance result", () => {
      const testNothing = nothing();
      const testSupplier = () => !testValue;
      const expectedResult = testNothing.getOrElseGet(testSupplier);
      const actualResult = Maybe.getOrElseGet(testSupplier)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".ifJust", () => {
    const testJust = just(testValue);
    const testConsumer = sinon.spy(F.noop);
    let actualResult = null;

    before(() => actualResult = Maybe.ifJust(testConsumer)(testJust));

    it("should return the instance", () => expect(actualResult).to.equal(testJust));
    it("should call the provided ifJust consumer", () => expect(testConsumer).to.be.calledWith(testValue));
  });

  describe(".ifNothing", () => {
    const testNothing = nothing();
    const testCallable = sinon.spy(F.noop);
    let actualResult = null;

    before(() => actualResult = Maybe.ifNothing(testCallable)(testNothing));

    it("should return the instance", () => expect(actualResult).to.equal(testNothing));
    it("should call the provided ifNothing callable", () => expect(testCallable).to.be.called);
  });

  describe(".isJust", () => {
    it("should return false for a Nothing", () => expect(Maybe.isJust(nothing())).to.be.false);
    it("should return true for a Just", () => expect(Maybe.isJust(just(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Maybe.isJust(testValue)).to.be.false);
  });

  describe(".isMaybe", () => {
    it("should return false for a Nothing", () => expect(Maybe.isMaybe(nothing())).to.be.true);
    it("should return true for a Just", () => expect(Maybe.isMaybe(just(testValue))).to.be.true);
    it("should return false for an arbitrary value", () => expect(Maybe.isMaybe(testValue)).to.be.false);
  });

  describe(".isNothing", () => {
    it("should return true for a Nothing", () => expect(Maybe.isNothing(nothing())).to.be.true);
    it("should return false for a Just", () => expect(Maybe.isNothing(just(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Maybe.isNothing(testValue)).to.be.false);
  });

  describe(".isNotJust", () => {
    it("should return true for a Nothing", () => expect(Maybe.isNotJust(nothing())).to.be.true);
    it("should return false for a Just", () => expect(Maybe.isNotJust(just(testValue))).to.be.false);
    it("should return true for an arbitrary value", () => expect(Maybe.isNotJust(testValue)).to.be.true);
  });

  describe(".isNotMaybe", () => {
    it("should return false for a Nothing", () => expect(Maybe.isNotMaybe(nothing())).to.be.false);
    it("should return true for a Just", () => expect(Maybe.isNotMaybe(just(testValue))).to.be.false);
    it("should return false for an arbitrary value", () => expect(Maybe.isNotMaybe(testValue)).to.be.true);
  });

  describe(".isNotNothing", () => {
    it("should return false for a Nothing", () => expect(Maybe.isNotNothing(nothing())).to.be.false);
    it("should return true for a Just", () => expect(Maybe.isNotNothing(just(testValue))).to.be.true);
    it("should return true for an arbitrary value", () => expect(Maybe.isNotNothing(testValue)).to.be.true);
  });

  describe(".just", () => {
    const testValue = true;

    it("should return an instance of Just for value", () => expect(Maybe.just(testValue).isJust()).to.be.true);
    it("should throw an error for null", () => {
      const testFn = () => Maybe.just(null);

      expect(testFn).to.throw();
    });

    it("should throw an error for undefined", () => {
      const testFn = () => Maybe.just();

      expect(testFn).to.throw();
    });
  });

  describe(".lift", () => {
    it("should return an empty list for null list", () => {
      const testCollection = null;
      const expectedResult = [];
      const actualResult = Maybe.lift(value => !value, testCollection);

      expect(actualResult).to.be.eql(expectedResult);
    });

    it("should map each value in the collection", () => {
      const testCollection = [nothing(), just(testValue)];
      const expectedResult = [nothing(), just(!testValue)];
      const actualResult = Maybe.lift(value => !value, testCollection);

      expect(actualResult).to.be.eql(expectedResult);
    });
  });

  describe(".map", () => {
    it("should alias Maybe.fmap", () => {
      expect(Maybe.map).to.equal(Maybe.fmap);
    });
  });

  describe(".mapMaybe", () => {
    it("should return an empty array for a non-array", () => {
      const testValues = null;
      const expectedResult = [];
      const actualResult = Maybe.mapMaybe(Maybe.ofNullable, testValues);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should map value through Maybe", () => {
      const testValues = [undefined, null, 0, 1, true, false, {}, []];
      const expectedResult = [0, 1, true, false, {}, []];
      const actualResult = Maybe.mapMaybe(Maybe.ofNullable)(testValues);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".maybe", () => {
    it("should return the mapped default value for Nothing", () => {
      const testDefaultValue = true;
      const testNothing = nothing();
      const testMorphism = value => !value;
      const actualResult = Maybe.maybe(testDefaultValue, testMorphism)(testNothing);

      expect(actualResult).to.equal(testDefaultValue);
    });

    it("should return the mapped value for Just", () => {
      const testDefaultValue = 1;
      const testJust = just(10);
      const testMorphism = value => value + 1;
      const expectedResult = 11;
      const actualResult = Maybe.maybe(testDefaultValue)(testMorphism)(testJust);

      expect(actualResult).to.equal(expectedResult);
    });
  });

  describe(".of", () => {
    it("should alias Maybe.pure", () => expect(Maybe.of).to.equal(Maybe.pure));
  });

  describe(".ofNullable", () => {
    const testNullableValues = [undefined, null];
    const testValues = [0, false, true, "", [], {}];

    each(
      testValue => it(
        `should return an instance of Nullable for '${testValue}'`,
        () => expect(Maybe.ofNullable(testValue)).to.eql(nothing())
      ),
      testNullableValues
    );

    each(
      testValue => it(
        `should return an instance of Just for '${testValue}'`,
        () => expect(Maybe.ofNullable(testValue)).to.eql(just(testValue))
      ),
      testValues
    );
  });

  describe(".pure", () => {
    it("should return a Just", () => {
      const expectedResult = just(testValue);
      const actualResult = Maybe.pure(testValue);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".recover", () => {
    it("should match instance result", () => {
      const testNothing = nothing();
      const expectedResult = testNothing.recover(testValue);
      const actualResult = Maybe.recover(testValue)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".reduce", () => {
    it("should match instance result", () => {
      const testDefaultValue = testValue;
      const testNothing = nothing();
      const testLeftFold = (value, defaultValue) => defaultValue;
      const expectedResult = testNothing.reduce(testLeftFold, testDefaultValue);
      const actualResult = Maybe.reduce(testLeftFold, testDefaultValue)(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".tap", () => {
    const testJust = just(testValue);
    const testCallable = sinon.spy(F.noop);
    const testConsumer = sinon.spy(F.identity);
    let actualResult = null;

    before(() => actualResult = Maybe.tap(testCallable, testConsumer)(testJust));

    it("should return the instance", () => expect(actualResult).to.equal(testJust));
    it("should not call the provided callable", () => expect(testCallable).to.not.be.called);
    it("should call the provided consumer", () => expect(testConsumer).to.be.calledWith(testValue));
  });

  describe(".toArray", () => {
    it("should match instance result", () => {
      const testNothing = nothing();
      const expectedResult = testNothing.toArray();
      const actualResult = Maybe.toArray(testNothing);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toEither", () => {
    const testEitherImplementation = Either;

    it("should convert the Nothing to a Left", () => {
      const testNothing = nothing();
      const expectedResult = Either.left(null);
      const actualResult = Maybe.toEither(testEitherImplementation, testNothing);

      expect(actualResult).to.eql(expectedResult);
    });

    it("should convert the Just to a Right", () => {
      const testJust = just(testValue);
      const expectedResult = Either.right(testValue);
      const actualResult = Maybe.toEither(testEitherImplementation, testJust);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe(".toPromise", () => {
    const testNothing = nothing();
    const testJust = just(testValue);
    const testPromiseImplementation = Promise;

    it("should reject with the value of a Nothing", () =>
      expect(Maybe.toPromise(testPromiseImplementation, testNothing)).to.eventually.be.rejectedWith(testValue)
    );

    it("should resolve with the value of a Just", () =>
      expect(Maybe.toPromise(testPromiseImplementation, testJust)).to.eventually.equal(testValue)
    );
  });

  describe(".toValidation", () => {
    const testNothing = nothing();
    const testJust = just(testValue);
    const testValidationImplementation = Validation;

    it("should convert the Nothing to a Failure", () =>
      expect(Maybe.toValidation(testValidationImplementation, testNothing).isFailure()).to.be.true
    );

    it("should convert the Just to a Success", () =>
      expect(Maybe.toValidation(testValidationImplementation, testJust).isSuccess()).to.be.true
    );

    it("should contain the value of the Success", () => {
      // TODO: Remove the `new` once Validation is updated.
      const expectedResult = Validation.success(testValue);

      expect(Maybe.toValidation(testValidationImplementation, testJust)).to.eql(expectedResult);
    });
  });

  describe(".zero", () => {
    it("should return Nothing", () => {
      const expectedResult = nothing();
      const actualResult = Maybe.zero();

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe("Just", () => {
    describe("constructor", () => {
      it("should return a new instance of Just", () => expect(just(testValue).isJust()).to.be.true);
    });

    describe("#alt", () => {
      it("should return the instance", () => {
        const testJust = just(testValue);
        const testAlt = just(!testValue);
        const actualResult = testJust.alt(testAlt);

        expect(actualResult).to.equal(testJust);
      });
    });

    describe("#ap", () => {
      const testJust = just(testValue);
      const testApplyFunction = sinon.spy(value => !value);
      const testApply = just(testApplyFunction);
      const expectedResult = just(!testValue);
      let actualResult = null;

      before(() => actualResult = testJust.ap(testApply));

      it("should not call the provided apply morphism", () => expect(testApplyFunction).to.be.calledWith(testValue));
      it("should apply morphism", () => expect(actualResult).to.eql(expectedResult));
    });

    describe("#chain", () => {
      const testJust = just(testValue);

      describe("Nothing result", () => {
        const testChain = sinon.spy(() => nothing());
        const expectedResult = nothing();
        let actualResult = null;

        before(() => actualResult = testJust.chain(testChain));

        it("should return the nothing instance", () => expect(actualResult).to.be.eql(expectedResult));
      });

      describe("Just wrapped result", () => {
        const testChain = sinon.spy(value => just(!value));
        const expectedResult = just(!testValue);
        let actualResult = null;

        before(() => actualResult = testJust.chain(testChain));

        it("should return the Just instance", () => expect(actualResult).to.be.eql(expectedResult));
      });

      describe("unwrapped result", () => {
        it("should throw an error", () => {
          const testFunction = sinon.spy(value => !value);
          const testFn = () => testJust.chain(testFunction);

          expect(testFn).to.throw();
        });
      });
    });

    describe("#checkedMap", () => {
      const testJust = just(testValue);
      const testCheckedMap = sinon.spy(function() {
        throw new Error();
      });
      const expectedResult = nothing();
      let actualResult = null;

      before(() => actualResult = testJust.checkedMap(testCheckedMap));

      it("should return Nothing", () => expect(actualResult).to.eql(expectedResult));
      it("should call the provided morphism", () => expect(testCheckedMap).to.be.calledWith(testValue));
    });

    describe("#coalesce", () => {
      it("should alias Maybe#alt", () => {
        const testJust = just(testValue);
        const testAlt = just(!testValue);
        const expectedResult = testJust.alt(testAlt);
        const actualResult = testJust.coalesce(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#equals", () => {
      const testJust1 = just(testValue);
      const testJust2 = just(testValue);
      const testJust3 = just(!testValue);

      it("should return true for instances with the same value", () =>
        expect(testJust1.equals(testJust2)).to.be.true
      );

      it("should return false for instances with a different value", () =>
        expect(testJust1.equals(testJust3)).to.be.false
      );
    });

    describe("#filter", () => {
      const testJust = just(testValue);

      it("should return Nothing for false predicate", () => {
        const testPredicate = F.constant(false);
        const expectedResult = nothing();
        const actualResult = testJust.filter(testPredicate);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should return Just for true predicate", () => {
        const testPredicate = F.constant(true);
        const actualResult = testJust.filter(testPredicate);

        expect(actualResult).to.equal(testJust);
      });
    });

    describe("#flatMap", () => {
      it("should alias Maybe#chain", () => {
        const testJust = just(testValue);
        const testChain = value => just(!value);
        const expectedResult = testJust.chain(testChain);
        const actualResult = testJust.flatMap(testChain);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#fmap", () => {
      const testJust = just(testValue);
      const testMap = sinon.spy(value => !value);
      const expectedResult = just(!testValue);
      let actualResult = null;

      before(() => actualResult = testJust.fmap(testMap));

      it("should return a Just of value", () => expect(actualResult).to.eql(expectedResult));
      it("should call the provided morphism", () => expect(testMap).to.be.calledWith(testValue));
    });

    describe("#foldl", () => {
      it("should return the default value", () => {
        const testJust = just(testValue);
        const testDefaultValue = !testValue;
        const testLeftFold = (value, defaultValue) => defaultValue;
        const actualResult = testJust.foldl(testLeftFold)(testDefaultValue);

        expect(actualResult).to.eql(testValue);
      });
    });

    describe("#foldr", () => {
      it("should return the default value", () => {
        const testJust = just(testValue);
        const testDefaultValue = !testValue;
        const testRightFold = defaultValue => defaultValue;
        const actualResult = testJust.foldr(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(testValue);
      });
    });

    describe("#getOrElse", () => {
      it("should return other value", () => {
        const testJust = just(testValue);
        const testOtherValue = !testValue;

        expect(testJust.getOrElse(testOtherValue)).to.equal(testValue);
      });
    });

    describe("#getOrElseGet", () => {
      it("should return other supplied value", () => {
        const testJust = just(testValue);
        const testOtherValueSupplier = F.constant(!testValue);

        expect(testJust.getOrElseGet(testOtherValueSupplier)).to.equal(testValue);
      });
    });

    describe("#getOrElseThrow", () => {
      it("should return the value", () => {
        const testJust = just(testValue);
        const testErrorSupplier = F.constant(new Error());

        expect(testJust.getOrElseThrow(testErrorSupplier)).to.equal(testValue);
      });
    });

    describe("#ifJust", () => {
      const testJust = just(testValue);
      const testIfJust = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testJust.ifJust(testIfJust));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should call the provided ifJust consumer", () => expect(testIfJust).to.be.calledWith(testValue));
    });

    describe("#ifNothing", () => {
      const testJust = just(testValue);
      const testIfNothing = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testJust.ifNothing(testIfNothing));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should not call the provided ifNothing callable", () => expect(testIfNothing).to.not.be.called);
    });

    describe("#isJust", () => {
      it("should return true", () => expect(just(testValue).isJust()).to.be.true);
    });

    describe("#isNothing", () => {
      it("should return false", () => expect(just(testValue).isNothing()).to.be.false);
    });

    describe("#map", () => {
      it("should alias Maybe#fmap", () => {
        const testJust = just(testValue);
        const testMap = value => !value;
        const expectedResult = testJust.fmap(testMap);
        const actualResult = testJust.map(testMap);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#of", () => {
      it("should return an instance of Just of the value", () => {
        const testJust = just(testValue);
        const expectedResult = just(!testValue);
        const actualResult = testJust.of(!testValue);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#recover", () => {
      it("should return the instance", () => {
        const testJust = just(testValue);
        const actualResult = testJust.recover(!testValue);

        expect(actualResult).to.equal(testJust);
      });
    });

    describe("#reduce", () => {
      it("should alias Maybe#foldl", () => {
        const testJust = just(testValue);
        const testDefaultValue = !testValue;
        const testRightFold = defaultValue => defaultValue;
        const expectedResult = testJust.foldl(testRightFold, testDefaultValue);
        const actualResult = testJust.reduce(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#tap", () => {
      const testJust = just(testValue);
      const testCallable = sinon.spy(F.noop);
      const testConsumer = sinon.spy(F.identity);
      let actualResult = null;

      before(() => actualResult = testJust.tap(testCallable)(testConsumer));

      it("should return the instance", () => expect(actualResult).to.equal(testJust));
      it("should not call the provided callable", () => expect(testCallable).to.not.be.called);
      it("should call the provided consumer", () => expect(testConsumer).to.be.calledWith(testValue));
    });

    describe("#toArray", () => {
      it("should return an array of the value", () => {
        const testJust = just(testValue);
        const expectedResult = [testValue];
        const actualResult = testJust.toArray();

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toEither", () => {
      it("should contain the value of the Just", () => {
        const testJust = just(testValue);
        const testEitherImplementation = Either;
        const expectedResult = Either.right(testValue);
        const actualResult = testJust.toEither(testEitherImplementation);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toPromise", () => {
      it("should have resolved the value", () => {
        const testJust = just(testValue);
        const testPromiseImplementation = Promise;
        const actualResult = testJust.toPromise(testPromiseImplementation);

        expect(actualResult).to.eventually.equal(testValue);
      });
    });

    describe("#toString", () => {
      it("should return a string containing the type and the values", () => {
        const testValues = [true, false];
        const testJust = just(testValues);
        const expectedResult = "Just(true,false)";
        const actualResult = testJust.toString();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#toValidation", () => {
      it("should contain the value of the Just", () => {
        const testJust = just(testValue);
        const testValidationImplementation = Validation;
        const expectedResult = Validation.success(testValue);
        const actualResult = testJust.toValidation(testValidationImplementation);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#zero", () => {
      it("should return Nothing", () => {
        const testJust = just(testValue);
        const expectedResult = nothing();
        const actualResult = testJust.zero();

        expect(actualResult).to.eql(expectedResult);
      });
    });
  });

  describe("Nothing", () => {
    describe("constructor", () => {
      it("should return a new instance of Nothing", () => expect(nothing().isNothing()).to.be.true);
    });

    describe("#alt", () => {
      it("should return the Just alternative", () => {
        const testNothing = nothing();
        const testAlt = just(testValue);
        const actualResult = testNothing.alt(testAlt);

        expect(actualResult).to.equal(testAlt);
      });

      it("should return the Just alternative supplier", () => {
        const testNothing = nothing();
        const testAlt = F.constant(just(testValue));
        const expectedResult = just(testValue);
        const actualResult = testNothing.alt(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should throw an error for a non-Maybe", () => {
        const testNothing = nothing();
        const testAlt = testValue;
        const testFn = () => testNothing.alt(testAlt);

        expect(testFn).to.throw("Maybe#alt: the provided other value must return an instance of Maybe");
      });
    });

    describe("#ap", () => {
      const testNothing = nothing();
      const testApplyFunction = sinon.spy(F.constant(true));
      const testApply = just(testApplyFunction);
      let actualResult = null;

      before(() => actualResult = testNothing.ap(testApply));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided apply morphism", () => expect(testApplyFunction).to.not.be.called);
    });

    describe("#chain", () => {
      const testNothing = nothing();
      const testChain = sinon.spy(() => just(testValue));
      let actualResult = null;

      before(() => actualResult = testNothing.chain(testChain));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided chain morphism", () => expect(testChain).to.not.be.called);
    });

    describe("#checkedMap", () => {
      const testNothing = nothing();
      const testCheckedMap = sinon.spy(F.constant(true));
      let actualResult = null;

      before(() => actualResult = testNothing.checkedMap(testCheckedMap));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided morphism", () => expect(testCheckedMap).to.not.be.called);
    });

    describe("#coalesce", () => {
      it("should alias Maybe#alt", () => {
        const testNothing = nothing();
        const testAlt = just(testValue);
        const expectedResult = testNothing.alt(testAlt);
        const actualResult = testNothing.coalesce(testAlt);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#equals", () => {
      it("should return true for instances with the same value", () => {
        const testMaybe1 = nothing();
        const testMaybe2 = nothing();

        expect(testMaybe1.equals(testMaybe2)).to.be.true;
      });

      it("should return false for differing instances", () => {
        const testMaybe1 = nothing();
        const testMaybe2 = just(testValue);

        expect(testMaybe1.equals(testMaybe2)).to.be.false;
      });
    });

    describe("#filter", () => {
      const testNothing = nothing();
      const testFilter = sinon.spy(F.constant(false));
      let actualResult = null;

      before(() => actualResult = testNothing.filter(testFilter));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided filter", () => expect(testFilter).to.not.be.called);
    });

    describe("#flatMap", () => {
      it("should alias Maybe#chain", () => {
        const testNothing = nothing();
        const testChain = value => just(!value);
        const expectedResult = testNothing.chain(testChain);
        const actualResult = testNothing.flatMap(testChain);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#fmap", () => {
      const testNothing = nothing();
      const testMap = sinon.spy(F.constant(true));
      let actualResult = null;

      before(() => actualResult = testNothing.fmap(testMap));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided morphism", () => expect(testMap).to.not.be.called);
    });

    describe("#foldl", () => {
      it("should return the default value", () => {
        const testNothing = nothing();
        const testDefaultValue = !testValue;
        const testLeftFold = (value, defaultValue) => defaultValue;
        const actualResult = testNothing.foldl(testLeftFold)(testDefaultValue);

        expect(actualResult).to.eql(testDefaultValue);
      });
    });

    describe("#foldr", () => {
      it("should return the default value", () => {
        const testNothing = nothing();
        const testDefaultValue = !testValue;
        const testRightFold = F.identity;
        const actualResult = testNothing.foldr(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(testDefaultValue);
      });
    });

    describe("#getOrElse", () => {
      it("should return other value", () => {
        const testNothing = nothing();

        expect(testNothing.getOrElse(testValue)).to.equal(testValue);
      });
    });

    describe("#getOrElseGet", () => {
      it("should return other supplied value", () => {
        const testNothing = nothing();
        const testOtherValueSupplier = () => testValue;

        expect(testNothing.getOrElseGet(testOtherValueSupplier)).to.equal(testValue);
      });
    });

    describe("#getOrElseThrow", () => {
      it("should throw an error", () => {
        const testErrorSupplier = () => new Error("Test Error");
        const testFn = () => nothing().getOrElseThrow(testErrorSupplier);

        expect(testFn).to.throw("Test Error");
      });
    });

    describe("#ifJust", () => {
      const testNothing = nothing();
      const testIfJust = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testNothing.ifJust(testIfJust));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should not call the provided ifJust consumer", () => expect(testIfJust).to.not.be.called);
    });

    describe("#ifNothing", () => {
      const testNothing = nothing();
      const testIfNothing = sinon.spy(F.noop);
      let actualResult = null;

      before(() => actualResult = testNothing.ifNothing(testIfNothing));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should call the provided ifNothing callable", () => expect(testIfNothing).to.be.called);
    });

    describe("#isJust", () => {
      it("should return false", () => expect(nothing().isJust()).to.be.false);
    });

    describe("#isNothing", () => {
      it("should return true", () => expect(nothing().isNothing()).to.be.true);
    });

    describe("#map", () => {
      it("should alias Maybe#fmap", () => {
        const testNothing = nothing();
        const testMap = value => !value;
        const expectedResult = testNothing.fmap(testMap);
        const actualResult = testNothing.map(testMap);

        expect(expectedResult).to.eql(actualResult);
      });
    });

    describe("#of", () => {
      it("should return an instance of Just of the value", () => {
        const testNothing = nothing();
        const expectedResult = just(!testValue);
        const actualResult = testNothing.of(!testValue);

        expect(actualResult).to.be.eql(expectedResult);
      });
    });

    describe("#recover", () => {
      it("should return a Just of the recover value", () => {
        const testNothing = nothing();
        const expectedResult = just(testValue);
        const actualResult = testNothing.recover(testValue);

        expect(actualResult).to.eql(expectedResult);
      });

      it("should return a Just of the recover value supplier", () => {
        const testNothing = nothing();
        const expectedResult = just(testValue);
        const actualResult = testNothing.recover(F.constant(testValue));

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#reduce", () => {
      it("should alias Maybe#foldl", () => {
        const testNothing = nothing();
        const testDefaultValue = !testValue;
        const testRightFold = defaultValue => defaultValue;
        const expectedResult = testNothing.foldl(testRightFold, testDefaultValue);
        const actualResult = testNothing.reduce(testRightFold)(testDefaultValue);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#tap", () => {
      const testNothing = nothing();
      const testCallable = sinon.spy(F.noop);
      const testConsumer = sinon.spy(F.identity);
      let actualResult = null;

      before(() => actualResult = testNothing.tap(testCallable)(testConsumer));

      it("should return the instance", () => expect(actualResult).to.equal(testNothing));
      it("should call the provided callable", () => expect(testCallable).to.be.called);
      it("should not call the provided consumer", () => expect(testConsumer).to.not.be.called);
    });

    describe("#toArray", () => {
      it("should return an empty array", () => {
        const testNothing = nothing();
        const expectedResult = [];
        const actualResult = testNothing.toArray();

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toEither", () => {
      it("should return a Either instance", () => {
        const testNothing = nothing();
        const testEitherImplementation = Either;
        const expectedResult = Either.left(null);
        const actualResult = testNothing.toEither(testEitherImplementation);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#toPromise", () => {
      it("should have rejected the value", () => {
        const testNothing = nothing();
        const testPromiseImplementation = Promise;
        const actualResult = testNothing.toPromise(testPromiseImplementation);

        expect(actualResult).to.be.rejectedWith(null);
      });
    });

    describe("#toString", () => {
      it("should return a string containing the type and the values", () => {
        const testNothing = nothing();
        const expectedResult = "Nothing()";
        const actualResult = testNothing.toString();

        expect(actualResult).to.equal(expectedResult);
      });
    });

    describe("#toValidation", () => {
      it("should return a Validation instance", () => {
        const testNothing = nothing();
        const testValidationImplementation = Validation;
        const expectedResult = Validation.failure([null]);
        const actualResult = testNothing.toValidation(testValidationImplementation);

        expect(actualResult).to.eql(expectedResult);
      });
    });

    describe("#zero", () => {
      it("should return Nothing", () => {
        const testNothing = nothing();
        const expectedResult = nothing();
        const actualResult = testNothing.zero();

        expect(actualResult).to.eql(expectedResult);
      });
    });
  });

  describe("Algebraic Laws", () => {
    Alternative(Maybe);
    Applicative(Maybe);
    Apply(Maybe);
    Chain(Maybe);
    Foldable(Maybe);
    Functor(Maybe);
    Monad(Maybe);
    Setoid(Maybe);
  });
});
