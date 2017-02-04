import { timeSync, timePromise, timeCallback } from '../src';

describe('derf decorators', () => {

  let instance = null;
  const value = {};

  before(() => {
    @timeSync('foo')
    class MyClass {

      @timeSync('test')
      sync(val) {
        return val;
      }

      @timePromise('test')
      promise(val) {
        return Promise.resolve(val);
      }

      @timeCallback('test')
      callback(val, cb) {
        setTimeout(cb, 0, val);
      }
    }

    instance = new MyClass();
  });

  it('should wrap sync methods', () => {
    const v = instance.sync(value);
    expect(v).to.equal(value);
  });

  it('should wrap promise methods', () => {
    return instance.promise(value)
      .then(v => expect(v).to.equal(value));
  });

  it('should wrap callback methods', (done) => {
    instance.callback(value, v => {
      expect(v).to.equal(value);
      done();
    });
  });
});
