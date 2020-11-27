# otto.module

An implementation of the [Node.js module loading system](https://nodejs.org/api/modules.html) for [otto](https://github.com/robertkrimen/otto).

[![pkg.go.dev](https://pkg.go.dev/badge/github.com/hattya/otto.module)](https://pkg.go.dev/github.com/hattya/otto.module)
[![GitHub Actions](https://github.com/hattya/otto.module/workflows/CI/badge.svg)](https://github.com/hattya/otto.module/actions?query=workflow:CI)
[![Semaphore](https://semaphoreci.com/api/v1/hattya/otto-module/branches/master/badge.svg)](https://semaphoreci.com/hattya/otto-module)
[![Appveyor](https://ci.appveyor.com/api/projects/status/2uan2alkj5c6xe0r?svg=true)](https://ci.appveyor.com/project/hattya/otto-module)
[![Codecov](https://codecov.io/gh/hattya/otto.module/branch/master/graph/badge.svg)](https://codecov.io/gh/hattya/otto.module)


## Installation

```console
$ go get -u github.com/hattya/otto.module
```


## Usage

```go
package main

import (
	"fmt"
	"os"

	"github.com/hattya/otto.module"
)

func main() {
	vm, err := module.New()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	file := new(module.FileLoader)
	folder := &module.FolderLoader{File: file}
	vm.Register(file)
	vm.Register(folder)
	vm.Register(&module.NodeModulesLoader{
		File:   file,
		Folder: folder,
	})

	vm.Run(`
		var path = require('path');

		console.log(path.extname('module.go'));
	`)
}
```


## License

otto.module is distributed under the terms of the MIT License.
