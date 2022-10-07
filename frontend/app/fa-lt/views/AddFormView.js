// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/time',
  'app/viewport',
  'app/user',
  'app/core/views/FormView',
  'app/fa-common/dictionaries',
  '../FaLt',
  'app/fa-lt/templates/addForm'
], function(
  require,
  time,
  viewport,
  currentUser,
  FormView,
  dictionaries,
  FaLt,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    localTopics: {
      'user.reloaded': 'render'
    },

    events: {

      'change input[name="kind"]'()
      {
        this.toggleKind();
      },

      'change input[name="mergeType"]'()
      {
        this.toggleMergeType();
      },

      ...FormView.prototype.events
    },

    getTemplateData()
    {
      return {
        kinds: FaLt.KINDS,
        mergeTypes: FaLt.MERGE_TYPES
      };
    },

    afterRender()
    {
      FormView.prototype.afterRender.call(this);

      this.toggleKind();
      this.toggleMergeType();
    },

    handleSuccess()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl('edit'),
        trigger: true,
        replace: false
      });
    },

    toggleKind()
    {
      var view = this;
      var kind = view.$('input[name="kind"]:checked').val();
      var anyVisible = false;

      view.$('div[data-kind]').each(function()
      {
        var visible = this.dataset.kind === kind;

        this.classList.toggle('hidden', !visible);

        view.$(this).find('[data-required]').each(function()
        {
          this.required = visible;
        });

        anyVisible = anyVisible || visible;
      });

      this.$('.panel-body').toggleClass('has-lastElementRow', !anyVisible);
    },

    toggleMergeType()
    {
      var view = this;
      var mergeType = view.$('input[name="mergeType"]:checked').val();
      var placeholder = mergeType === 'full' ? '' : view.t('FORM:add:mergeNotes:placeholder');

      view.$id('mergeNotes').prop('placeholder', placeholder);
    },

    serializeForm(formData)
    {
      formData.comment = formData.otherNotes || formData.mergeNotes || '';

      delete formData.otherNotes;
      delete formData.mergeNotes;

      return formData;
    },

    submitRequest($submitEl, formData)
    {
      const EditFormPage = require('app/fa-lt/pages/EditFormPage');
      const date = time.getMoment().startOf('day').utc(true).toISOString();
      const createdAt = new Date().toISOString();
      const createdBy = currentUser.getInfo();
      const changes = [];

      if (formData.comment)
      {
        changes.push({
          date: createdAt,
          user: createdBy,
          data: {},
          comment: formData.comment
        });
      }

      this.model.set({
        createdAt,
        createdBy,
        updatedAt: null,
        updatedBy: null,
        stage: 'protocol',
        stageChangedAt: {},
        stageChangedBy: {},
        kind: formData.kind,
        protocolNo: '',
        protocolNoInc: 0,
        documentNo: '',
        documentNoInc: 0,
        date,
        protocolDate: date,
        documentDate: null,
        inventoryNo: '',
        assetName: '',
        assetNameSearch: '',
        costCenter: null,
        owner: null,
        applicant: null,
        committee: [],
        committeeAcceptance: {},
        cause: '',
        initialValue: 0,
        deprecationValue: 0,
        netValue: 0,
        economicInitialValue: 0,
        economicDeprecationValue: 0,
        economicNetValue: 0,
        mergeInventoryNo: formData.mergeInventoryNo || '',
        mergeLineSymbol: formData.mergeLineSymbol || '',
        mergeType: formData.mergeType || null,
        buyerName: '',
        buyerNameSearch: '',
        buyerAddress: '',
        saleValue: 0,
        postingDate: null,
        valuationDate: null,
        assets: [],
        subAssetNo: '',
        accountingNo: '',
        odwNo: '',
        tplNotes: '',
        invoiceFile: null,
        handoverFile: null,
        hrtFile: null,
        attachmentFile: null,
        users: [],
        comment: formData.comment || '',
        changes
      });

      viewport.showPage(dictionaries.bind(new EditFormPage({
        model: this.model
      })));
    }

  });
});
