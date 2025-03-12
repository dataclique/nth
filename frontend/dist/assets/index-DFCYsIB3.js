var f2 = Object.defineProperty
var T0 = t => {
  throw TypeError(t)
}
var d2 = (t, e, n) =>
  e in t
    ? f2(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n })
    : (t[e] = n)
var Ye = (t, e, n) => d2(t, typeof e != "symbol" ? e + "" : e, n),
  jp = (t, e, n) => e.has(t) || T0("Cannot " + n)
var x = (t, e, n) => (
    jp(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  ne = (t, e, n) =>
    e.has(t)
      ? T0("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  G = (t, e, n, s) => (
    jp(t, e, "write to private field"), s ? s.call(t, n) : e.set(t, n), n
  ),
  Q = (t, e, n) => (jp(t, e, "access private method"), n)
var Ms = (t, e, n, s) => ({
  set _(o) {
    G(t, e, o, n)
  },
  get _() {
    return x(t, e, s)
  },
})
function h2(t, e) {
  for (var n = 0; n < e.length; n++) {
    const s = e[n]
    if (typeof s != "string" && !Array.isArray(s)) {
      for (const o in s)
        if (o !== "default" && !(o in t)) {
          const l = Object.getOwnPropertyDescriptor(s, o)
          l &&
            Object.defineProperty(
              t,
              o,
              l.get ? l : { enumerable: !0, get: () => s[o] },
            )
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
  )
}
;(function () {
  const e = document.createElement("link").relList
  if (e && e.supports && e.supports("modulepreload")) return
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) s(o)
  new MutationObserver(o => {
    for (const l of o)
      if (l.type === "childList")
        for (const u of l.addedNodes)
          u.tagName === "LINK" && u.rel === "modulepreload" && s(u)
  }).observe(document, { childList: !0, subtree: !0 })
  function n(o) {
    const l = {}
    return (
      o.integrity && (l.integrity = o.integrity),
      o.referrerPolicy && (l.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (l.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (l.credentials = "omit")
          : (l.credentials = "same-origin"),
      l
    )
  }
  function s(o) {
    if (o.ep) return
    o.ep = !0
    const l = n(o)
    fetch(o.href, l)
  }
})()
function yo(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default")
    ? t.default
    : t
}
var Dp = { exports: {} },
  Vl = {},
  Lp = { exports: {} },
  Ie = {}
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var R0
function p2() {
  if (R0) return Ie
  R0 = 1
  var t = Symbol.for("react.element"),
    e = Symbol.for("react.portal"),
    n = Symbol.for("react.fragment"),
    s = Symbol.for("react.strict_mode"),
    o = Symbol.for("react.profiler"),
    l = Symbol.for("react.provider"),
    u = Symbol.for("react.context"),
    f = Symbol.for("react.forward_ref"),
    d = Symbol.for("react.suspense"),
    m = Symbol.for("react.memo"),
    h = Symbol.for("react.lazy"),
    g = Symbol.iterator
  function w(I) {
    return I === null || typeof I != "object"
      ? null
      : ((I = (g && I[g]) || I["@@iterator"]),
        typeof I == "function" ? I : null)
  }
  var b = {
      isMounted: function () {
        return !1
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    E = Object.assign,
    S = {}
  function C(I, $, ue) {
    ;(this.props = I),
      (this.context = $),
      (this.refs = S),
      (this.updater = ue || b)
  }
  ;(C.prototype.isReactComponent = {}),
    (C.prototype.setState = function (I, $) {
      if (typeof I != "object" && typeof I != "function" && I != null)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
        )
      this.updater.enqueueSetState(this, I, $, "setState")
    }),
    (C.prototype.forceUpdate = function (I) {
      this.updater.enqueueForceUpdate(this, I, "forceUpdate")
    })
  function _() {}
  _.prototype = C.prototype
  function A(I, $, ue) {
    ;(this.props = I),
      (this.context = $),
      (this.refs = S),
      (this.updater = ue || b)
  }
  var O = (A.prototype = new _())
  ;(O.constructor = A), E(O, C.prototype), (O.isPureReactComponent = !0)
  var M = Array.isArray,
    D = Object.prototype.hasOwnProperty,
    K = { current: null },
    W = { key: !0, ref: !0, __self: !0, __source: !0 }
  function q(I, $, ue) {
    var oe,
      he = {},
      me = null,
      Se = null
    if ($ != null)
      for (oe in ($.ref !== void 0 && (Se = $.ref),
      $.key !== void 0 && (me = "" + $.key),
      $))
        D.call($, oe) && !W.hasOwnProperty(oe) && (he[oe] = $[oe])
    var ke = arguments.length - 2
    if (ke === 1) he.children = ue
    else if (1 < ke) {
      for (var Ee = Array(ke), Be = 0; Be < ke; Be++) Ee[Be] = arguments[Be + 2]
      he.children = Ee
    }
    if (I && I.defaultProps)
      for (oe in ((ke = I.defaultProps), ke))
        he[oe] === void 0 && (he[oe] = ke[oe])
    return {
      $$typeof: t,
      type: I,
      key: me,
      ref: Se,
      props: he,
      _owner: K.current,
    }
  }
  function Z(I, $) {
    return {
      $$typeof: t,
      type: I.type,
      key: $,
      ref: I.ref,
      props: I.props,
      _owner: I._owner,
    }
  }
  function le(I) {
    return typeof I == "object" && I !== null && I.$$typeof === t
  }
  function Ce(I) {
    var $ = { "=": "=0", ":": "=2" }
    return (
      "$" +
      I.replace(/[=:]/g, function (ue) {
        return $[ue]
      })
    )
  }
  var Ae = /\/+/g
  function Te(I, $) {
    return typeof I == "object" && I !== null && I.key != null
      ? Ce("" + I.key)
      : $.toString(36)
  }
  function Pe(I, $, ue, oe, he) {
    var me = typeof I
    ;(me === "undefined" || me === "boolean") && (I = null)
    var Se = !1
    if (I === null) Se = !0
    else
      switch (me) {
        case "string":
        case "number":
          Se = !0
          break
        case "object":
          switch (I.$$typeof) {
            case t:
            case e:
              Se = !0
          }
      }
    if (Se)
      return (
        (Se = I),
        (he = he(Se)),
        (I = oe === "" ? "." + Te(Se, 0) : oe),
        M(he)
          ? ((ue = ""),
            I != null && (ue = I.replace(Ae, "$&/") + "/"),
            Pe(he, $, ue, "", function (Be) {
              return Be
            }))
          : he != null &&
            (le(he) &&
              (he = Z(
                he,
                ue +
                  (!he.key || (Se && Se.key === he.key)
                    ? ""
                    : ("" + he.key).replace(Ae, "$&/") + "/") +
                  I,
              )),
            $.push(he)),
        1
      )
    if (((Se = 0), (oe = oe === "" ? "." : oe + ":"), M(I)))
      for (var ke = 0; ke < I.length; ke++) {
        me = I[ke]
        var Ee = oe + Te(me, ke)
        Se += Pe(me, $, ue, Ee, he)
      }
    else if (((Ee = w(I)), typeof Ee == "function"))
      for (I = Ee.call(I), ke = 0; !(me = I.next()).done; )
        (me = me.value), (Ee = oe + Te(me, ke++)), (Se += Pe(me, $, ue, Ee, he))
    else if (me === "object")
      throw (
        (($ = String(I)),
        Error(
          "Objects are not valid as a React child (found: " +
            ($ === "[object Object]"
              ? "object with keys {" + Object.keys(I).join(", ") + "}"
              : $) +
            "). If you meant to render a collection of children, use an array instead.",
        ))
      )
    return Se
  }
  function Ue(I, $, ue) {
    if (I == null) return I
    var oe = [],
      he = 0
    return (
      Pe(I, oe, "", "", function (me) {
        return $.call(ue, me, he++)
      }),
      oe
    )
  }
  function te(I) {
    if (I._status === -1) {
      var $ = I._result
      ;($ = $()),
        $.then(
          function (ue) {
            ;(I._status === 0 || I._status === -1) &&
              ((I._status = 1), (I._result = ue))
          },
          function (ue) {
            ;(I._status === 0 || I._status === -1) &&
              ((I._status = 2), (I._result = ue))
          },
        ),
        I._status === -1 && ((I._status = 0), (I._result = $))
    }
    if (I._status === 1) return I._result.default
    throw I._result
  }
  var H = { current: null },
    B = { transition: null },
    U = {
      ReactCurrentDispatcher: H,
      ReactCurrentBatchConfig: B,
      ReactCurrentOwner: K,
    }
  function V() {
    throw Error("act(...) is not supported in production builds of React.")
  }
  return (
    (Ie.Children = {
      map: Ue,
      forEach: function (I, $, ue) {
        Ue(
          I,
          function () {
            $.apply(this, arguments)
          },
          ue,
        )
      },
      count: function (I) {
        var $ = 0
        return (
          Ue(I, function () {
            $++
          }),
          $
        )
      },
      toArray: function (I) {
        return (
          Ue(I, function ($) {
            return $
          }) || []
        )
      },
      only: function (I) {
        if (!le(I))
          throw Error(
            "React.Children.only expected to receive a single React element child.",
          )
        return I
      },
    }),
    (Ie.Component = C),
    (Ie.Fragment = n),
    (Ie.Profiler = o),
    (Ie.PureComponent = A),
    (Ie.StrictMode = s),
    (Ie.Suspense = d),
    (Ie.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = U),
    (Ie.act = V),
    (Ie.cloneElement = function (I, $, ue) {
      if (I == null)
        throw Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            I +
            ".",
        )
      var oe = E({}, I.props),
        he = I.key,
        me = I.ref,
        Se = I._owner
      if ($ != null) {
        if (
          ($.ref !== void 0 && ((me = $.ref), (Se = K.current)),
          $.key !== void 0 && (he = "" + $.key),
          I.type && I.type.defaultProps)
        )
          var ke = I.type.defaultProps
        for (Ee in $)
          D.call($, Ee) &&
            !W.hasOwnProperty(Ee) &&
            (oe[Ee] = $[Ee] === void 0 && ke !== void 0 ? ke[Ee] : $[Ee])
      }
      var Ee = arguments.length - 2
      if (Ee === 1) oe.children = ue
      else if (1 < Ee) {
        ke = Array(Ee)
        for (var Be = 0; Be < Ee; Be++) ke[Be] = arguments[Be + 2]
        oe.children = ke
      }
      return {
        $$typeof: t,
        type: I.type,
        key: he,
        ref: me,
        props: oe,
        _owner: Se,
      }
    }),
    (Ie.createContext = function (I) {
      return (
        (I = {
          $$typeof: u,
          _currentValue: I,
          _currentValue2: I,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }),
        (I.Provider = { $$typeof: l, _context: I }),
        (I.Consumer = I)
      )
    }),
    (Ie.createElement = q),
    (Ie.createFactory = function (I) {
      var $ = q.bind(null, I)
      return ($.type = I), $
    }),
    (Ie.createRef = function () {
      return { current: null }
    }),
    (Ie.forwardRef = function (I) {
      return { $$typeof: f, render: I }
    }),
    (Ie.isValidElement = le),
    (Ie.lazy = function (I) {
      return { $$typeof: h, _payload: { _status: -1, _result: I }, _init: te }
    }),
    (Ie.memo = function (I, $) {
      return { $$typeof: m, type: I, compare: $ === void 0 ? null : $ }
    }),
    (Ie.startTransition = function (I) {
      var $ = B.transition
      B.transition = {}
      try {
        I()
      } finally {
        B.transition = $
      }
    }),
    (Ie.unstable_act = V),
    (Ie.useCallback = function (I, $) {
      return H.current.useCallback(I, $)
    }),
    (Ie.useContext = function (I) {
      return H.current.useContext(I)
    }),
    (Ie.useDebugValue = function () {}),
    (Ie.useDeferredValue = function (I) {
      return H.current.useDeferredValue(I)
    }),
    (Ie.useEffect = function (I, $) {
      return H.current.useEffect(I, $)
    }),
    (Ie.useId = function () {
      return H.current.useId()
    }),
    (Ie.useImperativeHandle = function (I, $, ue) {
      return H.current.useImperativeHandle(I, $, ue)
    }),
    (Ie.useInsertionEffect = function (I, $) {
      return H.current.useInsertionEffect(I, $)
    }),
    (Ie.useLayoutEffect = function (I, $) {
      return H.current.useLayoutEffect(I, $)
    }),
    (Ie.useMemo = function (I, $) {
      return H.current.useMemo(I, $)
    }),
    (Ie.useReducer = function (I, $, ue) {
      return H.current.useReducer(I, $, ue)
    }),
    (Ie.useRef = function (I) {
      return H.current.useRef(I)
    }),
    (Ie.useState = function (I) {
      return H.current.useState(I)
    }),
    (Ie.useSyncExternalStore = function (I, $, ue) {
      return H.current.useSyncExternalStore(I, $, ue)
    }),
    (Ie.useTransition = function () {
      return H.current.useTransition()
    }),
    (Ie.version = "18.3.1"),
    Ie
  )
}
var P0
function Ka() {
  return P0 || ((P0 = 1), (Lp.exports = p2())), Lp.exports
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var I0
function m2() {
  if (I0) return Vl
  I0 = 1
  var t = Ka(),
    e = Symbol.for("react.element"),
    n = Symbol.for("react.fragment"),
    s = Object.prototype.hasOwnProperty,
    o = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    l = { key: !0, ref: !0, __self: !0, __source: !0 }
  function u(f, d, m) {
    var h,
      g = {},
      w = null,
      b = null
    m !== void 0 && (w = "" + m),
      d.key !== void 0 && (w = "" + d.key),
      d.ref !== void 0 && (b = d.ref)
    for (h in d) s.call(d, h) && !l.hasOwnProperty(h) && (g[h] = d[h])
    if (f && f.defaultProps)
      for (h in ((d = f.defaultProps), d)) g[h] === void 0 && (g[h] = d[h])
    return { $$typeof: e, type: f, key: w, ref: b, props: g, _owner: o.current }
  }
  return (Vl.Fragment = n), (Vl.jsx = u), (Vl.jsxs = u), Vl
}
var M0
function g2() {
  return M0 || ((M0 = 1), (Dp.exports = m2())), Dp.exports
}
var T = g2(),
  v = Ka()
const Cr = yo(v),
  y2 = h2({ __proto__: null, default: Cr }, [v])
var rf = {},
  Bp = { exports: {} },
  sn = {},
  Fp = { exports: {} },
  Up = {}
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var N0
function v2() {
  return (
    N0 ||
      ((N0 = 1),
      (function (t) {
        function e(B, U) {
          var V = B.length
          B.push(U)
          e: for (; 0 < V; ) {
            var I = (V - 1) >>> 1,
              $ = B[I]
            if (0 < o($, U)) (B[I] = U), (B[V] = $), (V = I)
            else break e
          }
        }
        function n(B) {
          return B.length === 0 ? null : B[0]
        }
        function s(B) {
          if (B.length === 0) return null
          var U = B[0],
            V = B.pop()
          if (V !== U) {
            B[0] = V
            e: for (var I = 0, $ = B.length, ue = $ >>> 1; I < ue; ) {
              var oe = 2 * (I + 1) - 1,
                he = B[oe],
                me = oe + 1,
                Se = B[me]
              if (0 > o(he, V))
                me < $ && 0 > o(Se, he)
                  ? ((B[I] = Se), (B[me] = V), (I = me))
                  : ((B[I] = he), (B[oe] = V), (I = oe))
              else if (me < $ && 0 > o(Se, V))
                (B[I] = Se), (B[me] = V), (I = me)
              else break e
            }
          }
          return U
        }
        function o(B, U) {
          var V = B.sortIndex - U.sortIndex
          return V !== 0 ? V : B.id - U.id
        }
        if (
          typeof performance == "object" &&
          typeof performance.now == "function"
        ) {
          var l = performance
          t.unstable_now = function () {
            return l.now()
          }
        } else {
          var u = Date,
            f = u.now()
          t.unstable_now = function () {
            return u.now() - f
          }
        }
        var d = [],
          m = [],
          h = 1,
          g = null,
          w = 3,
          b = !1,
          E = !1,
          S = !1,
          C = typeof setTimeout == "function" ? setTimeout : null,
          _ = typeof clearTimeout == "function" ? clearTimeout : null,
          A = typeof setImmediate < "u" ? setImmediate : null
        typeof navigator < "u" &&
          navigator.scheduling !== void 0 &&
          navigator.scheduling.isInputPending !== void 0 &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling)
        function O(B) {
          for (var U = n(m); U !== null; ) {
            if (U.callback === null) s(m)
            else if (U.startTime <= B)
              s(m), (U.sortIndex = U.expirationTime), e(d, U)
            else break
            U = n(m)
          }
        }
        function M(B) {
          if (((S = !1), O(B), !E))
            if (n(d) !== null) (E = !0), te(D)
            else {
              var U = n(m)
              U !== null && H(M, U.startTime - B)
            }
        }
        function D(B, U) {
          ;(E = !1), S && ((S = !1), _(q), (q = -1)), (b = !0)
          var V = w
          try {
            for (
              O(U), g = n(d);
              g !== null && (!(g.expirationTime > U) || (B && !Ce()));

            ) {
              var I = g.callback
              if (typeof I == "function") {
                ;(g.callback = null), (w = g.priorityLevel)
                var $ = I(g.expirationTime <= U)
                ;(U = t.unstable_now()),
                  typeof $ == "function"
                    ? (g.callback = $)
                    : g === n(d) && s(d),
                  O(U)
              } else s(d)
              g = n(d)
            }
            if (g !== null) var ue = !0
            else {
              var oe = n(m)
              oe !== null && H(M, oe.startTime - U), (ue = !1)
            }
            return ue
          } finally {
            ;(g = null), (w = V), (b = !1)
          }
        }
        var K = !1,
          W = null,
          q = -1,
          Z = 5,
          le = -1
        function Ce() {
          return !(t.unstable_now() - le < Z)
        }
        function Ae() {
          if (W !== null) {
            var B = t.unstable_now()
            le = B
            var U = !0
            try {
              U = W(!0, B)
            } finally {
              U ? Te() : ((K = !1), (W = null))
            }
          } else K = !1
        }
        var Te
        if (typeof A == "function")
          Te = function () {
            A(Ae)
          }
        else if (typeof MessageChannel < "u") {
          var Pe = new MessageChannel(),
            Ue = Pe.port2
          ;(Pe.port1.onmessage = Ae),
            (Te = function () {
              Ue.postMessage(null)
            })
        } else
          Te = function () {
            C(Ae, 0)
          }
        function te(B) {
          ;(W = B), K || ((K = !0), Te())
        }
        function H(B, U) {
          q = C(function () {
            B(t.unstable_now())
          }, U)
        }
        ;(t.unstable_IdlePriority = 5),
          (t.unstable_ImmediatePriority = 1),
          (t.unstable_LowPriority = 4),
          (t.unstable_NormalPriority = 3),
          (t.unstable_Profiling = null),
          (t.unstable_UserBlockingPriority = 2),
          (t.unstable_cancelCallback = function (B) {
            B.callback = null
          }),
          (t.unstable_continueExecution = function () {
            E || b || ((E = !0), te(D))
          }),
          (t.unstable_forceFrameRate = function (B) {
            0 > B || 125 < B
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (Z = 0 < B ? Math.floor(1e3 / B) : 5)
          }),
          (t.unstable_getCurrentPriorityLevel = function () {
            return w
          }),
          (t.unstable_getFirstCallbackNode = function () {
            return n(d)
          }),
          (t.unstable_next = function (B) {
            switch (w) {
              case 1:
              case 2:
              case 3:
                var U = 3
                break
              default:
                U = w
            }
            var V = w
            w = U
            try {
              return B()
            } finally {
              w = V
            }
          }),
          (t.unstable_pauseExecution = function () {}),
          (t.unstable_requestPaint = function () {}),
          (t.unstable_runWithPriority = function (B, U) {
            switch (B) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break
              default:
                B = 3
            }
            var V = w
            w = B
            try {
              return U()
            } finally {
              w = V
            }
          }),
          (t.unstable_scheduleCallback = function (B, U, V) {
            var I = t.unstable_now()
            switch (
              (typeof V == "object" && V !== null
                ? ((V = V.delay),
                  (V = typeof V == "number" && 0 < V ? I + V : I))
                : (V = I),
              B)
            ) {
              case 1:
                var $ = -1
                break
              case 2:
                $ = 250
                break
              case 5:
                $ = 1073741823
                break
              case 4:
                $ = 1e4
                break
              default:
                $ = 5e3
            }
            return (
              ($ = V + $),
              (B = {
                id: h++,
                callback: U,
                priorityLevel: B,
                startTime: V,
                expirationTime: $,
                sortIndex: -1,
              }),
              V > I
                ? ((B.sortIndex = V),
                  e(m, B),
                  n(d) === null &&
                    B === n(m) &&
                    (S ? (_(q), (q = -1)) : (S = !0), H(M, V - I)))
                : ((B.sortIndex = $), e(d, B), E || b || ((E = !0), te(D))),
              B
            )
          }),
          (t.unstable_shouldYield = Ce),
          (t.unstable_wrapCallback = function (B) {
            var U = w
            return function () {
              var V = w
              w = U
              try {
                return B.apply(this, arguments)
              } finally {
                w = V
              }
            }
          })
      })(Up)),
    Up
  )
}
var j0
function w2() {
  return j0 || ((j0 = 1), (Fp.exports = v2())), Fp.exports
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var D0
function S2() {
  if (D0) return sn
  D0 = 1
  var t = Ka(),
    e = w2()
  function n(r) {
    for (
      var i = "https://reactjs.org/docs/error-decoder.html?invariant=" + r,
        a = 1;
      a < arguments.length;
      a++
    )
      i += "&args[]=" + encodeURIComponent(arguments[a])
    return (
      "Minified React error #" +
      r +
      "; visit " +
      i +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    )
  }
  var s = new Set(),
    o = {}
  function l(r, i) {
    u(r, i), u(r + "Capture", i)
  }
  function u(r, i) {
    for (o[r] = i, r = 0; r < i.length; r++) s.add(i[r])
  }
  var f = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    d = Object.prototype.hasOwnProperty,
    m =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    h = {},
    g = {}
  function w(r) {
    return d.call(g, r)
      ? !0
      : d.call(h, r)
        ? !1
        : m.test(r)
          ? (g[r] = !0)
          : ((h[r] = !0), !1)
  }
  function b(r, i, a, c) {
    if (a !== null && a.type === 0) return !1
    switch (typeof i) {
      case "function":
      case "symbol":
        return !0
      case "boolean":
        return c
          ? !1
          : a !== null
            ? !a.acceptsBooleans
            : ((r = r.toLowerCase().slice(0, 5)),
              r !== "data-" && r !== "aria-")
      default:
        return !1
    }
  }
  function E(r, i, a, c) {
    if (i === null || typeof i > "u" || b(r, i, a, c)) return !0
    if (c) return !1
    if (a !== null)
      switch (a.type) {
        case 3:
          return !i
        case 4:
          return i === !1
        case 5:
          return isNaN(i)
        case 6:
          return isNaN(i) || 1 > i
      }
    return !1
  }
  function S(r, i, a, c, p, y, k) {
    ;(this.acceptsBooleans = i === 2 || i === 3 || i === 4),
      (this.attributeName = c),
      (this.attributeNamespace = p),
      (this.mustUseProperty = a),
      (this.propertyName = r),
      (this.type = i),
      (this.sanitizeURL = y),
      (this.removeEmptyString = k)
  }
  var C = {}
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
    .split(" ")
    .forEach(function (r) {
      C[r] = new S(r, 0, !1, r, null, !1, !1)
    }),
    [
      ["acceptCharset", "accept-charset"],
      ["className", "class"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
    ].forEach(function (r) {
      var i = r[0]
      C[i] = new S(i, 1, !1, r[1], null, !1, !1)
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(
      function (r) {
        C[r] = new S(r, 2, !1, r.toLowerCase(), null, !1, !1)
      },
    ),
    [
      "autoReverse",
      "externalResourcesRequired",
      "focusable",
      "preserveAlpha",
    ].forEach(function (r) {
      C[r] = new S(r, 2, !1, r, null, !1, !1)
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
      .split(" ")
      .forEach(function (r) {
        C[r] = new S(r, 3, !1, r.toLowerCase(), null, !1, !1)
      }),
    ["checked", "multiple", "muted", "selected"].forEach(function (r) {
      C[r] = new S(r, 3, !0, r, null, !1, !1)
    }),
    ["capture", "download"].forEach(function (r) {
      C[r] = new S(r, 4, !1, r, null, !1, !1)
    }),
    ["cols", "rows", "size", "span"].forEach(function (r) {
      C[r] = new S(r, 6, !1, r, null, !1, !1)
    }),
    ["rowSpan", "start"].forEach(function (r) {
      C[r] = new S(r, 5, !1, r.toLowerCase(), null, !1, !1)
    })
  var _ = /[\-:]([a-z])/g
  function A(r) {
    return r[1].toUpperCase()
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
    .split(" ")
    .forEach(function (r) {
      var i = r.replace(_, A)
      C[i] = new S(i, 1, !1, r, null, !1, !1)
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
      .split(" ")
      .forEach(function (r) {
        var i = r.replace(_, A)
        C[i] = new S(i, 1, !1, r, "http://www.w3.org/1999/xlink", !1, !1)
      }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function (r) {
      var i = r.replace(_, A)
      C[i] = new S(i, 1, !1, r, "http://www.w3.org/XML/1998/namespace", !1, !1)
    }),
    ["tabIndex", "crossOrigin"].forEach(function (r) {
      C[r] = new S(r, 1, !1, r.toLowerCase(), null, !1, !1)
    }),
    (C.xlinkHref = new S(
      "xlinkHref",
      1,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1,
    )),
    ["src", "href", "action", "formAction"].forEach(function (r) {
      C[r] = new S(r, 1, !1, r.toLowerCase(), null, !0, !0)
    })
  function O(r, i, a, c) {
    var p = C.hasOwnProperty(i) ? C[i] : null
    ;(p !== null
      ? p.type !== 0
      : c ||
        !(2 < i.length) ||
        (i[0] !== "o" && i[0] !== "O") ||
        (i[1] !== "n" && i[1] !== "N")) &&
      (E(i, a, p, c) && (a = null),
      c || p === null
        ? w(i) &&
          (a === null ? r.removeAttribute(i) : r.setAttribute(i, "" + a))
        : p.mustUseProperty
          ? (r[p.propertyName] = a === null ? (p.type === 3 ? !1 : "") : a)
          : ((i = p.attributeName),
            (c = p.attributeNamespace),
            a === null
              ? r.removeAttribute(i)
              : ((p = p.type),
                (a = p === 3 || (p === 4 && a === !0) ? "" : "" + a),
                c ? r.setAttributeNS(c, i, a) : r.setAttribute(i, a))))
  }
  var M = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    D = Symbol.for("react.element"),
    K = Symbol.for("react.portal"),
    W = Symbol.for("react.fragment"),
    q = Symbol.for("react.strict_mode"),
    Z = Symbol.for("react.profiler"),
    le = Symbol.for("react.provider"),
    Ce = Symbol.for("react.context"),
    Ae = Symbol.for("react.forward_ref"),
    Te = Symbol.for("react.suspense"),
    Pe = Symbol.for("react.suspense_list"),
    Ue = Symbol.for("react.memo"),
    te = Symbol.for("react.lazy"),
    H = Symbol.for("react.offscreen"),
    B = Symbol.iterator
  function U(r) {
    return r === null || typeof r != "object"
      ? null
      : ((r = (B && r[B]) || r["@@iterator"]),
        typeof r == "function" ? r : null)
  }
  var V = Object.assign,
    I
  function $(r) {
    if (I === void 0)
      try {
        throw Error()
      } catch (a) {
        var i = a.stack.trim().match(/\n( *(at )?)/)
        I = (i && i[1]) || ""
      }
    return (
      `
` +
      I +
      r
    )
  }
  var ue = !1
  function oe(r, i) {
    if (!r || ue) return ""
    ue = !0
    var a = Error.prepareStackTrace
    Error.prepareStackTrace = void 0
    try {
      if (i)
        if (
          ((i = function () {
            throw Error()
          }),
          Object.defineProperty(i.prototype, "props", {
            set: function () {
              throw Error()
            },
          }),
          typeof Reflect == "object" && Reflect.construct)
        ) {
          try {
            Reflect.construct(i, [])
          } catch (z) {
            var c = z
          }
          Reflect.construct(r, [], i)
        } else {
          try {
            i.call()
          } catch (z) {
            c = z
          }
          r.call(i.prototype)
        }
      else {
        try {
          throw Error()
        } catch (z) {
          c = z
        }
        r()
      }
    } catch (z) {
      if (z && c && typeof z.stack == "string") {
        for (
          var p = z.stack.split(`
`),
            y = c.stack.split(`
`),
            k = p.length - 1,
            R = y.length - 1;
          1 <= k && 0 <= R && p[k] !== y[R];

        )
          R--
        for (; 1 <= k && 0 <= R; k--, R--)
          if (p[k] !== y[R]) {
            if (k !== 1 || R !== 1)
              do
                if ((k--, R--, 0 > R || p[k] !== y[R])) {
                  var N =
                    `
` + p[k].replace(" at new ", " at ")
                  return (
                    r.displayName &&
                      N.includes("<anonymous>") &&
                      (N = N.replace("<anonymous>", r.displayName)),
                    N
                  )
                }
              while (1 <= k && 0 <= R)
            break
          }
      }
    } finally {
      ;(ue = !1), (Error.prepareStackTrace = a)
    }
    return (r = r ? r.displayName || r.name : "") ? $(r) : ""
  }
  function he(r) {
    switch (r.tag) {
      case 5:
        return $(r.type)
      case 16:
        return $("Lazy")
      case 13:
        return $("Suspense")
      case 19:
        return $("SuspenseList")
      case 0:
      case 2:
      case 15:
        return (r = oe(r.type, !1)), r
      case 11:
        return (r = oe(r.type.render, !1)), r
      case 1:
        return (r = oe(r.type, !0)), r
      default:
        return ""
    }
  }
  function me(r) {
    if (r == null) return null
    if (typeof r == "function") return r.displayName || r.name || null
    if (typeof r == "string") return r
    switch (r) {
      case W:
        return "Fragment"
      case K:
        return "Portal"
      case Z:
        return "Profiler"
      case q:
        return "StrictMode"
      case Te:
        return "Suspense"
      case Pe:
        return "SuspenseList"
    }
    if (typeof r == "object")
      switch (r.$$typeof) {
        case Ce:
          return (r.displayName || "Context") + ".Consumer"
        case le:
          return (r._context.displayName || "Context") + ".Provider"
        case Ae:
          var i = r.render
          return (
            (r = r.displayName),
            r ||
              ((r = i.displayName || i.name || ""),
              (r = r !== "" ? "ForwardRef(" + r + ")" : "ForwardRef")),
            r
          )
        case Ue:
          return (
            (i = r.displayName || null), i !== null ? i : me(r.type) || "Memo"
          )
        case te:
          ;(i = r._payload), (r = r._init)
          try {
            return me(r(i))
          } catch {}
      }
    return null
  }
  function Se(r) {
    var i = r.type
    switch (r.tag) {
      case 24:
        return "Cache"
      case 9:
        return (i.displayName || "Context") + ".Consumer"
      case 10:
        return (i._context.displayName || "Context") + ".Provider"
      case 18:
        return "DehydratedFragment"
      case 11:
        return (
          (r = i.render),
          (r = r.displayName || r.name || ""),
          i.displayName || (r !== "" ? "ForwardRef(" + r + ")" : "ForwardRef")
        )
      case 7:
        return "Fragment"
      case 5:
        return i
      case 4:
        return "Portal"
      case 3:
        return "Root"
      case 6:
        return "Text"
      case 16:
        return me(i)
      case 8:
        return i === q ? "StrictMode" : "Mode"
      case 22:
        return "Offscreen"
      case 12:
        return "Profiler"
      case 21:
        return "Scope"
      case 13:
        return "Suspense"
      case 19:
        return "SuspenseList"
      case 25:
        return "TracingMarker"
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof i == "function") return i.displayName || i.name || null
        if (typeof i == "string") return i
    }
    return null
  }
  function ke(r) {
    switch (typeof r) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return r
      case "object":
        return r
      default:
        return ""
    }
  }
  function Ee(r) {
    var i = r.type
    return (
      (r = r.nodeName) &&
      r.toLowerCase() === "input" &&
      (i === "checkbox" || i === "radio")
    )
  }
  function Be(r) {
    var i = Ee(r) ? "checked" : "value",
      a = Object.getOwnPropertyDescriptor(r.constructor.prototype, i),
      c = "" + r[i]
    if (
      !r.hasOwnProperty(i) &&
      typeof a < "u" &&
      typeof a.get == "function" &&
      typeof a.set == "function"
    ) {
      var p = a.get,
        y = a.set
      return (
        Object.defineProperty(r, i, {
          configurable: !0,
          get: function () {
            return p.call(this)
          },
          set: function (k) {
            ;(c = "" + k), y.call(this, k)
          },
        }),
        Object.defineProperty(r, i, { enumerable: a.enumerable }),
        {
          getValue: function () {
            return c
          },
          setValue: function (k) {
            c = "" + k
          },
          stopTracking: function () {
            ;(r._valueTracker = null), delete r[i]
          },
        }
      )
    }
  }
  function Dt(r) {
    r._valueTracker || (r._valueTracker = Be(r))
  }
  function dn(r) {
    if (!r) return !1
    var i = r._valueTracker
    if (!i) return !0
    var a = i.getValue(),
      c = ""
    return (
      r && (c = Ee(r) ? (r.checked ? "true" : "false") : r.value),
      (r = c),
      r !== a ? (i.setValue(r), !0) : !1
    )
  }
  function Ht(r) {
    if (
      ((r = r || (typeof document < "u" ? document : void 0)), typeof r > "u")
    )
      return null
    try {
      return r.activeElement || r.body
    } catch {
      return r.body
    }
  }
  function Br(r, i) {
    var a = i.checked
    return V({}, i, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: a ?? r._wrapperState.initialChecked,
    })
  }
  function ms(r, i) {
    var a = i.defaultValue == null ? "" : i.defaultValue,
      c = i.checked != null ? i.checked : i.defaultChecked
    ;(a = ke(i.value != null ? i.value : a)),
      (r._wrapperState = {
        initialChecked: c,
        initialValue: a,
        controlled:
          i.type === "checkbox" || i.type === "radio"
            ? i.checked != null
            : i.value != null,
      })
  }
  function _o(r, i) {
    ;(i = i.checked), i != null && O(r, "checked", i, !1)
  }
  function gs(r, i) {
    _o(r, i)
    var a = ke(i.value),
      c = i.type
    if (a != null)
      c === "number"
        ? ((a === 0 && r.value === "") || r.value != a) && (r.value = "" + a)
        : r.value !== "" + a && (r.value = "" + a)
    else if (c === "submit" || c === "reset") {
      r.removeAttribute("value")
      return
    }
    i.hasOwnProperty("value")
      ? mr(r, i.type, a)
      : i.hasOwnProperty("defaultValue") && mr(r, i.type, ke(i.defaultValue)),
      i.checked == null &&
        i.defaultChecked != null &&
        (r.defaultChecked = !!i.defaultChecked)
  }
  function ko(r, i, a) {
    if (i.hasOwnProperty("value") || i.hasOwnProperty("defaultValue")) {
      var c = i.type
      if (
        !(
          (c !== "submit" && c !== "reset") ||
          (i.value !== void 0 && i.value !== null)
        )
      )
        return
      ;(i = "" + r._wrapperState.initialValue),
        a || i === r.value || (r.value = i),
        (r.defaultValue = i)
    }
    ;(a = r.name),
      a !== "" && (r.name = ""),
      (r.defaultChecked = !!r._wrapperState.initialChecked),
      a !== "" && (r.name = a)
  }
  function mr(r, i, a) {
    ;(i !== "number" || Ht(r.ownerDocument) !== r) &&
      (a == null
        ? (r.defaultValue = "" + r._wrapperState.initialValue)
        : r.defaultValue !== "" + a && (r.defaultValue = "" + a))
  }
  var Si = Array.isArray
  function Fr(r, i, a, c) {
    if (((r = r.options), i)) {
      i = {}
      for (var p = 0; p < a.length; p++) i["$" + a[p]] = !0
      for (a = 0; a < r.length; a++)
        (p = i.hasOwnProperty("$" + r[a].value)),
          r[a].selected !== p && (r[a].selected = p),
          p && c && (r[a].defaultSelected = !0)
    } else {
      for (a = "" + ke(a), i = null, p = 0; p < r.length; p++) {
        if (r[p].value === a) {
          ;(r[p].selected = !0), c && (r[p].defaultSelected = !0)
          return
        }
        i !== null || r[p].disabled || (i = r[p])
      }
      i !== null && (i.selected = !0)
    }
  }
  function ys(r, i) {
    if (i.dangerouslySetInnerHTML != null) throw Error(n(91))
    return V({}, i, {
      value: void 0,
      defaultValue: void 0,
      children: "" + r._wrapperState.initialValue,
    })
  }
  function il(r, i) {
    var a = i.value
    if (a == null) {
      if (((a = i.children), (i = i.defaultValue), a != null)) {
        if (i != null) throw Error(n(92))
        if (Si(a)) {
          if (1 < a.length) throw Error(n(93))
          a = a[0]
        }
        i = a
      }
      i == null && (i = ""), (a = i)
    }
    r._wrapperState = { initialValue: ke(a) }
  }
  function sl(r, i) {
    var a = ke(i.value),
      c = ke(i.defaultValue)
    a != null &&
      ((a = "" + a),
      a !== r.value && (r.value = a),
      i.defaultValue == null && r.defaultValue !== a && (r.defaultValue = a)),
      c != null && (r.defaultValue = "" + c)
  }
  function ol(r) {
    var i = r.textContent
    i === r._wrapperState.initialValue &&
      i !== "" &&
      i !== null &&
      (r.value = i)
  }
  function al(r) {
    switch (r) {
      case "svg":
        return "http://www.w3.org/2000/svg"
      case "math":
        return "http://www.w3.org/1998/Math/MathML"
      default:
        return "http://www.w3.org/1999/xhtml"
    }
  }
  function Oo(r, i) {
    return r == null || r === "http://www.w3.org/1999/xhtml"
      ? al(i)
      : r === "http://www.w3.org/2000/svg" && i === "foreignObject"
        ? "http://www.w3.org/1999/xhtml"
        : r
  }
  var Ao,
    Qu = (function (r) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
        ? function (i, a, c, p) {
            MSApp.execUnsafeLocalFunction(function () {
              return r(i, a, c, p)
            })
          }
        : r
    })(function (r, i) {
      if (r.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in r)
        r.innerHTML = i
      else {
        for (
          Ao = Ao || document.createElement("div"),
            Ao.innerHTML = "<svg>" + i.valueOf().toString() + "</svg>",
            i = Ao.firstChild;
          r.firstChild;

        )
          r.removeChild(r.firstChild)
        for (; i.firstChild; ) r.appendChild(i.firstChild)
      }
    })
  function vs(r, i) {
    if (i) {
      var a = r.firstChild
      if (a && a === r.lastChild && a.nodeType === 3) {
        a.nodeValue = i
        return
      }
    }
    r.textContent = i
  }
  var ws = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0,
    },
    m_ = ["Webkit", "ms", "Moz", "O"]
  Object.keys(ws).forEach(function (r) {
    m_.forEach(function (i) {
      ;(i = i + r.charAt(0).toUpperCase() + r.substring(1)), (ws[i] = ws[r])
    })
  })
  function Vy(r, i, a) {
    return i == null || typeof i == "boolean" || i === ""
      ? ""
      : a || typeof i != "number" || i === 0 || (ws.hasOwnProperty(r) && ws[r])
        ? ("" + i).trim()
        : i + "px"
  }
  function Hy(r, i) {
    r = r.style
    for (var a in i)
      if (i.hasOwnProperty(a)) {
        var c = a.indexOf("--") === 0,
          p = Vy(a, i[a], c)
        a === "float" && (a = "cssFloat"), c ? r.setProperty(a, p) : (r[a] = p)
      }
  }
  var g_ = V(
    { menuitem: !0 },
    {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0,
    },
  )
  function Kd(r, i) {
    if (i) {
      if (g_[r] && (i.children != null || i.dangerouslySetInnerHTML != null))
        throw Error(n(137, r))
      if (i.dangerouslySetInnerHTML != null) {
        if (i.children != null) throw Error(n(60))
        if (
          typeof i.dangerouslySetInnerHTML != "object" ||
          !("__html" in i.dangerouslySetInnerHTML)
        )
          throw Error(n(61))
      }
      if (i.style != null && typeof i.style != "object") throw Error(n(62))
    }
  }
  function qd(r, i) {
    if (r.indexOf("-") === -1) return typeof i.is == "string"
    switch (r) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1
      default:
        return !0
    }
  }
  var Qd = null
  function Yd(r) {
    return (
      (r = r.target || r.srcElement || window),
      r.correspondingUseElement && (r = r.correspondingUseElement),
      r.nodeType === 3 ? r.parentNode : r
    )
  }
  var Xd = null,
    To = null,
    Ro = null
  function Gy(r) {
    if ((r = Tl(r))) {
      if (typeof Xd != "function") throw Error(n(280))
      var i = r.stateNode
      i && ((i = vc(i)), Xd(r.stateNode, r.type, i))
    }
  }
  function Ky(r) {
    To ? (Ro ? Ro.push(r) : (Ro = [r])) : (To = r)
  }
  function qy() {
    if (To) {
      var r = To,
        i = Ro
      if (((Ro = To = null), Gy(r), i)) for (r = 0; r < i.length; r++) Gy(i[r])
    }
  }
  function Qy(r, i) {
    return r(i)
  }
  function Yy() {}
  var Zd = !1
  function Xy(r, i, a) {
    if (Zd) return r(i, a)
    Zd = !0
    try {
      return Qy(r, i, a)
    } finally {
      ;(Zd = !1), (To !== null || Ro !== null) && (Yy(), qy())
    }
  }
  function ll(r, i) {
    var a = r.stateNode
    if (a === null) return null
    var c = vc(a)
    if (c === null) return null
    a = c[i]
    e: switch (i) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        ;(c = !c.disabled) ||
          ((r = r.type),
          (c = !(
            r === "button" ||
            r === "input" ||
            r === "select" ||
            r === "textarea"
          ))),
          (r = !c)
        break e
      default:
        r = !1
    }
    if (r) return null
    if (a && typeof a != "function") throw Error(n(231, i, typeof a))
    return a
  }
  var Jd = !1
  if (f)
    try {
      var ul = {}
      Object.defineProperty(ul, "passive", {
        get: function () {
          Jd = !0
        },
      }),
        window.addEventListener("test", ul, ul),
        window.removeEventListener("test", ul, ul)
    } catch {
      Jd = !1
    }
  function y_(r, i, a, c, p, y, k, R, N) {
    var z = Array.prototype.slice.call(arguments, 3)
    try {
      i.apply(a, z)
    } catch (X) {
      this.onError(X)
    }
  }
  var cl = !1,
    Yu = null,
    Xu = !1,
    eh = null,
    v_ = {
      onError: function (r) {
        ;(cl = !0), (Yu = r)
      },
    }
  function w_(r, i, a, c, p, y, k, R, N) {
    ;(cl = !1), (Yu = null), y_.apply(v_, arguments)
  }
  function S_(r, i, a, c, p, y, k, R, N) {
    if ((w_.apply(this, arguments), cl)) {
      if (cl) {
        var z = Yu
        ;(cl = !1), (Yu = null)
      } else throw Error(n(198))
      Xu || ((Xu = !0), (eh = z))
    }
  }
  function Ss(r) {
    var i = r,
      a = r
    if (r.alternate) for (; i.return; ) i = i.return
    else {
      r = i
      do (i = r), (i.flags & 4098) !== 0 && (a = i.return), (r = i.return)
      while (r)
    }
    return i.tag === 3 ? a : null
  }
  function Zy(r) {
    if (r.tag === 13) {
      var i = r.memoizedState
      if (
        (i === null && ((r = r.alternate), r !== null && (i = r.memoizedState)),
        i !== null)
      )
        return i.dehydrated
    }
    return null
  }
  function Jy(r) {
    if (Ss(r) !== r) throw Error(n(188))
  }
  function x_(r) {
    var i = r.alternate
    if (!i) {
      if (((i = Ss(r)), i === null)) throw Error(n(188))
      return i !== r ? null : r
    }
    for (var a = r, c = i; ; ) {
      var p = a.return
      if (p === null) break
      var y = p.alternate
      if (y === null) {
        if (((c = p.return), c !== null)) {
          a = c
          continue
        }
        break
      }
      if (p.child === y.child) {
        for (y = p.child; y; ) {
          if (y === a) return Jy(p), r
          if (y === c) return Jy(p), i
          y = y.sibling
        }
        throw Error(n(188))
      }
      if (a.return !== c.return) (a = p), (c = y)
      else {
        for (var k = !1, R = p.child; R; ) {
          if (R === a) {
            ;(k = !0), (a = p), (c = y)
            break
          }
          if (R === c) {
            ;(k = !0), (c = p), (a = y)
            break
          }
          R = R.sibling
        }
        if (!k) {
          for (R = y.child; R; ) {
            if (R === a) {
              ;(k = !0), (a = y), (c = p)
              break
            }
            if (R === c) {
              ;(k = !0), (c = y), (a = p)
              break
            }
            R = R.sibling
          }
          if (!k) throw Error(n(189))
        }
      }
      if (a.alternate !== c) throw Error(n(190))
    }
    if (a.tag !== 3) throw Error(n(188))
    return a.stateNode.current === a ? r : i
  }
  function ev(r) {
    return (r = x_(r)), r !== null ? tv(r) : null
  }
  function tv(r) {
    if (r.tag === 5 || r.tag === 6) return r
    for (r = r.child; r !== null; ) {
      var i = tv(r)
      if (i !== null) return i
      r = r.sibling
    }
    return null
  }
  var nv = e.unstable_scheduleCallback,
    rv = e.unstable_cancelCallback,
    E_ = e.unstable_shouldYield,
    b_ = e.unstable_requestPaint,
    ht = e.unstable_now,
    C_ = e.unstable_getCurrentPriorityLevel,
    th = e.unstable_ImmediatePriority,
    iv = e.unstable_UserBlockingPriority,
    Zu = e.unstable_NormalPriority,
    __ = e.unstable_LowPriority,
    sv = e.unstable_IdlePriority,
    Ju = null,
    gr = null
  function k_(r) {
    if (gr && typeof gr.onCommitFiberRoot == "function")
      try {
        gr.onCommitFiberRoot(Ju, r, void 0, (r.current.flags & 128) === 128)
      } catch {}
  }
  var Fn = Math.clz32 ? Math.clz32 : T_,
    O_ = Math.log,
    A_ = Math.LN2
  function T_(r) {
    return (r >>>= 0), r === 0 ? 32 : (31 - ((O_(r) / A_) | 0)) | 0
  }
  var ec = 64,
    tc = 4194304
  function fl(r) {
    switch (r & -r) {
      case 1:
        return 1
      case 2:
        return 2
      case 4:
        return 4
      case 8:
        return 8
      case 16:
        return 16
      case 32:
        return 32
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r & 4194240
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return r & 130023424
      case 134217728:
        return 134217728
      case 268435456:
        return 268435456
      case 536870912:
        return 536870912
      case 1073741824:
        return 1073741824
      default:
        return r
    }
  }
  function nc(r, i) {
    var a = r.pendingLanes
    if (a === 0) return 0
    var c = 0,
      p = r.suspendedLanes,
      y = r.pingedLanes,
      k = a & 268435455
    if (k !== 0) {
      var R = k & ~p
      R !== 0 ? (c = fl(R)) : ((y &= k), y !== 0 && (c = fl(y)))
    } else (k = a & ~p), k !== 0 ? (c = fl(k)) : y !== 0 && (c = fl(y))
    if (c === 0) return 0
    if (
      i !== 0 &&
      i !== c &&
      (i & p) === 0 &&
      ((p = c & -c), (y = i & -i), p >= y || (p === 16 && (y & 4194240) !== 0))
    )
      return i
    if (((c & 4) !== 0 && (c |= a & 16), (i = r.entangledLanes), i !== 0))
      for (r = r.entanglements, i &= c; 0 < i; )
        (a = 31 - Fn(i)), (p = 1 << a), (c |= r[a]), (i &= ~p)
    return c
  }
  function R_(r, i) {
    switch (r) {
      case 1:
      case 2:
      case 4:
        return i + 250
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return i + 5e3
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1
      default:
        return -1
    }
  }
  function P_(r, i) {
    for (
      var a = r.suspendedLanes,
        c = r.pingedLanes,
        p = r.expirationTimes,
        y = r.pendingLanes;
      0 < y;

    ) {
      var k = 31 - Fn(y),
        R = 1 << k,
        N = p[k]
      N === -1
        ? ((R & a) === 0 || (R & c) !== 0) && (p[k] = R_(R, i))
        : N <= i && (r.expiredLanes |= R),
        (y &= ~R)
    }
  }
  function nh(r) {
    return (
      (r = r.pendingLanes & -1073741825),
      r !== 0 ? r : r & 1073741824 ? 1073741824 : 0
    )
  }
  function ov() {
    var r = ec
    return (ec <<= 1), (ec & 4194240) === 0 && (ec = 64), r
  }
  function rh(r) {
    for (var i = [], a = 0; 31 > a; a++) i.push(r)
    return i
  }
  function dl(r, i, a) {
    ;(r.pendingLanes |= i),
      i !== 536870912 && ((r.suspendedLanes = 0), (r.pingedLanes = 0)),
      (r = r.eventTimes),
      (i = 31 - Fn(i)),
      (r[i] = a)
  }
  function I_(r, i) {
    var a = r.pendingLanes & ~i
    ;(r.pendingLanes = i),
      (r.suspendedLanes = 0),
      (r.pingedLanes = 0),
      (r.expiredLanes &= i),
      (r.mutableReadLanes &= i),
      (r.entangledLanes &= i),
      (i = r.entanglements)
    var c = r.eventTimes
    for (r = r.expirationTimes; 0 < a; ) {
      var p = 31 - Fn(a),
        y = 1 << p
      ;(i[p] = 0), (c[p] = -1), (r[p] = -1), (a &= ~y)
    }
  }
  function ih(r, i) {
    var a = (r.entangledLanes |= i)
    for (r = r.entanglements; a; ) {
      var c = 31 - Fn(a),
        p = 1 << c
      ;(p & i) | (r[c] & i) && (r[c] |= i), (a &= ~p)
    }
  }
  var Ve = 0
  function av(r) {
    return (
      (r &= -r),
      1 < r ? (4 < r ? ((r & 268435455) !== 0 ? 16 : 536870912) : 4) : 1
    )
  }
  var lv,
    sh,
    uv,
    cv,
    fv,
    oh = !1,
    rc = [],
    xi = null,
    Ei = null,
    bi = null,
    hl = new Map(),
    pl = new Map(),
    Ci = [],
    M_ =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
        " ",
      )
  function dv(r, i) {
    switch (r) {
      case "focusin":
      case "focusout":
        xi = null
        break
      case "dragenter":
      case "dragleave":
        Ei = null
        break
      case "mouseover":
      case "mouseout":
        bi = null
        break
      case "pointerover":
      case "pointerout":
        hl.delete(i.pointerId)
        break
      case "gotpointercapture":
      case "lostpointercapture":
        pl.delete(i.pointerId)
    }
  }
  function ml(r, i, a, c, p, y) {
    return r === null || r.nativeEvent !== y
      ? ((r = {
          blockedOn: i,
          domEventName: a,
          eventSystemFlags: c,
          nativeEvent: y,
          targetContainers: [p],
        }),
        i !== null && ((i = Tl(i)), i !== null && sh(i)),
        r)
      : ((r.eventSystemFlags |= c),
        (i = r.targetContainers),
        p !== null && i.indexOf(p) === -1 && i.push(p),
        r)
  }
  function N_(r, i, a, c, p) {
    switch (i) {
      case "focusin":
        return (xi = ml(xi, r, i, a, c, p)), !0
      case "dragenter":
        return (Ei = ml(Ei, r, i, a, c, p)), !0
      case "mouseover":
        return (bi = ml(bi, r, i, a, c, p)), !0
      case "pointerover":
        var y = p.pointerId
        return hl.set(y, ml(hl.get(y) || null, r, i, a, c, p)), !0
      case "gotpointercapture":
        return (
          (y = p.pointerId), pl.set(y, ml(pl.get(y) || null, r, i, a, c, p)), !0
        )
    }
    return !1
  }
  function hv(r) {
    var i = xs(r.target)
    if (i !== null) {
      var a = Ss(i)
      if (a !== null) {
        if (((i = a.tag), i === 13)) {
          if (((i = Zy(a)), i !== null)) {
            ;(r.blockedOn = i),
              fv(r.priority, function () {
                uv(a)
              })
            return
          }
        } else if (i === 3 && a.stateNode.current.memoizedState.isDehydrated) {
          r.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null
          return
        }
      }
    }
    r.blockedOn = null
  }
  function ic(r) {
    if (r.blockedOn !== null) return !1
    for (var i = r.targetContainers; 0 < i.length; ) {
      var a = lh(r.domEventName, r.eventSystemFlags, i[0], r.nativeEvent)
      if (a === null) {
        a = r.nativeEvent
        var c = new a.constructor(a.type, a)
        ;(Qd = c), a.target.dispatchEvent(c), (Qd = null)
      } else return (i = Tl(a)), i !== null && sh(i), (r.blockedOn = a), !1
      i.shift()
    }
    return !0
  }
  function pv(r, i, a) {
    ic(r) && a.delete(i)
  }
  function j_() {
    ;(oh = !1),
      xi !== null && ic(xi) && (xi = null),
      Ei !== null && ic(Ei) && (Ei = null),
      bi !== null && ic(bi) && (bi = null),
      hl.forEach(pv),
      pl.forEach(pv)
  }
  function gl(r, i) {
    r.blockedOn === i &&
      ((r.blockedOn = null),
      oh ||
        ((oh = !0), e.unstable_scheduleCallback(e.unstable_NormalPriority, j_)))
  }
  function yl(r) {
    function i(p) {
      return gl(p, r)
    }
    if (0 < rc.length) {
      gl(rc[0], r)
      for (var a = 1; a < rc.length; a++) {
        var c = rc[a]
        c.blockedOn === r && (c.blockedOn = null)
      }
    }
    for (
      xi !== null && gl(xi, r),
        Ei !== null && gl(Ei, r),
        bi !== null && gl(bi, r),
        hl.forEach(i),
        pl.forEach(i),
        a = 0;
      a < Ci.length;
      a++
    )
      (c = Ci[a]), c.blockedOn === r && (c.blockedOn = null)
    for (; 0 < Ci.length && ((a = Ci[0]), a.blockedOn === null); )
      hv(a), a.blockedOn === null && Ci.shift()
  }
  var Po = M.ReactCurrentBatchConfig,
    sc = !0
  function D_(r, i, a, c) {
    var p = Ve,
      y = Po.transition
    Po.transition = null
    try {
      ;(Ve = 1), ah(r, i, a, c)
    } finally {
      ;(Ve = p), (Po.transition = y)
    }
  }
  function L_(r, i, a, c) {
    var p = Ve,
      y = Po.transition
    Po.transition = null
    try {
      ;(Ve = 4), ah(r, i, a, c)
    } finally {
      ;(Ve = p), (Po.transition = y)
    }
  }
  function ah(r, i, a, c) {
    if (sc) {
      var p = lh(r, i, a, c)
      if (p === null) _h(r, i, c, oc, a), dv(r, c)
      else if (N_(p, r, i, a, c)) c.stopPropagation()
      else if ((dv(r, c), i & 4 && -1 < M_.indexOf(r))) {
        for (; p !== null; ) {
          var y = Tl(p)
          if (
            (y !== null && lv(y),
            (y = lh(r, i, a, c)),
            y === null && _h(r, i, c, oc, a),
            y === p)
          )
            break
          p = y
        }
        p !== null && c.stopPropagation()
      } else _h(r, i, c, null, a)
    }
  }
  var oc = null
  function lh(r, i, a, c) {
    if (((oc = null), (r = Yd(c)), (r = xs(r)), r !== null))
      if (((i = Ss(r)), i === null)) r = null
      else if (((a = i.tag), a === 13)) {
        if (((r = Zy(i)), r !== null)) return r
        r = null
      } else if (a === 3) {
        if (i.stateNode.current.memoizedState.isDehydrated)
          return i.tag === 3 ? i.stateNode.containerInfo : null
        r = null
      } else i !== r && (r = null)
    return (oc = r), null
  }
  function mv(r) {
    switch (r) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4
      case "message":
        switch (C_()) {
          case th:
            return 1
          case iv:
            return 4
          case Zu:
          case __:
            return 16
          case sv:
            return 536870912
          default:
            return 16
        }
      default:
        return 16
    }
  }
  var _i = null,
    uh = null,
    ac = null
  function gv() {
    if (ac) return ac
    var r,
      i = uh,
      a = i.length,
      c,
      p = "value" in _i ? _i.value : _i.textContent,
      y = p.length
    for (r = 0; r < a && i[r] === p[r]; r++);
    var k = a - r
    for (c = 1; c <= k && i[a - c] === p[y - c]; c++);
    return (ac = p.slice(r, 1 < c ? 1 - c : void 0))
  }
  function lc(r) {
    var i = r.keyCode
    return (
      "charCode" in r
        ? ((r = r.charCode), r === 0 && i === 13 && (r = 13))
        : (r = i),
      r === 10 && (r = 13),
      32 <= r || r === 13 ? r : 0
    )
  }
  function uc() {
    return !0
  }
  function yv() {
    return !1
  }
  function hn(r) {
    function i(a, c, p, y, k) {
      ;(this._reactName = a),
        (this._targetInst = p),
        (this.type = c),
        (this.nativeEvent = y),
        (this.target = k),
        (this.currentTarget = null)
      for (var R in r)
        r.hasOwnProperty(R) && ((a = r[R]), (this[R] = a ? a(y) : y[R]))
      return (
        (this.isDefaultPrevented = (
          y.defaultPrevented != null ? y.defaultPrevented : y.returnValue === !1
        )
          ? uc
          : yv),
        (this.isPropagationStopped = yv),
        this
      )
    }
    return (
      V(i.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0
          var a = this.nativeEvent
          a &&
            (a.preventDefault
              ? a.preventDefault()
              : typeof a.returnValue != "unknown" && (a.returnValue = !1),
            (this.isDefaultPrevented = uc))
        },
        stopPropagation: function () {
          var a = this.nativeEvent
          a &&
            (a.stopPropagation
              ? a.stopPropagation()
              : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0),
            (this.isPropagationStopped = uc))
        },
        persist: function () {},
        isPersistent: uc,
      }),
      i
    )
  }
  var Io = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (r) {
        return r.timeStamp || Date.now()
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    ch = hn(Io),
    vl = V({}, Io, { view: 0, detail: 0 }),
    B_ = hn(vl),
    fh,
    dh,
    wl,
    cc = V({}, vl, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: ph,
      button: 0,
      buttons: 0,
      relatedTarget: function (r) {
        return r.relatedTarget === void 0
          ? r.fromElement === r.srcElement
            ? r.toElement
            : r.fromElement
          : r.relatedTarget
      },
      movementX: function (r) {
        return "movementX" in r
          ? r.movementX
          : (r !== wl &&
              (wl && r.type === "mousemove"
                ? ((fh = r.screenX - wl.screenX), (dh = r.screenY - wl.screenY))
                : (dh = fh = 0),
              (wl = r)),
            fh)
      },
      movementY: function (r) {
        return "movementY" in r ? r.movementY : dh
      },
    }),
    vv = hn(cc),
    F_ = V({}, cc, { dataTransfer: 0 }),
    U_ = hn(F_),
    z_ = V({}, vl, { relatedTarget: 0 }),
    hh = hn(z_),
    $_ = V({}, Io, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    W_ = hn($_),
    V_ = V({}, Io, {
      clipboardData: function (r) {
        return "clipboardData" in r ? r.clipboardData : window.clipboardData
      },
    }),
    H_ = hn(V_),
    G_ = V({}, Io, { data: 0 }),
    wv = hn(G_),
    K_ = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    q_ = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    Q_ = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    }
  function Y_(r) {
    var i = this.nativeEvent
    return i.getModifierState
      ? i.getModifierState(r)
      : (r = Q_[r])
        ? !!i[r]
        : !1
  }
  function ph() {
    return Y_
  }
  var X_ = V({}, vl, {
      key: function (r) {
        if (r.key) {
          var i = K_[r.key] || r.key
          if (i !== "Unidentified") return i
        }
        return r.type === "keypress"
          ? ((r = lc(r)), r === 13 ? "Enter" : String.fromCharCode(r))
          : r.type === "keydown" || r.type === "keyup"
            ? q_[r.keyCode] || "Unidentified"
            : ""
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: ph,
      charCode: function (r) {
        return r.type === "keypress" ? lc(r) : 0
      },
      keyCode: function (r) {
        return r.type === "keydown" || r.type === "keyup" ? r.keyCode : 0
      },
      which: function (r) {
        return r.type === "keypress"
          ? lc(r)
          : r.type === "keydown" || r.type === "keyup"
            ? r.keyCode
            : 0
      },
    }),
    Z_ = hn(X_),
    J_ = V({}, cc, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Sv = hn(J_),
    ek = V({}, vl, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: ph,
    }),
    tk = hn(ek),
    nk = V({}, Io, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    rk = hn(nk),
    ik = V({}, cc, {
      deltaX: function (r) {
        return "deltaX" in r
          ? r.deltaX
          : "wheelDeltaX" in r
            ? -r.wheelDeltaX
            : 0
      },
      deltaY: function (r) {
        return "deltaY" in r
          ? r.deltaY
          : "wheelDeltaY" in r
            ? -r.wheelDeltaY
            : "wheelDelta" in r
              ? -r.wheelDelta
              : 0
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    sk = hn(ik),
    ok = [9, 13, 27, 32],
    mh = f && "CompositionEvent" in window,
    Sl = null
  f && "documentMode" in document && (Sl = document.documentMode)
  var ak = f && "TextEvent" in window && !Sl,
    xv = f && (!mh || (Sl && 8 < Sl && 11 >= Sl)),
    Ev = " ",
    bv = !1
  function Cv(r, i) {
    switch (r) {
      case "keyup":
        return ok.indexOf(i.keyCode) !== -1
      case "keydown":
        return i.keyCode !== 229
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0
      default:
        return !1
    }
  }
  function _v(r) {
    return (r = r.detail), typeof r == "object" && "data" in r ? r.data : null
  }
  var Mo = !1
  function lk(r, i) {
    switch (r) {
      case "compositionend":
        return _v(i)
      case "keypress":
        return i.which !== 32 ? null : ((bv = !0), Ev)
      case "textInput":
        return (r = i.data), r === Ev && bv ? null : r
      default:
        return null
    }
  }
  function uk(r, i) {
    if (Mo)
      return r === "compositionend" || (!mh && Cv(r, i))
        ? ((r = gv()), (ac = uh = _i = null), (Mo = !1), r)
        : null
    switch (r) {
      case "paste":
        return null
      case "keypress":
        if (!(i.ctrlKey || i.altKey || i.metaKey) || (i.ctrlKey && i.altKey)) {
          if (i.char && 1 < i.char.length) return i.char
          if (i.which) return String.fromCharCode(i.which)
        }
        return null
      case "compositionend":
        return xv && i.locale !== "ko" ? null : i.data
      default:
        return null
    }
  }
  var ck = {
    "color": !0,
    "date": !0,
    "datetime": !0,
    "datetime-local": !0,
    "email": !0,
    "month": !0,
    "number": !0,
    "password": !0,
    "range": !0,
    "search": !0,
    "tel": !0,
    "text": !0,
    "time": !0,
    "url": !0,
    "week": !0,
  }
  function kv(r) {
    var i = r && r.nodeName && r.nodeName.toLowerCase()
    return i === "input" ? !!ck[r.type] : i === "textarea"
  }
  function Ov(r, i, a, c) {
    Ky(c),
      (i = mc(i, "onChange")),
      0 < i.length &&
        ((a = new ch("onChange", "change", null, a, c)),
        r.push({ event: a, listeners: i }))
  }
  var xl = null,
    El = null
  function fk(r) {
    Hv(r, 0)
  }
  function fc(r) {
    var i = Bo(r)
    if (dn(i)) return r
  }
  function dk(r, i) {
    if (r === "change") return i
  }
  var Av = !1
  if (f) {
    var gh
    if (f) {
      var yh = "oninput" in document
      if (!yh) {
        var Tv = document.createElement("div")
        Tv.setAttribute("oninput", "return;"),
          (yh = typeof Tv.oninput == "function")
      }
      gh = yh
    } else gh = !1
    Av = gh && (!document.documentMode || 9 < document.documentMode)
  }
  function Rv() {
    xl && (xl.detachEvent("onpropertychange", Pv), (El = xl = null))
  }
  function Pv(r) {
    if (r.propertyName === "value" && fc(El)) {
      var i = []
      Ov(i, El, r, Yd(r)), Xy(fk, i)
    }
  }
  function hk(r, i, a) {
    r === "focusin"
      ? (Rv(), (xl = i), (El = a), xl.attachEvent("onpropertychange", Pv))
      : r === "focusout" && Rv()
  }
  function pk(r) {
    if (r === "selectionchange" || r === "keyup" || r === "keydown")
      return fc(El)
  }
  function mk(r, i) {
    if (r === "click") return fc(i)
  }
  function gk(r, i) {
    if (r === "input" || r === "change") return fc(i)
  }
  function yk(r, i) {
    return (r === i && (r !== 0 || 1 / r === 1 / i)) || (r !== r && i !== i)
  }
  var Un = typeof Object.is == "function" ? Object.is : yk
  function bl(r, i) {
    if (Un(r, i)) return !0
    if (
      typeof r != "object" ||
      r === null ||
      typeof i != "object" ||
      i === null
    )
      return !1
    var a = Object.keys(r),
      c = Object.keys(i)
    if (a.length !== c.length) return !1
    for (c = 0; c < a.length; c++) {
      var p = a[c]
      if (!d.call(i, p) || !Un(r[p], i[p])) return !1
    }
    return !0
  }
  function Iv(r) {
    for (; r && r.firstChild; ) r = r.firstChild
    return r
  }
  function Mv(r, i) {
    var a = Iv(r)
    r = 0
    for (var c; a; ) {
      if (a.nodeType === 3) {
        if (((c = r + a.textContent.length), r <= i && c >= i))
          return { node: a, offset: i - r }
        r = c
      }
      e: {
        for (; a; ) {
          if (a.nextSibling) {
            a = a.nextSibling
            break e
          }
          a = a.parentNode
        }
        a = void 0
      }
      a = Iv(a)
    }
  }
  function Nv(r, i) {
    return r && i
      ? r === i
        ? !0
        : r && r.nodeType === 3
          ? !1
          : i && i.nodeType === 3
            ? Nv(r, i.parentNode)
            : "contains" in r
              ? r.contains(i)
              : r.compareDocumentPosition
                ? !!(r.compareDocumentPosition(i) & 16)
                : !1
      : !1
  }
  function jv() {
    for (var r = window, i = Ht(); i instanceof r.HTMLIFrameElement; ) {
      try {
        var a = typeof i.contentWindow.location.href == "string"
      } catch {
        a = !1
      }
      if (a) r = i.contentWindow
      else break
      i = Ht(r.document)
    }
    return i
  }
  function vh(r) {
    var i = r && r.nodeName && r.nodeName.toLowerCase()
    return (
      i &&
      ((i === "input" &&
        (r.type === "text" ||
          r.type === "search" ||
          r.type === "tel" ||
          r.type === "url" ||
          r.type === "password")) ||
        i === "textarea" ||
        r.contentEditable === "true")
    )
  }
  function vk(r) {
    var i = jv(),
      a = r.focusedElem,
      c = r.selectionRange
    if (
      i !== a &&
      a &&
      a.ownerDocument &&
      Nv(a.ownerDocument.documentElement, a)
    ) {
      if (c !== null && vh(a)) {
        if (
          ((i = c.start),
          (r = c.end),
          r === void 0 && (r = i),
          "selectionStart" in a)
        )
          (a.selectionStart = i), (a.selectionEnd = Math.min(r, a.value.length))
        else if (
          ((r = ((i = a.ownerDocument || document) && i.defaultView) || window),
          r.getSelection)
        ) {
          r = r.getSelection()
          var p = a.textContent.length,
            y = Math.min(c.start, p)
          ;(c = c.end === void 0 ? y : Math.min(c.end, p)),
            !r.extend && y > c && ((p = c), (c = y), (y = p)),
            (p = Mv(a, y))
          var k = Mv(a, c)
          p &&
            k &&
            (r.rangeCount !== 1 ||
              r.anchorNode !== p.node ||
              r.anchorOffset !== p.offset ||
              r.focusNode !== k.node ||
              r.focusOffset !== k.offset) &&
            ((i = i.createRange()),
            i.setStart(p.node, p.offset),
            r.removeAllRanges(),
            y > c
              ? (r.addRange(i), r.extend(k.node, k.offset))
              : (i.setEnd(k.node, k.offset), r.addRange(i)))
        }
      }
      for (i = [], r = a; (r = r.parentNode); )
        r.nodeType === 1 &&
          i.push({ element: r, left: r.scrollLeft, top: r.scrollTop })
      for (typeof a.focus == "function" && a.focus(), a = 0; a < i.length; a++)
        (r = i[a]),
          (r.element.scrollLeft = r.left),
          (r.element.scrollTop = r.top)
    }
  }
  var wk = f && "documentMode" in document && 11 >= document.documentMode,
    No = null,
    wh = null,
    Cl = null,
    Sh = !1
  function Dv(r, i, a) {
    var c = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument
    Sh ||
      No == null ||
      No !== Ht(c) ||
      ((c = No),
      "selectionStart" in c && vh(c)
        ? (c = { start: c.selectionStart, end: c.selectionEnd })
        : ((c = (
            (c.ownerDocument && c.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (c = {
            anchorNode: c.anchorNode,
            anchorOffset: c.anchorOffset,
            focusNode: c.focusNode,
            focusOffset: c.focusOffset,
          })),
      (Cl && bl(Cl, c)) ||
        ((Cl = c),
        (c = mc(wh, "onSelect")),
        0 < c.length &&
          ((i = new ch("onSelect", "select", null, i, a)),
          r.push({ event: i, listeners: c }),
          (i.target = No))))
  }
  function dc(r, i) {
    var a = {}
    return (
      (a[r.toLowerCase()] = i.toLowerCase()),
      (a["Webkit" + r] = "webkit" + i),
      (a["Moz" + r] = "moz" + i),
      a
    )
  }
  var jo = {
      animationend: dc("Animation", "AnimationEnd"),
      animationiteration: dc("Animation", "AnimationIteration"),
      animationstart: dc("Animation", "AnimationStart"),
      transitionend: dc("Transition", "TransitionEnd"),
    },
    xh = {},
    Lv = {}
  f &&
    ((Lv = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete jo.animationend.animation,
      delete jo.animationiteration.animation,
      delete jo.animationstart.animation),
    "TransitionEvent" in window || delete jo.transitionend.transition)
  function hc(r) {
    if (xh[r]) return xh[r]
    if (!jo[r]) return r
    var i = jo[r],
      a
    for (a in i) if (i.hasOwnProperty(a) && a in Lv) return (xh[r] = i[a])
    return r
  }
  var Bv = hc("animationend"),
    Fv = hc("animationiteration"),
    Uv = hc("animationstart"),
    zv = hc("transitionend"),
    $v = new Map(),
    Wv =
      "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      )
  function ki(r, i) {
    $v.set(r, i), l(i, [r])
  }
  for (var Eh = 0; Eh < Wv.length; Eh++) {
    var bh = Wv[Eh],
      Sk = bh.toLowerCase(),
      xk = bh[0].toUpperCase() + bh.slice(1)
    ki(Sk, "on" + xk)
  }
  ki(Bv, "onAnimationEnd"),
    ki(Fv, "onAnimationIteration"),
    ki(Uv, "onAnimationStart"),
    ki("dblclick", "onDoubleClick"),
    ki("focusin", "onFocus"),
    ki("focusout", "onBlur"),
    ki(zv, "onTransitionEnd"),
    u("onMouseEnter", ["mouseout", "mouseover"]),
    u("onMouseLeave", ["mouseout", "mouseover"]),
    u("onPointerEnter", ["pointerout", "pointerover"]),
    u("onPointerLeave", ["pointerout", "pointerover"]),
    l(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    ),
    l(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    l("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    l(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    ),
    l(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    l(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    )
  var _l =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    Ek = new Set(
      "cancel close invalid load scroll toggle".split(" ").concat(_l),
    )
  function Vv(r, i, a) {
    var c = r.type || "unknown-event"
    ;(r.currentTarget = a), S_(c, i, void 0, r), (r.currentTarget = null)
  }
  function Hv(r, i) {
    i = (i & 4) !== 0
    for (var a = 0; a < r.length; a++) {
      var c = r[a],
        p = c.event
      c = c.listeners
      e: {
        var y = void 0
        if (i)
          for (var k = c.length - 1; 0 <= k; k--) {
            var R = c[k],
              N = R.instance,
              z = R.currentTarget
            if (((R = R.listener), N !== y && p.isPropagationStopped())) break e
            Vv(p, R, z), (y = N)
          }
        else
          for (k = 0; k < c.length; k++) {
            if (
              ((R = c[k]),
              (N = R.instance),
              (z = R.currentTarget),
              (R = R.listener),
              N !== y && p.isPropagationStopped())
            )
              break e
            Vv(p, R, z), (y = N)
          }
      }
    }
    if (Xu) throw ((r = eh), (Xu = !1), (eh = null), r)
  }
  function qe(r, i) {
    var a = i[Ph]
    a === void 0 && (a = i[Ph] = new Set())
    var c = r + "__bubble"
    a.has(c) || (Gv(i, r, 2, !1), a.add(c))
  }
  function Ch(r, i, a) {
    var c = 0
    i && (c |= 4), Gv(a, r, c, i)
  }
  var pc = "_reactListening" + Math.random().toString(36).slice(2)
  function kl(r) {
    if (!r[pc]) {
      ;(r[pc] = !0),
        s.forEach(function (a) {
          a !== "selectionchange" && (Ek.has(a) || Ch(a, !1, r), Ch(a, !0, r))
        })
      var i = r.nodeType === 9 ? r : r.ownerDocument
      i === null || i[pc] || ((i[pc] = !0), Ch("selectionchange", !1, i))
    }
  }
  function Gv(r, i, a, c) {
    switch (mv(i)) {
      case 1:
        var p = D_
        break
      case 4:
        p = L_
        break
      default:
        p = ah
    }
    ;(a = p.bind(null, i, a, r)),
      (p = void 0),
      !Jd ||
        (i !== "touchstart" && i !== "touchmove" && i !== "wheel") ||
        (p = !0),
      c
        ? p !== void 0
          ? r.addEventListener(i, a, { capture: !0, passive: p })
          : r.addEventListener(i, a, !0)
        : p !== void 0
          ? r.addEventListener(i, a, { passive: p })
          : r.addEventListener(i, a, !1)
  }
  function _h(r, i, a, c, p) {
    var y = c
    if ((i & 1) === 0 && (i & 2) === 0 && c !== null)
      e: for (;;) {
        if (c === null) return
        var k = c.tag
        if (k === 3 || k === 4) {
          var R = c.stateNode.containerInfo
          if (R === p || (R.nodeType === 8 && R.parentNode === p)) break
          if (k === 4)
            for (k = c.return; k !== null; ) {
              var N = k.tag
              if (
                (N === 3 || N === 4) &&
                ((N = k.stateNode.containerInfo),
                N === p || (N.nodeType === 8 && N.parentNode === p))
              )
                return
              k = k.return
            }
          for (; R !== null; ) {
            if (((k = xs(R)), k === null)) return
            if (((N = k.tag), N === 5 || N === 6)) {
              c = y = k
              continue e
            }
            R = R.parentNode
          }
        }
        c = c.return
      }
    Xy(function () {
      var z = y,
        X = Yd(a),
        J = []
      e: {
        var Y = $v.get(r)
        if (Y !== void 0) {
          var ae = ch,
            fe = r
          switch (r) {
            case "keypress":
              if (lc(a) === 0) break e
            case "keydown":
            case "keyup":
              ae = Z_
              break
            case "focusin":
              ;(fe = "focus"), (ae = hh)
              break
            case "focusout":
              ;(fe = "blur"), (ae = hh)
              break
            case "beforeblur":
            case "afterblur":
              ae = hh
              break
            case "click":
              if (a.button === 2) break e
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              ae = vv
              break
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              ae = U_
              break
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              ae = tk
              break
            case Bv:
            case Fv:
            case Uv:
              ae = W_
              break
            case zv:
              ae = rk
              break
            case "scroll":
              ae = B_
              break
            case "wheel":
              ae = sk
              break
            case "copy":
            case "cut":
            case "paste":
              ae = H_
              break
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              ae = Sv
          }
          var de = (i & 4) !== 0,
            pt = !de && r === "scroll",
            L = de ? (Y !== null ? Y + "Capture" : null) : Y
          de = []
          for (var j = z, F; j !== null; ) {
            F = j
            var ee = F.stateNode
            if (
              (F.tag === 5 &&
                ee !== null &&
                ((F = ee),
                L !== null &&
                  ((ee = ll(j, L)), ee != null && de.push(Ol(j, ee, F)))),
              pt)
            )
              break
            j = j.return
          }
          0 < de.length &&
            ((Y = new ae(Y, fe, null, a, X)),
            J.push({ event: Y, listeners: de }))
        }
      }
      if ((i & 7) === 0) {
        e: {
          if (
            ((Y = r === "mouseover" || r === "pointerover"),
            (ae = r === "mouseout" || r === "pointerout"),
            Y &&
              a !== Qd &&
              (fe = a.relatedTarget || a.fromElement) &&
              (xs(fe) || fe[Ur]))
          )
            break e
          if (
            (ae || Y) &&
            ((Y =
              X.window === X
                ? X
                : (Y = X.ownerDocument)
                  ? Y.defaultView || Y.parentWindow
                  : window),
            ae
              ? ((fe = a.relatedTarget || a.toElement),
                (ae = z),
                (fe = fe ? xs(fe) : null),
                fe !== null &&
                  ((pt = Ss(fe)),
                  fe !== pt || (fe.tag !== 5 && fe.tag !== 6)) &&
                  (fe = null))
              : ((ae = null), (fe = z)),
            ae !== fe)
          ) {
            if (
              ((de = vv),
              (ee = "onMouseLeave"),
              (L = "onMouseEnter"),
              (j = "mouse"),
              (r === "pointerout" || r === "pointerover") &&
                ((de = Sv),
                (ee = "onPointerLeave"),
                (L = "onPointerEnter"),
                (j = "pointer")),
              (pt = ae == null ? Y : Bo(ae)),
              (F = fe == null ? Y : Bo(fe)),
              (Y = new de(ee, j + "leave", ae, a, X)),
              (Y.target = pt),
              (Y.relatedTarget = F),
              (ee = null),
              xs(X) === z &&
                ((de = new de(L, j + "enter", fe, a, X)),
                (de.target = F),
                (de.relatedTarget = pt),
                (ee = de)),
              (pt = ee),
              ae && fe)
            )
              t: {
                for (de = ae, L = fe, j = 0, F = de; F; F = Do(F)) j++
                for (F = 0, ee = L; ee; ee = Do(ee)) F++
                for (; 0 < j - F; ) (de = Do(de)), j--
                for (; 0 < F - j; ) (L = Do(L)), F--
                for (; j--; ) {
                  if (de === L || (L !== null && de === L.alternate)) break t
                  ;(de = Do(de)), (L = Do(L))
                }
                de = null
              }
            else de = null
            ae !== null && Kv(J, Y, ae, de, !1),
              fe !== null && pt !== null && Kv(J, pt, fe, de, !0)
          }
        }
        e: {
          if (
            ((Y = z ? Bo(z) : window),
            (ae = Y.nodeName && Y.nodeName.toLowerCase()),
            ae === "select" || (ae === "input" && Y.type === "file"))
          )
            var pe = dk
          else if (kv(Y))
            if (Av) pe = gk
            else {
              pe = pk
              var ve = hk
            }
          else
            (ae = Y.nodeName) &&
              ae.toLowerCase() === "input" &&
              (Y.type === "checkbox" || Y.type === "radio") &&
              (pe = mk)
          if (pe && (pe = pe(r, z))) {
            Ov(J, pe, a, X)
            break e
          }
          ve && ve(r, Y, z),
            r === "focusout" &&
              (ve = Y._wrapperState) &&
              ve.controlled &&
              Y.type === "number" &&
              mr(Y, "number", Y.value)
        }
        switch (((ve = z ? Bo(z) : window), r)) {
          case "focusin":
            ;(kv(ve) || ve.contentEditable === "true") &&
              ((No = ve), (wh = z), (Cl = null))
            break
          case "focusout":
            Cl = wh = No = null
            break
          case "mousedown":
            Sh = !0
            break
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ;(Sh = !1), Dv(J, a, X)
            break
          case "selectionchange":
            if (wk) break
          case "keydown":
          case "keyup":
            Dv(J, a, X)
        }
        var we
        if (mh)
          e: {
            switch (r) {
              case "compositionstart":
                var _e = "onCompositionStart"
                break e
              case "compositionend":
                _e = "onCompositionEnd"
                break e
              case "compositionupdate":
                _e = "onCompositionUpdate"
                break e
            }
            _e = void 0
          }
        else
          Mo
            ? Cv(r, a) && (_e = "onCompositionEnd")
            : r === "keydown" &&
              a.keyCode === 229 &&
              (_e = "onCompositionStart")
        _e &&
          (xv &&
            a.locale !== "ko" &&
            (Mo || _e !== "onCompositionStart"
              ? _e === "onCompositionEnd" && Mo && (we = gv())
              : ((_i = X),
                (uh = "value" in _i ? _i.value : _i.textContent),
                (Mo = !0))),
          (ve = mc(z, _e)),
          0 < ve.length &&
            ((_e = new wv(_e, r, null, a, X)),
            J.push({ event: _e, listeners: ve }),
            we
              ? (_e.data = we)
              : ((we = _v(a)), we !== null && (_e.data = we)))),
          (we = ak ? lk(r, a) : uk(r, a)) &&
            ((z = mc(z, "onBeforeInput")),
            0 < z.length &&
              ((X = new wv("onBeforeInput", "beforeinput", null, a, X)),
              J.push({ event: X, listeners: z }),
              (X.data = we)))
      }
      Hv(J, i)
    })
  }
  function Ol(r, i, a) {
    return { instance: r, listener: i, currentTarget: a }
  }
  function mc(r, i) {
    for (var a = i + "Capture", c = []; r !== null; ) {
      var p = r,
        y = p.stateNode
      p.tag === 5 &&
        y !== null &&
        ((p = y),
        (y = ll(r, a)),
        y != null && c.unshift(Ol(r, y, p)),
        (y = ll(r, i)),
        y != null && c.push(Ol(r, y, p))),
        (r = r.return)
    }
    return c
  }
  function Do(r) {
    if (r === null) return null
    do r = r.return
    while (r && r.tag !== 5)
    return r || null
  }
  function Kv(r, i, a, c, p) {
    for (var y = i._reactName, k = []; a !== null && a !== c; ) {
      var R = a,
        N = R.alternate,
        z = R.stateNode
      if (N !== null && N === c) break
      R.tag === 5 &&
        z !== null &&
        ((R = z),
        p
          ? ((N = ll(a, y)), N != null && k.unshift(Ol(a, N, R)))
          : p || ((N = ll(a, y)), N != null && k.push(Ol(a, N, R)))),
        (a = a.return)
    }
    k.length !== 0 && r.push({ event: i, listeners: k })
  }
  var bk = /\r\n?/g,
    Ck = /\u0000|\uFFFD/g
  function qv(r) {
    return (typeof r == "string" ? r : "" + r)
      .replace(
        bk,
        `
`,
      )
      .replace(Ck, "")
  }
  function gc(r, i, a) {
    if (((i = qv(i)), qv(r) !== i && a)) throw Error(n(425))
  }
  function yc() {}
  var kh = null,
    Oh = null
  function Ah(r, i) {
    return (
      r === "textarea" ||
      r === "noscript" ||
      typeof i.children == "string" ||
      typeof i.children == "number" ||
      (typeof i.dangerouslySetInnerHTML == "object" &&
        i.dangerouslySetInnerHTML !== null &&
        i.dangerouslySetInnerHTML.__html != null)
    )
  }
  var Th = typeof setTimeout == "function" ? setTimeout : void 0,
    _k = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Qv = typeof Promise == "function" ? Promise : void 0,
    kk =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Qv < "u"
          ? function (r) {
              return Qv.resolve(null).then(r).catch(Ok)
            }
          : Th
  function Ok(r) {
    setTimeout(function () {
      throw r
    })
  }
  function Rh(r, i) {
    var a = i,
      c = 0
    do {
      var p = a.nextSibling
      if ((r.removeChild(a), p && p.nodeType === 8))
        if (((a = p.data), a === "/$")) {
          if (c === 0) {
            r.removeChild(p), yl(i)
            return
          }
          c--
        } else (a !== "$" && a !== "$?" && a !== "$!") || c++
      a = p
    } while (a)
    yl(i)
  }
  function Oi(r) {
    for (; r != null; r = r.nextSibling) {
      var i = r.nodeType
      if (i === 1 || i === 3) break
      if (i === 8) {
        if (((i = r.data), i === "$" || i === "$!" || i === "$?")) break
        if (i === "/$") return null
      }
    }
    return r
  }
  function Yv(r) {
    r = r.previousSibling
    for (var i = 0; r; ) {
      if (r.nodeType === 8) {
        var a = r.data
        if (a === "$" || a === "$!" || a === "$?") {
          if (i === 0) return r
          i--
        } else a === "/$" && i++
      }
      r = r.previousSibling
    }
    return null
  }
  var Lo = Math.random().toString(36).slice(2),
    yr = "__reactFiber$" + Lo,
    Al = "__reactProps$" + Lo,
    Ur = "__reactContainer$" + Lo,
    Ph = "__reactEvents$" + Lo,
    Ak = "__reactListeners$" + Lo,
    Tk = "__reactHandles$" + Lo
  function xs(r) {
    var i = r[yr]
    if (i) return i
    for (var a = r.parentNode; a; ) {
      if ((i = a[Ur] || a[yr])) {
        if (
          ((a = i.alternate),
          i.child !== null || (a !== null && a.child !== null))
        )
          for (r = Yv(r); r !== null; ) {
            if ((a = r[yr])) return a
            r = Yv(r)
          }
        return i
      }
      ;(r = a), (a = r.parentNode)
    }
    return null
  }
  function Tl(r) {
    return (
      (r = r[yr] || r[Ur]),
      !r || (r.tag !== 5 && r.tag !== 6 && r.tag !== 13 && r.tag !== 3)
        ? null
        : r
    )
  }
  function Bo(r) {
    if (r.tag === 5 || r.tag === 6) return r.stateNode
    throw Error(n(33))
  }
  function vc(r) {
    return r[Al] || null
  }
  var Ih = [],
    Fo = -1
  function Ai(r) {
    return { current: r }
  }
  function Qe(r) {
    0 > Fo || ((r.current = Ih[Fo]), (Ih[Fo] = null), Fo--)
  }
  function Ge(r, i) {
    Fo++, (Ih[Fo] = r.current), (r.current = i)
  }
  var Ti = {},
    Lt = Ai(Ti),
    Jt = Ai(!1),
    Es = Ti
  function Uo(r, i) {
    var a = r.type.contextTypes
    if (!a) return Ti
    var c = r.stateNode
    if (c && c.__reactInternalMemoizedUnmaskedChildContext === i)
      return c.__reactInternalMemoizedMaskedChildContext
    var p = {},
      y
    for (y in a) p[y] = i[y]
    return (
      c &&
        ((r = r.stateNode),
        (r.__reactInternalMemoizedUnmaskedChildContext = i),
        (r.__reactInternalMemoizedMaskedChildContext = p)),
      p
    )
  }
  function en(r) {
    return (r = r.childContextTypes), r != null
  }
  function wc() {
    Qe(Jt), Qe(Lt)
  }
  function Xv(r, i, a) {
    if (Lt.current !== Ti) throw Error(n(168))
    Ge(Lt, i), Ge(Jt, a)
  }
  function Zv(r, i, a) {
    var c = r.stateNode
    if (((i = i.childContextTypes), typeof c.getChildContext != "function"))
      return a
    c = c.getChildContext()
    for (var p in c) if (!(p in i)) throw Error(n(108, Se(r) || "Unknown", p))
    return V({}, a, c)
  }
  function Sc(r) {
    return (
      (r =
        ((r = r.stateNode) && r.__reactInternalMemoizedMergedChildContext) ||
        Ti),
      (Es = Lt.current),
      Ge(Lt, r),
      Ge(Jt, Jt.current),
      !0
    )
  }
  function Jv(r, i, a) {
    var c = r.stateNode
    if (!c) throw Error(n(169))
    a
      ? ((r = Zv(r, i, Es)),
        (c.__reactInternalMemoizedMergedChildContext = r),
        Qe(Jt),
        Qe(Lt),
        Ge(Lt, r))
      : Qe(Jt),
      Ge(Jt, a)
  }
  var zr = null,
    xc = !1,
    Mh = !1
  function ew(r) {
    zr === null ? (zr = [r]) : zr.push(r)
  }
  function Rk(r) {
    ;(xc = !0), ew(r)
  }
  function Ri() {
    if (!Mh && zr !== null) {
      Mh = !0
      var r = 0,
        i = Ve
      try {
        var a = zr
        for (Ve = 1; r < a.length; r++) {
          var c = a[r]
          do c = c(!0)
          while (c !== null)
        }
        ;(zr = null), (xc = !1)
      } catch (p) {
        throw (zr !== null && (zr = zr.slice(r + 1)), nv(th, Ri), p)
      } finally {
        ;(Ve = i), (Mh = !1)
      }
    }
    return null
  }
  var zo = [],
    $o = 0,
    Ec = null,
    bc = 0,
    _n = [],
    kn = 0,
    bs = null,
    $r = 1,
    Wr = ""
  function Cs(r, i) {
    ;(zo[$o++] = bc), (zo[$o++] = Ec), (Ec = r), (bc = i)
  }
  function tw(r, i, a) {
    ;(_n[kn++] = $r), (_n[kn++] = Wr), (_n[kn++] = bs), (bs = r)
    var c = $r
    r = Wr
    var p = 32 - Fn(c) - 1
    ;(c &= ~(1 << p)), (a += 1)
    var y = 32 - Fn(i) + p
    if (30 < y) {
      var k = p - (p % 5)
      ;(y = (c & ((1 << k) - 1)).toString(32)),
        (c >>= k),
        (p -= k),
        ($r = (1 << (32 - Fn(i) + p)) | (a << p) | c),
        (Wr = y + r)
    } else ($r = (1 << y) | (a << p) | c), (Wr = r)
  }
  function Nh(r) {
    r.return !== null && (Cs(r, 1), tw(r, 1, 0))
  }
  function jh(r) {
    for (; r === Ec; )
      (Ec = zo[--$o]), (zo[$o] = null), (bc = zo[--$o]), (zo[$o] = null)
    for (; r === bs; )
      (bs = _n[--kn]),
        (_n[kn] = null),
        (Wr = _n[--kn]),
        (_n[kn] = null),
        ($r = _n[--kn]),
        (_n[kn] = null)
  }
  var pn = null,
    mn = null,
    Je = !1,
    zn = null
  function nw(r, i) {
    var a = Rn(5, null, null, 0)
    ;(a.elementType = "DELETED"),
      (a.stateNode = i),
      (a.return = r),
      (i = r.deletions),
      i === null ? ((r.deletions = [a]), (r.flags |= 16)) : i.push(a)
  }
  function rw(r, i) {
    switch (r.tag) {
      case 5:
        var a = r.type
        return (
          (i =
            i.nodeType !== 1 || a.toLowerCase() !== i.nodeName.toLowerCase()
              ? null
              : i),
          i !== null
            ? ((r.stateNode = i), (pn = r), (mn = Oi(i.firstChild)), !0)
            : !1
        )
      case 6:
        return (
          (i = r.pendingProps === "" || i.nodeType !== 3 ? null : i),
          i !== null ? ((r.stateNode = i), (pn = r), (mn = null), !0) : !1
        )
      case 13:
        return (
          (i = i.nodeType !== 8 ? null : i),
          i !== null
            ? ((a = bs !== null ? { id: $r, overflow: Wr } : null),
              (r.memoizedState = {
                dehydrated: i,
                treeContext: a,
                retryLane: 1073741824,
              }),
              (a = Rn(18, null, null, 0)),
              (a.stateNode = i),
              (a.return = r),
              (r.child = a),
              (pn = r),
              (mn = null),
              !0)
            : !1
        )
      default:
        return !1
    }
  }
  function Dh(r) {
    return (r.mode & 1) !== 0 && (r.flags & 128) === 0
  }
  function Lh(r) {
    if (Je) {
      var i = mn
      if (i) {
        var a = i
        if (!rw(r, i)) {
          if (Dh(r)) throw Error(n(418))
          i = Oi(a.nextSibling)
          var c = pn
          i && rw(r, i)
            ? nw(c, a)
            : ((r.flags = (r.flags & -4097) | 2), (Je = !1), (pn = r))
        }
      } else {
        if (Dh(r)) throw Error(n(418))
        ;(r.flags = (r.flags & -4097) | 2), (Je = !1), (pn = r)
      }
    }
  }
  function iw(r) {
    for (
      r = r.return;
      r !== null && r.tag !== 5 && r.tag !== 3 && r.tag !== 13;

    )
      r = r.return
    pn = r
  }
  function Cc(r) {
    if (r !== pn) return !1
    if (!Je) return iw(r), (Je = !0), !1
    var i
    if (
      ((i = r.tag !== 3) &&
        !(i = r.tag !== 5) &&
        ((i = r.type),
        (i = i !== "head" && i !== "body" && !Ah(r.type, r.memoizedProps))),
      i && (i = mn))
    ) {
      if (Dh(r)) throw (sw(), Error(n(418)))
      for (; i; ) nw(r, i), (i = Oi(i.nextSibling))
    }
    if ((iw(r), r.tag === 13)) {
      if (((r = r.memoizedState), (r = r !== null ? r.dehydrated : null), !r))
        throw Error(n(317))
      e: {
        for (r = r.nextSibling, i = 0; r; ) {
          if (r.nodeType === 8) {
            var a = r.data
            if (a === "/$") {
              if (i === 0) {
                mn = Oi(r.nextSibling)
                break e
              }
              i--
            } else (a !== "$" && a !== "$!" && a !== "$?") || i++
          }
          r = r.nextSibling
        }
        mn = null
      }
    } else mn = pn ? Oi(r.stateNode.nextSibling) : null
    return !0
  }
  function sw() {
    for (var r = mn; r; ) r = Oi(r.nextSibling)
  }
  function Wo() {
    ;(mn = pn = null), (Je = !1)
  }
  function Bh(r) {
    zn === null ? (zn = [r]) : zn.push(r)
  }
  var Pk = M.ReactCurrentBatchConfig
  function Rl(r, i, a) {
    if (
      ((r = a.ref),
      r !== null && typeof r != "function" && typeof r != "object")
    ) {
      if (a._owner) {
        if (((a = a._owner), a)) {
          if (a.tag !== 1) throw Error(n(309))
          var c = a.stateNode
        }
        if (!c) throw Error(n(147, r))
        var p = c,
          y = "" + r
        return i !== null &&
          i.ref !== null &&
          typeof i.ref == "function" &&
          i.ref._stringRef === y
          ? i.ref
          : ((i = function (k) {
              var R = p.refs
              k === null ? delete R[y] : (R[y] = k)
            }),
            (i._stringRef = y),
            i)
      }
      if (typeof r != "string") throw Error(n(284))
      if (!a._owner) throw Error(n(290, r))
    }
    return r
  }
  function _c(r, i) {
    throw (
      ((r = Object.prototype.toString.call(i)),
      Error(
        n(
          31,
          r === "[object Object]"
            ? "object with keys {" + Object.keys(i).join(", ") + "}"
            : r,
        ),
      ))
    )
  }
  function ow(r) {
    var i = r._init
    return i(r._payload)
  }
  function aw(r) {
    function i(L, j) {
      if (r) {
        var F = L.deletions
        F === null ? ((L.deletions = [j]), (L.flags |= 16)) : F.push(j)
      }
    }
    function a(L, j) {
      if (!r) return null
      for (; j !== null; ) i(L, j), (j = j.sibling)
      return null
    }
    function c(L, j) {
      for (L = new Map(); j !== null; )
        j.key !== null ? L.set(j.key, j) : L.set(j.index, j), (j = j.sibling)
      return L
    }
    function p(L, j) {
      return (L = Bi(L, j)), (L.index = 0), (L.sibling = null), L
    }
    function y(L, j, F) {
      return (
        (L.index = F),
        r
          ? ((F = L.alternate),
            F !== null
              ? ((F = F.index), F < j ? ((L.flags |= 2), j) : F)
              : ((L.flags |= 2), j))
          : ((L.flags |= 1048576), j)
      )
    }
    function k(L) {
      return r && L.alternate === null && (L.flags |= 2), L
    }
    function R(L, j, F, ee) {
      return j === null || j.tag !== 6
        ? ((j = Tp(F, L.mode, ee)), (j.return = L), j)
        : ((j = p(j, F)), (j.return = L), j)
    }
    function N(L, j, F, ee) {
      var pe = F.type
      return pe === W
        ? X(L, j, F.props.children, ee, F.key)
        : j !== null &&
            (j.elementType === pe ||
              (typeof pe == "object" &&
                pe !== null &&
                pe.$$typeof === te &&
                ow(pe) === j.type))
          ? ((ee = p(j, F.props)), (ee.ref = Rl(L, j, F)), (ee.return = L), ee)
          : ((ee = Qc(F.type, F.key, F.props, null, L.mode, ee)),
            (ee.ref = Rl(L, j, F)),
            (ee.return = L),
            ee)
    }
    function z(L, j, F, ee) {
      return j === null ||
        j.tag !== 4 ||
        j.stateNode.containerInfo !== F.containerInfo ||
        j.stateNode.implementation !== F.implementation
        ? ((j = Rp(F, L.mode, ee)), (j.return = L), j)
        : ((j = p(j, F.children || [])), (j.return = L), j)
    }
    function X(L, j, F, ee, pe) {
      return j === null || j.tag !== 7
        ? ((j = Is(F, L.mode, ee, pe)), (j.return = L), j)
        : ((j = p(j, F)), (j.return = L), j)
    }
    function J(L, j, F) {
      if ((typeof j == "string" && j !== "") || typeof j == "number")
        return (j = Tp("" + j, L.mode, F)), (j.return = L), j
      if (typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case D:
            return (
              (F = Qc(j.type, j.key, j.props, null, L.mode, F)),
              (F.ref = Rl(L, null, j)),
              (F.return = L),
              F
            )
          case K:
            return (j = Rp(j, L.mode, F)), (j.return = L), j
          case te:
            var ee = j._init
            return J(L, ee(j._payload), F)
        }
        if (Si(j) || U(j))
          return (j = Is(j, L.mode, F, null)), (j.return = L), j
        _c(L, j)
      }
      return null
    }
    function Y(L, j, F, ee) {
      var pe = j !== null ? j.key : null
      if ((typeof F == "string" && F !== "") || typeof F == "number")
        return pe !== null ? null : R(L, j, "" + F, ee)
      if (typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case D:
            return F.key === pe ? N(L, j, F, ee) : null
          case K:
            return F.key === pe ? z(L, j, F, ee) : null
          case te:
            return (pe = F._init), Y(L, j, pe(F._payload), ee)
        }
        if (Si(F) || U(F)) return pe !== null ? null : X(L, j, F, ee, null)
        _c(L, F)
      }
      return null
    }
    function ae(L, j, F, ee, pe) {
      if ((typeof ee == "string" && ee !== "") || typeof ee == "number")
        return (L = L.get(F) || null), R(j, L, "" + ee, pe)
      if (typeof ee == "object" && ee !== null) {
        switch (ee.$$typeof) {
          case D:
            return (
              (L = L.get(ee.key === null ? F : ee.key) || null), N(j, L, ee, pe)
            )
          case K:
            return (
              (L = L.get(ee.key === null ? F : ee.key) || null), z(j, L, ee, pe)
            )
          case te:
            var ve = ee._init
            return ae(L, j, F, ve(ee._payload), pe)
        }
        if (Si(ee) || U(ee))
          return (L = L.get(F) || null), X(j, L, ee, pe, null)
        _c(j, ee)
      }
      return null
    }
    function fe(L, j, F, ee) {
      for (
        var pe = null, ve = null, we = j, _e = (j = 0), Ot = null;
        we !== null && _e < F.length;
        _e++
      ) {
        we.index > _e ? ((Ot = we), (we = null)) : (Ot = we.sibling)
        var Fe = Y(L, we, F[_e], ee)
        if (Fe === null) {
          we === null && (we = Ot)
          break
        }
        r && we && Fe.alternate === null && i(L, we),
          (j = y(Fe, j, _e)),
          ve === null ? (pe = Fe) : (ve.sibling = Fe),
          (ve = Fe),
          (we = Ot)
      }
      if (_e === F.length) return a(L, we), Je && Cs(L, _e), pe
      if (we === null) {
        for (; _e < F.length; _e++)
          (we = J(L, F[_e], ee)),
            we !== null &&
              ((j = y(we, j, _e)),
              ve === null ? (pe = we) : (ve.sibling = we),
              (ve = we))
        return Je && Cs(L, _e), pe
      }
      for (we = c(L, we); _e < F.length; _e++)
        (Ot = ae(we, L, _e, F[_e], ee)),
          Ot !== null &&
            (r &&
              Ot.alternate !== null &&
              we.delete(Ot.key === null ? _e : Ot.key),
            (j = y(Ot, j, _e)),
            ve === null ? (pe = Ot) : (ve.sibling = Ot),
            (ve = Ot))
      return (
        r &&
          we.forEach(function (Fi) {
            return i(L, Fi)
          }),
        Je && Cs(L, _e),
        pe
      )
    }
    function de(L, j, F, ee) {
      var pe = U(F)
      if (typeof pe != "function") throw Error(n(150))
      if (((F = pe.call(F)), F == null)) throw Error(n(151))
      for (
        var ve = (pe = null), we = j, _e = (j = 0), Ot = null, Fe = F.next();
        we !== null && !Fe.done;
        _e++, Fe = F.next()
      ) {
        we.index > _e ? ((Ot = we), (we = null)) : (Ot = we.sibling)
        var Fi = Y(L, we, Fe.value, ee)
        if (Fi === null) {
          we === null && (we = Ot)
          break
        }
        r && we && Fi.alternate === null && i(L, we),
          (j = y(Fi, j, _e)),
          ve === null ? (pe = Fi) : (ve.sibling = Fi),
          (ve = Fi),
          (we = Ot)
      }
      if (Fe.done) return a(L, we), Je && Cs(L, _e), pe
      if (we === null) {
        for (; !Fe.done; _e++, Fe = F.next())
          (Fe = J(L, Fe.value, ee)),
            Fe !== null &&
              ((j = y(Fe, j, _e)),
              ve === null ? (pe = Fe) : (ve.sibling = Fe),
              (ve = Fe))
        return Je && Cs(L, _e), pe
      }
      for (we = c(L, we); !Fe.done; _e++, Fe = F.next())
        (Fe = ae(we, L, _e, Fe.value, ee)),
          Fe !== null &&
            (r &&
              Fe.alternate !== null &&
              we.delete(Fe.key === null ? _e : Fe.key),
            (j = y(Fe, j, _e)),
            ve === null ? (pe = Fe) : (ve.sibling = Fe),
            (ve = Fe))
      return (
        r &&
          we.forEach(function (c2) {
            return i(L, c2)
          }),
        Je && Cs(L, _e),
        pe
      )
    }
    function pt(L, j, F, ee) {
      if (
        (typeof F == "object" &&
          F !== null &&
          F.type === W &&
          F.key === null &&
          (F = F.props.children),
        typeof F == "object" && F !== null)
      ) {
        switch (F.$$typeof) {
          case D:
            e: {
              for (var pe = F.key, ve = j; ve !== null; ) {
                if (ve.key === pe) {
                  if (((pe = F.type), pe === W)) {
                    if (ve.tag === 7) {
                      a(L, ve.sibling),
                        (j = p(ve, F.props.children)),
                        (j.return = L),
                        (L = j)
                      break e
                    }
                  } else if (
                    ve.elementType === pe ||
                    (typeof pe == "object" &&
                      pe !== null &&
                      pe.$$typeof === te &&
                      ow(pe) === ve.type)
                  ) {
                    a(L, ve.sibling),
                      (j = p(ve, F.props)),
                      (j.ref = Rl(L, ve, F)),
                      (j.return = L),
                      (L = j)
                    break e
                  }
                  a(L, ve)
                  break
                } else i(L, ve)
                ve = ve.sibling
              }
              F.type === W
                ? ((j = Is(F.props.children, L.mode, ee, F.key)),
                  (j.return = L),
                  (L = j))
                : ((ee = Qc(F.type, F.key, F.props, null, L.mode, ee)),
                  (ee.ref = Rl(L, j, F)),
                  (ee.return = L),
                  (L = ee))
            }
            return k(L)
          case K:
            e: {
              for (ve = F.key; j !== null; ) {
                if (j.key === ve)
                  if (
                    j.tag === 4 &&
                    j.stateNode.containerInfo === F.containerInfo &&
                    j.stateNode.implementation === F.implementation
                  ) {
                    a(L, j.sibling),
                      (j = p(j, F.children || [])),
                      (j.return = L),
                      (L = j)
                    break e
                  } else {
                    a(L, j)
                    break
                  }
                else i(L, j)
                j = j.sibling
              }
              ;(j = Rp(F, L.mode, ee)), (j.return = L), (L = j)
            }
            return k(L)
          case te:
            return (ve = F._init), pt(L, j, ve(F._payload), ee)
        }
        if (Si(F)) return fe(L, j, F, ee)
        if (U(F)) return de(L, j, F, ee)
        _c(L, F)
      }
      return (typeof F == "string" && F !== "") || typeof F == "number"
        ? ((F = "" + F),
          j !== null && j.tag === 6
            ? (a(L, j.sibling), (j = p(j, F)), (j.return = L), (L = j))
            : (a(L, j), (j = Tp(F, L.mode, ee)), (j.return = L), (L = j)),
          k(L))
        : a(L, j)
    }
    return pt
  }
  var Vo = aw(!0),
    lw = aw(!1),
    kc = Ai(null),
    Oc = null,
    Ho = null,
    Fh = null
  function Uh() {
    Fh = Ho = Oc = null
  }
  function zh(r) {
    var i = kc.current
    Qe(kc), (r._currentValue = i)
  }
  function $h(r, i, a) {
    for (; r !== null; ) {
      var c = r.alternate
      if (
        ((r.childLanes & i) !== i
          ? ((r.childLanes |= i), c !== null && (c.childLanes |= i))
          : c !== null && (c.childLanes & i) !== i && (c.childLanes |= i),
        r === a)
      )
        break
      r = r.return
    }
  }
  function Go(r, i) {
    ;(Oc = r),
      (Fh = Ho = null),
      (r = r.dependencies),
      r !== null &&
        r.firstContext !== null &&
        ((r.lanes & i) !== 0 && (tn = !0), (r.firstContext = null))
  }
  function On(r) {
    var i = r._currentValue
    if (Fh !== r)
      if (((r = { context: r, memoizedValue: i, next: null }), Ho === null)) {
        if (Oc === null) throw Error(n(308))
        ;(Ho = r), (Oc.dependencies = { lanes: 0, firstContext: r })
      } else Ho = Ho.next = r
    return i
  }
  var _s = null
  function Wh(r) {
    _s === null ? (_s = [r]) : _s.push(r)
  }
  function uw(r, i, a, c) {
    var p = i.interleaved
    return (
      p === null ? ((a.next = a), Wh(i)) : ((a.next = p.next), (p.next = a)),
      (i.interleaved = a),
      Vr(r, c)
    )
  }
  function Vr(r, i) {
    r.lanes |= i
    var a = r.alternate
    for (a !== null && (a.lanes |= i), a = r, r = r.return; r !== null; )
      (r.childLanes |= i),
        (a = r.alternate),
        a !== null && (a.childLanes |= i),
        (a = r),
        (r = r.return)
    return a.tag === 3 ? a.stateNode : null
  }
  var Pi = !1
  function Vh(r) {
    r.updateQueue = {
      baseState: r.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, interleaved: null, lanes: 0 },
      effects: null,
    }
  }
  function cw(r, i) {
    ;(r = r.updateQueue),
      i.updateQueue === r &&
        (i.updateQueue = {
          baseState: r.baseState,
          firstBaseUpdate: r.firstBaseUpdate,
          lastBaseUpdate: r.lastBaseUpdate,
          shared: r.shared,
          effects: r.effects,
        })
  }
  function Hr(r, i) {
    return {
      eventTime: r,
      lane: i,
      tag: 0,
      payload: null,
      callback: null,
      next: null,
    }
  }
  function Ii(r, i, a) {
    var c = r.updateQueue
    if (c === null) return null
    if (((c = c.shared), (De & 2) !== 0)) {
      var p = c.pending
      return (
        p === null ? (i.next = i) : ((i.next = p.next), (p.next = i)),
        (c.pending = i),
        Vr(r, a)
      )
    }
    return (
      (p = c.interleaved),
      p === null ? ((i.next = i), Wh(c)) : ((i.next = p.next), (p.next = i)),
      (c.interleaved = i),
      Vr(r, a)
    )
  }
  function Ac(r, i, a) {
    if (
      ((i = i.updateQueue), i !== null && ((i = i.shared), (a & 4194240) !== 0))
    ) {
      var c = i.lanes
      ;(c &= r.pendingLanes), (a |= c), (i.lanes = a), ih(r, a)
    }
  }
  function fw(r, i) {
    var a = r.updateQueue,
      c = r.alternate
    if (c !== null && ((c = c.updateQueue), a === c)) {
      var p = null,
        y = null
      if (((a = a.firstBaseUpdate), a !== null)) {
        do {
          var k = {
            eventTime: a.eventTime,
            lane: a.lane,
            tag: a.tag,
            payload: a.payload,
            callback: a.callback,
            next: null,
          }
          y === null ? (p = y = k) : (y = y.next = k), (a = a.next)
        } while (a !== null)
        y === null ? (p = y = i) : (y = y.next = i)
      } else p = y = i
      ;(a = {
        baseState: c.baseState,
        firstBaseUpdate: p,
        lastBaseUpdate: y,
        shared: c.shared,
        effects: c.effects,
      }),
        (r.updateQueue = a)
      return
    }
    ;(r = a.lastBaseUpdate),
      r === null ? (a.firstBaseUpdate = i) : (r.next = i),
      (a.lastBaseUpdate = i)
  }
  function Tc(r, i, a, c) {
    var p = r.updateQueue
    Pi = !1
    var y = p.firstBaseUpdate,
      k = p.lastBaseUpdate,
      R = p.shared.pending
    if (R !== null) {
      p.shared.pending = null
      var N = R,
        z = N.next
      ;(N.next = null), k === null ? (y = z) : (k.next = z), (k = N)
      var X = r.alternate
      X !== null &&
        ((X = X.updateQueue),
        (R = X.lastBaseUpdate),
        R !== k &&
          (R === null ? (X.firstBaseUpdate = z) : (R.next = z),
          (X.lastBaseUpdate = N)))
    }
    if (y !== null) {
      var J = p.baseState
      ;(k = 0), (X = z = N = null), (R = y)
      do {
        var Y = R.lane,
          ae = R.eventTime
        if ((c & Y) === Y) {
          X !== null &&
            (X = X.next =
              {
                eventTime: ae,
                lane: 0,
                tag: R.tag,
                payload: R.payload,
                callback: R.callback,
                next: null,
              })
          e: {
            var fe = r,
              de = R
            switch (((Y = i), (ae = a), de.tag)) {
              case 1:
                if (((fe = de.payload), typeof fe == "function")) {
                  J = fe.call(ae, J, Y)
                  break e
                }
                J = fe
                break e
              case 3:
                fe.flags = (fe.flags & -65537) | 128
              case 0:
                if (
                  ((fe = de.payload),
                  (Y = typeof fe == "function" ? fe.call(ae, J, Y) : fe),
                  Y == null)
                )
                  break e
                J = V({}, J, Y)
                break e
              case 2:
                Pi = !0
            }
          }
          R.callback !== null &&
            R.lane !== 0 &&
            ((r.flags |= 64),
            (Y = p.effects),
            Y === null ? (p.effects = [R]) : Y.push(R))
        } else
          (ae = {
            eventTime: ae,
            lane: Y,
            tag: R.tag,
            payload: R.payload,
            callback: R.callback,
            next: null,
          }),
            X === null ? ((z = X = ae), (N = J)) : (X = X.next = ae),
            (k |= Y)
        if (((R = R.next), R === null)) {
          if (((R = p.shared.pending), R === null)) break
          ;(Y = R),
            (R = Y.next),
            (Y.next = null),
            (p.lastBaseUpdate = Y),
            (p.shared.pending = null)
        }
      } while (!0)
      if (
        (X === null && (N = J),
        (p.baseState = N),
        (p.firstBaseUpdate = z),
        (p.lastBaseUpdate = X),
        (i = p.shared.interleaved),
        i !== null)
      ) {
        p = i
        do (k |= p.lane), (p = p.next)
        while (p !== i)
      } else y === null && (p.shared.lanes = 0)
      ;(As |= k), (r.lanes = k), (r.memoizedState = J)
    }
  }
  function dw(r, i, a) {
    if (((r = i.effects), (i.effects = null), r !== null))
      for (i = 0; i < r.length; i++) {
        var c = r[i],
          p = c.callback
        if (p !== null) {
          if (((c.callback = null), (c = a), typeof p != "function"))
            throw Error(n(191, p))
          p.call(c)
        }
      }
  }
  var Pl = {},
    vr = Ai(Pl),
    Il = Ai(Pl),
    Ml = Ai(Pl)
  function ks(r) {
    if (r === Pl) throw Error(n(174))
    return r
  }
  function Hh(r, i) {
    switch ((Ge(Ml, i), Ge(Il, r), Ge(vr, Pl), (r = i.nodeType), r)) {
      case 9:
      case 11:
        i = (i = i.documentElement) ? i.namespaceURI : Oo(null, "")
        break
      default:
        ;(r = r === 8 ? i.parentNode : i),
          (i = r.namespaceURI || null),
          (r = r.tagName),
          (i = Oo(i, r))
    }
    Qe(vr), Ge(vr, i)
  }
  function Ko() {
    Qe(vr), Qe(Il), Qe(Ml)
  }
  function hw(r) {
    ks(Ml.current)
    var i = ks(vr.current),
      a = Oo(i, r.type)
    i !== a && (Ge(Il, r), Ge(vr, a))
  }
  function Gh(r) {
    Il.current === r && (Qe(vr), Qe(Il))
  }
  var nt = Ai(0)
  function Rc(r) {
    for (var i = r; i !== null; ) {
      if (i.tag === 13) {
        var a = i.memoizedState
        if (
          a !== null &&
          ((a = a.dehydrated), a === null || a.data === "$?" || a.data === "$!")
        )
          return i
      } else if (i.tag === 19 && i.memoizedProps.revealOrder !== void 0) {
        if ((i.flags & 128) !== 0) return i
      } else if (i.child !== null) {
        ;(i.child.return = i), (i = i.child)
        continue
      }
      if (i === r) break
      for (; i.sibling === null; ) {
        if (i.return === null || i.return === r) return null
        i = i.return
      }
      ;(i.sibling.return = i.return), (i = i.sibling)
    }
    return null
  }
  var Kh = []
  function qh() {
    for (var r = 0; r < Kh.length; r++)
      Kh[r]._workInProgressVersionPrimary = null
    Kh.length = 0
  }
  var Pc = M.ReactCurrentDispatcher,
    Qh = M.ReactCurrentBatchConfig,
    Os = 0,
    rt = null,
    vt = null,
    _t = null,
    Ic = !1,
    Nl = !1,
    jl = 0,
    Ik = 0
  function Bt() {
    throw Error(n(321))
  }
  function Yh(r, i) {
    if (i === null) return !1
    for (var a = 0; a < i.length && a < r.length; a++)
      if (!Un(r[a], i[a])) return !1
    return !0
  }
  function Xh(r, i, a, c, p, y) {
    if (
      ((Os = y),
      (rt = i),
      (i.memoizedState = null),
      (i.updateQueue = null),
      (i.lanes = 0),
      (Pc.current = r === null || r.memoizedState === null ? Dk : Lk),
      (r = a(c, p)),
      Nl)
    ) {
      y = 0
      do {
        if (((Nl = !1), (jl = 0), 25 <= y)) throw Error(n(301))
        ;(y += 1),
          (_t = vt = null),
          (i.updateQueue = null),
          (Pc.current = Bk),
          (r = a(c, p))
      } while (Nl)
    }
    if (
      ((Pc.current = jc),
      (i = vt !== null && vt.next !== null),
      (Os = 0),
      (_t = vt = rt = null),
      (Ic = !1),
      i)
    )
      throw Error(n(300))
    return r
  }
  function Zh() {
    var r = jl !== 0
    return (jl = 0), r
  }
  function wr() {
    var r = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    }
    return _t === null ? (rt.memoizedState = _t = r) : (_t = _t.next = r), _t
  }
  function An() {
    if (vt === null) {
      var r = rt.alternate
      r = r !== null ? r.memoizedState : null
    } else r = vt.next
    var i = _t === null ? rt.memoizedState : _t.next
    if (i !== null) (_t = i), (vt = r)
    else {
      if (r === null) throw Error(n(310))
      ;(vt = r),
        (r = {
          memoizedState: vt.memoizedState,
          baseState: vt.baseState,
          baseQueue: vt.baseQueue,
          queue: vt.queue,
          next: null,
        }),
        _t === null ? (rt.memoizedState = _t = r) : (_t = _t.next = r)
    }
    return _t
  }
  function Dl(r, i) {
    return typeof i == "function" ? i(r) : i
  }
  function Jh(r) {
    var i = An(),
      a = i.queue
    if (a === null) throw Error(n(311))
    a.lastRenderedReducer = r
    var c = vt,
      p = c.baseQueue,
      y = a.pending
    if (y !== null) {
      if (p !== null) {
        var k = p.next
        ;(p.next = y.next), (y.next = k)
      }
      ;(c.baseQueue = p = y), (a.pending = null)
    }
    if (p !== null) {
      ;(y = p.next), (c = c.baseState)
      var R = (k = null),
        N = null,
        z = y
      do {
        var X = z.lane
        if ((Os & X) === X)
          N !== null &&
            (N = N.next =
              {
                lane: 0,
                action: z.action,
                hasEagerState: z.hasEagerState,
                eagerState: z.eagerState,
                next: null,
              }),
            (c = z.hasEagerState ? z.eagerState : r(c, z.action))
        else {
          var J = {
            lane: X,
            action: z.action,
            hasEagerState: z.hasEagerState,
            eagerState: z.eagerState,
            next: null,
          }
          N === null ? ((R = N = J), (k = c)) : (N = N.next = J),
            (rt.lanes |= X),
            (As |= X)
        }
        z = z.next
      } while (z !== null && z !== y)
      N === null ? (k = c) : (N.next = R),
        Un(c, i.memoizedState) || (tn = !0),
        (i.memoizedState = c),
        (i.baseState = k),
        (i.baseQueue = N),
        (a.lastRenderedState = c)
    }
    if (((r = a.interleaved), r !== null)) {
      p = r
      do (y = p.lane), (rt.lanes |= y), (As |= y), (p = p.next)
      while (p !== r)
    } else p === null && (a.lanes = 0)
    return [i.memoizedState, a.dispatch]
  }
  function ep(r) {
    var i = An(),
      a = i.queue
    if (a === null) throw Error(n(311))
    a.lastRenderedReducer = r
    var c = a.dispatch,
      p = a.pending,
      y = i.memoizedState
    if (p !== null) {
      a.pending = null
      var k = (p = p.next)
      do (y = r(y, k.action)), (k = k.next)
      while (k !== p)
      Un(y, i.memoizedState) || (tn = !0),
        (i.memoizedState = y),
        i.baseQueue === null && (i.baseState = y),
        (a.lastRenderedState = y)
    }
    return [y, c]
  }
  function pw() {}
  function mw(r, i) {
    var a = rt,
      c = An(),
      p = i(),
      y = !Un(c.memoizedState, p)
    if (
      (y && ((c.memoizedState = p), (tn = !0)),
      (c = c.queue),
      tp(vw.bind(null, a, c, r), [r]),
      c.getSnapshot !== i || y || (_t !== null && _t.memoizedState.tag & 1))
    ) {
      if (
        ((a.flags |= 2048),
        Ll(9, yw.bind(null, a, c, p, i), void 0, null),
        kt === null)
      )
        throw Error(n(349))
      ;(Os & 30) !== 0 || gw(a, i, p)
    }
    return p
  }
  function gw(r, i, a) {
    ;(r.flags |= 16384),
      (r = { getSnapshot: i, value: a }),
      (i = rt.updateQueue),
      i === null
        ? ((i = { lastEffect: null, stores: null }),
          (rt.updateQueue = i),
          (i.stores = [r]))
        : ((a = i.stores), a === null ? (i.stores = [r]) : a.push(r))
  }
  function yw(r, i, a, c) {
    ;(i.value = a), (i.getSnapshot = c), ww(i) && Sw(r)
  }
  function vw(r, i, a) {
    return a(function () {
      ww(i) && Sw(r)
    })
  }
  function ww(r) {
    var i = r.getSnapshot
    r = r.value
    try {
      var a = i()
      return !Un(r, a)
    } catch {
      return !0
    }
  }
  function Sw(r) {
    var i = Vr(r, 1)
    i !== null && Hn(i, r, 1, -1)
  }
  function xw(r) {
    var i = wr()
    return (
      typeof r == "function" && (r = r()),
      (i.memoizedState = i.baseState = r),
      (r = {
        pending: null,
        interleaved: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Dl,
        lastRenderedState: r,
      }),
      (i.queue = r),
      (r = r.dispatch = jk.bind(null, rt, r)),
      [i.memoizedState, r]
    )
  }
  function Ll(r, i, a, c) {
    return (
      (r = { tag: r, create: i, destroy: a, deps: c, next: null }),
      (i = rt.updateQueue),
      i === null
        ? ((i = { lastEffect: null, stores: null }),
          (rt.updateQueue = i),
          (i.lastEffect = r.next = r))
        : ((a = i.lastEffect),
          a === null
            ? (i.lastEffect = r.next = r)
            : ((c = a.next), (a.next = r), (r.next = c), (i.lastEffect = r))),
      r
    )
  }
  function Ew() {
    return An().memoizedState
  }
  function Mc(r, i, a, c) {
    var p = wr()
    ;(rt.flags |= r),
      (p.memoizedState = Ll(1 | i, a, void 0, c === void 0 ? null : c))
  }
  function Nc(r, i, a, c) {
    var p = An()
    c = c === void 0 ? null : c
    var y = void 0
    if (vt !== null) {
      var k = vt.memoizedState
      if (((y = k.destroy), c !== null && Yh(c, k.deps))) {
        p.memoizedState = Ll(i, a, y, c)
        return
      }
    }
    ;(rt.flags |= r), (p.memoizedState = Ll(1 | i, a, y, c))
  }
  function bw(r, i) {
    return Mc(8390656, 8, r, i)
  }
  function tp(r, i) {
    return Nc(2048, 8, r, i)
  }
  function Cw(r, i) {
    return Nc(4, 2, r, i)
  }
  function _w(r, i) {
    return Nc(4, 4, r, i)
  }
  function kw(r, i) {
    if (typeof i == "function")
      return (
        (r = r()),
        i(r),
        function () {
          i(null)
        }
      )
    if (i != null)
      return (
        (r = r()),
        (i.current = r),
        function () {
          i.current = null
        }
      )
  }
  function Ow(r, i, a) {
    return (
      (a = a != null ? a.concat([r]) : null), Nc(4, 4, kw.bind(null, i, r), a)
    )
  }
  function np() {}
  function Aw(r, i) {
    var a = An()
    i = i === void 0 ? null : i
    var c = a.memoizedState
    return c !== null && i !== null && Yh(i, c[1])
      ? c[0]
      : ((a.memoizedState = [r, i]), r)
  }
  function Tw(r, i) {
    var a = An()
    i = i === void 0 ? null : i
    var c = a.memoizedState
    return c !== null && i !== null && Yh(i, c[1])
      ? c[0]
      : ((r = r()), (a.memoizedState = [r, i]), r)
  }
  function Rw(r, i, a) {
    return (Os & 21) === 0
      ? (r.baseState && ((r.baseState = !1), (tn = !0)), (r.memoizedState = a))
      : (Un(a, i) ||
          ((a = ov()), (rt.lanes |= a), (As |= a), (r.baseState = !0)),
        i)
  }
  function Mk(r, i) {
    var a = Ve
    ;(Ve = a !== 0 && 4 > a ? a : 4), r(!0)
    var c = Qh.transition
    Qh.transition = {}
    try {
      r(!1), i()
    } finally {
      ;(Ve = a), (Qh.transition = c)
    }
  }
  function Pw() {
    return An().memoizedState
  }
  function Nk(r, i, a) {
    var c = Di(r)
    if (
      ((a = {
        lane: c,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      Iw(r))
    )
      Mw(i, a)
    else if (((a = uw(r, i, a, c)), a !== null)) {
      var p = Kt()
      Hn(a, r, c, p), Nw(a, i, c)
    }
  }
  function jk(r, i, a) {
    var c = Di(r),
      p = {
        lane: c,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }
    if (Iw(r)) Mw(i, p)
    else {
      var y = r.alternate
      if (
        r.lanes === 0 &&
        (y === null || y.lanes === 0) &&
        ((y = i.lastRenderedReducer), y !== null)
      )
        try {
          var k = i.lastRenderedState,
            R = y(k, a)
          if (((p.hasEagerState = !0), (p.eagerState = R), Un(R, k))) {
            var N = i.interleaved
            N === null
              ? ((p.next = p), Wh(i))
              : ((p.next = N.next), (N.next = p)),
              (i.interleaved = p)
            return
          }
        } catch {
        } finally {
        }
      ;(a = uw(r, i, p, c)),
        a !== null && ((p = Kt()), Hn(a, r, c, p), Nw(a, i, c))
    }
  }
  function Iw(r) {
    var i = r.alternate
    return r === rt || (i !== null && i === rt)
  }
  function Mw(r, i) {
    Nl = Ic = !0
    var a = r.pending
    a === null ? (i.next = i) : ((i.next = a.next), (a.next = i)),
      (r.pending = i)
  }
  function Nw(r, i, a) {
    if ((a & 4194240) !== 0) {
      var c = i.lanes
      ;(c &= r.pendingLanes), (a |= c), (i.lanes = a), ih(r, a)
    }
  }
  var jc = {
      readContext: On,
      useCallback: Bt,
      useContext: Bt,
      useEffect: Bt,
      useImperativeHandle: Bt,
      useInsertionEffect: Bt,
      useLayoutEffect: Bt,
      useMemo: Bt,
      useReducer: Bt,
      useRef: Bt,
      useState: Bt,
      useDebugValue: Bt,
      useDeferredValue: Bt,
      useTransition: Bt,
      useMutableSource: Bt,
      useSyncExternalStore: Bt,
      useId: Bt,
      unstable_isNewReconciler: !1,
    },
    Dk = {
      readContext: On,
      useCallback: function (r, i) {
        return (wr().memoizedState = [r, i === void 0 ? null : i]), r
      },
      useContext: On,
      useEffect: bw,
      useImperativeHandle: function (r, i, a) {
        return (
          (a = a != null ? a.concat([r]) : null),
          Mc(4194308, 4, kw.bind(null, i, r), a)
        )
      },
      useLayoutEffect: function (r, i) {
        return Mc(4194308, 4, r, i)
      },
      useInsertionEffect: function (r, i) {
        return Mc(4, 2, r, i)
      },
      useMemo: function (r, i) {
        var a = wr()
        return (
          (i = i === void 0 ? null : i),
          (r = r()),
          (a.memoizedState = [r, i]),
          r
        )
      },
      useReducer: function (r, i, a) {
        var c = wr()
        return (
          (i = a !== void 0 ? a(i) : i),
          (c.memoizedState = c.baseState = i),
          (r = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: r,
            lastRenderedState: i,
          }),
          (c.queue = r),
          (r = r.dispatch = Nk.bind(null, rt, r)),
          [c.memoizedState, r]
        )
      },
      useRef: function (r) {
        var i = wr()
        return (r = { current: r }), (i.memoizedState = r)
      },
      useState: xw,
      useDebugValue: np,
      useDeferredValue: function (r) {
        return (wr().memoizedState = r)
      },
      useTransition: function () {
        var r = xw(!1),
          i = r[0]
        return (r = Mk.bind(null, r[1])), (wr().memoizedState = r), [i, r]
      },
      useMutableSource: function () {},
      useSyncExternalStore: function (r, i, a) {
        var c = rt,
          p = wr()
        if (Je) {
          if (a === void 0) throw Error(n(407))
          a = a()
        } else {
          if (((a = i()), kt === null)) throw Error(n(349))
          ;(Os & 30) !== 0 || gw(c, i, a)
        }
        p.memoizedState = a
        var y = { value: a, getSnapshot: i }
        return (
          (p.queue = y),
          bw(vw.bind(null, c, y, r), [r]),
          (c.flags |= 2048),
          Ll(9, yw.bind(null, c, y, a, i), void 0, null),
          a
        )
      },
      useId: function () {
        var r = wr(),
          i = kt.identifierPrefix
        if (Je) {
          var a = Wr,
            c = $r
          ;(a = (c & ~(1 << (32 - Fn(c) - 1))).toString(32) + a),
            (i = ":" + i + "R" + a),
            (a = jl++),
            0 < a && (i += "H" + a.toString(32)),
            (i += ":")
        } else (a = Ik++), (i = ":" + i + "r" + a.toString(32) + ":")
        return (r.memoizedState = i)
      },
      unstable_isNewReconciler: !1,
    },
    Lk = {
      readContext: On,
      useCallback: Aw,
      useContext: On,
      useEffect: tp,
      useImperativeHandle: Ow,
      useInsertionEffect: Cw,
      useLayoutEffect: _w,
      useMemo: Tw,
      useReducer: Jh,
      useRef: Ew,
      useState: function () {
        return Jh(Dl)
      },
      useDebugValue: np,
      useDeferredValue: function (r) {
        var i = An()
        return Rw(i, vt.memoizedState, r)
      },
      useTransition: function () {
        var r = Jh(Dl)[0],
          i = An().memoizedState
        return [r, i]
      },
      useMutableSource: pw,
      useSyncExternalStore: mw,
      useId: Pw,
      unstable_isNewReconciler: !1,
    },
    Bk = {
      readContext: On,
      useCallback: Aw,
      useContext: On,
      useEffect: tp,
      useImperativeHandle: Ow,
      useInsertionEffect: Cw,
      useLayoutEffect: _w,
      useMemo: Tw,
      useReducer: ep,
      useRef: Ew,
      useState: function () {
        return ep(Dl)
      },
      useDebugValue: np,
      useDeferredValue: function (r) {
        var i = An()
        return vt === null ? (i.memoizedState = r) : Rw(i, vt.memoizedState, r)
      },
      useTransition: function () {
        var r = ep(Dl)[0],
          i = An().memoizedState
        return [r, i]
      },
      useMutableSource: pw,
      useSyncExternalStore: mw,
      useId: Pw,
      unstable_isNewReconciler: !1,
    }
  function $n(r, i) {
    if (r && r.defaultProps) {
      ;(i = V({}, i)), (r = r.defaultProps)
      for (var a in r) i[a] === void 0 && (i[a] = r[a])
      return i
    }
    return i
  }
  function rp(r, i, a, c) {
    ;(i = r.memoizedState),
      (a = a(c, i)),
      (a = a == null ? i : V({}, i, a)),
      (r.memoizedState = a),
      r.lanes === 0 && (r.updateQueue.baseState = a)
  }
  var Dc = {
    isMounted: function (r) {
      return (r = r._reactInternals) ? Ss(r) === r : !1
    },
    enqueueSetState: function (r, i, a) {
      r = r._reactInternals
      var c = Kt(),
        p = Di(r),
        y = Hr(c, p)
      ;(y.payload = i),
        a != null && (y.callback = a),
        (i = Ii(r, y, p)),
        i !== null && (Hn(i, r, p, c), Ac(i, r, p))
    },
    enqueueReplaceState: function (r, i, a) {
      r = r._reactInternals
      var c = Kt(),
        p = Di(r),
        y = Hr(c, p)
      ;(y.tag = 1),
        (y.payload = i),
        a != null && (y.callback = a),
        (i = Ii(r, y, p)),
        i !== null && (Hn(i, r, p, c), Ac(i, r, p))
    },
    enqueueForceUpdate: function (r, i) {
      r = r._reactInternals
      var a = Kt(),
        c = Di(r),
        p = Hr(a, c)
      ;(p.tag = 2),
        i != null && (p.callback = i),
        (i = Ii(r, p, c)),
        i !== null && (Hn(i, r, c, a), Ac(i, r, c))
    },
  }
  function jw(r, i, a, c, p, y, k) {
    return (
      (r = r.stateNode),
      typeof r.shouldComponentUpdate == "function"
        ? r.shouldComponentUpdate(c, y, k)
        : i.prototype && i.prototype.isPureReactComponent
          ? !bl(a, c) || !bl(p, y)
          : !0
    )
  }
  function Dw(r, i, a) {
    var c = !1,
      p = Ti,
      y = i.contextType
    return (
      typeof y == "object" && y !== null
        ? (y = On(y))
        : ((p = en(i) ? Es : Lt.current),
          (c = i.contextTypes),
          (y = (c = c != null) ? Uo(r, p) : Ti)),
      (i = new i(a, y)),
      (r.memoizedState =
        i.state !== null && i.state !== void 0 ? i.state : null),
      (i.updater = Dc),
      (r.stateNode = i),
      (i._reactInternals = r),
      c &&
        ((r = r.stateNode),
        (r.__reactInternalMemoizedUnmaskedChildContext = p),
        (r.__reactInternalMemoizedMaskedChildContext = y)),
      i
    )
  }
  function Lw(r, i, a, c) {
    ;(r = i.state),
      typeof i.componentWillReceiveProps == "function" &&
        i.componentWillReceiveProps(a, c),
      typeof i.UNSAFE_componentWillReceiveProps == "function" &&
        i.UNSAFE_componentWillReceiveProps(a, c),
      i.state !== r && Dc.enqueueReplaceState(i, i.state, null)
  }
  function ip(r, i, a, c) {
    var p = r.stateNode
    ;(p.props = a), (p.state = r.memoizedState), (p.refs = {}), Vh(r)
    var y = i.contextType
    typeof y == "object" && y !== null
      ? (p.context = On(y))
      : ((y = en(i) ? Es : Lt.current), (p.context = Uo(r, y))),
      (p.state = r.memoizedState),
      (y = i.getDerivedStateFromProps),
      typeof y == "function" && (rp(r, i, y, a), (p.state = r.memoizedState)),
      typeof i.getDerivedStateFromProps == "function" ||
        typeof p.getSnapshotBeforeUpdate == "function" ||
        (typeof p.UNSAFE_componentWillMount != "function" &&
          typeof p.componentWillMount != "function") ||
        ((i = p.state),
        typeof p.componentWillMount == "function" && p.componentWillMount(),
        typeof p.UNSAFE_componentWillMount == "function" &&
          p.UNSAFE_componentWillMount(),
        i !== p.state && Dc.enqueueReplaceState(p, p.state, null),
        Tc(r, a, p, c),
        (p.state = r.memoizedState)),
      typeof p.componentDidMount == "function" && (r.flags |= 4194308)
  }
  function qo(r, i) {
    try {
      var a = "",
        c = i
      do (a += he(c)), (c = c.return)
      while (c)
      var p = a
    } catch (y) {
      p =
        `
Error generating stack: ` +
        y.message +
        `
` +
        y.stack
    }
    return { value: r, source: i, stack: p, digest: null }
  }
  function sp(r, i, a) {
    return { value: r, source: null, stack: a ?? null, digest: i ?? null }
  }
  function op(r, i) {
    try {
      console.error(i.value)
    } catch (a) {
      setTimeout(function () {
        throw a
      })
    }
  }
  var Fk = typeof WeakMap == "function" ? WeakMap : Map
  function Bw(r, i, a) {
    ;(a = Hr(-1, a)), (a.tag = 3), (a.payload = { element: null })
    var c = i.value
    return (
      (a.callback = function () {
        Wc || ((Wc = !0), (xp = c)), op(r, i)
      }),
      a
    )
  }
  function Fw(r, i, a) {
    ;(a = Hr(-1, a)), (a.tag = 3)
    var c = r.type.getDerivedStateFromError
    if (typeof c == "function") {
      var p = i.value
      ;(a.payload = function () {
        return c(p)
      }),
        (a.callback = function () {
          op(r, i)
        })
    }
    var y = r.stateNode
    return (
      y !== null &&
        typeof y.componentDidCatch == "function" &&
        (a.callback = function () {
          op(r, i),
            typeof c != "function" &&
              (Ni === null ? (Ni = new Set([this])) : Ni.add(this))
          var k = i.stack
          this.componentDidCatch(i.value, {
            componentStack: k !== null ? k : "",
          })
        }),
      a
    )
  }
  function Uw(r, i, a) {
    var c = r.pingCache
    if (c === null) {
      c = r.pingCache = new Fk()
      var p = new Set()
      c.set(i, p)
    } else (p = c.get(i)), p === void 0 && ((p = new Set()), c.set(i, p))
    p.has(a) || (p.add(a), (r = Jk.bind(null, r, i, a)), i.then(r, r))
  }
  function zw(r) {
    do {
      var i
      if (
        ((i = r.tag === 13) &&
          ((i = r.memoizedState),
          (i = i !== null ? i.dehydrated !== null : !0)),
        i)
      )
        return r
      r = r.return
    } while (r !== null)
    return null
  }
  function $w(r, i, a, c, p) {
    return (r.mode & 1) === 0
      ? (r === i
          ? (r.flags |= 65536)
          : ((r.flags |= 128),
            (a.flags |= 131072),
            (a.flags &= -52805),
            a.tag === 1 &&
              (a.alternate === null
                ? (a.tag = 17)
                : ((i = Hr(-1, 1)), (i.tag = 2), Ii(a, i, 1))),
            (a.lanes |= 1)),
        r)
      : ((r.flags |= 65536), (r.lanes = p), r)
  }
  var Uk = M.ReactCurrentOwner,
    tn = !1
  function Gt(r, i, a, c) {
    i.child = r === null ? lw(i, null, a, c) : Vo(i, r.child, a, c)
  }
  function Ww(r, i, a, c, p) {
    a = a.render
    var y = i.ref
    return (
      Go(i, p),
      (c = Xh(r, i, a, c, y, p)),
      (a = Zh()),
      r !== null && !tn
        ? ((i.updateQueue = r.updateQueue),
          (i.flags &= -2053),
          (r.lanes &= ~p),
          Gr(r, i, p))
        : (Je && a && Nh(i), (i.flags |= 1), Gt(r, i, c, p), i.child)
    )
  }
  function Vw(r, i, a, c, p) {
    if (r === null) {
      var y = a.type
      return typeof y == "function" &&
        !Ap(y) &&
        y.defaultProps === void 0 &&
        a.compare === null &&
        a.defaultProps === void 0
        ? ((i.tag = 15), (i.type = y), Hw(r, i, y, c, p))
        : ((r = Qc(a.type, null, c, i, i.mode, p)),
          (r.ref = i.ref),
          (r.return = i),
          (i.child = r))
    }
    if (((y = r.child), (r.lanes & p) === 0)) {
      var k = y.memoizedProps
      if (
        ((a = a.compare), (a = a !== null ? a : bl), a(k, c) && r.ref === i.ref)
      )
        return Gr(r, i, p)
    }
    return (
      (i.flags |= 1),
      (r = Bi(y, c)),
      (r.ref = i.ref),
      (r.return = i),
      (i.child = r)
    )
  }
  function Hw(r, i, a, c, p) {
    if (r !== null) {
      var y = r.memoizedProps
      if (bl(y, c) && r.ref === i.ref)
        if (((tn = !1), (i.pendingProps = c = y), (r.lanes & p) !== 0))
          (r.flags & 131072) !== 0 && (tn = !0)
        else return (i.lanes = r.lanes), Gr(r, i, p)
    }
    return ap(r, i, a, c, p)
  }
  function Gw(r, i, a) {
    var c = i.pendingProps,
      p = c.children,
      y = r !== null ? r.memoizedState : null
    if (c.mode === "hidden")
      if ((i.mode & 1) === 0)
        (i.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          Ge(Yo, gn),
          (gn |= a)
      else {
        if ((a & 1073741824) === 0)
          return (
            (r = y !== null ? y.baseLanes | a : a),
            (i.lanes = i.childLanes = 1073741824),
            (i.memoizedState = {
              baseLanes: r,
              cachePool: null,
              transitions: null,
            }),
            (i.updateQueue = null),
            Ge(Yo, gn),
            (gn |= r),
            null
          )
        ;(i.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          (c = y !== null ? y.baseLanes : a),
          Ge(Yo, gn),
          (gn |= c)
      }
    else
      y !== null ? ((c = y.baseLanes | a), (i.memoizedState = null)) : (c = a),
        Ge(Yo, gn),
        (gn |= c)
    return Gt(r, i, p, a), i.child
  }
  function Kw(r, i) {
    var a = i.ref
    ;((r === null && a !== null) || (r !== null && r.ref !== a)) &&
      ((i.flags |= 512), (i.flags |= 2097152))
  }
  function ap(r, i, a, c, p) {
    var y = en(a) ? Es : Lt.current
    return (
      (y = Uo(i, y)),
      Go(i, p),
      (a = Xh(r, i, a, c, y, p)),
      (c = Zh()),
      r !== null && !tn
        ? ((i.updateQueue = r.updateQueue),
          (i.flags &= -2053),
          (r.lanes &= ~p),
          Gr(r, i, p))
        : (Je && c && Nh(i), (i.flags |= 1), Gt(r, i, a, p), i.child)
    )
  }
  function qw(r, i, a, c, p) {
    if (en(a)) {
      var y = !0
      Sc(i)
    } else y = !1
    if ((Go(i, p), i.stateNode === null))
      Bc(r, i), Dw(i, a, c), ip(i, a, c, p), (c = !0)
    else if (r === null) {
      var k = i.stateNode,
        R = i.memoizedProps
      k.props = R
      var N = k.context,
        z = a.contextType
      typeof z == "object" && z !== null
        ? (z = On(z))
        : ((z = en(a) ? Es : Lt.current), (z = Uo(i, z)))
      var X = a.getDerivedStateFromProps,
        J =
          typeof X == "function" ||
          typeof k.getSnapshotBeforeUpdate == "function"
      J ||
        (typeof k.UNSAFE_componentWillReceiveProps != "function" &&
          typeof k.componentWillReceiveProps != "function") ||
        ((R !== c || N !== z) && Lw(i, k, c, z)),
        (Pi = !1)
      var Y = i.memoizedState
      ;(k.state = Y),
        Tc(i, c, k, p),
        (N = i.memoizedState),
        R !== c || Y !== N || Jt.current || Pi
          ? (typeof X == "function" && (rp(i, a, X, c), (N = i.memoizedState)),
            (R = Pi || jw(i, a, R, c, Y, N, z))
              ? (J ||
                  (typeof k.UNSAFE_componentWillMount != "function" &&
                    typeof k.componentWillMount != "function") ||
                  (typeof k.componentWillMount == "function" &&
                    k.componentWillMount(),
                  typeof k.UNSAFE_componentWillMount == "function" &&
                    k.UNSAFE_componentWillMount()),
                typeof k.componentDidMount == "function" &&
                  (i.flags |= 4194308))
              : (typeof k.componentDidMount == "function" &&
                  (i.flags |= 4194308),
                (i.memoizedProps = c),
                (i.memoizedState = N)),
            (k.props = c),
            (k.state = N),
            (k.context = z),
            (c = R))
          : (typeof k.componentDidMount == "function" && (i.flags |= 4194308),
            (c = !1))
    } else {
      ;(k = i.stateNode),
        cw(r, i),
        (R = i.memoizedProps),
        (z = i.type === i.elementType ? R : $n(i.type, R)),
        (k.props = z),
        (J = i.pendingProps),
        (Y = k.context),
        (N = a.contextType),
        typeof N == "object" && N !== null
          ? (N = On(N))
          : ((N = en(a) ? Es : Lt.current), (N = Uo(i, N)))
      var ae = a.getDerivedStateFromProps
      ;(X =
        typeof ae == "function" ||
        typeof k.getSnapshotBeforeUpdate == "function") ||
        (typeof k.UNSAFE_componentWillReceiveProps != "function" &&
          typeof k.componentWillReceiveProps != "function") ||
        ((R !== J || Y !== N) && Lw(i, k, c, N)),
        (Pi = !1),
        (Y = i.memoizedState),
        (k.state = Y),
        Tc(i, c, k, p)
      var fe = i.memoizedState
      R !== J || Y !== fe || Jt.current || Pi
        ? (typeof ae == "function" && (rp(i, a, ae, c), (fe = i.memoizedState)),
          (z = Pi || jw(i, a, z, c, Y, fe, N) || !1)
            ? (X ||
                (typeof k.UNSAFE_componentWillUpdate != "function" &&
                  typeof k.componentWillUpdate != "function") ||
                (typeof k.componentWillUpdate == "function" &&
                  k.componentWillUpdate(c, fe, N),
                typeof k.UNSAFE_componentWillUpdate == "function" &&
                  k.UNSAFE_componentWillUpdate(c, fe, N)),
              typeof k.componentDidUpdate == "function" && (i.flags |= 4),
              typeof k.getSnapshotBeforeUpdate == "function" &&
                (i.flags |= 1024))
            : (typeof k.componentDidUpdate != "function" ||
                (R === r.memoizedProps && Y === r.memoizedState) ||
                (i.flags |= 4),
              typeof k.getSnapshotBeforeUpdate != "function" ||
                (R === r.memoizedProps && Y === r.memoizedState) ||
                (i.flags |= 1024),
              (i.memoizedProps = c),
              (i.memoizedState = fe)),
          (k.props = c),
          (k.state = fe),
          (k.context = N),
          (c = z))
        : (typeof k.componentDidUpdate != "function" ||
            (R === r.memoizedProps && Y === r.memoizedState) ||
            (i.flags |= 4),
          typeof k.getSnapshotBeforeUpdate != "function" ||
            (R === r.memoizedProps && Y === r.memoizedState) ||
            (i.flags |= 1024),
          (c = !1))
    }
    return lp(r, i, a, c, y, p)
  }
  function lp(r, i, a, c, p, y) {
    Kw(r, i)
    var k = (i.flags & 128) !== 0
    if (!c && !k) return p && Jv(i, a, !1), Gr(r, i, y)
    ;(c = i.stateNode), (Uk.current = i)
    var R =
      k && typeof a.getDerivedStateFromError != "function" ? null : c.render()
    return (
      (i.flags |= 1),
      r !== null && k
        ? ((i.child = Vo(i, r.child, null, y)), (i.child = Vo(i, null, R, y)))
        : Gt(r, i, R, y),
      (i.memoizedState = c.state),
      p && Jv(i, a, !0),
      i.child
    )
  }
  function Qw(r) {
    var i = r.stateNode
    i.pendingContext
      ? Xv(r, i.pendingContext, i.pendingContext !== i.context)
      : i.context && Xv(r, i.context, !1),
      Hh(r, i.containerInfo)
  }
  function Yw(r, i, a, c, p) {
    return Wo(), Bh(p), (i.flags |= 256), Gt(r, i, a, c), i.child
  }
  var up = { dehydrated: null, treeContext: null, retryLane: 0 }
  function cp(r) {
    return { baseLanes: r, cachePool: null, transitions: null }
  }
  function Xw(r, i, a) {
    var c = i.pendingProps,
      p = nt.current,
      y = !1,
      k = (i.flags & 128) !== 0,
      R
    if (
      ((R = k) ||
        (R = r !== null && r.memoizedState === null ? !1 : (p & 2) !== 0),
      R
        ? ((y = !0), (i.flags &= -129))
        : (r === null || r.memoizedState !== null) && (p |= 1),
      Ge(nt, p & 1),
      r === null)
    )
      return (
        Lh(i),
        (r = i.memoizedState),
        r !== null && ((r = r.dehydrated), r !== null)
          ? ((i.mode & 1) === 0
              ? (i.lanes = 1)
              : r.data === "$!"
                ? (i.lanes = 8)
                : (i.lanes = 1073741824),
            null)
          : ((k = c.children),
            (r = c.fallback),
            y
              ? ((c = i.mode),
                (y = i.child),
                (k = { mode: "hidden", children: k }),
                (c & 1) === 0 && y !== null
                  ? ((y.childLanes = 0), (y.pendingProps = k))
                  : (y = Yc(k, c, 0, null)),
                (r = Is(r, c, a, null)),
                (y.return = i),
                (r.return = i),
                (y.sibling = r),
                (i.child = y),
                (i.child.memoizedState = cp(a)),
                (i.memoizedState = up),
                r)
              : fp(i, k))
      )
    if (((p = r.memoizedState), p !== null && ((R = p.dehydrated), R !== null)))
      return zk(r, i, k, c, R, p, a)
    if (y) {
      ;(y = c.fallback), (k = i.mode), (p = r.child), (R = p.sibling)
      var N = { mode: "hidden", children: c.children }
      return (
        (k & 1) === 0 && i.child !== p
          ? ((c = i.child),
            (c.childLanes = 0),
            (c.pendingProps = N),
            (i.deletions = null))
          : ((c = Bi(p, N)), (c.subtreeFlags = p.subtreeFlags & 14680064)),
        R !== null ? (y = Bi(R, y)) : ((y = Is(y, k, a, null)), (y.flags |= 2)),
        (y.return = i),
        (c.return = i),
        (c.sibling = y),
        (i.child = c),
        (c = y),
        (y = i.child),
        (k = r.child.memoizedState),
        (k =
          k === null
            ? cp(a)
            : {
                baseLanes: k.baseLanes | a,
                cachePool: null,
                transitions: k.transitions,
              }),
        (y.memoizedState = k),
        (y.childLanes = r.childLanes & ~a),
        (i.memoizedState = up),
        c
      )
    }
    return (
      (y = r.child),
      (r = y.sibling),
      (c = Bi(y, { mode: "visible", children: c.children })),
      (i.mode & 1) === 0 && (c.lanes = a),
      (c.return = i),
      (c.sibling = null),
      r !== null &&
        ((a = i.deletions),
        a === null ? ((i.deletions = [r]), (i.flags |= 16)) : a.push(r)),
      (i.child = c),
      (i.memoizedState = null),
      c
    )
  }
  function fp(r, i) {
    return (
      (i = Yc({ mode: "visible", children: i }, r.mode, 0, null)),
      (i.return = r),
      (r.child = i)
    )
  }
  function Lc(r, i, a, c) {
    return (
      c !== null && Bh(c),
      Vo(i, r.child, null, a),
      (r = fp(i, i.pendingProps.children)),
      (r.flags |= 2),
      (i.memoizedState = null),
      r
    )
  }
  function zk(r, i, a, c, p, y, k) {
    if (a)
      return i.flags & 256
        ? ((i.flags &= -257), (c = sp(Error(n(422)))), Lc(r, i, k, c))
        : i.memoizedState !== null
          ? ((i.child = r.child), (i.flags |= 128), null)
          : ((y = c.fallback),
            (p = i.mode),
            (c = Yc({ mode: "visible", children: c.children }, p, 0, null)),
            (y = Is(y, p, k, null)),
            (y.flags |= 2),
            (c.return = i),
            (y.return = i),
            (c.sibling = y),
            (i.child = c),
            (i.mode & 1) !== 0 && Vo(i, r.child, null, k),
            (i.child.memoizedState = cp(k)),
            (i.memoizedState = up),
            y)
    if ((i.mode & 1) === 0) return Lc(r, i, k, null)
    if (p.data === "$!") {
      if (((c = p.nextSibling && p.nextSibling.dataset), c)) var R = c.dgst
      return (
        (c = R), (y = Error(n(419))), (c = sp(y, c, void 0)), Lc(r, i, k, c)
      )
    }
    if (((R = (k & r.childLanes) !== 0), tn || R)) {
      if (((c = kt), c !== null)) {
        switch (k & -k) {
          case 4:
            p = 2
            break
          case 16:
            p = 8
            break
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            p = 32
            break
          case 536870912:
            p = 268435456
            break
          default:
            p = 0
        }
        ;(p = (p & (c.suspendedLanes | k)) !== 0 ? 0 : p),
          p !== 0 &&
            p !== y.retryLane &&
            ((y.retryLane = p), Vr(r, p), Hn(c, r, p, -1))
      }
      return Op(), (c = sp(Error(n(421)))), Lc(r, i, k, c)
    }
    return p.data === "$?"
      ? ((i.flags |= 128),
        (i.child = r.child),
        (i = e2.bind(null, r)),
        (p._reactRetry = i),
        null)
      : ((r = y.treeContext),
        (mn = Oi(p.nextSibling)),
        (pn = i),
        (Je = !0),
        (zn = null),
        r !== null &&
          ((_n[kn++] = $r),
          (_n[kn++] = Wr),
          (_n[kn++] = bs),
          ($r = r.id),
          (Wr = r.overflow),
          (bs = i)),
        (i = fp(i, c.children)),
        (i.flags |= 4096),
        i)
  }
  function Zw(r, i, a) {
    r.lanes |= i
    var c = r.alternate
    c !== null && (c.lanes |= i), $h(r.return, i, a)
  }
  function dp(r, i, a, c, p) {
    var y = r.memoizedState
    y === null
      ? (r.memoizedState = {
          isBackwards: i,
          rendering: null,
          renderingStartTime: 0,
          last: c,
          tail: a,
          tailMode: p,
        })
      : ((y.isBackwards = i),
        (y.rendering = null),
        (y.renderingStartTime = 0),
        (y.last = c),
        (y.tail = a),
        (y.tailMode = p))
  }
  function Jw(r, i, a) {
    var c = i.pendingProps,
      p = c.revealOrder,
      y = c.tail
    if ((Gt(r, i, c.children, a), (c = nt.current), (c & 2) !== 0))
      (c = (c & 1) | 2), (i.flags |= 128)
    else {
      if (r !== null && (r.flags & 128) !== 0)
        e: for (r = i.child; r !== null; ) {
          if (r.tag === 13) r.memoizedState !== null && Zw(r, a, i)
          else if (r.tag === 19) Zw(r, a, i)
          else if (r.child !== null) {
            ;(r.child.return = r), (r = r.child)
            continue
          }
          if (r === i) break e
          for (; r.sibling === null; ) {
            if (r.return === null || r.return === i) break e
            r = r.return
          }
          ;(r.sibling.return = r.return), (r = r.sibling)
        }
      c &= 1
    }
    if ((Ge(nt, c), (i.mode & 1) === 0)) i.memoizedState = null
    else
      switch (p) {
        case "forwards":
          for (a = i.child, p = null; a !== null; )
            (r = a.alternate),
              r !== null && Rc(r) === null && (p = a),
              (a = a.sibling)
          ;(a = p),
            a === null
              ? ((p = i.child), (i.child = null))
              : ((p = a.sibling), (a.sibling = null)),
            dp(i, !1, p, a, y)
          break
        case "backwards":
          for (a = null, p = i.child, i.child = null; p !== null; ) {
            if (((r = p.alternate), r !== null && Rc(r) === null)) {
              i.child = p
              break
            }
            ;(r = p.sibling), (p.sibling = a), (a = p), (p = r)
          }
          dp(i, !0, a, null, y)
          break
        case "together":
          dp(i, !1, null, null, void 0)
          break
        default:
          i.memoizedState = null
      }
    return i.child
  }
  function Bc(r, i) {
    ;(i.mode & 1) === 0 &&
      r !== null &&
      ((r.alternate = null), (i.alternate = null), (i.flags |= 2))
  }
  function Gr(r, i, a) {
    if (
      (r !== null && (i.dependencies = r.dependencies),
      (As |= i.lanes),
      (a & i.childLanes) === 0)
    )
      return null
    if (r !== null && i.child !== r.child) throw Error(n(153))
    if (i.child !== null) {
      for (
        r = i.child, a = Bi(r, r.pendingProps), i.child = a, a.return = i;
        r.sibling !== null;

      )
        (r = r.sibling), (a = a.sibling = Bi(r, r.pendingProps)), (a.return = i)
      a.sibling = null
    }
    return i.child
  }
  function $k(r, i, a) {
    switch (i.tag) {
      case 3:
        Qw(i), Wo()
        break
      case 5:
        hw(i)
        break
      case 1:
        en(i.type) && Sc(i)
        break
      case 4:
        Hh(i, i.stateNode.containerInfo)
        break
      case 10:
        var c = i.type._context,
          p = i.memoizedProps.value
        Ge(kc, c._currentValue), (c._currentValue = p)
        break
      case 13:
        if (((c = i.memoizedState), c !== null))
          return c.dehydrated !== null
            ? (Ge(nt, nt.current & 1), (i.flags |= 128), null)
            : (a & i.child.childLanes) !== 0
              ? Xw(r, i, a)
              : (Ge(nt, nt.current & 1),
                (r = Gr(r, i, a)),
                r !== null ? r.sibling : null)
        Ge(nt, nt.current & 1)
        break
      case 19:
        if (((c = (a & i.childLanes) !== 0), (r.flags & 128) !== 0)) {
          if (c) return Jw(r, i, a)
          i.flags |= 128
        }
        if (
          ((p = i.memoizedState),
          p !== null &&
            ((p.rendering = null), (p.tail = null), (p.lastEffect = null)),
          Ge(nt, nt.current),
          c)
        )
          break
        return null
      case 22:
      case 23:
        return (i.lanes = 0), Gw(r, i, a)
    }
    return Gr(r, i, a)
  }
  var e0, hp, t0, n0
  ;(e0 = function (r, i) {
    for (var a = i.child; a !== null; ) {
      if (a.tag === 5 || a.tag === 6) r.appendChild(a.stateNode)
      else if (a.tag !== 4 && a.child !== null) {
        ;(a.child.return = a), (a = a.child)
        continue
      }
      if (a === i) break
      for (; a.sibling === null; ) {
        if (a.return === null || a.return === i) return
        a = a.return
      }
      ;(a.sibling.return = a.return), (a = a.sibling)
    }
  }),
    (hp = function () {}),
    (t0 = function (r, i, a, c) {
      var p = r.memoizedProps
      if (p !== c) {
        ;(r = i.stateNode), ks(vr.current)
        var y = null
        switch (a) {
          case "input":
            ;(p = Br(r, p)), (c = Br(r, c)), (y = [])
            break
          case "select":
            ;(p = V({}, p, { value: void 0 })),
              (c = V({}, c, { value: void 0 })),
              (y = [])
            break
          case "textarea":
            ;(p = ys(r, p)), (c = ys(r, c)), (y = [])
            break
          default:
            typeof p.onClick != "function" &&
              typeof c.onClick == "function" &&
              (r.onclick = yc)
        }
        Kd(a, c)
        var k
        a = null
        for (z in p)
          if (!c.hasOwnProperty(z) && p.hasOwnProperty(z) && p[z] != null)
            if (z === "style") {
              var R = p[z]
              for (k in R) R.hasOwnProperty(k) && (a || (a = {}), (a[k] = ""))
            } else
              z !== "dangerouslySetInnerHTML" &&
                z !== "children" &&
                z !== "suppressContentEditableWarning" &&
                z !== "suppressHydrationWarning" &&
                z !== "autoFocus" &&
                (o.hasOwnProperty(z)
                  ? y || (y = [])
                  : (y = y || []).push(z, null))
        for (z in c) {
          var N = c[z]
          if (
            ((R = p != null ? p[z] : void 0),
            c.hasOwnProperty(z) && N !== R && (N != null || R != null))
          )
            if (z === "style")
              if (R) {
                for (k in R)
                  !R.hasOwnProperty(k) ||
                    (N && N.hasOwnProperty(k)) ||
                    (a || (a = {}), (a[k] = ""))
                for (k in N)
                  N.hasOwnProperty(k) &&
                    R[k] !== N[k] &&
                    (a || (a = {}), (a[k] = N[k]))
              } else a || (y || (y = []), y.push(z, a)), (a = N)
            else
              z === "dangerouslySetInnerHTML"
                ? ((N = N ? N.__html : void 0),
                  (R = R ? R.__html : void 0),
                  N != null && R !== N && (y = y || []).push(z, N))
                : z === "children"
                  ? (typeof N != "string" && typeof N != "number") ||
                    (y = y || []).push(z, "" + N)
                  : z !== "suppressContentEditableWarning" &&
                    z !== "suppressHydrationWarning" &&
                    (o.hasOwnProperty(z)
                      ? (N != null && z === "onScroll" && qe("scroll", r),
                        y || R === N || (y = []))
                      : (y = y || []).push(z, N))
        }
        a && (y = y || []).push("style", a)
        var z = y
        ;(i.updateQueue = z) && (i.flags |= 4)
      }
    }),
    (n0 = function (r, i, a, c) {
      a !== c && (i.flags |= 4)
    })
  function Bl(r, i) {
    if (!Je)
      switch (r.tailMode) {
        case "hidden":
          i = r.tail
          for (var a = null; i !== null; )
            i.alternate !== null && (a = i), (i = i.sibling)
          a === null ? (r.tail = null) : (a.sibling = null)
          break
        case "collapsed":
          a = r.tail
          for (var c = null; a !== null; )
            a.alternate !== null && (c = a), (a = a.sibling)
          c === null
            ? i || r.tail === null
              ? (r.tail = null)
              : (r.tail.sibling = null)
            : (c.sibling = null)
      }
  }
  function Ft(r) {
    var i = r.alternate !== null && r.alternate.child === r.child,
      a = 0,
      c = 0
    if (i)
      for (var p = r.child; p !== null; )
        (a |= p.lanes | p.childLanes),
          (c |= p.subtreeFlags & 14680064),
          (c |= p.flags & 14680064),
          (p.return = r),
          (p = p.sibling)
    else
      for (p = r.child; p !== null; )
        (a |= p.lanes | p.childLanes),
          (c |= p.subtreeFlags),
          (c |= p.flags),
          (p.return = r),
          (p = p.sibling)
    return (r.subtreeFlags |= c), (r.childLanes = a), i
  }
  function Wk(r, i, a) {
    var c = i.pendingProps
    switch ((jh(i), i.tag)) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Ft(i), null
      case 1:
        return en(i.type) && wc(), Ft(i), null
      case 3:
        return (
          (c = i.stateNode),
          Ko(),
          Qe(Jt),
          Qe(Lt),
          qh(),
          c.pendingContext &&
            ((c.context = c.pendingContext), (c.pendingContext = null)),
          (r === null || r.child === null) &&
            (Cc(i)
              ? (i.flags |= 4)
              : r === null ||
                (r.memoizedState.isDehydrated && (i.flags & 256) === 0) ||
                ((i.flags |= 1024), zn !== null && (Cp(zn), (zn = null)))),
          hp(r, i),
          Ft(i),
          null
        )
      case 5:
        Gh(i)
        var p = ks(Ml.current)
        if (((a = i.type), r !== null && i.stateNode != null))
          t0(r, i, a, c, p),
            r.ref !== i.ref && ((i.flags |= 512), (i.flags |= 2097152))
        else {
          if (!c) {
            if (i.stateNode === null) throw Error(n(166))
            return Ft(i), null
          }
          if (((r = ks(vr.current)), Cc(i))) {
            ;(c = i.stateNode), (a = i.type)
            var y = i.memoizedProps
            switch (((c[yr] = i), (c[Al] = y), (r = (i.mode & 1) !== 0), a)) {
              case "dialog":
                qe("cancel", c), qe("close", c)
                break
              case "iframe":
              case "object":
              case "embed":
                qe("load", c)
                break
              case "video":
              case "audio":
                for (p = 0; p < _l.length; p++) qe(_l[p], c)
                break
              case "source":
                qe("error", c)
                break
              case "img":
              case "image":
              case "link":
                qe("error", c), qe("load", c)
                break
              case "details":
                qe("toggle", c)
                break
              case "input":
                ms(c, y), qe("invalid", c)
                break
              case "select":
                ;(c._wrapperState = { wasMultiple: !!y.multiple }),
                  qe("invalid", c)
                break
              case "textarea":
                il(c, y), qe("invalid", c)
            }
            Kd(a, y), (p = null)
            for (var k in y)
              if (y.hasOwnProperty(k)) {
                var R = y[k]
                k === "children"
                  ? typeof R == "string"
                    ? c.textContent !== R &&
                      (y.suppressHydrationWarning !== !0 &&
                        gc(c.textContent, R, r),
                      (p = ["children", R]))
                    : typeof R == "number" &&
                      c.textContent !== "" + R &&
                      (y.suppressHydrationWarning !== !0 &&
                        gc(c.textContent, R, r),
                      (p = ["children", "" + R]))
                  : o.hasOwnProperty(k) &&
                    R != null &&
                    k === "onScroll" &&
                    qe("scroll", c)
              }
            switch (a) {
              case "input":
                Dt(c), ko(c, y, !0)
                break
              case "textarea":
                Dt(c), ol(c)
                break
              case "select":
              case "option":
                break
              default:
                typeof y.onClick == "function" && (c.onclick = yc)
            }
            ;(c = p), (i.updateQueue = c), c !== null && (i.flags |= 4)
          } else {
            ;(k = p.nodeType === 9 ? p : p.ownerDocument),
              r === "http://www.w3.org/1999/xhtml" && (r = al(a)),
              r === "http://www.w3.org/1999/xhtml"
                ? a === "script"
                  ? ((r = k.createElement("div")),
                    (r.innerHTML = "<script></script>"),
                    (r = r.removeChild(r.firstChild)))
                  : typeof c.is == "string"
                    ? (r = k.createElement(a, { is: c.is }))
                    : ((r = k.createElement(a)),
                      a === "select" &&
                        ((k = r),
                        c.multiple
                          ? (k.multiple = !0)
                          : c.size && (k.size = c.size)))
                : (r = k.createElementNS(r, a)),
              (r[yr] = i),
              (r[Al] = c),
              e0(r, i, !1, !1),
              (i.stateNode = r)
            e: {
              switch (((k = qd(a, c)), a)) {
                case "dialog":
                  qe("cancel", r), qe("close", r), (p = c)
                  break
                case "iframe":
                case "object":
                case "embed":
                  qe("load", r), (p = c)
                  break
                case "video":
                case "audio":
                  for (p = 0; p < _l.length; p++) qe(_l[p], r)
                  p = c
                  break
                case "source":
                  qe("error", r), (p = c)
                  break
                case "img":
                case "image":
                case "link":
                  qe("error", r), qe("load", r), (p = c)
                  break
                case "details":
                  qe("toggle", r), (p = c)
                  break
                case "input":
                  ms(r, c), (p = Br(r, c)), qe("invalid", r)
                  break
                case "option":
                  p = c
                  break
                case "select":
                  ;(r._wrapperState = { wasMultiple: !!c.multiple }),
                    (p = V({}, c, { value: void 0 })),
                    qe("invalid", r)
                  break
                case "textarea":
                  il(r, c), (p = ys(r, c)), qe("invalid", r)
                  break
                default:
                  p = c
              }
              Kd(a, p), (R = p)
              for (y in R)
                if (R.hasOwnProperty(y)) {
                  var N = R[y]
                  y === "style"
                    ? Hy(r, N)
                    : y === "dangerouslySetInnerHTML"
                      ? ((N = N ? N.__html : void 0), N != null && Qu(r, N))
                      : y === "children"
                        ? typeof N == "string"
                          ? (a !== "textarea" || N !== "") && vs(r, N)
                          : typeof N == "number" && vs(r, "" + N)
                        : y !== "suppressContentEditableWarning" &&
                          y !== "suppressHydrationWarning" &&
                          y !== "autoFocus" &&
                          (o.hasOwnProperty(y)
                            ? N != null && y === "onScroll" && qe("scroll", r)
                            : N != null && O(r, y, N, k))
                }
              switch (a) {
                case "input":
                  Dt(r), ko(r, c, !1)
                  break
                case "textarea":
                  Dt(r), ol(r)
                  break
                case "option":
                  c.value != null && r.setAttribute("value", "" + ke(c.value))
                  break
                case "select":
                  ;(r.multiple = !!c.multiple),
                    (y = c.value),
                    y != null
                      ? Fr(r, !!c.multiple, y, !1)
                      : c.defaultValue != null &&
                        Fr(r, !!c.multiple, c.defaultValue, !0)
                  break
                default:
                  typeof p.onClick == "function" && (r.onclick = yc)
              }
              switch (a) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  c = !!c.autoFocus
                  break e
                case "img":
                  c = !0
                  break e
                default:
                  c = !1
              }
            }
            c && (i.flags |= 4)
          }
          i.ref !== null && ((i.flags |= 512), (i.flags |= 2097152))
        }
        return Ft(i), null
      case 6:
        if (r && i.stateNode != null) n0(r, i, r.memoizedProps, c)
        else {
          if (typeof c != "string" && i.stateNode === null) throw Error(n(166))
          if (((a = ks(Ml.current)), ks(vr.current), Cc(i))) {
            if (
              ((c = i.stateNode),
              (a = i.memoizedProps),
              (c[yr] = i),
              (y = c.nodeValue !== a) && ((r = pn), r !== null))
            )
              switch (r.tag) {
                case 3:
                  gc(c.nodeValue, a, (r.mode & 1) !== 0)
                  break
                case 5:
                  r.memoizedProps.suppressHydrationWarning !== !0 &&
                    gc(c.nodeValue, a, (r.mode & 1) !== 0)
              }
            y && (i.flags |= 4)
          } else
            (c = (a.nodeType === 9 ? a : a.ownerDocument).createTextNode(c)),
              (c[yr] = i),
              (i.stateNode = c)
        }
        return Ft(i), null
      case 13:
        if (
          (Qe(nt),
          (c = i.memoizedState),
          r === null ||
            (r.memoizedState !== null && r.memoizedState.dehydrated !== null))
        ) {
          if (Je && mn !== null && (i.mode & 1) !== 0 && (i.flags & 128) === 0)
            sw(), Wo(), (i.flags |= 98560), (y = !1)
          else if (((y = Cc(i)), c !== null && c.dehydrated !== null)) {
            if (r === null) {
              if (!y) throw Error(n(318))
              if (
                ((y = i.memoizedState),
                (y = y !== null ? y.dehydrated : null),
                !y)
              )
                throw Error(n(317))
              y[yr] = i
            } else
              Wo(),
                (i.flags & 128) === 0 && (i.memoizedState = null),
                (i.flags |= 4)
            Ft(i), (y = !1)
          } else zn !== null && (Cp(zn), (zn = null)), (y = !0)
          if (!y) return i.flags & 65536 ? i : null
        }
        return (i.flags & 128) !== 0
          ? ((i.lanes = a), i)
          : ((c = c !== null),
            c !== (r !== null && r.memoizedState !== null) &&
              c &&
              ((i.child.flags |= 8192),
              (i.mode & 1) !== 0 &&
                (r === null || (nt.current & 1) !== 0
                  ? wt === 0 && (wt = 3)
                  : Op())),
            i.updateQueue !== null && (i.flags |= 4),
            Ft(i),
            null)
      case 4:
        return (
          Ko(),
          hp(r, i),
          r === null && kl(i.stateNode.containerInfo),
          Ft(i),
          null
        )
      case 10:
        return zh(i.type._context), Ft(i), null
      case 17:
        return en(i.type) && wc(), Ft(i), null
      case 19:
        if ((Qe(nt), (y = i.memoizedState), y === null)) return Ft(i), null
        if (((c = (i.flags & 128) !== 0), (k = y.rendering), k === null))
          if (c) Bl(y, !1)
          else {
            if (wt !== 0 || (r !== null && (r.flags & 128) !== 0))
              for (r = i.child; r !== null; ) {
                if (((k = Rc(r)), k !== null)) {
                  for (
                    i.flags |= 128,
                      Bl(y, !1),
                      c = k.updateQueue,
                      c !== null && ((i.updateQueue = c), (i.flags |= 4)),
                      i.subtreeFlags = 0,
                      c = a,
                      a = i.child;
                    a !== null;

                  )
                    (y = a),
                      (r = c),
                      (y.flags &= 14680066),
                      (k = y.alternate),
                      k === null
                        ? ((y.childLanes = 0),
                          (y.lanes = r),
                          (y.child = null),
                          (y.subtreeFlags = 0),
                          (y.memoizedProps = null),
                          (y.memoizedState = null),
                          (y.updateQueue = null),
                          (y.dependencies = null),
                          (y.stateNode = null))
                        : ((y.childLanes = k.childLanes),
                          (y.lanes = k.lanes),
                          (y.child = k.child),
                          (y.subtreeFlags = 0),
                          (y.deletions = null),
                          (y.memoizedProps = k.memoizedProps),
                          (y.memoizedState = k.memoizedState),
                          (y.updateQueue = k.updateQueue),
                          (y.type = k.type),
                          (r = k.dependencies),
                          (y.dependencies =
                            r === null
                              ? null
                              : {
                                  lanes: r.lanes,
                                  firstContext: r.firstContext,
                                })),
                      (a = a.sibling)
                  return Ge(nt, (nt.current & 1) | 2), i.child
                }
                r = r.sibling
              }
            y.tail !== null &&
              ht() > Xo &&
              ((i.flags |= 128), (c = !0), Bl(y, !1), (i.lanes = 4194304))
          }
        else {
          if (!c)
            if (((r = Rc(k)), r !== null)) {
              if (
                ((i.flags |= 128),
                (c = !0),
                (a = r.updateQueue),
                a !== null && ((i.updateQueue = a), (i.flags |= 4)),
                Bl(y, !0),
                y.tail === null &&
                  y.tailMode === "hidden" &&
                  !k.alternate &&
                  !Je)
              )
                return Ft(i), null
            } else
              2 * ht() - y.renderingStartTime > Xo &&
                a !== 1073741824 &&
                ((i.flags |= 128), (c = !0), Bl(y, !1), (i.lanes = 4194304))
          y.isBackwards
            ? ((k.sibling = i.child), (i.child = k))
            : ((a = y.last),
              a !== null ? (a.sibling = k) : (i.child = k),
              (y.last = k))
        }
        return y.tail !== null
          ? ((i = y.tail),
            (y.rendering = i),
            (y.tail = i.sibling),
            (y.renderingStartTime = ht()),
            (i.sibling = null),
            (a = nt.current),
            Ge(nt, c ? (a & 1) | 2 : a & 1),
            i)
          : (Ft(i), null)
      case 22:
      case 23:
        return (
          kp(),
          (c = i.memoizedState !== null),
          r !== null && (r.memoizedState !== null) !== c && (i.flags |= 8192),
          c && (i.mode & 1) !== 0
            ? (gn & 1073741824) !== 0 &&
              (Ft(i), i.subtreeFlags & 6 && (i.flags |= 8192))
            : Ft(i),
          null
        )
      case 24:
        return null
      case 25:
        return null
    }
    throw Error(n(156, i.tag))
  }
  function Vk(r, i) {
    switch ((jh(i), i.tag)) {
      case 1:
        return (
          en(i.type) && wc(),
          (r = i.flags),
          r & 65536 ? ((i.flags = (r & -65537) | 128), i) : null
        )
      case 3:
        return (
          Ko(),
          Qe(Jt),
          Qe(Lt),
          qh(),
          (r = i.flags),
          (r & 65536) !== 0 && (r & 128) === 0
            ? ((i.flags = (r & -65537) | 128), i)
            : null
        )
      case 5:
        return Gh(i), null
      case 13:
        if (
          (Qe(nt), (r = i.memoizedState), r !== null && r.dehydrated !== null)
        ) {
          if (i.alternate === null) throw Error(n(340))
          Wo()
        }
        return (
          (r = i.flags), r & 65536 ? ((i.flags = (r & -65537) | 128), i) : null
        )
      case 19:
        return Qe(nt), null
      case 4:
        return Ko(), null
      case 10:
        return zh(i.type._context), null
      case 22:
      case 23:
        return kp(), null
      case 24:
        return null
      default:
        return null
    }
  }
  var Fc = !1,
    Ut = !1,
    Hk = typeof WeakSet == "function" ? WeakSet : Set,
    ce = null
  function Qo(r, i) {
    var a = r.ref
    if (a !== null)
      if (typeof a == "function")
        try {
          a(null)
        } catch (c) {
          ot(r, i, c)
        }
      else a.current = null
  }
  function pp(r, i, a) {
    try {
      a()
    } catch (c) {
      ot(r, i, c)
    }
  }
  var r0 = !1
  function Gk(r, i) {
    if (((kh = sc), (r = jv()), vh(r))) {
      if ("selectionStart" in r)
        var a = { start: r.selectionStart, end: r.selectionEnd }
      else
        e: {
          a = ((a = r.ownerDocument) && a.defaultView) || window
          var c = a.getSelection && a.getSelection()
          if (c && c.rangeCount !== 0) {
            a = c.anchorNode
            var p = c.anchorOffset,
              y = c.focusNode
            c = c.focusOffset
            try {
              a.nodeType, y.nodeType
            } catch {
              a = null
              break e
            }
            var k = 0,
              R = -1,
              N = -1,
              z = 0,
              X = 0,
              J = r,
              Y = null
            t: for (;;) {
              for (
                var ae;
                J !== a || (p !== 0 && J.nodeType !== 3) || (R = k + p),
                  J !== y || (c !== 0 && J.nodeType !== 3) || (N = k + c),
                  J.nodeType === 3 && (k += J.nodeValue.length),
                  (ae = J.firstChild) !== null;

              )
                (Y = J), (J = ae)
              for (;;) {
                if (J === r) break t
                if (
                  (Y === a && ++z === p && (R = k),
                  Y === y && ++X === c && (N = k),
                  (ae = J.nextSibling) !== null)
                )
                  break
                ;(J = Y), (Y = J.parentNode)
              }
              J = ae
            }
            a = R === -1 || N === -1 ? null : { start: R, end: N }
          } else a = null
        }
      a = a || { start: 0, end: 0 }
    } else a = null
    for (
      Oh = { focusedElem: r, selectionRange: a }, sc = !1, ce = i;
      ce !== null;

    )
      if (
        ((i = ce), (r = i.child), (i.subtreeFlags & 1028) !== 0 && r !== null)
      )
        (r.return = i), (ce = r)
      else
        for (; ce !== null; ) {
          i = ce
          try {
            var fe = i.alternate
            if ((i.flags & 1024) !== 0)
              switch (i.tag) {
                case 0:
                case 11:
                case 15:
                  break
                case 1:
                  if (fe !== null) {
                    var de = fe.memoizedProps,
                      pt = fe.memoizedState,
                      L = i.stateNode,
                      j = L.getSnapshotBeforeUpdate(
                        i.elementType === i.type ? de : $n(i.type, de),
                        pt,
                      )
                    L.__reactInternalSnapshotBeforeUpdate = j
                  }
                  break
                case 3:
                  var F = i.stateNode.containerInfo
                  F.nodeType === 1
                    ? (F.textContent = "")
                    : F.nodeType === 9 &&
                      F.documentElement &&
                      F.removeChild(F.documentElement)
                  break
                case 5:
                case 6:
                case 4:
                case 17:
                  break
                default:
                  throw Error(n(163))
              }
          } catch (ee) {
            ot(i, i.return, ee)
          }
          if (((r = i.sibling), r !== null)) {
            ;(r.return = i.return), (ce = r)
            break
          }
          ce = i.return
        }
    return (fe = r0), (r0 = !1), fe
  }
  function Fl(r, i, a) {
    var c = i.updateQueue
    if (((c = c !== null ? c.lastEffect : null), c !== null)) {
      var p = (c = c.next)
      do {
        if ((p.tag & r) === r) {
          var y = p.destroy
          ;(p.destroy = void 0), y !== void 0 && pp(i, a, y)
        }
        p = p.next
      } while (p !== c)
    }
  }
  function Uc(r, i) {
    if (
      ((i = i.updateQueue), (i = i !== null ? i.lastEffect : null), i !== null)
    ) {
      var a = (i = i.next)
      do {
        if ((a.tag & r) === r) {
          var c = a.create
          a.destroy = c()
        }
        a = a.next
      } while (a !== i)
    }
  }
  function mp(r) {
    var i = r.ref
    if (i !== null) {
      var a = r.stateNode
      switch (r.tag) {
        case 5:
          r = a
          break
        default:
          r = a
      }
      typeof i == "function" ? i(r) : (i.current = r)
    }
  }
  function i0(r) {
    var i = r.alternate
    i !== null && ((r.alternate = null), i0(i)),
      (r.child = null),
      (r.deletions = null),
      (r.sibling = null),
      r.tag === 5 &&
        ((i = r.stateNode),
        i !== null &&
          (delete i[yr],
          delete i[Al],
          delete i[Ph],
          delete i[Ak],
          delete i[Tk])),
      (r.stateNode = null),
      (r.return = null),
      (r.dependencies = null),
      (r.memoizedProps = null),
      (r.memoizedState = null),
      (r.pendingProps = null),
      (r.stateNode = null),
      (r.updateQueue = null)
  }
  function s0(r) {
    return r.tag === 5 || r.tag === 3 || r.tag === 4
  }
  function o0(r) {
    e: for (;;) {
      for (; r.sibling === null; ) {
        if (r.return === null || s0(r.return)) return null
        r = r.return
      }
      for (
        r.sibling.return = r.return, r = r.sibling;
        r.tag !== 5 && r.tag !== 6 && r.tag !== 18;

      ) {
        if (r.flags & 2 || r.child === null || r.tag === 4) continue e
        ;(r.child.return = r), (r = r.child)
      }
      if (!(r.flags & 2)) return r.stateNode
    }
  }
  function gp(r, i, a) {
    var c = r.tag
    if (c === 5 || c === 6)
      (r = r.stateNode),
        i
          ? a.nodeType === 8
            ? a.parentNode.insertBefore(r, i)
            : a.insertBefore(r, i)
          : (a.nodeType === 8
              ? ((i = a.parentNode), i.insertBefore(r, a))
              : ((i = a), i.appendChild(r)),
            (a = a._reactRootContainer),
            a != null || i.onclick !== null || (i.onclick = yc))
    else if (c !== 4 && ((r = r.child), r !== null))
      for (gp(r, i, a), r = r.sibling; r !== null; )
        gp(r, i, a), (r = r.sibling)
  }
  function yp(r, i, a) {
    var c = r.tag
    if (c === 5 || c === 6)
      (r = r.stateNode), i ? a.insertBefore(r, i) : a.appendChild(r)
    else if (c !== 4 && ((r = r.child), r !== null))
      for (yp(r, i, a), r = r.sibling; r !== null; )
        yp(r, i, a), (r = r.sibling)
  }
  var Pt = null,
    Wn = !1
  function Mi(r, i, a) {
    for (a = a.child; a !== null; ) a0(r, i, a), (a = a.sibling)
  }
  function a0(r, i, a) {
    if (gr && typeof gr.onCommitFiberUnmount == "function")
      try {
        gr.onCommitFiberUnmount(Ju, a)
      } catch {}
    switch (a.tag) {
      case 5:
        Ut || Qo(a, i)
      case 6:
        var c = Pt,
          p = Wn
        ;(Pt = null),
          Mi(r, i, a),
          (Pt = c),
          (Wn = p),
          Pt !== null &&
            (Wn
              ? ((r = Pt),
                (a = a.stateNode),
                r.nodeType === 8
                  ? r.parentNode.removeChild(a)
                  : r.removeChild(a))
              : Pt.removeChild(a.stateNode))
        break
      case 18:
        Pt !== null &&
          (Wn
            ? ((r = Pt),
              (a = a.stateNode),
              r.nodeType === 8
                ? Rh(r.parentNode, a)
                : r.nodeType === 1 && Rh(r, a),
              yl(r))
            : Rh(Pt, a.stateNode))
        break
      case 4:
        ;(c = Pt),
          (p = Wn),
          (Pt = a.stateNode.containerInfo),
          (Wn = !0),
          Mi(r, i, a),
          (Pt = c),
          (Wn = p)
        break
      case 0:
      case 11:
      case 14:
      case 15:
        if (
          !Ut &&
          ((c = a.updateQueue), c !== null && ((c = c.lastEffect), c !== null))
        ) {
          p = c = c.next
          do {
            var y = p,
              k = y.destroy
            ;(y = y.tag),
              k !== void 0 && ((y & 2) !== 0 || (y & 4) !== 0) && pp(a, i, k),
              (p = p.next)
          } while (p !== c)
        }
        Mi(r, i, a)
        break
      case 1:
        if (
          !Ut &&
          (Qo(a, i),
          (c = a.stateNode),
          typeof c.componentWillUnmount == "function")
        )
          try {
            ;(c.props = a.memoizedProps),
              (c.state = a.memoizedState),
              c.componentWillUnmount()
          } catch (R) {
            ot(a, i, R)
          }
        Mi(r, i, a)
        break
      case 21:
        Mi(r, i, a)
        break
      case 22:
        a.mode & 1
          ? ((Ut = (c = Ut) || a.memoizedState !== null), Mi(r, i, a), (Ut = c))
          : Mi(r, i, a)
        break
      default:
        Mi(r, i, a)
    }
  }
  function l0(r) {
    var i = r.updateQueue
    if (i !== null) {
      r.updateQueue = null
      var a = r.stateNode
      a === null && (a = r.stateNode = new Hk()),
        i.forEach(function (c) {
          var p = t2.bind(null, r, c)
          a.has(c) || (a.add(c), c.then(p, p))
        })
    }
  }
  function Vn(r, i) {
    var a = i.deletions
    if (a !== null)
      for (var c = 0; c < a.length; c++) {
        var p = a[c]
        try {
          var y = r,
            k = i,
            R = k
          e: for (; R !== null; ) {
            switch (R.tag) {
              case 5:
                ;(Pt = R.stateNode), (Wn = !1)
                break e
              case 3:
                ;(Pt = R.stateNode.containerInfo), (Wn = !0)
                break e
              case 4:
                ;(Pt = R.stateNode.containerInfo), (Wn = !0)
                break e
            }
            R = R.return
          }
          if (Pt === null) throw Error(n(160))
          a0(y, k, p), (Pt = null), (Wn = !1)
          var N = p.alternate
          N !== null && (N.return = null), (p.return = null)
        } catch (z) {
          ot(p, i, z)
        }
      }
    if (i.subtreeFlags & 12854)
      for (i = i.child; i !== null; ) u0(i, r), (i = i.sibling)
  }
  function u0(r, i) {
    var a = r.alternate,
      c = r.flags
    switch (r.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if ((Vn(i, r), Sr(r), c & 4)) {
          try {
            Fl(3, r, r.return), Uc(3, r)
          } catch (de) {
            ot(r, r.return, de)
          }
          try {
            Fl(5, r, r.return)
          } catch (de) {
            ot(r, r.return, de)
          }
        }
        break
      case 1:
        Vn(i, r), Sr(r), c & 512 && a !== null && Qo(a, a.return)
        break
      case 5:
        if (
          (Vn(i, r),
          Sr(r),
          c & 512 && a !== null && Qo(a, a.return),
          r.flags & 32)
        ) {
          var p = r.stateNode
          try {
            vs(p, "")
          } catch (de) {
            ot(r, r.return, de)
          }
        }
        if (c & 4 && ((p = r.stateNode), p != null)) {
          var y = r.memoizedProps,
            k = a !== null ? a.memoizedProps : y,
            R = r.type,
            N = r.updateQueue
          if (((r.updateQueue = null), N !== null))
            try {
              R === "input" && y.type === "radio" && y.name != null && _o(p, y),
                qd(R, k)
              var z = qd(R, y)
              for (k = 0; k < N.length; k += 2) {
                var X = N[k],
                  J = N[k + 1]
                X === "style"
                  ? Hy(p, J)
                  : X === "dangerouslySetInnerHTML"
                    ? Qu(p, J)
                    : X === "children"
                      ? vs(p, J)
                      : O(p, X, J, z)
              }
              switch (R) {
                case "input":
                  gs(p, y)
                  break
                case "textarea":
                  sl(p, y)
                  break
                case "select":
                  var Y = p._wrapperState.wasMultiple
                  p._wrapperState.wasMultiple = !!y.multiple
                  var ae = y.value
                  ae != null
                    ? Fr(p, !!y.multiple, ae, !1)
                    : Y !== !!y.multiple &&
                      (y.defaultValue != null
                        ? Fr(p, !!y.multiple, y.defaultValue, !0)
                        : Fr(p, !!y.multiple, y.multiple ? [] : "", !1))
              }
              p[Al] = y
            } catch (de) {
              ot(r, r.return, de)
            }
        }
        break
      case 6:
        if ((Vn(i, r), Sr(r), c & 4)) {
          if (r.stateNode === null) throw Error(n(162))
          ;(p = r.stateNode), (y = r.memoizedProps)
          try {
            p.nodeValue = y
          } catch (de) {
            ot(r, r.return, de)
          }
        }
        break
      case 3:
        if (
          (Vn(i, r), Sr(r), c & 4 && a !== null && a.memoizedState.isDehydrated)
        )
          try {
            yl(i.containerInfo)
          } catch (de) {
            ot(r, r.return, de)
          }
        break
      case 4:
        Vn(i, r), Sr(r)
        break
      case 13:
        Vn(i, r),
          Sr(r),
          (p = r.child),
          p.flags & 8192 &&
            ((y = p.memoizedState !== null),
            (p.stateNode.isHidden = y),
            !y ||
              (p.alternate !== null && p.alternate.memoizedState !== null) ||
              (Sp = ht())),
          c & 4 && l0(r)
        break
      case 22:
        if (
          ((X = a !== null && a.memoizedState !== null),
          r.mode & 1 ? ((Ut = (z = Ut) || X), Vn(i, r), (Ut = z)) : Vn(i, r),
          Sr(r),
          c & 8192)
        ) {
          if (
            ((z = r.memoizedState !== null),
            (r.stateNode.isHidden = z) && !X && (r.mode & 1) !== 0)
          )
            for (ce = r, X = r.child; X !== null; ) {
              for (J = ce = X; ce !== null; ) {
                switch (((Y = ce), (ae = Y.child), Y.tag)) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    Fl(4, Y, Y.return)
                    break
                  case 1:
                    Qo(Y, Y.return)
                    var fe = Y.stateNode
                    if (typeof fe.componentWillUnmount == "function") {
                      ;(c = Y), (a = Y.return)
                      try {
                        ;(i = c),
                          (fe.props = i.memoizedProps),
                          (fe.state = i.memoizedState),
                          fe.componentWillUnmount()
                      } catch (de) {
                        ot(c, a, de)
                      }
                    }
                    break
                  case 5:
                    Qo(Y, Y.return)
                    break
                  case 22:
                    if (Y.memoizedState !== null) {
                      d0(J)
                      continue
                    }
                }
                ae !== null ? ((ae.return = Y), (ce = ae)) : d0(J)
              }
              X = X.sibling
            }
          e: for (X = null, J = r; ; ) {
            if (J.tag === 5) {
              if (X === null) {
                X = J
                try {
                  ;(p = J.stateNode),
                    z
                      ? ((y = p.style),
                        typeof y.setProperty == "function"
                          ? y.setProperty("display", "none", "important")
                          : (y.display = "none"))
                      : ((R = J.stateNode),
                        (N = J.memoizedProps.style),
                        (k =
                          N != null && N.hasOwnProperty("display")
                            ? N.display
                            : null),
                        (R.style.display = Vy("display", k)))
                } catch (de) {
                  ot(r, r.return, de)
                }
              }
            } else if (J.tag === 6) {
              if (X === null)
                try {
                  J.stateNode.nodeValue = z ? "" : J.memoizedProps
                } catch (de) {
                  ot(r, r.return, de)
                }
            } else if (
              ((J.tag !== 22 && J.tag !== 23) ||
                J.memoizedState === null ||
                J === r) &&
              J.child !== null
            ) {
              ;(J.child.return = J), (J = J.child)
              continue
            }
            if (J === r) break e
            for (; J.sibling === null; ) {
              if (J.return === null || J.return === r) break e
              X === J && (X = null), (J = J.return)
            }
            X === J && (X = null),
              (J.sibling.return = J.return),
              (J = J.sibling)
          }
        }
        break
      case 19:
        Vn(i, r), Sr(r), c & 4 && l0(r)
        break
      case 21:
        break
      default:
        Vn(i, r), Sr(r)
    }
  }
  function Sr(r) {
    var i = r.flags
    if (i & 2) {
      try {
        e: {
          for (var a = r.return; a !== null; ) {
            if (s0(a)) {
              var c = a
              break e
            }
            a = a.return
          }
          throw Error(n(160))
        }
        switch (c.tag) {
          case 5:
            var p = c.stateNode
            c.flags & 32 && (vs(p, ""), (c.flags &= -33))
            var y = o0(r)
            yp(r, y, p)
            break
          case 3:
          case 4:
            var k = c.stateNode.containerInfo,
              R = o0(r)
            gp(r, R, k)
            break
          default:
            throw Error(n(161))
        }
      } catch (N) {
        ot(r, r.return, N)
      }
      r.flags &= -3
    }
    i & 4096 && (r.flags &= -4097)
  }
  function Kk(r, i, a) {
    ;(ce = r), c0(r)
  }
  function c0(r, i, a) {
    for (var c = (r.mode & 1) !== 0; ce !== null; ) {
      var p = ce,
        y = p.child
      if (p.tag === 22 && c) {
        var k = p.memoizedState !== null || Fc
        if (!k) {
          var R = p.alternate,
            N = (R !== null && R.memoizedState !== null) || Ut
          R = Fc
          var z = Ut
          if (((Fc = k), (Ut = N) && !z))
            for (ce = p; ce !== null; )
              (k = ce),
                (N = k.child),
                k.tag === 22 && k.memoizedState !== null
                  ? h0(p)
                  : N !== null
                    ? ((N.return = k), (ce = N))
                    : h0(p)
          for (; y !== null; ) (ce = y), c0(y), (y = y.sibling)
          ;(ce = p), (Fc = R), (Ut = z)
        }
        f0(r)
      } else
        (p.subtreeFlags & 8772) !== 0 && y !== null
          ? ((y.return = p), (ce = y))
          : f0(r)
    }
  }
  function f0(r) {
    for (; ce !== null; ) {
      var i = ce
      if ((i.flags & 8772) !== 0) {
        var a = i.alternate
        try {
          if ((i.flags & 8772) !== 0)
            switch (i.tag) {
              case 0:
              case 11:
              case 15:
                Ut || Uc(5, i)
                break
              case 1:
                var c = i.stateNode
                if (i.flags & 4 && !Ut)
                  if (a === null) c.componentDidMount()
                  else {
                    var p =
                      i.elementType === i.type
                        ? a.memoizedProps
                        : $n(i.type, a.memoizedProps)
                    c.componentDidUpdate(
                      p,
                      a.memoizedState,
                      c.__reactInternalSnapshotBeforeUpdate,
                    )
                  }
                var y = i.updateQueue
                y !== null && dw(i, y, c)
                break
              case 3:
                var k = i.updateQueue
                if (k !== null) {
                  if (((a = null), i.child !== null))
                    switch (i.child.tag) {
                      case 5:
                        a = i.child.stateNode
                        break
                      case 1:
                        a = i.child.stateNode
                    }
                  dw(i, k, a)
                }
                break
              case 5:
                var R = i.stateNode
                if (a === null && i.flags & 4) {
                  a = R
                  var N = i.memoizedProps
                  switch (i.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      N.autoFocus && a.focus()
                      break
                    case "img":
                      N.src && (a.src = N.src)
                  }
                }
                break
              case 6:
                break
              case 4:
                break
              case 12:
                break
              case 13:
                if (i.memoizedState === null) {
                  var z = i.alternate
                  if (z !== null) {
                    var X = z.memoizedState
                    if (X !== null) {
                      var J = X.dehydrated
                      J !== null && yl(J)
                    }
                  }
                }
                break
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break
              default:
                throw Error(n(163))
            }
          Ut || (i.flags & 512 && mp(i))
        } catch (Y) {
          ot(i, i.return, Y)
        }
      }
      if (i === r) {
        ce = null
        break
      }
      if (((a = i.sibling), a !== null)) {
        ;(a.return = i.return), (ce = a)
        break
      }
      ce = i.return
    }
  }
  function d0(r) {
    for (; ce !== null; ) {
      var i = ce
      if (i === r) {
        ce = null
        break
      }
      var a = i.sibling
      if (a !== null) {
        ;(a.return = i.return), (ce = a)
        break
      }
      ce = i.return
    }
  }
  function h0(r) {
    for (; ce !== null; ) {
      var i = ce
      try {
        switch (i.tag) {
          case 0:
          case 11:
          case 15:
            var a = i.return
            try {
              Uc(4, i)
            } catch (N) {
              ot(i, a, N)
            }
            break
          case 1:
            var c = i.stateNode
            if (typeof c.componentDidMount == "function") {
              var p = i.return
              try {
                c.componentDidMount()
              } catch (N) {
                ot(i, p, N)
              }
            }
            var y = i.return
            try {
              mp(i)
            } catch (N) {
              ot(i, y, N)
            }
            break
          case 5:
            var k = i.return
            try {
              mp(i)
            } catch (N) {
              ot(i, k, N)
            }
        }
      } catch (N) {
        ot(i, i.return, N)
      }
      if (i === r) {
        ce = null
        break
      }
      var R = i.sibling
      if (R !== null) {
        ;(R.return = i.return), (ce = R)
        break
      }
      ce = i.return
    }
  }
  var qk = Math.ceil,
    zc = M.ReactCurrentDispatcher,
    vp = M.ReactCurrentOwner,
    Tn = M.ReactCurrentBatchConfig,
    De = 0,
    kt = null,
    gt = null,
    It = 0,
    gn = 0,
    Yo = Ai(0),
    wt = 0,
    Ul = null,
    As = 0,
    $c = 0,
    wp = 0,
    zl = null,
    nn = null,
    Sp = 0,
    Xo = 1 / 0,
    Kr = null,
    Wc = !1,
    xp = null,
    Ni = null,
    Vc = !1,
    ji = null,
    Hc = 0,
    $l = 0,
    Ep = null,
    Gc = -1,
    Kc = 0
  function Kt() {
    return (De & 6) !== 0 ? ht() : Gc !== -1 ? Gc : (Gc = ht())
  }
  function Di(r) {
    return (r.mode & 1) === 0
      ? 1
      : (De & 2) !== 0 && It !== 0
        ? It & -It
        : Pk.transition !== null
          ? (Kc === 0 && (Kc = ov()), Kc)
          : ((r = Ve),
            r !== 0 ||
              ((r = window.event), (r = r === void 0 ? 16 : mv(r.type))),
            r)
  }
  function Hn(r, i, a, c) {
    if (50 < $l) throw (($l = 0), (Ep = null), Error(n(185)))
    dl(r, a, c),
      ((De & 2) === 0 || r !== kt) &&
        (r === kt && ((De & 2) === 0 && ($c |= a), wt === 4 && Li(r, It)),
        rn(r, c),
        a === 1 &&
          De === 0 &&
          (i.mode & 1) === 0 &&
          ((Xo = ht() + 500), xc && Ri()))
  }
  function rn(r, i) {
    var a = r.callbackNode
    P_(r, i)
    var c = nc(r, r === kt ? It : 0)
    if (c === 0)
      a !== null && rv(a), (r.callbackNode = null), (r.callbackPriority = 0)
    else if (((i = c & -c), r.callbackPriority !== i)) {
      if ((a != null && rv(a), i === 1))
        r.tag === 0 ? Rk(m0.bind(null, r)) : ew(m0.bind(null, r)),
          kk(function () {
            ;(De & 6) === 0 && Ri()
          }),
          (a = null)
      else {
        switch (av(c)) {
          case 1:
            a = th
            break
          case 4:
            a = iv
            break
          case 16:
            a = Zu
            break
          case 536870912:
            a = sv
            break
          default:
            a = Zu
        }
        a = b0(a, p0.bind(null, r))
      }
      ;(r.callbackPriority = i), (r.callbackNode = a)
    }
  }
  function p0(r, i) {
    if (((Gc = -1), (Kc = 0), (De & 6) !== 0)) throw Error(n(327))
    var a = r.callbackNode
    if (Zo() && r.callbackNode !== a) return null
    var c = nc(r, r === kt ? It : 0)
    if (c === 0) return null
    if ((c & 30) !== 0 || (c & r.expiredLanes) !== 0 || i) i = qc(r, c)
    else {
      i = c
      var p = De
      De |= 2
      var y = y0()
      ;(kt !== r || It !== i) && ((Kr = null), (Xo = ht() + 500), Rs(r, i))
      do
        try {
          Xk()
          break
        } catch (R) {
          g0(r, R)
        }
      while (!0)
      Uh(),
        (zc.current = y),
        (De = p),
        gt !== null ? (i = 0) : ((kt = null), (It = 0), (i = wt))
    }
    if (i !== 0) {
      if (
        (i === 2 && ((p = nh(r)), p !== 0 && ((c = p), (i = bp(r, p)))),
        i === 1)
      )
        throw ((a = Ul), Rs(r, 0), Li(r, c), rn(r, ht()), a)
      if (i === 6) Li(r, c)
      else {
        if (
          ((p = r.current.alternate),
          (c & 30) === 0 &&
            !Qk(p) &&
            ((i = qc(r, c)),
            i === 2 && ((y = nh(r)), y !== 0 && ((c = y), (i = bp(r, y)))),
            i === 1))
        )
          throw ((a = Ul), Rs(r, 0), Li(r, c), rn(r, ht()), a)
        switch (((r.finishedWork = p), (r.finishedLanes = c), i)) {
          case 0:
          case 1:
            throw Error(n(345))
          case 2:
            Ps(r, nn, Kr)
            break
          case 3:
            if (
              (Li(r, c),
              (c & 130023424) === c && ((i = Sp + 500 - ht()), 10 < i))
            ) {
              if (nc(r, 0) !== 0) break
              if (((p = r.suspendedLanes), (p & c) !== c)) {
                Kt(), (r.pingedLanes |= r.suspendedLanes & p)
                break
              }
              r.timeoutHandle = Th(Ps.bind(null, r, nn, Kr), i)
              break
            }
            Ps(r, nn, Kr)
            break
          case 4:
            if ((Li(r, c), (c & 4194240) === c)) break
            for (i = r.eventTimes, p = -1; 0 < c; ) {
              var k = 31 - Fn(c)
              ;(y = 1 << k), (k = i[k]), k > p && (p = k), (c &= ~y)
            }
            if (
              ((c = p),
              (c = ht() - c),
              (c =
                (120 > c
                  ? 120
                  : 480 > c
                    ? 480
                    : 1080 > c
                      ? 1080
                      : 1920 > c
                        ? 1920
                        : 3e3 > c
                          ? 3e3
                          : 4320 > c
                            ? 4320
                            : 1960 * qk(c / 1960)) - c),
              10 < c)
            ) {
              r.timeoutHandle = Th(Ps.bind(null, r, nn, Kr), c)
              break
            }
            Ps(r, nn, Kr)
            break
          case 5:
            Ps(r, nn, Kr)
            break
          default:
            throw Error(n(329))
        }
      }
    }
    return rn(r, ht()), r.callbackNode === a ? p0.bind(null, r) : null
  }
  function bp(r, i) {
    var a = zl
    return (
      r.current.memoizedState.isDehydrated && (Rs(r, i).flags |= 256),
      (r = qc(r, i)),
      r !== 2 && ((i = nn), (nn = a), i !== null && Cp(i)),
      r
    )
  }
  function Cp(r) {
    nn === null ? (nn = r) : nn.push.apply(nn, r)
  }
  function Qk(r) {
    for (var i = r; ; ) {
      if (i.flags & 16384) {
        var a = i.updateQueue
        if (a !== null && ((a = a.stores), a !== null))
          for (var c = 0; c < a.length; c++) {
            var p = a[c],
              y = p.getSnapshot
            p = p.value
            try {
              if (!Un(y(), p)) return !1
            } catch {
              return !1
            }
          }
      }
      if (((a = i.child), i.subtreeFlags & 16384 && a !== null))
        (a.return = i), (i = a)
      else {
        if (i === r) break
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === r) return !0
          i = i.return
        }
        ;(i.sibling.return = i.return), (i = i.sibling)
      }
    }
    return !0
  }
  function Li(r, i) {
    for (
      i &= ~wp,
        i &= ~$c,
        r.suspendedLanes |= i,
        r.pingedLanes &= ~i,
        r = r.expirationTimes;
      0 < i;

    ) {
      var a = 31 - Fn(i),
        c = 1 << a
      ;(r[a] = -1), (i &= ~c)
    }
  }
  function m0(r) {
    if ((De & 6) !== 0) throw Error(n(327))
    Zo()
    var i = nc(r, 0)
    if ((i & 1) === 0) return rn(r, ht()), null
    var a = qc(r, i)
    if (r.tag !== 0 && a === 2) {
      var c = nh(r)
      c !== 0 && ((i = c), (a = bp(r, c)))
    }
    if (a === 1) throw ((a = Ul), Rs(r, 0), Li(r, i), rn(r, ht()), a)
    if (a === 6) throw Error(n(345))
    return (
      (r.finishedWork = r.current.alternate),
      (r.finishedLanes = i),
      Ps(r, nn, Kr),
      rn(r, ht()),
      null
    )
  }
  function _p(r, i) {
    var a = De
    De |= 1
    try {
      return r(i)
    } finally {
      ;(De = a), De === 0 && ((Xo = ht() + 500), xc && Ri())
    }
  }
  function Ts(r) {
    ji !== null && ji.tag === 0 && (De & 6) === 0 && Zo()
    var i = De
    De |= 1
    var a = Tn.transition,
      c = Ve
    try {
      if (((Tn.transition = null), (Ve = 1), r)) return r()
    } finally {
      ;(Ve = c), (Tn.transition = a), (De = i), (De & 6) === 0 && Ri()
    }
  }
  function kp() {
    ;(gn = Yo.current), Qe(Yo)
  }
  function Rs(r, i) {
    ;(r.finishedWork = null), (r.finishedLanes = 0)
    var a = r.timeoutHandle
    if ((a !== -1 && ((r.timeoutHandle = -1), _k(a)), gt !== null))
      for (a = gt.return; a !== null; ) {
        var c = a
        switch ((jh(c), c.tag)) {
          case 1:
            ;(c = c.type.childContextTypes), c != null && wc()
            break
          case 3:
            Ko(), Qe(Jt), Qe(Lt), qh()
            break
          case 5:
            Gh(c)
            break
          case 4:
            Ko()
            break
          case 13:
            Qe(nt)
            break
          case 19:
            Qe(nt)
            break
          case 10:
            zh(c.type._context)
            break
          case 22:
          case 23:
            kp()
        }
        a = a.return
      }
    if (
      ((kt = r),
      (gt = r = Bi(r.current, null)),
      (It = gn = i),
      (wt = 0),
      (Ul = null),
      (wp = $c = As = 0),
      (nn = zl = null),
      _s !== null)
    ) {
      for (i = 0; i < _s.length; i++)
        if (((a = _s[i]), (c = a.interleaved), c !== null)) {
          a.interleaved = null
          var p = c.next,
            y = a.pending
          if (y !== null) {
            var k = y.next
            ;(y.next = p), (c.next = k)
          }
          a.pending = c
        }
      _s = null
    }
    return r
  }
  function g0(r, i) {
    do {
      var a = gt
      try {
        if ((Uh(), (Pc.current = jc), Ic)) {
          for (var c = rt.memoizedState; c !== null; ) {
            var p = c.queue
            p !== null && (p.pending = null), (c = c.next)
          }
          Ic = !1
        }
        if (
          ((Os = 0),
          (_t = vt = rt = null),
          (Nl = !1),
          (jl = 0),
          (vp.current = null),
          a === null || a.return === null)
        ) {
          ;(wt = 1), (Ul = i), (gt = null)
          break
        }
        e: {
          var y = r,
            k = a.return,
            R = a,
            N = i
          if (
            ((i = It),
            (R.flags |= 32768),
            N !== null && typeof N == "object" && typeof N.then == "function")
          ) {
            var z = N,
              X = R,
              J = X.tag
            if ((X.mode & 1) === 0 && (J === 0 || J === 11 || J === 15)) {
              var Y = X.alternate
              Y
                ? ((X.updateQueue = Y.updateQueue),
                  (X.memoizedState = Y.memoizedState),
                  (X.lanes = Y.lanes))
                : ((X.updateQueue = null), (X.memoizedState = null))
            }
            var ae = zw(k)
            if (ae !== null) {
              ;(ae.flags &= -257),
                $w(ae, k, R, y, i),
                ae.mode & 1 && Uw(y, z, i),
                (i = ae),
                (N = z)
              var fe = i.updateQueue
              if (fe === null) {
                var de = new Set()
                de.add(N), (i.updateQueue = de)
              } else fe.add(N)
              break e
            } else {
              if ((i & 1) === 0) {
                Uw(y, z, i), Op()
                break e
              }
              N = Error(n(426))
            }
          } else if (Je && R.mode & 1) {
            var pt = zw(k)
            if (pt !== null) {
              ;(pt.flags & 65536) === 0 && (pt.flags |= 256),
                $w(pt, k, R, y, i),
                Bh(qo(N, R))
              break e
            }
          }
          ;(y = N = qo(N, R)),
            wt !== 4 && (wt = 2),
            zl === null ? (zl = [y]) : zl.push(y),
            (y = k)
          do {
            switch (y.tag) {
              case 3:
                ;(y.flags |= 65536), (i &= -i), (y.lanes |= i)
                var L = Bw(y, N, i)
                fw(y, L)
                break e
              case 1:
                R = N
                var j = y.type,
                  F = y.stateNode
                if (
                  (y.flags & 128) === 0 &&
                  (typeof j.getDerivedStateFromError == "function" ||
                    (F !== null &&
                      typeof F.componentDidCatch == "function" &&
                      (Ni === null || !Ni.has(F))))
                ) {
                  ;(y.flags |= 65536), (i &= -i), (y.lanes |= i)
                  var ee = Fw(y, R, i)
                  fw(y, ee)
                  break e
                }
            }
            y = y.return
          } while (y !== null)
        }
        w0(a)
      } catch (pe) {
        ;(i = pe), gt === a && a !== null && (gt = a = a.return)
        continue
      }
      break
    } while (!0)
  }
  function y0() {
    var r = zc.current
    return (zc.current = jc), r === null ? jc : r
  }
  function Op() {
    ;(wt === 0 || wt === 3 || wt === 2) && (wt = 4),
      kt === null ||
        ((As & 268435455) === 0 && ($c & 268435455) === 0) ||
        Li(kt, It)
  }
  function qc(r, i) {
    var a = De
    De |= 2
    var c = y0()
    ;(kt !== r || It !== i) && ((Kr = null), Rs(r, i))
    do
      try {
        Yk()
        break
      } catch (p) {
        g0(r, p)
      }
    while (!0)
    if ((Uh(), (De = a), (zc.current = c), gt !== null)) throw Error(n(261))
    return (kt = null), (It = 0), wt
  }
  function Yk() {
    for (; gt !== null; ) v0(gt)
  }
  function Xk() {
    for (; gt !== null && !E_(); ) v0(gt)
  }
  function v0(r) {
    var i = E0(r.alternate, r, gn)
    ;(r.memoizedProps = r.pendingProps),
      i === null ? w0(r) : (gt = i),
      (vp.current = null)
  }
  function w0(r) {
    var i = r
    do {
      var a = i.alternate
      if (((r = i.return), (i.flags & 32768) === 0)) {
        if (((a = Wk(a, i, gn)), a !== null)) {
          gt = a
          return
        }
      } else {
        if (((a = Vk(a, i)), a !== null)) {
          ;(a.flags &= 32767), (gt = a)
          return
        }
        if (r !== null)
          (r.flags |= 32768), (r.subtreeFlags = 0), (r.deletions = null)
        else {
          ;(wt = 6), (gt = null)
          return
        }
      }
      if (((i = i.sibling), i !== null)) {
        gt = i
        return
      }
      gt = i = r
    } while (i !== null)
    wt === 0 && (wt = 5)
  }
  function Ps(r, i, a) {
    var c = Ve,
      p = Tn.transition
    try {
      ;(Tn.transition = null), (Ve = 1), Zk(r, i, a, c)
    } finally {
      ;(Tn.transition = p), (Ve = c)
    }
    return null
  }
  function Zk(r, i, a, c) {
    do Zo()
    while (ji !== null)
    if ((De & 6) !== 0) throw Error(n(327))
    a = r.finishedWork
    var p = r.finishedLanes
    if (a === null) return null
    if (((r.finishedWork = null), (r.finishedLanes = 0), a === r.current))
      throw Error(n(177))
    ;(r.callbackNode = null), (r.callbackPriority = 0)
    var y = a.lanes | a.childLanes
    if (
      (I_(r, y),
      r === kt && ((gt = kt = null), (It = 0)),
      ((a.subtreeFlags & 2064) === 0 && (a.flags & 2064) === 0) ||
        Vc ||
        ((Vc = !0),
        b0(Zu, function () {
          return Zo(), null
        })),
      (y = (a.flags & 15990) !== 0),
      (a.subtreeFlags & 15990) !== 0 || y)
    ) {
      ;(y = Tn.transition), (Tn.transition = null)
      var k = Ve
      Ve = 1
      var R = De
      ;(De |= 4),
        (vp.current = null),
        Gk(r, a),
        u0(a, r),
        vk(Oh),
        (sc = !!kh),
        (Oh = kh = null),
        (r.current = a),
        Kk(a),
        b_(),
        (De = R),
        (Ve = k),
        (Tn.transition = y)
    } else r.current = a
    if (
      (Vc && ((Vc = !1), (ji = r), (Hc = p)),
      (y = r.pendingLanes),
      y === 0 && (Ni = null),
      k_(a.stateNode),
      rn(r, ht()),
      i !== null)
    )
      for (c = r.onRecoverableError, a = 0; a < i.length; a++)
        (p = i[a]), c(p.value, { componentStack: p.stack, digest: p.digest })
    if (Wc) throw ((Wc = !1), (r = xp), (xp = null), r)
    return (
      (Hc & 1) !== 0 && r.tag !== 0 && Zo(),
      (y = r.pendingLanes),
      (y & 1) !== 0 ? (r === Ep ? $l++ : (($l = 0), (Ep = r))) : ($l = 0),
      Ri(),
      null
    )
  }
  function Zo() {
    if (ji !== null) {
      var r = av(Hc),
        i = Tn.transition,
        a = Ve
      try {
        if (((Tn.transition = null), (Ve = 16 > r ? 16 : r), ji === null))
          var c = !1
        else {
          if (((r = ji), (ji = null), (Hc = 0), (De & 6) !== 0))
            throw Error(n(331))
          var p = De
          for (De |= 4, ce = r.current; ce !== null; ) {
            var y = ce,
              k = y.child
            if ((ce.flags & 16) !== 0) {
              var R = y.deletions
              if (R !== null) {
                for (var N = 0; N < R.length; N++) {
                  var z = R[N]
                  for (ce = z; ce !== null; ) {
                    var X = ce
                    switch (X.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Fl(8, X, y)
                    }
                    var J = X.child
                    if (J !== null) (J.return = X), (ce = J)
                    else
                      for (; ce !== null; ) {
                        X = ce
                        var Y = X.sibling,
                          ae = X.return
                        if ((i0(X), X === z)) {
                          ce = null
                          break
                        }
                        if (Y !== null) {
                          ;(Y.return = ae), (ce = Y)
                          break
                        }
                        ce = ae
                      }
                  }
                }
                var fe = y.alternate
                if (fe !== null) {
                  var de = fe.child
                  if (de !== null) {
                    fe.child = null
                    do {
                      var pt = de.sibling
                      ;(de.sibling = null), (de = pt)
                    } while (de !== null)
                  }
                }
                ce = y
              }
            }
            if ((y.subtreeFlags & 2064) !== 0 && k !== null)
              (k.return = y), (ce = k)
            else
              e: for (; ce !== null; ) {
                if (((y = ce), (y.flags & 2048) !== 0))
                  switch (y.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Fl(9, y, y.return)
                  }
                var L = y.sibling
                if (L !== null) {
                  ;(L.return = y.return), (ce = L)
                  break e
                }
                ce = y.return
              }
          }
          var j = r.current
          for (ce = j; ce !== null; ) {
            k = ce
            var F = k.child
            if ((k.subtreeFlags & 2064) !== 0 && F !== null)
              (F.return = k), (ce = F)
            else
              e: for (k = j; ce !== null; ) {
                if (((R = ce), (R.flags & 2048) !== 0))
                  try {
                    switch (R.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Uc(9, R)
                    }
                  } catch (pe) {
                    ot(R, R.return, pe)
                  }
                if (R === k) {
                  ce = null
                  break e
                }
                var ee = R.sibling
                if (ee !== null) {
                  ;(ee.return = R.return), (ce = ee)
                  break e
                }
                ce = R.return
              }
          }
          if (
            ((De = p),
            Ri(),
            gr && typeof gr.onPostCommitFiberRoot == "function")
          )
            try {
              gr.onPostCommitFiberRoot(Ju, r)
            } catch {}
          c = !0
        }
        return c
      } finally {
        ;(Ve = a), (Tn.transition = i)
      }
    }
    return !1
  }
  function S0(r, i, a) {
    ;(i = qo(a, i)),
      (i = Bw(r, i, 1)),
      (r = Ii(r, i, 1)),
      (i = Kt()),
      r !== null && (dl(r, 1, i), rn(r, i))
  }
  function ot(r, i, a) {
    if (r.tag === 3) S0(r, r, a)
    else
      for (; i !== null; ) {
        if (i.tag === 3) {
          S0(i, r, a)
          break
        } else if (i.tag === 1) {
          var c = i.stateNode
          if (
            typeof i.type.getDerivedStateFromError == "function" ||
            (typeof c.componentDidCatch == "function" &&
              (Ni === null || !Ni.has(c)))
          ) {
            ;(r = qo(a, r)),
              (r = Fw(i, r, 1)),
              (i = Ii(i, r, 1)),
              (r = Kt()),
              i !== null && (dl(i, 1, r), rn(i, r))
            break
          }
        }
        i = i.return
      }
  }
  function Jk(r, i, a) {
    var c = r.pingCache
    c !== null && c.delete(i),
      (i = Kt()),
      (r.pingedLanes |= r.suspendedLanes & a),
      kt === r &&
        (It & a) === a &&
        (wt === 4 || (wt === 3 && (It & 130023424) === It && 500 > ht() - Sp)
          ? Rs(r, 0)
          : (wp |= a)),
      rn(r, i)
  }
  function x0(r, i) {
    i === 0 &&
      ((r.mode & 1) === 0
        ? (i = 1)
        : ((i = tc), (tc <<= 1), (tc & 130023424) === 0 && (tc = 4194304)))
    var a = Kt()
    ;(r = Vr(r, i)), r !== null && (dl(r, i, a), rn(r, a))
  }
  function e2(r) {
    var i = r.memoizedState,
      a = 0
    i !== null && (a = i.retryLane), x0(r, a)
  }
  function t2(r, i) {
    var a = 0
    switch (r.tag) {
      case 13:
        var c = r.stateNode,
          p = r.memoizedState
        p !== null && (a = p.retryLane)
        break
      case 19:
        c = r.stateNode
        break
      default:
        throw Error(n(314))
    }
    c !== null && c.delete(i), x0(r, a)
  }
  var E0
  E0 = function (r, i, a) {
    if (r !== null)
      if (r.memoizedProps !== i.pendingProps || Jt.current) tn = !0
      else {
        if ((r.lanes & a) === 0 && (i.flags & 128) === 0)
          return (tn = !1), $k(r, i, a)
        tn = (r.flags & 131072) !== 0
      }
    else (tn = !1), Je && (i.flags & 1048576) !== 0 && tw(i, bc, i.index)
    switch (((i.lanes = 0), i.tag)) {
      case 2:
        var c = i.type
        Bc(r, i), (r = i.pendingProps)
        var p = Uo(i, Lt.current)
        Go(i, a), (p = Xh(null, i, c, r, p, a))
        var y = Zh()
        return (
          (i.flags |= 1),
          typeof p == "object" &&
          p !== null &&
          typeof p.render == "function" &&
          p.$$typeof === void 0
            ? ((i.tag = 1),
              (i.memoizedState = null),
              (i.updateQueue = null),
              en(c) ? ((y = !0), Sc(i)) : (y = !1),
              (i.memoizedState =
                p.state !== null && p.state !== void 0 ? p.state : null),
              Vh(i),
              (p.updater = Dc),
              (i.stateNode = p),
              (p._reactInternals = i),
              ip(i, c, r, a),
              (i = lp(null, i, c, !0, y, a)))
            : ((i.tag = 0), Je && y && Nh(i), Gt(null, i, p, a), (i = i.child)),
          i
        )
      case 16:
        c = i.elementType
        e: {
          switch (
            (Bc(r, i),
            (r = i.pendingProps),
            (p = c._init),
            (c = p(c._payload)),
            (i.type = c),
            (p = i.tag = r2(c)),
            (r = $n(c, r)),
            p)
          ) {
            case 0:
              i = ap(null, i, c, r, a)
              break e
            case 1:
              i = qw(null, i, c, r, a)
              break e
            case 11:
              i = Ww(null, i, c, r, a)
              break e
            case 14:
              i = Vw(null, i, c, $n(c.type, r), a)
              break e
          }
          throw Error(n(306, c, ""))
        }
        return i
      case 0:
        return (
          (c = i.type),
          (p = i.pendingProps),
          (p = i.elementType === c ? p : $n(c, p)),
          ap(r, i, c, p, a)
        )
      case 1:
        return (
          (c = i.type),
          (p = i.pendingProps),
          (p = i.elementType === c ? p : $n(c, p)),
          qw(r, i, c, p, a)
        )
      case 3:
        e: {
          if ((Qw(i), r === null)) throw Error(n(387))
          ;(c = i.pendingProps),
            (y = i.memoizedState),
            (p = y.element),
            cw(r, i),
            Tc(i, c, null, a)
          var k = i.memoizedState
          if (((c = k.element), y.isDehydrated))
            if (
              ((y = {
                element: c,
                isDehydrated: !1,
                cache: k.cache,
                pendingSuspenseBoundaries: k.pendingSuspenseBoundaries,
                transitions: k.transitions,
              }),
              (i.updateQueue.baseState = y),
              (i.memoizedState = y),
              i.flags & 256)
            ) {
              ;(p = qo(Error(n(423)), i)), (i = Yw(r, i, c, a, p))
              break e
            } else if (c !== p) {
              ;(p = qo(Error(n(424)), i)), (i = Yw(r, i, c, a, p))
              break e
            } else
              for (
                mn = Oi(i.stateNode.containerInfo.firstChild),
                  pn = i,
                  Je = !0,
                  zn = null,
                  a = lw(i, null, c, a),
                  i.child = a;
                a;

              )
                (a.flags = (a.flags & -3) | 4096), (a = a.sibling)
          else {
            if ((Wo(), c === p)) {
              i = Gr(r, i, a)
              break e
            }
            Gt(r, i, c, a)
          }
          i = i.child
        }
        return i
      case 5:
        return (
          hw(i),
          r === null && Lh(i),
          (c = i.type),
          (p = i.pendingProps),
          (y = r !== null ? r.memoizedProps : null),
          (k = p.children),
          Ah(c, p) ? (k = null) : y !== null && Ah(c, y) && (i.flags |= 32),
          Kw(r, i),
          Gt(r, i, k, a),
          i.child
        )
      case 6:
        return r === null && Lh(i), null
      case 13:
        return Xw(r, i, a)
      case 4:
        return (
          Hh(i, i.stateNode.containerInfo),
          (c = i.pendingProps),
          r === null ? (i.child = Vo(i, null, c, a)) : Gt(r, i, c, a),
          i.child
        )
      case 11:
        return (
          (c = i.type),
          (p = i.pendingProps),
          (p = i.elementType === c ? p : $n(c, p)),
          Ww(r, i, c, p, a)
        )
      case 7:
        return Gt(r, i, i.pendingProps, a), i.child
      case 8:
        return Gt(r, i, i.pendingProps.children, a), i.child
      case 12:
        return Gt(r, i, i.pendingProps.children, a), i.child
      case 10:
        e: {
          if (
            ((c = i.type._context),
            (p = i.pendingProps),
            (y = i.memoizedProps),
            (k = p.value),
            Ge(kc, c._currentValue),
            (c._currentValue = k),
            y !== null)
          )
            if (Un(y.value, k)) {
              if (y.children === p.children && !Jt.current) {
                i = Gr(r, i, a)
                break e
              }
            } else
              for (y = i.child, y !== null && (y.return = i); y !== null; ) {
                var R = y.dependencies
                if (R !== null) {
                  k = y.child
                  for (var N = R.firstContext; N !== null; ) {
                    if (N.context === c) {
                      if (y.tag === 1) {
                        ;(N = Hr(-1, a & -a)), (N.tag = 2)
                        var z = y.updateQueue
                        if (z !== null) {
                          z = z.shared
                          var X = z.pending
                          X === null
                            ? (N.next = N)
                            : ((N.next = X.next), (X.next = N)),
                            (z.pending = N)
                        }
                      }
                      ;(y.lanes |= a),
                        (N = y.alternate),
                        N !== null && (N.lanes |= a),
                        $h(y.return, a, i),
                        (R.lanes |= a)
                      break
                    }
                    N = N.next
                  }
                } else if (y.tag === 10) k = y.type === i.type ? null : y.child
                else if (y.tag === 18) {
                  if (((k = y.return), k === null)) throw Error(n(341))
                  ;(k.lanes |= a),
                    (R = k.alternate),
                    R !== null && (R.lanes |= a),
                    $h(k, a, i),
                    (k = y.sibling)
                } else k = y.child
                if (k !== null) k.return = y
                else
                  for (k = y; k !== null; ) {
                    if (k === i) {
                      k = null
                      break
                    }
                    if (((y = k.sibling), y !== null)) {
                      ;(y.return = k.return), (k = y)
                      break
                    }
                    k = k.return
                  }
                y = k
              }
          Gt(r, i, p.children, a), (i = i.child)
        }
        return i
      case 9:
        return (
          (p = i.type),
          (c = i.pendingProps.children),
          Go(i, a),
          (p = On(p)),
          (c = c(p)),
          (i.flags |= 1),
          Gt(r, i, c, a),
          i.child
        )
      case 14:
        return (
          (c = i.type),
          (p = $n(c, i.pendingProps)),
          (p = $n(c.type, p)),
          Vw(r, i, c, p, a)
        )
      case 15:
        return Hw(r, i, i.type, i.pendingProps, a)
      case 17:
        return (
          (c = i.type),
          (p = i.pendingProps),
          (p = i.elementType === c ? p : $n(c, p)),
          Bc(r, i),
          (i.tag = 1),
          en(c) ? ((r = !0), Sc(i)) : (r = !1),
          Go(i, a),
          Dw(i, c, p),
          ip(i, c, p, a),
          lp(null, i, c, !0, r, a)
        )
      case 19:
        return Jw(r, i, a)
      case 22:
        return Gw(r, i, a)
    }
    throw Error(n(156, i.tag))
  }
  function b0(r, i) {
    return nv(r, i)
  }
  function n2(r, i, a, c) {
    ;(this.tag = r),
      (this.key = a),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.ref = null),
      (this.pendingProps = i),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = c),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null)
  }
  function Rn(r, i, a, c) {
    return new n2(r, i, a, c)
  }
  function Ap(r) {
    return (r = r.prototype), !(!r || !r.isReactComponent)
  }
  function r2(r) {
    if (typeof r == "function") return Ap(r) ? 1 : 0
    if (r != null) {
      if (((r = r.$$typeof), r === Ae)) return 11
      if (r === Ue) return 14
    }
    return 2
  }
  function Bi(r, i) {
    var a = r.alternate
    return (
      a === null
        ? ((a = Rn(r.tag, i, r.key, r.mode)),
          (a.elementType = r.elementType),
          (a.type = r.type),
          (a.stateNode = r.stateNode),
          (a.alternate = r),
          (r.alternate = a))
        : ((a.pendingProps = i),
          (a.type = r.type),
          (a.flags = 0),
          (a.subtreeFlags = 0),
          (a.deletions = null)),
      (a.flags = r.flags & 14680064),
      (a.childLanes = r.childLanes),
      (a.lanes = r.lanes),
      (a.child = r.child),
      (a.memoizedProps = r.memoizedProps),
      (a.memoizedState = r.memoizedState),
      (a.updateQueue = r.updateQueue),
      (i = r.dependencies),
      (a.dependencies =
        i === null ? null : { lanes: i.lanes, firstContext: i.firstContext }),
      (a.sibling = r.sibling),
      (a.index = r.index),
      (a.ref = r.ref),
      a
    )
  }
  function Qc(r, i, a, c, p, y) {
    var k = 2
    if (((c = r), typeof r == "function")) Ap(r) && (k = 1)
    else if (typeof r == "string") k = 5
    else
      e: switch (r) {
        case W:
          return Is(a.children, p, y, i)
        case q:
          ;(k = 8), (p |= 8)
          break
        case Z:
          return (
            (r = Rn(12, a, i, p | 2)), (r.elementType = Z), (r.lanes = y), r
          )
        case Te:
          return (r = Rn(13, a, i, p)), (r.elementType = Te), (r.lanes = y), r
        case Pe:
          return (r = Rn(19, a, i, p)), (r.elementType = Pe), (r.lanes = y), r
        case H:
          return Yc(a, p, y, i)
        default:
          if (typeof r == "object" && r !== null)
            switch (r.$$typeof) {
              case le:
                k = 10
                break e
              case Ce:
                k = 9
                break e
              case Ae:
                k = 11
                break e
              case Ue:
                k = 14
                break e
              case te:
                ;(k = 16), (c = null)
                break e
            }
          throw Error(n(130, r == null ? r : typeof r, ""))
      }
    return (
      (i = Rn(k, a, i, p)), (i.elementType = r), (i.type = c), (i.lanes = y), i
    )
  }
  function Is(r, i, a, c) {
    return (r = Rn(7, r, c, i)), (r.lanes = a), r
  }
  function Yc(r, i, a, c) {
    return (
      (r = Rn(22, r, c, i)),
      (r.elementType = H),
      (r.lanes = a),
      (r.stateNode = { isHidden: !1 }),
      r
    )
  }
  function Tp(r, i, a) {
    return (r = Rn(6, r, null, i)), (r.lanes = a), r
  }
  function Rp(r, i, a) {
    return (
      (i = Rn(4, r.children !== null ? r.children : [], r.key, i)),
      (i.lanes = a),
      (i.stateNode = {
        containerInfo: r.containerInfo,
        pendingChildren: null,
        implementation: r.implementation,
      }),
      i
    )
  }
  function i2(r, i, a, c, p) {
    ;(this.tag = i),
      (this.containerInfo = r),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.callbackNode = this.pendingContext = this.context = null),
      (this.callbackPriority = 0),
      (this.eventTimes = rh(0)),
      (this.expirationTimes = rh(-1)),
      (this.entangledLanes =
        this.finishedLanes =
        this.mutableReadLanes =
        this.expiredLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = rh(0)),
      (this.identifierPrefix = c),
      (this.onRecoverableError = p),
      (this.mutableSourceEagerHydrationData = null)
  }
  function Pp(r, i, a, c, p, y, k, R, N) {
    return (
      (r = new i2(r, i, a, R, N)),
      i === 1 ? ((i = 1), y === !0 && (i |= 8)) : (i = 0),
      (y = Rn(3, null, null, i)),
      (r.current = y),
      (y.stateNode = r),
      (y.memoizedState = {
        element: c,
        isDehydrated: a,
        cache: null,
        transitions: null,
        pendingSuspenseBoundaries: null,
      }),
      Vh(y),
      r
    )
  }
  function s2(r, i, a) {
    var c =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null
    return {
      $$typeof: K,
      key: c == null ? null : "" + c,
      children: r,
      containerInfo: i,
      implementation: a,
    }
  }
  function C0(r) {
    if (!r) return Ti
    r = r._reactInternals
    e: {
      if (Ss(r) !== r || r.tag !== 1) throw Error(n(170))
      var i = r
      do {
        switch (i.tag) {
          case 3:
            i = i.stateNode.context
            break e
          case 1:
            if (en(i.type)) {
              i = i.stateNode.__reactInternalMemoizedMergedChildContext
              break e
            }
        }
        i = i.return
      } while (i !== null)
      throw Error(n(171))
    }
    if (r.tag === 1) {
      var a = r.type
      if (en(a)) return Zv(r, a, i)
    }
    return i
  }
  function _0(r, i, a, c, p, y, k, R, N) {
    return (
      (r = Pp(a, c, !0, r, p, y, k, R, N)),
      (r.context = C0(null)),
      (a = r.current),
      (c = Kt()),
      (p = Di(a)),
      (y = Hr(c, p)),
      (y.callback = i ?? null),
      Ii(a, y, p),
      (r.current.lanes = p),
      dl(r, p, c),
      rn(r, c),
      r
    )
  }
  function Xc(r, i, a, c) {
    var p = i.current,
      y = Kt(),
      k = Di(p)
    return (
      (a = C0(a)),
      i.context === null ? (i.context = a) : (i.pendingContext = a),
      (i = Hr(y, k)),
      (i.payload = { element: r }),
      (c = c === void 0 ? null : c),
      c !== null && (i.callback = c),
      (r = Ii(p, i, k)),
      r !== null && (Hn(r, p, k, y), Ac(r, p, k)),
      k
    )
  }
  function Zc(r) {
    if (((r = r.current), !r.child)) return null
    switch (r.child.tag) {
      case 5:
        return r.child.stateNode
      default:
        return r.child.stateNode
    }
  }
  function k0(r, i) {
    if (((r = r.memoizedState), r !== null && r.dehydrated !== null)) {
      var a = r.retryLane
      r.retryLane = a !== 0 && a < i ? a : i
    }
  }
  function Ip(r, i) {
    k0(r, i), (r = r.alternate) && k0(r, i)
  }
  function o2() {
    return null
  }
  var O0 =
    typeof reportError == "function"
      ? reportError
      : function (r) {
          console.error(r)
        }
  function Mp(r) {
    this._internalRoot = r
  }
  ;(Jc.prototype.render = Mp.prototype.render =
    function (r) {
      var i = this._internalRoot
      if (i === null) throw Error(n(409))
      Xc(r, i, null, null)
    }),
    (Jc.prototype.unmount = Mp.prototype.unmount =
      function () {
        var r = this._internalRoot
        if (r !== null) {
          this._internalRoot = null
          var i = r.containerInfo
          Ts(function () {
            Xc(null, r, null, null)
          }),
            (i[Ur] = null)
        }
      })
  function Jc(r) {
    this._internalRoot = r
  }
  Jc.prototype.unstable_scheduleHydration = function (r) {
    if (r) {
      var i = cv()
      r = { blockedOn: null, target: r, priority: i }
      for (var a = 0; a < Ci.length && i !== 0 && i < Ci[a].priority; a++);
      Ci.splice(a, 0, r), a === 0 && hv(r)
    }
  }
  function Np(r) {
    return !(!r || (r.nodeType !== 1 && r.nodeType !== 9 && r.nodeType !== 11))
  }
  function ef(r) {
    return !(
      !r ||
      (r.nodeType !== 1 &&
        r.nodeType !== 9 &&
        r.nodeType !== 11 &&
        (r.nodeType !== 8 || r.nodeValue !== " react-mount-point-unstable "))
    )
  }
  function A0() {}
  function a2(r, i, a, c, p) {
    if (p) {
      if (typeof c == "function") {
        var y = c
        c = function () {
          var z = Zc(k)
          y.call(z)
        }
      }
      var k = _0(i, c, r, 0, null, !1, !1, "", A0)
      return (
        (r._reactRootContainer = k),
        (r[Ur] = k.current),
        kl(r.nodeType === 8 ? r.parentNode : r),
        Ts(),
        k
      )
    }
    for (; (p = r.lastChild); ) r.removeChild(p)
    if (typeof c == "function") {
      var R = c
      c = function () {
        var z = Zc(N)
        R.call(z)
      }
    }
    var N = Pp(r, 0, !1, null, null, !1, !1, "", A0)
    return (
      (r._reactRootContainer = N),
      (r[Ur] = N.current),
      kl(r.nodeType === 8 ? r.parentNode : r),
      Ts(function () {
        Xc(i, N, a, c)
      }),
      N
    )
  }
  function tf(r, i, a, c, p) {
    var y = a._reactRootContainer
    if (y) {
      var k = y
      if (typeof p == "function") {
        var R = p
        p = function () {
          var N = Zc(k)
          R.call(N)
        }
      }
      Xc(i, k, r, p)
    } else k = a2(a, i, r, p, c)
    return Zc(k)
  }
  ;(lv = function (r) {
    switch (r.tag) {
      case 3:
        var i = r.stateNode
        if (i.current.memoizedState.isDehydrated) {
          var a = fl(i.pendingLanes)
          a !== 0 &&
            (ih(i, a | 1),
            rn(i, ht()),
            (De & 6) === 0 && ((Xo = ht() + 500), Ri()))
        }
        break
      case 13:
        Ts(function () {
          var c = Vr(r, 1)
          if (c !== null) {
            var p = Kt()
            Hn(c, r, 1, p)
          }
        }),
          Ip(r, 1)
    }
  }),
    (sh = function (r) {
      if (r.tag === 13) {
        var i = Vr(r, 134217728)
        if (i !== null) {
          var a = Kt()
          Hn(i, r, 134217728, a)
        }
        Ip(r, 134217728)
      }
    }),
    (uv = function (r) {
      if (r.tag === 13) {
        var i = Di(r),
          a = Vr(r, i)
        if (a !== null) {
          var c = Kt()
          Hn(a, r, i, c)
        }
        Ip(r, i)
      }
    }),
    (cv = function () {
      return Ve
    }),
    (fv = function (r, i) {
      var a = Ve
      try {
        return (Ve = r), i()
      } finally {
        Ve = a
      }
    }),
    (Xd = function (r, i, a) {
      switch (i) {
        case "input":
          if ((gs(r, a), (i = a.name), a.type === "radio" && i != null)) {
            for (a = r; a.parentNode; ) a = a.parentNode
            for (
              a = a.querySelectorAll(
                "input[name=" + JSON.stringify("" + i) + '][type="radio"]',
              ),
                i = 0;
              i < a.length;
              i++
            ) {
              var c = a[i]
              if (c !== r && c.form === r.form) {
                var p = vc(c)
                if (!p) throw Error(n(90))
                dn(c), gs(c, p)
              }
            }
          }
          break
        case "textarea":
          sl(r, a)
          break
        case "select":
          ;(i = a.value), i != null && Fr(r, !!a.multiple, i, !1)
      }
    }),
    (Qy = _p),
    (Yy = Ts)
  var l2 = { usingClientEntryPoint: !1, Events: [Tl, Bo, vc, Ky, qy, _p] },
    Wl = {
      findFiberByHostInstance: xs,
      bundleType: 0,
      version: "18.3.1",
      rendererPackageName: "react-dom",
    },
    u2 = {
      bundleType: Wl.bundleType,
      version: Wl.version,
      rendererPackageName: Wl.rendererPackageName,
      rendererConfig: Wl.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setErrorHandler: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: M.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (r) {
        return (r = ev(r)), r === null ? null : r.stateNode
      },
      findFiberByHostInstance: Wl.findFiberByHostInstance || o2,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
      reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
    }
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var nf = __REACT_DEVTOOLS_GLOBAL_HOOK__
    if (!nf.isDisabled && nf.supportsFiber)
      try {
        ;(Ju = nf.inject(u2)), (gr = nf)
      } catch {}
  }
  return (
    (sn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = l2),
    (sn.createPortal = function (r, i) {
      var a =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null
      if (!Np(i)) throw Error(n(200))
      return s2(r, i, null, a)
    }),
    (sn.createRoot = function (r, i) {
      if (!Np(r)) throw Error(n(299))
      var a = !1,
        c = "",
        p = O0
      return (
        i != null &&
          (i.unstable_strictMode === !0 && (a = !0),
          i.identifierPrefix !== void 0 && (c = i.identifierPrefix),
          i.onRecoverableError !== void 0 && (p = i.onRecoverableError)),
        (i = Pp(r, 1, !1, null, null, a, !1, c, p)),
        (r[Ur] = i.current),
        kl(r.nodeType === 8 ? r.parentNode : r),
        new Mp(i)
      )
    }),
    (sn.findDOMNode = function (r) {
      if (r == null) return null
      if (r.nodeType === 1) return r
      var i = r._reactInternals
      if (i === void 0)
        throw typeof r.render == "function"
          ? Error(n(188))
          : ((r = Object.keys(r).join(",")), Error(n(268, r)))
      return (r = ev(i)), (r = r === null ? null : r.stateNode), r
    }),
    (sn.flushSync = function (r) {
      return Ts(r)
    }),
    (sn.hydrate = function (r, i, a) {
      if (!ef(i)) throw Error(n(200))
      return tf(null, r, i, !0, a)
    }),
    (sn.hydrateRoot = function (r, i, a) {
      if (!Np(r)) throw Error(n(405))
      var c = (a != null && a.hydratedSources) || null,
        p = !1,
        y = "",
        k = O0
      if (
        (a != null &&
          (a.unstable_strictMode === !0 && (p = !0),
          a.identifierPrefix !== void 0 && (y = a.identifierPrefix),
          a.onRecoverableError !== void 0 && (k = a.onRecoverableError)),
        (i = _0(i, null, r, 1, a ?? null, p, !1, y, k)),
        (r[Ur] = i.current),
        kl(r),
        c)
      )
        for (r = 0; r < c.length; r++)
          (a = c[r]),
            (p = a._getVersion),
            (p = p(a._source)),
            i.mutableSourceEagerHydrationData == null
              ? (i.mutableSourceEagerHydrationData = [a, p])
              : i.mutableSourceEagerHydrationData.push(a, p)
      return new Jc(i)
    }),
    (sn.render = function (r, i, a) {
      if (!ef(i)) throw Error(n(200))
      return tf(null, r, i, !1, a)
    }),
    (sn.unmountComponentAtNode = function (r) {
      if (!ef(r)) throw Error(n(40))
      return r._reactRootContainer
        ? (Ts(function () {
            tf(null, null, r, !1, function () {
              ;(r._reactRootContainer = null), (r[Ur] = null)
            })
          }),
          !0)
        : !1
    }),
    (sn.unstable_batchedUpdates = _p),
    (sn.unstable_renderSubtreeIntoContainer = function (r, i, a, c) {
      if (!ef(a)) throw Error(n(200))
      if (r == null || r._reactInternals === void 0) throw Error(n(38))
      return tf(r, i, a, !1, c)
    }),
    (sn.version = "18.3.1-next-f1338f8080-20240426"),
    sn
  )
}
var L0
function j1() {
  if (L0) return Bp.exports
  L0 = 1
  function t() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t)
      } catch (e) {
        console.error(e)
      }
  }
  return t(), (Bp.exports = S2()), Bp.exports
}
var B0
function x2() {
  if (B0) return rf
  B0 = 1
  var t = j1()
  return (rf.createRoot = t.createRoot), (rf.hydrateRoot = t.hydrateRoot), rf
}
var E2 = x2()
const b2 = yo(E2)
function Oe(t, e, { checkForDefaultPrevented: n = !0 } = {}) {
  return function (o) {
    if ((t == null || t(o), n === !1 || !o.defaultPrevented))
      return e == null ? void 0 : e(o)
  }
}
function F0(t, e) {
  if (typeof t == "function") return t(e)
  t != null && (t.current = e)
}
function Sd(...t) {
  return e => {
    let n = !1
    const s = t.map(o => {
      const l = F0(o, e)
      return !n && typeof l == "function" && (n = !0), l
    })
    if (n)
      return () => {
        for (let o = 0; o < s.length; o++) {
          const l = s[o]
          typeof l == "function" ? l() : F0(t[o], null)
        }
      }
  }
}
function Ct(...t) {
  return v.useCallback(Sd(...t), t)
}
function C2(t, e) {
  const n = v.createContext(e),
    s = l => {
      const { children: u, ...f } = l,
        d = v.useMemo(() => f, Object.values(f))
      return T.jsx(n.Provider, { value: d, children: u })
    }
  s.displayName = t + "Provider"
  function o(l) {
    const u = v.useContext(n)
    if (u) return u
    if (e !== void 0) return e
    throw new Error(`\`${l}\` must be used within \`${t}\``)
  }
  return [s, o]
}
function vo(t, e = []) {
  let n = []
  function s(l, u) {
    const f = v.createContext(u),
      d = n.length
    n = [...n, u]
    const m = g => {
      var _
      const { scope: w, children: b, ...E } = g,
        S = ((_ = w == null ? void 0 : w[t]) == null ? void 0 : _[d]) || f,
        C = v.useMemo(() => E, Object.values(E))
      return T.jsx(S.Provider, { value: C, children: b })
    }
    m.displayName = l + "Provider"
    function h(g, w) {
      var S
      const b = ((S = w == null ? void 0 : w[t]) == null ? void 0 : S[d]) || f,
        E = v.useContext(b)
      if (E) return E
      if (u !== void 0) return u
      throw new Error(`\`${g}\` must be used within \`${l}\``)
    }
    return [m, h]
  }
  const o = () => {
    const l = n.map(u => v.createContext(u))
    return function (f) {
      const d = (f == null ? void 0 : f[t]) || l
      return v.useMemo(() => ({ [`__scope${t}`]: { ...f, [t]: d } }), [f, d])
    }
  }
  return (o.scopeName = t), [s, _2(o, ...e)]
}
function _2(...t) {
  const e = t[0]
  if (t.length === 1) return e
  const n = () => {
    const s = t.map(o => ({ useScope: o(), scopeName: o.scopeName }))
    return function (l) {
      const u = s.reduce((f, { useScope: d, scopeName: m }) => {
        const g = d(l)[`__scope${m}`]
        return { ...f, ...g }
      }, {})
      return v.useMemo(() => ({ [`__scope${e.scopeName}`]: u }), [u])
    }
  }
  return (n.scopeName = e.scopeName), n
}
var uo =
    globalThis != null && globalThis.document ? v.useLayoutEffect : () => {},
  k2 = y2.useId || (() => {}),
  O2 = 0
function ma(t) {
  const [e, n] = v.useState(k2())
  return (
    uo(() => {
      n(s => s ?? String(O2++))
    }, [t]),
    t || (e ? `radix-${e}` : "")
  )
}
function fr(t) {
  const e = v.useRef(t)
  return (
    v.useEffect(() => {
      e.current = t
    }),
    v.useMemo(
      () =>
        (...n) => {
          var s
          return (s = e.current) == null ? void 0 : s.call(e, ...n)
        },
      [],
    )
  )
}
function _g({ prop: t, defaultProp: e, onChange: n = () => {} }) {
  const [s, o] = A2({ defaultProp: e, onChange: n }),
    l = t !== void 0,
    u = l ? t : s,
    f = fr(n),
    d = v.useCallback(
      m => {
        if (l) {
          const g = typeof m == "function" ? m(t) : m
          g !== t && f(g)
        } else o(m)
      },
      [l, t, o, f],
    )
  return [u, d]
}
function A2({ defaultProp: t, onChange: e }) {
  const n = v.useState(t),
    [s] = n,
    o = v.useRef(s),
    l = fr(e)
  return (
    v.useEffect(() => {
      o.current !== s && (l(s), (o.current = s))
    }, [s, o, l]),
    n
  )
}
var kg = j1()
const T2 = yo(kg)
var Bn = v.forwardRef((t, e) => {
  const { children: n, ...s } = t,
    o = v.Children.toArray(n),
    l = o.find(R2)
  if (l) {
    const u = l.props.children,
      f = o.map(d =>
        d === l
          ? v.Children.count(u) > 1
            ? v.Children.only(null)
            : v.isValidElement(u)
              ? u.props.children
              : null
          : d,
      )
    return T.jsx(Cm, {
      ...s,
      ref: e,
      children: v.isValidElement(u) ? v.cloneElement(u, void 0, f) : null,
    })
  }
  return T.jsx(Cm, { ...s, ref: e, children: n })
})
Bn.displayName = "Slot"
var Cm = v.forwardRef((t, e) => {
  const { children: n, ...s } = t
  if (v.isValidElement(n)) {
    const o = I2(n),
      l = P2(s, n.props)
    return (
      n.type !== v.Fragment && (l.ref = e ? Sd(e, o) : o), v.cloneElement(n, l)
    )
  }
  return v.Children.count(n) > 1 ? v.Children.only(null) : null
})
Cm.displayName = "SlotClone"
var D1 = ({ children: t }) => T.jsx(T.Fragment, { children: t })
function R2(t) {
  return v.isValidElement(t) && t.type === D1
}
function P2(t, e) {
  const n = { ...e }
  for (const s in e) {
    const o = t[s],
      l = e[s]
    ;/^on[A-Z]/.test(s)
      ? o && l
        ? (n[s] = (...f) => {
            l(...f), o(...f)
          })
        : o && (n[s] = o)
      : s === "style"
        ? (n[s] = { ...o, ...l })
        : s === "className" && (n[s] = [o, l].filter(Boolean).join(" "))
  }
  return { ...t, ...n }
}
function I2(t) {
  var s, o
  let e =
      (s = Object.getOwnPropertyDescriptor(t.props, "ref")) == null
        ? void 0
        : s.get,
    n = e && "isReactWarning" in e && e.isReactWarning
  return n
    ? t.ref
    : ((e =
        (o = Object.getOwnPropertyDescriptor(t, "ref")) == null
          ? void 0
          : o.get),
      (n = e && "isReactWarning" in e && e.isReactWarning),
      n ? t.props.ref : t.props.ref || t.ref)
}
var qa = Bn,
  M2 = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "span",
    "svg",
    "ul",
  ],
  dt = M2.reduce((t, e) => {
    const n = v.forwardRef((s, o) => {
      const { asChild: l, ...u } = s,
        f = l ? Bn : e
      return (
        typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
        T.jsx(f, { ...u, ref: o })
      )
    })
    return (n.displayName = `Primitive.${e}`), { ...t, [e]: n }
  }, {})
function L1(t, e) {
  t && kg.flushSync(() => t.dispatchEvent(e))
}
function N2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = fr(t)
  v.useEffect(() => {
    const s = o => {
      o.key === "Escape" && n(o)
    }
    return (
      e.addEventListener("keydown", s, { capture: !0 }),
      () => e.removeEventListener("keydown", s, { capture: !0 })
    )
  }, [n, e])
}
var j2 = "DismissableLayer",
  _m = "dismissableLayer.update",
  D2 = "dismissableLayer.pointerDownOutside",
  L2 = "dismissableLayer.focusOutside",
  U0,
  B1 = v.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  xd = v.forwardRef((t, e) => {
    const {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: s,
        onPointerDownOutside: o,
        onFocusOutside: l,
        onInteractOutside: u,
        onDismiss: f,
        ...d
      } = t,
      m = v.useContext(B1),
      [h, g] = v.useState(null),
      w =
        (h == null ? void 0 : h.ownerDocument) ??
        (globalThis == null ? void 0 : globalThis.document),
      [, b] = v.useState({}),
      E = Ct(e, W => g(W)),
      S = Array.from(m.layers),
      [C] = [...m.layersWithOutsidePointerEventsDisabled].slice(-1),
      _ = S.indexOf(C),
      A = h ? S.indexOf(h) : -1,
      O = m.layersWithOutsidePointerEventsDisabled.size > 0,
      M = A >= _,
      D = U2(W => {
        const q = W.target,
          Z = [...m.branches].some(le => le.contains(q))
        !M ||
          Z ||
          (o == null || o(W),
          u == null || u(W),
          W.defaultPrevented || f == null || f())
      }, w),
      K = z2(W => {
        const q = W.target
        ;[...m.branches].some(le => le.contains(q)) ||
          (l == null || l(W),
          u == null || u(W),
          W.defaultPrevented || f == null || f())
      }, w)
    return (
      N2(W => {
        A === m.layers.size - 1 &&
          (s == null || s(W),
          !W.defaultPrevented && f && (W.preventDefault(), f()))
      }, w),
      v.useEffect(() => {
        if (h)
          return (
            n &&
              (m.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((U0 = w.body.style.pointerEvents),
                (w.body.style.pointerEvents = "none")),
              m.layersWithOutsidePointerEventsDisabled.add(h)),
            m.layers.add(h),
            z0(),
            () => {
              n &&
                m.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (w.body.style.pointerEvents = U0)
            }
          )
      }, [h, w, n, m]),
      v.useEffect(
        () => () => {
          h &&
            (m.layers.delete(h),
            m.layersWithOutsidePointerEventsDisabled.delete(h),
            z0())
        },
        [h, m],
      ),
      v.useEffect(() => {
        const W = () => b({})
        return (
          document.addEventListener(_m, W),
          () => document.removeEventListener(_m, W)
        )
      }, []),
      T.jsx(dt.div, {
        ...d,
        ref: E,
        style: {
          pointerEvents: O ? (M ? "auto" : "none") : void 0,
          ...t.style,
        },
        onFocusCapture: Oe(t.onFocusCapture, K.onFocusCapture),
        onBlurCapture: Oe(t.onBlurCapture, K.onBlurCapture),
        onPointerDownCapture: Oe(
          t.onPointerDownCapture,
          D.onPointerDownCapture,
        ),
      })
    )
  })
xd.displayName = j2
var B2 = "DismissableLayerBranch",
  F2 = v.forwardRef((t, e) => {
    const n = v.useContext(B1),
      s = v.useRef(null),
      o = Ct(e, s)
    return (
      v.useEffect(() => {
        const l = s.current
        if (l)
          return (
            n.branches.add(l),
            () => {
              n.branches.delete(l)
            }
          )
      }, [n.branches]),
      T.jsx(dt.div, { ...t, ref: o })
    )
  })
F2.displayName = B2
function U2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = fr(t),
    s = v.useRef(!1),
    o = v.useRef(() => {})
  return (
    v.useEffect(() => {
      const l = f => {
          if (f.target && !s.current) {
            let d = function () {
              F1(D2, n, m, { discrete: !0 })
            }
            const m = { originalEvent: f }
            f.pointerType === "touch"
              ? (e.removeEventListener("click", o.current),
                (o.current = d),
                e.addEventListener("click", o.current, { once: !0 }))
              : d()
          } else e.removeEventListener("click", o.current)
          s.current = !1
        },
        u = window.setTimeout(() => {
          e.addEventListener("pointerdown", l)
        }, 0)
      return () => {
        window.clearTimeout(u),
          e.removeEventListener("pointerdown", l),
          e.removeEventListener("click", o.current)
      }
    }, [e, n]),
    { onPointerDownCapture: () => (s.current = !0) }
  )
}
function z2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = fr(t),
    s = v.useRef(!1)
  return (
    v.useEffect(() => {
      const o = l => {
        l.target &&
          !s.current &&
          F1(L2, n, { originalEvent: l }, { discrete: !1 })
      }
      return (
        e.addEventListener("focusin", o),
        () => e.removeEventListener("focusin", o)
      )
    }, [e, n]),
    {
      onFocusCapture: () => (s.current = !0),
      onBlurCapture: () => (s.current = !1),
    }
  )
}
function z0() {
  const t = new CustomEvent(_m)
  document.dispatchEvent(t)
}
function F1(t, e, n, { discrete: s }) {
  const o = n.originalEvent.target,
    l = new CustomEvent(t, { bubbles: !1, cancelable: !0, detail: n })
  e && o.addEventListener(t, e, { once: !0 }), s ? L1(o, l) : o.dispatchEvent(l)
}
var zp = "focusScope.autoFocusOnMount",
  $p = "focusScope.autoFocusOnUnmount",
  $0 = { bubbles: !1, cancelable: !0 },
  $2 = "FocusScope",
  Og = v.forwardRef((t, e) => {
    const {
        loop: n = !1,
        trapped: s = !1,
        onMountAutoFocus: o,
        onUnmountAutoFocus: l,
        ...u
      } = t,
      [f, d] = v.useState(null),
      m = fr(o),
      h = fr(l),
      g = v.useRef(null),
      w = Ct(e, S => d(S)),
      b = v.useRef({
        paused: !1,
        pause() {
          this.paused = !0
        },
        resume() {
          this.paused = !1
        },
      }).current
    v.useEffect(() => {
      if (s) {
        let S = function (O) {
            if (b.paused || !f) return
            const M = O.target
            f.contains(M) ? (g.current = M) : Hi(g.current, { select: !0 })
          },
          C = function (O) {
            if (b.paused || !f) return
            const M = O.relatedTarget
            M !== null && (f.contains(M) || Hi(g.current, { select: !0 }))
          },
          _ = function (O) {
            if (document.activeElement === document.body)
              for (const D of O) D.removedNodes.length > 0 && Hi(f)
          }
        document.addEventListener("focusin", S),
          document.addEventListener("focusout", C)
        const A = new MutationObserver(_)
        return (
          f && A.observe(f, { childList: !0, subtree: !0 }),
          () => {
            document.removeEventListener("focusin", S),
              document.removeEventListener("focusout", C),
              A.disconnect()
          }
        )
      }
    }, [s, f, b.paused]),
      v.useEffect(() => {
        if (f) {
          V0.add(b)
          const S = document.activeElement
          if (!f.contains(S)) {
            const _ = new CustomEvent(zp, $0)
            f.addEventListener(zp, m),
              f.dispatchEvent(_),
              _.defaultPrevented ||
                (W2(q2(U1(f)), { select: !0 }),
                document.activeElement === S && Hi(f))
          }
          return () => {
            f.removeEventListener(zp, m),
              setTimeout(() => {
                const _ = new CustomEvent($p, $0)
                f.addEventListener($p, h),
                  f.dispatchEvent(_),
                  _.defaultPrevented || Hi(S ?? document.body, { select: !0 }),
                  f.removeEventListener($p, h),
                  V0.remove(b)
              }, 0)
          }
        }
      }, [f, m, h, b])
    const E = v.useCallback(
      S => {
        if ((!n && !s) || b.paused) return
        const C = S.key === "Tab" && !S.altKey && !S.ctrlKey && !S.metaKey,
          _ = document.activeElement
        if (C && _) {
          const A = S.currentTarget,
            [O, M] = V2(A)
          O && M
            ? !S.shiftKey && _ === M
              ? (S.preventDefault(), n && Hi(O, { select: !0 }))
              : S.shiftKey &&
                _ === O &&
                (S.preventDefault(), n && Hi(M, { select: !0 }))
            : _ === A && S.preventDefault()
        }
      },
      [n, s, b.paused],
    )
    return T.jsx(dt.div, { tabIndex: -1, ...u, ref: w, onKeyDown: E })
  })
Og.displayName = $2
function W2(t, { select: e = !1 } = {}) {
  const n = document.activeElement
  for (const s of t)
    if ((Hi(s, { select: e }), document.activeElement !== n)) return
}
function V2(t) {
  const e = U1(t),
    n = W0(e, t),
    s = W0(e.reverse(), t)
  return [n, s]
}
function U1(t) {
  const e = [],
    n = document.createTreeWalker(t, NodeFilter.SHOW_ELEMENT, {
      acceptNode: s => {
        const o = s.tagName === "INPUT" && s.type === "hidden"
        return s.disabled || s.hidden || o
          ? NodeFilter.FILTER_SKIP
          : s.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP
      },
    })
  for (; n.nextNode(); ) e.push(n.currentNode)
  return e
}
function W0(t, e) {
  for (const n of t) if (!H2(n, { upTo: e })) return n
}
function H2(t, { upTo: e }) {
  if (getComputedStyle(t).visibility === "hidden") return !0
  for (; t; ) {
    if (e !== void 0 && t === e) return !1
    if (getComputedStyle(t).display === "none") return !0
    t = t.parentElement
  }
  return !1
}
function G2(t) {
  return t instanceof HTMLInputElement && "select" in t
}
function Hi(t, { select: e = !1 } = {}) {
  if (t && t.focus) {
    const n = document.activeElement
    t.focus({ preventScroll: !0 }), t !== n && G2(t) && e && t.select()
  }
}
var V0 = K2()
function K2() {
  let t = []
  return {
    add(e) {
      const n = t[0]
      e !== n && (n == null || n.pause()), (t = H0(t, e)), t.unshift(e)
    },
    remove(e) {
      var n
      ;(t = H0(t, e)), (n = t[0]) == null || n.resume()
    },
  }
}
function H0(t, e) {
  const n = [...t],
    s = n.indexOf(e)
  return s !== -1 && n.splice(s, 1), n
}
function q2(t) {
  return t.filter(e => e.tagName !== "A")
}
var Q2 = "Portal",
  Ag = v.forwardRef((t, e) => {
    var f
    const { container: n, ...s } = t,
      [o, l] = v.useState(!1)
    uo(() => l(!0), [])
    const u =
      n ||
      (o &&
        ((f = globalThis == null ? void 0 : globalThis.document) == null
          ? void 0
          : f.body))
    return u ? T2.createPortal(T.jsx(dt.div, { ...s, ref: e }), u) : null
  })
Ag.displayName = Q2
function Y2(t, e) {
  return v.useReducer((n, s) => e[n][s] ?? n, t)
}
var vi = t => {
  const { present: e, children: n } = t,
    s = X2(e),
    o =
      typeof n == "function" ? n({ present: s.isPresent }) : v.Children.only(n),
    l = Ct(s.ref, Z2(o))
  return typeof n == "function" || s.isPresent
    ? v.cloneElement(o, { ref: l })
    : null
}
vi.displayName = "Presence"
function X2(t) {
  const [e, n] = v.useState(),
    s = v.useRef({}),
    o = v.useRef(t),
    l = v.useRef("none"),
    u = t ? "mounted" : "unmounted",
    [f, d] = Y2(u, {
      mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
      unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
      unmounted: { MOUNT: "mounted" },
    })
  return (
    v.useEffect(() => {
      const m = sf(s.current)
      l.current = f === "mounted" ? m : "none"
    }, [f]),
    uo(() => {
      const m = s.current,
        h = o.current
      if (h !== t) {
        const w = l.current,
          b = sf(m)
        t
          ? d("MOUNT")
          : b === "none" || (m == null ? void 0 : m.display) === "none"
            ? d("UNMOUNT")
            : d(h && w !== b ? "ANIMATION_OUT" : "UNMOUNT"),
          (o.current = t)
      }
    }, [t, d]),
    uo(() => {
      if (e) {
        let m
        const h = e.ownerDocument.defaultView ?? window,
          g = b => {
            const S = sf(s.current).includes(b.animationName)
            if (b.target === e && S && (d("ANIMATION_END"), !o.current)) {
              const C = e.style.animationFillMode
              ;(e.style.animationFillMode = "forwards"),
                (m = h.setTimeout(() => {
                  e.style.animationFillMode === "forwards" &&
                    (e.style.animationFillMode = C)
                }))
            }
          },
          w = b => {
            b.target === e && (l.current = sf(s.current))
          }
        return (
          e.addEventListener("animationstart", w),
          e.addEventListener("animationcancel", g),
          e.addEventListener("animationend", g),
          () => {
            h.clearTimeout(m),
              e.removeEventListener("animationstart", w),
              e.removeEventListener("animationcancel", g),
              e.removeEventListener("animationend", g)
          }
        )
      } else d("ANIMATION_END")
    }, [e, d]),
    {
      isPresent: ["mounted", "unmountSuspended"].includes(f),
      ref: v.useCallback(m => {
        m && (s.current = getComputedStyle(m)), n(m)
      }, []),
    }
  )
}
function sf(t) {
  return (t == null ? void 0 : t.animationName) || "none"
}
function Z2(t) {
  var s, o
  let e =
      (s = Object.getOwnPropertyDescriptor(t.props, "ref")) == null
        ? void 0
        : s.get,
    n = e && "isReactWarning" in e && e.isReactWarning
  return n
    ? t.ref
    : ((e =
        (o = Object.getOwnPropertyDescriptor(t, "ref")) == null
          ? void 0
          : o.get),
      (n = e && "isReactWarning" in e && e.isReactWarning),
      n ? t.props.ref : t.props.ref || t.ref)
}
var Wp = 0
function z1() {
  v.useEffect(() => {
    const t = document.querySelectorAll("[data-radix-focus-guard]")
    return (
      document.body.insertAdjacentElement("afterbegin", t[0] ?? G0()),
      document.body.insertAdjacentElement("beforeend", t[1] ?? G0()),
      Wp++,
      () => {
        Wp === 1 &&
          document
            .querySelectorAll("[data-radix-focus-guard]")
            .forEach(e => e.remove()),
          Wp--
      }
    )
  }, [])
}
function G0() {
  const t = document.createElement("span")
  return (
    t.setAttribute("data-radix-focus-guard", ""),
    (t.tabIndex = 0),
    (t.style.outline = "none"),
    (t.style.opacity = "0"),
    (t.style.position = "fixed"),
    (t.style.pointerEvents = "none"),
    t
  )
}
var Rr = function () {
  return (
    (Rr =
      Object.assign ||
      function (e) {
        for (var n, s = 1, o = arguments.length; s < o; s++) {
          n = arguments[s]
          for (var l in n)
            Object.prototype.hasOwnProperty.call(n, l) && (e[l] = n[l])
        }
        return e
      }),
    Rr.apply(this, arguments)
  )
}
function $1(t, e) {
  var n = {}
  for (var s in t)
    Object.prototype.hasOwnProperty.call(t, s) &&
      e.indexOf(s) < 0 &&
      (n[s] = t[s])
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, s = Object.getOwnPropertySymbols(t); o < s.length; o++)
      e.indexOf(s[o]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(t, s[o]) &&
        (n[s[o]] = t[s[o]])
  return n
}
function J2(t, e, n) {
  if (n || arguments.length === 2)
    for (var s = 0, o = e.length, l; s < o; s++)
      (l || !(s in e)) &&
        (l || (l = Array.prototype.slice.call(e, 0, s)), (l[s] = e[s]))
  return t.concat(l || Array.prototype.slice.call(e))
}
var wf = "right-scroll-bar-position",
  Sf = "width-before-scroll-bar",
  eO = "with-scroll-bars-hidden",
  tO = "--removed-body-scroll-bar-size"
function Vp(t, e) {
  return typeof t == "function" ? t(e) : t && (t.current = e), t
}
function nO(t, e) {
  var n = v.useState(function () {
    return {
      value: t,
      callback: e,
      facade: {
        get current() {
          return n.value
        },
        set current(s) {
          var o = n.value
          o !== s && ((n.value = s), n.callback(s, o))
        },
      },
    }
  })[0]
  return (n.callback = e), n.facade
}
var rO = typeof window < "u" ? v.useLayoutEffect : v.useEffect,
  K0 = new WeakMap()
function iO(t, e) {
  var n = nO(null, function (s) {
    return t.forEach(function (o) {
      return Vp(o, s)
    })
  })
  return (
    rO(
      function () {
        var s = K0.get(n)
        if (s) {
          var o = new Set(s),
            l = new Set(t),
            u = n.current
          o.forEach(function (f) {
            l.has(f) || Vp(f, null)
          }),
            l.forEach(function (f) {
              o.has(f) || Vp(f, u)
            })
        }
        K0.set(n, t)
      },
      [t],
    ),
    n
  )
}
function sO(t) {
  return t
}
function oO(t, e) {
  e === void 0 && (e = sO)
  var n = [],
    s = !1,
    o = {
      read: function () {
        if (s)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.",
          )
        return n.length ? n[n.length - 1] : t
      },
      useMedium: function (l) {
        var u = e(l, s)
        return (
          n.push(u),
          function () {
            n = n.filter(function (f) {
              return f !== u
            })
          }
        )
      },
      assignSyncMedium: function (l) {
        for (s = !0; n.length; ) {
          var u = n
          ;(n = []), u.forEach(l)
        }
        n = {
          push: function (f) {
            return l(f)
          },
          filter: function () {
            return n
          },
        }
      },
      assignMedium: function (l) {
        s = !0
        var u = []
        if (n.length) {
          var f = n
          ;(n = []), f.forEach(l), (u = n)
        }
        var d = function () {
            var h = u
            ;(u = []), h.forEach(l)
          },
          m = function () {
            return Promise.resolve().then(d)
          }
        m(),
          (n = {
            push: function (h) {
              u.push(h), m()
            },
            filter: function (h) {
              return (u = u.filter(h)), n
            },
          })
      },
    }
  return o
}
function aO(t) {
  t === void 0 && (t = {})
  var e = oO(null)
  return (e.options = Rr({ async: !0, ssr: !1 }, t)), e
}
var W1 = function (t) {
  var e = t.sideCar,
    n = $1(t, ["sideCar"])
  if (!e)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car",
    )
  var s = e.read()
  if (!s) throw new Error("Sidecar medium not found")
  return v.createElement(s, Rr({}, n))
}
W1.isSideCarExport = !0
function lO(t, e) {
  return t.useMedium(e), W1
}
var V1 = aO(),
  Hp = function () {},
  Ed = v.forwardRef(function (t, e) {
    var n = v.useRef(null),
      s = v.useState({
        onScrollCapture: Hp,
        onWheelCapture: Hp,
        onTouchMoveCapture: Hp,
      }),
      o = s[0],
      l = s[1],
      u = t.forwardProps,
      f = t.children,
      d = t.className,
      m = t.removeScrollBar,
      h = t.enabled,
      g = t.shards,
      w = t.sideCar,
      b = t.noIsolation,
      E = t.inert,
      S = t.allowPinchZoom,
      C = t.as,
      _ = C === void 0 ? "div" : C,
      A = t.gapMode,
      O = $1(t, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      M = w,
      D = iO([n, e]),
      K = Rr(Rr({}, O), o)
    return v.createElement(
      v.Fragment,
      null,
      h &&
        v.createElement(M, {
          sideCar: V1,
          removeScrollBar: m,
          shards: g,
          noIsolation: b,
          inert: E,
          setCallbacks: l,
          allowPinchZoom: !!S,
          lockRef: n,
          gapMode: A,
        }),
      u
        ? v.cloneElement(v.Children.only(f), Rr(Rr({}, K), { ref: D }))
        : v.createElement(_, Rr({}, K, { className: d, ref: D }), f),
    )
  })
Ed.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 }
Ed.classNames = { fullWidth: Sf, zeroRight: wf }
var uO = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__
}
function cO() {
  if (!document) return null
  var t = document.createElement("style")
  t.type = "text/css"
  var e = uO()
  return e && t.setAttribute("nonce", e), t
}
function fO(t, e) {
  t.styleSheet
    ? (t.styleSheet.cssText = e)
    : t.appendChild(document.createTextNode(e))
}
function dO(t) {
  var e = document.head || document.getElementsByTagName("head")[0]
  e.appendChild(t)
}
var hO = function () {
    var t = 0,
      e = null
    return {
      add: function (n) {
        t == 0 && (e = cO()) && (fO(e, n), dO(e)), t++
      },
      remove: function () {
        t--,
          !t && e && (e.parentNode && e.parentNode.removeChild(e), (e = null))
      },
    }
  },
  pO = function () {
    var t = hO()
    return function (e, n) {
      v.useEffect(
        function () {
          return (
            t.add(e),
            function () {
              t.remove()
            }
          )
        },
        [e && n],
      )
    }
  },
  H1 = function () {
    var t = pO(),
      e = function (n) {
        var s = n.styles,
          o = n.dynamic
        return t(s, o), null
      }
    return e
  },
  mO = { left: 0, top: 0, right: 0, gap: 0 },
  Gp = function (t) {
    return parseInt(t || "", 10) || 0
  },
  gO = function (t) {
    var e = window.getComputedStyle(document.body),
      n = e[t === "padding" ? "paddingLeft" : "marginLeft"],
      s = e[t === "padding" ? "paddingTop" : "marginTop"],
      o = e[t === "padding" ? "paddingRight" : "marginRight"]
    return [Gp(n), Gp(s), Gp(o)]
  },
  yO = function (t) {
    if ((t === void 0 && (t = "margin"), typeof window > "u")) return mO
    var e = gO(t),
      n = document.documentElement.clientWidth,
      s = window.innerWidth
    return {
      left: e[0],
      top: e[1],
      right: e[2],
      gap: Math.max(0, s - n + e[2] - e[0]),
    }
  },
  vO = H1(),
  ga = "data-scroll-locked",
  wO = function (t, e, n, s) {
    var o = t.left,
      l = t.top,
      u = t.right,
      f = t.gap
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          eO,
          ` {
   overflow: hidden `,
        )
        .concat(
          s,
          `;
   padding-right: `,
        )
        .concat(f, "px ")
        .concat(
          s,
          `;
  }
  body[`,
        )
        .concat(
          ga,
          `] {
    overflow: hidden `,
        )
        .concat(
          s,
          `;
    overscroll-behavior: contain;
    `,
        )
        .concat(
          [
            e && "position: relative ".concat(s, ";"),
            n === "margin" &&
              `
    padding-left: `
                .concat(
                  o,
                  `px;
    padding-top: `,
                )
                .concat(
                  l,
                  `px;
    padding-right: `,
                )
                .concat(
                  u,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `,
                )
                .concat(f, "px ")
                .concat(
                  s,
                  `;
    `,
                ),
            n === "padding" &&
              "padding-right: ".concat(f, "px ").concat(s, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`,
        )
        .concat(
          wf,
          ` {
    right: `,
        )
        .concat(f, "px ")
        .concat(
          s,
          `;
  }
  
  .`,
        )
        .concat(
          Sf,
          ` {
    margin-right: `,
        )
        .concat(f, "px ")
        .concat(
          s,
          `;
  }
  
  .`,
        )
        .concat(wf, " .")
        .concat(
          wf,
          ` {
    right: 0 `,
        )
        .concat(
          s,
          `;
  }
  
  .`,
        )
        .concat(Sf, " .")
        .concat(
          Sf,
          ` {
    margin-right: 0 `,
        )
        .concat(
          s,
          `;
  }
  
  body[`,
        )
        .concat(
          ga,
          `] {
    `,
        )
        .concat(tO, ": ")
        .concat(
          f,
          `px;
  }
`,
        )
    )
  },
  q0 = function () {
    var t = parseInt(document.body.getAttribute(ga) || "0", 10)
    return isFinite(t) ? t : 0
  },
  SO = function () {
    v.useEffect(function () {
      return (
        document.body.setAttribute(ga, (q0() + 1).toString()),
        function () {
          var t = q0() - 1
          t <= 0
            ? document.body.removeAttribute(ga)
            : document.body.setAttribute(ga, t.toString())
        }
      )
    }, [])
  },
  xO = function (t) {
    var e = t.noRelative,
      n = t.noImportant,
      s = t.gapMode,
      o = s === void 0 ? "margin" : s
    SO()
    var l = v.useMemo(
      function () {
        return yO(o)
      },
      [o],
    )
    return v.createElement(vO, { styles: wO(l, !e, o, n ? "" : "!important") })
  },
  km = !1
if (typeof window < "u")
  try {
    var of = Object.defineProperty({}, "passive", {
      get: function () {
        return (km = !0), !0
      },
    })
    window.addEventListener("test", of, of),
      window.removeEventListener("test", of, of)
  } catch {
    km = !1
  }
var Jo = km ? { passive: !1 } : !1,
  EO = function (t) {
    return t.tagName === "TEXTAREA"
  },
  G1 = function (t, e) {
    if (!(t instanceof Element)) return !1
    var n = window.getComputedStyle(t)
    return (
      n[e] !== "hidden" &&
      !(n.overflowY === n.overflowX && !EO(t) && n[e] === "visible")
    )
  },
  bO = function (t) {
    return G1(t, "overflowY")
  },
  CO = function (t) {
    return G1(t, "overflowX")
  },
  Q0 = function (t, e) {
    var n = e.ownerDocument,
      s = e
    do {
      typeof ShadowRoot < "u" && s instanceof ShadowRoot && (s = s.host)
      var o = K1(t, s)
      if (o) {
        var l = q1(t, s),
          u = l[1],
          f = l[2]
        if (u > f) return !0
      }
      s = s.parentNode
    } while (s && s !== n.body)
    return !1
  },
  _O = function (t) {
    var e = t.scrollTop,
      n = t.scrollHeight,
      s = t.clientHeight
    return [e, n, s]
  },
  kO = function (t) {
    var e = t.scrollLeft,
      n = t.scrollWidth,
      s = t.clientWidth
    return [e, n, s]
  },
  K1 = function (t, e) {
    return t === "v" ? bO(e) : CO(e)
  },
  q1 = function (t, e) {
    return t === "v" ? _O(e) : kO(e)
  },
  OO = function (t, e) {
    return t === "h" && e === "rtl" ? -1 : 1
  },
  AO = function (t, e, n, s, o) {
    var l = OO(t, window.getComputedStyle(e).direction),
      u = l * s,
      f = n.target,
      d = e.contains(f),
      m = !1,
      h = u > 0,
      g = 0,
      w = 0
    do {
      var b = q1(t, f),
        E = b[0],
        S = b[1],
        C = b[2],
        _ = S - C - l * E
      ;(E || _) && K1(t, f) && ((g += _), (w += E)),
        f instanceof ShadowRoot ? (f = f.host) : (f = f.parentNode)
    } while ((!d && f !== document.body) || (d && (e.contains(f) || e === f)))
    return ((h && Math.abs(g) < 1) || (!h && Math.abs(w) < 1)) && (m = !0), m
  },
  af = function (t) {
    return "changedTouches" in t
      ? [t.changedTouches[0].clientX, t.changedTouches[0].clientY]
      : [0, 0]
  },
  Y0 = function (t) {
    return [t.deltaX, t.deltaY]
  },
  X0 = function (t) {
    return t && "current" in t ? t.current : t
  },
  TO = function (t, e) {
    return t[0] === e[0] && t[1] === e[1]
  },
  RO = function (t) {
    return `
  .block-interactivity-`
      .concat(
        t,
        ` {pointer-events: none;}
  .allow-interactivity-`,
      )
      .concat(
        t,
        ` {pointer-events: all;}
`,
      )
  },
  PO = 0,
  ea = []
function IO(t) {
  var e = v.useRef([]),
    n = v.useRef([0, 0]),
    s = v.useRef(),
    o = v.useState(PO++)[0],
    l = v.useState(H1)[0],
    u = v.useRef(t)
  v.useEffect(
    function () {
      u.current = t
    },
    [t],
  ),
    v.useEffect(
      function () {
        if (t.inert) {
          document.body.classList.add("block-interactivity-".concat(o))
          var S = J2([t.lockRef.current], (t.shards || []).map(X0), !0).filter(
            Boolean,
          )
          return (
            S.forEach(function (C) {
              return C.classList.add("allow-interactivity-".concat(o))
            }),
            function () {
              document.body.classList.remove("block-interactivity-".concat(o)),
                S.forEach(function (C) {
                  return C.classList.remove("allow-interactivity-".concat(o))
                })
            }
          )
        }
      },
      [t.inert, t.lockRef.current, t.shards],
    )
  var f = v.useCallback(function (S, C) {
      if (
        ("touches" in S && S.touches.length === 2) ||
        (S.type === "wheel" && S.ctrlKey)
      )
        return !u.current.allowPinchZoom
      var _ = af(S),
        A = n.current,
        O = "deltaX" in S ? S.deltaX : A[0] - _[0],
        M = "deltaY" in S ? S.deltaY : A[1] - _[1],
        D,
        K = S.target,
        W = Math.abs(O) > Math.abs(M) ? "h" : "v"
      if ("touches" in S && W === "h" && K.type === "range") return !1
      var q = Q0(W, K)
      if (!q) return !0
      if ((q ? (D = W) : ((D = W === "v" ? "h" : "v"), (q = Q0(W, K))), !q))
        return !1
      if (
        (!s.current && "changedTouches" in S && (O || M) && (s.current = D), !D)
      )
        return !0
      var Z = s.current || D
      return AO(Z, C, S, Z === "h" ? O : M)
    }, []),
    d = v.useCallback(function (S) {
      var C = S
      if (!(!ea.length || ea[ea.length - 1] !== l)) {
        var _ = "deltaY" in C ? Y0(C) : af(C),
          A = e.current.filter(function (D) {
            return (
              D.name === C.type &&
              (D.target === C.target || C.target === D.shadowParent) &&
              TO(D.delta, _)
            )
          })[0]
        if (A && A.should) {
          C.cancelable && C.preventDefault()
          return
        }
        if (!A) {
          var O = (u.current.shards || [])
              .map(X0)
              .filter(Boolean)
              .filter(function (D) {
                return D.contains(C.target)
              }),
            M = O.length > 0 ? f(C, O[0]) : !u.current.noIsolation
          M && C.cancelable && C.preventDefault()
        }
      }
    }, []),
    m = v.useCallback(function (S, C, _, A) {
      var O = { name: S, delta: C, target: _, should: A, shadowParent: MO(_) }
      e.current.push(O),
        setTimeout(function () {
          e.current = e.current.filter(function (M) {
            return M !== O
          })
        }, 1)
    }, []),
    h = v.useCallback(function (S) {
      ;(n.current = af(S)), (s.current = void 0)
    }, []),
    g = v.useCallback(function (S) {
      m(S.type, Y0(S), S.target, f(S, t.lockRef.current))
    }, []),
    w = v.useCallback(function (S) {
      m(S.type, af(S), S.target, f(S, t.lockRef.current))
    }, [])
  v.useEffect(function () {
    return (
      ea.push(l),
      t.setCallbacks({
        onScrollCapture: g,
        onWheelCapture: g,
        onTouchMoveCapture: w,
      }),
      document.addEventListener("wheel", d, Jo),
      document.addEventListener("touchmove", d, Jo),
      document.addEventListener("touchstart", h, Jo),
      function () {
        ;(ea = ea.filter(function (S) {
          return S !== l
        })),
          document.removeEventListener("wheel", d, Jo),
          document.removeEventListener("touchmove", d, Jo),
          document.removeEventListener("touchstart", h, Jo)
      }
    )
  }, [])
  var b = t.removeScrollBar,
    E = t.inert
  return v.createElement(
    v.Fragment,
    null,
    E ? v.createElement(l, { styles: RO(o) }) : null,
    b ? v.createElement(xO, { gapMode: t.gapMode }) : null,
  )
}
function MO(t) {
  for (var e = null; t !== null; )
    t instanceof ShadowRoot && ((e = t.host), (t = t.host)), (t = t.parentNode)
  return e
}
const NO = lO(V1, IO)
var Tg = v.forwardRef(function (t, e) {
  return v.createElement(Ed, Rr({}, t, { ref: e, sideCar: NO }))
})
Tg.classNames = Ed.classNames
var jO = function (t) {
    if (typeof document > "u") return null
    var e = Array.isArray(t) ? t[0] : t
    return e.ownerDocument.body
  },
  ta = new WeakMap(),
  lf = new WeakMap(),
  uf = {},
  Kp = 0,
  Q1 = function (t) {
    return t && (t.host || Q1(t.parentNode))
  },
  DO = function (t, e) {
    return e
      .map(function (n) {
        if (t.contains(n)) return n
        var s = Q1(n)
        return s && t.contains(s)
          ? s
          : (console.error(
              "aria-hidden",
              n,
              "in not contained inside",
              t,
              ". Doing nothing",
            ),
            null)
      })
      .filter(function (n) {
        return !!n
      })
  },
  LO = function (t, e, n, s) {
    var o = DO(e, Array.isArray(t) ? t : [t])
    uf[n] || (uf[n] = new WeakMap())
    var l = uf[n],
      u = [],
      f = new Set(),
      d = new Set(o),
      m = function (g) {
        !g || f.has(g) || (f.add(g), m(g.parentNode))
      }
    o.forEach(m)
    var h = function (g) {
      !g ||
        d.has(g) ||
        Array.prototype.forEach.call(g.children, function (w) {
          if (f.has(w)) h(w)
          else
            try {
              var b = w.getAttribute(s),
                E = b !== null && b !== "false",
                S = (ta.get(w) || 0) + 1,
                C = (l.get(w) || 0) + 1
              ta.set(w, S),
                l.set(w, C),
                u.push(w),
                S === 1 && E && lf.set(w, !0),
                C === 1 && w.setAttribute(n, "true"),
                E || w.setAttribute(s, "true")
            } catch (_) {
              console.error("aria-hidden: cannot operate on ", w, _)
            }
        })
    }
    return (
      h(e),
      f.clear(),
      Kp++,
      function () {
        u.forEach(function (g) {
          var w = ta.get(g) - 1,
            b = l.get(g) - 1
          ta.set(g, w),
            l.set(g, b),
            w || (lf.has(g) || g.removeAttribute(s), lf.delete(g)),
            b || g.removeAttribute(n)
        }),
          Kp--,
          Kp ||
            ((ta = new WeakMap()),
            (ta = new WeakMap()),
            (lf = new WeakMap()),
            (uf = {}))
      }
    )
  },
  Y1 = function (t, e, n) {
    n === void 0 && (n = "data-aria-hidden")
    var s = Array.from(Array.isArray(t) ? t : [t]),
      o = jO(t)
    return o
      ? (s.push.apply(s, Array.from(o.querySelectorAll("[aria-live]"))),
        LO(s, o, n, "aria-hidden"))
      : function () {
          return null
        }
  },
  Rg = "Dialog",
  [X1, Z5] = vo(Rg),
  [BO, pr] = X1(Rg),
  Z1 = t => {
    const {
        __scopeDialog: e,
        children: n,
        open: s,
        defaultOpen: o,
        onOpenChange: l,
        modal: u = !0,
      } = t,
      f = v.useRef(null),
      d = v.useRef(null),
      [m = !1, h] = _g({ prop: s, defaultProp: o, onChange: l })
    return T.jsx(BO, {
      scope: e,
      triggerRef: f,
      contentRef: d,
      contentId: ma(),
      titleId: ma(),
      descriptionId: ma(),
      open: m,
      onOpenChange: h,
      onOpenToggle: v.useCallback(() => h(g => !g), [h]),
      modal: u,
      children: n,
    })
  }
Z1.displayName = Rg
var J1 = "DialogTrigger",
  ex = v.forwardRef((t, e) => {
    const { __scopeDialog: n, ...s } = t,
      o = pr(J1, n),
      l = Ct(e, o.triggerRef)
    return T.jsx(dt.button, {
      "type": "button",
      "aria-haspopup": "dialog",
      "aria-expanded": o.open,
      "aria-controls": o.contentId,
      "data-state": Mg(o.open),
      ...s,
      "ref": l,
      "onClick": Oe(t.onClick, o.onOpenToggle),
    })
  })
ex.displayName = J1
var Pg = "DialogPortal",
  [FO, tx] = X1(Pg, { forceMount: void 0 }),
  nx = t => {
    const { __scopeDialog: e, forceMount: n, children: s, container: o } = t,
      l = pr(Pg, e)
    return T.jsx(FO, {
      scope: e,
      forceMount: n,
      children: v.Children.map(s, u =>
        T.jsx(vi, {
          present: n || l.open,
          children: T.jsx(Ag, { asChild: !0, container: o, children: u }),
        }),
      ),
    })
  }
nx.displayName = Pg
var Qf = "DialogOverlay",
  rx = v.forwardRef((t, e) => {
    const n = tx(Qf, t.__scopeDialog),
      { forceMount: s = n.forceMount, ...o } = t,
      l = pr(Qf, t.__scopeDialog)
    return l.modal
      ? T.jsx(vi, {
          present: s || l.open,
          children: T.jsx(UO, { ...o, ref: e }),
        })
      : null
  })
rx.displayName = Qf
var UO = v.forwardRef((t, e) => {
    const { __scopeDialog: n, ...s } = t,
      o = pr(Qf, n)
    return T.jsx(Tg, {
      as: Bn,
      allowPinchZoom: !0,
      shards: [o.contentRef],
      children: T.jsx(dt.div, {
        "data-state": Mg(o.open),
        ...s,
        "ref": e,
        "style": { pointerEvents: "auto", ...s.style },
      }),
    })
  }),
  co = "DialogContent",
  ix = v.forwardRef((t, e) => {
    const n = tx(co, t.__scopeDialog),
      { forceMount: s = n.forceMount, ...o } = t,
      l = pr(co, t.__scopeDialog)
    return T.jsx(vi, {
      present: s || l.open,
      children: l.modal
        ? T.jsx(zO, { ...o, ref: e })
        : T.jsx($O, { ...o, ref: e }),
    })
  })
ix.displayName = co
var zO = v.forwardRef((t, e) => {
    const n = pr(co, t.__scopeDialog),
      s = v.useRef(null),
      o = Ct(e, n.contentRef, s)
    return (
      v.useEffect(() => {
        const l = s.current
        if (l) return Y1(l)
      }, []),
      T.jsx(sx, {
        ...t,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: Oe(t.onCloseAutoFocus, l => {
          var u
          l.preventDefault(), (u = n.triggerRef.current) == null || u.focus()
        }),
        onPointerDownOutside: Oe(t.onPointerDownOutside, l => {
          const u = l.detail.originalEvent,
            f = u.button === 0 && u.ctrlKey === !0
          ;(u.button === 2 || f) && l.preventDefault()
        }),
        onFocusOutside: Oe(t.onFocusOutside, l => l.preventDefault()),
      })
    )
  }),
  $O = v.forwardRef((t, e) => {
    const n = pr(co, t.__scopeDialog),
      s = v.useRef(!1),
      o = v.useRef(!1)
    return T.jsx(sx, {
      ...t,
      ref: e,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: l => {
        var u, f
        ;(u = t.onCloseAutoFocus) == null || u.call(t, l),
          l.defaultPrevented ||
            (s.current || (f = n.triggerRef.current) == null || f.focus(),
            l.preventDefault()),
          (s.current = !1),
          (o.current = !1)
      },
      onInteractOutside: l => {
        var d, m
        ;(d = t.onInteractOutside) == null || d.call(t, l),
          l.defaultPrevented ||
            ((s.current = !0),
            l.detail.originalEvent.type === "pointerdown" && (o.current = !0))
        const u = l.target
        ;((m = n.triggerRef.current) == null ? void 0 : m.contains(u)) &&
          l.preventDefault(),
          l.detail.originalEvent.type === "focusin" &&
            o.current &&
            l.preventDefault()
      },
    })
  }),
  sx = v.forwardRef((t, e) => {
    const {
        __scopeDialog: n,
        trapFocus: s,
        onOpenAutoFocus: o,
        onCloseAutoFocus: l,
        ...u
      } = t,
      f = pr(co, n),
      d = v.useRef(null),
      m = Ct(e, d)
    return (
      z1(),
      T.jsxs(T.Fragment, {
        children: [
          T.jsx(Og, {
            asChild: !0,
            loop: !0,
            trapped: s,
            onMountAutoFocus: o,
            onUnmountAutoFocus: l,
            children: T.jsx(xd, {
              "role": "dialog",
              "id": f.contentId,
              "aria-describedby": f.descriptionId,
              "aria-labelledby": f.titleId,
              "data-state": Mg(f.open),
              ...u,
              "ref": m,
              "onDismiss": () => f.onOpenChange(!1),
            }),
          }),
          T.jsxs(T.Fragment, {
            children: [
              T.jsx(VO, { titleId: f.titleId }),
              T.jsx(GO, { contentRef: d, descriptionId: f.descriptionId }),
            ],
          }),
        ],
      })
    )
  }),
  Ig = "DialogTitle",
  ox = v.forwardRef((t, e) => {
    const { __scopeDialog: n, ...s } = t,
      o = pr(Ig, n)
    return T.jsx(dt.h2, { id: o.titleId, ...s, ref: e })
  })
ox.displayName = Ig
var ax = "DialogDescription",
  WO = v.forwardRef((t, e) => {
    const { __scopeDialog: n, ...s } = t,
      o = pr(ax, n)
    return T.jsx(dt.p, { id: o.descriptionId, ...s, ref: e })
  })
WO.displayName = ax
var lx = "DialogClose",
  ux = v.forwardRef((t, e) => {
    const { __scopeDialog: n, ...s } = t,
      o = pr(lx, n)
    return T.jsx(dt.button, {
      type: "button",
      ...s,
      ref: e,
      onClick: Oe(t.onClick, () => o.onOpenChange(!1)),
    })
  })
ux.displayName = lx
function Mg(t) {
  return t ? "open" : "closed"
}
var cx = "DialogTitleWarning",
  [J5, fx] = C2(cx, { contentName: co, titleName: Ig, docsSlug: "dialog" }),
  VO = ({ titleId: t }) => {
    const e = fx(cx),
      n = `\`${e.contentName}\` requires a \`${e.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${e.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${e.docsSlug}`
    return (
      v.useEffect(() => {
        t && (document.getElementById(t) || console.error(n))
      }, [n, t]),
      null
    )
  },
  HO = "DialogDescriptionWarning",
  GO = ({ contentRef: t, descriptionId: e }) => {
    const s = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${fx(HO).contentName}}.`
    return (
      v.useEffect(() => {
        var l
        const o =
          (l = t.current) == null ? void 0 : l.getAttribute("aria-describedby")
        e && o && (document.getElementById(e) || console.warn(s))
      }, [s, t, e]),
      null
    )
  },
  KO = Z1,
  qO = ex,
  QO = nx,
  YO = rx,
  XO = ix,
  ZO = ox,
  JO = ux
function dx(t) {
  var e,
    n,
    s = ""
  if (typeof t == "string" || typeof t == "number") s += t
  else if (typeof t == "object")
    if (Array.isArray(t)) {
      var o = t.length
      for (e = 0; e < o; e++)
        t[e] && (n = dx(t[e])) && (s && (s += " "), (s += n))
    } else for (n in t) t[n] && (s && (s += " "), (s += n))
  return s
}
function hi() {
  for (var t, e, n = 0, s = "", o = arguments.length; n < o; n++)
    (t = arguments[n]) && (e = dx(t)) && (s && (s += " "), (s += e))
  return s
}
var Qa = class {
    constructor() {
      ;(this.listeners = new Set()),
        (this.subscribe = this.subscribe.bind(this))
    }
    subscribe(t) {
      return (
        this.listeners.add(t),
        this.onSubscribe(),
        () => {
          this.listeners.delete(t), this.onUnsubscribe()
        }
      )
    }
    hasListeners() {
      return this.listeners.size > 0
    }
    onSubscribe() {}
    onUnsubscribe() {}
  },
  fo = typeof window > "u" || "Deno" in globalThis
function Mn() {}
function eA(t, e) {
  return typeof t == "function" ? t(e) : t
}
function Om(t) {
  return typeof t == "number" && t >= 0 && t !== 1 / 0
}
function hx(t, e) {
  return Math.max(t + (e || 0) - Date.now(), 0)
}
function ya(t, e) {
  return typeof t == "function" ? t(e) : t
}
function or(t, e) {
  return typeof t == "function" ? t(e) : t
}
function Z0(t, e) {
  const {
    type: n = "all",
    exact: s,
    fetchStatus: o,
    predicate: l,
    queryKey: u,
    stale: f,
  } = t
  if (u) {
    if (s) {
      if (e.queryHash !== Ng(u, e.options)) return !1
    } else if (!wu(e.queryKey, u)) return !1
  }
  if (n !== "all") {
    const d = e.isActive()
    if ((n === "active" && !d) || (n === "inactive" && d)) return !1
  }
  return !(
    (typeof f == "boolean" && e.isStale() !== f) ||
    (o && o !== e.state.fetchStatus) ||
    (l && !l(e))
  )
}
function J0(t, e) {
  const { exact: n, status: s, predicate: o, mutationKey: l } = t
  if (l) {
    if (!e.options.mutationKey) return !1
    if (n) {
      if (ho(e.options.mutationKey) !== ho(l)) return !1
    } else if (!wu(e.options.mutationKey, l)) return !1
  }
  return !((s && e.state.status !== s) || (o && !o(e)))
}
function Ng(t, e) {
  return ((e == null ? void 0 : e.queryKeyHashFn) || ho)(t)
}
function ho(t) {
  return JSON.stringify(t, (e, n) =>
    Am(n)
      ? Object.keys(n)
          .sort()
          .reduce((s, o) => ((s[o] = n[o]), s), {})
      : n,
  )
}
function wu(t, e) {
  return t === e
    ? !0
    : typeof t != typeof e
      ? !1
      : t && e && typeof t == "object" && typeof e == "object"
        ? !Object.keys(e).some(n => !wu(t[n], e[n]))
        : !1
}
function px(t, e) {
  if (t === e) return t
  const n = eS(t) && eS(e)
  if (n || (Am(t) && Am(e))) {
    const s = n ? t : Object.keys(t),
      o = s.length,
      l = n ? e : Object.keys(e),
      u = l.length,
      f = n ? [] : {}
    let d = 0
    for (let m = 0; m < u; m++) {
      const h = n ? m : l[m]
      ;((!n && s.includes(h)) || n) && t[h] === void 0 && e[h] === void 0
        ? ((f[h] = void 0), d++)
        : ((f[h] = px(t[h], e[h])), f[h] === t[h] && t[h] !== void 0 && d++)
    }
    return o === u && d === o ? t : f
  }
  return e
}
function Yf(t, e) {
  if (!e || Object.keys(t).length !== Object.keys(e).length) return !1
  for (const n in t) if (t[n] !== e[n]) return !1
  return !0
}
function eS(t) {
  return Array.isArray(t) && t.length === Object.keys(t).length
}
function Am(t) {
  if (!tS(t)) return !1
  const e = t.constructor
  if (e === void 0) return !0
  const n = e.prototype
  return !(
    !tS(n) ||
    !n.hasOwnProperty("isPrototypeOf") ||
    Object.getPrototypeOf(t) !== Object.prototype
  )
}
function tS(t) {
  return Object.prototype.toString.call(t) === "[object Object]"
}
function tA(t) {
  return new Promise(e => {
    setTimeout(e, t)
  })
}
function Tm(t, e, n) {
  return typeof n.structuralSharing == "function"
    ? n.structuralSharing(t, e)
    : n.structuralSharing !== !1
      ? px(t, e)
      : e
}
function nA(t, e, n = 0) {
  const s = [...t, e]
  return n && s.length > n ? s.slice(1) : s
}
function rA(t, e, n = 0) {
  const s = [e, ...t]
  return n && s.length > n ? s.slice(0, -1) : s
}
var jg = Symbol()
function mx(t, e) {
  return !t.queryFn && e != null && e.initialPromise
    ? () => e.initialPromise
    : !t.queryFn || t.queryFn === jg
      ? () => Promise.reject(new Error(`Missing queryFn: '${t.queryHash}'`))
      : t.queryFn
}
var Zs,
  Zi,
  ba,
  E1,
  iA =
    ((E1 = class extends Qa {
      constructor() {
        super()
        ne(this, Zs)
        ne(this, Zi)
        ne(this, ba)
        G(this, ba, e => {
          if (!fo && window.addEventListener) {
            const n = () => e()
            return (
              window.addEventListener("visibilitychange", n, !1),
              () => {
                window.removeEventListener("visibilitychange", n)
              }
            )
          }
        })
      }
      onSubscribe() {
        x(this, Zi) || this.setEventListener(x(this, ba))
      }
      onUnsubscribe() {
        var e
        this.hasListeners() ||
          ((e = x(this, Zi)) == null || e.call(this), G(this, Zi, void 0))
      }
      setEventListener(e) {
        var n
        G(this, ba, e),
          (n = x(this, Zi)) == null || n.call(this),
          G(
            this,
            Zi,
            e(s => {
              typeof s == "boolean" ? this.setFocused(s) : this.onFocus()
            }),
          )
      }
      setFocused(e) {
        x(this, Zs) !== e && (G(this, Zs, e), this.onFocus())
      }
      onFocus() {
        const e = this.isFocused()
        this.listeners.forEach(n => {
          n(e)
        })
      }
      isFocused() {
        var e
        return typeof x(this, Zs) == "boolean"
          ? x(this, Zs)
          : ((e = globalThis.document) == null ? void 0 : e.visibilityState) !==
              "hidden"
      }
    }),
    (Zs = new WeakMap()),
    (Zi = new WeakMap()),
    (ba = new WeakMap()),
    E1),
  Dg = new iA(),
  Ca,
  Ji,
  _a,
  b1,
  sA =
    ((b1 = class extends Qa {
      constructor() {
        super()
        ne(this, Ca, !0)
        ne(this, Ji)
        ne(this, _a)
        G(this, _a, e => {
          if (!fo && window.addEventListener) {
            const n = () => e(!0),
              s = () => e(!1)
            return (
              window.addEventListener("online", n, !1),
              window.addEventListener("offline", s, !1),
              () => {
                window.removeEventListener("online", n),
                  window.removeEventListener("offline", s)
              }
            )
          }
        })
      }
      onSubscribe() {
        x(this, Ji) || this.setEventListener(x(this, _a))
      }
      onUnsubscribe() {
        var e
        this.hasListeners() ||
          ((e = x(this, Ji)) == null || e.call(this), G(this, Ji, void 0))
      }
      setEventListener(e) {
        var n
        G(this, _a, e),
          (n = x(this, Ji)) == null || n.call(this),
          G(this, Ji, e(this.setOnline.bind(this)))
      }
      setOnline(e) {
        x(this, Ca) !== e &&
          (G(this, Ca, e),
          this.listeners.forEach(s => {
            s(e)
          }))
      }
      isOnline() {
        return x(this, Ca)
      }
    }),
    (Ca = new WeakMap()),
    (Ji = new WeakMap()),
    (_a = new WeakMap()),
    b1),
  Xf = new sA()
function Rm() {
  let t, e
  const n = new Promise((o, l) => {
    ;(t = o), (e = l)
  })
  ;(n.status = "pending"), n.catch(() => {})
  function s(o) {
    Object.assign(n, o), delete n.resolve, delete n.reject
  }
  return (
    (n.resolve = o => {
      s({ status: "fulfilled", value: o }), t(o)
    }),
    (n.reject = o => {
      s({ status: "rejected", reason: o }), e(o)
    }),
    n
  )
}
function oA(t) {
  return Math.min(1e3 * 2 ** t, 3e4)
}
function gx(t) {
  return (t ?? "online") === "online" ? Xf.isOnline() : !0
}
var yx = class extends Error {
  constructor(t) {
    super("CancelledError"),
      (this.revert = t == null ? void 0 : t.revert),
      (this.silent = t == null ? void 0 : t.silent)
  }
}
function qp(t) {
  return t instanceof yx
}
function vx(t) {
  let e = !1,
    n = 0,
    s = !1,
    o
  const l = Rm(),
    u = S => {
      var C
      s || (w(new yx(S)), (C = t.abort) == null || C.call(t))
    },
    f = () => {
      e = !0
    },
    d = () => {
      e = !1
    },
    m = () =>
      Dg.isFocused() &&
      (t.networkMode === "always" || Xf.isOnline()) &&
      t.canRun(),
    h = () => gx(t.networkMode) && t.canRun(),
    g = S => {
      var C
      s ||
        ((s = !0),
        (C = t.onSuccess) == null || C.call(t, S),
        o == null || o(),
        l.resolve(S))
    },
    w = S => {
      var C
      s ||
        ((s = !0),
        (C = t.onError) == null || C.call(t, S),
        o == null || o(),
        l.reject(S))
    },
    b = () =>
      new Promise(S => {
        var C
        ;(o = _ => {
          ;(s || m()) && S(_)
        }),
          (C = t.onPause) == null || C.call(t)
      }).then(() => {
        var S
        ;(o = void 0), s || (S = t.onContinue) == null || S.call(t)
      }),
    E = () => {
      if (s) return
      let S
      const C = n === 0 ? t.initialPromise : void 0
      try {
        S = C ?? t.fn()
      } catch (_) {
        S = Promise.reject(_)
      }
      Promise.resolve(S)
        .then(g)
        .catch(_ => {
          var K
          if (s) return
          const A = t.retry ?? (fo ? 0 : 3),
            O = t.retryDelay ?? oA,
            M = typeof O == "function" ? O(n, _) : O,
            D =
              A === !0 ||
              (typeof A == "number" && n < A) ||
              (typeof A == "function" && A(n, _))
          if (e || !D) {
            w(_)
            return
          }
          n++,
            (K = t.onFail) == null || K.call(t, n, _),
            tA(M)
              .then(() => (m() ? void 0 : b()))
              .then(() => {
                e ? w(_) : E()
              })
        })
    }
  return {
    promise: l,
    cancel: u,
    continue: () => (o == null || o(), l),
    cancelRetry: f,
    continueRetry: d,
    canStart: h,
    start: () => (h() ? E() : b().then(E), l),
  }
}
function aA() {
  let t = [],
    e = 0,
    n = f => {
      f()
    },
    s = f => {
      f()
    },
    o = f => setTimeout(f, 0)
  const l = f => {
      e
        ? t.push(f)
        : o(() => {
            n(f)
          })
    },
    u = () => {
      const f = t
      ;(t = []),
        f.length &&
          o(() => {
            s(() => {
              f.forEach(d => {
                n(d)
              })
            })
          })
    }
  return {
    batch: f => {
      let d
      e++
      try {
        d = f()
      } finally {
        e--, e || u()
      }
      return d
    },
    batchCalls:
      f =>
      (...d) => {
        l(() => {
          f(...d)
        })
      },
    schedule: l,
    setNotifyFunction: f => {
      n = f
    },
    setBatchNotifyFunction: f => {
      s = f
    },
    setScheduler: f => {
      o = f
    },
  }
}
var bt = aA(),
  Js,
  C1,
  wx =
    ((C1 = class {
      constructor() {
        ne(this, Js)
      }
      destroy() {
        this.clearGcTimeout()
      }
      scheduleGc() {
        this.clearGcTimeout(),
          Om(this.gcTime) &&
            G(
              this,
              Js,
              setTimeout(() => {
                this.optionalRemove()
              }, this.gcTime),
            )
      }
      updateGcTime(t) {
        this.gcTime = Math.max(
          this.gcTime || 0,
          t ?? (fo ? 1 / 0 : 5 * 60 * 1e3),
        )
      }
      clearGcTimeout() {
        x(this, Js) && (clearTimeout(x(this, Js)), G(this, Js, void 0))
      }
    }),
    (Js = new WeakMap()),
    C1),
  ka,
  Oa,
  In,
  eo,
  $t,
  Pu,
  to,
  Yn,
  Jr,
  _1,
  lA =
    ((_1 = class extends wx {
      constructor(e) {
        super()
        ne(this, Yn)
        ne(this, ka)
        ne(this, Oa)
        ne(this, In)
        ne(this, eo)
        ne(this, $t)
        ne(this, Pu)
        ne(this, to)
        G(this, to, !1),
          G(this, Pu, e.defaultOptions),
          this.setOptions(e.options),
          (this.observers = []),
          G(this, eo, e.client),
          G(this, In, x(this, eo).getQueryCache()),
          (this.queryKey = e.queryKey),
          (this.queryHash = e.queryHash),
          G(this, ka, uA(this.options)),
          (this.state = e.state ?? x(this, ka)),
          this.scheduleGc()
      }
      get meta() {
        return this.options.meta
      }
      get promise() {
        var e
        return (e = x(this, $t)) == null ? void 0 : e.promise
      }
      setOptions(e) {
        ;(this.options = { ...x(this, Pu), ...e }),
          this.updateGcTime(this.options.gcTime)
      }
      optionalRemove() {
        !this.observers.length &&
          this.state.fetchStatus === "idle" &&
          x(this, In).remove(this)
      }
      setData(e, n) {
        const s = Tm(this.state.data, e, this.options)
        return (
          Q(this, Yn, Jr).call(this, {
            data: s,
            type: "success",
            dataUpdatedAt: n == null ? void 0 : n.updatedAt,
            manual: n == null ? void 0 : n.manual,
          }),
          s
        )
      }
      setState(e, n) {
        Q(this, Yn, Jr).call(this, {
          type: "setState",
          state: e,
          setStateOptions: n,
        })
      }
      cancel(e) {
        var s, o
        const n = (s = x(this, $t)) == null ? void 0 : s.promise
        return (
          (o = x(this, $t)) == null || o.cancel(e),
          n ? n.then(Mn).catch(Mn) : Promise.resolve()
        )
      }
      destroy() {
        super.destroy(), this.cancel({ silent: !0 })
      }
      reset() {
        this.destroy(), this.setState(x(this, ka))
      }
      isActive() {
        return this.observers.some(e => or(e.options.enabled, this) !== !1)
      }
      isDisabled() {
        return this.getObserversCount() > 0
          ? !this.isActive()
          : this.options.queryFn === jg ||
              this.state.dataUpdateCount + this.state.errorUpdateCount === 0
      }
      isStale() {
        return this.state.isInvalidated
          ? !0
          : this.getObserversCount() > 0
            ? this.observers.some(e => e.getCurrentResult().isStale)
            : this.state.data === void 0
      }
      isStaleByTime(e = 0) {
        return (
          this.state.isInvalidated ||
          this.state.data === void 0 ||
          !hx(this.state.dataUpdatedAt, e)
        )
      }
      onFocus() {
        var n
        const e = this.observers.find(s => s.shouldFetchOnWindowFocus())
        e == null || e.refetch({ cancelRefetch: !1 }),
          (n = x(this, $t)) == null || n.continue()
      }
      onOnline() {
        var n
        const e = this.observers.find(s => s.shouldFetchOnReconnect())
        e == null || e.refetch({ cancelRefetch: !1 }),
          (n = x(this, $t)) == null || n.continue()
      }
      addObserver(e) {
        this.observers.includes(e) ||
          (this.observers.push(e),
          this.clearGcTimeout(),
          x(this, In).notify({
            type: "observerAdded",
            query: this,
            observer: e,
          }))
      }
      removeObserver(e) {
        this.observers.includes(e) &&
          ((this.observers = this.observers.filter(n => n !== e)),
          this.observers.length ||
            (x(this, $t) &&
              (x(this, to)
                ? x(this, $t).cancel({ revert: !0 })
                : x(this, $t).cancelRetry()),
            this.scheduleGc()),
          x(this, In).notify({
            type: "observerRemoved",
            query: this,
            observer: e,
          }))
      }
      getObserversCount() {
        return this.observers.length
      }
      invalidate() {
        this.state.isInvalidated ||
          Q(this, Yn, Jr).call(this, { type: "invalidate" })
      }
      fetch(e, n) {
        var d, m, h
        if (this.state.fetchStatus !== "idle") {
          if (this.state.data !== void 0 && n != null && n.cancelRefetch)
            this.cancel({ silent: !0 })
          else if (x(this, $t))
            return x(this, $t).continueRetry(), x(this, $t).promise
        }
        if ((e && this.setOptions(e), !this.options.queryFn)) {
          const g = this.observers.find(w => w.options.queryFn)
          g && this.setOptions(g.options)
        }
        const s = new AbortController(),
          o = g => {
            Object.defineProperty(g, "signal", {
              enumerable: !0,
              get: () => (G(this, to, !0), s.signal),
            })
          },
          l = () => {
            const g = mx(this.options, n),
              w = {
                client: x(this, eo),
                queryKey: this.queryKey,
                meta: this.meta,
              }
            return (
              o(w),
              G(this, to, !1),
              this.options.persister ? this.options.persister(g, w, this) : g(w)
            )
          },
          u = {
            fetchOptions: n,
            options: this.options,
            queryKey: this.queryKey,
            client: x(this, eo),
            state: this.state,
            fetchFn: l,
          }
        o(u),
          (d = this.options.behavior) == null || d.onFetch(u, this),
          G(this, Oa, this.state),
          (this.state.fetchStatus === "idle" ||
            this.state.fetchMeta !==
              ((m = u.fetchOptions) == null ? void 0 : m.meta)) &&
            Q(this, Yn, Jr).call(this, {
              type: "fetch",
              meta: (h = u.fetchOptions) == null ? void 0 : h.meta,
            })
        const f = g => {
          var w, b, E, S
          ;(qp(g) && g.silent) ||
            Q(this, Yn, Jr).call(this, { type: "error", error: g }),
            qp(g) ||
              ((b = (w = x(this, In).config).onError) == null ||
                b.call(w, g, this),
              (S = (E = x(this, In).config).onSettled) == null ||
                S.call(E, this.state.data, g, this)),
            this.scheduleGc()
        }
        return (
          G(
            this,
            $t,
            vx({
              initialPromise: n == null ? void 0 : n.initialPromise,
              fn: u.fetchFn,
              abort: s.abort.bind(s),
              onSuccess: g => {
                var w, b, E, S
                if (g === void 0) {
                  f(new Error(`${this.queryHash} data is undefined`))
                  return
                }
                try {
                  this.setData(g)
                } catch (C) {
                  f(C)
                  return
                }
                ;(b = (w = x(this, In).config).onSuccess) == null ||
                  b.call(w, g, this),
                  (S = (E = x(this, In).config).onSettled) == null ||
                    S.call(E, g, this.state.error, this),
                  this.scheduleGc()
              },
              onError: f,
              onFail: (g, w) => {
                Q(this, Yn, Jr).call(this, {
                  type: "failed",
                  failureCount: g,
                  error: w,
                })
              },
              onPause: () => {
                Q(this, Yn, Jr).call(this, { type: "pause" })
              },
              onContinue: () => {
                Q(this, Yn, Jr).call(this, { type: "continue" })
              },
              retry: u.options.retry,
              retryDelay: u.options.retryDelay,
              networkMode: u.options.networkMode,
              canRun: () => !0,
            }),
          ),
          x(this, $t).start()
        )
      }
    }),
    (ka = new WeakMap()),
    (Oa = new WeakMap()),
    (In = new WeakMap()),
    (eo = new WeakMap()),
    ($t = new WeakMap()),
    (Pu = new WeakMap()),
    (to = new WeakMap()),
    (Yn = new WeakSet()),
    (Jr = function (e) {
      const n = s => {
        switch (e.type) {
          case "failed":
            return {
              ...s,
              fetchFailureCount: e.failureCount,
              fetchFailureReason: e.error,
            }
          case "pause":
            return { ...s, fetchStatus: "paused" }
          case "continue":
            return { ...s, fetchStatus: "fetching" }
          case "fetch":
            return {
              ...s,
              ...Sx(s.data, this.options),
              fetchMeta: e.meta ?? null,
            }
          case "success":
            return {
              ...s,
              data: e.data,
              dataUpdateCount: s.dataUpdateCount + 1,
              dataUpdatedAt: e.dataUpdatedAt ?? Date.now(),
              error: null,
              isInvalidated: !1,
              status: "success",
              ...(!e.manual && {
                fetchStatus: "idle",
                fetchFailureCount: 0,
                fetchFailureReason: null,
              }),
            }
          case "error":
            const o = e.error
            return qp(o) && o.revert && x(this, Oa)
              ? { ...x(this, Oa), fetchStatus: "idle" }
              : {
                  ...s,
                  error: o,
                  errorUpdateCount: s.errorUpdateCount + 1,
                  errorUpdatedAt: Date.now(),
                  fetchFailureCount: s.fetchFailureCount + 1,
                  fetchFailureReason: o,
                  fetchStatus: "idle",
                  status: "error",
                }
          case "invalidate":
            return { ...s, isInvalidated: !0 }
          case "setState":
            return { ...s, ...e.state }
        }
      }
      ;(this.state = n(this.state)),
        bt.batch(() => {
          this.observers.forEach(s => {
            s.onQueryUpdate()
          }),
            x(this, In).notify({ query: this, type: "updated", action: e })
        })
    }),
    _1)
function Sx(t, e) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: gx(e.networkMode) ? "fetching" : "paused",
    ...(t === void 0 && { error: null, status: "pending" }),
  }
}
function uA(t) {
  const e =
      typeof t.initialData == "function" ? t.initialData() : t.initialData,
    n = e !== void 0,
    s = n
      ? typeof t.initialDataUpdatedAt == "function"
        ? t.initialDataUpdatedAt()
        : t.initialDataUpdatedAt
      : 0
  return {
    data: e,
    dataUpdateCount: 0,
    dataUpdatedAt: n ? (s ?? Date.now()) : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: n ? "success" : "pending",
    fetchStatus: "idle",
  }
}
var _r,
  k1,
  cA =
    ((k1 = class extends Qa {
      constructor(e = {}) {
        super()
        ne(this, _r)
        ;(this.config = e), G(this, _r, new Map())
      }
      build(e, n, s) {
        const o = n.queryKey,
          l = n.queryHash ?? Ng(o, n)
        let u = this.get(l)
        return (
          u ||
            ((u = new lA({
              client: e,
              queryKey: o,
              queryHash: l,
              options: e.defaultQueryOptions(n),
              state: s,
              defaultOptions: e.getQueryDefaults(o),
            })),
            this.add(u)),
          u
        )
      }
      add(e) {
        x(this, _r).has(e.queryHash) ||
          (x(this, _r).set(e.queryHash, e),
          this.notify({ type: "added", query: e }))
      }
      remove(e) {
        const n = x(this, _r).get(e.queryHash)
        n &&
          (e.destroy(),
          n === e && x(this, _r).delete(e.queryHash),
          this.notify({ type: "removed", query: e }))
      }
      clear() {
        bt.batch(() => {
          this.getAll().forEach(e => {
            this.remove(e)
          })
        })
      }
      get(e) {
        return x(this, _r).get(e)
      }
      getAll() {
        return [...x(this, _r).values()]
      }
      find(e) {
        const n = { exact: !0, ...e }
        return this.getAll().find(s => Z0(n, s))
      }
      findAll(e = {}) {
        const n = this.getAll()
        return Object.keys(e).length > 0 ? n.filter(s => Z0(e, s)) : n
      }
      notify(e) {
        bt.batch(() => {
          this.listeners.forEach(n => {
            n(e)
          })
        })
      }
      onFocus() {
        bt.batch(() => {
          this.getAll().forEach(e => {
            e.onFocus()
          })
        })
      }
      onOnline() {
        bt.batch(() => {
          this.getAll().forEach(e => {
            e.onOnline()
          })
        })
      }
    }),
    (_r = new WeakMap()),
    k1),
  kr,
  qt,
  no,
  Or,
  Gi,
  O1,
  fA =
    ((O1 = class extends wx {
      constructor(e) {
        super()
        ne(this, Or)
        ne(this, kr)
        ne(this, qt)
        ne(this, no)
        ;(this.mutationId = e.mutationId),
          G(this, qt, e.mutationCache),
          G(this, kr, []),
          (this.state = e.state || xx()),
          this.setOptions(e.options),
          this.scheduleGc()
      }
      setOptions(e) {
        ;(this.options = e), this.updateGcTime(this.options.gcTime)
      }
      get meta() {
        return this.options.meta
      }
      addObserver(e) {
        x(this, kr).includes(e) ||
          (x(this, kr).push(e),
          this.clearGcTimeout(),
          x(this, qt).notify({
            type: "observerAdded",
            mutation: this,
            observer: e,
          }))
      }
      removeObserver(e) {
        G(
          this,
          kr,
          x(this, kr).filter(n => n !== e),
        ),
          this.scheduleGc(),
          x(this, qt).notify({
            type: "observerRemoved",
            mutation: this,
            observer: e,
          })
      }
      optionalRemove() {
        x(this, kr).length ||
          (this.state.status === "pending"
            ? this.scheduleGc()
            : x(this, qt).remove(this))
      }
      continue() {
        var e
        return (
          ((e = x(this, no)) == null ? void 0 : e.continue()) ??
          this.execute(this.state.variables)
        )
      }
      async execute(e) {
        var o, l, u, f, d, m, h, g, w, b, E, S, C, _, A, O, M, D, K, W
        G(
          this,
          no,
          vx({
            fn: () =>
              this.options.mutationFn
                ? this.options.mutationFn(e)
                : Promise.reject(new Error("No mutationFn found")),
            onFail: (q, Z) => {
              Q(this, Or, Gi).call(this, {
                type: "failed",
                failureCount: q,
                error: Z,
              })
            },
            onPause: () => {
              Q(this, Or, Gi).call(this, { type: "pause" })
            },
            onContinue: () => {
              Q(this, Or, Gi).call(this, { type: "continue" })
            },
            retry: this.options.retry ?? 0,
            retryDelay: this.options.retryDelay,
            networkMode: this.options.networkMode,
            canRun: () => x(this, qt).canRun(this),
          }),
        )
        const n = this.state.status === "pending",
          s = !x(this, no).canStart()
        try {
          if (!n) {
            Q(this, Or, Gi).call(this, {
              type: "pending",
              variables: e,
              isPaused: s,
            }),
              await ((l = (o = x(this, qt).config).onMutate) == null
                ? void 0
                : l.call(o, e, this))
            const Z = await ((f = (u = this.options).onMutate) == null
              ? void 0
              : f.call(u, e))
            Z !== this.state.context &&
              Q(this, Or, Gi).call(this, {
                type: "pending",
                context: Z,
                variables: e,
                isPaused: s,
              })
          }
          const q = await x(this, no).start()
          return (
            await ((m = (d = x(this, qt).config).onSuccess) == null
              ? void 0
              : m.call(d, q, e, this.state.context, this)),
            await ((g = (h = this.options).onSuccess) == null
              ? void 0
              : g.call(h, q, e, this.state.context)),
            await ((b = (w = x(this, qt).config).onSettled) == null
              ? void 0
              : b.call(
                  w,
                  q,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                )),
            await ((S = (E = this.options).onSettled) == null
              ? void 0
              : S.call(E, q, null, e, this.state.context)),
            Q(this, Or, Gi).call(this, { type: "success", data: q }),
            q
          )
        } catch (q) {
          try {
            throw (
              (await ((_ = (C = x(this, qt).config).onError) == null
                ? void 0
                : _.call(C, q, e, this.state.context, this)),
              await ((O = (A = this.options).onError) == null
                ? void 0
                : O.call(A, q, e, this.state.context)),
              await ((D = (M = x(this, qt).config).onSettled) == null
                ? void 0
                : D.call(
                    M,
                    void 0,
                    q,
                    this.state.variables,
                    this.state.context,
                    this,
                  )),
              await ((W = (K = this.options).onSettled) == null
                ? void 0
                : W.call(K, void 0, q, e, this.state.context)),
              q)
            )
          } finally {
            Q(this, Or, Gi).call(this, { type: "error", error: q })
          }
        } finally {
          x(this, qt).runNext(this)
        }
      }
    }),
    (kr = new WeakMap()),
    (qt = new WeakMap()),
    (no = new WeakMap()),
    (Or = new WeakSet()),
    (Gi = function (e) {
      const n = s => {
        switch (e.type) {
          case "failed":
            return {
              ...s,
              failureCount: e.failureCount,
              failureReason: e.error,
            }
          case "pause":
            return { ...s, isPaused: !0 }
          case "continue":
            return { ...s, isPaused: !1 }
          case "pending":
            return {
              ...s,
              context: e.context,
              data: void 0,
              failureCount: 0,
              failureReason: null,
              error: null,
              isPaused: e.isPaused,
              status: "pending",
              variables: e.variables,
              submittedAt: Date.now(),
            }
          case "success":
            return {
              ...s,
              data: e.data,
              failureCount: 0,
              failureReason: null,
              error: null,
              status: "success",
              isPaused: !1,
            }
          case "error":
            return {
              ...s,
              data: void 0,
              error: e.error,
              failureCount: s.failureCount + 1,
              failureReason: e.error,
              isPaused: !1,
              status: "error",
            }
        }
      }
      ;(this.state = n(this.state)),
        bt.batch(() => {
          x(this, kr).forEach(s => {
            s.onMutationUpdate(e)
          }),
            x(this, qt).notify({ mutation: this, type: "updated", action: e })
        })
    }),
    O1)
function xx() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: "idle",
    variables: void 0,
    submittedAt: 0,
  }
}
var si,
  Xn,
  Iu,
  A1,
  dA =
    ((A1 = class extends Qa {
      constructor(e = {}) {
        super()
        ne(this, si)
        ne(this, Xn)
        ne(this, Iu)
        ;(this.config = e),
          G(this, si, new Set()),
          G(this, Xn, new Map()),
          G(this, Iu, 0)
      }
      build(e, n, s) {
        const o = new fA({
          mutationCache: this,
          mutationId: ++Ms(this, Iu)._,
          options: e.defaultMutationOptions(n),
          state: s,
        })
        return this.add(o), o
      }
      add(e) {
        x(this, si).add(e)
        const n = cf(e)
        if (typeof n == "string") {
          const s = x(this, Xn).get(n)
          s ? s.push(e) : x(this, Xn).set(n, [e])
        }
        this.notify({ type: "added", mutation: e })
      }
      remove(e) {
        if (x(this, si).delete(e)) {
          const n = cf(e)
          if (typeof n == "string") {
            const s = x(this, Xn).get(n)
            if (s)
              if (s.length > 1) {
                const o = s.indexOf(e)
                o !== -1 && s.splice(o, 1)
              } else s[0] === e && x(this, Xn).delete(n)
          }
        }
        this.notify({ type: "removed", mutation: e })
      }
      canRun(e) {
        const n = cf(e)
        if (typeof n == "string") {
          const s = x(this, Xn).get(n),
            o = s == null ? void 0 : s.find(l => l.state.status === "pending")
          return !o || o === e
        } else return !0
      }
      runNext(e) {
        var s
        const n = cf(e)
        if (typeof n == "string") {
          const o =
            (s = x(this, Xn).get(n)) == null
              ? void 0
              : s.find(l => l !== e && l.state.isPaused)
          return (o == null ? void 0 : o.continue()) ?? Promise.resolve()
        } else return Promise.resolve()
      }
      clear() {
        bt.batch(() => {
          x(this, si).forEach(e => {
            this.notify({ type: "removed", mutation: e })
          }),
            x(this, si).clear(),
            x(this, Xn).clear()
        })
      }
      getAll() {
        return Array.from(x(this, si))
      }
      find(e) {
        const n = { exact: !0, ...e }
        return this.getAll().find(s => J0(n, s))
      }
      findAll(e = {}) {
        return this.getAll().filter(n => J0(e, n))
      }
      notify(e) {
        bt.batch(() => {
          this.listeners.forEach(n => {
            n(e)
          })
        })
      }
      resumePausedMutations() {
        const e = this.getAll().filter(n => n.state.isPaused)
        return bt.batch(() => Promise.all(e.map(n => n.continue().catch(Mn))))
      }
    }),
    (si = new WeakMap()),
    (Xn = new WeakMap()),
    (Iu = new WeakMap()),
    A1)
function cf(t) {
  var e
  return (e = t.options.scope) == null ? void 0 : e.id
}
function nS(t) {
  return {
    onFetch: (e, n) => {
      var h, g, w, b, E
      const s = e.options,
        o =
          (w =
            (g = (h = e.fetchOptions) == null ? void 0 : h.meta) == null
              ? void 0
              : g.fetchMore) == null
            ? void 0
            : w.direction,
        l = ((b = e.state.data) == null ? void 0 : b.pages) || [],
        u = ((E = e.state.data) == null ? void 0 : E.pageParams) || []
      let f = { pages: [], pageParams: [] },
        d = 0
      const m = async () => {
        let S = !1
        const C = O => {
            Object.defineProperty(O, "signal", {
              enumerable: !0,
              get: () => (
                e.signal.aborted
                  ? (S = !0)
                  : e.signal.addEventListener("abort", () => {
                      S = !0
                    }),
                e.signal
              ),
            })
          },
          _ = mx(e.options, e.fetchOptions),
          A = async (O, M, D) => {
            if (S) return Promise.reject()
            if (M == null && O.pages.length) return Promise.resolve(O)
            const K = {
              client: e.client,
              queryKey: e.queryKey,
              pageParam: M,
              direction: D ? "backward" : "forward",
              meta: e.options.meta,
            }
            C(K)
            const W = await _(K),
              { maxPages: q } = e.options,
              Z = D ? rA : nA
            return {
              pages: Z(O.pages, W, q),
              pageParams: Z(O.pageParams, M, q),
            }
          }
        if (o && l.length) {
          const O = o === "backward",
            M = O ? hA : rS,
            D = { pages: l, pageParams: u },
            K = M(s, D)
          f = await A(D, K, O)
        } else {
          const O = t ?? l.length
          do {
            const M = d === 0 ? (u[0] ?? s.initialPageParam) : rS(s, f)
            if (d > 0 && M == null) break
            ;(f = await A(f, M)), d++
          } while (d < O)
        }
        return f
      }
      e.options.persister
        ? (e.fetchFn = () => {
            var S, C
            return (C = (S = e.options).persister) == null
              ? void 0
              : C.call(
                  S,
                  m,
                  {
                    client: e.client,
                    queryKey: e.queryKey,
                    meta: e.options.meta,
                    signal: e.signal,
                  },
                  n,
                )
          })
        : (e.fetchFn = m)
    },
  }
}
function rS(t, { pages: e, pageParams: n }) {
  const s = e.length - 1
  return e.length > 0 ? t.getNextPageParam(e[s], e, n[s], n) : void 0
}
function hA(t, { pages: e, pageParams: n }) {
  var s
  return e.length > 0
    ? (s = t.getPreviousPageParam) == null
      ? void 0
      : s.call(t, e[0], e, n[0], n)
    : void 0
}
var lt,
  es,
  ts,
  Aa,
  Ta,
  ns,
  Ra,
  Pa,
  T1,
  pA =
    ((T1 = class {
      constructor(t = {}) {
        ne(this, lt)
        ne(this, es)
        ne(this, ts)
        ne(this, Aa)
        ne(this, Ta)
        ne(this, ns)
        ne(this, Ra)
        ne(this, Pa)
        G(this, lt, t.queryCache || new cA()),
          G(this, es, t.mutationCache || new dA()),
          G(this, ts, t.defaultOptions || {}),
          G(this, Aa, new Map()),
          G(this, Ta, new Map()),
          G(this, ns, 0)
      }
      mount() {
        Ms(this, ns)._++,
          x(this, ns) === 1 &&
            (G(
              this,
              Ra,
              Dg.subscribe(async t => {
                t && (await this.resumePausedMutations(), x(this, lt).onFocus())
              }),
            ),
            G(
              this,
              Pa,
              Xf.subscribe(async t => {
                t &&
                  (await this.resumePausedMutations(), x(this, lt).onOnline())
              }),
            ))
      }
      unmount() {
        var t, e
        Ms(this, ns)._--,
          x(this, ns) === 0 &&
            ((t = x(this, Ra)) == null || t.call(this),
            G(this, Ra, void 0),
            (e = x(this, Pa)) == null || e.call(this),
            G(this, Pa, void 0))
      }
      isFetching(t) {
        return x(this, lt).findAll({ ...t, fetchStatus: "fetching" }).length
      }
      isMutating(t) {
        return x(this, es).findAll({ ...t, status: "pending" }).length
      }
      getQueryData(t) {
        var n
        const e = this.defaultQueryOptions({ queryKey: t })
        return (n = x(this, lt).get(e.queryHash)) == null
          ? void 0
          : n.state.data
      }
      ensureQueryData(t) {
        const e = this.defaultQueryOptions(t),
          n = x(this, lt).build(this, e),
          s = n.state.data
        return s === void 0
          ? this.fetchQuery(t)
          : (t.revalidateIfStale &&
              n.isStaleByTime(ya(e.staleTime, n)) &&
              this.prefetchQuery(e),
            Promise.resolve(s))
      }
      getQueriesData(t) {
        return x(this, lt)
          .findAll(t)
          .map(({ queryKey: e, state: n }) => {
            const s = n.data
            return [e, s]
          })
      }
      setQueryData(t, e, n) {
        const s = this.defaultQueryOptions({ queryKey: t }),
          o = x(this, lt).get(s.queryHash),
          l = o == null ? void 0 : o.state.data,
          u = eA(e, l)
        if (u !== void 0)
          return x(this, lt)
            .build(this, s)
            .setData(u, { ...n, manual: !0 })
      }
      setQueriesData(t, e, n) {
        return bt.batch(() =>
          x(this, lt)
            .findAll(t)
            .map(({ queryKey: s }) => [s, this.setQueryData(s, e, n)]),
        )
      }
      getQueryState(t) {
        var n
        const e = this.defaultQueryOptions({ queryKey: t })
        return (n = x(this, lt).get(e.queryHash)) == null ? void 0 : n.state
      }
      removeQueries(t) {
        const e = x(this, lt)
        bt.batch(() => {
          e.findAll(t).forEach(n => {
            e.remove(n)
          })
        })
      }
      resetQueries(t, e) {
        const n = x(this, lt)
        return bt.batch(
          () => (
            n.findAll(t).forEach(s => {
              s.reset()
            }),
            this.refetchQueries({ type: "active", ...t }, e)
          ),
        )
      }
      cancelQueries(t, e = {}) {
        const n = { revert: !0, ...e },
          s = bt.batch(() =>
            x(this, lt)
              .findAll(t)
              .map(o => o.cancel(n)),
          )
        return Promise.all(s).then(Mn).catch(Mn)
      }
      invalidateQueries(t, e = {}) {
        return bt.batch(
          () => (
            x(this, lt)
              .findAll(t)
              .forEach(n => {
                n.invalidate()
              }),
            (t == null ? void 0 : t.refetchType) === "none"
              ? Promise.resolve()
              : this.refetchQueries(
                  {
                    ...t,
                    type:
                      (t == null ? void 0 : t.refetchType) ??
                      (t == null ? void 0 : t.type) ??
                      "active",
                  },
                  e,
                )
          ),
        )
      }
      refetchQueries(t, e = {}) {
        const n = { ...e, cancelRefetch: e.cancelRefetch ?? !0 },
          s = bt.batch(() =>
            x(this, lt)
              .findAll(t)
              .filter(o => !o.isDisabled())
              .map(o => {
                let l = o.fetch(void 0, n)
                return (
                  n.throwOnError || (l = l.catch(Mn)),
                  o.state.fetchStatus === "paused" ? Promise.resolve() : l
                )
              }),
          )
        return Promise.all(s).then(Mn)
      }
      fetchQuery(t) {
        const e = this.defaultQueryOptions(t)
        e.retry === void 0 && (e.retry = !1)
        const n = x(this, lt).build(this, e)
        return n.isStaleByTime(ya(e.staleTime, n))
          ? n.fetch(e)
          : Promise.resolve(n.state.data)
      }
      prefetchQuery(t) {
        return this.fetchQuery(t).then(Mn).catch(Mn)
      }
      fetchInfiniteQuery(t) {
        return (t.behavior = nS(t.pages)), this.fetchQuery(t)
      }
      prefetchInfiniteQuery(t) {
        return this.fetchInfiniteQuery(t).then(Mn).catch(Mn)
      }
      ensureInfiniteQueryData(t) {
        return (t.behavior = nS(t.pages)), this.ensureQueryData(t)
      }
      resumePausedMutations() {
        return Xf.isOnline()
          ? x(this, es).resumePausedMutations()
          : Promise.resolve()
      }
      getQueryCache() {
        return x(this, lt)
      }
      getMutationCache() {
        return x(this, es)
      }
      getDefaultOptions() {
        return x(this, ts)
      }
      setDefaultOptions(t) {
        G(this, ts, t)
      }
      setQueryDefaults(t, e) {
        x(this, Aa).set(ho(t), { queryKey: t, defaultOptions: e })
      }
      getQueryDefaults(t) {
        const e = [...x(this, Aa).values()],
          n = {}
        return (
          e.forEach(s => {
            wu(t, s.queryKey) && Object.assign(n, s.defaultOptions)
          }),
          n
        )
      }
      setMutationDefaults(t, e) {
        x(this, Ta).set(ho(t), { mutationKey: t, defaultOptions: e })
      }
      getMutationDefaults(t) {
        const e = [...x(this, Ta).values()],
          n = {}
        return (
          e.forEach(s => {
            wu(t, s.mutationKey) && Object.assign(n, s.defaultOptions)
          }),
          n
        )
      }
      defaultQueryOptions(t) {
        if (t._defaulted) return t
        const e = {
          ...x(this, ts).queries,
          ...this.getQueryDefaults(t.queryKey),
          ...t,
          _defaulted: !0,
        }
        return (
          e.queryHash || (e.queryHash = Ng(e.queryKey, e)),
          e.refetchOnReconnect === void 0 &&
            (e.refetchOnReconnect = e.networkMode !== "always"),
          e.throwOnError === void 0 && (e.throwOnError = !!e.suspense),
          !e.networkMode && e.persister && (e.networkMode = "offlineFirst"),
          e.queryFn === jg && (e.enabled = !1),
          e
        )
      }
      defaultMutationOptions(t) {
        return t != null && t._defaulted
          ? t
          : {
              ...x(this, ts).mutations,
              ...((t == null ? void 0 : t.mutationKey) &&
                this.getMutationDefaults(t.mutationKey)),
              ...t,
              _defaulted: !0,
            }
      }
      clear() {
        x(this, lt).clear(), x(this, es).clear()
      }
    }),
    (lt = new WeakMap()),
    (es = new WeakMap()),
    (ts = new WeakMap()),
    (Aa = new WeakMap()),
    (Ta = new WeakMap()),
    (ns = new WeakMap()),
    (Ra = new WeakMap()),
    (Pa = new WeakMap()),
    T1),
  ln,
  je,
  Mu,
  Qt,
  ro,
  Ia,
  rs,
  Ar,
  Nu,
  Ma,
  Na,
  io,
  so,
  is,
  ja,
  We,
  eu,
  Pm,
  Im,
  Mm,
  Nm,
  jm,
  Dm,
  Lm,
  Ex,
  R1,
  mA =
    ((R1 = class extends Qa {
      constructor(e, n) {
        super()
        ne(this, We)
        ne(this, ln)
        ne(this, je)
        ne(this, Mu)
        ne(this, Qt)
        ne(this, ro)
        ne(this, Ia)
        ne(this, rs)
        ne(this, Ar)
        ne(this, Nu)
        ne(this, Ma)
        ne(this, Na)
        ne(this, io)
        ne(this, so)
        ne(this, is)
        ne(this, ja, new Set())
        ;(this.options = n),
          G(this, ln, e),
          G(this, Ar, null),
          G(this, rs, Rm()),
          this.options.experimental_prefetchInRender ||
            x(this, rs).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled",
              ),
            ),
          this.bindMethods(),
          this.setOptions(n)
      }
      bindMethods() {
        this.refetch = this.refetch.bind(this)
      }
      onSubscribe() {
        this.listeners.size === 1 &&
          (x(this, je).addObserver(this),
          iS(x(this, je), this.options)
            ? Q(this, We, eu).call(this)
            : this.updateResult(),
          Q(this, We, Nm).call(this))
      }
      onUnsubscribe() {
        this.hasListeners() || this.destroy()
      }
      shouldFetchOnReconnect() {
        return Bm(x(this, je), this.options, this.options.refetchOnReconnect)
      }
      shouldFetchOnWindowFocus() {
        return Bm(x(this, je), this.options, this.options.refetchOnWindowFocus)
      }
      destroy() {
        ;(this.listeners = new Set()),
          Q(this, We, jm).call(this),
          Q(this, We, Dm).call(this),
          x(this, je).removeObserver(this)
      }
      setOptions(e, n) {
        const s = this.options,
          o = x(this, je)
        if (
          ((this.options = x(this, ln).defaultQueryOptions(e)),
          this.options.enabled !== void 0 &&
            typeof this.options.enabled != "boolean" &&
            typeof this.options.enabled != "function" &&
            typeof or(this.options.enabled, x(this, je)) != "boolean")
        )
          throw new Error(
            "Expected enabled to be a boolean or a callback that returns a boolean",
          )
        Q(this, We, Lm).call(this),
          x(this, je).setOptions(this.options),
          s._defaulted &&
            !Yf(this.options, s) &&
            x(this, ln)
              .getQueryCache()
              .notify({
                type: "observerOptionsUpdated",
                query: x(this, je),
                observer: this,
              })
        const l = this.hasListeners()
        l && sS(x(this, je), o, this.options, s) && Q(this, We, eu).call(this),
          this.updateResult(n),
          l &&
            (x(this, je) !== o ||
              or(this.options.enabled, x(this, je)) !==
                or(s.enabled, x(this, je)) ||
              ya(this.options.staleTime, x(this, je)) !==
                ya(s.staleTime, x(this, je))) &&
            Q(this, We, Pm).call(this)
        const u = Q(this, We, Im).call(this)
        l &&
          (x(this, je) !== o ||
            or(this.options.enabled, x(this, je)) !==
              or(s.enabled, x(this, je)) ||
            u !== x(this, is)) &&
          Q(this, We, Mm).call(this, u)
      }
      getOptimisticResult(e) {
        const n = x(this, ln).getQueryCache().build(x(this, ln), e),
          s = this.createResult(n, e)
        return (
          yA(this, s) &&
            (G(this, Qt, s),
            G(this, Ia, this.options),
            G(this, ro, x(this, je).state)),
          s
        )
      }
      getCurrentResult() {
        return x(this, Qt)
      }
      trackResult(e, n) {
        const s = {}
        return (
          Object.keys(e).forEach(o => {
            Object.defineProperty(s, o, {
              configurable: !1,
              enumerable: !0,
              get: () => (this.trackProp(o), n == null || n(o), e[o]),
            })
          }),
          s
        )
      }
      trackProp(e) {
        x(this, ja).add(e)
      }
      getCurrentQuery() {
        return x(this, je)
      }
      refetch({ ...e } = {}) {
        return this.fetch({ ...e })
      }
      fetchOptimistic(e) {
        const n = x(this, ln).defaultQueryOptions(e),
          s = x(this, ln).getQueryCache().build(x(this, ln), n)
        return s.fetch().then(() => this.createResult(s, n))
      }
      fetch(e) {
        return Q(this, We, eu)
          .call(this, { ...e, cancelRefetch: e.cancelRefetch ?? !0 })
          .then(() => (this.updateResult(), x(this, Qt)))
      }
      createResult(e, n) {
        var q
        const s = x(this, je),
          o = this.options,
          l = x(this, Qt),
          u = x(this, ro),
          f = x(this, Ia),
          m = e !== s ? e.state : x(this, Mu),
          { state: h } = e
        let g = { ...h },
          w = !1,
          b
        if (n._optimisticResults) {
          const Z = this.hasListeners(),
            le = !Z && iS(e, n),
            Ce = Z && sS(e, s, n, o)
          ;(le || Ce) && (g = { ...g, ...Sx(h.data, e.options) }),
            n._optimisticResults === "isRestoring" && (g.fetchStatus = "idle")
        }
        let { error: E, errorUpdatedAt: S, status: C } = g
        if (n.select && g.data !== void 0)
          if (
            l &&
            g.data === (u == null ? void 0 : u.data) &&
            n.select === x(this, Nu)
          )
            b = x(this, Ma)
          else
            try {
              G(this, Nu, n.select),
                (b = n.select(g.data)),
                (b = Tm(l == null ? void 0 : l.data, b, n)),
                G(this, Ma, b),
                G(this, Ar, null)
            } catch (Z) {
              G(this, Ar, Z)
            }
        else b = g.data
        if (n.placeholderData !== void 0 && b === void 0 && C === "pending") {
          let Z
          if (
            l != null &&
            l.isPlaceholderData &&
            n.placeholderData === (f == null ? void 0 : f.placeholderData)
          )
            Z = l.data
          else if (
            ((Z =
              typeof n.placeholderData == "function"
                ? n.placeholderData(
                    (q = x(this, Na)) == null ? void 0 : q.state.data,
                    x(this, Na),
                  )
                : n.placeholderData),
            n.select && Z !== void 0)
          )
            try {
              ;(Z = n.select(Z)), G(this, Ar, null)
            } catch (le) {
              G(this, Ar, le)
            }
          Z !== void 0 &&
            ((C = "success"),
            (b = Tm(l == null ? void 0 : l.data, Z, n)),
            (w = !0))
        }
        x(this, Ar) &&
          ((E = x(this, Ar)),
          (b = x(this, Ma)),
          (S = Date.now()),
          (C = "error"))
        const _ = g.fetchStatus === "fetching",
          A = C === "pending",
          O = C === "error",
          M = A && _,
          D = b !== void 0,
          W = {
            status: C,
            fetchStatus: g.fetchStatus,
            isPending: A,
            isSuccess: C === "success",
            isError: O,
            isInitialLoading: M,
            isLoading: M,
            data: b,
            dataUpdatedAt: g.dataUpdatedAt,
            error: E,
            errorUpdatedAt: S,
            failureCount: g.fetchFailureCount,
            failureReason: g.fetchFailureReason,
            errorUpdateCount: g.errorUpdateCount,
            isFetched: g.dataUpdateCount > 0 || g.errorUpdateCount > 0,
            isFetchedAfterMount:
              g.dataUpdateCount > m.dataUpdateCount ||
              g.errorUpdateCount > m.errorUpdateCount,
            isFetching: _,
            isRefetching: _ && !A,
            isLoadingError: O && !D,
            isPaused: g.fetchStatus === "paused",
            isPlaceholderData: w,
            isRefetchError: O && D,
            isStale: Lg(e, n),
            refetch: this.refetch,
            promise: x(this, rs),
          }
        if (this.options.experimental_prefetchInRender) {
          const Z = Ae => {
              W.status === "error"
                ? Ae.reject(W.error)
                : W.data !== void 0 && Ae.resolve(W.data)
            },
            le = () => {
              const Ae = G(this, rs, (W.promise = Rm()))
              Z(Ae)
            },
            Ce = x(this, rs)
          switch (Ce.status) {
            case "pending":
              e.queryHash === s.queryHash && Z(Ce)
              break
            case "fulfilled":
              ;(W.status === "error" || W.data !== Ce.value) && le()
              break
            case "rejected":
              ;(W.status !== "error" || W.error !== Ce.reason) && le()
              break
          }
        }
        return W
      }
      updateResult(e) {
        const n = x(this, Qt),
          s = this.createResult(x(this, je), this.options)
        if (
          (G(this, ro, x(this, je).state),
          G(this, Ia, this.options),
          x(this, ro).data !== void 0 && G(this, Na, x(this, je)),
          Yf(s, n))
        )
          return
        G(this, Qt, s)
        const o = {},
          l = () => {
            if (!n) return !0
            const { notifyOnChangeProps: u } = this.options,
              f = typeof u == "function" ? u() : u
            if (f === "all" || (!f && !x(this, ja).size)) return !0
            const d = new Set(f ?? x(this, ja))
            return (
              this.options.throwOnError && d.add("error"),
              Object.keys(x(this, Qt)).some(m => {
                const h = m
                return x(this, Qt)[h] !== n[h] && d.has(h)
              })
            )
          }
        ;(e == null ? void 0 : e.listeners) !== !1 && l() && (o.listeners = !0),
          Q(this, We, Ex).call(this, { ...o, ...e })
      }
      onQueryUpdate() {
        this.updateResult(), this.hasListeners() && Q(this, We, Nm).call(this)
      }
    }),
    (ln = new WeakMap()),
    (je = new WeakMap()),
    (Mu = new WeakMap()),
    (Qt = new WeakMap()),
    (ro = new WeakMap()),
    (Ia = new WeakMap()),
    (rs = new WeakMap()),
    (Ar = new WeakMap()),
    (Nu = new WeakMap()),
    (Ma = new WeakMap()),
    (Na = new WeakMap()),
    (io = new WeakMap()),
    (so = new WeakMap()),
    (is = new WeakMap()),
    (ja = new WeakMap()),
    (We = new WeakSet()),
    (eu = function (e) {
      Q(this, We, Lm).call(this)
      let n = x(this, je).fetch(this.options, e)
      return (e != null && e.throwOnError) || (n = n.catch(Mn)), n
    }),
    (Pm = function () {
      Q(this, We, jm).call(this)
      const e = ya(this.options.staleTime, x(this, je))
      if (fo || x(this, Qt).isStale || !Om(e)) return
      const s = hx(x(this, Qt).dataUpdatedAt, e) + 1
      G(
        this,
        io,
        setTimeout(() => {
          x(this, Qt).isStale || this.updateResult()
        }, s),
      )
    }),
    (Im = function () {
      return (
        (typeof this.options.refetchInterval == "function"
          ? this.options.refetchInterval(x(this, je))
          : this.options.refetchInterval) ?? !1
      )
    }),
    (Mm = function (e) {
      Q(this, We, Dm).call(this),
        G(this, is, e),
        !(
          fo ||
          or(this.options.enabled, x(this, je)) === !1 ||
          !Om(x(this, is)) ||
          x(this, is) === 0
        ) &&
          G(
            this,
            so,
            setInterval(
              () => {
                ;(this.options.refetchIntervalInBackground || Dg.isFocused()) &&
                  Q(this, We, eu).call(this)
              },
              x(this, is),
            ),
          )
    }),
    (Nm = function () {
      Q(this, We, Pm).call(this),
        Q(this, We, Mm).call(this, Q(this, We, Im).call(this))
    }),
    (jm = function () {
      x(this, io) && (clearTimeout(x(this, io)), G(this, io, void 0))
    }),
    (Dm = function () {
      x(this, so) && (clearInterval(x(this, so)), G(this, so, void 0))
    }),
    (Lm = function () {
      const e = x(this, ln).getQueryCache().build(x(this, ln), this.options)
      if (e === x(this, je)) return
      const n = x(this, je)
      G(this, je, e),
        G(this, Mu, e.state),
        this.hasListeners() &&
          (n == null || n.removeObserver(this), e.addObserver(this))
    }),
    (Ex = function (e) {
      bt.batch(() => {
        e.listeners &&
          this.listeners.forEach(n => {
            n(x(this, Qt))
          }),
          x(this, ln)
            .getQueryCache()
            .notify({ query: x(this, je), type: "observerResultsUpdated" })
      })
    }),
    R1)
function gA(t, e) {
  return (
    or(e.enabled, t) !== !1 &&
    t.state.data === void 0 &&
    !(t.state.status === "error" && e.retryOnMount === !1)
  )
}
function iS(t, e) {
  return gA(t, e) || (t.state.data !== void 0 && Bm(t, e, e.refetchOnMount))
}
function Bm(t, e, n) {
  if (or(e.enabled, t) !== !1) {
    const s = typeof n == "function" ? n(t) : n
    return s === "always" || (s !== !1 && Lg(t, e))
  }
  return !1
}
function sS(t, e, n, s) {
  return (
    (t !== e || or(s.enabled, t) === !1) &&
    (!n.suspense || t.state.status !== "error") &&
    Lg(t, n)
  )
}
function Lg(t, e) {
  return or(e.enabled, t) !== !1 && t.isStaleByTime(ya(e.staleTime, t))
}
function yA(t, e) {
  return !Yf(t.getCurrentResult(), e)
}
var ss,
  os,
  un,
  oi,
  di,
  xf,
  Fm,
  P1,
  vA =
    ((P1 = class extends Qa {
      constructor(n, s) {
        super()
        ne(this, di)
        ne(this, ss)
        ne(this, os)
        ne(this, un)
        ne(this, oi)
        G(this, ss, n),
          this.setOptions(s),
          this.bindMethods(),
          Q(this, di, xf).call(this)
      }
      bindMethods() {
        ;(this.mutate = this.mutate.bind(this)),
          (this.reset = this.reset.bind(this))
      }
      setOptions(n) {
        var o
        const s = this.options
        ;(this.options = x(this, ss).defaultMutationOptions(n)),
          Yf(this.options, s) ||
            x(this, ss)
              .getMutationCache()
              .notify({
                type: "observerOptionsUpdated",
                mutation: x(this, un),
                observer: this,
              }),
          s != null &&
          s.mutationKey &&
          this.options.mutationKey &&
          ho(s.mutationKey) !== ho(this.options.mutationKey)
            ? this.reset()
            : ((o = x(this, un)) == null ? void 0 : o.state.status) ===
                "pending" && x(this, un).setOptions(this.options)
      }
      onUnsubscribe() {
        var n
        this.hasListeners() ||
          (n = x(this, un)) == null ||
          n.removeObserver(this)
      }
      onMutationUpdate(n) {
        Q(this, di, xf).call(this), Q(this, di, Fm).call(this, n)
      }
      getCurrentResult() {
        return x(this, os)
      }
      reset() {
        var n
        ;(n = x(this, un)) == null || n.removeObserver(this),
          G(this, un, void 0),
          Q(this, di, xf).call(this),
          Q(this, di, Fm).call(this)
      }
      mutate(n, s) {
        var o
        return (
          G(this, oi, s),
          (o = x(this, un)) == null || o.removeObserver(this),
          G(
            this,
            un,
            x(this, ss).getMutationCache().build(x(this, ss), this.options),
          ),
          x(this, un).addObserver(this),
          x(this, un).execute(n)
        )
      }
    }),
    (ss = new WeakMap()),
    (os = new WeakMap()),
    (un = new WeakMap()),
    (oi = new WeakMap()),
    (di = new WeakSet()),
    (xf = function () {
      var s
      const n = ((s = x(this, un)) == null ? void 0 : s.state) ?? xx()
      G(this, os, {
        ...n,
        isPending: n.status === "pending",
        isSuccess: n.status === "success",
        isError: n.status === "error",
        isIdle: n.status === "idle",
        mutate: this.mutate,
        reset: this.reset,
      })
    }),
    (Fm = function (n) {
      bt.batch(() => {
        var s, o, l, u, f, d, m, h
        if (x(this, oi) && this.hasListeners()) {
          const g = x(this, os).variables,
            w = x(this, os).context
          ;(n == null ? void 0 : n.type) === "success"
            ? ((o = (s = x(this, oi)).onSuccess) == null ||
                o.call(s, n.data, g, w),
              (u = (l = x(this, oi)).onSettled) == null ||
                u.call(l, n.data, null, g, w))
            : (n == null ? void 0 : n.type) === "error" &&
              ((d = (f = x(this, oi)).onError) == null ||
                d.call(f, n.error, g, w),
              (h = (m = x(this, oi)).onSettled) == null ||
                h.call(m, void 0, n.error, g, w))
        }
        this.listeners.forEach(g => {
          g(x(this, os))
        })
      })
    }),
    P1),
  bx = v.createContext(void 0),
  Cx = t => {
    const e = v.useContext(bx)
    if (!e)
      throw new Error("No QueryClient set, use QueryClientProvider to set one")
    return e
  },
  wA = ({ client: t, children: e }) => (
    v.useEffect(
      () => (
        t.mount(),
        () => {
          t.unmount()
        }
      ),
      [t],
    ),
    T.jsx(bx.Provider, { value: t, children: e })
  ),
  _x = v.createContext(!1),
  SA = () => v.useContext(_x)
_x.Provider
function xA() {
  let t = !1
  return {
    clearReset: () => {
      t = !1
    },
    reset: () => {
      t = !0
    },
    isReset: () => t,
  }
}
var EA = v.createContext(xA()),
  bA = () => v.useContext(EA)
function kx(t, e) {
  return typeof t == "function" ? t(...e) : !!t
}
function Um() {}
var CA = (t, e) => {
    ;(t.suspense || t.throwOnError || t.experimental_prefetchInRender) &&
      (e.isReset() || (t.retryOnMount = !1))
  },
  _A = t => {
    v.useEffect(() => {
      t.clearReset()
    }, [t])
  },
  kA = ({
    result: t,
    errorResetBoundary: e,
    throwOnError: n,
    query: s,
    suspense: o,
  }) =>
    t.isError &&
    !e.isReset() &&
    !t.isFetching &&
    s &&
    ((o && t.data === void 0) || kx(n, [t.error, s])),
  OA = t => {
    const e = t.staleTime
    t.suspense &&
      ((t.staleTime =
        typeof e == "function"
          ? (...n) => Math.max(e(...n), 1e3)
          : Math.max(e ?? 1e3, 1e3)),
      typeof t.gcTime == "number" && (t.gcTime = Math.max(t.gcTime, 1e3)))
  },
  AA = (t, e) => t.isLoading && t.isFetching && !e,
  TA = (t, e) => (t == null ? void 0 : t.suspense) && e.isPending,
  oS = (t, e, n) =>
    e.fetchOptimistic(t).catch(() => {
      n.clearReset()
    })
function RA(t, e, n) {
  var g, w, b, E, S
  const s = Cx(),
    o = SA(),
    l = bA(),
    u = s.defaultQueryOptions(t)
  ;(w =
    (g = s.getDefaultOptions().queries) == null
      ? void 0
      : g._experimental_beforeQuery) == null || w.call(g, u),
    (u._optimisticResults = o ? "isRestoring" : "optimistic"),
    OA(u),
    CA(u, l),
    _A(l)
  const f = !s.getQueryCache().get(u.queryHash),
    [d] = v.useState(() => new e(s, u)),
    m = d.getOptimisticResult(u),
    h = !o && t.subscribed !== !1
  if (
    (v.useSyncExternalStore(
      v.useCallback(
        C => {
          const _ = h ? d.subscribe(bt.batchCalls(C)) : Um
          return d.updateResult(), _
        },
        [d, h],
      ),
      () => d.getCurrentResult(),
      () => d.getCurrentResult(),
    ),
    v.useEffect(() => {
      d.setOptions(u, { listeners: !1 })
    }, [u, d]),
    TA(u, m))
  )
    throw oS(u, d, l)
  if (
    kA({
      result: m,
      errorResetBoundary: l,
      throwOnError: u.throwOnError,
      query: s.getQueryCache().get(u.queryHash),
      suspense: u.suspense,
    })
  )
    throw m.error
  if (
    ((E =
      (b = s.getDefaultOptions().queries) == null
        ? void 0
        : b._experimental_afterQuery) == null || E.call(b, u, m),
    u.experimental_prefetchInRender && !fo && AA(m, o))
  ) {
    const C = f
      ? oS(u, d, l)
      : (S = s.getQueryCache().get(u.queryHash)) == null
        ? void 0
        : S.promise
    C == null ||
      C.catch(Um).finally(() => {
        d.updateResult()
      })
  }
  return u.notifyOnChangeProps ? m : d.trackResult(m)
}
function Ox(t, e) {
  return RA(t, mA)
}
function Lu(t, e) {
  const n = Cx(),
    [s] = v.useState(() => new vA(n, t))
  v.useEffect(() => {
    s.setOptions(t)
  }, [s, t])
  const o = v.useSyncExternalStore(
      v.useCallback(u => s.subscribe(bt.batchCalls(u)), [s]),
      () => s.getCurrentResult(),
      () => s.getCurrentResult(),
    ),
    l = v.useCallback(
      (u, f) => {
        s.mutate(u, f).catch(Um)
      },
      [s],
    )
  if (o.error && kx(s.options.throwOnError, [o.error])) throw o.error
  return { ...o, mutate: l, mutateAsync: o.mutate }
}
const PA = {},
  aS = t => {
    let e
    const n = new Set(),
      s = (h, g) => {
        const w = typeof h == "function" ? h(e) : h
        if (!Object.is(w, e)) {
          const b = e
          ;(e =
            (g ?? (typeof w != "object" || w === null))
              ? w
              : Object.assign({}, e, w)),
            n.forEach(E => E(e, b))
        }
      },
      o = () => e,
      d = {
        setState: s,
        getState: o,
        getInitialState: () => m,
        subscribe: h => (n.add(h), () => n.delete(h)),
        destroy: () => {
          ;(PA ? "production" : void 0) !== "production" &&
            console.warn(
              "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.",
            ),
            n.clear()
        },
      },
      m = (e = t(s, o, d))
    return d
  },
  IA = t => (t ? aS(t) : aS)
var Qp = { exports: {} },
  Yp = {},
  Xp = { exports: {} },
  Zp = {}
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var lS
function MA() {
  if (lS) return Zp
  lS = 1
  var t = Ka()
  function e(g, w) {
    return (g === w && (g !== 0 || 1 / g === 1 / w)) || (g !== g && w !== w)
  }
  var n = typeof Object.is == "function" ? Object.is : e,
    s = t.useState,
    o = t.useEffect,
    l = t.useLayoutEffect,
    u = t.useDebugValue
  function f(g, w) {
    var b = w(),
      E = s({ inst: { value: b, getSnapshot: w } }),
      S = E[0].inst,
      C = E[1]
    return (
      l(
        function () {
          ;(S.value = b), (S.getSnapshot = w), d(S) && C({ inst: S })
        },
        [g, b, w],
      ),
      o(
        function () {
          return (
            d(S) && C({ inst: S }),
            g(function () {
              d(S) && C({ inst: S })
            })
          )
        },
        [g],
      ),
      u(b),
      b
    )
  }
  function d(g) {
    var w = g.getSnapshot
    g = g.value
    try {
      var b = w()
      return !n(g, b)
    } catch {
      return !0
    }
  }
  function m(g, w) {
    return w()
  }
  var h =
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
      ? m
      : f
  return (
    (Zp.useSyncExternalStore =
      t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : h),
    Zp
  )
}
var uS
function NA() {
  return uS || ((uS = 1), (Xp.exports = MA())), Xp.exports
}
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var cS
function jA() {
  if (cS) return Yp
  cS = 1
  var t = Ka(),
    e = NA()
  function n(m, h) {
    return (m === h && (m !== 0 || 1 / m === 1 / h)) || (m !== m && h !== h)
  }
  var s = typeof Object.is == "function" ? Object.is : n,
    o = e.useSyncExternalStore,
    l = t.useRef,
    u = t.useEffect,
    f = t.useMemo,
    d = t.useDebugValue
  return (
    (Yp.useSyncExternalStoreWithSelector = function (m, h, g, w, b) {
      var E = l(null)
      if (E.current === null) {
        var S = { hasValue: !1, value: null }
        E.current = S
      } else S = E.current
      E = f(
        function () {
          function _(K) {
            if (!A) {
              if (((A = !0), (O = K), (K = w(K)), b !== void 0 && S.hasValue)) {
                var W = S.value
                if (b(W, K)) return (M = W)
              }
              return (M = K)
            }
            if (((W = M), s(O, K))) return W
            var q = w(K)
            return b !== void 0 && b(W, q) ? ((O = K), W) : ((O = K), (M = q))
          }
          var A = !1,
            O,
            M,
            D = g === void 0 ? null : g
          return [
            function () {
              return _(h())
            },
            D === null
              ? void 0
              : function () {
                  return _(D())
                },
          ]
        },
        [h, g, w, b],
      )
      var C = o(m, E[0], E[1])
      return (
        u(
          function () {
            ;(S.hasValue = !0), (S.value = C)
          },
          [C],
        ),
        d(C),
        C
      )
    }),
    Yp
  )
}
var fS
function DA() {
  return fS || ((fS = 1), (Qp.exports = jA())), Qp.exports
}
var LA = DA()
const BA = yo(LA),
  { useDebugValue: FA } = Cr,
  { useSyncExternalStoreWithSelector: UA } = BA,
  zA = t => t
function $A(t, e = zA, n) {
  const s = UA(
    t.subscribe,
    t.getState,
    t.getServerState || t.getInitialState,
    e,
    n,
  )
  return FA(s), s
}
var WA = function (t, e, n, s) {
    if (n === "a" && !s)
      throw new TypeError("Private accessor was defined without a getter")
    if (typeof e == "function" ? t !== e || !s : !e.has(t))
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it",
      )
    return n === "m" ? s : n === "a" ? s.call(t) : s ? s.value : e.get(t)
  },
  VA = function (t, e, n, s, o) {
    if (s === "m") throw new TypeError("Private method is not writable")
    if (s === "a" && !o)
      throw new TypeError("Private accessor was defined without a setter")
    if (typeof e == "function" ? t !== e || !o : !e.has(t))
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it",
      )
    return s === "a" ? o.call(t, n) : o ? (o.value = n) : e.set(t, n), n
  },
  Ef
let Hl
const bd = new Set()
function HA(t) {
  ;(fu = void 0), bd.add(t)
}
function GA(t) {
  ;(fu = void 0), bd.delete(t)
}
const fa = {}
function Cd() {
  if (
    Hl ||
    ((Hl = Object.freeze({ register: dS, get: KA, on: qA })),
    typeof window > "u")
  )
    return Hl
  const t = Object.freeze({ register: dS })
  try {
    window.addEventListener(
      "wallet-standard:register-wallet",
      ({ detail: e }) => e(t),
    )
  } catch (e) {
    console.error(
      `wallet-standard:register-wallet event listener could not be added
`,
      e,
    )
  }
  try {
    window.dispatchEvent(new QA(t))
  } catch (e) {
    console.error(
      `wallet-standard:app-ready event could not be dispatched
`,
      e,
    )
  }
  return Hl
}
function dS(...t) {
  var e
  return (
    (t = t.filter(n => !bd.has(n))),
    t.length
      ? (t.forEach(n => HA(n)),
        (e = fa.register) == null || e.forEach(n => hS(() => n(...t))),
        function () {
          var s
          t.forEach(o => GA(o)),
            (s = fa.unregister) == null || s.forEach(o => hS(() => o(...t)))
        })
      : () => {}
  )
}
let fu
function KA() {
  return fu || (fu = [...bd]), fu
}
function qA(t, e) {
  var n
  return (
    ((n = fa[t]) != null && n.push(e)) || (fa[t] = [e]),
    function () {
      var o
      fa[t] = (o = fa[t]) == null ? void 0 : o.filter(l => e !== l)
    }
  )
}
function hS(t) {
  try {
    t()
  } catch (e) {
    console.error(e)
  }
}
class QA extends Event {
  get detail() {
    return WA(this, Ef, "f")
  }
  get type() {
    return "wallet-standard:app-ready"
  }
  constructor(e) {
    super("wallet-standard:app-ready", {
      bubbles: !1,
      cancelable: !1,
      composed: !1,
    }),
      Ef.set(this, void 0),
      VA(this, Ef, e, "f")
  }
  preventDefault() {
    throw new Error("preventDefault cannot be called")
  }
  stopImmediatePropagation() {
    throw new Error("stopImmediatePropagation cannot be called")
  }
  stopPropagation() {
    throw new Error("stopPropagation cannot be called")
  }
}
Ef = new WeakMap()
var na = function (t, e, n, s) {
    if (n === "a" && !s)
      throw new TypeError("Private accessor was defined without a getter")
    if (typeof e == "function" ? t !== e || !s : !e.has(t))
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it",
      )
    return n === "m" ? s : n === "a" ? s.call(t) : s ? s.value : e.get(t)
  },
  ra = function (t, e, n, s, o) {
    if (s === "m") throw new TypeError("Private method is not writable")
    if (s === "a" && !o)
      throw new TypeError("Private accessor was defined without a setter")
    if (typeof e == "function" ? t !== e || !o : !e.has(t))
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it",
      )
    return s === "a" ? o.call(t, n) : o ? (o.value = n) : e.set(t, n), n
  },
  bf,
  Cf,
  _f,
  kf,
  Of,
  Af
class _d {
  get address() {
    return na(this, bf, "f")
  }
  get publicKey() {
    return na(this, Cf, "f").slice()
  }
  get chains() {
    return na(this, _f, "f").slice()
  }
  get features() {
    return na(this, kf, "f").slice()
  }
  get label() {
    return na(this, Of, "f")
  }
  get icon() {
    return na(this, Af, "f")
  }
  constructor(e) {
    bf.set(this, void 0),
      Cf.set(this, void 0),
      _f.set(this, void 0),
      kf.set(this, void 0),
      Of.set(this, void 0),
      Af.set(this, void 0),
      new.target === _d && Object.freeze(this),
      ra(this, bf, e.address, "f"),
      ra(this, Cf, e.publicKey.slice(), "f"),
      ra(this, _f, e.chains.slice(), "f"),
      ra(this, kf, e.features.slice(), "f"),
      ra(this, Of, e.label, "f"),
      ra(this, Af, e.icon, "f")
  }
}
;(bf = new WeakMap()),
  (Cf = new WeakMap()),
  (_f = new WeakMap()),
  (kf = new WeakMap()),
  (Of = new WeakMap()),
  (Af = new WeakMap())
function YA(t) {
  if (t.length >= 255) throw new TypeError("Alphabet too long")
  const e = new Uint8Array(256)
  for (let m = 0; m < e.length; m++) e[m] = 255
  for (let m = 0; m < t.length; m++) {
    const h = t.charAt(m),
      g = h.charCodeAt(0)
    if (e[g] !== 255) throw new TypeError(h + " is ambiguous")
    e[g] = m
  }
  const n = t.length,
    s = t.charAt(0),
    o = Math.log(n) / Math.log(256),
    l = Math.log(256) / Math.log(n)
  function u(m) {
    if (
      (m instanceof Uint8Array ||
        (ArrayBuffer.isView(m)
          ? (m = new Uint8Array(m.buffer, m.byteOffset, m.byteLength))
          : Array.isArray(m) && (m = Uint8Array.from(m))),
      !(m instanceof Uint8Array))
    )
      throw new TypeError("Expected Uint8Array")
    if (m.length === 0) return ""
    let h = 0,
      g = 0,
      w = 0
    const b = m.length
    for (; w !== b && m[w] === 0; ) w++, h++
    const E = ((b - w) * l + 1) >>> 0,
      S = new Uint8Array(E)
    for (; w !== b; ) {
      let A = m[w],
        O = 0
      for (let M = E - 1; (A !== 0 || O < g) && M !== -1; M--, O++)
        (A += (256 * S[M]) >>> 0), (S[M] = A % n >>> 0), (A = (A / n) >>> 0)
      if (A !== 0) throw new Error("Non-zero carry")
      ;(g = O), w++
    }
    let C = E - g
    for (; C !== E && S[C] === 0; ) C++
    let _ = s.repeat(h)
    for (; C < E; ++C) _ += t.charAt(S[C])
    return _
  }
  function f(m) {
    if (typeof m != "string") throw new TypeError("Expected String")
    if (m.length === 0) return new Uint8Array()
    let h = 0,
      g = 0,
      w = 0
    for (; m[h] === s; ) g++, h++
    const b = ((m.length - h) * o + 1) >>> 0,
      E = new Uint8Array(b)
    for (; m[h]; ) {
      let A = e[m.charCodeAt(h)]
      if (A === 255) return
      let O = 0
      for (let M = b - 1; (A !== 0 || O < w) && M !== -1; M--, O++)
        (A += (n * E[M]) >>> 0), (E[M] = A % 256 >>> 0), (A = (A / 256) >>> 0)
      if (A !== 0) throw new Error("Non-zero carry")
      ;(w = O), h++
    }
    let S = b - w
    for (; S !== b && E[S] === 0; ) S++
    const C = new Uint8Array(g + (b - S))
    let _ = g
    for (; S !== b; ) C[_++] = E[S++]
    return C
  }
  function d(m) {
    const h = f(m)
    if (h) return h
    throw new Error("Non-base" + n + " character")
  }
  return { encode: u, decodeUnsafe: f, decode: d }
}
var XA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const Ax = YA(XA),
  kd = t => Ax.encode(t),
  Su = t => Ax.decode(t)
function Dn(t) {
  return Uint8Array.from(atob(t), e => e.charCodeAt(0))
}
const Jp = 8192
function Ke(t) {
  if (t.length < Jp) return btoa(String.fromCharCode(...t))
  let e = ""
  for (var n = 0; n < t.length; n += Jp) {
    const s = t.slice(n, n + Jp)
    e += String.fromCharCode(...s)
  }
  return btoa(e)
}
function Bg(t) {
  var o
  const e = t.startsWith("0x") ? t.slice(2) : t,
    n = e.length % 2 === 0 ? e : `0${e}`,
    s =
      ((o = n.match(/[0-9a-fA-F]{2}/g)) == null
        ? void 0
        : o.map(l => parseInt(l, 16))) ?? []
  if (s.length !== n.length / 2) throw new Error(`Invalid hex string ${t}`)
  return Uint8Array.from(s)
}
function Ua(t) {
  return t.reduce((e, n) => e + n.toString(16).padStart(2, "0"), "")
}
function Zf(t) {
  let e = [],
    n = 0
  if (t === 0) return [0]
  for (; t > 0; ) (e[n] = t & 127), (t >>= 7) && (e[n] |= 128), (n += 1)
  return e
}
function ZA(t) {
  let e = 0,
    n = 0,
    s = 0
  for (;;) {
    let o = t[s]
    if (((s += 1), (e |= (o & 127) << n), (o & 128) === 0)) break
    n += 7
  }
  return { value: e, length: s }
}
class JA {
  constructor(e) {
    ;(this.bytePosition = 0), (this.dataView = new DataView(e.buffer))
  }
  shift(e) {
    return (this.bytePosition += e), this
  }
  read8() {
    let e = this.dataView.getUint8(this.bytePosition)
    return this.shift(1), e
  }
  read16() {
    let e = this.dataView.getUint16(this.bytePosition, !0)
    return this.shift(2), e
  }
  read32() {
    let e = this.dataView.getUint32(this.bytePosition, !0)
    return this.shift(4), e
  }
  read64() {
    let e = this.read32(),
      s = this.read32().toString(16) + e.toString(16).padStart(8, "0")
    return BigInt("0x" + s).toString(10)
  }
  read128() {
    let e = BigInt(this.read64()),
      s = BigInt(this.read64()).toString(16) + e.toString(16).padStart(16, "0")
    return BigInt("0x" + s).toString(10)
  }
  read256() {
    let e = BigInt(this.read128()),
      s = BigInt(this.read128()).toString(16) + e.toString(16).padStart(32, "0")
    return BigInt("0x" + s).toString(10)
  }
  readBytes(e) {
    let n = this.bytePosition + this.dataView.byteOffset,
      s = new Uint8Array(this.dataView.buffer, n, e)
    return this.shift(e), s
  }
  readULEB() {
    let e = this.bytePosition + this.dataView.byteOffset,
      n = new Uint8Array(this.dataView.buffer, e),
      { value: s, length: o } = ZA(n)
    return this.shift(o), s
  }
  readVec(e) {
    let n = this.readULEB(),
      s = []
    for (let o = 0; o < n; o++) s.push(e(this, o, n))
    return s
  }
}
function eT(t, e) {
  switch (e) {
    case "base58":
      return kd(t)
    case "base64":
      return Ke(t)
    case "hex":
      return Ua(t)
    default:
      throw new Error("Unsupported encoding, supported values are: base64, hex")
  }
}
function tT(t, e = ["<", ">"]) {
  const [n, s] = e,
    o = []
  let l = "",
    u = 0
  for (let f = 0; f < t.length; f++) {
    const d = t[f]
    if ((d === n && u++, d === s && u--, u === 0 && d === ",")) {
      o.push(l.trim()), (l = "")
      continue
    }
    l += d
  }
  return o.push(l.trim()), o
}
class nT {
  constructor({
    initialSize: e = 1024,
    maxSize: n = 1 / 0,
    allocateSize: s = 1024,
  } = {}) {
    ;(this.bytePosition = 0),
      (this.size = e),
      (this.maxSize = n),
      (this.allocateSize = s),
      (this.dataView = new DataView(new ArrayBuffer(e)))
  }
  ensureSizeOrGrow(e) {
    const n = this.bytePosition + e
    if (n > this.size) {
      const s = Math.min(this.maxSize, this.size + this.allocateSize)
      if (n > s)
        throw new Error(
          `Attempting to serialize to BCS, but buffer does not have enough size. Allocated size: ${this.size}, Max size: ${this.maxSize}, Required size: ${n}`,
        )
      this.size = s
      const o = new ArrayBuffer(this.size)
      new Uint8Array(o).set(new Uint8Array(this.dataView.buffer)),
        (this.dataView = new DataView(o))
    }
  }
  shift(e) {
    return (this.bytePosition += e), this
  }
  write8(e) {
    return (
      this.ensureSizeOrGrow(1),
      this.dataView.setUint8(this.bytePosition, Number(e)),
      this.shift(1)
    )
  }
  write16(e) {
    return (
      this.ensureSizeOrGrow(2),
      this.dataView.setUint16(this.bytePosition, Number(e), !0),
      this.shift(2)
    )
  }
  write32(e) {
    return (
      this.ensureSizeOrGrow(4),
      this.dataView.setUint32(this.bytePosition, Number(e), !0),
      this.shift(4)
    )
  }
  write64(e) {
    return em(BigInt(e), 8).forEach(n => this.write8(n)), this
  }
  write128(e) {
    return em(BigInt(e), 16).forEach(n => this.write8(n)), this
  }
  write256(e) {
    return em(BigInt(e), 32).forEach(n => this.write8(n)), this
  }
  writeULEB(e) {
    return Zf(e).forEach(n => this.write8(n)), this
  }
  writeVec(e, n) {
    return (
      this.writeULEB(e.length),
      Array.from(e).forEach((s, o) => n(this, s, o, e.length)),
      this
    )
  }
  *[Symbol.iterator]() {
    for (let e = 0; e < this.bytePosition; e++) yield this.dataView.getUint8(e)
    return this.toBytes()
  }
  toBytes() {
    return new Uint8Array(this.dataView.buffer.slice(0, this.bytePosition))
  }
  toString(e) {
    return eT(this.toBytes(), e)
  }
}
function em(t, e) {
  let n = new Uint8Array(e),
    s = 0
  for (; t > 0; )
    (n[s] = Number(t % BigInt(256))), (t = t / BigInt(256)), (s += 1)
  return n
}
var Tx = t => {
    throw TypeError(t)
  },
  Rx = (t, e, n) => e.has(t) || Tx("Cannot " + n),
  ar = (t, e, n) => (
    Rx(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  Jf = (t, e, n) =>
    e.has(t)
      ? Tx("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  ed = (t, e, n, s) => (Rx(t, e, "write to private field"), e.set(t, n), n),
  la,
  tu,
  Tf,
  Ki
const rT = class Px {
  constructor(e) {
    Jf(this, la),
      Jf(this, tu),
      (this.name = e.name),
      (this.read = e.read),
      (this.serializedSize = e.serializedSize ?? (() => null)),
      ed(this, la, e.write),
      ed(
        this,
        tu,
        e.serialize ??
          ((n, s) => {
            const o = new nT({
              initialSize: this.serializedSize(n) ?? void 0,
              ...s,
            })
            return ar(this, la).call(this, n, o), o.toBytes()
          }),
      ),
      (this.validate = e.validate ?? (() => {}))
  }
  write(e, n) {
    this.validate(e), ar(this, la).call(this, e, n)
  }
  serialize(e, n) {
    return this.validate(e), new iT(this, ar(this, tu).call(this, e, n))
  }
  parse(e) {
    const n = new JA(e)
    return this.read(n)
  }
  fromHex(e) {
    return this.parse(Bg(e))
  }
  fromBase58(e) {
    return this.parse(Su(e))
  }
  fromBase64(e) {
    return this.parse(Dn(e))
  }
  transform({ name: e, input: n, output: s, validate: o }) {
    return new Px({
      name: e ?? this.name,
      read: l => (s ? s(this.read(l)) : this.read(l)),
      write: (l, u) => ar(this, la).call(this, n ? n(l) : l, u),
      serializedSize: l => this.serializedSize(n ? n(l) : l),
      serialize: (l, u) => ar(this, tu).call(this, n ? n(l) : l, u),
      validate: l => {
        o == null || o(l), this.validate(n ? n(l) : l)
      },
    })
  }
}
la = new WeakMap()
tu = new WeakMap()
let Tr = rT
const Ix = Symbol.for("@mysten/serialized-bcs")
function Fg(t) {
  return !!t && typeof t == "object" && t[Ix] === !0
}
class iT {
  constructor(e, n) {
    Jf(this, Tf), Jf(this, Ki), ed(this, Tf, e), ed(this, Ki, n)
  }
  get [Ix]() {
    return !0
  }
  toBytes() {
    return ar(this, Ki)
  }
  toHex() {
    return Ua(ar(this, Ki))
  }
  toBase64() {
    return Ke(ar(this, Ki))
  }
  toBase58() {
    return kd(ar(this, Ki))
  }
  parse() {
    return ar(this, Tf).parse(ar(this, Ki))
  }
}
Tf = new WeakMap()
Ki = new WeakMap()
function td({ size: t, ...e }) {
  return new Tr({ ...e, serializedSize: () => t })
}
function tm({ readMethod: t, writeMethod: e, ...n }) {
  return td({
    ...n,
    read: s => s[t](),
    write: (s, o) => o[e](s),
    validate: s => {
      var o
      if (s < 0 || s > n.maxValue)
        throw new TypeError(
          `Invalid ${n.name} value: ${s}. Expected value in range 0-${n.maxValue}`,
        )
      ;(o = n.validate) == null || o.call(n, s)
    },
  })
}
function nm({ readMethod: t, writeMethod: e, ...n }) {
  return td({
    ...n,
    read: s => s[t](),
    write: (s, o) => o[e](BigInt(s)),
    validate: s => {
      var l
      const o = BigInt(s)
      if (o < 0 || o > n.maxValue)
        throw new TypeError(
          `Invalid ${n.name} value: ${o}. Expected value in range 0-${n.maxValue}`,
        )
      ;(l = n.validate) == null || l.call(n, o)
    },
  })
}
function sT({ serialize: t, ...e }) {
  const n = new Tr({
    ...e,
    serialize: t,
    write: (s, o) => {
      for (const l of n.serialize(s).toBytes()) o.write8(l)
    },
  })
  return n
}
function oT({ toBytes: t, fromBytes: e, ...n }) {
  return new Tr({
    ...n,
    read: s => {
      const o = s.readULEB(),
        l = s.readBytes(o)
      return e(l)
    },
    write: (s, o) => {
      const l = t(s)
      o.writeULEB(l.length)
      for (let u = 0; u < l.length; u++) o.write8(l[u])
    },
    serialize: s => {
      const o = t(s),
        l = Zf(o.length),
        u = new Uint8Array(l.length + o.length)
      return u.set(l, 0), u.set(o, l.length), u
    },
    validate: s => {
      var o
      if (typeof s != "string")
        throw new TypeError(`Invalid ${n.name} value: ${s}. Expected string`)
      ;(o = n.validate) == null || o.call(n, s)
    },
  })
}
function aT(t) {
  let e = null
  function n() {
    return e || (e = t()), e
  }
  return new Tr({
    name: "lazy",
    read: s => n().read(s),
    serializedSize: s => n().serializedSize(s),
    write: (s, o) => n().write(s, o),
    serialize: (s, o) => n().serialize(s, o).toBytes(),
  })
}
const P = {
    u8(t) {
      return tm({
        name: "u8",
        readMethod: "read8",
        writeMethod: "write8",
        size: 1,
        maxValue: 2 ** 8 - 1,
        ...t,
      })
    },
    u16(t) {
      return tm({
        name: "u16",
        readMethod: "read16",
        writeMethod: "write16",
        size: 2,
        maxValue: 2 ** 16 - 1,
        ...t,
      })
    },
    u32(t) {
      return tm({
        name: "u32",
        readMethod: "read32",
        writeMethod: "write32",
        size: 4,
        maxValue: 2 ** 32 - 1,
        ...t,
      })
    },
    u64(t) {
      return nm({
        name: "u64",
        readMethod: "read64",
        writeMethod: "write64",
        size: 8,
        maxValue: 2n ** 64n - 1n,
        ...t,
      })
    },
    u128(t) {
      return nm({
        name: "u128",
        readMethod: "read128",
        writeMethod: "write128",
        size: 16,
        maxValue: 2n ** 128n - 1n,
        ...t,
      })
    },
    u256(t) {
      return nm({
        name: "u256",
        readMethod: "read256",
        writeMethod: "write256",
        size: 32,
        maxValue: 2n ** 256n - 1n,
        ...t,
      })
    },
    bool(t) {
      return td({
        name: "bool",
        size: 1,
        read: e => e.read8() === 1,
        write: (e, n) => n.write8(e ? 1 : 0),
        ...t,
        validate: e => {
          var n
          if (
            ((n = t == null ? void 0 : t.validate) == null || n.call(t, e),
            typeof e != "boolean")
          )
            throw new TypeError(`Expected boolean, found ${typeof e}`)
        },
      })
    },
    uleb128(t) {
      return sT({
        name: "uleb128",
        read: e => e.readULEB(),
        serialize: e => Uint8Array.from(Zf(e)),
        ...t,
      })
    },
    bytes(t, e) {
      return td({
        name: `bytes[${t}]`,
        size: t,
        read: n => n.readBytes(t),
        write: (n, s) => {
          const o = new Uint8Array(n)
          for (let l = 0; l < t; l++) s.write8(o[l] ?? 0)
        },
        ...e,
        validate: n => {
          var s
          if (
            ((s = e == null ? void 0 : e.validate) == null || s.call(e, n),
            !n || typeof n != "object" || !("length" in n))
          )
            throw new TypeError(`Expected array, found ${typeof n}`)
          if (n.length !== t)
            throw new TypeError(
              `Expected array of length ${t}, found ${n.length}`,
            )
        },
      })
    },
    byteVector(t) {
      return new Tr({
        name: "bytesVector",
        read: e => {
          const n = e.readULEB()
          return e.readBytes(n)
        },
        write: (e, n) => {
          const s = new Uint8Array(e)
          n.writeULEB(s.length)
          for (let o = 0; o < s.length; o++) n.write8(s[o] ?? 0)
        },
        ...t,
        serializedSize: e => {
          const n = "length" in e ? e.length : null
          return n == null ? null : Zf(n).length + n
        },
        validate: e => {
          var n
          if (
            ((n = t == null ? void 0 : t.validate) == null || n.call(t, e),
            !e || typeof e != "object" || !("length" in e))
          )
            throw new TypeError(`Expected array, found ${typeof e}`)
        },
      })
    },
    string(t) {
      return oT({
        name: "string",
        toBytes: e => new TextEncoder().encode(e),
        fromBytes: e => new TextDecoder().decode(e),
        ...t,
      })
    },
    fixedArray(t, e, n) {
      return new Tr({
        name: `${e.name}[${t}]`,
        read: s => {
          const o = new Array(t)
          for (let l = 0; l < t; l++) o[l] = e.read(s)
          return o
        },
        write: (s, o) => {
          for (const l of s) e.write(l, o)
        },
        ...n,
        validate: s => {
          var o
          if (
            ((o = n == null ? void 0 : n.validate) == null || o.call(n, s),
            !s || typeof s != "object" || !("length" in s))
          )
            throw new TypeError(`Expected array, found ${typeof s}`)
          if (s.length !== t)
            throw new TypeError(
              `Expected array of length ${t}, found ${s.length}`,
            )
        },
      })
    },
    option(t) {
      return P.enum(`Option<${t.name}>`, { None: null, Some: t }).transform({
        input: e => (e == null ? { None: !0 } : { Some: e }),
        output: e => (e.$kind === "Some" ? e.Some : null),
      })
    },
    vector(t, e) {
      return new Tr({
        name: `vector<${t.name}>`,
        read: n => {
          const s = n.readULEB(),
            o = new Array(s)
          for (let l = 0; l < s; l++) o[l] = t.read(n)
          return o
        },
        write: (n, s) => {
          s.writeULEB(n.length)
          for (const o of n) t.write(o, s)
        },
        ...e,
        validate: n => {
          var s
          if (
            ((s = e == null ? void 0 : e.validate) == null || s.call(e, n),
            !n || typeof n != "object" || !("length" in n))
          )
            throw new TypeError(`Expected array, found ${typeof n}`)
        },
      })
    },
    tuple(t, e) {
      return new Tr({
        name: `(${t.map(n => n.name).join(", ")})`,
        serializedSize: n => {
          let s = 0
          for (let o = 0; o < t.length; o++) {
            const l = t[o].serializedSize(n[o])
            if (l == null) return null
            s += l
          }
          return s
        },
        read: n => {
          const s = []
          for (const o of t) s.push(o.read(n))
          return s
        },
        write: (n, s) => {
          for (let o = 0; o < t.length; o++) t[o].write(n[o], s)
        },
        ...e,
        validate: n => {
          var s
          if (
            ((s = e == null ? void 0 : e.validate) == null || s.call(e, n),
            !Array.isArray(n))
          )
            throw new TypeError(`Expected array, found ${typeof n}`)
          if (n.length !== t.length)
            throw new TypeError(
              `Expected array of length ${t.length}, found ${n.length}`,
            )
        },
      })
    },
    struct(t, e, n) {
      const s = Object.entries(e)
      return new Tr({
        name: t,
        serializedSize: o => {
          let l = 0
          for (const [u, f] of s) {
            const d = f.serializedSize(o[u])
            if (d == null) return null
            l += d
          }
          return l
        },
        read: o => {
          const l = {}
          for (const [u, f] of s) l[u] = f.read(o)
          return l
        },
        write: (o, l) => {
          for (const [u, f] of s) f.write(o[u], l)
        },
        ...n,
        validate: o => {
          var l
          if (
            ((l = n == null ? void 0 : n.validate) == null || l.call(n, o),
            typeof o != "object" || o == null)
          )
            throw new TypeError(`Expected object, found ${typeof o}`)
        },
      })
    },
    enum(t, e, n) {
      const s = Object.entries(e)
      return new Tr({
        name: t,
        read: o => {
          const l = o.readULEB(),
            u = s[l]
          if (!u) throw new TypeError(`Unknown value ${l} for enum ${t}`)
          const [f, d] = u
          return { [f]: (d == null ? void 0 : d.read(o)) ?? !0, $kind: f }
        },
        write: (o, l) => {
          const [u, f] = Object.entries(o).filter(([d]) =>
            Object.hasOwn(e, d),
          )[0]
          for (let d = 0; d < s.length; d++) {
            const [m, h] = s[d]
            if (m === u) {
              l.writeULEB(d), h == null || h.write(f, l)
              return
            }
          }
        },
        ...n,
        validate: o => {
          var f
          if (
            ((f = n == null ? void 0 : n.validate) == null || f.call(n, o),
            typeof o != "object" || o == null)
          )
            throw new TypeError(`Expected object, found ${typeof o}`)
          const l = Object.keys(o).filter(
            d => o[d] !== void 0 && Object.hasOwn(e, d),
          )
          if (l.length !== 1)
            throw new TypeError(
              `Expected object with one key, but found ${l.length} for type ${t}}`,
            )
          const [u] = l
          if (!Object.hasOwn(e, u))
            throw new TypeError(`Invalid enum variant ${u}`)
        },
      })
    },
    map(t, e) {
      return P.vector(P.tuple([t, e])).transform({
        name: `Map<${t.name}, ${e.name}>`,
        input: n => [...n.entries()],
        output: n => {
          const s = new Map()
          for (const [o, l] of n) s.set(o, l)
          return s
        },
      })
    },
    lazy(t) {
      return aT(t)
    },
  },
  lT = 32
function pS(t) {
  try {
    return Su(t).length === lT
  } catch {
    return !1
  }
}
const Od = 32
function ri(t) {
  return uT(t) && cT(t) === Od
}
function nu(t) {
  return ri(t)
}
function He(t, e = !1) {
  let n = t.toLowerCase()
  return (
    !e && n.startsWith("0x") && (n = n.slice(2)), `0x${n.padStart(Od * 2, "0")}`
  )
}
function li(t, e = !1) {
  return He(t, e)
}
function uT(t) {
  return /^(0x|0X)?[a-fA-F0-9]+$/.test(t) && t.length % 2 === 0
}
function cT(t) {
  return /^(0x|0X)/.test(t) ? (t.length - 2) / 2 : t.length / 2
}
const fT = /^vector<(.+)>$/,
  dT = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/
class Pr {
  static parseFromStr(e, n = !1) {
    if (e === "address") return { address: null }
    if (e === "bool") return { bool: null }
    if (e === "u8") return { u8: null }
    if (e === "u16") return { u16: null }
    if (e === "u32") return { u32: null }
    if (e === "u64") return { u64: null }
    if (e === "u128") return { u128: null }
    if (e === "u256") return { u256: null }
    if (e === "signer") return { signer: null }
    const s = e.match(fT)
    if (s) return { vector: Pr.parseFromStr(s[1], n) }
    const o = e.match(dT)
    if (o)
      return {
        struct: {
          address: n ? He(o[1]) : o[1],
          module: o[2],
          name: o[3],
          typeParams: o[5] === void 0 ? [] : Pr.parseStructTypeArgs(o[5], n),
        },
      }
    throw new Error(
      `Encountered unexpected token when parsing type args for ${e}`,
    )
  }
  static parseStructTypeArgs(e, n = !1) {
    return tT(e).map(s => Pr.parseFromStr(s, n))
  }
  static tagToString(e) {
    if ("bool" in e) return "bool"
    if ("u8" in e) return "u8"
    if ("u16" in e) return "u16"
    if ("u32" in e) return "u32"
    if ("u64" in e) return "u64"
    if ("u128" in e) return "u128"
    if ("u256" in e) return "u256"
    if ("address" in e) return "address"
    if ("signer" in e) return "signer"
    if ("vector" in e) return `vector<${Pr.tagToString(e.vector)}>`
    if ("struct" in e) {
      const n = e.struct,
        s = n.typeParams.map(Pr.tagToString).join(", ")
      return `${n.address}::${n.module}::${n.name}${s ? `<${s}>` : ""}`
    }
    throw new Error("Invalid TypeTag")
  }
}
function hT(t) {
  return P.u64({ name: "unsafe_u64", ...t }).transform({
    input: e => e,
    output: e => Number(e),
  })
}
function pT(t) {
  return P.enum("Option", { None: null, Some: t })
}
const tt = P.bytes(Od).transform({
    validate: t => {
      const e = typeof t == "string" ? t : Ua(t)
      if (!e || !ri(He(e))) throw new Error(`Invalid Sui address ${e}`)
    },
    input: t => (typeof t == "string" ? Bg(He(t)) : t),
    output: t => He(Ua(t)),
  }),
  cr = P.vector(P.u8()).transform({
    name: "ObjectDigest",
    input: t => Su(t),
    output: t => kd(new Uint8Array(t)),
    validate: t => {
      if (Su(t).length !== 32) throw new Error("ObjectDigest must be 32 bytes")
    },
  }),
  Nn = P.struct("SuiObjectRef", { objectId: tt, version: P.u64(), digest: cr }),
  Mx = P.struct("SharedObjectRef", {
    objectId: tt,
    initialSharedVersion: P.u64(),
    mutable: P.bool(),
  }),
  Nx = P.enum("ObjectArg", {
    ImmOrOwnedObject: Nn,
    SharedObject: Mx,
    Receiving: Nn,
  }),
  jx = P.enum("CallArg", {
    Pure: P.struct("Pure", {
      bytes: P.vector(P.u8()).transform({
        input: t => (typeof t == "string" ? Dn(t) : t),
        output: t => Ke(new Uint8Array(t)),
      }),
    }),
    Object: Nx,
  }),
  Ug = P.enum("TypeTag", {
    bool: null,
    u8: null,
    u64: null,
    u128: null,
    address: null,
    signer: null,
    vector: P.lazy(() => Ug),
    struct: P.lazy(() => zx),
    u16: null,
    u32: null,
    u256: null,
  }),
  zg = Ug.transform({
    input: t => (typeof t == "string" ? Pr.parseFromStr(t, !0) : t),
    output: t => Pr.tagToString(t),
  }),
  br = P.enum("Argument", {
    GasCoin: null,
    Input: P.u16(),
    Result: P.u16(),
    NestedResult: P.tuple([P.u16(), P.u16()]),
  }),
  Dx = P.struct("ProgrammableMoveCall", {
    package: tt,
    module: P.string(),
    function: P.string(),
    typeArguments: P.vector(zg),
    arguments: P.vector(br),
  }),
  Lx = P.enum("Command", {
    MoveCall: Dx,
    TransferObjects: P.struct("TransferObjects", {
      objects: P.vector(br),
      address: br,
    }),
    SplitCoins: P.struct("SplitCoins", { coin: br, amounts: P.vector(br) }),
    MergeCoins: P.struct("MergeCoins", {
      destination: br,
      sources: P.vector(br),
    }),
    Publish: P.struct("Publish", {
      modules: P.vector(
        P.vector(P.u8()).transform({
          input: t => (typeof t == "string" ? Dn(t) : t),
          output: t => Ke(new Uint8Array(t)),
        }),
      ),
      dependencies: P.vector(tt),
    }),
    MakeMoveVec: P.struct("MakeMoveVec", {
      type: pT(zg).transform({
        input: t => (t === null ? { None: !0 } : { Some: t }),
        output: t => t.Some ?? null,
      }),
      elements: P.vector(br),
    }),
    Upgrade: P.struct("Upgrade", {
      modules: P.vector(
        P.vector(P.u8()).transform({
          input: t => (typeof t == "string" ? Dn(t) : t),
          output: t => Ke(new Uint8Array(t)),
        }),
      ),
      dependencies: P.vector(tt),
      package: tt,
      ticket: br,
    }),
  }),
  Bx = P.struct("ProgrammableTransaction", {
    inputs: P.vector(jx),
    commands: P.vector(Lx),
  }),
  Fx = P.enum("TransactionKind", {
    ProgrammableTransaction: Bx,
    ChangeEpoch: null,
    Genesis: null,
    ConsensusCommitPrologue: null,
  }),
  Ux = P.enum("TransactionExpiration", { None: null, Epoch: hT() }),
  zx = P.struct("StructTag", {
    address: tt,
    module: P.string(),
    name: P.string(),
    typeParams: P.vector(Ug),
  }),
  $x = P.struct("GasData", {
    payment: P.vector(Nn),
    owner: tt,
    price: P.u64(),
    budget: P.u64(),
  }),
  Wx = P.struct("TransactionDataV1", {
    kind: Fx,
    sender: tt,
    gasData: $x,
    expiration: Ux,
  }),
  Vx = P.enum("TransactionData", { V1: Wx }),
  Hx = P.enum("IntentScope", {
    TransactionData: null,
    TransactionEffects: null,
    CheckpointSummary: null,
    PersonalMessage: null,
  }),
  Gx = P.enum("IntentVersion", { V0: null }),
  Kx = P.enum("AppId", { Sui: null }),
  qx = P.struct("Intent", { scope: Hx, version: Gx, appId: Kx })
function Qx(t) {
  return P.struct(`IntentMessage<${t.name}>`, { intent: qx, value: t })
}
const Yx = P.enum("CompressedSignature", {
    ED25519: P.fixedArray(64, P.u8()),
    Secp256k1: P.fixedArray(64, P.u8()),
    Secp256r1: P.fixedArray(64, P.u8()),
    ZkLogin: P.vector(P.u8()),
  }),
  Xx = P.enum("PublicKey", {
    ED25519: P.fixedArray(32, P.u8()),
    Secp256k1: P.fixedArray(33, P.u8()),
    Secp256r1: P.fixedArray(33, P.u8()),
    ZkLogin: P.vector(P.u8()),
  }),
  Zx = P.struct("MultiSigPkMap", { pubKey: Xx, weight: P.u8() }),
  Jx = P.struct("MultiSigPublicKey", {
    pk_map: P.vector(Zx),
    threshold: P.u16(),
  }),
  mT = P.struct("MultiSig", {
    sigs: P.vector(Yx),
    bitmap: P.u16(),
    multisig_pk: Jx,
  }),
  gT = P.vector(P.u8()).transform({
    input: t => (typeof t == "string" ? Dn(t) : t),
    output: t => Ke(new Uint8Array(t)),
  }),
  eE = P.struct("SenderSignedTransaction", {
    intentMessage: Qx(Vx),
    txSignatures: P.vector(gT),
  }),
  yT = P.vector(eE, { name: "SenderSignedData" }),
  vT = P.struct("PasskeyAuthenticator", {
    authenticatorData: P.vector(P.u8()),
    clientDataJson: P.string(),
    userSignature: P.vector(P.u8()),
  }),
  wT = P.enum("PackageUpgradeError", {
    UnableToFetchPackage: P.struct("UnableToFetchPackage", { packageId: tt }),
    NotAPackage: P.struct("NotAPackage", { objectId: tt }),
    IncompatibleUpgrade: null,
    DigestDoesNotMatch: P.struct("DigestDoesNotMatch", {
      digest: P.vector(P.u8()),
    }),
    UnknownUpgradePolicy: P.struct("UnknownUpgradePolicy", { policy: P.u8() }),
    PackageIDDoesNotMatch: P.struct("PackageIDDoesNotMatch", {
      packageId: tt,
      ticketId: tt,
    }),
  }),
  ST = P.struct("ModuleId", { address: tt, name: P.string() }),
  mS = P.struct("MoveLocation", {
    module: ST,
    function: P.u16(),
    instruction: P.u16(),
    functionName: P.option(P.string()),
  }),
  xT = P.enum("CommandArgumentError", {
    TypeMismatch: null,
    InvalidBCSBytes: null,
    InvalidUsageOfPureArg: null,
    InvalidArgumentToPrivateEntryFunction: null,
    IndexOutOfBounds: P.struct("IndexOutOfBounds", { idx: P.u16() }),
    SecondaryIndexOutOfBounds: P.struct("SecondaryIndexOutOfBounds", {
      resultIdx: P.u16(),
      secondaryIdx: P.u16(),
    }),
    InvalidResultArity: P.struct("InvalidResultArity", { resultIdx: P.u16() }),
    InvalidGasCoinUsage: null,
    InvalidValueUsage: null,
    InvalidObjectByValue: null,
    InvalidObjectByMutRef: null,
    SharedObjectOperationNotAllowed: null,
  }),
  ET = P.enum("TypeArgumentError", {
    TypeNotFound: null,
    ConstraintNotSatisfied: null,
  }),
  bT = P.enum("ExecutionFailureStatus", {
    InsufficientGas: null,
    InvalidGasObject: null,
    InvariantViolation: null,
    FeatureNotYetSupported: null,
    MoveObjectTooBig: P.struct("MoveObjectTooBig", {
      objectSize: P.u64(),
      maxObjectSize: P.u64(),
    }),
    MovePackageTooBig: P.struct("MovePackageTooBig", {
      objectSize: P.u64(),
      maxObjectSize: P.u64(),
    }),
    CircularObjectOwnership: P.struct("CircularObjectOwnership", {
      object: tt,
    }),
    InsufficientCoinBalance: null,
    CoinBalanceOverflow: null,
    PublishErrorNonZeroAddress: null,
    SuiMoveVerificationError: null,
    MovePrimitiveRuntimeError: P.option(mS),
    MoveAbort: P.tuple([mS, P.u64()]),
    VMVerificationOrDeserializationError: null,
    VMInvariantViolation: null,
    FunctionNotFound: null,
    ArityMismatch: null,
    TypeArityMismatch: null,
    NonEntryFunctionInvoked: null,
    CommandArgumentError: P.struct("CommandArgumentError", {
      argIdx: P.u16(),
      kind: xT,
    }),
    TypeArgumentError: P.struct("TypeArgumentError", {
      argumentIdx: P.u16(),
      kind: ET,
    }),
    UnusedValueWithoutDrop: P.struct("UnusedValueWithoutDrop", {
      resultIdx: P.u16(),
      secondaryIdx: P.u16(),
    }),
    InvalidPublicFunctionReturnType: P.struct(
      "InvalidPublicFunctionReturnType",
      { idx: P.u16() },
    ),
    InvalidTransferObject: null,
    EffectsTooLarge: P.struct("EffectsTooLarge", {
      currentSize: P.u64(),
      maxSize: P.u64(),
    }),
    PublishUpgradeMissingDependency: null,
    PublishUpgradeDependencyDowngrade: null,
    PackageUpgradeError: P.struct("PackageUpgradeError", { upgradeError: wT }),
    WrittenObjectsTooLarge: P.struct("WrittenObjectsTooLarge", {
      currentSize: P.u64(),
      maxSize: P.u64(),
    }),
    CertificateDenied: null,
    SuiMoveVerificationTimedout: null,
    SharedObjectOperationNotAllowed: null,
    InputObjectDeleted: null,
    ExecutionCancelledDueToSharedObjectCongestion: P.struct(
      "ExecutionCancelledDueToSharedObjectCongestion",
      { congestedObjects: P.vector(tt) },
    ),
    AddressDeniedForCoin: P.struct("AddressDeniedForCoin", {
      address: tt,
      coinType: P.string(),
    }),
    CoinTypeGlobalPause: P.struct("CoinTypeGlobalPause", {
      coinType: P.string(),
    }),
    ExecutionCancelledDueToRandomnessUnavailable: null,
  }),
  tE = P.enum("ExecutionStatus", {
    Success: null,
    Failed: P.struct("ExecutionFailed", {
      error: bT,
      command: P.option(P.u64()),
    }),
  }),
  nE = P.struct("GasCostSummary", {
    computationCost: P.u64(),
    storageCost: P.u64(),
    storageRebate: P.u64(),
    nonRefundableStorageFee: P.u64(),
  }),
  da = P.enum("Owner", {
    AddressOwner: tt,
    ObjectOwner: tt,
    Shared: P.struct("Shared", { initialSharedVersion: P.u64() }),
    Immutable: null,
  }),
  CT = P.struct("TransactionEffectsV1", {
    status: tE,
    executedEpoch: P.u64(),
    gasUsed: nE,
    modifiedAtVersions: P.vector(P.tuple([tt, P.u64()])),
    sharedObjects: P.vector(Nn),
    transactionDigest: cr,
    created: P.vector(P.tuple([Nn, da])),
    mutated: P.vector(P.tuple([Nn, da])),
    unwrapped: P.vector(P.tuple([Nn, da])),
    deleted: P.vector(Nn),
    unwrappedThenDeleted: P.vector(Nn),
    wrapped: P.vector(Nn),
    gasObject: P.tuple([Nn, da]),
    eventsDigest: P.option(cr),
    dependencies: P.vector(cr),
  }),
  $g = P.tuple([P.u64(), cr]),
  _T = P.enum("ObjectIn", { NotExist: null, Exist: P.tuple([$g, da]) }),
  kT = P.enum("ObjectOut", {
    NotExist: null,
    ObjectWrite: P.tuple([cr, da]),
    PackageWrite: $g,
  }),
  OT = P.enum("IDOperation", { None: null, Created: null, Deleted: null }),
  AT = P.struct("EffectsObjectChange", {
    inputState: _T,
    outputState: kT,
    idOperation: OT,
  }),
  TT = P.enum("UnchangedSharedKind", {
    ReadOnlyRoot: $g,
    MutateDeleted: P.u64(),
    ReadDeleted: P.u64(),
    Cancelled: P.u64(),
    PerEpochConfig: null,
  }),
  RT = P.struct("TransactionEffectsV2", {
    status: tE,
    executedEpoch: P.u64(),
    gasUsed: nE,
    transactionDigest: cr,
    gasObjectIndex: P.option(P.u32()),
    eventsDigest: P.option(cr),
    dependencies: P.vector(cr),
    lamportVersion: P.u64(),
    changedObjects: P.vector(P.tuple([tt, AT])),
    unchangedSharedObjects: P.vector(P.tuple([tt, TT])),
    auxDataDigest: P.option(cr),
  }),
  PT = P.enum("TransactionEffects", { V1: CT, V2: RT })
function du(t) {
  switch (t) {
    case "u8":
      return P.u8()
    case "u16":
      return P.u16()
    case "u32":
      return P.u32()
    case "u64":
      return P.u64()
    case "u128":
      return P.u128()
    case "u256":
      return P.u256()
    case "bool":
      return P.bool()
    case "string":
      return P.string()
    case "id":
    case "address":
      return tt
  }
  const e = t.match(/^(vector|option)<(.+)>$/)
  if (e) {
    const [n, s] = e.slice(1)
    return n === "vector" ? P.vector(du(s)) : P.option(du(s))
  }
  throw new Error(`Invalid Pure type name: ${t}`)
}
const Me = {
    ...P,
    U8: P.u8(),
    U16: P.u16(),
    U32: P.u32(),
    U64: P.u64(),
    U128: P.u128(),
    U256: P.u256(),
    ULEB128: P.uleb128(),
    Bool: P.bool(),
    String: P.string(),
    Address: tt,
    AppId: Kx,
    Argument: br,
    CallArg: jx,
    CompressedSignature: Yx,
    GasData: $x,
    Intent: qx,
    IntentMessage: Qx,
    IntentScope: Hx,
    IntentVersion: Gx,
    MultiSig: mT,
    MultiSigPkMap: Zx,
    MultiSigPublicKey: Jx,
    ObjectArg: Nx,
    ObjectDigest: cr,
    ProgrammableMoveCall: Dx,
    ProgrammableTransaction: Bx,
    PublicKey: Xx,
    SenderSignedData: yT,
    SenderSignedTransaction: eE,
    SharedObjectRef: Mx,
    StructTag: zx,
    SuiObjectRef: Nn,
    Command: Lx,
    TransactionData: Vx,
    TransactionDataV1: Wx,
    TransactionExpiration: Ux,
    TransactionKind: Fx,
    TypeTag: zg,
    TransactionEffects: PT,
    PasskeyAuthenticator: vT,
  },
  IT = "…"
function rE(t) {
  if (t.length <= 6) return t
  const e = t.startsWith("0x") ? 2 : 0
  return `0x${t.slice(e, e + 4)}${IT}${t.slice(-4)}`
}
const MT =
    /^(?!.*(^(?!@)|[-.@])($|[-.@]))(?:[a-z0-9-]{0,63}(?:\.[a-z0-9-]{0,63})*)?@[a-z0-9-]{0,63}$/i,
  NT = /^(?!.*(^|[-.])($|[-.]))(?:[a-z0-9-]{0,63}\.)+sui$/i
function jT(t, e = "at") {
  const n = t.toLowerCase()
  let s
  if (n.includes("@")) {
    if (!MT.test(n)) throw new Error(`Invalid SuiNS name ${t}`)
    const [o, l] = n.split("@")
    s = [...(o ? o.split(".") : []), l]
  } else {
    if (!NT.test(n)) throw new Error(`Invalid SuiNS name ${t}`)
    s = n.split(".").slice(0, -1)
  }
  return e === "dot"
    ? `${s.join(".")}.sui`
    : `${s.slice(0, -1).join(".")}@${s[s.length - 1]}`
}
BigInt(1e9)
const DT = "0x1",
  iE = "0x2"
li("0x6")
const LT = `${iE}::sui::SUI`
li("0x5")
function ls(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("positive integer expected, got " + t)
}
function BT(t) {
  return (
    t instanceof Uint8Array ||
    (ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array")
  )
}
function Ad(t, ...e) {
  if (!BT(t)) throw new Error("Uint8Array expected")
  if (e.length > 0 && !e.includes(t.length))
    throw new Error(
      "Uint8Array expected of length " + e + ", got length=" + t.length,
    )
}
function sE(t) {
  if (typeof t != "function" || typeof t.create != "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor")
  ls(t.outputLen), ls(t.blockLen)
}
function za(t, e = !0) {
  if (t.destroyed) throw new Error("Hash instance has been destroyed")
  if (e && t.finished) throw new Error("Hash#digest() has already been called")
}
function oE(t, e) {
  Ad(t)
  const n = e.outputLen
  if (t.length < n)
    throw new Error(
      "digestInto() expects output buffer of length at least " + n,
    )
}
const ia =
  typeof globalThis == "object" && "crypto" in globalThis
    ? globalThis.crypto
    : void 0
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ function nd(
  t,
) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4))
}
function Rf(t) {
  return new DataView(t.buffer, t.byteOffset, t.byteLength)
}
const $s = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68
function aE(t) {
  return (
    ((t << 24) & 4278190080) |
    ((t << 8) & 16711680) |
    ((t >>> 8) & 65280) |
    ((t >>> 24) & 255)
  )
}
const ei = $s ? t => t : t => aE(t)
function sa(t) {
  for (let e = 0; e < t.length; e++) t[e] = aE(t[e])
}
const FT = Array.from({ length: 256 }, (t, e) =>
  e.toString(16).padStart(2, "0"),
)
function UT(t) {
  Ad(t)
  let e = ""
  for (let n = 0; n < t.length; n++) e += FT[t[n]]
  return e
}
function zT(t) {
  if (typeof t != "string")
    throw new Error("utf8ToBytes expected string, got " + typeof t)
  return new Uint8Array(new TextEncoder().encode(t))
}
function Ir(t) {
  return typeof t == "string" && (t = zT(t)), Ad(t), t
}
class Wg {
  clone() {
    return this._cloneInto()
  }
}
function $T(t, e) {
  if (e !== void 0 && {}.toString.call(e) !== "[object Object]")
    throw new Error("Options should be object or undefined")
  return Object.assign(t, e)
}
function WT(t) {
  const e = s => t().update(Ir(s)).digest(),
    n = t()
  return (
    (e.outputLen = n.outputLen),
    (e.blockLen = n.blockLen),
    (e.create = () => t()),
    e
  )
}
function VT(t) {
  const e = (s, o) => t(o).update(Ir(s)).digest(),
    n = t({})
  return (
    (e.outputLen = n.outputLen),
    (e.blockLen = n.blockLen),
    (e.create = s => t(s)),
    e
  )
}
function HT(t = 32) {
  if (ia && typeof ia.getRandomValues == "function")
    return ia.getRandomValues(new Uint8Array(t))
  if (ia && typeof ia.randomBytes == "function") return ia.randomBytes(t)
  throw new Error("crypto.getRandomValues must be defined")
}
const GT = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13,
  6, 1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1,
  9, 4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4,
  10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5,
  15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13, 11, 7,
  14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2,
  13, 7, 1, 4, 10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0, 0,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6,
  1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9,
  4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4, 10,
  15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15,
  14, 1, 9,
])
class KT extends Wg {
  constructor(e, n, s = {}, o, l, u) {
    if (
      (super(),
      (this.blockLen = e),
      (this.outputLen = n),
      (this.length = 0),
      (this.pos = 0),
      (this.finished = !1),
      (this.destroyed = !1),
      ls(e),
      ls(n),
      ls(o),
      n < 0 || n > o)
    )
      throw new Error("outputLen bigger than keyLen")
    if (s.key !== void 0 && (s.key.length < 1 || s.key.length > o))
      throw new Error("key length must be undefined or 1.." + o)
    if (s.salt !== void 0 && s.salt.length !== l)
      throw new Error("salt must be undefined or " + l)
    if (s.personalization !== void 0 && s.personalization.length !== u)
      throw new Error("personalization must be undefined or " + u)
    ;(this.buffer = new Uint8Array(e)), (this.buffer32 = nd(this.buffer))
  }
  update(e) {
    za(this)
    const { blockLen: n, buffer: s, buffer32: o } = this
    e = Ir(e)
    const l = e.length,
      u = e.byteOffset,
      f = e.buffer
    for (let d = 0; d < l; ) {
      this.pos === n &&
        ($s || sa(o), this.compress(o, 0, !1), $s || sa(o), (this.pos = 0))
      const m = Math.min(n - this.pos, l - d),
        h = u + d
      if (m === n && !(h % 4) && d + m < l) {
        const g = new Uint32Array(f, h, Math.floor((l - d) / 4))
        $s || sa(g)
        for (let w = 0; d + n < l; w += o.length, d += n)
          (this.length += n), this.compress(g, w, !1)
        $s || sa(g)
        continue
      }
      s.set(e.subarray(d, d + m), this.pos),
        (this.pos += m),
        (this.length += m),
        (d += m)
    }
    return this
  }
  digestInto(e) {
    za(this), oE(e, this)
    const { pos: n, buffer32: s } = this
    ;(this.finished = !0),
      this.buffer.subarray(n).fill(0),
      $s || sa(s),
      this.compress(s, 0, !0),
      $s || sa(s)
    const o = nd(e)
    this.get().forEach((l, u) => (o[u] = ei(l)))
  }
  digest() {
    const { buffer: e, outputLen: n } = this
    this.digestInto(e)
    const s = e.slice(0, n)
    return this.destroy(), s
  }
  _cloneInto(e) {
    const {
      buffer: n,
      length: s,
      finished: o,
      destroyed: l,
      outputLen: u,
      pos: f,
    } = this
    return (
      e || (e = new this.constructor({ dkLen: u })),
      e.set(...this.get()),
      (e.length = s),
      (e.finished = o),
      (e.destroyed = l),
      (e.outputLen = u),
      e.buffer.set(n),
      (e.pos = f),
      e
    )
  }
}
const ff = BigInt(2 ** 32 - 1),
  zm = BigInt(32)
function lE(t, e = !1) {
  return e
    ? { h: Number(t & ff), l: Number((t >> zm) & ff) }
    : { h: Number((t >> zm) & ff) | 0, l: Number(t & ff) | 0 }
}
function qT(t, e = !1) {
  let n = new Uint32Array(t.length),
    s = new Uint32Array(t.length)
  for (let o = 0; o < t.length; o++) {
    const { h: l, l: u } = lE(t[o], e)
    ;[n[o], s[o]] = [l, u]
  }
  return [n, s]
}
const QT = (t, e) => (BigInt(t >>> 0) << zm) | BigInt(e >>> 0),
  YT = (t, e, n) => t >>> n,
  XT = (t, e, n) => (t << (32 - n)) | (e >>> n),
  ZT = (t, e, n) => (t >>> n) | (e << (32 - n)),
  JT = (t, e, n) => (t << (32 - n)) | (e >>> n),
  eR = (t, e, n) => (t << (64 - n)) | (e >>> (n - 32)),
  tR = (t, e, n) => (t >>> (n - 32)) | (e << (64 - n)),
  nR = (t, e) => e,
  rR = (t, e) => t,
  iR = (t, e, n) => (t << n) | (e >>> (32 - n)),
  sR = (t, e, n) => (e << n) | (t >>> (32 - n)),
  oR = (t, e, n) => (e << (n - 32)) | (t >>> (64 - n)),
  aR = (t, e, n) => (t << (n - 32)) | (e >>> (64 - n))
function lR(t, e, n, s) {
  const o = (e >>> 0) + (s >>> 0)
  return { h: (t + n + ((o / 2 ** 32) | 0)) | 0, l: o | 0 }
}
const uR = (t, e, n) => (t >>> 0) + (e >>> 0) + (n >>> 0),
  cR = (t, e, n, s) => (e + n + s + ((t / 2 ** 32) | 0)) | 0,
  fR = (t, e, n, s) => (t >>> 0) + (e >>> 0) + (n >>> 0) + (s >>> 0),
  dR = (t, e, n, s, o) => (e + n + s + o + ((t / 2 ** 32) | 0)) | 0,
  hR = (t, e, n, s, o) =>
    (t >>> 0) + (e >>> 0) + (n >>> 0) + (s >>> 0) + (o >>> 0),
  pR = (t, e, n, s, o, l) => (e + n + s + o + l + ((t / 2 ** 32) | 0)) | 0,
  ge = {
    fromBig: lE,
    split: qT,
    toBig: QT,
    shrSH: YT,
    shrSL: XT,
    rotrSH: ZT,
    rotrSL: JT,
    rotrBH: eR,
    rotrBL: tR,
    rotr32H: nR,
    rotr32L: rR,
    rotlSH: iR,
    rotlSL: sR,
    rotlBH: oR,
    rotlBL: aR,
    add: lR,
    add3L: uR,
    add3H: cR,
    add4L: fR,
    add4H: dR,
    add5H: pR,
    add5L: hR,
  },
  St = new Uint32Array([
    4089235720, 1779033703, 2227873595, 3144134277, 4271175723, 1013904242,
    1595750129, 2773480762, 2917565137, 1359893119, 725511199, 2600822924,
    4215389547, 528734635, 327033209, 1541459225,
  ]),
  se = new Uint32Array(32)
function Ui(t, e, n, s, o, l) {
  const u = o[l],
    f = o[l + 1]
  let d = se[2 * t],
    m = se[2 * t + 1],
    h = se[2 * e],
    g = se[2 * e + 1],
    w = se[2 * n],
    b = se[2 * n + 1],
    E = se[2 * s],
    S = se[2 * s + 1],
    C = ge.add3L(d, h, u)
  ;(m = ge.add3H(C, m, g, f)),
    (d = C | 0),
    ({ Dh: S, Dl: E } = { Dh: S ^ m, Dl: E ^ d }),
    ({ Dh: S, Dl: E } = { Dh: ge.rotr32H(S, E), Dl: ge.rotr32L(S, E) }),
    ({ h: b, l: w } = ge.add(b, w, S, E)),
    ({ Bh: g, Bl: h } = { Bh: g ^ b, Bl: h ^ w }),
    ({ Bh: g, Bl: h } = { Bh: ge.rotrSH(g, h, 24), Bl: ge.rotrSL(g, h, 24) }),
    (se[2 * t] = d),
    (se[2 * t + 1] = m),
    (se[2 * e] = h),
    (se[2 * e + 1] = g),
    (se[2 * n] = w),
    (se[2 * n + 1] = b),
    (se[2 * s] = E),
    (se[2 * s + 1] = S)
}
function zi(t, e, n, s, o, l) {
  const u = o[l],
    f = o[l + 1]
  let d = se[2 * t],
    m = se[2 * t + 1],
    h = se[2 * e],
    g = se[2 * e + 1],
    w = se[2 * n],
    b = se[2 * n + 1],
    E = se[2 * s],
    S = se[2 * s + 1],
    C = ge.add3L(d, h, u)
  ;(m = ge.add3H(C, m, g, f)),
    (d = C | 0),
    ({ Dh: S, Dl: E } = { Dh: S ^ m, Dl: E ^ d }),
    ({ Dh: S, Dl: E } = { Dh: ge.rotrSH(S, E, 16), Dl: ge.rotrSL(S, E, 16) }),
    ({ h: b, l: w } = ge.add(b, w, S, E)),
    ({ Bh: g, Bl: h } = { Bh: g ^ b, Bl: h ^ w }),
    ({ Bh: g, Bl: h } = { Bh: ge.rotrBH(g, h, 63), Bl: ge.rotrBL(g, h, 63) }),
    (se[2 * t] = d),
    (se[2 * t + 1] = m),
    (se[2 * e] = h),
    (se[2 * e + 1] = g),
    (se[2 * n] = w),
    (se[2 * n + 1] = b),
    (se[2 * s] = E),
    (se[2 * s + 1] = S)
}
class mR extends KT {
  constructor(e = {}) {
    super(128, e.dkLen === void 0 ? 64 : e.dkLen, e, 64, 16, 16),
      (this.v0l = St[0] | 0),
      (this.v0h = St[1] | 0),
      (this.v1l = St[2] | 0),
      (this.v1h = St[3] | 0),
      (this.v2l = St[4] | 0),
      (this.v2h = St[5] | 0),
      (this.v3l = St[6] | 0),
      (this.v3h = St[7] | 0),
      (this.v4l = St[8] | 0),
      (this.v4h = St[9] | 0),
      (this.v5l = St[10] | 0),
      (this.v5h = St[11] | 0),
      (this.v6l = St[12] | 0),
      (this.v6h = St[13] | 0),
      (this.v7l = St[14] | 0),
      (this.v7h = St[15] | 0)
    const n = e.key ? e.key.length : 0
    if (((this.v0l ^= this.outputLen | (n << 8) | 65536 | (1 << 24)), e.salt)) {
      const s = nd(Ir(e.salt))
      ;(this.v4l ^= ei(s[0])),
        (this.v4h ^= ei(s[1])),
        (this.v5l ^= ei(s[2])),
        (this.v5h ^= ei(s[3]))
    }
    if (e.personalization) {
      const s = nd(Ir(e.personalization))
      ;(this.v6l ^= ei(s[0])),
        (this.v6h ^= ei(s[1])),
        (this.v7l ^= ei(s[2])),
        (this.v7h ^= ei(s[3]))
    }
    if (e.key) {
      const s = new Uint8Array(this.blockLen)
      s.set(Ir(e.key)), this.update(s)
    }
  }
  get() {
    let {
      v0l: e,
      v0h: n,
      v1l: s,
      v1h: o,
      v2l: l,
      v2h: u,
      v3l: f,
      v3h: d,
      v4l: m,
      v4h: h,
      v5l: g,
      v5h: w,
      v6l: b,
      v6h: E,
      v7l: S,
      v7h: C,
    } = this
    return [e, n, s, o, l, u, f, d, m, h, g, w, b, E, S, C]
  }
  set(e, n, s, o, l, u, f, d, m, h, g, w, b, E, S, C) {
    ;(this.v0l = e | 0),
      (this.v0h = n | 0),
      (this.v1l = s | 0),
      (this.v1h = o | 0),
      (this.v2l = l | 0),
      (this.v2h = u | 0),
      (this.v3l = f | 0),
      (this.v3h = d | 0),
      (this.v4l = m | 0),
      (this.v4h = h | 0),
      (this.v5l = g | 0),
      (this.v5h = w | 0),
      (this.v6l = b | 0),
      (this.v6h = E | 0),
      (this.v7l = S | 0),
      (this.v7h = C | 0)
  }
  compress(e, n, s) {
    this.get().forEach((d, m) => (se[m] = d)), se.set(St, 16)
    let { h: o, l } = ge.fromBig(BigInt(this.length))
    ;(se[24] = St[8] ^ l),
      (se[25] = St[9] ^ o),
      s && ((se[28] = ~se[28]), (se[29] = ~se[29]))
    let u = 0
    const f = GT
    for (let d = 0; d < 12; d++)
      Ui(0, 4, 8, 12, e, n + 2 * f[u++]),
        zi(0, 4, 8, 12, e, n + 2 * f[u++]),
        Ui(1, 5, 9, 13, e, n + 2 * f[u++]),
        zi(1, 5, 9, 13, e, n + 2 * f[u++]),
        Ui(2, 6, 10, 14, e, n + 2 * f[u++]),
        zi(2, 6, 10, 14, e, n + 2 * f[u++]),
        Ui(3, 7, 11, 15, e, n + 2 * f[u++]),
        zi(3, 7, 11, 15, e, n + 2 * f[u++]),
        Ui(0, 5, 10, 15, e, n + 2 * f[u++]),
        zi(0, 5, 10, 15, e, n + 2 * f[u++]),
        Ui(1, 6, 11, 12, e, n + 2 * f[u++]),
        zi(1, 6, 11, 12, e, n + 2 * f[u++]),
        Ui(2, 7, 8, 13, e, n + 2 * f[u++]),
        zi(2, 7, 8, 13, e, n + 2 * f[u++]),
        Ui(3, 4, 9, 14, e, n + 2 * f[u++]),
        zi(3, 4, 9, 14, e, n + 2 * f[u++])
    ;(this.v0l ^= se[0] ^ se[16]),
      (this.v0h ^= se[1] ^ se[17]),
      (this.v1l ^= se[2] ^ se[18]),
      (this.v1h ^= se[3] ^ se[19]),
      (this.v2l ^= se[4] ^ se[20]),
      (this.v2h ^= se[5] ^ se[21]),
      (this.v3l ^= se[6] ^ se[22]),
      (this.v3h ^= se[7] ^ se[23]),
      (this.v4l ^= se[8] ^ se[24]),
      (this.v4h ^= se[9] ^ se[25]),
      (this.v5l ^= se[10] ^ se[26]),
      (this.v5h ^= se[11] ^ se[27]),
      (this.v6l ^= se[12] ^ se[28]),
      (this.v6h ^= se[13] ^ se[29]),
      (this.v7l ^= se[14] ^ se[30]),
      (this.v7h ^= se[15] ^ se[31]),
      se.fill(0)
  }
  destroy() {
    ;(this.destroyed = !0),
      this.buffer32.fill(0),
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
  }
}
const rd = VT(t => new mR(t)),
  gR = "object",
  yR = "ID",
  vR = "ascii",
  wR = "String",
  SR = "string",
  xR = "String",
  ER = "option",
  bR = "Option"
function CR(t) {
  const e =
    typeof t.body == "object" && "datatype" in t.body ? t.body.datatype : null
  return (
    !!e &&
    He(e.package) === He("0x2") &&
    e.module === "tx_context" &&
    e.type === "TxContext"
  )
}
function $m(t) {
  if (typeof t == "string")
    switch (t) {
      case "address":
        return Me.Address
      case "bool":
        return Me.Bool
      case "u8":
        return Me.U8
      case "u16":
        return Me.U16
      case "u32":
        return Me.U32
      case "u64":
        return Me.U64
      case "u128":
        return Me.U128
      case "u256":
        return Me.U256
      default:
        throw new Error(`Unknown type signature ${t}`)
    }
  if ("vector" in t) {
    if (t.vector === "u8")
      return Me.vector(Me.U8).transform({
        input: n => (typeof n == "string" ? new TextEncoder().encode(n) : n),
        output: n => n,
      })
    const e = $m(t.vector)
    return e ? Me.vector(e) : null
  }
  if ("datatype" in t) {
    const e = He(t.datatype.package)
    if (e === He(DT)) {
      if (
        (t.datatype.module === vR && t.datatype.type === wR) ||
        (t.datatype.module === SR && t.datatype.type === xR)
      )
        return Me.String
      if (t.datatype.module === ER && t.datatype.type === bR) {
        const n = $m(t.datatype.typeParameters[0])
        return n ? Me.vector(n) : null
      }
    }
    if (e === He(iE) && t.datatype.module === gR && t.datatype.type === yR)
      return Me.Address
  }
  return null
}
function _R(t) {
  return typeof t == "object" && "Reference" in t
    ? { ref: "&", body: hu(t.Reference) }
    : typeof t == "object" && "MutableReference" in t
      ? { ref: "&mut", body: hu(t.MutableReference) }
      : { ref: null, body: hu(t) }
}
function hu(t) {
  if (typeof t == "string")
    switch (t) {
      case "Address":
        return "address"
      case "Bool":
        return "bool"
      case "U8":
        return "u8"
      case "U16":
        return "u16"
      case "U32":
        return "u32"
      case "U64":
        return "u64"
      case "U128":
        return "u128"
      case "U256":
        return "u256"
      default:
        throw new Error(`Unexpected type ${t}`)
    }
  if ("Vector" in t) return { vector: hu(t.Vector) }
  if ("Struct" in t)
    return {
      datatype: {
        package: t.Struct.address,
        module: t.Struct.module,
        type: t.Struct.name,
        typeParameters: t.Struct.typeArguments.map(hu),
      },
    }
  if ("TypeParameter" in t) return { typeParameter: t.TypeParameter }
  throw new Error(`Unexpected type ${JSON.stringify(t)}`)
}
function kR(t) {
  return {
    $kind: "Pure",
    Pure: { bytes: t instanceof Uint8Array ? Ke(t) : t.toBase64() },
  }
}
const ui = {
  Pure: kR,
  ObjectRef({ objectId: t, digest: e, version: n }) {
    return {
      $kind: "Object",
      Object: {
        $kind: "ImmOrOwnedObject",
        ImmOrOwnedObject: { digest: e, version: n, objectId: He(t) },
      },
    }
  },
  SharedObjectRef({ objectId: t, mutable: e, initialSharedVersion: n }) {
    return {
      $kind: "Object",
      Object: {
        $kind: "SharedObject",
        SharedObject: { mutable: e, initialSharedVersion: n, objectId: He(t) },
      },
    }
  },
  ReceivingRef({ objectId: t, digest: e, version: n }) {
    return {
      $kind: "Object",
      Object: {
        $kind: "Receiving",
        Receiving: { digest: e, version: n, objectId: He(t) },
      },
    }
  },
}
var OR = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu,
  qr
function uE(t) {
  return {
    lang: (t == null ? void 0 : t.lang) ?? (qr == null ? void 0 : qr.lang),
    message: t == null ? void 0 : t.message,
    abortEarly:
      (t == null ? void 0 : t.abortEarly) ??
      (qr == null ? void 0 : qr.abortEarly),
    abortPipeEarly:
      (t == null ? void 0 : t.abortPipeEarly) ??
      (qr == null ? void 0 : qr.abortPipeEarly),
  }
}
var rm
function AR(t) {
  return rm == null ? void 0 : rm.get(t)
}
var im
function TR(t) {
  return im == null ? void 0 : im.get(t)
}
var sm
function RR(t, e) {
  var n
  return (n = sm == null ? void 0 : sm.get(t)) == null ? void 0 : n.get(e)
}
function cE(t) {
  var n, s
  const e = typeof t
  return e === "string"
    ? `"${t}"`
    : e === "number" || e === "bigint" || e === "boolean"
      ? `${t}`
      : e === "object" || e === "function"
        ? ((t &&
            ((s =
              (n = Object.getPrototypeOf(t)) == null
                ? void 0
                : n.constructor) == null
              ? void 0
              : s.name)) ??
          "null")
        : e
}
function Nt(t, e, n, s, o) {
  const l = o && "input" in o ? o.input : n.value,
    u = (o == null ? void 0 : o.expected) ?? t.expects ?? null,
    f = (o == null ? void 0 : o.received) ?? cE(l),
    d = {
      kind: t.kind,
      type: t.type,
      input: l,
      expected: u,
      received: f,
      message: `Invalid ${e}: ${u ? `Expected ${u} but r` : "R"}eceived ${f}`,
      requirement: t.requirement,
      path: o == null ? void 0 : o.path,
      issues: o == null ? void 0 : o.issues,
      lang: s.lang,
      abortEarly: s.abortEarly,
      abortPipeEarly: s.abortPipeEarly,
    },
    m = t.kind === "schema",
    h =
      (o == null ? void 0 : o.message) ??
      t.message ??
      RR(t.reference, d.lang) ??
      (m ? TR(d.lang) : null) ??
      s.message ??
      AR(d.lang)
  h && (d.message = typeof h == "function" ? h(d) : h),
    m && (n.typed = !1),
    n.issues ? n.issues.push(d) : (n.issues = [d])
}
function PR(t, e) {
  return (
    Object.hasOwn(t, e) &&
    e !== "__proto__" &&
    e !== "prototype" &&
    e !== "constructor"
  )
}
var IR = class extends Error {
  constructor(e) {
    super(e[0].message)
    Ye(this, "issues")
    ;(this.name = "ValiError"), (this.issues = e)
  }
}
function Bu(t, e) {
  return {
    kind: "validation",
    type: "check",
    reference: Bu,
    async: !1,
    expects: null,
    requirement: t,
    message: e,
    _run(n, s) {
      return n.typed && !this.requirement(n.value) && Nt(this, "input", n, s), n
    },
  }
}
function ft(t) {
  return {
    kind: "validation",
    type: "integer",
    reference: ft,
    async: !1,
    expects: null,
    requirement: Number.isInteger,
    message: t,
    _run(e, n) {
      return (
        e.typed && !this.requirement(e.value) && Nt(this, "integer", e, n), e
      )
    },
  }
}
function Td(t) {
  return {
    kind: "transformation",
    type: "transform",
    reference: Td,
    async: !1,
    operation: t,
    _run(e) {
      return (e.value = this.operation(e.value)), e
    },
  }
}
function fE(t) {
  return {
    kind: "validation",
    type: "url",
    reference: fE,
    async: !1,
    expects: null,
    requirement(e) {
      try {
        return new URL(e), !0
      } catch {
        return !1
      }
    },
    message: t,
    _run(e, n) {
      return e.typed && !this.requirement(e.value) && Nt(this, "URL", e, n), e
    },
  }
}
function Vg(t) {
  return {
    kind: "validation",
    type: "uuid",
    reference: Vg,
    async: !1,
    expects: null,
    requirement: OR,
    message: t,
    _run(e, n) {
      return (
        e.typed && !this.requirement.test(e.value) && Nt(this, "UUID", e, n), e
      )
    },
  }
}
function Hg(t, e, n) {
  return typeof t.default == "function" ? t.default(e, n) : t.default
}
function Wm(t, e) {
  return !t._run({ typed: !1, value: e }, { abortEarly: !0 }).issues
}
function be(t, e) {
  return {
    kind: "schema",
    type: "array",
    reference: be,
    expects: "Array",
    async: !1,
    item: t,
    message: e,
    _run(n, s) {
      var l
      const o = n.value
      if (Array.isArray(o)) {
        ;(n.typed = !0), (n.value = [])
        for (let u = 0; u < o.length; u++) {
          const f = o[u],
            d = this.item._run({ typed: !1, value: f }, s)
          if (d.issues) {
            const m = {
              type: "array",
              origin: "value",
              input: o,
              key: u,
              value: f,
            }
            for (const h of d.issues)
              h.path ? h.path.unshift(m) : (h.path = [m]),
                (l = n.issues) == null || l.push(h)
            if ((n.issues || (n.issues = d.issues), s.abortEarly)) {
              n.typed = !1
              break
            }
          }
          d.typed || (n.typed = !1), n.value.push(d.value)
        }
      } else Nt(this, "type", n, s)
      return n
    },
  }
}
function Gg(t) {
  return {
    kind: "schema",
    type: "bigint",
    reference: Gg,
    expects: "bigint",
    async: !1,
    message: t,
    _run(e, n) {
      return (
        typeof e.value == "bigint" ? (e.typed = !0) : Nt(this, "type", e, n), e
      )
    },
  }
}
function Rd(t) {
  return {
    kind: "schema",
    type: "boolean",
    reference: Rd,
    expects: "boolean",
    async: !1,
    message: t,
    _run(e, n) {
      return (
        typeof e.value == "boolean" ? (e.typed = !0) : Nt(this, "type", e, n), e
      )
    },
  }
}
function xu(t) {
  return {
    kind: "schema",
    type: "lazy",
    reference: xu,
    expects: "unknown",
    async: !1,
    getter: t,
    _run(e, n) {
      return this.getter(e.value)._run(e, n)
    },
  }
}
function ye(t, e) {
  return {
    kind: "schema",
    type: "literal",
    reference: ye,
    expects: cE(t),
    async: !1,
    literal: t,
    message: e,
    _run(n, s) {
      return (
        n.value === this.literal ? (n.typed = !0) : Nt(this, "type", n, s), n
      )
    },
  }
}
function ze(t, ...e) {
  const n = {
    kind: "schema",
    type: "nullable",
    reference: ze,
    expects: `${t.expects} | null`,
    async: !1,
    wrapped: t,
    _run(s, o) {
      return s.value === null &&
        ("default" in this && (s.value = Hg(this, s, o)), s.value === null)
        ? ((s.typed = !0), s)
        : this.wrapped._run(s, o)
    },
  }
  return 0 in e && (n.default = e[0]), n
}
function $a(t, ...e) {
  const n = {
    kind: "schema",
    type: "nullish",
    reference: $a,
    expects: `${t.expects} | null | undefined`,
    async: !1,
    wrapped: t,
    _run(s, o) {
      return (s.value === null || s.value === void 0) &&
        ("default" in this && (s.value = Hg(this, s, o)),
        s.value === null || s.value === void 0)
        ? ((s.typed = !0), s)
        : this.wrapped._run(s, o)
    },
  }
  return 0 in e && (n.default = e[0]), n
}
function it(t) {
  return {
    kind: "schema",
    type: "number",
    reference: it,
    expects: "number",
    async: !1,
    message: t,
    _run(e, n) {
      return (
        typeof e.value == "number" && !isNaN(e.value)
          ? (e.typed = !0)
          : Nt(this, "type", e, n),
        e
      )
    },
  }
}
function re(t, e) {
  return {
    kind: "schema",
    type: "object",
    reference: re,
    expects: "Object",
    async: !1,
    entries: t,
    message: e,
    _run(n, s) {
      var l
      const o = n.value
      if (o && typeof o == "object") {
        ;(n.typed = !0), (n.value = {})
        for (const u in this.entries) {
          const f = o[u],
            d = this.entries[u]._run({ typed: !1, value: f }, s)
          if (d.issues) {
            const m = {
              type: "object",
              origin: "value",
              input: o,
              key: u,
              value: f,
            }
            for (const h of d.issues)
              h.path ? h.path.unshift(m) : (h.path = [m]),
                (l = n.issues) == null || l.push(h)
            if ((n.issues || (n.issues = d.issues), s.abortEarly)) {
              n.typed = !1
              break
            }
          }
          d.typed || (n.typed = !1),
            (d.value !== void 0 || u in o) && (n.value[u] = d.value)
        }
      } else Nt(this, "type", n, s)
      return n
    },
  }
}
function Mt(t, ...e) {
  const n = {
    kind: "schema",
    type: "optional",
    reference: Mt,
    expects: `${t.expects} | undefined`,
    async: !1,
    wrapped: t,
    _run(s, o) {
      return s.value === void 0 &&
        ("default" in this && (s.value = Hg(this, s, o)), s.value === void 0)
        ? ((s.typed = !0), s)
        : this.wrapped._run(s, o)
    },
  }
  return 0 in e && (n.default = e[0]), n
}
function Eu(t, e, n) {
  return {
    kind: "schema",
    type: "record",
    reference: Eu,
    expects: "Object",
    async: !1,
    key: t,
    value: e,
    message: n,
    _run(s, o) {
      var u, f
      const l = s.value
      if (l && typeof l == "object") {
        ;(s.typed = !0), (s.value = {})
        for (const d in l)
          if (PR(l, d)) {
            const m = l[d],
              h = this.key._run({ typed: !1, value: d }, o)
            if (h.issues) {
              const w = {
                type: "object",
                origin: "key",
                input: l,
                key: d,
                value: m,
              }
              for (const b of h.issues)
                (b.path = [w]), (u = s.issues) == null || u.push(b)
              if ((s.issues || (s.issues = h.issues), o.abortEarly)) {
                s.typed = !1
                break
              }
            }
            const g = this.value._run({ typed: !1, value: m }, o)
            if (g.issues) {
              const w = {
                type: "object",
                origin: "value",
                input: l,
                key: d,
                value: m,
              }
              for (const b of g.issues)
                b.path ? b.path.unshift(w) : (b.path = [w]),
                  (f = s.issues) == null || f.push(b)
              if ((s.issues || (s.issues = g.issues), o.abortEarly)) {
                s.typed = !1
                break
              }
            }
            ;(!h.typed || !g.typed) && (s.typed = !1),
              h.typed && (s.value[h.value] = g.value)
          }
      } else Nt(this, "type", s, o)
      return s
    },
  }
}
function xe(t) {
  return {
    kind: "schema",
    type: "string",
    reference: xe,
    expects: "string",
    async: !1,
    message: t,
    _run(e, n) {
      return (
        typeof e.value == "string" ? (e.typed = !0) : Nt(this, "type", e, n), e
      )
    },
  }
}
function Kg(t, e) {
  return {
    kind: "schema",
    type: "tuple",
    reference: Kg,
    expects: "Array",
    async: !1,
    items: t,
    message: e,
    _run(n, s) {
      var l
      const o = n.value
      if (Array.isArray(o)) {
        ;(n.typed = !0), (n.value = [])
        for (let u = 0; u < this.items.length; u++) {
          const f = o[u],
            d = this.items[u]._run({ typed: !1, value: f }, s)
          if (d.issues) {
            const m = {
              type: "array",
              origin: "value",
              input: o,
              key: u,
              value: f,
            }
            for (const h of d.issues)
              h.path ? h.path.unshift(m) : (h.path = [m]),
                (l = n.issues) == null || l.push(h)
            if ((n.issues || (n.issues = d.issues), s.abortEarly)) {
              n.typed = !1
              break
            }
          }
          d.typed || (n.typed = !1), n.value.push(d.value)
        }
      } else Nt(this, "type", n, s)
      return n
    },
  }
}
function gS(t) {
  let e
  if (t) for (const n of t) e ? e.push(...n.issues) : (e = n.issues)
  return e
}
function jt(t, e) {
  return {
    kind: "schema",
    type: "union",
    reference: jt,
    expects: [...new Set(t.map(n => n.expects))].join(" | ") || "never",
    async: !1,
    options: t,
    message: e,
    _run(n, s) {
      let o, l, u
      for (const f of this.options) {
        const d = f._run({ typed: !1, value: n.value }, s)
        if (d.typed)
          if (d.issues) l ? l.push(d) : (l = [d])
          else {
            o = d
            break
          }
        else u ? u.push(d) : (u = [d])
      }
      if (o) return o
      if (l) {
        if (l.length === 1) return l[0]
        Nt(this, "type", n, s, { issues: gS(l) }), (n.typed = !0)
      } else {
        if ((u == null ? void 0 : u.length) === 1) return u[0]
        Nt(this, "type", n, s, { issues: gS(u) })
      }
      return n
    },
  }
}
function po() {
  return {
    kind: "schema",
    type: "unknown",
    reference: po,
    expects: "unknown",
    async: !1,
    _run(t) {
      return (t.typed = !0), t
    },
  }
}
function dE(t, e, n = new Set()) {
  for (const s of e)
    s.type === "variant" ? dE(t, s.options, n) : n.add(s.entries[t].expects)
  return n
}
function Pd(t, e, n) {
  let s
  return {
    kind: "schema",
    type: "variant",
    reference: Pd,
    expects: "Object",
    async: !1,
    key: t,
    options: e,
    message: n,
    _run(o, l) {
      const u = o.value
      if (u && typeof u == "object") {
        const f = u[this.key]
        if (this.key in u) {
          let d
          for (const m of this.options)
            if (
              m.type === "variant" ||
              !m.entries[this.key]._run({ typed: !1, value: f }, l).issues
            ) {
              const h = m._run({ typed: !1, value: u }, l)
              if (!h.issues) return h
              ;(!d || (!d.typed && h.typed)) && (d = h)
            }
          if (d) return d
        }
        s || (s = [...dE(this.key, this.options)].join(" | ") || "never"),
          Nt(this, "type", o, l, {
            input: f,
            expected: s,
            path: [
              {
                type: "object",
                origin: "value",
                input: u,
                key: this.key,
                value: f,
              },
            ],
          })
      } else Nt(this, "type", o, l)
      return o
    },
  }
}
function ct(t, e, n) {
  const s = t._run({ typed: !1, value: e }, uE(n))
  if (s.issues) throw new IR(s.issues)
  return s.value
}
function $e(...t) {
  return {
    ...t[0],
    pipe: t,
    _run(e, n) {
      for (let s = 0; s < t.length; s++) {
        if (
          e.issues &&
          (t[s].kind === "schema" || t[s].kind === "transformation")
        ) {
          e.typed = !1
          break
        }
        ;(!e.issues || (!n.abortEarly && !n.abortPipeEarly)) &&
          (e = t[s]._run(e, n))
      }
      return e
    },
  }
}
function MR(t, e, n) {
  const s = t._run({ typed: !1, value: e }, uE(n))
  return {
    typed: s.typed,
    success: !s.issues,
    output: s.value,
    issues: s.issues,
  }
}
function wo(t) {
  const e = Object.entries(t).map(([n, s]) => re({ [n]: s }))
  return $e(
    jt(e),
    Td(n => ({ ...n, $kind: Object.keys(n)[0] })),
  )
}
const Ya = $e(
    xe(),
    Td(t => He(t)),
    Bu(ri),
  ),
  bn = Ya,
  mo = xe(),
  fn = $e(
    jt([xe(), $e(it(), ft())]),
    Bu(t => {
      try {
        return BigInt(t), BigInt(t) >= 0 && BigInt(t) <= 18446744073709551615n
      } catch {
        return !1
      }
    }, "Invalid u64"),
  ),
  us = re({ objectId: Ya, version: fn, digest: xe() }),
  et = $e(
    jt([
      re({ GasCoin: ye(!0) }),
      re({ Input: $e(it(), ft()), type: Mt(ye("pure")) }),
      re({ Input: $e(it(), ft()), type: Mt(ye("object")) }),
      re({ Result: $e(it(), ft()) }),
      re({ NestedResult: Kg([$e(it(), ft()), $e(it(), ft())]) }),
    ]),
    Td(t => ({ ...t, $kind: Object.keys(t)[0] })),
  ),
  NR = re({
    budget: ze(fn),
    price: ze(fn),
    owner: ze(Ya),
    payment: ze(be(us)),
  }),
  Vm = jt([
    ye("address"),
    ye("bool"),
    ye("u8"),
    ye("u16"),
    ye("u32"),
    ye("u64"),
    ye("u128"),
    ye("u256"),
    re({ vector: xu(() => Vm) }),
    re({
      datatype: re({
        package: xe(),
        module: xe(),
        type: xe(),
        typeParameters: be(xu(() => Vm)),
      }),
    }),
    re({ typeParameter: $e(it(), ft()) }),
  ]),
  jR = re({ ref: ze(jt([ye("&"), ye("&mut")])), body: Vm }),
  DR = re({
    package: bn,
    module: xe(),
    function: xe(),
    typeArguments: be(xe()),
    arguments: be(et),
    _argumentTypes: Mt(ze(be(jR))),
  }),
  LR = re({
    name: xe(),
    inputs: Eu(xe(), jt([et, be(et)])),
    data: Eu(xe(), po()),
  }),
  BR = wo({
    MoveCall: DR,
    TransferObjects: re({ objects: be(et), address: et }),
    SplitCoins: re({ coin: et, amounts: be(et) }),
    MergeCoins: re({ destination: et, sources: be(et) }),
    Publish: re({ modules: be(mo), dependencies: be(bn) }),
    MakeMoveVec: re({ type: ze(xe()), elements: be(et) }),
    Upgrade: re({
      modules: be(mo),
      dependencies: be(bn),
      package: bn,
      ticket: et,
    }),
    $Intent: LR,
  }),
  hE = wo({
    ImmOrOwnedObject: us,
    SharedObject: re({ objectId: bn, initialSharedVersion: fn, mutable: Rd() }),
    Receiving: us,
  }),
  FR = wo({
    Object: hE,
    Pure: re({ bytes: mo }),
    UnresolvedPure: re({ value: po() }),
    UnresolvedObject: re({
      objectId: bn,
      version: Mt(ze(fn)),
      digest: Mt(ze(xe())),
      initialSharedVersion: Mt(ze(fn)),
    }),
  }),
  yS = wo({ Object: hE, Pure: re({ bytes: mo }) }),
  pE = wo({ None: ye(!0), Epoch: fn }),
  Pf = re({
    version: ye(2),
    sender: $a(Ya),
    expiration: $a(pE),
    gasData: NR,
    inputs: be(FR),
    commands: be(BR),
  }),
  Ns = {
    MoveCall(t) {
      const [e, n = "", s = ""] =
        "target" in t ? t.target.split("::") : [t.package, t.module, t.function]
      return {
        $kind: "MoveCall",
        MoveCall: {
          package: e,
          module: n,
          function: s,
          typeArguments: t.typeArguments ?? [],
          arguments: t.arguments ?? [],
        },
      }
    },
    TransferObjects(t, e) {
      return {
        $kind: "TransferObjects",
        TransferObjects: { objects: t.map(n => ct(et, n)), address: ct(et, e) },
      }
    },
    SplitCoins(t, e) {
      return {
        $kind: "SplitCoins",
        SplitCoins: { coin: ct(et, t), amounts: e.map(n => ct(et, n)) },
      }
    },
    MergeCoins(t, e) {
      return {
        $kind: "MergeCoins",
        MergeCoins: { destination: ct(et, t), sources: e.map(n => ct(et, n)) },
      }
    },
    Publish({ modules: t, dependencies: e }) {
      return {
        $kind: "Publish",
        Publish: {
          modules: t.map(n =>
            typeof n == "string" ? n : Ke(new Uint8Array(n)),
          ),
          dependencies: e.map(n => li(n)),
        },
      }
    },
    Upgrade({ modules: t, dependencies: e, package: n, ticket: s }) {
      return {
        $kind: "Upgrade",
        Upgrade: {
          modules: t.map(o =>
            typeof o == "string" ? o : Ke(new Uint8Array(o)),
          ),
          dependencies: e.map(o => li(o)),
          package: n,
          ticket: ct(et, s),
        },
      }
    },
    MakeMoveVec({ type: t, elements: e }) {
      return {
        $kind: "MakeMoveVec",
        MakeMoveVec: { type: t ?? null, elements: e.map(n => ct(et, n)) },
      }
    },
    Intent({ name: t, inputs: e = {}, data: n = {} }) {
      return {
        $kind: "$Intent",
        $Intent: {
          name: t,
          inputs: Object.fromEntries(
            Object.entries(e).map(([s, o]) => [
              s,
              Array.isArray(o) ? o.map(l => ct(et, l)) : ct(et, o),
            ]),
          ),
          data: n,
        },
      }
    },
  },
  Hm = re({
    digest: xe(),
    objectId: xe(),
    version: jt([$e(it(), ft()), xe(), Gg()]),
  }),
  UR = wo({
    ImmOrOwned: Hm,
    Shared: re({ objectId: bn, initialSharedVersion: fn, mutable: Rd() }),
    Receiving: Hm,
  }),
  vS = wo({ Object: UR, Pure: be($e(it(), ft())) }),
  mE = jt([
    re({
      kind: ye("Input"),
      index: $e(it(), ft()),
      value: po(),
      type: Mt(ye("object")),
    }),
    re({
      kind: ye("Input"),
      index: $e(it(), ft()),
      value: po(),
      type: ye("pure"),
    }),
  ]),
  zR = jt([re({ Epoch: $e(it(), ft()) }), re({ None: ze(ye(!0)) })]),
  wS = $e(
    jt([it(), xe(), Gg()]),
    Bu(t => {
      if (!["string", "number", "bigint"].includes(typeof t)) return !1
      try {
        return BigInt(t), !0
      } catch {
        return !1
      }
    }),
  ),
  qg = jt([
    re({ bool: ze(ye(!0)) }),
    re({ u8: ze(ye(!0)) }),
    re({ u64: ze(ye(!0)) }),
    re({ u128: ze(ye(!0)) }),
    re({ address: ze(ye(!0)) }),
    re({ signer: ze(ye(!0)) }),
    re({ vector: xu(() => qg) }),
    re({ struct: xu(() => $R) }),
    re({ u16: ze(ye(!0)) }),
    re({ u32: ze(ye(!0)) }),
    re({ u256: ze(ye(!0)) }),
  ]),
  $R = re({ address: xe(), module: xe(), name: xe(), typeParams: be(qg) }),
  WR = re({
    budget: Mt(wS),
    price: Mt(wS),
    payment: Mt(be(Hm)),
    owner: Mt(xe()),
  }),
  VR = [
    mE,
    re({ kind: ye("GasCoin") }),
    re({ kind: ye("Result"), index: $e(it(), ft()) }),
    re({
      kind: ye("NestedResult"),
      index: $e(it(), ft()),
      resultIndex: $e(it(), ft()),
    }),
  ],
  pi = jt([...VR]),
  HR = re({
    kind: ye("MoveCall"),
    target: $e(
      xe(),
      Bu(t => t.split("::").length === 3),
    ),
    typeArguments: be(xe()),
    arguments: be(pi),
  }),
  GR = re({ kind: ye("TransferObjects"), objects: be(pi), address: pi }),
  KR = re({ kind: ye("SplitCoins"), coin: pi, amounts: be(pi) }),
  qR = re({ kind: ye("MergeCoins"), destination: pi, sources: be(pi) }),
  QR = re({
    kind: ye("MakeMoveVec"),
    type: jt([re({ Some: qg }), re({ None: ze(ye(!0)) })]),
    objects: be(pi),
  }),
  YR = re({
    kind: ye("Publish"),
    modules: be(be($e(it(), ft()))),
    dependencies: be(xe()),
  }),
  XR = re({
    kind: ye("Upgrade"),
    modules: be(be($e(it(), ft()))),
    dependencies: be(xe()),
    packageId: xe(),
    ticket: pi,
  }),
  ZR = [HR, GR, KR, qR, YR, XR, QR],
  JR = jt([...ZR])
re({
  version: ye(1),
  sender: Mt(xe()),
  expiration: $a(zR),
  gasConfig: WR,
  inputs: be(mE),
  transactions: be(JR),
})
function SS(t) {
  var n
  const e = t.inputs.map((s, o) => {
    if (s.Object)
      return {
        kind: "Input",
        index: o,
        value: {
          Object: s.Object.ImmOrOwnedObject
            ? { ImmOrOwned: s.Object.ImmOrOwnedObject }
            : s.Object.Receiving
              ? {
                  Receiving: {
                    digest: s.Object.Receiving.digest,
                    version: s.Object.Receiving.version,
                    objectId: s.Object.Receiving.objectId,
                  },
                }
              : {
                  Shared: {
                    mutable: s.Object.SharedObject.mutable,
                    initialSharedVersion:
                      s.Object.SharedObject.initialSharedVersion,
                    objectId: s.Object.SharedObject.objectId,
                  },
                },
        },
        type: "object",
      }
    if (s.Pure)
      return {
        kind: "Input",
        index: o,
        value: { Pure: Array.from(Dn(s.Pure.bytes)) },
        type: "pure",
      }
    if (s.UnresolvedPure)
      return {
        kind: "Input",
        type: "pure",
        index: o,
        value: s.UnresolvedPure.value,
      }
    if (s.UnresolvedObject)
      return {
        kind: "Input",
        type: "object",
        index: o,
        value: s.UnresolvedObject.objectId,
      }
    throw new Error("Invalid input")
  })
  return {
    version: 1,
    sender: t.sender ?? void 0,
    expiration:
      ((n = t.expiration) == null ? void 0 : n.$kind) === "Epoch"
        ? { Epoch: Number(t.expiration.Epoch) }
        : t.expiration
          ? { None: !0 }
          : null,
    gasConfig: {
      owner: t.gasData.owner ?? void 0,
      budget: t.gasData.budget ?? void 0,
      price: t.gasData.price ?? void 0,
      payment: t.gasData.payment ?? void 0,
    },
    inputs: e,
    transactions: t.commands.map(s => {
      if (s.MakeMoveVec)
        return {
          kind: "MakeMoveVec",
          type:
            s.MakeMoveVec.type === null
              ? { None: !0 }
              : { Some: Pr.parseFromStr(s.MakeMoveVec.type) },
          objects: s.MakeMoveVec.elements.map(o => Qr(o, e)),
        }
      if (s.MergeCoins)
        return {
          kind: "MergeCoins",
          destination: Qr(s.MergeCoins.destination, e),
          sources: s.MergeCoins.sources.map(o => Qr(o, e)),
        }
      if (s.MoveCall)
        return {
          kind: "MoveCall",
          target: `${s.MoveCall.package}::${s.MoveCall.module}::${s.MoveCall.function}`,
          typeArguments: s.MoveCall.typeArguments,
          arguments: s.MoveCall.arguments.map(o => Qr(o, e)),
        }
      if (s.Publish)
        return {
          kind: "Publish",
          modules: s.Publish.modules.map(o => Array.from(Dn(o))),
          dependencies: s.Publish.dependencies,
        }
      if (s.SplitCoins)
        return {
          kind: "SplitCoins",
          coin: Qr(s.SplitCoins.coin, e),
          amounts: s.SplitCoins.amounts.map(o => Qr(o, e)),
        }
      if (s.TransferObjects)
        return {
          kind: "TransferObjects",
          objects: s.TransferObjects.objects.map(o => Qr(o, e)),
          address: Qr(s.TransferObjects.address, e),
        }
      if (s.Upgrade)
        return {
          kind: "Upgrade",
          modules: s.Upgrade.modules.map(o => Array.from(Dn(o))),
          dependencies: s.Upgrade.dependencies,
          packageId: s.Upgrade.package,
          ticket: Qr(s.Upgrade.ticket, e),
        }
      throw new Error(`Unknown transaction ${Object.keys(s)}`)
    }),
  }
}
function Qr(t, e) {
  if (t.$kind === "GasCoin") return { kind: "GasCoin" }
  if (t.$kind === "Result") return { kind: "Result", index: t.Result }
  if (t.$kind === "NestedResult")
    return {
      kind: "NestedResult",
      index: t.NestedResult[0],
      resultIndex: t.NestedResult[1],
    }
  if (t.$kind === "Input") return e[t.Input]
  throw new Error(`Invalid argument ${Object.keys(t)}`)
}
function eP(t) {
  var e, n, s
  return ct(Pf, {
    version: 2,
    sender: t.sender ?? null,
    expiration: t.expiration
      ? "Epoch" in t.expiration
        ? { Epoch: t.expiration.Epoch }
        : { None: !0 }
      : null,
    gasData: {
      owner: t.gasConfig.owner ?? null,
      budget:
        ((e = t.gasConfig.budget) == null ? void 0 : e.toString()) ?? null,
      price: ((n = t.gasConfig.price) == null ? void 0 : n.toString()) ?? null,
      payment:
        ((s = t.gasConfig.payment) == null
          ? void 0
          : s.map(o => ({
              digest: o.digest,
              objectId: o.objectId,
              version: o.version.toString(),
            }))) ?? null,
    },
    inputs: t.inputs.map(o => {
      if (o.kind === "Input") {
        if (Wm(vS, o.value)) {
          const l = ct(vS, o.value)
          if (l.Object) {
            if (l.Object.ImmOrOwned)
              return {
                Object: {
                  ImmOrOwnedObject: {
                    objectId: l.Object.ImmOrOwned.objectId,
                    version: String(l.Object.ImmOrOwned.version),
                    digest: l.Object.ImmOrOwned.digest,
                  },
                },
              }
            if (l.Object.Shared)
              return {
                Object: {
                  SharedObject: {
                    mutable: l.Object.Shared.mutable ?? null,
                    initialSharedVersion: l.Object.Shared.initialSharedVersion,
                    objectId: l.Object.Shared.objectId,
                  },
                },
              }
            if (l.Object.Receiving)
              return {
                Object: {
                  Receiving: {
                    digest: l.Object.Receiving.digest,
                    version: String(l.Object.Receiving.version),
                    objectId: l.Object.Receiving.objectId,
                  },
                },
              }
            throw new Error("Invalid object input")
          }
          return { Pure: { bytes: Ke(new Uint8Array(l.Pure)) } }
        }
        return o.type === "object"
          ? { UnresolvedObject: { objectId: o.value } }
          : { UnresolvedPure: { value: o.value } }
      }
      throw new Error("Invalid input")
    }),
    commands: t.transactions.map(o => {
      switch (o.kind) {
        case "MakeMoveVec":
          return {
            MakeMoveVec: {
              type: "Some" in o.type ? Pr.tagToString(o.type.Some) : null,
              elements: o.objects.map(l => Yr(l)),
            },
          }
        case "MergeCoins":
          return {
            MergeCoins: {
              destination: Yr(o.destination),
              sources: o.sources.map(l => Yr(l)),
            },
          }
        case "MoveCall": {
          const [l, u, f] = o.target.split("::")
          return {
            MoveCall: {
              package: l,
              module: u,
              function: f,
              typeArguments: o.typeArguments,
              arguments: o.arguments.map(d => Yr(d)),
            },
          }
        }
        case "Publish":
          return {
            Publish: {
              modules: o.modules.map(l => Ke(Uint8Array.from(l))),
              dependencies: o.dependencies,
            },
          }
        case "SplitCoins":
          return {
            SplitCoins: {
              coin: Yr(o.coin),
              amounts: o.amounts.map(l => Yr(l)),
            },
          }
        case "TransferObjects":
          return {
            TransferObjects: {
              objects: o.objects.map(l => Yr(l)),
              address: Yr(o.address),
            },
          }
        case "Upgrade":
          return {
            Upgrade: {
              modules: o.modules.map(l => Ke(Uint8Array.from(l))),
              dependencies: o.dependencies,
              package: o.packageId,
              ticket: Yr(o.ticket),
            },
          }
      }
      throw new Error(`Unknown transaction ${Object.keys(o)}`)
    }),
  })
}
function Yr(t) {
  switch (t.kind) {
    case "GasCoin":
      return { GasCoin: !0 }
    case "Result":
      return { Result: t.index }
    case "NestedResult":
      return { NestedResult: [t.index, t.resultIndex] }
    case "Input":
      return { Input: t.index }
  }
}
function Fu(t) {
  return jt(Object.entries(t).map(([e, n]) => re({ [e]: n })))
}
const qn = Fu({
    GasCoin: ye(!0),
    Input: $e(it(), ft()),
    Result: $e(it(), ft()),
    NestedResult: Kg([$e(it(), ft()), $e(it(), ft())]),
  }),
  tP = re({
    budget: ze(fn),
    price: ze(fn),
    owner: ze(Ya),
    payment: ze(be(us)),
  }),
  nP = re({
    package: bn,
    module: xe(),
    function: xe(),
    typeArguments: be(xe()),
    arguments: be(qn),
  }),
  rP = re({
    name: xe(),
    inputs: Eu(xe(), jt([qn, be(qn)])),
    data: Eu(xe(), po()),
  }),
  iP = Fu({
    MoveCall: nP,
    TransferObjects: re({ objects: be(qn), address: qn }),
    SplitCoins: re({ coin: qn, amounts: be(qn) }),
    MergeCoins: re({ destination: qn, sources: be(qn) }),
    Publish: re({ modules: be(mo), dependencies: be(bn) }),
    MakeMoveVec: re({ type: ze(xe()), elements: be(qn) }),
    Upgrade: re({
      modules: be(mo),
      dependencies: be(bn),
      package: bn,
      ticket: qn,
    }),
    $Intent: rP,
  }),
  sP = Fu({
    ImmOrOwnedObject: us,
    SharedObject: re({ objectId: bn, initialSharedVersion: fn, mutable: Rd() }),
    Receiving: us,
  }),
  oP = Fu({
    Object: sP,
    Pure: re({ bytes: mo }),
    UnresolvedPure: re({ value: po() }),
    UnresolvedObject: re({
      objectId: bn,
      version: Mt(ze(fn)),
      digest: Mt(ze(xe())),
      initialSharedVersion: Mt(ze(fn)),
    }),
  }),
  aP = Fu({ None: ye(!0), Epoch: fn }),
  lP = re({
    version: ye(2),
    sender: $a(Ya),
    expiration: $a(aP),
    gasData: tP,
    inputs: be(oP),
    commands: be(iP),
  }),
  uP = 50,
  cP = 1000n,
  fP = 5e10
async function dP(t, e, n) {
  return (
    await yP(t, e),
    await gP(t, e),
    e.onlyTransactionKind || (await hP(t, e), await pP(t, e), await mP(t, e)),
    await vP(t),
    await n()
  )
}
async function hP(t, e) {
  t.gasConfig.price ||
    (t.gasConfig.price = String(await Uu(e).getReferenceGasPrice()))
}
async function pP(t, e) {
  if (t.gasConfig.budget) return
  const n = await Uu(e).dryRunTransactionBlock({
    transactionBlock: t.build({
      overrides: { gasData: { budget: String(fP), payment: [] } },
    }),
  })
  if (n.effects.status.status !== "success")
    throw new Error(
      `Dry run failed, could not automatically determine a budget: ${n.effects.status.error}`,
      { cause: n },
    )
  const s = cP * BigInt(t.gasConfig.price || 1n),
    o = BigInt(n.effects.gasUsed.computationCost) + s,
    l =
      o +
      BigInt(n.effects.gasUsed.storageCost) -
      BigInt(n.effects.gasUsed.storageRebate)
  t.gasConfig.budget = String(l > o ? l : o)
}
async function mP(t, e) {
  if (!t.gasConfig.payment) {
    const s = (
      await Uu(e).getCoins({
        owner: t.gasConfig.owner || t.sender,
        coinType: LT,
      })
    ).data
      .filter(
        o =>
          !t.inputs.find(u => {
            var f
            return (f = u.Object) != null && f.ImmOrOwnedObject
              ? o.coinObjectId === u.Object.ImmOrOwnedObject.objectId
              : !1
          }),
      )
      .map(o => ({
        objectId: o.coinObjectId,
        digest: o.digest,
        version: o.version,
      }))
    if (!s.length)
      throw new Error("No valid gas coins found for the transaction.")
    t.gasConfig.payment = s.map(o => ct(us, o))
  }
}
async function gP(t, e) {
  const n = t.inputs.filter(h => {
      var g
      return (
        h.UnresolvedObject &&
        !(
          h.UnresolvedObject.version ||
          ((g = h.UnresolvedObject) != null && g.initialSharedVersion)
        )
      )
    }),
    s = [...new Set(n.map(h => li(h.UnresolvedObject.objectId)))],
    o = s.length ? EP(s, uP) : [],
    l = (
      await Promise.all(
        o.map(h =>
          Uu(e).multiGetObjects({ ids: h, options: { showOwner: !0 } }),
        ),
      )
    ).flat(),
    u = new Map(s.map((h, g) => [h, l[g]])),
    f = Array.from(u)
      .filter(([h, g]) => g.error)
      .map(([h, g]) => JSON.stringify(g.error))
  if (f.length)
    throw new Error(`The following input objects are invalid: ${f.join(", ")}`)
  const d = l.map(h => {
      if (h.error || !h.data)
        throw new Error(`Failed to fetch object: ${h.error}`)
      const g = h.data.owner,
        w =
          g && typeof g == "object" && "Shared" in g
            ? g.Shared.initial_shared_version
            : null
      return {
        objectId: h.data.objectId,
        digest: h.data.digest,
        version: h.data.version,
        initialSharedVersion: w,
      }
    }),
    m = new Map(s.map((h, g) => [h, d[g]]))
  for (const [h, g] of t.inputs.entries()) {
    if (!g.UnresolvedObject) continue
    let w
    const b = He(g.UnresolvedObject.objectId),
      E = m.get(b)
    ;(g.UnresolvedObject.initialSharedVersion ??
    (E == null ? void 0 : E.initialSharedVersion))
      ? (w = ui.SharedObjectRef({
          objectId: b,
          initialSharedVersion:
            g.UnresolvedObject.initialSharedVersion ||
            (E == null ? void 0 : E.initialSharedVersion),
          mutable: wP(t, h),
        }))
      : SP(t, h) &&
        (w = ui.ReceivingRef({
          objectId: b,
          digest: g.UnresolvedObject.digest ?? (E == null ? void 0 : E.digest),
          version:
            g.UnresolvedObject.version ?? (E == null ? void 0 : E.version),
        })),
      (t.inputs[t.inputs.indexOf(g)] =
        w ??
        ui.ObjectRef({
          objectId: b,
          digest: g.UnresolvedObject.digest ?? (E == null ? void 0 : E.digest),
          version:
            g.UnresolvedObject.version ?? (E == null ? void 0 : E.version),
        }))
  }
}
async function yP(t, e) {
  const { inputs: n, commands: s } = t,
    o = [],
    l = new Set()
  s.forEach(f => {
    if (f.MoveCall) {
      if (f.MoveCall._argumentTypes) return
      if (
        f.MoveCall.arguments
          .map(h => (h.$kind === "Input" ? t.inputs[h.Input] : null))
          .some(
            h =>
              (h == null ? void 0 : h.UnresolvedPure) ||
              (h == null ? void 0 : h.UnresolvedObject),
          )
      ) {
        const h = `${f.MoveCall.package}::${f.MoveCall.module}::${f.MoveCall.function}`
        l.add(h), o.push(f.MoveCall)
      }
    }
    switch (f.$kind) {
      case "SplitCoins":
        f.SplitCoins.amounts.forEach(d => {
          xS(d, Me.U64, t)
        })
        break
      case "TransferObjects":
        xS(f.TransferObjects.address, Me.Address, t)
        break
    }
  })
  const u = new Map()
  if (l.size > 0) {
    const f = Uu(e)
    await Promise.all(
      [...l].map(async d => {
        const [m, h, g] = d.split("::"),
          w = await f.getNormalizedMoveFunction({
            package: m,
            module: h,
            function: g,
          })
        u.set(
          d,
          w.parameters.map(b => _R(b)),
        )
      }),
    )
  }
  o.length &&
    (await Promise.all(
      o.map(async f => {
        const d = u.get(`${f.package}::${f.module}::${f.function}`)
        if (!d) return
        const h = d.length > 0 && CR(d.at(-1)) ? d.slice(0, d.length - 1) : d
        f._argumentTypes = h
      }),
    )),
    s.forEach(f => {
      if (!f.MoveCall) return
      const d = f.MoveCall,
        m = `${d.package}::${d.module}::${d.function}`,
        h = d._argumentTypes
      if (h) {
        if (h.length !== f.MoveCall.arguments.length)
          throw new Error(`Incorrect number of arguments for ${m}`)
        h.forEach((g, w) => {
          var A, O
          const b = d.arguments[w]
          if (b.$kind !== "Input") return
          const E = n[b.Input]
          if (!E.UnresolvedPure && !E.UnresolvedObject) return
          const S =
              ((A = E.UnresolvedPure) == null ? void 0 : A.value) ??
              ((O = E.UnresolvedObject) == null ? void 0 : O.objectId),
            C = $m(g.body)
          if (C) {
            ;(b.type = "pure"), (n[n.indexOf(E)] = ui.Pure(C.serialize(S)))
            return
          }
          if (typeof S != "string")
            throw new Error(
              `Expect the argument to be an object id string, got ${JSON.stringify(S, null, 2)}`,
            )
          b.type = "object"
          const _ = E.UnresolvedPure
            ? { $kind: "UnresolvedObject", UnresolvedObject: { objectId: S } }
            : E
          n[b.Input] = _
        })
      }
    })
}
function vP(t) {
  t.inputs.forEach((e, n) => {
    if (e.$kind !== "Object" && e.$kind !== "Pure")
      throw new Error(
        `Input at index ${n} has not been resolved.  Expected a Pure or Object input, but found ${JSON.stringify(e)}`,
      )
  })
}
function xS(t, e, n) {
  if (t.$kind !== "Input") return
  const s = n.inputs[t.Input]
  s.$kind === "UnresolvedPure" &&
    (n.inputs[t.Input] = ui.Pure(e.serialize(s.UnresolvedPure.value)))
}
function wP(t, e) {
  let n = !1
  return (
    t.getInputUses(e, (s, o) => {
      if (o.MoveCall && o.MoveCall._argumentTypes) {
        const l = o.MoveCall.arguments.indexOf(s)
        n = o.MoveCall._argumentTypes[l].ref !== "&" || n
      }
      ;(o.$kind === "MakeMoveVec" ||
        o.$kind === "MergeCoins" ||
        o.$kind === "SplitCoins") &&
        (n = !0)
    }),
    n
  )
}
function SP(t, e) {
  let n = !1
  return (
    t.getInputUses(e, (s, o) => {
      if (o.MoveCall && o.MoveCall._argumentTypes) {
        const l = o.MoveCall.arguments.indexOf(s)
        n = xP(o.MoveCall._argumentTypes[l]) || n
      }
    }),
    n
  )
}
function xP(t) {
  return typeof t.body != "object" || !("datatype" in t.body)
    ? !1
    : t.body.datatype.package === "0x2" &&
        t.body.datatype.module === "transfer" &&
        t.body.datatype.type === "Receiving"
}
function Uu(t) {
  if (!t.client)
    throw new Error(
      "No sui client passed to Transaction#build, but transaction data was not sufficient to build offline.",
    )
  return t.client
}
function EP(t, e) {
  return Array.from({ length: Math.ceil(t.length / e) }, (n, s) =>
    t.slice(s * e, s * e + e),
  )
}
function bP(t) {
  function e(n) {
    return t(n)
  }
  return (
    (e.system = () => e("0x5")),
    (e.clock = () => e("0x6")),
    (e.random = () => e("0x8")),
    (e.denyList = () => e("0x403")),
    (e.option =
      ({ type: n, value: s }) =>
      o =>
        o.moveCall({
          typeArguments: [n],
          target: `0x1::option::${s === null ? "none" : "some"}`,
          arguments: s === null ? [] : [o.object(s)],
        })),
    e
  )
}
function CP(t) {
  function e(n, s) {
    if (typeof n == "string") return t(du(n).serialize(s))
    if (n instanceof Uint8Array || Fg(n)) return t(n)
    throw new Error(
      "tx.pure must be called either a bcs type name, or a serialized bcs value",
    )
  }
  return (
    (e.u8 = n => t(Me.U8.serialize(n))),
    (e.u16 = n => t(Me.U16.serialize(n))),
    (e.u32 = n => t(Me.U32.serialize(n))),
    (e.u64 = n => t(Me.U64.serialize(n))),
    (e.u128 = n => t(Me.U128.serialize(n))),
    (e.u256 = n => t(Me.U256.serialize(n))),
    (e.bool = n => t(Me.Bool.serialize(n))),
    (e.string = n => t(Me.String.serialize(n))),
    (e.address = n => t(Me.Address.serialize(n))),
    (e.id = e.address),
    (e.vector = (n, s) => t(Me.vector(du(n)).serialize(s))),
    (e.option = (n, s) => t(Me.option(du(n)).serialize(s))),
    e
  )
}
function _P(t, e) {
  const n = Array.from(`${t}::`).map(o => o.charCodeAt(0)),
    s = new Uint8Array(n.length + e.length)
  return s.set(n), s.set(e, n.length), rd(s, { dkLen: 32 })
}
function ES(t) {
  return He(t).replace("0x", "")
}
class ur {
  constructor(e) {
    ;(this.version = 2),
      (this.sender = (e == null ? void 0 : e.sender) ?? null),
      (this.expiration = (e == null ? void 0 : e.expiration) ?? null),
      (this.inputs = (e == null ? void 0 : e.inputs) ?? []),
      (this.commands = (e == null ? void 0 : e.commands) ?? []),
      (this.gasData = (e == null ? void 0 : e.gasData) ?? {
        budget: null,
        price: null,
        owner: null,
        payment: null,
      })
  }
  static fromKindBytes(e) {
    const s = Me.TransactionKind.parse(e).ProgrammableTransaction
    if (!s) throw new Error("Unable to deserialize from bytes.")
    return ur.restore({
      version: 2,
      sender: null,
      expiration: null,
      gasData: { budget: null, owner: null, payment: null, price: null },
      inputs: s.inputs,
      commands: s.commands,
    })
  }
  static fromBytes(e) {
    const n = Me.TransactionData.parse(e),
      s = n == null ? void 0 : n.V1,
      o = s.kind.ProgrammableTransaction
    if (!s || !o) throw new Error("Unable to deserialize from bytes.")
    return ur.restore({
      version: 2,
      sender: s.sender,
      expiration: s.expiration,
      gasData: s.gasData,
      inputs: o.inputs,
      commands: o.commands,
    })
  }
  static restore(e) {
    return e.version === 2 ? new ur(ct(Pf, e)) : new ur(ct(Pf, eP(e)))
  }
  static getDigestFromBytes(e) {
    const n = _P("TransactionData", e)
    return kd(n)
  }
  get gasConfig() {
    return this.gasData
  }
  set gasConfig(e) {
    this.gasData = e
  }
  build({
    maxSizeBytes: e = 1 / 0,
    overrides: n,
    onlyTransactionKind: s,
  } = {}) {
    const o = this.inputs,
      l = this.commands,
      u = { ProgrammableTransaction: { inputs: o, commands: l } }
    if (s) return Me.TransactionKind.serialize(u, { maxSize: e }).toBytes()
    const f = (n == null ? void 0 : n.expiration) ?? this.expiration,
      d = (n == null ? void 0 : n.sender) ?? this.sender,
      m = {
        ...this.gasData,
        ...(n == null ? void 0 : n.gasConfig),
        ...(n == null ? void 0 : n.gasData),
      }
    if (!d) throw new Error("Missing transaction sender")
    if (!m.budget) throw new Error("Missing gas budget")
    if (!m.payment) throw new Error("Missing gas payment")
    if (!m.price) throw new Error("Missing gas price")
    const h = {
      sender: ES(d),
      expiration: f || { None: !0 },
      gasData: {
        payment: m.payment,
        owner: ES(this.gasData.owner ?? d),
        price: BigInt(m.price),
        budget: BigInt(m.budget),
      },
      kind: { ProgrammableTransaction: { inputs: o, commands: l } },
    }
    return Me.TransactionData.serialize({ V1: h }, { maxSize: e }).toBytes()
  }
  addInput(e, n) {
    const s = this.inputs.length
    return this.inputs.push(n), { Input: s, type: e, $kind: "Input" }
  }
  getInputUses(e, n) {
    this.mapArguments(
      (s, o) => (s.$kind === "Input" && s.Input === e && n(s, o), s),
    )
  }
  mapArguments(e) {
    for (const n of this.commands)
      switch (n.$kind) {
        case "MoveCall":
          n.MoveCall.arguments = n.MoveCall.arguments.map(o => e(o, n))
          break
        case "TransferObjects":
          ;(n.TransferObjects.objects = n.TransferObjects.objects.map(o =>
            e(o, n),
          )),
            (n.TransferObjects.address = e(n.TransferObjects.address, n))
          break
        case "SplitCoins":
          ;(n.SplitCoins.coin = e(n.SplitCoins.coin, n)),
            (n.SplitCoins.amounts = n.SplitCoins.amounts.map(o => e(o, n)))
          break
        case "MergeCoins":
          ;(n.MergeCoins.destination = e(n.MergeCoins.destination, n)),
            (n.MergeCoins.sources = n.MergeCoins.sources.map(o => e(o, n)))
          break
        case "MakeMoveVec":
          n.MakeMoveVec.elements = n.MakeMoveVec.elements.map(o => e(o, n))
          break
        case "Upgrade":
          n.Upgrade.ticket = e(n.Upgrade.ticket, n)
          break
        case "$Intent":
          const s = n.$Intent.inputs
          n.$Intent.inputs = {}
          for (const [o, l] of Object.entries(s))
            n.$Intent.inputs[o] = Array.isArray(l)
              ? l.map(u => e(u, n))
              : e(l, n)
          break
        case "Publish":
          break
        default:
          throw new Error(`Unexpected transaction kind: ${n.$kind}`)
      }
  }
  replaceCommand(e, n) {
    if (!Array.isArray(n)) {
      this.commands[e] = n
      return
    }
    const s = n.length - 1
    this.commands.splice(e, 1, ...n),
      s !== 0 &&
        this.mapArguments(o => {
          switch (o.$kind) {
            case "Result":
              o.Result > e && (o.Result += s)
              break
            case "NestedResult":
              o.NestedResult[0] > e && (o.NestedResult[0] += s)
              break
          }
          return o
        })
  }
  getDigest() {
    const e = this.build({ onlyTransactionKind: !1 })
    return ur.getDigestFromBytes(e)
  }
  snapshot() {
    return ct(Pf, this)
  }
}
function bS(t) {
  if (typeof t == "string") return He(t)
  if (t.Object)
    return t.Object.ImmOrOwnedObject
      ? He(t.Object.ImmOrOwnedObject.objectId)
      : t.Object.Receiving
        ? He(t.Object.Receiving.objectId)
        : He(t.Object.SharedObject.objectId)
  if (t.UnresolvedObject) return He(t.UnresolvedObject.objectId)
}
var gE = t => {
    throw TypeError(t)
  },
  Qg = (t, e, n) => e.has(t) || gE("Cannot " + n),
  Ne = (t, e, n) => (
    Qg(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  Gl = (t, e, n) =>
    e.has(t)
      ? gE("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  js = (t, e, n, s) => (Qg(t, e, "write to private field"), e.set(t, n), n),
  ni = (t, e, n) => (Qg(t, e, "access private method"), n),
  ru,
  pu,
  Ws,
  Le,
  Qn,
  If,
  Yg,
  Gm,
  Xg
function CS(t, e = 1 / 0) {
  const n = { $kind: "Result", Result: t },
    s = [],
    o = l => s[l] ?? (s[l] = { $kind: "NestedResult", NestedResult: [t, l] })
  return new Proxy(n, {
    set() {
      throw new Error(
        "The transaction result is a proxy, and does not support setting properties directly",
      )
    },
    get(l, u) {
      if (u in l) return Reflect.get(l, u)
      if (u === Symbol.iterator)
        return function* () {
          let d = 0
          for (; d < e; ) yield o(d), d++
        }
      if (typeof u == "symbol") return
      const f = parseInt(u, 10)
      if (!(Number.isNaN(f) || f < 0)) return o(f)
    },
  })
}
const yE = Symbol.for("@mysten/transaction")
function vE(t) {
  return !!t && typeof t == "object" && t[yE] === !0
}
const _S = { buildPlugins: new Map(), serializationPlugins: new Map() },
  om = Symbol.for("@mysten/transaction/registry")
function Kl() {
  try {
    const t = globalThis
    return t[om] || (t[om] = _S), t[om]
  } catch {
    return _S
  }
}
const kP = class Km {
  constructor() {
    Gl(this, Qn),
      Gl(this, ru),
      Gl(this, pu),
      Gl(this, Ws, new Map()),
      Gl(this, Le),
      (this.object = bP(n => {
        var l, u
        if (typeof n == "function") return this.object(n(this))
        if (typeof n == "object" && Wm(et, n)) return n
        const s = bS(n),
          o = Ne(this, Le).inputs.find(f => s === bS(f))
        return (
          (l = o == null ? void 0 : o.Object) != null &&
            l.SharedObject &&
            typeof n == "object" &&
            (u = n.Object) != null &&
            u.SharedObject &&
            (o.Object.SharedObject.mutable =
              o.Object.SharedObject.mutable || n.Object.SharedObject.mutable),
          o
            ? {
                $kind: "Input",
                Input: Ne(this, Le).inputs.indexOf(o),
                type: "object",
              }
            : Ne(this, Le).addInput(
                "object",
                typeof n == "string"
                  ? {
                      $kind: "UnresolvedObject",
                      UnresolvedObject: { objectId: He(n) },
                    }
                  : n,
              )
        )
      }))
    const e = Kl()
    js(this, Le, new ur()),
      js(this, pu, [...e.buildPlugins.values()]),
      js(this, ru, [...e.serializationPlugins.values()])
  }
  static fromKind(e) {
    const n = new Km()
    return js(n, Le, ur.fromKindBytes(typeof e == "string" ? Dn(e) : e)), n
  }
  static from(e) {
    const n = new Km()
    return (
      vE(e)
        ? js(n, Le, new ur(e.getData()))
        : typeof e != "string" || !e.startsWith("{")
          ? js(n, Le, ur.fromBytes(typeof e == "string" ? Dn(e) : e))
          : js(n, Le, ur.restore(JSON.parse(e))),
      n
    )
  }
  static registerGlobalSerializationPlugin(e, n) {
    Kl().serializationPlugins.set(e, n ?? e)
  }
  static unregisterGlobalSerializationPlugin(e) {
    Kl().serializationPlugins.delete(e)
  }
  static registerGlobalBuildPlugin(e, n) {
    Kl().buildPlugins.set(e, n ?? e)
  }
  static unregisterGlobalBuildPlugin(e) {
    Kl().buildPlugins.delete(e)
  }
  addSerializationPlugin(e) {
    Ne(this, ru).push(e)
  }
  addBuildPlugin(e) {
    Ne(this, pu).push(e)
  }
  addIntentResolver(e, n) {
    if (Ne(this, Ws).has(e) && Ne(this, Ws).get(e) !== n)
      throw new Error(`Intent resolver for ${e} already exists`)
    Ne(this, Ws).set(e, n)
  }
  setSender(e) {
    Ne(this, Le).sender = e
  }
  setSenderIfNotSet(e) {
    Ne(this, Le).sender || (Ne(this, Le).sender = e)
  }
  setExpiration(e) {
    Ne(this, Le).expiration = e ? ct(pE, e) : null
  }
  setGasPrice(e) {
    Ne(this, Le).gasConfig.price = String(e)
  }
  setGasBudget(e) {
    Ne(this, Le).gasConfig.budget = String(e)
  }
  setGasBudgetIfNotSet(e) {
    Ne(this, Le).gasData.budget == null &&
      (Ne(this, Le).gasConfig.budget = String(e))
  }
  setGasOwner(e) {
    Ne(this, Le).gasConfig.owner = e
  }
  setGasPayment(e) {
    Ne(this, Le).gasConfig.payment = e.map(n => ct(us, n))
  }
  get blockData() {
    return SS(Ne(this, Le).snapshot())
  }
  getData() {
    return Ne(this, Le).snapshot()
  }
  get [yE]() {
    return !0
  }
  get pure() {
    return (
      Object.defineProperty(this, "pure", {
        enumerable: !1,
        value: CP(e =>
          Fg(e)
            ? Ne(this, Le).addInput("pure", {
                $kind: "Pure",
                Pure: { bytes: e.toBase64() },
              })
            : Ne(this, Le).addInput(
                "pure",
                Wm(yS, e)
                  ? ct(yS, e)
                  : e instanceof Uint8Array
                    ? ui.Pure(e)
                    : { $kind: "UnresolvedPure", UnresolvedPure: { value: e } },
              ),
        ),
      }),
      this.pure
    )
  }
  get gas() {
    return { $kind: "GasCoin", GasCoin: !0 }
  }
  objectRef(...e) {
    return this.object(ui.ObjectRef(...e))
  }
  receivingRef(...e) {
    return this.object(ui.ReceivingRef(...e))
  }
  sharedObjectRef(...e) {
    return this.object(ui.SharedObjectRef(...e))
  }
  add(e) {
    if (typeof e == "function") return e(this)
    const n = Ne(this, Le).commands.push(e)
    return CS(n - 1)
  }
  splitCoins(e, n) {
    const s = Ns.SplitCoins(
        typeof e == "string" ? this.object(e) : ni(this, Qn, Yg).call(this, e),
        n.map(l =>
          typeof l == "number" || typeof l == "bigint" || typeof l == "string"
            ? this.pure.u64(l)
            : ni(this, Qn, If).call(this, l),
        ),
      ),
      o = Ne(this, Le).commands.push(s)
    return CS(o - 1, n.length)
  }
  mergeCoins(e, n) {
    return this.add(
      Ns.MergeCoins(
        this.object(e),
        n.map(s => this.object(s)),
      ),
    )
  }
  publish({ modules: e, dependencies: n }) {
    return this.add(Ns.Publish({ modules: e, dependencies: n }))
  }
  upgrade({ modules: e, dependencies: n, package: s, ticket: o }) {
    return this.add(
      Ns.Upgrade({
        modules: e,
        dependencies: n,
        package: s,
        ticket: this.object(o),
      }),
    )
  }
  moveCall({ arguments: e, ...n }) {
    return this.add(
      Ns.MoveCall({
        ...n,
        arguments:
          e == null ? void 0 : e.map(s => ni(this, Qn, If).call(this, s)),
      }),
    )
  }
  transferObjects(e, n) {
    return this.add(
      Ns.TransferObjects(
        e.map(s => this.object(s)),
        typeof n == "string"
          ? this.pure.address(n)
          : ni(this, Qn, If).call(this, n),
      ),
    )
  }
  makeMoveVec({ type: e, elements: n }) {
    return this.add(
      Ns.MakeMoveVec({ type: e, elements: n.map(s => this.object(s)) }),
    )
  }
  serialize() {
    return JSON.stringify(SS(Ne(this, Le).snapshot()))
  }
  async toJSON(e = {}) {
    return (
      await this.prepareForSerialization(e),
      JSON.stringify(
        ct(lP, Ne(this, Le).snapshot()),
        (n, s) => (typeof s == "bigint" ? s.toString() : s),
        2,
      )
    )
  }
  async sign(e) {
    const { signer: n, ...s } = e,
      o = await this.build(s)
    return n.signTransaction(o)
  }
  async build(e = {}) {
    return (
      await this.prepareForSerialization(e),
      await ni(this, Qn, Gm).call(this, e),
      Ne(this, Le).build({ onlyTransactionKind: e.onlyTransactionKind })
    )
  }
  async getDigest(e = {}) {
    return await ni(this, Qn, Gm).call(this, e), Ne(this, Le).getDigest()
  }
  async prepareForSerialization(e) {
    var o
    const n = new Set()
    for (const l of Ne(this, Le).commands) l.$Intent && n.add(l.$Intent.name)
    const s = [...Ne(this, ru)]
    for (const l of n)
      if (!((o = e.supportedIntents) != null && o.includes(l))) {
        if (!Ne(this, Ws).has(l))
          throw new Error(`Missing intent resolver for ${l}`)
        s.push(Ne(this, Ws).get(l))
      }
    await ni(this, Qn, Xg).call(this, s, e)
  }
}
ru = new WeakMap()
pu = new WeakMap()
Ws = new WeakMap()
Le = new WeakMap()
Qn = new WeakSet()
If = function (t) {
  return Fg(t) ? this.pure(t) : ni(this, Qn, Yg).call(this, t)
}
Yg = function (t) {
  return typeof t == "function" ? ct(et, t(this)) : ct(et, t)
}
Gm = async function (t) {
  if (!t.onlyTransactionKind && !Ne(this, Le).sender)
    throw new Error("Missing transaction sender")
  await ni(this, Qn, Xg).call(this, [...Ne(this, pu), dP], t)
}
Xg = async function (t, e) {
  const n = s => {
    if (s >= t.length) return () => {}
    const o = t[s]
    return async () => {
      const l = n(s + 1)
      let u = !1,
        f = !1
      if (
        (await o(Ne(this, Le), e, async () => {
          if (u)
            throw new Error(
              `next() was call multiple times in TransactionPlugin ${s}`,
            )
          ;(u = !0), await l(), (f = !0)
        }),
        !u)
      )
        throw new Error(`next() was not called in TransactionPlugin ${s}`)
      if (!f)
        throw new Error(`next() was not awaited in TransactionPlugin ${s}`)
    }
  }
  await n(0)()
}
let Wa = kP
async function OP(t, e) {
  if (t.features["sui:signTransaction"])
    return t.features["sui:signTransaction"].signTransaction(e)
  if (!t.features["sui:signTransactionBlock"])
    throw new Error(
      `Provided wallet (${t.name}) does not support the signTransaction feature.`,
    )
  const { signTransactionBlock: n } = t.features["sui:signTransactionBlock"],
    s = Wa.from(await e.transaction.toJSON()),
    { transactionBlockBytes: o, signature: l } = await n({
      transactionBlock: s,
      account: e.account,
      chain: e.chain,
    })
  return { bytes: o, signature: l }
}
const AP = ["standard:connect", "standard:events"]
function TP(t, e = []) {
  return [...AP, ...e].every(n => n in t.features)
}
const RP = "sui:devnet",
  PP = "sui:testnet",
  IP = "sui:localnet",
  Zg = "sui:mainnet",
  MP = [RP, PP, IP, Zg]
function NP(t, e) {
  if (typeof t != "object" || !t) return t
  var n = t[Symbol.toPrimitive]
  if (n !== void 0) {
    var s = n.call(t, e)
    if (typeof s != "object") return s
    throw new TypeError("@@toPrimitive must return a primitive value.")
  }
  return (e === "string" ? String : Number)(t)
}
function jP(t) {
  var e = NP(t, "string")
  return typeof e == "symbol" ? e : String(e)
}
function DP(t, e, n) {
  return (
    (e = jP(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = n),
    t
  )
}
function kS(t, e) {
  var n = Object.keys(t)
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t)
    e &&
      (s = s.filter(function (o) {
        return Object.getOwnPropertyDescriptor(t, o).enumerable
      })),
      n.push.apply(n, s)
  }
  return n
}
function OS(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {}
    e % 2
      ? kS(Object(n), !0).forEach(function (s) {
          DP(t, s, n[s])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
        : kS(Object(n)).forEach(function (s) {
            Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(n, s))
          })
  }
  return t
}
function AS(t, e) {
  var n = {}
  for (var s in t) n[s] = e(t[s], s)
  return n
}
var LP = (t, e, n) => {
    for (var s of Object.keys(t)) {
      var o
      if (t[s] !== ((o = e[s]) !== null && o !== void 0 ? o : n[s])) return !1
    }
    return !0
  },
  Jg = t => {
    var e = n => {
      var s = t.defaultClassName,
        o = OS(OS({}, t.defaultVariants), n)
      for (var l in o) {
        var u,
          f = (u = o[l]) !== null && u !== void 0 ? u : t.defaultVariants[l]
        if (f != null) {
          var d = f
          typeof d == "boolean" && (d = d === !0 ? "true" : "false")
          var m = t.variantClassNames[l][d]
          m && (s += " " + m)
        }
      }
      for (var [h, g] of t.compoundVariants)
        LP(h, o, t.defaultVariants) && (s += " " + g)
      return s
    }
    return (
      (e.variants = () => Object.keys(t.variantClassNames)),
      (e.classNames = {
        get base() {
          return t.defaultClassName.split(" ")[0]
        },
        get variants() {
          return AS(t.variantClassNames, n => AS(n, s => s.split(" ")[0]))
        },
      }),
      e
    )
  }
function wE(t) {
  const e = t + "CollectionProvider",
    [n, s] = vo(e),
    [o, l] = n(e, { collectionRef: { current: null }, itemMap: new Map() }),
    u = b => {
      const { scope: E, children: S } = b,
        C = Cr.useRef(null),
        _ = Cr.useRef(new Map()).current
      return T.jsx(o, { scope: E, itemMap: _, collectionRef: C, children: S })
    }
  u.displayName = e
  const f = t + "CollectionSlot",
    d = Cr.forwardRef((b, E) => {
      const { scope: S, children: C } = b,
        _ = l(f, S),
        A = Ct(E, _.collectionRef)
      return T.jsx(Bn, { ref: A, children: C })
    })
  d.displayName = f
  const m = t + "CollectionItemSlot",
    h = "data-radix-collection-item",
    g = Cr.forwardRef((b, E) => {
      const { scope: S, children: C, ..._ } = b,
        A = Cr.useRef(null),
        O = Ct(E, A),
        M = l(m, S)
      return (
        Cr.useEffect(
          () => (
            M.itemMap.set(A, { ref: A, ..._ }), () => void M.itemMap.delete(A)
          ),
        ),
        T.jsx(Bn, { [h]: "", ref: O, children: C })
      )
    })
  g.displayName = m
  function w(b) {
    const E = l(t + "CollectionConsumer", b)
    return Cr.useCallback(() => {
      const C = E.collectionRef.current
      if (!C) return []
      const _ = Array.from(C.querySelectorAll(`[${h}]`))
      return Array.from(E.itemMap.values()).sort(
        (M, D) => _.indexOf(M.ref.current) - _.indexOf(D.ref.current),
      )
    }, [E.collectionRef, E.itemMap])
  }
  return [{ Provider: u, Slot: d, ItemSlot: g }, w, s]
}
var SE = v.createContext(void 0),
  BP = t => {
    const { dir: e, children: n } = t
    return T.jsx(SE.Provider, { value: e, children: n })
  }
function xE(t) {
  const e = v.useContext(SE)
  return t || e || "ltr"
}
var FP = BP
const UP = ["top", "right", "bottom", "left"],
  cs = Math.min,
  En = Math.max,
  id = Math.round,
  df = Math.floor,
  Mr = t => ({ x: t, y: t }),
  zP = { left: "right", right: "left", bottom: "top", top: "bottom" },
  $P = { start: "end", end: "start" }
function qm(t, e, n) {
  return En(t, cs(e, n))
}
function mi(t, e) {
  return typeof t == "function" ? t(e) : t
}
function gi(t) {
  return t.split("-")[0]
}
function Xa(t) {
  return t.split("-")[1]
}
function ey(t) {
  return t === "x" ? "y" : "x"
}
function ty(t) {
  return t === "y" ? "height" : "width"
}
function fs(t) {
  return ["top", "bottom"].includes(gi(t)) ? "y" : "x"
}
function ny(t) {
  return ey(fs(t))
}
function WP(t, e, n) {
  n === void 0 && (n = !1)
  const s = Xa(t),
    o = ny(t),
    l = ty(o)
  let u =
    o === "x"
      ? s === (n ? "end" : "start")
        ? "right"
        : "left"
      : s === "start"
        ? "bottom"
        : "top"
  return e.reference[l] > e.floating[l] && (u = sd(u)), [u, sd(u)]
}
function VP(t) {
  const e = sd(t)
  return [Qm(t), e, Qm(e)]
}
function Qm(t) {
  return t.replace(/start|end/g, e => $P[e])
}
function HP(t, e, n) {
  const s = ["left", "right"],
    o = ["right", "left"],
    l = ["top", "bottom"],
    u = ["bottom", "top"]
  switch (t) {
    case "top":
    case "bottom":
      return n ? (e ? o : s) : e ? s : o
    case "left":
    case "right":
      return e ? l : u
    default:
      return []
  }
}
function GP(t, e, n, s) {
  const o = Xa(t)
  let l = HP(gi(t), n === "start", s)
  return o && ((l = l.map(u => u + "-" + o)), e && (l = l.concat(l.map(Qm)))), l
}
function sd(t) {
  return t.replace(/left|right|bottom|top/g, e => zP[e])
}
function KP(t) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...t }
}
function EE(t) {
  return typeof t != "number" ? KP(t) : { top: t, right: t, bottom: t, left: t }
}
function od(t) {
  const { x: e, y: n, width: s, height: o } = t
  return {
    width: s,
    height: o,
    top: n,
    left: e,
    right: e + s,
    bottom: n + o,
    x: e,
    y: n,
  }
}
function TS(t, e, n) {
  let { reference: s, floating: o } = t
  const l = fs(e),
    u = ny(e),
    f = ty(u),
    d = gi(e),
    m = l === "y",
    h = s.x + s.width / 2 - o.width / 2,
    g = s.y + s.height / 2 - o.height / 2,
    w = s[f] / 2 - o[f] / 2
  let b
  switch (d) {
    case "top":
      b = { x: h, y: s.y - o.height }
      break
    case "bottom":
      b = { x: h, y: s.y + s.height }
      break
    case "right":
      b = { x: s.x + s.width, y: g }
      break
    case "left":
      b = { x: s.x - o.width, y: g }
      break
    default:
      b = { x: s.x, y: s.y }
  }
  switch (Xa(e)) {
    case "start":
      b[u] -= w * (n && m ? -1 : 1)
      break
    case "end":
      b[u] += w * (n && m ? -1 : 1)
      break
  }
  return b
}
const qP = async (t, e, n) => {
  const {
      placement: s = "bottom",
      strategy: o = "absolute",
      middleware: l = [],
      platform: u,
    } = n,
    f = l.filter(Boolean),
    d = await (u.isRTL == null ? void 0 : u.isRTL(e))
  let m = await u.getElementRects({ reference: t, floating: e, strategy: o }),
    { x: h, y: g } = TS(m, s, d),
    w = s,
    b = {},
    E = 0
  for (let S = 0; S < f.length; S++) {
    const { name: C, fn: _ } = f[S],
      {
        x: A,
        y: O,
        data: M,
        reset: D,
      } = await _({
        x: h,
        y: g,
        initialPlacement: s,
        placement: w,
        strategy: o,
        middlewareData: b,
        rects: m,
        platform: u,
        elements: { reference: t, floating: e },
      })
    ;(h = A ?? h),
      (g = O ?? g),
      (b = { ...b, [C]: { ...b[C], ...M } }),
      D &&
        E <= 50 &&
        (E++,
        typeof D == "object" &&
          (D.placement && (w = D.placement),
          D.rects &&
            (m =
              D.rects === !0
                ? await u.getElementRects({
                    reference: t,
                    floating: e,
                    strategy: o,
                  })
                : D.rects),
          ({ x: h, y: g } = TS(m, w, d))),
        (S = -1))
  }
  return { x: h, y: g, placement: w, strategy: o, middlewareData: b }
}
async function bu(t, e) {
  var n
  e === void 0 && (e = {})
  const { x: s, y: o, platform: l, rects: u, elements: f, strategy: d } = t,
    {
      boundary: m = "clippingAncestors",
      rootBoundary: h = "viewport",
      elementContext: g = "floating",
      altBoundary: w = !1,
      padding: b = 0,
    } = mi(e, t),
    E = EE(b),
    C = f[w ? (g === "floating" ? "reference" : "floating") : g],
    _ = od(
      await l.getClippingRect({
        element:
          (n = await (l.isElement == null ? void 0 : l.isElement(C))) == null ||
          n
            ? C
            : C.contextElement ||
              (await (l.getDocumentElement == null
                ? void 0
                : l.getDocumentElement(f.floating))),
        boundary: m,
        rootBoundary: h,
        strategy: d,
      }),
    ),
    A =
      g === "floating"
        ? { x: s, y: o, width: u.floating.width, height: u.floating.height }
        : u.reference,
    O = await (l.getOffsetParent == null
      ? void 0
      : l.getOffsetParent(f.floating)),
    M = (await (l.isElement == null ? void 0 : l.isElement(O)))
      ? (await (l.getScale == null ? void 0 : l.getScale(O))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    D = od(
      l.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await l.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: f,
            rect: A,
            offsetParent: O,
            strategy: d,
          })
        : A,
    )
  return {
    top: (_.top - D.top + E.top) / M.y,
    bottom: (D.bottom - _.bottom + E.bottom) / M.y,
    left: (_.left - D.left + E.left) / M.x,
    right: (D.right - _.right + E.right) / M.x,
  }
}
const QP = t => ({
    name: "arrow",
    options: t,
    async fn(e) {
      const {
          x: n,
          y: s,
          placement: o,
          rects: l,
          platform: u,
          elements: f,
          middlewareData: d,
        } = e,
        { element: m, padding: h = 0 } = mi(t, e) || {}
      if (m == null) return {}
      const g = EE(h),
        w = { x: n, y: s },
        b = ny(o),
        E = ty(b),
        S = await u.getDimensions(m),
        C = b === "y",
        _ = C ? "top" : "left",
        A = C ? "bottom" : "right",
        O = C ? "clientHeight" : "clientWidth",
        M = l.reference[E] + l.reference[b] - w[b] - l.floating[E],
        D = w[b] - l.reference[b],
        K = await (u.getOffsetParent == null ? void 0 : u.getOffsetParent(m))
      let W = K ? K[O] : 0
      ;(!W || !(await (u.isElement == null ? void 0 : u.isElement(K)))) &&
        (W = f.floating[O] || l.floating[E])
      const q = M / 2 - D / 2,
        Z = W / 2 - S[E] / 2 - 1,
        le = cs(g[_], Z),
        Ce = cs(g[A], Z),
        Ae = le,
        Te = W - S[E] - Ce,
        Pe = W / 2 - S[E] / 2 + q,
        Ue = qm(Ae, Pe, Te),
        te =
          !d.arrow &&
          Xa(o) != null &&
          Pe !== Ue &&
          l.reference[E] / 2 - (Pe < Ae ? le : Ce) - S[E] / 2 < 0,
        H = te ? (Pe < Ae ? Pe - Ae : Pe - Te) : 0
      return {
        [b]: w[b] + H,
        data: {
          [b]: Ue,
          centerOffset: Pe - Ue - H,
          ...(te && { alignmentOffset: H }),
        },
        reset: te,
      }
    },
  }),
  YP = function (t) {
    return (
      t === void 0 && (t = {}),
      {
        name: "flip",
        options: t,
        async fn(e) {
          var n, s
          const {
              placement: o,
              middlewareData: l,
              rects: u,
              initialPlacement: f,
              platform: d,
              elements: m,
            } = e,
            {
              mainAxis: h = !0,
              crossAxis: g = !0,
              fallbackPlacements: w,
              fallbackStrategy: b = "bestFit",
              fallbackAxisSideDirection: E = "none",
              flipAlignment: S = !0,
              ...C
            } = mi(t, e)
          if ((n = l.arrow) != null && n.alignmentOffset) return {}
          const _ = gi(o),
            A = fs(f),
            O = gi(f) === f,
            M = await (d.isRTL == null ? void 0 : d.isRTL(m.floating)),
            D = w || (O || !S ? [sd(f)] : VP(f)),
            K = E !== "none"
          !w && K && D.push(...GP(f, S, E, M))
          const W = [f, ...D],
            q = await bu(e, C),
            Z = []
          let le = ((s = l.flip) == null ? void 0 : s.overflows) || []
          if ((h && Z.push(q[_]), g)) {
            const Pe = WP(o, u, M)
            Z.push(q[Pe[0]], q[Pe[1]])
          }
          if (
            ((le = [...le, { placement: o, overflows: Z }]),
            !Z.every(Pe => Pe <= 0))
          ) {
            var Ce, Ae
            const Pe = (((Ce = l.flip) == null ? void 0 : Ce.index) || 0) + 1,
              Ue = W[Pe]
            if (Ue)
              return {
                data: { index: Pe, overflows: le },
                reset: { placement: Ue },
              }
            let te =
              (Ae = le
                .filter(H => H.overflows[0] <= 0)
                .sort((H, B) => H.overflows[1] - B.overflows[1])[0]) == null
                ? void 0
                : Ae.placement
            if (!te)
              switch (b) {
                case "bestFit": {
                  var Te
                  const H =
                    (Te = le
                      .filter(B => {
                        if (K) {
                          const U = fs(B.placement)
                          return U === A || U === "y"
                        }
                        return !0
                      })
                      .map(B => [
                        B.placement,
                        B.overflows
                          .filter(U => U > 0)
                          .reduce((U, V) => U + V, 0),
                      ])
                      .sort((B, U) => B[1] - U[1])[0]) == null
                      ? void 0
                      : Te[0]
                  H && (te = H)
                  break
                }
                case "initialPlacement":
                  te = f
                  break
              }
            if (o !== te) return { reset: { placement: te } }
          }
          return {}
        },
      }
    )
  }
function RS(t, e) {
  return {
    top: t.top - e.height,
    right: t.right - e.width,
    bottom: t.bottom - e.height,
    left: t.left - e.width,
  }
}
function PS(t) {
  return UP.some(e => t[e] >= 0)
}
const XP = function (t) {
  return (
    t === void 0 && (t = {}),
    {
      name: "hide",
      options: t,
      async fn(e) {
        const { rects: n } = e,
          { strategy: s = "referenceHidden", ...o } = mi(t, e)
        switch (s) {
          case "referenceHidden": {
            const l = await bu(e, { ...o, elementContext: "reference" }),
              u = RS(l, n.reference)
            return {
              data: { referenceHiddenOffsets: u, referenceHidden: PS(u) },
            }
          }
          case "escaped": {
            const l = await bu(e, { ...o, altBoundary: !0 }),
              u = RS(l, n.floating)
            return { data: { escapedOffsets: u, escaped: PS(u) } }
          }
          default:
            return {}
        }
      },
    }
  )
}
async function ZP(t, e) {
  const { placement: n, platform: s, elements: o } = t,
    l = await (s.isRTL == null ? void 0 : s.isRTL(o.floating)),
    u = gi(n),
    f = Xa(n),
    d = fs(n) === "y",
    m = ["left", "top"].includes(u) ? -1 : 1,
    h = l && d ? -1 : 1,
    g = mi(e, t)
  let {
    mainAxis: w,
    crossAxis: b,
    alignmentAxis: E,
  } = typeof g == "number"
    ? { mainAxis: g, crossAxis: 0, alignmentAxis: null }
    : {
        mainAxis: g.mainAxis || 0,
        crossAxis: g.crossAxis || 0,
        alignmentAxis: g.alignmentAxis,
      }
  return (
    f && typeof E == "number" && (b = f === "end" ? E * -1 : E),
    d ? { x: b * h, y: w * m } : { x: w * m, y: b * h }
  )
}
const JP = function (t) {
    return (
      t === void 0 && (t = 0),
      {
        name: "offset",
        options: t,
        async fn(e) {
          var n, s
          const { x: o, y: l, placement: u, middlewareData: f } = e,
            d = await ZP(e, t)
          return u === ((n = f.offset) == null ? void 0 : n.placement) &&
            (s = f.arrow) != null &&
            s.alignmentOffset
            ? {}
            : { x: o + d.x, y: l + d.y, data: { ...d, placement: u } }
        },
      }
    )
  },
  eI = function (t) {
    return (
      t === void 0 && (t = {}),
      {
        name: "shift",
        options: t,
        async fn(e) {
          const { x: n, y: s, placement: o } = e,
            {
              mainAxis: l = !0,
              crossAxis: u = !1,
              limiter: f = {
                fn: C => {
                  let { x: _, y: A } = C
                  return { x: _, y: A }
                },
              },
              ...d
            } = mi(t, e),
            m = { x: n, y: s },
            h = await bu(e, d),
            g = fs(gi(o)),
            w = ey(g)
          let b = m[w],
            E = m[g]
          if (l) {
            const C = w === "y" ? "top" : "left",
              _ = w === "y" ? "bottom" : "right",
              A = b + h[C],
              O = b - h[_]
            b = qm(A, b, O)
          }
          if (u) {
            const C = g === "y" ? "top" : "left",
              _ = g === "y" ? "bottom" : "right",
              A = E + h[C],
              O = E - h[_]
            E = qm(A, E, O)
          }
          const S = f.fn({ ...e, [w]: b, [g]: E })
          return {
            ...S,
            data: { x: S.x - n, y: S.y - s, enabled: { [w]: l, [g]: u } },
          }
        },
      }
    )
  },
  tI = function (t) {
    return (
      t === void 0 && (t = {}),
      {
        options: t,
        fn(e) {
          const { x: n, y: s, placement: o, rects: l, middlewareData: u } = e,
            { offset: f = 0, mainAxis: d = !0, crossAxis: m = !0 } = mi(t, e),
            h = { x: n, y: s },
            g = fs(o),
            w = ey(g)
          let b = h[w],
            E = h[g]
          const S = mi(f, e),
            C =
              typeof S == "number"
                ? { mainAxis: S, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...S }
          if (d) {
            const O = w === "y" ? "height" : "width",
              M = l.reference[w] - l.floating[O] + C.mainAxis,
              D = l.reference[w] + l.reference[O] - C.mainAxis
            b < M ? (b = M) : b > D && (b = D)
          }
          if (m) {
            var _, A
            const O = w === "y" ? "width" : "height",
              M = ["top", "left"].includes(gi(o)),
              D =
                l.reference[g] -
                l.floating[O] +
                ((M && ((_ = u.offset) == null ? void 0 : _[g])) || 0) +
                (M ? 0 : C.crossAxis),
              K =
                l.reference[g] +
                l.reference[O] +
                (M ? 0 : ((A = u.offset) == null ? void 0 : A[g]) || 0) -
                (M ? C.crossAxis : 0)
            E < D ? (E = D) : E > K && (E = K)
          }
          return { [w]: b, [g]: E }
        },
      }
    )
  },
  nI = function (t) {
    return (
      t === void 0 && (t = {}),
      {
        name: "size",
        options: t,
        async fn(e) {
          var n, s
          const { placement: o, rects: l, platform: u, elements: f } = e,
            { apply: d = () => {}, ...m } = mi(t, e),
            h = await bu(e, m),
            g = gi(o),
            w = Xa(o),
            b = fs(o) === "y",
            { width: E, height: S } = l.floating
          let C, _
          g === "top" || g === "bottom"
            ? ((C = g),
              (_ =
                w ===
                ((await (u.isRTL == null ? void 0 : u.isRTL(f.floating)))
                  ? "start"
                  : "end")
                  ? "left"
                  : "right"))
            : ((_ = g), (C = w === "end" ? "top" : "bottom"))
          const A = S - h.top - h.bottom,
            O = E - h.left - h.right,
            M = cs(S - h[C], A),
            D = cs(E - h[_], O),
            K = !e.middlewareData.shift
          let W = M,
            q = D
          if (
            ((n = e.middlewareData.shift) != null && n.enabled.x && (q = O),
            (s = e.middlewareData.shift) != null && s.enabled.y && (W = A),
            K && !w)
          ) {
            const le = En(h.left, 0),
              Ce = En(h.right, 0),
              Ae = En(h.top, 0),
              Te = En(h.bottom, 0)
            b
              ? (q =
                  E -
                  2 * (le !== 0 || Ce !== 0 ? le + Ce : En(h.left, h.right)))
              : (W =
                  S -
                  2 * (Ae !== 0 || Te !== 0 ? Ae + Te : En(h.top, h.bottom)))
          }
          await d({ ...e, availableWidth: q, availableHeight: W })
          const Z = await u.getDimensions(f.floating)
          return E !== Z.width || S !== Z.height ? { reset: { rects: !0 } } : {}
        },
      }
    )
  }
function Id() {
  return typeof window < "u"
}
function Za(t) {
  return bE(t) ? (t.nodeName || "").toLowerCase() : "#document"
}
function Cn(t) {
  var e
  return (
    (t == null || (e = t.ownerDocument) == null ? void 0 : e.defaultView) ||
    window
  )
}
function Dr(t) {
  var e
  return (e = (bE(t) ? t.ownerDocument : t.document) || window.document) == null
    ? void 0
    : e.documentElement
}
function bE(t) {
  return Id() ? t instanceof Node || t instanceof Cn(t).Node : !1
}
function dr(t) {
  return Id() ? t instanceof Element || t instanceof Cn(t).Element : !1
}
function Nr(t) {
  return Id() ? t instanceof HTMLElement || t instanceof Cn(t).HTMLElement : !1
}
function IS(t) {
  return !Id() || typeof ShadowRoot > "u"
    ? !1
    : t instanceof ShadowRoot || t instanceof Cn(t).ShadowRoot
}
function zu(t) {
  const { overflow: e, overflowX: n, overflowY: s, display: o } = hr(t)
  return (
    /auto|scroll|overlay|hidden|clip/.test(e + s + n) &&
    !["inline", "contents"].includes(o)
  )
}
function rI(t) {
  return ["table", "td", "th"].includes(Za(t))
}
function Md(t) {
  return [":popover-open", ":modal"].some(e => {
    try {
      return t.matches(e)
    } catch {
      return !1
    }
  })
}
function ry(t) {
  const e = iy(),
    n = dr(t) ? hr(t) : t
  return (
    ["transform", "translate", "scale", "rotate", "perspective"].some(s =>
      n[s] ? n[s] !== "none" : !1,
    ) ||
    (n.containerType ? n.containerType !== "normal" : !1) ||
    (!e && (n.backdropFilter ? n.backdropFilter !== "none" : !1)) ||
    (!e && (n.filter ? n.filter !== "none" : !1)) ||
    ["transform", "translate", "scale", "rotate", "perspective", "filter"].some(
      s => (n.willChange || "").includes(s),
    ) ||
    ["paint", "layout", "strict", "content"].some(s =>
      (n.contain || "").includes(s),
    )
  )
}
function iI(t) {
  let e = ds(t)
  for (; Nr(e) && !Va(e); ) {
    if (ry(e)) return e
    if (Md(e)) return null
    e = ds(e)
  }
  return null
}
function iy() {
  return typeof CSS > "u" || !CSS.supports
    ? !1
    : CSS.supports("-webkit-backdrop-filter", "none")
}
function Va(t) {
  return ["html", "body", "#document"].includes(Za(t))
}
function hr(t) {
  return Cn(t).getComputedStyle(t)
}
function Nd(t) {
  return dr(t)
    ? { scrollLeft: t.scrollLeft, scrollTop: t.scrollTop }
    : { scrollLeft: t.scrollX, scrollTop: t.scrollY }
}
function ds(t) {
  if (Za(t) === "html") return t
  const e = t.assignedSlot || t.parentNode || (IS(t) && t.host) || Dr(t)
  return IS(e) ? e.host : e
}
function CE(t) {
  const e = ds(t)
  return Va(e)
    ? t.ownerDocument
      ? t.ownerDocument.body
      : t.body
    : Nr(e) && zu(e)
      ? e
      : CE(e)
}
function Cu(t, e, n) {
  var s
  e === void 0 && (e = []), n === void 0 && (n = !0)
  const o = CE(t),
    l = o === ((s = t.ownerDocument) == null ? void 0 : s.body),
    u = Cn(o)
  if (l) {
    const f = Ym(u)
    return e.concat(
      u,
      u.visualViewport || [],
      zu(o) ? o : [],
      f && n ? Cu(f) : [],
    )
  }
  return e.concat(o, Cu(o, [], n))
}
function Ym(t) {
  return t.parent && Object.getPrototypeOf(t.parent) ? t.frameElement : null
}
function _E(t) {
  const e = hr(t)
  let n = parseFloat(e.width) || 0,
    s = parseFloat(e.height) || 0
  const o = Nr(t),
    l = o ? t.offsetWidth : n,
    u = o ? t.offsetHeight : s,
    f = id(n) !== l || id(s) !== u
  return f && ((n = l), (s = u)), { width: n, height: s, $: f }
}
function sy(t) {
  return dr(t) ? t : t.contextElement
}
function va(t) {
  const e = sy(t)
  if (!Nr(e)) return Mr(1)
  const n = e.getBoundingClientRect(),
    { width: s, height: o, $: l } = _E(e)
  let u = (l ? id(n.width) : n.width) / s,
    f = (l ? id(n.height) : n.height) / o
  return (
    (!u || !Number.isFinite(u)) && (u = 1),
    (!f || !Number.isFinite(f)) && (f = 1),
    { x: u, y: f }
  )
}
const sI = Mr(0)
function kE(t) {
  const e = Cn(t)
  return !iy() || !e.visualViewport
    ? sI
    : { x: e.visualViewport.offsetLeft, y: e.visualViewport.offsetTop }
}
function oI(t, e, n) {
  return e === void 0 && (e = !1), !n || (e && n !== Cn(t)) ? !1 : e
}
function go(t, e, n, s) {
  e === void 0 && (e = !1), n === void 0 && (n = !1)
  const o = t.getBoundingClientRect(),
    l = sy(t)
  let u = Mr(1)
  e && (s ? dr(s) && (u = va(s)) : (u = va(t)))
  const f = oI(l, n, s) ? kE(l) : Mr(0)
  let d = (o.left + f.x) / u.x,
    m = (o.top + f.y) / u.y,
    h = o.width / u.x,
    g = o.height / u.y
  if (l) {
    const w = Cn(l),
      b = s && dr(s) ? Cn(s) : s
    let E = w,
      S = Ym(E)
    for (; S && s && b !== E; ) {
      const C = va(S),
        _ = S.getBoundingClientRect(),
        A = hr(S),
        O = _.left + (S.clientLeft + parseFloat(A.paddingLeft)) * C.x,
        M = _.top + (S.clientTop + parseFloat(A.paddingTop)) * C.y
      ;(d *= C.x),
        (m *= C.y),
        (h *= C.x),
        (g *= C.y),
        (d += O),
        (m += M),
        (E = Cn(S)),
        (S = Ym(E))
    }
  }
  return od({ width: h, height: g, x: d, y: m })
}
function oy(t, e) {
  const n = Nd(t).scrollLeft
  return e ? e.left + n : go(Dr(t)).left + n
}
function OE(t, e, n) {
  n === void 0 && (n = !1)
  const s = t.getBoundingClientRect(),
    o = s.left + e.scrollLeft - (n ? 0 : oy(t, s)),
    l = s.top + e.scrollTop
  return { x: o, y: l }
}
function aI(t) {
  let { elements: e, rect: n, offsetParent: s, strategy: o } = t
  const l = o === "fixed",
    u = Dr(s),
    f = e ? Md(e.floating) : !1
  if (s === u || (f && l)) return n
  let d = { scrollLeft: 0, scrollTop: 0 },
    m = Mr(1)
  const h = Mr(0),
    g = Nr(s)
  if (
    (g || (!g && !l)) &&
    ((Za(s) !== "body" || zu(u)) && (d = Nd(s)), Nr(s))
  ) {
    const b = go(s)
    ;(m = va(s)), (h.x = b.x + s.clientLeft), (h.y = b.y + s.clientTop)
  }
  const w = u && !g && !l ? OE(u, d, !0) : Mr(0)
  return {
    width: n.width * m.x,
    height: n.height * m.y,
    x: n.x * m.x - d.scrollLeft * m.x + h.x + w.x,
    y: n.y * m.y - d.scrollTop * m.y + h.y + w.y,
  }
}
function lI(t) {
  return Array.from(t.getClientRects())
}
function uI(t) {
  const e = Dr(t),
    n = Nd(t),
    s = t.ownerDocument.body,
    o = En(e.scrollWidth, e.clientWidth, s.scrollWidth, s.clientWidth),
    l = En(e.scrollHeight, e.clientHeight, s.scrollHeight, s.clientHeight)
  let u = -n.scrollLeft + oy(t)
  const f = -n.scrollTop
  return (
    hr(s).direction === "rtl" && (u += En(e.clientWidth, s.clientWidth) - o),
    { width: o, height: l, x: u, y: f }
  )
}
function cI(t, e) {
  const n = Cn(t),
    s = Dr(t),
    o = n.visualViewport
  let l = s.clientWidth,
    u = s.clientHeight,
    f = 0,
    d = 0
  if (o) {
    ;(l = o.width), (u = o.height)
    const m = iy()
    ;(!m || (m && e === "fixed")) && ((f = o.offsetLeft), (d = o.offsetTop))
  }
  return { width: l, height: u, x: f, y: d }
}
function fI(t, e) {
  const n = go(t, !0, e === "fixed"),
    s = n.top + t.clientTop,
    o = n.left + t.clientLeft,
    l = Nr(t) ? va(t) : Mr(1),
    u = t.clientWidth * l.x,
    f = t.clientHeight * l.y,
    d = o * l.x,
    m = s * l.y
  return { width: u, height: f, x: d, y: m }
}
function MS(t, e, n) {
  let s
  if (e === "viewport") s = cI(t, n)
  else if (e === "document") s = uI(Dr(t))
  else if (dr(e)) s = fI(e, n)
  else {
    const o = kE(t)
    s = { x: e.x - o.x, y: e.y - o.y, width: e.width, height: e.height }
  }
  return od(s)
}
function AE(t, e) {
  const n = ds(t)
  return n === e || !dr(n) || Va(n)
    ? !1
    : hr(n).position === "fixed" || AE(n, e)
}
function dI(t, e) {
  const n = e.get(t)
  if (n) return n
  let s = Cu(t, [], !1).filter(f => dr(f) && Za(f) !== "body"),
    o = null
  const l = hr(t).position === "fixed"
  let u = l ? ds(t) : t
  for (; dr(u) && !Va(u); ) {
    const f = hr(u),
      d = ry(u)
    !d && f.position === "fixed" && (o = null),
      (
        l
          ? !d && !o
          : (!d &&
              f.position === "static" &&
              !!o &&
              ["absolute", "fixed"].includes(o.position)) ||
            (zu(u) && !d && AE(t, u))
      )
        ? (s = s.filter(h => h !== u))
        : (o = f),
      (u = ds(u))
  }
  return e.set(t, s), s
}
function hI(t) {
  let { element: e, boundary: n, rootBoundary: s, strategy: o } = t
  const u = [
      ...(n === "clippingAncestors"
        ? Md(e)
          ? []
          : dI(e, this._c)
        : [].concat(n)),
      s,
    ],
    f = u[0],
    d = u.reduce(
      (m, h) => {
        const g = MS(e, h, o)
        return (
          (m.top = En(g.top, m.top)),
          (m.right = cs(g.right, m.right)),
          (m.bottom = cs(g.bottom, m.bottom)),
          (m.left = En(g.left, m.left)),
          m
        )
      },
      MS(e, f, o),
    )
  return {
    width: d.right - d.left,
    height: d.bottom - d.top,
    x: d.left,
    y: d.top,
  }
}
function pI(t) {
  const { width: e, height: n } = _E(t)
  return { width: e, height: n }
}
function mI(t, e, n) {
  const s = Nr(e),
    o = Dr(e),
    l = n === "fixed",
    u = go(t, !0, l, e)
  let f = { scrollLeft: 0, scrollTop: 0 }
  const d = Mr(0)
  if (s || (!s && !l))
    if (((Za(e) !== "body" || zu(o)) && (f = Nd(e)), s)) {
      const w = go(e, !0, l, e)
      ;(d.x = w.x + e.clientLeft), (d.y = w.y + e.clientTop)
    } else o && (d.x = oy(o))
  const m = o && !s && !l ? OE(o, f) : Mr(0),
    h = u.left + f.scrollLeft - d.x - m.x,
    g = u.top + f.scrollTop - d.y - m.y
  return { x: h, y: g, width: u.width, height: u.height }
}
function am(t) {
  return hr(t).position === "static"
}
function NS(t, e) {
  if (!Nr(t) || hr(t).position === "fixed") return null
  if (e) return e(t)
  let n = t.offsetParent
  return Dr(t) === n && (n = n.ownerDocument.body), n
}
function TE(t, e) {
  const n = Cn(t)
  if (Md(t)) return n
  if (!Nr(t)) {
    let o = ds(t)
    for (; o && !Va(o); ) {
      if (dr(o) && !am(o)) return o
      o = ds(o)
    }
    return n
  }
  let s = NS(t, e)
  for (; s && rI(s) && am(s); ) s = NS(s, e)
  return s && Va(s) && am(s) && !ry(s) ? n : s || iI(t) || n
}
const gI = async function (t) {
  const e = this.getOffsetParent || TE,
    n = this.getDimensions,
    s = await n(t.floating)
  return {
    reference: mI(t.reference, await e(t.floating), t.strategy),
    floating: { x: 0, y: 0, width: s.width, height: s.height },
  }
}
function yI(t) {
  return hr(t).direction === "rtl"
}
const vI = {
  convertOffsetParentRelativeRectToViewportRelativeRect: aI,
  getDocumentElement: Dr,
  getClippingRect: hI,
  getOffsetParent: TE,
  getElementRects: gI,
  getClientRects: lI,
  getDimensions: pI,
  getScale: va,
  isElement: dr,
  isRTL: yI,
}
function RE(t, e) {
  return (
    t.x === e.x && t.y === e.y && t.width === e.width && t.height === e.height
  )
}
function wI(t, e) {
  let n = null,
    s
  const o = Dr(t)
  function l() {
    var f
    clearTimeout(s), (f = n) == null || f.disconnect(), (n = null)
  }
  function u(f, d) {
    f === void 0 && (f = !1), d === void 0 && (d = 1), l()
    const m = t.getBoundingClientRect(),
      { left: h, top: g, width: w, height: b } = m
    if ((f || e(), !w || !b)) return
    const E = df(g),
      S = df(o.clientWidth - (h + w)),
      C = df(o.clientHeight - (g + b)),
      _ = df(h),
      O = {
        rootMargin: -E + "px " + -S + "px " + -C + "px " + -_ + "px",
        threshold: En(0, cs(1, d)) || 1,
      }
    let M = !0
    function D(K) {
      const W = K[0].intersectionRatio
      if (W !== d) {
        if (!M) return u()
        W
          ? u(!1, W)
          : (s = setTimeout(() => {
              u(!1, 1e-7)
            }, 1e3))
      }
      W === 1 && !RE(m, t.getBoundingClientRect()) && u(), (M = !1)
    }
    try {
      n = new IntersectionObserver(D, { ...O, root: o.ownerDocument })
    } catch {
      n = new IntersectionObserver(D, O)
    }
    n.observe(t)
  }
  return u(!0), l
}
function SI(t, e, n, s) {
  s === void 0 && (s = {})
  const {
      ancestorScroll: o = !0,
      ancestorResize: l = !0,
      elementResize: u = typeof ResizeObserver == "function",
      layoutShift: f = typeof IntersectionObserver == "function",
      animationFrame: d = !1,
    } = s,
    m = sy(t),
    h = o || l ? [...(m ? Cu(m) : []), ...Cu(e)] : []
  h.forEach(_ => {
    o && _.addEventListener("scroll", n, { passive: !0 }),
      l && _.addEventListener("resize", n)
  })
  const g = m && f ? wI(m, n) : null
  let w = -1,
    b = null
  u &&
    ((b = new ResizeObserver(_ => {
      let [A] = _
      A &&
        A.target === m &&
        b &&
        (b.unobserve(e),
        cancelAnimationFrame(w),
        (w = requestAnimationFrame(() => {
          var O
          ;(O = b) == null || O.observe(e)
        }))),
        n()
    })),
    m && !d && b.observe(m),
    b.observe(e))
  let E,
    S = d ? go(t) : null
  d && C()
  function C() {
    const _ = go(t)
    S && !RE(S, _) && n(), (S = _), (E = requestAnimationFrame(C))
  }
  return (
    n(),
    () => {
      var _
      h.forEach(A => {
        o && A.removeEventListener("scroll", n),
          l && A.removeEventListener("resize", n)
      }),
        g == null || g(),
        (_ = b) == null || _.disconnect(),
        (b = null),
        d && cancelAnimationFrame(E)
    }
  )
}
const xI = JP,
  EI = eI,
  bI = YP,
  CI = nI,
  _I = XP,
  jS = QP,
  kI = tI,
  OI = (t, e, n) => {
    const s = new Map(),
      o = { platform: vI, ...n },
      l = { ...o.platform, _c: s }
    return qP(t, e, { ...o, platform: l })
  }
var Mf = typeof document < "u" ? v.useLayoutEffect : v.useEffect
function ad(t, e) {
  if (t === e) return !0
  if (typeof t != typeof e) return !1
  if (typeof t == "function" && t.toString() === e.toString()) return !0
  let n, s, o
  if (t && e && typeof t == "object") {
    if (Array.isArray(t)) {
      if (((n = t.length), n !== e.length)) return !1
      for (s = n; s-- !== 0; ) if (!ad(t[s], e[s])) return !1
      return !0
    }
    if (((o = Object.keys(t)), (n = o.length), n !== Object.keys(e).length))
      return !1
    for (s = n; s-- !== 0; ) if (!{}.hasOwnProperty.call(e, o[s])) return !1
    for (s = n; s-- !== 0; ) {
      const l = o[s]
      if (!(l === "_owner" && t.$$typeof) && !ad(t[l], e[l])) return !1
    }
    return !0
  }
  return t !== t && e !== e
}
function PE(t) {
  return typeof window > "u"
    ? 1
    : (t.ownerDocument.defaultView || window).devicePixelRatio || 1
}
function DS(t, e) {
  const n = PE(t)
  return Math.round(e * n) / n
}
function lm(t) {
  const e = v.useRef(t)
  return (
    Mf(() => {
      e.current = t
    }),
    e
  )
}
function AI(t) {
  t === void 0 && (t = {})
  const {
      placement: e = "bottom",
      strategy: n = "absolute",
      middleware: s = [],
      platform: o,
      elements: { reference: l, floating: u } = {},
      transform: f = !0,
      whileElementsMounted: d,
      open: m,
    } = t,
    [h, g] = v.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: e,
      middlewareData: {},
      isPositioned: !1,
    }),
    [w, b] = v.useState(s)
  ad(w, s) || b(s)
  const [E, S] = v.useState(null),
    [C, _] = v.useState(null),
    A = v.useCallback(B => {
      B !== K.current && ((K.current = B), S(B))
    }, []),
    O = v.useCallback(B => {
      B !== W.current && ((W.current = B), _(B))
    }, []),
    M = l || E,
    D = u || C,
    K = v.useRef(null),
    W = v.useRef(null),
    q = v.useRef(h),
    Z = d != null,
    le = lm(d),
    Ce = lm(o),
    Ae = lm(m),
    Te = v.useCallback(() => {
      if (!K.current || !W.current) return
      const B = { placement: e, strategy: n, middleware: w }
      Ce.current && (B.platform = Ce.current),
        OI(K.current, W.current, B).then(U => {
          const V = { ...U, isPositioned: Ae.current !== !1 }
          Pe.current &&
            !ad(q.current, V) &&
            ((q.current = V),
            kg.flushSync(() => {
              g(V)
            }))
        })
    }, [w, e, n, Ce, Ae])
  Mf(() => {
    m === !1 &&
      q.current.isPositioned &&
      ((q.current.isPositioned = !1), g(B => ({ ...B, isPositioned: !1 })))
  }, [m])
  const Pe = v.useRef(!1)
  Mf(
    () => (
      (Pe.current = !0),
      () => {
        Pe.current = !1
      }
    ),
    [],
  ),
    Mf(() => {
      if ((M && (K.current = M), D && (W.current = D), M && D)) {
        if (le.current) return le.current(M, D, Te)
        Te()
      }
    }, [M, D, Te, le, Z])
  const Ue = v.useMemo(
      () => ({ reference: K, floating: W, setReference: A, setFloating: O }),
      [A, O],
    ),
    te = v.useMemo(() => ({ reference: M, floating: D }), [M, D]),
    H = v.useMemo(() => {
      const B = { position: n, left: 0, top: 0 }
      if (!te.floating) return B
      const U = DS(te.floating, h.x),
        V = DS(te.floating, h.y)
      return f
        ? {
            ...B,
            transform: "translate(" + U + "px, " + V + "px)",
            ...(PE(te.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: n, left: U, top: V }
    }, [n, f, te.floating, h.x, h.y])
  return v.useMemo(
    () => ({ ...h, update: Te, refs: Ue, elements: te, floatingStyles: H }),
    [h, Te, Ue, te, H],
  )
}
const TI = t => {
    function e(n) {
      return {}.hasOwnProperty.call(n, "current")
    }
    return {
      name: "arrow",
      options: t,
      fn(n) {
        const { element: s, padding: o } = typeof t == "function" ? t(n) : t
        return s && e(s)
          ? s.current != null
            ? jS({ element: s.current, padding: o }).fn(n)
            : {}
          : s
            ? jS({ element: s, padding: o }).fn(n)
            : {}
      },
    }
  },
  RI = (t, e) => ({ ...xI(t), options: [t, e] }),
  PI = (t, e) => ({ ...EI(t), options: [t, e] }),
  II = (t, e) => ({ ...kI(t), options: [t, e] }),
  MI = (t, e) => ({ ...bI(t), options: [t, e] }),
  NI = (t, e) => ({ ...CI(t), options: [t, e] }),
  jI = (t, e) => ({ ..._I(t), options: [t, e] }),
  DI = (t, e) => ({ ...TI(t), options: [t, e] })
var LI = "Arrow",
  IE = v.forwardRef((t, e) => {
    const { children: n, width: s = 10, height: o = 5, ...l } = t
    return T.jsx(dt.svg, {
      ...l,
      ref: e,
      width: s,
      height: o,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: t.asChild ? n : T.jsx("polygon", { points: "0,0 30,0 15,10" }),
    })
  })
IE.displayName = LI
var BI = IE
function FI(t) {
  const [e, n] = v.useState(void 0)
  return (
    uo(() => {
      if (t) {
        n({ width: t.offsetWidth, height: t.offsetHeight })
        const s = new ResizeObserver(o => {
          if (!Array.isArray(o) || !o.length) return
          const l = o[0]
          let u, f
          if ("borderBoxSize" in l) {
            const d = l.borderBoxSize,
              m = Array.isArray(d) ? d[0] : d
            ;(u = m.inlineSize), (f = m.blockSize)
          } else (u = t.offsetWidth), (f = t.offsetHeight)
          n({ width: u, height: f })
        })
        return s.observe(t, { box: "border-box" }), () => s.unobserve(t)
      } else n(void 0)
    }, [t]),
    e
  )
}
var ay = "Popper",
  [ME, jd] = vo(ay),
  [UI, NE] = ME(ay),
  jE = t => {
    const { __scopePopper: e, children: n } = t,
      [s, o] = v.useState(null)
    return T.jsx(UI, { scope: e, anchor: s, onAnchorChange: o, children: n })
  }
jE.displayName = ay
var DE = "PopperAnchor",
  LE = v.forwardRef((t, e) => {
    const { __scopePopper: n, virtualRef: s, ...o } = t,
      l = NE(DE, n),
      u = v.useRef(null),
      f = Ct(e, u)
    return (
      v.useEffect(() => {
        l.onAnchorChange((s == null ? void 0 : s.current) || u.current)
      }),
      s ? null : T.jsx(dt.div, { ...o, ref: f })
    )
  })
LE.displayName = DE
var ly = "PopperContent",
  [zI, $I] = ME(ly),
  BE = v.forwardRef((t, e) => {
    var Se, ke, Ee, Be, Dt, dn
    const {
        __scopePopper: n,
        side: s = "bottom",
        sideOffset: o = 0,
        align: l = "center",
        alignOffset: u = 0,
        arrowPadding: f = 0,
        avoidCollisions: d = !0,
        collisionBoundary: m = [],
        collisionPadding: h = 0,
        sticky: g = "partial",
        hideWhenDetached: w = !1,
        updatePositionStrategy: b = "optimized",
        onPlaced: E,
        ...S
      } = t,
      C = NE(ly, n),
      [_, A] = v.useState(null),
      O = Ct(e, Ht => A(Ht)),
      [M, D] = v.useState(null),
      K = FI(M),
      W = (K == null ? void 0 : K.width) ?? 0,
      q = (K == null ? void 0 : K.height) ?? 0,
      Z = s + (l !== "center" ? "-" + l : ""),
      le =
        typeof h == "number"
          ? h
          : { top: 0, right: 0, bottom: 0, left: 0, ...h },
      Ce = Array.isArray(m) ? m : [m],
      Ae = Ce.length > 0,
      Te = { padding: le, boundary: Ce.filter(VI), altBoundary: Ae },
      {
        refs: Pe,
        floatingStyles: Ue,
        placement: te,
        isPositioned: H,
        middlewareData: B,
      } = AI({
        strategy: "fixed",
        placement: Z,
        whileElementsMounted: (...Ht) =>
          SI(...Ht, { animationFrame: b === "always" }),
        elements: { reference: C.anchor },
        middleware: [
          RI({ mainAxis: o + q, alignmentAxis: u }),
          d &&
            PI({
              mainAxis: !0,
              crossAxis: !1,
              limiter: g === "partial" ? II() : void 0,
              ...Te,
            }),
          d && MI({ ...Te }),
          NI({
            ...Te,
            apply: ({
              elements: Ht,
              rects: Br,
              availableWidth: ms,
              availableHeight: _o,
            }) => {
              const { width: gs, height: ko } = Br.reference,
                mr = Ht.floating.style
              mr.setProperty("--radix-popper-available-width", `${ms}px`),
                mr.setProperty("--radix-popper-available-height", `${_o}px`),
                mr.setProperty("--radix-popper-anchor-width", `${gs}px`),
                mr.setProperty("--radix-popper-anchor-height", `${ko}px`)
            },
          }),
          M && DI({ element: M, padding: f }),
          HI({ arrowWidth: W, arrowHeight: q }),
          w && jI({ strategy: "referenceHidden", ...Te }),
        ],
      }),
      [U, V] = zE(te),
      I = fr(E)
    uo(() => {
      H && (I == null || I())
    }, [H, I])
    const $ = (Se = B.arrow) == null ? void 0 : Se.x,
      ue = (ke = B.arrow) == null ? void 0 : ke.y,
      oe = ((Ee = B.arrow) == null ? void 0 : Ee.centerOffset) !== 0,
      [he, me] = v.useState()
    return (
      uo(() => {
        _ && me(window.getComputedStyle(_).zIndex)
      }, [_]),
      T.jsx("div", {
        "ref": Pe.setFloating,
        "data-radix-popper-content-wrapper": "",
        "style": {
          ...Ue,
          "transform": H ? Ue.transform : "translate(0, -200%)",
          "minWidth": "max-content",
          "zIndex": he,
          "--radix-popper-transform-origin": [
            (Be = B.transformOrigin) == null ? void 0 : Be.x,
            (Dt = B.transformOrigin) == null ? void 0 : Dt.y,
          ].join(" "),
          ...(((dn = B.hide) == null ? void 0 : dn.referenceHidden) && {
            visibility: "hidden",
            pointerEvents: "none",
          }),
        },
        "dir": t.dir,
        "children": T.jsx(zI, {
          scope: n,
          placedSide: U,
          onArrowChange: D,
          arrowX: $,
          arrowY: ue,
          shouldHideArrow: oe,
          children: T.jsx(dt.div, {
            "data-side": U,
            "data-align": V,
            ...S,
            "ref": O,
            "style": { ...S.style, animation: H ? void 0 : "none" },
          }),
        }),
      })
    )
  })
BE.displayName = ly
var FE = "PopperArrow",
  WI = { top: "bottom", right: "left", bottom: "top", left: "right" },
  UE = v.forwardRef(function (e, n) {
    const { __scopePopper: s, ...o } = e,
      l = $I(FE, s),
      u = WI[l.placedSide]
    return T.jsx("span", {
      ref: l.onArrowChange,
      style: {
        position: "absolute",
        left: l.arrowX,
        top: l.arrowY,
        [u]: 0,
        transformOrigin: {
          top: "",
          right: "0 0",
          bottom: "center 0",
          left: "100% 0",
        }[l.placedSide],
        transform: {
          top: "translateY(100%)",
          right: "translateY(50%) rotate(90deg) translateX(-50%)",
          bottom: "rotate(180deg)",
          left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[l.placedSide],
        visibility: l.shouldHideArrow ? "hidden" : void 0,
      },
      children: T.jsx(BI, {
        ...o,
        ref: n,
        style: { ...o.style, display: "block" },
      }),
    })
  })
UE.displayName = FE
function VI(t) {
  return t !== null
}
var HI = t => ({
  name: "transformOrigin",
  options: t,
  fn(e) {
    var C, _, A
    const { placement: n, rects: s, middlewareData: o } = e,
      u = ((C = o.arrow) == null ? void 0 : C.centerOffset) !== 0,
      f = u ? 0 : t.arrowWidth,
      d = u ? 0 : t.arrowHeight,
      [m, h] = zE(n),
      g = { start: "0%", center: "50%", end: "100%" }[h],
      w = (((_ = o.arrow) == null ? void 0 : _.x) ?? 0) + f / 2,
      b = (((A = o.arrow) == null ? void 0 : A.y) ?? 0) + d / 2
    let E = "",
      S = ""
    return (
      m === "bottom"
        ? ((E = u ? g : `${w}px`), (S = `${-d}px`))
        : m === "top"
          ? ((E = u ? g : `${w}px`), (S = `${s.floating.height + d}px`))
          : m === "right"
            ? ((E = `${-d}px`), (S = u ? g : `${b}px`))
            : m === "left" &&
              ((E = `${s.floating.width + d}px`), (S = u ? g : `${b}px`)),
      { data: { x: E, y: S } }
    )
  },
})
function zE(t) {
  const [e, n = "center"] = t.split("-")
  return [e, n]
}
var GI = jE,
  $E = LE,
  WE = BE,
  VE = UE,
  um = "rovingFocusGroup.onEntryFocus",
  KI = { bubbles: !1, cancelable: !0 },
  Dd = "RovingFocusGroup",
  [Xm, HE, qI] = wE(Dd),
  [QI, GE] = vo(Dd, [qI]),
  [YI, XI] = QI(Dd),
  KE = v.forwardRef((t, e) =>
    T.jsx(Xm.Provider, {
      scope: t.__scopeRovingFocusGroup,
      children: T.jsx(Xm.Slot, {
        scope: t.__scopeRovingFocusGroup,
        children: T.jsx(ZI, { ...t, ref: e }),
      }),
    }),
  )
KE.displayName = Dd
var ZI = v.forwardRef((t, e) => {
    const {
        __scopeRovingFocusGroup: n,
        orientation: s,
        loop: o = !1,
        dir: l,
        currentTabStopId: u,
        defaultCurrentTabStopId: f,
        onCurrentTabStopIdChange: d,
        onEntryFocus: m,
        preventScrollOnEntryFocus: h = !1,
        ...g
      } = t,
      w = v.useRef(null),
      b = Ct(e, w),
      E = xE(l),
      [S = null, C] = _g({ prop: u, defaultProp: f, onChange: d }),
      [_, A] = v.useState(!1),
      O = fr(m),
      M = HE(n),
      D = v.useRef(!1),
      [K, W] = v.useState(0)
    return (
      v.useEffect(() => {
        const q = w.current
        if (q)
          return q.addEventListener(um, O), () => q.removeEventListener(um, O)
      }, [O]),
      T.jsx(YI, {
        scope: n,
        orientation: s,
        dir: E,
        loop: o,
        currentTabStopId: S,
        onItemFocus: v.useCallback(q => C(q), [C]),
        onItemShiftTab: v.useCallback(() => A(!0), []),
        onFocusableItemAdd: v.useCallback(() => W(q => q + 1), []),
        onFocusableItemRemove: v.useCallback(() => W(q => q - 1), []),
        children: T.jsx(dt.div, {
          "tabIndex": _ || K === 0 ? -1 : 0,
          "data-orientation": s,
          ...g,
          "ref": b,
          "style": { outline: "none", ...t.style },
          "onMouseDown": Oe(t.onMouseDown, () => {
            D.current = !0
          }),
          "onFocus": Oe(t.onFocus, q => {
            const Z = !D.current
            if (q.target === q.currentTarget && Z && !_) {
              const le = new CustomEvent(um, KI)
              if ((q.currentTarget.dispatchEvent(le), !le.defaultPrevented)) {
                const Ce = M().filter(te => te.focusable),
                  Ae = Ce.find(te => te.active),
                  Te = Ce.find(te => te.id === S),
                  Ue = [Ae, Te, ...Ce].filter(Boolean).map(te => te.ref.current)
                YE(Ue, h)
              }
            }
            D.current = !1
          }),
          "onBlur": Oe(t.onBlur, () => A(!1)),
        }),
      })
    )
  }),
  qE = "RovingFocusGroupItem",
  QE = v.forwardRef((t, e) => {
    const {
        __scopeRovingFocusGroup: n,
        focusable: s = !0,
        active: o = !1,
        tabStopId: l,
        ...u
      } = t,
      f = ma(),
      d = l || f,
      m = XI(qE, n),
      h = m.currentTabStopId === d,
      g = HE(n),
      { onFocusableItemAdd: w, onFocusableItemRemove: b } = m
    return (
      v.useEffect(() => {
        if (s) return w(), () => b()
      }, [s, w, b]),
      T.jsx(Xm.ItemSlot, {
        scope: n,
        id: d,
        focusable: s,
        active: o,
        children: T.jsx(dt.span, {
          "tabIndex": h ? 0 : -1,
          "data-orientation": m.orientation,
          ...u,
          "ref": e,
          "onMouseDown": Oe(t.onMouseDown, E => {
            s ? m.onItemFocus(d) : E.preventDefault()
          }),
          "onFocus": Oe(t.onFocus, () => m.onItemFocus(d)),
          "onKeyDown": Oe(t.onKeyDown, E => {
            if (E.key === "Tab" && E.shiftKey) {
              m.onItemShiftTab()
              return
            }
            if (E.target !== E.currentTarget) return
            const S = tM(E, m.orientation, m.dir)
            if (S !== void 0) {
              if (E.metaKey || E.ctrlKey || E.altKey || E.shiftKey) return
              E.preventDefault()
              let _ = g()
                .filter(A => A.focusable)
                .map(A => A.ref.current)
              if (S === "last") _.reverse()
              else if (S === "prev" || S === "next") {
                S === "prev" && _.reverse()
                const A = _.indexOf(E.currentTarget)
                _ = m.loop ? nM(_, A + 1) : _.slice(A + 1)
              }
              setTimeout(() => YE(_))
            }
          }),
        }),
      })
    )
  })
QE.displayName = qE
var JI = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
}
function eM(t, e) {
  return e !== "rtl"
    ? t
    : t === "ArrowLeft"
      ? "ArrowRight"
      : t === "ArrowRight"
        ? "ArrowLeft"
        : t
}
function tM(t, e, n) {
  const s = eM(t.key, n)
  if (
    !(e === "vertical" && ["ArrowLeft", "ArrowRight"].includes(s)) &&
    !(e === "horizontal" && ["ArrowUp", "ArrowDown"].includes(s))
  )
    return JI[s]
}
function YE(t, e = !1) {
  const n = document.activeElement
  for (const s of t)
    if (
      s === n ||
      (s.focus({ preventScroll: e }), document.activeElement !== n)
    )
      return
}
function nM(t, e) {
  return t.map((n, s) => t[(e + s) % t.length])
}
var rM = KE,
  iM = QE,
  Zm = ["Enter", " "],
  sM = ["ArrowDown", "PageUp", "Home"],
  XE = ["ArrowUp", "PageDown", "End"],
  oM = [...sM, ...XE],
  aM = { ltr: [...Zm, "ArrowRight"], rtl: [...Zm, "ArrowLeft"] },
  lM = { ltr: ["ArrowLeft"], rtl: ["ArrowRight"] },
  $u = "Menu",
  [_u, uM, cM] = wE($u),
  [So, ZE] = vo($u, [cM, jd, GE]),
  Ld = jd(),
  JE = GE(),
  [fM, xo] = So($u),
  [dM, Wu] = So($u),
  eb = t => {
    const {
        __scopeMenu: e,
        open: n = !1,
        children: s,
        dir: o,
        onOpenChange: l,
        modal: u = !0,
      } = t,
      f = Ld(e),
      [d, m] = v.useState(null),
      h = v.useRef(!1),
      g = fr(l),
      w = xE(o)
    return (
      v.useEffect(() => {
        const b = () => {
            ;(h.current = !0),
              document.addEventListener("pointerdown", E, {
                capture: !0,
                once: !0,
              }),
              document.addEventListener("pointermove", E, {
                capture: !0,
                once: !0,
              })
          },
          E = () => (h.current = !1)
        return (
          document.addEventListener("keydown", b, { capture: !0 }),
          () => {
            document.removeEventListener("keydown", b, { capture: !0 }),
              document.removeEventListener("pointerdown", E, { capture: !0 }),
              document.removeEventListener("pointermove", E, { capture: !0 })
          }
        )
      }, []),
      T.jsx(GI, {
        ...f,
        children: T.jsx(fM, {
          scope: e,
          open: n,
          onOpenChange: g,
          content: d,
          onContentChange: m,
          children: T.jsx(dM, {
            scope: e,
            onClose: v.useCallback(() => g(!1), [g]),
            isUsingKeyboardRef: h,
            dir: w,
            modal: u,
            children: s,
          }),
        }),
      })
    )
  }
eb.displayName = $u
var hM = "MenuAnchor",
  uy = v.forwardRef((t, e) => {
    const { __scopeMenu: n, ...s } = t,
      o = Ld(n)
    return T.jsx($E, { ...o, ...s, ref: e })
  })
uy.displayName = hM
var cy = "MenuPortal",
  [pM, tb] = So(cy, { forceMount: void 0 }),
  nb = t => {
    const { __scopeMenu: e, forceMount: n, children: s, container: o } = t,
      l = xo(cy, e)
    return T.jsx(pM, {
      scope: e,
      forceMount: n,
      children: T.jsx(vi, {
        present: n || l.open,
        children: T.jsx(Ag, { asChild: !0, container: o, children: s }),
      }),
    })
  }
nb.displayName = cy
var Ln = "MenuContent",
  [mM, fy] = So(Ln),
  rb = v.forwardRef((t, e) => {
    const n = tb(Ln, t.__scopeMenu),
      { forceMount: s = n.forceMount, ...o } = t,
      l = xo(Ln, t.__scopeMenu),
      u = Wu(Ln, t.__scopeMenu)
    return T.jsx(_u.Provider, {
      scope: t.__scopeMenu,
      children: T.jsx(vi, {
        present: s || l.open,
        children: T.jsx(_u.Slot, {
          scope: t.__scopeMenu,
          children: u.modal
            ? T.jsx(gM, { ...o, ref: e })
            : T.jsx(yM, { ...o, ref: e }),
        }),
      }),
    })
  }),
  gM = v.forwardRef((t, e) => {
    const n = xo(Ln, t.__scopeMenu),
      s = v.useRef(null),
      o = Ct(e, s)
    return (
      v.useEffect(() => {
        const l = s.current
        if (l) return Y1(l)
      }, []),
      T.jsx(dy, {
        ...t,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: n.open,
        disableOutsideScroll: !0,
        onFocusOutside: Oe(t.onFocusOutside, l => l.preventDefault(), {
          checkForDefaultPrevented: !1,
        }),
        onDismiss: () => n.onOpenChange(!1),
      })
    )
  }),
  yM = v.forwardRef((t, e) => {
    const n = xo(Ln, t.__scopeMenu)
    return T.jsx(dy, {
      ...t,
      ref: e,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => n.onOpenChange(!1),
    })
  }),
  dy = v.forwardRef((t, e) => {
    const {
        __scopeMenu: n,
        loop: s = !1,
        trapFocus: o,
        onOpenAutoFocus: l,
        onCloseAutoFocus: u,
        disableOutsidePointerEvents: f,
        onEntryFocus: d,
        onEscapeKeyDown: m,
        onPointerDownOutside: h,
        onFocusOutside: g,
        onInteractOutside: w,
        onDismiss: b,
        disableOutsideScroll: E,
        ...S
      } = t,
      C = xo(Ln, n),
      _ = Wu(Ln, n),
      A = Ld(n),
      O = JE(n),
      M = uM(n),
      [D, K] = v.useState(null),
      W = v.useRef(null),
      q = Ct(e, W, C.onContentChange),
      Z = v.useRef(0),
      le = v.useRef(""),
      Ce = v.useRef(0),
      Ae = v.useRef(null),
      Te = v.useRef("right"),
      Pe = v.useRef(0),
      Ue = E ? Tg : v.Fragment,
      te = E ? { as: Bn, allowPinchZoom: !0 } : void 0,
      H = U => {
        var Se, ke
        const V = le.current + U,
          I = M().filter(Ee => !Ee.disabled),
          $ = document.activeElement,
          ue =
            (Se = I.find(Ee => Ee.ref.current === $)) == null
              ? void 0
              : Se.textValue,
          oe = I.map(Ee => Ee.textValue),
          he = TM(oe, V, ue),
          me =
            (ke = I.find(Ee => Ee.textValue === he)) == null
              ? void 0
              : ke.ref.current
        ;(function Ee(Be) {
          ;(le.current = Be),
            window.clearTimeout(Z.current),
            Be !== "" && (Z.current = window.setTimeout(() => Ee(""), 1e3))
        })(V),
          me && setTimeout(() => me.focus())
      }
    v.useEffect(() => () => window.clearTimeout(Z.current), []), z1()
    const B = v.useCallback(U => {
      var I, $
      return (
        Te.current === ((I = Ae.current) == null ? void 0 : I.side) &&
        PM(U, ($ = Ae.current) == null ? void 0 : $.area)
      )
    }, [])
    return T.jsx(mM, {
      scope: n,
      searchRef: le,
      onItemEnter: v.useCallback(
        U => {
          B(U) && U.preventDefault()
        },
        [B],
      ),
      onItemLeave: v.useCallback(
        U => {
          var V
          B(U) || ((V = W.current) == null || V.focus(), K(null))
        },
        [B],
      ),
      onTriggerLeave: v.useCallback(
        U => {
          B(U) && U.preventDefault()
        },
        [B],
      ),
      pointerGraceTimerRef: Ce,
      onPointerGraceIntentChange: v.useCallback(U => {
        Ae.current = U
      }, []),
      children: T.jsx(Ue, {
        ...te,
        children: T.jsx(Og, {
          asChild: !0,
          trapped: o,
          onMountAutoFocus: Oe(l, U => {
            var V
            U.preventDefault(),
              (V = W.current) == null || V.focus({ preventScroll: !0 })
          }),
          onUnmountAutoFocus: u,
          children: T.jsx(xd, {
            asChild: !0,
            disableOutsidePointerEvents: f,
            onEscapeKeyDown: m,
            onPointerDownOutside: h,
            onFocusOutside: g,
            onInteractOutside: w,
            onDismiss: b,
            children: T.jsx(rM, {
              asChild: !0,
              ...O,
              dir: _.dir,
              orientation: "vertical",
              loop: s,
              currentTabStopId: D,
              onCurrentTabStopIdChange: K,
              onEntryFocus: Oe(d, U => {
                _.isUsingKeyboardRef.current || U.preventDefault()
              }),
              preventScrollOnEntryFocus: !0,
              children: T.jsx(WE, {
                "role": "menu",
                "aria-orientation": "vertical",
                "data-state": wb(C.open),
                "data-radix-menu-content": "",
                "dir": _.dir,
                ...A,
                ...S,
                "ref": q,
                "style": { outline: "none", ...S.style },
                "onKeyDown": Oe(S.onKeyDown, U => {
                  const I =
                      U.target.closest("[data-radix-menu-content]") ===
                      U.currentTarget,
                    $ = U.ctrlKey || U.altKey || U.metaKey,
                    ue = U.key.length === 1
                  I &&
                    (U.key === "Tab" && U.preventDefault(),
                    !$ && ue && H(U.key))
                  const oe = W.current
                  if (U.target !== oe || !oM.includes(U.key)) return
                  U.preventDefault()
                  const me = M()
                    .filter(Se => !Se.disabled)
                    .map(Se => Se.ref.current)
                  XE.includes(U.key) && me.reverse(), OM(me)
                }),
                "onBlur": Oe(t.onBlur, U => {
                  U.currentTarget.contains(U.target) ||
                    (window.clearTimeout(Z.current), (le.current = ""))
                }),
                "onPointerMove": Oe(
                  t.onPointerMove,
                  ku(U => {
                    const V = U.target,
                      I = Pe.current !== U.clientX
                    if (U.currentTarget.contains(V) && I) {
                      const $ = U.clientX > Pe.current ? "right" : "left"
                      ;(Te.current = $), (Pe.current = U.clientX)
                    }
                  }),
                ),
              }),
            }),
          }),
        }),
      }),
    })
  })
rb.displayName = Ln
var vM = "MenuGroup",
  hy = v.forwardRef((t, e) => {
    const { __scopeMenu: n, ...s } = t
    return T.jsx(dt.div, { role: "group", ...s, ref: e })
  })
hy.displayName = vM
var wM = "MenuLabel",
  ib = v.forwardRef((t, e) => {
    const { __scopeMenu: n, ...s } = t
    return T.jsx(dt.div, { ...s, ref: e })
  })
ib.displayName = wM
var ld = "MenuItem",
  LS = "menu.itemSelect",
  Bd = v.forwardRef((t, e) => {
    const { disabled: n = !1, onSelect: s, ...o } = t,
      l = v.useRef(null),
      u = Wu(ld, t.__scopeMenu),
      f = fy(ld, t.__scopeMenu),
      d = Ct(e, l),
      m = v.useRef(!1),
      h = () => {
        const g = l.current
        if (!n && g) {
          const w = new CustomEvent(LS, { bubbles: !0, cancelable: !0 })
          g.addEventListener(LS, b => (s == null ? void 0 : s(b)), {
            once: !0,
          }),
            L1(g, w),
            w.defaultPrevented ? (m.current = !1) : u.onClose()
        }
      }
    return T.jsx(sb, {
      ...o,
      ref: d,
      disabled: n,
      onClick: Oe(t.onClick, h),
      onPointerDown: g => {
        var w
        ;(w = t.onPointerDown) == null || w.call(t, g), (m.current = !0)
      },
      onPointerUp: Oe(t.onPointerUp, g => {
        var w
        m.current || (w = g.currentTarget) == null || w.click()
      }),
      onKeyDown: Oe(t.onKeyDown, g => {
        const w = f.searchRef.current !== ""
        n ||
          (w && g.key === " ") ||
          (Zm.includes(g.key) && (g.currentTarget.click(), g.preventDefault()))
      }),
    })
  })
Bd.displayName = ld
var sb = v.forwardRef((t, e) => {
    const { __scopeMenu: n, disabled: s = !1, textValue: o, ...l } = t,
      u = fy(ld, n),
      f = JE(n),
      d = v.useRef(null),
      m = Ct(e, d),
      [h, g] = v.useState(!1),
      [w, b] = v.useState("")
    return (
      v.useEffect(() => {
        const E = d.current
        E && b((E.textContent ?? "").trim())
      }, [l.children]),
      T.jsx(_u.ItemSlot, {
        scope: n,
        disabled: s,
        textValue: o ?? w,
        children: T.jsx(iM, {
          asChild: !0,
          ...f,
          focusable: !s,
          children: T.jsx(dt.div, {
            "role": "menuitem",
            "data-highlighted": h ? "" : void 0,
            "aria-disabled": s || void 0,
            "data-disabled": s ? "" : void 0,
            ...l,
            "ref": m,
            "onPointerMove": Oe(
              t.onPointerMove,
              ku(E => {
                s
                  ? u.onItemLeave(E)
                  : (u.onItemEnter(E),
                    E.defaultPrevented ||
                      E.currentTarget.focus({ preventScroll: !0 }))
              }),
            ),
            "onPointerLeave": Oe(
              t.onPointerLeave,
              ku(E => u.onItemLeave(E)),
            ),
            "onFocus": Oe(t.onFocus, () => g(!0)),
            "onBlur": Oe(t.onBlur, () => g(!1)),
          }),
        }),
      })
    )
  }),
  SM = "MenuCheckboxItem",
  ob = v.forwardRef((t, e) => {
    const { checked: n = !1, onCheckedChange: s, ...o } = t
    return T.jsx(fb, {
      scope: t.__scopeMenu,
      checked: n,
      children: T.jsx(Bd, {
        "role": "menuitemcheckbox",
        "aria-checked": ud(n) ? "mixed" : n,
        ...o,
        "ref": e,
        "data-state": my(n),
        "onSelect": Oe(
          o.onSelect,
          () => (s == null ? void 0 : s(ud(n) ? !0 : !n)),
          { checkForDefaultPrevented: !1 },
        ),
      }),
    })
  })
ob.displayName = SM
var ab = "MenuRadioGroup",
  [xM, EM] = So(ab, { value: void 0, onValueChange: () => {} }),
  lb = v.forwardRef((t, e) => {
    const { value: n, onValueChange: s, ...o } = t,
      l = fr(s)
    return T.jsx(xM, {
      scope: t.__scopeMenu,
      value: n,
      onValueChange: l,
      children: T.jsx(hy, { ...o, ref: e }),
    })
  })
lb.displayName = ab
var ub = "MenuRadioItem",
  cb = v.forwardRef((t, e) => {
    const { value: n, ...s } = t,
      o = EM(ub, t.__scopeMenu),
      l = n === o.value
    return T.jsx(fb, {
      scope: t.__scopeMenu,
      checked: l,
      children: T.jsx(Bd, {
        "role": "menuitemradio",
        "aria-checked": l,
        ...s,
        "ref": e,
        "data-state": my(l),
        "onSelect": Oe(
          s.onSelect,
          () => {
            var u
            return (u = o.onValueChange) == null ? void 0 : u.call(o, n)
          },
          { checkForDefaultPrevented: !1 },
        ),
      }),
    })
  })
cb.displayName = ub
var py = "MenuItemIndicator",
  [fb, bM] = So(py, { checked: !1 }),
  db = v.forwardRef((t, e) => {
    const { __scopeMenu: n, forceMount: s, ...o } = t,
      l = bM(py, n)
    return T.jsx(vi, {
      present: s || ud(l.checked) || l.checked === !0,
      children: T.jsx(dt.span, { ...o, "ref": e, "data-state": my(l.checked) }),
    })
  })
db.displayName = py
var CM = "MenuSeparator",
  hb = v.forwardRef((t, e) => {
    const { __scopeMenu: n, ...s } = t
    return T.jsx(dt.div, {
      "role": "separator",
      "aria-orientation": "horizontal",
      ...s,
      "ref": e,
    })
  })
hb.displayName = CM
var _M = "MenuArrow",
  pb = v.forwardRef((t, e) => {
    const { __scopeMenu: n, ...s } = t,
      o = Ld(n)
    return T.jsx(VE, { ...o, ...s, ref: e })
  })
pb.displayName = _M
var kM = "MenuSub",
  [t6, mb] = So(kM),
  iu = "MenuSubTrigger",
  gb = v.forwardRef((t, e) => {
    const n = xo(iu, t.__scopeMenu),
      s = Wu(iu, t.__scopeMenu),
      o = mb(iu, t.__scopeMenu),
      l = fy(iu, t.__scopeMenu),
      u = v.useRef(null),
      { pointerGraceTimerRef: f, onPointerGraceIntentChange: d } = l,
      m = { __scopeMenu: t.__scopeMenu },
      h = v.useCallback(() => {
        u.current && window.clearTimeout(u.current), (u.current = null)
      }, [])
    return (
      v.useEffect(() => h, [h]),
      v.useEffect(() => {
        const g = f.current
        return () => {
          window.clearTimeout(g), d(null)
        }
      }, [f, d]),
      T.jsx(uy, {
        asChild: !0,
        ...m,
        children: T.jsx(sb, {
          "id": o.triggerId,
          "aria-haspopup": "menu",
          "aria-expanded": n.open,
          "aria-controls": o.contentId,
          "data-state": wb(n.open),
          ...t,
          "ref": Sd(e, o.onTriggerChange),
          "onClick": g => {
            var w
            ;(w = t.onClick) == null || w.call(t, g),
              !(t.disabled || g.defaultPrevented) &&
                (g.currentTarget.focus(), n.open || n.onOpenChange(!0))
          },
          "onPointerMove": Oe(
            t.onPointerMove,
            ku(g => {
              l.onItemEnter(g),
                !g.defaultPrevented &&
                  !t.disabled &&
                  !n.open &&
                  !u.current &&
                  (l.onPointerGraceIntentChange(null),
                  (u.current = window.setTimeout(() => {
                    n.onOpenChange(!0), h()
                  }, 100)))
            }),
          ),
          "onPointerLeave": Oe(
            t.onPointerLeave,
            ku(g => {
              var b, E
              h()
              const w =
                (b = n.content) == null ? void 0 : b.getBoundingClientRect()
              if (w) {
                const S = (E = n.content) == null ? void 0 : E.dataset.side,
                  C = S === "right",
                  _ = C ? -5 : 5,
                  A = w[C ? "left" : "right"],
                  O = w[C ? "right" : "left"]
                l.onPointerGraceIntentChange({
                  area: [
                    { x: g.clientX + _, y: g.clientY },
                    { x: A, y: w.top },
                    { x: O, y: w.top },
                    { x: O, y: w.bottom },
                    { x: A, y: w.bottom },
                  ],
                  side: S,
                }),
                  window.clearTimeout(f.current),
                  (f.current = window.setTimeout(
                    () => l.onPointerGraceIntentChange(null),
                    300,
                  ))
              } else {
                if ((l.onTriggerLeave(g), g.defaultPrevented)) return
                l.onPointerGraceIntentChange(null)
              }
            }),
          ),
          "onKeyDown": Oe(t.onKeyDown, g => {
            var b
            const w = l.searchRef.current !== ""
            t.disabled ||
              (w && g.key === " ") ||
              (aM[s.dir].includes(g.key) &&
                (n.onOpenChange(!0),
                (b = n.content) == null || b.focus(),
                g.preventDefault()))
          }),
        }),
      })
    )
  })
gb.displayName = iu
var yb = "MenuSubContent",
  vb = v.forwardRef((t, e) => {
    const n = tb(Ln, t.__scopeMenu),
      { forceMount: s = n.forceMount, ...o } = t,
      l = xo(Ln, t.__scopeMenu),
      u = Wu(Ln, t.__scopeMenu),
      f = mb(yb, t.__scopeMenu),
      d = v.useRef(null),
      m = Ct(e, d)
    return T.jsx(_u.Provider, {
      scope: t.__scopeMenu,
      children: T.jsx(vi, {
        present: s || l.open,
        children: T.jsx(_u.Slot, {
          scope: t.__scopeMenu,
          children: T.jsx(dy, {
            "id": f.contentId,
            "aria-labelledby": f.triggerId,
            ...o,
            "ref": m,
            "align": "start",
            "side": u.dir === "rtl" ? "left" : "right",
            "disableOutsidePointerEvents": !1,
            "disableOutsideScroll": !1,
            "trapFocus": !1,
            "onOpenAutoFocus": h => {
              var g
              u.isUsingKeyboardRef.current &&
                ((g = d.current) == null || g.focus()),
                h.preventDefault()
            },
            "onCloseAutoFocus": h => h.preventDefault(),
            "onFocusOutside": Oe(t.onFocusOutside, h => {
              h.target !== f.trigger && l.onOpenChange(!1)
            }),
            "onEscapeKeyDown": Oe(t.onEscapeKeyDown, h => {
              u.onClose(), h.preventDefault()
            }),
            "onKeyDown": Oe(t.onKeyDown, h => {
              var b
              const g = h.currentTarget.contains(h.target),
                w = lM[u.dir].includes(h.key)
              g &&
                w &&
                (l.onOpenChange(!1),
                (b = f.trigger) == null || b.focus(),
                h.preventDefault())
            }),
          }),
        }),
      }),
    })
  })
vb.displayName = yb
function wb(t) {
  return t ? "open" : "closed"
}
function ud(t) {
  return t === "indeterminate"
}
function my(t) {
  return ud(t) ? "indeterminate" : t ? "checked" : "unchecked"
}
function OM(t) {
  const e = document.activeElement
  for (const n of t)
    if (n === e || (n.focus(), document.activeElement !== e)) return
}
function AM(t, e) {
  return t.map((n, s) => t[(e + s) % t.length])
}
function TM(t, e, n) {
  const o = e.length > 1 && Array.from(e).every(m => m === e[0]) ? e[0] : e,
    l = n ? t.indexOf(n) : -1
  let u = AM(t, Math.max(l, 0))
  o.length === 1 && (u = u.filter(m => m !== n))
  const d = u.find(m => m.toLowerCase().startsWith(o.toLowerCase()))
  return d !== n ? d : void 0
}
function RM(t, e) {
  const { x: n, y: s } = t
  let o = !1
  for (let l = 0, u = e.length - 1; l < e.length; u = l++) {
    const f = e[l].x,
      d = e[l].y,
      m = e[u].x,
      h = e[u].y
    d > s != h > s && n < ((m - f) * (s - d)) / (h - d) + f && (o = !o)
  }
  return o
}
function PM(t, e) {
  if (!e) return !1
  const n = { x: t.clientX, y: t.clientY }
  return RM(n, e)
}
function ku(t) {
  return e => (e.pointerType === "mouse" ? t(e) : void 0)
}
var IM = eb,
  MM = uy,
  NM = nb,
  jM = rb,
  DM = hy,
  LM = ib,
  BM = Bd,
  FM = ob,
  UM = lb,
  zM = cb,
  $M = db,
  WM = hb,
  VM = pb,
  HM = gb,
  GM = vb,
  gy = "DropdownMenu",
  [KM, n6] = vo(gy, [ZE]),
  Zt = ZE(),
  [qM, Sb] = KM(gy),
  xb = t => {
    const {
        __scopeDropdownMenu: e,
        children: n,
        dir: s,
        open: o,
        defaultOpen: l,
        onOpenChange: u,
        modal: f = !0,
      } = t,
      d = Zt(e),
      m = v.useRef(null),
      [h = !1, g] = _g({ prop: o, defaultProp: l, onChange: u })
    return T.jsx(qM, {
      scope: e,
      triggerId: ma(),
      triggerRef: m,
      contentId: ma(),
      open: h,
      onOpenChange: g,
      onOpenToggle: v.useCallback(() => g(w => !w), [g]),
      modal: f,
      children: T.jsx(IM, {
        ...d,
        open: h,
        onOpenChange: g,
        dir: s,
        modal: f,
        children: n,
      }),
    })
  }
xb.displayName = gy
var Eb = "DropdownMenuTrigger",
  bb = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, disabled: s = !1, ...o } = t,
      l = Sb(Eb, n),
      u = Zt(n)
    return T.jsx(MM, {
      asChild: !0,
      ...u,
      children: T.jsx(dt.button, {
        "type": "button",
        "id": l.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": l.open,
        "aria-controls": l.open ? l.contentId : void 0,
        "data-state": l.open ? "open" : "closed",
        "data-disabled": s ? "" : void 0,
        "disabled": s,
        ...o,
        "ref": Sd(e, l.triggerRef),
        "onPointerDown": Oe(t.onPointerDown, f => {
          !s &&
            f.button === 0 &&
            f.ctrlKey === !1 &&
            (l.onOpenToggle(), l.open || f.preventDefault())
        }),
        "onKeyDown": Oe(t.onKeyDown, f => {
          s ||
            (["Enter", " "].includes(f.key) && l.onOpenToggle(),
            f.key === "ArrowDown" && l.onOpenChange(!0),
            ["Enter", " ", "ArrowDown"].includes(f.key) && f.preventDefault())
        }),
      }),
    })
  })
bb.displayName = Eb
var QM = "DropdownMenuPortal",
  Cb = t => {
    const { __scopeDropdownMenu: e, ...n } = t,
      s = Zt(e)
    return T.jsx(NM, { ...s, ...n })
  }
Cb.displayName = QM
var _b = "DropdownMenuContent",
  kb = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Sb(_b, n),
      l = Zt(n),
      u = v.useRef(!1)
    return T.jsx(jM, {
      "id": o.contentId,
      "aria-labelledby": o.triggerId,
      ...l,
      ...s,
      "ref": e,
      "onCloseAutoFocus": Oe(t.onCloseAutoFocus, f => {
        var d
        u.current || (d = o.triggerRef.current) == null || d.focus(),
          (u.current = !1),
          f.preventDefault()
      }),
      "onInteractOutside": Oe(t.onInteractOutside, f => {
        const d = f.detail.originalEvent,
          m = d.button === 0 && d.ctrlKey === !0,
          h = d.button === 2 || m
        ;(!o.modal || h) && (u.current = !0)
      }),
      "style": {
        ...t.style,
        "--radix-dropdown-menu-content-transform-origin":
          "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width":
          "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height":
          "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width":
          "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height":
          "var(--radix-popper-anchor-height)",
      },
    })
  })
kb.displayName = _b
var YM = "DropdownMenuGroup",
  XM = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(DM, { ...o, ...s, ref: e })
  })
XM.displayName = YM
var ZM = "DropdownMenuLabel",
  JM = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(LM, { ...o, ...s, ref: e })
  })
JM.displayName = ZM
var eN = "DropdownMenuItem",
  Ob = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(BM, { ...o, ...s, ref: e })
  })
Ob.displayName = eN
var tN = "DropdownMenuCheckboxItem",
  nN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(FM, { ...o, ...s, ref: e })
  })
nN.displayName = tN
var rN = "DropdownMenuRadioGroup",
  iN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(UM, { ...o, ...s, ref: e })
  })
iN.displayName = rN
var sN = "DropdownMenuRadioItem",
  oN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(zM, { ...o, ...s, ref: e })
  })
oN.displayName = sN
var aN = "DropdownMenuItemIndicator",
  lN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx($M, { ...o, ...s, ref: e })
  })
lN.displayName = aN
var uN = "DropdownMenuSeparator",
  Ab = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(WM, { ...o, ...s, ref: e })
  })
Ab.displayName = uN
var cN = "DropdownMenuArrow",
  fN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(VM, { ...o, ...s, ref: e })
  })
fN.displayName = cN
var dN = "DropdownMenuSubTrigger",
  hN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(HM, { ...o, ...s, ref: e })
  })
hN.displayName = dN
var pN = "DropdownMenuSubContent",
  mN = v.forwardRef((t, e) => {
    const { __scopeDropdownMenu: n, ...s } = t,
      o = Zt(n)
    return T.jsx(GM, {
      ...o,
      ...s,
      ref: e,
      style: {
        ...t.style,
        "--radix-dropdown-menu-content-transform-origin":
          "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width":
          "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height":
          "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width":
          "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height":
          "var(--radix-popper-anchor-height)",
      },
    })
  })
mN.displayName = pN
var gN = xb,
  yN = bb,
  vN = Cb,
  wN = kb,
  Tb = Ob,
  SN = Ab
const xN = "1.21.2",
  EN = "1.43.0",
  bN = {
    "-32700": "ParseError",
    "-32701": "OversizedRequest",
    "-32702": "OversizedResponse",
    "-32600": "InvalidRequest",
    "-32601": "MethodNotFound",
    "-32602": "InvalidParams",
    "-32603": "InternalError",
    "-32604": "ServerBusy",
    "-32000": "CallExecutionFailed",
    "-32001": "UnknownError",
    "-32003": "SubscriptionClosed",
    "-32004": "SubscriptionClosedWithError",
    "-32005": "BatchesNotSupported",
    "-32006": "TooManySubscriptions",
    "-32050": "TransientError",
    "-32002": "TransactionExecutionClientError",
  }
class Rb extends Error {}
class Pb extends Rb {
  constructor(e, n) {
    super(e), (this.code = n), (this.type = bN[n] ?? "ServerError")
  }
}
class CN extends Rb {
  constructor(e, n, s) {
    super(e), (this.status = n), (this.statusText = s)
  }
}
var Ib = t => {
    throw TypeError(t)
  },
  yy = (t, e, n) => e.has(t) || Ib("Cannot " + n),
  ut = (t, e, n) => (
    yy(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  Ds = (t, e, n) =>
    e.has(t)
      ? Ib("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  wa = (t, e, n, s) => (yy(t, e, "write to private field"), e.set(t, n), n),
  Mb = (t, e, n) => (yy(t, e, "access private method"), n),
  _N = (t, e, n, s) => ({
    set _(o) {
      wa(t, e, o)
    },
    get _() {
      return ut(t, e, s)
    },
  }),
  Vs,
  mu,
  ii,
  Xs,
  Ou,
  Sa,
  cd,
  Nb,
  jb
function kN(t) {
  const e = new URL(t)
  return (e.protocol = e.protocol.replace("http", "ws")), e.toString()
}
const ON = {
  WebSocketConstructor: typeof WebSocket < "u" ? WebSocket : void 0,
  callTimeout: 3e4,
  reconnectTimeout: 3e3,
  maxReconnects: 5,
}
class AN {
  constructor(e, n = {}) {
    if (
      (Ds(this, cd),
      Ds(this, Vs, 0),
      Ds(this, mu, 0),
      Ds(this, ii, null),
      Ds(this, Xs, null),
      Ds(this, Ou, new Set()),
      Ds(this, Sa, new Map()),
      (this.endpoint = e),
      (this.options = { ...ON, ...n }),
      !this.options.WebSocketConstructor)
    )
      throw new Error("Missing WebSocket constructor")
    this.endpoint.startsWith("http") && (this.endpoint = kN(this.endpoint))
  }
  async makeRequest(e, n) {
    const s = await Mb(this, cd, Nb).call(this)
    return new Promise((o, l) => {
      wa(this, Vs, ut(this, Vs) + 1),
        ut(this, Sa).set(ut(this, Vs), {
          resolve: o,
          reject: l,
          timeout: setTimeout(() => {
            ut(this, Sa).delete(ut(this, Vs)),
              l(new Error(`Request timeout: ${e}`))
          }, this.options.callTimeout),
        }),
        s.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: ut(this, Vs),
            method: e,
            params: n,
          }),
        )
    }).then(({ error: o, result: l }) => {
      if (o) throw new Pb(o.message, o.code)
      return l
    })
  }
  async subscribe(e) {
    const n = new TN(e)
    return (
      ut(this, Ou).add(n), await n.subscribe(this), () => n.unsubscribe(this)
    )
  }
}
Vs = new WeakMap()
mu = new WeakMap()
ii = new WeakMap()
Xs = new WeakMap()
Ou = new WeakMap()
Sa = new WeakMap()
cd = new WeakSet()
Nb = function () {
  return ut(this, Xs)
    ? ut(this, Xs)
    : (wa(
        this,
        Xs,
        new Promise(t => {
          var e
          ;(e = ut(this, ii)) == null || e.close(),
            wa(this, ii, new this.options.WebSocketConstructor(this.endpoint)),
            ut(this, ii).addEventListener("open", () => {
              wa(this, mu, 0), t(ut(this, ii))
            }),
            ut(this, ii).addEventListener("close", () => {
              _N(this, mu)._++,
                ut(this, mu) <= this.options.maxReconnects &&
                  setTimeout(() => {
                    Mb(this, cd, jb).call(this)
                  }, this.options.reconnectTimeout)
            }),
            ut(this, ii).addEventListener("message", ({ data: n }) => {
              let s
              try {
                s = JSON.parse(n)
              } catch (o) {
                console.error(
                  new Error(`Failed to parse RPC message: ${n}`, { cause: o }),
                )
                return
              }
              if ("id" in s && s.id != null && ut(this, Sa).has(s.id)) {
                const { resolve: o, timeout: l } = ut(this, Sa).get(s.id)
                clearTimeout(l), o(s)
              } else if ("params" in s) {
                const { params: o } = s
                ut(this, Ou).forEach(l => {
                  l.subscriptionId === o.subscription &&
                    o.subscription === l.subscriptionId &&
                    l.onMessage(o.result)
                })
              }
            })
        }),
      ),
      ut(this, Xs))
}
jb = async function () {
  var t
  return (
    (t = ut(this, ii)) == null || t.close(),
    wa(this, Xs, null),
    Promise.allSettled([...ut(this, Ou)].map(e => e.subscribe(this)))
  )
}
class TN {
  constructor(e) {
    ;(this.subscriptionId = null), (this.subscribed = !1), (this.input = e)
  }
  onMessage(e) {
    this.subscribed && this.input.onMessage(e)
  }
  async unsubscribe(e) {
    const { subscriptionId: n } = this
    return (
      (this.subscribed = !1),
      n == null
        ? !1
        : ((this.subscriptionId = null),
          e.makeRequest(this.input.unsubscribe, [n]))
    )
  }
  async subscribe(e) {
    ;(this.subscriptionId = null), (this.subscribed = !0)
    const n = await e.makeRequest(this.input.method, this.input.params)
    this.subscribed && (this.subscriptionId = n)
  }
}
var Db = t => {
    throw TypeError(t)
  },
  vy = (t, e, n) => e.has(t) || Db("Cannot " + n),
  jn = (t, e, n) => (
    vy(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  hf = (t, e, n) =>
    e.has(t)
      ? Db("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  Jm = (t, e, n, s) => (vy(t, e, "write to private field"), e.set(t, n), n),
  RN = (t, e, n) => (vy(t, e, "access private method"), n),
  su,
  lr,
  gu,
  eg,
  Lb
class PN {
  constructor(e) {
    hf(this, eg), hf(this, su, 0), hf(this, lr), hf(this, gu), Jm(this, lr, e)
  }
  fetch(e, n) {
    const s = jn(this, lr).fetch ?? fetch
    if (!s)
      throw new Error(
        "The current environment does not support fetch, you can provide a fetch implementation in the options for SuiHTTPTransport.",
      )
    return s(e, n)
  }
  async request(e) {
    var o, l
    Jm(this, su, jn(this, su) + 1)
    const n = await this.fetch(
      ((o = jn(this, lr).rpc) == null ? void 0 : o.url) ?? jn(this, lr).url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Sdk-Type": "typescript",
          "Client-Sdk-Version": xN,
          "Client-Target-Api-Version": EN,
          "Client-Request-Method": e.method,
          ...((l = jn(this, lr).rpc) == null ? void 0 : l.headers),
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: jn(this, su),
          method: e.method,
          params: e.params,
        }),
      },
    )
    if (!n.ok)
      throw new CN(
        `Unexpected status code: ${n.status}`,
        n.status,
        n.statusText,
      )
    const s = await n.json()
    if ("error" in s && s.error != null)
      throw new Pb(s.error.message, s.error.code)
    return s.result
  }
  async subscribe(e) {
    const n = await RN(this, eg, Lb).call(this).subscribe(e)
    return async () => !!(await n())
  }
}
su = new WeakMap()
lr = new WeakMap()
gu = new WeakMap()
eg = new WeakSet()
Lb = function () {
  var t
  if (!jn(this, gu)) {
    const e = jn(this, lr).WebSocketConstructor ?? WebSocket
    if (!e)
      throw new Error(
        "The current environment does not support WebSocket, you can provide a WebSocketConstructor in the options for SuiHTTPTransport.",
      )
    Jm(
      this,
      gu,
      new AN(
        ((t = jn(this, lr).websocket) == null ? void 0 : t.url) ??
          jn(this, lr).url,
        { WebSocketConstructor: e, ...jn(this, lr).websocket },
      ),
    )
  }
  return jn(this, gu)
}
function Nf(t) {
  switch (t) {
    case "mainnet":
      return "https://fullnode.mainnet.sui.io:443"
    case "testnet":
      return "https://fullnode.testnet.sui.io:443"
    case "devnet":
      return "https://fullnode.devnet.sui.io:443"
    case "localnet":
      return "http://127.0.0.1:9000"
    default:
      throw new Error(`Unknown network: ${t}`)
  }
}
const Bb = Symbol.for("@mysten/SuiClient")
function IN(t) {
  return typeof t == "object" && t !== null && t[Bb] === !0
}
class Fb {
  get [Bb]() {
    return !0
  }
  constructor(e) {
    this.transport = e.transport ?? new PN({ url: e.url })
  }
  async getRpcApiVersion() {
    return (
      await this.transport.request({ method: "rpc.discover", params: [] })
    ).info.version
  }
  async getCoins(e) {
    if (!e.owner || !ri(He(e.owner))) throw new Error("Invalid Sui address")
    return await this.transport.request({
      method: "suix_getCoins",
      params: [e.owner, e.coinType, e.cursor, e.limit],
    })
  }
  async getAllCoins(e) {
    if (!e.owner || !ri(He(e.owner))) throw new Error("Invalid Sui address")
    return await this.transport.request({
      method: "suix_getAllCoins",
      params: [e.owner, e.cursor, e.limit],
    })
  }
  async getBalance(e) {
    if (!e.owner || !ri(He(e.owner))) throw new Error("Invalid Sui address")
    return await this.transport.request({
      method: "suix_getBalance",
      params: [e.owner, e.coinType],
    })
  }
  async getAllBalances(e) {
    if (!e.owner || !ri(He(e.owner))) throw new Error("Invalid Sui address")
    return await this.transport.request({
      method: "suix_getAllBalances",
      params: [e.owner],
    })
  }
  async getCoinMetadata(e) {
    return await this.transport.request({
      method: "suix_getCoinMetadata",
      params: [e.coinType],
    })
  }
  async getTotalSupply(e) {
    return await this.transport.request({
      method: "suix_getTotalSupply",
      params: [e.coinType],
    })
  }
  async call(e, n) {
    return await this.transport.request({ method: e, params: n })
  }
  async getMoveFunctionArgTypes(e) {
    return await this.transport.request({
      method: "sui_getMoveFunctionArgTypes",
      params: [e.package, e.module, e.function],
    })
  }
  async getNormalizedMoveModulesByPackage(e) {
    return await this.transport.request({
      method: "sui_getNormalizedMoveModulesByPackage",
      params: [e.package],
    })
  }
  async getNormalizedMoveModule(e) {
    return await this.transport.request({
      method: "sui_getNormalizedMoveModule",
      params: [e.package, e.module],
    })
  }
  async getNormalizedMoveFunction(e) {
    return await this.transport.request({
      method: "sui_getNormalizedMoveFunction",
      params: [e.package, e.module, e.function],
    })
  }
  async getNormalizedMoveStruct(e) {
    return await this.transport.request({
      method: "sui_getNormalizedMoveStruct",
      params: [e.package, e.module, e.struct],
    })
  }
  async getOwnedObjects(e) {
    if (!e.owner || !ri(He(e.owner))) throw new Error("Invalid Sui address")
    return await this.transport.request({
      method: "suix_getOwnedObjects",
      params: [
        e.owner,
        { filter: e.filter, options: e.options },
        e.cursor,
        e.limit,
      ],
    })
  }
  async getObject(e) {
    if (!e.id || !nu(li(e.id))) throw new Error("Invalid Sui Object id")
    return await this.transport.request({
      method: "sui_getObject",
      params: [e.id, e.options],
    })
  }
  async tryGetPastObject(e) {
    return await this.transport.request({
      method: "sui_tryGetPastObject",
      params: [e.id, e.version, e.options],
    })
  }
  async multiGetObjects(e) {
    if (
      (e.ids.forEach(s => {
        if (!s || !nu(li(s))) throw new Error(`Invalid Sui Object id ${s}`)
      }),
      e.ids.length !== new Set(e.ids).size)
    )
      throw new Error(`Duplicate object ids in batch call ${e.ids}`)
    return await this.transport.request({
      method: "sui_multiGetObjects",
      params: [e.ids, e.options],
    })
  }
  async queryTransactionBlocks(e) {
    return await this.transport.request({
      method: "suix_queryTransactionBlocks",
      params: [
        { filter: e.filter, options: e.options },
        e.cursor,
        e.limit,
        (e.order || "descending") === "descending",
      ],
    })
  }
  async getTransactionBlock(e) {
    if (!pS(e.digest)) throw new Error("Invalid Transaction digest")
    return await this.transport.request({
      method: "sui_getTransactionBlock",
      params: [e.digest, e.options],
    })
  }
  async multiGetTransactionBlocks(e) {
    if (
      (e.digests.forEach(s => {
        if (!pS(s)) throw new Error(`Invalid Transaction digest ${s}`)
      }),
      e.digests.length !== new Set(e.digests).size)
    )
      throw new Error(`Duplicate digests in batch call ${e.digests}`)
    return await this.transport.request({
      method: "sui_multiGetTransactionBlocks",
      params: [e.digests, e.options],
    })
  }
  async executeTransactionBlock({
    transactionBlock: e,
    signature: n,
    options: s,
    requestType: o,
  }) {
    const l = await this.transport.request({
      method: "sui_executeTransactionBlock",
      params: [typeof e == "string" ? e : Ke(e), Array.isArray(n) ? n : [n], s],
    })
    if (o === "WaitForLocalExecution")
      try {
        await this.waitForTransaction({ digest: l.digest })
      } catch {}
    return l
  }
  async signAndExecuteTransaction({ transaction: e, signer: n, ...s }) {
    let o
    e instanceof Uint8Array
      ? (o = e)
      : (e.setSenderIfNotSet(n.toSuiAddress()),
        (o = await e.build({ client: this })))
    const { signature: l, bytes: u } = await n.signTransaction(o)
    return this.executeTransactionBlock({
      transactionBlock: u,
      signature: l,
      ...s,
    })
  }
  async getTotalTransactionBlocks() {
    const e = await this.transport.request({
      method: "sui_getTotalTransactionBlocks",
      params: [],
    })
    return BigInt(e)
  }
  async getReferenceGasPrice() {
    const e = await this.transport.request({
      method: "suix_getReferenceGasPrice",
      params: [],
    })
    return BigInt(e)
  }
  async getStakes(e) {
    if (!e.owner || !ri(He(e.owner))) throw new Error("Invalid Sui address")
    return await this.transport.request({
      method: "suix_getStakes",
      params: [e.owner],
    })
  }
  async getStakesByIds(e) {
    return (
      e.stakedSuiIds.forEach(n => {
        if (!n || !nu(li(n))) throw new Error(`Invalid Sui Stake id ${n}`)
      }),
      await this.transport.request({
        method: "suix_getStakesByIds",
        params: [e.stakedSuiIds],
      })
    )
  }
  async getLatestSuiSystemState() {
    return await this.transport.request({
      method: "suix_getLatestSuiSystemState",
      params: [],
    })
  }
  async queryEvents(e) {
    return await this.transport.request({
      method: "suix_queryEvents",
      params: [
        e.query,
        e.cursor,
        e.limit,
        (e.order || "descending") === "descending",
      ],
    })
  }
  async subscribeEvent(e) {
    return this.transport.subscribe({
      method: "suix_subscribeEvent",
      unsubscribe: "suix_unsubscribeEvent",
      params: [e.filter],
      onMessage: e.onMessage,
    })
  }
  async subscribeTransaction(e) {
    return this.transport.subscribe({
      method: "suix_subscribeTransaction",
      unsubscribe: "suix_unsubscribeTransaction",
      params: [e.filter],
      onMessage: e.onMessage,
    })
  }
  async devInspectTransactionBlock(e) {
    var s
    let n
    if (vE(e.transactionBlock))
      e.transactionBlock.setSenderIfNotSet(e.sender),
        (n = Ke(
          await e.transactionBlock.build({
            client: this,
            onlyTransactionKind: !0,
          }),
        ))
    else if (typeof e.transactionBlock == "string") n = e.transactionBlock
    else if (e.transactionBlock instanceof Uint8Array)
      n = Ke(e.transactionBlock)
    else throw new Error("Unknown transaction block format.")
    return await this.transport.request({
      method: "sui_devInspectTransactionBlock",
      params: [
        e.sender,
        n,
        (s = e.gasPrice) == null ? void 0 : s.toString(),
        e.epoch,
      ],
    })
  }
  async dryRunTransactionBlock(e) {
    return await this.transport.request({
      method: "sui_dryRunTransactionBlock",
      params: [
        typeof e.transactionBlock == "string"
          ? e.transactionBlock
          : Ke(e.transactionBlock),
      ],
    })
  }
  async getDynamicFields(e) {
    if (!e.parentId || !nu(li(e.parentId)))
      throw new Error("Invalid Sui Object id")
    return await this.transport.request({
      method: "suix_getDynamicFields",
      params: [e.parentId, e.cursor, e.limit],
    })
  }
  async getDynamicFieldObject(e) {
    return await this.transport.request({
      method: "suix_getDynamicFieldObject",
      params: [e.parentId, e.name],
    })
  }
  async getLatestCheckpointSequenceNumber() {
    const e = await this.transport.request({
      method: "sui_getLatestCheckpointSequenceNumber",
      params: [],
    })
    return String(e)
  }
  async getCheckpoint(e) {
    return await this.transport.request({
      method: "sui_getCheckpoint",
      params: [e.id],
    })
  }
  async getCheckpoints(e) {
    return await this.transport.request({
      method: "sui_getCheckpoints",
      params: [e.cursor, e == null ? void 0 : e.limit, e.descendingOrder],
    })
  }
  async getCommitteeInfo(e) {
    return await this.transport.request({
      method: "suix_getCommitteeInfo",
      params: [e == null ? void 0 : e.epoch],
    })
  }
  async getNetworkMetrics() {
    return await this.transport.request({
      method: "suix_getNetworkMetrics",
      params: [],
    })
  }
  async getAddressMetrics() {
    return await this.transport.request({
      method: "suix_getLatestAddressMetrics",
      params: [],
    })
  }
  async getEpochMetrics(e) {
    return await this.transport.request({
      method: "suix_getEpochMetrics",
      params: [
        e == null ? void 0 : e.cursor,
        e == null ? void 0 : e.limit,
        e == null ? void 0 : e.descendingOrder,
      ],
    })
  }
  async getAllEpochAddressMetrics(e) {
    return await this.transport.request({
      method: "suix_getAllEpochAddressMetrics",
      params: [e == null ? void 0 : e.descendingOrder],
    })
  }
  async getEpochs(e) {
    return await this.transport.request({
      method: "suix_getEpochs",
      params: [
        e == null ? void 0 : e.cursor,
        e == null ? void 0 : e.limit,
        e == null ? void 0 : e.descendingOrder,
      ],
    })
  }
  async getMoveCallMetrics() {
    return await this.transport.request({
      method: "suix_getMoveCallMetrics",
      params: [],
    })
  }
  async getCurrentEpoch() {
    return await this.transport.request({
      method: "suix_getCurrentEpoch",
      params: [],
    })
  }
  async getValidatorsApy() {
    return await this.transport.request({
      method: "suix_getValidatorsApy",
      params: [],
    })
  }
  async getChainIdentifier() {
    const e = await this.getCheckpoint({ id: "0" }),
      n = Su(e.digest)
    return Ua(n.slice(0, 4))
  }
  async resolveNameServiceAddress(e) {
    return await this.transport.request({
      method: "suix_resolveNameServiceAddress",
      params: [e.name],
    })
  }
  async resolveNameServiceNames({ format: e = "dot", ...n }) {
    const {
      nextCursor: s,
      hasNextPage: o,
      data: l,
    } = await this.transport.request({
      method: "suix_resolveNameServiceNames",
      params: [n.address, n.cursor, n.limit],
    })
    return { hasNextPage: o, nextCursor: s, data: l.map(u => jT(u, e)) }
  }
  async getProtocolConfig(e) {
    return await this.transport.request({
      method: "sui_getProtocolConfig",
      params: [e == null ? void 0 : e.version],
    })
  }
  async waitForTransaction({
    signal: e,
    timeout: n = 60 * 1e3,
    pollInterval: s = 2 * 1e3,
    ...o
  }) {
    const l = AbortSignal.timeout(n),
      u = new Promise((f, d) => {
        l.addEventListener("abort", () => d(l.reason))
      })
    for (u.catch(() => {}); !l.aborted; ) {
      e == null || e.throwIfAborted()
      try {
        return await this.getTransactionBlock(o)
      } catch {
        await Promise.race([new Promise(d => setTimeout(d, s)), u])
      }
    }
    throw (
      (l.throwIfAborted(),
      new Error("Unexpected error while waiting for transaction block."))
    )
  }
}
function MN(t, e, n, s) {
  if (typeof t.setBigUint64 == "function") return t.setBigUint64(e, n, s)
  const o = BigInt(32),
    l = BigInt(4294967295),
    u = Number((n >> o) & l),
    f = Number(n & l),
    d = s ? 4 : 0,
    m = s ? 0 : 4
  t.setUint32(e + d, u, s), t.setUint32(e + m, f, s)
}
class NN extends Wg {
  constructor(e, n, s, o) {
    super(),
      (this.blockLen = e),
      (this.outputLen = n),
      (this.padOffset = s),
      (this.isLE = o),
      (this.finished = !1),
      (this.length = 0),
      (this.pos = 0),
      (this.destroyed = !1),
      (this.buffer = new Uint8Array(e)),
      (this.view = Rf(this.buffer))
  }
  update(e) {
    za(this)
    const { view: n, buffer: s, blockLen: o } = this
    e = Ir(e)
    const l = e.length
    for (let u = 0; u < l; ) {
      const f = Math.min(o - this.pos, l - u)
      if (f === o) {
        const d = Rf(e)
        for (; o <= l - u; u += o) this.process(d, u)
        continue
      }
      s.set(e.subarray(u, u + f), this.pos),
        (this.pos += f),
        (u += f),
        this.pos === o && (this.process(n, 0), (this.pos = 0))
    }
    return (this.length += e.length), this.roundClean(), this
  }
  digestInto(e) {
    za(this), oE(e, this), (this.finished = !0)
    const { buffer: n, view: s, blockLen: o, isLE: l } = this
    let { pos: u } = this
    ;(n[u++] = 128),
      this.buffer.subarray(u).fill(0),
      this.padOffset > o - u && (this.process(s, 0), (u = 0))
    for (let g = u; g < o; g++) n[g] = 0
    MN(s, o - 8, BigInt(this.length * 8), l), this.process(s, 0)
    const f = Rf(e),
      d = this.outputLen
    if (d % 4) throw new Error("_sha2: outputLen should be aligned to 32bit")
    const m = d / 4,
      h = this.get()
    if (m > h.length) throw new Error("_sha2: outputLen bigger than state")
    for (let g = 0; g < m; g++) f.setUint32(4 * g, h[g], l)
  }
  digest() {
    const { buffer: e, outputLen: n } = this
    this.digestInto(e)
    const s = e.slice(0, n)
    return this.destroy(), s
  }
  _cloneInto(e) {
    e || (e = new this.constructor()), e.set(...this.get())
    const {
      blockLen: n,
      buffer: s,
      length: o,
      finished: l,
      destroyed: u,
      pos: f,
    } = this
    return (
      (e.length = o),
      (e.pos = f),
      (e.finished = l),
      (e.destroyed = u),
      o % n && e.buffer.set(s),
      e
    )
  }
}
class Ub extends Wg {
  constructor(e, n) {
    super(), (this.finished = !1), (this.destroyed = !1), sE(e)
    const s = Ir(n)
    if (((this.iHash = e.create()), typeof this.iHash.update != "function"))
      throw new Error("Expected instance of class which extends utils.Hash")
    ;(this.blockLen = this.iHash.blockLen),
      (this.outputLen = this.iHash.outputLen)
    const o = this.blockLen,
      l = new Uint8Array(o)
    l.set(s.length > o ? e.create().update(s).digest() : s)
    for (let u = 0; u < l.length; u++) l[u] ^= 54
    this.iHash.update(l), (this.oHash = e.create())
    for (let u = 0; u < l.length; u++) l[u] ^= 106
    this.oHash.update(l), l.fill(0)
  }
  update(e) {
    return za(this), this.iHash.update(e), this
  }
  digestInto(e) {
    za(this),
      Ad(e, this.outputLen),
      (this.finished = !0),
      this.iHash.digestInto(e),
      this.oHash.update(e),
      this.oHash.digestInto(e),
      this.destroy()
  }
  digest() {
    const e = new Uint8Array(this.oHash.outputLen)
    return this.digestInto(e), e
  }
  _cloneInto(e) {
    e || (e = Object.create(Object.getPrototypeOf(this), {}))
    const {
      oHash: n,
      iHash: s,
      finished: o,
      destroyed: l,
      blockLen: u,
      outputLen: f,
    } = this
    return (
      (e = e),
      (e.finished = o),
      (e.destroyed = l),
      (e.blockLen = u),
      (e.outputLen = f),
      (e.oHash = n._cloneInto(e.oHash)),
      (e.iHash = s._cloneInto(e.iHash)),
      e
    )
  }
  destroy() {
    ;(this.destroyed = !0), this.oHash.destroy(), this.iHash.destroy()
  }
}
const Fd = (t, e, n) => new Ub(t, e).update(n).digest()
Fd.create = (t, e) => new Ub(t, e)
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const wy =
    BigInt(0),
  zb = BigInt(1),
  jN = BigInt(2)
function Sy(t) {
  return (
    t instanceof Uint8Array ||
    (ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array")
  )
}
function xy(t) {
  if (!Sy(t)) throw new Error("Uint8Array expected")
}
function cm(t, e) {
  if (typeof e != "boolean") throw new Error(t + " boolean expected, got " + e)
}
const DN = Array.from({ length: 256 }, (t, e) =>
  e.toString(16).padStart(2, "0"),
)
function Ey(t) {
  xy(t)
  let e = ""
  for (let n = 0; n < t.length; n++) e += DN[t[n]]
  return e
}
function $b(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t)
  return t === "" ? wy : BigInt("0x" + t)
}
const Xr = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 }
function BS(t) {
  if (t >= Xr._0 && t <= Xr._9) return t - Xr._0
  if (t >= Xr.A && t <= Xr.F) return t - (Xr.A - 10)
  if (t >= Xr.a && t <= Xr.f) return t - (Xr.a - 10)
}
function Wb(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t)
  const e = t.length,
    n = e / 2
  if (e % 2)
    throw new Error("hex string expected, got unpadded hex of length " + e)
  const s = new Uint8Array(n)
  for (let o = 0, l = 0; o < n; o++, l += 2) {
    const u = BS(t.charCodeAt(l)),
      f = BS(t.charCodeAt(l + 1))
    if (u === void 0 || f === void 0) {
      const d = t[l] + t[l + 1]
      throw new Error(
        'hex string expected, got non-hex character "' + d + '" at index ' + l,
      )
    }
    s[o] = u * 16 + f
  }
  return s
}
function LN(t) {
  return $b(Ey(t))
}
function jf(t) {
  return xy(t), $b(Ey(Uint8Array.from(t).reverse()))
}
function Vb(t, e) {
  return Wb(t.toString(16).padStart(e * 2, "0"))
}
function tg(t, e) {
  return Vb(t, e).reverse()
}
function Zr(t, e, n) {
  let s
  if (typeof e == "string")
    try {
      s = Wb(e)
    } catch (l) {
      throw new Error(t + " must be hex string or Uint8Array, cause: " + l)
    }
  else if (Sy(e)) s = Uint8Array.from(e)
  else throw new Error(t + " must be hex string or Uint8Array")
  const o = s.length
  if (typeof n == "number" && o !== n)
    throw new Error(t + " of length " + n + " expected, got " + o)
  return s
}
function FS(...t) {
  let e = 0
  for (let s = 0; s < t.length; s++) {
    const o = t[s]
    xy(o), (e += o.length)
  }
  const n = new Uint8Array(e)
  for (let s = 0, o = 0; s < t.length; s++) {
    const l = t[s]
    n.set(l, o), (o += l.length)
  }
  return n
}
const fm = t => typeof t == "bigint" && wy <= t
function BN(t, e, n) {
  return fm(t) && fm(e) && fm(n) && e <= t && t < n
}
function ql(t, e, n, s) {
  if (!BN(e, n, s))
    throw new Error(
      "expected valid " + t + ": " + n + " <= n < " + s + ", got " + e,
    )
}
function FN(t) {
  let e
  for (e = 0; t > wy; t >>= zb, e += 1);
  return e
}
const UN = t => (jN << BigInt(t - 1)) - zb,
  zN = {
    bigint: t => typeof t == "bigint",
    function: t => typeof t == "function",
    boolean: t => typeof t == "boolean",
    string: t => typeof t == "string",
    stringOrUint8Array: t => typeof t == "string" || Sy(t),
    isSafeInteger: t => Number.isSafeInteger(t),
    array: t => Array.isArray(t),
    field: (t, e) => e.Fp.isValid(t),
    hash: t => typeof t == "function" && Number.isSafeInteger(t.outputLen),
  }
function by(t, e, n = {}) {
  const s = (o, l, u) => {
    const f = zN[l]
    if (typeof f != "function") throw new Error("invalid validator function")
    const d = t[o]
    if (!(u && d === void 0) && !f(d, t))
      throw new Error(
        "param " + String(o) + " is invalid. Expected " + l + ", got " + d,
      )
  }
  for (const [o, l] of Object.entries(e)) s(o, l, !1)
  for (const [o, l] of Object.entries(n)) s(o, l, !0)
  return t
}
function US(t) {
  const e = new WeakMap()
  return (n, ...s) => {
    const o = e.get(n)
    if (o !== void 0) return o
    const l = t(n, ...s)
    return e.set(n, l), l
  }
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Rt =
    BigInt(0),
  mt = BigInt(1),
  qs = BigInt(2),
  $N = BigInt(3),
  ng = BigInt(4),
  zS = BigInt(5),
  $S = BigInt(8)
function Et(t, e) {
  const n = t % e
  return n >= Rt ? n : e + n
}
function WN(t, e, n) {
  if (e < Rt) throw new Error("invalid exponent, negatives unsupported")
  if (n <= Rt) throw new Error("invalid modulus")
  if (n === mt) return Rt
  let s = mt
  for (; e > Rt; ) e & mt && (s = (s * t) % n), (t = (t * t) % n), (e >>= mt)
  return s
}
function xr(t, e, n) {
  let s = t
  for (; e-- > Rt; ) (s *= s), (s %= n)
  return s
}
function WS(t, e) {
  if (t === Rt) throw new Error("invert: expected non-zero number")
  if (e <= Rt) throw new Error("invert: expected positive modulus, got " + e)
  let n = Et(t, e),
    s = e,
    o = Rt,
    l = mt
  for (; n !== Rt; ) {
    const f = s / n,
      d = s % n,
      m = o - l * f
    ;(s = n), (n = d), (o = l), (l = m)
  }
  if (s !== mt) throw new Error("invert: does not exist")
  return Et(o, e)
}
function VN(t) {
  const e = (t - mt) / qs
  let n, s, o
  for (n = t - mt, s = 0; n % qs === Rt; n /= qs, s++);
  for (o = qs; o < t && WN(o, e, t) !== t - mt; o++)
    if (o > 1e3) throw new Error("Cannot find square root: likely non-prime P")
  if (s === 1) {
    const u = (t + mt) / ng
    return function (d, m) {
      const h = d.pow(m, u)
      if (!d.eql(d.sqr(h), m)) throw new Error("Cannot find square root")
      return h
    }
  }
  const l = (n + mt) / qs
  return function (f, d) {
    if (f.pow(d, e) === f.neg(f.ONE)) throw new Error("Cannot find square root")
    let m = s,
      h = f.pow(f.mul(f.ONE, o), n),
      g = f.pow(d, l),
      w = f.pow(d, n)
    for (; !f.eql(w, f.ONE); ) {
      if (f.eql(w, f.ZERO)) return f.ZERO
      let b = 1
      for (let S = f.sqr(w); b < m && !f.eql(S, f.ONE); b++) S = f.sqr(S)
      const E = f.pow(h, mt << BigInt(m - b - 1))
      ;(h = f.sqr(E)), (g = f.mul(g, E)), (w = f.mul(w, h)), (m = b)
    }
    return g
  }
}
function HN(t) {
  if (t % ng === $N) {
    const e = (t + mt) / ng
    return function (s, o) {
      const l = s.pow(o, e)
      if (!s.eql(s.sqr(l), o)) throw new Error("Cannot find square root")
      return l
    }
  }
  if (t % $S === zS) {
    const e = (t - zS) / $S
    return function (s, o) {
      const l = s.mul(o, qs),
        u = s.pow(l, e),
        f = s.mul(o, u),
        d = s.mul(s.mul(f, qs), u),
        m = s.mul(f, s.sub(d, s.ONE))
      if (!s.eql(s.sqr(m), o)) throw new Error("Cannot find square root")
      return m
    }
  }
  return VN(t)
}
const GN = (t, e) => (Et(t, e) & mt) === mt,
  KN = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN",
  ]
function qN(t) {
  const e = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "isSafeInteger",
      BITS: "isSafeInteger",
    },
    n = KN.reduce((s, o) => ((s[o] = "function"), s), e)
  return by(t, n)
}
function QN(t, e, n) {
  if (n < Rt) throw new Error("invalid exponent, negatives unsupported")
  if (n === Rt) return t.ONE
  if (n === mt) return e
  let s = t.ONE,
    o = e
  for (; n > Rt; ) n & mt && (s = t.mul(s, o)), (o = t.sqr(o)), (n >>= mt)
  return s
}
function YN(t, e) {
  const n = new Array(e.length),
    s = e.reduce(
      (l, u, f) => (t.is0(u) ? l : ((n[f] = l), t.mul(l, u))),
      t.ONE,
    ),
    o = t.inv(s)
  return (
    e.reduceRight(
      (l, u, f) => (t.is0(u) ? l : ((n[f] = t.mul(l, n[f])), t.mul(l, u))),
      o,
    ),
    n
  )
}
function Hb(t, e) {
  const n = e !== void 0 ? e : t.toString(2).length,
    s = Math.ceil(n / 8)
  return { nBitLength: n, nByteLength: s }
}
function Gb(t, e, n = !1, s = {}) {
  if (t <= Rt) throw new Error("invalid field: expected ORDER > 0, got " + t)
  const { nBitLength: o, nByteLength: l } = Hb(t, e)
  if (l > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes")
  let u
  const f = Object.freeze({
    ORDER: t,
    isLE: n,
    BITS: o,
    BYTES: l,
    MASK: UN(o),
    ZERO: Rt,
    ONE: mt,
    create: d => Et(d, t),
    isValid: d => {
      if (typeof d != "bigint")
        throw new Error(
          "invalid field element: expected bigint, got " + typeof d,
        )
      return Rt <= d && d < t
    },
    is0: d => d === Rt,
    isOdd: d => (d & mt) === mt,
    neg: d => Et(-d, t),
    eql: (d, m) => d === m,
    sqr: d => Et(d * d, t),
    add: (d, m) => Et(d + m, t),
    sub: (d, m) => Et(d - m, t),
    mul: (d, m) => Et(d * m, t),
    pow: (d, m) => QN(f, d, m),
    div: (d, m) => Et(d * WS(m, t), t),
    sqrN: d => d * d,
    addN: (d, m) => d + m,
    subN: (d, m) => d - m,
    mulN: (d, m) => d * m,
    inv: d => WS(d, t),
    sqrt: s.sqrt || (d => (u || (u = HN(t)), u(f, d))),
    invertBatch: d => YN(f, d),
    cmov: (d, m, h) => (h ? m : d),
    toBytes: d => (n ? tg(d, l) : Vb(d, l)),
    fromBytes: d => {
      if (d.length !== l)
        throw new Error(
          "Field.fromBytes: expected " + l + " bytes, got " + d.length,
        )
      return n ? jf(d) : LN(d)
    },
  })
  return Object.freeze(f)
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const VS =
    BigInt(0),
  pf = BigInt(1)
function dm(t, e) {
  const n = e.negate()
  return t ? n : e
}
function Kb(t, e) {
  if (!Number.isSafeInteger(t) || t <= 0 || t > e)
    throw new Error("invalid window size, expected [1.." + e + "], got W=" + t)
}
function hm(t, e) {
  Kb(t, e)
  const n = Math.ceil(e / t) + 1,
    s = 2 ** (t - 1)
  return { windows: n, windowSize: s }
}
function XN(t, e) {
  if (!Array.isArray(t)) throw new Error("array expected")
  t.forEach((n, s) => {
    if (!(n instanceof e)) throw new Error("invalid point at index " + s)
  })
}
function ZN(t, e) {
  if (!Array.isArray(t)) throw new Error("array of scalars expected")
  t.forEach((n, s) => {
    if (!e.isValid(n)) throw new Error("invalid scalar at index " + s)
  })
}
const pm = new WeakMap(),
  qb = new WeakMap()
function mm(t) {
  return qb.get(t) || 1
}
function JN(t, e) {
  return {
    constTimeNegate: dm,
    hasPrecomputes(n) {
      return mm(n) !== 1
    },
    unsafeLadder(n, s, o = t.ZERO) {
      let l = n
      for (; s > VS; ) s & pf && (o = o.add(l)), (l = l.double()), (s >>= pf)
      return o
    },
    precomputeWindow(n, s) {
      const { windows: o, windowSize: l } = hm(s, e),
        u = []
      let f = n,
        d = f
      for (let m = 0; m < o; m++) {
        ;(d = f), u.push(d)
        for (let h = 1; h < l; h++) (d = d.add(f)), u.push(d)
        f = d.double()
      }
      return u
    },
    wNAF(n, s, o) {
      const { windows: l, windowSize: u } = hm(n, e)
      let f = t.ZERO,
        d = t.BASE
      const m = BigInt(2 ** n - 1),
        h = 2 ** n,
        g = BigInt(n)
      for (let w = 0; w < l; w++) {
        const b = w * u
        let E = Number(o & m)
        ;(o >>= g), E > u && ((E -= h), (o += pf))
        const S = b,
          C = b + Math.abs(E) - 1,
          _ = w % 2 !== 0,
          A = E < 0
        E === 0 ? (d = d.add(dm(_, s[S]))) : (f = f.add(dm(A, s[C])))
      }
      return { p: f, f: d }
    },
    wNAFUnsafe(n, s, o, l = t.ZERO) {
      const { windows: u, windowSize: f } = hm(n, e),
        d = BigInt(2 ** n - 1),
        m = 2 ** n,
        h = BigInt(n)
      for (let g = 0; g < u; g++) {
        const w = g * f
        if (o === VS) break
        let b = Number(o & d)
        if (((o >>= h), b > f && ((b -= m), (o += pf)), b === 0)) continue
        let E = s[w + Math.abs(b) - 1]
        b < 0 && (E = E.negate()), (l = l.add(E))
      }
      return l
    },
    getPrecomputes(n, s, o) {
      let l = pm.get(s)
      return (
        l || ((l = this.precomputeWindow(s, n)), n !== 1 && pm.set(s, o(l))), l
      )
    },
    wNAFCached(n, s, o) {
      const l = mm(n)
      return this.wNAF(l, this.getPrecomputes(l, n, o), s)
    },
    wNAFCachedUnsafe(n, s, o, l) {
      const u = mm(n)
      return u === 1
        ? this.unsafeLadder(n, s, l)
        : this.wNAFUnsafe(u, this.getPrecomputes(u, n, o), s, l)
    },
    setWindowSize(n, s) {
      Kb(s, e), qb.set(n, s), pm.delete(n)
    },
  }
}
function ej(t, e, n, s) {
  if ((XN(n, t), ZN(s, e), n.length !== s.length))
    throw new Error("arrays of points and scalars must have equal length")
  const o = t.ZERO,
    l = FN(BigInt(n.length)),
    u = l > 12 ? l - 3 : l > 4 ? l - 2 : l ? 2 : 1,
    f = (1 << u) - 1,
    d = new Array(f + 1).fill(o),
    m = Math.floor((e.BITS - 1) / u) * u
  let h = o
  for (let g = m; g >= 0; g -= u) {
    d.fill(o)
    for (let b = 0; b < s.length; b++) {
      const E = s[b],
        S = Number((E >> BigInt(g)) & BigInt(f))
      d[S] = d[S].add(n[b])
    }
    let w = o
    for (let b = d.length - 1, E = o; b > 0; b--)
      (E = E.add(d[b])), (w = w.add(E))
    if (((h = h.add(w)), g !== 0)) for (let b = 0; b < u; b++) h = h.double()
  }
  return h
}
function tj(t) {
  return (
    qN(t.Fp),
    by(
      t,
      { n: "bigint", h: "bigint", Gx: "field", Gy: "field" },
      { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" },
    ),
    Object.freeze({ ...Hb(t.n, t.nBitLength), ...t, p: t.Fp.ORDER })
  )
}
function Qb(t, e) {
  return Me.IntentMessage(Me.fixedArray(e.length, Me.u8()))
    .serialize({
      intent: { scope: { [t]: !0 }, version: { V0: !0 }, appId: { Sui: !0 } },
      value: e,
    })
    .toBytes()
}
const Cy = {
    ED25519: 0,
    Secp256k1: 1,
    Secp256r1: 2,
    MultiSig: 3,
    ZkLogin: 5,
    Passkey: 6,
  },
  nj = { ED25519: 32, Secp256k1: 33, Secp256r1: 33 },
  Yb = {
    0: "ED25519",
    1: "Secp256k1",
    2: "Secp256r1",
    3: "MultiSig",
    5: "ZkLogin",
    6: "Passkey",
  }
function Xb(t, e) {
  if (t === e) return !0
  if (t.length !== e.length) return !1
  for (let n = 0; n < t.length; n++) if (t[n] !== e[n]) return !1
  return !0
}
class rj {
  equals(e) {
    return Xb(this.toRawBytes(), e.toRawBytes())
  }
  toBase64() {
    return Ke(this.toRawBytes())
  }
  toString() {
    throw new Error(
      "`toString` is not implemented on public keys. Use `toBase64()` or `toRawBytes()` instead.",
    )
  }
  toSuiPublicKey() {
    const e = this.toSuiBytes()
    return Ke(e)
  }
  verifyWithIntent(e, n, s) {
    const o = Qb(s, e),
      l = rd(o, { dkLen: 32 })
    return this.verify(l, n)
  }
  verifyPersonalMessage(e, n) {
    return this.verifyWithIntent(
      Me.vector(Me.u8()).serialize(e).toBytes(),
      n,
      "PersonalMessage",
    )
  }
  verifyTransaction(e, n) {
    return this.verifyWithIntent(e, n, "TransactionData")
  }
  verifyAddress(e) {
    return this.toSuiAddress() === e
  }
  toSuiBytes() {
    const e = this.toRawBytes(),
      n = new Uint8Array(e.length + 1)
    return n.set([this.flag()]), n.set(e, 1), n
  }
  toSuiAddress() {
    return He(UT(rd(this.toSuiBytes(), { dkLen: 32 })).slice(0, Od * 2))
  }
}
function ij(t) {
  const e = Dn(t),
    n = Yb[e[0]]
  switch (n) {
    case "ED25519":
    case "Secp256k1":
    case "Secp256r1":
      const s = nj[n],
        o = e.slice(1, e.length - s),
        l = e.slice(1 + o.length)
      return {
        serializedSignature: t,
        signatureScheme: n,
        signature: o,
        publicKey: l,
        bytes: e,
      }
    default:
      throw new Error("Unsupported signature scheme")
  }
}
function sj({ signature: t, signatureScheme: e, publicKey: n }) {
  if (!n) throw new Error("`publicKey` is required")
  const s = n.toRawBytes(),
    o = new Uint8Array(1 + t.length + s.length)
  return o.set([Cy[e]]), o.set(t, 1), o.set(s, 1 + t.length), Ke(o)
}
function oj(t, e, n, s) {
  sE(t)
  const o = $T({ dkLen: 32, asyncTick: 10 }, s),
    { c: l, dkLen: u, asyncTick: f } = o
  if ((ls(l), ls(u), ls(f), l < 1))
    throw new Error("PBKDF2: iterations (c) should be >= 1")
  const d = Ir(e),
    m = Ir(n),
    h = new Uint8Array(u),
    g = Fd.create(t, d),
    w = g._cloneInto().update(m)
  return { c: l, dkLen: u, asyncTick: f, DK: h, PRF: g, PRFSalt: w }
}
function aj(t, e, n, s, o) {
  return t.destroy(), e.destroy(), s && s.destroy(), o.fill(0), n
}
function lj(t, e, n, s) {
  const { c: o, dkLen: l, DK: u, PRF: f, PRFSalt: d } = oj(t, e, n, s)
  let m
  const h = new Uint8Array(4),
    g = Rf(h),
    w = new Uint8Array(f.outputLen)
  for (let b = 1, E = 0; E < l; b++, E += f.outputLen) {
    const S = u.subarray(E, E + f.outputLen)
    g.setInt32(0, b, !1),
      (m = d._cloneInto(m)).update(h).digestInto(w),
      S.set(w.subarray(0, S.length))
    for (let C = 1; C < o; C++) {
      f._cloneInto(m).update(w).digestInto(w)
      for (let _ = 0; _ < S.length; _++) S[_] ^= w[_]
    }
  }
  return aj(f, d, u, m, w)
}
const [uj, cj] = ge.split(
    [
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817",
    ].map(t => BigInt(t)),
  ),
  $i = new Uint32Array(80),
  Wi = new Uint32Array(80)
class fj extends NN {
  constructor() {
    super(128, 64, 16, !1),
      (this.Ah = 1779033703),
      (this.Al = -205731576),
      (this.Bh = -1150833019),
      (this.Bl = -2067093701),
      (this.Ch = 1013904242),
      (this.Cl = -23791573),
      (this.Dh = -1521486534),
      (this.Dl = 1595750129),
      (this.Eh = 1359893119),
      (this.El = -1377402159),
      (this.Fh = -1694144372),
      (this.Fl = 725511199),
      (this.Gh = 528734635),
      (this.Gl = -79577749),
      (this.Hh = 1541459225),
      (this.Hl = 327033209)
  }
  get() {
    const {
      Ah: e,
      Al: n,
      Bh: s,
      Bl: o,
      Ch: l,
      Cl: u,
      Dh: f,
      Dl: d,
      Eh: m,
      El: h,
      Fh: g,
      Fl: w,
      Gh: b,
      Gl: E,
      Hh: S,
      Hl: C,
    } = this
    return [e, n, s, o, l, u, f, d, m, h, g, w, b, E, S, C]
  }
  set(e, n, s, o, l, u, f, d, m, h, g, w, b, E, S, C) {
    ;(this.Ah = e | 0),
      (this.Al = n | 0),
      (this.Bh = s | 0),
      (this.Bl = o | 0),
      (this.Ch = l | 0),
      (this.Cl = u | 0),
      (this.Dh = f | 0),
      (this.Dl = d | 0),
      (this.Eh = m | 0),
      (this.El = h | 0),
      (this.Fh = g | 0),
      (this.Fl = w | 0),
      (this.Gh = b | 0),
      (this.Gl = E | 0),
      (this.Hh = S | 0),
      (this.Hl = C | 0)
  }
  process(e, n) {
    for (let O = 0; O < 16; O++, n += 4)
      ($i[O] = e.getUint32(n)), (Wi[O] = e.getUint32((n += 4)))
    for (let O = 16; O < 80; O++) {
      const M = $i[O - 15] | 0,
        D = Wi[O - 15] | 0,
        K = ge.rotrSH(M, D, 1) ^ ge.rotrSH(M, D, 8) ^ ge.shrSH(M, D, 7),
        W = ge.rotrSL(M, D, 1) ^ ge.rotrSL(M, D, 8) ^ ge.shrSL(M, D, 7),
        q = $i[O - 2] | 0,
        Z = Wi[O - 2] | 0,
        le = ge.rotrSH(q, Z, 19) ^ ge.rotrBH(q, Z, 61) ^ ge.shrSH(q, Z, 6),
        Ce = ge.rotrSL(q, Z, 19) ^ ge.rotrBL(q, Z, 61) ^ ge.shrSL(q, Z, 6),
        Ae = ge.add4L(W, Ce, Wi[O - 7], Wi[O - 16]),
        Te = ge.add4H(Ae, K, le, $i[O - 7], $i[O - 16])
      ;($i[O] = Te | 0), (Wi[O] = Ae | 0)
    }
    let {
      Ah: s,
      Al: o,
      Bh: l,
      Bl: u,
      Ch: f,
      Cl: d,
      Dh: m,
      Dl: h,
      Eh: g,
      El: w,
      Fh: b,
      Fl: E,
      Gh: S,
      Gl: C,
      Hh: _,
      Hl: A,
    } = this
    for (let O = 0; O < 80; O++) {
      const M = ge.rotrSH(g, w, 14) ^ ge.rotrSH(g, w, 18) ^ ge.rotrBH(g, w, 41),
        D = ge.rotrSL(g, w, 14) ^ ge.rotrSL(g, w, 18) ^ ge.rotrBL(g, w, 41),
        K = (g & b) ^ (~g & S),
        W = (w & E) ^ (~w & C),
        q = ge.add5L(A, D, W, cj[O], Wi[O]),
        Z = ge.add5H(q, _, M, K, uj[O], $i[O]),
        le = q | 0,
        Ce = ge.rotrSH(s, o, 28) ^ ge.rotrBH(s, o, 34) ^ ge.rotrBH(s, o, 39),
        Ae = ge.rotrSL(s, o, 28) ^ ge.rotrBL(s, o, 34) ^ ge.rotrBL(s, o, 39),
        Te = (s & l) ^ (s & f) ^ (l & f),
        Pe = (o & u) ^ (o & d) ^ (u & d)
      ;(_ = S | 0),
        (A = C | 0),
        (S = b | 0),
        (C = E | 0),
        (b = g | 0),
        (E = w | 0),
        ({ h: g, l: w } = ge.add(m | 0, h | 0, Z | 0, le | 0)),
        (m = f | 0),
        (h = d | 0),
        (f = l | 0),
        (d = u | 0),
        (l = s | 0),
        (u = o | 0)
      const Ue = ge.add3L(le, Ae, Pe)
      ;(s = ge.add3H(Ue, Z, Ce, Te)), (o = Ue | 0)
    }
    ;({ h: s, l: o } = ge.add(this.Ah | 0, this.Al | 0, s | 0, o | 0)),
      ({ h: l, l: u } = ge.add(this.Bh | 0, this.Bl | 0, l | 0, u | 0)),
      ({ h: f, l: d } = ge.add(this.Ch | 0, this.Cl | 0, f | 0, d | 0)),
      ({ h: m, l: h } = ge.add(this.Dh | 0, this.Dl | 0, m | 0, h | 0)),
      ({ h: g, l: w } = ge.add(this.Eh | 0, this.El | 0, g | 0, w | 0)),
      ({ h: b, l: E } = ge.add(this.Fh | 0, this.Fl | 0, b | 0, E | 0)),
      ({ h: S, l: C } = ge.add(this.Gh | 0, this.Gl | 0, S | 0, C | 0)),
      ({ h: _, l: A } = ge.add(this.Hh | 0, this.Hl | 0, _ | 0, A | 0)),
      this.set(s, o, l, u, f, d, m, h, g, w, b, E, S, C, _, A)
  }
  roundClean() {
    $i.fill(0), Wi.fill(0)
  }
  destroy() {
    this.buffer.fill(0),
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
  }
}
const Ud = WT(() => new fj())
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */ function Zb(
  t,
) {
  if (typeof t != "string")
    throw new TypeError("invalid mnemonic type: " + typeof t)
  return t.normalize("NFKD")
}
function dj(t) {
  const e = Zb(t),
    n = e.split(" ")
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic")
  return { nfkd: e, words: n }
}
const hj = t => Zb("mnemonic" + t)
function pj(t, e = "") {
  return lj(Ud, dj(t).nfkd, hj(e), { c: 2048, dkLen: 64 })
}
function HS(t) {
  return !!new RegExp("^m\\/44'\\/784'\\/[0-9]+'\\/[0-9]+'\\/[0-9]+'+$").test(t)
}
function mj(t) {
  return pj(t, "")
}
function gj(t) {
  return Ua(mj(t))
}
var Ls = {},
  GS
function yj() {
  if (GS) return Ls
  ;(GS = 1),
    Object.defineProperty(Ls, "__esModule", { value: !0 }),
    (Ls.bech32m = Ls.bech32 = void 0)
  const t = "qpzry9x8gf2tvdw0s3jn54khce6mua7l",
    e = {}
  for (let m = 0; m < t.length; m++) {
    const h = t.charAt(m)
    e[h] = m
  }
  function n(m) {
    const h = m >> 25
    return (
      ((m & 33554431) << 5) ^
      (-((h >> 0) & 1) & 996825010) ^
      (-((h >> 1) & 1) & 642813549) ^
      (-((h >> 2) & 1) & 513874426) ^
      (-((h >> 3) & 1) & 1027748829) ^
      (-((h >> 4) & 1) & 705979059)
    )
  }
  function s(m) {
    let h = 1
    for (let g = 0; g < m.length; ++g) {
      const w = m.charCodeAt(g)
      if (w < 33 || w > 126) return "Invalid prefix (" + m + ")"
      h = n(h) ^ (w >> 5)
    }
    h = n(h)
    for (let g = 0; g < m.length; ++g) {
      const w = m.charCodeAt(g)
      h = n(h) ^ (w & 31)
    }
    return h
  }
  function o(m, h, g, w) {
    let b = 0,
      E = 0
    const S = (1 << g) - 1,
      C = []
    for (let _ = 0; _ < m.length; ++_)
      for (b = (b << h) | m[_], E += h; E >= g; ) (E -= g), C.push((b >> E) & S)
    if (w) E > 0 && C.push((b << (g - E)) & S)
    else {
      if (E >= h) return "Excess padding"
      if ((b << (g - E)) & S) return "Non-zero padding"
    }
    return C
  }
  function l(m) {
    return o(m, 8, 5, !0)
  }
  function u(m) {
    const h = o(m, 5, 8, !1)
    if (Array.isArray(h)) return h
  }
  function f(m) {
    const h = o(m, 5, 8, !1)
    if (Array.isArray(h)) return h
    throw new Error(h)
  }
  function d(m) {
    let h
    m === "bech32" ? (h = 1) : (h = 734539939)
    function g(S, C, _) {
      if (((_ = _ || 90), S.length + 7 + C.length > _))
        throw new TypeError("Exceeds length limit")
      S = S.toLowerCase()
      let A = s(S)
      if (typeof A == "string") throw new Error(A)
      let O = S + "1"
      for (let M = 0; M < C.length; ++M) {
        const D = C[M]
        if (D >> 5 !== 0) throw new Error("Non 5-bit word")
        ;(A = n(A) ^ D), (O += t.charAt(D))
      }
      for (let M = 0; M < 6; ++M) A = n(A)
      A ^= h
      for (let M = 0; M < 6; ++M) {
        const D = (A >> ((5 - M) * 5)) & 31
        O += t.charAt(D)
      }
      return O
    }
    function w(S, C) {
      if (((C = C || 90), S.length < 8)) return S + " too short"
      if (S.length > C) return "Exceeds length limit"
      const _ = S.toLowerCase(),
        A = S.toUpperCase()
      if (S !== _ && S !== A) return "Mixed-case string " + S
      S = _
      const O = S.lastIndexOf("1")
      if (O === -1) return "No separator character for " + S
      if (O === 0) return "Missing prefix for " + S
      const M = S.slice(0, O),
        D = S.slice(O + 1)
      if (D.length < 6) return "Data too short"
      let K = s(M)
      if (typeof K == "string") return K
      const W = []
      for (let q = 0; q < D.length; ++q) {
        const Z = D.charAt(q),
          le = e[Z]
        if (le === void 0) return "Unknown character " + Z
        ;(K = n(K) ^ le), !(q + 6 >= D.length) && W.push(le)
      }
      return K !== h ? "Invalid checksum for " + S : { prefix: M, words: W }
    }
    function b(S, C) {
      const _ = w(S, C)
      if (typeof _ == "object") return _
    }
    function E(S, C) {
      const _ = w(S, C)
      if (typeof _ == "object") return _
      throw new Error(_)
    }
    return {
      decodeUnsafe: b,
      decode: E,
      encode: g,
      toWords: l,
      fromWordsUnsafe: u,
      fromWords: f,
    }
  }
  return (Ls.bech32 = d("bech32")), (Ls.bech32m = d("bech32m")), Ls
}
var fd = yj()
const Df = 32,
  Jb = "suiprivkey"
class vj {
  async signWithIntent(e, n) {
    const s = Qb(n, e),
      o = rd(s, { dkLen: 32 })
    return {
      signature: sj({
        signature: await this.sign(o),
        signatureScheme: this.getKeyScheme(),
        publicKey: this.getPublicKey(),
      }),
      bytes: Ke(e),
    }
  }
  async signTransaction(e) {
    return this.signWithIntent(e, "TransactionData")
  }
  async signPersonalMessage(e) {
    const { signature: n } = await this.signWithIntent(
      P.vector(P.u8()).serialize(e).toBytes(),
      "PersonalMessage",
    )
    return { bytes: Ke(e), signature: n }
  }
  toSuiAddress() {
    return this.getPublicKey().toSuiAddress()
  }
}
class wj extends vj {}
function Sj(t) {
  const { prefix: e, words: n } = fd.bech32.decode(t)
  if (e !== Jb) throw new Error("invalid private key prefix")
  const s = new Uint8Array(fd.bech32.fromWords(n)),
    o = s.slice(1)
  return { schema: Yb[s[0]], secretKey: o }
}
function xj(t, e) {
  if (t.length !== Df) throw new Error("Invalid bytes length")
  const n = Cy[e],
    s = new Uint8Array(t.length + 1)
  return s.set([n]), s.set(t, 1), fd.bech32.encode(Jb, fd.bech32.toWords(s))
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Gn =
    BigInt(0),
  on = BigInt(1),
  mf = BigInt(2),
  Ej = BigInt(8),
  bj = { zip215: !0 }
function Cj(t) {
  const e = tj(t)
  return (
    by(
      t,
      { hash: "function", a: "bigint", d: "bigint", randomBytes: "function" },
      {
        adjustScalarBytes: "function",
        domain: "function",
        uvRatio: "function",
        mapToCurve: "function",
      },
    ),
    Object.freeze({ ...e })
  )
}
function _j(t) {
  const e = Cj(t),
    {
      Fp: n,
      n: s,
      prehash: o,
      hash: l,
      randomBytes: u,
      nByteLength: f,
      h: d,
    } = e,
    m = mf << (BigInt(f * 8) - on),
    h = n.create,
    g = Gb(e.n, e.nBitLength),
    w =
      e.uvRatio ||
      ((te, H) => {
        try {
          return { isValid: !0, value: n.sqrt(te * n.inv(H)) }
        } catch {
          return { isValid: !1, value: Gn }
        }
      }),
    b = e.adjustScalarBytes || (te => te),
    E =
      e.domain ||
      ((te, H, B) => {
        if ((cm("phflag", B), H.length || B))
          throw new Error("Contexts/pre-hash are not supported")
        return te
      })
  function S(te, H) {
    ql("coordinate " + te, H, Gn, m)
  }
  function C(te) {
    if (!(te instanceof O)) throw new Error("ExtendedPoint expected")
  }
  const _ = US((te, H) => {
      const { ex: B, ey: U, ez: V } = te,
        I = te.is0()
      H == null && (H = I ? Ej : n.inv(V))
      const $ = h(B * H),
        ue = h(U * H),
        oe = h(V * H)
      if (I) return { x: Gn, y: on }
      if (oe !== on) throw new Error("invZ was invalid")
      return { x: $, y: ue }
    }),
    A = US(te => {
      const { a: H, d: B } = e
      if (te.is0()) throw new Error("bad point: ZERO")
      const { ex: U, ey: V, ez: I, et: $ } = te,
        ue = h(U * U),
        oe = h(V * V),
        he = h(I * I),
        me = h(he * he),
        Se = h(ue * H),
        ke = h(he * h(Se + oe)),
        Ee = h(me + h(B * h(ue * oe)))
      if (ke !== Ee) throw new Error("bad point: equation left != right (1)")
      const Be = h(U * V),
        Dt = h(I * $)
      if (Be !== Dt) throw new Error("bad point: equation left != right (2)")
      return !0
    })
  class O {
    constructor(H, B, U, V) {
      ;(this.ex = H),
        (this.ey = B),
        (this.ez = U),
        (this.et = V),
        S("x", H),
        S("y", B),
        S("z", U),
        S("t", V),
        Object.freeze(this)
    }
    get x() {
      return this.toAffine().x
    }
    get y() {
      return this.toAffine().y
    }
    static fromAffine(H) {
      if (H instanceof O) throw new Error("extended point not allowed")
      const { x: B, y: U } = H || {}
      return S("x", B), S("y", U), new O(B, U, on, h(B * U))
    }
    static normalizeZ(H) {
      const B = n.invertBatch(H.map(U => U.ez))
      return H.map((U, V) => U.toAffine(B[V])).map(O.fromAffine)
    }
    static msm(H, B) {
      return ej(O, g, H, B)
    }
    _setWindowSize(H) {
      K.setWindowSize(this, H)
    }
    assertValidity() {
      A(this)
    }
    equals(H) {
      C(H)
      const { ex: B, ey: U, ez: V } = this,
        { ex: I, ey: $, ez: ue } = H,
        oe = h(B * ue),
        he = h(I * V),
        me = h(U * ue),
        Se = h($ * V)
      return oe === he && me === Se
    }
    is0() {
      return this.equals(O.ZERO)
    }
    negate() {
      return new O(h(-this.ex), this.ey, this.ez, h(-this.et))
    }
    double() {
      const { a: H } = e,
        { ex: B, ey: U, ez: V } = this,
        I = h(B * B),
        $ = h(U * U),
        ue = h(mf * h(V * V)),
        oe = h(H * I),
        he = B + U,
        me = h(h(he * he) - I - $),
        Se = oe + $,
        ke = Se - ue,
        Ee = oe - $,
        Be = h(me * ke),
        Dt = h(Se * Ee),
        dn = h(me * Ee),
        Ht = h(ke * Se)
      return new O(Be, Dt, Ht, dn)
    }
    add(H) {
      C(H)
      const { a: B, d: U } = e,
        { ex: V, ey: I, ez: $, et: ue } = this,
        { ex: oe, ey: he, ez: me, et: Se } = H
      if (B === BigInt(-1)) {
        const Si = h((I - V) * (he + oe)),
          Fr = h((I + V) * (he - oe)),
          ys = h(Fr - Si)
        if (ys === Gn) return this.double()
        const il = h($ * mf * Se),
          sl = h(ue * mf * me),
          ol = sl + il,
          al = Fr + Si,
          Oo = sl - il,
          Ao = h(ol * ys),
          Qu = h(al * Oo),
          vs = h(ol * Oo),
          ws = h(ys * al)
        return new O(Ao, Qu, ws, vs)
      }
      const ke = h(V * oe),
        Ee = h(I * he),
        Be = h(ue * U * Se),
        Dt = h($ * me),
        dn = h((V + I) * (oe + he) - ke - Ee),
        Ht = Dt - Be,
        Br = Dt + Be,
        ms = h(Ee - B * ke),
        _o = h(dn * Ht),
        gs = h(Br * ms),
        ko = h(dn * ms),
        mr = h(Ht * Br)
      return new O(_o, gs, mr, ko)
    }
    subtract(H) {
      return this.add(H.negate())
    }
    wNAF(H) {
      return K.wNAFCached(this, H, O.normalizeZ)
    }
    multiply(H) {
      const B = H
      ql("scalar", B, on, s)
      const { p: U, f: V } = this.wNAF(B)
      return O.normalizeZ([U, V])[0]
    }
    multiplyUnsafe(H, B = O.ZERO) {
      const U = H
      return (
        ql("scalar", U, Gn, s),
        U === Gn
          ? D
          : this.is0() || U === on
            ? this
            : K.wNAFCachedUnsafe(this, U, O.normalizeZ, B)
      )
    }
    isSmallOrder() {
      return this.multiplyUnsafe(d).is0()
    }
    isTorsionFree() {
      return K.unsafeLadder(this, s).is0()
    }
    toAffine(H) {
      return _(this, H)
    }
    clearCofactor() {
      const { h: H } = e
      return H === on ? this : this.multiplyUnsafe(H)
    }
    static fromHex(H, B = !1) {
      const { d: U, a: V } = e,
        I = n.BYTES
      ;(H = Zr("pointHex", H, I)), cm("zip215", B)
      const $ = H.slice(),
        ue = H[I - 1]
      $[I - 1] = ue & -129
      const oe = jf($),
        he = B ? m : n.ORDER
      ql("pointHex.y", oe, Gn, he)
      const me = h(oe * oe),
        Se = h(me - on),
        ke = h(U * me - V)
      let { isValid: Ee, value: Be } = w(Se, ke)
      if (!Ee) throw new Error("Point.fromHex: invalid y coordinate")
      const Dt = (Be & on) === on,
        dn = (ue & 128) !== 0
      if (!B && Be === Gn && dn) throw new Error("Point.fromHex: x=0 and x_0=1")
      return dn !== Dt && (Be = h(-Be)), O.fromAffine({ x: Be, y: oe })
    }
    static fromPrivateKey(H) {
      return Z(H).point
    }
    toRawBytes() {
      const { x: H, y: B } = this.toAffine(),
        U = tg(B, n.BYTES)
      return (U[U.length - 1] |= H & on ? 128 : 0), U
    }
    toHex() {
      return Ey(this.toRawBytes())
    }
  }
  ;(O.BASE = new O(e.Gx, e.Gy, on, h(e.Gx * e.Gy))),
    (O.ZERO = new O(Gn, on, on, Gn))
  const { BASE: M, ZERO: D } = O,
    K = JN(O, f * 8)
  function W(te) {
    return Et(te, s)
  }
  function q(te) {
    return W(jf(te))
  }
  function Z(te) {
    const H = n.BYTES
    te = Zr("private key", te, H)
    const B = Zr("hashed private key", l(te), 2 * H),
      U = b(B.slice(0, H)),
      V = B.slice(H, 2 * H),
      I = q(U),
      $ = M.multiply(I),
      ue = $.toRawBytes()
    return { head: U, prefix: V, scalar: I, point: $, pointBytes: ue }
  }
  function le(te) {
    return Z(te).pointBytes
  }
  function Ce(te = new Uint8Array(), ...H) {
    const B = FS(...H)
    return q(l(E(B, Zr("context", te), !!o)))
  }
  function Ae(te, H, B = {}) {
    ;(te = Zr("message", te)), o && (te = o(te))
    const { prefix: U, scalar: V, pointBytes: I } = Z(H),
      $ = Ce(B.context, U, te),
      ue = M.multiply($).toRawBytes(),
      oe = Ce(B.context, ue, I, te),
      he = W($ + oe * V)
    ql("signature.s", he, Gn, s)
    const me = FS(ue, tg(he, n.BYTES))
    return Zr("result", me, n.BYTES * 2)
  }
  const Te = bj
  function Pe(te, H, B, U = Te) {
    const { context: V, zip215: I } = U,
      $ = n.BYTES
    ;(te = Zr("signature", te, 2 * $)),
      (H = Zr("message", H)),
      (B = Zr("publicKey", B, $)),
      I !== void 0 && cm("zip215", I),
      o && (H = o(H))
    const ue = jf(te.slice($, 2 * $))
    let oe, he, me
    try {
      ;(oe = O.fromHex(B, I)),
        (he = O.fromHex(te.slice(0, $), I)),
        (me = M.multiplyUnsafe(ue))
    } catch {
      return !1
    }
    if (!I && oe.isSmallOrder()) return !1
    const Se = Ce(V, he.toRawBytes(), oe.toRawBytes(), H)
    return he
      .add(oe.multiplyUnsafe(Se))
      .subtract(me)
      .clearCofactor()
      .equals(O.ZERO)
  }
  return (
    M._setWindowSize(8),
    {
      CURVE: e,
      getPublicKey: le,
      sign: Ae,
      verify: Pe,
      ExtendedPoint: O,
      utils: {
        getExtendedPublicKey: Z,
        randomPrivateKey: () => u(n.BYTES),
        precompute(te = 8, H = O.BASE) {
          return H._setWindowSize(te), H.multiply(BigInt(3)), H
        },
      },
    }
  )
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const _y =
    BigInt(
      "57896044618658097711785492504343953926634992332820282019728792003956564819949",
    ),
  KS = BigInt(
    "19681161376707505956807079304988542015446066515923890162744021073123829784752",
  )
BigInt(0)
const kj = BigInt(1),
  qS = BigInt(2)
BigInt(3)
const Oj = BigInt(5),
  Aj = BigInt(8)
function Tj(t) {
  const e = BigInt(10),
    n = BigInt(20),
    s = BigInt(40),
    o = BigInt(80),
    l = _y,
    f = (((t * t) % l) * t) % l,
    d = (xr(f, qS, l) * f) % l,
    m = (xr(d, kj, l) * t) % l,
    h = (xr(m, Oj, l) * m) % l,
    g = (xr(h, e, l) * h) % l,
    w = (xr(g, n, l) * g) % l,
    b = (xr(w, s, l) * w) % l,
    E = (xr(b, o, l) * b) % l,
    S = (xr(E, o, l) * b) % l,
    C = (xr(S, e, l) * h) % l
  return { pow_p_5_8: (xr(C, qS, l) * t) % l, b2: f }
}
function Rj(t) {
  return (t[0] &= 248), (t[31] &= 127), (t[31] |= 64), t
}
function Pj(t, e) {
  const n = _y,
    s = Et(e * e * e, n),
    o = Et(s * s * e, n),
    l = Tj(t * o).pow_p_5_8
  let u = Et(t * s * l, n)
  const f = Et(e * u * u, n),
    d = u,
    m = Et(u * KS, n),
    h = f === t,
    g = f === Et(-t, n),
    w = f === Et(-t * KS, n)
  return (
    h && (u = d),
    (g || w) && (u = m),
    GN(u, n) && (u = Et(-u, n)),
    { isValid: h || g, value: u }
  )
}
const Ij = Gb(_y, void 0, !0),
  Mj = {
    a: BigInt(-1),
    d: BigInt(
      "37095705934669439343138083508754565189542113879843219016388785533085940283555",
    ),
    Fp: Ij,
    n: BigInt(
      "7237005577332262213973186563042994240857116359379907606001950938285454250989",
    ),
    h: Aj,
    Gx: BigInt(
      "15112221349535400772501151409588531511454012693041857206046113283949847762202",
    ),
    Gy: BigInt(
      "46316835694926478169428394003475163141307993866256225615783033603165251855960",
    ),
    hash: Ud,
    randomBytes: HT,
    adjustScalarBytes: Rj,
    uvRatio: Pj,
  },
  ti = _j(Mj),
  Nj = "ed25519 seed",
  jj = 2147483648,
  Dj = new RegExp("^m(\\/[0-9]+')+$"),
  eC = t => t.replace("'", ""),
  Lj = t => {
    const n = Fd.create(Ud, Nj).update(Bg(t)).digest(),
      s = n.slice(0, 32),
      o = n.slice(32)
    return { key: s, chainCode: o }
  },
  Bj = ({ key: t, chainCode: e }, n) => {
    const s = new ArrayBuffer(4)
    new DataView(s).setUint32(0, n)
    const l = new Uint8Array(1 + t.length + s.byteLength)
    l.set(new Uint8Array(1).fill(0)),
      l.set(t, 1),
      l.set(new Uint8Array(s, 0, s.byteLength), t.length + 1)
    const u = Fd.create(Ud, e).update(l).digest(),
      f = u.slice(0, 32),
      d = u.slice(32)
    return { key: f, chainCode: d }
  },
  Fj = t => (Dj.test(t) ? !t.split("/").slice(1).map(eC).some(isNaN) : !1),
  QS = (t, e, n = jj) => {
    if (!Fj(t)) throw new Error("Invalid derivation path")
    const { key: s, chainCode: o } = Lj(e)
    return t
      .split("/")
      .slice(1)
      .map(eC)
      .map(u => parseInt(u, 10))
      .reduce((u, f) => Bj(u, f + n), { key: s, chainCode: o })
  },
  rg = 32
class tC extends rj {
  constructor(e) {
    if (
      (super(),
      typeof e == "string"
        ? (this.data = Dn(e))
        : e instanceof Uint8Array
          ? (this.data = e)
          : (this.data = Uint8Array.from(e)),
      this.data.length !== rg)
    )
      throw new Error(
        `Invalid public key input. Expected ${rg} bytes, got ${this.data.length}`,
      )
  }
  equals(e) {
    return super.equals(e)
  }
  toRawBytes() {
    return this.data
  }
  flag() {
    return Cy.ED25519
  }
  async verify(e, n) {
    let s
    if (typeof n == "string") {
      const o = ij(n)
      if (o.signatureScheme !== "ED25519")
        throw new Error("Invalid signature scheme")
      if (!Xb(this.toRawBytes(), o.publicKey))
        throw new Error("Signature does not match public key")
      s = o.signature
    } else s = n
    return ti.verify(s, e, this.toRawBytes())
  }
}
tC.SIZE = rg
const YS = "m/44'/784'/0'/0'/0'"
class ha extends wj {
  constructor(e) {
    if ((super(), e))
      this.keypair = {
        publicKey: e.publicKey,
        secretKey: e.secretKey.slice(0, 32),
      }
    else {
      const n = ti.utils.randomPrivateKey()
      this.keypair = { publicKey: ti.getPublicKey(n), secretKey: n }
    }
  }
  getKeyScheme() {
    return "ED25519"
  }
  static generate() {
    const e = ti.utils.randomPrivateKey()
    return new ha({ publicKey: ti.getPublicKey(e), secretKey: e })
  }
  static fromSecretKey(e, n) {
    if (typeof e == "string") {
      const l = Sj(e)
      if (l.schema !== "ED25519")
        throw new Error(`Expected a ED25519 keypair, got ${l.schema}`)
      return this.fromSecretKey(l.secretKey, n)
    }
    const s = e.length
    if (s !== Df)
      throw new Error(`Wrong secretKey size. Expected ${Df} bytes, got ${s}.`)
    const o = { publicKey: ti.getPublicKey(e), secretKey: e }
    if (!n || !n.skipValidation) {
      const u = new TextEncoder().encode("sui validation"),
        f = ti.sign(u, e)
      if (!ti.verify(f, u, o.publicKey))
        throw new Error("provided secretKey is invalid")
    }
    return new ha(o)
  }
  getPublicKey() {
    return new tC(this.keypair.publicKey)
  }
  getSecretKey() {
    return xj(this.keypair.secretKey.slice(0, Df), this.getKeyScheme())
  }
  async sign(e) {
    return ti.sign(e, this.keypair.secretKey)
  }
  static deriveKeypair(e, n) {
    if ((n == null && (n = YS), !HS(n)))
      throw new Error("Invalid derivation path")
    const { key: s } = QS(n, gj(e))
    return ha.fromSecretKey(s)
  }
  static deriveKeypairFromSeed(e, n) {
    if ((n == null && (n = YS), !HS(n)))
      throw new Error("Invalid derivation path")
    const { key: s } = QS(n, e)
    return ha.fromSecretKey(s)
  }
}
function Uj(t) {
  return {
    all: (t = t || new Map()),
    on: function (e, n) {
      var s = t.get(e)
      s ? s.push(n) : t.set(e, [n])
    },
    off: function (e, n) {
      var s = t.get(e)
      s && (n ? s.splice(s.indexOf(n) >>> 0, 1) : t.set(e, []))
    },
    emit: function (e, n) {
      var s = t.get(e)
      s &&
        s.slice().map(function (o) {
          o(n)
        }),
        (s = t.get("*")) &&
          s.slice().map(function (o) {
            o(e, n)
          })
    },
  }
}
function zj() {
  let t, e
  return {
    promise: new Promise((s, o) => {
      ;(t = s), (e = o)
    }),
    reject: e,
    resolve: t,
  }
}
const $j = Pd("type", [
  re({ type: ye("connect") }),
  re({
    type: ye("sign-transaction-block"),
    data: xe("`data` is required"),
    address: xe("`address` is required"),
  }),
  re({
    type: ye("sign-personal-message"),
    bytes: xe("`bytes` is required"),
    address: xe("`address` is required"),
  }),
])
re({
  id: $e(xe("`id` is required"), Vg()),
  origin: $e(xe(), fE("`origin` must be a valid URL")),
  name: Mt(xe()),
  payload: $j,
})
const Wj = Pd("type", [
    re({ type: ye("connect"), address: xe() }),
    re({ type: ye("sign-transaction-block"), bytes: xe(), signature: xe() }),
    re({ type: ye("sign-personal-message"), bytes: xe(), signature: xe() }),
  ]),
  Vj = Pd("type", [
    re({ type: ye("reject") }),
    re({ type: ye("resolve"), data: Wj }),
  ]),
  Hj = re({ id: $e(xe(), Vg()), source: ye("zksend-channel"), payload: Vj })
var nC = t => {
    throw TypeError(t)
  },
  ky = (t, e, n) => e.has(t) || nC("Cannot " + n),
  zt = (t, e, n) => (
    ky(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  Kn = (t, e, n) =>
    e.has(t)
      ? nC("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  Er = (t, e, n, s) => (ky(t, e, "write to private field"), e.set(t, n), n),
  gm = (t, e, n) => (ky(t, e, "access private method"), n),
  ua,
  ou,
  au,
  Lf,
  Bf,
  Ff,
  Uf,
  zf,
  xa,
  dd,
  lu,
  $f
const rC = "https://getstashed.com"
class gf {
  constructor({ name: e, network: n, origin: s = rC }) {
    Kn(this, lu),
      Kn(this, ua),
      Kn(this, ou),
      Kn(this, au),
      Kn(this, Lf),
      Kn(this, Bf),
      Kn(this, Ff),
      Kn(this, Uf),
      Kn(this, zf),
      Kn(this, xa, null),
      Kn(this, dd, d => {
        if (d.origin !== zt(this, au)) return
        const { success: m, output: h } = MR(Hj, d.data)
        !m ||
          h.id !== zt(this, ou) ||
          (gm(this, lu, $f).call(this),
          h.payload.type === "reject"
            ? zt(this, zf).call(this, new Error("User rejected the request"))
            : h.payload.type === "resolve" &&
              zt(this, Uf).call(this, h.payload.data))
      })
    const o = window.open("about:blank", "_blank")
    if (!o) throw new Error("Failed to open new window")
    Er(this, ua, o),
      Er(this, ou, crypto.randomUUID()),
      Er(this, au, s),
      Er(this, Lf, e),
      Er(this, Bf, n)
    const { promise: l, resolve: u, reject: f } = zj()
    Er(this, Ff, l),
      Er(this, Uf, u),
      Er(this, zf, f),
      Er(
        this,
        xa,
        setInterval(() => {
          try {
            zt(this, ua).closed &&
              (gm(this, lu, $f).call(this),
              f(new Error("User closed the Stashed window")))
          } catch {}
        }, 1e3),
      )
  }
  send({ type: e, ...n }) {
    return (
      window.addEventListener("message", zt(this, dd)),
      zt(this, ua).location.assign(
        `${zt(this, au)}/dapp/${e}?${new URLSearchParams({ id: zt(this, ou), origin: window.origin, network: zt(this, Bf), name: zt(this, Lf) })}${n ? `#${new URLSearchParams(n)}` : ""}`,
      ),
      zt(this, Ff)
    )
  }
  close() {
    gm(this, lu, $f).call(this), zt(this, ua).close()
  }
}
ua = new WeakMap()
ou = new WeakMap()
au = new WeakMap()
Lf = new WeakMap()
Bf = new WeakMap()
Ff = new WeakMap()
Uf = new WeakMap()
zf = new WeakMap()
xa = new WeakMap()
dd = new WeakMap()
lu = new WeakSet()
$f = function () {
  zt(this, xa) && (clearInterval(zt(this, xa)), Er(this, xa, null)),
    window.removeEventListener("message", zt(this, dd))
}
var iC = t => {
    throw TypeError(t)
  },
  Oy = (t, e, n) => e.has(t) || iC("Cannot " + n),
  at = (t, e, n) => (
    Oy(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  Pn = (t, e, n) =>
    e.has(t)
      ? iC("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  Qs = (t, e, n, s) => (Oy(t, e, "write to private field"), e.set(t, n), n),
  yf = (t, e, n) => (Oy(t, e, "access private method"), n),
  pa,
  Ea,
  Hs,
  Gs,
  Ks,
  ig,
  sg,
  og,
  ag,
  ca,
  uu,
  lg,
  ug
const cg = "stashed:recentAddress",
  sC = "Stashed"
class Gj {
  constructor({ name: e, network: n, address: s, origin: o = rC }) {
    Pn(this, ca),
      Pn(this, pa),
      Pn(this, Ea),
      Pn(this, Hs),
      Pn(this, Gs),
      Pn(this, Ks),
      Pn(this, ig, async ({ transactionBlock: l, account: u }) => {
        l.setSenderIfNotSet(u.address)
        const f = l.serialize(),
          m = await new gf({
            name: at(this, Gs),
            origin: at(this, Hs),
            network: at(this, Ks),
          }).send({
            type: "sign-transaction-block",
            data: f,
            address: u.address,
          })
        return { transactionBlockBytes: m.bytes, signature: m.signature }
      }),
      Pn(this, sg, async ({ transaction: l, account: u }) => {
        const f = new gf({
            name: at(this, Gs),
            origin: at(this, Hs),
            network: at(this, Ks),
          }),
          d = Wa.from(await l.toJSON())
        d.setSenderIfNotSet(u.address)
        const m = d.serialize(),
          h = await f.send({
            type: "sign-transaction-block",
            data: m,
            address: u.address,
          })
        return { bytes: h.bytes, signature: h.signature }
      }),
      Pn(this, og, async ({ message: l, account: u }) => {
        const f = new gf({
            name: at(this, Gs),
            origin: at(this, Hs),
            network: at(this, Ks),
          }),
          d = Ke(l),
          m = await f.send({
            type: "sign-personal-message",
            bytes: d,
            address: u.address,
          })
        return { bytes: d, signature: m.signature }
      }),
      Pn(
        this,
        ag,
        (l, u) => (at(this, pa).on(l, u), () => at(this, pa).off(l, u)),
      ),
      Pn(this, lg, async l => {
        if (l != null && l.silent) {
          const d = localStorage.getItem(cg)
          return (
            d && yf(this, ca, uu).call(this, d), { accounts: this.accounts }
          )
        }
        const f = await new gf({
          name: at(this, Gs),
          origin: at(this, Hs),
          network: at(this, Ks),
        }).send({ type: "connect" })
        if (!("address" in f)) throw new Error("Unexpected response")
        return (
          yf(this, ca, uu).call(this, f.address), { accounts: this.accounts }
        )
      }),
      Pn(this, ug, async () => {
        localStorage.removeItem(cg), yf(this, ca, uu).call(this)
      }),
      Qs(this, Ea, []),
      Qs(this, pa, Uj()),
      Qs(this, Hs, o),
      Qs(this, Gs, e),
      Qs(this, Ks, n),
      s && yf(this, ca, uu).call(this, s)
  }
  get name() {
    return sC
  }
  get icon() {
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjU0IiBoZWlnaHQ9IjU0IiB4PSIxIiB5PSIxIiBmaWxsPSIjNTE5REU5IiByeD0iMjciLz48cmVjdCB3aWR0aD0iNTQiIGhlaWdodD0iNTQiIHg9IjEiIHk9IjEiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iMjciLz48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMTguMzUzIDM1LjA2NGMuOTIxIDMuNDM4IDQuMzYzIDYuNTUxIDExLjQ4MyA0LjY0NCA2Ljc5NC0xLjgyMSAxMS4wNTItNy40MSA5Ljk0OC0xMS41My0uMzgxLTEuNDIzLTEuNTMtMi4zODctMy4zLTIuMjNsLTE1LjgzMiAxLjMyYy0uOTk3LjA3Ni0xLjQ1NC0uMDg4LTEuNzE4LS43MTYtLjI1Ni0uNTk5LS4xMS0xLjI0MSAxLjA5NC0xLjg1bDEyLjA0OC02LjE4M2MuOTI0LS40NyAxLjUzOS0uNjY2IDIuMTAxLS40NjguMzUyLjEyOC41ODQuNjM4LjM3MSAxLjI2N2wtLjc4MSAyLjMwNmMtLjk1OSAyLjgzIDEuMDk0IDMuNDg4IDIuMjUgMy4xNzggMS43NTEtLjQ2OSAyLjE2My0yLjEzNiAxLjU5OS00LjI0LTEuNDMtNS4zMzctNy4wOS02LjE3LTEyLjIyMy00Ljc5Ni01LjIyMiAxLjQtOS43NDggNS42My04LjM2NiAxMC43ODkuMzI1IDEuMjE1IDEuNDQ0IDIuMTg2IDIuNzQgMi4xNTdsMS45NzgtLjAwNWMuNDA3LS4wMS4yNi4wMjQgMS4wNDYtLjA0MS43ODQtLjA2NSAyLjg4LS4zMjMgMi44OC0uMzIzbDEwLjI4Ni0xLjE2NC4yNjUtLjAzOGMuNjAyLS4xMDMgMS4wNTYuMDUzIDEuNDQuNzE1LjU3Ni45OTEtLjMwMiAxLjczOC0xLjM1MiAyLjYzM2wtLjA4NS4wNzItOS4wNDEgNy43OTJjLTEuNTUgMS4zMzctMi42MzkuODM0LTMuMDItLjU4OWwtMS4zNS01LjA0Yy0uMzM0LTEuMjQ0LTEuNTUtMi4yMjEtMi45NzQtMS44NC0xLjc4LjQ3Ny0xLjkyNCAyLjU1LTEuNDg3IDQuMThaIi8+PC9zdmc+Cg=="
  }
  get version() {
    return "1.0.0"
  }
  get chains() {
    return [Zg]
  }
  get accounts() {
    return at(this, Ea)
  }
  get features() {
    return {
      "standard:connect": { version: "1.0.0", connect: at(this, lg) },
      "standard:disconnect": { version: "1.0.0", disconnect: at(this, ug) },
      "standard:events": { version: "1.0.0", on: at(this, ag) },
      "sui:signTransactionBlock": {
        version: "1.0.0",
        signTransactionBlock: at(this, ig),
      },
      "sui:signTransaction": {
        version: "2.0.0",
        signTransaction: at(this, sg),
      },
      "sui:signPersonalMessage": {
        version: "1.0.0",
        signPersonalMessage: at(this, og),
      },
    }
  }
}
pa = new WeakMap()
Ea = new WeakMap()
Hs = new WeakMap()
Gs = new WeakMap()
Ks = new WeakMap()
ig = new WeakMap()
sg = new WeakMap()
og = new WeakMap()
ag = new WeakMap()
ca = new WeakSet()
uu = function (t) {
  t
    ? (Qs(this, Ea, [
        new _d({
          address: t,
          chains: [Zg],
          features: ["sui:signTransactionBlock", "sui:signPersonalMessage"],
          publicKey: new Uint8Array(),
        }),
      ]),
      localStorage.setItem(cg, t))
    : Qs(this, Ea, []),
    at(this, pa).emit("change", { accounts: this.accounts })
}
lg = new WeakMap()
ug = new WeakMap()
function Kj(t, { origin: e, network: n = "mainnet" } = {}) {
  const s = Cd()
  let o = null
  try {
    const f = new URLSearchParams(window.location.search)
    o = f.get("stashed_address") || f.get("zksend_address")
  } catch {}
  const l = new Gj({ name: t, network: n, origin: e, address: o }),
    u = s.register(l)
  return { wallet: l, unregister: u, addressFromRedirect: o }
}
const qj = {}
function oC(t, e) {
  let n
  try {
    n = t()
  } catch {
    return
  }
  return {
    getItem: o => {
      var l
      const u = d => (d === null ? null : JSON.parse(d, void 0)),
        f = (l = n.getItem(o)) != null ? l : null
      return f instanceof Promise ? f.then(u) : u(f)
    },
    setItem: (o, l) => n.setItem(o, JSON.stringify(l, void 0)),
    removeItem: o => n.removeItem(o),
  }
}
const Au = t => e => {
    try {
      const n = t(e)
      return n instanceof Promise
        ? n
        : {
            then(s) {
              return Au(s)(n)
            },
            catch(s) {
              return this
            },
          }
    } catch (n) {
      return {
        then(s) {
          return this
        },
        catch(s) {
          return Au(s)(n)
        },
      }
    }
  },
  Qj = (t, e) => (n, s, o) => {
    let l = {
        getStorage: () => localStorage,
        serialize: JSON.stringify,
        deserialize: JSON.parse,
        partialize: C => C,
        version: 0,
        merge: (C, _) => ({ ..._, ...C }),
        ...e,
      },
      u = !1
    const f = new Set(),
      d = new Set()
    let m
    try {
      m = l.getStorage()
    } catch {}
    if (!m)
      return t(
        (...C) => {
          console.warn(
            `[zustand persist middleware] Unable to update item '${l.name}', the given storage is currently unavailable.`,
          ),
            n(...C)
        },
        s,
        o,
      )
    const h = Au(l.serialize),
      g = () => {
        const C = l.partialize({ ...s() })
        let _
        const A = h({ state: C, version: l.version })
          .then(O => m.setItem(l.name, O))
          .catch(O => {
            _ = O
          })
        if (_) throw _
        return A
      },
      w = o.setState
    o.setState = (C, _) => {
      w(C, _), g()
    }
    const b = t(
      (...C) => {
        n(...C), g()
      },
      s,
      o,
    )
    let E
    const S = () => {
      var C
      if (!m) return
      ;(u = !1), f.forEach(A => A(s()))
      const _ =
        ((C = l.onRehydrateStorage) == null ? void 0 : C.call(l, s())) || void 0
      return Au(m.getItem.bind(m))(l.name)
        .then(A => {
          if (A) return l.deserialize(A)
        })
        .then(A => {
          if (A)
            if (typeof A.version == "number" && A.version !== l.version) {
              if (l.migrate) return l.migrate(A.state, A.version)
              console.error(
                "State loaded from storage couldn't be migrated since no migrate function was provided",
              )
            } else return A.state
        })
        .then(A => {
          var O
          return (E = l.merge(A, (O = s()) != null ? O : b)), n(E, !0), g()
        })
        .then(() => {
          _ == null || _(E, void 0), (u = !0), d.forEach(A => A(E))
        })
        .catch(A => {
          _ == null || _(void 0, A)
        })
    }
    return (
      (o.persist = {
        setOptions: C => {
          ;(l = { ...l, ...C }), C.getStorage && (m = C.getStorage())
        },
        clearStorage: () => {
          m == null || m.removeItem(l.name)
        },
        getOptions: () => l,
        rehydrate: () => S(),
        hasHydrated: () => u,
        onHydrate: C => (
          f.add(C),
          () => {
            f.delete(C)
          }
        ),
        onFinishHydration: C => (
          d.add(C),
          () => {
            d.delete(C)
          }
        ),
      }),
      S(),
      E || b
    )
  },
  Yj = (t, e) => (n, s, o) => {
    let l = {
        storage: oC(() => localStorage),
        partialize: S => S,
        version: 0,
        merge: (S, C) => ({ ...C, ...S }),
        ...e,
      },
      u = !1
    const f = new Set(),
      d = new Set()
    let m = l.storage
    if (!m)
      return t(
        (...S) => {
          console.warn(
            `[zustand persist middleware] Unable to update item '${l.name}', the given storage is currently unavailable.`,
          ),
            n(...S)
        },
        s,
        o,
      )
    const h = () => {
        const S = l.partialize({ ...s() })
        return m.setItem(l.name, { state: S, version: l.version })
      },
      g = o.setState
    o.setState = (S, C) => {
      g(S, C), h()
    }
    const w = t(
      (...S) => {
        n(...S), h()
      },
      s,
      o,
    )
    o.getInitialState = () => w
    let b
    const E = () => {
      var S, C
      if (!m) return
      ;(u = !1),
        f.forEach(A => {
          var O
          return A((O = s()) != null ? O : w)
        })
      const _ =
        ((C = l.onRehydrateStorage) == null
          ? void 0
          : C.call(l, (S = s()) != null ? S : w)) || void 0
      return Au(m.getItem.bind(m))(l.name)
        .then(A => {
          if (A)
            if (typeof A.version == "number" && A.version !== l.version) {
              if (l.migrate) return [!0, l.migrate(A.state, A.version)]
              console.error(
                "State loaded from storage couldn't be migrated since no migrate function was provided",
              )
            } else return [!1, A.state]
          return [!1, void 0]
        })
        .then(A => {
          var O
          const [M, D] = A
          if (((b = l.merge(D, (O = s()) != null ? O : w)), n(b, !0), M))
            return h()
        })
        .then(() => {
          _ == null || _(b, void 0), (b = s()), (u = !0), d.forEach(A => A(b))
        })
        .catch(A => {
          _ == null || _(void 0, A)
        })
    }
    return (
      (o.persist = {
        setOptions: S => {
          ;(l = { ...l, ...S }), S.storage && (m = S.storage)
        },
        clearStorage: () => {
          m == null || m.removeItem(l.name)
        },
        getOptions: () => l,
        rehydrate: () => E(),
        hasHydrated: () => u,
        onHydrate: S => (
          f.add(S),
          () => {
            f.delete(S)
          }
        ),
        onFinishHydration: S => (
          d.add(S),
          () => {
            d.delete(S)
          }
        ),
      }),
      l.skipHydration || E(),
      b || w
    )
  },
  Xj = (t, e) =>
    "getStorage" in e || "serialize" in e || "deserialize" in e
      ? ((qj ? "production" : void 0) !== "production" &&
          console.warn(
            "[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead.",
          ),
        Qj(t, e))
      : Yj(t, e),
  Zj = Xj
function XS(t) {
  var e = t.match(/^var\((.*)\)$/)
  return e ? e[1] : t
}
function Jj(t, e) {
  var n = t
  for (var s of e) {
    if (!(s in n))
      throw new Error(
        "Path ".concat(e.join(" -> "), " does not exist in object"),
      )
    n = n[s]
  }
  return n
}
function Ay(t, e) {
  var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [],
    s = {}
  for (var o in t) {
    var l = t[o],
      u = [...n, o]
    typeof l == "string" || typeof l == "number" || l == null
      ? (s[o] = e(l, u))
      : typeof l == "object" && !Array.isArray(l)
        ? (s[o] = Ay(l, e, u))
        : console.warn(
            'Skipping invalid key "'
              .concat(
                u.join("."),
                '". Should be a string, number, null or object. Received: "',
              )
              .concat(Array.isArray(l) ? "Array" : typeof l, '"'),
          )
  }
  return s
}
function e3(t, e) {
  var n = {}
  if (typeof e == "object") {
    var s = t
    Ay(e, (f, d) => {
      if (f != null) {
        var m = Jj(s, d)
        n[XS(m)] = String(f)
      }
    })
  } else {
    var o = t
    for (var l in o) {
      var u = o[l]
      u != null && (n[XS(l)] = u)
    }
  }
  return (
    Object.defineProperty(n, "toString", {
      value: function () {
        return Object.keys(this)
          .map(d => "".concat(d, ":").concat(this[d]))
          .join(";")
      },
      writable: !1,
    }),
    n
  )
}
/*! https://mths.be/cssesc v3.0.0 by @mathias */ var ym, ZS
function t3() {
  if (ZS) return ym
  ZS = 1
  var t = {},
    e = t.hasOwnProperty,
    n = function (d, m) {
      if (!d) return m
      var h = {}
      for (var g in m) h[g] = e.call(d, g) ? d[g] : m[g]
      return h
    },
    s = /[ -,\.\/:-@\[-\^`\{-~]/,
    o = /[ -,\.\/:-@\[\]\^`\{-~]/,
    l = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g,
    u = function f(d, m) {
      ;(m = n(m, f.options)),
        m.quotes != "single" && m.quotes != "double" && (m.quotes = "single")
      for (
        var h = m.quotes == "double" ? '"' : "'",
          g = m.isIdentifier,
          w = d.charAt(0),
          b = "",
          E = 0,
          S = d.length;
        E < S;

      ) {
        var C = d.charAt(E++),
          _ = C.charCodeAt(),
          A = void 0
        if (_ < 32 || _ > 126) {
          if (_ >= 55296 && _ <= 56319 && E < S) {
            var O = d.charCodeAt(E++)
            ;(O & 64512) == 56320
              ? (_ = ((_ & 1023) << 10) + (O & 1023) + 65536)
              : E--
          }
          A = "\\" + _.toString(16).toUpperCase() + " "
        } else
          m.escapeEverything
            ? s.test(C)
              ? (A = "\\" + C)
              : (A = "\\" + _.toString(16).toUpperCase() + " ")
            : /[\t\n\f\r\x0B]/.test(C)
              ? (A = "\\" + _.toString(16).toUpperCase() + " ")
              : C == "\\" ||
                  (!g && ((C == '"' && h == C) || (C == "'" && h == C))) ||
                  (g && o.test(C))
                ? (A = "\\" + C)
                : (A = C)
        b += A
      }
      return (
        g &&
          (/^-[-\d]/.test(b)
            ? (b = "\\-" + b.slice(1))
            : /\d/.test(w) && (b = "\\3" + w + " " + b.slice(1))),
        (b = b.replace(l, function (M, D, K) {
          return D && D.length % 2 ? M : (D || "") + K
        })),
        !g && m.wrap ? h + b + h : b
      )
    }
  return (
    (u.options = {
      escapeEverything: !1,
      isIdentifier: !1,
      quotes: "single",
      wrap: !1,
    }),
    (u.version = "3.0.0"),
    (ym = u),
    ym
  )
}
var n3 = t3()
const r3 = yo(n3)
var aC = !1,
  i3 = t => {
    aC || s3(t)
  },
  s3 = t => {
    if (!t) throw new Error('No adapter provided when calling "setAdapter"')
    aC = !0
  }
function JS(t, e) {
  var n = Object.keys(t)
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t)
    e &&
      (s = s.filter(function (o) {
        return Object.getOwnPropertyDescriptor(t, o).enumerable
      })),
      n.push.apply(n, s)
  }
  return n
}
function e1(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {}
    e % 2
      ? JS(Object(n), !0).forEach(function (s) {
          o3(t, s, n[s])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
        : JS(Object(n)).forEach(function (s) {
            Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(n, s))
          })
  }
  return t
}
function o3(t, e, n) {
  return (
    (e = a3(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = n),
    t
  )
}
function a3(t) {
  var e = l3(t, "string")
  return typeof e == "symbol" ? e : String(e)
}
function l3(t, e) {
  if (typeof t != "object" || t === null) return t
  var n = t[Symbol.toPrimitive]
  if (n !== void 0) {
    var s = n.call(t, e)
    if (typeof s != "object") return s
    throw new TypeError("@@toPrimitive must return a primitive value.")
  }
  return (e === "string" ? String : Number)(t)
}
lC({})
function lC(t) {
  return (e.withOptions = n => lC(e1(e1({}, t), n))), e
  function e(n, ...s) {
    const o = typeof n == "string" ? [n] : n.raw,
      { escapeSpecialCharacters: l = Array.isArray(n) } = t
    let u = ""
    for (let m = 0; m < o.length; m++) {
      let h = o[m]
      l &&
        (h = h
          .replace(/\\\n[ \t]*/g, "")
          .replace(/\\`/g, "`")
          .replace(/\\\$/g, "$")
          .replace(/\\\{/g, "{")),
        (u += h),
        m < s.length && (u += s[m])
    }
    const f = u.split(`
`)
    let d = null
    for (const m of f) {
      const h = m.match(/^(\s+)\S+/)
      if (h) {
        const g = h[1].length
        d ? (d = Math.min(d, g)) : (d = g)
      }
    }
    if (d !== null) {
      const m = d
      u = f.map(h => (h[0] === " " || h[0] === "	" ? h.slice(m) : h)).join(`
`)
    }
    return (
      (u = u.trim()),
      l &&
        (u = u.replace(
          /\\n/g,
          `
`,
        )),
      u
    )
  }
}
var u3 = {
    ":-moz-any-link": !0,
    ":-moz-full-screen": !0,
    ":-moz-placeholder": !0,
    ":-moz-read-only": !0,
    ":-moz-read-write": !0,
    ":-ms-fullscreen": !0,
    ":-ms-input-placeholder": !0,
    ":-webkit-any-link": !0,
    ":-webkit-full-screen": !0,
    "::-moz-color-swatch": !0,
    "::-moz-list-bullet": !0,
    "::-moz-list-number": !0,
    "::-moz-page-sequence": !0,
    "::-moz-page": !0,
    "::-moz-placeholder": !0,
    "::-moz-progress-bar": !0,
    "::-moz-range-progress": !0,
    "::-moz-range-thumb": !0,
    "::-moz-range-track": !0,
    "::-moz-scrolled-page-sequence": !0,
    "::-moz-selection": !0,
    "::-ms-backdrop": !0,
    "::-ms-browse": !0,
    "::-ms-check": !0,
    "::-ms-clear": !0,
    "::-ms-fill-lower": !0,
    "::-ms-fill-upper": !0,
    "::-ms-fill": !0,
    "::-ms-reveal": !0,
    "::-ms-thumb": !0,
    "::-ms-ticks-after": !0,
    "::-ms-ticks-before": !0,
    "::-ms-tooltip": !0,
    "::-ms-track": !0,
    "::-ms-value": !0,
    "::-webkit-backdrop": !0,
    "::-webkit-calendar-picker-indicator": !0,
    "::-webkit-inner-spin-button": !0,
    "::-webkit-input-placeholder": !0,
    "::-webkit-meter-bar": !0,
    "::-webkit-meter-even-less-good-value": !0,
    "::-webkit-meter-inner-element": !0,
    "::-webkit-meter-optimum-value": !0,
    "::-webkit-meter-suboptimum-value": !0,
    "::-webkit-outer-spin-button": !0,
    "::-webkit-progress-bar": !0,
    "::-webkit-progress-inner-element": !0,
    "::-webkit-progress-inner-value": !0,
    "::-webkit-progress-value": !0,
    "::-webkit-resizer": !0,
    "::-webkit-scrollbar-button": !0,
    "::-webkit-scrollbar-corner": !0,
    "::-webkit-scrollbar-thumb": !0,
    "::-webkit-scrollbar-track-piece": !0,
    "::-webkit-scrollbar-track": !0,
    "::-webkit-scrollbar": !0,
    "::-webkit-search-cancel-button": !0,
    "::-webkit-search-results-button": !0,
    "::-webkit-slider-runnable-track": !0,
    "::-webkit-slider-thumb": !0,
    "::after": !0,
    "::backdrop": !0,
    "::before": !0,
    "::cue": !0,
    "::file-selector-button": !0,
    "::first-letter": !0,
    "::first-line": !0,
    "::grammar-error": !0,
    "::marker": !0,
    "::placeholder": !0,
    "::selection": !0,
    "::spelling-error": !0,
    "::target-text": !0,
    "::view-transition-group": !0,
    "::view-transition-image-pair": !0,
    "::view-transition-new": !0,
    "::view-transition-old": !0,
    "::view-transition": !0,
    ":active": !0,
    ":after": !0,
    ":any-link": !0,
    ":before": !0,
    ":blank": !0,
    ":checked": !0,
    ":default": !0,
    ":defined": !0,
    ":disabled": !0,
    ":empty": !0,
    ":enabled": !0,
    ":first-child": !0,
    ":first-letter": !0,
    ":first-line": !0,
    ":first-of-type": !0,
    ":first": !0,
    ":focus-visible": !0,
    ":focus-within": !0,
    ":focus": !0,
    ":fullscreen": !0,
    ":hover": !0,
    ":in-range": !0,
    ":indeterminate": !0,
    ":invalid": !0,
    ":last-child": !0,
    ":last-of-type": !0,
    ":left": !0,
    ":link": !0,
    ":only-child": !0,
    ":only-of-type": !0,
    ":optional": !0,
    ":out-of-range": !0,
    ":placeholder-shown": !0,
    ":read-only": !0,
    ":read-write": !0,
    ":required": !0,
    ":right": !0,
    ":root": !0,
    ":scope": !0,
    ":target": !0,
    ":valid": !0,
    ":visited": !0,
  },
  c3 = Object.keys(u3)
;[...c3]
const oa =
    typeof performance == "object" &&
    performance &&
    typeof performance.now == "function"
      ? performance
      : Date,
  uC = new Set(),
  fg = typeof process == "object" && process ? process : {},
  cC = (t, e, n, s) => {
    typeof fg.emitWarning == "function"
      ? fg.emitWarning(t, e, n, s)
      : console.error(`[${n}] ${e}: ${t}`)
  }
let hd = globalThis.AbortController,
  t1 = globalThis.AbortSignal
var I1
if (typeof hd > "u") {
  ;(t1 = class {
    constructor() {
      Ye(this, "onabort")
      Ye(this, "_onabort", [])
      Ye(this, "reason")
      Ye(this, "aborted", !1)
    }
    addEventListener(s, o) {
      this._onabort.push(o)
    }
  }),
    (hd = class {
      constructor() {
        Ye(this, "signal", new t1())
        e()
      }
      abort(s) {
        var o, l
        if (!this.signal.aborted) {
          ;(this.signal.reason = s), (this.signal.aborted = !0)
          for (const u of this.signal._onabort) u(s)
          ;(l = (o = this.signal).onabort) == null || l.call(o, s)
        }
      }
    })
  let t =
    ((I1 = fg.env) == null ? void 0 : I1.LRU_CACHE_IGNORE_AC_WARNING) !== "1"
  const e = () => {
    t &&
      ((t = !1),
      cC(
        "AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.",
        "NO_ABORT_CONTROLLER",
        "ENOTSUP",
        e,
      ))
  }
}
const f3 = t => !uC.has(t),
  qi = t => t && t === Math.floor(t) && t > 0 && isFinite(t),
  fC = t =>
    qi(t)
      ? t <= Math.pow(2, 8)
        ? Uint8Array
        : t <= Math.pow(2, 16)
          ? Uint16Array
          : t <= Math.pow(2, 32)
            ? Uint32Array
            : t <= Number.MAX_SAFE_INTEGER
              ? Wf
              : null
      : null
class Wf extends Array {
  constructor(e) {
    super(e), this.fill(0)
  }
}
var Da
const Ys = class Ys {
  constructor(e, n) {
    Ye(this, "heap")
    Ye(this, "length")
    if (!x(Ys, Da))
      throw new TypeError("instantiate Stack using Stack.create(n)")
    ;(this.heap = new n(e)), (this.length = 0)
  }
  static create(e) {
    const n = fC(e)
    if (!n) return []
    G(Ys, Da, !0)
    const s = new Ys(e, n)
    return G(Ys, Da, !1), s
  }
  push(e) {
    this.heap[this.length++] = e
  }
  pop() {
    return this.heap[--this.length]
  }
}
;(Da = new WeakMap()), ne(Ys, Da, !1)
let dg = Ys
var M1,
  N1,
  Zn,
  yn,
  Jn,
  er,
  La,
  Ba,
  xt,
  tr,
  yt,
  Ze,
  Re,
  Yt,
  vn,
  Wt,
  At,
  nr,
  Tt,
  rr,
  ir,
  wn,
  sr,
  as,
  Xt,
  ie,
  pg,
  oo,
  ai,
  ju,
  Sn,
  dC,
  ao,
  Fa,
  Du,
  Qi,
  Yi,
  mg,
  Vf,
  Hf,
  Xe,
  gg,
  cu,
  Xi,
  yg
const Wy = class Wy {
  constructor(e) {
    ne(this, ie)
    ne(this, Zn)
    ne(this, yn)
    ne(this, Jn)
    ne(this, er)
    ne(this, La)
    ne(this, Ba)
    Ye(this, "ttl")
    Ye(this, "ttlResolution")
    Ye(this, "ttlAutopurge")
    Ye(this, "updateAgeOnGet")
    Ye(this, "updateAgeOnHas")
    Ye(this, "allowStale")
    Ye(this, "noDisposeOnSet")
    Ye(this, "noUpdateTTL")
    Ye(this, "maxEntrySize")
    Ye(this, "sizeCalculation")
    Ye(this, "noDeleteOnFetchRejection")
    Ye(this, "noDeleteOnStaleGet")
    Ye(this, "allowStaleOnFetchAbort")
    Ye(this, "allowStaleOnFetchRejection")
    Ye(this, "ignoreFetchAbort")
    ne(this, xt)
    ne(this, tr)
    ne(this, yt)
    ne(this, Ze)
    ne(this, Re)
    ne(this, Yt)
    ne(this, vn)
    ne(this, Wt)
    ne(this, At)
    ne(this, nr)
    ne(this, Tt)
    ne(this, rr)
    ne(this, ir)
    ne(this, wn)
    ne(this, sr)
    ne(this, as)
    ne(this, Xt)
    ne(this, oo, () => {})
    ne(this, ai, () => {})
    ne(this, ju, () => {})
    ne(this, Sn, () => !1)
    ne(this, ao, e => {})
    ne(this, Fa, (e, n, s) => {})
    ne(this, Du, (e, n, s, o) => {
      if (s || o)
        throw new TypeError(
          "cannot set size without setting maxSize or maxEntrySize on cache",
        )
      return 0
    })
    Ye(this, M1, "LRUCache")
    const {
      max: n = 0,
      ttl: s,
      ttlResolution: o = 1,
      ttlAutopurge: l,
      updateAgeOnGet: u,
      updateAgeOnHas: f,
      allowStale: d,
      dispose: m,
      disposeAfter: h,
      noDisposeOnSet: g,
      noUpdateTTL: w,
      maxSize: b = 0,
      maxEntrySize: E = 0,
      sizeCalculation: S,
      fetchMethod: C,
      memoMethod: _,
      noDeleteOnFetchRejection: A,
      noDeleteOnStaleGet: O,
      allowStaleOnFetchRejection: M,
      allowStaleOnFetchAbort: D,
      ignoreFetchAbort: K,
    } = e
    if (n !== 0 && !qi(n))
      throw new TypeError("max option must be a nonnegative integer")
    const W = n ? fC(n) : Array
    if (!W) throw new Error("invalid max value: " + n)
    if (
      (G(this, Zn, n),
      G(this, yn, b),
      (this.maxEntrySize = E || x(this, yn)),
      (this.sizeCalculation = S),
      this.sizeCalculation)
    ) {
      if (!x(this, yn) && !this.maxEntrySize)
        throw new TypeError(
          "cannot set sizeCalculation without setting maxSize or maxEntrySize",
        )
      if (typeof this.sizeCalculation != "function")
        throw new TypeError("sizeCalculation set to non-function")
    }
    if (_ !== void 0 && typeof _ != "function")
      throw new TypeError("memoMethod must be a function if defined")
    if ((G(this, Ba, _), C !== void 0 && typeof C != "function"))
      throw new TypeError("fetchMethod must be a function if specified")
    if (
      (G(this, La, C),
      G(this, as, !!C),
      G(this, yt, new Map()),
      G(this, Ze, new Array(n).fill(void 0)),
      G(this, Re, new Array(n).fill(void 0)),
      G(this, Yt, new W(n)),
      G(this, vn, new W(n)),
      G(this, Wt, 0),
      G(this, At, 0),
      G(this, nr, dg.create(n)),
      G(this, xt, 0),
      G(this, tr, 0),
      typeof m == "function" && G(this, Jn, m),
      typeof h == "function"
        ? (G(this, er, h), G(this, Tt, []))
        : (G(this, er, void 0), G(this, Tt, void 0)),
      G(this, sr, !!x(this, Jn)),
      G(this, Xt, !!x(this, er)),
      (this.noDisposeOnSet = !!g),
      (this.noUpdateTTL = !!w),
      (this.noDeleteOnFetchRejection = !!A),
      (this.allowStaleOnFetchRejection = !!M),
      (this.allowStaleOnFetchAbort = !!D),
      (this.ignoreFetchAbort = !!K),
      this.maxEntrySize !== 0)
    ) {
      if (x(this, yn) !== 0 && !qi(x(this, yn)))
        throw new TypeError("maxSize must be a positive integer if specified")
      if (!qi(this.maxEntrySize))
        throw new TypeError(
          "maxEntrySize must be a positive integer if specified",
        )
      Q(this, ie, dC).call(this)
    }
    if (
      ((this.allowStale = !!d),
      (this.noDeleteOnStaleGet = !!O),
      (this.updateAgeOnGet = !!u),
      (this.updateAgeOnHas = !!f),
      (this.ttlResolution = qi(o) || o === 0 ? o : 1),
      (this.ttlAutopurge = !!l),
      (this.ttl = s || 0),
      this.ttl)
    ) {
      if (!qi(this.ttl))
        throw new TypeError("ttl must be a positive integer if specified")
      Q(this, ie, pg).call(this)
    }
    if (x(this, Zn) === 0 && this.ttl === 0 && x(this, yn) === 0)
      throw new TypeError("At least one of max, maxSize, or ttl is required")
    if (!this.ttlAutopurge && !x(this, Zn) && !x(this, yn)) {
      const q = "LRU_CACHE_UNBOUNDED"
      f3(q) &&
        (uC.add(q),
        cC(
          "TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.",
          "UnboundedCacheWarning",
          q,
          Wy,
        ))
    }
  }
  static unsafeExposeInternals(e) {
    return {
      starts: x(e, ir),
      ttls: x(e, wn),
      sizes: x(e, rr),
      keyMap: x(e, yt),
      keyList: x(e, Ze),
      valList: x(e, Re),
      next: x(e, Yt),
      prev: x(e, vn),
      get head() {
        return x(e, Wt)
      },
      get tail() {
        return x(e, At)
      },
      free: x(e, nr),
      isBackgroundFetch: n => {
        var s
        return Q((s = e), ie, Xe).call(s, n)
      },
      backgroundFetch: (n, s, o, l) => {
        var u
        return Q((u = e), ie, Hf).call(u, n, s, o, l)
      },
      moveToTail: n => {
        var s
        return Q((s = e), ie, cu).call(s, n)
      },
      indexes: n => {
        var s
        return Q((s = e), ie, Qi).call(s, n)
      },
      rindexes: n => {
        var s
        return Q((s = e), ie, Yi).call(s, n)
      },
      isStale: n => {
        var s
        return x((s = e), Sn).call(s, n)
      },
    }
  }
  get max() {
    return x(this, Zn)
  }
  get maxSize() {
    return x(this, yn)
  }
  get calculatedSize() {
    return x(this, tr)
  }
  get size() {
    return x(this, xt)
  }
  get fetchMethod() {
    return x(this, La)
  }
  get memoMethod() {
    return x(this, Ba)
  }
  get dispose() {
    return x(this, Jn)
  }
  get disposeAfter() {
    return x(this, er)
  }
  getRemainingTTL(e) {
    return x(this, yt).has(e) ? 1 / 0 : 0
  }
  *entries() {
    for (const e of Q(this, ie, Qi).call(this))
      x(this, Re)[e] !== void 0 &&
        x(this, Ze)[e] !== void 0 &&
        !Q(this, ie, Xe).call(this, x(this, Re)[e]) &&
        (yield [x(this, Ze)[e], x(this, Re)[e]])
  }
  *rentries() {
    for (const e of Q(this, ie, Yi).call(this))
      x(this, Re)[e] !== void 0 &&
        x(this, Ze)[e] !== void 0 &&
        !Q(this, ie, Xe).call(this, x(this, Re)[e]) &&
        (yield [x(this, Ze)[e], x(this, Re)[e]])
  }
  *keys() {
    for (const e of Q(this, ie, Qi).call(this)) {
      const n = x(this, Ze)[e]
      n !== void 0 && !Q(this, ie, Xe).call(this, x(this, Re)[e]) && (yield n)
    }
  }
  *rkeys() {
    for (const e of Q(this, ie, Yi).call(this)) {
      const n = x(this, Ze)[e]
      n !== void 0 && !Q(this, ie, Xe).call(this, x(this, Re)[e]) && (yield n)
    }
  }
  *values() {
    for (const e of Q(this, ie, Qi).call(this))
      x(this, Re)[e] !== void 0 &&
        !Q(this, ie, Xe).call(this, x(this, Re)[e]) &&
        (yield x(this, Re)[e])
  }
  *rvalues() {
    for (const e of Q(this, ie, Yi).call(this))
      x(this, Re)[e] !== void 0 &&
        !Q(this, ie, Xe).call(this, x(this, Re)[e]) &&
        (yield x(this, Re)[e])
  }
  [((N1 = Symbol.iterator), (M1 = Symbol.toStringTag), N1)]() {
    return this.entries()
  }
  find(e, n = {}) {
    for (const s of Q(this, ie, Qi).call(this)) {
      const o = x(this, Re)[s],
        l = Q(this, ie, Xe).call(this, o) ? o.__staleWhileFetching : o
      if (l !== void 0 && e(l, x(this, Ze)[s], this))
        return this.get(x(this, Ze)[s], n)
    }
  }
  forEach(e, n = this) {
    for (const s of Q(this, ie, Qi).call(this)) {
      const o = x(this, Re)[s],
        l = Q(this, ie, Xe).call(this, o) ? o.__staleWhileFetching : o
      l !== void 0 && e.call(n, l, x(this, Ze)[s], this)
    }
  }
  rforEach(e, n = this) {
    for (const s of Q(this, ie, Yi).call(this)) {
      const o = x(this, Re)[s],
        l = Q(this, ie, Xe).call(this, o) ? o.__staleWhileFetching : o
      l !== void 0 && e.call(n, l, x(this, Ze)[s], this)
    }
  }
  purgeStale() {
    let e = !1
    for (const n of Q(this, ie, Yi).call(this, { allowStale: !0 }))
      x(this, Sn).call(this, n) &&
        (Q(this, ie, Xi).call(this, x(this, Ze)[n], "expire"), (e = !0))
    return e
  }
  info(e) {
    const n = x(this, yt).get(e)
    if (n === void 0) return
    const s = x(this, Re)[n],
      o = Q(this, ie, Xe).call(this, s) ? s.__staleWhileFetching : s
    if (o === void 0) return
    const l = { value: o }
    if (x(this, wn) && x(this, ir)) {
      const u = x(this, wn)[n],
        f = x(this, ir)[n]
      if (u && f) {
        const d = u - (oa.now() - f)
        ;(l.ttl = d), (l.start = Date.now())
      }
    }
    return x(this, rr) && (l.size = x(this, rr)[n]), l
  }
  dump() {
    const e = []
    for (const n of Q(this, ie, Qi).call(this, { allowStale: !0 })) {
      const s = x(this, Ze)[n],
        o = x(this, Re)[n],
        l = Q(this, ie, Xe).call(this, o) ? o.__staleWhileFetching : o
      if (l === void 0 || s === void 0) continue
      const u = { value: l }
      if (x(this, wn) && x(this, ir)) {
        u.ttl = x(this, wn)[n]
        const f = oa.now() - x(this, ir)[n]
        u.start = Math.floor(Date.now() - f)
      }
      x(this, rr) && (u.size = x(this, rr)[n]), e.unshift([s, u])
    }
    return e
  }
  load(e) {
    this.clear()
    for (const [n, s] of e) {
      if (s.start) {
        const o = Date.now() - s.start
        s.start = oa.now() - o
      }
      this.set(n, s.value, s)
    }
  }
  set(e, n, s = {}) {
    var w, b, E, S, C
    if (n === void 0) return this.delete(e), this
    const {
      ttl: o = this.ttl,
      start: l,
      noDisposeOnSet: u = this.noDisposeOnSet,
      sizeCalculation: f = this.sizeCalculation,
      status: d,
    } = s
    let { noUpdateTTL: m = this.noUpdateTTL } = s
    const h = x(this, Du).call(this, e, n, s.size || 0, f)
    if (this.maxEntrySize && h > this.maxEntrySize)
      return (
        d && ((d.set = "miss"), (d.maxEntrySizeExceeded = !0)),
        Q(this, ie, Xi).call(this, e, "set"),
        this
      )
    let g = x(this, xt) === 0 ? void 0 : x(this, yt).get(e)
    if (g === void 0)
      (g =
        x(this, xt) === 0
          ? x(this, At)
          : x(this, nr).length !== 0
            ? x(this, nr).pop()
            : x(this, xt) === x(this, Zn)
              ? Q(this, ie, Vf).call(this, !1)
              : x(this, xt)),
        (x(this, Ze)[g] = e),
        (x(this, Re)[g] = n),
        x(this, yt).set(e, g),
        (x(this, Yt)[x(this, At)] = g),
        (x(this, vn)[g] = x(this, At)),
        G(this, At, g),
        Ms(this, xt)._++,
        x(this, Fa).call(this, g, h, d),
        d && (d.set = "add"),
        (m = !1)
    else {
      Q(this, ie, cu).call(this, g)
      const _ = x(this, Re)[g]
      if (n !== _) {
        if (x(this, as) && Q(this, ie, Xe).call(this, _)) {
          _.__abortController.abort(new Error("replaced"))
          const { __staleWhileFetching: A } = _
          A !== void 0 &&
            !u &&
            (x(this, sr) &&
              ((w = x(this, Jn)) == null || w.call(this, A, e, "set")),
            x(this, Xt) && ((b = x(this, Tt)) == null || b.push([A, e, "set"])))
        } else
          u ||
            (x(this, sr) &&
              ((E = x(this, Jn)) == null || E.call(this, _, e, "set")),
            x(this, Xt) && ((S = x(this, Tt)) == null || S.push([_, e, "set"])))
        if (
          (x(this, ao).call(this, g),
          x(this, Fa).call(this, g, h, d),
          (x(this, Re)[g] = n),
          d)
        ) {
          d.set = "replace"
          const A =
            _ && Q(this, ie, Xe).call(this, _) ? _.__staleWhileFetching : _
          A !== void 0 && (d.oldValue = A)
        }
      } else d && (d.set = "update")
    }
    if (
      (o !== 0 && !x(this, wn) && Q(this, ie, pg).call(this),
      x(this, wn) &&
        (m || x(this, ju).call(this, g, o, l),
        d && x(this, ai).call(this, d, g)),
      !u && x(this, Xt) && x(this, Tt))
    ) {
      const _ = x(this, Tt)
      let A
      for (; (A = _ == null ? void 0 : _.shift()); )
        (C = x(this, er)) == null || C.call(this, ...A)
    }
    return this
  }
  pop() {
    var e
    try {
      for (; x(this, xt); ) {
        const n = x(this, Re)[x(this, Wt)]
        if ((Q(this, ie, Vf).call(this, !0), Q(this, ie, Xe).call(this, n))) {
          if (n.__staleWhileFetching) return n.__staleWhileFetching
        } else if (n !== void 0) return n
      }
    } finally {
      if (x(this, Xt) && x(this, Tt)) {
        const n = x(this, Tt)
        let s
        for (; (s = n == null ? void 0 : n.shift()); )
          (e = x(this, er)) == null || e.call(this, ...s)
      }
    }
  }
  has(e, n = {}) {
    const { updateAgeOnHas: s = this.updateAgeOnHas, status: o } = n,
      l = x(this, yt).get(e)
    if (l !== void 0) {
      const u = x(this, Re)[l]
      if (Q(this, ie, Xe).call(this, u) && u.__staleWhileFetching === void 0)
        return !1
      if (x(this, Sn).call(this, l))
        o && ((o.has = "stale"), x(this, ai).call(this, o, l))
      else
        return (
          s && x(this, oo).call(this, l),
          o && ((o.has = "hit"), x(this, ai).call(this, o, l)),
          !0
        )
    } else o && (o.has = "miss")
    return !1
  }
  peek(e, n = {}) {
    const { allowStale: s = this.allowStale } = n,
      o = x(this, yt).get(e)
    if (o === void 0 || (!s && x(this, Sn).call(this, o))) return
    const l = x(this, Re)[o]
    return Q(this, ie, Xe).call(this, l) ? l.__staleWhileFetching : l
  }
  async fetch(e, n = {}) {
    const {
      allowStale: s = this.allowStale,
      updateAgeOnGet: o = this.updateAgeOnGet,
      noDeleteOnStaleGet: l = this.noDeleteOnStaleGet,
      ttl: u = this.ttl,
      noDisposeOnSet: f = this.noDisposeOnSet,
      size: d = 0,
      sizeCalculation: m = this.sizeCalculation,
      noUpdateTTL: h = this.noUpdateTTL,
      noDeleteOnFetchRejection: g = this.noDeleteOnFetchRejection,
      allowStaleOnFetchRejection: w = this.allowStaleOnFetchRejection,
      ignoreFetchAbort: b = this.ignoreFetchAbort,
      allowStaleOnFetchAbort: E = this.allowStaleOnFetchAbort,
      context: S,
      forceRefresh: C = !1,
      status: _,
      signal: A,
    } = n
    if (!x(this, as))
      return (
        _ && (_.fetch = "get"),
        this.get(e, {
          allowStale: s,
          updateAgeOnGet: o,
          noDeleteOnStaleGet: l,
          status: _,
        })
      )
    const O = {
      allowStale: s,
      updateAgeOnGet: o,
      noDeleteOnStaleGet: l,
      ttl: u,
      noDisposeOnSet: f,
      size: d,
      sizeCalculation: m,
      noUpdateTTL: h,
      noDeleteOnFetchRejection: g,
      allowStaleOnFetchRejection: w,
      allowStaleOnFetchAbort: E,
      ignoreFetchAbort: b,
      status: _,
      signal: A,
    }
    let M = x(this, yt).get(e)
    if (M === void 0) {
      _ && (_.fetch = "miss")
      const D = Q(this, ie, Hf).call(this, e, M, O, S)
      return (D.__returned = D)
    } else {
      const D = x(this, Re)[M]
      if (Q(this, ie, Xe).call(this, D)) {
        const le = s && D.__staleWhileFetching !== void 0
        return (
          _ && ((_.fetch = "inflight"), le && (_.returnedStale = !0)),
          le ? D.__staleWhileFetching : (D.__returned = D)
        )
      }
      const K = x(this, Sn).call(this, M)
      if (!C && !K)
        return (
          _ && (_.fetch = "hit"),
          Q(this, ie, cu).call(this, M),
          o && x(this, oo).call(this, M),
          _ && x(this, ai).call(this, _, M),
          D
        )
      const W = Q(this, ie, Hf).call(this, e, M, O, S),
        Z = W.__staleWhileFetching !== void 0 && s
      return (
        _ &&
          ((_.fetch = K ? "stale" : "refresh"),
          Z && K && (_.returnedStale = !0)),
        Z ? W.__staleWhileFetching : (W.__returned = W)
      )
    }
  }
  async forceFetch(e, n = {}) {
    const s = await this.fetch(e, n)
    if (s === void 0) throw new Error("fetch() returned undefined")
    return s
  }
  memo(e, n = {}) {
    const s = x(this, Ba)
    if (!s) throw new Error("no memoMethod provided to constructor")
    const { context: o, forceRefresh: l, ...u } = n,
      f = this.get(e, u)
    if (!l && f !== void 0) return f
    const d = s(e, f, { options: u, context: o })
    return this.set(e, d, u), d
  }
  get(e, n = {}) {
    const {
        allowStale: s = this.allowStale,
        updateAgeOnGet: o = this.updateAgeOnGet,
        noDeleteOnStaleGet: l = this.noDeleteOnStaleGet,
        status: u,
      } = n,
      f = x(this, yt).get(e)
    if (f !== void 0) {
      const d = x(this, Re)[f],
        m = Q(this, ie, Xe).call(this, d)
      return (
        u && x(this, ai).call(this, u, f),
        x(this, Sn).call(this, f)
          ? (u && (u.get = "stale"),
            m
              ? (u &&
                  s &&
                  d.__staleWhileFetching !== void 0 &&
                  (u.returnedStale = !0),
                s ? d.__staleWhileFetching : void 0)
              : (l || Q(this, ie, Xi).call(this, e, "expire"),
                u && s && (u.returnedStale = !0),
                s ? d : void 0))
          : (u && (u.get = "hit"),
            m
              ? d.__staleWhileFetching
              : (Q(this, ie, cu).call(this, f),
                o && x(this, oo).call(this, f),
                d))
      )
    } else u && (u.get = "miss")
  }
  delete(e) {
    return Q(this, ie, Xi).call(this, e, "delete")
  }
  clear() {
    return Q(this, ie, yg).call(this, "delete")
  }
}
;(Zn = new WeakMap()),
  (yn = new WeakMap()),
  (Jn = new WeakMap()),
  (er = new WeakMap()),
  (La = new WeakMap()),
  (Ba = new WeakMap()),
  (xt = new WeakMap()),
  (tr = new WeakMap()),
  (yt = new WeakMap()),
  (Ze = new WeakMap()),
  (Re = new WeakMap()),
  (Yt = new WeakMap()),
  (vn = new WeakMap()),
  (Wt = new WeakMap()),
  (At = new WeakMap()),
  (nr = new WeakMap()),
  (Tt = new WeakMap()),
  (rr = new WeakMap()),
  (ir = new WeakMap()),
  (wn = new WeakMap()),
  (sr = new WeakMap()),
  (as = new WeakMap()),
  (Xt = new WeakMap()),
  (ie = new WeakSet()),
  (pg = function () {
    const e = new Wf(x(this, Zn)),
      n = new Wf(x(this, Zn))
    G(this, wn, e),
      G(this, ir, n),
      G(this, ju, (l, u, f = oa.now()) => {
        if (
          ((n[l] = u !== 0 ? f : 0), (e[l] = u), u !== 0 && this.ttlAutopurge)
        ) {
          const d = setTimeout(() => {
            x(this, Sn).call(this, l) &&
              Q(this, ie, Xi).call(this, x(this, Ze)[l], "expire")
          }, u + 1)
          d.unref && d.unref()
        }
      }),
      G(this, oo, l => {
        n[l] = e[l] !== 0 ? oa.now() : 0
      }),
      G(this, ai, (l, u) => {
        if (e[u]) {
          const f = e[u],
            d = n[u]
          if (!f || !d) return
          ;(l.ttl = f), (l.start = d), (l.now = s || o())
          const m = l.now - d
          l.remainingTTL = f - m
        }
      })
    let s = 0
    const o = () => {
      const l = oa.now()
      if (this.ttlResolution > 0) {
        s = l
        const u = setTimeout(() => (s = 0), this.ttlResolution)
        u.unref && u.unref()
      }
      return l
    }
    ;(this.getRemainingTTL = l => {
      const u = x(this, yt).get(l)
      if (u === void 0) return 0
      const f = e[u],
        d = n[u]
      if (!f || !d) return 1 / 0
      const m = (s || o()) - d
      return f - m
    }),
      G(this, Sn, l => {
        const u = n[l],
          f = e[l]
        return !!f && !!u && (s || o()) - u > f
      })
  }),
  (oo = new WeakMap()),
  (ai = new WeakMap()),
  (ju = new WeakMap()),
  (Sn = new WeakMap()),
  (dC = function () {
    const e = new Wf(x(this, Zn))
    G(this, tr, 0),
      G(this, rr, e),
      G(this, ao, n => {
        G(this, tr, x(this, tr) - e[n]), (e[n] = 0)
      }),
      G(this, Du, (n, s, o, l) => {
        if (Q(this, ie, Xe).call(this, s)) return 0
        if (!qi(o))
          if (l) {
            if (typeof l != "function")
              throw new TypeError("sizeCalculation must be a function")
            if (((o = l(s, n)), !qi(o)))
              throw new TypeError(
                "sizeCalculation return invalid (expect positive integer)",
              )
          } else
            throw new TypeError(
              "invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.",
            )
        return o
      }),
      G(this, Fa, (n, s, o) => {
        if (((e[n] = s), x(this, yn))) {
          const l = x(this, yn) - e[n]
          for (; x(this, tr) > l; ) Q(this, ie, Vf).call(this, !0)
        }
        G(this, tr, x(this, tr) + e[n]),
          o && ((o.entrySize = s), (o.totalCalculatedSize = x(this, tr)))
      })
  }),
  (ao = new WeakMap()),
  (Fa = new WeakMap()),
  (Du = new WeakMap()),
  (Qi = function* ({ allowStale: e = this.allowStale } = {}) {
    if (x(this, xt))
      for (
        let n = x(this, At);
        !(
          !Q(this, ie, mg).call(this, n) ||
          ((e || !x(this, Sn).call(this, n)) && (yield n), n === x(this, Wt))
        );

      )
        n = x(this, vn)[n]
  }),
  (Yi = function* ({ allowStale: e = this.allowStale } = {}) {
    if (x(this, xt))
      for (
        let n = x(this, Wt);
        !(
          !Q(this, ie, mg).call(this, n) ||
          ((e || !x(this, Sn).call(this, n)) && (yield n), n === x(this, At))
        );

      )
        n = x(this, Yt)[n]
  }),
  (mg = function (e) {
    return e !== void 0 && x(this, yt).get(x(this, Ze)[e]) === e
  }),
  (Vf = function (e) {
    var l, u
    const n = x(this, Wt),
      s = x(this, Ze)[n],
      o = x(this, Re)[n]
    return (
      x(this, as) && Q(this, ie, Xe).call(this, o)
        ? o.__abortController.abort(new Error("evicted"))
        : (x(this, sr) || x(this, Xt)) &&
          (x(this, sr) &&
            ((l = x(this, Jn)) == null || l.call(this, o, s, "evict")),
          x(this, Xt) &&
            ((u = x(this, Tt)) == null || u.push([o, s, "evict"]))),
      x(this, ao).call(this, n),
      e &&
        ((x(this, Ze)[n] = void 0),
        (x(this, Re)[n] = void 0),
        x(this, nr).push(n)),
      x(this, xt) === 1
        ? (G(this, Wt, G(this, At, 0)), (x(this, nr).length = 0))
        : G(this, Wt, x(this, Yt)[n]),
      x(this, yt).delete(s),
      Ms(this, xt)._--,
      n
    )
  }),
  (Hf = function (e, n, s, o) {
    const l = n === void 0 ? void 0 : x(this, Re)[n]
    if (Q(this, ie, Xe).call(this, l)) return l
    const u = new hd(),
      { signal: f } = s
    f == null ||
      f.addEventListener("abort", () => u.abort(f.reason), { signal: u.signal })
    const d = { signal: u.signal, options: s, context: o },
      m = (S, C = !1) => {
        const { aborted: _ } = u.signal,
          A = s.ignoreFetchAbort && S !== void 0
        if (
          (s.status &&
            (_ && !C
              ? ((s.status.fetchAborted = !0),
                (s.status.fetchError = u.signal.reason),
                A && (s.status.fetchAbortIgnored = !0))
              : (s.status.fetchResolved = !0)),
          _ && !A && !C)
        )
          return g(u.signal.reason)
        const O = b
        return (
          x(this, Re)[n] === b &&
            (S === void 0
              ? O.__staleWhileFetching
                ? (x(this, Re)[n] = O.__staleWhileFetching)
                : Q(this, ie, Xi).call(this, e, "fetch")
              : (s.status && (s.status.fetchUpdated = !0),
                this.set(e, S, d.options))),
          S
        )
      },
      h = S => (
        s.status && ((s.status.fetchRejected = !0), (s.status.fetchError = S)),
        g(S)
      ),
      g = S => {
        const { aborted: C } = u.signal,
          _ = C && s.allowStaleOnFetchAbort,
          A = _ || s.allowStaleOnFetchRejection,
          O = A || s.noDeleteOnFetchRejection,
          M = b
        if (
          (x(this, Re)[n] === b &&
            (!O || M.__staleWhileFetching === void 0
              ? Q(this, ie, Xi).call(this, e, "fetch")
              : _ || (x(this, Re)[n] = M.__staleWhileFetching)),
          A)
        )
          return (
            s.status &&
              M.__staleWhileFetching !== void 0 &&
              (s.status.returnedStale = !0),
            M.__staleWhileFetching
          )
        if (M.__returned === M) throw S
      },
      w = (S, C) => {
        var A
        const _ = (A = x(this, La)) == null ? void 0 : A.call(this, e, l, d)
        _ &&
          _ instanceof Promise &&
          _.then(O => S(O === void 0 ? void 0 : O), C),
          u.signal.addEventListener("abort", () => {
            ;(!s.ignoreFetchAbort || s.allowStaleOnFetchAbort) &&
              (S(void 0), s.allowStaleOnFetchAbort && (S = O => m(O, !0)))
          })
      }
    s.status && (s.status.fetchDispatched = !0)
    const b = new Promise(w).then(m, h),
      E = Object.assign(b, {
        __abortController: u,
        __staleWhileFetching: l,
        __returned: void 0,
      })
    return (
      n === void 0
        ? (this.set(e, E, { ...d.options, status: void 0 }),
          (n = x(this, yt).get(e)))
        : (x(this, Re)[n] = E),
      E
    )
  }),
  (Xe = function (e) {
    if (!x(this, as)) return !1
    const n = e
    return (
      !!n &&
      n instanceof Promise &&
      n.hasOwnProperty("__staleWhileFetching") &&
      n.__abortController instanceof hd
    )
  }),
  (gg = function (e, n) {
    ;(x(this, vn)[n] = e), (x(this, Yt)[e] = n)
  }),
  (cu = function (e) {
    e !== x(this, At) &&
      (e === x(this, Wt)
        ? G(this, Wt, x(this, Yt)[e])
        : Q(this, ie, gg).call(this, x(this, vn)[e], x(this, Yt)[e]),
      Q(this, ie, gg).call(this, x(this, At), e),
      G(this, At, e))
  }),
  (Xi = function (e, n) {
    var o, l, u, f
    let s = !1
    if (x(this, xt) !== 0) {
      const d = x(this, yt).get(e)
      if (d !== void 0)
        if (((s = !0), x(this, xt) === 1)) Q(this, ie, yg).call(this, n)
        else {
          x(this, ao).call(this, d)
          const m = x(this, Re)[d]
          if (
            (Q(this, ie, Xe).call(this, m)
              ? m.__abortController.abort(new Error("deleted"))
              : (x(this, sr) || x(this, Xt)) &&
                (x(this, sr) &&
                  ((o = x(this, Jn)) == null || o.call(this, m, e, n)),
                x(this, Xt) &&
                  ((l = x(this, Tt)) == null || l.push([m, e, n]))),
            x(this, yt).delete(e),
            (x(this, Ze)[d] = void 0),
            (x(this, Re)[d] = void 0),
            d === x(this, At))
          )
            G(this, At, x(this, vn)[d])
          else if (d === x(this, Wt)) G(this, Wt, x(this, Yt)[d])
          else {
            const h = x(this, vn)[d]
            x(this, Yt)[h] = x(this, Yt)[d]
            const g = x(this, Yt)[d]
            x(this, vn)[g] = x(this, vn)[d]
          }
          Ms(this, xt)._--, x(this, nr).push(d)
        }
    }
    if (x(this, Xt) && (u = x(this, Tt)) != null && u.length) {
      const d = x(this, Tt)
      let m
      for (; (m = d == null ? void 0 : d.shift()); )
        (f = x(this, er)) == null || f.call(this, ...m)
    }
    return s
  }),
  (yg = function (e) {
    var n, s, o
    for (const l of Q(this, ie, Yi).call(this, { allowStale: !0 })) {
      const u = x(this, Re)[l]
      if (Q(this, ie, Xe).call(this, u))
        u.__abortController.abort(new Error("deleted"))
      else {
        const f = x(this, Ze)[l]
        x(this, sr) && ((n = x(this, Jn)) == null || n.call(this, u, f, e)),
          x(this, Xt) && ((s = x(this, Tt)) == null || s.push([u, f, e]))
      }
    }
    if (
      (x(this, yt).clear(),
      x(this, Re).fill(void 0),
      x(this, Ze).fill(void 0),
      x(this, wn) && x(this, ir) && (x(this, wn).fill(0), x(this, ir).fill(0)),
      x(this, rr) && x(this, rr).fill(0),
      G(this, Wt, 0),
      G(this, At, 0),
      (x(this, nr).length = 0),
      G(this, tr, 0),
      G(this, xt, 0),
      x(this, Xt) && x(this, Tt))
    ) {
      const l = x(this, Tt)
      let u
      for (; (u = l == null ? void 0 : l.shift()); )
        (o = x(this, er)) == null || o.call(this, ...u)
    }
  })
let hg = Wy
var vm, n1
function d3() {
  if (n1) return vm
  n1 = 1
  var t = function (A) {
    return e(A) && !n(A)
  }
  function e(_) {
    return !!_ && typeof _ == "object"
  }
  function n(_) {
    var A = Object.prototype.toString.call(_)
    return A === "[object RegExp]" || A === "[object Date]" || l(_)
  }
  var s = typeof Symbol == "function" && Symbol.for,
    o = s ? Symbol.for("react.element") : 60103
  function l(_) {
    return _.$$typeof === o
  }
  function u(_) {
    return Array.isArray(_) ? [] : {}
  }
  function f(_, A) {
    return A.clone !== !1 && A.isMergeableObject(_) ? S(u(_), _, A) : _
  }
  function d(_, A, O) {
    return _.concat(A).map(function (M) {
      return f(M, O)
    })
  }
  function m(_, A) {
    if (!A.customMerge) return S
    var O = A.customMerge(_)
    return typeof O == "function" ? O : S
  }
  function h(_) {
    return Object.getOwnPropertySymbols
      ? Object.getOwnPropertySymbols(_).filter(function (A) {
          return Object.propertyIsEnumerable.call(_, A)
        })
      : []
  }
  function g(_) {
    return Object.keys(_).concat(h(_))
  }
  function w(_, A) {
    try {
      return A in _
    } catch {
      return !1
    }
  }
  function b(_, A) {
    return (
      w(_, A) &&
      !(
        Object.hasOwnProperty.call(_, A) &&
        Object.propertyIsEnumerable.call(_, A)
      )
    )
  }
  function E(_, A, O) {
    var M = {}
    return (
      O.isMergeableObject(_) &&
        g(_).forEach(function (D) {
          M[D] = f(_[D], O)
        }),
      g(A).forEach(function (D) {
        b(_, D) ||
          (w(_, D) && O.isMergeableObject(A[D])
            ? (M[D] = m(D, O)(_[D], A[D], O))
            : (M[D] = f(A[D], O)))
      }),
      M
    )
  }
  function S(_, A, O) {
    ;(O = O || {}),
      (O.arrayMerge = O.arrayMerge || d),
      (O.isMergeableObject = O.isMergeableObject || t),
      (O.cloneUnlessOtherwiseSpecified = f)
    var M = Array.isArray(A),
      D = Array.isArray(_),
      K = M === D
    return K ? (M ? O.arrayMerge(_, A, O) : E(_, A, O)) : f(A, O)
  }
  S.all = function (A, O) {
    if (!Array.isArray(A)) throw new Error("first argument should be an array")
    return A.reduce(function (M, D) {
      return S(M, D, O)
    }, {})
  }
  var C = S
  return (vm = C), vm
}
d3()
var h3 = {}
i3(h3)
var r1 = (t, e) => {
    for (var n = e - 1; n >= 0; ) {
      if (t[n] === "/") return n
      n--
    }
    return -1
  },
  p3 = t => {
    var e,
      n = t.lastIndexOf(".css")
    if (n === -1) return ""
    var s = r1(t, n)
    if (((e = t.slice(s + 1, n)), s === -1)) return e
    var o = r1(t, s - 1),
      l = t.slice(o + 1, s),
      u = e !== "index" ? e : l
    return u
  },
  m3 = () => {
    var t = new hg({ max: 500 })
    return e => {
      var n = t.get(e)
      if (n) return n
      var s = p3(e)
      return t.set(e, s), s
    }
  }
m3()
function g3(t, e) {
  return Ay(t, (n, s) => {
    var o = typeof e == "function" ? e(n, s) : n,
      l = typeof o == "string" ? o.replace(/^\-\-/, "") : null
    if (typeof l != "string" || l !== r3(l, { isIdentifier: !0 }))
      throw new Error(
        'Invalid variable name for "'.concat(s.join("."), '": ').concat(l),
      )
    return "var(--".concat(l, ")")
  })
}
var y3 = Object.create,
  hC = Object.defineProperty,
  v3 = Object.getOwnPropertyDescriptor,
  Ty = Object.getOwnPropertyNames,
  w3 = Object.getPrototypeOf,
  S3 = Object.prototype.hasOwnProperty,
  pC = t => {
    throw TypeError(t)
  },
  x3 = (t, e) =>
    function () {
      return t && (e = (0, t[Ty(t)[0]])((t = 0))), e
    },
  E3 = (t, e) =>
    function () {
      return e || (0, t[Ty(t)[0]])((e = { exports: {} }).exports, e), e.exports
    },
  b3 = (t, e, n, s) => {
    if ((e && typeof e == "object") || typeof e == "function")
      for (let o of Ty(e))
        !S3.call(t, o) &&
          o !== n &&
          hC(t, o, {
            get: () => e[o],
            enumerable: !(s = v3(e, o)) || s.enumerable,
          })
    return t
  },
  C3 = (t, e, n) => (
    (n = t != null ? y3(w3(t)) : {}),
    b3(
      !t || !t.__esModule ? hC(n, "default", { value: t, enumerable: !0 }) : n,
      t,
    )
  ),
  _3 = (t, e, n) => e.has(t) || pC("Cannot " + n),
  Bs = (t, e, n) => (
    _3(t, e, "read from private field"), n ? n.call(t) : e.get(t)
  ),
  Fs = (t, e, n) =>
    e.has(t)
      ? pC("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(t)
        : e.set(t, n),
  k3 = x3({
    "vanilla-extract-css-ns:src/components/styling/StyleMarker.css.ts.vanilla.css?source=OndoZXJlKCopIHsKICBib3gtc2l6aW5nOiBib3JkZXItYm94OwogIGNvbG9yOiB2YXIoLS1kYXBwLWtpdC1jb2xvcnMtYm9keSk7CiAgZm9udC1mYW1pbHk6IHZhcigtLWRhcHAta2l0LXR5cG9ncmFwaHktZm9udEZhbWlseSk7CiAgZm9udC1zaXplOiB2YXIoLS1kYXBwLWtpdC1mb250V2VpZ2h0cy1ub3JtYWwpOwogIGZvbnQtc3R5bGU6IHZhcigtLWRhcHAta2l0LXR5cG9ncmFwaHktZm9udFN0eWxlKTsKICBmb250LXdlaWdodDogdmFyKC0tZGFwcC1raXQtZm9udFdlaWdodHMtbm9ybWFsKTsKICBsaW5lLWhlaWdodDogdmFyKC0tZGFwcC1raXQtdHlwb2dyYXBoeS1saW5lSGVpZ2h0KTsKICBsZXR0ZXItc3BhY2luZzogdmFyKC0tZGFwcC1raXQtdHlwb2dyYXBoeS1sZXR0ZXJTcGFjaW5nKTsKfQo6d2hlcmUoYnV0dG9uKSB7CiAgYXBwZWFyYW5jZTogbm9uZTsKICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsKICBmb250LXNpemU6IGluaGVyaXQ7CiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7CiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7CiAgbGV0dGVyLXNwYWNpbmc6IGluaGVyaXQ7CiAgY29sb3I6IGluaGVyaXQ7CiAgYm9yZGVyOiAwOwogIHBhZGRpbmc6IDA7CiAgbWFyZ2luOiAwOwp9Cjp3aGVyZShhKSB7CiAgdGV4dC1kZWNvcmF0aW9uOiBub25lOwogIGNvbG9yOiBpbmhlcml0OwogIG91dGxpbmU6IG5vbmU7Cn0KOndoZXJlKG9sLCB1bCkgewogIGxpc3Qtc3R5bGU6IG5vbmU7CiAgbWFyZ2luOiAwOwogIHBhZGRpbmc6IDA7Cn0KOndoZXJlKGgxLCBoMiwgaDMsIGg0LCBoNSwgaDYpIHsKICBmb250LXNpemU6IGluaGVyaXQ7CiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7CiAgbWFyZ2luOiAwOwp9"() {},
  }),
  O3 = E3({
    "src/components/styling/StyleMarker.css.ts"() {
      k3()
    },
  }),
  Ja = {
    all: { baseScope: "wallet" },
    connectWallet: Vi("connect-wallet"),
    autoconnectWallet: Vi("autoconnect-wallet"),
    disconnectWallet: Vi("disconnect-wallet"),
    signPersonalMessage: Vi("sign-personal-message"),
    signTransaction: Vi("sign-transaction"),
    signAndExecuteTransaction: Vi("sign-and-execute-transaction"),
    switchAccount: Vi("switch-account"),
    reportTransactionEffects: Vi("report-transaction-effects"),
  }
function Vi(t) {
  return function (n = []) {
    return [{ ...Ja.all, baseEntity: t }, ...n]
  }
}
var mC = v.createContext(null)
function Vt(t) {
  const e = v.useContext(mC)
  if (!e)
    throw new Error(
      "Could not find WalletContext. Ensure that you have set up the WalletProvider.",
    )
  return $A(e, t)
}
function Ry({ mutationKey: t, ...e } = {}) {
  const n = Vt(o => o.setWalletConnected),
    s = Vt(o => o.setConnectionStatus)
  return Lu({
    mutationKey: Ja.connectWallet(t),
    mutationFn: async ({ wallet: o, accountAddress: l, ...u }) => {
      try {
        s("connecting")
        const f = await o.features["standard:connect"].connect(u),
          d = f.accounts.filter(h =>
            h.chains.some(g => g.split(":")[0] === "sui"),
          ),
          m = A3(d, l)
        return n(o, d, m, f.supportedIntents), { accounts: d }
      } catch (f) {
        throw (s("disconnected"), f)
      }
    },
    ...e,
  })
}
function A3(t, e) {
  return t.length === 0
    ? null
    : e
      ? (t.find(s => s.address === e) ?? t[0])
      : t[0]
}
function Gf(t, e) {
  const o = Cd()
    .get()
    .filter(l => TP(l) && (!e || e(l)))
  return [
    ...t.map(l => o.find(u => u.name === l)).filter(Boolean),
    ...o.filter(l => !t.includes(l.name)),
  ]
}
function lo(t) {
  return (t == null ? void 0 : t.id) ?? (t == null ? void 0 : t.name)
}
function T3(t) {
  return T.jsx("svg", {
    width: 24,
    height: 24,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...t,
    children: T.jsx("path", {
      d: "M7.57 12.262c0 .341.13.629.403.895l5.175 5.059c.204.205.45.307.751.307.609 0 1.101-.485 1.101-1.087 0-.293-.123-.574-.349-.8L10.14 12.27l4.511-4.375A1.13 1.13 0 0 0 15 7.087C15 6.485 14.508 6 13.9 6c-.295 0-.54.103-.752.308l-5.175 5.058c-.28.28-.404.56-.404.896Z",
      fill: "currentColor",
    }),
  })
}
function R3(t) {
  return T.jsx("svg", {
    width: 10,
    height: 10,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...t,
    children: T.jsx("path", {
      d: "M9.708.292a.999.999 0 0 0-1.413 0l-3.289 3.29L1.717.291A.999.999 0 0 0 .305 1.705l3.289 3.289-3.29 3.289a.999.999 0 1 0 1.413 1.412l3.29-3.289 3.288 3.29a.999.999 0 0 0 1.413-1.413l-3.29-3.29 3.29-3.288a.999.999 0 0 0 0-1.413Z",
      fill: "currentColor",
    }),
  })
}
var gC = "data-dapp-kit",
  P3 = `[${gC}]`,
  I3 = { [gC]: "" }
C3(O3())
var Tu = v.forwardRef(({ children: t, ...e }, n) =>
  T.jsx(Bn, { ref: n, ...e, ...I3, children: t }),
)
Tu.displayName = "StyleMarker"
var M3 = Jg({
    defaultClassName: "Heading__1aa835k0",
    variantClassNames: {
      size: {
        sm: "Heading_headingVariants_size_sm__1aa835k1",
        md: "Heading_headingVariants_size_md__1aa835k2",
        lg: "Heading_headingVariants_size_lg__1aa835k3",
        xl: "Heading_headingVariants_size_xl__1aa835k4",
      },
      weight: {
        normal: "Heading_headingVariants_weight_normal__1aa835k5",
        bold: "Heading_headingVariants_weight_bold__1aa835k6",
      },
      truncate: { true: "Heading_headingVariants_truncate_true__1aa835k7" },
    },
    defaultVariants: { size: "lg", weight: "bold" },
    compoundVariants: [],
  }),
  Eo = v.forwardRef(
    (
      {
        children: t,
        className: e,
        asChild: n = !1,
        as: s = "h1",
        size: o,
        weight: l,
        truncate: u,
        ...f
      },
      d,
    ) =>
      T.jsx(Bn, {
        ...f,
        ref: d,
        className: hi(M3({ size: o, weight: l, truncate: u }), e),
        children: n ? t : T.jsx(s, { children: t }),
      }),
  )
Eo.displayName = "Heading"
var N3 = "IconButton_container__s6n7bq0",
  vg = v.forwardRef(({ className: t, asChild: e = !1, ...n }, s) => {
    const o = e ? Bn : "button"
    return T.jsx(o, { ...n, className: hi(N3, t), ref: s })
  })
vg.displayName = "Button"
var j3 = "ConnectModal_backButtonContainer__gz8z96",
  D3 = "ConnectModal_closeButtonContainer__gz8z97",
  L3 = "ConnectModal_content__gz8z92",
  B3 = "ConnectModal_overlay__gz8z90",
  F3 = "ConnectModal_selectedViewContainer__gz8z95",
  U3 = "ConnectModal_title__gz8z91",
  z3 = "ConnectModal_viewContainer__gz8z94",
  $3 = "ConnectModal_walletListContainer__gz8z99",
  W3 = "ConnectModal_walletListContainerWithViewSelected__gz8z9a",
  V3 = "ConnectModal_walletListContent__gz8z98",
  H3 = "ConnectModal_whatIsAWalletButton__gz8z93",
  G3 = Jg({
    defaultClassName: "Button_buttonVariants__x1s81q0",
    variantClassNames: {
      variant: {
        primary: "Button_buttonVariants_variant_primary__x1s81q1",
        outline: "Button_buttonVariants_variant_outline__x1s81q2",
      },
      size: {
        md: "Button_buttonVariants_size_md__x1s81q3",
        lg: "Button_buttonVariants_size_lg__x1s81q4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
    compoundVariants: [],
  }),
  Vu = v.forwardRef(
    ({ className: t, variant: e, size: n, asChild: s = !1, ...o }, l) => {
      const u = s ? Bn : "button"
      return T.jsx(u, {
        ...o,
        className: hi(G3({ variant: e, size: n }), t),
        ref: l,
      })
    },
  )
Vu.displayName = "Button"
var K3 = Jg({
    defaultClassName: "Text__2bv1ur0",
    variantClassNames: {
      size: { sm: "Text_textVariants_size_sm__2bv1ur1" },
      weight: {
        normal: "Text_textVariants_weight_normal__2bv1ur2",
        medium: "Text_textVariants_weight_medium__2bv1ur3",
        bold: "Text_textVariants_weight_bold__2bv1ur4",
      },
      color: {
        muted: "Text_textVariants_color_muted__2bv1ur5",
        danger: "Text_textVariants_color_danger__2bv1ur6",
      },
      mono: { true: "Text_textVariants_mono_true__2bv1ur7" },
    },
    defaultVariants: { size: "sm", weight: "normal" },
    compoundVariants: [],
  }),
  Ha = v.forwardRef(
    (
      {
        children: t,
        className: e,
        asChild: n = !1,
        as: s = "div",
        size: o,
        weight: l,
        color: u,
        mono: f,
        ...d
      },
      m,
    ) =>
      T.jsx(Bn, {
        ...d,
        ref: m,
        className: hi(K3({ size: o, weight: l, color: u, mono: f }), e),
        children: n ? t : T.jsx(s, { children: t }),
      }),
  )
Ha.displayName = "Text"
var q3 = "ConnectionStatus_connectionStatus__nckm2d3",
  Q3 = "ConnectionStatus_container__nckm2d0",
  Y3 = "ConnectionStatus_retryButtonContainer__nckm2d4",
  X3 = "ConnectionStatus_title__nckm2d2",
  Z3 = "ConnectionStatus_walletIcon__nckm2d1"
function J3({
  selectedWallet: t,
  hadConnectionError: e,
  onRetryConnection: n,
}) {
  return T.jsxs("div", {
    className: Q3,
    children: [
      t.icon &&
        T.jsx("img", { className: Z3, src: t.icon, alt: `${t.name} logo` }),
      T.jsx("div", {
        className: X3,
        children: T.jsxs(Eo, {
          as: "h2",
          size: "xl",
          children: ["Opening ", t.name],
        }),
      }),
      T.jsx("div", {
        className: q3,
        children: e
          ? T.jsx(Ha, { color: "danger", children: "Connection failed" })
          : T.jsx(Ha, {
              color: "muted",
              children: "Confirm connection in the wallet...",
            }),
      }),
      e
        ? T.jsx("div", {
            className: Y3,
            children: T.jsx(Vu, {
              type: "button",
              variant: "outline",
              onClick: () => n(t),
              children: "Retry Connection",
            }),
          })
        : null,
    ],
  })
}
var eD = "InfoSection_container__1wtioi70"
function yu({ title: t, children: e }) {
  return T.jsxs("section", {
    className: eD,
    children: [
      T.jsx(Eo, { as: "h3", size: "sm", weight: "normal", children: t }),
      T.jsx(Ha, { weight: "medium", color: "muted", children: e }),
    ],
  })
}
var tD = "GettingStarted_container__1fp07e10",
  nD = "GettingStarted_content__1fp07e11",
  rD = "GettingStarted_installButtonContainer__1fp07e12"
function iD() {
  return T.jsxs("div", {
    className: tD,
    children: [
      T.jsx(Eo, { as: "h2", children: "Get Started with Sui" }),
      T.jsxs("div", {
        className: nD,
        children: [
          T.jsx(yu, {
            title: "Install the Sui Wallet Extension",
            children:
              "We recommend pinning Sui Wallet to your taskbar for quicker access.",
          }),
          T.jsx(yu, {
            title: "Create or Import a Wallet",
            children:
              "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          }),
          T.jsx(yu, {
            title: "Refresh Your Browser",
            children:
              "Once you set up your wallet, refresh this window browser to load up the extension.",
          }),
          T.jsx("div", {
            className: rD,
            children: T.jsx(Vu, {
              variant: "outline",
              asChild: !0,
              children: T.jsx("a", {
                href: "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
                target: "_blank",
                rel: "noreferrer",
                children: "Install Wallet Extension",
              }),
            }),
          }),
        ],
      }),
    ],
  })
}
var sD = "WhatIsAWallet_container__1ktpkq90",
  oD = "WhatIsAWallet_content__1ktpkq91"
function i1() {
  return T.jsxs("div", {
    className: sD,
    children: [
      T.jsx(Eo, { as: "h2", children: "What is a Wallet" }),
      T.jsxs("div", {
        className: oD,
        children: [
          T.jsx(yu, {
            title: "Easy Login",
            children:
              "No need to create new accounts and passwords for every website. Just connect your wallet and get going.",
          }),
          T.jsx(yu, {
            title: "Store your Digital Assets",
            children:
              "Send, receive, store, and display your digital assets like NFTs & coins.",
          }),
        ],
      }),
    ],
  })
}
function yC() {
  return Vt(t => t.wallets)
}
function aD(t) {
  return T.jsxs("svg", {
    width: 28,
    height: 28,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...t,
    children: [
      T.jsx("rect", { width: 28, height: 28, rx: 6, fill: "#6FBCF0" }),
      T.jsx("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M7.942 20.527A6.875 6.875 0 0 0 13.957 24c2.51 0 4.759-1.298 6.015-3.473a6.875 6.875 0 0 0 0-6.945l-5.29-9.164a.837.837 0 0 0-1.45 0l-5.29 9.164a6.875 6.875 0 0 0 0 6.945Zm4.524-11.75 1.128-1.953a.418.418 0 0 1 .725 0l4.34 7.516a5.365 5.365 0 0 1 .449 4.442 4.675 4.675 0 0 0-.223-.73c-.599-1.512-1.954-2.68-4.029-3.47-1.426-.54-2.336-1.336-2.706-2.364-.476-1.326.021-2.77.316-3.44Zm-1.923 3.332L9.255 14.34a5.373 5.373 0 0 0 0 5.43 5.373 5.373 0 0 0 4.702 2.714 5.38 5.38 0 0 0 3.472-1.247c.125-.314.51-1.462.034-2.646-.44-1.093-1.5-1.965-3.15-2.594-1.864-.707-3.076-1.811-3.6-3.28a4.601 4.601 0 0 1-.17-.608Z",
        fill: "#fff",
      }),
    ],
  })
}
var lD = "WalletList_container__1v2s6cz0",
  uD = "WalletListItem_container__1dqqtqs0",
  cD = "WalletListItem_selectedWalletItem__1dqqtqs2",
  fD = "WalletListItem_walletIcon__1dqqtqs3",
  dD = "WalletListItem_walletItem__1dqqtqs1"
function s1({ name: t, icon: e, onClick: n, isSelected: s = !1 }) {
  return T.jsx("li", {
    className: uD,
    children: T.jsxs("button", {
      className: hi(dD, { [cD]: s }),
      type: "button",
      onClick: n,
      children: [
        e && typeof e == "string"
          ? T.jsx("img", { className: fD, src: e, alt: `${t} logo` })
          : e,
        T.jsx(Eo, {
          size: "md",
          truncate: !0,
          asChild: !0,
          children: T.jsx("div", { children: t }),
        }),
      ],
    }),
  })
}
function hD({ selectedWalletName: t, onPlaceholderClick: e, onSelect: n }) {
  const s = yC()
  return T.jsx("ul", {
    className: lD,
    children:
      s.length > 0
        ? s.map(o =>
            T.jsx(
              s1,
              {
                name: o.name,
                icon: o.icon,
                isSelected: lo(o) === t,
                onClick: () => n(o),
              },
              lo(o),
            ),
          )
        : T.jsx(s1, {
            name: "Sui Wallet",
            icon: T.jsx(aD, {}),
            onClick: e,
            isSelected: !0,
          }),
  })
}
function pD({ trigger: t, open: e, defaultOpen: n, onOpenChange: s }) {
  const [o, l] = v.useState(e ?? n),
    [u, f] = v.useState(),
    [d, m] = v.useState(),
    { mutate: h, isError: g } = Ry(),
    w = () => {
      m(void 0), f(void 0)
    },
    b = C => {
      C || w(), l(C), s == null || s(C)
    },
    E = C => {
      f("connection-status"), h({ wallet: C }, { onSuccess: () => b(!1) })
    }
  let S
  switch (u) {
    case "what-is-a-wallet":
      S = T.jsx(i1, {})
      break
    case "getting-started":
      S = T.jsx(iD, {})
      break
    case "connection-status":
      S = T.jsx(J3, {
        selectedWallet: d,
        hadConnectionError: g,
        onRetryConnection: E,
      })
      break
    default:
      S = T.jsx(i1, {})
  }
  return T.jsxs(KO, {
    open: e ?? o,
    onOpenChange: b,
    children: [
      T.jsx(qO, { asChild: !0, children: t }),
      T.jsx(QO, {
        children: T.jsx(Tu, {
          children: T.jsx(YO, {
            className: B3,
            children: T.jsxs(XO, {
              "className": L3,
              "aria-describedby": void 0,
              "children": [
                T.jsxs("div", {
                  className: hi($3, { [W3]: !!u }),
                  children: [
                    T.jsxs("div", {
                      className: V3,
                      children: [
                        T.jsx(ZO, {
                          className: U3,
                          asChild: !0,
                          children: T.jsx(Eo, {
                            as: "h2",
                            children: "Connect a Wallet",
                          }),
                        }),
                        T.jsx(hD, {
                          selectedWalletName: lo(d),
                          onPlaceholderClick: () => f("getting-started"),
                          onSelect: C => {
                            lo(d) !== lo(C) && (m(C), E(C))
                          },
                        }),
                      ],
                    }),
                    T.jsx("button", {
                      className: H3,
                      onClick: () => f("what-is-a-wallet"),
                      type: "button",
                      children: "What is a Wallet?",
                    }),
                  ],
                }),
                T.jsxs("div", {
                  className: hi(z3, { [F3]: !!u }),
                  children: [
                    T.jsx("div", {
                      className: j3,
                      children: T.jsx(vg, {
                        "type": "button",
                        "aria-label": "Back",
                        "onClick": () => w(),
                        "children": T.jsx(T3, {}),
                      }),
                    }),
                    S,
                  ],
                }),
                T.jsx(JO, {
                  className: D3,
                  asChild: !0,
                  children: T.jsx(vg, {
                    "type": "button",
                    "aria-label": "Close",
                    "children": T.jsx(R3, {}),
                  }),
                }),
              ],
            }),
          }),
        }),
      }),
    ],
  })
}
function Hu() {
  return Vt(t => t.currentAccount)
}
var vC = v.createContext(null),
  mD = { localnet: { url: Nf("localnet") } },
  gD = function (e, n) {
    return IN(n) ? n : new Fb(n)
  }
function yD(t) {
  const { onNetworkChange: e, network: n, children: s } = t,
    o = t.networks ?? mD,
    l = t.createClient ?? gD,
    [u, f] = v.useState(t.network ?? t.defaultNetwork ?? Object.keys(o)[0]),
    d = t.network ?? u,
    m = v.useMemo(() => l(d, o[d]), [l, d, o]),
    h = v.useMemo(
      () => ({
        client: m,
        networks: o,
        network: d,
        config: o[d] instanceof Fb ? null : o[d],
        selectNetwork: g => {
          d !== g && (!n && g !== u && f(g), e == null || e(g))
        },
      }),
      [m, o, u, d, n, e],
    )
  return T.jsx(vC.Provider, { value: h, children: s })
}
function Py() {
  const t = v.useContext(vC)
  if (!t)
    throw new Error(
      "Could not find SuiClientContext. Ensure that you have set up the SuiClientProvider",
    )
  return t
}
function zd() {
  return Py().client
}
function wC(...t) {
  const [e, n, { queryKey: s = [], ...o } = {}] = t,
    l = Py()
  return Ox({
    ...o,
    queryKey: [l.network, e, n, ...s],
    queryFn: async () => await l.client[e](n),
  })
}
function SC(t, e) {
  return wC(
    "resolveNameServiceNames",
    { address: t, limit: 1 },
    {
      ...e,
      refetchOnWindowFocus: !1,
      retry: !1,
      select: n => (n.data.length > 0 ? n.data[0] : null),
      enabled: !!t && (e == null ? void 0 : e.enabled) !== !1,
    },
  )
}
function vD() {
  return Vt(t => t.accounts)
}
var $d = class extends Error {},
  xC = class extends Error {},
  wD = class extends Error {},
  SD = class extends Error {}
function el() {
  const t = Vt(s => s.currentWallet),
    e = Vt(s => s.connectionStatus),
    n = Vt(s => s.supportedIntents)
  switch (e) {
    case "connecting":
      return {
        connectionStatus: e,
        currentWallet: null,
        isDisconnected: !1,
        isConnecting: !0,
        isConnected: !1,
        supportedIntents: [],
      }
    case "disconnected":
      return {
        connectionStatus: e,
        currentWallet: null,
        isDisconnected: !0,
        isConnecting: !1,
        isConnected: !1,
        supportedIntents: [],
      }
    case "connected":
      return {
        connectionStatus: e,
        currentWallet: t,
        isDisconnected: !1,
        isConnecting: !1,
        isConnected: !0,
        supportedIntents: n,
      }
  }
}
function xD({ mutationKey: t, ...e } = {}) {
  const { currentWallet: n } = el(),
    s = Vt(o => o.setWalletDisconnected)
  return Lu({
    mutationKey: Ja.disconnectWallet(t),
    mutationFn: async () => {
      var o
      if (!n) throw new $d("No wallet is connected.")
      try {
        await ((o = n.features["standard:disconnect"]) == null
          ? void 0
          : o.disconnect())
      } catch (l) {
        console.error(
          "Failed to disconnect the application from the current wallet.",
          l,
        )
      }
      s()
    },
    ...e,
  })
}
function ED({ mutationKey: t, ...e } = {}) {
  const { currentWallet: n } = el(),
    s = Vt(o => o.setAccountSwitched)
  return Lu({
    mutationKey: Ja.switchAccount(t),
    mutationFn: async ({ account: o }) => {
      if (!n) throw new $d("No wallet is connected.")
      const l = n.accounts.find(u => u.address === o.address)
      if (!l)
        throw new SD(
          `No account with address ${o.address} is connected to ${n.name}.`,
        )
      s(l)
    },
    ...e,
  })
}
var bD = "AccountDropdownMenu_connectedAccount__div2ql0",
  CD = "AccountDropdownMenu_menuContainer__div2ql1",
  _D = "AccountDropdownMenu_menuContent__div2ql2",
  EC = "AccountDropdownMenu_menuItem__div2ql3",
  kD = "AccountDropdownMenu_separator__div2ql5",
  OD = "AccountDropdownMenu_switchAccountMenuItem__div2ql4"
function AD(t) {
  return T.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    fill: "none",
    ...t,
    children: T.jsx("path", {
      fill: "currentColor",
      d: "m11.726 5.048-4.73 5.156-1.722-1.879a.72.72 0 0 0-.529-.23.722.722 0 0 0-.525.24.858.858 0 0 0-.22.573.86.86 0 0 0 .211.576l2.255 2.458c.14.153.332.24.53.24.2 0 .391-.087.532-.24l5.261-5.735A.86.86 0 0 0 13 5.63a.858.858 0 0 0-.22-.572.722.722 0 0 0-.525-.24.72.72 0 0 0-.529.23Z",
    }),
  })
}
function TD(t) {
  return T.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    fill: "none",
    ...t,
    children: T.jsx("path", {
      stroke: "#A0B6C3",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "m4 6 4 4 4-4",
    }),
  })
}
function RD({ currentAccount: t }) {
  const { mutate: e } = xD(),
    { data: n } = SC(t.label ? null : t.address),
    s = vD()
  return T.jsxs(gN, {
    modal: !1,
    children: [
      T.jsx(Tu, {
        children: T.jsx(yN, {
          asChild: !0,
          children: T.jsxs(Vu, {
            size: "lg",
            className: bD,
            children: [
              T.jsx(Ha, {
                mono: !0,
                weight: "bold",
                children: t.label ?? n ?? rE(t.address),
              }),
              T.jsx(TD, {}),
            ],
          }),
        }),
      }),
      T.jsx(vN, {
        children: T.jsx(Tu, {
          className: CD,
          children: T.jsxs(wN, {
            className: _D,
            children: [
              s.map(o =>
                T.jsx(
                  PD,
                  { account: o, active: t.address === o.address },
                  o.address,
                ),
              ),
              T.jsx(SN, { className: kD }),
              T.jsx(Tb, {
                className: hi(EC),
                onSelect: () => e(),
                children: "Disconnect",
              }),
            ],
          }),
        }),
      }),
    ],
  })
}
function PD({ account: t, active: e }) {
  const { mutate: n } = ED(),
    { data: s } = SC(t.label ? null : t.address)
  return T.jsxs(Tb, {
    className: hi(EC, OD),
    onSelect: () => n({ account: t }),
    children: [
      T.jsx(Ha, { mono: !0, children: t.label ?? s ?? rE(t.address) }),
      e ? T.jsx(AD, {}) : null,
    ],
  })
}
function ID({ connectText: t = "Connect Wallet", ...e }) {
  const n = Hu()
  return n
    ? T.jsx(RD, { currentAccount: n })
    : T.jsx(pD, {
        trigger: T.jsx(Tu, { children: T.jsx(Vu, { ...e, children: t }) }),
      })
}
function bC() {
  const t = new Map()
  return {
    getItem(e) {
      return t.get(e)
    },
    setItem(e, n) {
      t.set(e, n)
    },
    removeItem(e) {
      t.delete(e)
    },
  }
}
var MD = "Sui Wallet",
  ND = typeof window < "u" && window.localStorage ? localStorage : bC(),
  jD = "sui-dapp-kit:wallet-connection-info",
  DD = ["sui:signTransaction", "sui:signTransactionBlock"],
  CC = t => DD.some(e => t.features[e]),
  _C = [MD, sC]
function kC() {
  const { mutateAsync: t } = Ry(),
    e = Vt(h => h.autoConnectEnabled),
    n = Vt(h => h.lastConnectedWalletName),
    s = Vt(h => h.lastConnectedAccountAddress),
    o = yC(),
    { isConnected: l } = el(),
    [u, f] = v.useState(!1)
  v.useLayoutEffect(() => {
    f(!0)
  }, [])
  const { data: d, isError: m } = Ox({
    queryKey: [
      "@mysten/dapp-kit",
      "autoconnect",
      {
        isConnected: l,
        autoConnectEnabled: e,
        lastConnectedWalletName: n,
        lastConnectedAccountAddress: s,
        walletCount: o.length,
      },
    ],
    queryFn: async () => {
      if (!e) return "disabled"
      if (!n || !s || l) return "attempted"
      const h = o.find(g => lo(g) === n)
      return (
        h && (await t({ wallet: h, accountAddress: s, silent: !0 })),
        "attempted"
      )
    },
    enabled: e,
    persister: void 0,
    gcTime: 0,
    staleTime: 0,
    networkMode: "always",
    retry: !1,
    retryOnMount: !1,
    refetchInterval: !1,
    refetchIntervalInBackground: !1,
    refetchOnMount: !1,
    refetchOnReconnect: !1,
    refetchOnWindowFocus: !1,
  })
  return e
    ? u
      ? l || !n || m
        ? "attempted"
        : (d ?? "idle")
      : "idle"
    : "disabled"
}
function LD(t) {
  const e = kC(),
    [n, s] = v.useState(null),
    [o, l] = v.useState(null),
    { mutate: u } = Ry()
  v.useEffect(() => {
    !n || !o || e !== "attempted" || (u({ wallet: o, silent: !0 }), s(null))
  }, [n, e, u, o]),
    v.useLayoutEffect(() => {
      if (!(t != null && t.name)) return
      const {
        wallet: f,
        unregister: d,
        addressFromRedirect: m,
      } = Kj(t.name, { origin: t.origin, network: t.network })
      return m && (l(f), s(m)), d
    }, [
      t == null ? void 0 : t.name,
      t == null ? void 0 : t.origin,
      t == null ? void 0 : t.network,
    ])
}
var o1 = "Unsafe Burner Wallet"
function BD(t) {
  const e = zd()
  v.useEffect(() => (t ? FD(e) : void 0), [t, e])
}
function FD(t) {
  var e, n, s, o, l, u, f
  const d = Cd()
  if (d.get().find(b => b.name === o1)) {
    console.warn(
      "registerUnsafeBurnerWallet: Unsafe Burner Wallet already registered, skipping duplicate registration.",
    )
    return
  }
  console.warn(
    "Your application is currently using the unsafe burner wallet. Make sure that this wallet is disabled in production.",
  )
  const h = new ha(),
    g = new _d({
      address: h.getPublicKey().toSuiAddress(),
      publicKey: h.getPublicKey().toSuiBytes(),
      chains: ["sui:unknown"],
      features: [
        "sui:signAndExecuteTransactionBlock",
        "sui:signTransactionBlock",
        "sui:signTransaction",
        "sui:signAndExecuteTransaction",
      ],
    })
  class w {
    constructor() {
      Fs(this, e, () => () => {}),
        Fs(this, n, async () => ({ accounts: this.accounts })),
        Fs(this, s, async E => {
          const { bytes: S, signature: C } = await h.signPersonalMessage(
            E.message,
          )
          return { bytes: S, signature: C }
        }),
        Fs(this, o, async E => {
          const { bytes: S, signature: C } = await E.transactionBlock.sign({
            client: t,
            signer: h,
          })
          return { transactionBlockBytes: S, signature: C }
        }),
        Fs(this, l, async E => {
          var _
          const { bytes: S, signature: C } = await Wa.from(
            await E.transaction.toJSON(),
          ).sign({ client: t, signer: h })
          return (
            (_ = E.signal) == null || _.throwIfAborted(),
            { bytes: S, signature: C }
          )
        }),
        Fs(this, u, async E => {
          const { bytes: S, signature: C } = await E.transactionBlock.sign({
            client: t,
            signer: h,
          })
          return t.executeTransactionBlock({
            signature: C,
            transactionBlock: S,
            options: E.options,
          })
        }),
        Fs(this, f, async E => {
          var O
          const { bytes: S, signature: C } = await Wa.from(
            await E.transaction.toJSON(),
          ).sign({ client: t, signer: h })
          ;(O = E.signal) == null || O.throwIfAborted()
          const { rawEffects: _, digest: A } = await t.executeTransactionBlock({
            signature: C,
            transactionBlock: S,
            options: { showRawEffects: !0 },
          })
          return {
            bytes: S,
            signature: C,
            digest: A,
            effects: Ke(new Uint8Array(_)),
          }
        })
    }
    get version() {
      return "1.0.0"
    }
    get name() {
      return o1
    }
    get icon() {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAJrElEQVR42tWbe2xT1x3H7UxAyD3XrdrSbGXlUbKWsq5rWdVuVOMRSEqSOmnVRZMmJqZNYv1nf3R/jWmVmVrtRRM/YwPd1nVTNcrE3pQCoikrIRAC4VVNY0hlD9ZOo1uCfe3ra9979v0dcy3s5Pper76Oh/STE+495/4+5/c85zqe2f7HAx5vKsS+monJj/CdHi/f4/HWW4f6AwdblmXjTM0NyS+movKtw9v+j6C5gKhyTMTTpA2x15Qwy+Pz75motOGdgKep8WF5ATgVZIt5NeO2wMqD0hfVGNPh3oYaYflsjG0l63PeyLCDnqbsLpZIhaRNFI+Ox+Le5KB0RybK8gDmJOkI07U4i/FhT1NDQl8Me5rUIfaDfELOJ0NsFa/SJQHm1WLsHcDqRWiy9BCL8s0N5t6UWWFVvxplejYm60hC91cNjPtzCTZsAptCVoeLP8PDDQJNCSodap6H+LtE8ZcdkvVkkD38vwDn4/Jvy4EhBhZSvRaUHiTXn31gJJxkUPoClBKKFizM+inhVA2cYIdM4HJouPvoe9s9H+KzDhyGK6KkmIqitBhww2C11rjQL2L4kgUwFxk8yPyzauUA3Pk/353XnA6zKbKCaQ2UlMvJF6W5uF5F8yHfZWZpC9HRmBziaEpm1bpY9XvhxuWJRldC7Mt03WlZwpjnkZUNa2DMG2EaPj9MGd2l2mofd0hQ7ZSopsXckHxVCUp32fXGdD0ZktrgFUmMqwhcWFjp87RArsD+9bn585IRaSHAKgBL3SZwOTRc8BKg7yYoskp5OJDiiPmF2Sj7ox0siYJ7lJA04EqvzZ9B1xSVt6PlW0IxZgUMJdZYAJuWngLQt9IRuZXmoTEkmci8ZtTXTViUKyasA9FRun5d8z6bfw0gYWm9mmCXxZatQgxfC7I2NVpRYQOxKWppLs4mcgn5NcibgL1K40xYp8CYY5TXEpjcb3LAJ0OZyyg3+2nySm6fjEtzkEz+7VBx3RTb+60z9dma7pkvwO2QQL5HzTtAdpKF7euw/HuzfrosBHy+ZsBimzbQshjWTVMDgez53B5MbjcGbr1ZjdUJOM5O0SLXzJ2R+uOA1dMAVoLsm5zb73JSId8t8Aa1LsAJdoTCrCaw6e3NC2DdFMUXWRg173mysJNOSUNskUJ1cOlXa2LhcbgmSszXYSn9hl3KSxTDjrZ2cbbfbWDyumsh9m3e7zCG7a3ETt+gtI7fx6lEOanZKDVvuA2cjYmt5xNOd2Louz3IQ12UZ2Zo3lkb9cDlvSs6m4Vk5Yqlabs0B97wT7PUuCXQz0Bnt9QxMPTW4iwBtmUlY8hFsHJPlzcQ1xuG75CVK1kXofCUGnU9fg1aVD7kfE9MoabtYkcAvIUYS2op3Hc3TTrDQzIAeojugTVLFolWDR6wFPtY0R66n6HltwjCIawnE2ymresk9NtN+pfUUi0mX6RJLfrh9zMRaRPOqubSA8W2MNzC0mHpK7j2ruuw5mYkxl5+2+HGQeg4yNYg7vNg+xMxFsuRMuiTsRJZG3cysAl4D9n4aC4un8L9qUyVvbCyYwFXX1nGUxFf1cCiEQqy75O+TpMwYKNKSPQUqhLyyWLsRbESLctx0YnixgfphRWA8pOPc+N4F9d+eV9V4OlCX/As5w5g+wtGhJGukp5go2R3D7EW9rSDcnGL56YgJHj+8GcFND/Vy41jj/H0jxc6HU/AA2QlR01UlH3D7CmITQnJq4lVWBi1yl8XYEh278c5H++F+Iui7r7bYR8tH/gbqoJN7fVODUhLYVVxzmYCEyOxFg7RUVa0egCHZZ55eRHnp/tKgMna6s/bbMdTxZgMzl9CCcmq7k690OzDfaeSN4QcsREjsQpgXHwyWyfg9K5WE7hc6JqTWjyihObfygOFOkv6i5K5TZx8LsL1sVS4NL8ItiB7sgAcEKcWHfUCVhK3kUVnBNbfXIs4l5xAv5sJs234eTUy93L0Au2otQOw5ORMyfQ6WwexFupVSHowG6uThXfebmlhWojMS3fazmMeGxEI6S2SUti6RAo2vKohVuH3qUG5FWm/PjH8kzutgSH5g58xrVwzIbZkxHf7OFjFC+wrMDXcpOqOKX/g01U/XPvVJyxdWsiJblqYmnZoWbDxAcR56X5WPuh4ewcL5PY9JBRUYjc7fzjG6Uc3mHBWbg23X1BLaFHOSnrw4bWiNAXSEWcWRntIignXTP/oDsfKZX66mMbZAPfhviU1AyYmJLYAMZa/QXjUSeIiixpj3UUFtd884KytjN7EjdGNNMbWwtlf3FvbQ4OQtIoYSzbxqVDLXMTxP8jnnbiyKcaJLvueGLD6kXW2sKZov1tpn7hwXf3ZUvq0K2FXOM7Op/Xgb6PhxsWIErYGVuK3WGXWkkwMMZVCVl5kWtax5A6usgemvnx4DelUcYcFC0eIbcbXKzggeyBjeXIhkftaKknJKLtnuSg7KmKQsrH+1nqbmLWY6w/tBGy/8xrruR5SM99LLIjfT/4ZbNZnQEPssIVb21rKTGRIPDagNoLdFMKgcuLc/TF6Bulk6c7ovg4TU+XvS6FNw1tDfVqH9MOPmBDui0hcK6wz744FlDjNe0m3aVldJYagtI6YbF+3ZGPsQHlN1vbeh8lJofqJ+uo9Zi4wXZxKFiXKGxbHT7pNq71oNg4Qi6MviE0FpRVqjGXILYoJ4tCjdYU1rWeMdPLc/ochj3B9pGNGL4NupGPRlUl35KMVxFLNO6ZnxYlBsUPqoMkbUqAb6VhMVKQ7MVT1dYdrL8hzEAcjpmvjHKphgaFb0ZVJZw7dwVD9q5fkgPTRbBxnzmGfgRLQsMCkG+moQdcp6GzzZsL2MGyllvBNGWM9RqMCk26kI7aBK526csVShZTfzid6FEzeiNAGP92jpCPQEbrW7EW5MbZxAz/fN9lg0IbQaaxrQ83/VoKPb/HqJx67Hw+43CDQBPsX0gm6ufXNvH4vP9rZapzx7+Nn+oxZAjfo2caZ3n350c5W6FSEdQ86sNarj3c/jRV+H42AXsdGRBfPPIlnb/mUtxzWXfALn/PmRze2Gud6E/xsXwYtnlsWN8Tc5/oyxjn/jvyJrlY82xLUfWuPr/TqxzuXQZkIP9M7CXiyuP4B4WmsTnNhzinjrD+WO9bRhmdZWLXe4EKRtV5tpN3Hx3s2G+d79/MJf4qff0LnE72kfFEs4ITQvWLMab8C131dP9n9Je1Yx000Nz2jAf+UJwCBchc3NvGR1Qx71XXY2Ww1Jvx7YalzAPkX9rp5E5Z+pv+ja8bE43uN491b9dHO9Xx4lUxziLn21Nai/wXWM6t9vkvtrwAAAABJRU5ErkJggg=="
    }
    get chains() {
      return MP
    }
    get accounts() {
      return [g]
    }
    get features() {
      return {
        "standard:connect": { version: "1.0.0", connect: Bs(this, n) },
        "standard:events": { version: "1.0.0", on: Bs(this, e) },
        "sui:signPersonalMessage": {
          version: "1.0.0",
          signPersonalMessage: Bs(this, s),
        },
        "sui:signTransactionBlock": {
          version: "1.0.0",
          signTransactionBlock: Bs(this, o),
        },
        "sui:signAndExecuteTransactionBlock": {
          version: "1.0.0",
          signAndExecuteTransactionBlock: Bs(this, u),
        },
        "sui:signTransaction": {
          version: "2.0.0",
          signTransaction: Bs(this, l),
        },
        "sui:signAndExecuteTransaction": {
          version: "2.0.0",
          signAndExecuteTransaction: Bs(this, f),
        },
      }
    }
  }
  return (
    (e = new WeakMap()),
    (n = new WeakMap()),
    (s = new WeakMap()),
    (o = new WeakMap()),
    (l = new WeakMap()),
    (u = new WeakMap()),
    (f = new WeakMap()),
    d.register(new w())
  )
}
function UD() {
  const { currentWallet: t } = el(),
    e = Vt(n => n.updateWalletAccounts)
  v.useEffect(
    () =>
      t == null
        ? void 0
        : t.features["standard:events"].on("change", ({ accounts: s }) => {
            s && e(s)
          }),
    [t == null ? void 0 : t.features, e],
  )
}
function zD(t, e) {
  const n = Vt(o => o.setWalletRegistered),
    s = Vt(o => o.setWalletUnregistered)
  v.useEffect(() => {
    const o = Cd()
    n(Gf(t, e))
    const l = o.on("register", () => {
        n(Gf(t, e))
      }),
      u = o.on("unregister", f => {
        s(Gf(t, e), f)
      })
    return () => {
      l(), u()
    }
  }, [t, e, n, s])
}
var $D = {
  blurs: { modalOverlay: "blur(0)" },
  backgroundColors: {
    primaryButton: "#F6F7F9",
    primaryButtonHover: "#F0F2F5",
    outlineButtonHover: "#F4F4F5",
    modalOverlay: "rgba(24 36 53 / 20%)",
    modalPrimary: "white",
    modalSecondary: "#F7F8F8",
    iconButton: "transparent",
    iconButtonHover: "#F0F1F2",
    dropdownMenu: "#FFFFFF",
    dropdownMenuSeparator: "#F3F6F8",
    walletItemSelected: "white",
    walletItemHover: "#3C424226",
  },
  borderColors: { outlineButton: "#E4E4E7" },
  colors: {
    primaryButton: "#373737",
    outlineButton: "#373737",
    iconButton: "#000000",
    body: "#182435",
    bodyMuted: "#767A81",
    bodyDanger: "#FF794B",
  },
  radii: { small: "6px", medium: "8px", large: "12px", xlarge: "16px" },
  shadows: {
    primaryButton: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    walletItemSelected: "0px 2px 6px rgba(0, 0, 0, 0.05)",
  },
  fontWeights: { normal: "400", medium: "500", bold: "600" },
  fontSizes: { small: "14px", medium: "16px", large: "18px", xlarge: "20px" },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontStyle: "normal",
    lineHeight: "1.3",
    letterSpacing: "1",
  },
}
function WD({ wallets: t, storage: e, storageKey: n, autoConnectEnabled: s }) {
  return IA()(
    Zj(
      (o, l) => ({
        autoConnectEnabled: s,
        wallets: t,
        accounts: [],
        currentWallet: null,
        currentAccount: null,
        lastConnectedAccountAddress: null,
        lastConnectedWalletName: null,
        connectionStatus: "disconnected",
        supportedIntents: [],
        setConnectionStatus(u) {
          o(() => ({ connectionStatus: u }))
        },
        setWalletConnected(u, f, d, m = []) {
          o(() => ({
            accounts: f,
            currentWallet: u,
            currentAccount: d,
            lastConnectedWalletName: lo(u),
            lastConnectedAccountAddress: d == null ? void 0 : d.address,
            connectionStatus: "connected",
            supportedIntents: m,
          }))
        },
        setWalletDisconnected() {
          o(() => ({
            accounts: [],
            currentWallet: null,
            currentAccount: null,
            lastConnectedWalletName: null,
            lastConnectedAccountAddress: null,
            connectionStatus: "disconnected",
            supportedIntents: [],
          }))
        },
        setAccountSwitched(u) {
          o(() => ({
            currentAccount: u,
            lastConnectedAccountAddress: u.address,
          }))
        },
        setWalletRegistered(u) {
          o(() => ({ wallets: u }))
        },
        setWalletUnregistered(u, f) {
          f === l().currentWallet
            ? o(() => ({
                wallets: u,
                accounts: [],
                currentWallet: null,
                currentAccount: null,
                lastConnectedWalletName: null,
                lastConnectedAccountAddress: null,
                connectionStatus: "disconnected",
                supportedIntents: [],
              }))
            : o(() => ({ wallets: u }))
        },
        updateWalletAccounts(u) {
          const f = l().currentAccount
          o(() => ({
            accounts: u,
            currentAccount:
              (f && u.find(({ address: d }) => d === f.address)) || u[0],
          }))
        },
      }),
      {
        name: n,
        storage: oC(() => e),
        partialize: ({
          lastConnectedWalletName: o,
          lastConnectedAccountAddress: l,
        }) => ({ lastConnectedWalletName: o, lastConnectedAccountAddress: l }),
      },
    ),
  )
}
var VD = {
    blurs: { modalOverlay: "" },
    backgroundColors: {
      primaryButton: "",
      primaryButtonHover: "",
      outlineButtonHover: "",
      walletItemHover: "",
      walletItemSelected: "",
      modalOverlay: "",
      modalPrimary: "",
      modalSecondary: "",
      iconButton: "",
      iconButtonHover: "",
      dropdownMenu: "",
      dropdownMenuSeparator: "",
    },
    borderColors: { outlineButton: "" },
    colors: {
      primaryButton: "",
      outlineButton: "",
      body: "",
      bodyMuted: "",
      bodyDanger: "",
      iconButton: "",
    },
    radii: { small: "", medium: "", large: "", xlarge: "" },
    shadows: { primaryButton: "", walletItemSelected: "" },
    fontWeights: { normal: "", medium: "", bold: "" },
    fontSizes: { small: "", medium: "", large: "", xlarge: "" },
    typography: {
      fontFamily: "",
      fontStyle: "",
      lineHeight: "",
      letterSpacing: "",
    },
  },
  HD = g3(VD, (t, e) => `dapp-kit-${e.join("-")}`)
function GD({ theme: t }) {
  const e = Array.isArray(t) ? KD(t) : OC(t)
  return T.jsx("style", {
    precedence: "default",
    href: "mysten-dapp-kit-theme",
    dangerouslySetInnerHTML: { __html: e },
  })
}
function KD(t) {
  return t
    .map(({ mediaQuery: e, selector: n, variables: s }) => {
      const o = OC(s),
        l = n ? `${n} ${o}` : o
      return e ? `@media ${e}{${l}}` : l
    })
    .join(" ")
}
function OC(t) {
  return `${P3} {${qD(t)}}`
}
function qD(t) {
  return Object.entries(e3(HD, t))
    .map(([e, n]) => `${e}:${n};`)
    .join("")
}
function QD({
  preferredWallets: t = _C,
  walletFilter: e = CC,
  storage: n = ND,
  storageKey: s = jD,
  enableUnsafeBurner: o = !1,
  autoConnect: l = !1,
  stashedWallet: u,
  theme: f = $D,
  children: d,
}) {
  const m = v.useRef(
    WD({
      autoConnectEnabled: l,
      wallets: Gf(t, e),
      storage: n || bC(),
      storageKey: s,
    }),
  )
  return T.jsx(mC.Provider, {
    value: m.current,
    children: T.jsxs(YD, {
      preferredWallets: t,
      walletFilter: e,
      enableUnsafeBurner: o,
      stashedWallet: u,
      children: [f ? T.jsx(GD, { theme: f }) : null, d],
    }),
  })
}
function YD({
  preferredWallets: t = _C,
  walletFilter: e = CC,
  enableUnsafeBurner: n = !1,
  stashedWallet: s,
  children: o,
}) {
  return zD(t, e), UD(), LD(s), BD(n), kC(), o
}
function XD(t) {
  function e() {
    const { config: o } = Py()
    if (!o) throw new Error("No network config found")
    return o
  }
  function n() {
    const { variables: o } = e()
    return o ?? {}
  }
  function s(o) {
    return n()[o]
  }
  return {
    networkConfig: t,
    useNetworkConfig: e,
    useNetworkVariables: n,
    useNetworkVariable: s,
  }
}
function ZD({ mutationKey: t, ...e } = {}) {
  const { currentWallet: n } = el(),
    s = Hu()
  return Lu({
    mutationKey: Ja.reportTransactionEffects(t),
    mutationFn: async ({
      effects: o,
      chain: l = n == null ? void 0 : n.chains[0],
      account: u = s,
    }) => {
      if (!n) throw new $d("No wallet is connected.")
      if (!u)
        throw new xC(
          "No wallet account is selected to report transaction effects for",
        )
      const f = n.features["sui:reportTransactionEffects"]
      if (f)
        return await f.reportTransactionEffects({
          effects: Array.isArray(o) ? Ke(new Uint8Array(o)) : o,
          account: u,
          chain: l ?? (n == null ? void 0 : n.chains[0]),
        })
    },
    ...e,
  })
}
function AC({ mutationKey: t, execute: e, ...n } = {}) {
  const { currentWallet: s, supportedIntents: o } = el(),
    l = Hu(),
    u = zd(),
    { mutate: f } = ZD(),
    d =
      e ??
      (async ({ bytes: m, signature: h }) => {
        const { digest: g, rawEffects: w } = await u.executeTransactionBlock({
          transactionBlock: m,
          signature: h,
          options: { showRawEffects: !0 },
        })
        return {
          digest: g,
          rawEffects: w,
          effects: Ke(new Uint8Array(w)),
          bytes: m,
          signature: h,
        }
      })
  return Lu({
    mutationKey: Ja.signAndExecuteTransaction(t),
    mutationFn: async ({ transaction: m, ...h }) => {
      var _
      if (!s) throw new $d("No wallet is connected.")
      const g = h.account ?? l
      if (!g)
        throw new xC(
          "No wallet account is selected to sign the transaction with.",
        )
      const w = h.chain ?? (g == null ? void 0 : g.chains[0])
      if (
        !s.features["sui:signTransaction"] &&
        !s.features["sui:signTransactionBlock"]
      )
        throw new wD(
          "This wallet doesn't support the `signTransaction` feature.",
        )
      const { signature: b, bytes: E } = await OP(s, {
          ...h,
          transaction: {
            async toJSON() {
              return typeof m == "string"
                ? m
                : await m.toJSON({ supportedIntents: o, client: u })
            },
          },
          account: g,
          chain: h.chain ?? g.chains[0],
        }),
        S = await d({ bytes: E, signature: b })
      let C
      if ("effects" in S && (_ = S.effects) != null && _.bcs) C = S.effects.bcs
      else if ("rawEffects" in S) C = Ke(new Uint8Array(S.rawEffects))
      else throw new Error("Could not parse effects from transaction result.")
      return f({ effects: C, account: g, chain: w }), S
    },
    ...n,
  })
}
var JD = "VisuallyHidden",
  TC = v.forwardRef((t, e) =>
    T.jsx(dt.span, {
      ...t,
      ref: e,
      style: {
        position: "absolute",
        border: 0,
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        wordWrap: "normal",
        ...t.style,
      },
    }),
  )
TC.displayName = JD
var RC = TC,
  [Wd, s6] = vo("Tooltip", [jd]),
  Iy = jd(),
  PC = "TooltipProvider",
  eL = 700,
  a1 = "tooltip.open",
  [tL, IC] = Wd(PC),
  MC = t => {
    const {
        __scopeTooltip: e,
        delayDuration: n = eL,
        skipDelayDuration: s = 300,
        disableHoverableContent: o = !1,
        children: l,
      } = t,
      [u, f] = v.useState(!0),
      d = v.useRef(!1),
      m = v.useRef(0)
    return (
      v.useEffect(() => {
        const h = m.current
        return () => window.clearTimeout(h)
      }, []),
      T.jsx(tL, {
        scope: e,
        isOpenDelayed: u,
        delayDuration: n,
        onOpen: v.useCallback(() => {
          window.clearTimeout(m.current), f(!1)
        }, []),
        onClose: v.useCallback(() => {
          window.clearTimeout(m.current),
            (m.current = window.setTimeout(() => f(!0), s))
        }, [s]),
        isPointerInTransitRef: d,
        onPointerInTransitChange: v.useCallback(h => {
          d.current = h
        }, []),
        disableHoverableContent: o,
        children: l,
      })
    )
  }
MC.displayName = PC
var NC = "Tooltip",
  [o6, Vd] = Wd(NC),
  wg = "TooltipTrigger",
  nL = v.forwardRef((t, e) => {
    const { __scopeTooltip: n, ...s } = t,
      o = Vd(wg, n),
      l = IC(wg, n),
      u = Iy(n),
      f = v.useRef(null),
      d = Ct(e, f, o.onTriggerChange),
      m = v.useRef(!1),
      h = v.useRef(!1),
      g = v.useCallback(() => (m.current = !1), [])
    return (
      v.useEffect(
        () => () => document.removeEventListener("pointerup", g),
        [g],
      ),
      T.jsx($E, {
        asChild: !0,
        ...u,
        children: T.jsx(dt.button, {
          "aria-describedby": o.open ? o.contentId : void 0,
          "data-state": o.stateAttribute,
          ...s,
          "ref": d,
          "onPointerMove": Oe(t.onPointerMove, w => {
            w.pointerType !== "touch" &&
              !h.current &&
              !l.isPointerInTransitRef.current &&
              (o.onTriggerEnter(), (h.current = !0))
          }),
          "onPointerLeave": Oe(t.onPointerLeave, () => {
            o.onTriggerLeave(), (h.current = !1)
          }),
          "onPointerDown": Oe(t.onPointerDown, () => {
            ;(m.current = !0),
              document.addEventListener("pointerup", g, { once: !0 })
          }),
          "onFocus": Oe(t.onFocus, () => {
            m.current || o.onOpen()
          }),
          "onBlur": Oe(t.onBlur, o.onClose),
          "onClick": Oe(t.onClick, o.onClose),
        }),
      })
    )
  })
nL.displayName = wg
var rL = "TooltipPortal",
  [a6, iL] = Wd(rL, { forceMount: void 0 }),
  Ga = "TooltipContent",
  sL = v.forwardRef((t, e) => {
    const n = iL(Ga, t.__scopeTooltip),
      { forceMount: s = n.forceMount, side: o = "top", ...l } = t,
      u = Vd(Ga, t.__scopeTooltip)
    return T.jsx(vi, {
      present: s || u.open,
      children: u.disableHoverableContent
        ? T.jsx(jC, { side: o, ...l, ref: e })
        : T.jsx(oL, { side: o, ...l, ref: e }),
    })
  }),
  oL = v.forwardRef((t, e) => {
    const n = Vd(Ga, t.__scopeTooltip),
      s = IC(Ga, t.__scopeTooltip),
      o = v.useRef(null),
      l = Ct(e, o),
      [u, f] = v.useState(null),
      { trigger: d, onClose: m } = n,
      h = o.current,
      { onPointerInTransitChange: g } = s,
      w = v.useCallback(() => {
        f(null), g(!1)
      }, [g]),
      b = v.useCallback(
        (E, S) => {
          const C = E.currentTarget,
            _ = { x: E.clientX, y: E.clientY },
            A = cL(_, C.getBoundingClientRect()),
            O = fL(_, A),
            M = dL(S.getBoundingClientRect()),
            D = pL([...O, ...M])
          f(D), g(!0)
        },
        [g],
      )
    return (
      v.useEffect(() => () => w(), [w]),
      v.useEffect(() => {
        if (d && h) {
          const E = C => b(C, h),
            S = C => b(C, d)
          return (
            d.addEventListener("pointerleave", E),
            h.addEventListener("pointerleave", S),
            () => {
              d.removeEventListener("pointerleave", E),
                h.removeEventListener("pointerleave", S)
            }
          )
        }
      }, [d, h, b, w]),
      v.useEffect(() => {
        if (u) {
          const E = S => {
            const C = S.target,
              _ = { x: S.clientX, y: S.clientY },
              A =
                (d == null ? void 0 : d.contains(C)) ||
                (h == null ? void 0 : h.contains(C)),
              O = !hL(_, u)
            A ? w() : O && (w(), m())
          }
          return (
            document.addEventListener("pointermove", E),
            () => document.removeEventListener("pointermove", E)
          )
        }
      }, [d, h, u, m, w]),
      T.jsx(jC, { ...t, ref: l })
    )
  }),
  [aL, lL] = Wd(NC, { isInside: !1 }),
  jC = v.forwardRef((t, e) => {
    const {
        "__scopeTooltip": n,
        "children": s,
        "aria-label": o,
        "onEscapeKeyDown": l,
        "onPointerDownOutside": u,
        ...f
      } = t,
      d = Vd(Ga, n),
      m = Iy(n),
      { onClose: h } = d
    return (
      v.useEffect(
        () => (
          document.addEventListener(a1, h),
          () => document.removeEventListener(a1, h)
        ),
        [h],
      ),
      v.useEffect(() => {
        if (d.trigger) {
          const g = w => {
            const b = w.target
            b != null && b.contains(d.trigger) && h()
          }
          return (
            window.addEventListener("scroll", g, { capture: !0 }),
            () => window.removeEventListener("scroll", g, { capture: !0 })
          )
        }
      }, [d.trigger, h]),
      T.jsx(xd, {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: l,
        onPointerDownOutside: u,
        onFocusOutside: g => g.preventDefault(),
        onDismiss: h,
        children: T.jsxs(WE, {
          "data-state": d.stateAttribute,
          ...m,
          ...f,
          "ref": e,
          "style": {
            ...f.style,
            "--radix-tooltip-content-transform-origin":
              "var(--radix-popper-transform-origin)",
            "--radix-tooltip-content-available-width":
              "var(--radix-popper-available-width)",
            "--radix-tooltip-content-available-height":
              "var(--radix-popper-available-height)",
            "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-tooltip-trigger-height":
              "var(--radix-popper-anchor-height)",
          },
          "children": [
            T.jsx(D1, { children: s }),
            T.jsx(aL, {
              scope: n,
              isInside: !0,
              children: T.jsx(RC, {
                id: d.contentId,
                role: "tooltip",
                children: o || s,
              }),
            }),
          ],
        }),
      })
    )
  })
sL.displayName = Ga
var DC = "TooltipArrow",
  uL = v.forwardRef((t, e) => {
    const { __scopeTooltip: n, ...s } = t,
      o = Iy(n)
    return lL(DC, n).isInside ? null : T.jsx(VE, { ...o, ...s, ref: e })
  })
uL.displayName = DC
function cL(t, e) {
  const n = Math.abs(e.top - t.y),
    s = Math.abs(e.bottom - t.y),
    o = Math.abs(e.right - t.x),
    l = Math.abs(e.left - t.x)
  switch (Math.min(n, s, o, l)) {
    case l:
      return "left"
    case o:
      return "right"
    case n:
      return "top"
    case s:
      return "bottom"
    default:
      throw new Error("unreachable")
  }
}
function fL(t, e, n = 5) {
  const s = []
  switch (e) {
    case "top":
      s.push({ x: t.x - n, y: t.y + n }, { x: t.x + n, y: t.y + n })
      break
    case "bottom":
      s.push({ x: t.x - n, y: t.y - n }, { x: t.x + n, y: t.y - n })
      break
    case "left":
      s.push({ x: t.x + n, y: t.y - n }, { x: t.x + n, y: t.y + n })
      break
    case "right":
      s.push({ x: t.x - n, y: t.y - n }, { x: t.x - n, y: t.y + n })
      break
  }
  return s
}
function dL(t) {
  const { top: e, right: n, bottom: s, left: o } = t
  return [
    { x: o, y: e },
    { x: n, y: e },
    { x: n, y: s },
    { x: o, y: s },
  ]
}
function hL(t, e) {
  const { x: n, y: s } = t
  let o = !1
  for (let l = 0, u = e.length - 1; l < e.length; u = l++) {
    const f = e[l].x,
      d = e[l].y,
      m = e[u].x,
      h = e[u].y
    d > s != h > s && n < ((m - f) * (s - d)) / (h - d) + f && (o = !o)
  }
  return o
}
function pL(t) {
  const e = t.slice()
  return (
    e.sort((n, s) =>
      n.x < s.x ? -1 : n.x > s.x ? 1 : n.y < s.y ? -1 : n.y > s.y ? 1 : 0,
    ),
    mL(e)
  )
}
function mL(t) {
  if (t.length <= 1) return t.slice()
  const e = []
  for (let s = 0; s < t.length; s++) {
    const o = t[s]
    for (; e.length >= 2; ) {
      const l = e[e.length - 1],
        u = e[e.length - 2]
      if ((l.x - u.x) * (o.y - u.y) >= (l.y - u.y) * (o.x - u.x)) e.pop()
      else break
    }
    e.push(o)
  }
  e.pop()
  const n = []
  for (let s = t.length - 1; s >= 0; s--) {
    const o = t[s]
    for (; n.length >= 2; ) {
      const l = n[n.length - 1],
        u = n[n.length - 2]
      if ((l.x - u.x) * (o.y - u.y) >= (l.y - u.y) * (o.x - u.x)) n.pop()
      else break
    }
    n.push(o)
  }
  return (
    n.pop(),
    e.length === 1 && n.length === 1 && e[0].x === n[0].x && e[0].y === n[0].y
      ? e
      : e.concat(n)
  )
}
var gL = MC,
  wm = { exports: {} }
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/ var l1
function yL() {
  return (
    l1 ||
      ((l1 = 1),
      (function (t) {
        ;(function () {
          var e = {}.hasOwnProperty
          function n() {
            for (var l = "", u = 0; u < arguments.length; u++) {
              var f = arguments[u]
              f && (l = o(l, s(f)))
            }
            return l
          }
          function s(l) {
            if (typeof l == "string" || typeof l == "number") return l
            if (typeof l != "object") return ""
            if (Array.isArray(l)) return n.apply(null, l)
            if (
              l.toString !== Object.prototype.toString &&
              !l.toString.toString().includes("[native code]")
            )
              return l.toString()
            var u = ""
            for (var f in l) e.call(l, f) && l[f] && (u = o(u, f))
            return u
          }
          function o(l, u) {
            return u ? (l ? l + " " + u : l + u) : l
          }
          t.exports
            ? ((n.default = n), (t.exports = n))
            : (window.classNames = n)
        })()
      })(wm)),
    wm.exports
  )
}
var vL = yL()
const cn = yo(vL),
  tl = { asChild: { type: "boolean" } },
  LC = {
    width: {
      type: "string",
      className: "rt-r-w",
      customProperties: ["--width"],
      responsive: !0,
    },
    minWidth: {
      type: "string",
      className: "rt-r-min-w",
      customProperties: ["--min-width"],
      responsive: !0,
    },
    maxWidth: {
      type: "string",
      className: "rt-r-max-w",
      customProperties: ["--max-width"],
      responsive: !0,
    },
  },
  BC = {
    height: {
      type: "string",
      className: "rt-r-h",
      customProperties: ["--height"],
      responsive: !0,
    },
    minHeight: {
      type: "string",
      className: "rt-r-min-h",
      customProperties: ["--min-height"],
      responsive: !0,
    },
    maxHeight: {
      type: "string",
      className: "rt-r-max-h",
      customProperties: ["--max-height"],
      responsive: !0,
    },
  },
  FC = [
    "gray",
    "gold",
    "bronze",
    "brown",
    "yellow",
    "amber",
    "orange",
    "tomato",
    "red",
    "ruby",
    "crimson",
    "pink",
    "plum",
    "purple",
    "violet",
    "iris",
    "indigo",
    "blue",
    "cyan",
    "teal",
    "jade",
    "green",
    "grass",
    "lime",
    "mint",
    "sky",
  ],
  UC = { color: { type: "enum", values: FC, default: void 0 } },
  wL = { color: { type: "enum", values: FC, default: "" } },
  My = {
    highContrast: {
      type: "boolean",
      className: "rt-high-contrast",
      default: void 0,
    },
  },
  SL = ["normal", "start", "end", "both"],
  zC = {
    trim: { type: "enum", className: "rt-r-lt", values: SL, responsive: !0 },
  },
  xL = ["left", "center", "right"],
  $C = {
    align: { type: "enum", className: "rt-r-ta", values: xL, responsive: !0 },
  },
  EL = ["wrap", "nowrap", "pretty", "balance"],
  WC = {
    wrap: { type: "enum", className: "rt-r-tw", values: EL, responsive: !0 },
  },
  VC = { truncate: { type: "boolean", className: "rt-truncate" } },
  bL = ["light", "regular", "medium", "bold"],
  HC = {
    weight: {
      type: "enum",
      className: "rt-r-weight",
      values: bL,
      responsive: !0,
    },
  },
  CL = ["h1", "h2", "h3", "h4", "h5", "h6"],
  _L = ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  kL = {
    as: { type: "enum", values: CL, default: "h1" },
    ...tl,
    size: {
      type: "enum",
      className: "rt-r-size",
      values: _L,
      default: "6",
      responsive: !0,
    },
    ...HC,
    ...$C,
    ...zC,
    ...VC,
    ...WC,
    ...UC,
    ...My,
  },
  Ny = ["initial", "xs", "sm", "md", "lg", "xl"]
function GC(t, e) {
  return Object.prototype.hasOwnProperty.call(t, e)
}
function vu(t) {
  return typeof t == "object" && Object.keys(t).some(e => Ny.includes(e))
}
function OL({ className: t, customProperties: e, ...n }) {
  const s = KC({ allowArbitraryValues: !0, className: t, ...n }),
    o = AL({ customProperties: e, ...n })
  return [s, o]
}
function KC({
  allowArbitraryValues: t,
  value: e,
  className: n,
  propValues: s,
  parseValue: o = l => l,
}) {
  const l = []
  if (e) {
    if (typeof e == "string" && s.includes(e)) return u1(n, e, o)
    if (vu(e)) {
      const u = e
      for (const f in u) {
        if (!GC(u, f) || !Ny.includes(f)) continue
        const d = u[f]
        if (d !== void 0) {
          if (s.includes(d)) {
            const m = u1(n, d, o),
              h = f === "initial" ? m : `${f}:${m}`
            l.push(h)
          } else if (t) {
            const m = f === "initial" ? n : `${f}:${n}`
            l.push(m)
          }
        }
      }
      return l.join(" ")
    }
    if (t) return n
  }
}
function u1(t, e, n) {
  const s = t ? "-" : "",
    o = n(e),
    l = o == null ? void 0 : o.startsWith("-"),
    u = l ? "-" : "",
    f = l ? (o == null ? void 0 : o.substring(1)) : o
  return `${u}${t}${s}${f}`
}
function AL({
  customProperties: t,
  value: e,
  propValues: n,
  parseValue: s = o => o,
}) {
  let o = {}
  if (!(!e || (typeof e == "string" && n.includes(e)))) {
    if (
      (typeof e == "string" && (o = Object.fromEntries(t.map(l => [l, e]))),
      vu(e))
    ) {
      const l = e
      for (const u in l) {
        if (!GC(l, u) || !Ny.includes(u)) continue
        const f = l[u]
        if (!n.includes(f))
          for (const d of t)
            o = { [u === "initial" ? d : `${d}-${u}`]: f, ...o }
      }
    }
    for (const l in o) {
      const u = o[l]
      u !== void 0 && (o[l] = s(u))
    }
    return o
  }
}
function c1(...t) {
  let e = {}
  for (const n of t) n && (e = { ...e, ...n })
  return Object.keys(e).length ? e : void 0
}
function TL(...t) {
  return Object.assign({}, ...t)
}
function hs(t, ...e) {
  let n, s
  const o = { ...t },
    l = TL(...e)
  for (const u in l) {
    let f = o[u]
    const d = l[u]
    if (
      (d.default !== void 0 && f === void 0 && (f = d.default),
      d.type === "enum" &&
        ![d.default, ...d.values].includes(f) &&
        !vu(f) &&
        (f = d.default),
      (o[u] = f),
      "className" in d && d.className)
    ) {
      delete o[u]
      const m = "responsive" in d
      if (!f || (vu(f) && !m)) continue
      if (
        (vu(f) &&
          (d.default !== void 0 &&
            f.initial === void 0 &&
            (f.initial = d.default),
          d.type === "enum" &&
            ([d.default, ...d.values].includes(f.initial) ||
              (f.initial = d.default))),
        d.type === "enum")
      ) {
        const h = KC({
          allowArbitraryValues: !1,
          value: f,
          className: d.className,
          propValues: d.values,
          parseValue: d.parseValue,
        })
        n = cn(n, h)
        continue
      }
      if (d.type === "string" || d.type === "enum | string") {
        const h = d.type === "string" ? [] : d.values,
          [g, w] = OL({
            className: d.className,
            customProperties: d.customProperties,
            propValues: h,
            parseValue: d.parseValue,
            value: f,
          })
        ;(s = c1(s, w)), (n = cn(n, g))
        continue
      }
      if (d.type === "boolean" && f) {
        n = cn(n, d.className)
        continue
      }
    }
  }
  return (o.className = cn(n, t.className)), (o.style = c1(s, t.style)), o
}
const Us = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "-1",
    "-2",
    "-3",
    "-4",
    "-5",
    "-6",
    "-7",
    "-8",
    "-9",
  ],
  bo = {
    m: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-m",
      customProperties: ["--m"],
    },
    mx: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-mx",
      customProperties: ["--ml", "--mr"],
    },
    my: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-my",
      customProperties: ["--mt", "--mb"],
    },
    mt: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-mt",
      customProperties: ["--mt"],
    },
    mr: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-mr",
      customProperties: ["--mr"],
    },
    mb: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-mb",
      customProperties: ["--mb"],
    },
    ml: {
      type: "enum | string",
      values: Us,
      responsive: !0,
      className: "rt-r-ml",
      customProperties: ["--ml"],
    },
  },
  pd = v.forwardRef((t, e) => {
    const {
      children: n,
      className: s,
      asChild: o,
      as: l = "h1",
      color: u,
      ...f
    } = hs(t, kL, bo)
    return v.createElement(
      qa,
      {
        "data-accent-color": u,
        ...f,
        "ref": e,
        "className": cn("rt-Heading", s),
      },
      o ? n : v.createElement(l, null, n),
    )
  })
pd.displayName = "Heading"
const RL = ["span", "div", "label", "p"],
  PL = ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  IL = {
    as: { type: "enum", values: RL, default: "span" },
    ...tl,
    size: { type: "enum", className: "rt-r-size", values: PL, responsive: !0 },
    ...HC,
    ...$C,
    ...zC,
    ...VC,
    ...WC,
    ...UC,
    ...My,
  },
  ci = v.forwardRef((t, e) => {
    const {
      children: n,
      className: s,
      asChild: o,
      as: l = "span",
      color: u,
      ...f
    } = hs(t, IL, bo)
    return v.createElement(
      qa,
      { "data-accent-color": u, ...f, "ref": e, "className": cn("rt-Text", s) },
      o ? n : v.createElement(l, null, n),
    )
  })
ci.displayName = "Text"
function ML(t) {
  switch (t) {
    case "tomato":
    case "red":
    case "ruby":
    case "crimson":
    case "pink":
    case "plum":
    case "purple":
    case "violet":
      return "mauve"
    case "iris":
    case "indigo":
    case "blue":
    case "sky":
    case "cyan":
      return "slate"
    case "teal":
    case "jade":
    case "mint":
    case "green":
      return "sage"
    case "grass":
    case "lime":
      return "olive"
    case "yellow":
    case "amber":
    case "orange":
    case "brown":
    case "gold":
    case "bronze":
      return "sand"
    case "gray":
      return "gray"
  }
}
const NL = ["none", "small", "medium", "large", "full"],
  jL = { radius: { type: "enum", values: NL, default: void 0 } },
  xn = {
    hasBackground: { default: !0 },
    appearance: { default: "inherit" },
    accentColor: { default: "indigo" },
    grayColor: { default: "auto" },
    panelBackground: { default: "translucent" },
    radius: { default: "medium" },
    scaling: { default: "100%" },
  },
  aa = () => {},
  Sg = v.createContext(void 0),
  qC = v.forwardRef((t, e) =>
    v.useContext(Sg) === void 0
      ? v.createElement(
          gL,
          { delayDuration: 200 },
          v.createElement(
            FP,
            { dir: "ltr" },
            v.createElement(QC, { ...t, ref: e }),
          ),
        )
      : v.createElement(jy, { ...t, ref: e }),
  )
qC.displayName = "Theme"
const QC = v.forwardRef((t, e) => {
  const {
      appearance: n = xn.appearance.default,
      accentColor: s = xn.accentColor.default,
      grayColor: o = xn.grayColor.default,
      panelBackground: l = xn.panelBackground.default,
      radius: u = xn.radius.default,
      scaling: f = xn.scaling.default,
      hasBackground: d = xn.hasBackground.default,
      ...m
    } = t,
    [h, g] = v.useState(n)
  v.useEffect(() => g(n), [n])
  const [w, b] = v.useState(s)
  v.useEffect(() => b(s), [s])
  const [E, S] = v.useState(o)
  v.useEffect(() => S(o), [o])
  const [C, _] = v.useState(l)
  v.useEffect(() => _(l), [l])
  const [A, O] = v.useState(u)
  v.useEffect(() => O(u), [u])
  const [M, D] = v.useState(f)
  return (
    v.useEffect(() => D(f), [f]),
    v.createElement(jy, {
      ...m,
      ref: e,
      isRoot: !0,
      hasBackground: d,
      appearance: h,
      accentColor: w,
      grayColor: E,
      panelBackground: C,
      radius: A,
      scaling: M,
      onAppearanceChange: g,
      onAccentColorChange: b,
      onGrayColorChange: S,
      onPanelBackgroundChange: _,
      onRadiusChange: O,
      onScalingChange: D,
    })
  )
})
QC.displayName = "ThemeRoot"
const jy = v.forwardRef((t, e) => {
  const n = v.useContext(Sg),
    {
      asChild: s,
      isRoot: o,
      hasBackground: l,
      appearance: u = (n == null ? void 0 : n.appearance) ??
        xn.appearance.default,
      accentColor: f = (n == null ? void 0 : n.accentColor) ??
        xn.accentColor.default,
      grayColor: d = (n == null ? void 0 : n.resolvedGrayColor) ??
        xn.grayColor.default,
      panelBackground: m = (n == null ? void 0 : n.panelBackground) ??
        xn.panelBackground.default,
      radius: h = (n == null ? void 0 : n.radius) ?? xn.radius.default,
      scaling: g = (n == null ? void 0 : n.scaling) ?? xn.scaling.default,
      onAppearanceChange: w = aa,
      onAccentColorChange: b = aa,
      onGrayColorChange: E = aa,
      onPanelBackgroundChange: S = aa,
      onRadiusChange: C = aa,
      onScalingChange: _ = aa,
      ...A
    } = t,
    O = s ? qa : "div",
    M = d === "auto" ? ML(f) : d,
    D = t.appearance === "light" || t.appearance === "dark",
    K = l === void 0 ? o || D : l
  return v.createElement(
    Sg.Provider,
    {
      value: v.useMemo(
        () => ({
          appearance: u,
          accentColor: f,
          grayColor: d,
          resolvedGrayColor: M,
          panelBackground: m,
          radius: h,
          scaling: g,
          onAppearanceChange: w,
          onAccentColorChange: b,
          onGrayColorChange: E,
          onPanelBackgroundChange: S,
          onRadiusChange: C,
          onScalingChange: _,
        }),
        [u, f, d, M, m, h, g, w, b, E, S, C, _],
      ),
    },
    v.createElement(O, {
      "data-is-root-theme": o ? "true" : "false",
      "data-accent-color": f,
      "data-gray-color": M,
      "data-has-background": K ? "true" : "false",
      "data-panel-background": m,
      "data-radius": h,
      "data-scaling": g,
      "ref": e,
      ...A,
      "className": cn(
        "radix-themes",
        { light: u === "light", dark: u === "dark" },
        A.className,
      ),
    }),
  )
})
jy.displayName = "ThemeImpl"
function DL(t, e) {
  const { asChild: n, children: s } = t
  if (!n) return typeof e == "function" ? e(s) : e
  const o = v.Children.only(s)
  return v.cloneElement(o, {
    children: typeof e == "function" ? e(o.props.children) : e,
  })
}
const YC = qa,
  LL = ["div", "span"],
  BL = ["none", "inline", "inline-block", "block", "contents"],
  FL = {
    as: { type: "enum", values: LL, default: "div" },
    ...tl,
    display: {
      type: "enum",
      className: "rt-r-display",
      values: BL,
      responsive: !0,
    },
  },
  zs = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  UL = {
    p: {
      type: "enum | string",
      className: "rt-r-p",
      customProperties: ["--p"],
      values: zs,
      responsive: !0,
    },
    px: {
      type: "enum | string",
      className: "rt-r-px",
      customProperties: ["--pl", "--pr"],
      values: zs,
      responsive: !0,
    },
    py: {
      type: "enum | string",
      className: "rt-r-py",
      customProperties: ["--pt", "--pb"],
      values: zs,
      responsive: !0,
    },
    pt: {
      type: "enum | string",
      className: "rt-r-pt",
      customProperties: ["--pt"],
      values: zs,
      responsive: !0,
    },
    pr: {
      type: "enum | string",
      className: "rt-r-pr",
      customProperties: ["--pr"],
      values: zs,
      responsive: !0,
    },
    pb: {
      type: "enum | string",
      className: "rt-r-pb",
      customProperties: ["--pb"],
      values: zs,
      responsive: !0,
    },
    pl: {
      type: "enum | string",
      className: "rt-r-pl",
      customProperties: ["--pl"],
      values: zs,
      responsive: !0,
    },
  },
  Sm = ["visible", "hidden", "clip", "scroll", "auto"],
  zL = ["static", "relative", "absolute", "fixed", "sticky"],
  Ql = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "-1",
    "-2",
    "-3",
    "-4",
    "-5",
    "-6",
    "-7",
    "-8",
    "-9",
  ],
  $L = ["0", "1"],
  WL = ["0", "1"],
  Dy = {
    ...UL,
    ...LC,
    ...BC,
    position: {
      type: "enum",
      className: "rt-r-position",
      values: zL,
      responsive: !0,
    },
    inset: {
      type: "enum | string",
      className: "rt-r-inset",
      customProperties: ["--inset"],
      values: Ql,
      responsive: !0,
    },
    top: {
      type: "enum | string",
      className: "rt-r-top",
      customProperties: ["--top"],
      values: Ql,
      responsive: !0,
    },
    right: {
      type: "enum | string",
      className: "rt-r-right",
      customProperties: ["--right"],
      values: Ql,
      responsive: !0,
    },
    bottom: {
      type: "enum | string",
      className: "rt-r-bottom",
      customProperties: ["--bottom"],
      values: Ql,
      responsive: !0,
    },
    left: {
      type: "enum | string",
      className: "rt-r-left",
      customProperties: ["--left"],
      values: Ql,
      responsive: !0,
    },
    overflow: {
      type: "enum",
      className: "rt-r-overflow",
      values: Sm,
      responsive: !0,
    },
    overflowX: {
      type: "enum",
      className: "rt-r-ox",
      values: Sm,
      responsive: !0,
    },
    overflowY: {
      type: "enum",
      className: "rt-r-oy",
      values: Sm,
      responsive: !0,
    },
    flexBasis: {
      type: "string",
      className: "rt-r-fb",
      customProperties: ["--flex-basis"],
      responsive: !0,
    },
    flexShrink: {
      type: "enum | string",
      className: "rt-r-fs",
      customProperties: ["--flex-shrink"],
      values: $L,
      responsive: !0,
    },
    flexGrow: {
      type: "enum | string",
      className: "rt-r-fg",
      customProperties: ["--flex-grow"],
      values: WL,
      responsive: !0,
    },
    gridArea: {
      type: "string",
      className: "rt-r-ga",
      customProperties: ["--grid-area"],
      responsive: !0,
    },
    gridColumn: {
      type: "string",
      className: "rt-r-gc",
      customProperties: ["--grid-column"],
      responsive: !0,
    },
    gridColumnStart: {
      type: "string",
      className: "rt-r-gcs",
      customProperties: ["--grid-column-start"],
      responsive: !0,
    },
    gridColumnEnd: {
      type: "string",
      className: "rt-r-gce",
      customProperties: ["--grid-column-end"],
      responsive: !0,
    },
    gridRow: {
      type: "string",
      className: "rt-r-gr",
      customProperties: ["--grid-row"],
      responsive: !0,
    },
    gridRowStart: {
      type: "string",
      className: "rt-r-grs",
      customProperties: ["--grid-row-start"],
      responsive: !0,
    },
    gridRowEnd: {
      type: "string",
      className: "rt-r-gre",
      customProperties: ["--grid-row-end"],
      responsive: !0,
    },
  },
  md = v.forwardRef((t, e) => {
    const { className: n, asChild: s, as: o = "div", ...l } = hs(t, FL, Dy, bo)
    return v.createElement(s ? YC : o, {
      ...l,
      ref: e,
      className: cn("rt-Box", n),
    })
  })
md.displayName = "Box"
const VL = ["1", "2", "3", "4"],
  HL = ["classic", "solid", "soft", "surface", "outline", "ghost"],
  f1 = {
    ...tl,
    size: {
      type: "enum",
      className: "rt-r-size",
      values: VL,
      default: "2",
      responsive: !0,
    },
    variant: {
      type: "enum",
      className: "rt-variant",
      values: HL,
      default: "solid",
    },
    ...wL,
    ...My,
    ...jL,
    loading: { type: "boolean", className: "rt-loading", default: !1 },
  },
  xm = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  GL = {
    gap: {
      type: "enum | string",
      className: "rt-r-gap",
      customProperties: ["--gap"],
      values: xm,
      responsive: !0,
    },
    gapX: {
      type: "enum | string",
      className: "rt-r-cg",
      customProperties: ["--column-gap"],
      values: xm,
      responsive: !0,
    },
    gapY: {
      type: "enum | string",
      className: "rt-r-rg",
      customProperties: ["--row-gap"],
      values: xm,
      responsive: !0,
    },
  },
  KL = ["div", "span"],
  qL = ["none", "inline-flex", "flex"],
  QL = ["row", "column", "row-reverse", "column-reverse"],
  YL = ["start", "center", "end", "baseline", "stretch"],
  XL = ["start", "center", "end", "between"],
  ZL = ["nowrap", "wrap", "wrap-reverse"],
  JL = {
    as: { type: "enum", values: KL, default: "div" },
    ...tl,
    display: {
      type: "enum",
      className: "rt-r-display",
      values: qL,
      responsive: !0,
    },
    direction: {
      type: "enum",
      className: "rt-r-fd",
      values: QL,
      responsive: !0,
    },
    align: { type: "enum", className: "rt-r-ai", values: YL, responsive: !0 },
    justify: {
      type: "enum",
      className: "rt-r-jc",
      values: XL,
      parseValue: e4,
      responsive: !0,
    },
    wrap: { type: "enum", className: "rt-r-fw", values: ZL, responsive: !0 },
    ...GL,
  }
function e4(t) {
  return t === "between" ? "space-between" : t
}
const ps = v.forwardRef((t, e) => {
  const { className: n, asChild: s, as: o = "div", ...l } = hs(t, JL, Dy, bo)
  return v.createElement(s ? YC : o, {
    ...l,
    ref: e,
    className: cn("rt-Flex", n),
  })
})
ps.displayName = "Flex"
const t4 = ["1", "2", "3"],
  n4 = {
    size: {
      type: "enum",
      className: "rt-r-size",
      values: t4,
      default: "2",
      responsive: !0,
    },
    loading: { type: "boolean", default: !0 },
  },
  Ly = v.forwardRef((t, e) => {
    const { className: n, children: s, loading: o, ...l } = hs(t, n4, bo)
    if (!o) return s
    const u = v.createElement(
      "span",
      { ...l, ref: e, className: cn("rt-Spinner", n) },
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
      v.createElement("span", { className: "rt-SpinnerLeaf" }),
    )
    return s === void 0
      ? u
      : v.createElement(
          ps,
          {
            asChild: !0,
            position: "relative",
            align: "center",
            justify: "center",
          },
          v.createElement(
            "span",
            null,
            v.createElement(
              "span",
              {
                "aria-hidden": !0,
                "style": { display: "contents", visibility: "hidden" },
                "inert": void 0,
              },
              s,
            ),
            v.createElement(
              ps,
              {
                asChild: !0,
                align: "center",
                justify: "center",
                position: "absolute",
                inset: "0",
              },
              v.createElement("span", null, u),
            ),
          ),
        )
  })
Ly.displayName = "Spinner"
const r4 = RC
function i4(t, e) {
  if (t !== void 0)
    return typeof t == "string"
      ? e(t)
      : Object.fromEntries(Object.entries(t).map(([n, s]) => [n, e(s)]))
}
function s4(t) {
  switch (t) {
    case "1":
      return "1"
    case "2":
    case "3":
      return "2"
    case "4":
      return "3"
  }
}
const XC = v.forwardRef((t, e) => {
  const { size: n = f1.size.default } = t,
    {
      className: s,
      children: o,
      asChild: l,
      color: u,
      radius: f,
      disabled: d = t.loading,
      ...m
    } = hs(t, f1, bo),
    h = l ? qa : "button"
  return v.createElement(
    h,
    {
      "data-disabled": d || void 0,
      "data-accent-color": u,
      "data-radius": f,
      ...m,
      "ref": e,
      "className": cn("rt-reset", "rt-BaseButton", s),
      "disabled": d,
    },
    t.loading
      ? v.createElement(
          v.Fragment,
          null,
          v.createElement(
            "span",
            {
              "style": { display: "contents", visibility: "hidden" },
              "aria-hidden": !0,
            },
            o,
          ),
          v.createElement(r4, null, o),
          v.createElement(
            ps,
            {
              asChild: !0,
              align: "center",
              justify: "center",
              position: "absolute",
              inset: "0",
            },
            v.createElement(
              "span",
              null,
              v.createElement(Ly, { size: i4(n, s4) }),
            ),
          ),
        )
      : o,
  )
})
XC.displayName = "BaseButton"
const gd = v.forwardRef(({ className: t, ...e }, n) =>
  v.createElement(XC, { ...e, ref: n, className: cn("rt-Button", t) }),
)
gd.displayName = "Button"
const o4 = ["1", "2", "3", "4"],
  a4 = ["none", "initial"],
  l4 = ["left", "center", "right"],
  u4 = {
    ...tl,
    size: {
      type: "enum",
      className: "rt-r-size",
      values: o4,
      default: "4",
      responsive: !0,
    },
    display: {
      type: "enum",
      className: "rt-r-display",
      values: a4,
      parseValue: c4,
      responsive: !0,
    },
    align: {
      type: "enum",
      className: "rt-r-ai",
      values: l4,
      parseValue: f4,
      responsive: !0,
    },
  }
function c4(t) {
  return t === "initial" ? "flex" : t
}
function f4(t) {
  return t === "left" ? "start" : t === "right" ? "end" : t
}
const yd = v.forwardRef(
  (
    {
      width: t,
      minWidth: e,
      maxWidth: n,
      height: s,
      minHeight: o,
      maxHeight: l,
      ...u
    },
    f,
  ) => {
    const { asChild: d, children: m, className: h, ...g } = hs(u, u4, Dy, bo),
      { className: w, style: b } = hs(
        {
          width: t,
          minWidth: e,
          maxWidth: n,
          height: s,
          minHeight: o,
          maxHeight: l,
        },
        LC,
        BC,
      ),
      E = d ? qa : "div"
    return v.createElement(
      E,
      { ...g, ref: f, className: cn("rt-Container", h) },
      DL({ asChild: d, children: m }, S =>
        v.createElement(
          "div",
          { className: cn("rt-ContainerInner", w), style: b },
          S,
        ),
      ),
    )
  },
)
yd.displayName = "Container"
var Yl = {},
  d1
function d4() {
  if (d1) return Yl
  ;(d1 = 1),
    Object.defineProperty(Yl, "__esModule", { value: !0 }),
    (Yl.parse = u),
    (Yl.serialize = m)
  const t = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/,
    e = /^[\u0021-\u003A\u003C-\u007E]*$/,
    n =
      /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i,
    s = /^[\u0020-\u003A\u003D-\u007E]*$/,
    o = Object.prototype.toString,
    l = (() => {
      const w = function () {}
      return (w.prototype = Object.create(null)), w
    })()
  function u(w, b) {
    const E = new l(),
      S = w.length
    if (S < 2) return E
    const C = (b == null ? void 0 : b.decode) || h
    let _ = 0
    do {
      const A = w.indexOf("=", _)
      if (A === -1) break
      const O = w.indexOf(";", _),
        M = O === -1 ? S : O
      if (A > M) {
        _ = w.lastIndexOf(";", A - 1) + 1
        continue
      }
      const D = f(w, _, A),
        K = d(w, A, D),
        W = w.slice(D, K)
      if (E[W] === void 0) {
        let q = f(w, A + 1, M),
          Z = d(w, M, q)
        const le = C(w.slice(q, Z))
        E[W] = le
      }
      _ = M + 1
    } while (_ < S)
    return E
  }
  function f(w, b, E) {
    do {
      const S = w.charCodeAt(b)
      if (S !== 32 && S !== 9) return b
    } while (++b < E)
    return E
  }
  function d(w, b, E) {
    for (; b > E; ) {
      const S = w.charCodeAt(--b)
      if (S !== 32 && S !== 9) return b + 1
    }
    return E
  }
  function m(w, b, E) {
    const S = (E == null ? void 0 : E.encode) || encodeURIComponent
    if (!t.test(w)) throw new TypeError(`argument name is invalid: ${w}`)
    const C = S(b)
    if (!e.test(C)) throw new TypeError(`argument val is invalid: ${b}`)
    let _ = w + "=" + C
    if (!E) return _
    if (E.maxAge !== void 0) {
      if (!Number.isInteger(E.maxAge))
        throw new TypeError(`option maxAge is invalid: ${E.maxAge}`)
      _ += "; Max-Age=" + E.maxAge
    }
    if (E.domain) {
      if (!n.test(E.domain))
        throw new TypeError(`option domain is invalid: ${E.domain}`)
      _ += "; Domain=" + E.domain
    }
    if (E.path) {
      if (!s.test(E.path))
        throw new TypeError(`option path is invalid: ${E.path}`)
      _ += "; Path=" + E.path
    }
    if (E.expires) {
      if (!g(E.expires) || !Number.isFinite(E.expires.valueOf()))
        throw new TypeError(`option expires is invalid: ${E.expires}`)
      _ += "; Expires=" + E.expires.toUTCString()
    }
    if (
      (E.httpOnly && (_ += "; HttpOnly"),
      E.secure && (_ += "; Secure"),
      E.partitioned && (_ += "; Partitioned"),
      E.priority)
    )
      switch (
        typeof E.priority == "string" ? E.priority.toLowerCase() : void 0
      ) {
        case "low":
          _ += "; Priority=Low"
          break
        case "medium":
          _ += "; Priority=Medium"
          break
        case "high":
          _ += "; Priority=High"
          break
        default:
          throw new TypeError(`option priority is invalid: ${E.priority}`)
      }
    if (E.sameSite)
      switch (
        typeof E.sameSite == "string" ? E.sameSite.toLowerCase() : E.sameSite
      ) {
        case !0:
        case "strict":
          _ += "; SameSite=Strict"
          break
        case "lax":
          _ += "; SameSite=Lax"
          break
        case "none":
          _ += "; SameSite=None"
          break
        default:
          throw new TypeError(`option sameSite is invalid: ${E.sameSite}`)
      }
    return _
  }
  function h(w) {
    if (w.indexOf("%") === -1) return w
    try {
      return decodeURIComponent(w)
    } catch {
      return w
    }
  }
  function g(w) {
    return o.call(w) === "[object Date]"
  }
  return Yl
}
d4()
/**
 * react-router v7.3.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ var h1 = "popstate"
function h4(t = {}) {
  function e(s, o) {
    let { pathname: l, search: u, hash: f } = s.location
    return xg(
      "",
      { pathname: l, search: u, hash: f },
      (o.state && o.state.usr) || null,
      (o.state && o.state.key) || "default",
    )
  }
  function n(s, o) {
    return typeof o == "string" ? o : Ru(o)
  }
  return m4(e, n, null, t)
}
function st(t, e) {
  if (t === !1 || t === null || typeof t > "u") throw new Error(e)
}
function jr(t, e) {
  if (!t) {
    typeof console < "u" && console.warn(e)
    try {
      throw new Error(e)
    } catch {}
  }
}
function p4() {
  return Math.random().toString(36).substring(2, 10)
}
function p1(t, e) {
  return { usr: t.state, key: t.key, idx: e }
}
function xg(t, e, n = null, s) {
  return {
    pathname: typeof t == "string" ? t : t.pathname,
    search: "",
    hash: "",
    ...(typeof e == "string" ? nl(e) : e),
    state: n,
    key: (e && e.key) || s || p4(),
  }
}
function Ru({ pathname: t = "/", search: e = "", hash: n = "" }) {
  return (
    e && e !== "?" && (t += e.charAt(0) === "?" ? e : "?" + e),
    n && n !== "#" && (t += n.charAt(0) === "#" ? n : "#" + n),
    t
  )
}
function nl(t) {
  let e = {}
  if (t) {
    let n = t.indexOf("#")
    n >= 0 && ((e.hash = t.substring(n)), (t = t.substring(0, n)))
    let s = t.indexOf("?")
    s >= 0 && ((e.search = t.substring(s)), (t = t.substring(0, s))),
      t && (e.pathname = t)
  }
  return e
}
function m4(t, e, n, s = {}) {
  let { window: o = document.defaultView, v5Compat: l = !1 } = s,
    u = o.history,
    f = "POP",
    d = null,
    m = h()
  m == null && ((m = 0), u.replaceState({ ...u.state, idx: m }, ""))
  function h() {
    return (u.state || { idx: null }).idx
  }
  function g() {
    f = "POP"
    let C = h(),
      _ = C == null ? null : C - m
    ;(m = C), d && d({ action: f, location: S.location, delta: _ })
  }
  function w(C, _) {
    f = "PUSH"
    let A = xg(S.location, C, _)
    m = h() + 1
    let O = p1(A, m),
      M = S.createHref(A)
    try {
      u.pushState(O, "", M)
    } catch (D) {
      if (D instanceof DOMException && D.name === "DataCloneError") throw D
      o.location.assign(M)
    }
    l && d && d({ action: f, location: S.location, delta: 1 })
  }
  function b(C, _) {
    f = "REPLACE"
    let A = xg(S.location, C, _)
    m = h()
    let O = p1(A, m),
      M = S.createHref(A)
    u.replaceState(O, "", M),
      l && d && d({ action: f, location: S.location, delta: 0 })
  }
  function E(C) {
    let _ = o.location.origin !== "null" ? o.location.origin : o.location.href,
      A = typeof C == "string" ? C : Ru(C)
    return (
      (A = A.replace(/ $/, "%20")),
      st(
        _,
        `No window.location.(origin|href) available to create URL for href: ${A}`,
      ),
      new URL(A, _)
    )
  }
  let S = {
    get action() {
      return f
    },
    get location() {
      return t(o, u)
    },
    listen(C) {
      if (d) throw new Error("A history only accepts one active listener")
      return (
        o.addEventListener(h1, g),
        (d = C),
        () => {
          o.removeEventListener(h1, g), (d = null)
        }
      )
    },
    createHref(C) {
      return e(o, C)
    },
    createURL: E,
    encodeLocation(C) {
      let _ = E(C)
      return { pathname: _.pathname, search: _.search, hash: _.hash }
    },
    push: w,
    replace: b,
    go(C) {
      return u.go(C)
    },
  }
  return S
}
function ZC(t, e, n = "/") {
  return g4(t, e, n, !1)
}
function g4(t, e, n, s) {
  let o = typeof e == "string" ? nl(e) : e,
    l = yi(o.pathname || "/", n)
  if (l == null) return null
  let u = JC(t)
  y4(u)
  let f = null
  for (let d = 0; f == null && d < u.length; ++d) {
    let m = A4(l)
    f = k4(u[d], m, s)
  }
  return f
}
function JC(t, e = [], n = [], s = "") {
  let o = (l, u, f) => {
    let d = {
      relativePath: f === void 0 ? l.path || "" : f,
      caseSensitive: l.caseSensitive === !0,
      childrenIndex: u,
      route: l,
    }
    d.relativePath.startsWith("/") &&
      (st(
        d.relativePath.startsWith(s),
        `Absolute route path "${d.relativePath}" nested under path "${s}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`,
      ),
      (d.relativePath = d.relativePath.slice(s.length)))
    let m = fi([s, d.relativePath]),
      h = n.concat(d)
    l.children &&
      l.children.length > 0 &&
      (st(
        l.index !== !0,
        `Index routes must not have child routes. Please remove all child routes from route path "${m}".`,
      ),
      JC(l.children, e, h, m)),
      !(l.path == null && !l.index) &&
        e.push({ path: m, score: C4(m, l.index), routesMeta: h })
  }
  return (
    t.forEach((l, u) => {
      var f
      if (l.path === "" || !((f = l.path) != null && f.includes("?"))) o(l, u)
      else for (let d of e_(l.path)) o(l, u, d)
    }),
    e
  )
}
function e_(t) {
  let e = t.split("/")
  if (e.length === 0) return []
  let [n, ...s] = e,
    o = n.endsWith("?"),
    l = n.replace(/\?$/, "")
  if (s.length === 0) return o ? [l, ""] : [l]
  let u = e_(s.join("/")),
    f = []
  return (
    f.push(...u.map(d => (d === "" ? l : [l, d].join("/")))),
    o && f.push(...u),
    f.map(d => (t.startsWith("/") && d === "" ? "/" : d))
  )
}
function y4(t) {
  t.sort((e, n) =>
    e.score !== n.score
      ? n.score - e.score
      : _4(
          e.routesMeta.map(s => s.childrenIndex),
          n.routesMeta.map(s => s.childrenIndex),
        ),
  )
}
var v4 = /^:[\w-]+$/,
  w4 = 3,
  S4 = 2,
  x4 = 1,
  E4 = 10,
  b4 = -2,
  m1 = t => t === "*"
function C4(t, e) {
  let n = t.split("/"),
    s = n.length
  return (
    n.some(m1) && (s += b4),
    e && (s += S4),
    n
      .filter(o => !m1(o))
      .reduce((o, l) => o + (v4.test(l) ? w4 : l === "" ? x4 : E4), s)
  )
}
function _4(t, e) {
  return t.length === e.length && t.slice(0, -1).every((s, o) => s === e[o])
    ? t[t.length - 1] - e[e.length - 1]
    : 0
}
function k4(t, e, n = !1) {
  let { routesMeta: s } = t,
    o = {},
    l = "/",
    u = []
  for (let f = 0; f < s.length; ++f) {
    let d = s[f],
      m = f === s.length - 1,
      h = l === "/" ? e : e.slice(l.length) || "/",
      g = vd(
        { path: d.relativePath, caseSensitive: d.caseSensitive, end: m },
        h,
      ),
      w = d.route
    if (
      (!g &&
        m &&
        n &&
        !s[s.length - 1].route.index &&
        (g = vd(
          { path: d.relativePath, caseSensitive: d.caseSensitive, end: !1 },
          h,
        )),
      !g)
    )
      return null
    Object.assign(o, g.params),
      u.push({
        params: o,
        pathname: fi([l, g.pathname]),
        pathnameBase: I4(fi([l, g.pathnameBase])),
        route: w,
      }),
      g.pathnameBase !== "/" && (l = fi([l, g.pathnameBase]))
  }
  return u
}
function vd(t, e) {
  typeof t == "string" && (t = { path: t, caseSensitive: !1, end: !0 })
  let [n, s] = O4(t.path, t.caseSensitive, t.end),
    o = e.match(n)
  if (!o) return null
  let l = o[0],
    u = l.replace(/(.)\/+$/, "$1"),
    f = o.slice(1)
  return {
    params: s.reduce((m, { paramName: h, isOptional: g }, w) => {
      if (h === "*") {
        let E = f[w] || ""
        u = l.slice(0, l.length - E.length).replace(/(.)\/+$/, "$1")
      }
      const b = f[w]
      return (
        g && !b ? (m[h] = void 0) : (m[h] = (b || "").replace(/%2F/g, "/")), m
      )
    }, {}),
    pathname: l,
    pathnameBase: u,
    pattern: t,
  }
}
function O4(t, e = !1, n = !0) {
  jr(
    t === "*" || !t.endsWith("*") || t.endsWith("/*"),
    `Route path "${t}" will be treated as if it were "${t.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${t.replace(/\*$/, "/*")}".`,
  )
  let s = [],
    o =
      "^" +
      t
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (u, f, d) => (
            s.push({ paramName: f, isOptional: d != null }),
            d ? "/?([^\\/]+)?" : "/([^\\/]+)"
          ),
        )
  return (
    t.endsWith("*")
      ? (s.push({ paramName: "*" }),
        (o += t === "*" || t === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : n
        ? (o += "\\/*$")
        : t !== "" && t !== "/" && (o += "(?:(?=\\/|$))"),
    [new RegExp(o, e ? void 0 : "i"), s]
  )
}
function A4(t) {
  try {
    return t
      .split("/")
      .map(e => decodeURIComponent(e).replace(/\//g, "%2F"))
      .join("/")
  } catch (e) {
    return (
      jr(
        !1,
        `The URL path "${t}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${e}).`,
      ),
      t
    )
  }
}
function yi(t, e) {
  if (e === "/") return t
  if (!t.toLowerCase().startsWith(e.toLowerCase())) return null
  let n = e.endsWith("/") ? e.length - 1 : e.length,
    s = t.charAt(n)
  return s && s !== "/" ? null : t.slice(n) || "/"
}
function T4(t, e = "/") {
  let {
    pathname: n,
    search: s = "",
    hash: o = "",
  } = typeof t == "string" ? nl(t) : t
  return {
    pathname: n ? (n.startsWith("/") ? n : R4(n, e)) : e,
    search: M4(s),
    hash: N4(o),
  }
}
function R4(t, e) {
  let n = e.replace(/\/+$/, "").split("/")
  return (
    t.split("/").forEach(o => {
      o === ".." ? n.length > 1 && n.pop() : o !== "." && n.push(o)
    }),
    n.length > 1 ? n.join("/") : "/"
  )
}
function Em(t, e, n, s) {
  return `Cannot include a '${t}' character in a manually specified \`to.${e}\` field [${JSON.stringify(s)}].  Please separate it out to the \`to.${n}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`
}
function P4(t) {
  return t.filter(
    (e, n) => n === 0 || (e.route.path && e.route.path.length > 0),
  )
}
function t_(t) {
  let e = P4(t)
  return e.map((n, s) => (s === e.length - 1 ? n.pathname : n.pathnameBase))
}
function n_(t, e, n, s = !1) {
  let o
  typeof t == "string"
    ? (o = nl(t))
    : ((o = { ...t }),
      st(
        !o.pathname || !o.pathname.includes("?"),
        Em("?", "pathname", "search", o),
      ),
      st(
        !o.pathname || !o.pathname.includes("#"),
        Em("#", "pathname", "hash", o),
      ),
      st(!o.search || !o.search.includes("#"), Em("#", "search", "hash", o)))
  let l = t === "" || o.pathname === "",
    u = l ? "/" : o.pathname,
    f
  if (u == null) f = n
  else {
    let g = e.length - 1
    if (!s && u.startsWith("..")) {
      let w = u.split("/")
      for (; w[0] === ".."; ) w.shift(), (g -= 1)
      o.pathname = w.join("/")
    }
    f = g >= 0 ? e[g] : "/"
  }
  let d = T4(o, f),
    m = u && u !== "/" && u.endsWith("/"),
    h = (l || u === ".") && n.endsWith("/")
  return !d.pathname.endsWith("/") && (m || h) && (d.pathname += "/"), d
}
var fi = t => t.join("/").replace(/\/\/+/g, "/"),
  I4 = t => t.replace(/\/+$/, "").replace(/^\/*/, "/"),
  M4 = t => (!t || t === "?" ? "" : t.startsWith("?") ? t : "?" + t),
  N4 = t => (!t || t === "#" ? "" : t.startsWith("#") ? t : "#" + t)
function j4(t) {
  return (
    t != null &&
    typeof t.status == "number" &&
    typeof t.statusText == "string" &&
    typeof t.internal == "boolean" &&
    "data" in t
  )
}
var r_ = ["POST", "PUT", "PATCH", "DELETE"]
new Set(r_)
var D4 = ["GET", ...r_]
new Set(D4)
var rl = v.createContext(null)
rl.displayName = "DataRouter"
var Hd = v.createContext(null)
Hd.displayName = "DataRouterState"
var i_ = v.createContext({ isTransitioning: !1 })
i_.displayName = "ViewTransition"
var L4 = v.createContext(new Map())
L4.displayName = "Fetchers"
var B4 = v.createContext(null)
B4.displayName = "Await"
var Lr = v.createContext(null)
Lr.displayName = "Navigation"
var Gu = v.createContext(null)
Gu.displayName = "Location"
var wi = v.createContext({ outlet: null, matches: [], isDataRoute: !1 })
wi.displayName = "Route"
var By = v.createContext(null)
By.displayName = "RouteError"
function F4(t, { relative: e } = {}) {
  st(Ku(), "useHref() may be used only in the context of a <Router> component.")
  let { basename: n, navigator: s } = v.useContext(Lr),
    { hash: o, pathname: l, search: u } = qu(t, { relative: e }),
    f = l
  return (
    n !== "/" && (f = l === "/" ? n : fi([n, l])),
    s.createHref({ pathname: f, search: u, hash: o })
  )
}
function Ku() {
  return v.useContext(Gu) != null
}
function Co() {
  return (
    st(
      Ku(),
      "useLocation() may be used only in the context of a <Router> component.",
    ),
    v.useContext(Gu).location
  )
}
var s_ =
  "You should call navigate() in a React.useEffect(), not when your component is first rendered."
function o_(t) {
  v.useContext(Lr).static || v.useLayoutEffect(t)
}
function U4() {
  let { isDataRoute: t } = v.useContext(wi)
  return t ? J4() : z4()
}
function z4() {
  st(
    Ku(),
    "useNavigate() may be used only in the context of a <Router> component.",
  )
  let t = v.useContext(rl),
    { basename: e, navigator: n } = v.useContext(Lr),
    { matches: s } = v.useContext(wi),
    { pathname: o } = Co(),
    l = JSON.stringify(t_(s)),
    u = v.useRef(!1)
  return (
    o_(() => {
      u.current = !0
    }),
    v.useCallback(
      (d, m = {}) => {
        if ((jr(u.current, s_), !u.current)) return
        if (typeof d == "number") {
          n.go(d)
          return
        }
        let h = n_(d, JSON.parse(l), o, m.relative === "path")
        t == null &&
          e !== "/" &&
          (h.pathname = h.pathname === "/" ? e : fi([e, h.pathname])),
          (m.replace ? n.replace : n.push)(h, m.state, m)
      },
      [e, n, l, o, t],
    )
  )
}
v.createContext(null)
function qu(t, { relative: e } = {}) {
  let { matches: n } = v.useContext(wi),
    { pathname: s } = Co(),
    o = JSON.stringify(t_(n))
  return v.useMemo(() => n_(t, JSON.parse(o), s, e === "path"), [t, o, s, e])
}
function $4(t, e) {
  return a_(t, e)
}
function a_(t, e, n, s) {
  var A
  st(
    Ku(),
    "useRoutes() may be used only in the context of a <Router> component.",
  )
  let { navigator: o, static: l } = v.useContext(Lr),
    { matches: u } = v.useContext(wi),
    f = u[u.length - 1],
    d = f ? f.params : {},
    m = f ? f.pathname : "/",
    h = f ? f.pathnameBase : "/",
    g = f && f.route
  {
    let O = (g && g.path) || ""
    l_(
      m,
      !g || O.endsWith("*") || O.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${m}" (under <Route path="${O}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${O}"> to <Route path="${O === "/" ? "*" : `${O}/*`}">.`,
    )
  }
  let w = Co(),
    b
  if (e) {
    let O = typeof e == "string" ? nl(e) : e
    st(
      h === "/" || ((A = O.pathname) == null ? void 0 : A.startsWith(h)),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${h}" but pathname "${O.pathname}" was given in the \`location\` prop.`,
    ),
      (b = O)
  } else b = w
  let E = b.pathname || "/",
    S = E
  if (h !== "/") {
    let O = h.replace(/^\//, "").split("/")
    S = "/" + E.replace(/^\//, "").split("/").slice(O.length).join("/")
  }
  let C =
    !l && n && n.matches && n.matches.length > 0
      ? n.matches
      : ZC(t, { pathname: S })
  jr(
    g || C != null,
    `No routes matched location "${b.pathname}${b.search}${b.hash}" `,
  ),
    jr(
      C == null ||
        C[C.length - 1].route.element !== void 0 ||
        C[C.length - 1].route.Component !== void 0 ||
        C[C.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${b.pathname}${b.search}${b.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`,
    )
  let _ = K4(
    C &&
      C.map(O =>
        Object.assign({}, O, {
          params: Object.assign({}, d, O.params),
          pathname: fi([
            h,
            o.encodeLocation
              ? o.encodeLocation(O.pathname).pathname
              : O.pathname,
          ]),
          pathnameBase:
            O.pathnameBase === "/"
              ? h
              : fi([
                  h,
                  o.encodeLocation
                    ? o.encodeLocation(O.pathnameBase).pathname
                    : O.pathnameBase,
                ]),
        }),
      ),
    u,
    n,
    s,
  )
  return e && _
    ? v.createElement(
        Gu.Provider,
        {
          value: {
            location: {
              pathname: "/",
              search: "",
              hash: "",
              state: null,
              key: "default",
              ...b,
            },
            navigationType: "POP",
          },
        },
        _,
      )
    : _
}
function W4() {
  let t = Z4(),
    e = j4(t)
      ? `${t.status} ${t.statusText}`
      : t instanceof Error
        ? t.message
        : JSON.stringify(t),
    n = t instanceof Error ? t.stack : null,
    s = "rgba(200,200,200, 0.5)",
    o = { padding: "0.5rem", backgroundColor: s },
    l = { padding: "2px 4px", backgroundColor: s },
    u = null
  return (
    console.error("Error handled by React Router default ErrorBoundary:", t),
    (u = v.createElement(
      v.Fragment,
      null,
      v.createElement("p", null, "💿 Hey developer 👋"),
      v.createElement(
        "p",
        null,
        "You can provide a way better UX than this when your app throws errors by providing your own ",
        v.createElement("code", { style: l }, "ErrorBoundary"),
        " or",
        " ",
        v.createElement("code", { style: l }, "errorElement"),
        " prop on your route.",
      ),
    )),
    v.createElement(
      v.Fragment,
      null,
      v.createElement("h2", null, "Unexpected Application Error!"),
      v.createElement("h3", { style: { fontStyle: "italic" } }, e),
      n ? v.createElement("pre", { style: o }, n) : null,
      u,
    )
  )
}
var V4 = v.createElement(W4, null),
  H4 = class extends v.Component {
    constructor(t) {
      super(t),
        (this.state = {
          location: t.location,
          revalidation: t.revalidation,
          error: t.error,
        })
    }
    static getDerivedStateFromError(t) {
      return { error: t }
    }
    static getDerivedStateFromProps(t, e) {
      return e.location !== t.location ||
        (e.revalidation !== "idle" && t.revalidation === "idle")
        ? { error: t.error, location: t.location, revalidation: t.revalidation }
        : {
            error: t.error !== void 0 ? t.error : e.error,
            location: e.location,
            revalidation: t.revalidation || e.revalidation,
          }
    }
    componentDidCatch(t, e) {
      console.error(
        "React Router caught the following error during render",
        t,
        e,
      )
    }
    render() {
      return this.state.error !== void 0
        ? v.createElement(
            wi.Provider,
            { value: this.props.routeContext },
            v.createElement(By.Provider, {
              value: this.state.error,
              children: this.props.component,
            }),
          )
        : this.props.children
    }
  }
function G4({ routeContext: t, match: e, children: n }) {
  let s = v.useContext(rl)
  return (
    s &&
      s.static &&
      s.staticContext &&
      (e.route.errorElement || e.route.ErrorBoundary) &&
      (s.staticContext._deepestRenderedBoundaryId = e.route.id),
    v.createElement(wi.Provider, { value: t }, n)
  )
}
function K4(t, e = [], n = null, s = null) {
  if (t == null) {
    if (!n) return null
    if (n.errors) t = n.matches
    else if (e.length === 0 && !n.initialized && n.matches.length > 0)
      t = n.matches
    else return null
  }
  let o = t,
    l = n == null ? void 0 : n.errors
  if (l != null) {
    let d = o.findIndex(
      m => m.route.id && (l == null ? void 0 : l[m.route.id]) !== void 0,
    )
    st(
      d >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(l).join(",")}`,
    ),
      (o = o.slice(0, Math.min(o.length, d + 1)))
  }
  let u = !1,
    f = -1
  if (n)
    for (let d = 0; d < o.length; d++) {
      let m = o[d]
      if (
        ((m.route.HydrateFallback || m.route.hydrateFallbackElement) && (f = d),
        m.route.id)
      ) {
        let { loaderData: h, errors: g } = n,
          w =
            m.route.loader &&
            !h.hasOwnProperty(m.route.id) &&
            (!g || g[m.route.id] === void 0)
        if (m.route.lazy || w) {
          ;(u = !0), f >= 0 ? (o = o.slice(0, f + 1)) : (o = [o[0]])
          break
        }
      }
    }
  return o.reduceRight((d, m, h) => {
    let g,
      w = !1,
      b = null,
      E = null
    n &&
      ((g = l && m.route.id ? l[m.route.id] : void 0),
      (b = m.route.errorElement || V4),
      u &&
        (f < 0 && h === 0
          ? (l_(
              "route-fallback",
              !1,
              "No `HydrateFallback` element provided to render during initial hydration",
            ),
            (w = !0),
            (E = null))
          : f === h &&
            ((w = !0), (E = m.route.hydrateFallbackElement || null))))
    let S = e.concat(o.slice(0, h + 1)),
      C = () => {
        let _
        return (
          g
            ? (_ = b)
            : w
              ? (_ = E)
              : m.route.Component
                ? (_ = v.createElement(m.route.Component, null))
                : m.route.element
                  ? (_ = m.route.element)
                  : (_ = d),
          v.createElement(G4, {
            match: m,
            routeContext: { outlet: d, matches: S, isDataRoute: n != null },
            children: _,
          })
        )
      }
    return n && (m.route.ErrorBoundary || m.route.errorElement || h === 0)
      ? v.createElement(H4, {
          location: n.location,
          revalidation: n.revalidation,
          component: b,
          error: g,
          children: C(),
          routeContext: { outlet: null, matches: S, isDataRoute: !0 },
        })
      : C()
  }, null)
}
function Fy(t) {
  return `${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
}
function q4(t) {
  let e = v.useContext(rl)
  return st(e, Fy(t)), e
}
function Q4(t) {
  let e = v.useContext(Hd)
  return st(e, Fy(t)), e
}
function Y4(t) {
  let e = v.useContext(wi)
  return st(e, Fy(t)), e
}
function Uy(t) {
  let e = Y4(t),
    n = e.matches[e.matches.length - 1]
  return (
    st(
      n.route.id,
      `${t} can only be used on routes that contain a unique "id"`,
    ),
    n.route.id
  )
}
function X4() {
  return Uy("useRouteId")
}
function Z4() {
  var s
  let t = v.useContext(By),
    e = Q4("useRouteError"),
    n = Uy("useRouteError")
  return t !== void 0 ? t : (s = e.errors) == null ? void 0 : s[n]
}
function J4() {
  let { router: t } = q4("useNavigate"),
    e = Uy("useNavigate"),
    n = v.useRef(!1)
  return (
    o_(() => {
      n.current = !0
    }),
    v.useCallback(
      async (o, l = {}) => {
        jr(n.current, s_),
          n.current &&
            (typeof o == "number"
              ? t.navigate(o)
              : await t.navigate(o, { fromRouteId: e, ...l }))
      },
      [t, e],
    )
  )
}
var g1 = {}
function l_(t, e, n) {
  !e && !g1[t] && ((g1[t] = !0), jr(!1, n))
}
v.memo(e5)
function e5({ routes: t, future: e, state: n }) {
  return a_(t, void 0, n, e)
}
function Eg(t) {
  st(
    !1,
    "A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.",
  )
}
function t5({
  basename: t = "/",
  children: e = null,
  location: n,
  navigationType: s = "POP",
  navigator: o,
  static: l = !1,
}) {
  st(
    !Ku(),
    "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.",
  )
  let u = t.replace(/^\/*/, "/"),
    f = v.useMemo(
      () => ({ basename: u, navigator: o, static: l, future: {} }),
      [u, o, l],
    )
  typeof n == "string" && (n = nl(n))
  let {
      pathname: d = "/",
      search: m = "",
      hash: h = "",
      state: g = null,
      key: w = "default",
    } = n,
    b = v.useMemo(() => {
      let E = yi(d, u)
      return E == null
        ? null
        : {
            location: { pathname: E, search: m, hash: h, state: g, key: w },
            navigationType: s,
          }
    }, [u, d, m, h, g, w, s])
  return (
    jr(
      b != null,
      `<Router basename="${u}"> is not able to match the URL "${d}${m}${h}" because it does not start with the basename, so the <Router> won't render anything.`,
    ),
    b == null
      ? null
      : v.createElement(
          Lr.Provider,
          { value: f },
          v.createElement(Gu.Provider, { children: e, value: b }),
        )
  )
}
function n5({ children: t, location: e }) {
  return $4(bg(t), e)
}
function bg(t, e = []) {
  let n = []
  return (
    v.Children.forEach(t, (s, o) => {
      if (!v.isValidElement(s)) return
      let l = [...e, o]
      if (s.type === v.Fragment) {
        n.push.apply(n, bg(s.props.children, l))
        return
      }
      st(
        s.type === Eg,
        `[${typeof s.type == "string" ? s.type : s.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`,
      ),
        st(
          !s.props.index || !s.props.children,
          "An index route cannot have child routes.",
        )
      let u = {
        id: s.props.id || l.join("-"),
        caseSensitive: s.props.caseSensitive,
        element: s.props.element,
        Component: s.props.Component,
        index: s.props.index,
        path: s.props.path,
        loader: s.props.loader,
        action: s.props.action,
        hydrateFallbackElement: s.props.hydrateFallbackElement,
        HydrateFallback: s.props.HydrateFallback,
        errorElement: s.props.errorElement,
        ErrorBoundary: s.props.ErrorBoundary,
        hasErrorBoundary:
          s.props.hasErrorBoundary === !0 ||
          s.props.ErrorBoundary != null ||
          s.props.errorElement != null,
        shouldRevalidate: s.props.shouldRevalidate,
        handle: s.props.handle,
        lazy: s.props.lazy,
      }
      s.props.children && (u.children = bg(s.props.children, l)), n.push(u)
    }),
    n
  )
}
var Kf = "get",
  qf = "application/x-www-form-urlencoded"
function Gd(t) {
  return t != null && typeof t.tagName == "string"
}
function r5(t) {
  return Gd(t) && t.tagName.toLowerCase() === "button"
}
function i5(t) {
  return Gd(t) && t.tagName.toLowerCase() === "form"
}
function s5(t) {
  return Gd(t) && t.tagName.toLowerCase() === "input"
}
function o5(t) {
  return !!(t.metaKey || t.altKey || t.ctrlKey || t.shiftKey)
}
function a5(t, e) {
  return t.button === 0 && (!e || e === "_self") && !o5(t)
}
var vf = null
function l5() {
  if (vf === null)
    try {
      new FormData(document.createElement("form"), 0), (vf = !1)
    } catch {
      vf = !0
    }
  return vf
}
var u5 = new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
])
function bm(t) {
  return t != null && !u5.has(t)
    ? (jr(
        !1,
        `"${t}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${qf}"`,
      ),
      null)
    : t
}
function c5(t, e) {
  let n, s, o, l, u
  if (i5(t)) {
    let f = t.getAttribute("action")
    ;(s = f ? yi(f, e) : null),
      (n = t.getAttribute("method") || Kf),
      (o = bm(t.getAttribute("enctype")) || qf),
      (l = new FormData(t))
  } else if (r5(t) || (s5(t) && (t.type === "submit" || t.type === "image"))) {
    let f = t.form
    if (f == null)
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>',
      )
    let d = t.getAttribute("formaction") || f.getAttribute("action")
    if (
      ((s = d ? yi(d, e) : null),
      (n = t.getAttribute("formmethod") || f.getAttribute("method") || Kf),
      (o =
        bm(t.getAttribute("formenctype")) ||
        bm(f.getAttribute("enctype")) ||
        qf),
      (l = new FormData(f, t)),
      !l5())
    ) {
      let { name: m, type: h, value: g } = t
      if (h === "image") {
        let w = m ? `${m}.` : ""
        l.append(`${w}x`, "0"), l.append(`${w}y`, "0")
      } else m && l.append(m, g)
    }
  } else {
    if (Gd(t))
      throw new Error(
        'Cannot submit element that is not <form>, <button>, or <input type="submit|image">',
      )
    ;(n = Kf), (s = null), (o = qf), (u = t)
  }
  return (
    l && o === "text/plain" && ((u = l), (l = void 0)),
    { action: s, method: n.toLowerCase(), encType: o, formData: l, body: u }
  )
}
function zy(t, e) {
  if (t === !1 || t === null || typeof t > "u") throw new Error(e)
}
async function f5(t, e) {
  if (t.id in e) return e[t.id]
  try {
    let n = await import(t.module)
    return (e[t.id] = n), n
  } catch (n) {
    return (
      console.error(
        `Error loading route module \`${t.module}\`, reloading page...`,
      ),
      console.error(n),
      window.__reactRouterContext && window.__reactRouterContext.isSpaMode,
      window.location.reload(),
      new Promise(() => {})
    )
  }
}
function d5(t) {
  return t == null
    ? !1
    : t.href == null
      ? t.rel === "preload" &&
        typeof t.imageSrcSet == "string" &&
        typeof t.imageSizes == "string"
      : typeof t.rel == "string" && typeof t.href == "string"
}
async function h5(t, e, n) {
  let s = await Promise.all(
    t.map(async o => {
      let l = e.routes[o.route.id]
      if (l) {
        let u = await f5(l, n)
        return u.links ? u.links() : []
      }
      return []
    }),
  )
  return y5(
    s
      .flat(1)
      .filter(d5)
      .filter(o => o.rel === "stylesheet" || o.rel === "preload")
      .map(o =>
        o.rel === "stylesheet"
          ? { ...o, rel: "prefetch", as: "style" }
          : { ...o, rel: "prefetch" },
      ),
  )
}
function y1(t, e, n, s, o, l) {
  let u = (d, m) => (n[m] ? d.route.id !== n[m].route.id : !0),
    f = (d, m) => {
      var h
      return (
        n[m].pathname !== d.pathname ||
        (((h = n[m].route.path) == null ? void 0 : h.endsWith("*")) &&
          n[m].params["*"] !== d.params["*"])
      )
    }
  return l === "assets"
    ? e.filter((d, m) => u(d, m) || f(d, m))
    : l === "data"
      ? e.filter((d, m) => {
          var g
          let h = s.routes[d.route.id]
          if (!h || !h.hasLoader) return !1
          if (u(d, m) || f(d, m)) return !0
          if (d.route.shouldRevalidate) {
            let w = d.route.shouldRevalidate({
              currentUrl: new URL(
                o.pathname + o.search + o.hash,
                window.origin,
              ),
              currentParams: ((g = n[0]) == null ? void 0 : g.params) || {},
              nextUrl: new URL(t, window.origin),
              nextParams: d.params,
              defaultShouldRevalidate: !0,
            })
            if (typeof w == "boolean") return w
          }
          return !0
        })
      : []
}
function p5(t, e, { includeHydrateFallback: n } = {}) {
  return m5(
    t
      .map(s => {
        let o = e.routes[s.route.id]
        if (!o) return []
        let l = [o.module]
        return (
          o.clientActionModule && (l = l.concat(o.clientActionModule)),
          o.clientLoaderModule && (l = l.concat(o.clientLoaderModule)),
          n &&
            o.hydrateFallbackModule &&
            (l = l.concat(o.hydrateFallbackModule)),
          o.imports && (l = l.concat(o.imports)),
          l
        )
      })
      .flat(1),
  )
}
function m5(t) {
  return [...new Set(t)]
}
function g5(t) {
  let e = {},
    n = Object.keys(t).sort()
  for (let s of n) e[s] = t[s]
  return e
}
function y5(t, e) {
  let n = new Set()
  return (
    new Set(e),
    t.reduce((s, o) => {
      let l = JSON.stringify(g5(o))
      return n.has(l) || (n.add(l), s.push({ key: l, link: o })), s
    }, [])
  )
}
function v5(t, e) {
  let n =
    typeof t == "string"
      ? new URL(
          t,
          typeof window > "u"
            ? "server://singlefetch/"
            : window.location.origin,
        )
      : t
  return (
    n.pathname === "/"
      ? (n.pathname = "_root.data")
      : e && yi(n.pathname, e) === "/"
        ? (n.pathname = `${e.replace(/\/$/, "")}/_root.data`)
        : (n.pathname = `${n.pathname.replace(/\/$/, "")}.data`),
    n
  )
}
function u_() {
  let t = v.useContext(rl)
  return (
    zy(
      t,
      "You must render this element inside a <DataRouterContext.Provider> element",
    ),
    t
  )
}
function w5() {
  let t = v.useContext(Hd)
  return (
    zy(
      t,
      "You must render this element inside a <DataRouterStateContext.Provider> element",
    ),
    t
  )
}
var $y = v.createContext(void 0)
$y.displayName = "FrameworkContext"
function c_() {
  let t = v.useContext($y)
  return (
    zy(t, "You must render this element inside a <HydratedRouter> element"), t
  )
}
function S5(t, e) {
  let n = v.useContext($y),
    [s, o] = v.useState(!1),
    [l, u] = v.useState(!1),
    {
      onFocus: f,
      onBlur: d,
      onMouseEnter: m,
      onMouseLeave: h,
      onTouchStart: g,
    } = e,
    w = v.useRef(null)
  v.useEffect(() => {
    if ((t === "render" && u(!0), t === "viewport")) {
      let S = _ => {
          _.forEach(A => {
            u(A.isIntersecting)
          })
        },
        C = new IntersectionObserver(S, { threshold: 0.5 })
      return (
        w.current && C.observe(w.current),
        () => {
          C.disconnect()
        }
      )
    }
  }, [t]),
    v.useEffect(() => {
      if (s) {
        let S = setTimeout(() => {
          u(!0)
        }, 100)
        return () => {
          clearTimeout(S)
        }
      }
    }, [s])
  let b = () => {
      o(!0)
    },
    E = () => {
      o(!1), u(!1)
    }
  return n
    ? t !== "intent"
      ? [l, w, {}]
      : [
          l,
          w,
          {
            onFocus: Xl(f, b),
            onBlur: Xl(d, E),
            onMouseEnter: Xl(m, b),
            onMouseLeave: Xl(h, E),
            onTouchStart: Xl(g, b),
          },
        ]
    : [!1, w, {}]
}
function Xl(t, e) {
  return n => {
    t && t(n), n.defaultPrevented || e(n)
  }
}
function x5({ page: t, ...e }) {
  let { router: n } = u_(),
    s = v.useMemo(() => ZC(n.routes, t, n.basename), [n.routes, t, n.basename])
  return s ? v.createElement(b5, { page: t, matches: s, ...e }) : null
}
function E5(t) {
  let { manifest: e, routeModules: n } = c_(),
    [s, o] = v.useState([])
  return (
    v.useEffect(() => {
      let l = !1
      return (
        h5(t, e, n).then(u => {
          l || o(u)
        }),
        () => {
          l = !0
        }
      )
    }, [t, e, n]),
    s
  )
}
function b5({ page: t, matches: e, ...n }) {
  let s = Co(),
    { manifest: o, routeModules: l } = c_(),
    { basename: u } = u_(),
    { loaderData: f, matches: d } = w5(),
    m = v.useMemo(() => y1(t, e, d, o, s, "data"), [t, e, d, o, s]),
    h = v.useMemo(() => y1(t, e, d, o, s, "assets"), [t, e, d, o, s]),
    g = v.useMemo(() => {
      if (t === s.pathname + s.search + s.hash) return []
      let E = new Set(),
        S = !1
      if (
        (e.forEach(_ => {
          var O
          let A = o.routes[_.route.id]
          !A ||
            !A.hasLoader ||
            ((!m.some(M => M.route.id === _.route.id) &&
              _.route.id in f &&
              (O = l[_.route.id]) != null &&
              O.shouldRevalidate) ||
            A.hasClientLoader
              ? (S = !0)
              : E.add(_.route.id))
        }),
        E.size === 0)
      )
        return []
      let C = v5(t, u)
      return (
        S &&
          E.size > 0 &&
          C.searchParams.set(
            "_routes",
            e
              .filter(_ => E.has(_.route.id))
              .map(_ => _.route.id)
              .join(","),
          ),
        [C.pathname + C.search]
      )
    }, [u, f, s, o, m, e, t, l]),
    w = v.useMemo(() => p5(h, o), [h, o]),
    b = E5(h)
  return v.createElement(
    v.Fragment,
    null,
    g.map(E =>
      v.createElement("link", {
        key: E,
        rel: "prefetch",
        as: "fetch",
        href: E,
        ...n,
      }),
    ),
    w.map(E =>
      v.createElement("link", { key: E, rel: "modulepreload", href: E, ...n }),
    ),
    b.map(({ key: E, link: S }) => v.createElement("link", { key: E, ...S })),
  )
}
function C5(...t) {
  return e => {
    t.forEach(n => {
      typeof n == "function" ? n(e) : n != null && (n.current = e)
    })
  }
}
var f_ =
  typeof window < "u" &&
  typeof window.document < "u" &&
  typeof window.document.createElement < "u"
try {
  f_ && (window.__reactRouterVersion = "7.3.0")
} catch {}
function _5({ basename: t, children: e, window: n }) {
  let s = v.useRef()
  s.current == null && (s.current = h4({ window: n, v5Compat: !0 }))
  let o = s.current,
    [l, u] = v.useState({ action: o.action, location: o.location }),
    f = v.useCallback(
      d => {
        v.startTransition(() => u(d))
      },
      [u],
    )
  return (
    v.useLayoutEffect(() => o.listen(f), [o, f]),
    v.createElement(t5, {
      basename: t,
      children: e,
      location: l.location,
      navigationType: l.action,
      navigator: o,
    })
  )
}
var d_ = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  wd = v.forwardRef(function (
    {
      onClick: e,
      discover: n = "render",
      prefetch: s = "none",
      relative: o,
      reloadDocument: l,
      replace: u,
      state: f,
      target: d,
      to: m,
      preventScrollReset: h,
      viewTransition: g,
      ...w
    },
    b,
  ) {
    let { basename: E } = v.useContext(Lr),
      S = typeof m == "string" && d_.test(m),
      C,
      _ = !1
    if (typeof m == "string" && S && ((C = m), f_))
      try {
        let Z = new URL(window.location.href),
          le = m.startsWith("//") ? new URL(Z.protocol + m) : new URL(m),
          Ce = yi(le.pathname, E)
        le.origin === Z.origin && Ce != null
          ? (m = Ce + le.search + le.hash)
          : (_ = !0)
      } catch {
        jr(
          !1,
          `<Link to="${m}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`,
        )
      }
    let A = F4(m, { relative: o }),
      [O, M, D] = S5(s, w),
      K = T5(m, {
        replace: u,
        state: f,
        target: d,
        preventScrollReset: h,
        relative: o,
        viewTransition: g,
      })
    function W(Z) {
      e && e(Z), Z.defaultPrevented || K(Z)
    }
    let q = v.createElement("a", {
      ...w,
      ...D,
      "href": C || A,
      "onClick": _ || l ? e : W,
      "ref": C5(b, M),
      "target": d,
      "data-discover": !S && n === "render" ? "true" : void 0,
    })
    return O && !S
      ? v.createElement(v.Fragment, null, q, v.createElement(x5, { page: A }))
      : q
  })
wd.displayName = "Link"
var k5 = v.forwardRef(function (
  {
    "aria-current": e = "page",
    "caseSensitive": n = !1,
    "className": s = "",
    "end": o = !1,
    "style": l,
    "to": u,
    "viewTransition": f,
    "children": d,
    ...m
  },
  h,
) {
  let g = qu(u, { relative: m.relative }),
    w = Co(),
    b = v.useContext(Hd),
    { navigator: E, basename: S } = v.useContext(Lr),
    C = b != null && N5(g) && f === !0,
    _ = E.encodeLocation ? E.encodeLocation(g).pathname : g.pathname,
    A = w.pathname,
    O =
      b && b.navigation && b.navigation.location
        ? b.navigation.location.pathname
        : null
  n ||
    ((A = A.toLowerCase()),
    (O = O ? O.toLowerCase() : null),
    (_ = _.toLowerCase())),
    O && S && (O = yi(O, S) || O)
  const M = _ !== "/" && _.endsWith("/") ? _.length - 1 : _.length
  let D = A === _ || (!o && A.startsWith(_) && A.charAt(M) === "/"),
    K =
      O != null &&
      (O === _ || (!o && O.startsWith(_) && O.charAt(_.length) === "/")),
    W = { isActive: D, isPending: K, isTransitioning: C },
    q = D ? e : void 0,
    Z
  typeof s == "function"
    ? (Z = s(W))
    : (Z = [
        s,
        D ? "active" : null,
        K ? "pending" : null,
        C ? "transitioning" : null,
      ]
        .filter(Boolean)
        .join(" "))
  let le = typeof l == "function" ? l(W) : l
  return v.createElement(
    wd,
    {
      ...m,
      "aria-current": q,
      "className": Z,
      "ref": h,
      "style": le,
      "to": u,
      "viewTransition": f,
    },
    typeof d == "function" ? d(W) : d,
  )
})
k5.displayName = "NavLink"
var O5 = v.forwardRef(
  (
    {
      discover: t = "render",
      fetcherKey: e,
      navigate: n,
      reloadDocument: s,
      replace: o,
      state: l,
      method: u = Kf,
      action: f,
      onSubmit: d,
      relative: m,
      preventScrollReset: h,
      viewTransition: g,
      ...w
    },
    b,
  ) => {
    let E = I5(),
      S = M5(f, { relative: m }),
      C = u.toLowerCase() === "get" ? "get" : "post",
      _ = typeof f == "string" && d_.test(f),
      A = O => {
        if ((d && d(O), O.defaultPrevented)) return
        O.preventDefault()
        let M = O.nativeEvent.submitter,
          D = (M == null ? void 0 : M.getAttribute("formmethod")) || u
        E(M || O.currentTarget, {
          fetcherKey: e,
          method: D,
          navigate: n,
          replace: o,
          state: l,
          relative: m,
          preventScrollReset: h,
          viewTransition: g,
        })
      }
    return v.createElement("form", {
      "ref": b,
      "method": C,
      "action": S,
      "onSubmit": s ? d : A,
      ...w,
      "data-discover": !_ && t === "render" ? "true" : void 0,
    })
  },
)
O5.displayName = "Form"
function A5(t) {
  return `${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
}
function h_(t) {
  let e = v.useContext(rl)
  return st(e, A5(t)), e
}
function T5(
  t,
  {
    target: e,
    replace: n,
    state: s,
    preventScrollReset: o,
    relative: l,
    viewTransition: u,
  } = {},
) {
  let f = U4(),
    d = Co(),
    m = qu(t, { relative: l })
  return v.useCallback(
    h => {
      if (a5(h, e)) {
        h.preventDefault()
        let g = n !== void 0 ? n : Ru(d) === Ru(m)
        f(t, {
          replace: g,
          state: s,
          preventScrollReset: o,
          relative: l,
          viewTransition: u,
        })
      }
    },
    [d, f, m, n, s, e, t, o, l, u],
  )
}
var R5 = 0,
  P5 = () => `__${String(++R5)}__`
function I5() {
  let { router: t } = h_("useSubmit"),
    { basename: e } = v.useContext(Lr),
    n = X4()
  return v.useCallback(
    async (s, o = {}) => {
      let { action: l, method: u, encType: f, formData: d, body: m } = c5(s, e)
      if (o.navigate === !1) {
        let h = o.fetcherKey || P5()
        await t.fetch(h, n, o.action || l, {
          preventScrollReset: o.preventScrollReset,
          formData: d,
          body: m,
          formMethod: o.method || u,
          formEncType: o.encType || f,
          flushSync: o.flushSync,
        })
      } else
        await t.navigate(o.action || l, {
          preventScrollReset: o.preventScrollReset,
          formData: d,
          body: m,
          formMethod: o.method || u,
          formEncType: o.encType || f,
          replace: o.replace,
          state: o.state,
          fromRouteId: n,
          flushSync: o.flushSync,
          viewTransition: o.viewTransition,
        })
    },
    [t, e, n],
  )
}
function M5(t, { relative: e } = {}) {
  let { basename: n } = v.useContext(Lr),
    s = v.useContext(wi)
  st(s, "useFormAction must be used inside a RouteContext")
  let [o] = s.matches.slice(-1),
    l = { ...qu(t || ".", { relative: e }) },
    u = Co()
  if (t == null) {
    l.search = u.search
    let f = new URLSearchParams(l.search),
      d = f.getAll("index")
    if (d.some(h => h === "")) {
      f.delete("index"), d.filter(g => g).forEach(g => f.append("index", g))
      let h = f.toString()
      l.search = h ? `?${h}` : ""
    }
  }
  return (
    (!t || t === ".") &&
      o.route.index &&
      (l.search = l.search ? l.search.replace(/^\?/, "?index&") : "?index"),
    n !== "/" && (l.pathname = l.pathname === "/" ? n : fi([n, l.pathname])),
    Ru(l)
  )
}
function N5(t, e = {}) {
  let n = v.useContext(i_)
  st(
    n != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?",
  )
  let { basename: s } = h_("useViewTransitionState"),
    o = qu(t, { relative: e.relative })
  if (!n.isTransitioning) return !1
  let l = yi(n.currentLocation.pathname, s) || n.currentLocation.pathname,
    u = yi(n.nextLocation.pathname, s) || n.nextLocation.pathname
  return vd(o.pathname, u) != null || vd(o.pathname, l) != null
}
new TextEncoder()
const j5 = "https://strikefi-coqn.shuttle.app/",
  D5 = "0xTODO",
  L5 = "0xffa827a39850a5ef924e1d9927977c9863607ef0217398c173c162334a00a36d",
  B5 = "0xTODO",
  { networkConfig: F5, useNetworkVariable: p_ } = XD({
    devnet: { url: Nf("devnet"), variables: { counterPackageId: D5 } },
    testnet: { url: Nf("testnet"), variables: { counterPackageId: L5 } },
    mainnet: { url: Nf("mainnet"), variables: { counterPackageId: B5 } },
  })
var an = {},
  Zl = {},
  v1
function U5() {
  if (v1) return Zl
  ;(v1 = 1),
    Object.defineProperty(Zl, "__esModule", { value: !0 }),
    (Zl.parseLengthAndUnit = e),
    (Zl.cssValue = n)
  var t = {
    "cm": !0,
    "mm": !0,
    "in": !0,
    "px": !0,
    "pt": !0,
    "pc": !0,
    "em": !0,
    "ex": !0,
    "ch": !0,
    "rem": !0,
    "vw": !0,
    "vh": !0,
    "vmin": !0,
    "vmax": !0,
    "%": !0,
  }
  function e(s) {
    if (typeof s == "number") return { value: s, unit: "px" }
    var o,
      l = (s.match(/^[0-9.]*/) || "").toString()
    l.includes(".") ? (o = parseFloat(l)) : (o = parseInt(l, 10))
    var u = (s.match(/[^0-9]*$/) || "").toString()
    return t[u]
      ? { value: o, unit: u }
      : (console.warn(
          "React Spinners: "
            .concat(s, " is not a valid css value. Defaulting to ")
            .concat(o, "px."),
        ),
        { value: o, unit: "px" })
  }
  function n(s) {
    var o = e(s)
    return "".concat(o.value).concat(o.unit)
  }
  return Zl
}
var Jl = {},
  w1
function z5() {
  if (w1) return Jl
  ;(w1 = 1),
    Object.defineProperty(Jl, "__esModule", { value: !0 }),
    (Jl.createAnimation = void 0)
  var t = function (e, n, s) {
    var o = "react-spinners-".concat(e, "-").concat(s)
    if (typeof window > "u" || !window.document) return o
    var l = document.createElement("style")
    document.head.appendChild(l)
    var u = l.sheet,
      f = `
    @keyframes `
        .concat(
          o,
          ` {
      `,
        )
        .concat(
          n,
          `
    }
  `,
        )
    return u && u.insertRule(f, 0), o
  }
  return (Jl.createAnimation = t), Jl
}
var S1
function $5() {
  if (S1) return an
  S1 = 1
  var t =
      (an && an.__assign) ||
      function () {
        return (
          (t =
            Object.assign ||
            function (h) {
              for (var g, w = 1, b = arguments.length; w < b; w++) {
                g = arguments[w]
                for (var E in g)
                  Object.prototype.hasOwnProperty.call(g, E) && (h[E] = g[E])
              }
              return h
            }),
          t.apply(this, arguments)
        )
      },
    e =
      (an && an.__createBinding) ||
      (Object.create
        ? function (h, g, w, b) {
            b === void 0 && (b = w)
            var E = Object.getOwnPropertyDescriptor(g, w)
            ;(!E ||
              ("get" in E ? !g.__esModule : E.writable || E.configurable)) &&
              (E = {
                enumerable: !0,
                get: function () {
                  return g[w]
                },
              }),
              Object.defineProperty(h, b, E)
          }
        : function (h, g, w, b) {
            b === void 0 && (b = w), (h[b] = g[w])
          }),
    n =
      (an && an.__setModuleDefault) ||
      (Object.create
        ? function (h, g) {
            Object.defineProperty(h, "default", { enumerable: !0, value: g })
          }
        : function (h, g) {
            h.default = g
          }),
    s =
      (an && an.__importStar) ||
      function (h) {
        if (h && h.__esModule) return h
        var g = {}
        if (h != null)
          for (var w in h)
            w !== "default" &&
              Object.prototype.hasOwnProperty.call(h, w) &&
              e(g, h, w)
        return n(g, h), g
      },
    o =
      (an && an.__rest) ||
      function (h, g) {
        var w = {}
        for (var b in h)
          Object.prototype.hasOwnProperty.call(h, b) &&
            g.indexOf(b) < 0 &&
            (w[b] = h[b])
        if (h != null && typeof Object.getOwnPropertySymbols == "function")
          for (
            var E = 0, b = Object.getOwnPropertySymbols(h);
            E < b.length;
            E++
          )
            g.indexOf(b[E]) < 0 &&
              Object.prototype.propertyIsEnumerable.call(h, b[E]) &&
              (w[b[E]] = h[b[E]])
        return w
      }
  Object.defineProperty(an, "__esModule", { value: !0 })
  var l = s(Ka()),
    u = U5(),
    f = z5(),
    d = (0, f.createAnimation)(
      "ClipLoader",
      "0% {transform: rotate(0deg) scale(1)} 50% {transform: rotate(180deg) scale(0.8)} 100% {transform: rotate(360deg) scale(1)}",
      "clip",
    )
  function m(h) {
    var g = h.loading,
      w = g === void 0 ? !0 : g,
      b = h.color,
      E = b === void 0 ? "#000000" : b,
      S = h.speedMultiplier,
      C = S === void 0 ? 1 : S,
      _ = h.cssOverride,
      A = _ === void 0 ? {} : _,
      O = h.size,
      M = O === void 0 ? 35 : O,
      D = o(h, ["loading", "color", "speedMultiplier", "cssOverride", "size"]),
      K = t(
        {
          background: "transparent !important",
          width: (0, u.cssValue)(M),
          height: (0, u.cssValue)(M),
          borderRadius: "100%",
          border: "2px solid",
          borderTopColor: E,
          borderBottomColor: "transparent",
          borderLeftColor: E,
          borderRightColor: E,
          display: "inline-block",
          animation: "".concat(d, " ").concat(0.75 / C, "s 0s infinite linear"),
          animationFillMode: "both",
        },
        A,
      )
    return w ? l.createElement("span", t({ style: K }, D)) : null
  }
  return (an.default = m), an
}
var W5 = $5()
const Cg = yo(W5),
  x1 = t => {
    var e
    return ((e = t.content) == null ? void 0 : e.dataType) === "moveObject"
      ? t.content.fields
      : null
  }
function V5({ id: t }) {
  var b, E
  const e = p_("counterPackageId"),
    n = zd(),
    s = Hu(),
    { mutate: o } = AC(),
    {
      data: l,
      isPending: u,
      error: f,
      refetch: d,
    } = wC("getObject", { id: t, options: { showContent: !0, showOwner: !0 } }),
    [m, h] = v.useState(""),
    g = S => {
      h(S)
      const C = new Wa()
      S === "reset"
        ? C.moveCall({
            arguments: [C.object(t), C.pure.u64(0)],
            target: `${e}::counter::reset`,
          })
        : C.moveCall({
            arguments: [C.object(t)],
            target: `${e}::counter::increment`,
          }),
        o(
          { transaction: C },
          {
            onSuccess: _ => {
              n.waitForTransaction({ digest: _.digest }).then(async () => {
                await d(), h("")
              })
            },
          },
        )
    }
  if (u) return T.jsx(ci, { children: "Loading..." })
  if (f) return T.jsxs(ci, { children: ["Error: ", f.message] })
  if (!l.data) return T.jsx(ci, { children: "Not found" })
  const w =
    ((b = x1(l.data)) == null ? void 0 : b.owner) ===
    (s == null ? void 0 : s.address)
  return T.jsxs(T.Fragment, {
    children: [
      T.jsxs(pd, { size: "3", children: ["Counter ", t] }),
      T.jsxs(ps, {
        direction: "column",
        gap: "2",
        children: [
          T.jsxs(ci, {
            children: ["Count: ", (E = x1(l.data)) == null ? void 0 : E.count],
          }),
          T.jsxs(ps, {
            direction: "row",
            gap: "2",
            children: [
              T.jsx(gd, {
                onClick: () => g("increment"),
                disabled: m !== "",
                children:
                  m === "increment" ? T.jsx(Cg, { size: 20 }) : "Increment",
              }),
              w
                ? T.jsx(gd, {
                    onClick: () => g("reset"),
                    disabled: m !== "",
                    children: m === "reset" ? T.jsx(Cg, { size: 20 }) : "Reset",
                  })
                : null,
            ],
          }),
        ],
      }),
    ],
  })
}
function H5({ onCreated: t }) {
  const e = p_("counterPackageId"),
    n = zd(),
    { mutate: s, isSuccess: o, isPending: l } = AC()
  function u() {
    const f = new Wa()
    f.moveCall({ arguments: [], target: `${e}::counter::create` }),
      s(
        { transaction: f },
        {
          onSuccess: async ({ digest: d }) => {
            var h, g, w
            const { effects: m } = await n.waitForTransaction({
              digest: d,
              options: { showEffects: !0 },
            })
            t(
              (w =
                (g =
                  (h = m == null ? void 0 : m.created) == null
                    ? void 0
                    : h[0]) == null
                  ? void 0
                  : g.reference) == null
                ? void 0
                : w.objectId,
            )
          },
        },
      )
  }
  return T.jsx(yd, {
    children: T.jsx(gd, {
      size: "3",
      onClick: () => {
        u()
      },
      disabled: o || l,
      children: o || l ? T.jsx(Cg, { size: 20 }) : "Create Counter",
    }),
  })
}
function G5() {
  const [t, e] = v.useState(null),
    [n, s] = v.useState(!0),
    [o, l] = v.useState(null)
  return (
    v.useEffect(() => {
      ;(async () => {
        try {
          s(!0)
          const f = await fetch(j5)
          if (!f.ok) throw new Error(`HTTP error! Status: ${f.status}`)
          const d = await f.text()
          e(d), l(null)
        } catch (f) {
          l(f instanceof Error ? f.message : "An unknown error occurred"),
            e(null)
        } finally {
          s(!1)
        }
      })()
    }, []),
    T.jsxs(md, {
      my: "4",
      p: "4",
      style: { background: "var(--gray-a3)", borderRadius: "8px" },
      children: [
        T.jsx(ci, {
          size: "2",
          weight: "bold",
          mb: "2",
          children: "Backend Status:",
        }),
        T.jsx(ps, {
          align: "center",
          gap: "2",
          children: n
            ? T.jsxs(T.Fragment, {
                children: [
                  T.jsx(Ly, { size: "1" }),
                  T.jsx(ci, { children: "Loading backend data..." }),
                ],
              })
            : o
              ? T.jsx(ci, { color: "red", children: `Error: ${o}` })
              : T.jsx(ci, { children: t }),
        }),
      ],
    })
  )
}
function K5() {
  const t = v.useRef()
  return (
    v.useEffect(() => {
      const e = document.createElement("script")
      ;(e.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"),
        (e.type = "text/javascript"),
        (e.async = !0),
        (e.innerHTML = `
        {
          "autosize": true,
          "symbol": "NASDAQ:AAPL",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`),
        t.current.appendChild(e)
    }, []),
    T.jsxs("div", {
      className: "tradingview-widget-container",
      ref: t,
      style: { height: "100%", width: "100%" },
      children: [
        T.jsx("div", {
          className: "tradingview-widget-container__widget",
          style: { height: "calc(100% - 32px)", width: "100%" },
        }),
        T.jsx("div", {
          className: "tradingview-widget-copyright",
          children: T.jsx("a", {
            href: "https://www.tradingview.com/",
            rel: "noopener nofollow",
            target: "_blank",
            children: T.jsx("span", {
              className: "blue-text",
              children: "Track all markets on TradingView",
            }),
          }),
        }),
      ],
    })
  )
}
const q5 = v.memo(K5)
function Q5() {
  const t = Hu(),
    [e, n] = v.useState(() => {
      const s = window.location.hash.slice(1)
      return nu(s) ? s : null
    })
  return T.jsx(_5, {
    children: T.jsxs(T.Fragment, {
      children: [
        T.jsxs(ps, {
          position: "sticky",
          px: "4",
          py: "2",
          justify: "between",
          style: { borderBottom: "1px solid var(--gray-a2)" },
          children: [
            T.jsxs(md, {
              children: [
                T.jsx(pd, { children: "dApp Starter Template" }),
                T.jsx(wd, { to: "/", children: "Home" }),
                " | ",
                T.jsx(wd, { to: "/plot", children: "Plot" }),
              ],
            }),
            T.jsx(md, { children: T.jsx(ID, {}) }),
          ],
        }),
        T.jsx(yd, {
          children: T.jsxs(n5, {
            children: [
              T.jsx(Eg, {
                path: "/",
                element: T.jsxs(T.Fragment, {
                  children: [
                    T.jsx(G5, {}),
                    T.jsx(yd, {
                      mt: "5",
                      pt: "2",
                      px: "4",
                      style: { background: "var(--gray-a2)", minHeight: 500 },
                      children: t
                        ? e
                          ? T.jsx(V5, { id: e })
                          : T.jsx(H5, {
                              onCreated: s => {
                                ;(window.location.hash = s), n(s)
                              },
                            })
                        : T.jsx(pd, { children: "Please connect your wallet" }),
                    }),
                  ],
                }),
              }),
              T.jsx(Eg, { path: "/plot", element: T.jsx(q5, {}) }),
            ],
          }),
        }),
      ],
    }),
  })
}
const Y5 = new pA()
b2.createRoot(document.getElementById("root")).render(
  T.jsx(Cr.StrictMode, {
    children: T.jsx(qC, {
      appearance: "dark",
      children: T.jsx(wA, {
        client: Y5,
        children: T.jsx(yD, {
          networks: F5,
          defaultNetwork: "testnet",
          children: T.jsx(QD, { autoConnect: !0, children: T.jsx(Q5, {}) }),
        }),
      }),
    }),
  }),
)
