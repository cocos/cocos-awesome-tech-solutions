'use strict';

const utils = require('../utils');
const TgzStream = require('./stream');
const TgzFileStream = require('./file_stream');
const TgzUncompressStream = require('./uncompress_stream');

exports.Stream = TgzStream;
exports.FileStream = TgzFileStream;
exports.UncompressStream = TgzUncompressStream;
exports.compressDir = utils.makeCompressDirFn(TgzStream);
exports.compressFile = utils.makeFileProcessFn(TgzFileStream);
exports.uncompress = utils.makeUncompressFn(TgzUncompressStream);
