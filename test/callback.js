import glob from 'glob';
import * as derf from '../src';

function resolve(fn, _cb) {
  let syncRet = undefined;
  let syncErr = undefined;
  let asyncArgs = undefined;
  let ended = false;

  const done = () => {
    _cb({
      sync: [syncErr, syncRet],
      cb: asyncArgs
    });
  }

  const cb = (...args) => {
    asyncArgs = args;
    if (ended) done();
    else ended = true;
  }

  try {
    syncRet = fn(cb);
  } catch (e) {
    syncErr = e;
  } finally {
    if (ended) done();
    else ended = true;
  }
}

describe('callback wrapper', () => {
  glob.sync(__dirname + '/scenarios/callback-*').forEach(file => {
    const { description, raw, wrapped } = require(file)(derf);

    it(description, (done) => {
      resolve(fn => raw('foo', fn), (rawRes) => {
        resolve(fn => wrapped('foo', fn), (wrappedRes) => {
          try {
            expect(rawRes).to.deep.equal(wrappedRes);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });
});
