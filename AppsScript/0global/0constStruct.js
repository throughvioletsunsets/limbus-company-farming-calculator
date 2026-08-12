// 0global/0constStruct.gs

function TABLE(name, {
  sheet,
  startRow,
  startCol,
  endRow,
  endCol,
  values,
  color,
  fontColor = null,
  fontFromScheme = false,
  colorScheme = null,        
  fontColorScheme = null,    
  border,
  colorOverrides = [],
  validations = [],
}) {
  const t = {
      type: "TABLE",
      name,
      sheet,
      startRow,
      startCol,
      endRow,
      endCol,
      values,
      color,
      fontColor,
      fontFromScheme,
      colorScheme,        
      fontColorScheme,    
      border,
      colorOverrides,
      validations,

      numRows: endRow - startRow + 1,
      numCols: endCol - startCol + 1
    };

  if (t.numRows === 1 && t.numCols === 1) {
    t.row = t.startRow;
    t.col = t.startCol;
  }

  return t;
}


function parseA1(ref) {
  const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid A1 reference: ${ref}`);
  const [, colLetters, rowStr] = match;

  let col = 0;
  for (let i = 0; i < colLetters.length; i++) {
    col = col * 26 + (colLetters.charCodeAt(i) - 64);
  }

  return { row: parseInt(rowStr, 10), col };
}

function ANCHOR(name, {
  sheet,
  startRow,
  startCol,
  numRows,
  numCols,
  endRow = startRow + numRows - 1,
  endCol = startCol + numCols - 1,
  value = null,
  color = COLORS.NULL,
  border = false
}) {
  return {
    type: "ANCHOR",
    name,
    sheet,
    startRow,
    startCol,
    numRows,
    numCols,
    endRow,
    endCol,
    value,
    color,
    border
  };
}


function regionColor(type) {
  switch (type) {
    case "INPUT":    return COLORS.INPUT;
    case "OUTPUT":   return COLORS.OUTPUT;
    case "CONSTANT": return COLORS.CONSTANT;
    case "LABEL":    return null;
    default: throw new Error(`BLOCK region: unknown type "${type}"`);
  }
}

function regionFontColor(type) {
  switch (type) {
    case "INPUT":    return FONT_COLORS.INPUT;
    case "OUTPUT":   return FONT_COLORS.OUTPUT;
    case "CONSTANT": return FONT_COLORS.CONSTANT;
    case "LABEL":    return null; 
    default: throw new Error(`BLOCK region: unknown type "${type}"`);
  }
}

function BLOCK(name, { sheet, anchorPos, value, anchorColor = COLORS.ANCHOR, anchorBorder = true, regions, footprint = {} }) {
  const parts = {};
  let maxRow = anchorPos.row;
  let maxCol = anchorPos.col;

  regions.forEach(r => {
    const startRow = anchorPos.row + r.rowOffset;
    const startCol = anchorPos.col + r.colOffset;
    const numRows  = r.values.length;
    const numCols  = r.values[0].length;
    const explicitFont = r.fontColor !== undefined;

    const table = TABLE(`${name}_${r.key}`, {
      sheet,
      startRow, startCol,
      endRow: startRow + numRows - 1,
      endCol: startCol + numCols - 1,
      values: r.values,
      color: regionColor(r.type),
      fontColor: explicitFont ? r.fontColor : regionFontColor(r.type),
      fontFromScheme: !explicitFont,
      border: r.border !== false,
      colorOverrides: r.colorOverrides || [],
      validations: r.validations || [],  
    });
    table.regionType = r.type;
    table.colorScheme     = regionColor(r.type) !== null ? r.type : null;
    table.fontColorScheme = (!explicitFont && regionFontColor(r.type) !== null) ? r.type : null;

    parts[r.key] = table;
    maxRow = Math.max(maxRow, table.endRow);
    maxCol = Math.max(maxCol, table.endCol);
  });

  if (footprint.numRows) maxRow = Math.max(maxRow, anchorPos.row + footprint.numRows - 1);
  if (footprint.numCols) maxCol = Math.max(maxCol, anchorPos.col + footprint.numCols - 1);

  parts.ANCHOR = ANCHOR(`${name}_ANCHOR`, {
    sheet,
    startRow: anchorPos.row,
    startCol: anchorPos.col,
    numRows: maxRow - anchorPos.row + 1,
    numCols: maxCol - anchorPos.col + 1,
    value,
    color: anchorColor,
    border: anchorBorder,
  });

  return parts;
}
