module.exports = {
  addPatternDefaults
};

function addPatternDefaults({ backdrop, ...pattern }, { backdrop: _backdrop, ..._pattern }) {
  let resultBackdrop;
  if (!backdrop) {
    resultBackdrop = _backdrop;
  } else {
    resultBackdrop = [];
    for (let i = 0; i < backdrop.length; i++) {
      if (_backdrop[i]) {
        resultBackdrop.push({ ..._backdrop[i], ...backdrop[i] });
      } else {
        resultBackdrop.push(backdrop[i]);
      }
    }
  }
  return {
    ..._pattern,
    ...pattern,
    backdrop: resultBackdrop
  };
}
