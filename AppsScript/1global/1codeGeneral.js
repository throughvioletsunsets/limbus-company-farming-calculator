// `global/1codeGeneral.gs


function validateClearSkipSetting(settingsTable, checkerTable) {
  const value = getTableValues(settingsTable)[0][0];

  if (!["Clear", "Skip"].includes(value)) {
    setTableValues(checkerTable, [["Error: Invalid Value"]]);
    return { mode: "Error" };
  }

  setTableValues(checkerTable, [[`${value} Selected`]]);
  return { mode: "OK", type: value };
}

function processAndValidateCell(rawValue, fallback, minLimit, maxLimit) {
  const val = rawValue === "" ? fallback : Number(rawValue);
  if (!Number.isInteger(val)) return "Error: Invalid Input";
  if (val < minLimit)         return "Error: Values Too Low";
  if (maxLimit !== undefined && val > maxLimit) return `Error: Max ${maxLimit} Rows`;
  return val;
}

function validateMinutesSecondsTable(table) {
  const raw = getTableValues(table);
  const rawMinutes = raw[0][0];
  const rawSeconds = raw[0][1];

  const minutesValue = processAndValidateCell(rawMinutes, 0, 0);
  const secondsMin   = (typeof minutesValue === "number" && minutesValue >= 1) ? 0 : 1;
  const secondsValue = processAndValidateCell(rawSeconds, 1, secondsMin);

  if (typeof minutesValue === "string" || typeof secondsValue === "string") {
    return { error: true, minutesValue, secondsValue };
  }

  const totalSeconds = minutesValue * 60 + secondsValue;

  if (totalSeconds < 4) {
    return { error: true, minutesValue, secondsValue, totalTooLow: true };
  }

  
  if (totalSeconds > MAX_CLEAR_SECONDS) {
    return { error: true, minutesValue, secondsValue, totalTooHigh: true };
  }

  return { error: false, minutesValue, secondsValue, totalSeconds };
}

function recalculateMinutesSecondsChecker(table, checkerTable) {
  const result = validateMinutesSecondsTable(table);

  const minutesChecker = typeof result.minutesValue === "string" ? result.minutesValue : "Error Checker";
  const secondsChecker = typeof result.secondsValue === "string"
    ? result.secondsValue
    : result.totalTooLow  ? "Error: Values Too Low"
    : result.totalTooHigh ? "Error: Values Too High"
    : "Error Checker";

  setTableValues(checkerTable, [[minutesChecker, secondsChecker]]); 
  return result;
}



// ============================================================
// DELETE ROWS GROUP REGISTRY — one entry per sheet that has a dynamic sinner table. Mirrors ANCHOR_GROUPS' shape/intent.
// ============================================================
const DELETE_ROWS_GROUPS = {
  Tickets: {
    table:          () => resolve(TICKETSTABLES.DELETE_ROWS_TABLE_INPUT),
    checkerTable:   () => resolve(TICKETSTABLES.DELETE_ROWS_TABLE_OUTPUT),
    getRowCount:    getPreviousRowCount,
    setRowCount: setPreviousRowCount,
    driverCell:     () => resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP),
    sinnerTable:    () => resolve(TICKETSTABLES.SINNERS_TABLE_INPUT),
    nameOffset:     TICKETS_SINNER_INPUT.NAME,
    upgradeHandler: (sheet) => handleIdentityLevelUp(null, sheet, true),
    postRecalc: (sheet) => {
      recalculateSumXP(sheet);
      const s = validateSettings(sheet);
      recalculateTotalRuns(sheet, s);
      recalculateExpectedTimeModule(sheet, s);
      recalculateTicketDistribution(sheet, s);
    },
  },

  Threads: {
    table:          () => resolve(THREADSTABLES.DELETE_ROWS_TABLE_INPUT),
    checkerTable:   () => resolve(THREADSTABLES.DELETE_ROWS_TABLE_OUTPUT),
    getRowCount:    getPreviousThreadsRowCount,
    setRowCount: setPreviousThreadsRowCount,
    driverCell:     () => resolve(THREADSDEFAULTS.TOTAL_UPGRADE),
    sinnerTable:    () => resolve(THREADSTABLES.SINNERS_TABLE_INPUT),
    nameOffset:     THREADS_SINNER_INPUT.NAME,
    upgradeHandler: (sheet) => handleThreadsUpgrade(null, sheet, true),
    postRecalc: (sheet) => {
      const s = validateThreadsSettings(sheet);
      recalculateTotalThreadsRuns(sheet, s);
      recalculateThreadsExpectedTime(sheet, s);
    },
  },

  Crates: {
    table:          () => resolve(CRATESTABLES.DELETE_ROWS_TABLE_INPUT),
    checkerTable:   () => resolve(CRATESTABLES.DELETE_ROWS_TABLE_OUTPUT),
    getRowCount:    getPreviousCratesRowCount,
    setRowCount: setPreviousCratesRowCount,
    driverCell:     () => resolve(CRATESDEFAULTS.TOTAL_UPGRADE),
    sinnerTable:    () => resolve(CRATESTABLES.SINNERS_TABLE_INPUT),
    nameOffset:     CRATES_SINNER_INPUT.NAME,
    upgradeHandler: (sheet) => handleShardsUpgrade(null, sheet, true),
    postRecalc: (sheet) => {
      const s = validateCratesSettings(sheet);
      recalculateTotalCratesRuns(sheet, s);
      recalculateCratesReq(sheet);
      recalculateWeeklyMDRuns(sheet);
    },
  },
};

