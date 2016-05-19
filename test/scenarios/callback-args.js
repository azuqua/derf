function fn(a, cb) {
  cb(null, a);
  return a;
}

module.exports = function(derf) {
  return {
    description: 'should not change the args',
    raw: fn,
    wrapped: derf.callback('test', fn),
  }
}
