"use strict";

// Third Party
const include = require("include")(__dirname);
const stream = require("lodash/fp");

// Third Party Aliases
const concat = stream.concat;
const curry = stream.curry;
const each = stream.each;
const filter = stream.filter;
const find = stream.find;
const flow = stream.flow;
const get = stream.get;
const isEqual = stream.isEqual;
const isNull = stream.isNull;
const isUndefined = stream.isUndefined;
const map = stream.map;
const negate = stream.negate;
const reduce = stream.reduce;

// Project
const invokeIn = include("src/invokeIn");

/**
 * The {@link Maybe} type is intended for values that may or may not be null or undefined. It is a disjunction similar
 * to <code>Either</code>. The key difference of the {@link Maybe} type is the focus on a value or nothing. Much like
 * <code>Either</code>, {@link Maybe} is right-biased.
 * @param {*} value - Value to wrap.
 * @return {Maybe} {@link Maybe} wrapped <code>value</code>.
 * @example <caption>Via <code>new</code></caption>
 *
 * const v1 = new Just(value);
 * const v2 = new Nothing();
 *
 * @example <caption>Via function</caption>
 *
 * const v3 = Just.from(value);
 * const v4 = Nothing.from();
 *
 * @example <caption>Via Maybe function</caption>
 *
 * const getOr = require("lodash/fp/getOr");
 * const Maybe = require("lodash-fantasy/data/Maybe");
 *
 * function getValue(path, context) {
 *   return getOr(Maybe.Nothing.from(), path, context);
 * }
 *
 * module.exports = getValue;
 */
class Maybe {
  /**
   * @static
   * @property {Just} Just - Maybe just.
   */
  static get Just() {
    return Just;
  }

  /**
   * @static
   * @property {Nothing} Nothing - Maybe nothing.
   */
  static get Nothing() {
    return Nothing;
  }

  /**
   * Returns a {@link Maybe} that resolves all of the maybes in the collection into a single Maybe.
   * @static
   * @member
   * @param {Maybe[]} maybes - Collection of maybes.
   * @return {Maybe} A {@link Maybe} representing all {@link Just} values or a singular {@link Nothing}.
   * @example
   *
   * const m1 = getArbitraryProperty(context1);
   * // => Just(context1)
   *
   * const m2 = getArbitraryProperty(context2);
   * // => Just(context2)
   *
   * const m3 = getArbitraryProperty(context3);
   * // => Nothing()
   *
   * const m4 = getArbitraryProperty(context4);
   * // => Nothing()
   *
   * Maybe.all([m1, m2]);
   * // => Just([context1, context2])
   *
   * Maybe.all([m1, m2, m3]);
   * // => Nothing()
   *
   * Maybe.all([m1, m2, m3, m4]);
   * // => Nothing()
   */
  static all(maybes) {
    return find(Maybe.isNothing, maybes) || Maybe.of(stream(maybes).map(get("value")).reduce(concat, []));
  }

  /**
   * Returns the first {@link Just} in the collection or finally a {@link Nothing}.
   * @static
   * @member
   * @param {Maybe[]} maybes - Collection of maybes.
   * @return {Maybe} First {@link Just} or finally a {@link Nothing}.
   * @example
   *
   * const m1 = getArbitraryProperty(context1);
   * // => Just(context1)
   *
   * const m2 = getArbitraryProperty(context2);
   * // => Just(context2)
   *
   * const m3 = getArbitraryProperty(context3);
   * // => Nothing()
   *
   * const m4 = getArbitraryProperty(context4);
   * // => Nothing()
   *
   * Maybe.any([m1, m2]);
   * // => Just(context1)
   *
   * Maybe.any([m2, m3]);
   * // => Just(context2)
   *
   * Maybe.any([m3, m4]);
   * // => Nothing()
   */
  static any(maybes) {
    return find(Maybe.isJust, maybes) || new Nothing();
  }

  /**
   * Creates a new {@link Maybe} from a <code>value</code>. If the <code>value</code> is already a {@link Maybe}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Just} is made with the
   * <code>value</code>.
   * @static
   * @member
   * @param {*} value - Value to wrap in a {@link Maybe}.
   * @return {Maybe} {@link Maybe} when is the <code>value</code> already wrapped or {@link Just} wrapped
   * <code>value</code>.
   *
   * Maybe.from();
   * // => Just()
   *
   * Maybe.from(true);
   * // => Just(true)
   *
   * Maybe.from(Just.from(value));
   * // => Just(value)
   *
   * Maybe.from(Nothing.from());
   * // => Nothing()
   */
  static from(value) {
    return this.isMaybe(value) ? value : this.ofNullable(value);
  }

