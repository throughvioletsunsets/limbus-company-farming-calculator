// 0global/1let0Home.gs

// ============================================================
// RESOLVE HELPER — every anchor/table/cell def becomes a
// zero-arg function once positions go live; this is the one
// call site that unwraps either shape.
// ============================================================
function resolve(def) {
  return typeof def === "function" ? def() : def;
}

let _anchorPositionCache = {};
let _homeColumnCache = {};
let _blockCache = {};

function resetAnchorCaches() {
  _anchorPositionCache = {};
  _homeColumnCache = {};
  _blockCache = {};
}

function memoizeBlocks(prefix, blocksObj) {
  const memoized = {};
  Object.keys(blocksObj).forEach(key => {
    const thunk = blocksObj[key];
    const cacheKey = prefix + "|" + key;
    memoized[key] = () => {
      if (_blockCache[cacheKey]) return _blockCache[cacheKey];
      return (_blockCache[cacheKey] = thunk());
    };
  });
  return memoized;
}

function getHomeColumnValues(homeTable) {
  const key = homeTable.sheet + "|" + homeTable.startRow + "|" + homeTable.startCol;
  if (_homeColumnCache[key]) return _homeColumnCache[key];

  const values = getASheet(homeTable.sheet)
    .getRange(homeTable.startRow, homeTable.startCol, homeTable.numRows, 1)
    .getValues();

  _homeColumnCache[key] = values;
  return values;
}

function resolveAnchorPosition(homeAnchor, anchorOffsets, offsetName) {
  const homeTable = resolve(homeAnchor);
  const cacheKey = homeTable.sheet + "|" + homeTable.startRow + "|" + homeTable.startCol + "|" + offsetName;

  if (_anchorPositionCache[cacheKey]) return _anchorPositionCache[cacheKey];

  return profWrap("resolveAnchorPosition_miss", () => {
    const values = getHomeColumnValues(homeTable);
    const offset = anchorOffsets[offsetName];
    const pos = parseA1(values[offset][0]);
    _anchorPositionCache[cacheKey] = pos;
    return pos;
  });
}

const resolveLibraryAnchorPosition = (offsetName) =>
  resolveAnchorPosition(
    HOMETABLES.LIBRARY_ANCHOR,
    LIBRARY_ANCHOR_OFFSETS,
    offsetName
  );

const resolveTicketsAnchorPosition = (offsetName) =>
  resolveAnchorPosition(
    HOMETABLES.TICKETS_ANCHOR,
    TICKETS_ANCHOR_OFFSETS,
    offsetName
  );

const resolveThreadsAnchorPosition = (offsetName) =>
  resolveAnchorPosition(
    HOMETABLES.THREADS_ANCHOR,
    THREADS_ANCHOR_OFFSETS,
    offsetName
  );

const resolveCratesAnchorPosition = (offsetName) =>
  resolveAnchorPosition(
    HOMETABLES.CRATES_ANCHOR,
    CRATES_ANCHOR_OFFSETS,
    offsetName
  );

const SHEET_COLORS_OFFSETS = {
  INPUT: 0,
  OUTPUT: 1,
  CONSTANT: 2,
  ANCHOR: 3,
};

const TICKETS_ANCHOR_OFFSETS = {
  HIGHEST_DUNGEON: 0,
  TOTAL_IDENTITY: 1,
  INITIAL_TICKETS: 2,
  XP_REQUIRED: 3,
  TICKETS_REQUIRED: 4,
  DELETE_ROWS: 5,
  SINNERS_TABLE: 6,
  CLEAR_SKIP: 7,
  MINUTES_SECONDS: 8,
  TOTAL_RUNS: 9,
  RUNS_TICKETS: 10,
  TIME_MODULE: 11,
  EXCESS_TICKETS: 12,
  HMS: 13,
  SINNERS_DISTRIBUTION: 14
};

const THREADS_ANCHOR_OFFSETS = {
  HIGHEST_DUNGEON: 0,
  INITIAL_THREADS: 1,
  TOTAL_UPGRADE: 2,
  THREADS_REQUIRED: 3,
  DELETE_ROWS: 4,
  SINNERS_TABLE: 5,
  CLEAR_SKIP: 6,
  TODAY_BONUS: 7,
  DAILIES: 8,
  MINUTES_SECONDS: 9,
  TOTAL_RUNS: 10,
  EXCESS_THREADS: 11,
  TIME_MODULE: 12,
  HMS: 13,
  MWD: 14
};

