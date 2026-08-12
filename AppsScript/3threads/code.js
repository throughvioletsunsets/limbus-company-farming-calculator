// 3threads/code.gs

function computeThreadsRowCost(input) {
  const type     = input[THREADS_SINNER_INPUT.TYPE];
  const rarity   = input[THREADS_SINNER_INPUT.ID_RARITY];
  const idFrom   = input[THREADS_SINNER_INPUT.ID_FROM];
  const idTo     = input[THREADS_SINNER_INPUT.ID_TO];
  const egoGrade = input[THREADS_SINNER_INPUT.EGO_GRADE];
  const egoFrom  = input[THREADS_SINNER_INPUT.EGO_FROM];
  const egoTo    = input[THREADS_SINNER_INPUT.EGO_TO];

  let threadsReq = 0;
  let errorMsg   = "";

  if (type === "Facade") {
    threadsReq = resolve(LIBRARYTABLES.FACADE_TABLE).values[0][FACADE_CONST.THREADS];

  } else if (type === "BGM") {
    threadsReq = resolve(LIBRARYTABLES.BGM_TABLE).values[0][1];

  } else if (type === "Identity") {
    if (rarity === "None" || idFrom === "None" || idTo === "None") {
      errorMsg = "Error: Missing Input";
    } else {
      const uptieTable = resolve(LIBRARYTABLES.ID_UPTIE_TABLE).values;

      const RARITY_COL = {
        "O":   UPTIE_CONST.O_THREADS,
        "OO":  UPTIE_CONST.OO_THREADS,
        "OOO": UPTIE_CONST.OOO_THREADS,
      };

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
        threadsReq = uptieTable
          .filter(r => {
            const rowTier = UPTIE_TIER_ORDER[r[UPTIE_CONST.TIER]];
            return rowTier > fromIdx && rowTier <= toIdx;
          })
          .reduce((sum, r) => sum + r[rarityCol], 0);
      }
    }

  } else if (type === "E.G.O") {
    if (egoGrade === "None" || egoFrom === "None" || egoTo === "None") {
      errorMsg = "Error: Missing Input";
    } else {
      const spinTable = resolve(LIBRARYTABLES.EGO_THREADSPIN_TABLE).values;

      const GRADE_COL = {
        "ZAYIN": THREADSPIN_CONST.ZAYIN_THREADS,
        "TETH":  THREADSPIN_CONST.TETH_THREADS,
        "HE":    THREADSPIN_CONST.HE_THREADS,
        "WAW":   THREADSPIN_CONST.WAW_THREADS,
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
        threadsReq = spinTable
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

  return errorMsg || threadsReq;
}

function recalculateThreadsRowsBatch(sheet, startRow, numRows) {
  recalcSinnerRowsBatch(threadsBatchConfig(), sheet, startRow, numRows);
}


function recalculateTotalThreadsRuns(sheet, settings) {
  return profWrap("recalculateTotalThreadsRuns", () => {
  if (sheet.getName() !== "Threads") return;
  if (settings.mode === "Error") return;

  const rawUpgrade = getACellValue(resolve(THREADSDEFAULTS.TOTAL_UPGRADE));
  const rawInitial = getACellValue(resolve(THREADSDEFAULTS.INITIAL_THREADS_INPUT));

  const numRows = processAndValidateCell(rawUpgrade, 1, 1, MAX_SINNER_ROWS);
  const initialThreads = processAndValidateCell(rawInitial, 0, 0);

  setACellValue(resolve(THREADSDEFAULTS.TOTAL_UPGRADE_CHECKER),   typeof numRows        === "string" ? numRows        : "Error Checker");
  setACellValue(resolve(THREADSDEFAULTS.INITIAL_THREADS_CHECKER), typeof initialThreads === "string" ? initialThreads : "Error Checker");

  if (typeof numRows === "string" || typeof initialThreads === "string") return;

  const inputTable = resolve(THREADSTABLES.SINNERS_TABLE_INPUT);
  const outputCol   = resolve(THREADSTABLES.SINNERS_TABLE_OUTPUT).col;
  const startRow    = inputTable.startRow;
  const baseCol     = inputTable.startCol - 1;

  const rawInputRows = sheet.getRange(startRow, baseCol, numRows, inputTable.numCols + 1).getValues();

  let pool     = initialThreads;
  let sumFinal = 0;

  const outputRows = rawInputRows.map(row => {
    const rawCost = computeThreadsRowCost(row);

    if (typeof rawCost === "string") return [rawCost];

    const spend = Math.min(pool, rawCost);
    const final = rawCost - spend;
    pool     -= spend;
    sumFinal += final;
    return [final];
  });

  sheet.getRange(startRow, outputCol, numRows, 1).setValues(outputRows);

  setACellValue(resolve(THREADSDEFAULTS.TOTAL_THREADS_REQUIRED), sumFinal);
  });
}


function handleThreadsUpgrade(e, sheet, isForced) {
  return runSinnerUpgrade(THREADS_UPGRADE_CONFIG, e, sheet, isForced);
}

function allocateRemainderDaily(remainRuns, clearDailyPerCycle, skipDailyPerCycle, runsPerCycle, remainingBonus) {
  if (remainingBonus >= 3) {
    // Full bonus available now — remainder consumes the daily slots first, then base.
    const remainDailyClear = Math.min(clearDailyPerCycle, remainRuns);
    const remainDailySkip  = Math.min(skipDailyPerCycle, Math.max(0, remainRuns - remainDailyClear));
    return { remainDailyClear, remainDailySkip };
  }

  const baseCapacity = runsPerCycle - 3;

  if (remainingBonus === 0) {
    // No bonus slots left today — remainder is entirely base, matching the
    // old "No" behavior. No daily involvement under any circumstance.
    return { remainDailyClear: 0, remainDailySkip: 0 };
  }

  // Partial bonus left today (1 or 2 slots) — remainder spends those
  // immediately, then fills base capacity, then (if it spills past base)
  // taps into tomorrow's fresh 3 daily slots.
  const immediateDaily = Math.min(remainingBonus, remainRuns);
  const afterImmediate = remainRuns - immediateDaily;
  const afterBase      = Math.max(0, afterImmediate - baseCapacity);
  const nextDayDaily    = Math.min(3, afterBase);
  const totalDaily      = immediateDaily + nextDayDaily;

  const remainDailyClear = Math.min(clearDailyPerCycle, totalDaily);
  const remainDailySkip  = Math.min(skipDailyPerCycle, Math.max(0, totalDaily - remainDailyClear));
  return { remainDailyClear, remainDailySkip };
}



function solveThreadsFull(totalThreads, data, runsPerCycle, dailiesInput, remainingBonus) {
  const daily = data[THREADS_CONST.THREADS_DAILY];
  const base  = data[THREADS_CONST.THREADS_BASE];

  const baseCapacity = dailiesInput === "Yes"
    ? 0
    : Math.max(0, runsPerCycle - 3);

  let remaining = totalThreads;

  let runs = 0;
  let dailyRuns = 0;
  let baseRuns = 0;

  // ============================================================
  // TODAY
  // Only the remaining daily bonus slots are available today.
  // ============================================================

  const todayDaily = Math.min(
    remainingBonus,
    Math.ceil(remaining / daily)
  );

  runs += todayDaily;
  dailyRuns += todayDaily;
  remaining -= todayDaily * daily;

  if (remaining <= 0) {
    return {
      runs,
      dailyRuns,
      baseRuns,
    };
  }

  // ============================================================
  // TODAY'S BASE RUNS
  // ============================================================

  if (baseCapacity > 0) {
    const todayBase = Math.min(
      baseCapacity,
      Math.ceil(remaining / base)
    );

    runs += todayBase;
    baseRuns += todayBase;
    remaining -= todayBase * base;

    if (remaining <= 0) {
      return {
        runs,
        dailyRuns,
        baseRuns,
      };
    }
  }

  // ============================================================
  // DAILIES ONLY
  // Every subsequent run is a Daily run.
  // ============================================================

  if (dailiesInput === "Yes") {
    const futureDailyRuns = Math.ceil(remaining / daily);

    runs += futureDailyRuns;
    dailyRuns += futureDailyRuns;

    return {
      runs,
      dailyRuns,
      baseRuns,
    };
  }

  // ============================================================
  // FUTURE FULL DAYS
  //
  // Every future day gets:
  //   3 Daily
  //   + baseCapacity Base
  // ============================================================

  const threadsPerFullCycle =
    (3 * daily) +
    (baseCapacity * base);

  const fullCycles = Math.floor(
    remaining / threadsPerFullCycle
  );

  runs += fullCycles * runsPerCycle;
  dailyRuns += fullCycles * 3;
  baseRuns += fullCycles * baseCapacity;

  remaining -= fullCycles * threadsPerFullCycle;

  if (remaining <= 0) {
    return {
      runs,
      dailyRuns,
      baseRuns,
    };
  }

  // ============================================================
  // FINAL PARTIAL DAY
  // Fresh day = 3 Daily slots first.
  // ============================================================

  const nextDaily = Math.min(
    3,
    Math.ceil(remaining / daily)
  );

  runs += nextDaily;
  dailyRuns += nextDaily;
  remaining -= nextDaily * daily;

  if (remaining <= 0) {
    return {
      runs,
      dailyRuns,
      baseRuns,
    };
  }

  // ============================================================
  // FINAL PARTIAL-DAY BASE RUNS
  // ============================================================

  if (baseCapacity > 0) {
    const finalBase = Math.ceil(
      remaining / base
    );

    runs += finalBase;
    baseRuns += finalBase;
  }

  return {
    runs,
    dailyRuns,
    baseRuns,
  };
}


function recalculateThreadsExpectedTime(sheet, settings) {
  return profWrap("recalculateThreadsExpectedTime", () => {
  if (sheet.getName() !== "Threads") return;
  if (settings.mode === "Error") return;

  const totalThreads = getACellValue(resolve(THREADSDEFAULTS.TOTAL_THREADS_REQUIRED));
  if (typeof totalThreads === "string" || isNaN(totalThreads) || totalThreads < 0) return;

  const msResult = validateMinutesSecondsTable(resolve(THREADSTABLES.MINUTES_SECONDS));
  if (msResult.error) return;
  const singleSeconds = msResult.totalSeconds;

  const difficulty      = getACellValue(resolve(THREADSDEFAULTS.HIGHEST_DUNGEON_UNLOCK));
  const dailiesInput   = getACellValue(resolve(THREADSDEFAULTS.DAILIES_INPUT));
  const remainingBonus = getACellValue(resolve(THREADSDEFAULTS.TODAY_BONUS_INPUT));

  const clearData = getThreadsRow(difficulty, "Clear");
  const skipData  = getThreadsRow(difficulty, "Skip");

  if (!clearData || !skipData) return;

  const clearBase  = clearData[THREADS_CONST.THREADS_BASE];
  const clearDaily = clearData[THREADS_CONST.THREADS_DAILY];
  const skipBase   = skipData[THREADS_CONST.THREADS_BASE];
  const skipDaily  = skipData[THREADS_CONST.THREADS_DAILY];

  const runsPerCycle = dailiesInput === "Yes"
  ? 3
  : Math.max(1, Math.floor((86400 - 3 * singleSeconds) / singleSeconds) + 3);

  let clearRuns = 0;
  let skipRuns = 0;

  let clearDailyRuns = 0;
  let skipDailyRuns = 0;

  let clearBaseRuns = 0;
  let skipBaseRuns = 0;

  if (settings.type === "Clear") {
    const result = solveThreadsFull(
      totalThreads,
      clearData,
      runsPerCycle,
      dailiesInput,
      remainingBonus
    );

    clearRuns      = result.runs;
    clearDailyRuns = result.dailyRuns;
    clearBaseRuns  = result.baseRuns;

  } else {
    const result = solveThreadsFull(
      totalThreads,
      skipData,
      runsPerCycle,
      dailiesInput,
      remainingBonus
    );

    skipRuns      = result.runs;
    skipDailyRuns = result.dailyRuns;
    skipBaseRuns  = result.baseRuns;
  }

  const totalRuns = clearRuns + skipRuns;
  // ===== Sum Threads (raw, before subtracting initial) =====
  const sumThreads =
    clearBaseRuns  * clearBase  +
    clearDailyRuns * clearDaily +
    skipBaseRuns   * skipBase   +
    skipDailyRuns  * skipDaily;

  const initialThreads = getACellValue(resolve(THREADSDEFAULTS.INITIAL_THREADS_INPUT));

  // ===== Write TOTAL_RUNS table =====
  const activeCol = THREADS_HIGHEST_DUNGEON.indexOf(difficulty);

  const excessThreads = sumThreads - totalThreads;

  if (activeCol !== undefined) {
    const rows = Array.from({ length: 5 }, () => Array(5).fill(0));
    rows[TOTAL_RUNS_ROW.CLEAR_BASE ][activeCol] = clearBaseRuns;
    rows[TOTAL_RUNS_ROW.CLEAR_DAILY][activeCol] = clearDailyRuns;
    rows[TOTAL_RUNS_ROW.SKIP_BASE  ][activeCol] = skipBaseRuns;
    rows[TOTAL_RUNS_ROW.SKIP_DAILY ][activeCol] = skipDailyRuns;
    rows[TOTAL_RUNS_ROW.SUM_THREADS][activeCol] = sumThreads;
    setTableValues(resolve(THREADSTABLES.TOTAL_RUNS), rows);
  }

  setACellValue(resolve(THREADSDEFAULTS.EXCESS_THREADS), excessThreads);

  // ===== Time output =====
  const module = clearRuns * clearData[THREADS_CONST.TOTAL_MODULE] +
                 skipRuns  * skipData[THREADS_CONST.TOTAL_MODULE];

  if (dailiesInput === "No") {
    const totalSeconds = (clearRuns * singleSeconds) + (Math.ceil(skipRuns / 10) * 3);

    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setTableValues(
      resolve(THREADSTABLES.EXPECTED_TOTAL_TIME_MODULE),
      [[module], [totalSeconds]]
    );

    const hms = [0, 0, 0];
    hms[EXPECTED_HMS.HOURS]   = hours;
    hms[EXPECTED_HMS.MINUTES] = minutes;
    hms[EXPECTED_HMS.SECONDS] = seconds;
    setTableValues(resolve(THREADSTABLES.EXPECTED_HMS), [hms]);

    setTableValues(resolve(THREADSTABLES.EXPECTED_MWD), [[0, 0, 0]]);

  } else {
      const totalDays = Math.ceil(totalRuns / 3);
      const months    = Math.floor(totalDays / 30);
      const weeks     = Math.floor((totalDays % 30) / 7);
      const days      = totalDays % 30 % 7;

      setTableValues(
        resolve(THREADSTABLES.EXPECTED_TOTAL_TIME_MODULE),
        [[module], [0]]
      );

      setTableValues(resolve(THREADSTABLES.EXPECTED_HMS), [[0, 0, 0]]);   

      const mwd = [0, 0, 0];
      mwd[EXPECTED_MWD.MONTHS] = months;
      mwd[EXPECTED_MWD.WEEKS]  = weeks;
      mwd[EXPECTED_MWD.DAYS]   = days;
      setTableValues(resolve(THREADSTABLES.EXPECTED_MWD), [mwd]);
  }
  });
}

function validateThreadsSettings(sheet) {
  if (sheet.getName() !== "Threads") return { mode: "Error" };

  const numRows = getACellValue(resolve(THREADSDEFAULTS.TOTAL_UPGRADE));
  if (!isNaN(numRows) && numRows >= 1) {
    const inputTable = resolve(THREADSTABLES.SINNERS_TABLE_INPUT);
    const outputCol  = resolve(THREADSTABLES.SINNERS_TABLE_OUTPUT).col;

    const startRow = inputTable.startRow;
    const baseCol  = inputTable.startCol - 1;

    const inputValues = sheet.getRange(
      startRow,
      baseCol,
      numRows,
      inputTable.numCols + 1
    ).getValues();

    let hasRowError = false;
    const rowErrors = {}; 

    for (let i = 0; i < numRows; i++) {
      const row      = startRow + i;
      const input    = inputValues[i];
      const type     = input[THREADS_SINNER_INPUT.TYPE];
      const rarity   = input[THREADS_SINNER_INPUT.ID_RARITY];
      const idFrom   = input[THREADS_SINNER_INPUT.ID_FROM];
      const idTo     = input[THREADS_SINNER_INPUT.ID_TO];
      const egoGrade = input[THREADS_SINNER_INPUT.EGO_GRADE];
      const egoFrom  = input[THREADS_SINNER_INPUT.EGO_FROM];
      const egoTo    = input[THREADS_SINNER_INPUT.EGO_TO];

      const idFilled  = rarity !== "None" || idFrom   !== "None" || idTo  !== "None";
      const egoFilled = egoGrade !== "None" || egoFrom !== "None" || egoTo !== "None";

      let errorMsg = "";

      if (type === "None") {
      } else if (type === "Facade") {
        if (idFilled || egoFilled) errorMsg = "Error: Facade has extra fields";
      } else if (type === "Identity") {
        if (egoFilled)                                                    errorMsg = "Error: ID has EGO fields";
        else if (rarity === "None" || idFrom === "None" || idTo === "None") errorMsg = "Error: ID missing fields";
        else if (UPTIE_TIER_ORDER[idFrom] > UPTIE_TIER_ORDER[idTo])        errorMsg = "Error: From > To";
      } else if (type === "E.G.O") {
        if (idFilled)                                                             errorMsg = "Error: EGO has ID fields";
        else if (egoGrade === "None" || egoFrom === "None" || egoTo === "None")  errorMsg = "Error: EGO missing fields";
        else if (EGO_TIER_ORDER[egoFrom] > EGO_TIER_ORDER[egoTo])               errorMsg = "Error: From > To";
      }

      if (errorMsg) {
        rowErrors[row] = errorMsg; 
        hasRowError = true;
      }
    }

    const touchedRows = Object.keys(rowErrors).map(Number);
    if (touchedRows.length > 0) {
      const minRow = Math.min(...touchedRows);
      const maxRow = Math.max(...touchedRows);

      const block = sheet.getRange(minRow, outputCol, maxRow - minRow + 1, 1).getValues();
      touchedRows.forEach(row => { block[row - minRow][0] = rowErrors[row]; });
      sheet.getRange(minRow, outputCol, maxRow - minRow + 1, 1).setValues(block);
    }

    if (hasRowError) {
      setTableValues(resolve(THREADSTABLES.CLEAR_SKIP_CHECKER), [["Error: Row Errors"]]);
      return { mode: "Error" };
    }
  }

  return validateClearSkipSetting(
    resolve(THREADSTABLES.CLEAR_SKIP_SETTINGS),
    resolve(THREADSTABLES.CLEAR_SKIP_CHECKER)
  );
}
