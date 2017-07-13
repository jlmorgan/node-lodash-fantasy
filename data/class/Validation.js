"use strict";

// Third Party
const F = require("lodash/fp");

/**
 * The {@link Validation} type is intended for validating values and aggregating failures. It is a disjunction
 * similar to {@link Either}. The key difference of the {@link Validation} type is the focus on failure aggregation as
 * opposed to failing once and ignoring all other failures. Much like {@code Either}, {@link Validation} is
 * right-biased.
 * @param {*} value - Value to wrap.
 * @return {Validation} {@link Validation} wrapped {@code value}.
 * @example <caption>Via function</caption>
 *
 * const v3 = Validation.success(value);
 * const v4 = Validation.failure(message);
 *
 * @example <caption>Via validation function</caption>
 *
 * const isEmpty = require("lodash/fp/isEmpty");
 * const isString = require("lodash/fp/isString");
 * const Validation = require("lodash-fantasy/data/Validation");
 *
 * function validatePopulatedString(value) {
 *   return isString(value) && !isEmpty(value) ?
 *     Validation.success(value) :
 *     Validation.failure("value should be a non-empty string.");
 * }
 *
 * module.exports = validatePopulatedString;
 *
 * @example <caption>Via abstract validation rule</caption>
 *
 * const Validation = require("lodash-fantasy/data/Validation");
 *
 * module.exports = (condition, value, message) => condition(value) ?
 *   Validation.success(value) :
 *   Validation.failure(message(value)); // Pass value into the message for possible reference
 */
class Validation {
  /**
   * Creates a {@link Validation} from the some context with the following mapping:
   *
   *   - If the context is a {@link Validation}, then the instance itself.
   *   - If the context is {@code null} or {@code undefined}, then a {@link Failure} of an {@link Error}.
   *   - Otherwise a {@link Success} of the {@code context}.
   *
   * @static
   * @memberof Validation
   * @param {*} context - Some value context.
   * @return {Validation}
   * @example
   * const map = require("lodash/fp/map");
   *
   * const allMaybes = map(Validation.from, [undefined, null, "", Success(0), Failure(["message"])]);
   * // [Failure([Error]), Failure([Error]), Success(""), Success(0), Failure(["message"])]
   */
  static from(context) {
    return Validation.isValidation(context) ?
      context :
      Validation.ofNullable(context);
  }

  /**
   * Returns the value within a {@link Failure} or throws an {@link Error} otherwise.
   *
   * @static
   * @memberof Validation
   * @param {Validation} validation - The {@link Validation} to unpack.
   * @return {*}
   * @throws Error If not a {@link Failure}.
   * @example <caption>Unpacking collection of Validation</caption>
   *
   * const F = require("lodash/fp");
   *
   * F(validations)
   *   .filter(Validation.isFailure)
   *   .map(Validation.fromFailure)
   *   .value();
   */
  static fromFailure(validation) {
    if (Validation.isNotFailure(validation)) {
      throw new Error("Validation.fromFailure: instance of validation must be a Failure.");
    }

    return validation.getFailure();
  }

  /**
   * Returns the value within a {@link Success} or throws an {@link Error} otherwise.
   *
   * @static
   * @memberof Validation
   * @param {Validation} validation - The {@link Validation} to unpack.
   * @return {*}
   * @throws Error If not a {@link Success}.
   * @example <caption>Unpacking collection of Validation</caption>
   *
   * const F = require("lodash/fp");
   *
   * F(validations)
   *   .filter(Validation.isSuccess)
   *   .map(Validation.fromSuccess)
   *   .value();
   */
  static fromSuccess(validation) {
    if (Validation.isNotSuccess(validation)) {
      throw new Error("Validation.fromSuccess: instance of validation must be a Success.");
    }

    return validation.getSuccess();
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Failure}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Validation.isFailure(undefined); // => false
   * Validation.isFailure(null); // => false
   * Validation.isFailure(1); // => false
   * Validation.isFailure(Validation.failure("message")); // => true
   * Validation.isFailure(Validation.success(1)); // => false
   */
  static isFailure(value) {
    return Validation.isValidation(value) && value.isFailure();
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Success}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Validation.isSuccess(undefined); // => false
   * Validation.isSuccess(null); // => false
   * Validation.isSuccess(1); // => false
   * Validation.isSuccess(Validation.failure("message")); // => false
   * Validation.isSuccess(Validation.success(1)); // => true
   */
  static isSuccess(value) {
    return Validation.isValidation(value) && value.isSuccess();
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Failure}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotFailure(value) {
    return !Validation.isFailure(value);
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Success}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotSuccess(value) {
    return !Validation.isSuccess(value);
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Validation}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotValidation(value) {
    return !Validation.isValidation(value);
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Failure}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Validation.isValidation(undefined); // => false
   * Validation.isValidation(null); // => false
   * Validation.isValidation(1); // => false
   * Validation.isValidation(Validation.failure("message")); // => true
   * Validation.isValidation(Validation.success(1)); // => true
   */
  static isValidation(value) {
    return value instanceof Validation;
  }

