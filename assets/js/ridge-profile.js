/* Deterministic ridge profile for the hill-climbing figure.
   Exposes window.RidgeProfile = { sample(count), climb(elevation, start) }. */
(function () {
  'use strict';

  // Each peak: where it sits (0..1), how tall it is, and how quickly it falls away.
  var PEAKS = [
    { at: 0.08, height: 0.38, reach: 0.05 },
    { at: 0.25, height: 0.66, reach: 0.052 },
    { at: 0.42, height: 0.5, reach: 0.046 },
    { at: 0.62, height: 1.0, reach: 0.064 },
    { at: 0.81, height: 0.62, reach: 0.05 },
    { at: 0.95, height: 0.32, reach: 0.04 }
  ];

  // Sum of sharp bumps: pointed summits with concave flanks, like a skyline of peaks.
  function raw(x) {
    var total = 0.04;
    for (var k = 0; k < PEAKS.length; k++) {
      total += PEAKS[k].height * Math.exp(-Math.abs(x - PEAKS[k].at) / PEAKS[k].reach);
    }
    return total;
  }

  // Elevation samples scaled to 0..1, plus the index of every local peak and the summit.
  function sample(count) {
    var elevation = [];
    var low = Infinity;
    var high = -Infinity;
    var i;
    for (i = 0; i < count; i++) {
      var value = raw(i / (count - 1));
      elevation.push(value);
      if (value < low) low = value;
      if (value > high) high = value;
    }
    for (i = 0; i < count; i++) elevation[i] = (elevation[i] - low) / (high - low);

    var peaks = [];
    for (i = 1; i < count - 1; i++) {
      if (elevation[i] > elevation[i - 1] && elevation[i] >= elevation[i + 1]) peaks.push(i);
    }
    var summit = peaks[0];
    peaks.forEach(function (index) {
      if (elevation[index] > elevation[summit]) summit = index;
    });
    return { elevation: elevation, peaks: peaks, summit: summit };
  }

  // Greedy hill climbing: step to the higher neighbour until neither neighbour is higher.
  function climb(elevation, start) {
    var last = elevation.length - 1;
    var i = start;
    var path = [i];
    for (;;) {
      var left = i > 0 ? elevation[i - 1] : -Infinity;
      var right = i < last ? elevation[i + 1] : -Infinity;
      if (left <= elevation[i] && right <= elevation[i]) break;
      i = right >= left ? i + 1 : i - 1;
      path.push(i);
    }
    return path;
  }

  window.RidgeProfile = { sample: sample, climb: climb };
})();
