import onFinished from 'on-finished';
import { debug } from './constants';
import { wrap } from './utils';

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
  return function perfWrappedErrorMiddleware(err, req, res, next) {
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