  static fail(value) {
    return Validation.failure(value);
  }

  /**
   * Creates a {@link Failure} from an arbitrary value.
   *
   * @static
   * @constructor
   * @memberof Validation
   * @alias fail
   * @param {*} value - An arbitrary value.
   * @return {Failure}
   * @example
   *
   * Validation.failure(1); // => Failure([1])
   */
  static failure(value) {
    return new Failure(value);
  }

  /**
   * Collects all of the {@link Failure} underlying values from a list of {@link Validation}.
   *
   * @static
   * @memberof Validation
   * @param {Validation[]} list - A list of {@link Validation}.
   * @return {Array}
   * @example
   *
   * Validation.failures([Failure([1]), Success("a"), Failure([2]), Success("b")]);
   * // => [1, 2]
   */
  static failures(list) {
    return F.isArray(list) ?
      F(list)
        .filter(Validation.isFailure)
        .map(Validation.fromFailure)
        .flatMap(F.identity)
        .value() :
      [];
  }

  /**
   * Null sensitive Applicative {@code pure} where {@code undefined} or {@code null} is treated as {@link Failure} of
   * {@link Error}.
   *
   * @static
   * @memberof Validation
   * @param {*} value - An arbitrary nullable value.
   * @return {Validation}
   * @example
   *
   * Validation.ofNullable();
   * // => Failure([Error("Validation.ofNullable: value is null or undefined.")])
   *
   * Validation.ofNullable(null);
   * // => Failure([Error("Validation.ofNullable: value is null or undefined.")])
   *
   * Validation.ofNullable(true);
   * // => Success(true)
   *
   * Validation.ofNullable(Validation.success(true));
   * // => Success(Success(true))
   *
   * Validation.ofNullable(Validation.failure("message"));
   * // => Success(Failure(["message"]));
   */
  static ofNullable(value) {
    return F.isNull(value) || F.isUndefined(value) ?
      Validation.failure(new Error("Validation.ofNullable: value is null or undefined.")) :
      Validation.success(value);
  }

  static pass(value) {
    return Validation.success(value);
  }

  /**
   * Applicative {@code pure}. Returns an {@link Validation} (read {@link Success}) of the value.
   *
   * @memberof Validation
   * @static
   * @alias Validation.of
   * @param {*} value - An arbitrary value.
   * @return {Validation}
   * @example
   *
   * Validation.pure();
   * // => Success()
   *
   * Validation.pure(null);
   * // => Success(null)
   *
   * Validation.pure(true);
   * // => Success(true)
   *
   * Validation.pure(Validation.success(true));
   * // => Success(Success(true))
   *
   * Validation.pure(Validation.failure(error));
   * // => Success(Failure([error]));
   */
  static pure(value) {
    return new Success(value);
  }

  /**
   * Creates a {@link Success} from an arbitrary value.
   *
   * @static
   * @constructor
   * @memberof Validation
   * @alias pass
   * @param {*} value - An arbitrary value.
   * @return {Success}
   * @example
   *
   * Validation.success(1); // => Success(1)
   */
  static success(value) {
    return new Success(value);
  }

  /**
   * Collects all of the {@link Success} underlying values from a list of {@link Validation}.
   *
   * @static
   * @memberof Validation
   * @param {Validation[]} list - A list of {@link Validation}.
   * @return {Array}
   * @example
   *
   * Validation.successes([Failure([1]), Success("a"), Failure([2]), Success("b")]);
   * // => ["a", "b"]
   */
  static successes(list) {
    return F.isArray(list) ?
      F(list)
        .filter(Validation.isSuccess)
        .map(Validation.fromSuccess)
        .value() :
      [];
  }

  constructor(value) {
    this.value = value;
  }

