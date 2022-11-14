/**
 * Describes the order of transformations.
 */
export enum ObfuscateOrder {
  Preparation = 0,

  ObjectExtraction = 1,

  Flatten = 2,

  RGF = 3,

  Lock = 4, // Includes Integrity & Anti Debug

  Dispatcher = 6,

  DeadCode = 8,

  Calculator = 9,

  ControlFlowFlattening = 10,

  Eval = 11,

  GlobalConcealing = 12,

  OpaquePredicates = 13,

  StringSplitting = 16,

  StringConcealing = 17,

  StringCompression = 18,

  HideInitializingCode = 19,

  Stack = 20,

  DuplicateLiteralsRemoval = 22,

  Shuffle = 24,

  NameRecycling = 25,

  MovedDeclarations = 26,

  RenameVariables = 27,

  RenameLabels = 28,

  Minify = 30,

  ES5 = 31,

  StringEncoding = 32,

  AntiTooling = 34,

  HexadecimalNumbers = 35,
}
