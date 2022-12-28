// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/fa-common/util/helpers',
  'app/fa-ot/templates/details'
], function(
  DetailsView,
  helpers,
  template
) {
  'use strict';

  return DetailsView.extend({

    template,

    events: {

      'click li[data-asset-id]'(e)
      {
        this.activeAssetId = e.currentTarget.dataset.assetId;

        this.$id('assets').find('.active').removeClass('active');
        e.currentTarget.classList.add('active');
        this.$id(this.activeAssetId).addClass('active');
      }

    },

    initialize()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      helpers.extend(this);

      this.activeAssetId = null;
    },

    serialize()
    {
      const data = DetailsView.prototype.serialize.apply(this, arguments);

      data.details = data.model;
      data.model = this.model.attributes;
      data.activeAssetId = data.model.assets.some(a => a._id === this.activeAssetId)
        ? this.activeAssetId
        : data.model.assets[0]._id;

      return data;
    }

  });
});
