'use strict';

const fs = require('fs');
const path = require('path');
const stream = require('stream');
const tar = require('tar-stream');
const utils = require('../utils');
const ready = require('get-ready');

class TarFileStream extends stream.Transform {
  constructor(opts) {
    super(opts);

    const pack = tar.pack();
    pack.on('data', chunk => this.push(chunk));
    pack.on('end', () => this.ready(true));

    const sourceType = utils.sourceType(opts.source);

    if (sourceType === 'file') {
      // stat file to get file size
      fs.stat(opts.source, (err, stat) => {
        if (err) return this.emit('error', err);
        this.entry = pack.entry({ name: opts.relativePath || path.basename(opts.source), size: stat.size, mode: stat.mode & 0o777 }, err => {
          if (err) return this.emit('error', err);
          pack.finalize();
        });
        const stream = fs.createReadStream(opts.source, opts.fs);
        stream.on('error', err => this.emit('error', err));
        stream.pipe(this);
      });
    } else if (sourceType === 'buffer') {
      if (!opts.relativePath) return this.emit('error', 'opts.relativePath is required if opts.source is a buffer');

      pack.entry({ name: opts.relativePath }, opts.source);
      pack.finalize();
      this.end();
    } else { // stream or undefined
      if (!opts.relativePath) return process.nextTick(() => this.emit('error', 'opts.relativePath is required'));

      if (opts.size) {
        this.entry = pack.entry({ name: opts.relativePath, size: opts.size }, err => {
          if (err) return this.emit('error', err);
          pack.finalize();
        });
      } else {
        if (!opts.suppressSizeWarning) {
          console.warn('You should specify the size of streamming data by opts.size to prevent all streaming data from loading into memory. If you are sure about memory cost, pass opts.suppressSizeWarning: true to suppress this warning');
        }
        const buf = [];
        this.entry = new stream.Writable({
          write(chunk, _, callback) {
            buf.push(chunk);
            callback();
          },
        });
        this.entry.on('finish', () => {
          pack.entry({ name: opts.relativePath }, Buffer.concat(buf));
          pack.finalize();
        });
      }

      if (sourceType === 'stream') {
        opts.source.on('error', err => this.emit('error', err));
        opts.source.pipe(this);
      }
    }
  }

  _transform(chunk, encoding, callback) {
    if (this.entry) {
      this.entry.write(chunk, encoding, callback);
    }
  }

  _flush(callback) {
    if (this.entry) {
      this.entry.end();
    }
    this.ready(callback);
  }
}

ready.mixin(TarFileStream.prototype);

module.exports = TarFileStream;
