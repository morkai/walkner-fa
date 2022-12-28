// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  './ZplxInputView',
  './AssetsInputView',
  'app/fa-ot/templates/edit/verify'
], function(
  t,
  time,
  idAndLabel,
  dictionaries,
  StageView,
  ZplxInputView,
  AssetsInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    events: {
      'click #-previewHrt'()
      {
        const reqTplId = `ot.${this.model.get('commissioningType')}`;
        const docNo = this.model.get('documentNo').replace(/\//g, '_');

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

    initialize()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: false,
        auc: true,
        readOnly: true
      });

      this.assetsView = new AssetsInputView({
        model: this.model
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-assets', this.assetsView);
    },

    getTemplateData()
    {
      return {
        model: this.model.toJSON(),
        details: this.model.serializeDetails()
      };
    },

    getFormActions()
    {
      if (!this.model.canEdit())
      {
        return [];
      }

      const rejectActions = ['document'];

      if (this.model.get('protocolNeeded'))
      {
        rejectActions.push('protocol');
      }

      return [
        {
          id: 'nextStep',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-warning',
          icon: 'fa-times',
          actions: rejectActions
        }
      ];
    },

    handleFormAction(action, formView)
    {
      if (action === 'nextStep')
      {
        formView.handleNewStageAction('accept');
      }
      else if (action === 'protocol' || action === 'document')
      {
        formView.handleNewStageAction(action, {submit: {toggleRequired: false}});
      }
    },

    afterRender()
    {
      this.zplxView.checkValidity();
      this.assetsView.checkValidity();
    },

    serializeToForm(formData)
    {
      this.zplxView.serializeToForm(formData);
      this.assetsView.serializeToForm(formData);

      return formData;
    },

    serializeForm(formData)
    {
      const data = {
        comment: (formData.comment || '').trim(),
        postingDate: formData.postingDate
          ? time.utc.getMoment(formData.postingDate, 'YYYY-MM-DD').toISOString()
          : null
      };

      this.zplxView.serializeForm(data);
      this.assetsView.serializeForm(data);

      return data;
    }

  });
});
