//
// otto.module :: otto.go
//
//   Copyright (c) 2017-2023 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
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
	case *parser.ErrorList:
		panic(vm.MakeSyntaxError(OttoError{Err: err}.Error()))
	case ModuleError:
		if err, ok := err.Err.(PackageError); ok {
			panic(vm.MakeSyntaxError(err.Error()))
		}
	}
	panic(vm.MakeCustomError("Error", err.Error()))
}

func Wrap(err error) error {
	switch err.(type) {
	case *otto.Error:
	case *parser.ErrorList:
	default:
		return err
	}
	return OttoError{Err: err}
}

type OttoError struct {
	Err error
}

func (e OttoError) Error() string {
	switch err := e.Err.(type) {
	case *otto.Error:
		return strings.TrimSpace(err.String())
	case *parser.ErrorList:
		err1 := (*err)[0]
		if err1.Position.Filename == "" {
			err1.Position.Filename = "<anonymous>"
		}
		s := fmt.Sprintf("%v:%v:%v: %v", err1.Position.Filename, err1.Position.Line, err1.Position.Column, err1.Message)
		if len(*err) == 1 {
			return s
		}
		return fmt.Sprintf("%v (and %v more errors)", s, len(*err)-1)
	}
	return e.Err.Error()
}