  /**
   * Determines whether or not the value is a {@link Just}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Just}; <code>false</code> for {@link Nothing}.
   * @example
   *
   * isJust();
   * // => false
   *
   * isJust(null);
   * // => false
   *
   * isJust(Just.from());
   * // => true
   *
   * isJust(Nothing.from());
   * // => false
   */
  static isJust(value) {
    return value instanceof Just;
  }

  /**
   * Determines whether or not the value is a {@link Maybe}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Maybe}; <code>false</code> for anything else.
   * @example
   *
   * isMaybe();
   * // => false
   *
   * isMaybe(null);
   * // => false
   *
   * isMaybe(Just.from());
   * // => true
   *
   * isMaybe(Nothing.from());
   * // => true
   */
  static isMaybe(value) {
    return value instanceof Maybe;
  }

  /**
   * Determines whether or not the value is a {@link Nothing}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Nothing}; <code>false</code> for {@link Just}.
   * @example
   *
   * isNothing();
   * // => false
   *
   * isNothing(null);
   * // => false
   *
   * isNothing(Nothing.from());
   * // => true
   *
   * isNothing(Just.from());
   * // => false
   */
  static isNothing(value) {
    return value instanceof Nothing;
  }

  /**
   * Wraps the <code>value</code> in a {@link Just}. No parts of <code>value</code> are checked.
   * @static
   * @member
   * @param {*} value - Value to wrap.
   * @return {Just} {@link Just} wrapped <code>value</code>.
   * @example
   *
   * Maybe.of();
   * // => Just()
   *
   * Maybe.of(true);
   * // => Just(true)
   *
   * Maybe.of(Just.from(value));
   * // => Just(Just(value))
   *
   * Maybe.of(Nothing.from());
   * // => Just(Nothing())
   */
  static of(value) {
    return new Just(value);
  }

  /**
   * Wraps the <code>value</code> in a {@link Just} if the value is not <code>null</code>, <code>undefined</code>, or
   * {@link Nothing}.
   * @static
   * @member
   * @param {*} value - Value to wrap.
   * @return {Maybe} {@link Just} wrapped <code>value</code> or {@link Nothing}.
   * @example
   *
   * Maybe.ofNullable();
   * // => Nothing()
   *
   * Maybe.ofNullable(null);
   * // => Nothing()
   *
   * Maybe.ofNullable(true);
   * // => Just(true)
   *
   * Maybe.ofNullable(Just.from(value));
   * // => Just(Just(value))
   *
   * Maybe.ofNullable(Nothing.from());
   * // => Nothing()
   */
  static ofNullable(value) {
    return isNull(value) || isUndefined(value) || Maybe.isNothing(value) ?
      new Nothing() :
      new Just(value);
  }

  /**
   * Tries to invoke a <code>supplier</code>. The result of the <code>supplier</code> is returned in a
   * {@link Just}. If an exception is thrown, a {@link Nothing} is returned. The <code>function</code> takes no
   * arguments.
   * @static
   * @member
   * @param {Supplier} supplier - Function to invoke.
   * @return {Maybe} {@link Just} wrapped supplier result or {@link Nothing} wrapped <code>error</code>.
   * @example
   *
   * Maybe.try(normalFunction);
   * // => Just(returnValue)
   *
   * Maybe.try(throwableFunction);
   * // => Nothing()
   */
  static try(method) {
    try {
      return Just.from(method());
    } catch (error) {
      return Nothing.from();
    }
  }

  constructor(value) {
    this.value = value;
  }

  /**
   * Applies the function contained in the instance of a {@link Just} to the value contained in the provided
   * {@link Just}, producing a {@link Just} containing the result. If the instance is a {@link Nothing}, the result
   * is the {@link Nothing} instance. If the instance is a {@link Just} and the provided {@link Maybe} is
   * {@link Nothing}, the result is the provided {@link Nothing}.
   * @abstract
   * @function ap
   * @memberof Maybe
   * @instance
   * @param {Maybe} other - Value to apply to the function wrapped in the {@link Just}.
   * @return {Maybe} {@link Just} wrapped applied function or {@link Nothing}.
   * @example <caption>Just#ap</caption>
   *
   * const findPerson = curryN(3, Person.find); // Person.find(name, birthdate, address)
   *
   * Just.from(findPerson) // => Just(findPerson)
   *   .ap(Just.ofNullable(name)) // => Just(name)
   *   .ap(Just.ofNullable(birthdate)) // => Just(birthdate)
   *   .ap(Just.ofNullable(address)) // => Just(address)
   *   .ifJust(console.log); // => Log Person.find() response
   */

