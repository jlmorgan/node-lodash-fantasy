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
const map = stream.map;
const negate = stream.negate;
const reduce = stream.reduce;

// Project
const invokeIn = include("src/invokeIn");

/**
 * The {@link Either} type is intended for handling disjointed, but related values such as the result or exceptional
 * behavior of some function. It is a disjunction similar to <code>Validation</code>. The key difference of the
 * {@link Either} type is the focus on the single error as opposed to aggregating many errors. Much like
 * <code>Validation</code>, {@link Either} is right-biased.
 * @param {*} value - Value to wrap.
 * @return {Either} {@link Either} wrapped <code>value</code>.
 * @example <caption>Via <code>new</code></caption>
 *
 * const v1 = new Right(value);
 * const v2 = new Left(otherValue);
 *
 * @example <caption>Via function</caption>
 *
 * const v3 = Right.from(value);
 * const v4 = Left.from(otherValue);
 *
 * @example <caption>Via Either function</caption>
 *
 * const fs = require("fs");
 * const Either = require("lodash-fantasy/data/Either");
 *
 * function readFileSyncSafe(filePath, options) {
 *   let result = null;
 *
 *   try {
 *     result = Either.Right.from(fs.readFileSync(filePath, options));
 *   } catch (error) {
 *     result = Either.Left.from(error);
 *   }
 *
 *   return result;
 * }
 *
 * module.exports = getValue;
 */
class Either {
  /**
   * @static
   * @property {Right} Right - Either right.
   */
  static get Right() {
    return Right;
  }

  /**
   * @static
   * @property {Left} Left - Either left.
   */
  static get Left() {
    return Left;
  }

  /**
   * Returns a {@link Either} that resolves all of the eithers in the collection into a single Either.
   * @static
   * @member
   * @param {Either[]} eithers - Collection of eithers.
   * @return {Either} A {@link Either} representing all {@link Right} values or a singular {@link Left}.
   * @example
   *
   * const e1 = fs.readFileSync(filePath1);
   * // => Right(contents1)
   *
   * const e2 = fs.readFileSync(filePath2);
   * // => Right(contents2)
   *
   * const e3 = fs.readFileSync(filePath3);
   * // => Left(error3)
   *
   * const e4 = fs.readFileSync(filePath4);
   * // => Left(error4)
   *
   * Either.all([e1, e2]);
   * // => Right([contents1, contents2])
   *
   * Either.all([e1, e2, e3]);
   * // => Left(error3)
   *
   * Either.all([e1, e2, e3, e4]);
   * // => Left(error3)
   */
  static all(eithers) {
    return find(Either.isLeft, eithers) || Either.of(stream(eithers).map(get("value")).reduce(concat, []));
  }

  /**
   * Returns the first {@link Right} in the collection or finally a {@link Left}.
   * @static
   * @member
   * @param {Either[]} eithers - Collection of eithers.
   * @return {Either} First {@link Right} or finally a {@link Left}.
   * @example
   *
   * const e1 = fs.readFileSync(filePath1);
   * // => Right(contents1)
   *
   * const e2 = fs.readFileSync(filePath2);
   * // => Right(contents2)
   *
   * const e3 = fs.readFileSync(filePath3);
   * // => Left(error3)
   *
   * const e4 = fs.readFileSync(filePath4);
   * // => Left(error4)
   *
   * Either.any([e1, e2]);
   * // => Right(contents1)
   *
   * Either.any([e2, e3]);
   * // => Right(contents2)
   *
   * Either.any([e3, e4]);
   * // => Left(error3)
   */
  static any(either) {
    return find(Either.isRight, either) || find(Either.isLeft, either);
  }

  /**
   * Determines whether or not the value is a {@link Right}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Right}; <code>false</code> for {@link Left}.
   * @example
   *
   * isRight();
   * // => false
   *
   * isRight(Right.from());
   * // => true
   *
   * isRight(Left.from(error));
   * // => false
   */
  static isRight(value) {
    return value instanceof Right;
  }

