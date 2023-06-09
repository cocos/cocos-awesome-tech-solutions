'use strict';

const fs = require('fs');
const path = require('path');
const stream = require('stream');
const tar = require('tar-stream');
const utils = require('../utils');
const BaseStream = require('../base_stream');

class TarStream extends BaseStream {
  constructor(opts) {
    super(opts);

    this._waitingEntries = [];
    this._processing = false;
    this._init(opts);
  }

  _init() {
    const pack = this._pack = tar.pack();
    pack.on('end', () => this.push(null));
    pack.on('data', chunk => this.push(chunk));
    pack.on('error', err => this.emit('error', err));
  }

  addEntry(entry, opts) {
    if (this._processing) {
      return this._waitingEntries.push([ entry, opts ]);
    }

    opts = opts || {};
    this._processing = true;

    const entryType = utils.entryType(entry);
    if (!entryType) return; // TODO

    if (entryType === 'fileOrDir') {
      this._addFileOrDirEntry(entry, opts);
    } else if (entryType === 'buffer') {
      this._addBufferEntry(entry, opts);
    } else { // stream
      this._addStreamEntry(entry, opts);
    }

  }

  _addFileOrDirEntry(entry, opts) {
    fs.stat(entry, (err, stat) => {
      if (err) return this.emit('error', err);
      if (stat.isDirectory()) return this._addDirEntry(entry, opts);
      if (stat.isFile()) return this._addFileEntry(entry, opts);

      const illigalEntryError = new Error('Type is not supported, must be a file path, directory path, file buffer, or a readable stream');
      illigalEntryError.name = 'IlligalEntryError';
      this.emit('error', illigalEntryError);
    });
  }

  _addFileEntry(entry, opts) {
    // stat file to get file size
    fs.stat(entry, (err, stat) => {
      if (err) return this.emit('error', err);
      const entryStream = this._pack.entry({ name: opts.relativePath || path.basename(entry), size: stat.size, mode: stat.mode & 0o777 }, this._onEntryFinish.bind(this));
      const stream = fs.createReadStream(entry, opts.fs);
      stream.on('error', err => this.emit('error', err));
      stream.pipe(entryStream);
    });
  }

  _addDirEntry(entry, opts) {
    fs.readdir(entry, (err, files) => {
      if (err) return this.emit('error', err);

      const relativePath = opts.relativePath || '';
      files.forEach(fileOrDir => {
        const newOpts = utils.clone(opts);
        if (opts.ignoreBase) {
          newOpts.relativePath = path.join(relativePath, fileOrDir);
        } else {
          newOpts.relativePath = path.join(relativePath, path.basename(entry), fileOrDir);
        }
        newOpts.ignoreBase = true;
        this.addEntry(path.join(entry, fileOrDir), newOpts);
      });
      this._onEntryFinish();
    });
  }

  _addBufferEntry(entry, opts) {
    if (!opts.relativePath) return this.emit('error', 'opts.relativePath is required if entry is a buffer');
    this._pack.entry({ name: opts.relativePath }, entry, this._onEntryFinish.bind(this));
  }

  _addStreamEntry(entry, opts) {
    entry.on('error', err => this.emit('error', err));

    if (!opts.relativePath) return this.emit('error', new Error('opts.relativePath is required'));

    if (opts.size) {
      const entryStream = this._pack.entry({ name: opts.relativePath, size: opts.size }, this._onEntryFinish.bind(this));
      entry.pipe(entryStream);
    } else {
      if (!opts.suppressSizeWarning) {
        console.warn('You should specify the size of streamming data by opts.size to prevent all streaming data from loading into memory. If you are sure about memory cost, pass opts.suppressSizeWarning: true to suppress this warning');
      }
      const buf = [];
      const collectStream = new stream.Writable({
        write(chunk, _, callback) {
          buf.push(chunk);
          callback();
        },
      });
      collectStream.on('error', err => this.emit('error', err));
      collectStream.on('finish', () => {
        this._pack.entry({ name: opts.relativePath }, Buffer.concat(buf), this._onEntryFinish.bind(this));
      });
      entry.pipe(collectStream);
    }
  }

  _read() {}

  _onEntryFinish(err) {
    if (err) return this.emit('error', err);

    this._processing = false;
    const waitingEntry = this._waitingEntries.shift();
    if (waitingEntry) {
      this.addEntry.apply(this, waitingEntry);
    } else {
      this._finalize();
    }
  }

  _finalize() {
    this._pack.finalize();
  }
}

module.exports = TarStream;
