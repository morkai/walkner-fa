// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ParticipantsInputView',
  'app/fa-lt/templates/edit/acceptOwner'
], function(
  user,
  StageView,
  ParticipantsInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.participantsView = new ParticipantsInputView({
        model: this.model,
        owner: false,
        required: false
      });

      this.setView('#-participants', this.participantsView);
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
          id: 'acceptCommittee',
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
      if (action === 'acceptCommittee')
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
      this.model.set('newStage', this.participantsView.hasAnyParticipants() ? 'acceptCommittee' : 'acceptFinance');

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
      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        comment: (formData.comment || '').trim(),
        committeeAcceptance: {}
      };

      this.participantsView.serializeForm(data);

      data.committee.forEach(function(userInfo)
      {
        data.committeeAcceptance[userInfo[user.idProperty]] = {
          time: new Date(),
          user: userInfo,
          status: null
        };
      });

      return data;
    }

  });
});
