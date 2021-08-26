// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/user',
  'app/data/loadedModules',
  'app/data/privileges',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/users/templates/filter'
], function(
  require,
  _,
  user,
  loadedModules,
  privileges,
  idAndLabel,
  FilterView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: function()
    {
      return [
        'login',
        'active',
        user.isAllowedTo('USERS:MANAGE') ? 'privileges' : null,
        'limit'
      ].filter(f => !!f);
    },
    filterMap: {
      lastName: 'searchName'
    },

    template: template,

    termToForm: {
      'login': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]).replace(/^\^/, '');
      },
      'searchName': 'login',
      'active': 'card'
    },

    events: Object.assign({

      'click #-active .btn': function(e)
      {
        if (e.currentTarget.classList.contains('active'))
        {
          setTimeout(() =>
          {
            this.$(e.currentTarget).removeClass('active').find('input').prop('checked', false);
          }, 1);
        }
      }

    }, FilterView.prototype.events),

    getTemplateData: function()
    {
      return {
        privileges: user.isAllowedTo('USERS:MANAGE') ? privileges : []
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('privileges').select2({
        width: '250px',
        allowClear: true
      });

      this.toggleButtonGroup('active');
    },

    serializeFormToQuery: function(selector)
    {
      const searchName = setUpUserSelect2.transliterate(this.$id('searchName').val());

      if (searchName.length)
      {
        selector.push({name: 'regex', args: ['searchName', `^${searchName}`]});
      }

      this.serializeRegexTerm(selector, 'login', null, null, true, true);

      const active = this.getButtonGroupValue('active', null);

      if (active !== null)
      {
        selector.push({name: 'eq', args: ['active', active === 'true']});
      }

      ['privileges'].forEach(p =>
      {
        const v = this.$id(p).val() || '';

        if (v.length)
        {
          selector.push({name: 'eq', args: [p, v]});
        }
      });
    }

  });
});
