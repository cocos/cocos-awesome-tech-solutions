'use strict';

function ready(flagOrFunction) {
  this._ready = !!this._ready;
  this._readyCallbacks = this._readyCallbacks || [];

  if (arguments.length === 0) {
    // return a promise
    // support `this.ready().then(onready);` and `yield this.ready()`;
    return new Promise(function (resolve) {
      if (this._ready) {
        return resolve();
      }
      this._readyCallbacks.push(resolve);
    }.bind(this));
  } else if (typeof flagOrFunction === 'function') {
    this._readyCallbacks.push(flagOrFunction);
  } else {
    this._ready = !!flagOrFunction;
  }

  if (this._ready) {
    this._readyCallbacks.splice(0, Infinity).forEach(function(callback) {
      process.nextTick(callback);
    });
  }
}

function mixin(object) {
  object.ready = ready;
}

module.exports = mixin;
module.exports.mixin = mixin;
