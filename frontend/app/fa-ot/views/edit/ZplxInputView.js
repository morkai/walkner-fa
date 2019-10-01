// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-ot/templates/edit/zplxInput'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .btn[data-action="zplx:add"]': function()
      {
        var $zplx = this.$('.fa-edit-zplx-item').first().clone().css({display: 'none'});
        var $input = $zplx.find('input').val('');

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
          $zplx.find('input').val('').focus();
        }
        else
        {
          $zplx.fadeOut('fast', function()
          {
            $zplx.remove();
            view.$('.fa-edit-zplx').last().find('input').select();
            view.model.trigger('dirty');
          });
        }
      },

      'keydown input[name="zplx[]"]': function(e)
      {
        if (e.key === 'Enter')
        {
          this.checkValidity();
        }
      },

      'blur input[name="zplx[]"]': function()
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
      var zplx = this.model.get('zplx');

      return {
        zplx: zplx.length ? zplx : ['']
      };
    },

    checkValidity: function()
    {
      var valid = false;
      var $zplx = this.$('input[name="zplx[]"]').each(function()
      {
        valid = valid || /^[0-9]{8}$/.test(this.value);
      });

      $zplx[0].setCustomValidity(!this.required || valid ? '' : this.t('FORM:edit:zplx:invalid'));
    },

    serializeForm: function(data)
    {
      data.zplx = {};

      this.$('input[name="zplx[]"]').each(function()
      {
        if (/^[0-9]{8}$/.test(this.value))
        {
          data.zplx[this.value] = 1;
        }
      });

      data.zplx = Object.keys(data.zplx);
    }

  });
});
