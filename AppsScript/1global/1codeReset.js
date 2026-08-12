// 1global/1codeReset.gs

function resetHomeSheet() {
  return profWrap("resetHomeSheet", () => {
    resetAnchorCaches();

    const oldColors = { INPUT: COLORS.INPUT, OUTPUT: COLORS.OUTPUT, CONSTANT: COLORS.CONSTANT, ANCHOR: COLORS.ANCHOR };
    const oldFontColors = { INPUT: FONT_COLORS.INPUT, OUTPUT: FONT_COLORS.OUTPUT, CONSTANT: FONT_COLORS.CONSTANT, ANCHOR: FONT_COLORS.ANCHOR };

    const colorChanges = {};
    Object.keys(oldColors).forEach(name => { if (oldColors[name] !== DEFAULT_COLORS[name]) colorChanges[name] = DEFAULT_COLORS[name]; });
    const fontChanges = {};
    Object.keys(oldFontColors).forEach(name => { if (oldFontColors[name] !== DEFAULT_FONT_COLORS[name]) fontChanges[name] = DEFAULT_FONT_COLORS[name]; });


    if (Object.keys(colorChanges).length > 0 || Object.keys(fontChanges).length > 0) {
      repaintSheetColors(colorChanges, fontChanges);
    }

    Object.assign(COLORS, DEFAULT_COLORS);
    Object.assign(FONT_COLORS, DEFAULT_FONT_COLORS);
    PropertiesService.getScriptProperties().deleteProperty("customColors");
    PropertiesService.getScriptProperties().deleteProperty("customFontColors");
    invalidateRestorableDefsCache();

    Object.entries(ANCHOR_GROUPS).forEach(([groupName, group]) => {
      const defaultPositions = getDefaultAnchorPositions(groupName);
      const changedPos = detectAnchorChanges(groupName, defaultPositions);
      if (Object.keys(changedPos).length > 0) {
        executeAnchorGroupMove(groupName, group, changedPos);
        setAnchorGroupPositions(groupName, defaultPositions);
      }
    });

    writeSheetDefaults("Home"); 

    Object.keys(ANCHOR_GROUPS).forEach(reseedAnchorPositions);
    flushScriptCache();
  });
}

function resetTicketsSheet() {
  return profWrap("resetTicketsSheet", () => {
   
    restoreAnchorGroupPositions("Tickets");
    resetAnchorCaches();

    writeSheetDefaults("Tickets", true);
    writeAnchorLabels("Tickets", true);
    reseedAnchorPositions("Tickets");

    const ticketsSheet = getASheet("Tickets");
    handleIdentityLevelUp(null, ticketsSheet, true);
    recalculateSumXP(ticketsSheet);

    const ticketsSettings = validateSettings(ticketsSheet);
    recalculateTotalRuns(ticketsSheet, ticketsSettings);
    recalculateExpectedTimeModule(ticketsSheet, ticketsSettings);
    recalculateTicketDistribution(ticketsSheet, ticketsSettings);
    
  });
}

function resetThreadsSheet() {
  return profWrap("resetThreadsSheet", () => {
      restoreAnchorGroupPositions("Threads");
      resetAnchorCaches();

      const threadsSheet = getASheet("Threads");
      const ti = resolve(THREADSTABLES.SINNERS_TABLE_INPUT);
      threadsSheet.getRange(ti.startRow, ti.startCol, ti.numRows, ti.numCols)
        .clearDataValidations();

      writeSheetDefaults("Threads", true);
      writeAnchorLabels("Threads", true);
      reseedAnchorPositions("Threads");

      handleThreadsUpgrade(null, threadsSheet, true);

      const threadsSettings = validateThreadsSettings(threadsSheet);
      recalculateTotalThreadsRuns(threadsSheet, threadsSettings);
      recalculateThreadsExpectedTime(threadsSheet, threadsSettings);
  });
}

function resetCratesSheet() {
  return profWrap("resetCratesSheet", () => {
      restoreAnchorGroupPositions("Crates");
      resetAnchorCaches();

      const cratesSheet = getASheet("Crates");
      const ci = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);
      cratesSheet.getRange(ci.startRow, ci.startCol, ci.numRows, ci.numCols)
        .clearDataValidations();

      writeSheetDefaults("Crates", true);
      writeAnchorLabels("Crates", true);
      reseedAnchorPositions("Crates");

      handleShardsUpgrade(null, cratesSheet, true);

      const cratesSettings = validateCratesSettings(cratesSheet);
      recalculateTotalCratesRuns(cratesSheet, cratesSettings);
      recalculateCratesReq(cratesSheet);
      recalculateWeeklyMDRuns(cratesSheet);
  });
}

function resetLibrarySheet() {
  return profWrap("resetLibrarySheet", () => {
      restoreAnchorGroupPositions("Library");
      resetAnchorCaches();

      writeSheetDefaults("The Library", true);
      writeAnchorLabels("The Library", true);
      reseedAnchorPositions("Library");
  });
}

function resetAllSheets() {
  return profWrap("resetAllSheets", () => {
    resetHomeSheet();
    resetTicketsSheet();
    resetLibrarySheet();
    resetThreadsSheet();
    resetCratesSheet();
  });
}


const RESTORE_DEFAULT_ACTIONS = [
  { label: "All Sheets", fn: resetAllSheets   },
  { label: "Home",       fn: resetHomeSheet    },
  { label: "Tickets",    fn: resetTicketsSheet },
  { label: "Threads",    fn: resetThreadsSheet },
  { label: "Crates",     fn: resetCratesSheet  },
  { label: "Library",    fn: resetLibrarySheet },
];

function handleRestoreDefaultEdit(e, sheet) {
  if (sheet.getName() !== "Home") return;

  const table      = resolve(HOMETABLES.RESTORE_DEFAULT_INPUT);
  const statusCell = resolve(HOMEDEFAULTS.RESTORE_DEFAULT_CHECKER);

  const editRow1 = e.range.getRow();
  const editRow2 = editRow1 + e.range.getNumRows() - 1;
  const editCol1 = e.range.getColumn();
  const editCol2 = editCol1 + e.range.getNumColumns() - 1;

  const inRange =
    editRow1 <= table.startRow && editRow2 >= table.startRow &&
    editCol1 <= table.endCol   && editCol2 >= table.startCol;

  if (!inRange) return;

  const liveValues = getASheet(table.sheet)
    .getRange(table.startRow, table.startCol, 1, table.numCols)
    .getValues()[0];

  const checkedIndex = liveValues.findIndex(v => v === true);
  if (checkedIndex === -1) return;

  const action = RESTORE_DEFAULT_ACTIONS[checkedIndex];
  if (!action) return;

  setACellValue(statusCell, `Restoring ${action.label} sheet...`);
  SpreadsheetApp.flush();

  action.fn();

  getASheet(table.sheet)
    .getRange(table.startRow, table.startCol + checkedIndex)
    .setValue(false);

  setACellValue(
    statusCell,
    action.label === "All Sheets" ? "All sheets restored!" : `${action.label} sheet restored!`
  );
}