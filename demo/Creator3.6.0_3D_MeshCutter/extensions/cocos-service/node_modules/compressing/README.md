# compressing

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/compressing.svg?style=flat-square
[npm-url]: https://npmjs.org/package/compressing
[codecov-image]: https://codecov.io/gh/node-modules/compressing/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/compressing
[download-image]: https://img.shields.io/npm/dm/compressing.svg?style=flat-square
[download-url]: https://npmjs.org/package/compressing

The missing compressing and uncompressing lib for node.

Currently supported:

- tar
- gzip
- tgz
- zip

## Install

```bash
npm install compressing
```

## Usage

### Compress a single file

Use gzip as an example, tar, tgz and zip is same as gzip.

__promise style__

```js
const compressing = require('compressing');

// compress a file
compressing.gzip.compressFile('file/path/to/compress', 'path/to/destination.gz')
.then(compressDone)
.catch(handleError);

// compress a file buffer
compressing.gzip.compressFile(buffer, 'path/to/destination.gz')
.then(compressDone)
.catch(handleError);

// compress a stream
compressing.gzip.compressFile(stream, 'path/to/destination.gz')
.then(compressDone)
.catch(handleError);
```

__stream style__

```js
const compressing = require('compressing');

new compressing.gzip.FileStream({ source: 'file/path/to/compress' })
  .on('error', handleError)
  .pipe(fs.createWriteStream('path/to/destination.gz'))
  .on('error', handleError);

// It's a transform stream, so you can pipe to it
fs.createReadStream('file/path/to/compress')
  .on('error', handleError)
  .pipe(new compressing.gzip.FileStream())
  .on('error', handleError)
  .pipe(fs.createWriteStream('path/to/destination.gz'))
  .on('error', handleError);

// You should take care of stream errors in caution, use pump to handle error in one place
const pump = require('pump';)
const sourceStream = fs.createReadStream('file/path/to/compress')
const gzipStream = new compressing.gzip.FileStream();
const destStream = fs.createWriteStream('path/to/destination.gz');
pump(sourceStream, gzipStream, destStream, handleError);
```

### Compress a dir

Use tar as an example, tgz and zip is same as gzip.

__Gzip only support compressing a single file. if you want to compress a dir with gzip, then you may need tgz instead.__

__promise style__

```js
const compressing = require('compressing');
compressing.tar.compressDir('dir/path/to/compress', 'path/to/destination.tar')
.then(compressDone)
.catch(handleError);
```

__stream style__

```js
const compressing = require('compressing');

const tarStream = new compressing.tar.Stream();
tarStream.addEntry('dir/path/to/compress');

tarStream
  .on('error', handleError)
  .pipe(fs.createWriteStream('path/to/destination.tar'))
  .on('error', handleError);

// You should take care of stream errors in caution, use pump to handle error in one place
const tarStream = new compressing.tar.Stream();
tarStream.addEntry('dir/path/to/compress');
const destStream = fs.createWriteStream('path/to/destination.tar');
pump(tarStream, destStream, handleError);
```

Stream is very powerful, you can compress multiple entries in it;

```js
const tarStream = new compressing.tar.Stream();
// dir
tarStream.addEntry('dir/path/to/compress');

// file
tarStream.addEntry('file/path/to/compress');

// buffer
tarStream.addEntry(buffer);

// stream
tarStream.addEntry(stream);

const destStream = fs.createWriteStream('path/to/destination.tar');
pipe(tarStream, destStream, handleError);
```

### Uncompress a file

__promise style__

```js
const compressing = require('compressing');

// uncompress a file
compressing.tgz.uncompress('file/path/to/uncompress.tgz', 'path/to/destination/dir')
.then(uncompressDone)
.catch(handleError);

// uncompress a file buffer
compressing.tgz.uncompress(buffer, 'path/to/destination/dir')
.then(uncompressDone)
.catch(handleError);

// uncompress a stream
compressing.tgz.uncompress(stream, 'path/to/destination/dir')
.then(uncompressDone)
.catch(handleError);
```

__Note: tar, tgz and zip have the same uncompressing API as above: destination should be a path of a directory, while that of gzip is slightly different: destination must be a file or filestream.__

And working with urllib is super easy. Let's download a tgz file and uncompress to a directory:

```js
const urllib = require('urllib');
const targetDir = require('os').tmpdir();
const compressing = require('compressing');

urllib.request('http://registry.npmjs.org/pedding/-/pedding-1.1.0.tgz', {
  streaming: true,
  followRedirect: true,
})
.then(result => compressing.tgz.uncompress(result.res, targetDir))
.then(() => console.log('uncompress done'))
.catch(console.error);
```

__stream style__

```js
const compressing = require('compressing');
const mkdirp = require('mkdirp');

function onEntry(header, stream, next) => {
  stream.on('end', next);

  // header.type => file | directory
  // header.name => path name

  if (header.type === 'file') {
    stream.pipe(fs.createWriteStream(path.join(destDir, header.name)));
  } else { // directory
    mkdirp(path.join(destDir, header.name), err => {
      if (err) return handleError(err);
      stream.resume();
    });
  }
}

new compressing.tgz.UncompressStream({ source: 'file/path/to/uncompress.tgz' })
  .on('error', handleError)
  .on('finish', handleFinish) // uncompressing is done
  .on('entry', onEntry);

// It's a writable stream, so you can pipe to it
fs.createReadStream('file/path/to/uncompress')
  .on('error', handleError)
  .pipe(new compressing.tgz.UncompressStream())
  .on('error', handleError)
  .on('finish', handleFinish) // uncompressing is done
  .on('entry', onEntry);
```

**Note: tar, tgz and zip have the same uncompressing streaming API as above: it's a writable stream, and entries will be emitted while uncompressing one after one another, while that of gzip is slightly different: gzip.UncompressStream is a transform stream, so no `entry` event will be emitted and you can just pipe to another stream**

This constrants is brought by Gzip algorithm itself, it only support compressing one file and uncompress one file.

```js
new compressing.gzip.UncompressStream({ source: 'file/path/to/uncompress.gz' })
  .on('error', handleError)
  .pipe(fs.createWriteStream('path/to/dest/file'))
  .on('error', handleError);
```

## API

### compressFile

Use this API to compress a single file. This is a convenient method, which wraps FileStream API below, but you can handle error in one place.

- gzip.compressFile(source, dest, opts)
- tar.compressFile(source, dest, opts)
- tgz.compressFile(source, dest, opts)
- zip.compressFile(source, dest, opts)

Params

- source {String|Buffer|Stream} - source to be compressed, could be a file path, buffer, or a readable stream
- dest {String|Stream} - compressing destination, could be a file path(eg. `/path/to/xx.tgz`), or a writable stream.
- opts {Object} - usually you don't need it

Returns a promise object.

### compressDir

Use this API to compress a dir. This is a convenient method, which wraps Stream API below, but you can handle error in one place.

__Note: gzip do not have a compressDir method, you may need tgz instead.__

- tar.compressDir(source, dest, opts)
- tgz.compressDir(source, dest, opts)
- zip.compressDir(source, dest, opts)

Params

- source {String|Buffer|Stream} - source to be compressed
- dest {String|Stream} - compressing destination, could be a file path(eg. `/path/to/xx.tgz`), or a writable stream.
- opts {Object} - usually you don't need it

### uncompress

Use this API to uncompress a file. This is a convenient method, which wraps UncompressStream API below, but you can handle error in one place. RECOMMANDED.

- tar.uncompress(source, dest, opts)
- tgz.uncompress(source, dest, opts)
- zip.uncompress(source, dest, opts)
- gzip.uncompress(source, dest, opts)

Params

- source {String|Buffer|Stream} - source to be uncompressed
- dest {String|Stream} - uncompressing destination. When uncompressing tar, tgz and zip, it should be a directory path (eg. `/path/to/xx`). __When uncompressing gzip, it should be a file path or a writable stream.__
- opts {Object} - usually you don't need it
  - opts.zipFileNameEncoding {String} - Only work on zip format, default is 'utf8'.
    Major non-UTF8 encodings by languages:

    - Korean: cp949, euc-kr
    - Japanese: sjis (shift_jis), cp932, euc-jp
    - Chinese: gbk, gb18030, gb2312, cp936, hkscs, big5, cp950

### FileStream

The transform stream to compress a single file.

__Note: If you are not very familiar with streams, just use compressFile() API, error can be handled in one place.__

- new gzip.FileStream(opts)
- new tar.FileStream(opts)
- new tgz.FileStream(opts)
- new zip.FileStream(opts)

