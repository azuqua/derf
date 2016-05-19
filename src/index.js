import createDebug from 'debug';
import assert from 'assert';
import findLastIndex from 'lodash/findLastIndex';

function hrToNano(hr) {
  return hr[0] * 1e9 + hr[1];
}

// the default message
function defaultPrinter(debug, time, callArgs, resArgs) {
  const displayTime = `${Math.floor(time / 1e5) / 10}ms`;

  if (resArgs[0]) {
    debug('failed in %s', displayTime);
  } else {
    debug('finished in %s', displayTime);
  }
}

// wraps all our handler function to take care of some patters
function wrap(handler) {
  return (namespace, fn, printer = defaultPrinter) => {
    // 'cast' namespace to be a debug function
    const debug = typeof namespace === 'function' ?
      namespace : createDebug(namespace);

    // noop if debug is not enabled
    if (!debug.enabled) {
      return fn;
    }

    // validate args if enabled, but we only warn here if it fails
    try {
      assert(typeof fn === 'function', 'Expected function for wrapped function');
      assert(typeof printer === 'function', 'Expected function for printer');
    } catch (e) {
      console.warn(`derf:${e.message}`); // eslint-disable-line no-console
      return fn;
    }

    // it should be impossible to throw from logging
    const print = (start, args, retArgs) => {
      try {
        const diff = hrToNano(process.hrtime(start));
        printer(debug, diff, args, retArgs);
      } catch (e) {
        /* noop */
      }
    };

    return handler(fn, print);
  };
}

/**
 * Wrap a synchronous function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const sync = wrap((fn, print) => function perfWrappedSync(...args) {
  const start = process.hrtime();
  let err = undefined;
  let val = undefined;

  try {
    val = fn.apply(this, args);
  } catch (e) {
    err = e;
  } finally {
    print(start, args, [err, val]);
  }

  if (err) {
    throw err;
  } else {
    return val;
  }
});

/**
 * Wrap a promise returning function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const promise = wrap((fn, print) => function perfWrappedPromise(...args) {
  const start = process.hrtime();

  // assume this is a valid promise returning function
  return fn.apply(this, args)
    .then(
      val => {
        print(start, args, [undefined, val]);
        return val; // return val
      },
      err => {
        print(start, args, [err, undefined]);
        throw err; // rethrow err
      }
    );
});

/**
 * Wrap a node-style callback function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const callback = wrap((fn, print) => function perfWrapped(...args) {
  const start = process.hrtime();

  // most function have the callback last, but just in case...
  const index = findLastIndex(args, arg => typeof arg === 'function');
  if (index >= 0) {
    const cb = args[index];
    args[index] = function perfWrappedCb(...retArgs) {
      print(start, args, retArgs);
      return cb.apply(this, retArgs);
    };

    return fn.apply(this, args);
  }

  // TODO treat synchronously?
  return fn.apply(this, args);
});

/**
 * Wrap an express middleware function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const middleware = wrap((fn, print) => {
  const isError = fn.length === 4;
  const resIndex = isError ? 2 : 1;
  const nextIndex = isError ? 3 : 2;

  return function perfWrappedMiddleware(...args) {
    const start = process.hrtime();
    const res = args[resIndex];
    const next = args[nextIndex];

    function log() {
      // clean self up
      res.removeListener('close', log);
      res.removeListener('finish', log);

      // don't try to guess if it succeeded or failed
      print(start, args, [undefined, undefined]);
    }

    // intercept any kind of send on the response
    res.on('close', log);
    res.on('finish', log);

    // intercept calling next()
    args[nextIndex] = function perfWrappedNext(...retArgs) {
      log();
      return next.apply(this, retArgs);
    };

    return fn.apply(this, args);
  };
});
