//
// otto.module :: internal/bootstrap.go
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

'use strict';

(function(process) {
  var vm = process.binding('vm');

  function NativeModule(id) {
    this.id = id;
    this.exports = {};
    this.filename = id + '.js';
    this.loaded = false;
  }

  NativeModule._source = process.binding('natives');
  NativeModule._cache = Object.create(null);

  NativeModule.exists = function exists(id) {
    return Object.prototype.hasOwnProperty.call(NativeModule._source, id);
  };

  NativeModule.isInternal = function isInternal(id) {
    var s = 'internal/';
    return id.slice(0, s.length) === s;
  };

  NativeModule.require = function require(id) {
    if (id === 'native_module') {
      return NativeModule;
    }

    var m = NativeModule._cache[id];
    if (!m) {
      NativeModule._cache[id] = m = new NativeModule(id);
      m.compile();
    }
    return m.exports;
  };

  NativeModule.prototype.compile = function compile() {
    var fn = vm.compile(this.filename);
    fn(this.exports, NativeModule.require, this, this.filename);

    this.loaded = true;
  };

  var g = (0, eval)('this');
  g.process = process;

  var Module = NativeModule.require('module');
  var _module = NativeModule.require('internal/module');

  var m = new Module('<otto>');
  g.module = m;
  g.require = _module.require(m);
});
