//
// otto.module :: otto_test.go
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

package module_test

import (
	"errors"
	"reflect"
	"testing"

	"github.com/hattya/otto.module"
)

func TestWrap(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(err)
	}

	_, err1 := vm.Run(`throw new Error('error');`)
	_, err2 := vm.Run(`--;`)
	err3 := errors.New("error")

	for _, tt := range []struct {
		in, out error
	}{
		{err1, module.OttoError{Err: err1}},
		{err2, module.OttoError{Err: err2}},
		{err3, err3},
		{nil, nil},
	} {
		if g, e := module.Wrap(tt.in), tt.out; !reflect.DeepEqual(g, e) {
			t.Errorf("expected %#v, got %#v", e, g)
		}
	}
}

func TestOttoError(t *testing.T) {
	vm, err := module.New()
	if err != nil {
		t.Fatal(err)
	}

	_, err1 := vm.Run(`throw new Error('error');`)
	_, err2 := vm.Run(`-`)
	_, err3 := vm.Run(`--;`)
	err4 := errors.New("error")

	for _, tt := range []struct {
		err error
		s   string
	}{
		{err1, "Error: error\n    at <anonymous>:1:11"},
		{err2, "<anonymous>:1:2: Unexpected end of input"},
		{err3, "<anonymous>:1:3: Unexpected token ; (and 1 more errors)"},
		{err4, "error"},
	} {
		if g, e := (module.OttoError{Err: tt.err}).Error(), tt.s; g != e {
			t.Errorf("OttoError.Error() = %q, expected %q", g, e)
		}
	}
}
