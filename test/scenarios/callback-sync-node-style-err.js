function fn(a, fn) {
  fn('foo', null);
  throw 'foo';
}

module.exports = function(derf) {
  return {
    description: 'should rethrow all possible thrown errors',
    raw: fn,
    wrapped: derf.callback('test', fn),
  }
}
