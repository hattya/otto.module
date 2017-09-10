//
// otto.module :: loader.go
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
	"errors"
	"fmt"
	"path/filepath"
)

var ErrModule = errors.New("module not found")

type Loader interface {
	Load(id string) ([]byte, error)
	Resolve(id, wd string) (string, error)
}

func (vm *Otto) Register(l Loader) {
	vm.mu.Lock()
	defer vm.mu.Unlock()

	vm.loaders = append(vm.loaders, l)
}

func (vm *Otto) Load(id string) ([]byte, error) {
	for _, l := range vm.loaders {
		switch b, err := l.Load(id); {
		case err == nil:
			return b, nil
		case err != ErrModule:
			return nil, ModuleError{
				ID:  id,
				Err: err,
			}
		}
	}
	return nil, ModuleError{ID: id}
}

func (vm *Otto) Resolve(id, wd string) (string, error) {
	wd, err := filepath.Abs(wd)
	if err != nil {
		return "", ModuleError{
			ID:  id,
			Err: err,
		}
	}

	for _, l := range vm.loaders {
		switch n, err := l.Resolve(id, wd); {
		case err == nil:
			return n, nil
		case err != ErrModule:
			return "", ModuleError{
				ID:  id,
				Err: err,
			}
		}
	}
	return "", ModuleError{ID: id}
}

type ModuleError struct {
	ID  string
	Err error
}

func (e ModuleError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%v: %v", e.ID, e.Err)
	}
	return fmt.Sprintf("cannot find module '%v'", e.ID)
}

type coreLoader struct {
}

func (*coreLoader) Load(id string) ([]byte, error) {
	if b, ok := files[id]; ok {
		return b, nil
	}
	return nil, ErrModule
}

func (*coreLoader) Resolve(id, _ string) (string, error) {
	if _, ok := files[id]; ok {
		return id, nil
	}
	return "", ErrModule
}