const fn = (function(a, cb) {
  cb(null, this + a);
}).bind('foo');

module.exports = function(derf) {
  return {
    description: 'should not overwrite a bound context',
    raw: fn,
    wrapped: derf.callback('test', fn),
  }
}
