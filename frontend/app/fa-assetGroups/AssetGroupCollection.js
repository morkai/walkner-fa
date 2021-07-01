// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './AssetGroup'
], function(
  Collection,
  AssetGroup
) {
  'use strict';

  return Collection.extend({

    model: AssetGroup,

    rqlQuery: 'sort(evalGroup1,evalGroup5)'

  });
});
