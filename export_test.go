//
// otto.module :: export_test.go
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

package module

import "github.com/robertkrimen/otto"

var Files = files

func (vm *Otto) Throw(err error) otto.Value {
	return vm.throw(err)
}
