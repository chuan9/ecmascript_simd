// Simple performance test of SIMD.float32x4Shuffle. 
// Compare to scalar implementation of same function.
// Author: Liu Chuan
(function () {

  // Kernel configuration
  var kernelConfig = {
    kernelName:       "float32x4Shuffle",
    kernelInit:       init,
    kernelCleanup:    cleanup,
    kernelSimd:       simdCrankshaftAverage,
    kernelNonSimd:    average,
    kernelIterations: 1000
  };

  // Hook up to the harness
  benchmarks.add (new Benchmark (kernelConfig));

  // Do the object allocate globally, so the performance of the kernel functions aren't overshadowed by object creattions
  var a = new Float32Array(10000);
  var b = new Float32Array(10000);

  function initState() {
    for (var i = 0; i < a.length; ++i) {
      a[i] = 0.1;
    }

    for (var i = 0; i < b.length; ++i) {
      b[i] = 0.1;
    }
  }

  function sanityCheck() {
    return Math.abs(simdCrankshaftAverage(1) - average(1)) < 0.0001;
  }

  // Kernel Initializer
  function init () {
    initState();
    return sanityCheck();
  }

  // Kernel Cleanup
  function cleanup () {
    return sanityCheck(); 
  }

  // SIMD version of the kernel
  function simdCrankshaftAverage(iterations) {
    for (var i = 0; i < iterations; ++i) {
      var sum = 0.0;
      var a_length = a.length

      for (var j = 0; j < a_length; j += 4) {
        var x = SIMD.float32x4.load(a, j);
        var y = SIMD.float32x4.load(b ,j);
        sum += SIMD.float32x4.shuffle(x, y, 0, 1, 4, 5).x + SIMD.float32x4.shuffle(x, y, 0, 1, 4, 5).y + SIMD.float32x4.shuffle(x, y, 0, 1, 4, 5).z + SIMD.float32x4.shuffle(x, y, 0, 1, 4, 5).w;
      }
    }
    return sum/a.length;
  }

  // Non SIMD version of the kernel
  function average(iterations) {
    for (var i = 0; i < iterations; ++i) {
      var sum = 0.0;
      var a_length = a.length;
 
      for (var j = 0; j < a_length; j += 4) {
        var x = SIMD.float32x4.load(a, j);
        var y = SIMD.float32x4.load(b ,j);
        sum += x.x + x.y + y.x + y.y;
      }
    }
    return sum/a.length;
  }
} ());
