'use strict';

exports.packages = [];

exports.paths = {
  'text': 'vendor/require/text',
  'i18n': 'vendor/require/i18n',
  'domReady': 'vendor/require/domReady',
  'css': 'vendor/require-css/css',
  'require-css': 'vendor/require-css',
  'underscore': 'vendor/underscore',
  'jquery': 'vendor/jquery',
  'jquery.stickytableheaders': 'vendor/jquery.stickytableheaders',
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

exports.shim = {
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
  'jquery.stickytableheaders': ['jquery'],
  'getCaretCoordinates': {
    exports: 'getCaretCoordinates'
  },
  'utf8': {
    exports: 'utf8'
  }
};

exports.buildPaths = exports.paths;
exports.buildShim = exports.shim;
