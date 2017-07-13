"use strict";

// Third Party
const F = require("lodash/fp");

/**
 * The {@link Either} type is intended for handling disjointed, but related values such as the result or exceptional
 * behavior of some function. It is a disjunction similar to {@link Validation}. The key difference of the
 * {@link Either} type is the focus on the single error as opposed to aggregating many errors. Much like
 * {@link Validation}, {@link Either} is right-biased.
 *
 * @param {*} value - Value to wrap.
 * @return {Either} {@link Either} wrapped {@code value}.
 * @example <caption>Via function</caption>
 *
 * const e1 = Either.right(value);
 * const e2 = Either.left(otherValue);
 *
 * @example <caption>Via throwable function</caption>
 *
 * const fs = require("fs");
 * const Either = require("lodash-fantasy/data/Either");
 *
 * function readFileSyncSafe(filePath, options) {
 *   return Either.attempt(() => fs.readFileSync(filePath, options)));
 * }
 *
 * module.exports = readFileSyncSafe;
 */
class Either {
  /**
   * Creates a {@link Either} from the some context with the following mapping:
   *
   *   - If the context is a {@link Either}, then the instance itself.
   *   - If the context is {@code null} or {@code undefined}, then a {@link Left} of an {@link Error}.
   *   - Otherwise a {@link Right} of the {@code context}.
   *
   * @static
   * @memberof Either
   * @param {*} context - Some value context.
   * @return {Either}
   * @example
   * const map = require("lodash/fp/map");
   *
   * const allMaybes = map(Either.from, [undefined, null, "", Right(0), Left("message")]);
   * // [Left(Error), Left(Error), Right(""), Right(0), Left("message")]
   */
  static from(context) {
    return Either.isEither(context) ?
      context :
      Either.ofNullable(context);
  }

  /**
   * Returns the value within a {@link Left} or throws an {@link Error} otherwise.
   *
   * @static
   * @memberof Either
   * @param {Either} either - The {@link Either} to unpack.
   * @return {*}
   * @throws Error If not a {@link Left}.
   * @example <caption>Unpacking collection of Either</caption>
   *
   * const F = require("lodash/fp");
   *
   * F(eithers)
   *   .filter(Either.isLeft)
   *   .map(Either.fromLeft)
   *   .value();
   */
  static fromLeft(either) {
    if (Either.isNotLeft(either)) {
      throw new Error("Either.fromLeft: instance of either must be a Left.");
    }

    return either.getLeft();
  }

  /**
   * Returns the value within a {@link Right} or throws an {@link Error} otherwise.
   *
   * @static
   * @memberof Either
   * @param {Either} either - The {@link Either} to unpack.
   * @return {*}
   * @throws Error If not a {@link Right}.
   * @example <caption>Unpacking collection of Either</caption>
   *
   * const F = require("lodash/fp");
   *
   * F(eithers)
   *   .filter(Either.isRight)
   *   .map(Either.fromRight)
   *   .value();
   */
  static fromRight(either) {
    if (Either.isNotRight(either)) {
      throw new Error("Either.fromRight: instance of either must be a Right.");
    }

    return either.getRight();
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Left}.
   *
   * @static
   * @memberof Either
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Either.isEither(undefined); // => false
   * Either.isEither(null); // => false
   * Either.isEither(1); // => false
   * Either.isEither(Either.left("message")); // => true
   * Either.isEither(Either.right(1)); // => true
   */
  static isEither(value) {
    return value instanceof Either;
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Left}.
   *
   * @static
   * @memberof Either
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Either.isLeft(undefined); // => false
   * Either.isLeft(null); // => false
   * Either.isLeft(1); // => false
   * Either.isLeft(Either.left("message")); // => true
   * Either.isLeft(Either.right(1)); // => false
   */
  static isLeft(value) {
    return Either.isEither(value) && value.isLeft();
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Right}.
   *
   * @static
   * @memberof Either
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Either.isRight(undefined); // => false
   * Either.isRight(null); // => false
   * Either.isRight(1); // => false
   * Either.isRight(Either.left("message")); // => false
   * Either.isRight(Either.right(1)); // => true
   */
  static isRight(value) {
    return Either.isEither(value) && value.isRight();
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Either}.
   *
   * @static
   * @memberof Either
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotEither(value) {
    return !Either.isEither(value);
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Left}.
   *
   * @static
   * @memberof Either
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotLeft(value) {
    return !Either.isLeft(value);
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Right}.
   *
   * @static
   * @memberof Either
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotRight(value) {
    return !Either.isRight(value);
  }

