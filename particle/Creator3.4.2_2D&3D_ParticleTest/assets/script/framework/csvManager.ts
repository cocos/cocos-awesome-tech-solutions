import { _decorator } from "cc";

const { ccclass, property } = _decorator;

var CELL_DELIMITERS = [",", ";", "\t", "|", "^"];
var LINE_DELIMITERS = ["\r\n", "\r", "\n"];

var getter = function (index: any) {
    return ("d[" + index + "]");
};

var getterCast = function(value: any, index: any, cast: any, d: any) {

    if (cast instanceof Array) {
        if (cast[index] === "number") {
            return Number(d[index]);
        } else if (cast[index] === "boolean") {
            return d[index] === "true" ||  d[index] === "t" || d[index] === "1";
        } else {
            return d[index];
        }
    } else {
        if (!isNaN(Number(value))) {
            return Number(d[index]);
        } else if (value == "false" || value == "true" || value == "t" || value == "f") {
            return d[index] === "true" ||  d[index] === "t" || d[index] === "1";
        } else {
            return d[index];
        }
    }
};

var CSV = {
    //

    /* =========================================
        * Constants ===============================
        * ========================================= */

    STANDARD_DECODE_OPTS: {
        skip: 0,
        limit: false,
        header: false,
        cast: false,
        comment: ""
    },

    STANDARD_ENCODE_OPTS: {
        delimiter: CELL_DELIMITERS[0],
        newline: LINE_DELIMITERS[0],
        skip: 0,
        limit: false,
        header: false
    },

    quoteMark: '"',
    doubleQuoteMark: '""',
    quoteRegex: /"/g,

    /* =========================================
        * Utility Functions =======================
        * ========================================= */
    assign: function () {
        var args = Array.prototype.slice.call(arguments);
        var base = args[0];
        var rest = args.slice(1);
        for (var i = 0, len = rest.length; i < len; i++) {
            for (var attr in rest[i]) {
                base[attr] = rest[i][attr];
            }
        }

        return base;
    },

    map: function (collection: any, fn: Function) {
        var results = [];
        for (var i = 0, len = collection.length; i < len; i++) {
            results[i] = fn(collection[i], i);
        }

        return results;
    },

    getType: function (obj: any) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    },

    getLimit: function (limit: any, len: any) {
        return limit === false ? len : limit;
    },

    buildObjectConstructor: function(fields: any, sample: any, cast: any) {
        return function(d: any) {
            var object: any = new Object();
            var setter = function(attr: any, value: any) {
                return object[attr] = value;
            };
            if (cast) {
                fields.forEach(function(attr: any, idx: number) {
                    setter(attr, getterCast(sample[idx], idx, cast, d));
                });
            } else {
                fields.forEach(function(attr: any, idx: number) {
                    setter(attr, getterCast(sample[idx], idx, null, d));
                });
            }
            // body.push("return object;");
            // body.join(";\n");
            return object;
        };
    },

    buildArrayConstructor: function(fields: any, sample: any, cast: any) {
        return function(d: any) {
            var row = new Array(sample.length);
            var setter = function(idx: any, value: any) {
                return row[idx] = value;
            };
            if (cast) {
                fields.forEach(function(attr: any, idx: number) {
                    setter(attr, getterCast(sample[idx], idx, cast, d));
                });
            } else {
                fields.forEach(function(attr: any, idx: number) {
                    setter(attr, getterCast(sample[idx], idx, null, d));
                });
            }
            return row;
        };
    },

    frequency: function (coll: any, needle: any, limit: any) {
        if (limit === void 0) limit = false;

        var count = 0;
        var lastIndex = 0;
        var maxIndex = this.getLimit(limit, coll.length);

        while (lastIndex < maxIndex) {
            lastIndex = coll.indexOf(needle, lastIndex);
            if (lastIndex === -1) break;
            lastIndex += 1;
            count++;
        }

        return count;
    },

    mostFrequent: function (coll: any, needles: any, limit: any) {
        var max = 0;
        var detected;

        for (var cur = needles.length - 1; cur >= 0; cur--) {
            if (this.frequency(coll, needles[cur], limit) > max) {
                detected = needles[cur];
            }
        }

        return detected || needles[0];
    },

    unsafeParse: function (text: any, opts: any, fn: any) {
        var lines = text.split(opts.newline);

        if (opts.skip > 0) {
            lines.splice(opts.skip);
        }

        var fields;
        var constructor;

        function cells(lines: any) {
            var line = lines.shift();
            if (line.indexOf('"') >= 0) {// 含引号

                // 找到这行完整的数据, 找到对称的双引号
                var lastIndex = 0;
                var findIndex = 0;
                var count = 0;
                while (lines.length > 0) {
                    lastIndex = line.indexOf('"', findIndex);
                    if (lastIndex === -1 && count % 2 === 0) break;

                    if (lastIndex !== -1) {
                        findIndex = lastIndex + 1;
                        count++;
                    } else {
                        line = line + opts.newline + lines.shift();
                    }
                }

                var list = [];
                var item;

                var quoteCount = 0;

                var start = 0;
                var end = 0;
                var length = line.length;
                for (var key in line) {
                    if (!line.hasOwnProperty(key)) {
                        continue;
                    }

                    let numKey = parseInt(key);
                    var value = line[key];

                    if (numKey === 0 && value === '"') {
                        quoteCount++;
                        start = 1;
                    }

                    if (value === '"') {
                        quoteCount++;

                        if (line[numKey - 1] === opts.delimiter && start === numKey) {
                            start++;
                        }
                    }

                    if (value === '"' && quoteCount % 2 === 0) {

                        if (line[numKey + 1] === opts.delimiter || numKey + 1 === length) {
                            end = numKey;
                            item = line.substring(start, end);
                            list.push(item);
                            start = end + 2;
                            end = start;
                        }

                    }

                    if (value === opts.delimiter && quoteCount % 2 === 0) {
                        end = numKey;
                        if (end > start) {
                            item = line.substring(start, end);
                            list.push(item);
                            start = end + 1;
                            end = start;
                        } else if (end === start) {
                            list.push("");
                            start = end + 1;
                            end = start;
                        }
                    }

                }

                end = length;

                if (end >= start) {
                    item = line.substring(start, end);
                    list.push(item);
                }

                return list;
            } else {
                return line.split(opts.delimiter);
            }
        }

        if (opts.header) {
            if (opts.header === true) {
                opts.comment = cells(lines); // 第一行是注释
                opts.cast = cells(lines); // 第二行是数据类型
                fields = cells(lines);
            } else if (this.getType(opts.header) === "Array") {
                fields = opts.header;
            }

            constructor = this.buildObjectConstructor(fields, lines[0].split(opts.delimiter), opts.cast);
        } else {
            constructor = this.buildArrayConstructor(fields, lines[0].split(opts.delimiter), opts.cast);
        }

        while (lines.length > 0) {
            var row = cells(lines);
            if (row.length > 1) {
                fn(constructor(row), fields[0]);
            }
        }

        return true;
    },

    safeParse: function (text: any, opts: any, fn: Function) {
        var delimiter = opts.delimiter;
        var newline = opts.newline;

        var lines = text.split(newline);
        if (opts.skip > 0) {
            lines.splice(opts.skip);
        }

        return true;
    },

    encodeCells: function (line: any, delimiter: any, newline: any) {
        var row = line.slice(0);
        for (var i = 0, len = row.length; i < len; i++) {
            if (row[i].indexOf(this.quoteMark) !== -1) {
                row[i] = row[i].replace(this.quoteRegex, this.doubleQuoteMark);
            }

            if (row[i].indexOf(delimiter) !== -1 || row[i].indexOf(newline) !== -1) {
                row[i] = this.quoteMark + row[i] + this.quoteMark;
            }
        }

        return row.join(delimiter);
    },

    encodeArrays: function(coll: any, opts: any, fn: Function) {
        var delimiter = opts.delimiter;
        var newline = opts.newline;

        if (opts.header && this.getType(opts.header) === "Array") {
            fn(this.encodeCells(opts.header, delimiter, newline));
        }

        for (var cur = 0, lim = this.getLimit(opts.limit, coll.length); cur < lim; cur++) {
            fn(this.encodeCells(coll[cur], delimiter, newline));
        }

        return true;
    },

    encodeObjects: function (coll: any, opts: any, fn:Function) {
        var delimiter = opts.delimiter;
        var newline = opts.newline;
        var header;
        var row;

        header = [];
        row = [];
        for (var key in coll[0]) {
            header.push(key);
            row.push(coll[0][key]);
        }

        if (opts.header === true) {
            fn(this.encodeCells(header, delimiter, newline));
        } else if (this.getType(opts.header) === "Array") {
            fn(this.encodeCells(opts.header, delimiter, newline));
        }

        //@ts-ignore
        fn(this.encodeCells(row, delimiter));

        for (var cur = 1, lim = this.getLimit(opts.limit, coll.length); cur < lim; cur++) {
            row = [];
            for (var key$1 = 0, len = header.length; key$1 < len; key$1++) {
                row.push(coll[cur][header[key$1]]);
            }

            fn(this.encodeCells(row, delimiter, newline));
        }

        return true;
    },

    parse: function (text: any, opts: any, fn: Function) {
        var rows: any;

        if (this.getType(opts) === "Function") {
            fn = opts;
            opts = {};
        } else if (this.getType(fn) !== "Function") {
            rows = [];
            fn = rows.push.bind(rows);
        } else {
            rows = [];
        }

        //@ts-ignore
        opts = this.assign({}, this.STANDARD_DECODE_OPTS, opts);
        //@ts-ignore
        this.opts = opts;

        if (!opts.delimiter || !opts.newline) {
            var limit = Math.min(48, Math.floor(text.length / 20), text.length);
            opts.delimiter = opts.delimiter || this.mostFrequent(text, CELL_DELIMITERS, limit);
            opts.newline = opts.newline || this.mostFrequent(text, LINE_DELIMITERS, limit);
        }

        // modify by jl 由表自行控制不要含有双引号.提高解析效率
        return this.unsafeParse(text, opts, fn) &&
            (rows.length > 0 ? rows : true);
    },

    encode: function (coll: any, opts: any, fn: Function) {
        var lines: any;

        if (this.getType(opts) === "Function") {
            fn = opts;
            opts = {};
        } else if (this.getType(fn) !== "Function") {
            lines = [];
            fn = lines.push.bind(lines);
        }

        //@ts-ignore
        opts = this.assign({}, this.STANDARD_ENCODE_OPTS, opts);

        if (opts.skip > 0) {
            coll = coll.slice(opts.skip);
        }

        return (this.getType(coll[0]) === "Array" ? this.encodeArrays : this.encodeObjects)(coll, opts, fn) &&
            (lines.length > 0 ? lines.join(opts.newline) : true);
    }
};

