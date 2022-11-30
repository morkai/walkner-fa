// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/views/AssetsInputView',
  'app/fa-lt/FaLt',
  'app/fa-lt/templates/edit/finished'
], function(
  time,
  user,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  StageView,
  ValueInputView,
  AssetsInputView,
  FaLt,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    updateOnChange: false,

    events: {

      'change #-costCenter': function()
      {
        const costCenter = dictionaries.costCenters.get(this.$id('costCenter').val());

        if (!costCenter)
        {
          return;
        }

        const owner = costCenter.get('owner');

        if (!owner)
        {
          return;
        }

        const $owner = this.$id('owner');

        if ($owner.length)
        {
          $owner.select2('data', {
            id: owner[user.idProperty],
            text: owner.label
          });
        }
      },


      'click #-previewHrt': function()
      {
        const reqTplId = `lt.${this.model.get('kind')}`;
        const docNo = (this.model.get('documentNo') || this.model.get('protocolNo')).replace(/\//g, '_');

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

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.valueViews = {
        initialValue: new ValueInputView({
          property: 'initialValue',
          model: this.model
        }),
        deprecationValue: new ValueInputView({
          property: 'deprecationValue',
          model: this.model
        }),
        netValue: new ValueInputView({
          property: 'netValue',
          readOnly: true,
          required: false,
          model: this.model
        }),
        economicInitialValue: new ValueInputView({
          property: 'economicInitialValue',
          model: this.model
        }),
        economicDeprecationValue: new ValueInputView({
          property: 'economicDeprecationValue',
          model: this.model
        }),
        economicNetValue: new ValueInputView({
          property: 'economicNetValue',
          readOnly: true,
          required: false,
          model: this.model
        })
      };

      if (this.model.get('kind') === 'sale')
      {
        this.valueViews.saleValue = new ValueInputView({
          property: 'saleValue',
          model: this.model
        });
      }

      this.assetsView = new AssetsInputView({
        model: this.model,
        required: true
      });

      Object.keys(this.valueViews).forEach(prop =>
      {
        this.setView(`#-${prop}`, this.valueViews[prop]);
      });

      this.setView('#-assets', this.assetsView);

      this.listenTo(this.valueViews.initialValue, 'change', this.updateFiscalNetValue);
      this.listenTo(this.valueViews.deprecationValue, 'change', this.updateFiscalNetValue);
      this.listenTo(this.valueViews.economicInitialValue, 'change', this.updateEconomicNetValue);
      this.listenTo(this.valueViews.economicDeprecationValue, 'change', this.updateEconomicNetValue);
    },

    getTemplateData: function()
    {
      const lt = this.model;
      const files = [];

      if (lt.get('kind') === 'sale')
      {
        files.push('handover', 'invoice');
      }

      files.push('hrt', 'attachment');

      return {
        mergeTypes: FaLt.MERGE_TYPES,
        model: lt.toJSON(),
        details: lt.serializeDetails(),
        files
      };
    },

    afterRender: function()
    {
      this.setUpCostCenterSelect2();
      this.setUpUserSelect2(this.$id('owner'), this.model.get('owner'));
      this.setUpUserSelect2(this.$id('applicant'), this.model.get('applicant'));
      this.setUpUserSelect2(this.$id('committee'), this.model.get('committee'), {
        collection: dictionaries.committee,
        multiple: true
      });
    },

    setUpCostCenterSelect2: function()
    {
      const id = this.model.get('costCenter');
      const model = dictionaries.costCenters.get(id);
      const data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.costCenters.forEach(d =>
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
        data
      });
    },

    setUpUserSelect2: function($input, users, options)
    {
      setUpUserSelect2($input, Object.assign({
        width: '100%'
      }, options));

      if (users)
      {
        if (!Array.isArray(users))
        {
          users = [users];
        }

        var data = users.map(u =>
        {
          return {
            id: u._id,
            text: u.label
          };
        });

        $input.select2('data', options && options.multiple ? data : data[0]);
      }
    },

    getFormActions: function()
    {
      return [];
    },

    handleFormAction: function(action, formView) // eslint-disable-line no-unused-vars
    {

    },

    serializeToForm: function(formData)
    {
      Object.keys(this.valueViews).forEach(prop =>
      {
        this.valueViews[prop].serializeToForm(formData);
      })

      this.assetsView.serializeToForm(formData);

      return formData;
    },

    serializeForm: function(formData)
    {
      const kind = this.model.get('kind');
      const data = {
        protocolDate: time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString(),
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        postingDate: time.utc.getMoment(formData.postingDate, 'YYYY-MM-DD').toISOString(),
        valuationDate: formData.valuationDate
          ? time.utc.getMoment(formData.valuationDate, 'YYYY-MM-DD').toISOString()
          : null,
        inventoryNo: (formData.inventoryNo || '').trim(),
        assetName: (formData.assetName || '').trim(),
        costCenter: formData.costCenter || null,
        owner: setUpUserSelect2.getUserInfo(this.$id('owner')),
        applicant: setUpUserSelect2.getUserInfo(this.$id('applicant')),
        committee: setUpUserSelect2.getUserInfo(this.$id('committee')),
        committeeAcceptance: {},
        cause: (formData.cause || '').trim(),
        subAssetNo: (formData.subAssetNo || '').trim(),
        accountingNo: (formData.accountingNo || '').trim(),
        odwNo: (formData.odwNo || '').trim(),
        tplNotes: (formData.tplNotes || '').trim(),
        comment: (formData.comment || '').trim()
      };

      if (kind === 'merge')
      {
        Object.assign(data, {
          mergeInventoryNo: (formData.mergeInventoryNo || '').trim(),
          mergeLineSymbol: (formData.mergeLineSymbol || '').trim(),
          mergeType: formData.mergeType || null
        });
      }
      else if (kind === 'sale')
      {
        Object.assign(data, {
          buyerName: (formData.buyerName || '').trim(),
          buyerAddress: (formData.buyerAddress || '').trim()
        });
      }

      const oldCommitteeAcceptance = this.model.get('committeeAcceptance') || {};

      data.committee.forEach(userInfo =>
      {
        const userId = userInfo[user.idProperty];

        data.committeeAcceptance[userId] = oldCommitteeAcceptance[userId] || {
          time: new Date(),
          user: userInfo,
          status: null
        };
      });

      Object.keys(this.valueViews).forEach(prop =>
      {
        this.valueViews[prop].serializeForm(data);
      });

      this.assetsView.serializeForm(data);

      return data;
    },

    updateFiscalNetValue: function()
    {
      const formData = {};

      this.valueViews.initialValue.serializeForm(formData);
      this.valueViews.deprecationValue.serializeForm(formData);
      this.valueViews.netValue.setValue(formData.initialValue - formData.deprecationValue);
    },

    updateEconomicNetValue: function()
    {
      const formData = {};

      this.valueViews.economicInitialValue.serializeForm(formData);
      this.valueViews.economicDeprecationValue.serializeForm(formData);
      this.valueViews.economicNetValue.setValue(formData.economicInitialValue - formData.economicDeprecationValue);
    }

  });
});
