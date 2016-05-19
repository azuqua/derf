function fn() {
  return 'foo';
}

module.exports = function(derf) {
  return {
    description: 'should not catch sync returned values',
    raw: fn,
    wrapped: derf.promise('test', fn),
  }
}
