// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/fa-common/templates/help/page'
], function(
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    nlsDomain: 'fa-common',

    pageClassName: 'page-max-flex',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMBS:help')
      ];
    },

    events: {
      'click .nav-tabs a': function(e)
      {
        this.selectTab(e.currentTarget.href.split('#').pop());
      }
    },

    afterRender: function()
    {
      this.selectTab(this.tab);
    },

    getTemplateData: function()
    {
      return {
        locale: t.config.locale
      };
    },

    selectTab: function(tab)
    {
      if (!tab)
      {
        tab = this.$('.nav-tabs a').first().attr('href').split('#').pop();
      }

      this.$('a[href$="' + tab + '"]').tab('show');

      this.tab = tab;

      this.broker.publish('router.navigate', {
        url: '#fa/help?tab=' + tab,
        trigger: false,
        replace: true
      });
    }

  });
});
