//
// otto.module :: process.go
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