const CRATES_ANCHOR_OFFSETS = {
  HARD_INPUT: 0,
  PASS_INPUT: 1,
  PASS_EXCESS: 2,
  CRATES_INPUT: 3,
  SEASON_SHARDS: 4,
  INITIAL_SHARDS_1: 5,
  INITIAL_SHARDS_2: 6,
  TOTAL_UPGRADE: 7,
  DELETE_ROWS: 8,
  SHARDS_REQ: 9,
  CRATES_REQ: 10,
  SINNERS_TABLE: 11,
  WEEK_BONUS: 12,
  WEEKLIES: 13,
  CRATES_VALUE: 14,
  EASY_TIME: 15,
  HARD_TIME: 16,
  NORMAL_TIME: 17,
  TOTAL_RUNS: 18,
  CRATES_EXCESS: 19,
  TIME_MODULE: 20,
  TIME_TOTAL: 21,
  TIME_REAL: 22
};

const LIBRARY_ANCHOR_OFFSETS = {
  LEVEL_TABLE : 0,
  TICKET_TABLE: 1,         
  TICKETS_TABLE: 2,              
  THREADS_TABLE: 3,         
  BGM_TABLE: 4,     
  ID_UPTIE_TABLE: 5,
  EGO_THREADSPIN_TABLE: 6,  
  FACADE_TABLE: 7,          
  EXTRACT_TABLE: 8,         
  MD_PASS_TABLE: 9,         
  SINNERS_COLORS_TABLE: 10,  
};


