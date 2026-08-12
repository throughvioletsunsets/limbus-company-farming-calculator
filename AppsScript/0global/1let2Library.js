// 0global/1let2Library.gs

let LIBRARYBLOCKS = memoizeBlocks("The Library", {

  LEVEL_TABLE: () => BLOCK("LEVEL_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("LEVEL_TABLE"),
    value: "Identity Level Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Level", "EXP per Level", "Accumulative Sum"]] },
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, 0, 0],[2, 10, 10],[3, 12, 22],[4, 15, 37],[5, 20, 57],[6, 27, 84],[7, 40, 124],[8, 59, 183],[9, 88, 271],[10, 125, 396],
          [11, 168, 564],[12, 227, 791],[13, 298, 1089],[14, 381, 1470],[15, 482, 1952],[16, 591, 2543],[17, 728, 3271],[18, 885, 4156],[19, 1064, 5220],[20, 1261, 6481],
          [21, 1488, 7969],[22, 1739, 9708],[23, 2016, 11724],[24, 2327, 14051],[25, 2674, 16725],[26, 3047, 19772],[27, 3456, 23228],[28, 3899, 27127],[29, 4378, 31505],[30, 4899, 36404],
          [31, 3899, 40303],[32, 4378, 44681],[33, 4899, 49580],[34, 5468, 55048],[35, 6075, 61123],[36, 4899, 66022],[37, 5468, 71490],[38, 6075, 77565],[39, 6722, 84287],[40, 7413, 91700],
          [41, 6075, 97775],[42, 6722, 104497],[43, 7413, 111910],[44, 8156, 120066],[45, 8953, 129019],[46, 7413, 136432],[47, 7413, 143845],[48, 7413, 151258],[49, 7413, 158671],[50, 7413, 166084],
          [51, 8156, 174240],[52, 8156, 182396],[53, 8156, 190552],[54, 8156, 198708],[55, 8156, 206864],[56, 8953, 215817],[57, 8953, 224770],[58, 8953, 233723],[59, 8953, 242676],[60, 8953, 251629],
        ],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  TICKET_TABLE: () => BLOCK("TICKET_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("TICKET_TABLE"),
    value: "Identity Ticket Table",
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
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [[3000, 1000, 200, 50]],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  TICKETS_TABLE: () => BLOCK("TICKETS_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("TICKETS_TABLE"),
    value: "Ticket Lux Table",
    regions: [
      { key: "TICKETS_HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "Tickets Gained", "", "", "", "", ""]], colorOverrides: [
          { col: 1, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 2, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 3, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 4, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Stage", "Mode", "Identity Training Ticket IV", "Identity Training Ticket III", "Identity Training Ticket II", "Identity Training Ticket I", "Total XP", "Total Module"]],
        colorOverrides: [
          { col: 2, color: COLORS.TICKET_IV, fontColor: COLORS.WHITE }, 
          { col: 3, color: COLORS.TICKET_III }, 
          { col: 4, color: COLORS.TICKET_II }, 
          { col: 5, color: COLORS.TICKET_I, fontColor: COLORS.WHITE },] },
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [1, "Clear", 0, 0, 7, 6, 1700, 2], [1, "Skip", 0, 0, 11, 9, 2650, 4],
          [2, "Clear", 0, 3, 3, 0, 3600, 2], [2, "Skip", 0, 5, 5, 0, 6000, 4],
          [3, "Clear", 0, 4, 4, 0, 4800, 2], [3, "Skip", 0, 6, 6, 0, 7200, 4],
          [4, "Clear", 2, 4, 0, 0, 10000, 3], [4, "Skip", 3, 6, 0, 0, 15000, 6],
          [5, "Clear", 2, 6, 1, 0, 12200, 3], [5, "Skip", 3, 9, 2, 0, 18300, 6],
          [6, "Clear", 4, 2, 2, 0, 14400, 3], [6, "Skip", 6, 3, 3, 0, 21600, 6],
          [7, "Clear", 4, 4, 4, 0, 16800, 3], [7, "Skip", 6, 6, 6, 0, 25200, 6],
          [8, "Clear", 6, 2, 4, 0, 20800, 3], [8, "Skip", 9, 3, 6, 0, 31200, 6],
          [9, "Clear", 6, 6, 6, 0, 25200, 3], [9, "Skip", 9, 9, 9, 0, 37800, 6],
        ],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  THREADS_TABLE: () => BLOCK("THREADS_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("THREADS_TABLE"),
    value: "Threads Lux Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Difficulty", "Mode", "Threads (Base) Obtained","Threads (Daily Bonus)", "Total Module Cost" ]] },
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          [20, "Clear", 2, 4, 2], [20, "Skip", 3, 6, 4],
          [30, "Clear", 3, 6, 2], [30, "Skip", 5, 9, 4],
          [40, "Clear", 4, 8, 2], [40, "Skip", 6, 12, 4],
          [50, "Clear", 5, 10, 2], [50, "Skip", 7, 15, 4],
          [60, "Clear", 6, 12, 2], [60, "Skip", 9, 18, 4],
        ],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  BGM_TABLE: () => BLOCK("BGM_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("BGM_TABLE"),
    value: "BGM Table",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["Threads Required" ]] },
      { key: "TABLE", rowOffset: 1, colOffset: 0, type: "CONSTANT",
        values: [["Single Song Cost", 25]],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  ID_UPTIE_TABLE: () => BLOCK("ID_UPTIE_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("ID_UPTIE_TABLE"),
    value: "Identity Uptie Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", ""]] },
      { key: "IDENTITY_HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Rarity", "O", "", "OO", "", "OOO", ""]], colorOverrides: [
          { col: 1, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 2, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 3, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED }, 
          { col: 4, color: COLORS.LIMBUS_YELLOW, fontColor: COLORS.LIMBUS_RED }, 
          { col: 5, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 6, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW },] },
      { key: "HEADER", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Tier", "Threads Required", "Shards Required", "Threads Required", "Shards Required", "Threads Required", "Shards Required", ]] },
      { key: "TABLE", rowOffset: 3, colOffset: 0, type: "CONSTANT",
        values: [
          ["II", 0, 0, 10, 0, 20, 0],
          ["III", 0, 0, 40, 0, 80, 0],
          ["IV", 50, 20, 100, 30, 150, 50],
        ],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  EGO_THREADSPIN_TABLE: () => BLOCK("EGO_THREADSPIN_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("EGO_THREADSPIN_TABLE"),
    value: "E.G.O Threadspin Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", "", "", "", "", "", ""]] },
      { key: "EGO_HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Grade", "ZAYIN", "", "TETH", "", "HE", "", "WAW", ""]], colorOverrides: [
          { col: 1, color: COLORS.ZAYIN_BG, fontColor: COLORS.ZAYIN_TEXT }, 
          { col: 2, color: COLORS.ZAYIN_BG, fontColor: COLORS.ZAYIN_TEXT }, 
          { col: 3, color: COLORS.TETH_BG, fontColor: COLORS.TETH_TEXT }, 
          { col: 4, color: COLORS.TETH_BG, fontColor: COLORS.TETH_TEXT }, 
          { col: 5, color: COLORS.HE_BG, fontColor: COLORS.HE_TEXT }, 
          { col: 6, color: COLORS.HE_BG, fontColor: COLORS.HE_TEXT },
          { col: 7, color: COLORS.WAW_BG, fontColor: COLORS.WAW_TEXT },
          { col: 8, color: COLORS.WAW_BG, fontColor: COLORS.WAW_TEXT },] },
      { key: "HEADER", rowOffset: 2, colOffset: 0, type: "LABEL",
        values: [["Tier", "Threads Required", "Shards Required", "Threads Required", "Shards Required", "Threads Required", "Shards Required", "Threads Required", "Shards Required"]] },
      { key: "TABLE", rowOffset: 3, colOffset: 0, type: "CONSTANT",
        values: [
          ["II", 20, 0, 25, 0, 30, 0, 35, 0],
          ["III", 60, 0, 70, 0, 80, 0, 90, 0],
          ["IV", 110, 80, 130, 90, 150, 100, 170, 150],
          ["V", 250, 125, 300, 150, 350, 175, 550, 225],
        ],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  FACADE_TABLE: () => BLOCK("FACADE_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("FACADE_TABLE"),
    value: "Facade Unlock Table",
    regions: [
      { key: "HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["Threads", "Shards"]],},
      { key: "TABLE", rowOffset: 1, colOffset: 0, type: "CONSTANT",
        values: [["Facade Projection Cost", 250, 125]],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  EXTRACT_TABLE: () => BLOCK("EXTRACT_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("EXTRACT_TABLE"),
    value: "Extraction Table",
    regions: [
      { key: "IDENTITY_HEADER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["Identity", "", ""]],colorOverrides: [
          { col: 0, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }, 
          { col: 1, color: COLORS.LIMBUS_RED, fontColor: COLORS.LIMBUS_YELLOW }]},
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Rarity", "OO", "OOO", "E.G.O"]] },
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [["Shards Extraction Cost", 150, 400, 400]],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  MD_PASS_TABLE: () => BLOCK("MD_PASS_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("MD_PASS_TABLE"),
    value: "MD Pass XP Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Applied Weekly Bonus?", "Limbus Pass XP", "Total Module Cost"]]},
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [["Easy (3 Runs)", 135, 15], ["Hard (3 Runs)", 225, 18], ["None/Normal (1 Run)", 30, 5]],
        colorOverrides: [{ scheme: "CONSTANT", fontFromScheme: "CONSTANT" }] },
    ]
  }),

  SINNERS_COLORS_TABLE: () => BLOCK("SINNERS_COLORS_TABLE", {
    sheet: "The Library",
    anchorPos: resolveLibraryAnchorPosition("SINNERS_COLORS_TABLE"),
    value: "Sinners Colors Table",
    regions: [
      { key: "FILLER", rowOffset: 0, colOffset: 1, type: "LABEL",
        values: [["", "", ""]] },
      { key: "HEADER", rowOffset: 1, colOffset: 0, type: "LABEL",
        values: [["Sinners", "Color Visual", "Color Name", "HEX Code"]]},
      { key: "TABLE", rowOffset: 2, colOffset: 0, type: "CONSTANT",
        values: [
          ["Yi Sang", , "Dreamy Grey", "#D4DFE8"],
          ["Faust", , "Cerebral Pink", "#FFBFB4"],
          ["Don Quixote", , "Oblivion Yellow", "#FFEF23"],
          ["Ryoshu", , "Smoky Scarlet", "#CF0000"],
          ["Meursault", , "Decay Blue", "#293B95"],
          ["Hong Lu", , "Naive Cyan", "#5BFFDE"],
          ["Heathcliff", , "Furious Violet", "#4E3076"],
          ["Ishmael", , "Isolate Orange", "#FF9500"],
          ["Rodion", , "Lusty Burgundy", "#820000"],
          ["Sinclair", , "Immature Green", "#8B9C15"],
          ["Outis", , "Militant Olive", "#325339"],
          ["Gregor", , "Verminous Brown", "#69350B"],
        ],
        colorOverrides: [
          { scheme: "CONSTANT", fontFromScheme: "CONSTANT" }, { col: 1, sourceCol: 3 },
        ] },
    ]
  }),

});




