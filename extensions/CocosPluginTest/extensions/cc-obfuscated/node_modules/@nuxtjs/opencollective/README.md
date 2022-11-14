# @nuxtjs/opencollective 🤝 Pretty opencollective stats on postinstall!
[![npm (scoped with tag)](https://img.shields.io/npm/v/@nuxtjs/opencollective/latest.svg?style=flat-square)](https://npmjs.com/package/@nuxtjs/opencollective)
[![npm](https://img.shields.io/npm/dt/@nuxtjs/opencollective.svg?style=flat-square)](https://npmjs.com/package/@nuxtjs/opencollective)
[![CircleCI](https://img.shields.io/circleci/project/github/nuxt/opencollective.svg?style=flat-square)](https://circleci.com/gh/nuxt/opencollective)
[![Codecov](https://img.shields.io/codecov/c/github/nuxt/opencollective.svg?style=flat-square)](https://codecov.io/gh/nuxt/opencollective)
[![Dependencies](https://david-dm.org/nuxt/opencollective/status.svg?style=flat-square)](https://david-dm.org/nuxt/opencollective)
[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com)

![Showcase](https://i.imgur.com/PZqyT3x.jpg)

>

[📖 **Release Notes**](./CHANGELOG.md)

## Features

Displaying **opencollective** statistics and a donation URL after users install a package
is important for many creators. After problems with current packages that offer similar
features, we decided to spin off our one own. Our key goals are:

* No interference/problems when installing packages. Never break installation because of the package
* Pretty output for all information
* Decent configurability
* Seamless drop-in for [common](https://github.com/opencollective/opencollective-cli) [solutions](https://github.com/opencollective/opencollective-postinstall)

## Setup

- Add `@nuxtjs/opencollective` dependency using yarn or npm to your project
- Add the script to `postinstall` in your package.json

```js
{
  // ...
  "scripts": {
    "postinstall": "opencollective || exit 0"
  },
  "collective": {
    "url": "https://opencollective.com/nuxtjs"
  }
  // ...
}
```

- Configure it

## Configuration

Configuration is applied through your project's `package.json`.

A full configuration looks like:

```json
{
  "collective": {
    "url": "https://opencollective.com/nuxtjs",
    "logoUrl": "https://opencollective.com/nuxtjs/logo.txt?reverse=true&variant=variant2",
    "donation": {
      "slug": "/order/591",
      "amount": "50",
      "text": "Please donate:"
    }
  }
}
```

---

| Attribute | Optional | Default | Comment |
| ---    |   ---   | ---   | --- |
| url | ❌  | - | The URL to your opencollective page
| logo | ✅  | - | **LEGACY**: The URL to the logo that should be displayed. Please use `logoUrl` instead.
| logoUrl | ✅  | - | The URL to the ASCII-logo that should be displayed.
| donation.slug | ✅  | '/donate' | The slug that should be appended to `url`. Can be used to setup a specific order.
| donation.amount | ✅  | - | The default amount that should be selected on the opencollective page.
| donation.text | ✅  | 'Donate:' | The text that will be displayed before your donation url.

## Disable message

We know the postinstall messages can be annoying when deploying in
production or running a CI pipeline. That's why the message is
**disabled** in those environments by default.

**Enabled** when one the following environment variables is set:

* `NODE_ENV=dev`
* `NODE_ENV=development`
* `OPENCOLLECTIVE_FORCE`

**Strictly Disabled** when one the following environment variables is set:

- `OC_POSTINSTALL_TEST`
- `OPENCOLLECTIVE_HIDE`
- `CI`
- `CONTINUOUS_INTEGRATION`
- `NODE_ENV` (set and **not** `dev` or `development`)

## Development

- Clone this repository
- Install dependencies using `yarn install` or `npm install`
- Run it manually `path/to/project/root/src/index.js path/to/package/you/want/to/try`
- Run tests with `npm t` or `yarn test`

## Inspiration

This project is heavily inspired by [opencollective-cli](https://github.com/opencollective/opencollective-cli).

## License

[MIT License](./LICENSE)

Copyright (c) Alexander Lichter <npm@lichter.io>