  /**
   * Determines whether or not the value is a {@link Either}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Either}; <code>false</code> for anything else.
   * @example
   *
   * isEither();
   * // => false
   *
   * isEither(Right.from());
   * // => true
   *
   * isEither(Left.from(error));
   * // => true
   */
  static isEither(value) {
    return value instanceof Either;
  }

  /**
   * Determines whether or not the value is a {@link Left}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Left}; <code>false</code> for {@link Right}.
   * @example
   *
   * isLeft();
   * // => false
   *
   * isLeft(Left.from(error));
   * // => true
   *
   * isLeft(Right.from());
   * // => false
   */
  static isLeft(value) {
    return value instanceof Left;
  }

  /**
   * Creates a new {@link Either} from a <code>value</code>. If the <code>value</code> is already a {@link Either}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Right} is made with the
   * <code>value</code>.
   * @static
   * @member
   * @param {*} value - Value to wrap in a {@link Either}.
   * @return {Either} {@link Either} when is the <code>value</code> already wrapped or {@link Right} wrapped
   * <code>value</code>.
   *
   * Either.from();
   * // => Right()
   *
   * Either.from(true);
   * // => Right(true)
   *
   * Either.from(Right.from(value));
   * // => Right(value)
   *
   * Either.from(Left.from(error));
   * // => Left(error)
   */
  static from(value) {
    return this.isEither(value) ? value : this.of(value);
  }

  /**
   * Wraps the <code>value</code> in a {@link Right}. No parts of <code>value</code> are checked.
   * @static
   * @member
   * @param {*} value - Value to wrap.
   * @return {Right} {@link Right} wrapped <code>value</code>.
   * @example
   *
   * Either.of();
   * // => Right()
   *
   * Either.of(true);
   * // => Right(true)
   *
   * Either.of(Right.from(value));
   * // => Right(Right(value))
   *
   * Either.of(Left.from(error));
   * // => Right(Left(error))
   */
  static of(value) {
    return new Right(value);
  }

  /**
   * Tries to invoke a <code>supplier</code>. The result of the <code>supplier</code> is returned in a {@link Right}.
   * If an exception is thrown, the error is returned in a {@link Left}. The <code>function</code> takes no arguments.
   * @static
   * @member
   * @param {Supplier} supplier - Function to invoke.
   * @return {Either} {@link Right} wrapped supplier result or {@link Left} wrapped <code>error</code>.
   * @example
   *
   * Either.try(normalFunction);
   * // => Right(returnValue)
   *
   * Either.try(throwableFunction);
   * // => Left(error)
   */
  static try(method) {
    try {
      return Right.from(method());
    } catch (error) {
      return Left.from(error);
    }
  }

  constructor(value) {
    this.value = value;
  }

  /**
   * Applies the function contained in the instance of a {@link Right} to the value contained in the provided
   * {@link Right}, producing a {@link Right} containing the result. If the instance is a {@link Left}, the result
   * is the {@link Left} instance. If the instance is a {@link Right} and the provided {@link Either} is {@link Left},
   * the result is the provided {@link Left}.
   * @abstract
   * @function ap
   * @memberof Either
   * @instance
   * @param {Either} other - Value to apply to the function wrapped in the {@link Right}.
   * @return {Either} {@link Right} wrapped applied function or {@link Left}.
   * @example <caption>Right#ap</caption>
   *
   * const findPerson = curryN(3, Person.find); // Person.find(name, birthdate, address)
   *
   * Right.from(findPerson) // => Right(findPerson)
   *   .ap(Right.try(getName())) // => Right(name)
   *   .ap(Right.try(getBirthdate())) // => Right(birthdate)
   *   .ap(Right.try(getAddress())) // => Right(address)
   *   .ifRight(console.log); // => Log Person.find() response
   */

