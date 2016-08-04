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
const invoke = stream.invoke;
const isEqual = stream.isEqual;
const isUndefined = stream.isUndefined;
const map = stream.map;
const negate = stream.negate;
const reduce = stream.reduce;

// Project
const invokeIn = include("src/invokeIn");
const invokeWith = include("src/invokeWith");

/**
 * The {@link Validation} type is intended for validating values and aggregating failures. It is a disjunction
 * similar to <code>Either</code>. The key difference of the {@link Validation} type is the focus on failure
 * aggregation as opposed to failing once and ignoring all other failures. Much like <code>Either</code>,
 * {@link Validation} is right-biased.
 * @param {*} value - Value to wrap.
 * @return {Validation} {@link Validation} wrapped <code>value</code>.
 * @example <caption>Via <code>new</code></caption>
 *
 * const v1 = new Success(value);
 * const v2 = new Failure(message);
 *
 * @example <caption>Via function</caption>
 *
 * const v3 = Success.from(value);
 * const v4 = Failure.from(message);
 *
 * @example <caption>Via validation function</caption>
 *
 * const isEmpty = require("lodash/fp/isEmpty");
 * const isString = require("lodash/fp/isString");
 * const Validation = require("lodash-fantasy/data/Validation");
 *
 * function validateStringPresence(value) {
 *   return isString(value) && !isEmpty(value) ?
 *     Validation.Success.from(value) :
 *     Validation.Failure.from("value should be a non-empty string");
 * }
 *
 * module.exports = validateStringPresence;
 *
 * @example <caption>Via abstract validation rule</caption>
 *
 * const Validation = require("lodash-fantasy/data/Validation");
 *
 * module.exports = (condition, value, message) => condition(value) ?
 *   Validation.Success.from(value) :
 *   Validation.Failure.from(message(value)); // Pass value into the message for possible reference
 */
class Validation {
  /**
   * @static
   * @property {Failure} Failure - Validation failure.
   */
  static get Failure() {
    return Failure;
  }

  /**
   * @static
   * @property {Success} Success - Validation success.
   */
  static get Success() {
    return Success;
  }

  /**
   * Returns a {@link Validation} that resolves all of the validations in the collection into a single validation.
   * Unlike <code>Promise</code>, {@link Validation.all} aggregates all of the failures into a single instance of
   * {@link Validation}. However, like <code>Promise</code>, {@link Validation.all} collects all of the values
   * for successes when <em>all</em> items in the collection are a {@link Success}.
   * @static
   * @member
   * @param {Validation[]} validations - Collection of validations.
   * @return {Validation} A {@link Validation} representing all {@link Success} or {@link Failure}
   * values.
   * @example
   *
   * const v1 = validationPropertyAIn(context1);
   * // => Success(context1)
   *
   * const v2 = validationPropertyBIn(context2);
   * // => Success(context2)
   *
   * const v3 = validationPropertyCIn(context3);
   * // => Failure("A failure.")
   *
   * const v4 = validationPropertyDIn(context4);
   * // => Failure("B failure.")
   *
   * Validation.all([v1, v2]);
   * // => Success([context1, context2])
   *
   * Validation.all([v1, v2, v3]);
   * // => Failure(["A failure"])
   *
   * Validation.all([v1, v2, v3, v4]);
   * // => Failure(["A failure", "B failure"])
   */
  static all(validations) {
    return find(Validation.isFailure, validations) ?
      reduce(Validation.concat, Success.empty(), validations) :
      Success.of(stream(validations).map(get("value")).reduce(concat, []));
  }

