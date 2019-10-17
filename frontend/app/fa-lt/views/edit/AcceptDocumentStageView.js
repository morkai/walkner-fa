// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-lt/templates/edit/acceptDocument'
], function(
  time,
  StageView,
  ValueInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      var view = this;

      StageView.prototype.initialize.apply(view, arguments);

      view.saleValueView = view.model.get('kind') !== 'sale' ? null : new ValueInputView({
        property: 'saleValue',
        model: view.model
      });

      if (view.saleValueView)
      {
        view.setView('#-saleValue', view.saleValueView);
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
          id: 'record',
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
      if (action === 'record')
      {
        this.handleRecordAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleRecordAction: function(formView)
    {
      this.model.set('newStage', 'record');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'acceptDepartment');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    serializeToForm: function(formData)
    {
      if (!formData.documentDate)
      {
        formData.documentDate = time.getMoment().format('YYYY-MM-DD');
      }

      if (this.saleValueView)
      {
        this.saleValueView.serializeToForm(formData);
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        comment: (formData.comment || '').trim(),
        documentDate: formData.documentDate
          ? time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString()
          : null
      };

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
