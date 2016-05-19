import glob from 'glob';
import * as derf from '../src';

function resolve(fn) {
  try {
    return fn();
  } catch (e) {
    return e;
  }
}

describe('sync wrapper', () => {
  glob.sync(__dirname + '/scenarios/sync-*').forEach(file => {
    const { description, raw, wrapped } = require(file)(derf);

    it(description, () => {
      const rawRes = resolve(() => raw('foo'));
      const wrappedRes = resolve(() => wrapped('foo'));

      expect(rawRes).to.deep.equal(wrappedRes);
    })
  });
});
