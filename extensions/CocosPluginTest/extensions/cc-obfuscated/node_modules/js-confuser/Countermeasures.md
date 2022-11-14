# Countermeasures

[Countermeasures](https://docs.jscrambler.com/code-integrity/documentation/client-side-countermeasures) is a property on the `lock` object, determining the response to a triggered lock.

For instance, the `domainLock` determines the current domain is invalid.

```js
{
  target: "node",
  lock: {
    domainLock: ["mywebsite.com"],

    // crash process (default)
    countermeasures: true,

    // custom callback to invoke
    countermeasures: "onLockTriggered"
  }
}
```

## Crash Process

The default behavior is to crash the process. This depends on the `target` property.

- `node` -> `process.exit();`
- `browser` -> `document.documentElement.innerHTML = '';`

This is followed by an infinite loop as a fallback measure to ensure the process becomes useless.

## Custom Callback

By setting countermeasures to a string, it can point to a callback to invoke when a lock is triggered.

The countermeasures callback function can either be a local name or an external name.

Examples:
- `"onLockTriggered"`
- `"window.onLockTriggered"`

If the function is defined within the locked code, it must follow the local name rules.

## Local Name rules

1. The function must be defined at the top-level of your program.
2. The function must not rely on any scoped variables.
3. The function cannot call functions outside it's context.

These rules are necessary to prevent an infinite loop from occurring.

## Test your countermeasure

#### Domain Lock:

Try your code within DevTools while on another website.

#### Time Lock:

Try setting your machine time to the past or before the allowed range.

#### Integrity:

Try changing a string within your code.

#### Native Functions:

Open DevTools and run:

```js
var _fetch = fetch;
fetch = (url, options)=>{
  console.log("Intercepted", url, options);
  return _fetch(url, options);
}
```

Try to run your code after that.