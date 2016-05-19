function fn() {
  throw "error!";
}

module.exports = function(derf) {
  return {
    description: 'should throw anything the function throws',
    raw: fn,
    wrapped: derf.sync('test', fn),
  }
}