  /**
   * Returns the first {@link Success} in the collection or a single {@link Failure} for all failures.
   * @static
   * @member
   * @param {Validation[]} validations - Collection of validations.
   * @return {Validation} First {@link Success} or reduced {@link Failure}s.
   * @example
   *
   * const v1 = validationPropertyAIn(context1);
   * // => Success(context1)
   *
   * const v2 = validationPropertyBIn(context2);
   * // => Success(context2)
   *
   * const v3 = validationPropertyCIn(context3);
   * // => Failure("A failure.")
   *
   * const v4 = validationPropertyDIn(context4);
   * // => Failure("B failure.")
   *
   * Validation.any([v1, v2]);
   * // => Success(context1)
   *
   * Validation.any([v1, v2, v3]);
   * // => Failure(["A failure"])
   *
   * Validation.any([v1, v2, v3, v4]);
   * // => Failure(["A failure", "B failure"])
   */
  static any(validations) {
    return find(Validation.isSuccess, validations) ||
      reduce(Validation.concat, Success.empty(), validations);
  }

  /**
   * Creates an empty {@link Success}.
   * @static
   * @member
   * @return {Success} Empty {@link Success} instance.
   * @example
   *
   * const v1 = Validation.empty();
   * // => Success()
   */
  static empty() {
    return new Success();
  }

  /**
   * Determines whether or not the value is a {@link Failure}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Failure}; <code>false</code> for {@link Success}.
   * @example
   *
   * isFailure();
   * // => false
   *
   * isFailure(null);
   * // => false
   *
   * isFailure(Success.from(0));
   * // => false
   *
   * isFailure(Failure.from("Error"));
   * // => true
   */
  static isFailure(value) {
    return value instanceof Failure;
  }

  /**
   * Determines whether or not the value is a {@link Success}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Success}; <code>false</code> for {@link Failure}.
   * @example
   *
   * isSuccess();
   * // => false
   *
   * isSuccess(null);
   * // => false
   *
   * isSuccess(Success.from(0));
   * // => true
   *
   * isSuccess(Failure.from("Error"));
   * // => false
   */
  static isSuccess(value) {
    return value instanceof Success;
  }

  /**
   * Determines whether or not the value is a {@link Validation}.
   * @static
   * @member
   * @param {*} value - Value to check.
   * @return {Boolean} <code>true</code> for {@link Validation}; <code>false</code> for anything else.
   * @example
   *
   * isValidation();
   * // => false
   *
   * isValidation(null);
   * // => false
   *
   * isValidation(Success.from(0));
   * // => true
   *
   * isValidation(Failure.from("Error"));
   * // => true
   */
  static isValidation(value) {
    return value instanceof Validation;
  }

  /**
   * Creates a new {@link Validation} from a <code>value</code>. If the <code>value</code> is already a
   * {@link Validation} instance, the <code>value</code> is returned unchanged. Otherwise, a new
   * {@link Success} is made with the <code>value</code>.
   * @static
   * @member
   * @param {*} value - Value to wrap in a {@link Validation}.
   * @return {Validation} {@link Validation} when is the <code>value</code> already wrapped or
   * {@link Success} wrapped <code>value</code>.
   *
   * Validation.from();
   * // => Success()
   *
   * Validation.from(true);
   * // => Success(true)
   *
   * Validation.from(Success.from(value));
   * // => Success(value)
   *
   * Validation.from(Failure.from("Error message"));
   * // => Failure(["Error message"])
   */
  static from(value) {
    return this.isValidation(value) ? value : this.of(value);
  }

  /**
   * Wraps the <code>value</code> in a {@link Success}. No parts of <code>value</code> are checked.
   * @static
   * @member
   * @param {*} value - Value to wrap.
   * @return {Success} {@link Success} wrapped <code>value</code>.
   * @example
   *
   * Validation.of();
   * // => Success()
   *
   * Validation.of(true);
   * // => Success(true)
   *
   * Validation.of(Success.from(value));
   * // => Success(Success(value))
   *
   * Validation.of(Failure.from("Error message"));
   * // => Success(Failure(["Error message"]))
   */
  static of(value) {
    return new Success(value);
  }

