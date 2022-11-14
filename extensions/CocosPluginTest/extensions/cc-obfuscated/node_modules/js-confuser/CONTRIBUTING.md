# Contributing to JS Confuser

## Setup

1 Clone your fork of the repository
```
$ git clone https://github.com/<USERNAME>/js-confuser.git
```

2 Install npm dependencies
```
$ npm install
```

3 Create a `dev.ts` file in the root directory, ex:
```js
import JsConfuser from "./src/index";

JsConfuser.obfuscate(`<source code>`, { /* options */ }).then(obfuscated=>{

  console.log(obfuscated)
  eval(obfuscated);
})
```

The `dev.ts` file is only used for fiddling with the library. It uses `@babel/register` to transpile code on the fly.

4 Run the dev file
```js
$ npm run dev
```

5 Run Tests before committing
```
$ npm run test
```

## Code Style

Indent: 2 spaces
Recommended Extension: [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Guidelines

- Please try to [combine multiple commits before pushing](http://stackoverflow.com/questions/6934752/combining-multiple-commits-before-pushing-in-git)

- Please use `TDD` when fixing bugs. This means that you should write a unit test that fails because it reproduces the issue, 
then fix the issue and finally run the test to ensure that the issue has been resolved. This helps us prevent fixed bugs from 
happening again in the future

- Please keep the test coverage at 95+%. Write additional unit tests if necessary

- Please create an issue before sending a PR if it is going to change the public interface of Js Confuser or includes significant architecture changes