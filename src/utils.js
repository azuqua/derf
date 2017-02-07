import assert from 'assert';
import round from 'lodash/round';
import mimic from 'mimic-fn';
import createDebug from 'debug';
import { DERFED, debug } from './constants';

// converts the output from `process.hrtime()` to nano seconds
export function hrToNano(hr) {
  return hr[0] * 1e9 + hr[1];
}

// the default message to display
export function defaultPrinter(print, time, callArgs, retArgs) {
  const displayTime = `${round(time / 1e6, 2)}ms`;

  if (retArgs[0]) {
    print('failed in %s', displayTime);
  } else {
    print('finished in %s', displayTime);
  }
}

/**
 * Creates a type decorator function
 * @param {Function} type
 * @param {Function=} printer defaults to `defaultPrinter`
 * @return {Function} decorator
 */
export function createDecorator(type, printer = defaultPrinter) {
  return function decorate(namespace) {
    return function decorator(target, key, descriptor) {
      if (typeof target === 'function') {
        debug('cannot wrap class, skipping');
        return target;
      }

      if (typeof descriptor.value !== 'function') {
        debug('cannot wrap non-function, skipping');
        return descriptor;
      }

      descriptor.value = type(
        namespace,
        descriptor.value,
        printer
      );

      return descriptor;
    };
  };
}

/**
 * wraps all our handler function to take care of some common patterns
 * @param {Function} handler
 * @return {Function} wrapper
 */
export function wrap(handler) {
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
      assert(typeof fn === 'function', 'expected a function to wrap');
      assert(typeof printer === 'function', 'expected function for printing');
    } catch (e) {
      console.warn(`derf ${e.message}`); // eslint-disable-line no-console
      return fn;
    }

    // it should be impossible to throw from logging
    const print = (start, args, retArgs) => {
      try {
        const diff = hrToNano(process.hrtime(start));
        printer(fnDebug, diff, args, retArgs);
      } catch (e) {
        debug('derf printer threw an error %s', e && e.stack);
        /* noop */
      }
    };

    // mimic original function because the name and arity might matter
    const wrappedFn = handler(fn, print);
    mimic(wrappedFn, fn);

    // mark it with a symbol so it's possible to tell the difference
    wrappedFn[DERFED] = true;

    return wrappedFn;
  };
}
