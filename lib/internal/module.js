//
// otto.module :: internal/module.js
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

'use strict';

exports.require = function require_(m) {
  var Module = m.constructor;

  function require(id) {
    return m.require(id);
  }

  require.cache = Module._cache;
  require.extensions = Module._extensions;

  require.resolve = function resolve(id) {
    return Module._resolve(id, m);
  };

  return require;
};
