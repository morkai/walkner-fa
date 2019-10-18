// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './AssetClass'
], function(
  Collection,
  AssetClass
) {
  'use strict';

  return Collection.extend({

    model: AssetClass,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
