function fn(a) {
  return a;
}

module.exports = function(derf) {
  return {
    description: 'should supply the same args',
    raw: fn,
    wrapped: derf.sync('test', fn),
  }
}
