// 1global/1codeHandleDefaults.gs

  const SHEET_CONFIG = {
    "Home":          { cells: HOMEDEFAULTS,    tables: HOMETABLES,    blocks: HOMEBLOCKS    },
    "Tickets":       { cells: TICKETSDEFAULTS, tables: TICKETSTABLES, blocks: TICKETSBLOCKS },
    "Threads":       { cells: THREADSDEFAULTS, tables: THREADSTABLES, blocks: THREADSBLOCKS },
    "Crates":        { cells: CRATESDEFAULTS,  tables: CRATESTABLES,  blocks: CRATESBLOCKS  },
    "The Library": { cells: LIBRARYDEFAULTS, tables: LIBRARYTABLES, blocks: LIBRARYBLOCKS },
  };




// ============================================================
// Shared config, same shape setupAllSheets used to build inline.
// ============================================================

function restoreBlankAnchorHomeCells(groupName, group) {
  const homeTable = resolve(group.homeTable);
  const sheet = getASheet(homeTable.sheet);
  const range = sheet.getRange(homeTable.startRow, homeTable.startCol, homeTable.numRows, 1);
  const values = range.getValues();

  const names = Object.keys(group.offsets).sort((a, b) => group.offsets[a] - group.offsets[b]);
  const prevPositions = getPreviousAnchorPositions()[groupName] || {};

  let restoredAny = false;
  let unrecoverableAny = false;
  const restoredA1s = []; 

  names.forEach((name, i) => {
    const raw = values[i][0];
    if (raw === "" || raw === null || raw === undefined) {
      const prevPos = prevPositions[name];
      if (prevPos) {
        values[i][0] = columnToLetter(prevPos.col) + prevPos.row;
        restoredAny = true;
        restoredA1s.push(rowColToA1(homeTable.startRow + i, homeTable.startCol)); // + added
      } else {
        unrecoverableAny = true;
      }
    }
  });

  if (restoredAny) {
    range.setValues(values);

    const rangeList = sheet.getRangeList(restoredA1s);
    rangeList.setBackground(COLORS.INPUT);
    rangeList.setFontColor(FONT_COLORS.INPUT);
    rangeList.setBorder(true, true, true, true, true, true);

    resetAnchorCaches();
  }

  return { restoredAny, unrecoverableAny };
}

const RESTORE_ANCHOR_LABEL_CONFIG = {
  "Tickets":     TICKETSANCHORS,
  "Threads":     THREADSANCHORS,
  "Crates":      CRATESANCHORS,
  "The Library": LIBRARYANCHORS,
};

function writeAnchorLabels(sheetName, skipFlush) {
  const anchors = RESTORE_ANCHOR_LABEL_CONFIG[sheetName];
  if (!anchors) return;
  const sheet = getASheet(sheetName);
  const edits = Object.values(anchors).map(def => {
    const a = resolve(def);
    return {
      row: a.startRow,
      col: a.startCol,
      value: a.value,
      color: a.color,
      border: a.border
    };
  });
  applyEdits(sheet, edits, skipFlush);
}

function reseedAnchorPositions(groupName) {
  const group = ANCHOR_GROUPS[groupName];
  if (!group) return;
  const { errors, positions } = validateAnchorGroupFormat(group);
  if (errors.length === 0) {
    setAnchorGroupPositions(groupName, positions);
  }
}



