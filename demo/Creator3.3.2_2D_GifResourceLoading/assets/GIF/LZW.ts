// /**
// * LZW编码解析
// */

import { _decorator } from 'cc';
export default class LZW {
    static decode(arr, min) {
        let clearCode = 1 << min,
            eofCode = clearCode + 1,
            size = min + 1,
            dict = [],
            pos = 0;

        function clear() {
            let i;
            dict = [];
            size = min + 1;
            for (i = 0; i < clearCode; i++) {
                dict[i] = [i];
            }
            dict[clearCode] = [];
            dict[eofCode] = null;
        }

        function decode() {
            let out = [],
                code, last;
            while (1) {
                last = code;
                code = read(size);
                if (code == clearCode) {
                    clear();
                    continue;
                }
                if (code == eofCode) {
                    break;
                }
                if (code < dict.length) {
                    if (last !== clearCode) {
                        dict.push(dict[last].concat(dict[code][0]));
                    }
                } else {
                    if (code !== dict.length) {
                        throw new Error('LZW解析出错');
                    }
                    dict.push(dict[last].concat(dict[last][0]));
                }
                out.push.apply(out, dict[code]);
                if (dict.length === (1 << size) && size < 12) {
                    size++;
                }
            }
            return out;
        }

        function read(size) {
            let i, code = 0;
            for (i = 0; i < size; i++) {
                if (arr[pos >> 3] & 1 << (pos & 7)) {
                    code |= 1 << i;
                }
                pos++;
            }
            return code;
        }
        return decode();
    }
}

