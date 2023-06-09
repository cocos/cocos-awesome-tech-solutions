'use strict';

const tar = require('../tar');
const gzip = require('../gzip');
const BaseStream = require('../base_stream');

class TgzStream extends BaseStream {
  constructor(opts) {
    super(opts);

    const tarStream = this._tarStream = new tar.Stream();
    tarStream.on('error', err => this.emit('error', err));

    const gzipStream = new gzip.FileStream();
    gzipStream.on('end', () => this.push(null));
    gzipStream.on('data', chunk => this.push(chunk));
    gzipStream.on('error', err => this.emit('error', err));

    tarStream.pipe(gzipStream);
  }

  addEntry(entry, opts) {
    this._tarStream.addEntry(entry, opts);
  }
}

module.exports = TgzStream;
