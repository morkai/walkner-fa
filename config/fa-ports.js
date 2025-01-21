'use strict';

if (process.env.FA_PORTS)
{
  try { return module.exports = require(process.env.FA_PORTS); }
  catch (err) {} // eslint-disable-line no-empty
}

let nextPort = 29010;

module.exports = {
  'fa-frontend': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  }
};
