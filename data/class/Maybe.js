"use strict";

// Third Party
const F = require("lodash/fp");

/**
 * The {@link Maybe} type is intended for values that may or may not be null or undefined, but provide safe interactions
 * without having to be concerned as to whether or not the underlying value is unsafe.
 *
 * @param {*} value - Value to wrap.
 * @return {Maybe}
 * @example <caption>Via static constructors</caption>
 *
 * const m1 = Maybe.just(value);
 * const m2 = Maybe.nothing();
 *
 * @example <caption>Via nullable values</caption>
 *
 * const m3 = Maybe.ofNullable(value);
 */
class Maybe {
  /**
   * Converts a list of {@link Maybe} to a list of non-{@code null} values.
   * @static
   * @memberof Maybe
   * @param {Maybe[]} list - A list of {@link Maybe}.
   * @return {Array}
   * @example
   *
   * const list = [
   *   Maybe.just(1),
   *   Maybe.just(2),
   *   Maybe.nothing(),
   *   Maybe.just(3)
   * ];
   *
   * Maybe.catMaybes(list);
   * // => [1, 2, 3]
   */
  static catMaybes(list) {
    return F.isArray(list) ?
      F(list)
        .filter(Maybe.isJust)
        .map(Maybe.fromJust)
        .value() :
      [];
  }

  /**
   * Alternative {@code empty}.
   *
   * @static
   * @memberof Maybe
   * @return {Nothing}
   * @example <caption>Default value when not finding a result in a collection</caption>
   *
   * const F = require("lodash/fp");
   *
   * const value = F.find(
   *   maybe => maybe.map(F.get("some.object.path")).isJust(),
   *   maybes
   * ) || Maybe.empty();
   */
  static empty() {
    return Nothing.INSTANCE;
  }

  /**
   * Creates a {@link Maybe} from the some context with the following mapping:
   *
   *   - If the context is an {@code Array}, then a {@link Just} of the first element; otherwise, a {@link Nothing}.
   *   - If the context is a {@link Maybe}, then the instance itself.
   *   - If the context is {@code null} or {@code undefined}, then a {@link Nothing}.
   *
   * @static
   * @memberof Maybe
   * @param {*} context - Some value context.
   * @return {Maybe}
   * @example <caption>From populated Array</caption>
   *
   * const m1 = Maybe.from([0, 1, 2, 3]);
   * // => Just(0)
   *
   * @example <caption>From empty Array</caption>
   *
   * const m2 = Maybe.from([]);
   * // => Nothing()
   *
   * @example <caption>From nullable Maybe</caption>
   *
   * const map = require("lodash/fp/map");
   *
   * const allMaybes = map(Maybe.from, [undefined, null, "", Just(0), Nothing()]);
   * // [Nothing(), Nothing(), Just(""), Just(0), Nothing()]
   */
  static from(context) {
    let result = null;

    if (F.isArray(context)) {
      result = Maybe.ofNullable(F.head(context));
    } else if (Maybe.isMaybe(context)) {
      result = context;
    } else {
      result = Maybe.ofNullable(context);
    }

    return result;
  }

  /**
   * Returns the value within a {@link Just} or throws an {@link Error} otherwise.
   *
   * @static
   * @memberof Maybe
   * @param {Maybe} maybe - The {@link Maybe} to unpack.
   * @return {*}
   * @throws Error If {@link Nothing}, {@code null}, or {@code undefined}.
   * @example <caption>Unpacking collection of Maybe</caption>
   *
   * const F = require("lodash/fp");
   *
   * F(maybes)
   *   .filter(Maybe.isJust)
   *   .map(Maybe.fromJust)
   *   .value();
   *
   * @example <caption>Throwing on purpose</caption>
   *
   * const get = require("lodash/fp/get");
   *
   * const configValue = Maybe.fromJust(
   *   configMaybe.map(get("someProperty"))
   * );
   * // => throws Error("Maybe.fromJust: instance of maybe must be a Just")
   */
  static fromJust(maybe) {
    if (Maybe.isNotJust(maybe)) {
      throw new Error("Maybe.fromJust: instance of maybe must be a Just.");
    }

    return maybe.value;
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Just}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Maybe.isJust(undefined); // => false
   * Maybe.isJust(null); // => false
   * Maybe.isJust(1); // => false
   * Maybe.isJust(Maybe.nothing()); // => false
   * Maybe.isJust(Maybe.just(1)); // => true
   */
  static isJust(value) {
    return Maybe.isMaybe(value) && value.isJust();
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Maybe}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Maybe.isMaybe(undefined); // => false
   * Maybe.isMaybe(null); // => false
   * Maybe.isMaybe(1); // => false
   * Maybe.isMaybe(Maybe.nothing()); // => true
   * Maybe.isMaybe(Maybe.just(1)); // => true
   */
  static isMaybe(value) {
    return value instanceof Maybe;
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Just}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotJust(value) {
    return !Maybe.isJust(value);
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Maybe}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotMaybe(value) {
    return !Maybe.isMaybe(value);
  }

