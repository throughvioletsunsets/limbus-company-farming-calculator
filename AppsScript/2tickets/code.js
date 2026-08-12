// 2tickets/code.gs

function spendTicketsForXP(pool, xpNeeded, ticketXP) {
  let xpLeft = xpNeeded;
  const spent = [0, 0, 0, 0];

  for (let t = 0; t < 4; t++) {
    if (xpLeft <= 0) break;
    if (pool[t] <= 0) continue;

    const isLast = t === 3 || pool.slice(t + 1).every(p => p <= 0);

    if (isLast) {
      const ticketsNeeded = Math.ceil(xpLeft / ticketXP[t]);
      const ticketsUsed   = Math.min(ticketsNeeded, pool[t]); // capped — never exceeds pool
      spent[t] += ticketsUsed;
      pool[t]  -= ticketsUsed;
      xpLeft   -= ticketsUsed * ticketXP[t];
    } else {
      const ticketsNeeded = Math.floor(xpLeft / ticketXP[t]);
      if (ticketsNeeded === 0) continue;
      const ticketsUsed = Math.min(ticketsNeeded, pool[t]);
      spent[t] += ticketsUsed;
      pool[t]  -= ticketsUsed;
      xpLeft   -= ticketsUsed * ticketXP[t];
    }
  }

  return { spent, xpLeft }; 
}

function simulateTicketDistribution(pool, rowXPNeeds, ticketXP) {
  pool = pool.slice();
  let shortfall = false;

  const perRow = rowXPNeeds.map(xpNeeded => {
    if (typeof xpNeeded === "string" || xpNeeded < 0) {
      return { spent: [0, 0, 0, 0], xpNeeded, xpLeft: 0, excess: 0, error: true };
    }
    const { spent, xpLeft } = spendTicketsForXP(pool, xpNeeded, ticketXP);
    if (xpLeft > 0) shortfall = true;
    const xpSpent = spent.reduce((sum, s, t) => sum + s * ticketXP[t], 0);
    return { spent, xpNeeded, xpLeft, excess: xpSpent - xpNeeded };
  });

  return { perRow, pool, shortfall };
}

function recalculateTicketDistribution(sheet, settings) {
  return profWrap("recalculateTicketDistribution", () => {
  if (sheet.getName() !== "Tickets") return;
  if (settings.mode === "Error") return;

  const numIdentities = getACellValue(resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP));
  if (typeof numIdentities === "string" || isNaN(numIdentities) || numIdentities < 1) return;

  const ticketValues = getTableValues(resolve(TICKETSTABLES.TOTAL_RUNS_TICKETS));
  const pool = [0, 0, 0, 0];
  ticketValues.forEach((row, t) => { pool[t] = row.reduce((sum, v) => sum + v, 0); });

  const initialTickets = getTableValues(resolve(TICKETSTABLES.INITIAL_TICKETS_INPUT))[0];
  initialTickets.forEach((v, t) => { pool[t] += (v || 0); });

  const ticketXP = resolve(LIBRARYTABLES.TICKET_TABLE).values[0];

  const sinnerInput  = resolve(TICKETSTABLES.SINNERS_TABLE_INPUT);
  const startRow = sinnerInput.startRow;
  const baseCol  = sinnerInput.startCol - 1;

  const sinnerValues = sheet.getRange(startRow, baseCol, numIdentities, sinnerInput.numCols + 1).getValues();

  const rowXPNeeds = sinnerValues.map(row => computeTicketsMinXPFromValues(
    row[TICKETS_SINNER_INPUT.FROM],
    row[TICKETS_SINNER_INPUT.EXCESS],
    row[TICKETS_SINNER_INPUT.TO]
  ));

  const { perRow, pool: finalPool } = simulateTicketDistribution(pool, rowXPNeeds, ticketXP);

  const dist = resolve(TICKETSTABLES.SINNERS_DISTRIBUTION);
  const outputRows = sinnerValues.map((sinnerRow, i) => {
    const name = sinnerRow[TICKETS_SINNER_INPUT.NAME];
    const from = sinnerRow[TICKETS_SINNER_INPUT.FROM];
    const excess = sinnerRow[TICKETS_SINNER_INPUT.EXCESS];
    const to = sinnerRow[TICKETS_SINNER_INPUT.TO];
    const xpNeeded = rowXPNeeds[i];
    const r = perRow[i];

    if (typeof xpNeeded === "string" || xpNeeded < 0 || r.error) {
      return [i + 1, name, from, excess, to, 0, 0, 0, 0, 0, 0];
    }

    if (r.xpLeft > 0) {
      return [i + 1, name, from, excess, to, xpNeeded, r.spent[0], r.spent[1], r.spent[2], r.spent[3], "Error: Insufficient Tickets"];
    }

    return [i + 1, name, from, excess, to, xpNeeded, r.spent[0], r.spent[1], r.spent[2], r.spent[3], r.excess];
  });

  sheet.getRange(dist.startRow, dist.startCol, numIdentities, dist.numCols).setValues(outputRows);

  setTableValues(resolve(TICKETSTABLES.EXCESS_TICKETS), [finalPool]);
  });
}