  /**
   * Tries to invoke a <code>supplier</code>. The result of the <code>supplier</code> is returned in a
   * {@link Success}. If an exception is thrown, the error is returned in a {@link Failure}. The <code>function</code>
   * takes no arguments.
   * @static
   * @member
   * @param {Supplier} supplier - Function to invoke.
   * @return {Validation} {@link Success} wrapped supplier result or {@link Failure} wrapped <code>error</code>.
   * @example
   *
   * Validation.try(normalFunction);
   * // => Success(returnValue)
   *
   * Validation.try(throwableFunction);
   * // => Failure([error])
   */
  static try(method) {
    try {
      return Success.from(method());
    } catch (error) {
      return Failure.from(error);
    }
  }

  constructor(value) {
    this.value = value;
  }

  /**
   * Applies the function contained in the instance of a {@link Success} to the value contained in the provided
   * {@link Success}, producing a {@link Success} containing the result. If the instance is {@link Failure}, the result
   * is a {@link Failure} instance. If the instance is {@link Success} and the provided validation is {@link Failure},
   * the result is the provided {@link Failure}.
   * @abstract
   * @function ap
   * @memberof Validation
   * @instance
   * @param {Validation} other - Value to apply to the function wrapped in the {@link Success}.
   * @return {Validation} {@link Success} wrapped applied function or {@link Failure}.
   * @example <caption>Success#ap</caption>
   *
   * const createPerson = curryN(4, Person.create); // Person.create(name, birthdate, address, email)
   *
   * Success.from(createPerson) // => Success(createPerson)
   *   .ap(validate(name)) // => Success(name)
   *   .ap(validate(birthdate)) // => Success(birthdate)
   *   .ap(validate(address)) // => Success(address)
   *   .ap(validate(email)) // => Success(email)
   *   .ifSuccess(console.log) // => Log Person.create() response
   *   .orElse(each(console.error)) // => Logs first error since #ap short circuits after the first Failure
   */

  /**
   * Transforms a {@link Validation} by applying the first function to the contained value for a {@link Failure} or the
   * second function for a {@link Success}. The result of each map is wrapped in the corresponding type.
   * @abstract
   * @function bimap
   * @memberof Validation
   * @instance
   * @param {Function} failureMap - Map to apply to the {@link Failure}.
   * @param {Function} successMap - Map to apply to the {@link Success}.
   * @return {Validation} {@link Validation} wrapped value mapped with the corresponding mapping function.
   * @example
   *
   * validateRequest(request)
   *   .bimap(toBadRequestResponse, PersonModel.create)
   *   // ... other actions in workflow
   */

  /**
   * Applies the provided function to the value contained for a {@link Success}. The function should return the value
   * wrapped in a {@link Validation}. If the instance is a {@link Failure}, the function is ignored and then instance is
   * returned unchanged.
   * @abstract
   * @function chain
   * @memberof Validation
   * @instance
   * @param {Chain.<Validation>} method - The function to invoke with the value.
   * @return {Validation} {@link Validation} wrapped value returned by the provided <code>method</code>.
   * @example <caption>Success#chain</caption>
   *
   * const person = { ... };
   * const validateResponse = response => HttpStatus.isSuccess(response.statusCode) ?
   *   Success(response) :
   *   Failure(response.statusMessage);
   *
   * const createPerson = flow(Person.create, validateResponse); // Expects instance of Person
   *
   * const validations = [
   *   validatePersonName(person), // => Success(person)
   *   validatePersonBirthdate(person), // => Success(person)
   *   validatePersonAddress(person), // => Failure([error1])
   *   validatePersonEmail(person) // => Failure([error2])
   * ];
   *
   * Validation.reduce(Validation.concat, Success.empty(), validations) // => Validation<Person>
   *   .chain(createPerson) // => Validation<Response>
   *   .ifSuccess(doSomethingWithResponse)
   *   .orElse(each(console.error)); // Log all errors
   */

