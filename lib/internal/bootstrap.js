//
// otto.module :: internal/bootstrap.go
//
//   Copyright (c) 2017 Akinori Hattori <hattya@gmail.com>
//
//   Permission is hereby granted, free of charge, to any person
//   obtaining a copy of this software and associated documentation files
//   (the "Software"), to deal in the Software without restriction,
//   including without limitation the rights to use, copy, modify, merge,
//   publish, distribute, sublicense, and/or sell copies of the Software,
//   and to permit persons to whom the Software is furnished to do so,
//   subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be
//   included in all copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
//   BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
//   ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
//   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
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