Common params:

- opts.source {String|Buffer|Stream} - source to be compressed, could be a file path, buffer, or a readable stream.

Gzip params:

- opts.zlib - {Object} gzip.FileStream uses zlib to compress, pass this param to control the behavior of zlib.

Tar params:

- opts.relativePath {String} - Adds a file from source into the compressed result file as opts.relativePath. Uncompression programs would extract the file from the compressed file as relativePath. If opts.source is a file path, opts.relativePath is optional, otherwise it's required.
- opts.size {Number} - Tar compression requires the size of file in advance. When opts.source is a stream, the size of it cannot be calculated unless load all content of the stream into memory(the default behavior, but loading all data into memory could be a very bad idea). Pass opts.size to avoid loading all data into memory, or a warning will be shown.
- opts.suppressSizeWarning {Boolean} - Pass true to suppress the size warning mentioned.

Tgz params:

tgz.FileStream is a combination of tar.FileStream and gzip.FileStream, so the params are the combination of params of tar and gzip.

Zip params:

- opts.relativePath {String} - Adds a file from source into the compressed result file as opts.relativePath. Uncompression programs would extract the file from the compressed file as relativePath. If opts.source is a file path, opts.relativePath is optional, otherwise it's required.
- opts.yazl {Object} - zip.FileStream compression uses [yazl](https://github.com/thejoshwolfe/yazl), pass this param to control the behavior of yazl.

### Stream

The readable stream to compress anything as you need.

__Note: If you are not very familiar with streams, just use compressFile() and compressDir() API, error can be handled in one place.__

__Gzip only support compressing a single file. So gzip.Stream is not available.__

__Constructor__

- new tar.Stream()
- new tgz.Stream()
- new zip.Stream()

No options in all constructors.

__Instance methods__

- addEntry(entry, opts)

Params

- entry {String|Buffer|Stream} - entry to compress, cound be a file path, a dir path, a buffer, or a stream.
- opts.relativePath {String} - uncompression programs would extract the file from the compressed file as opts.relativePath. If entry is a file path or a dir path, opts.relativePath is optional, otherwise it's required.
- opts.ignoreBase {Boolean} - when entry is a dir path, and opts.ignoreBase is set to true, the compression will contain files relative to the path passed, and not with the path included.

### UncompressStream

The writable stream to uncompress anything as you need.

__Note: If you are not very familiar with streams, just use `uncompress()` API, error can be handled in one place.__

__Gzip only support compressing and uncompressing one single file. So gzip.UncompressStream is a transform stream which is different from others.__

__Constructor__

- new gzip.UncompressStream(opts)
- new tar.UncompressStream(opts)
- new tgz.UncompressStream(opts)
- new zip.UncompressStream(opts)

Common params:

- opts.source {String|Buffer|Stream} - source to be uncompressed, could be a file path, buffer, or a readable stream.

__CAUTION for zip.UncompressStream__

Due to the design of the .zip file format, it's impossible to interpret a .zip file without loading all data into memory.

Although the API is streaming style(try to keep it handy), it still loads all data into memory.

<https://github.com/thejoshwolfe/yauzl#no-streaming-unzip-api>
<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/456108?v=4" width="100px;"/><br/><sub><b>shaoshuai0102</b></sub>](https://github.com/shaoshuai0102)<br/>|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/9692408?v=4" width="100px;"/><br/><sub><b>DiamondYuan</b></sub>](https://github.com/DiamondYuan)<br/>|[<img src="https://avatars.githubusercontent.com/u/13938334?v=4" width="100px;"/><br/><sub><b>bytemain</b></sub>](https://github.com/bytemain)<br/>|[<img src="https://avatars.githubusercontent.com/u/8382136?v=4" width="100px;"/><br/><sub><b>Ryqsky</b></sub>](https://github.com/Ryqsky)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
[<img src="https://avatars.githubusercontent.com/u/47357585?v=4" width="100px;"/><br/><sub><b>songhn233</b></sub>](https://github.com/songhn233)<br/>|[<img src="https://avatars.githubusercontent.com/u/9857273?v=4" width="100px;"/><br/><sub><b>ShadyZOZ</b></sub>](https://github.com/ShadyZOZ)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Mon Jul 11 2022 08:28:25 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
