// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Destination'
], function(
  Collection,
  Destination
) {
  'use strict';

  return Collection.extend({

    model: Destination,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
