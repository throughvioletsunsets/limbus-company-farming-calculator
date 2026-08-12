// 4crates/code.gs

function minutesToTimeBreakdown(totalMinutes) {
  let remaining = totalMinutes;

  const months = Math.floor(remaining / (30 * 1440));
  remaining -= months * 30 * 1440;

  const weeks = Math.floor(remaining / (7 * 1440));
  remaining -= weeks * 7 * 1440;

  const days = Math.floor(remaining / 1440);
  remaining -= days * 1440;

  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;

  const row = [0, 0, 0, 0, 0];
  row[CRATES_TIME.MONTHS]  = months;
  row[CRATES_TIME.WEEKS]   = weeks;
  row[CRATES_TIME.DAYS]    = days;
  row[CRATES_TIME.HOURS]   = hours;
  row[CRATES_TIME.MINUTES] = minutes;
  return row;
}

function solveMDRuns(netNeededXP, weekliesInput, bonusXPPerTriple, bonusTimePerTriple, normalXPPerRun, normalMinutes, weekBonusInput) {
  let weeklyTriples = 0;
  let normalRuns     = 0;

  if (weekliesInput === "Yes") {
    weeklyTriples = Math.ceil(netNeededXP / bonusXPPerTriple);
    normalRuns    = 0;

  } else {
    // If this week's bonus is available ("Yes"), start with a free
    // triple — the first one only becomes available after the next reset.
    weeklyTriples = weekBonusInput === "Yes" ? 1 : 0;

    const MAX_ITER = 10000;
    let iter = 0;

    while (iter < MAX_ITER) {
      const bonusXPTotal = weeklyTriples * bonusXPPerTriple;
      const remainderXP  = Math.max(netNeededXP - bonusXPTotal, 0);
      normalRuns = Math.ceil(remainderXP / normalXPPerRun);

      const totalTimeMinutes =
        weeklyTriples * bonusTimePerTriple +
        normalRuns    * normalMinutes;

      if (totalTimeMinutes > MD_WEEK_MINUTES && remainderXP > 0) {
        weeklyTriples++;
        iter++;
        continue;
      }
      break;
    }
  }

  const weeklyXPTotal = weeklyTriples * bonusXPPerTriple;
  const normalXPTotal = normalRuns    * normalXPPerRun;

  let totalTimeMinutes =
    weeklyTriples * bonusTimePerTriple +
    normalRuns    * normalMinutes;

  if (weekliesInput === "Yes" && weeklyTriples > 1) {
    totalTimeMinutes += (weeklyTriples - 1) * MD_WEEK_MINUTES;
  }

  return { weeklyTriples, normalRuns, weeklyXPTotal, normalXPTotal, totalTimeMinutes };
}

const MD_PASS_ROW = { EASY: 0, HARD: 1, NORMAL: 2 };
const MD_WEEK_MINUTES = 7 * 24 * 60; // 10080

function getCratesTimeMinutes(table, checkerTable) {
  const raw = getTableValues(table)[0];
  const hours   = processAndValidateCell(raw[0], 0, 0);
  const minutes = processAndValidateCell(raw[1], 0, 0);

  setTableValues(checkerTable, [[
    typeof hours   === "string" ? hours   : "Error Checker",
    typeof minutes === "string" ? minutes : "Error Checker"
  ]]);

  if (typeof hours === "string" || typeof minutes === "string") return null;
  return hours * 60 + minutes;
}

