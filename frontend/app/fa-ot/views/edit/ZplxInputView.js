// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/fa-common/views/ValueInputView',
  'app/fa-ot/templates/edit/zplxInput'
], function(
  _,
  View,
  ValueInputView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .btn[data-action="zplx:add"]': function()
      {
        var $zplx = this.$('.fa-edit-zplx-item').first().clone().css({display: 'none'});
        var $input = $zplx.find('input').val('').first();

        $zplx.appendTo(this.$id('zplx')).fadeIn('fast');
        $input.focus();
        this.model.trigger('dirty');
      },

      'click .btn[data-action="zplx:remove"]': function(e)
      {
        var view = this;
        var $zplx = view.$(e.target).closest('.fa-edit-zplx-item');

        if (view.$('.fa-edit-zplx-item').length === 1)
        {
          $zplx.find('input').val('').first().focus();
        }
        else
        {
          $zplx.fadeOut('fast', function()
          {
            $zplx.remove();
            view.$('.fa-edit-zplx-item').last().find('input').first().select();
            view.model.trigger('dirty');
          });
        }
      },

      'keydown input[name^="zplx"]': function(e)
      {
        if (e.key === 'Enter')
        {
          this.checkValidity();
        }
      },

      'blur input[name^="zplx"]': function()
      {
        this.checkValidity();
      },

      'change .fa-edit-zplx-value': function(e)
      {
        var value = ValueInputView.parseValue(e.target.value);

        e.target.value = value ? ValueInputView.formatValue(value) : '';
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
      return {
        zplx: this.model.get('zplx')
      };
    },

    checkValidity: function()
    {
      var valid = false;
      var $zplx = this.$('input[name$=".code"]').each(function()
      {
        valid = valid || /^[0-9]{8}$/.test(this.value);
      });

      $zplx[0].setCustomValidity(!this.required || valid ? '' : this.t('FORM:edit:zplx:invalid'));
    },

    serializeToForm: function(formData)
    {
      formData.zplx = !formData.zplx.length ? [{code: '', value: ''}] : formData.zplx.map(function(d)
      {
        return {
          code: d.code,
          value: d.value ? ValueInputView.formatValue(d.value) : ''
        };
      });

      return formData;
    },

    serializeForm: function(data)
    {
      data.zplx = {};

      this.$('.fa-edit-zplx-item').each(function()
      {
        var codeEl = this.querySelector('input[name$=".code"]');
        var valueEl = this.querySelector('input[name$=".value"]');

        if (/^[0-9]{8}$/.test(codeEl.value))
        {
          data.zplx[codeEl.value] = ValueInputView.parseValue(valueEl.value);
        }
      });

      data.zplx = _.map(data.zplx, function(value, code)
      {
        return {
          code: code,
          value: value
        };
      });
    }

  });
});