  /**
   * Applies the provided function to the value contained for a {@link Just}. The function should return the value
   * wrapped in a {@link Maybe}. If the instance is a {@link Nothing}, the function is ignored and then instance is
   * returned unchanged.
   * @abstract
   * @function chain
   * @memberof Maybe
   * @instance
   * @param {Chain.<Maybe>} method - The function to invoke with the value.
   * @return {Maybe} {@link Maybe} wrapped value returned by the provided <code>method</code>.
   * @example <caption>Just#chain</caption>
   *
   * // Using lodash/fp/curry and get
   * const getConfigOption = curry((path, config) => Maybe.ofNullable(get(path, config));
   *
   * Maybe.ofNullable(config)
   *   .chain(getConfigOption("path.to.option"))
   */

  /**
   * Determines whether or not the <code>other</code> is equal in value to the current (<code>this</code>). This is
   * <strong>not</strong> a reference check.
   * @param {*} other - Other value to check.
   * @return {Boolean} <code>true</code> if the two Maybes are equal; <code>false</code> if not equal.
   * @example <caption>Reflexivity</caption>
   *
   * v1.equals(v1) === true;
   * // => true
   *
   * @example <caption>Symmetry</caption>
   *
   * v1.equals(v2) === v2.equals(v1);
   * // => true
   *
   * @example <caption>Transitivity</caption>
   *
   * (v1.equals(v2) === v2.equals(v3)) && v1.equals(v3)
   * // => true
   */
  equals(other) {
    return isEqual(this, other);
  }

  /**
   * Extends the Maybe. This is used for workflow continuation where the context has shifted.
   * @abstract
   * @function extend
   * @memberof Maybe
   * @instance
   * @param {Extend.<Maybe>} - method - The function to invoke with the value.
   * @return {Maybe}
   * @example <caption>Workflow continuation</caption>
   *
   * // Workflow from makeRequest.js
   * const makeRequest = requestOptions => requestAsPromise(requestOptions)
   *   .then(Just.from)
   *   .catch(Nothing.from);
   *
   * // Workflow from savePerson.js
   * const savePerson = curry((requestOptions, optionalPerson) => optionalPerson
   *   .map(Person.from)
   *   .map(person => set("body", person, requestOptions))
   *   .map(makeRequest)
   * );
   *
   * // Workflow from processResponse.js
   * const processResponse = optionalResponse => optionalResponse
   *   .ifJust(console.log);
   *
   * Maybe.ofNullable(person)
   *   .extend(savePerson({ method: "POST" }))
   *   .extend(processResponse);
   */

  /**
   * Returns the value if the instance is a {@link Just} otherwise the <code>null</code>.
   * @function get
   * @memberof Maybe
   * @instance
   * @return {*}
   * @example <caption>Just#get</caption>
   *
   * Just.from(value).get();
   * // => value
   *
   * @example <caption>Nothing#get</caption>
   *
   * Nothing.from().get();
   * // => null
   */
  get() {
    return this.value;
  }

  /**
   * Applies the provided function to the value contain for a {@link Just}. Any return value from the function is
   * ignored. If the instance is a {@link Nothing}, the function is ignored and the instance is returned.
   * @abstract
   * @function ifJust
   * @memberof Maybe
   * @instance
   * @param {Consumer} method - The function to invoke with the value.
   * @return {Maybe} Current instance.
   * @example <caption>Just#ifJust</caption>
   *
   * Just.from(value).ifJust(doSomething); // doSomething(value)
   * // => Just(value)
   *
   * @example <caption>Nothing#ifJust</caption>
   *
   * Nothing.from().ifJust(doSomething); // void
   * // => Nothing()
   */

