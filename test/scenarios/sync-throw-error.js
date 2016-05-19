function fn() {
  throw new Error();
}

module.exports = function(derf) {
  return {
    description: 'should rethrow errors the function throws',
    raw: fn,
    wrapped: derf.sync('test', fn),
  }
}
