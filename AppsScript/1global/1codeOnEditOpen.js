// 1global/1codeOnEditOpen.gs

function onEdit(e) {
  try {
    profReset();
    profStart("onEdit_total");
    _scriptCache = null;
    levelCache = null;
    resetAnchorCaches();
    ensureScriptCacheSeeded();
    const sheet     = e.range.getSheet();
    const sheetName = sheet.getName();

    // ============================================================
    // TICKETS
    // ============================================================
    if (sheetName === "Tickets") {
      profWrap("Tickets_block", () => {
      restoreBlankInputCells(sheet, e.range);
      enforceStaticCells(sheet, e.range); 
      handleDeleteRowsEdit(e, sheet);

      const identityCell = resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP);

      const humanEditedIdentity =
        e.range.getRow()    === identityCell.row &&
        e.range.getColumn() === identityCell.col;

      if (humanEditedIdentity) {
        handleIdentityLevelUp(e, sheet, true);
      }

      recalculateSumXP(sheet);
      const msResult = recalculateMinutesSecondsChecker(
        resolve(TICKETSTABLES.MINUTES_SECONDS),
        resolve(TICKETSTABLES.MINUTES_SECONDS_CHECKER)
      );

      const settings = validateSettings(sheet);
      recalculateTotalRuns(sheet, settings, msResult);
      recalculateExpectedTimeModule(sheet, settings, msResult);
      recalculateTicketDistribution(sheet, settings);
      });
    }

    // ============================================================
    // THREADS
    // ============================================================
    else if (sheetName === "Threads") {
      profWrap("Threads_block", () => {
      restoreBlankInputCells(sheet, e.range); 
      enforceStaticCells(sheet, e.range);
      handleDeleteRowsEdit(e, sheet);

      const upgradeCell = resolve(THREADSDEFAULTS.TOTAL_UPGRADE);

      const humanEditedUpgrade =
        e.range.getRow()    === upgradeCell.row &&
        e.range.getColumn() === upgradeCell.col;

      if (humanEditedUpgrade) {
        handleThreadsUpgrade(e, sheet, true);
      }

      recalculateMinutesSecondsChecker(
        resolve(THREADSTABLES.MINUTES_SECONDS),
        resolve(THREADSTABLES.MINUTES_SECONDS_CHECKER)
      );

      const settings = validateThreadsSettings(sheet);
      recalculateTotalThreadsRuns(sheet, settings);
      recalculateThreadsExpectedTime(sheet, settings);
      });
    }

    // ============================================================
    // CRATES
    // ============================================================
    else if (sheetName === "Crates") {
      profWrap("Crates_block", () => {
      restoreBlankInputCells(sheet, e.range); 
      enforceStaticCells(sheet, e.range);
      handleDeleteRowsEdit(e, sheet);

      const upgradeCell = resolve(CRATESDEFAULTS.TOTAL_UPGRADE);

      const humanEditedUpgrade =
        e.range.getRow()    === upgradeCell.row &&
        e.range.getColumn() === upgradeCell.col;

      if (humanEditedUpgrade) {
        handleShardsUpgrade(e, sheet, true);
      } else {
        const sinnerInput   = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);
        const lastActiveRow = sinnerInput.startRow + getPreviousCratesRowCount() - 1;
        const editRow1 = e.range.getRow();
        const editRow2 = editRow1 + e.range.getNumRows() - 1;

        if (editRow1 <= lastActiveRow && editRow2 >= sinnerInput.startRow) {
          recalculateEditedCratesRows(sheet, e.range);
        }
      }

      const settings = validateCratesSettings(sheet);
      recalculateTotalCratesRuns(sheet, settings);
      recalculateCratesReq(sheet);
      recalculateWeeklyMDRuns(sheet);
      });
    }

    // ============================================================
    // HOME
    // ============================================================
    else if (sheetName === "Home") {
      profWrap("Home_block", () => {
      restoreBlankInputCells(sheet, e.range); 
      enforceStaticCells(sheet, e.range);  
      handleSheetColorsEdit(e);
      handleRestoreDefaultEdit(e, sheet);

      Object.entries(ANCHOR_GROUPS).forEach(([groupName, group]) => {
          const homeTable = resolve(group.homeTable);

          const inAnchorRange =
            e.range.getRow() + e.range.getNumRows() - 1 >= homeTable.startRow &&
            e.range.getRow() <= homeTable.startRow + homeTable.numRows - 1 &&
            e.range.getColumn() <= homeTable.startCol &&
            e.range.getColumn() + e.range.getNumColumns() - 1 >= homeTable.startCol;

          if (inAnchorRange) {
            const { restoredAny, unrecoverableAny } = restoreBlankAnchorHomeCells(groupName, group);
            if (restoredAny) {
              setACellValue(group.change, false);
            }
            if (unrecoverableAny) {
              setACellValue(group.status, "Warning: no previous position on record for a blanked cell — restore or run Restore Default to reseed.");
            }
          }

          const editedChangeCheckbox =
            e.range.getRow() === group.change.row && e.range.getColumn() === group.change.col;
S
          if (!editedChangeCheckbox) return;

          const { errors, positions } = validateAnchorGroupFormat(group);

          if (errors.length > 0) {
            setACellValue(group.checker, errors.join("; "));
            setACellValue(group.status, "Error: Fix invalid anchors before moving.");
            setACellValue(group.change, false);
            return;
          }

          setACellValue(group.checker, "Error Checker");

          const changed = detectAnchorChanges(groupName, positions);
          const hasChanges = Object.keys(changed).length > 0;

          if (!hasChanges) {
            setACellValue(group.status, "Idle! Check the box to begin.");
            setACellValue(group.change, false);
            return;
          }

          const collisions = detectAnchorCollisions(group, positions, groupName);
          const growthViolations = detectAnchorGrowthViolations(groupName, group, positions);

          if (collisions.length > 0 || growthViolations.length > 0) {
            const messages = [];
            if (collisions.length > 0)       messages.push(formatCollisionMessage(collisions));
            if (growthViolations.length > 0) messages.push(formatGrowthViolationMessage(growthViolations));

            setACellValue(group.checker, messages.join(" | "));
            setACellValue(group.status, "Error: Fix invalid anchors before moving.");
            setACellValue(group.change, false);
            return;
          }

          setACellValue(group.status, `Relocating ${groupName} sheet...`);
          SpreadsheetApp.flush();

          executeAnchorGroupMove(groupName, group, changed);
          setAnchorGroupPositions(groupName, positions);

          if (groupName === "Library") {
            handleIdentityLevelUp(null, getASheet("Tickets"), true);
            recalculateSumXP(getASheet("Tickets"));

          } else if (groupName === "Tickets") {
            handleIdentityLevelUp(null, getASheet("Tickets"), true);
            recalculateSumXP(getASheet("Tickets"));
            const s = validateSettings(getASheet("Tickets"));
            recalculateTotalRuns(getASheet("Tickets"), s);
            recalculateExpectedTimeModule(getASheet("Tickets"), s);
            recalculateTicketDistribution(getASheet("Tickets"), s);

          } else if (groupName === "Threads") {
            handleThreadsUpgrade(null, getASheet("Threads"), true);
            const s = validateThreadsSettings(getASheet("Threads"));
            recalculateTotalThreadsRuns(getASheet("Threads"), s);
            recalculateThreadsExpectedTime(getASheet("Threads"), s);

          } else if (groupName === "Crates") {
            handleShardsUpgrade(null, getASheet("Crates"), true);
            const s = validateCratesSettings(getASheet("Crates"));
            recalculateTotalCratesRuns(getASheet("Crates"), s);
            recalculateCratesReq(getASheet("Crates"));
            recalculateWeeklyMDRuns(getASheet("Crates"));
          }

          setACellValue(group.status, "Changes have been applied!");
          setACellValue(group.change, false);
        });
      });
    } else if (sheetName === "The Library") {
      profWrap("Library_block", () => {
        restoreBlankInputCells(sheet, e.range);
        enforceStaticCells(sheet, e.range);  
      });
    }

    profWrap("flushScriptCache", () => flushScriptCache());
    profEnd(); 
    profReport();
  } catch (err) {
    console.error(err); 
  }
}