  /**
   * Applies the provided function to the value contain for a {@link Nothing}. Any return value from the function is
   * ignored. If the instance is a {@link Just}, the function is ignored and the instance is returned.
   * @abstract
   * @function ifNothing
   * @memberof Maybe
   * @instance
   * @param {Callable} method - The function to invoke.
   * @return {Maybe} Current instance.
   * @example <caption>Just#ifNothing</caption>
   *
   * Just.from(value).ifNothing(doSomething); // void
   * // => Just(value)
   *
   * @example <caption>Nothing#ifNothing</caption>
   *
   * Nothing.from().ifNothing(doSomething); // doSomething()
   * // => Nothing()
   */

  /**
   * Determines whether or not the instance is a {@link Nothing}.
   * @return {Boolean} <code>true</code> if the instance is a {@link Nothing}; <code>false</code> is not.
   * @example <caption>Just#isNothing</caption>
   *
   * Just.from(value).isNothing();
   * // => false
   *
   * @example <caption>Nothing#isNothing</caption>
   *
   * Nothing.from().isNothing();
   * // => true
   */
  isNothing() {
    return this instanceof Nothing;
  }

  /**
   * Determines whether or not the instance is a {@link Just}.
   * @return {Boolean} <code>true</code> if the instance is a {@link Just}; <code>false</code> is not.
   * @example <caption>Just</caption>
   *
   * Just.from(value).isNothing();
   * // => true
   *
   * @example <caption>Nothing#isJust</caption>
   *
   * Nothing.from().isNothing();
   * // => false
   */
  isJust() {
    return this instanceof Just;
  }

  /**
   * Applies the provided function to the value contained for a {@link Just} which is, in turn, wrapped in a
   * {@link Just}. If the instance is a {@link Nothing}, the function is ignored and then instance is returned
   * unchanged.
   * @abstract
   * @function map
   * @memberof Maybe
   * @instance
   * @param {Function} method - The function to invoke with the value.
   * @return {Maybe} {@link Maybe} wrapped value mapped with the provided <code>method</code>.
   * @example
   *
   * // Using lodash/fp/flow and sort
   * Just.from([1, 3, 2]).map(flow(sort, join(", ")));
   * // => Just("1, 2, 3")
   *
   * Nothing.from().map(flow(sort, join(", ")));
   * // => Nothing()
   */

  /**
   * @see Maybe.ofNullable
   */
  of(value) {
    return Maybe.of(value);
  }

  /**
   * Returns the value if the instance is a {@link Just} otherwise returns the value supplied if the instance is a
   * {@link Nothing}.
   * @abstract
   * @function orElse
   * @memberof Maybe
   * @instance
   * @param {Consumer} method - The function to invoke with the value.
   * @return {*}
   * @example <caption>Just#orElse</caption>
   *
   * Just.from(value).orElse(otherValue);
   * // => value
   *
   * @example <caption>Nothing#orElse</caption>
   *
   * Nothing.from().orElse(otherValue);
   * // => otherValue
   */

  /**
   * Return the value if the instance is a {@link Just} otherwise returns the value from the function provided.
   * @abstract
   * @function orElseGet
   * @memberof Maybe
   * @instance
   * @param {Supplier} method - The function supplying the optional value.
   * @return {*}
   * @example <caption>Just#orElseGet</caption>
   *
   * Just.from(value).orElseGet(getOtherValue);
   * // => value
   *
   * @example <caption>Nothing#orElseGet</caption>
   *
   * Nothing.from().orElseGet(getOtherValue);
   * // => otherValue
   */

  /**
   * Returns the value if the instance is a {@link Just} otheriwse throws the <code>Error</code> supplied by the
   * function provided.
   * @abstract
   * @function orElseThrow
   * @memberof Maybe
   * @instance
   * @param {Supplier} method - The function to invoke with the value.
   * @return {*}
   * @throws {Error} returned by the provided function.
   * @example <caption>Just#orElseThrow</caption>
   *
   * Just.from(value).orElseThrow(createException);
   * // => value
   *
   * @example <caption>Nothing#orElseThrow</caption>
   *
   * Nothing.from().orElseThrow(createException); // throw createException()
   */

  /**
   * Converts the {@link Maybe} to an {@link Either}. {@link Just} becomes a {@link Right} and {@link Nothing} becomes a
   * {@link Left}.
   * @abstract
   * @function toEither
   * @memberof Maybe
   * @instance
   * @param {Either} either - Either implementation.
   * @return {Either} {@link Either} wrapped <code>value</code>.
   * @example <caption>Just#toEither</caption>
   *
   * const Either = require("lodash-fantasy/data/Either");
   *
   * Just.from(value).toEither(Either);
   * // => Either.Right(value);
   *
   * @example <caption>Nothing#toEither</caption>
   *
   * const Either = require("lodash-fantasy/data/Either");
   *
   * Nothing.from().toEither(Either);
   * // => Either.Left(null);
   */

