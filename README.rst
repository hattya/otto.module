otto.module
===========

An implementation of the `Node.js module loading system`_ for otto_.

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

   	file := &module.FileLoader{}
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
