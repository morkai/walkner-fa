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
        id: 'accept',
        className: 'btn-success',
        icon: 'fa-check'
      };
      var reject = {
        id: 'reject',
        className: 'btn-warning',
        icon: 'fa-times'
      };

      var committeeAcceptance = this.model.get('committeeAcceptance');
      var userAcceptance = committeeAcceptance[user.data[user.idProperty]];

      if (userAcceptance)
      {
        if (userAcceptance.status !== true)
        {
          var othersAccepted = _.every(userAcceptance, function(a)
          {
            return a === userAcceptance || userAcceptance.status === true;
          });

          if (othersAccepted || Object.keys(userAcceptance).length === 1)
          {
            accept.title = this.t('FORM:ACTION:acceptCommittee:acceptGo:title');
          }

          actions.push(accept);
        }

        if (userAcceptance.status !== false)
        {
          reject.title = userAcceptance.status
            ? this.t('FORM:ACTION:acceptCommittee:undoAccept:title')
            : this.t('FORM:ACTION:acceptCommittee:reject:title');

          actions.push(reject);
        }
      }

      if (this.model.canManage())
      {
        actions.push({
          id: 'skip',
          className: 'btn-info btn-push-right',
          icon: 'fa-step-forward'
        }, {
          id: 'cancel',
          className: 'btn-danger',
          icon: 'fa-stop'
        });
      }

      return actions;
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
      else if (action === 'skip')
      {
        this.handleSkipAction(formView);
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
        this.model.set('newStage', 'verify');

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
      this.model.set('newStage', 'verify');

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
