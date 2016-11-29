import { isWrapped, sync } from '../src';

describe('isWrapped function', () => {
  function foo(){}

  it('should return false for an unwrapped function', () => {
    expect(isWrapped(foo)).to.be.false;
  });

  it('should return true for a wrapped function', () => {
    expect(isWrapped(sync('test', foo))).to.be.true;
  });
})
