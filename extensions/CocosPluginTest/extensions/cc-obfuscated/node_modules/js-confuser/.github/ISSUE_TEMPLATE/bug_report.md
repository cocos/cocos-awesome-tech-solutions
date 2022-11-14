---
name: Bug report
about: The obfuscator broke my code!
title: ''
labels: bug
assignees: ''

---

**Describe the bug:**

The program gets stuck in a infinite loop

**Config and Small code sample**

Config:

```js
{
  target: "node",
  preset: "high"
}
```

Code:

```js
console.log("My Small Code Sample");
```

**Expected behavior**

The program should output "My Small Code Sample"

**Actual behavior**

The program stalls forever and never outputs anything

**Additional context**

Seems the program gets stuck in a infinite loop due to Control Flow Flattening. Disabling the feature seems to rid of the bug.
