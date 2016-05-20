import createDebug from 'debug';
import assert from 'assert';
import findLastIndex from 'lodash/findLastIndex';
import onFinished from 'on-finished';

const debug = createDebug('derf');

function hrToNano(hr) {
  return hr[0] * 1e9 + hr[1];
}

// the default message to display
function defaultPrinter(print, time, callArgs, retArgs) {
  const displayTime = `${Math.floor(time / 1e5) / 10}ms`;

  if (retArgs[0]) {
    print('failed in %s', displayTime);
  } else {
    print('finished in %s', displayTime);
  }
}

// wraps all our handler function to take care of some common patterns
function wrap(handler) {
  return (namespace, fn, printer = defaultPrinter) => {
    // 'cast' namespace to be a debug function
    const fnDebug = typeof namespace === 'function' ?
      namespace : createDebug(namespace);

    // noop if debug is not enabled
    if (!fnDebug.enabled) {
      return fn;
    }

    // validate args if enabled, but only warn here if it fails
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
        printer(fnDebug, diff, args, retArgs);
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
export const sync = wrap((fn, print) => {
  debug('wrapping sync function: %s', fn.name || 'anonymous');

  return function perfWrappedSync(...args) {
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
  };
});

/**
 * Wrap a promise returning function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const promise = wrap((fn, print) => {
  debug('wrapping promise function: %s', fn.name || 'anonymous');

  return function perfWrappedPromise(...args) {
    const start = process.hrtime();

    const ret = fn.apply(this, args);

    // common case where a thennable is returned
    if (ret && ret.then) {
      return ret.then(
          val => {
            print(start, args, [undefined, val]);
            return val; // return val
          },
          err => {
            print(start, args, [err, undefined]);
            throw err; // rethrow err
          }
        );
    }

    // it wasn't a promise. great job.
    debug('no promise returned from wrapped promise function. not logging');
    return ret;
  };
});

/**
 * Wrap a node-style callback function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const callback = wrap((fn, print) => {
  debug('wrapping callback function: %s', fn.name || 'anonymous');

  return function perfWrapped(...args) {
    const start = process.hrtime();

    // most function have the callback last, but just in case...
    const index = findLastIndex(args, arg => typeof arg === 'function');
    if (index >= 0) {
      debug('wrapping callback at arguments[%s]', index);
      const cb = args[index];
      args[index] = function perfWrappedCb(...retArgs) {
        print(start, args, retArgs);
        return cb.apply(this, retArgs);
      };

      return fn.apply(this, args);
    }

    // no callback at all. Wow..
    debug('no callback passed to wrapped callback function. not logging');
    return fn.apply(this, args); // TODO synchronously handle it? warn?
  };
});

/**
 * Wrap an express middleware function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const middleware = wrap((fn, print) => {
  debug('wrapping express middleware: %s', fn.name || 'anonymous');
  const arity = fn.length;

  // normal middleware?
  if (arity <= 3) {
    debug('%s args, is normal middleware', arity);
    return function perfWrappedMiddleware(req, res, next) {
      const start = process.hrtime();
      let finished = false;

      function log() {
        if (!finished) {
          finished = true;

          // dont try to guess the retArgs
          print(start, [req, res], [undefined, undefined]);
        }
      }

      onFinished(res, log);
      return fn.call(this, req, res, function wrappedNext() {
        log();
        next.apply(this, arguments); // eslint-disable-line prefer-rest-params
      });
    };
  }

  // must be error middleware
  debug('%s args, is error middleware', arity);
  return function perfWrappedMiddleware(err, req, res, next) {
    const start = process.hrtime();
    let finished = false;

    function log() {
      if (!finished) {
        finished = true;

        // dont try to guess the retArgs
        print(start, [err, req, res], [undefined, undefined]);
      }
    }

    onFinished(res, log);
    return fn.call(this, err, req, res, function wrappedNext() {
      log();
      next.apply(this, arguments); // eslint-disable-line prefer-rest-params
    });
  };
});
