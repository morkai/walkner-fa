// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/document'
], function(
  time,
  user,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  StageView,
  ValueInputView,
  ZplxInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    events: {

      'change #-costCenter': function()
      {
        var costCenter = dictionaries.costCenters.get(this.$id('costCenter').val());

        if (!costCenter)
        {
          return;
        }

        var owner = costCenter.get('owner');

        if (!owner)
        {
          return;
        }

        var $owner = this.$id('owner');

        if ($owner.length)
        {
          $owner.select2('data', {
            id: owner[user.idProperty],
            text: owner.label
          });
        }
      }

    },

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: true,
        auc: false,
        readOnly: false
      });
      this.valueView = new ValueInputView({model: this.model});

      this.setView('#-zplx', this.zplxView);
      this.setView('#-value', this.valueView);

      this.listenTo(this.zplxView, 'change', this.onZplxChange);
    },

    getTemplateData: function()
    {
      return {
        model: this.model.toJSON(),
        details: this.model.serializeDetails()
      };
    },

    getFormActions: function()
    {
      var actions = [];

      if (this.model.canEdit())
      {
        actions.push({
          id: 'nextStep',
          className: 'btn-success',
          icon: 'fa-check'
        });
      }

      if (!this.model.get('protocolNeeded') && this.model.canCancel())
      {
        actions.push({
          id: 'cancel',
          className: 'btn-danger btn-push-right',
          icon: 'fa-stop'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'nextStep')
      {
        this.handleNextStepAction(formView);
      }
    },

    handleNextStepAction: function(formView)
    {
      this.model.set('newStage', 'verify');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    afterRender: function()
    {
      this.setUpOwnerSelect2();
      this.setUpCostCenterSelect2();
      this.zplxView.checkValidity();
    },

    setUpOwnerSelect2: function()
    {
      if (this.model.get('protocolNeeded'))
      {
        return;
      }

      var owner = this.model.get('owner');
      var $owner = this.$id('owner');

      setUpUserSelect2($owner);

      if (owner)
      {
        $owner.select2('data', {
          id: owner._id,
          text: owner.label
        });
      }
    },

    setUpCostCenterSelect2: function()
    {
      var id = this.model.get('costCenter');
      var model = dictionaries.costCenters.get(id);
      var data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.costCenters.forEach(function(d)
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('costCenter').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: data
      });
    },

    serializeToForm: function(formData)
    {
      if (!formData.documentDate)
      {
        formData.documentDate = time.getMoment().format('YYYY-MM-DD');
      }

      if (!formData.costCenter
        && this.model.get('usageDestination') === 'external-supplier'
        && dictionaries.costCenters.get('PL02AD13'))
      {
        formData.costCenter = 'PL02AD13';
      }

      this.zplxView.serializeToForm(formData);
      this.valueView.serializeToForm(formData);

      return formData;
    },

    serializeForm: function(formData)
    {
      var usageDestination = this.model.get('usageDestination');
      var data = {
        comment: (formData.comment || '').trim(),
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        assetName: (formData.assetName || '').trim(),
        supplier: (formData.supplier || '').trim(),
        costCenter: formData.costCenter || null,
        serialNo: (formData.serialNo || '').trim()
      };

      if (this.model.get('commissioningType') === 'inc-asset')
      {
        data.inventoryNo = (formData.inventoryNo || '').trim();
      }

      if (this.model.get('protocolNeeded'))
      {
        var costCenter = dictionaries.costCenters.get(data.costCenter);

        if (costCenter)
        {
          var owner = costCenter.get('owner');

          if (owner)
          {
            data.owner = owner;
          }
        }
      }
      else
      {
        data.owner = setUpUserSelect2.getUserInfo(this.$id('owner'));
      }

      if (usageDestination === 'factory')
      {
        Object.assign(data, {
          lineSymbol: (formData.lineSymbol || '').trim()
        });
      }
      else if (usageDestination === 'external-supplier')
      {
        Object.assign(data, {
          vendorNo: (formData.vendorNo || '').trim(),
          vendorName: (formData.vendorName || '').trim()
        });
      }

      this.zplxView.serializeForm(data);
      this.valueView.serializeForm(data);

      return data;
    },

    onZplxChange: function()
    {
      this.valueView.setValue(this.zplxView.getTotalValue());
    }

  });
});
