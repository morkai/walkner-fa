// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/View',
  'app/users/views/LogInFormView',
  '../views/DashboardView'
], function(
  user,
  View,
  LogInFormView,
  DashboardView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'dashboard',

    nlsDomain: 'fa-dashboard',

    breadcrumbs: function()
    {
      return user.isLoggedIn() ? [] : [this.t('breadcrumbs:logIn')];
    },

    initialize: function()
    {
      this.view = user.isLoggedIn() ? new DashboardView() : new LogInFormView();
    },

    afterRender: function()
    {
      if (!user.isLoggedIn())
      {
        this.$('input[name="login"]').focus();
      }
    }

  });
});
