function fn(a) {
  return a;
}

module.exports = function(derf) {
  const wrapped = derf.callback('test', fn);

  return {
    description: 'should work if no callback is supplied',
    raw: (a, cb) => { cb(); return fn(a); },
    wrapped: (a, cb) => { cb(); return wrapped(a); } ,
  }
}
