// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/ExpandableSelect',
  'app/core/util/padString',
  'app/core/views/FilterView',
  'app/fa-common/dictionaries',
  'app/fa-common/views/ValueInputView',
  'app/fa-ot/templates/filter'
], function(
  _,
  $,
  idAndLabel,
  dateTimeRange,
  ExpandableSelect,
  padString,
  FilterView,
  dictionaries,
  ValueInputView,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    filterList: [
      'stage',
      'assetNo',
      'assetName',
      'inventoryNo',
      'value',
      'costCenter',
      'zplx',
      'limit'
    ],
    filterMap: {},

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: {

    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'assetNo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'assetName': 'assetNo',
      'inventoryNo': 'assetNo',
      'costCenter': 'assetNo',
      'zplx.code': 'assetNo',
      'stage': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'value': function(propertyName, term, formData)
      {
        const operators = {
          eq: '',
          ne: '<>',
          gt: '>',
          lt: '<',
          ge: '>=',
          le: '<='
        };

        formData.value = (operators[term.name] || '') + ValueInputView.formatValue(term.args[1]);
      }
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      const stage = (this.$id('stage').val() || []).filter(v => !_.isEmpty(v));

      if (stage.length)
      {
        selector.push({name: 'in', args: ['stage', stage]});
      }

      ['assetNo', 'assetName', 'inventoryNo', 'costCenter'].forEach(prop =>
      {
        const value = this.$id(prop).val().trim();

        if (value.length)
        {
          selector.push({name: 'eq', args: [prop, value]});
        }
      });

      const value = this.$id('value').val().trim();

      if (value.length)
      {
        const matches = value.match(new RegExp('(' + ['<>', '>=', '<=', '>', '<'].join('|') + ')'));
        const operators = {
          '<>': 'ne',
          '>': 'gt',
          '<': 'lt',
          '>=': 'ge',
          '<=': 'le'
        };

        selector.push({
          name: operators[matches ? matches[1] : null] || 'eq',
          args: ['value', ValueInputView.parseValue(value)]
        });
      }

      const zplx = padString.start(this.$id('zplx').val().trim().replace(/^0+/, ''), 8, '0');

      if (zplx !== '00000000' && /^[0-9]{8}$/.test(zplx))
      {
        selector.push({name: 'eq', args: ['zplx.code', zplx]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$('.is-expandable').expandableSelect();

      this.$id('costCenter').select2({
        width: '140px',
        placeholder: ' ',
        allowClear: true,
        data: dictionaries.costCenters.map(idAndLabel)
      });
    },

    showFilter: function(filter)
    {
      if (filter === 'no')
      {
        $('.page-actions-jump').find('.form-control').focus();

        return;
      }

      if (filter === 'date')
      {
        this.$id('from-date').focus();

        return;
      }

      return FilterView.prototype.showFilter.apply(this, arguments);
    },

    resetFilter: function($el)
    {
      const name = $el.prop('name');

      if (name === 'from-date' || name === 'to-date')
      {
        this.$id('from-date').val('');
        this.$id('to-date').val('');

        return;
      }

      if ($el.hasClass('select2-focusser'))
      {
        $el.closest('.select2-container').next().select2('data', null);

        return;
      }

      $el.val('');

      FilterView.prototype.resetFilter.apply(this, arguments);
    }

  });
});
