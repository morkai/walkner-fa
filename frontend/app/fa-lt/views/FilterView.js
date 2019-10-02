// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/ExpandableSelect',
  'app/core/views/FilterView',
  '../FaLt',
  'app/fa-common/dictionaries',
  'app/fa-lt/templates/filter'
], function(
  _,
  $,
  idAndLabel,
  dateTimeRange,
  ExpandableSelect,
  FilterView,
  FaLt,
  dictionaries,
  template
) {
  'use strict';

  var FILTER_LIST = [
    'kind',
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
      },

      'click #-reset': 'resetFilters',

      'keydown input, select': function(e)
      {
        if (e.key === 'Escape')
        {
          this.resetFilter(this.$(e.target));
        }
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
      'stage': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'kind': 'stage'
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;

      dateTimeRange.formToRql(view, selector);

      ['kind', 'stage'].forEach(function(prop)
      {
        var value = (view.$id(prop).val() || []).filter(function(v) { return !_.isEmpty(v); });

        if (value.length)
        {
          selector.push({name: 'in', args: [prop, value]});
        }
      });

      ['sapNo', 'assetName', 'inventoryNo'].forEach(function(prop)
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
        filters: FILTER_LIST,
        statuses: FaLt.STATUSES,
        kinds: FaLt.KINDS
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
    },

    resetFilters: function()
    {
      var view = this;

      view.$('.form-group').each(function()
      {
        view.resetFilter($(this).find('input, select').first());
      });

      view.$id('submit').click();
    },

    resetFilter: function($el)
    {
      var name = $el.prop('name');

      if (name === 'limit')
      {
        return;
      }

      if (name === 'from-date' || name === 'to-date')
      {
        this.$id('from-date').val('');
        this.$id('to-date').val('');

        return;
      }

      if ($el.hasClass('select2-focusser'))
      {
        $el.closest('.select2-container').next().select2('data', null);
      }
      else
      {
        $el.val('');
      }
    }

  });
});