  /**
   * Converts the Maybe to a <code>Promise</code> using the provided <code>Promise</code> implementation.
   * @abstract
   * @function toPromise
   * @memberof Maybe
   * @instance
   * @param {Promise} promise - Promise implementation.
   * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
   * @example <caption>Just#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Just.from(value).toPromise(Bluebird);
   * // => Promise.resolve(value);
   *
   * @example <caption>Nothing#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Nothing.from().toPromise(Bluebird);
   * // => Promise.reject(null);
   */

  /**
   * Returns a <code>String</code> representation of the {@link Maybe}.
   * @abstract
   * @function toString
   * @memberof Maybe
   * @instance
   * @return {String} <code>String</code> representation.
   * @example <caption>Just#toString</caption>
   *
   * Just.from(1).toString();
   * // => "Maybe.Just(1)"
   *
   * @example <caption>Nothing#toString</caption>
   *
   * Nothing.from().toString();
   * // => "Maybe.Nothing(null)"
   */

  /**
   * Converts the {@link Maybe} to an {@link Validation}. {@link Just} becomes a {@link Success} and {@link Nothing}
   * becomes a {@link Failure}.
   * @abstract
   * @function toValidation
   * @memberof Maybe
   * @instance
   * @param {Validation} validation - Validation implementation.
   * @return {Validation} {@link Validation} wrapped <code>value</code>.
   * @example <caption>Just#toValidation</caption>
   *
   * const Validation = require("lodash-fantasy/data/Validation");
   *
   * Just.from(value).toValidation(Validation);
   * // => Validation.Success(value);
   *
   * @example <caption>Nothing#toValidation</caption>
   *
   * const Validation = require("lodash-fantasy/data/Validation");
   *
   * Nothing.from().toValidation(Validation);
   * // => Validation.Failure([null]);
   */
}

/**
 * Iterates over a collection of maybes and invokes the <code>iteratee</code> for each {@link Maybe}. The
 * <code>iteratee</code> is invoked with one argument: <code>(value)</code>. Iteratee functions may exit iteration
 * early by explicitly returning a {@link Nothing}.
 * @static
 * @member
 * @param {Consumer} iteratee - The function to invoke per iteration.
 * @param {Maybe[]} values - Collection of Maybes over which to iterate.
 * @return {Maybe[]} Current {@link Maybe} collection.
 * @example
 *
 * const optionalValues = [
 *   getValue(path1, source), // => Just(value1)
 *   getValue(path2, source), // => Just(value2)
 *   getValue(path3, source), // => Nothing()
 *   getValue(path4, source) // => Nothing()
 * ];
 *
 * Maybe.each(optionalValue => optionalValue.ifJust(console.log), optionalValues);
 * // => Just(value1)
 * // => Just(value2)
 */
Maybe.each = curry((iteratee, values) => each(
  flow(iteratee, negate(Maybe.isNothing)),
  values
));

/**
 * Determines whether or not the <code>other</code> is equal in value to the current (<code>this</code>). This is
 * <strong>not</strong> a reference check.
 * @static
 * @member
 * @param {*} other - Other value to check.
 * @return {Boolean} <code>true</code> if the two validations are equal; <code>false</code> if not equal.
 * @example <caption>Reflexivity</caption>
 *
 * Maybe.equals(v1, v1) === true;
 * // => true
 *
 * @example <caption>Symmetry</caption>
 *
 * Maybe(v1, v2) === Maybe.equals(v2, v1);
 * // => true
 *
 * @example <caption>Transitivity</caption>
 *
 * (Maybe.equals(v1, v2) === Maybe.equals(v2, v3)) && Maybe.equals(v1, v3)
 * // => true
 */
Maybe.equals = isEqual;

/**
 * Iterates over a collection of values, returning an array of all values the <code>predicate</code> for which returns
 * truthy. The <code>predicate</code> is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Predicate} predicate - The function to invoke per iteration.
 * @param {Maybes[]} values - Collection of values over which to iterate.
 * @return {Maybes[]} Filtered {@link Maybe} collection.
 * @example <caption>Filter and log failures</caption>
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Just(value1)
 *   getValue(path2, config), // => Just(value2)
 *   getValue(path3, config), // => Nothing()
 *   getValue(path4, config) // => Nothing()
 * ];
 *
 * Maybe.filter(Maybe.isJust, optionalValues);
 * // => [Just(value1), Just(value2)]
 */
