// 0global/0letColors.gs

let COLORS = {
  NULL: null,
  WHITE: "#FFFFFF",
  INPUT: "#b6d7a8",
  OUTPUT: "#ea9999",
  CONSTANT: "#cccccc",
  ANCHOR: "#fff2cc",
  TICKET_IV: "#088d99",
  TICKET_III: "#eece00",
  TICKET_II: "#dcdcdc",
  TICKET_I: "#a36320",
  YI_SANG: "#D4DFE8",
  FAUST: "#FFBFB4",
  DON_QUIXOTE: "#FFEF23",
  RYOSHU: "#CF0000",
  MEURSAULT: "#293B95",
  HONG_LU: "#5BFFDE",
  HEATHCLIFF: "#4E3076",
  ISHMAEL: "#FF9500",
  RODION: "#820000",
  SINCLAIR: "#8B9C15",
  OUTIS: "#325339",
  GREGOR: "#69350B",
  LIMBUS_RED: "#c0060a",
  LIMBUS_YELLOW: "#eec819",
  ZAYIN_BG: "#7D4F27",
  ZAYIN_TEXT: "#EFC009",
  TETH_BG: "#9E683A",
  TETH_TEXT: "#FAAC0C",
  HE_BG: "#BE5D00",
  HE_TEXT: "#F09F03",
  WAW_BG: "#BD4200",
  WAW_TEXT: "#FB8D12",
  ALEPH_BG: "#A11112",
  ALEPH_TEXT: "#D94B07",
};

const DEFAULT_COLORS = Object.freeze({ ...COLORS });

(function loadCustomColors() {
  const raw = PropertiesService.getScriptProperties().getProperty("customColors");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.keys(COLORS).forEach(key => {
      if (typeof saved[key] === "string") COLORS[key] = saved[key];
    });
  } catch (err) {}
})();

let FONT_COLORS = {
  INPUT: "#000000",
  OUTPUT: "#000000",
  CONSTANT: "#000000",
  ANCHOR: "#000000",
};

const DEFAULT_FONT_COLORS = Object.freeze({ ...FONT_COLORS });

(function loadCustomFontColors() {
  const raw = PropertiesService.getScriptProperties().getProperty("customFontColors");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.keys(FONT_COLORS).forEach(key => {
      if (typeof saved[key] === "string") FONT_COLORS[key] = saved[key];
    });
  } catch (err) {}
})();