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

    describe('.basename()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.basename(true), TypeError);
        assert.throws(() => posix.basename(0), TypeError);
        assert.throws(() => posix.basename({}), TypeError);
        assert.throws(() => posix.basename('', true), TypeError);
        assert.throws(() => posix.basename('', 0), TypeError);
        assert.throws(() => posix.basename('', {}), TypeError);
      });

      it('should return the last portion of a path', () => {
        assert.equal(posix.basename('/foo/bar///'), 'bar');
        assert.equal(posix.basename('/foo/bar.html'), 'bar.html');
        assert.equal(posix.basename('/foo/bar.html', '.html'), 'bar');

        assert.equal(posix.basename('/'), '');

        assert.equal(posix.basename(''), '');
        assert.equal(posix.basename('.'), '');
        assert.equal(posix.basename('..'), '');
      });
    });

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

        assert.equal(posix.dirname('foo/bar///'), 'foo');
        assert.equal(posix.dirname('foo/bar'), 'foo');

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

    describe('.format()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.format(null), TypeError);
        assert.throws(() => posix.format(undefined), TypeError);
        assert.throws(() => posix.format(true), TypeError);
        assert.throws(() => posix.format(0), TypeError);
      });

      it('should return a path from an object', () => {
        assert.equal(posix.format({
        }), '');
        assert.equal(posix.format({
          root: '/',
        }), '/');
        assert.equal(posix.format({
          root: '/',
          dir: '/',
        }), '/');
        assert.equal(posix.format({
          root: '/',
          dir: '/foo',
          base: 'bar.html',
        }), '/foo/bar.html');
        assert.equal(posix.format({
          root: '/',
          dir: '/foo',
          name: 'bar',
          ext: '.html',
        }), '/foo/bar.html');
      });
    });

    describe('.isAbsolute()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.isAbsolute(true), TypeError);
        assert.throws(() => posix.isAbsolute(0), TypeError);
        assert.throws(() => posix.isAbsolute({}), TypeError);
      });

      it('should return true', () => {
        assert.ok(posix.isAbsolute('/'));
      });

      it('should return false', () => {
        assert.ok(!posix.isAbsolute(''));
        assert.ok(!posix.isAbsolute('.'));
        assert.ok(!posix.isAbsolute('..'));
      });
    });

    describe('.join()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.join(true), TypeError);
        assert.throws(() => posix.join(0), TypeError);
        assert.throws(() => posix.join({}), TypeError);
      });

      it('should return "."', () => {
        assert.equal(posix.join(''), '.');
        assert.equal(posix.join('', ''), '.');
      });

      it('should return an absolute path', () => {
        assert.equal(posix.join('/foo', '/bar///'), '/foo/bar/');
        assert.equal(posix.join('/foo', '/bar', '///'), '/foo/bar/');
        assert.equal(posix.join('/foo', '/bar'), '/foo/bar');
        assert.equal(posix.join('/foo', '/bar', 'baz', '..'), '/foo/bar');

        assert.equal(posix.join('/foo', 'bar///'), '/foo/bar/');
        assert.equal(posix.join('/foo', 'bar', '///'), '/foo/bar/');
        assert.equal(posix.join('/foo', 'bar'), '/foo/bar');
        assert.equal(posix.join('/foo', 'bar', 'baz', '..'), '/foo/bar');
      });

      it('should return a relative path', () => {
        assert.equal(posix.join('foo', '/bar///'), 'foo/bar/');
        assert.equal(posix.join('foo', '/bar', '///'), 'foo/bar/');
        assert.equal(posix.join('foo', '/bar'), 'foo/bar');
        assert.equal(posix.join('foo', '/bar', 'baz', '..'), 'foo/bar');

        assert.equal(posix.join('..', 'foo', '..', '/bar///'), '../bar/');
        assert.equal(posix.join('..', 'foo', '..', '/bar', '///'), '../bar/');
        assert.equal(posix.join('..', 'foo', '..', '/bar'), '../bar');
        assert.equal(posix.join('..', 'foo', '..', '/bar', 'baz', '..'), '../bar');
      });
    });

    describe('.normalize()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.parse(true), TypeError);
        assert.throws(() => posix.parse(0), TypeError);
        assert.throws(() => posix.parse({}), TypeError);
      });

      it('should return "."', () => {
        assert.equal(posix.normalize(''), '.');
        assert.equal(posix.normalize('./'), './');
        assert.equal(posix.normalize('.'), '.');
      });

      it('should return an absolute path', () => {
        assert.equal(posix.normalize('/foo/./bar/..///'), '/foo/');
        assert.equal(posix.normalize('/foo/./bar/..'), '/foo');
        assert.equal(posix.normalize('/foo/./bar/.././../..'), '/');

        assert.equal(posix.normalize('/foo/.././../.bar'), '/.bar');
        assert.equal(posix.normalize('/foo/.././../..bar'), '/..bar');
        assert.equal(posix.normalize('/foo/.././../bar.'), '/bar.');
        assert.equal(posix.normalize('/foo/.././../bar..'), '/bar..');
      });

      it('should return a relative path', () => {
        assert.equal(posix.normalize('foo/./bar///'), 'foo/bar/');
        assert.equal(posix.normalize('foo/./bar'), 'foo/bar');

        assert.equal(posix.normalize('foo/./.bar'), 'foo/.bar');
        assert.equal(posix.normalize('foo/./..bar'), 'foo/..bar');
        assert.equal(posix.normalize('foo/./bar.'), 'foo/bar.');
        assert.equal(posix.normalize('foo/./bar..'), 'foo/bar..');

        assert.equal(posix.normalize('./.././../foo/./.././/bar///'), '../../bar/');
        assert.equal(posix.normalize('./.././../foo/./.././bar'), '../../bar');

        assert.equal(posix.normalize('./../foo/.././.bar'), '../.bar');
        assert.equal(posix.normalize('./../foo/.././..bar'), '../..bar');
        assert.equal(posix.normalize('./../foo/.././bar.'), '../bar.');
        assert.equal(posix.normalize('./../foo/.././bar..'), '../bar..');
      });
    });

    describe('.parse()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => posix.parse(true), TypeError);
        assert.throws(() => posix.parse(0), TypeError);
        assert.throws(() => posix.parse({}), TypeError);
      });

      it('should return an object of an absolute path', () => {
        assert.deepEqual(posix.parse('/foo/bar///'), {
          root: '/',
          dir: '/foo',
          base: 'bar',
          name: 'bar',
          ext: '',
        });
        assert.deepEqual(posix.parse('/foo/bar'), {
          root: '/',
          dir: '/foo',
          base: 'bar',
          name: 'bar',
          ext: '',
        });

        assert.deepEqual(posix.parse('/foo/bar/index.js'), {
          root: '/',
          dir: '/foo/bar',
          base: 'index.js',
          name: 'index',
          ext: '.js',
        });
        assert.deepEqual(posix.parse('/foo/bar/index.js.md'), {
          root: '/',
          dir: '/foo/bar',
          base: 'index.js.md',
          name: 'index.js',
          ext: '.md',
        });
        assert.deepEqual(posix.parse('/foo/bar/index.'), {
          root: '/',
          dir: '/foo/bar',
          base: 'index.',
          name: 'index.',
          ext: '',
        });
        assert.deepEqual(posix.parse('/foo/bar/index'), {
          root: '/',
          dir: '/foo/bar',
          base: 'index',
          name: 'index',
          ext: '',
        });
        assert.deepEqual(posix.parse('/foo/bar/.index'), {
          root: '/',
          dir: '/foo/bar',
          base: '.index',
          name: '.index',
          ext: '',
        });

        assert.deepEqual(posix.parse('/'), {
          root: '/',
          dir: '/',
          base: '',
          name: '',
          ext: '',
        });
      });

      it('should return an object of a relative path', () => {
        assert.deepEqual(posix.parse('foo.js'), {
          root: '',
          dir: '',
          base: 'foo.js',
          name: 'foo',
          ext: '.js',
        });
        assert.deepEqual(posix.parse('./foo.js'), {
          root: '',
          dir: '.',
          base: 'foo.js',
          name: 'foo',
          ext: '.js',
        });
        assert.deepEqual(posix.parse('../foo.js'), {
          root: '',
          dir: '..',
          base: 'foo.js',
          name: 'foo',
          ext: '.js',
        });

        assert.deepEqual(posix.parse('../index.js'), {
          root: '',
          dir: '..',
          base: 'index.js',
          name: 'index',
          ext: '.js',
        });
        assert.deepEqual(posix.parse('../index.js.md'), {
          root: '',
          dir: '..',
          base: 'index.js.md',
          name: 'index.js',
          ext: '.md',
        });
        assert.deepEqual(posix.parse('../index.'), {
          root: '',
          dir: '..',
          base: 'index.',
          name: 'index.',
          ext: '',
        });
        assert.deepEqual(posix.parse('../index'), {
          root: '',
          dir: '..',
          base: 'index',
          name: 'index',
          ext: '',
        });
        assert.deepEqual(posix.parse('../.index'), {
          root: '',
          dir: '..',
          base: '.index',
          name: '.index',
          ext: '',
        });

        assert.deepEqual(posix.parse(''), {
          root: '',
          dir: '',
          base: '',
          name: '',
          ext: '',
        });
        assert.deepEqual(posix.parse('.'), {
          root: '',
          dir: '',
          base: '.',
          name: '.',
          ext: '',
        });
        assert.deepEqual(posix.parse('..'), {
          root: '',
          dir: '',
          base: '..',
          name: '..',
          ext: '',
        });
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

    describe('.basename()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.basename(true), TypeError);
        assert.throws(() => win32.basename(0), TypeError);
        assert.throws(() => win32.basename({}), TypeError);
        assert.throws(() => win32.basename('', true), TypeError);
        assert.throws(() => win32.basename('', 0), TypeError);
        assert.throws(() => win32.basename('', {}), TypeError);
      });

      it('should return the last portion of a path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          assert.equal(win32.basename(`${v}\\foo\\bar\\\\\\`), 'bar');
          assert.equal(win32.basename(`${v}/foo/bar///`), 'bar');
          assert.equal(win32.basename(`${v}\\foo\\bar.html`), 'bar.html');
          assert.equal(win32.basename(`${v}/foo/bar.html`), 'bar.html');
          assert.equal(win32.basename(`${v}\\foo\\bar.html`, '.html'), 'bar');
          assert.equal(win32.basename(`${v}/foo/bar.html`, '.html'), 'bar');

          assert.equal(win32.basename(`${v}\\`), '');
          assert.equal(win32.basename(`${v}/`), '');

          assert.equal(win32.basename(`${v}`), '');
        });

        assert.equal(win32.basename(''), '');
        assert.equal(win32.basename('.'), '');
        assert.equal(win32.basename('..'), '');
      });
    });

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

        assert.equal(win32.dirname('foo\\bar\\\\\\'), 'foo');
        assert.equal(win32.dirname('foo/bar///'), 'foo');
        assert.equal(win32.dirname('foo\\bar'), 'foo');
        assert.equal(win32.dirname('foo/bar'), 'foo');

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

    describe('.format()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.format(null), TypeError);
        assert.throws(() => win32.format(undefined), TypeError);
        assert.throws(() => win32.format(true), TypeError);
        assert.throws(() => win32.format(0), TypeError);
      });

      it('should return a path from an object', () => {
        assert.equal(win32.format({
        }), '');
        assert.equal(win32.format({
          root: '\\',
        }), '\\');
        assert.equal(win32.format({
          root: '/',
        }), '/');
        assert.equal(win32.format({
          root: '\\',
          dir: '\\',
        }), '\\');
        assert.equal(win32.format({
          root: '/',
          dir: '/',
        }), '/');
        assert.equal(win32.format({
          root: '\\',
          dir: '\\foo',
          base: 'bar.html',
        }), '\\foo\\bar.html');
        assert.equal(win32.format({
          root: '/',
          dir: '/foo',
          base: 'bar.html',
        }), '/foo\\bar.html');
        assert.equal(win32.format({
          root: '\\',
          dir: '\\foo',
          name: 'bar',
          ext: '.html',
        }), '\\foo\\bar.html');
        assert.equal(win32.format({
          root: '/',
          dir: '/foo',
          name: 'bar',
          ext: '.html',
        }), '/foo\\bar.html');
      });
    });

    describe('.isAbsolute()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.isAbsolute(true), TypeError);
        assert.throws(() => win32.isAbsolute(0), TypeError);
        assert.throws(() => win32.isAbsolute({}), TypeError);
      });

      it('should return true', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share', '\\\\UNC', '//UNC'].forEach((v) => {
          assert.ok(win32.isAbsolute(`${v}\\`));
          assert.ok(win32.isAbsolute(`${v}/`));
        });
      });

      it('should return false', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          assert.ok(!win32.isAbsolute(`${v}`));
          assert.ok(!win32.isAbsolute(`${v}.`));
          assert.ok(!win32.isAbsolute(`${v}..`));
        });
      });
    });

    describe('.normalize()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.normalize(true), TypeError);
        assert.throws(() => win32.normalize(0), TypeError);
        assert.throws(() => win32.normalize({}), TypeError);
      });

      it('should return "."', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          assert.equal(win32.normalize(`${v}`), `${v}.`);
          assert.equal(win32.normalize(`${v}.\\`), `${v}.\\`);
          assert.equal(win32.normalize(`${v}./`), `${v}.\\`);
          assert.equal(win32.normalize(`${v}.`), `${v}.`);
        });
      });

      it('should return an absolute path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          const w = v.replace(/\//g, '\\');
          assert.equal(win32.normalize(`${v}\\foo\\.\\bar\\..\\\\\\`), `${w}\\foo\\`);
          assert.equal(win32.normalize(`${v}/foo/./bar/..///`), `${w}\\foo\\`);
          assert.equal(win32.normalize(`${v}\\foo\\.\\bar\\..`), `${w}\\foo`);
          assert.equal(win32.normalize(`${v}/foo/./bar/..`), `${w}\\foo`);
          assert.equal(win32.normalize(`${v}\\foo\\.\\bar\\..\\.\\..\\..`), `${w}\\`);
          assert.equal(win32.normalize(`${v}/foo/./bar/.././../..`), `${w}\\`);

          assert.equal(win32.normalize(`${v}\\foo\\..\\.\\..\\.bar`), `${w}\\.bar`);
          assert.equal(win32.normalize(`${v}/foo/.././../.bar`), `${w}\\.bar`);
          assert.equal(win32.normalize(`${v}\\foo\\..\\.\\..\\..bar`), `${w}\\..bar`);
          assert.equal(win32.normalize(`${v}/foo/.././../..bar`), `${w}\\..bar`);
          assert.equal(win32.normalize(`${v}\\foo\\..\\.\\..\\bar.`), `${w}\\bar.`);
          assert.equal(win32.normalize(`${v}/foo/.././../bar.`), `${w}\\bar.`);
          assert.equal(win32.normalize(`${v}\\foo\\..\\.\\..\\bar..`), `${w}\\bar..`);
          assert.equal(win32.normalize(`${v}/foo/.././../bar..`), `${w}\\bar..`);
        });

        assert.equal(win32.normalize('\\\\UNC\\share'), '\\\\UNC\\share\\');
        assert.equal(win32.normalize('//UNC/share'), '\\\\UNC\\share\\');
      });

      it('should return a relative path', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          assert.equal(win32.normalize(`${v}foo\\.\\bar\\\\\\`), `${v}foo\\bar\\`);
          assert.equal(win32.normalize(`${v}foo/./bar///`), `${v}foo\\bar\\`);
          assert.equal(win32.normalize(`${v}foo\\.\\bar`), `${v}foo\\bar`);
          assert.equal(win32.normalize(`${v}foo/./bar`), `${v}foo\\bar`);

          assert.equal(win32.normalize(`${v}foo\\.\\.bar`), `${v}foo\\.bar`);
          assert.equal(win32.normalize(`${v}foo/./.bar`), `${v}foo\\.bar`);
          assert.equal(win32.normalize(`${v}foo\\.\\..bar`), `${v}foo\\..bar`);
          assert.equal(win32.normalize(`${v}foo/./..bar`), `${v}foo\\..bar`);
          assert.equal(win32.normalize(`${v}foo\\.\\bar.`), `${v}foo\\bar.`);
          assert.equal(win32.normalize(`${v}foo/./bar.`), `${v}foo\\bar.`);
          assert.equal(win32.normalize(`${v}foo\\.\\bar..`), `${v}foo\\bar..`);
          assert.equal(win32.normalize(`${v}foo/./bar..`), `${v}foo\\bar..`);

          assert.equal(win32.normalize(`${v}.\\..\\.\\..\\foo\\.\\..\\.\\\\bar\\\\\\`), `${v}..\\..\\bar\\`);
          assert.equal(win32.normalize(`${v}./.././../foo/./.././/bar///`), `${v}..\\..\\bar\\`);
          assert.equal(win32.normalize(`${v}.\\..\\.\\..\\foo\\.\\..\\.\\bar`), `${v}..\\..\\bar`);
          assert.equal(win32.normalize(`${v}./.././../foo/./.././bar`), `${v}..\\..\\bar`);

          assert.equal(win32.normalize(`${v}.\\..\\foo\\..\\.\\.bar`), `${v}..\\.bar`);
          assert.equal(win32.normalize(`${v}./../foo/.././.bar`), `${v}..\\.bar`);
          assert.equal(win32.normalize(`${v}.\\..\\foo\\..\\.\\..bar`), `${v}..\\..bar`);
          assert.equal(win32.normalize(`${v}./../foo/.././..bar`), `${v}..\\..bar`);
          assert.equal(win32.normalize(`${v}.\\..\\foo\\..\\.\\bar.`), `${v}..\\bar.`);
          assert.equal(win32.normalize(`${v}./../foo/.././bar.`), `${v}..\\bar.`);
          assert.equal(win32.normalize(`${v}.\\..\\foo\\..\\.\\bar..`), `${v}..\\bar..`);
          assert.equal(win32.normalize(`${v}./../foo/.././bar..`), `${v}..\\bar..`);
        });
      });
    });

    describe('.join()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.join(true), TypeError);
        assert.throws(() => win32.join(0), TypeError);
        assert.throws(() => win32.join({}), TypeError);
      });

      it('should return "."', () => {
        assert.equal(win32.join(''), '.');
        assert.equal(win32.join('', ''), '.');
      });

      it('should return an absolute path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          const w = v.replace(/\//g, '\\');
          assert.equal(win32.join(v, '\\foo', '\\bar\\\\\\'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '/foo', '/bar///'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '\\foo', '\\bar', '\\\\\\'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '/foo', '/bar', '///'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '\\foo', '\\bar'), `${w}\\foo\\bar`);
          assert.equal(win32.join(v, '/foo', '/bar'), `${w}\\foo\\bar`);
          assert.equal(win32.join(v, '\\foo', '\\bar', 'baz', '..'), `${w}\\foo\\bar`);
          assert.equal(win32.join(v, '/foo', '/bar', 'baz', '..'), `${w}\\foo\\bar`);

          assert.equal(win32.join(v, '\\foo', 'bar\\\\\\'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '/foo', 'bar///'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '\\foo', 'bar', '///'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '/foo', 'bar', '///'), `${w}\\foo\\bar\\`);
          assert.equal(win32.join(v, '\\foo', 'bar'), `${w}\\foo\\bar`);
          assert.equal(win32.join(v, '/foo', 'bar'), `${w}\\foo\\bar`);
          assert.equal(win32.join(v, '\\foo', 'bar', 'baz', '..'), `${w}\\foo\\bar`);
          assert.equal(win32.join(v, '/foo', 'bar', 'baz', '..'), `${w}\\foo\\bar`);
        });
      });

      it('should return a relative path', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          const w = v.replace(/\//g, '\\');
          assert.equal(win32.join(`${v}foo`, '\\bar\\\\\\'), `${w}foo\\bar\\`);
          assert.equal(win32.join(`${v}foo`, '/bar///'), `${w}foo\\bar\\`);
          assert.equal(win32.join(`${v}foo`, '\\bar', '\\\\\\'), `${w}foo\\bar\\`);
          assert.equal(win32.join(`${v}foo`, '/bar', '///'), `${w}foo\\bar\\`);
          assert.equal(win32.join(`${v}foo`, '\\bar'), `${w}foo\\bar`);
          assert.equal(win32.join(`${v}foo`, '/bar'), `${w}foo\\bar`);
          assert.equal(win32.join(`${v}foo`, '\\bar', 'baz', '..'), `${w}foo\\bar`);
          assert.equal(win32.join(`${v}foo`, '/bar', 'baz', '..'), `${w}foo\\bar`);

          assert.equal(win32.join(`${v}..`, 'foo', '..', '\\bar\\\\\\'), `${w}..\\bar\\`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '/bar///'), `${w}..\\bar\\`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '\\bar', '\\\\\\'), `${w}..\\bar\\`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '/bar', '///'), `${w}..\\bar\\`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '\\bar'), `${w}..\\bar`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '/bar'), `${w}..\\bar`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '\\bar', 'baz', '..'), `${w}..\\bar`);
          assert.equal(win32.join(`${v}..`, 'foo', '..', '/bar', 'baz', '..'), `${w}..\\bar`);
        });
      });
    });

    describe('.parse()', () => {
      it('should throw TypeError', () => {
        assert.throws(() => win32.parse(true), TypeError);
        assert.throws(() => win32.parse(0), TypeError);
        assert.throws(() => win32.parse({}), TypeError);
      });

      it('should return an object of an absolute path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          [
            {
              path: `${v}\\foo\\bar\\\\\\\\`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo`,
                base: 'bar',
                name: 'bar',
                ext: '',
              },
            },
            {
              path: `${v}\\foo\\bar`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo`,
                base: 'bar',
                name: 'bar',
                ext: '',
              },
            },

            {
              path: `${v}\\foo\\bar\\index.js`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo\\bar`,
                base: 'index.js',
                name: 'index',
                ext: '.js',
              },
            },
            {
              path: `${v}\\foo\\bar\\index.js.md`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo\\bar`,
                base: 'index.js.md',
                name: 'index.js',
                ext: '.md',
              },
            },
            {
              path: `${v}\\foo\\bar\\index.`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo\\bar`,
                base: 'index.',
                name: 'index.',
                ext: '',
              },
            },
            {
              path: `${v}\\foo\\bar\\index`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo\\bar`,
                base: 'index',
                name: 'index',
                ext: '',
              },
            },
            {
              path: `${v}\\foo\\bar\\.index`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\foo\\bar`,
                base: '.index',
                name: '.index',
                ext: '',
              },
            },

            {
              path: `${v}\\`,
              obj: {
                root: `${v}\\`,
                dir: `${v}\\`,
                base: '',
                name: '',
                ext: '',
              },
            },
          ].forEach((tt) => {
            assert.deepEqual(win32.parse(tt.path), tt.obj);

            const obj = Object.assign({}, tt.obj);
            obj.root = obj.root.replace(/\\/g, '/');
            obj.dir = obj.dir.replace(/\\/g, '/');
            assert.deepEqual(win32.parse(tt.path.replace(/\\/g, '/')), obj);
          });
        });
      });

      it('should return an object of an relative path', () => {
        [
          {
            path: 'foo.js',
            obj: {
              root: '',
              dir: '',
              base: 'foo.js',
              name: 'foo',
              ext: '.js',
            },
          },
          {
            path: '.\\foo.js',
            obj: {
              root: '',
              dir: '.',
              base: 'foo.js',
              name: 'foo',
              ext: '.js',
            },
          },
          {
            path: '..\\foo.js',
            obj: {
              root: '',
              dir: '..',
              base: 'foo.js',
              name: 'foo',
              ext: '.js',
            },
          },

          {
            path: '..\\index.js',
            obj: {
              root: '',
              dir: '..',
              base: 'index.js',
              name: 'index',
              ext: '.js',
            },
          },
          {
            path: '..\\index.js.md',
            obj: {
              root: '',
              dir: '..',
              base: 'index.js.md',
              name: 'index.js',
              ext: '.md',
            },
          },
          {
            path: '..\\index.',
            obj: {
              root: '',
              dir: '..',
              base: 'index.',
              name: 'index.',
              ext: '',
            },
          },
          {
            path: '..\\index',
            obj: {
              root: '',
              dir: '..',
              base: 'index',
              name: 'index',
              ext: '',
            },
          },
          {
            path: '..\\.index',
            obj: {
              root: '',
              dir: '..',
              base: '.index',
              name: '.index',
              ext: '',
            },
          },

          {
            path: '',
            obj: {
              root: '',
              dir: '',
              base: '',
              name: '',
              ext: '',
            },
          },
          {
            path: '.',
            obj: {
              root: '',
              dir: '',
              base: '.',
              name: '.',
              ext: '',
            },
          },
          {
            path: '..',
            obj: {
              root: '',
              dir: '',
              base: '..',
              name: '..',
              ext: '',
            },
          },
        ].forEach((tt) => {
          assert.deepEqual(win32.parse(tt.path), tt.obj);

          const obj = Object.assign({}, tt.obj);
          obj.root = obj.root.replace(/\\/g, '/');
          obj.dir = obj.dir.replace(/\\/g, '/');
          assert.deepEqual(win32.parse(tt.path.replace(/\\/g, '/')), obj);
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
