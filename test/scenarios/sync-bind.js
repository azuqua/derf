const fn = (function(a) {
  return this + a;
}).bind('foo');

module.exports = function(derf) {
  return {
    description: 'should not overwrite a bound context',
    raw: fn,
    wrapped: derf.sync('test', fn),
  }
}
