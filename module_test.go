//
// otto.module :: module_test.go
//
//   Copyright (c) 2017-2018 Akinori Hattori <hattya@gmail.com>
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

package module_test

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hattya/otto.module"
	"github.com/robertkrimen/otto"
)

var bootstrapErrorTests = []struct {
	src []byte
}{
	// compile error
	{[]byte(`++;`)},
	{[]byte(`_;`)},
	// eval error
	{[]byte(`(function() { _; });`)},
}

func TestBootstrapError(t *testing.T) {
	id := "internal/bootstrap.js"

	// load error
	delete(module.Files, id)
	if _, err := module.New(); err == nil {
		t.Error("expected error")
	}
	restore()

	for _, tt := range bootstrapErrorTests {
		module.Files[id] = tt.src
		if _, err := module.New(); err == nil {
			t.Error("expected error")
		}
		restore()
	}
}

var requireTests = []struct {
	id      string
	imports []string
}{
	{
		id:      "./testdata/file01",
		imports: []string{"file01.js"},
	},
	{
		id: "./testdata/file02",
		imports: []string{
			"file01.js",
			"file02.js",
		},
	},
	{
		id:      "./testdata/file03",
		imports: []string{"file03.json"},
	},
	{
		id: "./testdata/file04",
		imports: []string{
			"file01.js",
			"file02.js",
			"file03.json",
			"file04.js",
		},
	},
	{
		id: "./testdata/file05",
		imports: []string{
			"node_modules/file01.js",
			"node_modules/folder01/index.js",
			"file05.js",
		},
	},
	{
		id:      "./testdata/folder01",
		imports: []string{"folder01/lib/file.js"},
	},
	{
		id:      "./testdata/folder02",
		imports: []string{"folder02/lib/index.js"},
	},
	{
		id:      "./testdata/folder03",
		imports: []string{"folder03/index.js"},
	},
	{
		id:      "./testdata/folder04",
		imports: []string{"folder04/index.js"},
	},
	{
		id:      "./testdata/folder05",
		imports: []string{"folder05/lib/file.json"},
	},
	{
		id:      "./testdata/folder06",
		imports: []string{"folder06/lib/index.json"},
	},
	{
		id:      "./testdata/folder07",
		imports: []string{"folder07/index.json"},
	},
	{
		id:      "./testdata/folder08",
		imports: []string{"folder08/index.json"},
	},
	{
		id: "./testdata/folder09",
		imports: []string{
			"file01.js",
			"file02.js",
			"file03.json",
			"file04.js",
			"folder01/lib/file.js",
			"folder02/lib/index.js",
			"folder03/index.js",
			"folder04/index.js",
			"folder05/lib/file.json",
			"folder06/lib/index.json",
			"folder07/index.json",
			"folder08/index.json",
			"folder09/lib/file.js",
		},
	},
	{
		id: "./testdata/folder10",
		imports: []string{
			"node_modules/file01.js",
			"node_modules/folder01/index.js",
			"folder10/index.js",
		},
	},
}

func TestRequire(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	file := new(module.FileLoader)
	folder := &module.FolderLoader{File: file}
	vm.Register(file)
	vm.Register(folder)
	vm.Register(&module.NodeModulesLoader{
		File:   file,
		Folder: folder,
	})
	tmpl := `
		var imports = require(%q);
		if (imports.join() !== %q) throw new Error(imports);
	`

	for _, tt := range requireTests {
		src := fmt.Sprintf(tmpl, tt.id, strings.Join(tt.imports, ","))
		if _, err := vm.Run(src); err != nil {
			t.Errorf("require(%q) = %v", tt.id, err)
		}
	}
}