function applyEdits(sheet, edits, skipFlush) {
  if (edits.length === 0) return;

  const valuesByRow = {};

  edits.forEach(cell => {
    (valuesByRow[cell.row] || (valuesByRow[cell.row] = [])).push(cell);
  });

  Object.values(valuesByRow).forEach(cells => {
    cells.sort((a, b) => a.col - b.col);

    const groups = [];
    let group = [cells[0]];

    for (let i = 1; i < cells.length; i++) {
      if (cells[i].col === cells[i - 1].col + 1) {
        group.push(cells[i]);
      } else {
        groups.push(group);
        group = [cells[i]];
      }
    }

    groups.push(group);

    groups.forEach(g => {
      sheet
        .getRange(g[0].row, g[0].col, 1, g.length)
        .setValues([g.map(c => c.value)]);
    });
  });

  // Batch colors
  const colorGroups = {};

  edits.forEach(cell => {
    if (cell.color) {
      if (!colorGroups[cell.color]) colorGroups[cell.color] = [];
      colorGroups[cell.color].push(rowColToA1(cell.row, cell.col));
    }
  });

  Object.entries(colorGroups).forEach(([color, a1List]) => {
    sheet.getRangeList(a1List).setBackground(color);
  });

  // Batch font colors
  const fontColorGroups = {};

  edits.forEach(cell => {
    if (cell.fontColor) {
      if (!fontColorGroups[cell.fontColor]) fontColorGroups[cell.fontColor] = [];
      fontColorGroups[cell.fontColor].push(rowColToA1(cell.row, cell.col));
    }
  });

  Object.entries(fontColorGroups).forEach(([fontColor, a1List]) => {
    sheet.getRangeList(a1List).setFontColor(fontColor);
  });

  // Batch borders
  const borderA1s = edits
    .filter(cell => cell.border)
    .map(cell => rowColToA1(cell.row, cell.col));

  if (borderA1s.length > 0) {
    sheet
      .getRangeList(borderA1s)
      .setBorder(true, true, true, true, true, true);
  }

  // Batch data validations
  const checkboxA1s = [];
  const dropdownGroups = {};

  edits.forEach(cell => {
    if (!cell.validation) return;

    const a1 = rowColToA1(cell.row, cell.col);

    if (cell.validation.kind === "CHECKBOX") {
      checkboxA1s.push(a1);
    } else if (cell.validation.kind === "DROPDOWN") {
      const key = JSON.stringify(cell.validation.options);
      (dropdownGroups[key] || (dropdownGroups[key] = [])).push(a1);
    }
  });

  if (checkboxA1s.length > 0) {
    sheet.getRangeList(checkboxA1s).insertCheckboxes();
  }

  Object.entries(dropdownGroups).forEach(([optionsJson, a1s]) => {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(JSON.parse(optionsJson), true)
      .setAllowInvalid(false)
      .build();

    sheet.getRangeList(a1s)
      .getRanges()
      .forEach(r => r.setDataValidation(rule));
  });

  if (!skipFlush) {
    SpreadsheetApp.flush();
  }
}

function clearAnchorGroupStalePositions(groupName, group, defaultPositions) {
  return profWrap("clearAnchorGroupStalePositions", () => {
    const sheet = getASheet(group.targetSheet);
    const prevPositions = getPreviousAnchorPositions()[groupName] || {};

    Object.keys(group.offsets).forEach(name => {
      const oldPos = prevPositions[name];
      const newPos = defaultPositions[name];
      if (!oldPos) return;

      if (newPos && oldPos.row === newPos.row && oldPos.col === newPos.col) return;

      const anchorDef = resolve(group.anchors[name + "_ANCHOR"]); 
      const numRows   = getEffectiveAnchorNumRows(groupName, name, anchorDef.numRows);

      clearRect(sheet, oldPos.row, oldPos.col, numRows, anchorDef.numCols);
    });
  });
}


function restoreAnchorGroupPositions(groupName) {
  const tableDef = HOMETABLES[groupName.toUpperCase() + "_ANCHOR"];
  const group     = ANCHOR_GROUPS[groupName];
  if (!tableDef || !group) return;

  const table = resolve(tableDef);
  const sheet = getASheet(table.sheet); 

  const defaultPositions = getDefaultAnchorPositions(groupName);

  clearAnchorGroupStalePositions(groupName, group, defaultPositions);

  const range = sheet.getRange(table.startRow, table.startCol, table.numRows, 1);
  range.setValues(table.values);

  range.setBackground(COLORS.INPUT);
  range.setFontColor(FONT_COLORS.INPUT);
  range.setBorder(true, true, true, true, true, true);

  resetAnchorCaches();
  reseedAnchorPositions(groupName);
  invalidateRestorableDefsCache(group.targetSheet);
}


