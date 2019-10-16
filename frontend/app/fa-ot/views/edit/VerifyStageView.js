// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/ValueInputView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/verify'
], function(
  View,
  idAndLabel,
  dictionaries,
  ValueInputView,
  ZplxInputView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    events: {
      'change #-deprecationRate': function(e)
      {
        var rr = +e.target.value;

        if (!rr || rr < 0)
        {
          rr = 0;
        }

        if (rr > 100)
        {
          rr = 100;
        }

        e.target.value = rr;

        var ratio = 100 / rr;
        var years = Math.floor(ratio);
        var months = Math.ceil(12 * (ratio % 1));

        this.$id('fiscalPeriodY').val(years && isFinite(years) ? years : '0');
        this.$id('fiscalPeriodM').val(months && isFinite(months) ? months : '0');
      },
      'blur #-economicPeriodM': function(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        var $y = this.$id('economicPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      }
    },

    initialize: function()
    {
      this.zplxView = new ZplxInputView({
        model: this.model,
        readOnly: true,
        auc: true
      });
      this.fiscalValueView = new ValueInputView({
        model: this.model,
        property: 'fiscalValue',
        required: true
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-fiscalValue', this.fiscalValueView);
    },

    getTemplateData: function()
    {
      var ot = this.model;

      return {
        url: ot.url(),
        protocolNeeded: ot.get('protocolNeeded'),
        commissioningType: ot.get('commissioningType'),
        usageDestination: ot.get('usageDestination'),
        details: ot.serializeDetails()
      };
    },

    getFormActions: function()
    {
      if (!this.model.canEdit())
      {
        return [];
      }

      return [
        {
          id: 'accept',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-warning',
          icon: 'fa-times'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'accept')
      {
        this.handleAcceptAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleAcceptAction: function(formView)
    {
      this.model.set('newStage', 'accept');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'document');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    afterRender: function()
    {
      this.setUpDestinationSelect2();
      this.zplxView.checkValidity();
    },

    setUpDestinationSelect2: function()
    {
      var id = this.model.get('destination');
      var model = dictionaries.destinations.get(id);
      var data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.destinations.forEach(function(d)
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('destination').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: data
      });
    },

    serializeToForm: function(formData)
    {
      this.zplxView.serializeToForm(formData);
      this.fiscalValueView.serializeToForm(formData);

      formData.economicPeriodY = Math.floor(formData.economicPeriod / 12);
      formData.economicPeriodM = formData.economicPeriod % 12;
      formData.fiscalPeriodY = Math.floor(formData.fiscalPeriod / 12);
      formData.fiscalPeriodM = formData.fiscalPeriod % 12;

      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        assetName: (formData.assetName || '').trim(),
        destination: formData.destination || null,
        inventoryNo: (formData.inventoryNo || '').trim(),
        deprecationRate: Math.min(100, Math.max(parseInt(formData.deprecationRate, 10) || 0, 0)),
        economicPeriod: ((+formData.economicPeriodY || 0) * 12) + (+formData.economicPeriodM || 0),
        fiscalPeriod: ((+formData.fiscalPeriodY || 0) * 12) + (+formData.fiscalPeriodM || 0),
        comment: (formData.comment || '').trim()
      };

      this.zplxView.serializeForm(data);
      this.fiscalValueView.serializeForm(data);

      return data;
    }

  });
});
