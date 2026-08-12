
// 1global/1codeColors.gs

const DYNAMIC_SINNER_COLOR_GROUPS = {
  Tickets: {
    getRowCount: getPreviousRowCount,
    startRow:    () => resolve(TICKETSTABLES.SINNERS_TABLE_INPUT).startRow,
    segments:    () => {
      const input  = resolve(TICKETSTABLES.SINNERS_TABLE_INPUT);
      const output = resolve(TICKETSTABLES.SINNERS_TABLE_OUTPUT);
      const dist   = resolve(TICKETSTABLES.SINNERS_DISTRIBUTION);
      return [
        { startCol: input.startCol - 1, numCols: 1,              color: COLORS.CONSTANT, fontColor: FONT_COLORS.CONSTANT, schemeName: "CONSTANT" },
        { startCol: input.startCol,     numCols: input.numCols,  color: COLORS.INPUT,    fontColor: FONT_COLORS.INPUT,    schemeName: "INPUT" },
        { startCol: output.startCol,    numCols: output.numCols, color: COLORS.OUTPUT,   fontColor: FONT_COLORS.OUTPUT,   schemeName: "OUTPUT" },
        { startCol: dist.startCol,      numCols: dist.numCols,   color: COLORS.OUTPUT,   fontColor: FONT_COLORS.OUTPUT,   schemeName: "OUTPUT", startRowOverride: dist.startRow },
      ];
    },
  },
  Threads: {
    getRowCount: getPreviousThreadsRowCount,
    startRow:    () => resolve(THREADSTABLES.SINNERS_TABLE_INPUT).startRow,
    segments:    () => {
      const input  = resolve(THREADSTABLES.SINNERS_TABLE_INPUT);
      const outCol = resolve(THREADSTABLES.SINNERS_TABLE_OUTPUT).col;
      return [
        { startCol: input.startCol - 1, numCols: 1,             color: COLORS.CONSTANT, fontColor: FONT_COLORS.CONSTANT, schemeName: "CONSTANT" },
        { startCol: input.startCol,     numCols: input.numCols, color: COLORS.INPUT,    fontColor: FONT_COLORS.INPUT,    schemeName: "INPUT" },
        { startCol: outCol,             numCols: 1,             color: COLORS.OUTPUT,   fontColor: FONT_COLORS.OUTPUT,   schemeName: "OUTPUT" },
      ];
    },
  },
  Crates: {
    getRowCount: getPreviousCratesRowCount,
    startRow:    () => resolve(CRATESTABLES.SINNERS_TABLE_INPUT).startRow,
    segments:    () => {
      const input  = resolve(CRATESTABLES.SINNERS_TABLE_INPUT);
      const output = resolve(CRATESTABLES.SINNERS_TABLE_OUTPUT);
      return [
        { startCol: input.startCol - 1, numCols: 1,              color: COLORS.CONSTANT, fontColor: FONT_COLORS.CONSTANT, schemeName: "CONSTANT" },
        { startCol: input.startCol,     numCols: input.numCols,  color: COLORS.INPUT,    fontColor: FONT_COLORS.INPUT,    schemeName: "INPUT" },
        { startCol: output.startCol,    numCols: output.numCols, color: COLORS.OUTPUT,   fontColor: FONT_COLORS.OUTPUT,   schemeName: "OUTPUT" },
      ];
    },
  },
};

function collectDynamicSinnerCells(sheetName) {
  const group = DYNAMIC_SINNER_COLOR_GROUPS[sheetName];
  if (!group) return [];

  const rowCount  = group.getRowCount();
  const extraRows = rowCount - 1;
  if (extraRows <= 0) return [];

  const baseStartRow = group.startRow();
  const cells = [];

  group.segments().forEach(seg => {
    const segStartRow = seg.startRowOverride !== undefined ? seg.startRowOverride : baseStartRow;
    for (let i = 1; i <= extraRows; i++) {
      for (let c = 0; c < seg.numCols; c++) {
        cells.push({
          row: segStartRow + i,
          col: seg.startCol + c,
          color: seg.color,
          fromScheme: true,
          colorSchemeName: seg.schemeName,
          fontColor: seg.fontColor,
          fontFromScheme: true,
          fontSchemeName: seg.schemeName,
        });
      }
    }
  });

  return cells;
}