function recalculateWeeklyMDRuns(sheet) {
  return profWrap("recalculateWeeklyMDRuns", () => {
  if (sheet.getName() !== "Crates") return;

  const hardInput        = getACellValue(CRATESDEFAULTS.HARD_INPUT);
  const weekliesInput    = getACellValue(CRATESDEFAULTS.WEEKLIES_INPUT);
  const passInput        = getACellValue(CRATESDEFAULTS.PASS_INPUT);
  const cratesValueInput = getACellValue(CRATESDEFAULTS.CRATES_VALUE_INPUT);
  const weekBonusInput   = getACellValue(CRATESDEFAULTS.WEEK_BONUS_INPUT);

  const rawCratesInput = getACellValue(CRATESDEFAULTS.CRATES_INPUT);
  const cratesOwned    = processAndValidateCell(rawCratesInput, 0, 0);
  setACellValue(
    CRATESDEFAULTS.CRATES_INPUT_CHECKER,
    typeof cratesOwned === "string" ? cratesOwned : "Error Checker"
  );
  if (typeof cratesOwned === "string") return;

  const passExcess = getACellValue(CRATESDEFAULTS.PASS_EXCESS_INPUT) || 0;

  // ===== Target crates from CRATES_REQ (Average/Minimum/Maximum) =====
  const reqRow = getTableValues(CRATESTABLES.CRATES_REQ)[0];
  const VALUE_MAP = { "Average": CRATES_REQ.AVG, "Minimum": CRATES_REQ.MIN, "Maximum": CRATES_REQ.MAX };
  const reqCol = VALUE_MAP[cratesValueInput];
  const targetCrates = reqRow[reqCol];
  if (typeof targetCrates !== "number") return; // upstream row errors — bail cleanly instead of NaN math

  const netNeededCrates = Math.max(targetCrates - cratesOwned, 0);

  const rate        = passInput === "Yes" ? 3 : 1;
  const neededXP     = Math.ceil(netNeededCrates / rate) * 10;
  const netNeededXP  = Math.max(neededXP - passExcess, 0);

  // ===== Time inputs =====
  const hardMinutes   = getCratesTimeMinutes(CRATESTABLES.HARD_TIME,   CRATESTABLES.HARD_TIME_CHECKER);
  const easyMinutes   = getCratesTimeMinutes(CRATESTABLES.EASY_TIME,   CRATESTABLES.EASY_TIME_CHECKER);
  const normalMinutes = getCratesTimeMinutes(CRATESTABLES.NORMAL_TIME, CRATESTABLES.NORMAL_TIME_CHECKER);

  if (hardMinutes === null || easyMinutes === null || normalMinutes === null) return;

  // ===== Rates/costs from library table =====
  const mdPassXP = getTableValues(resolve(LIBRARYTABLES.MD_PASS_XP));

  const hardAvailable = hardInput === "Yes";
  const bonusRow = hardAvailable ? MD_PASS_ROW.HARD : MD_PASS_ROW.EASY;

  const bonusXPPerTriple   = mdPassXP[bonusRow][MD_PASS_ORDER.TOTAL_XP];
  const bonusCostPerTriple = mdPassXP[bonusRow][MD_PASS_ORDER.COST];
  const bonusTimePerTriple = hardAvailable ? hardMinutes : easyMinutes;

  const normalXPPerRun   = mdPassXP[MD_PASS_ROW.NORMAL][MD_PASS_ORDER.TOTAL_XP];
  const normalCostPerRun = mdPassXP[MD_PASS_ROW.NORMAL][MD_PASS_ORDER.COST];

  // ===== Pass 1: raw solve (no passive dailies/weeklies) =====
  const raw = solveMDRuns(
    netNeededXP,
    weekliesInput,
    bonusXPPerTriple,
    bonusTimePerTriple,
    normalXPPerRun,
    normalMinutes,
    weekBonusInput
  );

  // ===== WEEKLY_MD_RUNS =====
  const runCounts = [0, 0, 0]; // Easy, Hard, Normal
  const xpRow     = [0, 0, 0];

  if (hardAvailable) {
    runCounts[CRATES_MD_RUN.HARD] = raw.weeklyTriples * 3;
    xpRow[CRATES_MD_RUN.HARD]     = raw.weeklyXPTotal;
  } else {
    runCounts[CRATES_MD_RUN.EASY] = raw.weeklyTriples * 3;
    xpRow[CRATES_MD_RUN.EASY]     = raw.weeklyXPTotal;
  }
  runCounts[CRATES_MD_RUN.NORMAL] = raw.normalRuns;
  xpRow[CRATES_MD_RUN.NORMAL]     = raw.normalXPTotal;

  setTableValues(CRATESTABLES.WEEKLY_MD_RUNS, [runCounts, xpRow]);

  // ===== MD_RUN_CRATES_EXCESS =====
  const totalGainedXP    = raw.weeklyXPTotal + raw.normalXPTotal + passExcess;
  const cratesGained     = Math.floor(totalGainedXP / 10) * rate;
  const totalCratesFinal = cratesOwned + cratesGained;
  const leftoverXP       = totalGainedXP % 10;

  setTableValues(CRATESTABLES.MD_RUN_CRATES_EXCESS, [[cratesGained], [leftoverXP]]);

  // ===== EXPECTED_TIME_MODULE =====
  const weeklyCostTotal = raw.weeklyTriples * bonusCostPerTriple;
  const normalCostTotal = raw.normalRuns    * normalCostPerRun;
  const totalModuleCost = weeklyCostTotal + normalCostTotal;

  setTableValues(CRATESTABLES.EXPECTED_TIME_MODULE, [[totalModuleCost], [raw.totalTimeMinutes]]);

  // ===== EXPECTED_TIME_TOTAL (raw breakdown) =====
  setTableValues(CRATESTABLES.EXPECTED_TIME_TOTAL, [minutesToTimeBreakdown(raw.totalTimeMinutes)]);

  // ===== Pass 2: passive dailies/weeklies-adjusted solve =====
  const totalDays  = Math.floor(raw.totalTimeMinutes / 1440);
  const totalWeeks = Math.floor(totalDays / 7);
  const levels     = totalDays * 1 + totalWeeks * 2;
  const passiveXP  = levels * 10;

  const residualXP = Math.max(netNeededXP - passiveXP, 0);

  const real = solveMDRuns(
    residualXP,
    weekliesInput,
    bonusXPPerTriple,
    bonusTimePerTriple,
    normalXPPerRun,
    normalMinutes,
    weekBonusInput
  );

  setTableValues(CRATESTABLES.EXPECTED_TIME_REAL, [minutesToTimeBreakdown(real.totalTimeMinutes)]);
  });
}

