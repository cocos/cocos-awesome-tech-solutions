'use strict';

// https://github.com/thejoshwolfe/yauzl#no-streaming-unzip-api

const yauzl = require('yauzl');
const stream = require('stream');
const UncompressBaseStream = require('../base_write_stream');
const utils = require('../utils');

// lazy load iconv-lite
let iconv;

const YAUZL_CALLBACK = Symbol('ZipUncompressStream#yauzlCallback');
const STRIP_NAME = Symbol('ZipUncompressStream#stripName');

// don't decodeStrings on yauzl, we should handle fileName by ourself
// see validateFileName on https://github.com/thejoshwolfe/yauzl/blob/51010ce4e8c7e6345efe195e1b4150518f37b393/index.js#L607
//  - support "absolute path"
const DEFAULTS = { lazyEntries: true, decodeStrings: false };

// from: https://github.com/microsoft/vscode/blob/c0769274fa136b45799edeccc0d0a2f645b75caf/src/vs/base/node/zip.ts#L51
function modeFromEntry(entry) {
  const attr = entry.externalFileAttributes >> 16 || 33188;

  return [ 448 /* S_IRWXU */, 56 /* S_IRWXG */, 7 /* S_IRWXO */ ]
    .map(mask => attr & mask)
    .reduce((a, b) => a + b, attr & 61440 /* S_IFMT */);
}

class ZipUncompressStream extends UncompressBaseStream {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this._chunks = [];
    this._strip = Number(opts.strip) || 0;
    this._zipFileNameEncoding = opts.zipFileNameEncoding || 'utf8';
    if (this._zipFileNameEncoding === 'utf-8') {
      this._zipFileNameEncoding = 'utf8';
    }

    this[YAUZL_CALLBACK] = this[YAUZL_CALLBACK].bind(this);

    const sourceType = utils.sourceType(opts.source);

    const yauzlOpts = this._yauzlOpts = Object.assign({}, DEFAULTS, opts.yauzl);
    if (sourceType === 'file') {
      yauzl.open(opts.source, yauzlOpts, this[YAUZL_CALLBACK]);
      return;
    }

    if (sourceType === 'buffer') {
      yauzl.fromBuffer(opts.source, yauzlOpts, this[YAUZL_CALLBACK]);
      return;
    }

    if (sourceType === 'stream') {
      utils.streamToBuffer(opts.source)
      .then(buf => yauzl.fromBuffer(buf, yauzlOpts, this[YAUZL_CALLBACK]))
      .catch(e => this.emit('error', e));
      return;
    }

    this.on('pipe', srcStream => {
      srcStream.unpipe(srcStream);

      utils.streamToBuffer(srcStream)
      .then(buf => {
        this._chunks.push(buf);
        buf = Buffer.concat(this._chunks);
        yauzl.fromBuffer(buf, yauzlOpts, this[YAUZL_CALLBACK]);
      })
      .catch(e => this.emit('error', e));
    });
  }

  _write(chunk) {
    // push to _chunks array, this will only happen once, for stream will be unpiped.
    this._chunks.push(chunk);
  }

  [YAUZL_CALLBACK](err, zipFile) {
    if (err) return this.emit('error', err);

    zipFile.readEntry();

    zipFile
    .on('entry', entry => {
      const mode = modeFromEntry(entry);
      // fileName is buffer by default because decodeStrings = false
      if (Buffer.isBuffer(entry.fileName)) {
        if (this._zipFileNameEncoding === 'utf8') {
          entry.fileName = entry.fileName.toString();
        } else {
          if (!iconv) {
            iconv = require('iconv-lite');
          }
          entry.fileName = iconv.decode(entry.fileName, this._zipFileNameEncoding);
        }
      }
      // directory file names end with '/'
      const type = /\/$/.test(entry.fileName) ? 'directory' : 'file';
      const name = entry.fileName = this[STRIP_NAME](entry.fileName, type);

      const header = { name, type, yauzl: entry, mode };

      if (type === 'file') {
        zipFile.openReadStream(entry, (err, readStream) => {
          if (err) return this.emit('error', err);
          this.emit('entry', header, readStream, next);
        });
      } else { // directory
        const placeholder = new stream.Readable({ read() {} });
        this.emit('entry', header, placeholder, next);
        setImmediate(() => placeholder.emit('end'));
      }
    })
    .on('end', () => this.emit('finish'))
    .on('error', err => this.emit('error', err));

    function next() {
      zipFile.readEntry();
    }
  }

  [STRIP_NAME](fileName, type) {
    return utils.stripFileName(this._strip, fileName, type);
  }
}

module.exports = ZipUncompressStream;
