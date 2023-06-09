# shell-path

> Get the [`$PATH`](https://en.wikipedia.org/wiki/PATH_(variable)) from the shell

Useful for Electron apps as GUI apps on macOS do not inherit the `$PATH` defined in your dotfiles *(.bashrc/.bash_profile/.zshrc/etc)*.

## Install

```
$ npm install shell-path
```

## Usage

When executed from a GUI app on macOS:

```js
import {shellPath} from 'shell-path';

console.log(process.env.PATH);
//=> '/usr/bin'

console.log(await shellPath());
//=> '/usr/local/bin:/usr/bin:...'
```

## API

### shellPath()

Return a promise for the `$PATH`.

### shellPathSync()

Returns the `$PATH`.

## Related

- [fix-path](https://github.com/sindresorhus/fix-path) - Fix the $PATH on macOS when run from a GUI app
- [shell-env](https://github.com/sindresorhus/shell-env) - Get environment variables from the shell
- [shell-history](https://github.com/sindresorhus/shell-history) - Get the command history of the user's shell
