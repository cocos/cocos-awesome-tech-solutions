'use strict';

const tar = require('../tar');
const gzip = require('../gzip');
const utils = require('../utils');
const stream = require('stream');
const pump = require('pump');
const ready = require('get-ready');

class TgzFileStream extends stream.Transform {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    const sourceType = this._sourceType = utils.sourceType(opts.source);

    const tarStream = this._tarStream = new tar.FileStream(opts);
    opts = utils.clone(opts);
    delete opts.source;
    const gzipStream = new gzip.FileStream(opts);

    gzipStream.on('data', chunk => {
      this.push(chunk);
    });
    gzipStream.on('end', () => this.ready(true));

    pump(tarStream, gzipStream, err => {
      err && this.emit('error', err);
    });

    if (sourceType !== 'stream' && sourceType !== undefined) {
      this.end();
    }
  }

  _transform(chunk, encoding, callback) {
    this._tarStream.write(chunk, encoding, callback);
  }

  _flush(callback) {
    if (this._sourceType === 'stream' || this._sourceType === undefined) {
      this._tarStream.end();
    }
    this.ready(callback);
  }
}

ready.mixin(TgzFileStream.prototype);
module.exports = TgzFileStream;
