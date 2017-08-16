"use strict";

const F = require("lodash/fp");

const Maybe = require("./class/Maybe");

/**
 * {@link Maybe} type constructor.
 * @constructor
 * @param {*} value - Arbitrary value.
 * @return {Maybe}
 */
function MaybeType(value) {
  return Maybe.ofNullable(value);
}

/**
 * Returns a {@link Maybe} that resolves all of the maybes in the collection into a single {@link Maybe}.
 * @static
 * @memberof Maybe
 * @param {Maybe[]} list - Array of {@link Maybe}.
 * @return {Maybe}
 * @example
 *
 * const m1 = Maybe.just(value1);
 * const m2 = Maybe.just(value2);
 * const m3 = Maybe.nothing();
 * const m4 = Maybe.nothing();
 *
 * Maybe.all([m1, m2]);
 * // => Just([value1, value2])
 *
 * Maybe.all([m1, m2, m3]);
 * // => Nothing()
 *
 * Maybe.all([m1, m2, m3, m4]);
 * // => Nothing()
 */
MaybeType.all = list => F.find(Maybe.isNothing, list) ||
  Maybe.just(F(list).map(Maybe.fromJust).reduce(F.concat, []));

/**
 * Static implementation of {@link Maybe#alt}.
 * @static
 * @memberof Maybe
 * @alias Maybe.coalesce
 * @param {(Maybe|Supplier.<Maybe>)} other - Another instance of {@link Maybe} or a {@link Supplier} that produces a
 * {@link Maybe}.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#alt
 */
MaybeType.alt = F.curry((other, maybe) => maybe.alt(other));

/**
 * Returns the first {@link Just} in the collection or finally a {@link Nothing}.
 * @static
 * @memberof Maybe
 * @param {Maybe[]} list - List of {@link Maybe}.
 * @return {Maybe}
 * @example
 *
 * const m1 = Maybe.just(value1);
 * const m2 = Maybe.just(value2);
 * const m3 = Maybe.nothing();
 * const m4 = Maybe.nothing();
 *
 * Maybe.any([m1, m2]);
 * // => Just(value1)
 *
 * Maybe.any([m2, m3]);
 * // => Just(value2)
 *
 * Maybe.any([m3, m4]);
 * // => Nothing()
 */
MaybeType.any = list => F.find(Maybe.isJust, list) || MaybeType.nothing();

/**
 * Static implementation of {@link Maybe#ap}.
 * @static
 * @memberof Maybe
 * @param {Maybe.<Function>} other - A {@link Maybe} of a {@link Function}.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#ap
 */
MaybeType.ap = F.curry((other, maybe) => maybe.ap(other));

/**
 * Captures the possible {@link Error} as a {@link Nothing} otherwise the {@code value} in a {@link Just}.
 * @memberof Maybe
 * @static
 * @param {Supplier} supplier - A supplier.
 * @return {Maybe}
 * @example <caption>Thrown error</caption>
 *
 * const data = Maybe.attempt(() => fs.readFileSync(filePath, options));
 * // Just(fileData) or Nothing()
 *
 * @example <caption>Possible null object path</caption>
 *
 * const value = Maybe.attempt(() => context.some.property.path.value);
 * // Just(contextValue) or Nothing()
 */
MaybeType.attempt = function (supplier) {
  try {
    return MaybeType.just(supplier());
  } catch (error) {
    return MaybeType.nothing();
  }
};

/**
 * Static implementation of {@link Maybe#chain}.
 * @static
 * @memberof Maybe
 * @param {Chain.<Maybe>} morphism - A chaining function.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#chain
 */
MaybeType.chain = F.curry((morphism, maybe) => maybe.chain(morphism));

/**
 * Static implementation of {@link Maybe#checkedMap}.
 * @static
 * @memberof Maybe
 * @param {Function} morphism - A mapping function.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#checkedMap
 */
MaybeType.checkedMap = F.curry((morphism, maybe) => maybe.checkedMap(morphism));

/**
 * Iterates over a collection of maybes and invokes the {@code iteratee} for each {@link Maybe}. The {@code iteratee} is
 * invoked with one argument: {@code (value)}. Iteratee functions may exit iteration early by explicitly returning a
 * {@link Nothing}.
 * @static
 * @memberof Maybe
 * @param {Consumer} iteratee - The function to invoke per iteration.
 * @param {Maybe[]} values - Collection of {@link Maybe} over which to iterate.
 * @return {Maybe[]} Current {@link Maybe} collection.
 * @example
 *
 * const optionalValues = [
 *   getValue(path1, source), // => Just(value1)
 *   getValue(path2, source), // => Just(value2)
 *   getValue(path3, source), // => Nothing()
 *   getValue(path4, source), // => Nothing()
 *   getValue(path6, source)  // => Just(value3)
 * ];
 *
 * Maybe.each(Maybe.ifJust(console.log), optionalValues);
 * // => value1
 * // => value2
 */
MaybeType.each = F.curry((iteratee, values) => F.each(
  F.pipe(iteratee, Maybe.isNotNothing),
  values
));

/**
 * Static implementation of {@link Maybe#equals}.
 * @static
 * @memberof Maybe
 * @param {*} other - Other value.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Boolean}
 * @see Maybe#equals
 */
MaybeType.equals = F.isEqual;

/**
 * Static implementation of {@link Maybe#filter}.
 * @static
 * @memberof Maybe
 * @param {Predicate} predicate - A predicate.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#filter
 */
MaybeType.filter = F.curry((predicate, maybe) => maybe.filter(predicate));

