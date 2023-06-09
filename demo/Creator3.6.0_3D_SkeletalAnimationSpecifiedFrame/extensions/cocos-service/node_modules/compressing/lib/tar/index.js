'use strict';

const utils = require('../utils');
const TarStream = require('./stream');
const TarFileStream = require('./file_stream');
const TarUncompressStream = require('./uncompress_stream');

exports.Stream = TarStream;
exports.FileStream = TarFileStream;
exports.UncompressStream = TarUncompressStream;
exports.compressDir = utils.makeCompressDirFn(TarStream);
exports.compressFile = utils.makeFileProcessFn(TarFileStream);
exports.uncompress = utils.makeUncompressFn(TarUncompressStream);