function validateRowNumber(raw, rowCount) {
  if (raw === "" || raw === null || raw === undefined) return "Error: Invalid Input";
  const val = Number(raw);
  if (!Number.isInteger(val)) return "Error: Invalid Input";
  if (val < 1)                return "Error: Values Too Low";
  if (val > rowCount)         return "Error: Row Does Not Exist";
  return val;
}

function validateDeleteRowsGroup(group, sheet, table) {
  reconcileGroupRowCount(group, sheet);
  const rowCount = group.getRowCount();
  const raw = sheet.getRange(table.startRow, table.startCol, 1, 3).getValues()[0];
  const type = raw[DELETE_ROWS_OFFSETS.TYPE];

  if (!DELETE_ROWS_TYPES.includes(type)) {
    return {
      valid: false,
      checker: "Error: Invalid Input",
      message: "Error: Fix the delete type."
    };
  }

  const fromResult = validateRowNumber(raw[DELETE_ROWS_OFFSETS.FROM_ROW], rowCount);
  const toResult   = validateRowNumber(raw[DELETE_ROWS_OFFSETS.TO_ROW],   rowCount);

  const fromError = typeof fromResult === "string" ? fromResult : null;
  const toError   = typeof toResult   === "string" ? toResult   : null;

  if (fromError || toError) {
    return {
      valid: false,
      checker: [fromError, toError].filter(Boolean).join("; "),
      message: "Error: Fix the row numbers."
    };
  }

  if (type === "Bulk Rows" && fromResult >= toResult) {
    return {
      valid: false,
      checker: "Error: From Row >= To Row",
      message: "Error: Fix the row range."
    };
  }

  return { valid: true, type, fromRow: fromResult, toRow: toResult };
}


function applyDeleteRows(sheet, group, fromRow, toRow) {
  return profWrap("applyDeleteRows", () => {
    const rowCount    = group.getRowCount();
    const deleteCount = toRow - fromRow + 1;
    const newCount    = rowCount - deleteCount;

    const sinnerTable = group.sinnerTable();
    const numberCol   = sinnerTable.startCol - 1;

    if (newCount <= 0) {
      // Deleted every row — restore row 1 to its default input values.
      sheet.getRange(sinnerTable.startRow, sinnerTable.startCol, 1, sinnerTable.numCols)
        .setValues([sinnerTable.values[0]]);
      sheet.getRange(sinnerTable.startRow, numberCol, 1, 1).setValue(1);
      setACellValue(group.driverCell(), 1);

    } else {
      const allRows = sheet.getRange(
        sinnerTable.startRow, sinnerTable.startCol, rowCount, sinnerTable.numCols
      ).getValues();

      const keptRows = allRows.filter((_, idx) => {
        const rowNum = idx + 1;
        return rowNum < fromRow || rowNum > toRow;
      });

      sheet.getRange(sinnerTable.startRow, sinnerTable.startCol, keptRows.length, sinnerTable.numCols)
        .setValues(keptRows);

      const numbers = keptRows.map((_, i) => [i + 1]);
      sheet.getRange(sinnerTable.startRow, numberCol, keptRows.length, 1).setValues(numbers);

      setACellValue(group.driverCell(), newCount);
    }

    group.upgradeHandler(sheet);
    group.postRecalc(sheet);   
  });
}

function reconcileGroupRowCount(group, sheet) {
  const inputTable = group.sinnerTable();
  const scanned = countPopulatedSinnerRows(sheet, inputTable, group.nameOffset);
  if (scanned !== group.getRowCount()) {
    group.setRowCount(scanned);
  }
}

