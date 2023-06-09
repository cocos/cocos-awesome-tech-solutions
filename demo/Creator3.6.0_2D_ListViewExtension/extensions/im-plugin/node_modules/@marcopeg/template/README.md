# @marcopeg/template

Minimalist variable substitution utility inspired by 
[mustache](https://www.npmjs.com/package/mustache) that implements just
few **variable substitution** features.

- no loops
- no conditionals
- no filters

> If you need a full template engine, use `mustache` :-)

```js
import template from '@marcopeg/template'

const data = {
    name: 'marco',
    surname: 'pegoraro',
    family: {
        father: { name: 'piero' },
        mother: { name: 'teresa' },
        siblings: [
            { name: 'giulia' },
            { name: 'elisa' },
        ]
    }
}

template('name', name)
// -> marco

template('{{ name }} {{ surname }}', data)
// -> marco pegoraro

template('{{ name }} {{ surname }} has {{ family.siblings.$LENGTH }} siblings', data)
// -> marco pegoraro has 2 siblings
```

