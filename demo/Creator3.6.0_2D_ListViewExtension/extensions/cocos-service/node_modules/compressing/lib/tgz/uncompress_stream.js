'use strict';

const fs = require('fs');
const utils = require('../utils');
const ready = require('get-ready');
const streamifier = require('streamifier');
const FlushWritable = require('flushwritable');
const GzipUncompressStream = require('../gzip').UncompressStream;
const TarUncompressStream = require('../tar').UncompressStream;

class TgzUncompressStream extends FlushWritable {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    const newOpts = utils.clone(opts);
    newOpts.source = undefined;
    this._gzipStream = new GzipUncompressStream(newOpts)
      .on('error', err => this.emit('error', err));

    const tarStream = new TarUncompressStream(newOpts)
      .on('finish', () => this.ready(true))
      .on('entry', this.emit.bind(this, 'entry'))
      .on('error', err => this.emit('error', err));

    this._gzipStream.pipe(tarStream);

    const sourceType = utils.sourceType(opts.source);

    if (sourceType === 'file') {
      const stream = fs.createReadStream(opts.source, opts.fs);
      stream.on('error', err => this.emit('error', err));
      stream.pipe(this);
      return;
    }

    if (sourceType === 'buffer') {
      const stream = streamifier.createReadStream(opts.source, opts.streamifier);
      stream.on('error', err => this.emit('error', err));
      stream.pipe(this);
      return;
    }

    if (sourceType === 'stream') {
      opts.source.on('error', err => this.emit('error', err));
      opts.source.pipe(this);
    }

    // else: waiting to be piped
  }

  _write(chunk, encoding, callback) {
    this._gzipStream.write(chunk, encoding, callback);
  }

  _flush(callback) {
    this._gzipStream.end();
    this.ready(callback);
  }
}

ready.mixin(TgzUncompressStream.prototype);

module.exports = TgzUncompressStream;
