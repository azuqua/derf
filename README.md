# derf

> debug. perf. derf?

Simple wrappers for debugging function performance.

 * based on the [`debug`](https://github.com/visionmedia/debug) module
 * handles most common function patterns
 * no performance hit in production

### Example

##### Wrap Functions
```js
// DEBUG=sync:* node script.js
import * as derf from 'derf';

const fn = derf.sync('sync:fn', function(a, b) {
  // slow operation
  return value;
});

```

##### Wrap Async Functions
```js
// DEBUG=async:* node script.js
import * as derf from 'derf';

const fn1 = derf.callback('async:fn1', function(foo, bar, cb) {
  // slow operation
  callback(null, value);
});

const fn2 = derf.promise('async:fn2', function(foo, bar) {
  // slow operation
  return Promise.resolve(value);
});

```

##### Wrap Express Middleware
```js
// DEBUG=middleware:* node script.js
import * as derf from 'derf';

const fn1 = derf.middleware('middleware:fn1', function(req, res, next) {
  // slow operation
  res.send('foo');
});

const fn2 = derf.middleware('middleware:fn2', function(req, res, next) {
  // slow operation
  next();
});

const fn3 = derf.middleware('middleware:fn3', function(err, req, res, next) {
  // slow operation
  request('/something').pipe(res);
});

```

### API

Every function wrapper takes in the following arguments:
 * `namespace` - Required. A string to pass to [`debug`](https://github.com/visionmedia/debug) or a debug function.
 * `fn` - Required. A function to wrap.
 * `printer` - Optional. A function to [customize what is logged](#custom-logging).

#### `derf.sync(namespace, fn, [printer])`
Wraps a synchronous function.

#### `derf.callback(namespace, fn, [printer])`
Wraps a node-style async function. derf will intercept the last function
passed in. Meaning it can work with the following types of argument orders.

```js
const fn1 = derf.callback('namespace1', function(a, b, callback) { });

const fn2 = derf.callback('namespace1', function(a, callback, b) { });

const fn1 = derf.callback('namespace1', function(callback, a, b) { });
```

#### `derf.promise(namespace, fn, [printer])`
Wraps a function that returns a promise.

#### `derf.middleware(namespace, fn, [printer])`
Wraps express middleware, route handlers, and error handlers.

#### `derf.isWrapped(fn) -> boolean`
Returns true if a given function has already been wrapped by derf.


### Custom Logging
You can pass in a function as the last argument of each derf wrapper to customize what is logged. The function must return a string and is passed the following arguments:

 * `debug` - _function_. the debug instance.
 * `time` - _number_. the time in nanoseconds it took the function to to run.
 * `args` - _array_. the arguments the function was called with.
 * `retArgs` - _array_. the error/value the function was resolved with.

For example, a simple printer could look like this:

```js
function simplePrinter(debug, time, callArgs, retArgs) {
  const [err, res] = retArgs; // not available for middleware

  if (err) {
    debug('failed in %s nanoseconds', time);
  } else {
    debug('finished in %s nanoseconds', time);
  }
}
```

### Decorators
In addition to exporting the standard wrapping functions, derf also provides
functions that work with the experimental decorator syntax.

```js
import { timeSync, timePromise, timeCallback } from 'derf';
import createDebug from 'debug';

const debug = createDebug('test');

export default class TimedClass {

  @timeSync('test')
  sync(val) {
    return val;
  }

  @timePromise(debug)
  promise(val) {
    return Promise.resolve(val);
  }

  @timeCallback('test')
  callback(val, cb) {
    setTimeout(cb, 0, val);
  }
}

```

You can create decorators with custom logging logic by importing the `createDecorator` function.

```js
import { createDecorator, callback as callbackWrapper } from 'derf';

const myDecorator = createDecorator(
  callbackWrapper,
  function simplePrinter(debug, time, callArgs, retArgs) {
    debug('it\'s done');
  }
);
```

### Caveats

1. Because derf wraps your function calls with it's own. There is a
performance hit when the `DEBUG` environment variable is enabled. But
you shouldn't have that enabled in production anyways.

2. Try not to miswrap Functions (e.g. don't do `derf.promise(someCallbackFunction)`).
While derf won't break your code by throwing an error, it will not be able to print
the timings of that function, it may also cause the function to run slower.
Run your code with `DEBUG=derf,your:namespace:*` to view derf's own debug statements.