function validateCratesSettings(sheet) {
  if (sheet.getName() !== "Crates") return { mode: "Error" };

  const numRows = getACellValue(CRATESDEFAULTS.TOTAL_UPGRADE);
  if (!isNaN(numRows) && numRows >= 1) {
    const inputTable = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);

    const baseCol = inputTable.startCol - 1;
    const inputValues = sheet.getRange(
      inputTable.startRow,
      baseCol,
      numRows,
      inputTable.numCols + 1
    ).getValues();

    const outputTable = resolve(CRATESTABLES.SINNERS_TABLE_OUTPUT);
    const initialShardsCol = outputTable.startCol;
    const outputColNum = outputTable.endCol - outputTable.startCol;
    const rowWidth = outputColNum + 1;

    let hasRowError = false;
    const rowErrors = {}; 

    for (let i = 0; i < numRows; i++) {
      const row = inputTable.startRow + i;
      const input = inputValues[i];

      const type     = input[CRATES_SINNER_INPUT.TYPE];
      const rarity   = input[CRATES_SINNER_INPUT.ID_RARITY];
      const idFrom   = input[CRATES_SINNER_INPUT.ID_FROM];
      const idTo     = input[CRATES_SINNER_INPUT.ID_TO];
      const egoGrade = input[CRATES_SINNER_INPUT.EGO_GRADE];
      const egoFrom  = input[CRATES_SINNER_INPUT.EGO_FROM];
      const egoTo    = input[CRATES_SINNER_INPUT.EGO_TO];

      const idFilled  = rarity !== "None" || idFrom !== "None" || idTo !== "None";
      const egoFilled = egoGrade !== "None" || egoFrom !== "None" || egoTo !== "None";

      let errorMsg = "";

      if (type === "None") {
      } else if (type === "Unlock Facade") {
        if (idFilled || egoFilled) errorMsg = "Error: Unlock Facade has extra fields";
      } else if (type === "Extract Identity") {
        if (egoFilled)                                  errorMsg = "Error: Extract Identity has EGO fields";
        else if (idFrom !== "None" || idTo !== "None")  errorMsg = "Error: Extract Identity has From/To fields";
        else if (rarity === "None")                     errorMsg = "Error: Missing Input";
        else if (rarity === "O")                        errorMsg = "Error: Cannot Extract O ID";
      } else if (type === "Uptie Identity") {
        if (egoFilled)                                                      errorMsg = "Error: Uptie Identity has EGO fields";
        else if (rarity === "None" || idFrom === "None" || idTo === "None") errorMsg = "Error: Missing Input";
        else if (UPTIE_TIER_ORDER[idFrom] > UPTIE_TIER_ORDER[idTo])          errorMsg = "Error: From > To";
      } else if (type === "Extract E.G.O") {
        if (idFilled)                                     errorMsg = "Error: Extract E.G.O has ID fields";
        else if (egoFrom !== "None" || egoTo !== "None")  errorMsg = "Error: From and To must be None for Extract E.G.O";
      } else if (type === "Threadspin E.G.O") {
        if (idFilled)                                                             errorMsg = "Error: Threadspin E.G.O has ID fields";
        else if (egoGrade === "None" || egoFrom === "None" || egoTo === "None")  errorMsg = "Error: Missing Input";
        else if (EGO_TIER_ORDER[egoFrom] > EGO_TIER_ORDER[egoTo])                 errorMsg = "Error: From > To";
      }

      if (errorMsg) {
        rowErrors[row] = [errorMsg, ...Array(outputColNum).fill(0)];
        hasRowError = true;
      }
    }

    const touchedRows = Object.keys(rowErrors).map(Number);
    if (touchedRows.length > 0) {
      const minRow = Math.min(...touchedRows);
      const maxRow = Math.max(...touchedRows);

      const block = sheet.getRange(minRow, initialShardsCol, maxRow - minRow + 1, rowWidth).getValues();
      touchedRows.forEach(row => { block[row - minRow] = rowErrors[row]; });
      sheet.getRange(minRow, initialShardsCol, maxRow - minRow + 1, rowWidth).setValues(block);
    }

    if (hasRowError) return { mode: "Error" };
  }

  return { mode: "OK" };
}


