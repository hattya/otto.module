//
// otto.module :: path.spec.js
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

const assert = require('power-assert');
const path = require('../lib/path');

describe('path', () => {
  describe('.posix', () => {
    const { posix } = path;

    describe('.delimiter', () => {
      it('is ":"', () => {
        assert.equal(posix.delimiter, ':');
      });
    });

    describe('.dirname()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.dirname(true), TypeError);
        assert.throws(() => posix.dirname(0), TypeError);
        assert.throws(() => posix.dirname({}), TypeError);
      });

      it('should return the directory name of a path', () => {
        assert.equal(posix.dirname('/foo/bar///'), '/foo');
        assert.equal(posix.dirname('/foo/bar'), '/foo');

        assert.equal(posix.dirname('/'), '/');

        assert.equal(posix.dirname('foo'), '.');

        assert.equal(posix.dirname(''), '.');
        assert.equal(posix.dirname('.'), '.');
        assert.equal(posix.dirname('..'), '.');
      });
    });

    describe('.extname()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.extname(true), TypeError);
        assert.throws(() => posix.extname(0), TypeError);
        assert.throws(() => posix.extname({}), TypeError);
      });

      it('should return the extension of a path', () => {
        assert.equal(posix.extname('index.js'), '.js');
        assert.equal(posix.extname('index.js.md'), '.md');
        assert.equal(posix.extname('index.'), '.');
        assert.equal(posix.extname('index'), '');
        assert.equal(posix.extname('.index'), '');

        assert.equal(posix.extname('/foo/bar/.index'), '');
      });
    });

    describe('.posix', () => {
      it('is path.posix', () => {
        assert.equal(posix.posix, path.posix);
      });
    });

    describe('.sep', () => {
      it('is "/"', () => {
        assert.equal(posix.sep, '/');
      });
    });

    describe('.win32', () => {
      it('is path.win32', () => {
        assert.equal(posix.win32, path.win32);
      });
    });
  });

  describe('.win32', () => {
    const { win32 } = path;

    describe('.delimiter', () => {
      it('is ";"', () => {
        assert.equal(win32.delimiter, ';');
      });
    });

    describe('.dirname()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.dirname(true), TypeError);
        assert.throws(() => win32.dirname(0), TypeError);
        assert.throws(() => win32.dirname({}), TypeError);
      });

      it('should return the directory name of a path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          assert.equal(win32.dirname(`${v}\\foo\\bar\\\\\\`), `${v}\\foo`);
          assert.equal(win32.dirname(`${v}/foo/bar///`), `${v}/foo`);
          assert.equal(win32.dirname(`${v}\\foo\\bar`), `${v}\\foo`);
          assert.equal(win32.dirname(`${v}/foo/bar`), `${v}/foo`);

          assert.equal(win32.dirname(`${v}\\`), `${v}\\`);
          assert.equal(win32.dirname(`${v}/`), `${v}/`);

          assert.equal(win32.dirname(v), v || '.');
        });

        assert.equal(win32.dirname('foo'), '.');

        assert.equal(win32.dirname(''), '.');
        assert.equal(win32.dirname('.'), '.');
        assert.equal(win32.dirname('..'), '.');
      });
    });

    describe('.extname()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.extname(true), TypeError);
        assert.throws(() => win32.extname(0), TypeError);
        assert.throws(() => win32.extname({}), TypeError);
      });

      it('should return the extension of a path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          assert.equal(win32.extname(`${v}\\index.js`), '.js');
          assert.equal(win32.extname(`${v}\\index.js.md`), '.md');
          assert.equal(win32.extname(`${v}\\index.`), '.');
          assert.equal(win32.extname(`${v}\\index`), '');
          assert.equal(win32.extname(`${v}\\.index`), '');
        });
      });
    });

    describe('.posix', () => {
      it('is path.posix', () => {
        assert.equal(win32.posix, path.posix);
      });
    });

    describe('.sep', () => {
      it('is "\\"', () => {
        assert.equal(win32.sep, '\\');
      });
    });

    describe('.win32', () => {
      it('is path.win32', () => {
        assert.equal(win32.win32, path.win32);
      });
    });
  });
});
