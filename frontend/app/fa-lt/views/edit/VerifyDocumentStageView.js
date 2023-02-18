// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-lt/views/edit/AssetsInputView',
  'app/fa-lt/templates/edit/verifyDocument'
], function(
  time,
  StageView,
  ValueInputView,
  AssetsInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    events: {
      'click #-previewHrt'()
      {
        const reqTplId = `lt.${this.model.get('kind')}`;
        const docNo = (this.model.get('documentNo') || this.model.get('protocolNo')).replace(/\//g, '_');

        this.$id('previewHrt').prop('disabled', false);

        const $submit = this.formView.$id('submit');

        if ($submit.prop('disabled'))
        {
          previewHrt();
        }
        else
        {
          this.formView.dontRedirectAfterSubmit = true;

          $submit.click();

          this.once('afterRender', previewHrt);
        }

        function previewHrt()
        {
          window.open(`/fa/reqTpls/${reqTplId};preview?doc=${docNo}`);
        }
      }
    },

    updateOnChange: false,

    initialize()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.assetsView = new AssetsInputView({
        model: this.model,
        required: true
      });

      this.saleValueView = this.model.get('kind') !== 'sale' ? null : new ValueInputView({
        property: 'saleValue',
        model: this.model
      });

      this.setView('#-assets', this.assetsView);

      if (this.saleValueView)
      {
        this.setView('#-saleValue', this.saleValueView);
      }
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
          icon: 'fa-times',
          actions: ['protocol', 'verify', 'acceptOwner', 'acceptFinance', 'acceptDepartment']
        },
        {
          id: 'cancel',
          className: 'btn-danger',
          icon: 'fa-stop'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'accept')
      {
        formView.handleNewStageAction('acceptDocument');
      }
      else if (action === 'reject')
      {
        formView.handleNewStageAction('verify', {submit: {toggleRequired: false}});
      }
      else if (action === 'protocol'
        || action === 'verify'
        || action === 'acceptOwner'
        || action === 'acceptFinance'
        || action === 'acceptDepartment')
      {
        formView.handleNewStageAction(action, {submit: {toggleRequired: false}});
      }
    },

    serializeToForm: function(formData)
    {
      this.assetsView.serializeToForm(formData);

      if (this.saleValueView)
      {
        this.saleValueView.serializeToForm(formData);
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      const data = {
        postingDate: formData.postingDate
          ? time.utc.getMoment(formData.postingDate, 'YYYY-MM-DD').toISOString()
          : null,
        valuationDate: formData.valuationDate
          ? time.utc.getMoment(formData.valuationDate, 'YYYY-MM-DD').toISOString()
          : null,
        subAssetNo: (formData.subAssetNo || '').trim(),
        tplNotes: (formData.tplNotes || '').trim(),
        comment: (formData.comment || '').trim()
      };

      this.assetsView.serializeForm(data);

      if (this.saleValueView)
      {
        Object.assign(data, {
          buyerName: (formData.buyerName || '').trim(),
          buyerAddress: (formData.buyerAddress || '').trim()
        });

        this.saleValueView.serializeForm(data);
      }

      return data;
    }

  });
});
