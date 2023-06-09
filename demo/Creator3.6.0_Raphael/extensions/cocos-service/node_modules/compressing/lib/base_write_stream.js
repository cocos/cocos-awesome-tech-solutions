'use strict';

const stream = require('stream');

class UncompressBaseStream extends stream.Writable {
  emit(event, data) {
    if (event === 'error') {
      const error = data;
      if (error.name === 'Error') {
        error.name = this.constructor.name + 'Error';
      }
    }
    super.emit.apply(this, arguments);
  }
}

module.exports = UncompressBaseStream;
