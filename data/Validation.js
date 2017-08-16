"use strict";

// Third Party
const F = require("lodash/fp");

const Validation = require("./class/Validation").Validation;

/**
 * {@link Validation} type constructor.
 * @constructor
 * @param {*} success - Arbitrary success value.
 * @return {Validation}
 */
function ValidationType(success) {
  return Validation.success(success);
}

/**
 * Returns a {@link Validation} that resolves all of the maybes in the collection into a single {@link Validation}.
 * @static
 * @memberof Validation
 * @param {Validation[]} list - Array of {@link Validation}.
 * @return {Validation}
 * @example
 *
 * const v1 = Validation.success(value1);
 * const v2 = Validation.success(value2);
 * const v3 = Validation.failure(error1);
 * const v4 = Validation.failure(error2);
 *
 * Validation.all([v1, v2]);
 * // => Success([value1, value2])
 *
 * Validation.all([v1, v2, v3]);
 * // => Failure([error1])
 *
 * Validation.all([v1, v2, v3, v4]);
 * // => Failure([error1])
 */
ValidationType.all = list => F.find(Validation.isFailure, list) ||
  Validation.success(F(list).map(Validation.fromSuccess).reduce(F.concat, []));

/**
 * Static implementation of {@link Validation#alt}.
 * @static
 * @memberof Validation
 * @alias Validation.coalesce
 * @param {(Validation|Supplier.<Validation>)} other - Another instance of {@link Validation} or a {@link Supplier} that
 * produces a {@link Validation}.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#alt
 */
ValidationType.alt = F.curry((other, validation) => validation.alt(other));

/**
 * Returns the first {@link Success} as a {@link Just} in the collection or finally a {@link Nothing}.
 * @static
 * @memberof Validation
 * @param {Maybe} maybe - Maybe implementation.
 * @param {Validation[]} list - List of {@link Validation}.
 * @return {Validation}
 * @example
 *
 * const v1 = Validation.success(value1);
 * const v2 = Validation.success(value2);
 * const v3 = Validation.failure(error1);
 * const v4 = Validation.failure(error2);
 *
 * Validation.any([v1, v2]);
 * // => Success(value1)
 *
 * Validation.any([v2, v3]);
 * // => Success(value2)
 *
 * Validation.any([v3, v4]);
 * // => Failure(error1)
 */
ValidationType.any = F.curry((maybe, list) => F.isNull(list) || F.isUndefined(list) ?
  maybe.nothing() :
  maybe.from(F(list)
    .filter(Validation.isSuccess)
    .map(Validation.fromSuccess)
    .head()
  )
);

/**
 * Static implementation of {@link Validation#ap}.
 * @static
 * @memberof Validation
 * @param {Validation.<Function>} other - A {@link Validation} of a {@link Function}.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#ap
 */
ValidationType.ap = F.curry((other, validation) => validation.ap(other));

/**
 * Captures the possible {@link Error} as a {@link Failure} otherwise the {@code value} in a {@link Success}.
 * @memberof Validation
 * @static
 * @param {Supplier} supplier - A supplier.
 * @return {Validation}
 * @example <caption>Thrown error</caption>
 *
 * const data = Validation.attempt(() => fs.readFileSync(filePath, options));
 * // Success(fileData) or Failure(Error)
 *
 * @example <caption>Possible null object path</caption>
 *
 * const value = Validation.attempt(() => context.some.property.path.value);
 * // Success(contextValue) or Failure(Error)
 */
ValidationType.attempt = function (supplier) {
  try {
    return ValidationType.success(supplier());
  } catch (error) {
    return ValidationType.failure(error);
  }
};

/**
 * Static implementation of {@link Validation#chain}.
 * @static
 * @memberof Validation
 * @param {Chain.<Validation>} morphism - A chaining function.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#chain
 */
ValidationType.chain = F.curry((morphism, validation) => validation.chain(morphism));

/**
 * Static implementation of {@link Validation#checkedBimap}.
 * @static
 * @memberof Validation
 * @param {Function} leftFold - Folds the failure value and the {@link Error} thrown by the {@code morphism} into a
 * singular value.
 * @param {Throwable} throwable - A throwable function.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#checkedMap
 */
