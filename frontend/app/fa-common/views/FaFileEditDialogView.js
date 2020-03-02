// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/fa-common/templates/fileEditDialog'
], function(
  _,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,
    nlsDomain: 'fa-common',

    events: {

      'change #-file': function(e)
      {
        var inputEl = e.currentTarget;
        var error = '';

        if (inputEl.files[0].size > window.FA_FILE_MAX_SIZE)
        {
          error = this.t('fa-common', 'FORM:edit:maxSize', {
            size: Math.floor(window.FA_FILE_MAX_SIZE / 1024 / 1024)
          });
        }

        inputEl.setCustomValidity(error);
      },

      'submit': function()
      {
        var view = this;

        view.$id('submit').prop('disabled', true);

        var file = view.$id('file')[0];
        var formData = new FormData();

        formData.append('file', file.files[0]);

        var req = view.ajax({
          type: 'POST',
          url: '/fa/files/' + this.model.id,
          data: formData,
          processData: false,
          contentType: false
        });

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('fileEditDialog:msg:failure')
          });

          view.$id('submit').prop('disabled', false);
        });

        req.done(function()
        {
          viewport.msg.show({
            type: 'success',
            time: 2500,
            text: view.t('fileEditDialog:msg:success')
          });

          viewport.closeDialog();
        });

        return false;
      }

    },

    initialize: function()
    {
      _.defaults(this.model, {
        loading: true,
        setting: null
      });
    },

    getTemplateData: function()
    {
      return {
        id: this.model.id,
        loading: this.model.loading,
        setting: this.model.setting
      };
    },

    afterRender: function()
    {
      if (!this.model.setting)
      {
        this.loadSetting();
      }
    },

    loadSetting: function()
    {
      var view = this;
      var req = view.ajax({url: '/fa/files/' + view.model.id});

      view.model.loading = true;

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function(setting)
      {
        view.model.loading = false;
        view.model.setting = setting;

        view.render();
      });
    }

  }, {

    showDialog: function(id)
    {
      viewport.showDialog(new this({model: {id: id}}), t('fa-common', 'fileEditDialog:title'));
    }

  });
});