@ccclass("CSVManager")
export class CSVManager {
    /* class member could be defined like this */

    static _instance: CSVManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new CSVManager();
        return this._instance;
    }
    private _csvTables:any = {};
    private _csvTableForArr:any = {};
    private _tableCast:any = {};
    private _tableComment:any = {};

    addTable (tableName:string, tableContent:string, force?:boolean) {
        if (this._csvTables[tableName] && !force) {
            return;
        }

        let tableData: any = {};
        let tableArr: any[] = [];
        let opts = { header: true };
        CSV.parse(tableContent, opts, function (row: any, keyName: string) {
            tableData[row[keyName]] = row;
            tableArr.push(row);
        });

        this._tableCast[tableName] = (CSV as any).opts.cast;
        this._tableComment[tableName] = (CSV as any).opts.comment;

        this._csvTables[tableName] = tableData;
        this._csvTableForArr[tableName] = tableArr;

        //this.csvTables[tableName].initFromText(tableContent);
    }

        /**
     * 根据表名获取表的所有内容
     * @param {string} tableName  表名
     * @returns {object} 表内容
     */
    getTableArr (tableName:string) {
        return this._csvTableForArr[tableName];
    }

    /**
     * 根据表名获取表的所有内容
     * @param {string} tableName  表名
     * @returns {object} 表内容
     */
    getTable (tableName:string) {
        return this._csvTables[tableName];
    }

    /**
     * 查询一条表内容
     * @param {string} tableName 表名
     * @param {string} key 列名
     * @param {any} value 值
     * @returns {Object} 一条表内容
     */
    queryOne (tableName:string, key:string, value:any) {
        var table = this.getTable(tableName);
        if (!table) {
            return null;
        }

        if (key) {
            for (var tbItem in table) {
                if (!table.hasOwnProperty(tbItem)) {
                    continue;
                }

                if (table[tbItem][key] === value) {
                    return table[tbItem];
                }
            }
        } else {
            return table[value];
        }
    }

    /**
     * 根据ID查询一条表内容
     * @param {string}tableName 表名
     * @param {string}ID
     * @returns {Object} 一条表内容
     */
    queryByID (tableName:string, ID:string) {
        //@ts-ignore
        return this.queryOne(tableName, null, ID);
    }

    /**
     * 查询key和value对应的所有行内容
     * @param {string} tableName 表名
     * @param {string} key 列名
     * @param {any} value 值
     * @returns {Object}
     */
    queryAll (tableName:string, key:string, value:any) {
        var table = this.getTable(tableName);
        if (!table || !key) {
            return null;
        }

        var ret: any = {};
        for (var tbItem in table) {
            if (!table.hasOwnProperty(tbItem)) {
                continue;
            }

            if (table[tbItem][key] === value) {
                ret[tbItem] = table[tbItem];
            }
        }

        return ret;
    }

    /**
     * 选出指定表里所有 key 的值在 values 数组中的数据，返回 Object，key 为 ID
     * @param {string} tableName 表名
     * @param {string} key  列名
     * @param {Array}values 数值
     * @returns 
     */
    queryIn (tableName:string, key:string, values:Array<any>) {
        var table = this.getTable(tableName);
        if (!table || !key) {
            return null;
        }

        var ret: any = {};
        var keys = Object.keys(table);
        var length = keys.length;
        for (var i = 0; i < length; i++) {
            var item = table[keys[i]];
            if (values.indexOf(item[key]) > -1) {
                ret[keys[i]] = item;
            }
        }

        return ret;
    }

    /**
     * 选出符合条件的数据。condition key 为表格的key，value 为值的数组。返回的object，key 为数据在表格的ID，value为具体数据
     * @param {string} tableName 表名
     * @param {any} condition 筛选条件
     * @returns 
     */
    queryByCondition (tableName:string, condition: any) {
        if (condition.constructor !== Object) {
            return null;
        }

        var table = this.getTable(tableName);
        if (!table) {
            return null;
        }

        var ret: any = {};
        var tableKeys = Object.keys(table);
        var tableKeysLength = tableKeys.length;
        var keys = Object.keys(condition);
        var keysLength = keys.length;
        for (var i = 0; i < tableKeysLength; i++) {
            var item = table[tableKeys[i]];
            var fit = true;
            for (var j = 0; j < keysLength; j++) {
                var key = keys[j];
                fit = fit && (condition[key] === item[key]) && !ret[tableKeys[i]];
            }

            if (fit) {
                ret[tableKeys[i]] = item;
            }
        }

        return ret;
    }

    queryOneByCondition (tableName:string, condition: any) {
        if (condition.constructor !== Object) {
            return null;
        }

        var table = this.getTable(tableName);
        if (!table) {
            return null;
        }
        
        var keys = Object.keys(condition);
        var keysLength = keys.length;

        for (let keyName in table) {
            var item = table[keyName];

            var fit = true;
            for (var j = 0; j < keysLength; j++) {
                var key = keys[j];
                fit = fit && (condition[key] === item[key]);
            }

            if (fit) {
                return item;
            }
        }

        return null;
    }
}
