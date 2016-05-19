function fn(a, fn) {
  fn(null, 'foo');
  return 'foo';
}

module.exports = function(derf) {
  return {
    description: 'should accept all possible return values',
    raw: fn,
    wrapped: derf.callback('test', fn),
  }
}
