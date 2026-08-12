// 0global/1let1Const.gs

const YES_NO = ["Yes", "No"];

const DELETE_ROWS_OFFSETS = {
  TYPE: 0,
  FROM_ROW: 1,
  TO_ROW: 2,
  CHANGE: 3,
  CHECKER: 4,
  MESSAGE: 5
};

const DELETE_ROWS_TYPES = ["Single Row", "Bulk Rows"];

const FULL_TYPES = ["Clear", "Skip", "None"];

const MIX_TYPES = ["Module", "Time", "None"];

const TICKETS_HIGHEST_DUNGEON = [9, 8, 7, 6, 5, 4, 3, 2, 1];

const TICKETS_SINNER_INPUT = {
  NUMBER: 0,
  NAME: 1,
  FROM: 2,
  EXCESS: 3,
  TO: 4
};

const TICKETS_SINNER_OUTPUT = {
  MIN_XP: 0,
  IV: 1,
  III: 2,
  II: 3,
  I: 4,
  EXCESS: 5
};

const TICKET_CONST = {
  IV: 0,
  III: 1,
  II: 2,
  I: 3,
};

const TICKETS_CONST = {
  STAGE: 0,
  MODE: 1,
  IV: 2,
  III: 3,
  II: 4,
  I: 5,
  TOTAL_XP: 6,
  TOTAL_MODULE: 7,
};


const THREADS_HIGHEST_DUNGEON = [60, 50, 40, 30, 20];

const THREADS_TODAY_BONUS_OPTIONS = [3, 2, 1, 0];

const THREADS_SINNER_INPUT = {
  NUMBER: 0,
  NAME: 1,
  TYPE: 2,
  ID_RARITY: 3,
  ID_FROM: 4,
  ID_TO: 5,
  EGO_GRADE: 6,
  EGO_FROM: 7,
  EGO_TO: 8,
};

const EXPECTED_HMS = {
  HOURS: 0,
  MINUTES: 1,
  SECONDS: 2
};

const EXPECTED_MWD = {
  MONTHS: 0,
  WEEKS: 1,
  DAYS: 2
};  

const TOTAL_RUNS_ROW = {
  CLEAR_BASE:  0,
  CLEAR_DAILY: 1,
  SKIP_BASE:   2,
  SKIP_DAILY:  3,
  SUM_THREADS: 4,
};


const CRATES_SINNER_SHARDS_1 = {
  YI_SANG: 0,
  FAUST: 1,
  DON_QUIXOTE: 2,
  RYOSHU: 3,
  MEURSAULT: 4,
  HONG_LU: 5,
};

const CRATES_SINNER_SHARDS_2 = {
  HEATHCLIFF: 0,
  ISHMAEL: 1,
  RODION: 2,
  SINCLAIR: 3,
  OUTIS: 4,
  GREGOR: 5,
};

const CRATES_SINNER_INPUT = {
  NUMBER: 0,
  NAME: 1,
  SINNER: 2,
  TYPE: 3,
  ID_RARITY: 4,
  ID_FROM: 5,
  ID_TO: 6,
  EGO_GRADE: 7,
  EGO_FROM: 8,
  EGO_TO: 9,
};

const CRATES_SINNER_OUTPUT = {
  INITIAL_SHARDS: 0,
  FINAL_SHARDS: 1,
  MIN_CRATES: 2,
  AVG_CRATES: 3,
  MAX_CRATES: 4,
};

const CRATES_REQ = {
  MIN: 0,
  AVG: 1,
  MAX: 2
};

const CRATES_TYPES = ["Minimum", "Average", "Maximum"];


const CRATES_MD_RUN = {
  EASY: 0,
  HARD: 1,
  NORMAL: 2
};

const CRATES_TIME = {
  MONTHS: 0,
  WEEKS: 1,
  DAYS: 2,
  HOURS: 3,
  MINUTES: 4
};


const FACADE_CONST = {
  LABEL: 0,
  THREADS: 1,
  SHARDS:  2,
};

const EXTRACT_CONST = {
  LABEL: 0,
  ID_00: 1,
  ID_000:  2,
  EGO:  3,
};



const THREADS_CONST = {
  DIFFICULTY: 0,
  MODE: 1,
  THREADS_BASE: 2,
  THREADS_DAILY: 3,
  TOTAL_MODULE: 4,
};

const UPTIE_CONST = {
  TIER:        0,
  O_THREADS:   1,
  O_SHARDS:    2,
  OO_THREADS:  3,
  OO_SHARDS:   4,
  OOO_THREADS: 5,
  OOO_SHARDS:  6,
};

const THREADSPIN_CONST = {
  TIER:          0,
  ZAYIN_THREADS: 1,
  ZAYIN_SHARDS:  2,
  TETH_THREADS:  3,
  TETH_SHARDS:   4,
  HE_THREADS:    5,
  HE_SHARDS:     6,
  WAW_THREADS:   7,
  WAW_SHARDS:    8,
};

const UPTIE_TIER_ORDER = { 
  I: 0, 
  II: 1, 
  III: 2, 
  IV: 3 
};

const EGO_TIER_ORDER   = { 
  I: 0, 
  II: 1,
  III: 2, 
  IV: 3, 
  V: 4 
};

const MD_PASS_ORDER = {
  APPLY_WEEKLY_BONUS: 0,
  TOTAL_XP: 1,
  COST: 2
}; 

const MAX_SINNER_ROWS = 50; 

const MAX_CLEAR_SECONDS = 28800; 