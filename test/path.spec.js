//
// otto.module :: path.spec.js
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

const path = require('../lib/path');

describe('path', () => {
  describe('.posix', () => {
    const { posix } = path;

    describe('.basename()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.basename(true)).toThrow(TypeError);
        expect(() => posix.basename(0)).toThrow(TypeError);
        expect(() => posix.basename({})).toThrow(TypeError);
        expect(() => posix.basename('', true)).toThrow(TypeError);
        expect(() => posix.basename('', 0)).toThrow(TypeError);
        expect(() => posix.basename('', {})).toThrow(TypeError);
      });

      it('should return the last portion of a path', () => {
        expect(posix.basename('/foo/bar///')).toBe('bar');
        expect(posix.basename('/foo/bar.html')).toBe('bar.html');
        expect(posix.basename('/foo/bar.html', '.html')).toBe('bar');

        expect(posix.basename('/')).toBe('');

        expect(posix.basename('')).toBe('');
        expect(posix.basename('.')).toBe('');
        expect(posix.basename('..')).toBe('');
      });
    });

    describe('.delimiter', () => {
      it('is ":"', () => {
        expect(posix.delimiter).toBe(':');
      });
    });

    describe('.dirname()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.dirname(true)).toThrow(TypeError);
        expect(() => posix.dirname(0)).toThrow(TypeError);
        expect(() => posix.dirname({})).toThrow(TypeError);
      });

      it('should return the directory name of a path', () => {
        expect(posix.dirname('/foo/bar///')).toBe('/foo');
        expect(posix.dirname('/foo/bar')).toBe('/foo');

        expect(posix.dirname('/')).toBe('/');

        expect(posix.dirname('foo/bar///')).toBe('foo');
        expect(posix.dirname('foo/bar')).toBe('foo');

        expect(posix.dirname('foo')).toBe('.');

        expect(posix.dirname('')).toBe('.');
        expect(posix.dirname('.')).toBe('.');
        expect(posix.dirname('..')).toBe('.');
      });
    });

    describe('.extname()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.extname(true)).toThrow(TypeError);
        expect(() => posix.extname(0)).toThrow(TypeError);
        expect(() => posix.extname({})).toThrow(TypeError);
      });

      it('should return the extension of a path', () => {
        expect(posix.extname('index.js')).toBe('.js');
        expect(posix.extname('index.js.md')).toBe('.md');
        expect(posix.extname('index.')).toBe('.');
        expect(posix.extname('index')).toBe('');
        expect(posix.extname('.index')).toBe('');

        expect(posix.extname('/foo/bar/.index')).toBe('');
      });
    });

    describe('.format()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.format(null)).toThrow(TypeError);
        expect(() => posix.format(undefined)).toThrow(TypeError);
        expect(() => posix.format(true)).toThrow(TypeError);
        expect(() => posix.format(0)).toThrow(TypeError);
      });

      it('should return a path from an object', () => {
        expect(posix.format({
        })).toBe('');
        expect(posix.format({
          root: '/',
        })).toBe('/');
        expect(posix.format({
          root: '/',
          dir: '/',
        })).toBe('/');
        expect(posix.format({
          root: '/',
          dir: '/foo',
          base: 'bar.html',
        })).toBe('/foo/bar.html');
        expect(posix.format({
          root: '/',
          dir: '/foo',
          name: 'bar',
          ext: '.html',
        })).toBe('/foo/bar.html');
      });
    });

    describe('.isAbsolute()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.isAbsolute(true)).toThrow(TypeError);
        expect(() => posix.isAbsolute(0)).toThrow(TypeError);
        expect(() => posix.isAbsolute({})).toThrow(TypeError);
      });

      it('should return true', () => {
        expect(posix.isAbsolute('/')).toBe(true);
      });

      it('should return false', () => {
        expect(posix.isAbsolute('')).toBe(false);
        expect(posix.isAbsolute('.')).toBe(false);
        expect(posix.isAbsolute('..')).toBe(false);
      });
    });

    describe('.join()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.join(true)).toThrow(TypeError);
        expect(() => posix.join(0)).toThrow(TypeError);
        expect(() => posix.join({})).toThrow(TypeError);
      });

      it('should return "."', () => {
        expect(posix.join('')).toBe('.');
        expect(posix.join('', '')).toBe('.');
      });

      it('should return an absolute path', () => {
        expect(posix.join('/foo', '/bar///')).toBe('/foo/bar/');
        expect(posix.join('/foo', '/bar', '///')).toBe('/foo/bar/');
        expect(posix.join('/foo', '/bar')).toBe('/foo/bar');
        expect(posix.join('/foo', '/bar', 'baz', '..')).toBe('/foo/bar');

        expect(posix.join('/foo', 'bar///')).toBe('/foo/bar/');
        expect(posix.join('/foo', 'bar', '///')).toBe('/foo/bar/');
        expect(posix.join('/foo', 'bar')).toBe('/foo/bar');
        expect(posix.join('/foo', 'bar', 'baz', '..')).toBe('/foo/bar');
      });

      it('should return a relative path', () => {
        expect(posix.join('foo', '/bar///')).toBe('foo/bar/');
        expect(posix.join('foo', '/bar', '///')).toBe('foo/bar/');
        expect(posix.join('foo', '/bar')).toBe('foo/bar');
        expect(posix.join('foo', '/bar', 'baz', '..')).toBe('foo/bar');

        expect(posix.join('..', 'foo', '..', '/bar///')).toBe('../bar/');
        expect(posix.join('..', 'foo', '..', '/bar', '///')).toBe('../bar/');
        expect(posix.join('..', 'foo', '..', '/bar')).toBe('../bar');
        expect(posix.join('..', 'foo', '..', '/bar', 'baz', '..')).toBe('../bar');
      });
    });

    describe('.normalize()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.parse(true)).toThrow(TypeError);
        expect(() => posix.parse(0)).toThrow(TypeError);
        expect(() => posix.parse({})).toThrow(TypeError);
      });

      it('should return "."', () => {
        expect(posix.normalize('')).toBe('.');
        expect(posix.normalize('./')).toBe('./');
        expect(posix.normalize('.')).toBe('.');
      });

      it('should return an absolute path', () => {
        expect(posix.normalize('/foo/./bar/..///')).toBe('/foo/');
        expect(posix.normalize('/foo/./bar/..')).toBe('/foo');
        expect(posix.normalize('/foo/./bar/.././../..')).toBe('/');

        expect(posix.normalize('/foo/.././../.bar')).toBe('/.bar');
        expect(posix.normalize('/foo/.././../..bar')).toBe('/..bar');
        expect(posix.normalize('/foo/.././../bar.')).toBe('/bar.');
        expect(posix.normalize('/foo/.././../bar..')).toBe('/bar..');
      });

      it('should return a relative path', () => {
        expect(posix.normalize('foo/./bar///')).toBe('foo/bar/');
        expect(posix.normalize('foo/./bar')).toBe('foo/bar');

        expect(posix.normalize('foo/./.bar')).toBe('foo/.bar');
        expect(posix.normalize('foo/./..bar')).toBe('foo/..bar');
        expect(posix.normalize('foo/./bar.')).toBe('foo/bar.');
        expect(posix.normalize('foo/./bar..')).toBe('foo/bar..');

        expect(posix.normalize('./.././../foo/./.././/bar///')).toBe('../../bar/');
        expect(posix.normalize('./.././../foo/./.././bar')).toBe('../../bar');

        expect(posix.normalize('./../foo/.././.bar')).toBe('../.bar');
        expect(posix.normalize('./../foo/.././..bar')).toBe('../..bar');
        expect(posix.normalize('./../foo/.././bar.')).toBe('../bar.');
        expect(posix.normalize('./../foo/.././bar..')).toBe('../bar..');
      });
    });

    describe('.parse()', () => {
      it('should throw TypeError', () => {
        expect(() => posix.parse(true)).toThrow(TypeError);
        expect(() => posix.parse(0)).toThrow(TypeError);
        expect(() => posix.parse({})).toThrow(TypeError);
      });

      it('should return an object of an absolute path', () => {
        expect(posix.parse('/foo/bar///')).toEqual({
          root: '/',
          dir: '/foo',
          base: 'bar',
          name: 'bar',
          ext: '',
        });
        expect(posix.parse('/foo/bar')).toEqual({
          root: '/',
          dir: '/foo',
          base: 'bar',
          name: 'bar',
          ext: '',
        });

        expect(posix.parse('/foo/bar/index.js')).toEqual({
          root: '/',
          dir: '/foo/bar',
          base: 'index.js',
          name: 'index',
          ext: '.js',
        });
        expect(posix.parse('/foo/bar/index.js.md')).toEqual({
          root: '/',
          dir: '/foo/bar',
          base: 'index.js.md',
          name: 'index.js',
          ext: '.md',
        });
        expect(posix.parse('/foo/bar/index.')).toEqual({
          root: '/',
          dir: '/foo/bar',
          base: 'index.',
          name: 'index.',
          ext: '',
        });
        expect(posix.parse('/foo/bar/index')).toEqual({
          root: '/',
          dir: '/foo/bar',
          base: 'index',
          name: 'index',
          ext: '',
        });
        expect(posix.parse('/foo/bar/.index')).toEqual({
          root: '/',
          dir: '/foo/bar',
          base: '.index',
          name: '.index',
          ext: '',
        });

        expect(posix.parse('/')).toEqual({
          root: '/',
          dir: '/',
          base: '',
          name: '',
          ext: '',
        });
      });

      it('should return an object of a relative path', () => {
        expect(posix.parse('foo.js')).toEqual({
          root: '',
          dir: '',
          base: 'foo.js',
          name: 'foo',
          ext: '.js',
        });
        expect(posix.parse('./foo.js')).toEqual({
          root: '',
          dir: '.',
          base: 'foo.js',
          name: 'foo',
          ext: '.js',
        });
        expect(posix.parse('../foo.js')).toEqual({
          root: '',
          dir: '..',
          base: 'foo.js',
          name: 'foo',
          ext: '.js',
        });

        expect(posix.parse('../index.js')).toEqual({
          root: '',
          dir: '..',
          base: 'index.js',
          name: 'index',
          ext: '.js',
        });
        expect(posix.parse('../index.js.md')).toEqual({
          root: '',
          dir: '..',
          base: 'index.js.md',
          name: 'index.js',
          ext: '.md',
        });
        expect(posix.parse('../index.')).toEqual({
          root: '',
          dir: '..',
          base: 'index.',
          name: 'index.',
          ext: '',
        });
        expect(posix.parse('../index')).toEqual({
          root: '',
          dir: '..',
          base: 'index',
          name: 'index',
          ext: '',
        });
        expect(posix.parse('../.index')).toEqual({
          root: '',
          dir: '..',
          base: '.index',
          name: '.index',
          ext: '',
        });

        expect(posix.parse('')).toEqual({
          root: '',
          dir: '',
          base: '',
          name: '',
          ext: '',
        });
        expect(posix.parse('.')).toEqual({
          root: '',
          dir: '',
          base: '.',
          name: '.',
          ext: '',
        });
        expect(posix.parse('..')).toEqual({
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
        expect(posix.posix).toBe(path.posix);
      });
    });

    describe('.sep', () => {
      it('is "/"', () => {
        expect(posix.sep).toBe('/');
      });
    });

    describe('.win32', () => {
      it('is path.win32', () => {
        expect(posix.win32).toBe(path.win32);
      });
    });
  });

  describe('.win32', () => {
    const { win32 } = path;

    describe('.basename()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.basename(true)).toThrow(TypeError);
        expect(() => win32.basename(0)).toThrow(TypeError);
        expect(() => win32.basename({})).toThrow(TypeError);
        expect(() => win32.basename('').toThrow(true)).toThrow(TypeError);
        expect(() => win32.basename('').toThrow(0)).toThrow(TypeError);
        expect(() => win32.basename('').toThrow({})).toThrow(TypeError);
      });

      it('should return the last portion of a path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          expect(win32.basename(`${v}\\foo\\bar\\\\\\`)).toBe('bar');
          expect(win32.basename(`${v}/foo/bar///`)).toBe('bar');
          expect(win32.basename(`${v}\\foo\\bar.html`)).toBe('bar.html');
          expect(win32.basename(`${v}/foo/bar.html`)).toBe('bar.html');
          expect(win32.basename(`${v}\\foo\\bar.html`, '.html')).toBe('bar');
          expect(win32.basename(`${v}/foo/bar.html`, '.html')).toBe('bar');

          expect(win32.basename(`${v}\\`)).toBe('');
          expect(win32.basename(`${v}/`)).toBe('');

          expect(win32.basename(`${v}`)).toBe('');
        });

        expect(win32.basename('')).toBe('');
        expect(win32.basename('.')).toBe('');
        expect(win32.basename('..')).toBe('');
      });
    });

    describe('.delimiter', () => {
      it('is ";"', () => {
        expect(win32.delimiter).toBe(';');
      });
    });

    describe('.dirname()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.dirname(true)).toThrow(TypeError);
        expect(() => win32.dirname(0)).toThrow(TypeError);
        expect(() => win32.dirname({})).toThrow(TypeError);
      });

      it('should return the directory name of a path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          expect(win32.dirname(`${v}\\foo\\bar\\\\\\`)).toBe(`${v}\\foo`);
          expect(win32.dirname(`${v}/foo/bar///`)).toBe(`${v}/foo`);
          expect(win32.dirname(`${v}\\foo\\bar`)).toBe(`${v}\\foo`);
          expect(win32.dirname(`${v}/foo/bar`)).toBe(`${v}/foo`);

          expect(win32.dirname(`${v}\\`)).toBe(`${v}\\`);
          expect(win32.dirname(`${v}/`)).toBe(`${v}/`);

          expect(win32.dirname(v)).toBe(v || '.');
        });

        expect(win32.dirname('foo\\bar\\\\\\')).toBe('foo');
        expect(win32.dirname('foo/bar///')).toBe('foo');
        expect(win32.dirname('foo\\bar')).toBe('foo');
        expect(win32.dirname('foo/bar')).toBe('foo');

        expect(win32.dirname('foo')).toBe('.');

        expect(win32.dirname('')).toBe('.');
        expect(win32.dirname('.')).toBe('.');
        expect(win32.dirname('..')).toBe('.');
      });
    });

    describe('.extname()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.extname(true)).toThrow(TypeError);
        expect(() => win32.extname(0)).toThrow(TypeError);
        expect(() => win32.extname({})).toThrow(TypeError);
      });

      it('should return the extension of a path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          expect(win32.extname(`${v}\\index.js`)).toBe('.js');
          expect(win32.extname(`${v}\\index.js.md`)).toBe('.md');
          expect(win32.extname(`${v}\\index.`)).toBe('.');
          expect(win32.extname(`${v}\\index`)).toBe('');
          expect(win32.extname(`${v}\\.index`)).toBe('');
        });
      });
    });

    describe('.format()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.format(null)).toThrow(TypeError);
        expect(() => win32.format(undefined)).toThrow(TypeError);
        expect(() => win32.format(true)).toThrow(TypeError);
        expect(() => win32.format(0)).toThrow(TypeError);
      });

      it('should return a path from an object', () => {
        expect(win32.format({
        })).toBe('');
        expect(win32.format({
          root: '\\',
        })).toBe('\\');
        expect(win32.format({
          root: '/',
        })).toBe('/');
        expect(win32.format({
          root: '\\',
          dir: '\\',
        })).toBe('\\');
        expect(win32.format({
          root: '/',
          dir: '/',
        })).toBe('/');
        expect(win32.format({
          root: '\\',
          dir: '\\foo',
          base: 'bar.html',
        })).toBe('\\foo\\bar.html');
        expect(win32.format({
          root: '/',
          dir: '/foo',
          base: 'bar.html',
        })).toBe('/foo\\bar.html');
        expect(win32.format({
          root: '\\',
          dir: '\\foo',
          name: 'bar',
          ext: '.html',
        })).toBe('\\foo\\bar.html');
        expect(win32.format({
          root: '/',
          dir: '/foo',
          name: 'bar',
          ext: '.html',
        })).toBe('/foo\\bar.html');
      });
    });

    describe('.isAbsolute()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.isAbsolute(true)).toThrow(TypeError);
        expect(() => win32.isAbsolute(0)).toThrow(TypeError);
        expect(() => win32.isAbsolute({})).toThrow(TypeError);
      });

      it('should return true', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share', '\\\\UNC', '//UNC'].forEach((v) => {
          expect(win32.isAbsolute(`${v}\\`)).toBe(true);
          expect(win32.isAbsolute(`${v}/`)).toBe(true);
        });
      });

      it('should return false', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          expect(win32.isAbsolute(`${v}`)).toBe(false);
          expect(win32.isAbsolute(`${v}.`)).toBe(false);
          expect(win32.isAbsolute(`${v}..`)).toBe(false);
        });
      });
    });

    describe('.normalize()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.normalize(true)).toThrow(TypeError);
        expect(() => win32.normalize(0)).toThrow(TypeError);
        expect(() => win32.normalize({})).toThrow(TypeError);
      });

      it('should return "."', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          expect(win32.normalize(`${v}`)).toBe(`${v}.`);
          expect(win32.normalize(`${v}.\\`)).toBe(`${v}.\\`);
          expect(win32.normalize(`${v}./`)).toBe(`${v}.\\`);
          expect(win32.normalize(`${v}.`)).toBe(`${v}.`);
        });
      });

      it('should return an absolute path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          const w = v.replace(/\//g, '\\');
          expect(win32.normalize(`${v}\\foo\\.\\bar\\..\\\\\\`)).toBe(`${w}\\foo\\`);
          expect(win32.normalize(`${v}/foo/./bar/..///`)).toBe(`${w}\\foo\\`);
          expect(win32.normalize(`${v}\\foo\\.\\bar\\..`)).toBe(`${w}\\foo`);
          expect(win32.normalize(`${v}/foo/./bar/..`)).toBe(`${w}\\foo`);
          expect(win32.normalize(`${v}\\foo\\.\\bar\\..\\.\\..\\..`)).toBe(`${w}\\`);
          expect(win32.normalize(`${v}/foo/./bar/.././../..`)).toBe(`${w}\\`);

          expect(win32.normalize(`${v}\\foo\\..\\.\\..\\.bar`)).toBe(`${w}\\.bar`);
          expect(win32.normalize(`${v}/foo/.././../.bar`)).toBe(`${w}\\.bar`);
          expect(win32.normalize(`${v}\\foo\\..\\.\\..\\..bar`)).toBe(`${w}\\..bar`);
          expect(win32.normalize(`${v}/foo/.././../..bar`)).toBe(`${w}\\..bar`);
          expect(win32.normalize(`${v}\\foo\\..\\.\\..\\bar.`)).toBe(`${w}\\bar.`);
          expect(win32.normalize(`${v}/foo/.././../bar.`)).toBe(`${w}\\bar.`);
          expect(win32.normalize(`${v}\\foo\\..\\.\\..\\bar..`)).toBe(`${w}\\bar..`);
          expect(win32.normalize(`${v}/foo/.././../bar..`)).toBe(`${w}\\bar..`);
        });

        expect(win32.normalize('\\\\UNC\\share')).toBe('\\\\UNC\\share\\');
        expect(win32.normalize('//UNC/share')).toBe('\\\\UNC\\share\\');
      });

      it('should return a relative path', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          expect(win32.normalize(`${v}foo\\.\\bar\\\\\\`)).toBe(`${v}foo\\bar\\`);
          expect(win32.normalize(`${v}foo/./bar///`)).toBe(`${v}foo\\bar\\`);
          expect(win32.normalize(`${v}foo\\.\\bar`)).toBe(`${v}foo\\bar`);
          expect(win32.normalize(`${v}foo/./bar`)).toBe(`${v}foo\\bar`);

          expect(win32.normalize(`${v}foo\\.\\.bar`)).toBe(`${v}foo\\.bar`);
          expect(win32.normalize(`${v}foo/./.bar`)).toBe(`${v}foo\\.bar`);
          expect(win32.normalize(`${v}foo\\.\\..bar`)).toBe(`${v}foo\\..bar`);
          expect(win32.normalize(`${v}foo/./..bar`)).toBe(`${v}foo\\..bar`);
          expect(win32.normalize(`${v}foo\\.\\bar.`)).toBe(`${v}foo\\bar.`);
          expect(win32.normalize(`${v}foo/./bar.`)).toBe(`${v}foo\\bar.`);
          expect(win32.normalize(`${v}foo\\.\\bar..`)).toBe(`${v}foo\\bar..`);
          expect(win32.normalize(`${v}foo/./bar..`)).toBe(`${v}foo\\bar..`);

          expect(win32.normalize(`${v}.\\..\\.\\..\\foo\\.\\..\\.\\\\bar\\\\\\`)).toBe(`${v}..\\..\\bar\\`);
          expect(win32.normalize(`${v}./.././../foo/./.././/bar///`)).toBe(`${v}..\\..\\bar\\`);
          expect(win32.normalize(`${v}.\\..\\.\\..\\foo\\.\\..\\.\\bar`)).toBe(`${v}..\\..\\bar`);
          expect(win32.normalize(`${v}./.././../foo/./.././bar`)).toBe(`${v}..\\..\\bar`);

          expect(win32.normalize(`${v}.\\..\\foo\\..\\.\\.bar`)).toBe(`${v}..\\.bar`);
          expect(win32.normalize(`${v}./../foo/.././.bar`)).toBe(`${v}..\\.bar`);
          expect(win32.normalize(`${v}.\\..\\foo\\..\\.\\..bar`)).toBe(`${v}..\\..bar`);
          expect(win32.normalize(`${v}./../foo/.././..bar`)).toBe(`${v}..\\..bar`);
          expect(win32.normalize(`${v}.\\..\\foo\\..\\.\\bar.`)).toBe(`${v}..\\bar.`);
          expect(win32.normalize(`${v}./../foo/.././bar.`)).toBe(`${v}..\\bar.`);
          expect(win32.normalize(`${v}.\\..\\foo\\..\\.\\bar..`)).toBe(`${v}..\\bar..`);
          expect(win32.normalize(`${v}./../foo/.././bar..`)).toBe(`${v}..\\bar..`);
        });
      });
    });

    describe('.join()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.join(true)).toThrow(TypeError);
        expect(() => win32.join(0)).toThrow(TypeError);
        expect(() => win32.join({})).toThrow(TypeError);
      });

      it('should return "."', () => {
        expect(win32.join('')).toBe('.');
        expect(win32.join('', '')).toBe('.');
      });

      it('should return an absolute path', () => {
        ['', 'C:', 'c:', '\\\\UNC\\share', '//UNC/share'].forEach((v) => {
          const w = v.replace(/\//g, '\\');
          expect(win32.join(v, '\\foo', '\\bar\\\\\\')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '/foo', '/bar///')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '\\foo', '\\bar', '\\\\\\')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '/foo', '/bar', '///')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '\\foo', '\\bar')).toBe(`${w}\\foo\\bar`);
          expect(win32.join(v, '/foo', '/bar')).toBe(`${w}\\foo\\bar`);
          expect(win32.join(v, '\\foo', '\\bar', 'baz', '..')).toBe(`${w}\\foo\\bar`);
          expect(win32.join(v, '/foo', '/bar', 'baz', '..')).toBe(`${w}\\foo\\bar`);

          expect(win32.join(v, '\\foo', 'bar\\\\\\')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '/foo', 'bar///')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '\\foo', 'bar', '///')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '/foo', 'bar', '///')).toBe(`${w}\\foo\\bar\\`);
          expect(win32.join(v, '\\foo', 'bar')).toBe(`${w}\\foo\\bar`);
          expect(win32.join(v, '/foo', 'bar')).toBe(`${w}\\foo\\bar`);
          expect(win32.join(v, '\\foo', 'bar', 'baz', '..')).toBe(`${w}\\foo\\bar`);
          expect(win32.join(v, '/foo', 'bar', 'baz', '..')).toBe(`${w}\\foo\\bar`);
        });
      });

      it('should return a relative path', () => {
        ['', 'C:', 'c:'].forEach((v) => {
          const w = v.replace(/\//g, '\\');
          expect(win32.join(`${v}foo`, '\\bar\\\\\\')).toBe(`${w}foo\\bar\\`);
          expect(win32.join(`${v}foo`, '/bar///')).toBe(`${w}foo\\bar\\`);
          expect(win32.join(`${v}foo`, '\\bar', '\\\\\\')).toBe(`${w}foo\\bar\\`);
          expect(win32.join(`${v}foo`, '/bar', '///')).toBe(`${w}foo\\bar\\`);
          expect(win32.join(`${v}foo`, '\\bar')).toBe(`${w}foo\\bar`);
          expect(win32.join(`${v}foo`, '/bar')).toBe(`${w}foo\\bar`);
          expect(win32.join(`${v}foo`, '\\bar', 'baz', '..')).toBe(`${w}foo\\bar`);
          expect(win32.join(`${v}foo`, '/bar', 'baz', '..')).toBe(`${w}foo\\bar`);

          expect(win32.join(`${v}..`, 'foo', '..', '\\bar\\\\\\')).toBe(`${w}..\\bar\\`);
          expect(win32.join(`${v}..`, 'foo', '..', '/bar///')).toBe(`${w}..\\bar\\`);
          expect(win32.join(`${v}..`, 'foo', '..', '\\bar', '\\\\\\')).toBe(`${w}..\\bar\\`);
          expect(win32.join(`${v}..`, 'foo', '..', '/bar', '///')).toBe(`${w}..\\bar\\`);
          expect(win32.join(`${v}..`, 'foo', '..', '\\bar')).toBe(`${w}..\\bar`);
          expect(win32.join(`${v}..`, 'foo', '..', '/bar')).toBe(`${w}..\\bar`);
          expect(win32.join(`${v}..`, 'foo', '..', '\\bar', 'baz', '..')).toBe(`${w}..\\bar`);
          expect(win32.join(`${v}..`, 'foo', '..', '/bar', 'baz', '..')).toBe(`${w}..\\bar`);
        });
      });
    });

    describe('.parse()', () => {
      it('should throw TypeError', () => {
        expect(() => win32.parse(true)).toThrow(TypeError);
        expect(() => win32.parse(0)).toThrow(TypeError);
        expect(() => win32.parse({})).toThrow(TypeError);
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
            expect(win32.parse(tt.path)).toEqual(tt.obj);

            const obj = { ...tt.obj };
            obj.root = obj.root.replace(/\\/g, '/');
            obj.dir = obj.dir.replace(/\\/g, '/');
            expect(win32.parse(tt.path.replace(/\\/g, '/'))).toEqual(obj);
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
          expect(win32.parse(tt.path)).toEqual(tt.obj);

          const obj = { ...tt.obj };
          obj.root = obj.root.replace(/\\/g, '/');
          obj.dir = obj.dir.replace(/\\/g, '/');
          expect(win32.parse(tt.path.replace(/\\/g, '/'))).toEqual(obj);
        });
      });
    });

    describe('.posix', () => {
      it('is path.posix', () => {
        expect(win32.posix).toBe(path.posix);
      });
    });

    describe('.sep', () => {
      it('is "\\"', () => {
        expect(win32.sep).toBe('\\');
      });
    });

    describe('.win32', () => {
      it('is path.win32', () => {
        expect(win32.win32).toBe(path.win32);
      });
    });
  });
});