function handleDeleteRowsEdit(e, sheet) {
  const group = DELETE_ROWS_GROUPS[sheet.getName()];
  if (!group) return;
  
  reconcileGroupRowCount(group, sheet);

  const table   = group.table();
  const checker = group.checkerTable();

  const typeCell    = { row: table.startRow, col: table.startCol + DELETE_ROWS_OFFSETS.TYPE };
  const fromCell    = { row: table.startRow, col: table.startCol + DELETE_ROWS_OFFSETS.FROM_ROW };
  const toCell      = { row: table.startRow, col: table.startCol + DELETE_ROWS_OFFSETS.TO_ROW };
  const changeCell  = { row: table.startRow, col: table.startCol + DELETE_ROWS_OFFSETS.CHANGE };
  const checkerCell = { row: checker.startRow, col: checker.startCol };
  const messageCell = { row: checker.startRow, col: checker.startCol + 1 };

  const editRow1 = e.range.getRow();
  const editCol1 = e.range.getColumn();
  const editCol2 = editCol1 + e.range.getNumColumns() - 1;

  const inRange =
    editRow1 === table.startRow &&
    editCol1 <= toCell.col && editCol2 >= typeCell.col;

  const editedChange = editRow1 === changeCell.row && editCol1 === changeCell.col;

  if (!inRange && !editedChange) return;

  // Live sync only — Single Row keeps TO_ROW mirrored to FROM_ROW as you type.
  if (inRange) {
    const type = sheet.getRange(typeCell.row, typeCell.col).getValue();
    if (type === "Single Row") {
      const fromVal = sheet.getRange(fromCell.row, fromCell.col).getValue();
      const toVal   = sheet.getRange(toCell.row, toCell.col).getValue();
      if (toVal !== fromVal) {
        sheet.getRange(toCell.row, toCell.col).setValue(fromVal);
      }
    }
  }

  if (!editedChange) return;

  const result = validateDeleteRowsGroup(group, sheet, table);

  if (!result.valid) {
    sheet.getRange(checkerCell.row, checkerCell.col).setValue(result.checker);
    sheet.getRange(messageCell.row, messageCell.col).setValue(result.message);
    sheet.getRange(changeCell.row, changeCell.col).setValue(false);
    return;
  }

  sheet.getRange(checkerCell.row, checkerCell.col).setValue("Error Checker");
  sheet.getRange(messageCell.row, messageCell.col).setValue("Deleting rows...");
  SpreadsheetApp.flush();

  applyDeleteRows(sheet, group, result.fromRow, result.toRow);

  sheet.getRange(messageCell.row, messageCell.col).setValue("Changes have been applied!");
  sheet.getRange(changeCell.row, changeCell.col).setValue(false);
}





