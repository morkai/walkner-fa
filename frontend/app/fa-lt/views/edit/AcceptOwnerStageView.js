// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-common/views/ValueInputView',
  'app/fa-lt/templates/edit/acceptOwner'
], function(
  View,
  ValueInputView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      var view = this;

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
      var lt = this.model;

      return {
        url: lt.url(),
        kind: lt.get('kind'),
        details: lt.serializeDetails()
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
          id: 'acceptDepartment',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-danger',
          icon: 'fa-times'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'acceptDepartment')
      {
        this.handleAcceptDepartmentAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleAcceptDepartmentAction: function(formView)
    {
      this.model.set('newStage', 'acceptDepartment');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'verify');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    serializeToForm: function(formData)
    {
      if (this.saleValueView)
      {
        this.saleValueView.serializeToForm(formData);
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        comment: (formData.comment || '').trim()
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