var levelCache = null;

function validateSettings(sheet) {
  return validateClearSkipSetting(
    resolve(TICKETSTABLES.CLEAR_SKIP_SETTINGS),
    resolve(TICKETSTABLES.CLEAR_SKIP_CHECKER)
  );
}

function computeInitialXP(ticketValues) {
  const denom = resolve(LIBRARYTABLES.TICKET_TABLE).values[0]; // [IV, III, II, I]
  return ticketValues.reduce((sum, val, i) => sum + (val || 0) * denom[i], 0);
}

function recalculateSumXP(sheet) {
 return profWrap("recalculateSumXP", () => {
  if (sheet.getName() !== "Tickets") return;

  const totalIdentityCell = resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP);
  const checkerCell       = resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_CHECKER);  

  let totalIdentityLevelUp = processAndValidateCell(getACellValue(totalIdentityCell), 1, 1, MAX_SINNER_ROWS);

  if (typeof totalIdentityLevelUp === "string") {
    setACellValue(checkerCell, totalIdentityLevelUp)
    return;
  }

  setACellValue(checkerCell, "Error Checker");

  const inputTable   = resolve(TICKETSTABLES.INITIAL_TICKETS_INPUT);
  const checkerTable = resolve(TICKETSTABLES.INITIAL_TICKETS_CHECKER);
  const sinnerInput  = resolve(TICKETSTABLES.SINNERS_TABLE_INPUT);
  const outputTable  = resolve(TICKETSTABLES.SINNERS_TABLE_OUTPUT);

  const ticketValues = getTableValues(inputTable)[0];

  const ticketErrors = ticketValues.map((raw, i) => {
    const val = processAndValidateCell(raw, 0, 0);
    return typeof val === "string" ? val : "Error Checker";
  });

  setTableValues(checkerTable, [ticketErrors]);

  const hasTicketError = ticketErrors.some(v => v !== "Error Checker");
  if (hasTicketError) return;

  const numRows = Number(totalIdentityLevelUp);

  const totalXPInitial = computeInitialXP(ticketValues);
  setACellValue(resolve(TICKETSDEFAULTS.TOTAL_XP_INITIAL), totalXPInitial);

  const fromCol = sinnerInput.startCol - 1 + TICKETS_SINNER_INPUT.FROM;
  const rawInputRows = sheet.getRange(sinnerInput.startRow, fromCol, numRows, 3).getValues();

  let pool = totalXPInitial;
  let sumFinalXP = 0;

  const outputRows = rawInputRows.map(([rawFrom, rawExcess, rawTo]) => {
    const rawMinXP = computeTicketsMinXPFromValues(rawFrom, rawExcess, rawTo);

    if (typeof rawMinXP === "string") {
      return [rawMinXP, 0, 0, 0, 0, 0];
    }

    const spend   = Math.min(pool, rawMinXP);
    const finalXP = rawMinXP - spend;
    pool -= spend;
    sumFinalXP += finalXP;

    const b = computeTicketBreakdown(finalXP);
    return [finalXP, b.IV, b.III, b.II, b.I, b.excess];
  });

  sheet.getRange(outputTable.startRow, outputTable.startCol, numRows, outputTable.numCols)
    .setValues(outputRows);

  const totalXPRequired = sumFinalXP;
  setACellValue(resolve(TICKETSDEFAULTS.TOTAL_XP_REQUIRED), totalXPRequired);

  const breakdown = computeTicketBreakdown(totalXPRequired);

  setTableValues(resolve(TICKETSTABLES.TOTAL_TICKETS_REQUIRED), [[
    breakdown.IV, breakdown.III, breakdown.II, breakdown.I, breakdown.excess
  ]]);
 });
}






