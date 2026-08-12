// 1global/1codeGetSet.gs

let _scriptCache = null;
let _scriptCacheDirty = false;

function getScriptCache() {
  if (!_scriptCache) {
    const raw = PropertiesService.getScriptProperties().getProperties();
    _scriptCache = {
      previousRowCount:        parseInt(raw.previousRowCount)        || 1,
      previousThreadsRowCount: parseInt(raw.previousThreadsRowCount) || 1,
      previousCratesRowCount:  parseInt(raw.previousCratesRowCount)  || 1,
      mixResult: raw.mixResult ? JSON.parse(raw.mixResult) : { clearRuns: 0, skipRuns: 0 },
      previousAnchorPositions: raw.previousAnchorPositions ? JSON.parse(raw.previousAnchorPositions) : {}
    };
  }
  return _scriptCache;
}

function flushScriptCache() {
  if (!_scriptCache || !_scriptCacheDirty) return;
  PropertiesService.getScriptProperties().setProperties({
    previousRowCount:        _scriptCache.previousRowCount.toString(),
    previousThreadsRowCount: _scriptCache.previousThreadsRowCount.toString(),
    previousCratesRowCount:  _scriptCache.previousCratesRowCount.toString(),
    mixResult:               JSON.stringify(_scriptCache.mixResult),
    previousAnchorPositions: JSON.stringify(_scriptCache.previousAnchorPositions)
  });
  _scriptCacheDirty = false;
}

function getPreviousRowCount()       { return getScriptCache().previousRowCount; }
function setPreviousRowCount(value)  { getScriptCache().previousRowCount = value; _scriptCacheDirty = true; invalidateRestorableDefsCache("Tickets"); }
function getMixResult()              { return getScriptCache().mixResult; }
function setMixResult(c, s)          { getScriptCache().mixResult = { clearRuns: c, skipRuns: s }; _scriptCacheDirty = true; }




function getPreviousThreadsRowCount() {
  const val = getScriptCache().previousThreadsRowCount || 1;
  return val;
}

function setPreviousThreadsRowCount(value) {
  getScriptCache().previousThreadsRowCount = value;
  _scriptCacheDirty = true;
  invalidateRestorableDefsCache("Threads");
}

function getPreviousCratesRowCount() {
  const val = getScriptCache().previousCratesRowCount || 1;
  return val;
}

function setPreviousCratesRowCount(value) {
  getScriptCache().previousCratesRowCount = value;
  _scriptCacheDirty = true;
  invalidateRestorableDefsCache("Crates"); 
}





let _sheetCache = {};
function getASheet(sheetName) {
  if (!_sheetCache[sheetName]) {
    _sheetCache[sheetName] = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  }
  return _sheetCache[sheetName];
}

function cellCoords(def) {
  return {
    row: def.row !== undefined ? def.row : def.startRow,
    col: def.col !== undefined ? def.col : def.startCol,
  };
}

function getACellValue(cell) {
  cell = resolve(cell);
  const { row, col } = cellCoords(cell);
  return getASheet(cell.sheet).getRange(row, col).getValue();
}

function getTableValues(table) {
  const t = resolve(table);
  return getASheet(t.sheet)
    .getRange(t.startRow, t.startCol, t.numRows, t.numCols)
    .getValues();
}

function setACellValue(cell, value) {
  cell = resolve(cell);
  const { row, col } = cellCoords(cell);
  return getASheet(cell.sheet).getRange(row, col).setValue(value);
}

function setTableValues(table, value) {
  table = resolve(table);
  return getASheet(table.sheet)
    .getRange(table.startRow, table.startCol, table.numRows, table.numCols)
    .setValues(value);
}

function columnToLetter(column) {
  var temp, letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function getTicketsRow(section, mode) {
  return resolve(LIBRARYTABLES.TICKETS_TABLE).values.find(r => r[TICKETS_CONST.STAGE] === section && r[TICKETS_CONST.MODE] === mode);
}

function getThreadsRow(difficulty, mode) {
  return resolve(LIBRARYTABLES.THREADS_TABLE).values.find(r => r[THREADS_CONST.DIFFICULTY] === difficulty && r[THREADS_CONST.MODE] === mode);
}

function setDropdownRange(sheet, startRow, numRows, col, options) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(startRow, col, numRows, 1).setDataValidation(rule);
}

function getPreviousAnchorPositions()          { return getScriptCache().previousAnchorPositions; }
function setAnchorGroupPositions(groupName, p) {
  getScriptCache().previousAnchorPositions[groupName] = p;
  _scriptCacheDirty = true;
}



const DYNAMIC_ANCHOR_ROWS = {
  Tickets: {
    SINNERS_TABLE:        () => getPreviousRowCount(),
    SINNERS_DISTRIBUTION: () => getPreviousRowCount(),
  },
  Threads: {
    SINNERS_TABLE: () => getPreviousThreadsRowCount(),
  },
  Crates: {
    SINNERS_TABLE: () => getPreviousCratesRowCount(),
  },
  Library: {},
};

function getEffectiveAnchorNumRows(groupName, name, declaredNumRows) {
  const getter = (DYNAMIC_ANCHOR_ROWS[groupName] || {})[name];
  if (!getter) return declaredNumRows;
  const liveRowCount = getter();         
  const extraRows = Math.max(liveRowCount - 1, 0); 
  return declaredNumRows + extraRows;
}


function getDefaultAnchorPositions(groupName) {
  const tableDef = HOMETABLES[groupName.toUpperCase() + "_ANCHOR"];
  const group     = ANCHOR_GROUPS[groupName];
  if (!tableDef || !group) return {};

  const table = resolve(tableDef);
  const names = Object.keys(group.offsets).sort((a, b) => group.offsets[a] - group.offsets[b]);

  const positions = {};
  names.forEach((name, i) => {
    positions[name] = parseA1(table.values[i][0]);
  });
  return positions;
}

function rowColToA1(row, col) {
  return columnToLetter(col) + row;
}
