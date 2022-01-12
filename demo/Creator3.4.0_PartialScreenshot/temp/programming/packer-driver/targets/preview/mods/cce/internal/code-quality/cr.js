System.register([], function (_export, _context) {
  "use strict";

  /**
   * This is the module which implements circular-reference detection.
   */

  /**
   * Reports a circular reference error fired by module import.
   * @param imported The binding of the import.
   * @param moduleRequest The module request of the import.
   * @param importMeta The import.meta of the source module.
   * @param extras Extra data passed by circular reference detection implementation.
   */
  function report(imported, moduleRequest, importMeta, extras) {
    console.warn("Found possible circular reference in \"" + importMeta.url + "\", happened when use \"" + imported + "\" imported from \"" + moduleRequest + "\" ", extras.error);
  }

  _export("report", report);

  return {
    setters: [],
    execute: function () {}
  };
});
//# sourceMappingURL=cr.js.map