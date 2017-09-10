//
// otto.module :: module_test.go
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

package module_test

import (
	"errors"
	"fmt"
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
		t.Fatal(module.OttoError{Err: err})
	}

	l := &loader{}
	vm.Register(l)

	for _, tt := range requireErrorTests {
		l.load = tt.load
		l.resolve = tt.resolve
		l.src = tt.src
		if _, err := vm.Run(`require('_');`); err == nil {
			t.Error("expected error")
		}
		if _, err := vm.Run(`delete require.cache['_'];`); err != nil {
			t.Error(module.OttoError{Err: err})
		}
	}
}

var require_ExtensionsTests = []struct {
	v   otto.Value
	ext string
}{
	{otto.TrueValue(), ".js"},

	{otto.FalseValue(), ""},
}

func TestRequire_Extensions(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.OttoError{Err: err})
	}

	tmpl := `(%q in require.extensions);`

	for _, tt := range require_ExtensionsTests {
		src := fmt.Sprintf(tmpl, tt.ext)
		v, err := vm.Run(src)
		switch {
		case err != nil:
			t.Error(module.OttoError{Err: err})
		case v != tt.v:
			t.Errorf("%v = %v, expected %v", strings.Trim(src, ";"), v, tt.v)
		}
	}
}

func TestRequire_Resolve(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.OttoError{Err: err})
	}

	src := `require.resolve('module.js');`

	delete(module.Files, "module.js")
	if _, err := vm.Run(src); err == nil {
		t.Error("expected error")
	}
	restore()

	if v, err := vm.Run(src); err != nil {
		t.Error(module.OttoError{Err: err})
	} else {
		s, _ := v.ToString()
		if g, e := s, "module.js"; g != e {
			t.Errorf("%v = %q, expected %q", strings.Trim(src, ";"), g, e)
		}
	}
}

func TestBindingError(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.OttoError{Err: err})
	}

	vm.Bind("!", func(o *otto.Object) error {
		return errors.New("!")
	})

	for _, id := range []string{`null`, `'_'`, `'!'`} {
		_, err := vm.Run(fmt.Sprintf(`process.binding(%v);`, id))
		if err == nil {
			t.Error("expected error")
		}
	}
}

var binding_VMErrorTests = []struct {
	fn   string
	args []string
}{
	{"compile", []string{`null`}},

	{"resolve", []string{`null`}},
	{"resolve", []string{`'_'`, `null`}},
}

func TestBinding_VMError(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.OttoError{Err: err})
	}

	for _, tt := range binding_VMErrorTests {
		src := fmt.Sprintf(`process.binding('vm').%v(%v);`, tt.fn, strings.Join(tt.args, ", "))
		_, err := vm.Run(src)
		if err == nil {
			t.Errorf("%v: expected error", strings.Trim(src, ";"))
		}
	}
}

func TestThrow(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(module.OttoError{Err: err})
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