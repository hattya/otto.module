//
// otto.module :: otto_test.go
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
	"testing"

	"github.com/hattya/otto.module"
)

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