  /**
   * Creates a {@link Left} from an arbitrary value.
   *
   * @static
   * @constructor
   * @memberof Either
   * @param {*} value - An arbitrary value.
   * @return {Left}
   * @example
   *
   * Either.left(1); // => Left(1)
   */
  static left(value) {
    return new Left(value);
  }

  /**
   * Collects all of the {@link Left} underlying values from a list of {@link Either}.
   *
   * @static
   * @memberof Either
   * @param {Either[]} list - A list of {@link Either}.
   * @return {Array}
   * @example
   *
   * Either.lefts([Left(1), Right("a"), Left(2), Right("b")]);
   * // => [1, 2]
   */
  static lefts(list) {
    return F.isArray(list) ?
      F(list)
        .filter(Either.isLeft)
        .map(Either.fromLeft)
        .value() :
      [];
  }

  /**
   * Null sensitive Applicative {@code pure} where {@code undefined} or {@code null} is treated as {@link Left} of
   * {@link Error}.
   *
   * @static
   * @memberof Either
   * @param {*} value - An arbitrary nullable value.
   * @return {Either}
   * @example
   *
   * Either.ofNullable();
   * // => Left(Error("Either.ofNullable: value is null or undefined."))
   *
   * Either.ofNullable(null);
   * // => Left(Error("Either.ofNullable: value is null or undefined."))
   *
   * Either.ofNullable(true);
   * // => Right(true)
   *
   * Either.ofNullable(Either.right(true));
   * // => Right(Right(true))
   *
   * Either.ofNullable(Either.left("message"));
   * // => Right(Left("message"));
   */
  static ofNullable(value) {
    return F.isNull(value) || F.isUndefined(value) ?
      Either.left(new Error("Either.ofNullable: value is null or undefined.")) :
      Either.right(value);
  }

  /**
   * Applicative {@code pure}. Returns an {@link Either} (read {@link Right}) of the value.
   *
   * @memberof Either
   * @static
   * @alias Either.of
   * @param {*} value - An arbitrary value.
   * @return {Either}
   * @example
   *
   * Either.pure();
   * // => Right()
   *
   * Either.pure(null);
   * // => Right(null)
   *
   * Either.pure(true);
   * // => Right(true)
   *
   * Either.pure(Either.right(true));
   * // => Right(Right(true))
   *
   * Either.pure(Either.left(error));
   * // => Right(Left(error));
   */
  static pure(value) {
    return new Right(value);
  }

  /**
   * Creates a {@link Right} from an arbitrary value.
   *
   * @static
   * @constructor
   * @memberof Either
   * @param {*} value - An arbitrary value.
   * @return {Right}
   * @throws {Error} If the {@code value} is {@code undefined} or {@code null}.
   * @example
   *
   * Either.right(1); // => Right(1)
   */
  static right(value) {
    return new Right(value);
  }

  /**
   * Collects all of the {@link Right} underlying values from a list of {@link Either}.
   *
   * @static
   * @memberof Either
   * @param {Either[]} list - A list of {@link Either}.
   * @return {Array}
   * @example
   *
   * Either.rights([Left(1), Right("a"), Left(2), Right("b")]);
   * // => ["a", "b"]
   */
  static rights(list) {
    return F.isArray(list) ?
      F(list)
        .filter(Either.isRight)
        .map(Either.fromRight)
        .value() :
      [];
  }

  constructor(value) {
    this.value = value;
  }

  /**
   * Alt {@code alt} (i.e., {@code <!>}). Replace a {@link Left} with a {@link Either} of a value produced by
   * a {@link Supplier}.
   *
   * @abstract
   * @function alt
   * @memberof Either
   * @instance
   * @alias coalesce
   * @param {(Either|Supplier.<Either>)} other - Another instance of {@link Either} or a supplier that produces a
   * {@link Either}.
   * @return {Either}
   * @example <caption>Right#alt(Right)</caption>
   *
   * Either.right(true).alt(Either.right(false))
   * // => Right(true)
   *
   * @example <caption>Right#alt(Left)</caption>
   *
   * Either.right(true).alt(Either.left(error))
   * // => Right(true)
   *
   * @example <caption>Left#alt(Right)</caption>
   *
   * Either.left(error).alt(Either.right(false))
   * // => Right(false)
   *
   * @example <caption>Left#alt(Left)</caption>
   *
   * Either.left(error).alt(Either.left(error))
   * // => Left(error)
   */