let LIBRARYANCHORS = {
  TICKET_TABLE_ANCHOR:         () => resolve(LIBRARYBLOCKS.TICKET_TABLE).ANCHOR,
  TICKETS_TABLE_ANCHOR:        () => resolve(LIBRARYBLOCKS.TICKETS_TABLE).ANCHOR,
  LEVEL_TABLE_ANCHOR:          () => resolve(LIBRARYBLOCKS.LEVEL_TABLE).ANCHOR,
  THREADS_TABLE_ANCHOR:        () => resolve(LIBRARYBLOCKS.THREADS_TABLE).ANCHOR,
  BGM_TABLE_ANCHOR:            () => resolve(LIBRARYBLOCKS.BGM_TABLE).ANCHOR,
  ID_UPTIE_TABLE_ANCHOR:       () => resolve(LIBRARYBLOCKS.ID_UPTIE_TABLE).ANCHOR,
  EGO_THREADSPIN_TABLE_ANCHOR: () => resolve(LIBRARYBLOCKS.EGO_THREADSPIN_TABLE).ANCHOR,
  FACADE_TABLE_ANCHOR:         () => resolve(LIBRARYBLOCKS.FACADE_TABLE).ANCHOR,
  EXTRACT_TABLE_ANCHOR:        () => resolve(LIBRARYBLOCKS.EXTRACT_TABLE).ANCHOR,
  MD_PASS_TABLE_ANCHOR:        () => resolve(LIBRARYBLOCKS.MD_PASS_TABLE).ANCHOR,
  SINNERS_COLORS_TABLE_ANCHOR: () => resolve(LIBRARYBLOCKS.SINNERS_COLORS_TABLE).ANCHOR,
};




