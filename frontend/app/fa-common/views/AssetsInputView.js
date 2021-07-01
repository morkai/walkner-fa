// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/templates/assetsInput'
], function(
  _,
  View,
  ValueInputView,
  template
) {
  'use strict';

  return View.extend({

    template,

    events: {
      'click .btn[data-action="assets:add"]': function()
      {
        const $assets = this.$('.fa-edit-assets-item').first().clone().css({display: 'none'});
        const $input = $assets.find('input').val('').first();

        $assets.appendTo(this.$id('assets')).fadeIn('fast');
        $input.focus();
        this.model.trigger('dirty');
        this.trigger('change');
      },

      'click .btn[data-action="assets:remove"]': function(e)
      {
        const $assets = this.$(e.target).closest('.fa-edit-assets-item');

        if (this.$('.fa-edit-assets-item').length === 1)
        {
          $assets.find('input').val('').first().focus();
        }
        else
        {
          $assets.fadeOut('fast', () =>
          {
            $assets.remove();
            this.$('.fa-edit-assets-item').last().find('input').first().select();
            this.model.trigger('dirty');
            this.trigger('change');
          });
        }
      },

      'keydown input[name^="assets"]': function(e)
      {
        if (e.key === 'Enter')
        {
          this.checkValidity();
        }
      },

      'blur input[name^="assets"]': function()
      {
        this.checkValidity();
      }
    },

    initialize: function()
    {
      this.required = false;

      this.listenTo(this.model, 'required', function(required)
      {
        this.required = required;
        this.checkValidity();
      });
    },

    getTemplateData: function()
    {
      const assets = this.model.get('assets');

      return {
        readOnly: !!this.options.readOnly,
        assets: assets.length ? assets : [{no: '', transactionType: ''}]
      };
    },

    checkValidity: function()
    {
      const data = {};

      this.serializeForm(data);

      const valid = data.assets.length > 0;

      this.$('.fa-edit-assets-item input').first()[0].setCustomValidity(
        !this.required || valid ? '' : this.t('fa-common', 'FORM:edit:assets:invalid')
      );
    },

    serializeToForm: function(formData)
    {
      formData.assets = !formData.assets.length
        ? [{no: '', transactionType: ''}]
        : formData.assets.map(d =>
        {
          return {
            no: d.no,
            transactionType: d.transactionType
          };
        });

      return formData;
    },

    serializeForm: function(data)
    {
      data.assets = [];

      this.$('.fa-edit-assets-item').each((i, itemEl) =>
      {
        const asset = {
          no: itemEl.querySelector('input[name$=".no"]').value.trim(),
          transactionType: itemEl.querySelector('input[name$=".transactionType"]').value.trim()
        };

        if (asset.no && /^[A-Za-z0-9]{3}$/.test(asset.transactionType))
        {
          data.assets.push(asset);
        }
      });
    }

  });
});
