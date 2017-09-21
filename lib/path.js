//
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

function _isAbsolute(os) {
  return function isAbsolute(path) {
    assert(path);
    return path
           && os._isSep(path[os._volname(path).length]);
  };
}

posix.isAbsolute = _isAbsolute(posix);
win32.isAbsolute = _isAbsolute(win32);

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
