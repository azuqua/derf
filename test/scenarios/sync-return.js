function fn() {
  return 'foo';
}

module.exports = function(derf) {
  return {
    description: 'should return the same value',
    raw: fn,
    wrapped: derf.sync('test', fn),
  }
}