  /**
   * Alt {@code alt} (i.e., {@code <!>}). Replace a {@link Failure} with a {@link Validation} of a value produced by
   * a {@link Supplier}.
   *
   * @abstract
   * @function alt
   * @memberof Validation
   * @instance
   * @alias coalesce
   * @param {(Validation|Supplier.<Validation>)} other - Another instance of {@link Validation} or a supplier that
   * produces a {@link Validation}.
   * @return {Validation}
   * @example <caption>Success#alt(Success)</caption>
   *
   * Validation.success(true).alt(Validation.success(false))
   * // => Success(true)
   *
   * @example <caption>Success#alt(Failure)</caption>
   *
   * Validation.success(true).alt(Validation.failure(error))
   * // => Success(true)
   *
   * @example <caption>Failure#alt(Success)</caption>
   *
   * Validation.failure(error).alt(Validation.success(false))
   * // => Success(false)
   *
   * @example <caption>Failure#alt(Failure)</caption>
   *
   * Validation.failure(error).alt(Validation.failure(error))
   * // => Failure([error])
   */

  /**
   * Apply {@code ap} (i.e. {@code <.>} or Applicative {@code <*>}). Applies the current {@code value} to the
   * {@code value} of the {@code other}.
   *
   * @abstract
   * @function ap
   * @memberof Validation
   * @instance
   * @param {Validation.<Function>} other - A {@link Validation} of a {@link Function}.
   * @return {Validation}
   * @example <caption>Success#ap(Success)</caption>
   *
   * const F = require("lodash/fp");
   * const config = {
   *   property: true
   * };
   *
   * Validation.success(config)
   *   .ap(Validation.success(F.get("property")));
   * // => Success(true);
   *
   * @example <caption>Success#ap(Failure)</caption>
   *
   * Validation.success(config)
   *   .ap(Validation.failure(error));
   * // => Failure([error])
   *
   * @example <caption>Failure#ap(Success)</caption>
   *
   * Validation.failure(error)
   *   .ap(Validation.success(F.get("property")));
   * // => Failure([error]);
   *
   * @example <caption>Failure#ap(Failure)</caption>
   *
   * Validation.failure([error1]).ap(Validation.failure(error2));
   * // => Failure(error2)
   */

  /**
   * Bifunctor {@code bimap}. Maps the underlying value of the disjunction.
   *
   * @function bimap
   * @memberof Validation
   * @instance
   * @alias failureMap
   * @param {Function} morphism - A failure mapping function.
   * @return {Validation}
   * @example <caption>Success#bimap</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1)
   *   .bimap(F.get("message"), F.add(2));
   * // => Success(3)
   *
   * @example <caption>Failure#bimap</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.failure(new Error("file not found"))
   *   .bimap(F.get("message"), F.size);
   * // => Failure(["file not found"])
   */

  /**
   * Chain {@code chain} (a.k.a {@code flatMap}). Takes a {@link Function} that accepts the {@code value} and returns a
   * {@link Validation} of the return value.
   *
   * @abstract
   * @function chain
   * @memberof Validation
   * @instance
   * @alias flatMap
   * @param {Chain.<Validation>} morphism - A chaining function.
   * @return {Validation}
   * @example <caption>Success#chain</caption>
   *
   * const F = require("lodash/fp");
   * const getConfigOption = F.curry((path, config) => Validation.ofNullable(F.get(path, config)));
   *
   * Validation.ofNullable(config)
   *   .chain(getConfigOption("path.to.option"));
   *   // => Success(value) or Failure([Error])
   *
   * @example <caption>Failure#chain</caption>
   *
   * Validation.failure(error).chain(getConfigOption("path.to.option"));
   * // => Failure([error])
   */

