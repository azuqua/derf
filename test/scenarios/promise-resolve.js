function fn() {
  return Promise.resolve('foo');
}

module.exports = function(derf) {
  return {
    description: 'should return the resolved value',
    raw: fn,
    wrapped: derf.promise('test', fn),
  }
}