function repaintSheetColors(changedBg, changedFont) {
  return profWrap("repaintSheetColors", () => {
    const cellsBySheet = collectAllColoredCells();

    Object.keys(DYNAMIC_SINNER_COLOR_GROUPS).forEach(sheetName => {
      const dynamicCells = collectDynamicSinnerCells(sheetName);
      if (dynamicCells.length === 0) return;
      if (!cellsBySheet[sheetName]) cellsBySheet[sheetName] = [];
      cellsBySheet[sheetName] = cellsBySheet[sheetName].concat(dynamicCells);
    });

    Object.entries(cellsBySheet).forEach(([sheetName, cells]) => {
      const sheet = getASheet(sheetName);
      if (!sheet) return;

      const bgGroups = {};
      const fontGroups = {};

      cells.forEach(cell => {
        if (cell.fromScheme && cell.colorSchemeName && changedBg[cell.colorSchemeName]) {
          const newHex = changedBg[cell.colorSchemeName];
          (bgGroups[newHex] || (bgGroups[newHex] = [])).push(rowColToA1(cell.row, cell.col));
        }
        if (cell.fontFromScheme && cell.fontSchemeName && changedFont[cell.fontSchemeName]) {
          const newFontHex = changedFont[cell.fontSchemeName];
          (fontGroups[newFontHex] || (fontGroups[newFontHex] = [])).push(rowColToA1(cell.row, cell.col));
        }
      });

      Object.entries(bgGroups).forEach(([hex, a1s])   => sheet.getRangeList(a1s).setBackground(hex));
      Object.entries(fontGroups).forEach(([hex, a1s]) => sheet.getRangeList(a1s).setFontColor(hex));
    });
  });
}

function resolveValidationOverride(table, r, c) {
  if (!table || !table.validations || table.validations.length === 0) return null;

  for (const rule of table.validations) {
    const rowMatches = (rule.row === undefined || rule.row === r);
    const colMatches = (rule.col === undefined || rule.col === c); 
    if (!rowMatches || !colMatches) continue;
    return rule; // { kind: "CHECKBOX" } or { kind: "DROPDOWN", options: [...] }
  }
  return null;
}

function resolveColorOverride(table, r, c, rowValues) {
  if (!table) {
    console.log(`resolveColorOverride called with undefined table! r=${r}, c=${c}`);
    console.trace();
    return null;
  }
  if (!table.colorOverrides || table.colorOverrides.length === 0) return null;

  let result = null;

  for (const rule of table.colorOverrides) {
    const rowMatches = (rule.row === undefined || rule.row === r);
    const colMatches = (rule.col === undefined || rule.col === c); 
    if (!rowMatches || !colMatches) continue;

    if (!result) result = { blank: rule.blank === true };

    if (rule.scheme !== undefined) {
      result.color = COLORS[rule.scheme];
      result.fromScheme = true;
      result.colorSchemeName = rule.scheme;
    } else if (rule.color !== undefined) {
      result.color = rule.color;
      result.fromScheme = false;
    } else if (rule.sourceCol !== undefined) {
      result.color = rowValues[rule.sourceCol];
      result.fromScheme = false;
      if (result.blank === undefined) result.blank = rule.blank !== false;
    }

    if (rule.fontFromScheme !== undefined) {
      result.fontColor = FONT_COLORS[rule.fontFromScheme];
      result.fontFromScheme = true;
      result.fontSchemeName = rule.fontFromScheme;
    } else if (rule.fontColor !== undefined) {
      result.fontColor = rule.fontColor;
      result.fontFromScheme = false;
    } else if (rule.fontSourceCol !== undefined) {
      result.fontColor = rowValues[rule.fontSourceCol];
      result.fontFromScheme = false;
    }
  }

  return result;
}

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function validateSheetColorsFormat() {
  const table     = resolve(HOMETABLES.SHEET_COLORS);       
  const fontTable = resolve(HOMETABLES.SHEET_COLORS_FONT);  

  const bgCol   = table.startCol + 1;
  const fontCol = fontTable.startCol + 1;

  const bgValues = getASheet(table.sheet)
    .getRange(table.startRow, bgCol, table.numRows, 1)
    .getValues();

  const fontValues = getASheet(fontTable.sheet)
    .getRange(fontTable.startRow, fontCol, fontTable.numRows, 1)
    .getValues();

  const names = Object.keys(SHEET_COLORS_OFFSETS)
    .sort((a, b) => SHEET_COLORS_OFFSETS[a] - SHEET_COLORS_OFFSETS[b]);

  const errors = [];
  const colors = {};
  const fontColors = {};

  names.forEach((name, i) => {
    const rawBg   = String(bgValues[i][0]).trim();
    const rawFont = String(fontValues[i][0]).trim();

    if (!HEX_COLOR_RE.test(rawBg))   errors.push(`${name} background: invalid color "${rawBg}"`);
    else colors[name] = rawBg;

    if (!HEX_COLOR_RE.test(rawFont)) errors.push(`${name} font: invalid color "${rawFont}"`);
    else fontColors[name] = rawFont;
  });

  // Only background colors need to stay distinguishable from each other —
  // font colors are free to repeat across INPUT/OUTPUT/CONSTANT/ANCHOR.
  if (errors.length === 0) {
    const byHex = {};
    Object.entries(colors).forEach(([name, hex]) => (byHex[hex] || (byHex[hex] = [])).push(name));
    Object.values(byHex).forEach(dupeNames => {
      if (dupeNames.length > 1) errors.push(`${dupeNames.join(" and ")} cannot share the same background color`);
    });
  }

  return { errors, colors, fontColors };
}

