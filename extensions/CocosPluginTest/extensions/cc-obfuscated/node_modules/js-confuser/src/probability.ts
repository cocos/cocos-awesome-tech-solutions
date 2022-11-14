import { ok } from "assert";
import { createObject } from "./util/object";

type Stringed<V> = (V extends string ? V : never) | "true" | "false";

/**
 * Configurable probabilities for obfuscator options.
 * - **`false`** = this feature is disabled
 * - **`true`** = this feature is enabled, use default mode
 * - **`0.5`** = 50% chance
 * - **`"mode"`** = enabled, use specified mode
 * - **`["mode1", "mode2"]`** - enabled, choose random mode each occurrence
 * - **`{"mode1": 0.5, "mode2": 0.5}`** - enabled, choose based on specified probabilities
 * - **`{"mode1": 50, "mode2": 50}`** - enabled, each is divided based on total
 * - **`function(x){ return "custom_implementation" }`** - enabled, use specified function
 */
export type ProbabilityMap<T> =
  | false
  | true
  | number
  | T
  | T[]
  | { [key in Stringed<T>]?: number }
  | ((...params: any[]) => any);

/**
 * Evaluates a ProbabilityMap.
 * @param map The setting object.
 * @param runner Custom function to determine return value
 * @param customFnArgs Args given to user-implemented function, such as a variable name.
 */
export function ComputeProbabilityMap<T>(
  map: ProbabilityMap<T>,
  runner: (mode?: T) => any = (x?: T) => x,
  ...customFnArgs: any[]
): any {
  if (!map) {
    return runner();
  }
  if (map === true || map === 1) {
    return runner(true as any);
  }
  if (typeof map === "number") {
    return runner((Math.random() < map) as any);
  }

  if (typeof map === "function") {
    return (map as any)(...customFnArgs);
  }
  if (typeof map === "string") {
    return runner(map);
  }
  var asObject: { [mode: string]: number } = {};
  if (Array.isArray(map)) {
    map.forEach((x: any) => {
      asObject[x.toString()] = 1;
    });
  } else {
    asObject = map as any;
  }

  var total = Object.values(asObject).reduce((a, b) => a + b);
  var percentages = createObject(
    Object.keys(asObject),
    Object.values(asObject).map((x) => x / total)
  );

  var ticket = Math.random();

  var count = 0;
  var winner = null;
  Object.keys(percentages).forEach((key) => {
    var x = parseFloat(percentages[key]);

    if (ticket >= count && ticket < count + x) {
      winner = key;
    }
    count += x;
  });

  return runner(winner);
}

/**
 * Determines if a probability map can return a positive result (true, or some string mode).
 * - Negative probability maps are used to remove transformations from running entirely.
 * @param map
 */
export function isProbabilityMapProbable<T>(map: ProbabilityMap<T>): boolean {
  if (!map || typeof map === "undefined") {
    return false;
  }
  if (typeof map === "function") {
    return true;
  }
  if (typeof map === "number") {
    if (map > 1 || map < 0) {
      throw new Error(`Numbers must be between 0 and 1 for 0% - 100%`);
    }
    if (isNaN(map)) {
      throw new Error("Numbers cannot be NaN");
    }
  }
  if (Array.isArray(map)) {
    ok(
      map.length != 0,
      "Empty arrays are not allowed for options. Use false instead."
    );

    if (map.length == 1) {
      return !!map[0];
    }
  }
  if (typeof map === "object") {
    var keys = Object.keys(map);
    ok(
      keys.length != 0,
      "Empty objects are not allowed for options. Use false instead."
    );

    if (keys.length == 1) {
      return !!keys[0];
    }
  }
  return true;
}