  /**
   * Wraps the {@code morphism} in a {@code try..catch} where the successful mapping is returned in a {@link Success} or
   * the caught {@link Error} is ignored and returned as a {@link Failure}.
   *
   * @abstract
   * @function checkedBimap
   * @memberof Validation
   * @instance
   * @param {Function} failureFold - Folds the failure value and the {@link Error} thrown by the {@code morphism} into a
   * singular value.
   * @param {Throwable} throwable - A throwable function.
   * @return {Validation}
   * @example <caption>Success#checkedBimap</caption>
   *
   * Validation.success("/tmp/file.txt")
   *   .checkedBimap(
   *     (error, initialError) => error, // since we are starting with a Success
   *     fs.readFileSync
   *   );
   * // => Success(data) or Failure([successError])
   *
   * @example <caption>Failure#checkedBimap</caption>
   *
   * Validation.failure(error)
   *   .checkedBimap(
   *     (error, initialError) => error, // since we are starting with a Success
   *     fs.readFileSync
   *   );
   * // => Failure([error])
   *
   * @example <caption>Validation#checkedBimap</caption>
   *
   * Validation.ofNullable(filePath) // => Success(String) or Failure(Error)
   *   .checkedBimap(
   *     (error, initialError) => F.get("message", initialError || error), // Unpack the message from whichever
   *     fs.readFileSync
   *   ) // => Success(data) or Failure([String])
   *   .ifFailure(console.log); // Log the error message
   */

  coalesce(value) {
    return this.alt(value);
  }

  /**
   * Semigroup {@code concat}. Concatenates another {@link Validation} instance with the current instance.
   *
   * @abstract
   * @function concat
   * @memberof Validation
   * @instance
   * @param {Validation} other - Other {@link Validation} to concatenation.
   * @return {Validation} Concatenated validations.
   * @example <caption>Success with Success</caption>
   *
   * Validation.success(value1).concat(Validation.success(value2));
   * // => Success(value1)
   *
   * @example <caption>Success with Failure</caption>
   *
   * Validation.success(value).concat(Validation.failure(error));
   * // => Failure([error])
   *
   * @example <caption>Failure with Success</caption>
   *
   * Validation.failure(error).concat(Validation.success(value));
   * // => Failure([error])
   *
   * @example <caption>Failure with Failure</caption>
   *
   * Validation.failure(error1).concat(Validation.failure(error2));
   * // => Failure([error1, error2])
   */

  /**
   * Setoid {@code equals}. Determines whether two objects are equivalent.
   *
   * @function equals
   * @memberof Validation
   * @instance
   * @param {*} other - Arbitrary object.
   * @return {Boolean}
   * @example <caption>Reflexivity</caption>
   *
   * e1.equals(e1) === true;
   * // => true
   *
   * @example <caption>Symmetry</caption>
   *
   * e1.equals(e2) === e2.equals(e1);
   * // => true
   *
   * @example <caption>Transitivity</caption>
   *
   * (e1.equals(e2) === e2.equals(e3)) && e1.equals(e3)
   * // => true
   */
  equals(other) {
    return F.isEqual(this, other);
  }

  /**
   * Filters the underlying value through the {@code predicate}. Returns a {@link Failure} of the {@code failureValue}
   * if the {@code predicate} returns {@code false}; otherwise, the instance is returned. If the {@code failureValue} is
   * a {@link Function}, the {@code failureValue} is invoked and the return value is used.
   *
   * @abstract
   * @function filter
   * @memberof Maybe
   * @instance
   * @param {Predicate} predicate - A predicate.
   * @param {*} failureValue - Value to use if the predicate returns {@code false}.
   * @return {Validation}
   * @example <caption>Success#filter</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success("hello world")
   *   .filter(F.startsWith("hello"), () => new Error("Message did not start with 'hello'."));
   * // Success("hello world")
   *
   * Validation.success("hello world")
   *   .filter(F.startsWith("world"), () => new Error("Message did not start with 'world'."));
   * // => Failure([Error])
   *
   * @example <caption>Failure#filter</caption>
   *
   * Validation.failure(Error)
   *   .filter(F.startsWith("hello"));
   * // => Failure([Error])
   */

  /**
   * Bifunctor {@code first}. Maps the first or failure side of the disjunction.
   *
   * @function first
   * @memberof Validation
   * @instance
   * @alias failureMap
   * @param {Function} morphism - A failure mapping function.
   * @return {Validation}
   * @example <caption>Success#first</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1)
   *   .first(F.get("message"));
   * // => Success(1)
   *
   * @example <caption>Failure#first</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.failure(new Error("file not found"))
   *   .first(F.get("message"));
   * // => Failure(["file not found"])
   */
  first(morphism) {
    return this.bimap(morphism, F.identity);
  }

  flatMap(morphism) {
    return this.chain(morphism);
  }

