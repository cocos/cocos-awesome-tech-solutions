import Template from "../../templates/template";

const Encoding: {
  [encoding_name: string]: {
    encode: (s) => string;
    decode: (s) => string;
    template: ReturnType<typeof Template>;
  };
} = {
  ascii85: {
    encode(a) {
      var b, c, d, e, f, g, h, i, j, k;
      // @ts-ignore
      for (
        // @ts-ignore
        !/[^\x00-\xFF]/.test(a),
          b = "\x00\x00\x00\x00".slice(a.length % 4 || 4),
          a += b,
          c = [],
          d = 0,
          e = a.length;
        e > d;
        d += 4
      )
        (f =
          (a.charCodeAt(d) << 24) +
          (a.charCodeAt(d + 1) << 16) +
          (a.charCodeAt(d + 2) << 8) +
          a.charCodeAt(d + 3)),
          0 !== f
            ? ((k = f % 85),
              (f = (f - k) / 85),
              (j = f % 85),
              (f = (f - j) / 85),
              (i = f % 85),
              (f = (f - i) / 85),
              (h = f % 85),
              (f = (f - h) / 85),
              (g = f % 85),
              c.push(g + 33, h + 33, i + 33, j + 33, k + 33))
            : c.push(122);
      return (
        (function (a, b) {
          for (var c = b; c > 0; c--) a.pop();
        })(c, b.length),
        "<~" + String.fromCharCode.apply(String, c) + "~>"
      );
    },
    decode(a) {
      var c,
        d,
        e,
        f,
        g,
        h = String,
        l = "length",
        w = 255,
        x = "charCodeAt",
        y = "slice",
        z = "replace";
      for (
        "<~" === a[y](0, 2) && "~>" === a[y](-2),
          a = a[y](2, -2)[z](/s/g, "")[z]("z", "!!!!!"),
          c = "uuuuu"[y](a[l] % 5 || 5),
          a += c,
          e = [],
          f = 0,
          g = a[l];
        g > f;
        f += 5
      )
        (d =
          52200625 * (a[x](f) - 33) +
          614125 * (a[x](f + 1) - 33) +
          7225 * (a[x](f + 2) - 33) +
          85 * (a[x](f + 3) - 33) +
          (a[x](f + 4) - 33)),
          e.push(w & (d >> 24), w & (d >> 16), w & (d >> 8), w & d);
      return (
        (function (a, b) {
          for (var c = b; c > 0; c--) a.pop();
        })(e, c[l]),
        h.fromCharCode.apply(h, e)
      );
    },
    template: Template(`
    function {name}(a, LL = ["fromCharCode", "apply"]) {
      var c, d, e, f, g, h = String, l = "length", w = 255, x = "charCodeAt", y = "slice", z = "replace";
      for ("<~" === a[y](0, 2) && "~>" === a[y](-2), a = a[y](2, -2)[z](/\s/g, "")[z]("z", "!!!!!"), 
      c = "uuuuu"[y](a[l] % 5 || 5), a += c, e = [], f = 0, g = a[l]; g > f; f += 5) d = 52200625 * (a[x](f) - 33) + 614125 * (a[x](f + 1) - 33) + 7225 * (a[x](f + 2) - 33) + 85 * (a[x](f + 3) - 33) + (a[x](f + 4) - 33), 
      e.push(w & d >> 24, w & d >> 16, w & d >> 8, w & d);
      return function(a, b) {
        for (var c = b; c > 0; c--) a.pop();
      }(e, c[l]), h[LL[0]][LL[1]](h, e);
    }
    `),
  },

  base32: {
    encode: function (s) {
      var a = "!\"#$%&'()*+,-./0123456789:;<=>?@";
      var len = s.length;
      var o = "";
      var w,
        c,
        r = 0,
        sh = 0,
        i;
      for (i = 0; i < len; i += 5) {
        // mask top 5 bits
        c = s.charCodeAt(i);
        w = 0xf8 & c;
        o += a.charAt(w >> 3);
        r = 0x07 & c;
        sh = 2;

        if (i + 1 < len) {
          c = s.charCodeAt(i + 1);
          // mask top 2 bits
          w = 0xc0 & c;
          o += a.charAt((r << 2) + (w >> 6));
          o += a.charAt((0x3e & c) >> 1);
          r = c & 0x01;
          sh = 4;
        }

        if (i + 2 < len) {
          c = s.charCodeAt(i + 2);
          // mask top 4 bits
          w = 0xf0 & c;
          o += a.charAt((r << 4) + (w >> 4));
          r = 0x0f & c;
          sh = 1;
        }

        if (i + 3 < len) {
          c = s.charCodeAt(i + 3);
          // mask top 1 bit
          w = 0x80 & c;
          o += a.charAt((r << 1) + (w >> 7));
          o += a.charAt((0x7c & c) >> 2);
          r = 0x03 & c;
          sh = 3;
        }

        if (i + 4 < len) {
          c = s.charCodeAt(i + 4);
          // mask top 3 bits
          w = 0xe0 & c;
          o += a.charAt((r << 3) + (w >> 5));
          o += a.charAt(0x1f & c);
          r = 0;
          sh = 0;
        }
      }
      // Calculate length of pad by getting the
      // number of words to reach an 8th octet.
      if (r != 0) {
        o += a.charAt(r << sh);
      }
      return o;
    },
    decode: function (s) {
      var v,
        x,
        bits = 0,
        o = "",
        len = s.length,
        d = String,
        e = "charCodeAt",
        f = "fromCharCode",
        i;

      for (i = 0; i < len; i += 1) {
        (v = s[e](i) - 33),
          v >= 0 && v < 32
            ? ((bits += ((x = (x << 5) | v), 5)),
              bits >= 8
                ? (bits -= ((o += d[f]((x >> (bits - 8)) & 0xff)), 8))
                : 0)
            : 0;
      }
      return o;
    },
    template: Template(`
    function {name}(s) {
      var v,
        x,
        b = 0,
        o = "",
        len = s.length,
        d = String,
        e = "charCodeAt",
        f = "fromCharCode", i;
  
      for (i = 0; i < len; i += 1) {
        (v = s[e](i) - 33),
          v >= 0 && v < 32
            ? ((b += ((x = (x << 5) | v), 5)),
              b >= 8
                ? (b -= ((o += d[f]((x >> (b - 8)) & 0xff)), 8))
                : 0)
            : 0;
      }
      return o;
    }
    `),
  },

  hexTable: {
    encode: function (str) {
      var output = "";

      for (var j = 0; j < str.length; j += 3) {
        var chunk = str.substring(j, j + 3);
        if (!chunk) {
          continue;
        }

        chunk = chunk + "~";

        var uniqueChars = new Set([]);
        for (var char of chunk) {
          uniqueChars.add(char);
        }

        var keys = Array.from(uniqueChars).sort();
        var table = {},
          i = 0;
        for (var key of keys) {
          table[key] = i++;
        }

        var idx = [];
        for (var char of chunk) {
          idx.push(table[char]);
        }

        var table64 = "0x";
        for (var i = keys.length - 1; i >= 0; i--) {
          table64 += keys[i].charCodeAt(0).toString(16).toUpperCase();
        }

        var idxInt = 0;
        for (var i = idx.length - 1; i >= 0; i--) {
          idxInt = (idxInt << 3) | idx[i];
        }

        var idx64 = "0x" + idxInt.toString(16).toUpperCase();

        // console.log(chunk, table, idx, table64, idx64);

        output += table64 + "," + idx64 + ",";
      }

      if (output.endsWith(",")) {
        output = output.substring(0, output.length - 1);
      }

      return "{" + output + "}";
    },

    decode: function (str) {
      var output = "";

      str = str.substring(1, str.length - 1);
      var chunks = str.split(",");

      for (var i = 0; i < chunks.length; i += 2) {
        var arr = [chunks[i], chunks[i + 1]];

        var [table, idx] = arr.map(Number);

        // console.log(table, idx);
        while (idx) {
          output += String.fromCharCode((table >> (8 * (idx & 7))) & 0xff);
          idx >>= 3;
        }
      }

      return output.replace(/~/g, "");
    },

    template: Template(`
      function {name}(str){
        var output = "";
    
        str = str.substring(1, str.length - 1);
        var chunks = str.split(",");
      
        for (var i = 0; i < chunks.length; i += 2) {
          var arr = [chunks[i], chunks[i + 1]];
      
          var [table, idx] = arr.map(Number);
      
          // console.log(table, idx);
          while (idx) {
            output += String.fromCharCode((table >> (8 * (idx & 7))) & 0xff);
            idx >>= 3;
          }
        }
      
        return output.replace(/~/g, "");
      }
    
    `),
  },
};

export default Encoding;