  /**
   * Concatenates another {@link Validation} instance with the current instance.
   * @abstract
   * @function concat
   * @memberof Validation
   * @instance
   * @param {Validation} other - Other {@link Validation} to concatenation.
   * @return {Validation} Concatenated validations.
   * @example <caption>Empty Success with Empty Success</caption>
   *
   * Success.empty().concat(Success.empty());
   * // => Success.empty()
   *
   * @example <caption>Empty Success with Success</caption>
   *
   * Success.empty().concat(Success.from(value));
   * // => Success(value)
   *
   * @example <caption>Success with Empty Success</caption>
   *
   * Success.from(value).concat(Success.empty());
   * // => Success(value)
   *
   * @example <caption>Success1 with Success2</caption>
   *
   * Success.from(value1).concat(Success.from(value2));
   * // => Success(value1)
   *
   * @example <caption>Any Success with Failure</caption>
   *
   * anySuccess.concat(Failure.from(error));
   * // => Failure([error])
   *
   * @example <caption>Empty Failure with Any Success</caption>
   *
   * Failure.from().concat(anySuccess);
   * // => Failure([])
   *
   * @example <caption>Failure with Any Success</caption>
   *
   * Failure.from(error).concat(Success);
   * // => Failure([error])
   *
   * @example <caption>Empty Failure with Empty Failure</caption>
   *
   * Failure.from().concat(Failure.from());
   * // => Failure([])
   *
   * @example <caption>Empty Failure with Failure</caption>
   *
   * Failure.from().concat(Failure.from(error));
   * // => Failure([error])
   *
   * @example <caption>Failure with Failure</caption>
   *
   * Failure.from(error1).concat(Failure.from(error2));
   * // => Failure([error1, error2])
   */

  /**
   * Determines whether or not the <code>other</code> is equal in value to the current (<code>this</code>). This is
   * <strong>not</strong> a reference check.
   * @param {*} other - Other value to check.
   * @return {Boolean} <code>true</code> if the two validations are equal; <code>false</code> if not equal.
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
   * Extends the validation. This is used for workflow continuation where the context has shifted.
   * @abstract
   * @function extend
   * @memberof Validation
   * @instance
   * @param {Extend.<Validation>} - method - The function to invoke with the value.
   * @return {Validation}
   * @example <caption>Workflow continuation</caption>
   *
   * const request = require("request");
   *
   * // Workflow from savePerson.js
   * const savePerson = curry((requestOptions, validatedPerson) => {
   *   return validatedPerson
   *     .map(Person.from)
   *     .map(person => set("body", person, requestOptions))
   *     .map(request);
   * });
   *
   * // Workflow from processResponse.js
   * const processResponse = validatedResponse => validatedResponse.ifSuccess(console.log);
   *
   * validatePerson(person)
   *   .extend(savePerson({ method: "POST" }))
   *   .extend(processResponse);
   */

  /**
   * Applies the provided function to the value contain for a {@link Success}. Any return value from the function is
   * ignored. If the instance is a {@link Failure}, the function is ignored and the instance is returned.
   * @abstract
   * @function ifSuccess
   * @memberof Validation
   * @instance
   * @param {Consumer} method -The function to invoke with the value;
   * @return {Validation} Current instance.
   * @example <caption>Success#ifSuccess</caption>
   *
   * Success.from(value).ifSuccess(doSomething); // doSomething(value)
   * // => Success(value)
   *
   * @example <caption>Failure#ifSuccess</caption>
   *
   * Failure.from(error).ifSuccess(doSomething); // void
   * // => Failure([error])
   */

  /**
   * Determines whether or not the instance is a {@link Failure}.
   * @return {Boolean} <code>true</code> if the instance is a {@link Failure}; <code>false</code> is not.
   * @example <caption>Success#isFailure</caption>
   *
   * Success.from(value).isFailure();
   * // => false
   *
   * @example <caption>Failure#isFailure</caption>
   *
   * Failure.from(error).isFailure();
   * // => true
   */
  isFailure() {
    return this instanceof Failure;
  }