var requireFileTests = []struct {
	id, err string
}{
	{"./testdata/file01.js", ""},
	{"./testdata/file01", ""},
	{"./testdata/file02.js", ""},
	{"./testdata/file02", ""},

	{"./testdata/file03.json", ""},
	{"./testdata/file03", ""},
	// syntax error
	{"./testdata/error01.js", "SyntaxError"},
	{"./testdata/error01", ""},
	// require error
	{"./testdata/error02.js", "Error"},
	{"./testdata/error02", ""},
	// invalid JSON
	{"./testdata/error03.json", "SyntaxError"},
	{"./testdata/error03", ""},
	// only prefix
	{"/", "Error"},
	{"./", "Error"},
	{"../", "Error"},
	// empty
	{"", "Error"},
	// nonexistent
	{"/_", "Error"},
	{"./_", "Error"},
	{"../_", "Error"},
	// folder
	{"./testdata/folder01", "Error"},
	// node_modules
	{"file01", "Error"},
	{"folder01", "Error"},
}

func TestRequireFile(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	vm.Register(new(module.FileLoader))

	for _, tt := range requireFileTests {
		src := fmt.Sprintf(`require(%q);`, tt.id)
		switch _, err := vm.Run(src); {
		case err != nil:
			if tt.err == "" || !strings.HasPrefix(err.Error(), tt.err) {
				t.Error(module.Wrap(err))
			}
		case tt.err != "":
			t.Errorf("%v: expected error", strings.Trim(src, ";"))
		}
	}
}

var requireFolderTests = []struct {
	id, err string
}{
	{"./testdata/folder01", ""},
	{"./testdata/folder02", ""},
	{"./testdata/folder03", ""},
	{"./testdata/folder04", ""},

	{"./testdata/folder05", ""},
	{"./testdata/folder06", ""},
	{"./testdata/folder07", ""},
	{"./testdata/folder08", ""},
	// invalid package.json
	{"./testdata/error04", "SyntaxError"},
	// syntax error
	{"./testdata/error05", "SyntaxError"},
	// require error
	{"./testdata/error06", "Error"},
	// invalid JSON
	{"./testdata/error07", "SyntaxError"},
	// empty
	{"", "Error"},
	// nonexistent
	{"/_", "Error"},
	{"./_", "Error"},
	{"../_", "Error"},
	// file
	{"./testdata/file01", "Error"},
	// node_modules
	{"file01", "Error"},
	{"folder01", "Error"},
}

func TestRequireFolder(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	vm.Register(&module.FolderLoader{File: new(module.FileLoader)})

	for _, tt := range requireFolderTests {
		src := fmt.Sprintf(`require(%q);`, tt.id)
		switch _, err := vm.Run(src); {
		case err != nil:
			if tt.err == "" || !strings.HasPrefix(err.Error(), tt.err) {
				t.Error(module.Wrap(err))
			}
		case tt.err != "":
			t.Errorf("%v: expected error", strings.Trim(src, ";"))
		}
	}
}

var requireNodeModulesTests = []struct {
	id, err string
}{
	{"file01", ""},

	{"folder01", ""},
	// nonexistent
	{"_", "Error"},
	// file
	{"./file01", "Error"},
	// folder
	{"./folder01", "Error"},
}

func TestRequireNodeModules(t *testing.T) {
	popd, err := pushd("testdata")
	if err != nil {
		t.Fatal(err)
	}
	defer popd()

	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	file := new(module.FileLoader)
	vm.Register(&module.NodeModulesLoader{
		File: file,
		Folder: &module.FolderLoader{
			File: file,
		},
	})

	for _, tt := range requireNodeModulesTests {
		src := fmt.Sprintf(`require(%q);`, tt.id)
		switch _, err := vm.Run(src); {
		case err != nil:
			if tt.err == "" || !strings.HasPrefix(err.Error(), tt.err) {
				t.Error(module.Wrap(err))
			}
		case tt.err != "":
			t.Errorf("%v: expected error", strings.Trim(src, ";"))
		}
	}
}

var requireErrorTests = []struct {
	load, resolve bool
	src           []byte
}{
	// load error
	{
		resolve: false,
	},
	{
		load:    false,
		resolve: true,
	},
	// compile error
	{
		load:    true,
		resolve: true,
		src:     []byte(`++;`),
	},
}

