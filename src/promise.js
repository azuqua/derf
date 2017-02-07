import { debug } from './constants';
import { wrap, createDecorator } from './utils';

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

export const timePromise = createDecorator(promise);