  /**
   * Apply {@code ap} (i.e. {@code <.>} or Applicative {@code <*>}). Applies the current {@code value} to the
   * {@code value} of the {@code other}.
   *
   * @abstract
   * @function ap
   * @memberof Either
   * @instance
   * @param {Either.<Function>} other - A {@link Either} of a {@link Function}.
   * @return {Either}
   * @example <caption>Right#ap(Right)</caption>
   *
   * const F = require("lodash/fp");
   * const config = {
   *   property: true
   * };
   *
   * Either.right(config)
   *   .ap(Either.right(F.get("property")));
   * // => Right(true);
   *
   * @example <caption>Right#ap(Left)</caption>
   *
   * Either.right(config)
   *   .ap(Either.left(error));
   * // => Left(error)
   *
   * @example <caption>Left#ap(Right)</caption>
   *
   * Either.left(error)
   *   .ap(Either.right(F.get("property")));
   * // => Left(error);
   *
   * @example <caption>Left#ap(Left)</caption>
   *
   * Either.left(error1).ap(Either.left(error2));
   * // => Left(error2)
   */

  /**
   * Bifunctor {@code bimap}. Maps the underlying value of the disjunction.
   *
   * @function bimap
   * @memberof Either
   * @instance
   * @alias leftMap
   * @param {Function} morphism - A left mapping function.
   * @return {Either}
   * @example <caption>Right#bimap</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1)
   *   .bimap(F.get("message"), F.add(2));
   * // => Right(3)
   *
   * @example <caption>Left#bimap</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.left(new Error("file not found"))
   *   .bimap(F.get("message"), F.size);
   * // => Left("file not found")
   */

  /**
   * Chain {@code chain} (a.k.a {@code flatMap}). Takes a {@link Function} that accepts the {@code value} and returns a
   * {@link Either} of the return value.
   *
   * @abstract
   * @function chain
   * @memberof Either
   * @instance
   * @alias flatMap
   * @param {Chain.<Either>} morphism - A chaining function.
   * @return {Either}
   * @example <caption>Right#chain</caption>
   *
   * const F = require("lodash/fp");
   * const getConfigOption = F.curry((path, config) => Either.ofNullable(F.get(path, config)));
   *
   * Either.ofNullable(config)
   *   .chain(getConfigOption("path.to.option"));
   *   // => Right(value) or Left(Error)
   *
   * @example <caption>Left#chain</caption>
   *
   * Either.left(error).chain(getConfigOption("path.to.option"));
   * // => Left(error)
   */

  /**
   * Wraps the {@code morphism} in a {@code try..catch} where the successful mapping is returned in a {@link Right} or
   * the caught {@link Error} is ignored and returned as a {@link Left}.
   *
   * @abstract
   * @function checkedBimap
   * @memberof Either
   * @instance
   * @param {Function} leftFold - Folds the left value and the {@link Error} thrown by the {@code morphism} into a
   * singular value.
   * @param {Throwable} throwable - A throwable function.
   * @return {Either}
   * @example <caption>Right#checkedBimap</caption>
   *
   * Either.right("/tmp/file.txt")
   *   .checkedBimap(
   *     (error, initialError) => initialError, // since we are starting with a Right
   *     fs.readFileSync
   *   );
   * // => Right(data) or Left()
   *
   * @example <caption>Left#checkedBimap</caption>
   *
   * Either.left(error)
   *   .checkedBimap(
   *     (error, initialError) => error, // since we are starting with a Left
   *     fs.readFileSync
   *   );
   * // => Left(error)
   *
   * @example <caption>Either#checkedBimap</caption>
   *
   * Either.ofNullable(filePath) // => Right(String) or Left(Error)
   *   .checkedBimap(
   *     (error, initialError) => F.get("message", error || initialError), // Unpack the message from whichever
   *     fs.readFileSync
   *   ) // => Right(data) or Left(String)
   *   .ifLeft(console.log); // Log the error message
   */

  coalesce(value) {
    return this.alt(value);
  }