function sanitizeRowCount(raw) {
  const n = parseInt(raw);
  return (!isNaN(n) && n >= 1) ? n : 1;
}


function countPopulatedSinnerRows(sheet, inputTable, nameOffset) {
  const nameCol = inputTable.startCol - 1 + nameOffset;
  const values = sheet
    .getRange(inputTable.startRow, nameCol, MAX_SINNER_ROWS, 1)
    .getValues();

  let count = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === "" || values[i][0] === null) break;
    count++;
  }
  return Math.max(count, 1); // row 1 is always structurally present
}


function reconcileRowCount(sheet, inputTable, nameOffset, driverCellValue) {
  const driverCount = sanitizeRowCount(driverCellValue);
  const scannedCount = countPopulatedSinnerRows(sheet, inputTable, nameOffset);
  return {
    count: scannedCount,
    mismatch: scannedCount !== driverCount,
    driverCount,
    scannedCount
  };
}

// ============================================================
// Per-field validity checks — used instead of a single "cache
// exists or not" flag, so a corrupt/missing field gets reconciled
// on its own without discarding sibling fields that are still fine.
// ============================================================
function isValidRowCountString(raw) {
  const n = parseInt(raw);
  return raw !== undefined && raw !== null && !isNaN(n) && n >= 1;
}

