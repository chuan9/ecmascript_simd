//InverseColunm is function that exchange column's order, it is to test SIMD.float64x2.swizzle's performance in crankshaft.
// Author: Liu Chuan
(function() {

  // Kernel configuration
  var kernelConfig = {
    kernelName:       "SIMDFloat64x2Swizzle",
    kernelInit:       init,
    kernelCleanup:    cleanup,
    kernelSimd:       simdInverseColumnN,
    kernelNonSimd:    inverseColumnN,
    kernelIterations: 1000
  };

  // Hook up to the harness
  benchmarks.add(new Benchmark(kernelConfig));

  // Do the object allocations globally, so the performance of the kernel
  // functions aren't overshadowed by object creations

  var state   = new Float64Array(16);    // 4x4 state matrix

  // initialize the 4x4 state matrix
  function initState() {
    for (var i = 0; i < 16; ++i) {
      state[i] = i/10;
    }
  }

  // Verify the result
  function checkState() {
    var expected = new Float64Array(
        0.1,  0.0,  0.3,  0.2,
        0.5,  0.4,  0.7,  0.6,
        0.9,  0.8,  1.1,  1.0,
        1.3,  1.2,  1.5,  1.4);
    for (var i = 0; i < 16; ++i) {
      if (Math.abs(state[i] - expected[i]) > 0.0001) {
        return false;
      }
    }
    return true;
  }

  function init() {
    // Check that inverseColumns yields the right result
    initState();
    inverseColumnN(1);
    if (!checkState()) {
      return false;
    }

    // Check that simdInverseColumns yields the right result
    initState();
    simdInverseColumnN(1);
    if (!checkState()) {
      return false;
    }
    return true;
  }

  function cleanup() {
    return init(); // Sanity checking before and after are the same
  }

  // This is the typical implementation of exchange value 
  function inverseColumns(state, Nc) {
    for (var r = 0; r < 4; ++r) {
      var ri = r*Nc; // get the starting index of row 'r'
      var c;
      for (c = 0; c < Nc; c += 2) {
        var r1 = SIMD.float64x2.load(state, ri + c);
        var temp =  r1.x;
        r1.y = r1.x;
        r1.x = temp;
        SIMD.float64x2.store(state, ri+c, r1);
      }
    }
  }

  // The SIMD optimized version of exchange value
  // The function is special cased for a 4 column setting (Nc == 4).
  function simdInverseColumns(state, Nc) {
    if (Nc !== 4) {
      inverseColumns(state, Nc);
    }
    for (var r = 0; r < 4; ++r) {
      var ri = r*Nc;
      var c;
      for (c = 0; c < Nc; c += 2) {
        var r1 = SIMD.float64x2.load(state, ri + c);
        SIMD.float64x2.store(state, ri+c, SIMD.float64x2.swizzle(r1, 1, 0));
      }
    }
  }

  function inverseColumnN(iterations) {
    for (var i = 0; i < iterations; ++i) {
      inverseColumns(state, 4);
    }
  }

  function simdInverseColumnN(iterations) {
    for (var i = 0; i < iterations; ++i) {
      simdInverseColumns(state, 4);
    }
  }
} ());
