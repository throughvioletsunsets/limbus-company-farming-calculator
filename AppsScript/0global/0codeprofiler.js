// 0global/0codeprofiler.gs

let _profTimings = {};
let _profStack = [];

// Flip this to true/false to turn profiling output on/off.
let PROFILING_ENABLED = false;

function profStart(label) {
  if (!PROFILING_ENABLED) return;
  _profStack.push({ label, start: Date.now() });
}

function profEnd() {
  if (!PROFILING_ENABLED) return;
  const entry = _profStack.pop();
  if (!entry) return;
  const elapsed = Date.now() - entry.start;
  _profTimings[entry.label] = (_profTimings[entry.label] || 0) + elapsed;
}

function profWrap(label, fn) {
  if (!PROFILING_ENABLED) return fn();
  profStart(label);
  try {
    return fn();
  } finally {
    profEnd();
  }
}

function profReset() {
  if (!PROFILING_ENABLED) return;
  _profTimings = {};
  _profStack = [];
}

function profReport() {
  if (!PROFILING_ENABLED) return;
  const rows = Object.entries(_profTimings)
    .sort((a, b) => b[1] - a[1])
    .map(([label, ms]) => `${label}: ${ms}ms`);
  Logger.log("=== PROFILE REPORT ===\n" + rows.join("\n"));
}