  /**
   * Determines whether or not the instance is a {@link Success}.
   * @return {Boolean} <code>true</code> if the instance is a {@link Success}; <code>false</code> is not.
   * @example <caption>Success</caption>
   *
   * Success.from(value).isFailure();
   * // => true
   *
   * @example <caption>Failure#isSuccess</caption>
   *
   * Failure.from(error).isFailure();
   * // => false
   */
  isSuccess() {
    return this instanceof Success;
  }

  /**
   * Applies the provided function to the value contained for a {@link Success} which is, in turn, wrapped in a
   * {@link Success}. If the instance is a {@link Failure}, the function is ignored and then instance is returned
   * unchanged.
   * @abstract
   * @function map
   * @memberof Validation
   * @instance
   * @param {Function} method - The function to invoke with the value.
   * @return {Validation} {@link Validation} wrapped value mapped with the provided <code>method</code>.
   * @example
   *
   * Success.from([1, 3, 2]).map(flow(sort, join(", ")));
   * // => Success("1, 2, 3")
   *
   * Failure.from(error).map(flow(sort, join(", ")));
   * // => Failure([error])
   */

  /**
   * @see Validation.of
   */
  of(value) {
    return Validation.of(value);
  }

  /**
   * Applies the provided function to the value contain for a {@link Failure}. Any return value from the function is
   * ignored. If the instance is a {@link Success}, the function is ignored and the instance is returned.
   * @abstract
   * @function orElse
   * @memberof Validation
   * @instance
   * @param {Consumer} method - The function to invoke with the value.
   * @return {Validation} Current instance.
   * @example <caption>Success#orElse</caption>
   *
   * Success.from(value).orElse(doSomething); // void
   * // => Success(value)
   *
   * @example <caption>Failure#orElse</caption>
   *
   * Failure.from(error).orElse(doSomething); // doSomething([error])
   * // => Failure([error])
   */

  /**
   * Applies the provided function to the value contain for a {@link Failure} and throws the resulting
   * <code>Error</code>. If the instance is a {@link Success}, the function is ignored and the instance is returned.
   * @abstract
   * @function orElseThrow
   * @memberof Validation
   * @instance
   * @param {Function} method - The function to invoke with the value.
   * @throws {Error} returned by the provided function.
   * @example <caption>Success#orElseThrow</caption>
   *
   * Success.from(value).orElseThrow(createException); // void
   * // => Success(value)
   *
   * @example <caption>Failure#orElseThrow</caption>
   *
   * Failure.from(error).orElseThrow(createException); // throw createException([error])
   */

  /**
   * Converts the validation to a <code>Promise</code>. {@link Success} becomes <code>resolve</code> and
   * {@link Failure} becomes <code>reject</code>.
   * @abstract
   * @function toPromise
   * @memberof Validation
   * @instance
   * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
   * @example <caption>Success#toPromise</caption>
   *
   * Success.from(value).toPromise();
   * // => Promise.resolve(value);
   *
   * @example <caption>Failure#toPromise</caption>
   *
   * Failure.from(error).toPromise();
   * // => Promise.reject([error]);
   */

  /**
   * Converts the validation to a <code>Promise</code> using the provided <code>Promise</code> implementation.
   * @abstract
   * @function toPromiseWith
   * @memberof Validation
   * @instance
   * @param {Promise} promise - Promise implementation.
   * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
   * @example <caption>Success#toPromiseWith</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Success.from(value).toPromiseWith(Bluebird);
   * // => Promise.resolve(value);
   *
   * @example <caption>Failure#toPromiseWith</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Failure.from(error).toPromiseWith(Bluebird);
   * // => Promise.reject([error]);
   */

  /**
   * Returns a <code>String</code> representation of the {@link Validation}.
   * @abstract
   * @function toString
   * @memberof Validation
   * @instance
   * @return {String} <code>String</code> representation.
   * @example <caption>Success#toString</caption>
   *
   * Success.from(1).toString();
   * // => "Validation.Success(1)"
   *
   * @example <caption>Failure#toString</caption>
   *
   * Failure.from("Error message").toString();
   * // => "Validation.Failure('Error message')"
   */
}

