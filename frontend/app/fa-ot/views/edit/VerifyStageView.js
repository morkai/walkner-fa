// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/TransactionsInputView',
  'app/fa-common/views/AssetNameBuilderDialogView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/verify'
], function(
  time,
  idAndLabel,
  dictionaries,
  StageView,
  TransactionsInputView,
  AssetNameBuilderDialogView,
  ZplxInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    updateOnChange: false,

    events: {
      'click #-buildAssetName': function()
      {
        AssetNameBuilderDialogView.showDialog(this);
      },
      'change #-depRate': function()
      {
        this.updatePeriods();
      },
      'blur #-economicPeriodM': function(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        const $y = this.$id('economicPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },
      'blur #-fiscalPeriodM': function(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        const $y = this.$id('fiscalPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },
      'blur #-taxPeriodM': function(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        const $y = this.$id('taxPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },
      'change #-evalGroup1': function()
      {
        this.$id('evalGroup5').select2('data', null);
        this.$id('assetClass').select2('data', null);
        this.setUpEvalGroup5Select2();
      },
      'change #-evalGroup5': function()
      {
        this.selectAssetClass();
      },
      'change #-fiscalDate': function()
      {
        this.$id('taxDate').val(this.$id('fiscalDate').val());
      },
      'change #-depKey': function()
      {
        this.updateMethods();
      },
      'click #-previewHrt': function()
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

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: false,
        auc: true,
        readOnly: true
      });
      this.transactionsView = new TransactionsInputView({
        model: this.model,
        required: true
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-transactions', this.transactionsView);
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
          id: 'nextStep',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-warning',
          icon: 'fa-times',
          actions: ['protocol', 'document']
        }
      ];
    },

    handleFormAction: function(action, formView)
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

    afterRender: function()
    {
      this.setUpEvalGroup1Select2();
      this.setUpEvalGroup5Select2();
      this.setUpAssetClassSelect2();
      this.setUpDepKeySelect2();
      this.setUpEconomicMethodSelect2();
      this.zplxView.checkValidity();
    },

    setUpEvalGroup1Select2: function()
    {
      const evalGroup1 = this.model.get('evalGroup1');
      const data = new Set();

      if (evalGroup1)
      {
        data.add(evalGroup1);
      }

      dictionaries.assetGroups.forEach(g =>
      {
        if (!g.get('active'))
        {
          return;
        }

        data.add(g.get('evalGroup1'));
      });

      this.$id('evalGroup1').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: Array.from(data)
          .sort((a, b) => a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true}))
          .map(g => ({id: g, text: g}))
      });
    },

    setUpEvalGroup5Select2: function()
    {
      const $evalGroup5 = this.$id('evalGroup5');
      const evalGroup1 = this.$id('evalGroup1').val();
      const evalGroup5 = $evalGroup5.val();
      const data = new Set();

      if (evalGroup5)
      {
        data.add(evalGroup5);
      }

      dictionaries.assetGroups.forEach(g =>
      {
        if (!g.get('active'))
        {
          return;
        }

        if (g.get('evalGroup1') !== evalGroup1)
        {
          return;
        }

        data.add(g.get('evalGroup5'));
      });

      $evalGroup5.select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: Array.from(data)
          .sort((a, b) => a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true}))
          .map(g => ({id: g, text: g}))
      });
    },

    setUpAssetClassSelect2: function()
    {
      const id = this.$id('assetClass').val();
      const model = dictionaries.assetClasses.get(id);
      const data = [];

      if (id && !model)
      {
        data.push({
          id,
          text: id
        });
      }

      dictionaries.assetClasses.forEach(d =>
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('assetClass').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data
      });
    },

    setUpDepKeySelect2: function()
    {
      const id = this.$id('depKey').val();
      const model = dictionaries.depKeys.get(id);
      const data = [];

      if (id && !model)
      {
        data.push({
          id,
          text: id
        });
      }

      dictionaries.depKeys.forEach(d =>
      {
        if (d.get('active') || d.id === id)
        {
          data.push({
            id: d.id,
            text: d.id
          });
        }
      });

      this.$id('depKey').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data
      });
    },

    setUpEconomicMethodSelect2: function()
    {
      const id = this.$id('economicMethod').val();
      const data = new Set();

      dictionaries.economicMethods.forEach(d =>
      {
        data.add(d);
      });

      if (id && !data.has(id))
      {
        data.add(id);
      }

      this.$id('economicMethod').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: Array.from(data).map(id => ({id, text: id}))
      });
    },

    selectAssetClass: function()
    {
      const evalGroup1 = this.$id('evalGroup1').val();
      const evalGroup5 = this.$id('evalGroup5').val();
      const assetGroup = dictionaries.assetGroups.find(
        g => g.get('evalGroup1') === evalGroup1 && g.get('evalGroup5') === evalGroup5
      );
      const assetClass = !assetGroup ? null : dictionaries.assetClasses.find(
        c => c.get('tplKey') === assetGroup.get('assetClass')
      );

      this.$id('assetClass').select2('data', assetClass ? idAndLabel(assetClass) : null);
      this.$id('depRate').val(assetGroup ? assetGroup.get('depRate') : 0);

      this.selectDepKey(assetGroup ? assetGroup.get('depKey') : '');

      this.updateMethods();
      this.updatePeriods();
    },

    selectDepKey: function(depKey)
    {
      this.$id('depKey').select2('data', {
        id: depKey,
        text: depKey
      });
    },

    updatePeriods: function()
    {
      const depRateEl = this.$id('depRate')[0];
      let rr = depRateEl.valueAsNumber;

      if (!rr || rr < 0)
      {
        rr = 0;
      }

      if (rr > 100)
      {
        rr = 100;
      }

      depRateEl.value = Math.round(rr * 100) / 100;

      const ratio = 100 / rr;
      let years = Math.floor(ratio);
      let months = Math.round(12 * (ratio % 1));

      if (months === 12)
      {
        years += 1;
        months = 0;
      }

      if (years > 100)
      {
        years = 100;
      }

      years = years && isFinite(years) ? years : '0';
      months = months && isFinite(months) ? months : '0';

      this.$id('fiscalPeriodY').val(years);
      this.$id('fiscalPeriodM').val(months);
      this.$id('taxPeriodY').val(years);
      this.$id('taxPeriodM').val(months);
    },

    updateMethods: function()
    {
      const depKey = dictionaries.depKeys.get(this.$id('depKey').val().trim());
      const value = !depKey ? '' : `${depKey.id} - ${depKey.get('name')}`;

      this.$id('fiscalMethod').val(value);
      this.$id('taxMethod').val(value);
    },

    serializeToForm: function(formData)
    {
      this.zplxView.serializeToForm(formData);
      this.transactionsView.serializeToForm(formData);

      ['economic', 'fiscal', 'tax'].forEach(k =>
      {
        formData[`${k}PeriodY`] = Math.floor(formData[`${k}Period`] / 12);
        formData[`${k}PeriodM`] = formData[`${k}Period`] % 12;
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      const data = {
        assetName: (formData.assetName || '').trim(),
        evalGroup1: formData.evalGroup1 || '',
        evalGroup5: formData.evalGroup5 || '',
        assetClass: formData.assetClass || null,
        inventoryNo: (formData.inventoryNo || '').trim(),
        serialNo: (formData.serialNo || '').trim(),
        depRate: Math.round(Math.min(100, Math.max(parseFloat(formData.depRate) || 0, 0)) * 100) / 100,
        depKey: (formData.depKey || '').trim(),
        postingDate: formData.postingDate
          ? time.utc.getMoment(formData.postingDate, 'YYYY-MM-DD').toISOString()
          : null,
        tplNotes: (formData.tplNotes || '').trim(),
        comment: (formData.comment || '').trim()
      };

      ['economic', 'fiscal', 'tax'].forEach(k =>
      {
        data[`${k}Period`] = ((+formData[`${k}PeriodY`] || 0) * 12) + (+formData[`${k}PeriodM`] || 0);
        data[`${k}Method`] = (formData[`${k}Method`] || '').trim();

        const date = formData[`${k}Date`] ? time.utc.getMoment(formData[`${k}Date`], 'YYYY-MM-DD') : null;

        data[`${k}Date`] = date && date.isValid() ? date.toDate() : null;
      });

      this.zplxView.serializeForm(data);
      this.transactionsView.serializeForm(data);

      return data;
    }

  });
});
