// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/users/templates/filter'
], function(
  _,
  idAndLabel,
  FilterView,
  setUpUserSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      login: '',
      searchName: ''
    },

    termToForm: {
      'login': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      },
      'searchName': 'login'
    },

    serializeFormToQuery: function(selector)
    {
      var login = this.$id('login').val().trim();
      var searchName = setUpUserSelect2.transliterate(this.$id('searchName').val());

      if (login.length)
      {
        selector.push({name: 'regex', args: ['login', '^' + login, 'i']});
      }

      if (searchName.length)
      {
        selector.push({name: 'regex', args: ['searchName', '^' + searchName]});
      }
    }

  });
});
