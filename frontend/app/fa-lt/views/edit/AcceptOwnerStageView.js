// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  'app/fa-common/views/ParticipantsInputView',
  'app/fa-lt/templates/edit/acceptOwner'
], function(
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
          id: 'acceptFinance',
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
      if (action === 'acceptFinance')
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
      this.model.set('newStage', 'acceptFinance');

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
        comment: (formData.comment || '').trim()
      };

      this.participantsView.serializeForm(data);

      return data;
    }

  });
});
