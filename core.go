// Code generated by "modulizer -l core -o core.go lib"; DO NOT EDIT.

package module

type coreLoader struct {
}

func (*coreLoader) Load(id string) ([]byte, error) {
	if b, ok := files[id]; ok {
		return b, nil
	}
	return nil, ErrModule
}

func (*coreLoader) Resolve(id, _ string) (string, error) {
	if _, ok := files[id]; ok {
		return id, nil
	}
	return "", ErrModule
}

var files = map[string][]byte{
	"internal/bootstrap.js": []byte(`//
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
`),
	"internal/module.js": []byte(`//
// otto.module :: internal/module.js
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
`),
	"module.js": []byte(`//
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
`),
	"path.js": []byte(`//
// otto.module :: path.js
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

function assert(path) {
  if (typeof path !== 'string') {
    throw new TypeError('path must be a String');
  }
}

var posix = {
  delimiter: ':',
  sep: '/',

  _isSep: function _isSep(c) {
    return c === '/';
  },

  _volname: function _volname() {
    return '';
  },
};

var win32 = {
  delimiter: ';',
  sep: '\\',

  _isSep: function _isSep(c) {
    return c === '\\'
           || c === '/';
  },

  _volname: function _volname(path) {
    if (1 < path.length) {
      if (path[1] === ':'
          && ('A' <= path[0] && path[0] <= 'Z'
              || 'a' <= path[0] && path[0] <= 'z')) {
        // drive letter
        return path.slice(0, 2);
      } else if (4 < path.length
                 && win32._isSep(path[0])
                 && win32._isSep(path[1])
                 && !(win32._isSep(path[2])
                      || path[2] === '.')) {
        // UNC
        for (var i = 3; i < path.length - 1; i++) {
          if (win32._isSep(path[i])
              && !win32._isSep(path[++i])) {
            for (; i < path.length; i++) {
              if (win32._isSep(path[i])) {
                break;
              }
            }
            return path.slice(0, i);
          }
        }
      }
    }
    return '';
  },
};

function _basename(os) {
  return function basename(path, ext) {
    assert(path);
    if (ext !== undefined) {
      assert(ext);
    }
    // volume
    var vol = os._volname(path);
    if (vol
        && vol === path) {
      return '';
    }
    // trim trailing separators
    var end;
    for (end = path.length; vol.length < end && os._isSep(path[end - 1]); end--);

    for (var i = end - 1; vol.length < i; i--) {
      if (os._isSep(path[i])) {
        i++;
        if (ext
            && path.indexOf(ext, end - ext.length) !== -1) {
          return path.slice(i, end - ext.length);
        }
        return path.slice(i, end);
      }
    }
    return '';
  };
}

posix.basename = _basename(posix);
win32.basename = _basename(win32);

function _dirname(os) {
  return function dirname(path) {
    assert(path);
    // volume
    var vol = os._volname(path);
    if (vol
        && vol === path) {
      return vol;
    }
    // relative
    if (path === vol
        || !os._isSep(path[vol.length])) {
      return '.';
    }
    // trim trailing separators
    var end;
    for (end = path.length; vol.length < end && os._isSep(path[end - 1]); end--);

    for (var i = end - 1; vol.length < i; i--) {
      if (os._isSep(path[i])) {
        return path.slice(0, i);
      }
    }
    return vol ? vol + path[end] : path[end];
  };
}

posix.dirname = _dirname(posix);
win32.dirname = _dirname(win32);

function _extname(os) {
  return function extname(path) {
    assert(path);
    for (var i = path.length - 1; 0 < i && !os._isSep(path[i]); i--) {
      if (path[i] === '.'
          && !os._isSep(path[i - 1])) {
        return path.slice(i);
      }
    }
    return '';
  };
}

posix.extname = _extname(posix);
win32.extname = _extname(win32);

function _format(os) {
  return function format(pathObject) {
    if (pathObject === null
        || typeof pathObject !== 'object') {
      throw new TypeError('pathObject must be an Object');
    }
    var dir = pathObject.dir || pathObject.root;
    var base = pathObject.base || '';
    if (!base) {
      if (pathObject.name) {
        base += pathObject.name;
      }
      if (pathObject.ext) {
        base += pathObject.ext;
      }
    }
    if (!dir) {
      return base;
    }
    return dir === pathObject.root ? dir + base : dir + os.sep + base;
  };
}

posix.format = _format(posix);
win32.format = _format(win32);

function _isAbsolute(os) {
  return function isAbsolute(path) {
    assert(path);
    return path
           && os._isSep(path[os._volname(path).length]);
  };
}

posix.isAbsolute = _isAbsolute(posix);
win32.isAbsolute = _isAbsolute(win32);

function _normalize(os) {
  return function normalize(path) {
    assert(path);
    // volume
    var vol = os._volname(path);
    if (vol === path) {
      if (!vol) {
        return '.';
      }
      return vol.length === 2 ? vol + '.' : vol.replace(/\//g, os.sep) + os.sep;
    }

    var abs = os._isSep(path[vol.length]);
    var dot = 0;
    var rv = '';
    var n = path.length;
    var i = vol.length;
    while (i < n) {
      if (os._isSep(path[i])) {
        // separator
        i++;
      } else if (path[i] === '.'
                 && (i + 1 === n
                     || os._isSep(path[i + 1]))) {
        // .
        i++;
      } else if (path[i] === '.'
                 && path[i + 1] === '.'
                 && (i + 2 === n
                     || os._isSep(path[i + 2]))) {
        // ..
        i += 2;
        if (dot < rv.length) {
          rv = rv.slice(0, rv.lastIndexOf(os.sep));
        } else if (!abs) {
          if (rv) {
            rv += os.sep;
          }
          rv += '..';
          dot = rv.length;
        }
      } else {
        if (abs
            || rv) {
          rv += os.sep;
        }
        var beg = i;
        for (; i < n && !os._isSep(path[i]); i++);
        rv += path.slice(beg, i);
      }
    }
    if (!rv) {
      rv = abs ? os.sep : '.';
    }
    if (vol.length < n - 1
        && os._isSep(path[n - 1])) {
      rv += os.sep;
    }
    return vol ? vol.replace(/\//g, os.sep) + rv : rv;
  };
}

posix.normalize = _normalize(posix);
win32.normalize = _normalize(win32);

function _parse(os) {
  return function parse(path) {
    assert(path);
    // volume
    var vol = os._volname(path);

    var root;
    var dir;
    if (vol === path
        || !os._isSep(path[vol.length])) {
      // relative
      root = dir = '';
    } else {
      // absolute
      root = dir = path.slice(0, vol.length + 1);
    }
    // trim trailing separators
    var end;
    for (end = path.length; vol.length < end && os._isSep(path[end - 1]); end--);

    var base;
    var dot = end;
    if (end === vol.length) {
      base = vol.length;
    } else {
      for (base = end - 1; vol.length < base; base--) {
        if (os._isSep(path[base - 1])) {
          dir = path.slice(0, base - 1);
          break;
        } else if (path[base] === '.'
                   && dot === end
                   && (vol.length < base && base < end - 1)) {
          dot = base;
        }
      }
    }
    return {
      root: root,
      dir: dir,
      base: path.slice(base, end),
      name: path.slice(base, dot),
      ext: path.slice(dot, end),
    };
  };
}

posix.parse = _parse(posix);
win32.parse = _parse(win32);

posix.posix = win32.posix = posix;
posix.win32 = win32.win32 = win32;

if (process.platform === 'win32') {
  module.exports = win32;
} else {
  module.exports = posix;
}
`),
}