/**
 * Concatenates two {@link Validation} instances together.
 * @static
 * @member
 * @param {Validation} left - Left concatenation value.
 * @param {Validation} right - Right concatenation value.
 * @return {Validation} Concatenated validations.
 * @example <caption>Concatenating distinct validations</caption>
 *
 * const validations = [
 *   validatePersonName(person), // => Success(person)
 *   validatePersonBirthdate(person), // => Success(person)
 *   validatePersonAddress(person), // => Failure([error1])
 *   validatePersonEmail(person) // => Failure([error2])
 * ];
 *
 * Validation.reduce(Validation.concat, Success.empty(), validations);
 * // => Failure([error1, error2])
 */
Validation.concat = invokeWith("concat");

/**
 * Iterates over a collection of validations and invokes the <code>iteratee</code> for each {@link Validation}. The
 * <code>iteratee</code> is invoked with one argument: <code>(validation)</code>. Iteratee functions may exit iteration
 * early by explicitly returning a {@link Failure}.
 * @static
 * @member
 * @param {Consumer} iteratee - The function to invoke per iteration.
 * @param {Validation[]} validations - Collection of validations over which to iterate.
 * @return {Validation[]} Current {@link Validation} collection.
 * @example
 *
 * const validations = [
 *   validatePerson(person1), // => Success(person1)
 *   validatePerson(person2), // => Success(person2)
 *   validatePerson(person3), // => Failure([error1, error2])
 *   validatePerson(person4) // => Failure([error2])
 * ];
 *
 * Validation.each(validation => validation.orElse(flow(join(", "), console.error)), validations);
 * // => Logs 'error1, error2' then 'error2'
 * //
 * // => validations
 */
