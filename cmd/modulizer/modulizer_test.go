//
// otto.module/cmd/modulizer :: modulizer_test.go
//
//   Copyright (c) 2017-2021 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
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
	if err := ioutil.WriteFile(filepath.Join(root, "go.js"), nil, 0o666); err != nil {
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
	if err := ioutil.WriteFile(filepath.Join(root, "go.js"), []byte{0}, 0o666); err != nil {
		t.Fatal(err)
	}
	*flagO = filepath.Join(dir, "out.go")
	if err := gen(root); err == nil {
		t.Error("expected error")
	}
}

func mkdir(s ...string) error {
	return os.MkdirAll(filepath.Join(s...), 0o777)
}

func tempDir() (string, error) {
	return ioutil.TempDir("", "modulizer.test")
}
