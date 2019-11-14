// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/fa-common/views/StageView',
  'app/fa-lt/templates/edit/acceptCommittee'
], function(
  _,
  user,
  StageView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

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
      var accept = {
        id: 'committee:accept',
        className: 'btn-success',
        icon: 'fa-check'
      };
      var reject = {
        id: 'committee:reject',
        className: 'btn-warning',
        icon: 'fa-times'
      };

      var committeeAcceptance = this.model.get('committeeAcceptance');
      var userAcceptance = committeeAcceptance[user.data[user.idProperty]];

      if (userAcceptance)
      {
        if (userAcceptance.status !== true)
        {
          actions.push(accept);
        }

        if (userAcceptance.status !== false)
        {
          actions.push(reject);
        }
      }

      if (this.model.canManage())
      {
        actions.push({
          id: 'committee:skip',
          className: 'btn-info btn-push-right',
          icon: 'fa-step-forward'
        }, {
          id: 'committee:cancel',
          className: 'btn-danger',
          icon: 'fa-stop'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'committee:accept')
      {
        this.handleAcceptAction(formView);
      }
      else if (action === 'committee:reject')
      {
        this.handleRejectAction(formView);
      }
      else if (action === 'committee:skip')
      {
        this.handleSkipAction(formView);
      }
      else if (action === 'committee:cancel')
      {
        this.handleCancelAction(formView);
      }
    },

    handleAcceptAction: function(formView)
    {
      var committeeAcceptance = this.model.get('committeeAcceptance');

      committeeAcceptance[user.data[user.idProperty]] = {
        time: new Date(),
        user: user.getInfo(),
        status: true
      };

      if (_.every(committeeAcceptance, function(a) { return a.status; }))
      {
        this.model.set('newStage', 'acceptFinance');

        formView.handleNextRequest = function()
        {
          formView.model.set('newStage', null);
        };

        formView.submit();
      }
      else
      {
        formView.submit({toggleRequired: false});
      }
    },

    handleRejectAction: function(formView)
    {
      var committeeAcceptance = this.model.get('committeeAcceptance');

      committeeAcceptance[user.data[user.idProperty]] = {
        time: new Date(),
        user: user.getInfo(),
        status: false
      };

      formView.submit({toggleRequired: false});
    },

    handleSkipAction: function(formView)
    {
      this.model.set('newStage', 'acceptFinance');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    handleCancelAction: function(formView)
    {
      this.model.set('newStage', 'cancelled');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    serializeToForm: function(formData)
    {
      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        comment: (formData.comment || '').trim()
      };

      return data;
    }

  });
});
