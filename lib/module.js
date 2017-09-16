//
// otto.module :: module.js
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

var NativeModule = require('native_module');
var _module = require('internal/module');
var path = require('path');

var vm = process.binding('vm');

function update(parent, child, scan) {
  if (parent
      && !(scan
           && parent.children.indexOf(child) === -1)) {
    parent.children.push(child);
  }
}

function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  this.filename = null;
  this.loaded = false;
  this.children = [];

  update(parent, this, false);
}

Module._cache = Object.create(null);
Module._pathCache = Object.create(null);
Module._extensions = Object.create(null);

Module._resolve = function _resolve(id, parent) {
  var dir = '';
  if (parent
      && parent.filename) {
    dir = path.dirname(parent.filename);
  }

  var k = id + '\x00' + dir;
  var p = Module._pathCache[k];
  if (!p) {
    Module._pathCache[k] = p = vm.resolve(id, dir);
  }
  return p;
};

Module.prototype.require = function require(id) {
  if (NativeModule.exists(id)
      && !NativeModule.isInternal(id)) {
    return NativeModule.require(id);
  }

  var n = Module._resolve(id, this);
  var m = Module._cache[n];
  if (m) {
    update(this, m, true);
  } else {
    Module._cache[n] = m = new Module(id, this);
    m.filename = n;
    m.paths = [];
    m._load();
  }
  return m.exports;
};

Module.prototype._compile = function _compile() {
  var fn = vm.compile(this.filename);
  fn.call(this.exports, this.exports, _module.require(this), this, this.filename, path.dirname(this.filename));
};

Module.prototype._load = function _load() {
  if (this.loaded) {
    throw new Error('already loaded');
  }

  var ext = path.extname(this.filename);
  if (!(ext in Module._extensions)) {
    ext = '.js';
  }
  Module._extensions[ext](this);
  this.loaded = true;
};

Module._extensions['.js'] = function _extensions$js(module) {
  module._compile();
};

Module._extensions['.json'] = function _extensions$json(module) {
  try {
    module.exports = JSON.parse(vm.load(module.filename));
  } catch (err) {
    throw new err.constructor(module.filename + ': ' + err.message);
  }
};

module.exports = Module;
