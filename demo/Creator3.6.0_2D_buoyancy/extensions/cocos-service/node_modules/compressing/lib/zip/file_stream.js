'use strict';

const path = require('path');
const yazl = require('yazl');
const assert = require('assert');
const stream = require('stream');
const utils = require('../utils');
const ready = require('get-ready');

class ZipFileStream extends stream.Transform {
  constructor(opts) {
    super(opts);

    const sourceType = utils.sourceType(opts.source);

    const zipfile = new yazl.ZipFile();
    const zipStream = zipfile.outputStream;
    zipStream.on('data', data => this.push(data));
    zipStream.on('end', () => this.ready(true));
    zipfile.on('error', err => this.emit('error', err));

    if (sourceType !== 'file') {
      assert(opts.relativePath, 'opts.relativePath is required when compressing a buffer, or a stream');
    }

    if (sourceType) {
      this.end();
    }

    if (sourceType === 'file') {
      zipfile.addFile(opts.source, opts.relativePath || path.basename(opts.source), opts.yazl);
    } else if (sourceType === 'buffer') {
      zipfile.addBuffer(opts.source, opts.relativePath, opts.yazl);
    } else if (sourceType === 'stream') {
      zipfile.addReadStream(opts.source, opts.relativePath, opts.yazl);
    } else { // undefined
      const passThrough = this._passThrough = new stream.PassThrough();
      this.on('finish', () => passThrough.end());
      zipfile.addReadStream(passThrough, opts.relativePath, opts.yazl);
    }
    zipfile.end(opts.yazl);
  }

  _transform(chunk, encoding, callback) {
    if (this._passThrough) {
      this._passThrough.write(chunk, encoding, callback);
    }
  }

  _flush(callback) {
    this.ready(callback);
  }
}

ready.mixin(ZipFileStream.prototype);
module.exports = ZipFileStream;
