import findLastIndex from 'lodash/findLastIndex';
import { debug } from './constants';
import { wrap, createDecorator } from './utils';

/**
 * Wrap a node-style callback function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const callback = wrap((fn, print) => {
  debug('wrapping callback function: %s', fn.name || 'anonymous');

  return function perfWrappedCallback(...args) {
    // most function have the callback last, but just in case...
    const index = findLastIndex(args, arg => typeof arg === 'function');
    if (index >= 0) {
      debug('wrapping callback at arguments[%s]', index);
      const start = process.hrtime();
      const cb = args[index];
      args[index] = function perfWrappedCb(...retArgs) {
        print(start, args, retArgs);
        return cb.apply(this, retArgs);
      };
    } else {
      // no callback at all. Wow..
      debug('no callback passed to wrapped callback function. not logging');
    }

    return fn.apply(this, args);
  };
});

export const timeCallback = createDecorator(callback);
