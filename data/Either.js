"use strict";

// Third Party
const F = require("lodash/fp");

const Either = require("./class/Either").Either;

/**
 * {@link Either} type constructor.
 * @constructor
 * @param {*} right - Arbitrary right value.
 * @return {Either}
 */
function EitherType(right) {
  return Either.right(right);
}

/**
 * Returns a {@link Either} that resolves all of the maybes in the collection into a single {@link Either}.
 * @static
 * @memberof Either
 * @param {Either[]} list - Array of {@link Either}.
 * @return {Either}
 * @example
 *
 * const e1 = Either.right(value1);
 * const e2 = Either.right(value2);
 * const e3 = Either.left(error1);
 * const e4 = Either.left(error2);
 *
 * Either.all([e1, e2]);
 * // => Right([value1, value2])
 *
 * Either.all([e1, e2, e3]);
 * // => Left(error1)
 *
 * Either.all([e1, e2, e3, e4]);
 * // => Left(error1)
 */
EitherType.all = list => F.find(Either.isLeft, list) ||
  Either.right(F(list).map(Either.fromRight).reduce(F.concat, []));

/**
 * Static implementation of {@link Either#alt}.
 * @static
 * @memberof Either
 * @alias Either.coalesce
 * @param {(Either|Supplier.<Either>)} other - Another instance of {@link Either} or a {@link Supplier} that produces a
 * {@link Either}.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#alt
 */
EitherType.alt = F.curry((other, either) => either.alt(other));

/**
 * Returns the first {@link Right} as a {@link Just} in the collection or finally a {@link Nothing}.
 * @static
 * @memberof Either
 * @param {Maybe} maybe - Maybe implementation.
 * @param {Either[]} list - List of {@link Either}.
 * @return {Either}
 * @example
 *
 * const e1 = Either.right(value1);
 * const e2 = Either.right(value2);
 * const e3 = Either.left(error1);
 * const e4 = Either.left(error2);
 *
 * Either.any([e1, e2]);
 * // => Right(value1)
 *
 * Either.any([e2, e3]);
 * // => Right(value2)
 *
 * Either.any([e3, e4]);
 * // => Left(error1)
 */
EitherType.any = F.curry((maybe, list) => F.isNull(list) || F.isUndefined(list) ?
  maybe.nothing() :
  maybe(F(list)
    .filter(Either.isRight)
    .map(Either.fromRight)
    .head()
  )
);

/**
 * Static implementation of {@link Either#ap}.
 * @static
 * @memberof Either
 * @param {Either.<Function>} other - A {@link Either} of a {@link Function}.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#ap
 */
EitherType.ap = F.curry((other, either) => either.ap(other));

/**
 * Captures the possible {@link Error} as a {@link Left} otherwise the {@code value} in a {@link Right}.
 * @memberof Either
 * @static
 * @param {Supplier} supplier - A supplier.
 * @return {Either}
 * @example <caption>Thrown error</caption>
 *
 * const data = Either.attempt(() => fs.readFileSync(filePath, options));
 * // Right(fileData) or Left(Error)
 *
 * @example <caption>Possible null object path</caption>
 *
 * const value = Either.attempt(() => context.some.property.path.value);
 * // Right(contextValue) or Left(Error)
 */
EitherType.attempt = function (supplier) {
  try {
    return EitherType.right(supplier());
  } catch (error) {
    return EitherType.left(error);
  }
};

/**
 * Static implementation of {@link Either#chain}.
 * @static
 * @memberof Either
 * @param {Chain.<Either>} morphism - A chaining function.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#chain
 */
EitherType.chain = F.curry((morphism, either) => either.chain(morphism));

/**
 * Static implementation of {@link Either#checkedBimap}.
 * @static
 * @memberof Either
 * @param {Function} leftFold - Folds the left value and the {@link Error} thrown by the {@code morphism} into a
 * singular value.
 * @param {Throwable} throwable - A throwable function.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#checkedMap
 */
EitherType.checkedBimap = F.curryN(3, (leftFold, throwable, either) => either.checkedBimap(leftFold, throwable));