  /**
   * Functor {@code fmap}. Takes a {@link Function} to map the {@code value}.
   *
   * @abstract
   * @function fmap
   * @memberof Validation
   * @instance
   * @alias map
   * @param {Function} morphism - A mapping function.
   * @return {Validation}
   * @example <caption>Success#fmap with known values</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success([1, 3, 2])
   *   .fmap(F.pipe(F.sort, F.join(", ")));
   * // => Success("1, 2, 3")
   *
   * @example <caption>Success#fmap with unknown values</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.ofNullable(values)
   *   .filter(F.isArray)
   *   .fmap(F.sort)
   *   .fmap(F.join(", "));
   * // => Success("1, 2, 3") or Failure([Error])
   *
   * @example <caption>Failure#fmap</caption>
   *
   * Validation.failure(error)
   *   .filter(F.isArray);
   * // => Failure([error])
   */

  /**
   * Foldable {@code foldl}.
   *
   * @abstract
   * @function foldl
   * @memberof Validation
   * @instance
   * @alias reduce
   * @param {LeftFold} failureFold - A failure folding function.
   * @param {*} defaultValue - The default value.
   * @return {*}
   * @example <caption>Success#foldl</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1).foldl(
   *   (value, defaultValue) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 1
   *
   * @example <caption>Failure#foldl</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.failure(error).foldl(
   *   (value, defaultValue) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 0
   */

  /**
   * Foldable {@code foldr}.
   *
   * @abstract
   * @function foldr
   * @memberof Validation
   * @instance
   * @param {RightFold} successFold - A success folding function.
   * @param {*} defaultValue - The default value.
   * @return {*}
   * @example <caption>Success#foldr</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1).foldr(
   *   (defaultValue, value) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 1
   *
   * @example <caption>Failure#foldr</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.failure(error).foldr(
   *   (defaultValue, value) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 0
   */

  /**
   * Returns the value for a {@link Failure}.
   *
   * @abstract
   * @function getFailure
   * @memberof Validation
   * @instance
   * @return {*}
   * @example <caption>Success#getFailure</caption>
   *
   * Validation.success(1).getFailure();
   * // => undefined
   *
   * @example <caption>Failure#getFailure</caption>
   *
   * Validation.failure(error).getFailure();
   * // => [error]
   */
  getFailure() {
    return this.value;
  }

  /**
   * Returns the value for a {@link Success}.
   *
   * @abstract
   * @function getSuccess
   * @memberof Validation
   * @instance
   * @return {*}
   * @example <caption>Success#getSuccess</caption>
   *
   * Validation.success(1).getSuccess();
   * // => 1
   *
   * @example <caption>Failure#getSuccess</caption>
   *
   * Validation.failure(error).getSuccess();
   * // => undefined
   */
  getSuccess() {
    return this.value;
  }

  /**
   * Returns the value if the {@code instance} is a {@link Success}; otherwise, the {@code otherValue}.
   *
   * @abstract
   * @function getOrElse
   * @memberof Validation
   * @instance
   * @param {*} value - Other value.
   * @return {*}
   * @example <caption>Success#getOrElse</caption>
   *
   * Validation.success(1).getOrElse(2);
   * // => 1
   *
   * @example <caption>Failure#getOrElse</caption>
   *
   * Validation.failure(error).getOrElse(2);
   * // => 2
   */

  /**
   * Returns the value if the {@code instance} is a {@link Success}; otherwise, the value of the {@code supplier}.
   *
   * @abstract
   * @function getOrElseGet
   * @memberof Validation
   * @instance
   * @param {Supplier} supplier - A supplier.
   * @return {*}
   * @example <caption>Success#getOrElseGet</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1).getOrElseGet(F.constant(2));
   * // => 1
   *
   * @example <caption>Failure#getOrElseGet</caption>
   *
   * Validation.failure(error).getOrElseGet(F.constant(2));
   * // => 2
   */

  /**
   * Returns the value if the {@code instance} is a {@link Success}; otherwise, throws the supplied {@code Error}.
   *
   * @abstract
   * @function getOrElseThrow
   * @memberof Validation
   * @instance
   * @param {Function} morphism - An error morphism.
   * @return {*}
   * @throws {Error} If the {@code instance} is a {@link Failure}.
   * @example <caption>Success#getOrElseThrow</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1).getOrElseThrow(F.constant(new Error()));
   * // => 1
   *
   * @example <caption>Failure#getOrElseThrow(Function)</caption>
   *
   * Validation.failure(error).getOrElseThrow(F.head);
   * // throws error
   *
   * @example <caption>Failure#getOrElseThrow(Supplier)</caption>
   *
   * Validation.failure(error).getOrElseThrow(F.constant(new Error()));
   * // throws Error
   */

