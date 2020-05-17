//
// otto.module :: path.js
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
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
    if (path.length > 1) {
      if (path[1] === ':'
          && ('A' <= path[0] && path[0] <= 'Z'
              || 'a' <= path[0] && path[0] <= 'z')) {
        // drive letter
        return path.slice(0, 2);
      } else if (path.length > 4
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
    for (end = path.length; end > vol.length && os._isSep(path[end - 1]); end--);

    for (var i = end - 1; i > vol.length; i--) {
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
    if (!path) {
      return '.';
    }
    // volume
    var vol = os._volname(path);
    if (vol
        && vol === path) {
      return vol;
    }
    // trim trailing separators
    var end;
    for (end = path.length; end > vol.length && os._isSep(path[end - 1]); end--);

    for (var i = end - 1; i > vol.length; i--) {
      if (os._isSep(path[i])) {
        return path.slice(0, i);
      }
    }
    return end < path.length ? vol + path[end] : '.';
  };
}

posix.dirname = _dirname(posix);
win32.dirname = _dirname(win32);

function _extname(os) {
  return function extname(path) {
    assert(path);
    for (var i = path.length - 1; i > 0 && !os._isSep(path[i]); i--) {
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
    return !!path
           && os._isSep(path[os._volname(path).length]);
  };
}

posix.isAbsolute = _isAbsolute(posix);
win32.isAbsolute = _isAbsolute(win32);

function _join(os) {
  return function join() {
    var path = '';
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      assert(a);
      if (a) {
        if (path
            && !os._isSep(a[0])) {
          path += os.sep;
        }
        path += a;
      }
    }
    if (!path) {
      return '.';
    }
    return os.normalize(path);
  };
}

posix.join = _join(posix);
win32.join = _join(win32);

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
    for (end = path.length; end > vol.length && os._isSep(path[end - 1]); end--);

    var base;
    var dot = end;
    if (end === vol.length) {
      base = vol.length;
    } else {
      for (base = end - 1; base > vol.length; base--) {
        if (os._isSep(path[base - 1])) {
          dir = path.slice(0, base - 1);
          break;
        } else if (path[base] === '.'
                   && dot === end
                   && (base > vol.length && base < end - 1)) {
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