  /**
   * Determines whether or not the {@code value} given is a {@link Nothing}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - Value to check.
   * @return {Boolean}
   * @example
   *
   * Maybe.isNothing(undefined); // => false
   * Maybe.isNothing(null); // => false
   * Maybe.isNothing(1); // => false
   * Maybe.isNothing(Maybe.nothing()); // => true
   * Maybe.isNothing(Maybe.just(1)); // => false
   */
  static isNothing(value) {
    return Maybe.isMaybe(value) && value.isNothing();
  }

  /**
   * Determines whether or not the {@code value} given is not a {@link Nothing}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - Value to check.
   * @return {Boolean}
   */
  static isNotNothing(value) {
    return !Maybe.isNothing(value);
  }

  /**
   * Creates a {@link Just} from an arbitrary value.
   *
   * @static
   * @memberof Maybe
   * @constructor
   * @param {*} value - An arbitrary value.
   * @return {Just}
   * @throws {Error} If the {@code value} is {@code undefined} or {@code null}.
   * @example <caption>Just(value)</caption>
   *
   * Maybe.just(1); // => Just(1)
   *
   * @example <caption>Just(null)</caption>
   *
   * Maybe.just(null); // => throws Error
   */
  static just(value) {
    if (F.isUndefined(value) || F.isNull(value)) {
      throw new Error("Maybe.just: value must not be null or undefined.");
    }

    return new Just(value);
  }

  /**
   * Maps a list of values through {@link Chain} function, filters {@link Just} values, and unpacks the results.
   *
   * @static
   * @memberof Maybe
   * @param {Chain.<Maybe>} morphism - A chaining function.
   * @param {Array} list - A list of values.
   * @return {Array}
   * @example
   *
   * Maybe.mapMaybe(
   *   value => isEven() ? Maybe.just(value) : Maybe.nothing(),
   *   [1, 2, 3, 4]
   * );
   * // => [2, 4]
   */
  static mapMaybe(morphism, list) {
    let result = null;

    if (arguments.length === 1) {
      result = list => Maybe.mapMaybe(morphism, list);
    } else {
      result = F.isArray(list) ?
        F(list)
          .map(morphism)
          .filter(Maybe.isJust)
          .map(Maybe.fromJust)
          .value() :
        [];
    }

    return result;
  }

  /**
   * Applies a single {@code morphism} to the {@code maybe} and unpacks the result if the {@code maybe} is a
   * {@link Just}; otherwise, returns the {@code defaultValue}.
   * @static
   * @memberof Maybe
   * @param {*} defaultValue - Value to use if the result is a {@link Nothing}.
   * @param {Function} morphism - A mapping function.
   * @param {Maybe} maybe - A {@link Maybe}.
   * @return {*}
   * @example
   *
   * const defaultPort = 8080;
   *
   * const port = Maybe.maybe(
   *   defaultPort,
   *   F.toInteger,
   *   config.get("port") // Map<String, String>
   * );
   */
  static maybe(defaultValue, morphism, maybe) {
    let result = null;

    if (arguments.length === 1) {
      result = F.curry((morphism, maybe) => Maybe.maybe(defaultValue, morphism, maybe));
    } else if (arguments.length === 2) {
      result = maybe => Maybe.maybe(defaultValue, morphism, maybe);
    } else {
      result = maybe.map(morphism).getOrElse(defaultValue);
    }

    return result;
  }

  /**
   * Creates a {@link Nothing}.
   *
   * @static
   * @constructor
   * @memberof Maybe
   * @return {Nothing}
   * @example
   *
   * Maybe.nothing(); // => Nothing()
   */
  static nothing() {
    return Nothing.INSTANCE;
  }