  /**
   * Setoid {@code equals}. Determines whether two objects are equivalent.
   *
   * @function equals
   * @memberof Either
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
   * Filters the underlying value through the {@code predicate}. Returns a {@link Left} of the {@code leftValue} if the
   * {@code predicate} returns {@code false}; otherwise, the instance is returned. If the {@code leftValue} is a
   * {@link Function}, the {@code leftValue} is invoked and the return value is used.
   *
   * @abstract
   * @function filter
   * @memberof Maybe
   * @instance
   * @param {Predicate} predicate - A predicate.
   * @param {*} leftValue - Value to use if the predicate returns {@code false}.
   * @return {Either}
   * @example <caption>Right#filter</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right("hello world")
   *   .filter(F.startsWith("hello"), () => new Error("Message did not start with 'hello'."));
   * // Right("hello world")
   *
   * Either.right("hello world")
   *   .filter(F.startsWith("world"), () => new Error("Message did not start with 'world'."));
   * // => Left(Error)
   *
   * @example <caption>Left#filter</caption>
   *
   * Either.left(Error)
   *   .filter(F.startsWith("hello"));
   * // => Left(Error)
   */

  /**
   * Bifunctor {@code first}. Maps the first or left side of the disjunction.
   *
   * @function first
   * @memberof Either
   * @instance
   * @alias leftMap
   * @param {Function} morphism - A left mapping function.
   * @return {Either}
   * @example <caption>Right#first</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1)
   *   .first(F.get("message"));
   * // => Right(1)
   *
   * @example <caption>Left#first</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.left(new Error("file not found"))
   *   .first(F.get("message"));
   * // => Left("file not found")
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
   * @memberof Either
   * @instance
   * @alias map
   * @param {Function} morphism - A mapping function.
   * @return {Either}
   * @example <caption>Right#fmap with known values</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right([1, 3, 2])
   *   .fmap(F.pipe(F.sort, F.join(", ")));
   * // => Right("1, 2, 3")
   *
   * @example <caption>Right#fmap with unknown values</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.ofNullable(values)
   *   .filter(F.isArray)
   *   .fmap(F.sort)
   *   .fmap(F.join(", "));
   * // => Right("1, 2, 3") or Left(Error)
   *
   * @example <caption>Left#fmap</caption>
   *
   * Either.left(error)
   *   .filter(F.isArray);
   * // => Left(error)
   */

  /**
   * Foldable {@code foldl}.
   *
   * @abstract
   * @function foldl
   * @memberof Either
   * @instance
   * @alias reduce
   * @param {LeftFold} leftFold - A left folding function.
   * @param {*} defaultValue - The default value.
   * @return {*}
   * @example <caption>Right#foldl</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1).foldl(
   *   (value, defaultValue) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 1
   *
   * @example <caption>Left#foldl</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.left(error).foldl(
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
   * @memberof Either
   * @instance
   * @param {RightFold} rightFold - A right folding function.
   * @param {*} defaultValue - The default value.
   * @return {*}
   * @example <caption>Right#foldr</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1).foldr(
   *   (defaultValue, value) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 1
   *
   * @example <caption>Left#foldr</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.left(error).foldr(
   *   (defaultValue, value) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 0
   */

  /**
   * Returns the value for a {@link Left}.
   *
   * @abstract
   * @function getLeft
   * @memberof Either
   * @instance
   * @return {*}
   * @example <caption>Right#getLeft</caption>
   *
   * Either.right(1).getLeft();
   * // => undefined
   *
   * @example <caption>Left#getLeft</caption>
   *
   * Either.left(error).getLeft();
   * // => error
   */
  getLeft() {
    return this.value;
  }

  /**
   * Returns the value for a {@link Right}.
   *
   * @abstract
   * @function getRight
   * @memberof Either
   * @instance
   * @return {*}
   * @example <caption>Right#getRight</caption>
   *
   * Either.right(1).getRight();
   * // => 1
   *
   * @example <caption>Left#getRight</caption>
   *
   * Either.left(error).getRight();
   * // => undefined
   */
  getRight() {
    return this.value;
  }

  /**
   * Returns the value if the {@code instance} is a {@link Right}; otherwise, the {@code otherValue}.
   *
   * @abstract
   * @function getOrElse
   * @memberof Either
   * @instance
   * @param {*} value - Other value.
   * @return {*}
   * @example <caption>Right#getOrElse</caption>
   *
   * Either.right(1).getOrElse(2);
   * // => 1
   *
   * @example <caption>Left#getOrElse</caption>
   *
   * Either.left(error).getOrElse(2);
   * // => 2
   */