/**
 * Iterates over a collection of eithers and invokes the {@code iteratee} for each {@link Either}. The {@code iteratee}
 * is invoked with one argument: {@code (value)}. Iteratee functions may exit iteration early by explicitly returning a
 * {@link Left}.
 * @static
 * @memberof Either
 * @param {Consumer} iteratee - The function to invoke per iteration.
 * @param {Either[]} values - Collection of {@link Either} over which to iterate.
 * @return {Either[]} Current {@link Either} collection.
 * @example
 *
 * const optionalValues = [
 *   getValue(path1, source), // => Right(value1)
 *   getValue(path2, source), // => Right(value2)
 *   getValue(path3, source), // => Left(error1)
 *   getValue(path4, source), // => Left(error2)
 *   getValue(path6, source)  // => Right(value3)
 * ];
 *
 * Either.each(Either.ifRight(console.log), optionalValues);
 * // => value1
 * // => value2
 */
EitherType.each = F.curry((iteratee, values) => F.each(
  F.pipe(iteratee, Either.isNotLeft),
  values
));

/**
 * Reduces the {@link Left} and {@link Right} values into a singular value from the {@link Either}.
 * @static
 * @memberof Either
 * @param {Function} leftMapper - Maps the {@link Left} value.
 * @param {Function} rightMapper - Maps the {@link Right} value.
 * @return {*}
 * @example
 * const eitherFile = Either.attempt(() => fs.readFileSync("file.txt", "utf8"));
 *
 * Either.either(F.constant(""), F.identity, eitherFile);
 * // => fileData or ""
 */
EitherType.either = F.curryN(3, (leftMapper, rightMapper, either) => either.isRight() ?
  rightMapper(Either.fromRight(either)) :
  leftMapper(Either.fromLeft(either))
);

/**
 * Static implementation of {@link Either#equals}.
 * @static
 * @memberof Either
 * @param {*} other - Other value.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Boolean}
 * @see Either#equals
 */
EitherType.equals = F.isEqual;

/**
 * Static implementation of {@link Either#filter}.
 * @static
 * @memberof Either
 * @param {Predicate} predicate - A predicate.
 * @param {*} leftValue - Value to use if the predicate returns {@code false}.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#filter
 */
EitherType.filter = F.curryN(3, (predicate, leftValue, either) => either.filter(predicate, leftValue));

/**
 * Static implementation of {@link Either#fmap}.
 * @static
 * @memberof Either
 * @alias Either.map
 * @param {Function} morphism - A mapping function.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#fmap
 */
EitherType.fmap = F.curry((morphism, either) => either.fmap(morphism));

/**
 * Static implementation of {@link Either#foldl}.
 * @static
 * @memberof Either
 * @param {LeftFold} leftFold - A left folding function.
 * @param {*} defaultValue - The default value.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#foldl
 */
EitherType.foldl = F.curryN(3, (leftFold, defaultValue, either) => either.foldl(leftFold, defaultValue));

/**
 * Static implementation of {@link Either#foldr}.
 * @static
 * @memberof Either
 * @alias reduce
 * @param {RightFold} rightFold - A right folding function.
 * @param {*} defaultValue - The default value.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#foldr
 */
EitherType.foldr = F.curryN(3, (rightFold, defaultValue, either) => either.foldr(rightFold, defaultValue));

/**
 * Static implementation of {@link Either#getOrElse}.
 * @static
 * @memberof Either
 * @param {*} other - Other value.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#getOrElse
 */
EitherType.getOrElse = F.curry((other, either) => either.getOrElse(other));

/**
 * Static implementation of {@link Either#getOrElseGet}.
 * @static
 * @memberof Either
 * @param {Supplier} supplier - A supplier.
 * @param {Either} maybe - An instance of {@link Either}.
 * @return {Either}
 * @see Either#getOrElseGet
 */
EitherType.getOrElseGet = F.curry((supplier, maybe) => maybe.getOrElseGet(supplier));