function collectBlockLabelCells(blocks) {
  const defs = [];
  Object.values(blocks || {}).forEach(blockDef => {
    const resolvedBlock = resolve(blockDef);
    Object.values(resolvedBlock).forEach(region => {
      if (
        region.type === "TABLE" &&
        ["LABEL", "CONSTANT", "INPUT", "OUTPUT", "ANCHOR"].includes(region.regionType)
      ) {
        defs.push(region);
      }
    });
  });
  return defs;
}

function expandDefToCells(def) {
  if (!def || !def.values) return [];
  const border = def.border || false;

  const cells = [];
  for (let r = 0; r < def.values.length; r++) {
    for (let c = 0; c < def.values[r].length; c++) {
      let color            = def.color || null;
      let fromScheme        = true;
      let colorSchemeName   = def.colorScheme || null;
      let fontColor         = def.fontColor || null;
      let fontFromScheme    = !!def.fontFromScheme;
      let fontSchemeName    = def.fontColorScheme || null;
      let content           = def.values[r][c];

      const override = resolveColorOverride(def, r, c, def.values[r]);
      if (override) {
        if (override.color !== undefined) {
          color = override.color;
          fromScheme = override.fromScheme;
          colorSchemeName = override.fromScheme ? override.colorSchemeName : null;
        }
        if (override.fontColor !== undefined) {
          fontColor = override.fontColor;
          fontFromScheme = override.fontFromScheme;
          fontSchemeName = override.fontFromScheme ? override.fontSchemeName : null;
        }
        if (override.blank) content = "";
      }

      const validation = resolveValidationOverride(def, r, c);

      cells.push({
        row: def.startRow + r,
        col: def.startCol + c,
        value: content,
        color,
        border,
        fromScheme,
        colorSchemeName,
        fontColor,
        fontFromScheme,
        fontSchemeName,
        validation,
      });
    }
  }
  return cells;
}

function collectAllColoredCells() {
  if (_coloredCellsCache) return _coloredCellsCache; 

  const cellsBySheet = {};

  Object.entries(SHEET_CONFIG).forEach(([sheetName, config]) => {
    const list = [];

    Object.values(config.cells || {}).forEach(def => {
      expandDefToCells(resolve(def)).forEach(c => {
        if (c.color || c.fontColor) {
          list.push({ row: c.row, col: c.col, color: c.color, fromScheme: c.fromScheme, colorSchemeName: c.colorSchemeName, fontColor: c.fontColor, fontFromScheme: c.fontFromScheme, fontSchemeName: c.fontSchemeName });
        }
      });
    });

    Object.values(config.tables || {}).forEach(def => {
      expandDefToCells(resolve(def)).forEach(c => {
        if (c.color || c.fontColor) {
          list.push({ row: c.row, col: c.col, color: c.color, fromScheme: c.fromScheme, colorSchemeName: c.colorSchemeName, fontColor: c.fontColor, fontFromScheme: c.fontFromScheme, fontSchemeName: c.fontSchemeName });
        }
      });
    });

    collectBlockLabelCells(config.blocks).forEach(def => {
      expandDefToCells(def).forEach(c => {
        if (c.color || c.fontColor) {
          list.push({ row: c.row, col: c.col, color: c.color, fromScheme: c.fromScheme, colorSchemeName: c.colorSchemeName, fontColor: c.fontColor, fontFromScheme: c.fontFromScheme, fontSchemeName: c.fontSchemeName });
        }
      });
    });

    cellsBySheet[sheetName] = list;
  });

  Object.entries(RESTORE_ANCHOR_LABEL_CONFIG).forEach(([sheetName, anchors]) => {
    if (!cellsBySheet[sheetName]) cellsBySheet[sheetName] = [];
    Object.values(anchors).forEach(def => {
      const a = resolve(def);
      if (a.color) cellsBySheet[sheetName].push({ row: a.startRow, col: a.startCol, color: a.color, fromScheme: true, colorSchemeName: "ANCHOR" });
    });
  });

  _coloredCellsCache = cellsBySheet; 
  return cellsBySheet;
}


