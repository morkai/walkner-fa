// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  './ZplxInputView',
  './AssetsInputView',
  'app/fa-ot/templates/edit/finished'
], function(
  time,
  user,
  idAndLabel,
  setUpUserSelect2,
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
        readOnly: false
      });

      this.assetsView = new AssetsInputView({
        model: this.model,
        forceRequired: true
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-assets', this.assetsView);
    },

    getTemplateData()
    {
      const model = this.model;
      const files = [];

      if (model.get('protocolNeeded'))
      {
        files.push('protocol');
      }

      files.push('outlay');

      if (model.get('usageDestination') === 'external-supplier')
      {
        files.push('certificate', 'nameplate');
      }

      files.push('hrt', 'attachment');

      return {
        model: model.attributes,
        details: model.serializeDetails(),
        files
      };
    },

    getFormActions()
    {
      return [];
    },

    handleFormAction(action, formView) // eslint-disable-line no-unused-vars
    {

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
        protocolDate: this.model.get('protocolNeeded')
          ? time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString()
          : null,
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        postingDate: time.utc.getMoment(formData.postingDate, 'YYYY-MM-DD').toISOString()
      };

      this.zplxView.serializeForm(data);
      this.assetsView.serializeForm(data);

      return data;
    }

  });
});