/**
 * Static implementation of {@link Either#ifLeft}.
 * @static
 * @memberof Either
 * @param {Consumer} consumer - A consumer.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#ifLeft
 */
EitherType.ifLeft = F.curry((consumer, either) => either.ifLeft(consumer));

/**
 * Static implementation of {@link Either#ifRight}.
 * @static
 * @memberof Either
 * @param {Consumer} consumer - A consumer.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#ifRight
 */
EitherType.ifRight = F.curry((consumer, either) => either.ifRight(consumer));

/**
 * Maps the underlying values in an list of {@link Either}.
 * @static
 * @memberof Either
 * @param {Function} morphism - A mapping function.
 * @param {Either[]} list - A list of {@link Either}.
 * @return {Either[]}
 * @example
 *
 * Either.lift(
 *   value => value + 1,
 *   [Either.right(1), Either.right(2), Either.right(3)]
 * );
 * // => [Right(2), Right(3), Right(4)]
 */
EitherType.lift = F.curry((morphism, list) => F.isArray(list) ?
  F.map(EitherType.fmap(morphism), list) :
  []
);

/**
 * Static implementation of {@link Either#recover}.
 * @static
 * @memberof Either
 * @param {*} value - Recover value or function that provides the value.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#recover
 */
EitherType.recover = F.curry((value, either) => either.recover(value));

/**
 * Static implementation of {@link Either#reduce}.
 * @static
 * @memberof Either
 * @param {LeftFold} leftFold - A left folding function.
 * @param {*} defaultValue - The default value.
 * @return {*}
 * @see Either#reduce
 */
EitherType.reduce = F.curry((leftFold, defaultValue, either) => either.reduce(leftFold, defaultValue));

/**
 * Static implementation of {@link Either#tap}.
 * @static
 * @memberof Either
 * @param {Callable} leftConsumer - A left consumer.
 * @param {Consumer} rightConsumer - A right consumer.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#tap
 */
EitherType.tap = F.curryN(3, (leftConsumer, rightConsumer, either) => either.tap(leftConsumer, rightConsumer));

/**
 * Static implementation of {@link Either#toArray}.
 * @static
 * @memberof Either
 * @param {Either} either - An instance of {@link Either}.
 * @return {Array}
 */
EitherType.toArray = either => either.toArray();

/**
 * Static implementation of {@link Either#toMaybe}.
 * @static
 * @memberof Either
 * @param {Maybe} maybe - Maybe implementation.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#toMaybe
 */
EitherType.toMaybe = F.curry((maybe, either) => either.toMaybe(maybe));

/**
 * Static implementation of {@link Either#toPromise}.
 * @static
 * @memberof Either
 * @param {Promise} promise - Promise implementation.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#toPromise
 */
EitherType.toPromise = F.curry((promise, either) => either.toPromise(promise));

/**
 * Static implementation of {@link Either#toValidation}.
 * @static
 * @memberof Either
 * @param {Validation} validation - Validation implementation.
 * @param {Either} either - An instance of {@link Either}.
 * @return {Either}
 * @see Either#toValidation
 */
EitherType.toValidation = F.curry((validation, either) => either.toValidation(validation));

// Aliases
EitherType.coalesce = EitherType.alt;
EitherType.flatMap = EitherType.chain;
EitherType.from = Either.from;
EitherType.fromLeft = Either.fromLeft;
EitherType.fromRight = Either.fromRight;
EitherType.isEither = Either.isEither;
EitherType.isLeft = Either.isLeft;
EitherType.isNotEither = Either.isNotEither;
EitherType.isNotLeft = Either.isNotLeft;
EitherType.isNotRight = Either.isNotRight;
EitherType.isRight = Either.isRight;
EitherType.left = Either.left;
EitherType.lefts = Either.lefts;
EitherType.map = EitherType.fmap;
EitherType.of = Either.pure;
EitherType.ofNullable = Either.ofNullable;
EitherType.pure = Either.pure;
EitherType.reduce = EitherType.foldr;
EitherType.right = Either.right;
EitherType.rights = Either.rights;

module.exports = EitherType;
