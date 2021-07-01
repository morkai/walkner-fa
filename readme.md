# Fixed Assets

## Requirements

### node.js

  * __Version__: 12
  * __Website__: https://nodejs.org/

### MongoDB

  * __Version__: 4.2
  * __Website__: https://www.mongodb.org/

## Installation

Clone the repository:

```
git clone git://github.com/morkai/walkner-fa.git
```

or [download](https://github.com/morkai/walkner-fa/zipball/master)
and extract it.

Go to the project's directory and install the dependencies:

```
cd walkner-fa/
npm install -g grunt-cli
npm install
```

## Configuration

1. Create your own config directory (e.g. `walkner-fa/config/development/`).
2. Create a JS file for each server process (`fa-*.js` files) you want to run.
3. In each `walkner-fa/config/development/fa-*.js` file require and export the corresponding file from
   the `walkner-fa/config/` directory.
4. Override whatever you want in your custom config files.

## Starting

```
node backend/main.js <path to the server process config>
```

For example:

```
cd walkner-fa
node backend/main.js ../config/fa-frontend.js
```

## License

This project is released under the [CC BY-NC-SA 4.0](https://raw.github.com/morkai/walkner-fa/master/license.md).

Copyright (c) 2019, Łukasz Walukiewicz (lukasz@miracle.systems)
