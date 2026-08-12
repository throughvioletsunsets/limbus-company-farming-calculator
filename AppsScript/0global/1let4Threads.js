// 0global/1let4Threads.gs

let THREADSBLOCKS = memoizeBlocks("Threads", {

  HIGHEST_DUNGEON: () => BLOCK("HIGHEST_DUNGEON", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("HIGHEST_DUNGEON"),
    value: "Highest Dungeon Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [[60]],
      validations: [
      { kind: "DROPDOWN", options: THREADS_HIGHEST_DUNGEON }, ],
       colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  INITIAL_THREADS: () => BLOCK("INITIAL_THREADS", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("INITIAL_THREADS"),
    value: "Initial Threads Input",
    regions: [
      { key: "INPUT",   rowOffset: 1, colOffset: 0, type: "INPUT",  values: [[0]], colorOverrides: [{  scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  TOTAL_UPGRADE: () => BLOCK("TOTAL_UPGRADE", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("TOTAL_UPGRADE"),
    value: "Target Rows Input",
    regions: [
      { key: "INPUT",   rowOffset: 1, colOffset: 0, type: "INPUT",  values: [[1]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  THREADS_REQUIRED: () => BLOCK("THREADS_REQUIRED", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("THREADS_REQUIRED"),
    value: "Threads Required Output",
    regions: [
      { key: "OUTPUT", rowOffset: 1, colOffset: 0, type: "OUTPUT", values: [[0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  DELETE_ROWS: () => BLOCK("DELETE_ROWS", {
    sheet: "Threads", 
    anchorPos: resolveThreadsAnchorPosition("DELETE_ROWS"), 
    value: "Delete Rows Modifier Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", ""]],},
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Type", "From Row", "To Row", "Apply Changes?", "Error Checker", "Message"]] },
      { key: "INPUT",  rowOffset: 2, colOffset: 0, type: "INPUT",  values: [["Single Row", 1, 1, false]], 
      validations: [
      { col: 0, kind: "DROPDOWN", options: DELETE_ROWS_TYPES },
      { col: 3, kind: "CHECKBOX" },
      ], 
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "OUTPUT", rowOffset: 2, colOffset: 4, type: "OUTPUT", values: [["Error Checker", "Idle! Edit the input cells to begin."]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  SINNERS_TABLE: () => BLOCK("SINNERS_TABLE", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("SINNERS_TABLE"),
    value: "Target Table",
    regions: [
      { key: "THREADS_HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "Identity", "", "", "E.G.O", "", ""]], colorOverrides: [
          { col: 2, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 3, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW },
          { col: 4, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW },
          { col: 5, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED },
          { col: 6, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED },
          { col: 7, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED }] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["No", "Name (Optional)", "Type", "Identity Rarity", "From Identity Tier", "To Identity Tier", "E.G.O Grade", "From E.G.O Rank", "To E.G.O Rank", "Threads Required"]] },
      { key: "NUMBER", rowOffset: 2, colOffset: 0, type: "CONSTANT", values: [[1]], colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }]  },
      { key: "INPUT",  rowOffset: 2, colOffset: 1, type: "INPUT",
        values: [["A Sinner", "Facade", "None", "None", "None", "None", "None", "None"]],
        validations: dropdownsToValidations(THREADS_UPGRADE_CONFIG.dropdowns), colorOverrides: [{  scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "OUTPUT", rowOffset: 2, colOffset: 9, type: "OUTPUT", values: [[0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  CLEAR_SKIP: () => BLOCK("CLEAR_SKIP", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("CLEAR_SKIP"),
    value: "Clear-Skip Input",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [["Message"]] },
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["Clear"]],
        validations: [
          { kind: "DROPDOWN", options: ["Clear", "Skip"] },
        ],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]},
      { key: "CHECKER", rowOffset: 1, colOffset: 1, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  TODAY_BONUS: () => BLOCK("TODAY_BONUS", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("TODAY_BONUS"),
    value: "Today Bonus Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [[3]], 
      validations: [
      { kind: "DROPDOWN", options: THREADS_TODAY_BONUS_OPTIONS }, ],  
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  DAILIES: () => BLOCK("DAILIES", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("DAILIES"),
    value: "Dailies Only Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["No"]], 
      validations: [
      { kind: "DROPDOWN", options: YES_NO }, ],
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  MINUTES_SECONDS: () => BLOCK("MINUTES_SECONDS", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("MINUTES_SECONDS"),
    value: "Lux Clear Time Input",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [[""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Minutes", "Seconds"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 0, type: "INPUT", values: [[0, 4]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]},
      { key: "CHECKER", rowOffset: 3, colOffset: 0, type: "OUTPUT", values: [["Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  TOTAL_RUNS: () => BLOCK("TOTAL_RUNS", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("TOTAL_RUNS"),
    value: "Lux Runs Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", ""]],},
      { key: "DIFFICULTY_HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Difficulty", 60, 50, 40, 30, 20]] },
      { key: "RUNS_HEADER", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Clear (Base) Amount"], ["Clear (Daily) Amount"], ["Skip (Base) Amount"], ["Skip (Daily) Amount"], ["Threads Obtained"]] },
      { key: "RUNS", rowOffset: 2, colOffset: 1, type: "OUTPUT",
        values: [ 
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
        colorOverrides: [{scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  EXCESS_THREADS: () => BLOCK("EXCESS_THREADS", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("EXCESS_THREADS"),
    value: "Excess Threads Output",
    regions: [
      { key: "OUTPUT", rowOffset: 1, colOffset: 0, type: "OUTPUT", values: [[0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  TIME_MODULE: () => BLOCK("TIME_MODULE", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("TIME_MODULE"),
    value: "Time and Module Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Expected Module Spent"], ["Expected Time Completion"]] },
      { key: "VALUES", rowOffset: 1, colOffset: 1, type: "OUTPUT", values: [[0], [0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "TEXT", rowOffset: 1, colOffset: 2, type: "LABEL", values: [["modules"], ["seconds"]] },
    ]
  }),

  HMS: () => BLOCK("HMS", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("HMS"),
    value: "Hours-Min-Sec Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["hours and", "minutes and", "seconds"]] },
      { key: "VALUES", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0]],
        colorOverrides: [{scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  MWD: () => BLOCK("MWD", {
    sheet: "Threads",
    anchorPos: resolveThreadsAnchorPosition("MWD"),
    value: "Months-Weeks-Days Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["months and", "weeks and", "days"]] },
      { key: "VALUES", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0]],
        colorOverrides: [{scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

});




let THREADSANCHORS = {
  HIGHEST_DUNGEON_ANCHOR:  () => resolve(THREADSBLOCKS.HIGHEST_DUNGEON).ANCHOR,
  INITIAL_THREADS_ANCHOR:  () => resolve(THREADSBLOCKS.INITIAL_THREADS).ANCHOR,
  TOTAL_UPGRADE_ANCHOR:    () => resolve(THREADSBLOCKS.TOTAL_UPGRADE).ANCHOR,
  THREADS_REQUIRED_ANCHOR: () => resolve(THREADSBLOCKS.THREADS_REQUIRED).ANCHOR,
  DELETE_ROWS_ANCHOR:      () => resolve(THREADSBLOCKS.DELETE_ROWS).ANCHOR,
  SINNERS_TABLE_ANCHOR:    () => resolve(THREADSBLOCKS.SINNERS_TABLE).ANCHOR,
  CLEAR_SKIP_ANCHOR:         () => resolve(THREADSBLOCKS.CLEAR_SKIP).ANCHOR,
  TODAY_BONUS_ANCHOR:      () => resolve(THREADSBLOCKS.TODAY_BONUS).ANCHOR,
  DAILIES_ANCHOR:          () => resolve(THREADSBLOCKS.DAILIES).ANCHOR,
  MINUTES_SECONDS_ANCHOR:  () => resolve(THREADSBLOCKS.MINUTES_SECONDS).ANCHOR,
  TOTAL_RUNS_ANCHOR:       () => resolve(THREADSBLOCKS.TOTAL_RUNS).ANCHOR,
  EXCESS_THREADS_ANCHOR:   () => resolve(THREADSBLOCKS.EXCESS_THREADS).ANCHOR,
  TIME_MODULE_ANCHOR:      () => resolve(THREADSBLOCKS.TIME_MODULE).ANCHOR,
  HMS_ANCHOR:              () => resolve(THREADSBLOCKS.HMS).ANCHOR,
  MWD_ANCHOR:              () => resolve(THREADSBLOCKS.MWD).ANCHOR,
};




let THREADSTABLES = {
  DELETE_ROWS_TABLE_INPUT:      () => resolve(THREADSBLOCKS.DELETE_ROWS).INPUT,
  DELETE_ROWS_TABLE_OUTPUT:     () => resolve(THREADSBLOCKS.DELETE_ROWS).OUTPUT,

  SINNERS_TABLE_INPUT:          () => resolve(THREADSBLOCKS.SINNERS_TABLE).INPUT,
  SINNERS_TABLE_NUMBER:    () => resolve(THREADSBLOCKS.SINNERS_TABLE).NUMBER,
  SINNERS_TABLE_OUTPUT:         () => resolve(THREADSBLOCKS.SINNERS_TABLE).OUTPUT,

  CLEAR_SKIP_SETTINGS: () => resolve(THREADSBLOCKS.CLEAR_SKIP).INPUT,
  CLEAR_SKIP_CHECKER:  () => resolve(THREADSBLOCKS.CLEAR_SKIP).CHECKER,

  MINUTES_SECONDS:               () => resolve(THREADSBLOCKS.MINUTES_SECONDS).INPUT,
  MINUTES_SECONDS_CHECKER:       () => resolve(THREADSBLOCKS.MINUTES_SECONDS).CHECKER,

  TOTAL_RUNS:                    () => resolve(THREADSBLOCKS.TOTAL_RUNS).RUNS,

  EXPECTED_TOTAL_TIME_MODULE:    () => resolve(THREADSBLOCKS.TIME_MODULE).VALUES,
  EXPECTED_HMS:                  () => resolve(THREADSBLOCKS.HMS).VALUES,
  EXPECTED_MWD:                  () => resolve(THREADSBLOCKS.MWD).VALUES,
};




let THREADSDEFAULTS = {
  HIGHEST_DUNGEON_UNLOCK:  () => resolve(THREADSBLOCKS.HIGHEST_DUNGEON).INPUT,

  INITIAL_THREADS_INPUT:   () => resolve(THREADSBLOCKS.INITIAL_THREADS).INPUT,
  INITIAL_THREADS_CHECKER: () => resolve(THREADSBLOCKS.INITIAL_THREADS).CHECKER,

  TOTAL_UPGRADE:           () => resolve(THREADSBLOCKS.TOTAL_UPGRADE).INPUT,
  TOTAL_UPGRADE_CHECKER:   () => resolve(THREADSBLOCKS.TOTAL_UPGRADE).CHECKER,

  TOTAL_THREADS_REQUIRED:  () => resolve(THREADSBLOCKS.THREADS_REQUIRED).OUTPUT,

  TODAY_BONUS_INPUT:       () => resolve(THREADSBLOCKS.TODAY_BONUS).INPUT,
  DAILIES_INPUT:           () => resolve(THREADSBLOCKS.DAILIES).INPUT,

  EXCESS_THREADS:          () => resolve(THREADSBLOCKS.EXCESS_THREADS).OUTPUT,
};