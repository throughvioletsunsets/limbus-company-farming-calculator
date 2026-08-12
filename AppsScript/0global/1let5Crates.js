// 0global/1let5Crates.gs

let CRATESBLOCKS = memoizeBlocks("Crates", {

  HARD_INPUT: () => BLOCK("HARD_INPUT", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("HARD_INPUT"),
    value: "Hard Mode Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["Yes"]], 
      validations: [
      { kind: "DROPDOWN", options: YES_NO }, ],
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  PASS_INPUT: () => BLOCK("PASS_INPUT", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("PASS_INPUT"),
    value: "Limbus Pass Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["No"]], 
      validations: [
      { kind: "DROPDOWN", options: YES_NO }, ],
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  CRATES_INPUT: () => BLOCK("CRATES_INPUT", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("CRATES_INPUT"),
    value: "Nominable Crates Input",
    regions: [
      { key: "INPUT",   rowOffset: 1, colOffset: 0, type: "INPUT",  values: [[0]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  PASS_EXCESS: () => BLOCK("PASS_EXCESS", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("PASS_EXCESS"),
    value: "Pass Excess Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [[0]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  INITIAL_SHARDS_1: () => BLOCK("INITIAL_SHARDS_1", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("INITIAL_SHARDS_1"),
    value: "Sinners Shards Table 1",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", ""]],},
      { key: "SINNER_HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Sinner Name", "Yi Sang", "Faust", "Don Quixote", "Ryoshu", "Meursault", "Hong Lu"]],
        colorOverrides: [
          { col: 1, color: COLORS.YI_SANG }, 
          { col: 2, color: COLORS.FAUST }, 
          { col: 3, color: COLORS.DON_QUIXOTE }, 
          { col: 4, color: COLORS.RYOSHU, fontColor: COLORS.WHITE },
          { col: 5, color: COLORS.MEURSAULT, fontColor: COLORS.WHITE},
          { col: 6, color: COLORS.HONG_LU},] },
      { key: "HEADER", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Initial Sinner Shards"], ["Error Checker"], ["Total Sinner Shards Required"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 1, type: "INPUT", values: [[0, 0, 0, 0, 0, 0]],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 3, colOffset: 1, type: "OUTPUT",
        values: [["Error Checker", "Error Checker", "Error Checker", "Error Checker", "Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "REQ", rowOffset: 4, colOffset: 1, type: "OUTPUT", values: [[0, 0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  INITIAL_SHARDS_2: () => BLOCK("INITIAL_SHARDS_2", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("INITIAL_SHARDS_2"),
    value: "Sinners Shards Table 2",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", ""]],},
      { key: "SINNER_HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Sinner Name", "Heathcliff", "Ishmael", "Rodion", "Sinclair", "Outis", "Gregor"]],
        colorOverrides: [
          { col: 1, color: COLORS.HEATHCLIFF, fontColor: COLORS.WHITE }, 
          { col: 2, color: COLORS.ISHMAEL }, 
          { col: 3, color: COLORS.RODION, fontColor: COLORS.WHITE }, 
          { col: 4, color: COLORS.SINCLAIR },
          { col: 5, color: COLORS.OUTIS, fontColor: COLORS.WHITE},
          { col: 6, color: COLORS.GREGOR, fontColor: COLORS.WHITE},] },
      { key: "HEADER", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Initial Sinner Shards"], ["Error Checker"], ["Total Sinner Shards Required"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 1, type: "INPUT", values: [[0, 0, 0, 0, 0, 0]],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 3, colOffset: 1, type: "OUTPUT",
        values: [["Error Checker", "Error Checker", "Error Checker", "Error Checker", "Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "REQ", rowOffset: 4, colOffset: 1, type: "OUTPUT", values: [[0, 0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  SEASON_SHARDS: () => BLOCK("SEASON_SHARDS", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("SEASON_SHARDS"),
    value: "Season Shards Input",
    regions: [
      { key: "INPUT",   rowOffset: 1, colOffset: 0, type: "INPUT",  values: [[0]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  TOTAL_UPGRADE: () => BLOCK("TOTAL_UPGRADE", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("TOTAL_UPGRADE"),
    value: "Target Rows Input",
    regions: [
      { key: "INPUT",   rowOffset: 1, colOffset: 0, type: "INPUT",  values: [[1]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]},
      { key: "CHECKER", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  SHARDS_REQ: () => BLOCK("SHARDS_REQ", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("SHARDS_REQ"),
    value: "Total Shards Required Output",
    regions: [
      { key: "OUTPUT", rowOffset: 1, colOffset: 0, type: "OUTPUT", values: [[1]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  CRATES_REQ: () => BLOCK("CRATES_REQ", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("CRATES_REQ"),
    value: "Total Crates Required Table",
    regions: [
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Minimum", "Average", "Maximum"]] },
      { key: "OUTPUT", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0]],colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  DELETE_ROWS: () => BLOCK("DELETE_ROWS", {
    sheet: "Crates", 
    anchorPos: resolveCratesAnchorPosition("DELETE_ROWS"), 
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
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]  },
      { key: "OUTPUT", rowOffset: 2, colOffset: 4, type: "OUTPUT", values: [["Error Checker", "Idle! Edit the input cells to begin."]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  SINNERS_TABLE: () => BLOCK("SINNERS_TABLE", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("SINNERS_TABLE"),
    value: "Target Table",
    regions: [
      { key: "CRATES_HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "Identity", "", "", "E.G.O", "", "", "", "", "", ""]], colorOverrides: [
          { col: 3, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 4, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW },
          { col: 5, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW },
          { col: 6, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED },
          { col: 7, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED },
          { col: 8, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED }] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["No", "Name (Optional)","Sinner", "Type", "Identity Rarity", "From Identity Tier", "To Identity Tier", "E.G.O Grade", "From E.G.O Rank", "To E.G.O Rank", "Initial Shards Required", "Final Shards Required", "Final Min Crates Required", "Final Avg Crates Required", "Final Max Crates Required"]] },
      
      { key: "NUMBER", rowOffset: 2, colOffset: 0, type: "CONSTANT", values: [[1]], colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }]  },
      { key: "INPUT",  rowOffset: 2, colOffset: 1, type: "INPUT",
        values: [["A Sinner", "Yi Sang", "Unlock Facade", "None", "None", "None", "None", "None", "None"]], validations: dropdownsToValidations(CRATES_UPGRADE_CONFIG.dropdowns), colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "OUTPUT", rowOffset: 2, colOffset: 10, type: "OUTPUT", values: [[0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  WEEK_BONUS: () => BLOCK("WEEK_BONUS", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("WEEK_BONUS"),
    value: "Week Bonus Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["Yes"]], 
      validations: [
      { kind: "DROPDOWN", options: YES_NO }, ],
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  WEEKLIES: () => BLOCK("WEEKLIES", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("WEEKLIES"),
    value: "Weeklies Only Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["No"]], 
      validations: [
      { kind: "DROPDOWN", options: YES_NO }, ],
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  CRATES_VALUE: () => BLOCK("CRATES_VALUE", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("CRATES_VALUE"),
    value: "Crates Target Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["Average"]], 
      validations: [
      { kind: "DROPDOWN", options: CRATES_TYPES }, ],
      colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  EASY_TIME: () => BLOCK("EASY_TIME", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("EASY_TIME"),
    value: "Weekly Easy Time Input",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [[""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Hours", "Minutes"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 0, type: "INPUT", values: [[0, 1]],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 3, colOffset: 0, type: "OUTPUT", values: [["Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  HARD_TIME: () => BLOCK("HARD_TIME", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("HARD_TIME"),
    value: "Weekly Hard Time Input",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [[""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Hours", "Minutes"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 0, type: "INPUT", values: [[0, 1]],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 3, colOffset: 0, type: "OUTPUT", values: [["Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  NORMAL_TIME: () => BLOCK("NORMAL_TIME", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("NORMAL_TIME"),
    value: "Normal Time Input",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [[""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Hours", "Minutes"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 0, type: "INPUT", values: [[0, 1]],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 3, colOffset: 0, type: "OUTPUT", values: [["Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]},
    ]
  }),

  TOTAL_RUNS: () => BLOCK("TOTAL_RUNS", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("TOTAL_RUNS"),
    value: "Mirror Dungeon Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", ""]] },
      { key: "TYPE_HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Mirror Dungeon Type", "Easy with Bonus", "Hard with Bonus", "No Bonus"]] },
      { key: "HEADER", rowOffset: 2, colOffset: 0, type: "LABEL", values: [["Total Claims"], ["Limbus Pass XP Obtained"]] },
      { key: "RUNS", rowOffset: 2, colOffset: 1, type: "OUTPUT",
        values: [[0, 0, 0], [0, 0, 0]],colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  CRATES_EXCESS: () => BLOCK("CRATES_EXCESS", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("CRATES_EXCESS"),
    value: "Sum Rewards Table",
    footprint: { numCols: 3 },
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Total"], ["and an excess of"]] },
      { key: "VALUES", rowOffset: 1, colOffset: 1, type: "OUTPUT", values: [[0], [0]],colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "TEXT", rowOffset: 1, colOffset: 2, type: "LABEL", values: [["crates"], ["Limbus Pass XP"]] },
    ]
  }),

  TIME_MODULE: () => BLOCK("TIME_MODULE", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("TIME_MODULE"),
    value: "Time and Module Table",
    footprint: { numCols: 3 },
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Expected Module Spent"], ["Expected Time Completion"]] },
      { key: "VALUES", rowOffset: 1, colOffset: 1, type: "OUTPUT", values: [[0], [0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "TEXT", rowOffset: 1, colOffset: 2, type: "LABEL", values: [["modules"], ["minutes"]] },
    ]
  }),

  TIME_TOTAL: () => BLOCK("TIME_TOTAL", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("TIME_TOTAL"),
    value: "Total Time Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["months and", "weeks and", "days and", "hours and", "minutes"]] },
      { key: "VALUES", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  TIME_REAL: () => BLOCK("TIME_REAL", {
    sheet: "Crates",
    anchorPos: resolveCratesAnchorPosition("TIME_REAL"),
    value: "Dailies-Weeklies Time Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["months and", "weeks and", "days and", "hours and", "minutes"]] },
      { key: "VALUES", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

});




let CRATESANCHORS = {
  HARD_INPUT_ANCHOR:        () => resolve(CRATESBLOCKS.HARD_INPUT).ANCHOR,
  PASS_INPUT_ANCHOR:        () => resolve(CRATESBLOCKS.PASS_INPUT).ANCHOR,
  CRATES_INPUT_ANCHOR:      () => resolve(CRATESBLOCKS.CRATES_INPUT).ANCHOR,
  PASS_EXCESS_ANCHOR:       () => resolve(CRATESBLOCKS.PASS_EXCESS).ANCHOR,
  INITIAL_SHARDS_1_ANCHOR:  () => resolve(CRATESBLOCKS.INITIAL_SHARDS_1).ANCHOR,
  INITIAL_SHARDS_2_ANCHOR:  () => resolve(CRATESBLOCKS.INITIAL_SHARDS_2).ANCHOR,
  SEASON_SHARDS_ANCHOR:     () => resolve(CRATESBLOCKS.SEASON_SHARDS).ANCHOR,
  TOTAL_UPGRADE_ANCHOR:     () => resolve(CRATESBLOCKS.TOTAL_UPGRADE).ANCHOR,
  SHARDS_REQ_ANCHOR:        () => resolve(CRATESBLOCKS.SHARDS_REQ).ANCHOR,
  CRATES_REQ_ANCHOR:        () => resolve(CRATESBLOCKS.CRATES_REQ).ANCHOR,
  DELETE_ROWS_ANCHOR:       () => resolve(CRATESBLOCKS.DELETE_ROWS).ANCHOR,
  SINNERS_TABLE_ANCHOR:     () => resolve(CRATESBLOCKS.SINNERS_TABLE).ANCHOR,
  WEEK_BONUS_ANCHOR:        () => resolve(CRATESBLOCKS.WEEK_BONUS).ANCHOR,
  WEEKLIES_ANCHOR:          () => resolve(CRATESBLOCKS.WEEKLIES).ANCHOR,
  CRATES_VALUE_ANCHOR:      () => resolve(CRATESBLOCKS.CRATES_VALUE).ANCHOR,
  EASY_TIME_ANCHOR:         () => resolve(CRATESBLOCKS.EASY_TIME).ANCHOR,
  HARD_TIME_ANCHOR:         () => resolve(CRATESBLOCKS.HARD_TIME).ANCHOR,
  NORMAL_TIME_ANCHOR:       () => resolve(CRATESBLOCKS.NORMAL_TIME).ANCHOR,
  TOTAL_RUNS_ANCHOR:        () => resolve(CRATESBLOCKS.TOTAL_RUNS).ANCHOR,
  CRATES_EXCESS_ANCHOR:     () => resolve(CRATESBLOCKS.CRATES_EXCESS).ANCHOR,
  TIME_MODULE_ANCHOR:       () => resolve(CRATESBLOCKS.TIME_MODULE).ANCHOR,
  TIME_TOTAL_ANCHOR:        () => resolve(CRATESBLOCKS.TIME_TOTAL).ANCHOR,
  TIME_REAL_ANCHOR:         () => resolve(CRATESBLOCKS.TIME_REAL).ANCHOR,
};




let CRATESTABLES = {
  INITIAL_SHARDS_1_INPUT:   () => resolve(CRATESBLOCKS.INITIAL_SHARDS_1).INPUT,
  INITIAL_SHARDS_1_CHECKER: () => resolve(CRATESBLOCKS.INITIAL_SHARDS_1).CHECKER,
  INITIAL_SHARDS_REQ_1:     () => resolve(CRATESBLOCKS.INITIAL_SHARDS_1).REQ,

  INITIAL_SHARDS_2_INPUT:   () => resolve(CRATESBLOCKS.INITIAL_SHARDS_2).INPUT,
  INITIAL_SHARDS_2_CHECKER: () => resolve(CRATESBLOCKS.INITIAL_SHARDS_2).CHECKER,
  INITIAL_SHARDS_REQ_2:     () => resolve(CRATESBLOCKS.INITIAL_SHARDS_2).REQ,

  CRATES_REQ:               () => resolve(CRATESBLOCKS.CRATES_REQ).OUTPUT,

  DELETE_ROWS_TABLE_INPUT:  () => resolve(CRATESBLOCKS.DELETE_ROWS).INPUT,
  DELETE_ROWS_TABLE_OUTPUT: () => resolve(CRATESBLOCKS.DELETE_ROWS).OUTPUT,

  SINNERS_TABLE_INPUT:      () => resolve(CRATESBLOCKS.SINNERS_TABLE).INPUT,
  SINNERS_TABLE_OUTPUT:     () => resolve(CRATESBLOCKS.SINNERS_TABLE).OUTPUT,
  SINNERS_TABLE_NUMBER:          () => resolve(CRATESBLOCKS.SINNERS_TABLE).NUMBER,

  EASY_TIME:                () => resolve(CRATESBLOCKS.EASY_TIME).INPUT,
  EASY_TIME_CHECKER:        () => resolve(CRATESBLOCKS.EASY_TIME).CHECKER,

  HARD_TIME:                () => resolve(CRATESBLOCKS.HARD_TIME).INPUT,
  HARD_TIME_CHECKER:        () => resolve(CRATESBLOCKS.HARD_TIME).CHECKER,

  NORMAL_TIME:              () => resolve(CRATESBLOCKS.NORMAL_TIME).INPUT,
  NORMAL_TIME_CHECKER:      () => resolve(CRATESBLOCKS.NORMAL_TIME).CHECKER,

  WEEKLY_MD_RUNS:           () => resolve(CRATESBLOCKS.TOTAL_RUNS).RUNS,
  MD_RUN_CRATES_EXCESS:     () => resolve(CRATESBLOCKS.CRATES_EXCESS).VALUES,

  EXPECTED_TIME_MODULE:     () => resolve(CRATESBLOCKS.TIME_MODULE).VALUES,
  EXPECTED_TIME_TOTAL:      () => resolve(CRATESBLOCKS.TIME_TOTAL).VALUES,
  EXPECTED_TIME_REAL:       () => resolve(CRATESBLOCKS.TIME_REAL).VALUES,
};




let CRATESDEFAULTS = {
  HARD_INPUT:                    () => resolve(CRATESBLOCKS.HARD_INPUT).INPUT,
  PASS_INPUT:                    () => resolve(CRATESBLOCKS.PASS_INPUT).INPUT,
  PASS_EXCESS_INPUT:             () => resolve(CRATESBLOCKS.PASS_EXCESS).INPUT,

  CRATES_INPUT:                  () => resolve(CRATESBLOCKS.CRATES_INPUT).INPUT,
  CRATES_INPUT_CHECKER:          () => resolve(CRATESBLOCKS.CRATES_INPUT).CHECKER,

  INITIAL_SEASON_SHARDS:         () => resolve(CRATESBLOCKS.SEASON_SHARDS).INPUT,
  INITIAL_SEASON_SHARDS_CHECKER: () => resolve(CRATESBLOCKS.SEASON_SHARDS).CHECKER,

  TOTAL_UPGRADE:                 () => resolve(CRATESBLOCKS.TOTAL_UPGRADE).INPUT,
  TOTAL_UPGRADE_CHECKER:         () => resolve(CRATESBLOCKS.TOTAL_UPGRADE).CHECKER,

  TOTAL_SHARDS_REQ:              () => resolve(CRATESBLOCKS.SHARDS_REQ).OUTPUT,

  WEEK_BONUS_INPUT:              () => resolve(CRATESBLOCKS.WEEK_BONUS).INPUT,
  WEEKLIES_INPUT:                () => resolve(CRATESBLOCKS.WEEKLIES).INPUT,
  CRATES_VALUE_INPUT:            () => resolve(CRATESBLOCKS.CRATES_VALUE).INPUT,
};