  /**
   * Returns the value if the {@code instance} is a {@link Right}; otherwise, the value of the {@code supplier}.
   *
   * @abstract
   * @function getOrElseGet
   * @memberof Either
   * @instance
   * @param {Supplier} supplier - A supplier.
   * @return {*}
   * @example <caption>Right#getOrElseGet</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1).getOrElseGet(F.constant(2));
   * // => 1
   *
   * @example <caption>Left#getOrElseGet</caption>
   *
   * Either.left(error).getOrElseGet(F.constant(2));
   * // => 2
   */

  /**
   * Returns the value if the {@code instance} is a {@link Right}; otherwise, throws the supplied {@code Error}.
   *
   * @abstract
   * @function getOrElseThrow
   * @memberof Either
   * @instance
   * @param {Function} morphism - An error morphism.
   * @return {*}
   * @throws {Error} If the {@code instance} is a {@link Left}.
   * @example <caption>Right#getOrElseThrow</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1).getOrElseThrow(F.constant(new Error()));
   * // => 1
   *
   * @example <caption>Left#getOrElseThrow(Function)</caption>
   *
   * Either.left(error).getOrElseThrow(F.identity);
   * // throws error
   *
   * @example <caption>Left#getOrElseThrow(Supplier)</caption>
   *
   * Either.left(error).getOrElseThrow(F.constant(new Error()));
   * // throws Error
   */

  /**
   * Executes the {@code consumer} if the {@code instance} is a {@link Left}.
   *
   * @abstract
   * @function ifRight
   * @memberof Either
   * @instance
   * @param {Consumer} consumer - A consumer.
   * @return {Either}
   * @example <caption>Right#ifLeft</caption>
   *
   * Either.right(value).ifLeft(doSomething); // void
   * // => Right(value)
   *
   * @example <caption>Left#ifLeft</caption>
   *
   * Either.left(error).ifLeft(doSomething); // doSomething(error)
   * // => Left(error)
   */

  /**
   * Executes the {@code consumer} if the {@code instance} is a {@link Right}.
   *
   * @abstract
   * @function ifRight
   * @memberof Either
   * @instance
   * @param {Consumer} consumer - A consumer.
   * @return {Either}
   * @example <caption>Right#ifRight</caption>
   *
   * Either.right(value).ifRight(doSomething); // doSomething(value)
   * // => Right(value)
   *
   * @example <caption>Left#ifRight</caption>
   *
   * Either.left(error).ifRight(doSomething); // void
   * // => Left(error)
   */

  /**
   * Determines whether or not the {@code instance} is a {@link Left}.
   *
   * @abstract
   * @function isLeft
   * @memberof Either
   * @instance
   * @return {Boolean}
   * @example <caption>Right#isLeft</caption>
   *
   * Either.right(value).isLeft();
   * // => false
   *
   * @example <caption>Left#isLeft</caption>
   *
   * Either.left(error).isLeft();
   * // => true
   */
  isLeft() {
    return !this.isRight();
  }

  /**
   * Determines whether or not the {@code instance} is a {@link Right}.
   *
   * @abstract
   * @function isRight
   * @memberof Either
   * @instance
   * @return {Boolean}
   * @example <caption>Right#isRight</caption>
   *
   * Either.right(value).isRight();
   * // => true
   *
   * @example <caption>Left#isRight</caption>
   *
   * Either.left(error).isRight();
   * // => false
   */

  leftMap(morphism) {
    return this.first(morphism);
  }

  /**
   * Foldable {@code length}. Returns {@code 1} for a {@link Right} and {@code 0} for a {@link Left}.
   *
   * @abstract
   * @function length
   * @memberof Either
   * @instance
   * @return {Number}
   * @example <caption>Right#length</caption>
   *
   * Either.right(value).length();
   * // => 1
   *
   * @example <caption>Left#length</caption>
   *
   * Either.left(error).length();
   * // => 0
   */

  map(morphism) {
    return this.fmap(morphism);
  }

