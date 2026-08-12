// 0global/1let3Tickets.gs

let TICKETSBLOCKS = memoizeBlocks("Tickets", {

  HIGHEST_DUNGEON: () => BLOCK("HIGHEST_DUNGEON", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("HIGHEST_DUNGEON"),
    value: "Highest Dungeon Input",
    regions: [
      { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [[9]], 
      validations: [
      { kind: "DROPDOWN", options: TICKETS_HIGHEST_DUNGEON },
    ],colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
    ]
  }),

  TOTAL_IDENTITY: () => BLOCK("TOTAL_IDENTITY", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("TOTAL_IDENTITY"),
    value: "Target Rows Input",
    regions: [
      { key: "INPUT",   rowOffset: 1, colOffset: 0, type: "INPUT",  values: [[1]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  INITIAL_TICKETS: () => BLOCK("INITIAL_TICKETS", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("INITIAL_TICKETS"),
    value: "Initial Tickets Table",
    regions: [
      { key: "FILLER1", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", ""]],},
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Identity Training Ticket IV", "Identity Training Ticket III", "Identity Training Ticket II", "Identity Training Ticket I", "Total XP"]],
        colorOverrides: [
          { col: 0, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { col: 1, color: COLORS.TICKET_III }, 
          { col: 2, color: COLORS.TICKET_II }, 
          { col: 3, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "INPUT", rowOffset: 2, colOffset: 0, type: "INPUT", values: [[0, 0, 0, 0]],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 3, colOffset: 0, type: "OUTPUT",
        values: [["Error Checker", "Error Checker", "Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
      { key: "XP_INITIAL", rowOffset: 2, colOffset: 4, type: "OUTPUT", values: [[0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
      { key: "FILLER2", rowOffset: 3, colOffset: 4, type: "LABEL",
        values: [[""]],},
    ]
  }),

  XP_REQUIRED: () => BLOCK("XP_REQUIRED", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("XP_REQUIRED"),
    value: "XP Required Output",
    regions: [
      { key: "OUTPUT", rowOffset: 1, colOffset: 0, type: "OUTPUT", values: [[0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  TICKETS_REQUIRED: () => BLOCK("TICKETS_REQUIRED", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("TICKETS_REQUIRED"),
    value: "Tickets Required Table",
    regions: [
      { key: "FILLER1", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", ""]],},
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Identity Training Ticket IV", "Identity Training Ticket III", "Identity Training Ticket II", "Identity Training Ticket I", "With Excess"]],
        colorOverrides: [
          { col: 0, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { col: 1, color: COLORS.TICKET_III }, 
          { col: 2, color: COLORS.TICKET_II }, 
          { col: 3, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "TOTAL", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0, 0, 0]],
        colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  DELETE_ROWS: () => BLOCK("DELETE_ROWS", {
    sheet: "Tickets", 
    anchorPos: resolveTicketsAnchorPosition("DELETE_ROWS"), 
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
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("SINNERS_TABLE"),
    value: "Target Table",
    regions: [
      { key: "TICKETS_HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", "", "Minimum Tickets Required Example (Pre-Farming)", "", "", ""]], colorOverrides: [
          { col: 5, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 6, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 7, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 8, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["No", "Name (Optional)", "From Level", "With Excess", "To Level", "Minimum XP Required (Sum)", "Identity Training Ticket IV", "Identity Training Ticket III", "Identity Training Ticket II", "Identity Training Ticket I", "With Excess"]],
        colorOverrides: [
          { col: 6, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { col: 7, color: COLORS.TICKET_III }, 
          { col: 8, color: COLORS.TICKET_II }, 
          { col: 9, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "NUMBER", rowOffset: 2, colOffset: 0, type: "CONSTANT", values: [[1]], colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
      { key: "INPUT",  rowOffset: 2, colOffset: 1, type: "INPUT",  values: [["A Sinner", 1, 0, 2]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "OUTPUT", rowOffset: 2, colOffset: 5, type: "OUTPUT", values: [[0, 0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
    ]
  }),

  CLEAR_SKIP: () => BLOCK("CLEAR_SKIP", {
      sheet: "Tickets",
      anchorPos: resolveTicketsAnchorPosition("CLEAR_SKIP"),
      value: "Clear-Skip Input",
      regions: [
        { key: "HEADER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [["Message"]] },
        { key: "INPUT", rowOffset: 1, colOffset: 0, type: "INPUT", values: [["Clear"]],
        validations: [
        { kind: "DROPDOWN", options: ["Clear", "Skip"] },
        ],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]},
        { key: "CHECKER", rowOffset: 1, colOffset: 1, type: "OUTPUT", values: [["Error Checker"]], colorOverrides: [{scheme: "OUTPUT", fontFromScheme: "OUTPUT" }]  },
      ]
    }),

  MINUTES_SECONDS: () => BLOCK("MINUTES_SECONDS", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("MINUTES_SECONDS"),
    value: "Lux Clear Time Input",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL", values: [[""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Minutes", "Seconds"]] },
      { key: "INPUT", rowOffset: 2, colOffset: 0, type: "INPUT", values: [[0, 4]], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]},
      { key: "CHECKER", rowOffset: 3, colOffset: 0, type: "OUTPUT", values: [["Error Checker", "Error Checker"]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  TOTAL_RUNS: () => BLOCK("TOTAL_RUNS", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("TOTAL_RUNS"),
    value: "Lux Runs Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", "", "", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Stage", 9, 8, 7, 6, 5, 4, 3, 2, 1]] },
      { key: "STAGE", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Clear Amount"], ["Skip Amount"]] },
      { key: "RUNS", rowOffset: 2, colOffset: 1, type: "OUTPUT",
        values: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  RUNS_TICKETS: () => BLOCK("RUNS_TICKETS", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("RUNS_TICKETS"),
    value: "Lux Tickets Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", "", "", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Stage", 9, 8, 7, 6, 5, 4, 3, 2, 1]],},
      { key: "TICKETS_HEADER", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Identity Training Ticket IV"], ["Identity Training Ticket III"], ["Identity Training Ticket II"], ["Identity Training Ticket I"]],
        colorOverrides: [
          { row: 0, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { row: 1, color: COLORS.TICKET_III }, 
          { row: 2, color: COLORS.TICKET_II }, 
          { row: 3, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "TICKETS", rowOffset: 2, colOffset: 1, type: "OUTPUT",
        values: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  TIME_MODULE: () => BLOCK("TIME_MODULE", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("TIME_MODULE"),
    value: "Time and Module Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["Expected Module Spent"], ["Expected Time Completion"]] },
      { key: "VALUES", rowOffset: 1, colOffset: 1, type: "OUTPUT", values: [[0], [0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "TEXT", rowOffset: 1, colOffset: 2, type: "LABEL", values: [["modules"], ["seconds"]] },
    ]
  }),

  EXCESS_TICKETS: () => BLOCK("EXCESS_TICKETS", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("EXCESS_TICKETS"),
    value: "Excess Tickets Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Identity Training Ticket IV", "Identity Training Ticket III", "Identity Training Ticket II", "Identity Training Ticket I"]],
        colorOverrides: [
          { col: 0, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { col: 1, color: COLORS.TICKET_III }, 
          { col: 2, color: COLORS.TICKET_II }, 
          { col: 3, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "OUTPUT", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0, 0]],
        colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  HMS: () => BLOCK("HMS", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("HMS"),
    value: "Hours-Min-Sec Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL", values: [["hours and", "minutes and", "seconds"]] },
      { key: "VALUES", rowOffset: 2, colOffset: 0, type: "OUTPUT", values: [[0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

  SINNERS_DISTRIBUTION: () => BLOCK("SINNERS_DISTRIBUTION", {
    sheet: "Tickets",
    anchorPos: resolveTicketsAnchorPosition("SINNERS_DISTRIBUTION"),
    value: "Tickets Distribution Table",
    regions: [
      { key: "TICKETS_HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", "", "Tickets Distribution (Post-Farming)", "", "", ""]], colorOverrides: [
          { col: 5, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 6, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 7, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 8, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["No", "Name (Optional)", "From Level", "With Excess", "To Level", "Minimum XP Required (Sum)"]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["No", "Name (Optional)", "From Level", "With Excess", "To Level", "Minimum XP Required (Sum)", "Identity Training Ticket IV", "Identity Training Ticket III", "Identity Training Ticket II", "Identity Training Ticket I", "With Excess"]],
        colorOverrides: [
          { col: 6, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { col: 7, color: COLORS.TICKET_III }, 
          { col: 8, color: COLORS.TICKET_II }, 
          { col: 9, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "VALUES", rowOffset: 2, colOffset: 0, type: "OUTPUT",
        values: [[1, "A Sinner", 1, 0, 2, 0, 0, 0, 0, 0, 0]], colorOverrides: [{ scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
    ]
  }),

});


let TICKETSANCHORS = {
  HIGHEST_DUNGEON_ANCHOR:      () => resolve(TICKETSBLOCKS.HIGHEST_DUNGEON).ANCHOR,
  TOTAL_IDENTITY_ANCHOR:       () => resolve(TICKETSBLOCKS.TOTAL_IDENTITY).ANCHOR,
  INITIAL_TICKETS_ANCHOR:      () => resolve(TICKETSBLOCKS.INITIAL_TICKETS).ANCHOR,
  XP_REQUIRED_ANCHOR:          () => resolve(TICKETSBLOCKS.XP_REQUIRED).ANCHOR,
  TICKETS_REQUIRED_ANCHOR:     () => resolve(TICKETSBLOCKS.TICKETS_REQUIRED).ANCHOR,
  DELETE_ROWS_ANCHOR:          () => resolve(TICKETSBLOCKS.DELETE_ROWS).ANCHOR,
  SINNERS_TABLE_ANCHOR:        () => resolve(TICKETSBLOCKS.SINNERS_TABLE).ANCHOR,
  CLEAR_SKIP_ANCHOR:             () => resolve(TICKETSBLOCKS.CLEAR_SKIP).ANCHOR,
  MINUTES_SECONDS_ANCHOR:      () => resolve(TICKETSBLOCKS.MINUTES_SECONDS).ANCHOR,
  TOTAL_RUNS_ANCHOR:           () => resolve(TICKETSBLOCKS.TOTAL_RUNS).ANCHOR,
  RUNS_TICKETS_ANCHOR:         () => resolve(TICKETSBLOCKS.RUNS_TICKETS).ANCHOR,
  TIME_MODULE_ANCHOR:          () => resolve(TICKETSBLOCKS.TIME_MODULE).ANCHOR,
  EXCESS_TICKETS_ANCHOR: () => resolve(TICKETSBLOCKS.EXCESS_TICKETS).ANCHOR,
  HMS_ANCHOR:                  () => resolve(TICKETSBLOCKS.HMS).ANCHOR,
  SINNERS_DISTRIBUTION_ANCHOR: () => resolve(TICKETSBLOCKS.SINNERS_DISTRIBUTION).ANCHOR,
};


let TICKETSTABLES = {
  INITIAL_TICKETS_INPUT:    () => resolve(TICKETSBLOCKS.INITIAL_TICKETS).INPUT,
  INITIAL_TICKETS_CHECKER:  () => resolve(TICKETSBLOCKS.INITIAL_TICKETS).CHECKER,
  TOTAL_TICKETS_REQUIRED:   () => resolve(TICKETSBLOCKS.TICKETS_REQUIRED).TOTAL,

  DELETE_ROWS_TABLE_INPUT:  () => resolve(TICKETSBLOCKS.DELETE_ROWS).INPUT,
  DELETE_ROWS_TABLE_OUTPUT: () => resolve(TICKETSBLOCKS.DELETE_ROWS).OUTPUT,

  SINNERS_TABLE_INPUT:      () => resolve(TICKETSBLOCKS.SINNERS_TABLE).INPUT,
  SINNERS_TABLE_OUTPUT:     () => resolve(TICKETSBLOCKS.SINNERS_TABLE).OUTPUT,
  SINNERS_TABLE_NUMBER:    () => resolve(TICKETSBLOCKS.SINNERS_TABLE).NUMBER,

  CLEAR_SKIP_SETTINGS:        () => resolve(TICKETSBLOCKS.CLEAR_SKIP).INPUT,
  CLEAR_SKIP_CHECKER:         () => resolve(TICKETSBLOCKS.CLEAR_SKIP).CHECKER,

  MINUTES_SECONDS:          () => resolve(TICKETSBLOCKS.MINUTES_SECONDS).INPUT,
  MINUTES_SECONDS_CHECKER:  () => resolve(TICKETSBLOCKS.MINUTES_SECONDS).CHECKER,

  TOTAL_RUNS:               () => resolve(TICKETSBLOCKS.TOTAL_RUNS).RUNS,
  TOTAL_RUNS_TICKETS:       () => resolve(TICKETSBLOCKS.RUNS_TICKETS).TICKETS,

  EXPECTED_TIME_MODULE:     () => resolve(TICKETSBLOCKS.TIME_MODULE).VALUES,
  EXCESS_TICKETS: () => resolve(TICKETSBLOCKS.EXCESS_TICKETS).OUTPUT,
  EXPECTED_TIME_HMS:        () => resolve(TICKETSBLOCKS.HMS).VALUES,

  SINNERS_DISTRIBUTION:     () => resolve(TICKETSBLOCKS.SINNERS_DISTRIBUTION).VALUES,
};


let TICKETSDEFAULTS = {
  HIGHEST_DUNGEON_UNLOCK:  () => resolve(TICKETSBLOCKS.HIGHEST_DUNGEON).INPUT,

  TOTAL_XP_INITIAL:        () => resolve(TICKETSBLOCKS.INITIAL_TICKETS).XP_INITIAL,
  TOTAL_XP_REQUIRED:       () => resolve(TICKETSBLOCKS.XP_REQUIRED).OUTPUT,

  TOTAL_IDENTITY_LEVEL_UP: () => resolve(TICKETSBLOCKS.TOTAL_IDENTITY).INPUT,
  TOTAL_IDENTITY_CHECKER:  () => resolve(TICKETSBLOCKS.TOTAL_IDENTITY).CHECKER,
};