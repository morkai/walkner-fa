// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'form2js',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/views/TransactionsInputView',
  'app/fa-common/views/AssetNameBuilderDialogView',
  'app/fa-common/util/helpers',
  'app/fa-ot/templates/edit/asset'
], function(
  js2form,
  form2js,
  t,
  time,
  currentUser,
  View,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  ValueInputView,
  TransactionsInputView,
  AssetNameBuilderDialogView,
  helpers,
  template
) {
  'use strict';

  return View.extend({

    template,

    events: {

      'click #-buildAssetName'()
      {
        AssetNameBuilderDialogView.showDialog(this);
      },

      'change #-costCenter'()
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
            id: owner[currentUser.idProperty],
            text: owner.label
          });
        }
      },

      'change #-depRate'()
      {
        this.updatePeriods();
      },

      'blur #-economicPeriodM'(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        const $y = this.$id('economicPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },

      'blur #-fiscalPeriodM'(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        const $y = this.$id('fiscalPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },

      'blur #-taxPeriodM'(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        const $y = this.$id('taxPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },

      'change #-evalGroup1'()
      {
        this.$id('evalGroup5').select2('data', null);
        this.$id('assetClass').select2('data', null);
        this.setUpEvalGroup5Select2();
      },

      'change #-evalGroup5'()
      {
        this.selectAssetClass();
      },

      'change #-fiscalDate'()
      {
        this.$id('taxDate').val(this.$id('fiscalDate').val());
      },

      'change #-depKey'()
      {
        this.updateMethods();
      }

    },

    initialize()
    {
      helpers.extend(this);

      const namePrefix = `assets[${this.assetI}].`;

      if (this.fields.value)
      {
        this.valueView = new ValueInputView({
          model: this.model,
          required: this.fields.value === 'required',
          namePrefix
        });

        this.setView('#-value', this.valueView);
      }

      if (this.fields.transactions)
      {
        this.transactionsView = new TransactionsInputView({
          model: this.model,
          required: this.fields.transactions === 'required',
          namePrefix,
          countTransactions: () => this.asset.transactions.length
        });

        this.setView('#-transactions', this.transactionsView);
      }
    },

    getTemplateData()
    {
      return {
        model: this.model.attributes,
        asset: this.asset,
        details: this.model.serializeAsset(this.asset),
        active: this.isActive(),
        i: this.assetI,
        properties: this.properties,
        fields: this.fields
      };
    },

    afterRender()
    {
      js2form(this.el, this.serializeToForm());

      this.setUpCostCenterSelect2();
      this.setUpOwnerSelect2();

      if (this.fields.assetClass)
      {
        this.setUpEvalGroup1Select2();
        this.setUpEvalGroup5Select2();
        this.setUpAssetClassSelect2();
        this.setUpDepKeySelect2();
        this.setUpEconomicMethodSelect2();
      }
    },

    setUpCostCenterSelect2()
    {
      const $costCenter = this.$id('costCenter');

      if (!$costCenter.length)
      {
        return;
      }

      const id = this.asset.costCenter;
      const model = dictionaries.costCenters.get(id);
      const data = [];

      if (id && !model)
      {
        data.push({
          id,
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

      data.sort(t.sortProps('text'));

      $costCenter.select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data
      });
    },

    setUpOwnerSelect2()
    {
      const $owner = this.$id('owner');

      if (!$owner)
      {
        return;
      }

      setUpUserSelect2($owner);

      const {owner} = this.asset;

      if (owner)
      {
        $owner.select2('data', {
          id: owner[currentUser.idProperty],
          text: owner.label
        });
      }
    },

    setUpEvalGroup1Select2()
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
          .map(id => ({id, text: id}))
          .sort(t.sortProps('text'))
      });
    },

    setUpEvalGroup5Select2()
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
          .map(id => ({id, text: id}))
          .sort(t.sortProps('text'))
      });
    },

    setUpAssetClassSelect2()
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
        data: data.sort(t.sortProps('text'))
      });
    },

    setUpDepKeySelect2()
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
        data: data.sort(t.sortProps('text'))
      });
    },

    setUpEconomicMethodSelect2()
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
        data: Array.from(data)
          .map(id => ({id, text: id}))
          .sort(t.sortProps('text'))
      });
    },

    selectAssetClass()
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

    selectDepKey(depKey)
    {
      this.$id('depKey').select2('data', {
        id: depKey,
        text: depKey
      });
    },

    updatePeriods()
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

    updateMethods()
    {
      const depKey = dictionaries.depKeys.get(this.$id('depKey').val().trim());
      const value = !depKey ? '' : `${depKey.id} - ${depKey.get('name')}`;

      this.$id('fiscalMethod').val(value);
      this.$id('taxMethod').val(value);
    },

    checkValidity()
    {

    },

    serializeToForm()
    {
      const asset = {...this.asset};

      if (this.valueView)
      {
        this.valueView.serializeToForm(asset);
      }

      if (this.transactionsView)
      {
        this.transactionsView.serializeToForm(asset);
      }

      if (this.fields.costCenter
        && !asset.costCenter
        && this.model.get('usageDestination') === 'external-supplier'
        && dictionaries.costCenters.get('PL02AD13'))
      {
        asset.costCenter = 'PL02AD13';
      }

      if (this.fields.assetClass)
      {
        ['economic', 'fiscal', 'tax'].forEach(k =>
        {
          asset[`${k}PeriodY`] = Math.floor(asset[`${k}Period`] / 12);
          asset[`${k}PeriodM`] = asset[`${k}Period`] % 12;
          asset[`${k}Date`] = asset[`${k}Date`] ? time.utc.format(asset[`${k}Date`], 'YYYY-MM-DD') : '';
        });
      }

      return {assets: [asset]};
    },

    serializeForm()
    {
      const formData = {
        ...this.asset,
        ...form2js(this.el, null, false).assets[0]
      };

      delete formData.photoFile;

      if (this.valueView)
      {
        this.valueView.serializeForm(formData);
      }

      if (this.transactionsView)
      {
        this.transactionsView.serializeForm(formData);
      }

      if (this.fields.costCenter && !formData.costCenter)
      {
        formData.costCenter = null;
      }

      if (this.fields.costCenter)
      {
        const costCenter = dictionaries.costCenters.get(formData.costCenter);

        if (costCenter && !formData.owner)
        {
          const owner = costCenter.get('owner');

          if (owner)
          {
            formData.owner = owner;
          }
        }
      }

      if (this.fields.owner)
      {
        formData.owner = setUpUserSelect2.getUserInfo(this.$id('owner'));
      }

      if (this.fields.assetClass)
      {
        if (!formData.assetClass)
        {
          formData.assetClass = null;
        }

        formData.depRate = Math.round(Math.min(100, Math.max(parseFloat(formData.depRate) || 0, 0)) * 100) / 100;

        ['economic', 'fiscal', 'tax'].forEach(k =>
        {
          const date = formData[`${k}Date`] ? time.utc.getMoment(formData[`${k}Date`], 'YYYY-MM-DD') : null;

          formData[`${k}Date`] = date && date.isValid() ? date.toDate() : null;
          formData[`${k}Period`] = ((+formData[`${k}PeriodY`] || 0) * 12) + (+formData[`${k}PeriodM`] || 0);
          formData[`${k}Method`] = (formData[`${k}Method`] || '').trim();
        });
      }

      return formData;
    }

  });
});