function handleShardsUpgrade(e, sheet, isForced) {
  return runSinnerUpgrade(CRATES_UPGRADE_CONFIG, e, sheet, isForced);
}

function computeCratesReq(shardsReq) {
  const max = shardsReq;
  const min = Math.ceil(shardsReq / 3);
  const avg = Math.ceil((min + max) / 2);
  return { min, max, avg };
}
// ===== Pure calculation — no sheet access =====
function computeCratesRowResult(input) {
  const type     = input[CRATES_SINNER_INPUT.TYPE];
  const rarity   = input[CRATES_SINNER_INPUT.ID_RARITY];
  const idFrom   = input[CRATES_SINNER_INPUT.ID_FROM];
  const idTo     = input[CRATES_SINNER_INPUT.ID_TO];
  const egoGrade = input[CRATES_SINNER_INPUT.EGO_GRADE];
  const egoFrom  = input[CRATES_SINNER_INPUT.EGO_FROM];
  const egoTo    = input[CRATES_SINNER_INPUT.EGO_TO];

  let shardsReq = 0;
  let errorMsg  = "";

  if (type === "None") {
    shardsReq = 0;

  } else if (type === "Unlock Facade") {
    shardsReq = getTableValues(resolve(LIBRARYTABLES.FACADE_TABLE))[0][FACADE_CONST.SHARDS];

  } else if (type === "Extract Identity") {
    if (rarity === "None") {
      errorMsg = "Error: Missing Input";
    } else if (rarity === "O") {
      errorMsg = "Error: Cannot Extract O ID";
    } else {
      const EXTRACT_COL = { "OO": EXTRACT_CONST.ID_00, "OOO": EXTRACT_CONST.ID_000 };
      const col = EXTRACT_COL[rarity];
      if (col === undefined) {
        errorMsg = "Error: Invalid Rarity";
      } else {
        shardsReq = getTableValues(resolve(LIBRARYTABLES.EXTRACT_TABLE))[0][col];
      }
    }

  } else if (type === "Uptie Identity") {
    if (rarity === "None" || idFrom === "None" || idTo === "None") {
      errorMsg = "Error: Missing Input";
    } else {
      const uptieTable = getTableValues(resolve(LIBRARYTABLES.ID_UPTIE_TABLE));
      const RARITY_COL = { "O": UPTIE_CONST.O_SHARDS, "OO": UPTIE_CONST.OO_SHARDS, "OOO": UPTIE_CONST.OOO_SHARDS };
      const rarityCol = RARITY_COL[rarity];
      const fromIdx   = UPTIE_TIER_ORDER[idFrom];
      const toIdx     = UPTIE_TIER_ORDER[idTo];

      if (rarityCol === undefined) {
        errorMsg = "Error: Invalid Rarity";
      } else if (fromIdx === undefined || toIdx === undefined) {
        errorMsg = "Error: Invalid Tier";
      } else if (fromIdx >= toIdx) {
        errorMsg = "Error: From >= To";
      } else {
        shardsReq = uptieTable
          .filter(r => {
            const rowTier = UPTIE_TIER_ORDER[r[UPTIE_CONST.TIER]];
            return rowTier > fromIdx && rowTier <= toIdx;
          })
          .reduce((sum, r) => sum + r[rarityCol], 0);
      }
    }

  } else if (type === "Extract E.G.O") {
    if (egoFrom !== "None" || egoTo !== "None") {
      errorMsg = "Error: From and To must be None for Extract E.G.O";
    } else {
      shardsReq = getTableValues(resolve(LIBRARYTABLES.EXTRACT_TABLE))[0][EXTRACT_CONST.EGO];
    }

  } else if (type === "Threadspin E.G.O") {
    if (egoGrade === "None" || egoFrom === "None" || egoTo === "None") {
      errorMsg = "Error: Missing Input";
    } else {
      const spinTable = getTableValues(resolve(LIBRARYTABLES.EGO_THREADSPIN_TABLE));
      const GRADE_COL = {
        "ZAYIN": THREADSPIN_CONST.ZAYIN_SHARDS, "TETH": THREADSPIN_CONST.TETH_SHARDS,
        "HE": THREADSPIN_CONST.HE_SHARDS, "WAW": THREADSPIN_CONST.WAW_SHARDS,
      };
      const gradeCol = GRADE_COL[egoGrade];
      const fromIdx  = EGO_TIER_ORDER[egoFrom];
      const toIdx    = EGO_TIER_ORDER[egoTo];

      if (gradeCol === undefined) {
        errorMsg = "Error: Invalid Grade";
      } else if (fromIdx === undefined || toIdx === undefined) {
        errorMsg = "Error: Invalid Tier";
      } else if (fromIdx >= toIdx) {
        errorMsg = "Error: From >= To";
      } else {
        shardsReq = spinTable
          .filter(r => {
            const rowTier = EGO_TIER_ORDER[r[THREADSPIN_CONST.TIER]];
            return rowTier > fromIdx && rowTier <= toIdx;
          })
          .reduce((sum, r) => sum + r[gradeCol], 0);
      }
    }

  } else {
    errorMsg = "Error: Invalid Type";
  }

  if (errorMsg) {
    const errRow = [];
    errRow[CRATES_SINNER_OUTPUT.INITIAL_SHARDS] = errorMsg;
    errRow[CRATES_SINNER_OUTPUT.FINAL_SHARDS]   = 0;
    errRow[CRATES_SINNER_OUTPUT.MIN_CRATES]     = 0;
    errRow[CRATES_SINNER_OUTPUT.AVG_CRATES]     = 0;
    errRow[CRATES_SINNER_OUTPUT.MAX_CRATES]     = 0;
    return errRow;
  }

  const crates = computeCratesReq(shardsReq);
  const outRow = [];
  outRow[CRATES_SINNER_OUTPUT.INITIAL_SHARDS] = shardsReq;
  outRow[CRATES_SINNER_OUTPUT.FINAL_SHARDS]   = shardsReq;
  outRow[CRATES_SINNER_OUTPUT.MIN_CRATES]     = crates.min;
  outRow[CRATES_SINNER_OUTPUT.AVG_CRATES]     = crates.avg;
  outRow[CRATES_SINNER_OUTPUT.MAX_CRATES]     = crates.max;
  return outRow;
}

