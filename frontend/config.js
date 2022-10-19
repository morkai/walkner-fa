/* global module */
(function(root)
{
  'use strict';

  const packages = [];

  const paths = {
    'text': 'vendor/require/text',
    'i18n': 'vendor/require/i18n',
    'domReady': 'vendor/require/domReady',
    'css': 'vendor/require-css/css',
    'require-css': 'vendor/require-css',
    'underscore': 'vendor/underscore',
    'jquery': 'vendor/jquery',
    'backbone': 'vendor/backbone',
    'backbone.layout': 'vendor/backbone.layoutmanager',
    'moment': 'vendor/moment/moment',
    'moment-lang': 'vendor/moment/lang',
    'moment-timezone': 'vendor/moment/moment-timezone',
    'bootstrap': 'vendor/bootstrap/js/bootstrap',
    'bootstrap-colorpicker': 'vendor/bootstrap-colorpicker/js/bootstrap-colorpicker',
    'socket.io': 'vendor/socket.io',
    'h5.pubsub': 'vendor/h5.pubsub',
    'h5.rql': 'vendor/h5.rql',
    'form2js': 'vendor/form2js',
    'js2form': 'vendor/js2form',
    'reltime': 'vendor/reltime',
    'select2': 'vendor/select2/select2',
    'select2-lang': 'vendor/select2-lang',
    'zeroclipboard': 'vendor/zeroclipboard/ZeroClipboard',
    'Sortable': 'vendor/Sortable',
    'autolinker': 'vendor/autolinker',
    'getCaretCoordinates': 'vendor/getCaretCoordinates',
    'utf8': 'vendor/utf8'
  };

  var shim = {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'bootstrap': ['jquery'],
    'bootstrap-colorpicker': ['bootstrap'],
    'reltime': {
      exports: 'reltime'
    },
    'select2': {
      deps: ['jquery'],
      exports: 'Select2'
    },
    'getCaretCoordinates': {
      exports: 'getCaretCoordinates'
    },
    'utf8': {
      exports: 'utf8'
    }
  };

  if (typeof module === 'object' && module.exports)
  {
    module.exports = {
      packages,
      paths,
      shim,
      buildPaths: paths,
      buildShim: shim
    };
  }
  else
  {
    let locale = null;

    if (root.localStorage)
    {
      locale = root.localStorage.getItem('LOCALE');
    }

    if (!locale && root.navigator)
    {
      locale = navigator.languages ? navigator.languages[0] : navigator.language;
    }

    if (!locale)
    {
      locale = root.LOCALE;
    }

    if (!locale)
    {
      locale = 'pl';
    }

    locale = locale.split('-')[0];
    locale = locale === 'en' ? 'en' : 'pl';

    root.appLocale = locale;
    root.require = {
      baseUrl: '/',
      packages,
      paths,
      shim,
      waitSeconds: 20,
      config: {
        i18n: {
          locale
        }
      }
    };
  }
})(typeof self !== 'undefined' ? self : this);