func TestRequireError(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	l := new(loader)
	vm.Register(l)

	for _, tt := range requireErrorTests {
		l.load = tt.load
		l.resolve = tt.resolve
		l.src = tt.src
		if _, err := vm.Run(`require('_');`); err == nil {
			t.Error("expected error")
		}
		if _, err := vm.Run(`delete require.cache['_'];`); err != nil {
			t.Error(module.Wrap(err))
		}
	}
}

var require_ExtensionsTests = []struct {
	v   otto.Value
	ext string
}{
	{otto.TrueValue(), ".js"},
	{otto.TrueValue(), ".json"},

	{otto.FalseValue(), ""},
}

func TestRequire_Extensions(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	tmpl := `(%q in require.extensions);`

	for _, tt := range require_ExtensionsTests {
		src := fmt.Sprintf(tmpl, tt.ext)
		switch v, err := vm.Run(src); {
		case err != nil:
			t.Error(module.Wrap(err))
		case v != tt.v:
			t.Errorf("%v = %v, expected %v", strings.Trim(src, ";"), v, tt.v)
		}
	}
}

var require_ResolveTests = []struct {
	id, name string
}{
	{"module.js", "module.js"},

	{"./file01.js", abs("./testdata/file01.js")},
	{"./file01", abs("./testdata/file01.js")},

	{"./file03.json", abs("testdata/file03.json")},
	{"./file03", abs("testdata/file03.json")},

	{"./folder01", abs("testdata/folder01/lib/file.js")},
	{"./folder02", abs("testdata/folder02/lib/index.js")},
	{"./folder03", abs("testdata/folder03/index.js")},
	{"./folder04", abs("testdata/folder04/index.js")},

	{"./folder05", abs("testdata/folder05/lib/file.json")},
	{"./folder06", abs("testdata/folder06/lib/index.json")},
	{"./folder07", abs("testdata/folder07/index.json")},
	{"./folder08", abs("testdata/folder08/index.json")},

	{"file01", abs("testdata/node_modules/file01.js")},
	{"folder01", abs("testdata/node_modules/folder01/index.js")},
}

func TestRequire_Resolve(t *testing.T) {
	popd, err := pushd("testdata")
	if err != nil {
		t.Fatal(err)
	}
	defer popd()

	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	file := new(module.FileLoader)
	folder := &module.FolderLoader{File: file}
	vm.Register(file)
	vm.Register(folder)
	vm.Register(&module.NodeModulesLoader{
		File:   file,
		Folder: folder,
	})
	tmpl := `require.resolve(%q);`

	delete(module.Files, "module.js")
	if _, err := vm.Run(fmt.Sprintf(tmpl, "module.js")); err == nil {
		t.Error("expected error")
	}
	restore()

	for _, tt := range require_ResolveTests {
		src := fmt.Sprintf(tmpl, tt.id)
		if v, err := vm.Run(src); err != nil {
			t.Error(module.Wrap(err))
		} else {
			s, _ := v.ToString()
			if g, e := s, tt.name; g != e {
				t.Errorf("%v = %q, expected %q", strings.Trim(src, ";"), g, e)
			}
		}
	}
}

func TestBindingError(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	vm.Bind("!", func(o *otto.Object) error {
		return errors.New("!")
	})

	for _, id := range []string{`null`, `'_'`, `'!'`} {
		src := fmt.Sprintf(`process.binding(%v);`, id)
		if _, err := vm.Run(src); err == nil {
			t.Error("expected error")
		}
	}
}

var binding_VMLoadTests = []struct {
	id string
	ok bool
}{
	{"module.js", true},

	{"./file01.js", true},
	{"./file01", true},

	{"./file03.json", true},
	{"./file03", true},

	{"./folder01", true},
	{"./folder02", true},
	{"./folder03", true},
	{"./folder04", true},

	{"./folder05", true},
	{"./folder06", true},
	{"./folder07", true},
	{"./folder08", true},

	{"file01", true},
	{"folder01", true},
	// nonexistent
	{"./_", false},
}

