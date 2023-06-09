export type EnvironmentVariables = Readonly<Record<string, string>>;

/**
Get the environment variables defined in your dotfiles.

@param shell - The shell to read environment variables from. Default: User default shell.
@returns The environment variables.

@example
```
import {shellEnv} from 'shell-env';

console.log(await shellEnv());
//=> {TERM_PROGRAM: 'Apple_Terminal', SHELL: '/bin/zsh', ...}

console.log(await shellEnv('/bin/bash'));
//=> {TERM_PROGRAM: 'iTerm.app', SHELL: '/bin/zsh', ...}
```
*/
export function shellEnv(shell?: string): Promise<EnvironmentVariables>;

/**
Get the environment variables defined in your dotfiles.

@param shell - The shell to read environment variables from. Default: User default shell.
@returns The environment variables.

@example
```
import {shellEnvSync} from 'shell-env';

console.log(shellEnvSync());
//=> {TERM_PROGRAM: 'Apple_Terminal', SHELL: '/bin/zsh', ...}

console.log(shellEnvSync('/bin/bash'));
//=> {TERM_PROGRAM: 'iTerm.app', SHELL: '/bin/zsh', ...}
```
*/
export function shellEnvSync(shell?: string): EnvironmentVariables;