Maybe.filter = filter;

/**
 * Creates an array of values by invoking {@link Maybe#map} with the <code>iteratee</code> for each {@link Maybe} in the
 * collection. The iteratee is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Function} iteratee - The function to invoke per iteration.
 * @param {Maybe[]} values - Collection of values over which to iterate.
 * @return {Maybe[]} Mapped {@link Maybe} collection.
 * @example <caption>Mapping each Maybe's value</caption>
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Just(1.5)
 *   getValue(path2, config), // => Just(2.25)
 *   getValue(path3, config), // => Nothing()
 *   getValue(path4, config) // => Nothing()
 * ];
 *
 * Maybe.mapIn(Math.floor, optionalValues);
 * // => [Just(1), Just(2), Nothing(), Nothing()]
 */
Maybe.mapIn = curry((iteratee, values) => map(invokeIn("map", iteratee), values));

/**
 * Creates an array of values by running each {@link Maybe} in collection through the <code>iteratee</code>. The
 * iteratee is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Function} iteratee - The function to invoke per iteration.
 * @param {Maybe[]} values - Collection of values over which to iterate.
 * @return {Maybe[]} Mapped collection.
 * @example <caption>Mapping all values to promises</caption>
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Just(value1)
 *   getValue(path2, config), // => Just(value2)
 *   getValue(path3, config), // => Nothing()
 *   getValue(path4, config) // => Nothing()
 * ];
 *
 * Maybe.map(Maybe.toPromise, optionalValues);
 * // => [Promise.resolve(price1), Promise.resolve(price2), Promise.reject(null), Promise.reject(null)]
 */
Maybe.map = map;

/**
 * Reduces collection to a value which is the accumulated result of running each value in the <code>values</code>
 * collection through the <code>iteratee</code>, where each successive invocation is supplied the return value of the
 * previous. The iteratee is invoked with two arguments: <code>(accumulator, value)</code>.
 * @static
 * @member
 * @param {Reduction} iteratee - The function to invoke per iteration.
 * @param {*} accumulator - The initial value.
 * @param {Maybe[]} values - Collection of values over which to iterate.
 * @return {*} Accumulator.
 * @example
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Just(value1)
 *   getValue(path2, config), // => Just(value2)
 *   getValue(path3, config), // => Nothing()
 *   getValue(path4, config) // => Nothing()
 * ];
 *
 * // Using lodash/fp/concat
 * Maybe.reduce(
 *   (result, value) => value.isJust() ? concat(result, value.get()) : result,
 *   [],
 *   optionalValues
 * );
 * // => [value1, value2]
 */
Maybe.reduce = reduce;

/**
 * Converts a {@link Maybe} to a {@link Either}. {@link Just} becomes a {@link Right} and {@link Nothing} becomes a
 * {@link Left}.
 * @static
 * @member
 * @param {Either} either - Either implementation.
 * @param {Maybe} value - Maybe to convert.
 * @return {Either} {@link Either} wrapped <code>value</code>.
 * @example <caption>Just to Right</caption>
 *
 * Maybe.toEither(Either, Just.from(value));
 * // => Either.Right(value);
 *
 * @example <caption>Nothing to Left</caption>
 *
 * Maybe.toEither(Either, Nothing.from());
 * // => Either.Left(null);
 */
Maybe.toEither = invokeIn("toEither");

/**
 * Converts a validation to a <code>Promise</code> using the provided <code>Promise</code> implementation.
 * @static
 * @member
 * @param {Promise} promise - Promise implementation.
 * @param {Maybe} value - Maybe to convert.
 * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
 * @example <caption>Convert with bluebird's implementation of Promise</caption>
 *
 * const toBluebird = Maybe.toPromise(require("bluebird"));
 *
 * toBluebird(Just.from(value));
 * // => Promise.resolve(value);
 *
 * toBluebird(Nothing.from());
 * // => Promise.reject(null);
 */
Maybe.toPromise = invokeIn("toPromise");

