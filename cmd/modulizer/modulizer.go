//
// otto.module/cmd/modulizer :: modulizer.go
//
//   Copyright (c) 2017-2022 Akinori Hattori <hattya@gmail.com>
//
//   SPDX-License-Identifier: MIT
//

package main

import (
	"bytes"
	"flag"
	"fmt"
	"go/format"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"text/template"
)

const module = "github.com/hattya/otto.module"

var (
	flagL = flag.String("l", "", "loader prefix")
	flagO = flag.String("o", "", "output file")
	flagP *string
	flagV = flag.String("v", "files", "variable name")
)

var importPath string

func init() {
	out, err := exec.Command("go", "list", "-f", "{{.ImportPath}}\t{{.Name}}").CombinedOutput()
	if err != nil {
		exit(fmt.Errorf(string(bytes.TrimSpace(out))))
	}
	v := bytes.Fields(out)
	importPath = string(v[0])
	flagP = flag.String("p", string(v[1]), "package name")
}

func main() {
	flag.Parse()
	switch {
	case len(flag.Args()) < 1:
		os.Exit(1)
	case *flagO == "":
		exit(fmt.Errorf("-o flag is not specified!"))
	default:
		exit(gen(flag.Arg(0)))
	}
}

func exit(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "modulizer:", err)
		os.Exit(1)
	}
	os.Exit(0)
}

func gen(root string) error {
	buf := new(bytes.Buffer)
	t := template.Must(template.New("loader").Parse(`
// Code generated by "modulizer {{.Args}}"; DO NOT EDIT.

package {{.Name}}
{{- if ne .ImportPath .Module}}

import "{{.Module}}"
{{- end}}

type {{.Loader}} struct {
}

func (l *{{.Loader}}) Load(id string) ([]byte, error) {
	for _, ext := range []string{"", ".js", ".json"} {
		if b, ok := {{.Var}}[id+ext]; ok {
			return b, nil
		}
	}
	return nil, {{.Err}}
}

func (*{{.Loader}}) Resolve(id, _ string) (string, error) {
	for _, ext := range []string{"", ".js", ".json"} {
		k := id + ext
		if _, ok := {{.Var}}[k]; ok {
			return k, nil
		}
	}
	return "", {{.Err}}
}

`))
	err := t.Execute(buf, map[string]string{
		"Args":       strings.Join(os.Args[1:], " "),
		"Module":     module,
		"Name":       *flagP,
		"ImportPath": importPath,
		"Loader":     loader(*flagL),
		"Err":        errModule(),
		"Var":        *flagV,
	})
	if err != nil {
		return err
	}
	// variable
	fmt.Fprintf(buf, "var %v = map[string][]byte{\n", *flagV)
	err = filepath.Walk(root, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return err
		}
		switch filepath.Ext(path) {
		case ".js", ".json":
			b, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			fmt.Fprintf(buf, "%q: []byte(`%s`),\n", filepath.ToSlash(path[len(root)+1:]), sanitize(b))
		}
		return nil
	})
	if err != nil {
		return err
	}
	fmt.Fprintln(buf, "}")
	// gofmt
	b, err := format.Source(buf.Bytes())
	if err != nil {
		return err
	}
	// save
	return os.WriteFile(*flagO, b, 0o666)
}

func errModule() string {
	s := "ErrModule"
	if importPath == module {
		return s
	}
	return "module." + s
}

func loader(s string) string {
	if s == "" {
		return "loader"
	}
	return s + "Loader"
}

func sanitize(b []byte) []byte {
	// replace ` with `+"`"+`
	return bytes.Replace(b, []byte("`"), []byte("`+\"`\"+`"), -1)
}