let HOMEBLOCKS = memoizeBlocks("Home", {

  RESTORE_DEFAULT: () => BLOCK("RESTORE_DEFAULT", {
    sheet: "Home",
    anchorPos: { row: 18, col: 2 },
    value: "Restore Default Group",
    regions: [
      { key: "FILLER1", rowOffset: 0, colOffset: 0, type: "LABEL",
        values: [
          [
          "Restore Default Values Table (Note that this only restores the Input/Output/Tables (see the tutorial for in-depth explanation).)", 
          "", "", "", "", "", "", ""], 
          [
          "(Everything else such as sheet color, text alignments, images, etc. are not affected by this.)", 
          "", "", "", "", "", "", ""],
          [
          "Which sheets to restore?", 
          "", "ALL Sheets", "Home Sheet", "Tickets Sheet", "Threads Sheet", "Crates Sheet", "The Library Sheet"]
          ]},
      { key: "FILLER2", rowOffset: 3, colOffset: 0, type: "LABEL",
        values: [
          ["Restore default values?", ""], 
          ["Error Checker", ""]
          ]},
      { key: "INPUT", rowOffset: 3, colOffset: 2, type: "INPUT",
        values: [[false, false, false, false, false, false]],
        validations: [
          { kind: "CHECKBOX" }, ],
          colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHECKER", rowOffset: 4, colOffset: 2, type: "OUTPUT",
        values: [["Idle! Check a box to begin."]],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }, ]},
      { key: "FILLER3", rowOffset: 4, colOffset: 3, type: "LABEL",
        values: [["", "", "", "", ""]],  
          colorOverrides: [ { scheme: "OUTPUT", fontFromScheme: "OUTPUT" },  ]},
    ]
  }),

  SHEET_COLORS: () => BLOCK("SHEET_COLORS", {
    sheet: "Home",
    anchorPos: { row: 25, col: 2 },
    value: "Sheet Colors Group",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 0, type: "LABEL",
        values: [
          [
          "Color Modifier Table", "", "", "", "", ""], 
          ["No", "Color", "Background Color Visual", "Background HEX Code", "Text Color Visual", "Text HEX Code"], ]},
      { key: "CONSTANT", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, "Input Cells"],
          [2, "Output Cells"],
          [3, "Constant Cells"],
          [4, "Anchor Cells"],
        ],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
      { key: "BG_COLORS", rowOffset: 2, colOffset: 2, type: "INPUT",
        values: [
          [, "#b6d7a8"],
          [, "#ea9999"],
          [, "#cccccc"],
          [, "#fff2cc"],
        ],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }, { col: 0, sourceCol: 1 }] },
      { key: "FONT_COLORS", rowOffset: 2, colOffset: 4, type: "INPUT",
        values: [
          [, "#000000"],
          [, "#000000"],
          [, "#000000"],
          [, "#000000"],
        ],
        colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }, { col: 0, sourceCol: 1 }, { col: 0, fontSourceCol: 1 },] },
      { key: "CHANGE_TEXT", rowOffset: 6, colOffset: 4, type: "LABEL", values: [["Apply Changes?"]] },
      { key: "CHANGE", rowOffset: 6, colOffset: 5, type: "INPUT", values: [[false]],
      validations: [ { kind: "CHECKBOX" }, ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHANGE_FILLER", rowOffset: 6, colOffset: 0, type: "LABEL",
        values: [["", "", "", ""],],  },
      { key: "OUTPUT", rowOffset: 7, colOffset: 0, type: "OUTPUT",
        values: [["Error Checker"], ["Idle! Check the box to begin."]],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "OUTPUT_FILLER", rowOffset: 7, colOffset: 1, type: "LABEL",
        values: [
          ["", "", "", "", ""], 
          ["", "", "", "", ""]
        ],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }, ]  },
    ]
  }),

  TICKETS_GROUP: () => BLOCK("TICKETS_GROUP", {
    sheet: "Home",
    anchorPos: { row: 25, col: 9 },
    value: "Tickets Anchor Group",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 0, type: "LABEL",
        values: [
          ["Tickets Sheet Relocater Table", 
          "", ""], 
          ["No", "Input/Output/Table Name", "Anchor Cell"], ]},
      { key: "CONSTANT", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, "Highest Dungeon Input"], [2, "Target Rows Input"], [3, "Initial Tickets Table"],
          [4, "XP Required Output"], [5, "Tickets Required Table"], [6, "Delete Rows Modifier Table"],
          [7, "Target Table"], [8, "Clear-Skip Input"], [9, "Lux Clear Time Input"], [10, "Lux Runs Table"],
          [11, "Lux Tickets Table"], [12, "Time and Module Table"], [13, "Excess Tickets Table"], [14, "Hours-Min-Sec Table"], [15, "Tickets Distribution Table"],
        ], colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
      { key: "ANCHOR_COL", rowOffset: 2, colOffset: 2, type: "INPUT",
        values: [
          ["D7"], ["D11"], ["H8"], ["F17"], ["H16"], ["B22"], ["B29"],
          ["P7"], ["O15"], ["U8"], ["U15"], ["U24"], ["AA24"], ["U29"], ["U35"],
        ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHANGE_TEXT", rowOffset: 17, colOffset: 0, type: "LABEL", values: [["","Apply Changes?"]] },
      { key: "CHANGE", rowOffset: 17, colOffset: 2, type: "INPUT", values: [[false]],validations: [ { kind: "CHECKBOX" }, ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]  },
      { key: "OUTPUT", rowOffset: 18, colOffset: 0, type: "OUTPUT",
        values: [["Error Checker"], ["Idle! Check the box to begin."]],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "CHANGE_FILLER", rowOffset: 17, colOffset: 0, type: "LABEL",
        values: [[""],],  },
      { key: "OUTPUT_FILLER", rowOffset: 18, colOffset: 1, type: "LABEL",
        values: [
          ["", ""], ["", ""]],  colorOverrides: [
        { scheme: "OUTPUT", fontFromScheme: "OUTPUT" },
        ]  },
      
    ]
  }),

  THREADS_GROUP: () => BLOCK("THREADS_GROUP", {
    sheet: "Home",
    anchorPos: { row: 25, col: 13 },
    value: "Threads Anchor Group",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 0, type: "LABEL",
        values: [
          ["Threads Sheet Relocater Table", 
          "", ""], 
          ["No", "Input/Output/Table Name", "Anchor Cell"], ]},
      { key: "CONSTANT", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, "Highest Dungeon Input"], [2, "Initial Threads Input"], [3, "Target Rows Input"],
          [4, "Threads Required Output"], [5, "Delete Rows Modifier Table"], [6, "Target Table"],
          [7, "Clear-Skip Input"], [8, "Today Bonus Input"], [9, "Dailies Only Input"],
          [10, "Lux Clear Time Input"], [11, "Lux Runs Table"], [12, "Excess Threads Output"],
          [13, "Time and Module Table"], [14, "Hours-Min-Sec Table"], [15, "Months-Weeks-Days Table"],
        ], colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }]},
      { key: "ANCHOR_COL", rowOffset: 2, colOffset: 2, type: "INPUT",
        values: [
          ["E7"], ["I7"], ["E12"], ["H12"], ["B18"], ["B26"], ["O7"], ["O13"],
          ["O18"], ["N25"], ["T8"], ["X17"], ["T22"], ["X22"], ["X28"],
        ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHANGE_TEXT", rowOffset: 17, colOffset: 0, type: "LABEL", values: [["","Apply Changes?"]] },
      { key: "CHANGE", rowOffset: 17, colOffset: 2, type: "INPUT", values: [[false]],validations: [ { kind: "CHECKBOX" }, ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]  },
      { key: "OUTPUT", rowOffset: 18, colOffset: 0, type: "OUTPUT",
        values: [["Error Checker"], ["Idle! Check the box to begin."]],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "CHANGE_FILLER", rowOffset: 17, colOffset: 0, type: "LABEL",
        values: [[""],],  },
      { key: "OUTPUT_FILLER", rowOffset: 18, colOffset: 1, type: "LABEL",
        values: [
          ["", ""], ["", ""]],  colorOverrides: [
        { scheme: "OUTPUT", fontFromScheme: "OUTPUT" },
        ]  },
    ]
  }),

  CRATES_GROUP: () => BLOCK("CRATES_GROUP", {
    sheet: "Home",
    anchorPos: { row: 25, col: 17 },
    value: "Crates Anchor Group",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 0, type: "LABEL",
        values: [
          ["Crates Sheet Relocater Table", 
          "", ""], 
          ["No", "Input/Output/Table Name", "Anchor Cell"], ]},
      { key: "CONSTANT", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, "Hard Mode Input"], [2, "Limbus Pass Input"], [3, "Pass Excess Input"],
          [4, "Nominable Crates Input"], [5, "Season Shards Input"], [6, "Sinners Shards Table 1"],
          [7, "Sinners Shards Table 2"], [8, "Target Rows Input"], [9, "Delete Rows Modifier Table"],
          [10, "Total Shards Required Output"], [11, "Total Crates Required Table"], [12, "Target Table"],
          [13, "Week Bonus Input"], [14, "Weeklies Only Input"], [15, "Crates Target Input"],
          [16, "Weekly Easy Time Input"], [17, "Weekly Hard Time Input"], [18, "Normal Time Input"],
          [19, "Mirror Dungeon Table"], [20, "Sum Rewards Table"], [21, "Time and Module Table"],
          [22, "Total Time Table"], [23, "Dailies-Weeklies Time Table"],
        ], colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
      { key: "ANCHOR_COL", rowOffset: 2, colOffset: 2, type: "INPUT",
        values: [
          ["D8"], ["G8"], ["K8"], ["O8"], ["D14"], ["F14"], ["F21"], ["D21"], ["B29"],
          ["K29"], ["M28"], ["B39"], ["T8"], ["T13"], ["U18"], ["U24"], ["U30"], ["U36"],
          ["Y9"], ["Y16"], ["Y22"], ["Y27"], ["Y34"],
        ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHANGE_TEXT", rowOffset: 25, colOffset: 0, type: "LABEL", values: [["","Apply Changes?"]] },
      { key: "CHANGE", rowOffset: 25, colOffset: 2, type: "INPUT", values: [[false]],validations: [ { kind: "CHECKBOX" }, ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]  },
      { key: "OUTPUT", rowOffset: 26, colOffset: 0, type: "OUTPUT",
        values: [["Error Checker"], ["Idle! Check the box to begin."]],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "CHANGE_FILLER", rowOffset: 25, colOffset: 0, type: "LABEL",
        values: [[""],],  },
      { key: "OUTPUT_FILLER", rowOffset: 26, colOffset: 1, type: "LABEL",
        values: [
          ["", ""], ["", ""]],  colorOverrides: [
        { scheme: "OUTPUT", fontFromScheme: "OUTPUT" },
        ]  },
    ]
  }),

  LIBRARY_GROUP: () => BLOCK("LIBRARY_GROUP", {
    sheet: "Home",
    anchorPos: { row: 25, col: 21 },
    value: "Library Anchor Group",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 0, type: "LABEL",
        values: [
          ["The Library Sheet Relocater Table", 
          "", ""], 
          ["No", "Input/Output/Table Name", "Anchor Cell"], ]},
      { key: "CONSTANT", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, "Identity Level Table"], [2, "Identity Ticket Table"], [3, "Ticket Lux Table"],
          [4, "Threads Lux Table"], [5, "BGM Table"], [6, "Identity Uptie Table"],
          [7, "E.G.O Threadspin Table"], [8, "Facade Unlock Table"], [9, "Extraction Table"],
          [10, "MD Pass XP Table"], [11, "Sinners Colors Table"],
        ],colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
      { key: "ANCHOR_COL", rowOffset: 2, colOffset: 2, type: "INPUT",
        values: [
          ["B6"], ["H6"], ["F11"], ["F33"], ["L33"], ["F47"], ["F55"], ["F66"], ["F72"], ["F77"], ["K66"],
        ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }] },
      { key: "CHANGE_TEXT", rowOffset: 13, colOffset: 0, type: "LABEL", values: [["","Apply Changes?"]] },
      { key: "CHANGE", rowOffset: 13, colOffset: 2, type: "INPUT", values: [[false]],validations: [ { kind: "CHECKBOX" }, ], colorOverrides: [{ scheme: "INPUT", fontFromScheme: "INPUT" }]  },
      { key: "OUTPUT", rowOffset: 14, colOffset: 0, type: "OUTPUT",
        values: [["Error Checker"], ["Idle! Check the box to begin."]],  colorOverrides: [
          { scheme: "OUTPUT", fontFromScheme: "OUTPUT" }] },
      { key: "OUTPUT_FILLER", rowOffset: 14, colOffset: 1, type: "LABEL",
        values: [
          ["", ""], ["", ""]],  colorOverrides: [
        { scheme: "OUTPUT", fontFromScheme: "OUTPUT" },
        ]  },
    ]
  }),
});


