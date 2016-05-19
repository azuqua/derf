function fn() {
  return Promise.reject('foo');
}

module.exports = function(derf) {
  return {
    description: 'should not catch rejected values',
    raw: fn,
    wrapped: derf.promise('test', fn),
  }
}
