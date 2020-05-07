//
// otto.module :: loader.go
//
//   Copyright (c) 2017-2020 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

package module

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
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

type FileLoader struct {
}

func (l *FileLoader) Load(id string) ([]byte, error) {
	fi, err := os.Stat(id)
	switch {
	case err != nil:
		id, err = l.Resolve(id, ".")
	case !fi.Mode().IsRegular():
		err = ErrModule
	}
	if err != nil {
		return nil, err
	}
	return ioutil.ReadFile(id)
}

func (l *FileLoader) Resolve(id, wd string) (string, error) {
	if !isPath(id) {
		return "", ErrModule
	}

	id = filepath.Join(wd, id)
	fi, err := os.Stat(id)
	if err != nil {
		for _, ext := range []string{".js", ".json"} {
			fi, err = os.Stat(id + ext)
			if err == nil {
				id += ext
				break
			}
		}
		if err != nil {
			return "", ErrModule
		}
	}
	if !fi.Mode().IsRegular() {
		return "", ErrModule
	}

	id, err = filepath.EvalSymlinks(id)
	if err != nil {
		return "", err
	}
	return id, nil
}

type FolderLoader struct {
	File Loader
}

func (l *FolderLoader) Load(id string) ([]byte, error) {
	if fi, err := os.Stat(id); err != nil || fi.IsDir() {
		id, err = l.Resolve(id, ".")
		if err != nil {
			return nil, err
		}
	}
	return ioutil.ReadFile(id)
}

func (l *FolderLoader) Resolve(id, wd string) (string, error) {
	if !isPath(id) {
		return "", ErrModule
	}

	wd = filepath.Join(wd, id)
	if fi, err := os.Stat(wd); err != nil || !fi.IsDir() {
		return "", ErrModule
	}

	p := filepath.Join(wd, "package.json")
	if b, err := ioutil.ReadFile(p); err == nil {
		var pkg Package
		if err := json.Unmarshal(b, &pkg); err != nil {
			return "", PackageError{
				Path: p,
				Err:  err,
			}
		}
		if pkg.Main != "" {
			if id, err := l.File.Resolve(pkg.Main, wd); err == nil {
				return id, nil
			}
			if id, err := l.File.Resolve(pkg.Main+"/index", wd); err == nil {
				return id, nil
			}
		}
	}
	return l.File.Resolve("./index", wd)
}

type Package struct {
	Name string `json:"name"`
	Main string `json:"main"`
}

type PackageError struct {
	Path string
	Err  error
}

func (e PackageError) Error() string {
	return fmt.Sprintf("%v: %v", e.Path, e.Err)
}

func isPath(id string) bool {
	switch {
	case id == "":
	case id[0] == '/':
		return true
	case id[0] == '.' && 1 < len(id):
		switch {
		case id[1] == '/':
			return true
		case id[1] == '.' && 2 < len(id):
			return id[2] == '/'
		}
	}
	return false
}

type NodeModulesLoader struct {
	File   Loader
	Folder Loader
}

func (l *NodeModulesLoader) Load(id string) ([]byte, error) {
	fi, err := os.Stat(id)
	switch {
	case err != nil:
		id, err = l.Resolve(id, ".")
	case fi.IsDir():
		id, err = l.Folder.Resolve("./"+id, ".")
	}
	if err != nil {
		return nil, err
	}
	return ioutil.ReadFile(id)
}

func (l *NodeModulesLoader) Resolve(id, wd string) (string, error) {
	if isPath(id) {
		return "", ErrModule
	}

	id = "./" + id
	dir := wd
	for {
		if filepath.Base(dir) != "node_modules" {
			dir = filepath.Join(dir, "node_modules")
		}

		if id, err := l.File.Resolve(id, dir); err == nil {
			return id, nil
		}
		if id, err := l.Folder.Resolve(id, dir); err == nil {
			return id, nil
		}

		dir = filepath.Dir(wd)
		if dir == wd {
			break
		}
		wd = dir
	}
	return "", ErrModule
}