let HOMETABLES = {
  RESTORE_DEFAULT_INPUT:  () => resolve(HOMEBLOCKS.RESTORE_DEFAULT).INPUT,

  SHEET_COLORS_CONSTANT:  () => resolve(HOMEBLOCKS.SHEET_COLORS).CONSTANT,
  SHEET_COLORS:           () => resolve(HOMEBLOCKS.SHEET_COLORS).BG_COLORS,
  SHEET_COLORS_FONT:      () => resolve(HOMEBLOCKS.SHEET_COLORS).FONT_COLORS,
  SHEET_COLORS_OUTPUT:    () => resolve(HOMEBLOCKS.SHEET_COLORS).OUTPUT,        

  TICKETS_CONSTANT:       () => resolve(HOMEBLOCKS.TICKETS_GROUP).CONSTANT,
  TICKETS_ANCHOR:         () => resolve(HOMEBLOCKS.TICKETS_GROUP).ANCHOR_COL,
  TICKETS_OUTPUT:         () => resolve(HOMEBLOCKS.TICKETS_GROUP).OUTPUT,       

  THREADS_CONSTANT:       () => resolve(HOMEBLOCKS.THREADS_GROUP).CONSTANT,
  THREADS_ANCHOR:         () => resolve(HOMEBLOCKS.THREADS_GROUP).ANCHOR_COL,
  THREADS_OUTPUT:         () => resolve(HOMEBLOCKS.THREADS_GROUP).OUTPUT,       

  CRATES_CONSTANT:        () => resolve(HOMEBLOCKS.CRATES_GROUP).CONSTANT,
  CRATES_ANCHOR:          () => resolve(HOMEBLOCKS.CRATES_GROUP).ANCHOR_COL,
  CRATES_OUTPUT:          () => resolve(HOMEBLOCKS.CRATES_GROUP).OUTPUT,       

  LIBRARY_CONSTANT:       () => resolve(HOMEBLOCKS.LIBRARY_GROUP).CONSTANT,
  LIBRARY_ANCHOR:         () => resolve(HOMEBLOCKS.LIBRARY_GROUP).ANCHOR_COL,
  LIBRARY_OUTPUT:         () => resolve(HOMEBLOCKS.LIBRARY_GROUP).OUTPUT,       
};

let HOMEDEFAULTS = {
  RESTORE_DEFAULT_CHECKER:        () => resolve(HOMEBLOCKS.RESTORE_DEFAULT).CHECKER,
  SHEET_COLORS_CHANGE_CHECKBOX:   () => resolve(HOMEBLOCKS.SHEET_COLORS).CHANGE,
  TICKETS_ANCHOR_CHANGE_CHECKBOX: () => resolve(HOMEBLOCKS.TICKETS_GROUP).CHANGE,
  THREADS_ANCHOR_CHANGE_CHECKBOX: () => resolve(HOMEBLOCKS.THREADS_GROUP).CHANGE,
  CRATES_ANCHOR_CHANGE_CHECKBOX:  () => resolve(HOMEBLOCKS.CRATES_GROUP).CHANGE,
  LIBRARY_ANCHOR_CHANGE_CHECKBOX: () => resolve(HOMEBLOCKS.LIBRARY_GROUP).CHANGE,
};