const RESTORE_BLANK_EXCLUDED_TABLES = {
  "Home": new Set(["TICKETS_ANCHOR", "THREADS_ANCHOR", "CRATES_ANCHOR", "LIBRARY_ANCHOR"]),
};


const RESTORE_BLANK_DYNAMIC_ROWS = {
  "Tickets|SINNERS_TABLE_INPUT": getPreviousRowCount,
  "Threads|SINNERS_TABLE_INPUT": getPreviousThreadsRowCount,
  "Crates|SINNERS_TABLE_INPUT":  getPreviousCratesRowCount,
  "Tickets|SINNERS_TABLE_NUMBER": getPreviousRowCount,
  "Threads|SINNERS_TABLE_NUMBER": getPreviousThreadsRowCount,
  "Crates|SINNERS_TABLE_NUMBER":  getPreviousCratesRowCount,
  "Tickets|SINNERS_TABLE_OUTPUT": getPreviousRowCount,
  "Crates|SINNERS_TABLE_OUTPUT":  getPreviousCratesRowCount,
  "Threads|SINNERS_TABLE_OUTPUT": getPreviousThreadsRowCount,
  "Tickets|SINNERS_DISTRIBUTION": getPreviousRowCount,   
};

const RESTORE_BLANK_SEQUENTIAL_NUMBER = new Set([
  "Tickets|SINNERS_TABLE_NUMBER",
  "Threads|SINNERS_TABLE_NUMBER",
  "Crates|SINNERS_TABLE_NUMBER",
]);

let _restorableDefsCache = {};
let _coloredCellsCache = null;

function invalidateRestorableDefsCache(sheetName) {
  if (sheetName) {
    delete _restorableDefsCache[sheetName];
  } else {
    _restorableDefsCache = {}; 
  }
  _coloredCellsCache = null; 
}

function collectRestorableDefaults(sheetName) {
  if (_restorableDefsCache[sheetName]) return _restorableDefsCache[sheetName];

  const config = SHEET_CONFIG[sheetName];
  const list = [];

  const isRestorable = (resolved) => {
    const kind = resolved.regionType || resolved.type;
    return kind === "LABEL" || kind === "INPUT" ||
          kind === "CONSTANT" || kind === "OUTPUT";
  };

  if (config) {
    const excluded = RESTORE_BLANK_EXCLUDED_TABLES[sheetName] || new Set();

    Object.values(config.cells || {}).forEach(def => {
      const resolved = resolve(def);
      expandDefToCells(resolved).forEach(c => {
        if (!isRestorable(resolved)) return;
        list.push({
          row: c.row, col: c.col, value: c.value,  color: c.color, border: c.border, fontColor: c.fontColor,
          validation: c.validation, regionType: resolved.regionType,
        });
      });
    });

    Object.entries(config.tables || {}).forEach(([tableName, def]) => {
      if (excluded.has(tableName)) return;

      const resolved = resolve(def);
      const key = sheetName + "|" + tableName;  
      const rowGetter = RESTORE_BLANK_DYNAMIC_ROWS[key];
      const isSequential = RESTORE_BLANK_SEQUENTIAL_NUMBER.has(key); 

      if (rowGetter) {
        const repeatRows = rowGetter();
        const templateValues = resolved.values;

        for (let r = 0; r < repeatRows; r++) {
          const templateRow = templateValues[Math.min(r, templateValues.length - 1)];

          for (let c = 0; c < templateRow.length; c++) {
            if (!isRestorable(resolved)) continue;

            const override      = resolveColorOverride(resolved, r, c, templateRow);
            const cellColor     = override ? override.color     : resolved.color;
            const cellFontColor = override ? override.fontColor : resolved.fontColor;
            const validation    = resolveValidationOverride(resolved, r, c);
            const content        = isSequential ? r + 1 : templateRow[c];

            list.push({
              row: resolved.startRow + r,
              col: resolved.startCol + c,
              value:   content,
              color: cellColor,
              border: resolved.border || false,
              fontColor: cellFontColor,
              validation,
              regionType: resolved.regionType,
            });
          }
        }
      } else {
        expandDefToCells(resolved).forEach(c => {
          if (!isRestorable(resolved)) return;
          list.push({
            row: c.row, col: c.col, value: c.value, color: c.color, border: c.border, fontColor: c.fontColor,
            validation: c.validation, regionType: resolved.regionType,
          });
        });
      }
    });

    collectBlockLabelCells(config.blocks).forEach(def => {
      expandDefToCells(def).forEach(c => {
        list.push({
          row: c.row, col: c.col, value: c.value, color: c.color, border: c.border, fontColor: c.fontColor, validation: c.validation, regionType: def.regionType,
        });
      });
    });
  }

  const anchors = RESTORE_ANCHOR_LABEL_CONFIG[sheetName];
  if (anchors) {
    Object.values(anchors).forEach(def => {
      const a = resolve(def);
      if (a.color !== COLORS.ANCHOR) return;
      list.push({ row: a.startRow, col: a.startCol, value: a.value, color: a.color, border: a.border, regionType: "ANCHOR" });
    });
  }

  _restorableDefsCache[sheetName] = list;
  return list;
}