function recalculateCratesRowsBatch(sheet, startRow, numRows) {
  recalcSinnerRowsBatch(cratesBatchConfig(), sheet, startRow, numRows);
}

function recalculateEditedCratesRows(sheet, range) {
  const inputTable = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);
  const baseCol = inputTable.startCol - 1;
  const typeCol  = baseCol + CRATES_SINNER_INPUT.TYPE;
  const egoToCol = baseCol + CRATES_SINNER_INPUT.EGO_TO;

  const editCol1 = range.getColumn();
  const editCol2 = editCol1 + range.getNumColumns() - 1;
  if (editCol2 < typeCol || editCol1 > egoToCol) return;

  const activeRows    = getPreviousCratesRowCount();
  const lastActiveRow = inputTable.startRow + activeRows - 1;

  const editRow1 = Math.max(range.getRow(), inputTable.startRow);
  const editRow2 = Math.min(range.getRow() + range.getNumRows() - 1, lastActiveRow);
  if (editRow2 < editRow1) return;

  recalculateCratesRowsBatch(sheet, editRow1, editRow2 - editRow1 + 1);
}

function sinnerKey(name) {
  return String(name).toUpperCase().replace(/\s+/g, "_");
}

function firstRowForKey(entry) {
  if (!entry) return Infinity;
  const rows = [];
  if (entry.other.length) rows.push(entry.other[0].row);
  if (entry.utts.length)  rows.push(entry.utts[0].row);
  return rows.length ? Math.min(...rows) : Infinity;
}