  /**
   * Null sensitive Applicative {@code pure} where {@code undefined} or {@code null} is treated as {@link Nothing}.
   *
   * @static
   * @memberof Maybe
   * @param {*} value - An arbitrary nullable value.
   * @return {Maybe}
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
   * Maybe.ofNullable(Maybe.just(true));
   * // => Just(Just(true))
   *
   * Maybe.ofNullable(Maybe.nothing());
   * // => Just(Nothing());
   */
  static ofNullable(value) {
    return F.isUndefined(value) || F.isNull(value) ?
      Maybe.nothing() :
      Maybe.just(value);
  }

  /**
   * Applicative {@code pure}. Returns a {@link Maybe} (read {@link Just}) of the value.
   *
   * @memberof Maybe
   * @static
   * @alias Maybe.of
   * @param {*} value - An arbitrary value.
   * @return {Maybe}
   * @throws {Error} If the {@code value} is {@code undefined} or {@code null}.
   * @see {Maybe.just}
   * @example
   *
   * Maybe.pure();
   * // => throws Error("Maybe.just: value must not be null or undefined.")
   *
   * Maybe.pure(null);
   * // => throws Error("Maybe.just: value must not be null or undefined.")
   *
   * Maybe.pure(true);
   * // => Just(true)
   *
   * Maybe.pure(Maybe.just(true));
   * // => Just(Just(true))
   *
   * Maybe.pure(Maybe.nothing());
   * // => Just(Nothing());
   */
  static pure(value) {
    return Maybe.just(value);
  }

  /**
   * Plus {@code zero}.
   *
   * @static
   * @constructor
   * @memberof Maybe
   * @return {Nothing}
   * @see {Maybe.empty}
   */
  static zero() {
    return Nothing.INSTANCE;
  }

  /**
   * Alternative {@code alt} (i.e., {@code <|>}). Replace a {@link Nothing} with a {@link Maybe} of a value produced by
   * a {@link Supplier}.
   *
   * @abstract
   * @function alt
   * @memberof Maybe
   * @instance
   * @alias coalesce
   * @param {(Maybe|Supplier.<Maybe>)} other - Another instance of {@link Maybe} or a supplier that produces a
   * {@link Maybe}.
   * @return {Maybe}
   * @example <caption>Just#alt(Just)</caption>
   *
   * Maybe.just(true).alt(Maybe.just(false))
   * // => Just(true)
   *
   * @example <caption>Just#alt(Nothing)</caption>
   *
   * Maybe.just(true).alt(Maybe.nothing())
   * // => Just(true)
   *
   * @example <caption>Nothing#alt(Just)</caption>
   *
   * Maybe.nothing().alt(Maybe.just(false))
   * // => Just(false)
   *
   * @example <caption>Nothing#alt(Nothing)</caption>
   *
   * Maybe.nothing().alt(Maybe.nothing())
   * // => Nothing()
   */

  /**
   * Apply {@code ap} (i.e. {@code <.>} or Applicative {@code <*>}). Applies the current {@code value} to the
   * {@code value} of the {@code other}.
   *
   * @abstract
   * @function ap
   * @memberof Maybe
   * @instance
   * @param {Maybe.<Function>} other - A {@link Maybe} of a {@link Function}.
   * @return {Maybe}
   * @example <caption>Just#ap(Just)</caption>
   *
   * const F = require("lodash/fp");
   * const config = {
   *   property: true
   * };
   *
   * Maybe.just(config)
   *   .ap(Maybe.just(F.get("property")));
   * // => Just(true);
   *
   * @example <caption>Just#ap(Nothing)</caption>
   *
   * Maybe.just(config)
   *   .ap(Maybe.nothing());
   * // => Nothing()
   *
   * @example <caption>Nothing#ap(Just)</caption>
   *
   * Maybe.just(1).ap(Maybe.nothing());
   * // => Nothing()
   *
   * @example <caption>Nothing#ap(Nothing)</caption>
   *
   * Maybe.nothing().ap(Maybe.nothing());
   * // => Nothing()
   */

