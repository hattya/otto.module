//
// otto.module :: module.go
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

//go:generate modulizer -l core -o core.go lib

package module

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sync"

	"github.com/robertkrimen/otto"
)

var wrapper = [][]byte{
	[]byte("(function(exports, require, module, __filename, __dirname) { "),
	[]byte("\n});"),
}

type Otto struct {
	*otto.Otto

	mu       sync.Mutex
	loaders  []Loader
	bindings map[string]Binding
	cache    map[string]otto.Value
}

func New() (*Otto, error) {
	vm := &Otto{
		Otto:     otto.New(),
		bindings: make(map[string]Binding),
		cache:    make(map[string]otto.Value),
	}
	vm.init()

	_, err := vm.bootstrap("internal/bootstrap.js")
	if err != nil {
		return nil, err
	}
	return vm, nil
}

func (vm *Otto) init() {
	vm.Register(new(coreLoader))
	// builtins
	vm.Bind("natives", func(o *otto.Object) error {
		for n, b := range files {
			o.Set(n[:len(n)-len(filepath.Ext(n))], string(b))
		}
		return nil
	})
	vm.Bind("vm", func(o *otto.Object) error {
		o.Set("compile", vm.compile)
		o.Set("load", vm.load)
		o.Set("resolve", vm.resolve)
		return nil
	})
}

func (vm *Otto) bootstrap(id string) (v otto.Value, err error) {
	// load
	b, err := vm.Load(id)
	if err != nil {
		return
	}
	// compile
	script, err := vm.Compile(id, b)
	if err != nil {
		return
	}
	fn, err := vm.Run(script)
	if err != nil {
		return
	}
	// eval
	return fn.Call(otto.NullValue(), vm.process())
}

func (vm *Otto) compile(call otto.FunctionCall) otto.Value {
	id, err := vm.toString("id", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}
	// load
	b, err := vm.Load(id)
	if err != nil {
		return vm.throw(err)
	}
	// compile
	script, err := vm.Compile(id, vm.wrap(b))
	if err != nil {
		return vm.throw(err)
	}
	v, _ := vm.Run(script)
	return v
}

func (vm *Otto) wrap(b []byte) []byte {
	return append(append(append(make([]byte, 0, len(b)+len(wrapper[0])+len(wrapper[1])), wrapper[0]...), b...), wrapper[1]...)
}

func (vm *Otto) load(call otto.FunctionCall) otto.Value {
	id, err := vm.toString("id", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}
	// load
	b, err := vm.Load(id)
	if err != nil {
		return vm.throw(err)
	}
	v, _ := vm.ToValue(string(b))
	return v
}

func (vm *Otto) resolve(call otto.FunctionCall) otto.Value {
	id, err := vm.toString("id", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}
	wd := "."
	v := call.Argument(1)
	if b, _ := v.ToBoolean(); b {
		wd, err = vm.toString("wd", call.Argument(1))
		if err != nil {
			return vm.throw(err)
		}
	}
	// resolve
	id, err = vm.Resolve(id, wd)
	if err != nil {
		return vm.throw(err)
	}
	v, _ = vm.ToValue(id)
	return v
}

func (vm *Otto) process() otto.Value {
	v, _ := vm.Run([]byte("(function() {\nfunction process() {\n}\nreturn new process();\n})();"))
	o := v.Object()
	o.Set("binding", vm.binding)
	env, _ := vm.Object(`({})`)
	env.Set("__get__", vm.env_get)
	env.Set("__has__", vm.env_has)
	env.Set("__set__", vm.env_set)
	o.Set("env", env)
	if runtime.GOOS == "windows" {
		o.Set("platform", "win32")
	} else {
		o.Set("platform", runtime.GOOS)
	}
	return v
}

func (vm *Otto) binding(call otto.FunctionCall) otto.Value {
	id, err := vm.toString("id", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}

	v, err := vm.Binding(id)
	if err != nil {
		return vm.throw(err)
	}
	return v
}

func (vm *Otto) env_get(call otto.FunctionCall) otto.Value {
	k, err := vm.toString("key", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}

	v, _ := vm.ToValue(os.Getenv(k))
	return v
}

func (vm *Otto) env_has(call otto.FunctionCall) otto.Value {
	k, err := vm.toString("key", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}

	_, ok := os.LookupEnv(k)
	v, _ := vm.ToValue(ok)
	return v
}

func (vm *Otto) env_set(call otto.FunctionCall) otto.Value {
	k, err := vm.toString("key", call.Argument(0))
	if err != nil {
		return vm.throw(err)
	}
	v, err := vm.toString("value", call.Argument(1))
	if err != nil {
		return vm.throw(err)
	}

	if err := os.Setenv(k, v); err != nil {
		return vm.throw(err)
	}
	return otto.UndefinedValue()
}

func (vm *Otto) throw(err error) otto.Value {
	return Throw(vm.Otto, err)
}

func (vm *Otto) toString(name string, v otto.Value) (string, error) {
	if !v.IsString() {
		return "", fmt.Errorf("%v must be a String", name)
	}
	return v.ToString()
}
