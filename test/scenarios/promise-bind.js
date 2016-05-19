const fn = (function(a) {
  return Promise.resolve(a + this);
}).bind('foo');

module.exports = function(derf) {
  return {
    description: 'should not overwrite a bound context',
    raw: fn,
    wrapped: derf.promise('test', fn),
  }
}
