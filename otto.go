//
// otto.module :: otto.go
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

package module

import (
	"fmt"
	"strings"

	"github.com/robertkrimen/otto"
	"github.com/robertkrimen/otto/parser"
)

func Throw(vm *otto.Otto, err error) otto.Value {
	switch err := err.(type) {
	case *otto.Error:
		panic(err)
	case parser.ErrorList:
		panic(vm.MakeSyntaxError(OttoError{Err: err}.Error()))
	case ModuleError:
		if err, ok := err.Err.(PackageError); ok {
			panic(vm.MakeSyntaxError(err.Error()))
		}
	}
	panic(vm.MakeCustomError("Error", err.Error()))
}

type OttoError struct {
	Err error
}

func (e OttoError) Error() string {
	switch err := e.Err.(type) {
	case *otto.Error:
		return strings.TrimSpace(err.String())
	case parser.ErrorList:
		name := err[0].Position.Filename
		if name == "" {
			name = "<anonymous>"
		}
		s := fmt.Sprintf("%v:%v:%v: %v", name, err[0].Position.Line, err[0].Position.Column, err[0].Message)
		if len(err) == 1 {
			return s
		}
		return fmt.Sprintf("%v (and %v more errors)", s, len(err)-1)
	}
	return e.Err.Error()
}