function recalculateSinnersReq(sheet) {
  if (sheet.getName() !== "Crates") return { finalShardsTotal: 0, hasError: false };

  const rawUpgrade = getACellValue(CRATESDEFAULTS.TOTAL_UPGRADE);
  const numRows = processAndValidateCell(rawUpgrade, 1, 1, MAX_SINNER_ROWS);

  setACellValue(
    CRATESDEFAULTS.TOTAL_UPGRADE_CHECKER,
    typeof numRows === "string" ? numRows : "Error Checker"
  );

  const shardsReq1 = Array(Object.keys(CRATES_SINNER_SHARDS_1).length).fill(0);
  const shardsReq2 = Array(Object.keys(CRATES_SINNER_SHARDS_2).length).fill(0);

  const ownedIn = {}; // key -> owned sinner shards input

  const owned1 = getTableValues(CRATESTABLES.INITIAL_SHARDS_1_INPUT)[0];
  const owned2 = getTableValues(CRATESTABLES.INITIAL_SHARDS_2_INPUT)[0];
  Object.entries(CRATES_SINNER_SHARDS_1).forEach(([name, i]) => ownedIn[name] = owned1[i] || 0);
  Object.entries(CRATES_SINNER_SHARDS_2).forEach(([name, i]) => ownedIn[name] = owned2[i] || 0);

  // key -> { other: [{row, remaining}], utts: [{row, remaining}] }, sheet-row order preserved
  const rowsByKey   = {};
  const erroredKeys = new Set(); // sinners with at least one invalid row
  let hasRowError   = false;

  const outputTable = resolve(CRATESTABLES.SINNERS_TABLE_OUTPUT);
  const initialShardsCol = outputTable.startCol + CRATES_SINNER_OUTPUT.INITIAL_SHARDS;
  const finalShardsCol   = outputTable.startCol + CRATES_SINNER_OUTPUT.FINAL_SHARDS;
  const minCratesCol     = outputTable.startCol + CRATES_SINNER_OUTPUT.MIN_CRATES;
  const avgCratesCol     = outputTable.startCol + CRATES_SINNER_OUTPUT.AVG_CRATES;
  const maxCratesCol     = outputTable.startCol + CRATES_SINNER_OUTPUT.MAX_CRATES;

  if (typeof numRows !== "string") {
    const inputTable = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);
    const baseCol    = inputTable.startCol - 1;

    const inputValues = sheet.getRange(
      inputTable.startRow, baseCol, numRows, inputTable.numCols + 1
    ).getValues();

    const outputValues = sheet.getRange(
      inputTable.startRow, initialShardsCol, numRows, 1
    ).getValues();

    for (let i = 0; i < numRows; i++) {
      const sinner = inputValues[i][CRATES_SINNER_INPUT.SINNER];
      const type   = inputValues[i][CRATES_SINNER_INPUT.TYPE];
      const cost   = outputValues[i][0];
      const row    = inputTable.startRow + i;
      const key    = sinnerKey(sinner);

      const isRosterSinner = CRATES_SINNER_SHARDS_1.hasOwnProperty(key) || CRATES_SINNER_SHARDS_2.hasOwnProperty(key);

      if (typeof cost !== "number") {
        // Row errored — flag it and keep it out of the arithmetic entirely.
        hasRowError = true;
        if (isRosterSinner) erroredKeys.add(key);
        continue;
      }

      if (!isRosterSinner) continue;

      if (!rowsByKey[key]) rowsByKey[key] = { other: [], utts: [] };
      const bucket = (type === "Uptie Identity" || type === "Threadspin E.G.O") ? "utts" : "other";
      rowsByKey[key][bucket].push({ row, remaining: cost });
    }
  }

  const allKeys = new Set([
    ...Object.keys(CRATES_SINNER_SHARDS_1),
    ...Object.keys(CRATES_SINNER_SHARDS_2),
  ]);

  const rawSeasonShards = getACellValue(CRATESDEFAULTS.INITIAL_SEASON_SHARDS);
  const seasonShardsValidated = processAndValidateCell(rawSeasonShards, 0, 0);

  setACellValue(
    CRATESDEFAULTS.INITIAL_SEASON_SHARDS_CHECKER,
    typeof seasonShardsValidated === "string" ? seasonShardsValidated : "Error Checker"
  );

  const seasonShards = typeof seasonShardsValidated === "number" ? seasonShardsValidated : 0;

  // ===== Step 1: owned shards pay "other" rows first (row order), then leftover pays "utts" rows (row order) =====
  allKeys.forEach(key => {
    const entry = rowsByKey[key];
    if (!entry) return;
    let owned = ownedIn[key] || 0;

    entry.other.forEach(r => {
      const spend = Math.min(owned, r.remaining);
      r.remaining -= spend;
      owned       -= spend;
    });
    entry.utts.forEach(r => {
      const spend = Math.min(owned, r.remaining);
      r.remaining -= spend;
      owned       -= spend;
    });
  });

  // ===== Step 2: season shard pool discounts remaining utts need — =====
  const uttsRemainingByKey = {};
  allKeys.forEach(key => {
    const entry = rowsByKey[key];
    uttsRemainingByKey[key] = entry ? entry.utts.reduce((s, r) => s + r.remaining, 0) : 0;
  });

  const priorityOrder = Array.from(allKeys).sort((a, b) => {
    if (uttsRemainingByKey[a] !== uttsRemainingByKey[b]) return uttsRemainingByKey[a] - uttsRemainingByKey[b];
    return firstRowForKey(rowsByKey[a]) - firstRowForKey(rowsByKey[b]);
  });

  let remainingBudget = seasonShards;
  priorityOrder.forEach(key => {
    if (remainingBudget <= 0) return;
    const entry = rowsByKey[key];
    if (!entry) return;
    entry.utts.forEach(r => {
      if (remainingBudget <= 0) return;
      const discount  = Math.min(remainingBudget, r.remaining);
      r.remaining     -= discount;
      remainingBudget -= discount;
    });
  });