  /**
   * Transforms a {@link Either} by applying the first function to the contained value for a {@link Left} or the
   * second function for a {@link Right}. The result of each map is wrapped in the corresponding type.
   * @abstract
   * @function bimap
   * @memberof Either
   * @instance
   * @param {Function} failureMap - Map to apply to the {@link Left}.
   * @param {Function} successMap - Map to apply to the {@link Right}.
   * @return {Either} {@link Either} wrapped value mapped with the corresponding mapping function.
   * @example
   *
   * // Using lodash/fp/get
   * Either.try(loadFile)
   *   .bimap(get("message"), parseFile)
   *   // ... other actions in workflow
   */

  /**
   * Applies the provided function to the value contained for a {@link Right}. The function should return the value
   * wrapped in a {@link Either}. If the instance is a {@link Left}, the function is ignored and then instance is
   * returned unchanged.
   * @abstract
   * @function chain
   * @memberof Either
   * @instance
   * @param {Chain.<Either>} method - The function to invoke with the value.
   * @return {Either} {@link Either} wrapped value returned by the provided <code>method</code>.
   * @example <caption>Right#chain</caption>
   *
   * // Using lodash/fp/curry and getOr
   * const getConfigOption = curry((path, config) => Either.Right.from(getOr(
   *   Either.Left.from(`Value not found at "${path}"`),
   *   path,
   *   config
   * )));
   *
   * Either.of(config)
   *   .chain(getConfigOption("path.to.option"))
   */

  /**
   * Determines whether or not the <code>other</code> is equal in value to the current (<code>this</code>). This is
   * <strong>not</strong> a reference check.
   * @param {*} other - Other value to check.
   * @return {Boolean} <code>true</code> if the two Eithers are equal; <code>false</code> if not equal.
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
   * Extends the Either. This is used for workflow continuation where the context has shifted.
   * @abstract
   * @function extend
   * @memberof Either
   * @instance
   * @param {Extend.<Either>} - method - The function to invoke with the value.
   * @return {Either}
   * @example <caption>Workflow continuation</caption>
   *
   * // Workflow from makeRequest.js
   * const makeRequest = requestOptions => requestAsPromise(requestOptions)
   *   .then(Right.from)
   *   .catch(Left.from);
   *
   * // Workflow from savePerson.js
   * const savePerson = curry((requestOptions, eitherPerson) => eitherPerson
   *   .map(Person.from)
   *   .map(person => set("body", person, requestOptions))
   *   .map(makeRequest)
   * );
   *
   * // Workflow from processResponse.js
   * const processResponse = eitherResponse => eitherResponse
   *   .ifLeft(console.error)
   *   .ifRight(console.log);
   *
   * Either.of(person)
   *   .extend(savePerson({ method: "POST" }))
   *   .extend(processResponse);
   */

  /**
   * Returns the value if the instance is a {@link Right} otherwise the <code>null</code>.
   * @function get
   * @memberof Either
   * @instance
   * @return {*}
   * @example <caption>Right#get</caption>
   *
   * Right.from(value).get();
   * // => value
   *
   * @example <caption>Left#get</caption>
   *
   * Left.from(error).get();
   * // => null
   */

  /**
   * Applies the provided function to the value contain for a {@link Left}. Any return value from the function is
   * ignored. If the instance is a {@link Right}, the function is ignored and the instance is returned.
   * @abstract
   * @function ifLeft
   * @memberof Either
   * @instance
   * @param {Consumer} method - The function to invoke with the value.
   * @return {Either} Current instance.
   * @example <caption>Right#ifLeft</caption>
   *
   * Right.from(value).ifLeft(doSomething); // void
   * // => Right(value)
   *
   * @example <caption>Left#ifLeft</caption>
   *
   * Left.from(error).ifLeft(doSomething); // doSomething(error)
   * // => Left(error)
   */

  /**
   * Applies the provided function to the value contain for a {@link Right}. Any return value from the function is
   * ignored. If the instance is a {@link Left}, the function is ignored and the instance is returned.
   * @abstract
   * @function ifRight
   * @memberof Either
   * @instance
   * @param {Consumer} method - The function to invoke with the value.
   * @return {Either} Current instance.
   * @example <caption>Right#ifRight</caption>
   *
   * Right.from(value).ifRight(doSomething); // doSomething(value)
   * // => Right(value)
   *
   * @example <caption>Left#ifRight</caption>
   *
   * Left.from(error).ifRight(doSomething); // void
   * // => Left(error)
   */

