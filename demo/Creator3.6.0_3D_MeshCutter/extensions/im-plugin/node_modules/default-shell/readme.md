# default-shell

> Get the user's default [shell](https://en.wikipedia.org/wiki/Shell_(computing))

## Install

```
$ npm install --save default-shell
```

## Usage

```js
import defaultShell from 'default-shell';

// macOS
console.log(defaultShell);
//=> '/bin/bash'

// Windows
console.log(defaultShell);
//=> 'C:\\WINDOWS\\system32\\cmd.exe'
```