// ============================================================
// GENERIC SINNER-TABLE UPGRADE HANDLER — one engine for the
// read-driver-cell → validate → clear-stale-rows → write-template-
// rows → repaint → recalc flow shared by Tickets/Threads/Crates.
// Each sheet supplies a small config instead of its own copy.
// ============================================================
function runSinnerUpgrade(cfg, e, sheet, isForced) {
  return profWrap(cfg.profLabel, () => {
    if (sheet.getName() !== cfg.sheetName) return;

    const driverCell    = resolve(cfg.driverCell);
    const driverChecker = resolve(cfg.driverChecker);

    if (!isForced) {
      const editedCell = e.range;
      if (editedCell.getRow() !== driverCell.row || editedCell.getColumn() !== driverCell.col) return;
    }

    const liveValue = sheet.getRange(driverCell.row, driverCell.col).getValue();
    const numRows = parseInt(liveValue);
    if (isNaN(numRows) || numRows < 1) return;

    if (numRows > MAX_SINNER_ROWS) {
      setACellValue(driverChecker, `Error: Max ${MAX_SINNER_ROWS} Rows`);
      return;
    }

    const targetRows = numRows - 1;

    const inputTable = resolve(cfg.inputTable);

    const outSpec       = cfg.output();
    const outStartCol   = outSpec.type === "CELL" ? outSpec.col : outSpec.startCol;
    const outNumCols     = outSpec.type === "CELL" ? 1          : outSpec.numCols;
    const outDefaultRow = outSpec.type === "CELL" ? [outSpec.value] : outSpec.values[0];

    const startRow    = inputTable.startRow;      // static row 1
    const baseCol     = inputTable.startCol - 1;  // NUMBER column
    const dynStartRow = startRow + 1;
    const endCol      = outStartCol + outNumCols - 1;
    const totalCols   = endCol - baseCol + 1;

    const numberCol  = baseCol;
    const greenStart = inputTable.startCol;
    const greenWidth = inputTable.numCols;
    const redStart   = outStartCol;
    const redWidth   = outNumCols;

    // ===== Static row 1 output =====
    const staticOutputRange = sheet.getRange(startRow, outStartCol, 1, outNumCols);
    staticOutputRange.setValues([outDefaultRow]);
    staticOutputRange.setBackground(COLORS.OUTPUT);
    staticOutputRange.setBorder(true, true, true, true, true, true);
    staticOutputRange.setFontColor(FONT_COLORS.OUTPUT);

    const numberColor = resolve(cfg.numberColorCell).color;
    const numberFontColor = resolve(cfg.numberColorCell).fontColor;
    sheet.getRange(startRow, numberCol, 1, 1).setBackground(numberColor).setFontColor(numberFontColor);;

    // ===== Clear stale rows below the new row count =====
    const prevRows  = cfg.getRowCount();
    const clearRows = Math.max(prevRows - numRows, 0);
    const clearStartRow = numRows + dynStartRow - 1;

    if (clearRows > 0) {
      const clearRange = sheet.getRange(clearStartRow, baseCol, clearRows, totalCols);
      clearRange.clearContent();
      if (cfg.clearDataValidations) clearRange.clearDataValidations();
      clearRange.setBackground(null);
      clearRange.setBorder(false, false, false, false, false, false);
    }

    cfg.setRowCount(numRows);

    sheet.getRange(dynStartRow, baseCol, 1, totalCols)
      .setBorder(true, false, false, false, false, false);

    // ===== Dynamic rows (2..numRows) =====
    if (targetRows > 0) {
      const inputDefaults = cfg.inputDefaultRow(inputTable);

      const existingRows = Math.min(prevRows - 1, targetRows);
      const newRows      = targetRows - existingRows;

      if (cfg.clearDataValidations) {
        sheet.getRange(dynStartRow, baseCol, targetRows, totalCols).clearDataValidations();
      }

      if (newRows > 0) {
        const rowsData = [];
        for (let i = 0; i < newRows; i++) {
          rowsData.push([existingRows + i + 2, ...inputDefaults, ...outDefaultRow]);
        }
        const newRowStart = dynStartRow + existingRows;
        setTableValues(
          { sheet: sheet.getName(), startRow: newRowStart, startCol: baseCol, numRows: newRows, numCols: totalCols },
          rowsData
        );
      }

      sheet.getRange(dynStartRow, baseCol, targetRows, totalCols)
        .setBorder(true, true, true, true, true, true);
      sheet.getRange(dynStartRow, numberCol, targetRows, 1)
        .setBackground(numberColor).setFontColor(numberFontColor);
      sheet.getRange(dynStartRow, greenStart, targetRows, greenWidth)
        .setBackground(COLORS.INPUT).setFontColor(FONT_COLORS.INPUT);
      sheet.getRange(dynStartRow, redStart, targetRows, redWidth)
        .setBackground(COLORS.OUTPUT).setFontColor(FONT_COLORS.OUTPUT);
    }

    // ===== Dropdowns (Threads/Crates only) =====
    if (cfg.dropdowns) {
      cfg.dropdowns.forEach(({ offset, options }) => {
        setDropdownRange(sheet, startRow, numRows, baseCol + offset, options);
      });
    }

    // ===== Sheet-specific extras (Tickets' distribution table) =====
    if (cfg.afterCore) {
      cfg.afterCore({ sheet, startRow, numRows, prevRows, clearRows });
    }

    if (cfg.flushBeforeRecalc) SpreadsheetApp.flush();

    cfg.recalcBatch(sheet, startRow, numRows);
  });
}