  /**
   * Chain {@code chain} (a.k.a {@code flatMap}). Takes a {@link Function} that accepts the {@code value}
   * and returns a {@link Maybe} of the return value.
   *
   * @abstract
   * @function chain
   * @memberof Maybe
   * @instance
   * @alias flatMap
   * @param {Chain.<Maybe>} morphism - A chaining function.
   * @return {Maybe}
   * @example <caption>Just#chain</caption>
   *
   * const F = require("lodash/fp");
   * const getConfigOption = F.curry((path, config) => Maybe.ofNullable(F.get(path, config)));
   *
   * Maybe.ofNullable(config)
   *   .chain(getConfigOption("path.to.option"));
   *   // => Just(value) or Nothing()
   *
   * @example <caption>Nothing#chain</caption>
   *
   * Maybe.nothing().chain(getConfigOption("path.to.option"));
   * // => Nothing()
   */

  /**
   * Wraps the {@code morphism} in a {@code try..catch} where the successful mapping is returned in a {@link Just} or
   * the caught {@link Error} is ignored and returned as a {@link Nothing}.
   *
   * @abstract
   * @function checkedMap
   * @memberof Maybe
   * @instance
   * @param {Throwable} morphism - A throwable function.
   * @return {Maybe}
   * @example <caption>Just#checkedMap</caption>
   *
   * Maybe.just("/tmp/file.txt")
   *   .checkedMap(fs.readFileSync);
   * // => Just(data) or Nothing()
   *
   * @example <caption>Nothing#checkedMap</caption>
   *
   * Maybe.nothing().checkedMap(fs.readFileSync);
   * // => Nothing()
   */

  coalesce(other) {
    return this.alt(other);
  }

  /**
   * Setoid {@code equals}. Determines whether two objects are equivalent.
   *
   * @function equals
   * @memberof Maybe
   * @instance
   * @param {*} other - Arbitrary object.
   * @return {Boolean}
   * @example <caption>Reflexivity</caption>
   *
   * m1.equals(m1) === true;
   * // => true
   *
   * @example <caption>Symmetry</caption>
   *
   * m1.equals(m2) === m2.equals(m1);
   * // => true
   *
   * @example <caption>Transitivity</caption>
   *
   * (m1.equals(m2) === m2.equals(m3)) && m1.equals(m3)
   * // => true
   */
  equals(other) {
    return F.isEqual(this, other);
  }

  /**
   * Filters the underlying value through the {@code predicate}. Returns a {@link Nothing} if the {@code predicate}
   * returns {@code false}; otherwise, the instance is returned.
   *
   * @abstract
   * @function filter
   * @memberof Maybe
   * @instance
   * @param {Predicate} predicate - A predicate.
   * @return {Maybe}
   * @example <caption>Just#filter</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.just("hello world")
   *   .filter(F.startsWith("hello"));
   * // => Just("hello world")
   *
   * Maybe.just("hello world")
   *   .filter(F.startsWith("world"));
   * // => Nothing()
   *
   * @example <caption>Nothing#filter</caption>
   *
   * Maybe.nothing()
   *   .filter(F.startsWith("hello"));
   * // => Nothing()
   */

  flatMap(morphism) {
    return this.chain(morphism);
  }

  /**
   * Functor {@code fmap}. Takes a {@link Function} to map the {@code value}.
   *
   * @abstract
   * @function fmap
   * @memberof Maybe
   * @instance
   * @alias map
   * @param {Function} morphism - A mapping function.
   * @return {Maybe}
   * @example <caption>Just#fmap with known values</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.just([1, 3, 2]).fmap(F.pipe(F.sort, F.join(", ")));
   * // => Just("1, 2, 3")
   *
   * @example <caption>Just#fmap with unknown values</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.ofNullable(values)
   *   .filter(F.isArray)
   *   .fmap(F.sort)
   *   .fmap(F.join(", "));
   * // => Just("1, 2, 3") or Nothing()
   *
   * @example <caption>Nothing#fmap</caption>
   *
   * Maybe.nothing()
   *   .filter(F.isArray);
   * // => Nothing()
   */