func TestBinding_VMLoad(t *testing.T) {
	popd, err := pushd("testdata")
	if err != nil {
		t.Fatal(err)
	}
	defer popd()

	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	file := new(module.FileLoader)
	folder := &module.FolderLoader{File: file}
	vm.Register(file)
	vm.Register(folder)
	vm.Register(&module.NodeModulesLoader{
		File:   file,
		Folder: folder,
	})

	for _, tt := range binding_VMLoadTests {
		src := fmt.Sprintf(`process.binding('vm').load(%q);`, tt.id)
		switch _, err := vm.Run(src); {
		case err != nil:
			if tt.ok {
				t.Error(module.Wrap(err))
			}
		case !tt.ok:
			t.Errorf("%v: expected error", strings.Trim(src, ";"))
		}
	}
}

var binding_VMErrorTests = []struct {
	fn   string
	args []string
}{
	{"compile", []string{`null`}},

	{"load", []string{`null`}},
	{"load", []string{`''`}},

	{"resolve", []string{`null`}},
	{"resolve", []string{`'_'`, `null`}},
}

func TestBinding_VMError(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	for _, tt := range binding_VMErrorTests {
		src := fmt.Sprintf(`process.binding('vm').%v(%v);`, tt.fn, strings.Join(tt.args, ", "))
		if _, err := vm.Run(src); err == nil {
			t.Errorf("%v: expected error", strings.Trim(src, ";"))
		}
	}
}

func TestEnv_Get(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	k := "__OTTO_MODULE__"
	fn := "process.env.__get__"
	if err := os.Setenv(k, fn); err != nil {
		t.Fatal(err)
	}

	src := fmt.Sprintf(`%v(%q);`, fn, k)
	if v, err := vm.Run(src); err != nil {
		t.Error(module.Wrap(err))
	} else {
		s, _ := v.ToString()
		if g, e := s, fn; g != e {
			t.Errorf("%v = %q, expected %q", strings.Trim(src, ";"), g, e)
		}
	}

	if _, err := vm.Run(fmt.Sprintf(`%v();`, fn)); err == nil {
		t.Error("expected error")
	}
}

func TestThrow(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.Wrap(err))
	}

	func() {
		defer func() {
			if e := recover(); e != nil {
				if _, ok := e.(otto.Value); !ok {
					t.Errorf("expected otto.Value, got %T", e)
				}
			}
		}()

		vm.Throw(errors.New("_"))
	}()

	func() {
		defer func() {
			if e := recover(); e != nil {
				if _, ok := e.(*otto.Error); !ok {
					t.Errorf("expected *otto.Error, got %T", e)
				}
			}
		}()

		_, err := vm.Run(`_;`)
		vm.Throw(err)
	}()
}

var files map[string][]byte

func init() {
	files = make(map[string][]byte)
	for k, v := range module.Files {
		files[k] = v
	}
}

func restore() {
	for k, v := range files {
		module.Files[k] = v
	}
}

func abs(name string) string {
	p, err := filepath.Abs(name)
	if err != nil {
		panic(err)
	}
	p, err = filepath.EvalSymlinks(p)
	if err != nil {
		panic(err)
	}
	return p
}

func pushd(path string) (func() error, error) {
	wd, err := os.Getwd()
	popd := func() error {
		if err == nil {
			return os.Chdir(wd)
		}
		return err
	}
	return popd, os.Chdir(path)
}

type loader struct {
	load, resolve bool
	src           []byte
}

func (l *loader) Load(id string) ([]byte, error) {
	if !l.load {
		return nil, errors.New(id)
	}
	return l.src, nil
}

func (l *loader) Resolve(id, _ string) (string, error) {
	if !l.resolve {
		return "", errors.New(id)
	}
	return id, nil
}
