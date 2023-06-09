'use strict';

const stream = require('stream');

class BaseStream extends stream.Readable {
  addEntry(/* entry, opts */) {
    throw new Error('.addEntry not implemented in sub class!');
  }

  _read() {}

  emit(event, data) {
    if (event === 'error') {
      const error = data;
      if (error.name === 'Error') {
        error.name = this.constructor.name + 'Error';
      }
    }
    super.emit(event, data);
  }
}

module.exports = BaseStream;
