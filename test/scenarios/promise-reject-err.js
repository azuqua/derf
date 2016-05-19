function fn() {
  return Promise.reject(new Error());
}

module.exports = function(derf) {
  return {
    description: 'should not catch rejected errors',
    raw: fn,
    wrapped: derf.promise('test', fn),
  }
}