  /**
   * Determines whether or not the instance is a {@link Left}.
   * @return {Boolean} <code>true</code> if the instance is a {@link Left}; <code>false</code> is not.
   * @example <caption>Right#isLeft</caption>
   *
   * Right.from(value).isLeft();
   * // => false
   *
   * @example <caption>Left#isLeft</caption>
   *
   * Left.from(error).isLeft();
   * // => true
   */
  isLeft() {
    return this instanceof Left;
  }

  /**
   * Determines whether or not the instance is a {@link Right}.
   * @return {Boolean} <code>true</code> if the instance is a {@link Right}; <code>false</code> is not.
   * @example <caption>Right</caption>
   *
   * Right.from(value).isLeft();
   * // => true
   *
   * @example <caption>Left#isRight</caption>
   *
   * Left.from(error).isLeft();
   * // => false
   */
  isRight() {
    return this instanceof Right;
  }

  /**
   * Applies the provided function to the value contained for a {@link Right} which is, in turn, wrapped in a
   * {@link Right}. If the instance is a {@link Left}, the function is ignored and then instance is returned unchanged.
   * @abstract
   * @function map
   * @memberof Either
   * @instance
   * @param {Function} method - The function to invoke with the value.
   * @return {Either} {@link Either} wrapped value mapped with the provided <code>method</code>.
   * @example
   *
   * // Using lodash/fp/flow and sort
   * Right.from([1, 3, 2]).map(flow(sort, join(", ")));
   * // => Right("1, 2, 3")
   *
   * Left.from(error).map(flow(sort, join(", ")));
   * // => Left(error)
   */

  /**
   * @see Either.of
   */
  of(value) {
    return Either.of(value);
  }

  /**
   * Returns the value if the instance is a {@link Right} otherwise the value provided.
   * @abstract
   * @function orElse
   * @memberof Either
   * @instance
   * @param {Consumer} method - The function to invoke with the value.
   * @return {*}
   * @example <caption>Right#orElse</caption>
   *
   * Right.from(value).orElse(otherValue);
   * // => value
   *
   * @example <caption>Left#orElse</caption>
   *
   * Left.from(error).orElse(otherValue);
   * // => otherValue
   */

  /**
   * Return the value if the instance is a {@link Right} otherwise returns the value from the function provided.
   * @abstract
   * @function orElseGet
   * @memberof Either
   * @instance
   * @param {Supplier} method - The function supplying the optional value.
   * @return {*}
   * @example <caption>Right#orElseGet</caption>
   *
   * Right.from(value).orElseGet(getOtherValue);
   * // => value
   *
   * @example <caption>Left#orElseGet</caption>
   *
   * Left.from(error).orElse(getOtherValue);
   * // => otherValue
   */

  /**
   * Returns the value if the instance is a {@link Right} otheriwse throws the <code>Error</code> supplied by the
   * function provided. The function receives the value of the {@link Left} as its argument.
   * @abstract
   * @function orElseThrow
   * @memberof Either
   * @instance
   * @param {Function} method - The function to invoke with the value.
   * @return {*}
   * @throws {Error} returned by the provided function.
   * @example <caption>Right#orElseThrow</caption>
   *
   * Right.from(value).orElseThrow(createException);
   * // => value
   *
   * @example <caption>Left#orElseThrow</caption>
   *
   * Left.from(error).orElseThrow(createException); // throw createException(error)
   */

  /**
   * Converts the Either to a {@link Maybe}. {@link Right} becomes {@link Just} and {@link Left} becomes
   * {@link Nothing}.
   * @abstract
   * @function toMaybe
   * @memberof Either
   * @instance
   * @param {Maybe} maybe - Maybe implementation.
   * @return {Maybe} {@link Maybe} wrapped <code>value</code>.
   * @example <caption>Right#toMaybe</caption>
   *
   * Right.from(value).toMaybe(Maybe);
   * // => Maybe.Just(value);
   *
   * @example <caption>Left#toMaybe</caption>
   *
   * Left.from(error).toMaybe(Maybe);
   * // => Maybe.Nothing();
   */

