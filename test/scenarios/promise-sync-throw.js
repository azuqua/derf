function fn() {
  throw new Error();
}

module.exports = function(derf) {
  return {
    description: 'should not catch sync thrown errors',
    raw: fn,
    wrapped: derf.promise('test', fn),
  }
}