// ===== Write per-row final shards + crates req; accumulate per-sinner + grand totals =====
  let finalShardsTotal = 0;
  const rowUpdates = {}; // declared once, outside the loop

  allKeys.forEach(key => {
    if (erroredKeys.has(key)) {
      // This sinner has at least one invalid row — its total can't be trusted,
      // so mark it instead of silently summing only the valid rows.
      if (CRATES_SINNER_SHARDS_1.hasOwnProperty(key)) {
        shardsReq1[CRATES_SINNER_SHARDS_1[key]] = "Error: Row Errors";
      } else if (CRATES_SINNER_SHARDS_2.hasOwnProperty(key)) {
        shardsReq2[CRATES_SINNER_SHARDS_2[key]] = "Error: Row Errors";
      }
      return; // keep this sinner's rows out of the grand total too
    }

    const entry = rowsByKey[key];
    if (!entry) return;

    let sinnerTotal = 0;
    [...entry.other, ...entry.utts].forEach(r => {
      sinnerTotal      += r.remaining;
      finalShardsTotal += r.remaining;

      const { min, max, avg } = computeCratesReq(r.remaining);
      rowUpdates[r.row] = [r.remaining, min, avg, max];
    });

    if (CRATES_SINNER_SHARDS_1.hasOwnProperty(key)) {
      shardsReq1[CRATES_SINNER_SHARDS_1[key]] = sinnerTotal;
    } else if (CRATES_SINNER_SHARDS_2.hasOwnProperty(key)) {
      shardsReq2[CRATES_SINNER_SHARDS_2[key]] = sinnerTotal;
    }
  });

  const touchedRows = Object.keys(rowUpdates).map(Number);
  if (touchedRows.length > 0) {
    const minRow = Math.min(...touchedRows);
    const maxRow = Math.max(...touchedRows);
    const width  = maxCratesCol - finalShardsCol + 1; // final,min,avg,max are contiguous

    const block = sheet.getRange(minRow, finalShardsCol, maxRow - minRow + 1, width).getValues();
    touchedRows.forEach(row => { block[row - minRow] = rowUpdates[row]; });
    sheet.getRange(minRow, finalShardsCol, maxRow - minRow + 1, width).setValues(block);
  }

  setTableValues(CRATESTABLES.INITIAL_SHARDS_REQ_1, [shardsReq1]);
  setTableValues(CRATESTABLES.INITIAL_SHARDS_REQ_2, [shardsReq2]);

  return {
    finalShardsTotal: hasRowError ? "Error: Row Errors" : finalShardsTotal,
    hasError: hasRowError
  };
}

