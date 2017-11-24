//
// otto.module/cmd/modulizer :: modulizer_test.go
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

package main

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
)

func TestGenerate(t *testing.T) {
	dir, err := tempDir()
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(dir)

	root := filepath.Join(dir, "root")
	if err := mkdir(root); err != nil {
		t.Fatal(err)
	}
	if err := ioutil.WriteFile(filepath.Join(root, "go.js"), nil, 0666); err != nil {
		t.Fatal(err)
	}

	for _, tt := range []struct {
		l string
	}{
		{""},
		{"prefix"},
	} {
		*flagL = tt.l
		*flagO = filepath.Join(dir, "out.go")
		if err := gen(root); err != nil {
			t.Error(err)
		}
	}
}

func TestError(t *testing.T) {
	dir, err := tempDir()
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(dir)

	// not exist
	root := filepath.Join(dir, "root")
	if err := gen(root); err == nil {
		t.Error("expected error")
	}
	// gofmt error
	if err := mkdir(root); err != nil {
		t.Fatal(err)
	}
	if err := ioutil.WriteFile(filepath.Join(root, "go.js"), []byte{0}, 0666); err != nil {
		t.Fatal(err)
	}
	*flagO = filepath.Join(dir, "out.go")
	if err := gen(root); err == nil {
		t.Error("expected error")
	}
}

func mkdir(s ...string) error {
	return os.MkdirAll(filepath.Join(s...), 0777)
}

func tempDir() (string, error) {
	return ioutil.TempDir("", "modulizer.test")
}
