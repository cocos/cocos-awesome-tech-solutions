'use strict';

const path = require('path');
const yazl = require('yazl');
const TarStream = require('../tar/stream');

class ZipStream extends TarStream {
  _init() {
    const zipfile = this._zipfile = new yazl.ZipFile();
    const stream = zipfile.outputStream;
    stream.on('end', () => this.push(null));
    stream.on('data', chunk => this.push(chunk));
    stream.on('error', err => this.emit('error', err));
  }

  _addFileEntry(entry, opts) {
    this._zipfile.addFile(entry, opts.relativePath || path.basename(entry), opts);
    this._onEntryFinish();
  }

  _addBufferEntry(entry, opts) {
    if (!opts.relativePath) return this.emit('error', new Error('opts.relativePath is required if entry is a buffer'));
    this._zipfile.addBuffer(entry, opts.relativePath, opts);
    this._onEntryFinish();
  }

  _addStreamEntry(entry, opts) {
    if (!opts.relativePath) return this.emit('error', new Error('opts.relativePath is required if entry is a stream'));

    entry.on('error', err => this.emit('error', err));
    this._zipfile.addReadStream(entry, opts.relativePath, opts);
    this._onEntryFinish();
  }

  _finalize() {
    this._zipfile.end();
  }
}

module.exports = ZipStream;