function recalculateExpectedTimeModule(sheet, settings, msResult) {
  if (sheet.getName() !== "Tickets") return;
  if (settings.mode === "Error") return;

  msResult = msResult || validateMinutesSecondsTable(resolve(TICKETSTABLES.MINUTES_SECONDS));
  if (msResult.error) return;
  const singleSeconds = msResult.totalSeconds;

  const { clearRuns, skipRuns } = getMixResult();
  const section = getACellValue(resolve(TICKETSDEFAULTS.HIGHEST_DUNGEON_UNLOCK));

  const clearData = getTicketsRow(section, "Clear");
  const skipData  = getTicketsRow(section, "Skip");
  if (!clearData || !skipData) return;

  const skipTime     = Math.ceil(skipRuns / 10) * 3;
  const totalSeconds = clearRuns * singleSeconds + skipTime;
  
  const module       = clearRuns * clearData[TICKETS_CONST.TOTAL_MODULE] + skipRuns * skipData[TICKETS_CONST.TOTAL_MODULE];

  setTableValues(resolve(TICKETSTABLES.EXPECTED_TIME_MODULE), [[module], [totalSeconds]]);

  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hms = [0, 0, 0];
  hms[EXPECTED_HMS.HOURS]   = hours;
  hms[EXPECTED_HMS.MINUTES] = minutes;
  hms[EXPECTED_HMS.SECONDS] = seconds;
  setTableValues(resolve(TICKETSTABLES.EXPECTED_TIME_HMS), [hms]);
}

