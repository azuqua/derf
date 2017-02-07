import { debug } from './constants';
import { wrap, createDecorator } from './utils';

/**
 * Wrap a synchronous function
 * @param {String|Function} namespace
 * @param {Function} fn - to wrap
 * @param {Function} printer - to customize logs
 */
export const sync = wrap((fn, print) => {
  debug('wrapping sync function: %s', fn.name || 'anonymous');

  return function perfWrappedSync(...args) {
    let err = undefined;
    let val = undefined;
    const start = process.hrtime();

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

export const timeSync = createDecorator(sync);
