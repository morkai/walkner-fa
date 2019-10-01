// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    events: Object.assign({

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'no', className: 'is-min', thClassName: 'is-filter'},
        {id: 'date', className: 'is-min', thClassName: 'is-filter'},
        {id: 'stage', className: 'is-min', thClassName: 'is-filter'},
        {id: 'sapNo', className: 'is-min', thClassName: 'is-filter'},
        {id: 'assetName', className: 'is-min', thClassName: 'is-filter', label: this.t('list:assetName')},
        {id: 'inventoryNo', className: 'is-min', thClassName: 'is-filter'},
        {id: 'value', className: 'is-min is-number', label: this.t('list:value')},
        {id: 'costCenter', className: 'is-min', thClassName: 'is-filter'},
        '-'
      ];
    }

  });
});
