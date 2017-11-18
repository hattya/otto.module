otto.module
===========

An implementation of the `Node.js module loading system`_ for otto_.

.. image:: https://semaphoreci.com/api/v1/hattya/otto-module/branches/master/badge.svg
   :target: https://semaphoreci.com/hattya/otto-module

.. image:: https://ci.appveyor.com/api/projects/status/2uan2alkj5c6xe0r?svg=true
   :target: https://ci.appveyor.com/project/hattya/otto-module

.. image:: https://codecov.io/gh/hattya/otto.module/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/hattya/otto.module

.. _Node.js module loading system: https://nodejs.org/api/modules.html
.. _otto: https://github.com/robertkrimen/otto


Installation
------------

.. code:: console

   $ go get -u github.com/hattya/otto.module


Usage
-----

.. code:: go

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


License
-------

otto.module is distributed under the terms of the MIT License.