  /**
   * Converts the Either to a <code>Promise</code> using the provided <code>Promise</code> implementation.
   * @abstract
   * @function toPromise
   * @memberof Either
   * @instance
   * @param {Promise} promise - Promise implementation.
   * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
   * @example <caption>Right#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Right.from(value).toPromise(Bluebird);
   * // => Promise.resolve(value);
   *
   * @example <caption>Left#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Left.from(error).toPromise(Bluebird);
   * // => Promise.reject(error);
   */

  /**
   * Returns a <code>String</code> representation of the {@link Either}.
   * @abstract
   * @function toString
   * @memberof Either
   * @instance
   * @return {String} <code>String</code> representation.
   * @example <caption>Right#toString</caption>
   *
   * Right.from(1).toString();
   * // => "Either.Right(1)"
   *
   * @example <caption>Left#toString</caption>
   *
   * Left.from(error).toString();
   * // => "Either.Left(error)"
   */

  /**
   * Converts the Either to a {@link Validation}. {@link Right} becomes {@link Success} and {@link Left} becomes
   * {@link Failure}.
   * @abstract
   * @function toValidation
   * @memberof Either
   * @instance
   * @param {Validation} validation - Validation implementation.
   * @return {Validation} {@link Validation} wrapped <code>value</code>.
   * @example <caption>Right#toValidation</caption>
   *
   * Right.from(value).toValidation(Validation);
   * // => Validation.Success(value);
   *
   * @example <caption>Left#toValidation</caption>
   *
   * Left.from(error).toValidation(Validation);
   * // => Validation.Failure();
   */
}

/**
 * Iterates over a collection of eithers and invokes the <code>iteratee</code> for each {@link Either}. The
 * <code>iteratee</code> is invoked with one argument: <code>(value)</code>. Iteratee functions may exit iteration
 * early by explicitly returning a {@link Left}.
 * @static
 * @member
 * @param {Consumer} iteratee - The function to invoke per iteration.
 * @param {Either[]} values - Collection of Eithers over which to iterate.
 * @return {Either[]} Current {@link Either} collection.
 * @example
 *
 * const optionalValues = [
 *   getValue(path1, source), // => Right(value1)
 *   getValue(path2, source), // => Right(value2)
 *   getValue(path3, source), // => Left()
 *   getValue(path4, source) // => Left()
 * ];
 *
 * Either.each(eitherValue => eitherValue.ifRight(console.log), optionalValues);
 * // => Right(value1)
 * // => Right(value2)
 */