let LIBRARYTABLES = {
  TICKET_TABLE:          () => resolve(LIBRARYBLOCKS.TICKET_TABLE).TABLE,
  TICKETS_TABLE:         () => resolve(LIBRARYBLOCKS.TICKETS_TABLE).TABLE,
  LEVEL_TABLE:           () => resolve(LIBRARYBLOCKS.LEVEL_TABLE).TABLE,
  THREADS_TABLE:         () => resolve(LIBRARYBLOCKS.THREADS_TABLE).TABLE,
  BGM_TABLE:             () => resolve(LIBRARYBLOCKS.BGM_TABLE).TABLE,
  ID_UPTIE_TABLE:        () => resolve(LIBRARYBLOCKS.ID_UPTIE_TABLE).TABLE,
  EGO_THREADSPIN_TABLE:  () => resolve(LIBRARYBLOCKS.EGO_THREADSPIN_TABLE).TABLE,
  FACADE_TABLE:          () => resolve(LIBRARYBLOCKS.FACADE_TABLE).TABLE,
  EXTRACT_TABLE:         () => resolve(LIBRARYBLOCKS.EXTRACT_TABLE).TABLE,
  MD_PASS_XP:            () => resolve(LIBRARYBLOCKS.MD_PASS_TABLE).TABLE,
  SINNERS_COLORS_TABLE:  () => resolve(LIBRARYBLOCKS.SINNERS_COLORS_TABLE).TABLE,
};

let LIBRARYDEFAULTS = {};