  /**
   * Foldable {@code foldl}.
   *
   * @abstract
   * @function foldl
   * @memberof Maybe
   * @instance
   * @alias reduce
   * @param {LeftFold} leftFold - A left folding function.
   * @param {*} defaultValue - The default value.
   * @return {*}
   * @example <caption>Just#foldl</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.just(1).foldl(
   *   (value, defaultValue) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 1
   *
   * @example <caption>Nothing#foldl</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.nothing().foldl(
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
   * @memberof Maybe
   * @instance
   * @param {RightFold} rightFold - A right folding function.
   * @param {*} defaultValue - The default value.
   * @return {*}
   * @example <caption>Just#foldr</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.right(1).foldr(
   *   (defaultValue, value) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 1
   *
   * @example <caption>Nothing#foldr</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.nothing().foldr(
   *   (defaultValue, value) => F.isNull(value) || F.isUndefined(value) ? defaultValue : value,
   *   0
   * );
   * // => 0
   */

  /**
   * Returns the value if the {@code instance} is a {@link Just}; otherwise, the {@code otherValue}.
   *
   * @abstract
   * @function getOrElse
   * @memberof Maybe
   * @instance
   * @param {*} value - Other value.
   * @return {*}
   * @example <caption>Just#getOrElse</caption>
   *
   * Maybe.just(1).getOrElse(2);
   * // => 1
   *
   * @example <caption>Nothing#getOrElse</caption>
   *
   * Maybe.nothing().getOrElse(2);
   * // => 2
   */

  /**
   * Returns the value if the {@code instance} is a {@link Just}; otherwise, the value of the {@code supplier}.
   *
   * @abstract
   * @function getOrElseGet
   * @memberof Maybe
   * @instance
   * @param {Supplier} supplier - A supplier.
   * @return {*}
   * @example <caption>Just#getOrElseGet</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.just(1).getOrElseGet(F.constant(2));
   * // => 1
   *
   * @example <caption>Nothing#getOrElseGet</caption>
   *
   * Maybe.nothing().getOrElseGet(F.constant(2));
   * // => 2
   */

  /**
   * Returns the value if the {@code instance} is a {@link Just}; otherwise, throws the supplied {@code Error}.
   *
   * @abstract
   * @function getOrElseThrow
   * @memberof Maybe
   * @instance
   * @param {Supplier} supplier - An error supplier.
   * @return {*}
   * @throws {Error} If the {@code instance} is a {@link Nothing}.
   * @example <caption>Just#getOrElseThrow</caption>
   *
   * const F = require("lodash/fp");
   *
   * Maybe.just(1).getOrElseThrow(() => new Error());
   * // => 1
   *
   * @example <caption>Nothing#getOrElseThrow</caption>
   *
   * Maybe.nothing().getOrElseThrow(() => new Error());
   * // throws Error
   */

  /**
   * Executes the {@code consumer} if the {@code instance} is a {@link Just}.
   *
   * @abstract
   * @function ifJust
   * @memberof Maybe
   * @instance
   * @param {Consumer} consumer - A consumer.
   * @return {Maybe}
   * @example <caption>Just#ifJust</caption>
   *
   * Maybe.just(value).ifJust(doSomething); // doSomething(value)
   * // => Just(value)
   *
   * @example <caption>Nothing#ifJust</caption>
   *
   * Maybe.nothing().ifJust(doSomething); // void
   * // => Nothing()
   */

  /**
   * Executes the {@code callable} if the {@code instance} is a {@link Nothing}.
   *
   * @abstract
   * @function ifNothing
   * @memberof Maybe
   * @instance
   * @param {Callable} callable - A callable.
   * @return {Maybe}
   * @example <caption>Just#ifNothing</caption>
   *
   * Maybe.just(value).ifNothing(doSomething); // void
   * // => Just(value)
   *
   * @example <caption>Nothing#ifNothing</caption>
   *
   * Maybe.nothing().ifNothing(doSomething); // doSomething()
   * // => Nothing()
   */

  /**
   * Determines whether or not the {@code instance} is a {@link Just}.
   *
   * @abstract
   * @function isJust
   * @memberof Maybe
   * @instance
   * @return {Boolean}
   * @example <caption>Just#isJust</caption>
   *
   * Maybe.just(value).isJust();
   * // => true
   *
   * @example <caption>Nothing#isJust</caption>
   *
   * Maybe.nothing().isJust();
   * // => false
   */

  /**
   * Determines whether or not the {@code instance} is a {@link Nothing}.
   *
   * @abstract
   * @function isNothing
   * @memberof Maybe
   * @instance
   * @return {Boolean}
   * @example <caption>Just#isNothing</caption>
   *
   * Maybe.just(value).isNothing();
   * // => false
   *
   * @example <caption>Nothing#isNothing</caption>
   *
   * Maybe.nothing().isNothing();
   * // => true
   */
  isNothing() {
    return !this.isJust();
  }

