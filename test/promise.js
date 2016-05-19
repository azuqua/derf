import glob from 'glob';
import * as derf from '../src';

function resolve(fn) {
  let syncErr = undefined;
  let syncVal = undefined;
  let err = undefined;
  let val = undefined;
  let promise = undefined;

  try {
    syncVal = promise = fn();
  } catch (e) {
    syncErr = e;
  }

  if (!promise || !promise.then) {
    return Promise.resolve({ syncErr, syncVal });
  } else {
    syncVal = undefined;
  }

  return promise.then(
    v => val = v,
    e => err = e
  ).then(() => ({ val, err, syncVal, syncErr }));
}

describe('promise wrapper', () => {
  glob.sync(__dirname + '/scenarios/promise-*').forEach(file => {
    const { description, raw, wrapped } = require(file)(derf);

    it(description, (done) => {
      Promise.all([
        resolve(() => raw('foo')),
        resolve(() => wrapped('foo'))
      ]).then(([rawRes, wrappedRes]) => {
        expect(rawRes).to.deep.equal(wrappedRes);
      }).then(done, done);
    })
  });
});
