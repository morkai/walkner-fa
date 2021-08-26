// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/loadedModules',
  'app/core/views/ListView'
], function(
  loadedModules,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'companies.synced': 'render'
    },

    columns: [
      {id: 'login', className: 'is-min', thClassName: 'is-filter'},
      {id: 'lastName', className: 'is-min', thClassName: 'is-filter'},
      {id: 'firstName', className: 'is-min'},
      {
        id: 'active',
        className: 'is-min',
        thClassName: 'is-filter'
      },
      '-'
    ]

  });
});
