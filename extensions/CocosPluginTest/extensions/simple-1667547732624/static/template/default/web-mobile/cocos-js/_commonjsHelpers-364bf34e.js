System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports({
				c: createCommonjsModule,
				u: unwrapExports
			});

			var commonjsGlobal = exports('a', typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});

			function unwrapExports (x) {
				return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
			}

			function createCommonjsModule(fn, module) {
				return module = { exports: {} }, fn(module, module.exports), module.exports;
			}

		}
	};
});