  map(morphism) {
    return this.fmap(morphism);
  }

  /**
   * Returns a {@link Maybe} (read {@link Just}) of the value.
   *
   * @function of
   * @memberof Maybe
   * @instance
   * @param {*} value - An arbitrary value.
   * @return {Maybe}
   * @example
   *
   * const maybe = Maybe.pure(1);
   * // => Just(1)
   *
   * maybe.of();
   * // => throws Error("Maybe.just: value must not be null or undefined.")
   *
   * maybe.of(null);
   * // => throws Error("Maybe.just: value must not be null or undefined.")
   *
   * maybe.of(true);
   * // => Just(true)
   *
   * maybe.of(Maybe.just(true));
   * // => Just(Just(true))
   *
   * maybe.of(Maybe.nothing());
   * // => Just(Nothing());
   */
  of(value) {
    return Maybe.pure(value);
  }

  /**
   * Recover from a {@link Nothing} into a possible {@link Just}.
   *
   * @abstract
   * @function recover
   * @memberof Maybe
   * @instance
   * @param {*} value - Recover value or function that provides the value.
   * @return {Maybe}
   * @example <caption>Just#recover</caption>
   *
   * Maybe.just(1).recover(2);
   * // => Just(1)
   *
   * @example <caption>Nothing#recover</caption>
   *
   * Maybe.nothing().recover(null);
   * // => Nothing()
   *
   * Maybe.nothing().recover(2);
   * // => Just(2)
   */

  reduce(leftFold, defaultValue) {
    return arguments.length === 1 ?
      defaultValue => this.foldl(leftFold, defaultValue) :
      this.foldl(leftFold, defaultValue);
  }

  /**
   * Taps into the underlying value of {@link Maybe}.
   *
   * @abstract
   * @function tap
   * @memberof Maybe
   * @instance
   * @param {Callable} callable - A callable.
   * @param {Consumer} consumer - A consumer.
   * @return {Maybe}
   * @example <caption>Just#tap</caption>
   *
   * Maybe.just(1).tap(
   *   () => console.log("Invoked if a Nothing."),
   *   value => console.log(`Invoked if a Just with value '${value}'.`)
   * );
   * // => "Invoked if a Just with value '1'."
   *
   * @example <caption>Nothing#tap</caption>
   *
   * Maybe.nothing().tap(
   *   () => console.log("Invoked if a Nothing."),
   *   value => console.log(`Invoked if a Just with value '${value}'.`)
   * );
   * // => "Invoked if a Nothing."
   */
  tap(callable, consumer) {
    return arguments.length === 1 ?
      consumer => this.tap(callable, consumer) :
      this.ifJust(consumer)
        .ifNothing(callable);
  }

  /**
   * Converts the {@code instance} to a {@link Array}.
   *
   * @abstract
   * @function toArray
   * @memberof Maybe
   * @instance
   * @return {Array}
   * @example <caption>Just#toArray</caption>
   *
   * Maybe.just(value).toArray();
   * // => [value]
   *
   * @example <caption>Nothing#toArray</caption>
   *
   * Maybe.nothing().toArray();
   * // => []
   */

  /**
   * Converts the {@link Maybe} to an {@link Either}. {@link Just} becomes a {@link Right} and {@link Nothing} becomes a
   * {@link Left}.
   *
   * @abstract
   * @function toEither
   * @memberof Maybe
   * @instance
   * @param {Either} either - Either implementation.
   * @return {Either}
   * @example <caption>Just#toEither</caption>
   *
   * const Either = require("lodash-fantasy/data/Either");
   *
   * Maybe.just(value).toEither(Either);
   * // => Right(value);
   *
   * @example <caption>Nothing#toEither</caption>
   *
   * const Either = require("lodash-fantasy/data/Either");
   *
   * Maybe.nothing().toEither(Either);
   * // => Left(null);
   */

  /**
   * Converts the Maybe to a {@link Promise} using the provided {@link Promise} implementation.
   *
   * @abstract
   * @function toPromise
   * @memberof Maybe
   * @instance
   * @param {Promise} promise - Promise implementation.
   * @return {Promise}
   * @example <caption>Just#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Maybe.just(value).toPromise(Bluebird);
   * // => Promise.resolve(value);
   *
   * @example <caption>Nothing#toPromise</caption>
   *
   * const Bluebird = require("bluebird");
   *
   * Maybe.nothing().toPromise(Bluebird);
   * // => Promise.reject(null);
   */

