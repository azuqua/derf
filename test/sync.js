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
  it('should return a function with the same name', function() {
    function foo(){};
    const wrapped = derf.callback('test', foo);
    expect(wrapped.name).to.equal(foo.name);
  });

  it('should return a function with the same arity', function() {
    function foo(a,b,c, d){};
    const wrapped = derf.callback('test', foo);
    expect(wrapped.length).to.equal(foo.length);
  });

  glob.sync(__dirname + '/scenarios/sync-*').forEach(file => {
    const { description, raw, wrapped } = require(file)(derf);

    it(description, () => {
      const rawRes = resolve(() => raw('foo'));
      const wrappedRes = resolve(() => wrapped('foo'));

      expect(rawRes).to.deep.equal(wrappedRes);
    })
  });
});