/**
 * Static implementation of {@link Maybe#fmap}.
 * @static
 * @memberof Maybe
 * @alias Maybe.map
 * @param {Function} morphism - A mapping function.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#fmap
 */
MaybeType.fmap = F.curry((morphism, maybe) => maybe.fmap(morphism));

/**
 * Static implementation of {@link Maybe#foldl}.
 * @static
 * @memberof Maybe
 * @alias reduce
 * @param {LeftFold} leftFold - A left folding function.
 * @param {*} defaultValue - The default value.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#foldl
 */
MaybeType.foldl = F.curryN(3, (leftFold, defaultValue, maybe) => maybe.foldl(leftFold, defaultValue));

/**
 * Static implementation of {@link Maybe#foldr}.
 * @static
 * @memberof Maybe
 * @param {RightFold} rightFold - A right folding function.
 * @param {*} defaultValue - The default value.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#foldr
 */
MaybeType.foldr = F.curryN(3, (rightFold, defaultValue, maybe) => maybe.foldr(rightFold, defaultValue));

/**
 * Static implementation of {@link Maybe#getOrElse}.
 * @static
 * @memberof Maybe
 * @param {*} other - Other value.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#getOrElse
 */
MaybeType.getOrElse = F.curry((other, maybe) => maybe.getOrElse(other));

/**
 * Static implementation of {@link Maybe#getOrElseGet}.
 * @static
 * @memberof Maybe
 * @param {Supplier} supplier - A supplier.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#getOrElseGet
 */
MaybeType.getOrElseGet = F.curry((supplier, maybe) => maybe.getOrElseGet(supplier));

/**
 * Static implementation of {@link Maybe#ifJust}.
 * @static
 * @memberof Maybe
 * @param {Consumer} consumer - A consumer.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#ifJust
 */
MaybeType.ifJust = F.curry((consumer, maybe) => maybe.ifJust(consumer));

/**
 * Static implementation of {@link Maybe#ifNothing}.
 * @static
 * @memberof Maybe
 * @param {Callable} callable - A callable.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#ifNothing
 */
MaybeType.ifNothing = F.curry((callable, maybe) => maybe.ifNothing(callable));

/**
 * Maps the underlying values in an list of {@link Maybe}.
 * @static
 * @memberof Maybe
 * @param {Function} morphism - A mapping function.
 * @param {Maybe[]} list - A list of {@link Maybe}.
 * @return {Maybe[]}
 * @example
 *
 * Maybe.lift(
 *   value => value + 1,
 *   [Maybe.just(1), Maybe.just(2), Maybe.just(3)]
 * );
 * // => [Just(2), Just(3), Just(4)]
 */
MaybeType.lift = F.curry((morphism, list) => F.isArray(list) ?
  F.map(MaybeType.fmap(morphism), list) :
  []
);

/**
 * Static implementation of {@link Maybe#recover}.
 * @static
 * @memberof Maybe
 * @param {*} value - Recover value or function that provides the value.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#recover
 */
MaybeType.recover = F.curry((value, maybe) => maybe.recover(value));

/**
 * Static implementation of {@link Maybe#tap}.
 * @static
 * @memberof Maybe
 * @param {Callable} callable - A callable.
 * @param {Consumer} consumer - A consumer.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#tap
 */
MaybeType.tap = F.curryN(3, (callable, consumer, maybe) => maybe.tap(callable, consumer));

/**
 * Static implementation of {@link Maybe#toArray}.
 * @static
 * @memberof Maybe
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Array}
 */
MaybeType.toArray = maybe => maybe.toArray();

/**
 * Static implementation of {@link Maybe#toEither}.
 * @static
 * @memberof Maybe
 * @param {Either} either - Either implementation.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#toEither
 */
MaybeType.toEither = F.curry((either, maybe) => maybe.toEither(either));

/**
 * Static implementation of {@link Maybe#toPromise}.
 * @static
 * @memberof Maybe
 * @param {Promise} promise - Promise implementation.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#toPromise
 */
MaybeType.toPromise = F.curry((promise, maybe) => maybe.toPromise(promise));

/**
 * Static implementation of {@link Maybe#toValidation}.
 * @static
 * @memberof Maybe
 * @param {Validation} validation - Validation implementation.
 * @param {Maybe} maybe - An instance of {@link Maybe}.
 * @return {Maybe}
 * @see Maybe#toValidation
 */
MaybeType.toValidation = F.curry((validation, maybe) => maybe.toValidation(validation));

// Aliases
MaybeType.catMaybes = Maybe.catMaybes;
MaybeType.coalesce = MaybeType.alt;
MaybeType.empty = Maybe.empty;
MaybeType.flatMap = MaybeType.chain;
MaybeType.from = Maybe.from;
MaybeType.fromJust = Maybe.fromJust;
MaybeType.isJust = Maybe.isJust;
MaybeType.isMaybe = Maybe.isMaybe;
MaybeType.isNothing = Maybe.isNothing;
MaybeType.isNotJust = Maybe.isNotJust;
MaybeType.isNotMaybe = Maybe.isNotMaybe;
MaybeType.isNotNothing = Maybe.isNotNothing;
MaybeType.just = Maybe.just;
MaybeType.map = MaybeType.fmap;
MaybeType.mapMaybe = Maybe.mapMaybe;
MaybeType.maybe = Maybe.maybe;
MaybeType.nothing = Maybe.nothing;
MaybeType.of = Maybe.pure;
MaybeType.ofNullable = Maybe.ofNullable;
MaybeType.pure = Maybe.pure;
MaybeType.reduce = MaybeType.foldl;
MaybeType.zero = Maybe.zero;

module.exports = MaybeType;
