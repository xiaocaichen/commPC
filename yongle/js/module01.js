//①
!function(t) {
    var e, r = t.Base64, n = "2.1.5";
    "undefined" != typeof module && module.exports && (e = require("buffer").Buffer);
    var o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        , a = function(t) {
            for (var e = {}, r = 0, n = t.length; r < n; r++)
                e[t.charAt(r)] = r;
            return e
        }(o)
        , c = String.fromCharCode
        , u = function(t) {
            if (t.length < 2) {
                var e = t.charCodeAt(0);
                return e < 128 ? t : e < 2048 ? c(192 | e >>> 6) + c(128 | 63 & e) : c(224 | e >>> 12 & 15) + c(128 | e >>> 6 & 63) + c(128 | 63 & e)
            }
            var e = 65536 + 1024 * (t.charCodeAt(0) - 55296) + (t.charCodeAt(1) - 56320);
            return c(240 | e >>> 18 & 7) + c(128 | e >>> 12 & 63) + c(128 | e >>> 6 & 63) + c(128 | 63 & e)
        }
        , i = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g
        , f = function(t) {
            return t.replace(i, u)
        }
        , h = function(t) {
            var e = [0, 2, 1][t.length % 3]
                , r = t.charCodeAt(0) << 16 | (t.length > 1 ? t.charCodeAt(1) : 0) << 8 | (t.length > 2 ? t.charCodeAt(2) : 0)
                , n = [o.charAt(r >>> 18), o.charAt(r >>> 12 & 63), e >= 2 ? "=" : o.charAt(r >>> 6 & 63), e >= 1 ? "=" : o.charAt(63 & r)];
            return n.join("")
        }
        , d = t.btoa ? function(e) {
            return t.btoa(e)
        }
            : function(t) {
            return t.replace(/[\s\S]{1,3}/g, h)
        }
        , g = e ? function(t) {
            return new e(t).toString("base64")
        }
            : function(t) {
            return d(f(t))
        }
        , l = function(t, e) {
            return e ? g(t).replace(/[+\/]/g, function(t) {
                return "+" == t ? "-" : "_"
            }).replace(/=/g, "") : g(t)
        }
        , s = function(t) {
            return l(t, !0)
        }
        , A = new RegExp(["[À-ß][-¿]", "[à-ï][-¿]{2}", "[ð-÷][-¿]{3}"].join("|"),"g")
        , p = function(t) {
            switch (t.length) {
                case 4:
                    var e = (7 & t.charCodeAt(0)) << 18 | (63 & t.charCodeAt(1)) << 12 | (63 & t.charCodeAt(2)) << 6 | 63 & t.charCodeAt(3)
                        , r = e - 65536;
                    return c((r >>> 10) + 55296) + c((1023 & r) + 56320);
                case 3:
                    return c((15 & t.charCodeAt(0)) << 12 | (63 & t.charCodeAt(1)) << 6 | 63 & t.charCodeAt(2));
                default:
                    return c((31 & t.charCodeAt(0)) << 6 | 63 & t.charCodeAt(1))
            }
        }
        , b = function(t) {
            return t.replace(A, p)
        }
        , C = function(t) {
            var e = t.length
                , r = e % 4
                , n = (e > 0 ? a[t.charAt(0)] << 18 : 0) | (e > 1 ? a[t.charAt(1)] << 12 : 0) | (e > 2 ? a[t.charAt(2)] << 6 : 0) | (e > 3 ? a[t.charAt(3)] : 0)
                , o = [c(n >>> 16), c(n >>> 8 & 255), c(255 & n)];
            return o.length -= [0, 0, 2, 1][r],
                o.join("")
        }
        , B = t.atob ? function(e) {
            return t.atob(e)
        }
            : function(t) {
            return t.replace(/[\s\S]{1,4}/g, C)
        }
        , v = e ? function(t) {
            return new e(t,"base64").toString()
        }
            : function(t) {
            return b(B(t))
        }
        , S = function(t) {
            return v(t.replace(/[-_]/g, function(t) {
                return "-" == t ? "+" : "/"
            }).replace(/[^A-Za-z0-9\+\/]/g, ""))
        }
        , y = function() {
            var e = t.Base64;
            return t.Base64 = r,
                e
        };
    if (t.Base64 = {
            VERSION: n,
            atob: B,
            btoa: d,
            fromBase64: S,
            toBase64: l,
            utob: f,
            encode: l,
            encodeURI: s,
            btou: b,
            decode: S,
            noConflict: y
        },
        "function" == typeof Object.defineProperty) {
        var j = function(t) {
            return {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        };
        t.Base64.extendString = function() {
            Object.defineProperty(String.prototype, "fromBase64", j(function() {
                return S(this)
            })),
                Object.defineProperty(String.prototype, "toBase64", j(function(t) {
                    return l(this, t)
                })),
                Object.defineProperty(String.prototype, "toBase64URI", j(function() {
                    return l(this, !0)
                }))
        }
    };
}(this), this.Meteor && (Base64 = global.Base64);