const ENFORCED_STATIC_TYPES = new Set(["CONSTANT", "LABEL", "ANCHOR"]);

function enforceStaticCells(sheet, range, skipFlush) {
  const sheetName = sheet.getName();
  const defs = collectRestorableDefaults(sheetName);
  if (defs.length === 0) return false;

  const candidates = defs.filter(d => ENFORCED_STATIC_TYPES.has(d.regionType));
  if (candidates.length === 0) return false;

  const editRow1 = range.getRow();
  const editRow2 = editRow1 + range.getNumRows() - 1;
  const editCol1 = range.getColumn();
  const editCol2 = editCol1 + range.getNumColumns() - 1;

  const inRange = candidates.filter(d =>
    d.row >= editRow1 && d.row <= editRow2 &&
    d.col >= editCol1 && d.col <= editCol2
  );
  if (inRange.length === 0) return false;

  const minRow = Math.min(...inRange.map(d => d.row));
  const maxRow = Math.max(...inRange.map(d => d.row));
  const minCol = Math.min(...inRange.map(d => d.col));
  const maxCol = Math.max(...inRange.map(d => d.col));

  const liveValues   = sheet.getRange(minRow, minCol, maxRow - minRow + 1, maxCol - minCol + 1).getValues();
  const toRestore = inRange.filter(d => {
    const liveVal = liveValues[d.row - minRow][d.col - minCol];
    return liveVal !== d.value;
  });
  if (toRestore.length === 0) return false;

  applyEdits(sheet, toRestore, skipFlush);
  return true;
}