  /**
   * Executes the {@code consumer} if the {@code instance} is a {@link Failure}.
   *
   * @abstract
   * @function ifSuccess
   * @memberof Validation
   * @instance
   * @param {Consumer} consumer - A consumer.
   * @return {Validation}
   * @example <caption>Success#ifFailure</caption>
   *
   * Validation.success(value).ifFailure(doSomething); // void
   * // => Success(value)
   *
   * @example <caption>Failure#ifFailure</caption>
   *
   * Validation.failure(error).ifFailure(doSomething); // doSomething([error])
   * // => Failure([error])
   */

  /**
   * Executes the {@code consumer} if the {@code instance} is a {@link Success}.
   *
   * @abstract
   * @function ifSuccess
   * @memberof Validation
   * @instance
   * @param {Consumer} consumer - A consumer.
   * @return {Validation}
   * @example <caption>Success#ifSuccess</caption>
   *
   * Validation.success(value).ifSuccess(doSomething); // doSomething(value)
   * // => Success(value)
   *
   * @example <caption>Failure#ifSuccess</caption>
   *
   * Validation.failure(error).ifSuccess(doSomething); // void
   * // => Failure([error])
   */

  /**
   * Determines whether or not the {@code instance} is a {@link Failure}.
   *
   * @abstract
   * @function isFailure
   * @memberof Validation
   * @instance
   * @return {Boolean}
   * @example <caption>Success#isFailure</caption>
   *
   * Validation.success(value).isFailure();
   * // => false
   *
   * @example <caption>Failure#isFailure</caption>
   *
   * Validation.failure(error).isFailure();
   * // => true
   */
  isFailure() {
    return !this.isSuccess();
  }

  /**
   * Determines whether or not the {@code instance} is a {@link Success}.
   *
   * @abstract
   * @function isSuccess
   * @memberof Validation
   * @instance
   * @return {Boolean}
   * @example <caption>Success#isSuccess</caption>
   *
   * Validation.success(value).isSuccess();
   * // => true
   *
   * @example <caption>Failure#isSuccess</caption>
   *
   * Validation.failure(error).isSuccess();
   * // => false
   */

  failureMap(morphism) {
    return this.first(morphism);
  }

  /**
   * Foldable {@code length}. Returns {@code 1} for a {@link Success} and {@code 0} for a {@link Failure}.
   *
   * @abstract
   * @function length
   * @memberof Validation
   * @instance
   * @return {Number}
   * @example <caption>Success#length</caption>
   *
   * Validation.success(value).length();
   * // => 1
   *
   * @example <caption>Failure#length</caption>
   *
   * Validation.failure(error).length();
   * // => 0
   */

  map(morphism) {
    return this.fmap(morphism);
  }

  /**
   * Returns a {@link Validation} (read {@link Success}) of the value.
   *
   * @function of
   * @memberof Validation
   * @instance
   * @param {*} value - An arbitrary value.
   * @return {Validation}
   * @example
   *
   * const validation = Validation.pure(1);
   * // Success(1)
   *
   * validation.of();
   * // => Success()
   *
   * validation.of(null);
   * // => Success(null)
   *
   * validation.of(true);
   * // => Success(true)
   *
   * validation.of(Validation.success(true));
   * // => Success(Success(true))
   *
   * validation.of(Validation.failure(error));
   * // => Success(Failure([error]));
   */
  of(value) {
    return Validation.pure(value);
  }

  /**
   * Recover from a {@link Failure} into a {@link Success}.
   *
   * @abstract
   * @function recover
   * @memberof Validation
   * @instance
   * @param {*} value - Recover value or function that provides the value.
   * @return {Validation}
   * @example <caption>Success#recover</caption>
   *
   * Validation.success(1).recover(2);
   * // => Success(1)
   *
   * @example <caption>Failure#recover</caption>
   *
   * Validation.failure(error).recover(null);
   * // => Success(null)
   *
   * Validation.failure(error).recover(2);
   * // => Success(2)
   */

  reduce(failureFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(failureFold, defaultValue) :
      this.foldl(failureFold, defaultValue);
  }

  successMap(morphism) {
    return this.second(morphism);
  }