Validation.each = curry((iteratee, validations) => each(
  flow(iteratee, negate(Validation.isFailure)),
  validations
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
 * Validation.equals(v1, v1) === true;
 * // => true
 *
 * @example <caption>Symmetry</caption>
 *
 * Validation(v1, v2) === Validation.equals(v2, v1);
 * // => true
 *
 * @example <caption>Transitivity</caption>
 *
 * (Validation.equals(v1, v2) === Validation.equals(v2, v3)) && Validation.equals(v1, v3)
 * // => true
 */
Validation.equals = isEqual;

/**
 * Iterates over a collection of validations, returning an array of all validations the <code>predicate</code> for which
 * returns truthy. The <code>predicate</code> is invoked with one argument: <code>(validation)</code>.
 * @static
 * @member
 * @param {Predicate} predicate - The function to invoke per iteration.
 * @param {Validations[]} validations - Collection of validations over which to iterate.
 * @return {Validations[]} Filtered {@link Validation} collection.
 * @example <caption>Filter and log failures</caption>
 *
 * const validations = [
 *   validatePerson(person1), // => Success(person1)
 *   validatePerson(person2), // => Success(person2)
 *   validatePerson(person3), // => Failure([error1, error2])
 *   validatePerson(person4) // => Failure([error2])
 * ];
 *
 * // Log failures, return successes.
 * Validation.filter(validation => validation.orElse(flow(join(", "), console.error)).isSuccess(), validations);
 * // => Logs 'error1, error2' then 'error2'
 * //
 * // => [Success(person1), Success(person2)]
 */
Validation.filter = filter;

/**
 * Creates an array of values by invoking {@link Validation#map} with the <code>iteratee</code> for each
 * {@link Validation} in the collection. The iteratee is invoked with one argument: <code>(value)</code>.
 * @static
 * @member
 * @param {Function} iteratee - The function to invoke per iteration.
 * @param {Validation[]} validations - Collection of validations over which to iterate.
 * @return {Validation[]} Mapped {@link Validation} collection.
 * @example <caption>Mapping each Validation's value</caption>
 *
 * const validations = [
 *   validatePrice(2.10), // => Success(price1)
 *   validatePrice(2.25), // => Success(price2)
 *   validatePrice("2.50"), // => Failure([error1])
 *   validatePrice("Three dollars") // => Failure([error1])
 * ];
 *
 * Validation.mapIn(Math.floor, validations);
 * // => [Success(2), Success(2), Failure([error1]), Failure([error2])]
 */
Validation.mapIn = curry((iteratee, validations) => map(invokeIn("map", iteratee), validations));

/**
 * Creates an array of values by running each {@link Validation} in collection through the <code>iteratee</code>. The
 * iteratee is invoked with one argument: <code>(validation)</code>.
 * @static
 * @member
 * @param {Function} iteratee - The function to invoke per iteration.
 * @param {Validation[]} validations - Collection of validations over which to iterate.
 * @return {Validation[]} Mapped collection.
 * @example <caption>Mapping all validations to promises</caption>
 *
 * const validations = [
 *   validatePrice(2.10), // => Success(price1)
 *   validatePrice(2.25), // => Success(price2)
 *   validatePrice("2.50"), // => Failure([error1])
 *   validatePrice("Three dollars") // => Failure([error1])
 * ];
 *
 * Validation.map(Validation.toPromise, validations);
 * // => [Promise.resolve(price1), Promise.resolve(price2), Promise.reject([error1]), Promise.reject([error2])]
 */
Validation.map = map;

/**
 * Reduces collection to a value which is the accumulated result of running each validation in the
 * <code>validations</code> collection through the <code>iteratee</code>, where each successive invocation is supplied
 * the return value of the previous. The iteratee is invoked with two arguments: <code>(accumulator, value)</code>.
 * @static
 * @member
 * @param {Reduction} iteratee - The function to invoke per iteration.
 * @param {*} accumulator - The initial value.
 * @param {Validation[]} validations - Collection of validations over which to iterate.
 * @return {*} Accumulator.
 * @example
 *
 * const validations = [
 *   validatePersonName(person), // => Success(person)
 *   validatePersonBirthdate(person), // => Success(person)
 *   validatePersonAddress(person), // => Failure([error1])
 *   validatePersonEmail(person) // => Failure([error2])
 * ];
 *
 * Validation.reduce(Validation.concat, Success.empty(), validations);
 * // => Failure([error1, error2])
 */
Validation.reduce = reduce;

/**
 * Converts a {@link Validation} to a <code>Promise</code>. {@link Success} becomes <code>resolve</code> and
 * {@link Failure} becomes <code>reject</code>.
 * @static
 * @member
 * @param {Validation} value - Validation to convert.
 * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
 * @example <caption>Success to Resolved</caption>
 *
 * Validation.toPromise(Success.from(value));
 * // => Promise.resolve(value);
 *
 * @example <caption>Failure to Rejected</caption>
 *
 * Validation.toPromise(Failure.from(error));
 * // => Promise.reject([error]);
 */
Validation.toPromise = invoke("toPromise");

/**
 * Converts a validation to a <code>Promise</code> using the provided <code>Promise</code> implementation.
 * @static
 * @member
 * @param {Promise} promise - Promise implementation.
 * @param {Validation} value - Validation to convert.
 * @return {Promise} <code>Promise</code> wrapped <code>value</code>.
 * @example <caption>Convert with bluebird's implementation of Promise</caption>
 *
 * const toBluebird = Validation.toPromiseWith(require("bluebird"));
 *
 * toBluebird(Success.from(value));
 * // => Promise.resolve(value);
 *
 * toBluebird(Failure.from(error));
 * // => Promise.reject([error]);
 */
Validation.toPromiseWith = invokeIn("toPromiseWith");

/**
 * @extends Validation
 * @inheritdoc
 */
class Failure extends Validation {
  /**
   * Creates a new {@link Failure} from a <code>value</code>. If the <code>value</code> is already a {@link Validation}
   * instance, the <code>value</code> is returned unchanged. Otherwise, a new {@link Failure} is made with the
   * <code>value</code>.
   * @static
   * @param {*} value - Value to wrap in a {@link Failure}.
   * @return {Validation} {@link Validation} when is the <code>value</code> already wrapped or
   * {@link Failure} wrapped <code>value</code>.
   * @example <caption>Failure from empty array</caption>
   *
   * Failure.from();
   * // => Failure([])
   *
   * @example <caption>Failure from arbitrary value</caption>
   *
   * Failure.from(true);
   * // => Failure([true])
   *
   * @example <caption>Failure from Success</caption>
   *
   * Failure.from(Success.from(value));
   * // => Success.from(value)
   *
   * @example <caption>Failure from another Failure</caption>
   *
   * Failure.from(Failure.from("Error message"));
   * // => Failure(["Error message"])
   */
  static from(value) {
    return Validation.isValidation(value) ?
      value :
      new Failure(value);
  }

  constructor(value) {
    super(isUndefined(value) ? [] : [].concat(value));
  }

  ap() {
    return this;
  }

  bimap(failureMap) {
    return Failure.from(failureMap(this.value));
  }

  chain() {
    return this;
  }

  concat(other) {
    return other.isSuccess() ?
      this :
      new Failure(this.value.concat(other.value));
  }

  extend() {
    return this;
  }

  ifSuccess() {
    return this;
  }

  map() {
    return this;
  }

  orElse(method) {
    method(this.value);

    return this;
  }

  orElseThrow(method) {
    throw method(this.value);
  }

  toPromise() {
    return Promise.reject(this.value);
  }

  toPromiseWith(promise) {
    return promise.reject(this.value);
  }

  toString() {
    return `Validation.Failure(${this.value.join("; ")})`;
  }
}

/**
 * @extends Validation
 * @inheritdoc
 */
class Success extends Validation {
  /**
   * Creates a new {@link Success} from a <code>value</code>. If the <code>value</code> is already a
   * {@link Validation} instance, the <code>value</code> is returned unchanged. Otherwise, a new
   * {@link Success} is made with the <code>value</code>.
   * @static
   * @param {*} value - Value to wrap in a {@link Success}.
   * @return {Validation} {@link Validation} when is the <code>value</code> already wrapped or
   * {@link Success} wrapped <code>value</code>.
   * @example <caption>Success from nothing</caption>
   *
   * Success.from();
   * // => Success()
   *
   * @example <caption>Success from arbitrary value</caption>
   *
   * Success.from(true);
   * // => Success(true)
   *
   * @example <caption>Success from another Success</caption>
   *
   * Success.from(Success.from(value));
   * // => Success(value)
   *
   * @example <caption>Success from Failure</caption>
   *
   * Success.from(Failure.from("Error message"));
   * // => Failure(["Error message"])
   */
  static from(value) {
    return Validation.isValidation(value) ?
      value :
      new Success(value);
  }

  constructor(value) {
    super(value);
  }

  ap(other) {
    return other.map(this.value);
  }

  bimap(leftMap, rightMap) {
    return Success.from(rightMap(this.value));
  }

  chain(method) {
    return Validation.from(method(this.value));
  }

  concat(other) {
    return (other.isSuccess() && !isUndefined(this.value)) ? this : other;
  }

  extend(method) {
    return Validation.from(method(this));
  }

  ifSuccess(method) {
    method(this.value);

    return this;
  }

  map(method) {
    return Success.of(method(this.value));
  }

  orElse() {
    return this;
  }

  orElseThrow() {
    void 0;
  }

  toPromise() {
    return Promise.resolve(this.value);
  }

  toPromiseWith(promise) {
    return promise.resolve(this.value);
  }

  toString() {
    return `Validation.Success(${this.value})`;
  }
}

module.exports = Validation;