  /**
   * Returns a {@link Either} (read {@link Right}) of the value.
   *
   * @function of
   * @memberof Either
   * @instance
   * @param {*} value - An arbitrary value.
   * @return {Either}
   * @example
   *
   * const either = Either.pure(1);
   * // Right(1)
   *
   * either.of();
   * // => Right()
   *
   * either.of(null);
   * // => Right(null)
   *
   * either.of(true);
   * // => Right(true)
   *
   * either.of(Either.right(true));
   * // => Right(Right(true))
   *
   * either.of(Either.left(error));
   * // => Right(Left(error));
   */
  of(value) {
    return Either.pure(value);
  }

  /**
   * Recover from a {@link Left} into a {@link Right}.
   *
   * @abstract
   * @function recover
   * @memberof Either
   * @instance
   * @param {*} value - Recover value or function that provides the value.
   * @return {Either}
   * @example <caption>Right#recover</caption>
   *
   * Either.right(1).recover(2);
   * // => Right(1)
   *
   * @example <caption>Left#recover</caption>
   *
   * Either.left(error).recover(null);
   * // => Right(null)
   *
   * Either.left(error).recover(2);
   * // => Right(2)
   */

  reduce(leftFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(leftFold, defaultValue) :
      this.foldl(leftFold, defaultValue);
  }

  rightMap(morphism) {
    return this.second(morphism);
  }

  /**
   * Bifunctor {@code second}. Maps the second or right side of the disjunction.
   *
   * @function second
   * @memberof Either
   * @instance
   * @alias rightMap
   * @param {Function} morphism - A right mapping function.
   * @return {Either}
   * @example <caption>Right#second</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.right(1)
   *   .second(F.add(2));
   * // => Right(3)
   *
   * @example <caption>Left#second</caption>
   *
   * const F = require("lodash/fp");
   *
   * Either.left(error)
   *   .second(F.add(2));
   * // => Left(error)
   */
  second(morphism) {
    return this.bimap(F.identity, morphism);
  }

  /**
   * Taps into the underlying value of {@link Either}.
   *
   * @abstract
   * @function tap
   * @memberof Either
   * @instance
   * @param {Consumer} leftConsumer - A left consumer.
   * @param {Consumer} rightRonsumer - A right consumer.
   * @return {Either}
   * @example <caption>Right#tap</caption>
   *
   * Either.right(1).tap(
   *   error => console.log(`Invoked if a Left with error '${error}'.``),
   *   value => console.log(`Invoked if a Right with value '${value}'.`)
   * );
   * // => "Invoked if a Right with value '1'."
   *
   * @example <caption>Left#tap</caption>
   *
   * Either.left(error).tap(
   *   error => console.log(`Invoked if a Left with error '${error}'.`),
   *   value => console.log(`Invoked if a Right with value '${value}'.`)
   * );
   * // => "Invoked if a Left with error 'Error'"
   */
  tap(leftConsumer, rightConsumer) {
    return arguments.length === 1 ?
      rightConsumer => this.tap(leftConsumer, rightConsumer) :
      this.ifLeft(leftConsumer)
        .ifRight(rightConsumer);
  }

  /**
   * Converts the {@code instance} to a {@link Array}.
   *
   * @abstract
   * @function toArray
   * @memberof Either
   * @instance
   * @return {Array}
   * @example <caption>Right#toArray</caption>
   *
   * Either.right(value).toArray();
   * // => [value]
   *
   * @example <caption>Left#toArray</caption>
   *
   * Either.left(error).toArray();
   * // => []
   */

  /**
   * Converts the Either to a {@link Promise} using the provided {@link Promise} implementation.
   *
   * @abstract
   * @function toPromise
   * @memberof Either
   * @instance
   * @param {Promise} promise - Promise implementation.
   * @return {Promise}
   * @example <caption>Right#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Either.right(value).toPromise(Bluebird);
   * // => Promise.resolve(value);
   *
   * @example <caption>Left#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Either.left(error).toPromise(Bluebird);
   * // => Promise.reject(error);
   */

  /**
   * Returns a {@code String} representation of the {@link Either}.
   *
   * @abstract
   * @function toString
   * @memberof Either
   * @instance
   * @return {String}
   * @example <caption>Right#toString</caption>
   *
   * Either.right(value).toString();
   * // => "Right(value)"
   *
   * @example <caption>Left#toString</caption>
   *
   * Either.left(error).toString();
   * // => "Left(error)"
   */

