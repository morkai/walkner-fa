// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/ExpandableSelect',
  'app/core/views/FilterView',
  'app/fa-common/dictionaries',
  'app/fa-ot/templates/filter'
], function(
  _,
  $,
  idAndLabel,
  dateTimeRange,
  ExpandableSelect,
  FilterView,
  dictionaries,
  template
) {
  'use strict';

  var FILTER_LIST = [
    'stage',
    'sapNo',
    'assetName',
    'inventoryNo',
    'costCenter',
    'limit'
  ];
  var FILTER_MAP = {

  };

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'click a[data-filter]': function(e)
      {
        e.preventDefault();

        this.showFilter(e.currentTarget.dataset.filter);
      }

    }, FilterView.prototype.events),

    defaultFormData: {

    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'sapNo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'assetName': 'sapNo',
      'inventoryNo': 'sapNo',
      'costCenter': 'sapNo',
      'stage': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;
      var stage = (view.$id('stage').val() || []).filter(function(v) { return !_.isEmpty(v); });

      dateTimeRange.formToRql(view, selector);

      if (stage.length)
      {
        selector.push({name: 'in', args: ['stage', stage]});
      }

      ['sapNo', 'assetName', 'inventoryNo', 'costCenter'].forEach(function(prop)
      {
        var value = view.$id(prop).val().trim();

        if (value.length)
        {
          selector.push({name: 'eq', args: [prop, value]});
        }
      });
    },

    changeFilter: function()
    {
      FilterView.prototype.changeFilter.apply(this, arguments);

      this.toggleFilters();
    },

    getTemplateData: function()
    {
      return {
        filters: FILTER_LIST
      };
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

      this.toggleFilters();
    },

    toggleFilters: function()
    {
      var view = this;

      FILTER_LIST.forEach(function(filter)
      {
        view.$('.form-group[data-filter="' + filter + '"]').toggleClass('hidden', !view.filterHasValue(filter));
      });
    },

    filterHasValue: function(filter)
    {
      var $filter = this.$id(filter);

      var value = $filter.hasClass('btn-group')
        ? $filter.find('.active > input').val()
        : $filter.val();

      return !!value && value.length > 0;
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

      this.$('.form-group[data-filter="' + (FILTER_MAP[filter] || filter) + '"]')
        .removeClass('hidden')
        .find('input, select')
        .first()
        .focus();
    }

  });
});