// Tickets-only extra: the SINNERS_DISTRIBUTION table has no equivalent
// on Threads/Crates, so it stays as a named callback instead of forcing
// a generic "extra table" concept onto the other two configs.
function updateTicketsDistributionShape({ sheet, numRows, clearRows }) {
  const dist = resolve(TICKETSTABLES.SINNERS_DISTRIBUTION);
  const distTotalCols = dist.numCols;

  if (clearRows > 0) {
    const distClear = sheet.getRange(dist.startRow + numRows, dist.startCol, clearRows, distTotalCols);
    distClear.clearContent();
    distClear.setBackground(null);
    distClear.setBorder(false, false, false, false, false, false);
  }

  const staticOverride = resolveColorOverride(dist, 0, 0, dist.values[0]);
  const staticColor     = staticOverride ? staticOverride.color     : COLORS.OUTPUT;
  const staticFontColor = staticOverride && staticOverride.fontColor !== undefined
    ? staticOverride.fontColor
    : FONT_COLORS.OUTPUT;

  const staticDistRange = sheet.getRange(dist.startRow, dist.startCol, 1, 1);
  staticDistRange.setBackground(staticColor);
  staticDistRange.setFontColor(staticFontColor);
  staticDistRange.setBorder(true, true, true, true, true, true);

  if (distTotalCols > 1) {
    const staticDistRest = sheet.getRange(dist.startRow, dist.startCol + 1, 1, distTotalCols - 1);
    staticDistRest.setBackground(COLORS.OUTPUT);
    staticDistRest.setFontColor(FONT_COLORS.OUTPUT);
    staticDistRest.setBorder(true, true, true, true, true, true);
  }

  sheet.getRange(dist.startRow, dist.startCol, numRows, distTotalCols)
    .setBorder(true, true, true, true, true, true);

  if (numRows > 1) {
    sheet.getRange(dist.startRow + 1, dist.startCol, numRows - 1, distTotalCols)
      .setBackground(COLORS.OUTPUT)
      .setFontColor(FONT_COLORS.OUTPUT);
  }
}

const TICKETS_UPGRADE_CONFIG = {
  profLabel:            "handleIdentityLevelUp",
  sheetName:            "Tickets",
  driverCell:           TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP,
  driverChecker:        TICKETSDEFAULTS.TOTAL_IDENTITY_CHECKER,
  inputTable:           TICKETSTABLES.SINNERS_TABLE_INPUT,
  numberColorCell:      TICKETSTABLES.SINNERS_TABLE_NUMBER,
  output:               () => resolve(TICKETSTABLES.SINNERS_TABLE_OUTPUT),
  inputDefaultRow:      (inputTable) => inputTable.values[0],
  getRowCount:          getPreviousRowCount,
  setRowCount:          setPreviousRowCount,
  clearDataValidations: false,
  dropdowns:            null,
  afterCore:            updateTicketsDistributionShape,
  flushBeforeRecalc:    false,
  recalcBatch:          (sheet, startRow, numRows) => writeTicketsRowsBatch(sheet, startRow, numRows),
};

const THREADS_UPGRADE_CONFIG = {
  profLabel:            "handleThreadsUpgrade",
  sheetName:            "Threads",
  driverCell:           THREADSDEFAULTS.TOTAL_UPGRADE,
  driverChecker:        THREADSDEFAULTS.TOTAL_UPGRADE_CHECKER,
  inputTable:           THREADSTABLES.SINNERS_TABLE_INPUT,
  numberColorCell:      THREADSTABLES.SINNERS_TABLE_NUMBER,
  output:               () => resolve(THREADSTABLES.SINNERS_TABLE_OUTPUT),
  inputDefaultRow:      (inputTable) => inputTable.values[0],
  getRowCount:          getPreviousThreadsRowCount,
  setRowCount:          setPreviousThreadsRowCount,
  clearDataValidations: true,
  dropdowns: [
    { offset: THREADS_SINNER_INPUT.TYPE,      options: ["Identity", "E.G.O", "Facade", "BGM"] },
    { offset: THREADS_SINNER_INPUT.ID_RARITY, options: ["O", "OO", "OOO", "None"] },
    { offset: THREADS_SINNER_INPUT.ID_FROM,   options: ["I", "II", "III", "IV", "None"] },
    { offset: THREADS_SINNER_INPUT.ID_TO,     options: ["II", "III", "IV", "None"] },
    { offset: THREADS_SINNER_INPUT.EGO_GRADE, options: ["ZAYIN", "TETH", "HE", "WAW", "None"] },
    { offset: THREADS_SINNER_INPUT.EGO_FROM,  options: ["I", "II", "III", "IV", "V", "None"] },
    { offset: THREADS_SINNER_INPUT.EGO_TO,    options: ["II", "III", "IV", "V", "None"] },
  ],
  afterCore:            null,
  flushBeforeRecalc:    false,
  recalcBatch:          (sheet, startRow, numRows) => recalculateThreadsRowsBatch(sheet, startRow, numRows),
};