Either.each = curry((iteratee, values) => each(
  flow(iteratee, negate(Either.isLeft)),
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
 * Either.equals(v1, v1) === true;
 * // => true
 *
 * @example <caption>Symmetry</caption>
 *
 * Either(v1, v2) === Either.equals(v2, v1);
 * // => true
 *
 * @example <caption>Transitivity</caption>
 *
 * (Either.equals(v1, v2) === Either.equals(v2, v3)) && Either.equals(v1, v3)
 * // => true
 */
Either.equals = isEqual;

/**
 * Iterates over a collection of values, returning an array of all values the <code>predicate</code> for which returns
 * truthy. The <code>predicate</code> is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Predicate} predicate - The function to invoke per iteration.
 * @param {Eithers[]} values - Collection of values over which to iterate.
 * @return {Eithers[]} Filtered {@link Either} collection.
 * @example <caption>Filter and log failures</caption>
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Right(value1)
 *   getValue(path2, config), // => Right(value2)
 *   getValue(path3, config), // => Left()
 *   getValue(path4, config) // => Left()
 * ];
 *
 * Either.filter(Either.isRight, optionalValues);
 * // => [Right(value1), Right(value2)]
 */
Either.filter = filter;

/**
 * Creates an array of values by invoking {@link Either#map} with the <code>iteratee</code> for each {@link Either} in
 * the collection. The iteratee is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Function} iteratee - The function to invoke per iteration.
 * @param {Either[]} values - Collection of values over which to iterate.
 * @return {Either[]} Mapped {@link Either} collection.
 * @example <caption>Mapping each Either's value</caption>
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Right(1.5)
 *   getValue(path2, config), // => Right(2.25)
 *   getValue(path3, config), // => Left(error1)
 *   getValue(path4, config) // => Left(error2)
 * ];
 *
 * Either.mapIn(Math.floor, optionalValues);
 * // => [Right(1), Right(2), Left(error1), Left(error2)]
 */
Either.mapIn = curry((iteratee, values) => map(invokeIn("map", iteratee), values));

/**
 * Creates an array of values by running each {@link Either} in collection through the <code>iteratee</code>. The
 * iteratee is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Function} iteratee - The function to invoke per iteration.
 * @param {Either[]} values - Collection of values over which to iterate.
 * @return {Either[]} Mapped collection.
 * @example <caption>Mapping all values to promises</caption>
 *
 * const optionalValues = [
 *   getValue(path1, config), // => Right(value1)
 *   getValue(path2, config), // => Right(value2)
 *   getValue(path3, config), // => Left(error1)
 *   getValue(path4, config) // => Left(error2)
 * ];
 *
 * Either.map(Either.toPromise, optionalValues);
 * // => [Promise.resolve(price1), Promise.resolve(price2), Promise.reject(error1), Promise.reject(error2)]
 */
Either.map = map;

/**
 * Reduces collection to a value which is the accumulated result of running each value in the <code>values</code>
 * collection through the <code>iteratee</code>, where each successive invocation is supplied the return value of the
 * previous. The iteratee is invoked with two arguments: <code>(accumulator, value)</code>.
 * @static
 * @member
 * @param {Reduction} iteratee - The function to invoke per iteration.
 * @param {*} accumulator - The initial value.
 * @param {Either[]} values - Collection of values over which to iterate.
 * @return {*} Accumulator.
 * @example
 *
 * const eitherValues = [
 *   getValue(path1, config), // => Right(value1)
 *   getValue(path2, config), // => Right(value2)
 *   getValue(path3, config), // => Left(error1)
 *   getValue(path4, config) // => Left(error2)
 * ];
 *
 * // Using lodash/fp/concat
 * Either.reduce(
 *   (result, value) => value.isRight() ? concat(result, value.get()) : result,
 *   [],
 *   eitherValues
 * );
 * // => [value1, value2]
 */
Either.reduce = reduce;

/**
 * Converts a {@link Either} to a {@link Maybe}. {@link Right} becomes a {@link Just} and {@link Left} becomes
 * {@link Nothing}.
 * @static
 * @member
 * @param {Maybe} maybe - Maybe implementation.
 * @param {Either} value - Either to convert.
 * @return {Maybe} {@link Maybe} wrapped <code>value</code>.
 * @example <caption>Right to Just</caption>
 *
 * Either.toMaybe(Maybe, Right.from(value));
 * // => Maybe.Just(value);
 *
 * @example <caption>Left to Nothing</caption>
 *
 * Either.toMaybe(Maybe, Left.from(error));
 * // => Maybe.Nothing();
 */
Either.toMaybe = invokeIn("toMaybe");

/**
 * Converts a validation to a <code>Promise</code> using the provided <code>Promise</code> implementation.
 * @static
 * @member
 * @param {Promise} promise - Promise implementation.
 * @param {Either} value - Either to convert.
 * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
 * @example <caption>Convert with bluebird's implementation of Promise</caption>
 *
 * const toBluebird = Either.toPromise(require("bluebird"));
 *
 * toBluebird(Right.from(value));
 * // => Promise.resolve(value);
 *
 * toBluebird(Left.from(error));
 * // => Promise.reject(error);
 */
Either.toPromise = invokeIn("toPromise");

/**
 * Converts a {@link Either} to a {@link Validation}. {@link Right} becomes a {@link Success} and {@link Left} becomes
 * {@link Failure}.
 * @static
 * @member
 * @param {Validation} validation - Validation implementation.
 * @param {Either} value - Either to convert.
 * @return {Validation} {@link Validation} wrapped <code>value</code>.
 * @example <caption>Right to Success</caption>
 *
 * Either.toValidation(Validation, Right.from(value));
 * // => Validation.Success(value);
 *
 * @example <caption>Left to Failure</caption>
 *
 * Either.toValidation(Validation, Left.from(error));
 * // => Validation.Failure();
 */
Either.toValidation = invokeIn("toValidation");

/**
 * @extends Either
 * @inheritdoc
 */
class Left extends Either {
  /**
   * Creates a new {@link Left} from a <code>value</code>. If the <code>value</code> is already a {@link Either}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Left} is made with the
   * <code>value</code>.
   * @static
   * @param {*} value - Value to wrap in a {@link Left}.
   * @return {Either} {@link Either} when is the <code>value</code> already wrapped or {@link Left} wrapped
   * <code>value</code>.
   * @example <caption>Left from nothing</caption>
   *
   * Left.from();
   * // => Left()
   *
   * @example <caption>Left from arbitrary value</caption>
   *
   * Left.from(error);
   * // => Left(error)
   *
   * @example <caption>Left from Right</caption>
   *
   * Left.from(Right.from(value));
   * // => Right.from(value)
   *
   * @example <caption>Left from another Left</caption>
   *
   * Left.from(Left.from(error));
   * // => Left(error)
   */
  static from(value) {
    return Either.isEither(value) ?
      value :
      new Left(value);
  }

  constructor(value) {
    super(value);
  }

  ap() {
    return this;
  }

  bimap(leftMap) {
    return Left.from(leftMap(this.value));
  }

  chain() {
    return this;
  }

  extend() {
    return this;
  }

  get() {
    return null;
  }

  ifLeft(method) {
    method();

    return this;
  }

  ifRight() {
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
    throw method(this.value);
  }

  toMaybe(maybe) {
    return new maybe.Nothing();
  }

  toPromise(promise) {
    return promise.reject(this.value);
  }

  toString() {
    return `Either.Left(${this.value})`;
  }

  toValidation(validation) {
    return new validation.Failure(this.value);
  }
}

/**
 * @extends Either
 * @inheritdoc
 */
class Right extends Either {
  /**
   * Creates a new {@link Right} from a <code>value</code>. If the <code>value</code> is already a {@link Either}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Right} is made with the
   * <code>value</code>.
   * @static
   * @param {*} value - Value to wrap in a {@link Right}.
   * @return {Either} {@link Either} when is the <code>value</code> already wrapped or {@link Right} wrapped
   * <code>value</code>.
   * @example <caption>Right from nothing</caption>
   *
   * Right.from();
   * // => Right()
   *
   * @example <caption>Right from arbitrary value</caption>
   *
   * Right.from(true);
   * // => Right(true)
   *
   * @example <caption>Right from another Right</caption>
   *
   * Right.from(Right.from(value));
   * // => Right(value)
   *
   * @example <caption>Right from Left</caption>
   *
   * Right.from(Left.from(error));
   * // => Left(error)
   */
  static from(value) {
    return Either.isEither(value) ?
      value :
      new Right(value);
  }

  constructor(value) {
    super(value);
  }

  ap(other) {
    return other.map(this.value);
  }

  bimap(leftMap, rightMap) {
    return Right.from(rightMap(this.value));
  }

  chain(method) {
    return Either.from(method(this.value));
  }

  extend(method) {
    return Either.from(method(this));
  }

  get() {
    return this.value;
  }

  ifLeft() {
    return this;
  }

  ifRight(method) {
    method(this.value);

    return this;
  }

  map(method) {
    return Right.of(method(this.value));
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

  toMaybe(maybe) {
    return new maybe.Just(this.value);
  }

  toPromise(promise) {
    return promise.resolve(this.value);
  }

  toString() {
    return `Either.Right(${this.value})`;
  }

  toValidation(validation) {
    return new validation.Success(this.value);
  }
}

module.exports = Either;