ValidationType.checkedBimap = F.curryN(
  3,
  (leftFold, throwable, validation) => validation.checkedBimap(leftFold, throwable)
);

/**
 * Static implementation of {@link Validation#concat}.
 * @static
 * @memberof Validation
 * @param {Validation} other - Another instance of {@link Validation}.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#concat
 */
ValidationType.concat = F.curry((other, validation) => validation.concat(other));

/**
 * Iterates over a collection of validations and invokes the {@code iteratee} for each {@link Validation}. The
 * {@code iteratee} is invoked with one argument: {@code (value)}. Iteratee functions may exit iteration early by
 * explicitly returning a {@link Failure}.
 * @static
 * @memberof Validation
 * @param {Consumer} iteratee - The function to invoke per iteration.
 * @param {Validation[]} values - Collection of {@link Validation} over which to iterate.
 * @return {Validation[]} Current {@link Validation} collection.
 * @example
 *
 * const optionalValues = [
 *   getValue(path1, source), // => Success(value1)
 *   getValue(path2, source), // => Success(value2)
 *   getValue(path3, source), // => Failure(error1)
 *   getValue(path4, source), // => Failure(error2)
 *   getValue(path6, source)  // => Success(value3)
 * ];
 *
 * Validation.each(Validation.ifSuccess(console.log), optionalValues);
 * // => value1
 * // => value2
 */
ValidationType.each = F.curry((iteratee, values) => F.each(
  F.pipe(iteratee, Validation.isNotFailure),
  values
));

/**
 * Static implementation of {@link Validation#equals}.
 * @static
 * @memberof Validation
 * @param {*} other - Other value.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Boolean}
 * @see Validation#equals
 */
ValidationType.equals = F.isEqual;

/**
 * Static implementation of {@link Validation#filter}.
 * @static
 * @memberof Validation
 * @param {Predicate} predicate - A predicate.
 * @param {*} failureValue - Value to use if the predicate returns {@code false}.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#filter
 */
ValidationType.filter = F.curryN(
  3,
  (predicate, failureValue, validation) => validation.filter(predicate, failureValue)
);

/**
 * Static implementation of {@link Validation#fmap}.
 * @static
 * @memberof Validation
 * @alias Validation.map
 * @param {Function} morphism - A mapping function.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#fmap
 */
ValidationType.fmap = F.curry((morphism, validation) => validation.fmap(morphism));

/**
 * Static implementation of {@link Validation#foldl}.
 * @static
 * @memberof Validation
 * @alias reduce
 * @param {LeftFold} leftFold - A left folding function.
 * @param {*} defaultValue - The default value.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#foldl
 */
ValidationType.foldl = F.curryN(3, (leftFold, defaultValue, validation) => validation.foldl(leftFold, defaultValue));

/**
 * Static implementation of {@link Validation#foldr}.
 * @static
 * @memberof Validation
 * @param {RightFold} rightFold - A right folding function.
 * @param {*} defaultValue - The default value.
 * @return {*}
 * @see Validation#foldr
 */
ValidationType.foldr = F.curryN(3, (rightFold, defaultValue, validation) => validation.foldr(rightFold, defaultValue));

/**
 * Static implementation of {@link Validation#getOrElse}.
 * @static
 * @memberof Validation
 * @param {*} other - Other value.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#getOrElse
 */
ValidationType.getOrElse = F.curry((other, validation) => validation.getOrElse(other));

/**
 * Static implementation of {@link Validation#getOrElseGet}.
 * @static
 * @memberof Validation
 * @param {Supplier} supplier - A supplier.
 * @param {Validation} maybe - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#getOrElseGet
 */
ValidationType.getOrElseGet = F.curry((supplier, maybe) => maybe.getOrElseGet(supplier));

/**
 * Static implementation of {@link Validation#ifFailure}.
 * @static
 * @memberof Validation
 * @param {Consumer} consumer - A consumer.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#ifFailure
 */
ValidationType.ifFailure = F.curry((consumer, validation) => validation.ifFailure(consumer));

/**
 * Static implementation of {@link Validation#ifSuccess}.
 * @static
 * @memberof Validation
 * @param {Consumer} consumer - A consumer.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#ifSuccess
 */
ValidationType.ifSuccess = F.curry((consumer, validation) => validation.ifSuccess(consumer));