function recalculateTotalCratesRuns(sheet, settings) {
  return profWrap("recalculateTotalCratesRuns", () => {
  if (sheet.getName() !== "Crates") return;

  // Previously returned early on settings.mode === "Error", leaving
  // TOTAL_SHARDS_REQ stuck on its last valid value instead of flagging
  // the problem. recalculateSinnersReq already isolates bad rows safely,
  // so we always run it and let it report the error state itself.
  const { finalShardsTotal } = recalculateSinnersReq(sheet);
  setACellValue(CRATESDEFAULTS.TOTAL_SHARDS_REQ, finalShardsTotal);
  });
}

function recalculateCratesReq(sheet) {
  if (sheet.getName() !== "Crates") return;

  const totalShardsReq = getACellValue(CRATESDEFAULTS.TOTAL_SHARDS_REQ);

  if (typeof totalShardsReq !== "number") {
    setTableValues(CRATESTABLES.CRATES_REQ, [["Error: Row Errors", "Error: Row Errors", "Error: Row Errors"]]);
    return;
  }

  const { min, max, avg } = computeCratesReq(totalShardsReq);

  const row = [0, 0, 0];
  row[CRATES_REQ.MIN] = min;
  row[CRATES_REQ.MAX] = max;
  row[CRATES_REQ.AVG] = avg;

  setTableValues(CRATESTABLES.CRATES_REQ, [row]);
}
