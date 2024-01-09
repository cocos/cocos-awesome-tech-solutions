System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var bullet_wasm = exports('default', new URL('assets/bullet.wasm-c98527b6.wasm', module.meta.url).href);

		}
	};
});
