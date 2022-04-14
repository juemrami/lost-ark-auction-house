!(function (e) {
  var t = {};
  function n(r) {
    if (t[r]) return t[r].exports;
    var a = (t[r] = { i: r, l: !1, exports: {} });
    return e[r].call(a.exports, a, a.exports, n), (a.l = !0), a.exports;
  }
  (n.m = e),
    (n.c = t),
    (n.d = function (e, t, r) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r });
    }),
    (n.r = function (e) {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (n.t = function (e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e;
      if (4 & t && "object" === typeof e && e && e.__esModule) return e;
      var r = Object.create(null);
      if (
        (n.r(r),
        Object.defineProperty(r, "default", { enumerable: !0, value: e }),
        2 & t && "string" != typeof e)
      )
        for (var a in e)
          n.d(
            r,
            a,
            function (t) {
              return e[t];
            }.bind(null, a)
          );
      return r;
    }),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return n.d(t, "a", t), t;
    }),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.p = "https://d3planner-assets.maxroll.gg/lost-ark/build/"),
    n((n.s = 0));
})([
  function (e, t, n) {
    "use strict";
    function r(e, t) {
      (null == t || t > e.length) && (t = e.length);
      for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
      return r;
    }
    function a(e, t) {
      if (e) {
        if ("string" === typeof e) return r(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        return (
          "Object" === n && e.constructor && (n = e.constructor.name),
          "Map" === n || "Set" === n
            ? Array.from(e)
            : "Arguments" === n ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            ? r(e, t)
            : void 0
        );
      }
    }
    function o(e, t) {
      var n;
      if ("undefined" === typeof Symbol || null == e[Symbol.iterator]) {
        if (
          Array.isArray(e) ||
          (n = a(e)) ||
          (t && e && "number" === typeof e.length)
        ) {
          n && (e = n);
          var r = 0,
            o = function () {};
          return {
            s: o,
            n: function () {
              return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
            },
            e: function (e) {
              throw e;
            },
            f: o,
          };
        }
        throw new TypeError(
          "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
        );
      }
      var i,
        c = !0,
        l = !1;
      return {
        s: function () {
          n = e[Symbol.iterator]();
        },
        n: function () {
          var e = n.next();
          return (c = e.done), e;
        },
        e: function (e) {
          (l = !0), (i = e);
        },
        f: function () {
          try {
            c || null == n.return || n.return();
          } finally {
            if (l) throw i;
          }
        },
      };
    }
    function i(e, t, n) {
      return (
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n),
        e
      );
    }
    function c(e, t) {
      return (
        (function (e) {
          if (Array.isArray(e)) return e;
        })(e) ||
        (function (e, t) {
          if ("undefined" !== typeof Symbol && Symbol.iterator in Object(e)) {
            var n = [],
              r = !0,
              a = !1,
              o = void 0;
            try {
              for (
                var i, c = e[Symbol.iterator]();
                !(r = (i = c.next()).done) &&
                (n.push(i.value), !t || n.length !== t);
                r = !0
              );
            } catch (l) {
              (a = !0), (o = l);
            } finally {
              try {
                r || null == c.return || c.return();
              } finally {
                if (a) throw o;
              }
            }
            return n;
          }
        })(e, t) ||
        a(e, t) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        })()
      );
    }
    function l(e, t) {
      var n = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t &&
          (r = r.filter(function (t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable;
          })),
          n.push.apply(n, r);
      }
      return n;
    }
    function u(e) {
      for (var t = 1; t < arguments.length; t++) {
        var n = null != arguments[t] ? arguments[t] : {};
        t % 2
          ? l(Object(n), !0).forEach(function (t) {
              i(e, t, n[t]);
            })
          : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
          : l(Object(n)).forEach(function (t) {
              Object.defineProperty(
                e,
                t,
                Object.getOwnPropertyDescriptor(n, t)
              );
            });
      }
      return e;
    }
    n.r(t);
    var s = {
      1e5: ["estateT1c", "estateT1p"],
      100001: ["estateT1c", "estateT1p"],
      2e5: ["estateT2c", "estateT2p"],
      200001: ["estateT2c", "estateT2p"],
      31e4: ["estateT3ac", "estateT3ap"],
      310001: ["estateT3ac", "estateT3ap"],
      310500: ["estateT3bc", "estateT3bp"],
      310501: ["estateT3bc", "estateT3bp"],
      311e3: ["estateT3cc", "estateT3cp"],
      311001: ["estateT3cc", "estateT3cp"],
    };
    function f(e, t, n, r) {
      var a,
        l,
        f,
        m,
        d = e.items[t.item];
      if (!d) return null;
      var v = e.itemQuality["".concat(d.quality, "#").concat(t.level + 100)];
      if (!v) return null;
      var p = e.enhanceCommon[v.common];
      if (!p) return null;
      var y = e.enhanceBoost[v.boost],
        h = v.common.match(/^(.*)#/),
        b = h && s[h[1]];
      b &&
        (n[b[0]] || n[b[1]]) &&
        ((y = u({}, y)),
        n[b[0]] && (y.chance = (y.chance || 0) + (h[1] < 3e5 ? 2e3 : 1e3)),
        n[b[1]] && (y.expDiscount = (y.expDiscount || 0) + 2e3));
      var g,
        O = [],
        T = o(p.additive);
      try {
        for (T.s(); !(g = T.n()).done; ) {
          var j = g.value;
          O.push({
            id: j.id,
            cost: r[j.id] || 0,
            chance: j.rate,
            limit: j.max,
          });
        }
      } catch (oe) {
        T.e(oe);
      } finally {
        T.f();
      }
      for (; O.length < 3; ) O.push({ cost: 0, chance: 0, limit: 0 });
      var x =
          p.special &&
          ((null === (a = e.enhanceMaterial[p.special]) || void 0 === a
            ? void 0
            : a.find(function (e) {
                return r[e.id];
              })) ||
            (null === (l = e.enhanceMaterial[p.special]) || void 0 === l
              ? void 0
              : l[0])),
        S =
          null === x || void 0 === x
            ? void 0
            : x.effects.find(function (e) {
                return 1 === e.type;
              });
      S
        ? O.push({ id: x.id, cost: r[x.id] || 0, chance: S.value, limit: 1 })
        : O.push({ cost: 0, chance: 0, limit: 0 });
      for (
        var M = 0,
          w = 0,
          P = Object.entries(
            (null === (C = y) || void 0 === C ? void 0 : C.money) || p.money
          );
        w < P.length;
        w++
      ) {
        var C,
          A = c(P[w], 2),
          D = A[0],
          E = A[1];
        M += (r[D] || 0) * E;
      }
      for (
        var _ = 0,
          k = Object.entries(
            (null === (I = y) || void 0 === I ? void 0 : I.mats) || v.mats
          );
        _ < k.length;
        _++
      ) {
        var I,
          B = c(k[_], 2),
          q = B[0],
          Q = B[1];
        M += (r[q] || 0) * Q;
      }
      for (var z = [], L = 0; L <= O[0].limit; ++L)
        for (var U = 0; U <= O[1].limit; ++U)
          for (var $ = 0; $ <= O[2].limit; ++$)
            for (var F = 0; F <= O[3].limit; ++F) {
              var G =
                  Math.min(
                    p.additiveMax,
                    L * O[0].chance + U * O[1].chance + $ * O[2].chance
                  ) +
                  F * O[3].chance,
                H =
                  L * O[0].cost + U * O[1].cost + $ * O[2].cost + F * O[3].cost;
              (!z[G] || H < z[G].cost) &&
                (z[G] = { cost: H, mat0: L, mat1: U, mat2: $, mat3: F });
            }
      var J = z
        .map(function (e, t) {
          return e ? u(u({}, e), {}, { chance: t }) : null;
        })
        .filter(Boolean);
      0 === n.honing ? (J = [J[0]]) : 2 === n.honing && (J = [J[J.length - 1]]);
      var K = { cost: M, mat0: 0, mat1: 0, mat2: 0, mat3: 0, nextChance: 0 },
        N = p.failMax ? Math.ceil(p.failMax / p.failBonus) : 0,
        R = [];
      function V(e, t) {
        if (t >= p.threshold) return K;
        e > N && (e = N);
        var n = e * p.threshold + t;
        return (
          R[n] ||
            (R[n] = (function (e, t) {
              var n,
                r = null,
                a = o(J);
              try {
                for (a.s(); !(n = a.n()).done; ) {
                  var i,
                    c = n.value,
                    l =
                      p.success +
                      ((null === (i = y) || void 0 === i ? void 0 : i.chance) ||
                        0) +
                      Math.min(p.failBonus * e, p.failMax) +
                      c.chance,
                    u = M + c.cost,
                    s = null,
                    f = 0;
                  l < 1e4 &&
                    ((s = V(e + 1, t + l)),
                    (f = (1e4 - l) / 1e4),
                    (u += s.cost * f)),
                    (!r || u < r.cost) &&
                      (r || (r = {}),
                      (r.cost = u),
                      (r.next = s),
                      (r.nextChance = f),
                      (r.mat0 = c.mat0),
                      (r.mat1 = c.mat1),
                      (r.mat2 = c.mat2),
                      (r.mat3 = c.mat3));
                }
              } catch (oe) {
                a.e(oe);
              } finally {
                a.f();
              }
              return r;
            })(e, t)),
          R[n]
        );
      }
      for (
        var W = V(t.fails, Math.floor(215 * t.blessing)),
          X = { mats: {}, money: {}, steps: [] },
          Y = 1,
          Z = W,
          ee = function () {
            for (
              var e = { chance: 1 - Z.nextChance, mats: {}, money: {} },
                t = 0,
                r = Object.entries(
                  (null === (a = y) || void 0 === a ? void 0 : a.money) ||
                    p.money
                );
              t < r.length;
              t++
            ) {
              var a,
                o = c(r[t], 2),
                i = o[0],
                l = o[1];
              i &&
                l &&
                ((e.money[i] = l), (X.money[i] = (X.money[i] || 0) + l * Y));
            }
            function u(t, n) {
              t &&
                n &&
                ((e.mats[t] = n), (X.mats[t] = (X.mats[t] || 0) + n * Y));
            }
            for (
              var s = 0,
                f = Object.entries(
                  (null === (m = y) || void 0 === m ? void 0 : m.mats) || v.mats
                );
              s < f.length;
              s++
            ) {
              var m,
                d = c(f[s], 2);
              u(d[0], d[1]);
            }
            u(O[0].id, Z.mat0),
              u(O[1].id, Z.mat1),
              u(O[2].id, Z.mat2),
              u(O[3].id, Z.mat3),
              X.steps.push(e),
              0 === n.luck
                ? Z.nextChance || (Y = 0)
                : 2 === n.luck
                ? (Y = 0)
                : (Y *= Z.nextChance),
              (Z = Z.next);
          };
        Z;

      )
        ee();
      var te =
          e.itemQuality["".concat(d.quality, "#").concat(t.level + 100 - 1)],
        ne = te && e.enhanceCommon[te.common],
        re = p.exp - ((null === ne || void 0 === ne ? void 0 : ne.exp) || 0),
        ae = Math.ceil(
          (re / p.feedExp) *
            (1 -
              ((null === (f = y) || void 0 === f ? void 0 : f.expDiscount) ||
                0) /
                1e4)
        );
      return (
        (X.feed = {
          mats: {},
          money:
            ((m = {}),
            i(m, p.feedType, ae),
            i(m, p.feedSubType, ae * p.feedSubCost),
            m),
        }),
        (X.money[p.feedType] = (X.money[p.feedType] || 0) + ae),
        (X.money[p.feedSubType] =
          (X.money[p.feedSubType] || 0) + ae * p.feedSubCost),
        X
      );
    }
    var m = self,
      d = null,
      v = [];
    function p(e) {
      var t = f(d, e.task, e.options, e.prices);
      m.postMessage({ action: "result", id: e.id, result: t });
    }
    m.addEventListener("message", function (e) {
      var t = e.data;
      if ("init" === t.action) {
        d = t.payload;
        var n,
          r = o(v);
        try {
          for (r.s(); !(n = r.n()).done; ) {
            p(n.value);
          }
        } catch (a) {
          r.e(a);
        } finally {
          r.f();
        }
        v.splice(0);
      } else "optimize" === t.action && (d ? p(t) : v.push(t));
    });
  },
]);
//# sourceMappingURL=optimizer.worker.worker.js.map