  /**
   * Returns a {@code String} representation of the {@link Maybe}.
   *
   * @abstract
   * @function toString
   * @memberof Maybe
   * @instance
   * @return {String}
   * @example <caption>Just#toString</caption>
   *
   * Maybe.just(value).toString();
   * // => "Just(value)"
   *
   * @example <caption>Nothing#toString</caption>
   *
   * Maybe.nothing.toString();
   * // => "Nothing()"
   */

  /**
   * Converts the {@link Maybe} to an {@link Validation}. {@link Just} becomes a {@link Success} and {@link Nothing}
   * becomes a {@link Failure}.
   *
   * @abstract
   * @function toValidation
   * @memberof Maybe
   * @instance
   * @param {Validation} validation - Validation implementation.
   * @return {Validation}
   * @example <caption>Just#toValidation</caption>
   *
   * const Validation = require("lodash-fantasy/data/Validation");
   *
   * Maybe.just(value).toValidation(Validation);
   * // => Success(value);
   *
   * @example <caption>Nothing#toValidation</caption>
   *
   * const Validation = require("lodash-fantasy/data/Validation");
   *
   * Maybe.nothing().toValidation(Validation);
   * // => Failure([null]);
   */

  /**
   * Plus {@code zero}.
   *
   * @instance
   * @memberof Maybe
   * @function zero
   * @return {Nothing}
   * @example <caption>Just#zero</caption>
   *
   * Maybe.just(1).zero();
   * // => Nothing()
   *
   * @example <caption>Nothing#zero</caption>
   *
   * Maybe.nothing().zero();
   * // => Nothing()
   */
  zero() {
    return Maybe.zero();
  }
}

/**
 * @extends Maybe
 * @inheritdoc
 */
class Just extends Maybe {
  constructor(value) {
    super();

    this.value = value;
  }

  alt() {
    return this;
  }

  ap(other) {
    return other.isJust() ?
      this.fmap(Maybe.fromJust(other)) :
      other;
  }

  chain(morphism) {
    const result = morphism(this.value);

    if (Maybe.isNotMaybe(result)) {
      throw new Error("Maybe#chain: the provided morphism must return an instance of Maybe.");
    }

    return morphism(this.value);
  }

  checkedMap(morphism) {
    try {
      return Maybe.ofNullable(morphism(this.value));
    } catch (error) {
      return Maybe.nothing();
    }
  }

  filter(predicate) {
    return predicate(this.value) === true ? this : Maybe.nothing();
  }

  fmap(morphism) {
    return Maybe.ofNullable(morphism(this.value));
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

  ifJust(consumer) {
    consumer(this.value);

    return this;
  }

  ifNothing() {
    return this;
  }

  isJust() {
    return true;
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

  toPromise(promise) {
    return promise.resolve(this.value);
  }

  toString() {
    return `Just(${this.value})`;
  }

  toValidation(validation) {
    return validation.success(this.value);
  }
}

/**
 * @extends Maybe
 * @inheritdoc
 */
class Nothing extends Maybe {
  constructor() {
    super();
  }

  alt(other) {
    const result = F.isFunction(other) ? other() : other;

    if (Maybe.isNotMaybe(result)) {
      throw new Error("Maybe#alt: the provided other value must return an instance of Maybe.");
    }

    return result;
  }

  ap() {
    return this;
  }

  chain() {
    return this;
  }

  checkedMap() {
    return this;
  }

  filter() {
    return this;
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

  getOrElseThrow(supplier) {
    throw supplier();
  }

  ifJust() {
    return this;
  }

  ifNothing(callable) {
    callable();

    return this;
  }

  isJust() {
    return false;
  }

  recover(value) {
    return Maybe.ofNullable(F.isFunction(value) ? value() : value);
  }

  toArray() {
    return [];
  }

  toEither(either) {
    return either.left(null);
  }

  toPromise(promise) {
    return promise.reject(null);
  }

  toString() {
    return "Nothing()";
  }

  toValidation(validation) {
    return validation.failure(null);
  }
}

Nothing.INSTANCE = new Nothing();

module.exports = Maybe;