const CRATES_UPGRADE_CONFIG = {
  profLabel:            "handleShardsUpgrade",
  sheetName:            "Crates",
  driverCell:           CRATESDEFAULTS.TOTAL_UPGRADE,
  driverChecker:        CRATESDEFAULTS.TOTAL_UPGRADE_CHECKER,
  inputTable:           CRATESTABLES.SINNERS_TABLE_INPUT,
  numberColorCell:      CRATESTABLES.SINNERS_TABLE_NUMBER,
  output:               () => resolve(CRATESTABLES.SINNERS_TABLE_OUTPUT),
  inputDefaultRow:      (inputTable) => inputTable.values[0],
  getRowCount:          getPreviousCratesRowCount,
  setRowCount:          setPreviousCratesRowCount,
  clearDataValidations: true,
  dropdowns: [
    { offset: CRATES_SINNER_INPUT.SINNER,    options: ["Yi Sang", "Faust", "Don Quixote", "Ryoshu", "Meursault", "Hong Lu", "Heathcliff", "Ishmael", "Rodion", "Sinclair", "Outis", "Gregor"] },
    { offset: CRATES_SINNER_INPUT.TYPE,      options: ["Extract Identity", "Uptie Identity", "Extract E.G.O", "Threadspin E.G.O", "Unlock Facade"] },
    { offset: CRATES_SINNER_INPUT.ID_RARITY, options: ["O", "OO", "OOO", "None"] },
    { offset: CRATES_SINNER_INPUT.ID_FROM,   options: ["III", "None"] },
    { offset: CRATES_SINNER_INPUT.ID_TO,     options: ["IV", "None"] },
    { offset: CRATES_SINNER_INPUT.EGO_GRADE, options: ["ZAYIN", "TETH", "HE", "WAW", "None"] },
    { offset: CRATES_SINNER_INPUT.EGO_FROM,  options: ["III", "IV", "V", "None"] },
    { offset: CRATES_SINNER_INPUT.EGO_TO,    options: ["IV", "V", "None"] },
  ],
  afterCore:            null,
  flushBeforeRecalc:    false,
  recalcBatch:          (sheet, startRow, numRows) => recalculateCratesRowsBatch(sheet, startRow, numRows),
};

function dropdownsToValidations(dropdowns) {
  return dropdowns.map(d => ({ col: d.offset - 1, kind: "DROPDOWN", options: d.options }));
}

function recalcSinnerRowsBatch(cfg, sheet, startRow, numRows) {
  if (numRows <= 0) return;
  const inputValues  = sheet.getRange(startRow, cfg.inputStartCol, numRows, cfg.inputWidth).getValues();
  const outputValues = inputValues.map(cfg.compute);
  sheet.getRange(startRow, cfg.outputStartCol, numRows, cfg.outputWidth).setValues(outputValues);
}

function ticketsBatchConfig() {
  const inputTable  = resolve(TICKETSTABLES.SINNERS_TABLE_INPUT);
  const outputTable = resolve(TICKETSTABLES.SINNERS_TABLE_OUTPUT);
  return {
    inputStartCol:  inputTable.startCol - 1 + TICKETS_SINNER_INPUT.FROM,
    inputWidth:     3, 
    outputStartCol: outputTable.startCol,
    outputWidth:    outputTable.numCols,
    compute([rawFrom, rawExcess, rawTo]) {
      const minXP = computeTicketsMinXPFromValues(rawFrom, rawExcess, rawTo);
      const b = computeTicketBreakdown(minXP);
      return typeof minXP === "string" ? [minXP, 0, 0, 0, 0, 0] : [minXP, b.IV, b.III, b.II, b.I, b.excess];
    }
  };
}

function threadsBatchConfig() {
  const inputTable = resolve(THREADSTABLES.SINNERS_TABLE_INPUT);
  const outputCol  = resolve(THREADSTABLES.SINNERS_TABLE_OUTPUT).col;
  return {
    inputStartCol:  inputTable.startCol - 1,
    inputWidth:     inputTable.numCols + 1,
    outputStartCol: outputCol,
    outputWidth:    1,
    compute(input) {
      return [computeThreadsRowCost(input)];
    }
  };
}

function cratesBatchConfig() {
  const inputTable  = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);
  const outputTable = resolve(CRATESTABLES.SINNERS_TABLE_OUTPUT);
  return {
    inputStartCol:  inputTable.startCol - 1,
    inputWidth:     inputTable.numCols + 1,
    outputStartCol: outputTable.startCol,
    outputWidth:    outputTable.numCols,
    compute(input) {
      return computeCratesRowResult(input);
    }
  };
}
