// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/Model',
  'app/core/View',
  'app/core/util/uuid',
  'app/fa-ot/FaOt',
  'app/fa-ot/views/edit/AssetInputView',
  'app/fa-ot/templates/edit/assets'
], function(
  $,
  Model,
  View,
  uuid,
  FaOt,
  AssetInputView,
  template
) {
  'use strict';

  return View.extend({

    template,

    fields: {},

    events: {

      'click li[data-asset-id]'(e)
      {
        this.activateAssetView(e.currentTarget.dataset.assetId);
      },

      'click #-addAsset'(e)
      {
        e.target.blur();

        if (e.currentTarget.classList.contains('disabled'))
        {
          return;
        }

        const newAsset = FaOt.createNewAsset();

        this.renderAsset(newAsset);
        this.activateAssetView(newAsset._id);
        this.toggleActions();
        this.model.trigger('dirty');
      },

      'click #-copyAsset'(e)
      {
        e.target.blur();

        if (e.currentTarget.classList.contains('disabled'))
        {
          return;
        }

        const sourceAssetView = this.getAssetView(this.activeAssetId);
        const sourceAsset = sourceAssetView.serializeForm();
        const targetAsset = {
          ...sourceAsset,
          _id: uuid()
        };
        const copySuffix = this.t('FORM:assets:copy:suffix');

        if (targetAsset.assetName && !targetAsset.assetName.endsWith(copySuffix))
        {
          targetAsset.assetName += ` ${copySuffix}`;
        }

        this.renderAsset(targetAsset);
        this.activateAssetView(targetAsset._id);
        this.toggleActions();
        this.model.trigger('dirty');
      },

      'click #-deleteAsset'(e)
      {
        e.target.blur();

        if (e.currentTarget.classList.contains('disabled'))
        {
          return;
        }

        const assetView = this.getAssetView(this.activeAssetId);
        const $tab = this.$(`li[data-asset-id="${this.activeAssetId}"]`);
        const $prev = $tab.prev('[data-asset-id]');

        if ($prev.length)
        {
          $prev.click();
        }
        else
        {
          const $next = $tab.next('[data-asset-id]');

          if ($next.length)
          {
            $next.click();
          }
          else
          {
            return;
          }
        }

        $tab.remove();
        assetView.remove();

        this.$('li[data-asset-id]').each((i, el) =>
        {
          el.querySelector('a').textContent = i + 1;
        });

        this.toggleActions();
        this.model.trigger('dirty');
      }

    },

    initialize()
    {
      this.required = false;
      this.activeAssetId = this.model.get('assets').some(a => a._id === this.activeAssetId)
        ? this.activeAssetId
        : this.model.get('assets')[0]._id;
      this.assetI = 0;
      this.properties = {};
      this.fields = {};

      this.resolvePropertiesAndFields();

      this.listenTo(this.model, 'required', required =>
      {
        this.required = required;
        this.checkValidity();
      });
    },

    resolvePropertiesAndFields()
    {
      const properties = {};
      const fields = {};
      const protocolNeeded = this.model.get('protocolNeeded');
      const usageDestination = this.model.get('usageDestination');
      const factory = usageDestination === 'factory';
      const externalSupplier = usageDestination === 'external-supplier';
      const commissioningType = this.model.get('commissioningType');
      const newAsset = commissioningType === 'new-asset';
      const incAsset = commissioningType === 'inc-asset';

      switch (this.model.get('stage'))
      {
        case 'protocol':
        {
          fields.assetName = 'required';
          fields.lineSymbol = factory ? 'optional' : null;
          fields.inventoryNo = incAsset ? 'required' : null;
          fields.serialNo = 'optional';
          fields.supplier = newAsset ? 'required' : null;
          fields.photoFile = newAsset ? 'optional' : null;

          break;
        }

        case 'document':
        {
          fields.assetName = 'required';
          fields.lineSymbol = factory ? 'optional' : null;
          fields.inventoryNo = incAsset ? 'required' : null;
          fields.serialNo = 'optional';
          fields.supplier = newAsset && externalSupplier ? 'optional' : 'required';
          fields.value = 'required';
          fields.costCenter = 'required';
          fields.owner = protocolNeeded ? null : 'required';
          fields.vendor = externalSupplier ? 'required' : null;
          fields.photoFile = newAsset ? 'optional' : null;

          break;
        }

        case 'verify':
        {
          properties.lineSymbol = factory;
          properties.serialNo = true;
          properties.owner = protocolNeeded;
          properties.supplier = true;
          properties.value = true;
          properties.costCenter = true;
          properties.vendor = externalSupplier;
          properties.photoFile = newAsset;

          fields.assetName = 'required';
          fields.inventoryNo = 'required';
          fields.assetClass = 'required';
          fields.transactions = 'required';
          fields.tplNotes = 'optional';

          break;
        }

        case 'accept':
        {
          properties.assetName = true;
          properties.lineSymbol = factory;
          properties.inventoryNo = true;
          properties.serialNo = true;
          properties.owner = protocolNeeded;
          properties.supplier = true;
          properties.value = true;
          properties.costCenter = true;
          properties.vendor = externalSupplier;
          properties.assetClass = true;
          properties.transactions = true;
          properties.tplNotes = true;
          properties.photoFile = newAsset;

          break;
        }

        case 'record':
        {
          properties.assetName = true;
          properties.lineSymbol = factory;
          properties.inventoryNo = true;
          properties.serialNo = true;
          properties.owner = protocolNeeded;
          properties.supplier = true;
          properties.value = true;
          properties.costCenter = true;
          properties.vendor = externalSupplier;
          properties.assetClass = true;
          properties.transactions = true;
          properties.tplNotes = true;
          properties.photoFile = newAsset;

          fields.assetNo = 'required';
          fields.accountingNo = 'required';
          fields.odwNo = 'required';

          break;
        }

        case 'finished':
        {
          fields.assetName = 'required';
          fields.lineSymbol = factory ? 'optional' : null;
          fields.inventoryNo = 'required';
          fields.serialNo = 'optional';
          fields.supplier = newAsset && externalSupplier ? 'optional' : 'required';
          fields.value = 'required';
          fields.costCenter = 'required';
          fields.owner = protocolNeeded ? null : 'required';
          fields.vendor = externalSupplier ? 'optional' : null;
          fields.assetClass = 'required';
          fields.transactions = 'required';
          fields.assetNo = 'required';
          fields.accountingNo = 'required';
          fields.odwNo = 'required';
          fields.tplNotes = 'optional';
          fields.photoFile = newAsset ? 'optional' : null;

          break;
        }
      }

      this.properties = properties;
      this.fields = fields;
    },

    getTemplateData()
    {
      return {
        canManageAssets: ['protocol', 'document', 'finished'].includes(this.model.get('stage'))
      };
    },

    afterRender()
    {
      this.renderAssets();
    },

    toggleActions()
    {
      const $tabs = this.$('li[data-asset-id]');

      this.$id('addAsset').toggleClass('disabled', $tabs.length === 15);
      this.$id('copyAsset').toggleClass('disabled', $tabs.length === 15);
      this.$id('deleteAsset').toggleClass('disabled', $tabs.length === 1);
    },

    renderAssets()
    {
      this.removeView('#-assets');
      this.$('li[data-asset-id]').remove();

      this.model.get('assets').forEach(asset =>
      {
        this.renderAsset(asset);
      });

      this.toggleActions();
    },

    renderAsset(asset)
    {
      const $tabs = this.$('li[data-asset-id]');
      const cls = asset._id === this.activeAssetId ? 'active' : '';
      const label = $tabs.length + 1;
      const $tab = $(`<li class="${cls}" data-asset-id="${asset._id}"><a href="javascript:void(0)">${label}</a></li>`);

      if ($tabs.length)
      {
        $tab.insertAfter($tabs.last());
      }
      else
      {
        this.$('.nav-tabs').prepend($tab);
      }

      const assetView = new AssetInputView({
        model: this.model,
        asset,
        assetI: ++this.assetI,
        properties: this.properties,
        fields: this.fields,
        isActive: () => asset._id === this.activeAssetId,
        forceRequired: this.options.forceRequired
      });

      this.insertView('#-assets', assetView);

      if (!assetView.isRendered())
      {
        assetView.render();
      }
    },

    getAssetViews()
    {
      return this.getViews('#-assets').value();
    },

    getAssetView(assetId)
    {
      return this.getAssetViews().find(assetView => assetView.asset._id === assetId);
    },

    activateAssetView(assetId)
    {
      this.activeAssetId = assetId;

      this.$('.nav-tabs').find('.active').removeClass('active');
      this.$('.tab-pane.active').removeClass('active');
      this.$(`li[data-asset-id="${assetId}"]`).addClass('active');
      this.getAssetView(assetId).el.classList.add('active');
    },

    checkValidity()
    {
      const assetViews = this.getAssetViews();
      let firstInvalidAssetView = null;

      assetViews.forEach(assetView =>
      {
        assetView.checkValidity(this.required);

        const $invalidInput = assetView.$el.find('input:invalid, textarea:invalid, select:invalid').first();

        if (!firstInvalidAssetView && $invalidInput.length)
        {
          firstInvalidAssetView = assetView;
        }
      });

      if (firstInvalidAssetView)
      {
        this.activateAssetView(firstInvalidAssetView.asset._id);
      }
    },

    serializeToForm()
    {

    },

    serializeForm(data)
    {
      data.assets = this.getAssetViews().map(assetView => assetView.serializeForm());
    }

  });
});
