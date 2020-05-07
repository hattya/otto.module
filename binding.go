//
// otto.module :: process.go
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

package module

import (
	"fmt"

	"github.com/robertkrimen/otto"
)

type Binding func(*otto.Object) error

func (vm *Otto) Bind(id string, fn Binding) {
	vm.mu.Lock()
	defer vm.mu.Unlock()

	vm.bindings[id] = fn
	delete(vm.cache, id)
}

func (vm *Otto) Binding(id string) (otto.Value, error) {
	vm.mu.Lock()
	defer vm.mu.Unlock()

	v, ok := vm.cache[id]
	if !ok {
		fn, ok := vm.bindings[id]
		if !ok {
			return otto.UndefinedValue(), BindingError{ID: id}
		}
		// eval
		o, _ := vm.Object(`({})`)
		if err := fn(o); err != nil {
			return otto.UndefinedValue(), err
		}
		v = o.Value()
		vm.cache[id] = v
	}
	return v, nil
}

type BindingError struct {
	ID string
}

func (e BindingError) Error() string {
	return fmt.Sprintf("cannot find binding '%v'", e.ID)
}