/**
 * Converts a {@link Maybe} to a {@link Validation}. {@link Just} becomes a {@link Success} and {@link Nothing} becomes
 * a {@link Failure}.
 * @static
 * @member
 * @param {Validation} validation - Validation implementation.
 * @param {Maybe} value - Maybe to convert.
 * @return {Validation} {@link Validation} wrapped <code>value</code>.
 * @example <caption>Just to Success</caption>
 *
 * Maybe.toValidation(Validation, Just.from(value));
 * // => Validation.Success(value);
 *
 * @example <caption>Nothing to Failure</caption>
 *
 * Maybe.toValidation(Validation, Nothing.from());
 * // => Validation.Failure(null);
 */
Maybe.toValidation = invokeIn("toValidation");

/**
 * @extends Maybe
 * @inheritdoc
 */
class Just extends Maybe {
  /**
   * Creates a new {@link Just} from a <code>value</code>. If the <code>value</code> is already a {@link Maybe}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Just} is made with the
   * <code>value</code>.
   * @static
   * @param {*} value - Value to wrap in a {@link Just}.
   * @return {Maybe} {@link Maybe} when is the <code>value</code> already wrapped or {@link Just} wrapped
   * <code>value</code>.
   * @example <caption>Just from nothing</caption>
   *
   * Just.from();
   * // => Just()
   *
   * @example <caption>Just from arbitrary value</caption>
   *
   * Just.from(true);
   * // => Just(true)
   *
   * @example <caption>Just from another Just</caption>
   *
   * Just.from(Just.from(value));
   * // => Just(value)
   *
   * @example <caption>Just from Nothing</caption>
   *
   * Just.from(Nothing.from());
   * // => Nothing()
   */
  static from(value) {
    return Maybe.isMaybe(value) ?
      value :
      new Just(value);
  }

  constructor(value) {
    super(value);
  }

  ap(other) {
    return other.map(this.value);
  }

  chain(method) {
    return Maybe.from(method(this.value));
  }

  extend(method) {
    return Maybe.from(method(this));
  }

  ifJust(method) {
    method(this.value);

    return this;
  }

  ifNothing() {
    return this;
  }

  map(method) {
    return Just.ofNullable(method(this.value));
  }

  orElse() {
    return this.value;
  }

  orElseGet() {
    return this.value;
  }

  orElseThrow() {
    return this.value;
  }

  toEither(either) {
    return new either.Right(this.value);
  }

  toPromise(promise) {
    return promise.resolve(this.value);
  }

  toString() {
    return `Maybe.Just(${this.value})`;
  }

  toValidation(validation) {
    return new validation.Success(this.value);
  }
}

/**
 * @extends Maybe
 * @inheritdoc
 */
class Nothing extends Maybe {
  /**
   * Creates a new {@link Nothing} from a <code>value</code>. If the <code>value</code> is already a {@link Maybe}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Nothing} is made with the
   * <code>value</code>.
   * @static
   * @param {*} value - Value to wrap in a {@link Nothing}.
   * @return {Maybe} {@link Maybe} when is the <code>value</code> already wrapped or {@link Nothing} wrapped
   * <code>value</code>.
   * @example <caption>Nothing from nothing</caption>
   *
   * Nothing.from();
   * // => Nothing()
   *
   * @example <caption>Nothing from arbitrary value</caption>
   *
   * Nothing.from(true);
   * // => Nothing()
   *
   * @example <caption>Nothing from Just</caption>
   *
   * Nothing.from(Just.from(value));
   * // => Just.from(value)
   *
   * @example <caption>Nothing from another Nothing</caption>
   *
   * Nothing.from(Nothing.from());
   * // => Nothing()
   */
  static from(value) {
    return Maybe.isMaybe(value) ?
      value :
      new Nothing();
  }

  constructor() {
    super(null);
  }

  ap() {
    return this;
  }

  chain() {
    return this;
  }

  extend() {
    return this;
  }

  ifJust() {
    return this;
  }

  ifNothing(method) {
    method();

    return this;
  }

  map() {
    return this;
  }

  orElse(value) {
    return value;
  }

  orElseGet(method) {
    return method();
  }

  orElseThrow(method) {
    throw method();
  }

  toEither(either) {
    return new either.Left(this.value);
  }

  toPromise(promise) {
    return promise.reject(this.value);
  }

  toString() {
    return "Maybe.Nothing(null)";
  }

  toValidation(validation) {
    return new validation.Failure(this.value);
  }
}

module.exports = Maybe;