function isValidAnchorPositionsString(raw) {
  if (raw === undefined || raw === null) return false;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object";
  } catch (err) {
    return false; 
  }
}


function ensureScriptCacheSeeded() {
  const props = PropertiesService.getScriptProperties().getProperties();

  const needsAnchors = !isValidAnchorPositionsString(props.previousAnchorPositions);
  const needsTickets = !isValidRowCountString(props.previousRowCount);
  const needsThreads = !isValidRowCountString(props.previousThreadsRowCount);
  const needsCrates  = !isValidRowCountString(props.previousCratesRowCount);

  if (!needsAnchors && !needsTickets && !needsThreads && !needsCrates) return;

  if (needsAnchors) {
    Object.keys(ANCHOR_GROUPS).forEach(reseedAnchorPositions);
  }

  const mismatches = [];

  if (needsTickets) {
    const r = reconcileRowCount(
      getASheet("Tickets"),
      resolve(TICKETSTABLES.SINNERS_TABLE_INPUT),
      TICKETS_SINNER_INPUT.NAME,
      getACellValue(resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP))
    );
    setPreviousRowCount(r.count);
    if (r.mismatch) mismatches.push(["Tickets", r]);
  }

  if (needsThreads) {
    const r = reconcileRowCount(
      getASheet("Threads"),
      resolve(THREADSTABLES.SINNERS_TABLE_INPUT),
      THREADS_SINNER_INPUT.NAME,
      getACellValue(resolve(THREADSDEFAULTS.TOTAL_UPGRADE))
    );
    setPreviousThreadsRowCount(r.count);
    if (r.mismatch) mismatches.push(["Threads", r]);
  }

  if (needsCrates) {
    const r = reconcileRowCount(
      getASheet("Crates"),
      resolve(CRATESTABLES.SINNERS_TABLE_INPUT),
      CRATES_SINNER_INPUT.NAME,
      getACellValue(resolve(CRATESDEFAULTS.TOTAL_UPGRADE))
    );
    setPreviousCratesRowCount(r.count);
    if (r.mismatch) mismatches.push(["Crates", r]);
  }

  flushScriptCache();

  if (mismatches.length > 0) {
    const details = mismatches
      .map(([name, r]) => `${name}: driver said ${r.driverCount}, sheet shows ${r.scannedCount}`)
      .join("; ");
    setACellValue(
      resolve(HOMEDEFAULTS.RESTORE_DEFAULT_CHECKER),
      `Note: row counts were auto-corrected on load — ${details}`
    );
  }
}


function onOpen() {
  ensureScriptCacheSeeded();
}