function writeSheetDefaults(sheetName, skipFlush) {
  const config = SHEET_CONFIG[sheetName];
  if (!config) return;
  const sheet = getASheet(sheetName);
  const edits = [];

  Object.values(config.cells  || {}).forEach(def => edits.push(...expandDefToCells(resolve(def))));
  Object.values(config.tables || {}).forEach(def => edits.push(...expandDefToCells(resolve(def))));
  collectBlockLabelCells(config.blocks).forEach(def => edits.push(...expandDefToCells(def)));

  applyEdits(sheet, edits, skipFlush);
}

function saveCustomColors() {
  const toSave = {};
  Object.keys(SHEET_COLORS_OFFSETS).forEach(name => {
    toSave[name] = COLORS[name];
  });
  PropertiesService.getScriptProperties().setProperty("customColors", JSON.stringify(toSave));
}

function detectSheetColorsChanges(colors) {
  const changed = {};
  Object.entries(colors).forEach(([name, hex]) => {
    if (COLORS[name] !== hex) {
      changed[name] = hex;
    }
  });
  return changed;
}

function detectSheetFontColorsChanges(fontColors) {
  const changed = {};
  Object.entries(fontColors).forEach(([name, hex]) => {
    if (FONT_COLORS[name] !== hex) changed[name] = hex;
  });
  return changed;
}

function saveCustomFontColors() {
  const toSave = {};
  Object.keys(SHEET_COLORS_OFFSETS).forEach(name => { toSave[name] = FONT_COLORS[name]; });
  PropertiesService.getScriptProperties().setProperty("customFontColors", JSON.stringify(toSave));
}

function applySheetColorsChange(changedBg, changedFont) {
  repaintSheetColors(changedBg, changedFont);
  Object.entries(changedBg).forEach(([name, hex])   => { COLORS[name] = hex; });
  Object.entries(changedFont).forEach(([name, hex]) => { FONT_COLORS[name] = hex; });
  saveCustomColors();
  saveCustomFontColors();
  invalidateRestorableDefsCache(); 
}

function previewSheetColorsSwatch(colors, fontColors) {
  const table     = resolve(HOMETABLES.SHEET_COLORS);
  const fontTable = resolve(HOMETABLES.SHEET_COLORS_FONT);
  const sheet     = getASheet(table.sheet);

  const names = Object.keys(SHEET_COLORS_OFFSETS)
    .sort((a, b) => SHEET_COLORS_OFFSETS[a] - SHEET_COLORS_OFFSETS[b]);

  names.forEach((name, i) => {
    const bgRow   = table.startRow + i;
    const fontRow = fontTable.startRow + i;
    sheet.getRange(bgRow, table.startCol).setBackground(colors[name]);           
    sheet.getRange(fontRow, fontTable.startCol).setBackground(fontColors[name]); 
  });
}

function handleSheetColorsEdit(e) {
  const changeCell = resolve(HOMEDEFAULTS.SHEET_COLORS_CHANGE_CHECKBOX);
  const output      = resolve(HOMETABLES.SHEET_COLORS_OUTPUT);
  const checkerCell = { sheet: output.sheet, row: output.startRow,     col: output.startCol };
  const statusCell  = { sheet: output.sheet, row: output.startRow + 1, col: output.startCol };

  const editedChangeCheckbox = e.range.getRow() === changeCell.row && e.range.getColumn() === changeCell.col;
  if (!editedChangeCheckbox) return;

  const { errors, colors, fontColors } = validateSheetColorsFormat();

  if (errors.length > 0) {
    setACellValue(checkerCell, errors.join("; "));
    setACellValue(statusCell, "Error: Fix invalid colors before applying.");
    setACellValue(changeCell, false);
    return;
  }

  setACellValue(checkerCell, "Error Checker");
  previewSheetColorsSwatch(colors, fontColors);

  const changedBg   = detectSheetColorsChanges(colors);
  const changedFont = detectSheetFontColorsChanges(fontColors);
  const hasChanges  = Object.keys(changedBg).length > 0 || Object.keys(changedFont).length > 0;

  if (!hasChanges) {
    setACellValue(statusCell, "Idle! Check the box to begin.");
    setACellValue(changeCell, false);
    return;
  }

  setACellValue(statusCell, "Modifying colors...");
  SpreadsheetApp.flush();

  applySheetColorsChange(changedBg, changedFont);

  setACellValue(statusCell, "Changes have been applied!");
  setACellValue(changeCell, false);
}