/**
 * Maps the underlying values in an list of {@link Validation}.
 * @static
 * @memberof Validation
 * @param {Function} morphism - A mapping function.
 * @param {Validation[]} list - A list of {@link Validation}.
 * @return {Validation[]}
 * @example
 *
 * Validation.lift(
 *   value => value + 1,
 *   [Validation.success(1), Validation.success(2), Validation.success(3)]
 * );
 * // => [Success(2), Success(3), Success(4)]
 */
ValidationType.lift = F.curry((morphism, list) => F.isArray(list) ?
  F.map(ValidationType.fmap(morphism), list) :
  []
);

/**
 * Static implementation of {@link Validation#recover}.
 * @static
 * @memberof Validation
 * @param {*} value - Recover value or function that provides the value.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#recover
 */
ValidationType.recover = F.curry((value, validation) => validation.recover(value));

/**
 * Static implementation of {@link Validation#tap}.
 * @static
 * @memberof Validation
 * @param {Callable} failureConsumer - A failure consumer.
 * @param {Consumer} successConsumer - A success consumer.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#tap
 */
ValidationType.tap = F.curryN(
  3,
  (failureConsumer, successConsumer, validation) => validation.tap(failureConsumer, successConsumer)
);

/**
 * Static implementation of {@link Validation#toArray}.
 * @static
 * @memberof Validation
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Array}
 */
ValidationType.toArray = validation => validation.toArray();

/**
 * Static implementation of {@link Validation#toEither}.
 * @static
 * @memberof Validation
 * @param {Validation} either - Either implementation.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#toEither
 */
ValidationType.toEither = F.curry((either, validation) => validation.toEither(either));

/**
 * Static implementation of {@link Validation#toMaybe}.
 * @static
 * @memberof Validation
 * @param {Maybe} maybe - Maybe implementation.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#toMaybe
 */
ValidationType.toMaybe = F.curry((maybe, validation) => validation.toMaybe(maybe));

/**
 * Static implementation of {@link Validation#toPromise}.
 * @static
 * @memberof Validation
 * @param {Promise} promise - Promise implementation.
 * @param {Validation} validation - An instance of {@link Validation}.
 * @return {Validation}
 * @see Validation#toPromise
 */
ValidationType.toPromise = F.curry((promise, validation) => validation.toPromise(promise));

/**
 * Reduces the {@link Failure} and {@link Success} values into a singular value from the {@link Validation}.
 * @static
 * @memberof Validation
 * @param {Function} failureMapper - Maps the {@link Failure} value.
 * @param {Function} successMapper - Maps the {@link Success} value.
 * @return {*}
 * @example
 * const validationFile = Validation.attempt(() => fs.readFileSync("file.txt", "utf8"));
 *
 * Validation.validation(F.constant(""), F.identity, validationFile);
 * // => fileData or ""
 */
ValidationType.validate = F.curryN(3, (failureMapper, successMapper, validation) => validation.isSuccess() ?
  successMapper(Validation.fromSuccess(validation)) :
  failureMapper(Validation.fromFailure(validation))
);

// Aliases
ValidationType.coalesce = ValidationType.alt;
ValidationType.flatMap = ValidationType.chain;
ValidationType.from = Validation.from;
ValidationType.fromFailure = Validation.fromFailure;
ValidationType.fromSuccess = Validation.fromSuccess;
ValidationType.isValidation = Validation.isValidation;
ValidationType.isFailure = Validation.isFailure;
ValidationType.isNotValidation = Validation.isNotValidation;
ValidationType.isNotFailure = Validation.isNotFailure;
ValidationType.isNotSuccess = Validation.isNotSuccess;
ValidationType.isSuccess = Validation.isSuccess;
ValidationType.fail = Validation.fail;
ValidationType.failure = Validation.failure;
ValidationType.failures = Validation.failures;
ValidationType.map = ValidationType.fmap;
ValidationType.of = Validation.pure;
ValidationType.ofNullable = Validation.ofNullable;
ValidationType.pass = Validation.pass;
ValidationType.pure = Validation.pure;
ValidationType.reduce = ValidationType.foldl;
ValidationType.success = Validation.success;
ValidationType.successs = Validation.successes;

module.exports = ValidationType;