function restoreBlankInputCells(sheet, range) {
  
  const sheetName = sheet.getName();
  const defs = collectRestorableDefaults(sheetName);
  if (defs.length === 0) return false;

  const editRow1 = range.getRow();
  const editRow2 = editRow1 + range.getNumRows() - 1;
  const editCol1 = range.getColumn();
  const editCol2 = editCol1 + range.getNumColumns() - 1;

  const inRange = defs.filter(d =>
    d.row >= editRow1 && d.row <= editRow2 &&
    d.col >= editCol1 && d.col <= editCol2
  );
  if (inRange.length === 0) return false;

  // ===== One bounding-box read instead of one getValue() per candidate cell =====
  const minRow = Math.min(...inRange.map(d => d.row));
  const maxRow = Math.max(...inRange.map(d => d.row));
  const minCol = Math.min(...inRange.map(d => d.col));
  const maxCol = Math.max(...inRange.map(d => d.col));

  const liveValues = sheet
    .getRange(minRow, minCol, maxRow - minRow + 1, maxCol - minCol + 1)
    .getValues();

  const toRestore = inRange.filter(d => {
    const v = liveValues[d.row - minRow][d.col - minCol];
    return v === "" || v === null; 
  });
  if (toRestore.length === 0) return false;
  
  const valuesByRow = {};

  toRestore.forEach(d => {
      (valuesByRow[d.row] || (valuesByRow[d.row] = [])).push(d);
  });

  const writeContiguous = (byRow) => {
    Object.values(byRow).forEach(cells => {
      cells.sort((a, b) => a.col - b.col);
      const groups = [];
      let group = [cells[0]];
      for (let i = 1; i < cells.length; i++) {
        if (cells[i].col === cells[i - 1].col + 1) group.push(cells[i]);
        else { groups.push(group); group = [cells[i]]; }
      }
      groups.push(group);

      groups.forEach(g => {
        const target = sheet.getRange(g[0].row, g[0].col, 1, g.length);
        target.setValues([g.map(c => c.value)]);
      });
    });
  };

  writeContiguous(valuesByRow);

  // ===== Background / font / border / validation — grouped via getRangeList =====
  const colorGroups     = {};
  const fontColorGroups = {};
  const borderA1s       = [];
  const checkboxA1s     = [];
  const dropdownGroups  = {};

  toRestore.forEach(d => {
    const a1 = rowColToA1(d.row, d.col);
    if (d.color)     (colorGroups[d.color] || (colorGroups[d.color] = [])).push(a1);
    if (d.fontColor) (fontColorGroups[d.fontColor] || (fontColorGroups[d.fontColor] = [])).push(a1);
    if (d.border)    borderA1s.push(a1);

    if (d.validation) {
      if (d.validation.kind === "CHECKBOX") {
        checkboxA1s.push(a1);
      } else if (d.validation.kind === "DROPDOWN") {
        const key = JSON.stringify(d.validation.options);
        (dropdownGroups[key] || (dropdownGroups[key] = [])).push(a1);
      }
    }
  });

  Object.entries(colorGroups).forEach(([color, a1s]) => sheet.getRangeList(a1s).setBackground(color));
  Object.entries(fontColorGroups).forEach(([fc, a1s]) => sheet.getRangeList(a1s).setFontColor(fc));
  if (borderA1s.length > 0) {
    sheet.getRangeList(borderA1s).setBorder(true, true, true, true, true, true);
  }

  if (checkboxA1s.length > 0) {
    sheet.getRangeList(checkboxA1s).insertCheckboxes();
  }
  Object.entries(dropdownGroups).forEach(([optionsJson, a1s]) => {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(JSON.parse(optionsJson), true)
      .setAllowInvalid(false)
      .build();
    sheet.getRangeList(a1s).getRanges().forEach(r => r.setDataValidation(rule));
  });

  return true;
}

const ticketsOutput = resolve(HOMETABLES.TICKETS_OUTPUT);
const threadsOutput = resolve(HOMETABLES.THREADS_OUTPUT);
const cratesOutput  = resolve(HOMETABLES.CRATES_OUTPUT);
const libraryOutput = resolve(HOMETABLES.LIBRARY_OUTPUT);

