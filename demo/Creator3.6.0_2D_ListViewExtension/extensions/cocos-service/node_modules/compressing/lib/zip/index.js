'use strict';

const utils = require('../utils');
const ZipStream = require('./stream');
const ZipFileStream = require('./file_stream');
const ZipUncompressStream = require('./uncompress_stream');

exports.Stream = ZipStream;
exports.FileStream = ZipFileStream;
exports.UncompressStream = ZipUncompressStream;
exports.compressDir = utils.makeCompressDirFn(ZipStream);
exports.compressFile = utils.makeFileProcessFn(ZipFileStream);
exports.uncompress = utils.makeUncompressFn(ZipUncompressStream);