function recalculateTotalRuns(sheet, settings, msResult) {
  return profWrap("recalculateTotalRuns", () => {
  if (sheet.getName() !== "Tickets") return;
  if (settings.mode === "Error") return;

  const totalXP = getACellValue(resolve(TICKETSDEFAULTS.TOTAL_XP_REQUIRED));
  if (typeof totalXP === "string" || isNaN(totalXP)) return;

  const section = getACellValue(resolve(TICKETSDEFAULTS.HIGHEST_DUNGEON_UNLOCK));
  const activeCol = 9 - section;

  const clearData = getTicketsRow(section, "Clear");
  const skipData  = getTicketsRow(section, "Skip");
  if (!clearData || !skipData) return;

  const data = settings.type === "Clear" ? clearData : skipData;
  const tierYield = [
    data[TICKETS_CONST.IV], data[TICKETS_CONST.III],
    data[TICKETS_CONST.II], data[TICKETS_CONST.I],
  ];
  const ticketXP = resolve(LIBRARYTABLES.TICKET_TABLE).values[0]; 

  const numRows = getACellValue(resolve(TICKETSDEFAULTS.TOTAL_IDENTITY_LEVEL_UP));
  const outputTable = resolve(TICKETSTABLES.SINNERS_TABLE_OUTPUT);
  const rowXPNeeds = sheet.getRange(
    outputTable.startRow, outputTable.startCol, numRows, 1
  ).getValues().map(r => r[0]);

  let runs = data[TICKETS_CONST.TOTAL_XP] > 0 ? Math.ceil(totalXP / data[TICKETS_CONST.TOTAL_XP]) : 0;

  const MAX_ITER = 100000; // safety cap, same spirit as solveMDRuns
  for (let iter = 0; iter < MAX_ITER; iter++) {
    const pool = tierYield.map(y => y * runs);
    const { shortfall } = simulateTicketDistribution(pool, rowXPNeeds, ticketXP);
    if (!shortfall) break;
    runs++;
  }

  let clearRuns = 0, skipRuns = 0;
  if (settings.type === "Clear") clearRuns = runs; else skipRuns = runs;

  setMixResult(clearRuns, skipRuns);

  // ===== TOTAL_RUNS ===== (unchanged below)
  const clearRow = Array(9).fill(0);
  const skipRow  = Array(9).fill(0);
  clearRow[activeCol] = clearRuns;
  skipRow[activeCol]  = skipRuns;
  setTableValues(TICKETSTABLES.TOTAL_RUNS, [clearRow, skipRow]);

  const ticketConsts = [TICKETS_CONST.IV, TICKETS_CONST.III, TICKETS_CONST.II, TICKETS_CONST.I];
  const ticketRows   = ticketConsts.map(tc => {
    const row = Array(9).fill(0);
    row[activeCol] = clearRuns * clearData[tc] + skipRuns * skipData[tc];
    return row;
  });
  setTableValues(resolve(TICKETSTABLES.TOTAL_RUNS_TICKETS), ticketRows);
  });
}
function handleIdentityLevelUp(e, sheet, isForced) {
  return runSinnerUpgrade(TICKETS_UPGRADE_CONFIG, e, sheet, isForced);
}

function getLevelData() {
  if (!levelCache) {
    levelCache = getTableValues(resolve(LIBRARYTABLES.LEVEL_TABLE));
  }
  return levelCache;
}

function computeTicketsMinXPFromValues(rawFrom, rawExcess, rawTo) {
  const fromLevel = processAndValidateCell(rawFrom, 1, 1);
  if (typeof fromLevel === "string") return fromLevel;
  const excessLevel = processAndValidateCell(rawExcess, 0, 0);
  if (typeof excessLevel === "string") return excessLevel;
  const toLevel = processAndValidateCell(rawTo, 2, 2);
  if (typeof toLevel === "string") return toLevel;

  const levelData = getLevelData();
  const lookup = level => { const m = levelData.find(r => r[0] === level); return m ? m[2] : null; };
  const fromXP = lookup(fromLevel), toXP = lookup(toLevel);

  if (fromXP === null || toXP === null) return "Error: Invalid Level";
  if (toXP < fromXP + excessLevel)      return "Error: Invalid Level Up";
  return toXP - fromXP - excessLevel;
}

function writeTicketsRowsBatch(sheet, startRow, numRows) {
  recalcSinnerRowsBatch(ticketsBatchConfig(), sheet, startRow, numRows);
}

function computeTicketBreakdown(xp) {
  if (typeof xp === "string") return { IV: 0, III: 0, II: 0, I: 0, excess: 0 };

  const denom = resolve(LIBRARYTABLES.TICKET_TABLE).values[0]; // [IV, III, II, I]

  const ivCount  = Math.floor(xp / denom[TICKET_CONST.IV]);
  const r1       = xp % denom[TICKET_CONST.IV];
  const iiiCount = Math.floor(r1 / denom[TICKET_CONST.III]);
  const r2       = r1 % denom[TICKET_CONST.III];
  const iiCount  = Math.floor(r2 / denom[TICKET_CONST.II]);
  const r3       = r2 % denom[TICKET_CONST.II];
  const iCount   = Math.floor(r3 / denom[TICKET_CONST.I]) + 1;
  const excess   = denom[TICKET_CONST.I] - (r3 % denom[TICKET_CONST.I]);

  return { IV: ivCount, III: iiiCount, II: iiCount, I: iCount, excess };
}