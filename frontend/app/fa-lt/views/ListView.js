// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable is-colored',

    events: Object.assign({

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'no', className: 'is-min', thClassName: 'is-filter', tdClassName: 'text-mono'},
        {id: 'date', className: 'is-min', thClassName: 'is-filter'},
        {id: 'kind', className: 'is-min', thClassName: 'is-filter'},
        {id: 'stage', className: 'is-min', thClassName: 'is-filter'},
        {
          id: 'assetNo',
          className: 'is-min',
          thClassName: 'is-filter',
          tdClassName: 'text-mono',
          titleProperty: 'assetNos'
        },
        {id: 'assetName', className: 'is-min', thClassName: 'is-filter'},
        {id: 'inventoryNo', className: 'is-min', thClassName: 'is-filter', tdClassName: 'text-mono'},
        {id: 'costCenter', className: 'is-min', thClassName: 'is-filter', tdClassName: 'text-mono'},
        '-'
      ];
    }

  });
});
