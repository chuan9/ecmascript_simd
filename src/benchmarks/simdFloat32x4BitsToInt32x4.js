// Simple performance test of SIMD.int32x4.fromFloat32x4Bits operation.
// Compare to scalar implementation of same function.
// Author: Liu Chuan

(function () {

  // Kernel configuration
  var kernelConfig = {
    kernelName:       "testFloat32x4BitsToInt32x4",
    kernelInit:       initArray,
    kernelCleanup:    cleanup,
    kernelSimd:       simd,
    kernelNonSimd:    nonsimd,
    kernelIterations: 1000
  };

  // Hook up to the harness
  benchmarks.add(new Benchmark(kernelConfig));

  // Benchmark data, initialization and kernel functions
  var a = new Float32Array(4);
  var tmpInt32Array = new Int32Array(a.buffer);
  var nonSimdArray = new Int32Array(4);
  var simdArray = new Int32Array(4);

  function sanityCheck() {
    for (var i = 0; i < a.length; ++i) {
      return (Math.abs(nonSimdArray[i] - simdArray[i]) < 0.0001);
    }
  }

  function initArray() {
    var i = 0;
    for (var i = 0; i < a.length; ++i) {
      a[i] = 1.1;
    }

    nonsimd(1);
    simd(1);
    }

    // Check that the two kernel functions yields the same result
    return sanityCheck();
  }

  function cleanup() {
    return sanityCheck();
  }

  function nonsimd(n) {
    for (var i = 0; i < n; ++i) {
      for (var j = 0, l = a.length; j < l; j += 1) {
        nonSimdArray[j] = tmpInt32Array[j];
      }
    }
  }

  function simd(n) {
    var temp;
    var a_length = a.length;
    for (var i = 0; i < n; ++i) {
      for (var j = 0; j < a_length; j += 4) {
        temp = SIMD.float32x4.load(a, j);
        SIMD.int32x4.store(simdArray, j, SIMD.int32x4.fromFloat32x4Bits(temp));
      }
    }
  }

} ());
