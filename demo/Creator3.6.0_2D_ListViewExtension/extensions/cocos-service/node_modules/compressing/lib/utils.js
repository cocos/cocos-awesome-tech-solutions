'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const pump = require('pump');

// file/fileBuffer/stream
exports.sourceType = source => {
  if (!source) return undefined;

  if (source instanceof Buffer) return 'buffer';
  if (typeof source._read === 'function' || typeof source._transform === 'function') return 'stream';
  if (typeof source !== 'string') {
    const err = new Error('Type is not supported, must be a file path, file buffer, or a readable stream');
    err.name = 'IlligalSourceError';
    throw err;
  }

  return 'file';
};

function destType(dest) {
  if (typeof dest._write === 'function' || typeof dest._transform === 'function') return 'stream';
  if (typeof dest !== 'string') {
    const err = new Error('Type is not supported, must be a file path, or a writable stream');
    err.name = 'IlligalDestinationError';
    throw err;
  }
  return 'path';
}

exports.destType = destType;

const illigalEntryError = new Error('Type is not supported, must be a file path, directory path, file buffer, or a readable stream');
illigalEntryError.name = 'IlligalEntryError';

// fileOrDir/fileBuffer/stream
exports.entryType = entry => {
  if (!entry) return;

  if (entry instanceof Buffer) return 'buffer';
  if (typeof entry._read === 'function' || typeof entry._transform === 'function') return 'stream';
  if (typeof entry !== 'string') throw illigalEntryError;

  return 'fileOrDir';
};


exports.clone = obj => {
  const newObj = {};
  for (const i in obj) {
    newObj[i] = obj[i];
  }
  return newObj;
};

exports.makeFileProcessFn = StreamClass => {
  return (source, dest, opts) => {
    opts = opts || {};
    opts.source = source;
    const destStream = destType(dest) === 'path' ? fs.createWriteStream(dest) : dest;
    const compressStream = new StreamClass(opts);
    return safePipe([ compressStream, destStream ]);
  };
};

exports.makeCompressDirFn = StreamClass => {
  return (dir, dest, opts) => {
    const destStream = destType(dest) === 'path' ? fs.createWriteStream(dest) : dest;
    const compressStream = new StreamClass();
    compressStream.addEntry(dir, opts);
    return safePipe([ compressStream, destStream ]);
  };
};

exports.makeUncompressFn = StreamClass => {
  return (source, destDir, opts) => {
    opts = opts || {};
    opts.source = source;
    if (destType(destDir) !== 'path') {
      const error = new Error('uncompress destination must be a directory');
      error.name = 'IlligalDestError';
      throw error;
    }

    return new Promise((resolve, reject) => {
      mkdirp(destDir, err => {
        if (err) return reject(err);

        let entryCount = 0;
        let successCount = 0;
        let isFinish = false;
        function done() {
          // resolve when both stream finish and file write finish
          if (isFinish && entryCount === successCount) resolve();
        }

        new StreamClass(opts)
          .on('finish', () => {
            isFinish = true;
            done();
          })
          .on('error', reject)
          .on('entry', (header, stream, next) => {
            stream.on('end', next);

            if (header.type === 'file') {
              const fullpath = path.join(destDir, header.name);
              mkdirp(path.dirname(fullpath), err => {
                if (err) return reject(err);

                entryCount++;
                pump(stream, fs.createWriteStream(fullpath, { mode: header.mode }), err => {
                  if (err) return reject(err);

                  successCount++;
                  done();
                });
              });
            } else { // directory
              mkdirp(path.join(destDir, header.name), err => {
                if (err) return reject(err);
                stream.resume();
              });
            }
          });
      });
    });
  };
};

exports.streamToBuffer = stream => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream
    .on('readable', () => {
      let chunk;
      while ((chunk = stream.read())) chunks.push(chunk);
    })
    .on('end', () => resolve(Buffer.concat(chunks)))
    .on('error', err => reject(err));
  });
};

function safePipe(streams) {
  return new Promise((resolve, reject) => {
    pump(streams[0], streams[1], err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

exports.safePipe = safePipe;

exports.stripFileName = (strip, fileName, type) => {
  // before
  // node/package.json
  // node/lib/index.js
  //
  // when strip 1
  // package.json
  // lib/index.js
  //
  // when strip 2
  // package.json
  // index.js
  if (Buffer.isBuffer(fileName)) fileName = fileName.toString();

  // use / instead of \\
  if (fileName.indexOf('\\') !== -1) fileName = fileName.replace(/\\+/g, '/');

  // fix absolute path
  // /foo => foo
  if (fileName[0] === '/') fileName = fileName.replace(/^\/+/, '');

  let s = fileName.split('/');

  // fix relative path
  // foo/../bar/../../asdf/
  //  => asdf/
  if (s.indexOf('..') !== -1) {
    fileName = path.normalize(fileName);
    // https://npm.taobao.org/mirrors/node/latest/docs/api/path.html#path_path_normalize_path
    if (process.platform === 'win32') fileName = fileName.replace(/\\+/g, '/');
    // replace '../' on ../../foo/bar
    fileName = fileName.replace(/(\.\.\/)+/, '');
    if (type === 'directory' && fileName && fileName[fileName.length - 1] !== '/') {
      fileName += '/';
    }
    s = fileName.split('/');
  }

  strip = Math.min(strip, s.length - 1);
  return s.slice(strip).join('/') || '/';
};