const ANCHOR_GROUPS = {
  Tickets: {
    homeTable:   resolve(HOMETABLES.TICKETS_ANCHOR),
    offsets:     TICKETS_ANCHOR_OFFSETS,
    anchors:     TICKETSANCHORS,
    targetSheet: "Tickets",
    checker:     { sheet: ticketsOutput.sheet, row: ticketsOutput.startRow,     col: ticketsOutput.startCol },
    change:      resolve(HOMEDEFAULTS.TICKETS_ANCHOR_CHANGE_CHECKBOX),
    status:      { sheet: ticketsOutput.sheet, row: ticketsOutput.startRow + 1, col: ticketsOutput.startCol },
  },
  Threads: {
    homeTable:   resolve(HOMETABLES.THREADS_ANCHOR),
    offsets:     THREADS_ANCHOR_OFFSETS,
    anchors:     THREADSANCHORS,
    targetSheet: "Threads",
    checker:     { sheet: threadsOutput.sheet, row: threadsOutput.startRow,     col: threadsOutput.startCol },
    change:      resolve(HOMEDEFAULTS.THREADS_ANCHOR_CHANGE_CHECKBOX),
    status:      { sheet: threadsOutput.sheet, row: threadsOutput.startRow + 1, col: threadsOutput.startCol },
  },
  Crates: {
    homeTable:   resolve(HOMETABLES.CRATES_ANCHOR),
    offsets:     CRATES_ANCHOR_OFFSETS,
    anchors:     CRATESANCHORS,
    targetSheet: "Crates",
    checker:     { sheet: cratesOutput.sheet, row: cratesOutput.startRow,     col: cratesOutput.startCol },
    change:      resolve(HOMEDEFAULTS.CRATES_ANCHOR_CHANGE_CHECKBOX),
    status:      { sheet: cratesOutput.sheet, row: cratesOutput.startRow + 1, col: cratesOutput.startCol },
  },
  Library: {
    homeTable:   resolve(HOMETABLES.LIBRARY_ANCHOR),
    offsets:     LIBRARY_ANCHOR_OFFSETS,
    anchors:     LIBRARYANCHORS,
    targetSheet: "The Library",
    checker:     { sheet: libraryOutput.sheet, row: libraryOutput.startRow,     col: libraryOutput.startCol },
    change:      resolve(HOMEDEFAULTS.LIBRARY_ANCHOR_CHANGE_CHECKBOX),
    status:      { sheet: libraryOutput.sheet, row: libraryOutput.startRow + 1, col: libraryOutput.startCol },
  },
};


const GROWABLE_ANCHOR_NAMES = {
  Tickets: ["SINNERS_TABLE", "SINNERS_DISTRIBUTION"],
  Threads: ["SINNERS_TABLE"],
  Crates:  ["SINNERS_TABLE"],
  Library: [],
};

function detectAnchorGrowthViolations(groupName, group, positions) {
  return profWrap("detectAnchorGrowthViolations", () => {
    const growableNames = GROWABLE_ANCHOR_NAMES[groupName] || [];
    if (growableNames.length === 0) return [];

    const names = Object.keys(group.offsets).sort((a, b) => group.offsets[a] - group.offsets[b]);

    const rects = {};
    names.forEach((name, i) => {
      const anchorDef = resolve(group.anchors[name + "_ANCHOR"]);
      const pos = positions[name];
      rects[name] = {
        index: i + 1,
        row: pos.row,
        c1: pos.col,
        c2: pos.col + anchorDef.numCols - 1,
      };
    });

    const violations = [];

    growableNames.forEach(growName => {
      const g = rects[growName];
      if (!g) return;

      names.forEach(otherName => {
        if (otherName === growName) return;
        const o = rects[otherName];

        const colsOverlap = g.c1 <= o.c2 && g.c2 >= o.c1;
        const isBelow      = o.row > g.row;

        if (colsOverlap && isBelow) {
          violations.push({ growIndex: g.index, blockedIndex: o.index });
        }
      });
    });

    return violations;
  });
}

function formatGrowthViolationMessage(violations) {
  const parts = violations.map(
    v => `Table ${v.blockedIndex} sits below growable Table ${v.growIndex}.`
  );
  return parts.join("; ");
}

function validateAnchorGroupFormat(group) {
  const homeTable = resolve(group.homeTable);
  const values = getASheet(homeTable.sheet)
    .getRange(homeTable.startRow, homeTable.startCol, homeTable.numRows, 1)
    .getValues();

  const names = Object.keys(group.offsets).sort((a, b) => group.offsets[a] - group.offsets[b]);

  const errors = [];
  const positions = {};

  names.forEach((name, i) => {
    const raw = values[i][0];
    try {
      positions[name] = parseA1(raw);
    } catch (err) {
      errors.push(`${name}: invalid "${raw}"`);
    }
  });

  return { errors, positions };
}

