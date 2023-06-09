/**
Fix the `$PATH` on macOS when run from a GUI app.

```
import fixPath from 'fix-path';

console.log(process.env.PATH);
//=> '/usr/bin'

fixPath();

console.log(process.env.PATH);
//=> '/usr/local/bin:/usr/bin'
```
*/
export default function fixPath(): void;
