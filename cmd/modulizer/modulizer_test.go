//
// otto.module/cmd/modulizer :: modulizer_test.go
//
//   Copyright (c) 2017-2023 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestGenerate(t *testing.T) {
	dir := t.TempDir()
	root := filepath.Join(dir, "root")
	if err := mkdir(root); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "go.js"), nil, 0o666); err != nil {
		t.Fatal(err)
	}

	for _, tt := range []struct {
		e bool
		l string
	}{
		{false, ""},
		{false, "prefix"},
		{true, ""},
		{true, "prefix"},
	} {
		*flagE = tt.e
		*flagL = tt.l
		*flagO = filepath.Join(dir, "out.go")
		if err := gen(root); err != nil {
			t.Error(err)
		}
	}
}

func TestError(t *testing.T) {
	dir := t.TempDir()
	*flagE = false
	*flagL = ""
	*flagO = ""

	// not exist
	root := filepath.Join(dir, "root")
	if err := gen(root); err == nil {
		t.Error("expected error")
	}
	// gofmt error
	if err := mkdir(root); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "go.js"), []byte{0}, 0o666); err != nil {
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