function detectAnchorChanges(groupName, positions) {
  const prev = getPreviousAnchorPositions()[groupName] || {};
  const changed = {};

  Object.entries(positions).forEach(([name, pos]) => {
    const old = prev[name];
    if (!old || old.row !== pos.row || old.col !== pos.col) {
      changed[name] = pos;
    }
  });

  return changed;
}



function detectAnchorCollisions(group, positions, groupName) {
  return profWrap("detectAnchorCollisions", () => {
  const names = Object.keys(group.offsets).sort((a, b) => group.offsets[a] - group.offsets[b]);

  const rects = names.map((name, i) => {
    const anchorDef = resolve(group.anchors[name + "_ANCHOR"]);
    const pos = positions[name];
    const numRows = getEffectiveAnchorNumRows(groupName, name, anchorDef.numRows);
    return {
      index: i + 1,
      r1: pos.row,
      c1: pos.col,
      r2: pos.row + numRows - 1,
      c2: pos.col + anchorDef.numCols - 1,
    };
  });

  const colliding = new Set();
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      const overlap = a.r1 <= b.r2 && a.r2 >= b.r1 && a.c1 <= b.c2 && a.c2 >= b.c1;
      if (overlap) { colliding.add(a.index); colliding.add(b.index); }
    }
  }
  return Array.from(colliding).sort((a, b) => a - b);
  });
}

function formatCollisionMessage(indices) {
  if (indices.length === 1) return `Table ${indices[0]} is intersecting!`;
  if (indices.length === 2) return `Tables ${indices[0]} and ${indices[1]} are intersecting!`;
  const last = indices[indices.length - 1];
  const rest = indices.slice(0, -1).join(", ");
  return `Tables ${rest}, and ${last} are intersecting!`;
}



function executeAnchorGroupMove(groupName, group, changed) {
  profWrap("executeAnchorGroupMove", () => {
  const sheet = getASheet(group.targetSheet);
  const prevPositions = getPreviousAnchorPositions()[groupName] || {};

  const moves = Object.keys(changed)
    .map(name => {
      const anchorDef = resolve(group.anchors[name + "_ANCHOR"]);
      const numRows = getEffectiveAnchorNumRows(groupName, name, anchorDef.numRows);
      return {
        name,
        oldPos: prevPositions[name],
        newPos: changed[name],
        numRows,
        numCols: anchorDef.numCols,
      };
    })
    .filter(m => m.oldPos);

  moves.forEach(m => { m.snapshot = snapshotRect(sheet, m.oldPos.row, m.oldPos.col, m.numRows, m.numCols); });
  moves.forEach(m => { clearRect(sheet, m.oldPos.row, m.oldPos.col, m.numRows, m.numCols); });
  moves.forEach(m => { restoreRect(sheet, m.newPos.row, m.newPos.col, m.numRows, m.numCols, m.snapshot); });

  invalidateRestorableDefsCache(group.targetSheet);
  });
}


function snapshotRect(sheet, row, col, numRows, numCols) {
  return profWrap("snapshotRect", () => {
    const range = sheet.getRange(row, col, numRows, numCols);
    return {
      values:      range.getValues(),
      backgrounds: range.getBackgrounds(),
      fontColors:  range.getFontColors(),
      validations: range.getDataValidations(),
    };
  });
}

function clearRect(sheet, row, col, numRows, numCols) {
  profWrap("clearRect", () => {
    const range = sheet.getRange(row, col, numRows, numCols);
    range.clearContent();
    range.clearDataValidations();
    range.setBackground(null);
    range.setFontColor(null);
    range.setBorder(false, false, false, false, false, false);
  });
}

function restoreRect(sheet, row, col, numRows, numCols, snapshot) {
  profWrap("restoreRect", () => {
    const range = sheet.getRange(row, col, numRows, numCols);
    range.setValues(snapshot.values);
    range.setBackgrounds(snapshot.backgrounds);
    range.setDataValidations(snapshot.validations);
    range.setFontColors(snapshot.fontColors);
    range.setBorder(true, true, true, true, true, true);
  });
}