  /**
   * Converts the {@link Either} to an {@link Validation}. {@link Right} becomes a {@link Success} and {@link Left}
   * becomes a {@link Failure}.
   *
   * @abstract
   * @function toValidation
   * @memberof Either
   * @instance
   * @param {Validation} validation - Validation implementation.
   * @return {Validation}
   * @example <caption>Right#toValidation</caption>
   *
   * const Validation = require("lodash-fantasy/data/Validation");
   *
   * Either.right(value).toValidation(Validation);
   * // => Success(value);
   *
   * @example <caption>Left#toValidation</caption>
   *
   * const Validation = require("lodash-fantasy/data/Validation");
   *
   * Either.left(error).toValidation(Validation);
   * // => Failure([error]);
   */
}

/**
 * @extends Either
 * @inheritdoc
 */
class Left extends Either {
  alt(other) {
    const result = F.isFunction(other) ? other() : other;

    if (Either.isNotEither(result)) {
      throw new Error("Either#alt: the provided other value must return an instance of Either.");
    }

    return result;
  }

  ap(other) {
    return other.isLeft() ? other : this;
  }

  bimap(leftMorphism) {
    return arguments.length === 1 ?
      rightMorphism => this.bimap(leftMorphism, rightMorphism) :
      new Left(leftMorphism(this.value));
  }

  chain() {
    return this;
  }

  checkedBimap(leftFold) {
    return arguments.length === 1 ?
      morphism => this.checkedBimap(leftFold, morphism) :
      new Left(leftFold(this.value, null));
  }

  filter(predicate) {
    return arguments.length === 1 ?
      value => this.filter(predicate, value) :
      this;
  }

  fmap() {
    return this;
  }

  foldl(leftFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(leftFold, defaultValue) :
      defaultValue;
  }

  foldr(rightFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldr(rightFold, defaultValue) :
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

  ifLeft(consumer) {
    consumer(this.value);

    return this;
  }

  ifRight() {
    return this;
  }

  isRight() {
    return false;
  }

  length() {
    return 0;
  }

  recover(value) {
    return new Right(value);
  }

  toArray() {
    return [];
  }

  toMaybe(maybe) {
    return maybe.nothing();
  }

  toPromise(promise) {
    return promise.reject(this.value);
  }

  toString() {
    return `Left(${this.value})`;
  }

  toValidation(validation) {
    return validation.failure(this.value);
  }
}

/**
 * @extends Either
 * @inheritdoc
 */
class Right extends Either {
  alt() {
    return this;
  }

  ap(other) {
    return other.isRight() ?
      this.fmap(other.getRight()) :
      other;
  }

  bimap(leftMorphism, rightMorphism) {
    return arguments.length === 1 ?
      rightMorphism => this.bimap(leftMorphism, rightMorphism) :
      new Right(rightMorphism(this.value));
  }

  chain(morphism) {
    const result = morphism(this.value);

    if (Either.isNotEither(result)) {
      throw new Error("Either#chain: the provided morphism must return an instance of Either.");
    }

    return morphism(this.value);
  }

  checkedBimap(leftFold, throwable) {
    let result = null;

    if (arguments.length === 1) {
      result = throwable => this.checkedBimap(leftFold, throwable);
    } else {
      try {
        result = new Right(throwable(this.value));
      } catch (error) {
        result = new Left(leftFold(null, error));
      }
    }

    return result;
  }

  filter(predicate, value) {
    let result = null;

    if (arguments.length === 1) {
      result = value => this.filter(predicate, value);
    } else {
      result = predicate(this.value) === true ?
        this :
        new Left(F.isFunction(value) ? value() : value);
    }

    return result;
  }

  fmap(morphism) {
    return new Right(morphism(this.value));
  }

  foldl(leftFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(leftFold, defaultValue) :
      leftFold(defaultValue, this.value);
  }

  foldr(rightFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldr(rightFold, defaultValue) :
      rightFold(this.value, defaultValue);
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

  ifLeft() {
    return this;
  }

  ifRight(consumer) {
    consumer(this.value);

    return this;
  }

  isRight() {
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

  toMaybe(maybe) {
    return maybe.just(this.value);
  }

  toPromise(promise) {
    return promise.resolve(this.value);
  }

  toString() {
    return `Right(${this.value})`;
  }

  toValidation(validation) {
    return validation.success(this.value);
  }
}

module.exports = {
  Either,
  Left,
  Right
};
