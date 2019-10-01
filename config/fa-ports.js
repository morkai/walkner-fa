'use strict';

if (process.env.FA_PORTS)
{
  try { return module.exports = require(process.env.FA_PORTS); }
  catch (err) {} // eslint-disable-line no-empty
}

const REPORTS_PUSH_PORT = 28000;

let nextPort = 28010;

module.exports = {
  'fa-frontend': {
    server: {
      pubHost: '0.0.0.0',
      pubPort: nextPort++,
      repHost: '0.0.0.0',
      repPort: nextPort++
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'fa-watchdog': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-attachments': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-importer-sap': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-importer-results': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-reports-1': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1,
      pushHost: '127.0.0.1',
      pushPort: REPORTS_PUSH_PORT
    }
  },
  'fa-reports-2': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'fa-reports-3': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'fa-alerts': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-planning': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-reports-4': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'fa-help': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-reports-5': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'fa-reports-6': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'fa-luma2': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'fa-luca': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  }
};