  /**
   * Bifunctor {@code second}. Maps the second or success side of the disjunction.
   *
   * @function second
   * @memberof Validation
   * @instance
   * @alias successMap
   * @param {Function} morphism - A success mapping function.
   * @return {Validation}
   * @example <caption>Success#second</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.success(1)
   *   .second(F.add(2));
   * // => Success(3)
   *
   * @example <caption>Failure#second</caption>
   *
   * const F = require("lodash/fp");
   *
   * Validation.failure(error)
   *   .second(F.add(2));
   * // => Failure([error])
   */
  second(morphism) {
    return this.bimap(F.identity, morphism);
  }

  /**
   * Taps into the underlying value of {@link Validation}.
   *
   * @abstract
   * @function tap
   * @memberof Validation
   * @instance
   * @param {Consumer} failureConsumer - A failure consumer.
   * @param {Consumer} successRonsumer - A success consumer.
   * @return {Validation}
   * @example <caption>Success#tap</caption>
   *
   * Validation.success(1).tap(
   *   errors => console.log(`Invoked if a Failure with errors: '${errors}'.`),
   *   value => console.log(`Invoked if a Success with value '${value}'.`)
   * );
   * // => "Invoked if a Success with value '1'."
   *
   * @example <caption>Failure#tap</caption>
   *
   * Validation.failure(error).tap(
   *   errors => console.log(`Invoked if a Failure with errors: '${errors}'.`),
   *   value => console.log(`Invoked if a Success with value '${value}'.`)
   * );
   * // => "Invoked if a Failure with error 'Error'"
   */
  tap(failureConsumer, successConsumer) {
    return arguments.length === 1 ?
      successConsumer => this.tap(failureConsumer, successConsumer) :
      this.ifFailure(failureConsumer)
        .ifSuccess(successConsumer);
  }

  /**
   * Converts the {@code instance} to a {@link Array}.
   *
   * @abstract
   * @function toArray
   * @memberof Validation
   * @instance
   * @return {Array}
   * @example <caption>Success#toArray</caption>
   *
   * Validation.success(value).toArray();
   * // => [value]
   *
   * @example <caption>Failure#toArray</caption>
   *
   * Validation.failure(error).toArray();
   * // => []
   */

  /**
   * Converts the validation to an {@link Either} using the provided {@link Either} implementation. {@link Success}
   * becomes a {@link Right} and {@link Failure} becomes a {@link Left}.
   *
   * @abstract
   * @function toEither
   * @memberof Validation
   * @instance
   * @param {Either} either - Either implementation.
   * @return {Either}
   * @example <caption>Success#toEither</caption>
   *
   * Validation.success(value).toEither(Either);
   * // => Either.Right(value);
   *
   * @example <caption>Failure#toEither</caption>
   *
   * Validation.failure(error).toEither(Either);
   * // => Either.Left([error]);
   */

  /**
   * Converts the validation to an {@link Maybe} using the provided {@link Maybe} implementation. {@link Success}
   * becomes a {@link Just} and {@link Failure} becomes a {@link Nothing}.
   *
   * @abstract
   * @function toMaybe
   * @memberof Validation
   * @instance
   * @param {Maybe} maybe - Maybe implementation.
   * @return {Maybe}
   * @example <caption>Success#toMaybe</caption>
   *
   * Validation.success(value).toMaybe(Maybe);
   * // => Maybe.Just(value);
   *
   * @example <caption>Failure#toMaybe</caption>
   *
   * Validation.failure(error).toMaybe(Maybe);
   * // => Maybe.Nothing();
   */

  /**
   * Converts the validation to a {@link Promise} using the provided {@link Promise}  implementation. {@link Success}
   * becomase a {@code Resolved} and {@link Failure} becomes a {@code Rejected}.
   *
   * @abstract
   * @function toPromise
   * @memberof Validation
   * @instance
   * @param {Promise} promise - Promise implementation.
   * @return {Promise}
   * @example <caption>Success#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Validation.success(value).toPromise(Bluebird);
   * // => Promise.resolve(value);
   *
   * @example <caption>Failure#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Validation.failure(error).toPromise(Bluebird);
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
   * Validation.success(1).toString();
   * // => "Success(1)"
   *
   * @example <caption>Failure#toString</caption>
   *
   * Validation.failure("Error message").toString();
   * // => "Failure('[Error message]')"
   */
}

/**
 * @extends Validation
 * @inheritdoc
 */
