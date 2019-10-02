// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-lt/templates/edit/protocol'
], function(
  time,
  user,
  View,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    getTemplateData: function()
    {
      return {
        details: this.model.serializeDetails()
      };
    },

    afterRender: function()
    {
      var view = this;

      view.setUpCostCenterSelect2();
      view.setUpUserSelect2(view.$id('applicant'), view.model.get('applicant'));
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

    setUpUserSelect2: function($input, userData)
    {
      setUpUserSelect2($input, {
        width: '100%'
      });

      if (!userData)
      {
        userData = user.getInfo();
      }

      if (userData)
      {
        $input.select2('data', {
          id: userData._id,
          text: userData.label
        });
      }
    },

    getFormActions: function()
    {
      var actions = [];

      if (this.model.canEdit())
      {
        actions.push({
          id: 'verify',
          className: 'btn-success',
          icon: 'fa-check'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'verify')
      {
        this.handleVerifyAction(formView);
      }
    },

    handleVerifyAction: function(formView)
    {
      this.model.set('newStage', 'verify');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    serializeForm: function(formData)
    {
      return {
        comment: (formData.comment || '').trim(),
        date: time.utc.getMoment(formData.date, 'YYYY-MM-DD').toISOString(),
        inventoryNo: (formData.inventoryNo || '').trim(),
        assetName: (formData.assetName || '').trim(),
        costCenter: formData.costCenter || null,
        applicant: setUpUserSelect2.getUserInfo(this.$id('applicant')),
        cause: (formData.cause || '').trim()
      };
    }

  });
});