class Failure extends Validation {
  constructor(value) {
    super(F.isArray(value) ? value : [value]);
  }

  alt(other) {
    const result = F.isFunction(other) ? other() : other;

    if (Validation.isNotValidation(result)) {
      throw new Error("Validation#alt: the provided other value must return an instance of Validation.");
    }

    return result;
  }

  ap(other) {
    return other.isFailure() ? other : this;
  }

  bimap(failureMorphism) {
    return arguments.length === 1 ?
      successMorphism => this.bimap(failureMorphism, successMorphism) :
      new Failure(failureMorphism(this.value));
  }

  chain() {
    return this;
  }

  checkedBimap(failureFold) {
    return arguments.length === 1 ?
      morphism => this.checkedBimap(failureFold, morphism) :
      new Failure(failureFold(this.value, null));
  }

  concat(other) {
    return other.isFailure() ? other.first(F.concat(this.value)) : this;
  }

  filter(predicate) {
    return arguments.length === 1 ?
      value => this.filter(predicate, value) :
      this;
  }

  fmap() {
    return this;
  }

  foldl(failureFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(failureFold, defaultValue) :
      defaultValue;
  }

  foldr(successFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldr(successFold, defaultValue) :
      defaultValue;
  }

  getOrElse(value) {
    return value;
  }

  getOrElseGet(supplier) {
    return supplier();
  }

  getOrElseThrow(morphism) {
    throw morphism(this.value);
  }

  ifFailure(consumer) {
    consumer(this.value);

    return this;
  }

  ifSuccess() {
    return this;
  }

  isSuccess() {
    return false;
  }

  length() {
    return 0;
  }

  recover(value) {
    return new Success(value);
  }

  toArray() {
    return [];
  }

  toEither(either) {
    return either.left(this.value);
  }

  toMaybe(maybe) {
    return maybe.nothing();
  }

  toPromise(promise) {
    return promise.reject(this.value);
  }

  toString() {
    return `Failure(${this.value})`;
  }
}

/**
 * @extends Validation
 * @inheritdoc
 */
class Success extends Validation {
  alt() {
    return this;
  }

  ap(other) {
    return other.isSuccess() ?
      this.fmap(other.getSuccess()) :
      other;
  }

  bimap(failureMorphism, successMorphism) {
    return arguments.length === 1 ?
      successMorphism => this.bimap(failureMorphism, successMorphism) :
      new Success(successMorphism(this.value));
  }

  chain(morphism) {
    const result = morphism(this.value);

    if (Validation.isNotValidation(result)) {
      throw new Error("Validation#chain: the provided morphism must return an instance of Validation.");
    }

    return morphism(this.value);
  }

  checkedBimap(failureFold, throwable) {
    let result = null;

    if (arguments.length === 1) {
      result = throwable => this.checkedBimap(failureFold, throwable);
    } else {
      try {
        result = new Success(throwable(this.value));
      } catch (error) {
        result = new Failure(failureFold(null, error));
      }
    }

    return result;
  }

  concat(other) {
    return other.isFailure() ? other : this;
  }

  filter(predicate, value) {
    let result = null;

    if (arguments.length === 1) {
      result = value => this.filter(predicate, value);
    } else {
      result = predicate(this.value) === true ?
        this :
        new Failure(F.isFunction(value) ? value() : value);
    }

    return result;
  }

  fmap(morphism) {
    return new Success(morphism(this.value));
  }

  foldl(failureFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(failureFold, defaultValue) :
      failureFold(defaultValue, this.value);
  }

  foldr(successFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldr(successFold, defaultValue) :
      successFold(this.value, defaultValue);
  }

  getOrElse() {
    return this.value;
  }

  getOrElseGet() {
    return this.value;
  }

  getOrElseThrow() {
    return this.value;
  }

  ifFailure() {
    return this;
  }

  ifSuccess(consumer) {
    consumer(this.value);

    return this;
  }

  isSuccess() {
    return true;
  }

  length() {
    return 1;
  }

  recover() {
    return this;
  }

  toArray() {
    return [this.value];
  }

  toEither(either) {
    return either.right(this.value);
  }

  toMaybe(maybe) {
    return maybe.just(this.value);
  }

  toPromise(promise) {
    return promise.resolve(this.value);
  }

  toString() {
    return `Success(${this.value})`;
  }
}

module.exports = {
  Validation,
  Failure,
  Success
};
