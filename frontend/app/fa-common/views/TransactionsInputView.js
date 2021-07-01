// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/templates/transactionsInput'
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
      'click .btn[data-action="transactions:add"]': function()
      {
        const $transactions = this.$('.fa-edit-transactions-item').first().clone().css({display: 'none'});
        const $input = $transactions.find('input').val('').first();

        $transactions.appendTo(this.$id('transactions')).fadeIn('fast');
        $input.focus();
        this.model.trigger('dirty');
        this.trigger('change');
      },

      'click .btn[data-action="transactions:remove"]': function(e)
      {
        const $transactions = this.$(e.target).closest('.fa-edit-transactions-item');

        if (this.$('.fa-edit-transactions-item').length === 1)
        {
          $transactions.find('input').val('').first().focus();
        }
        else
        {
          $transactions.fadeOut('fast', () =>
          {
            $transactions.remove();
            this.$('.fa-edit-transactions-item').last().find('input').first().select();
            this.model.trigger('dirty');
            this.trigger('change');
          });
        }
      },

      'keydown input[name^="transactions"]': function(e)
      {
        if (e.key === 'Enter')
        {
          this.checkValidity();
        }
      },

      'blur input[name^="transactions"]': function()
      {
        this.checkValidity();
      },

      'change .fa-edit-transactions-value': function(e)
      {
        const value = ValueInputView.parseValue(e.target.value);

        e.target.value = value ? ValueInputView.formatValue(value) : '';

        this.trigger('change');
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
      const transactions = this.model.get('transactions');

      return {
        readOnly: !!this.options.readOnly,
        transactions: transactions.length ? transactions : [{type: '', amount1: '', amount2: ''}]
      };
    },

    checkValidity: function()
    {
      let valid = false;
      const $transactions = this.$('input[name$=".type"]').each((i, el) =>
      {
        valid = valid || new RegExp(el.pattern).test(el.value);
      });

      $transactions[0].setCustomValidity(
        !this.required || valid ? '' : this.t('fa-common', 'FORM:edit:transactions:invalid')
      );
    },

    serializeToForm: function(formData)
    {
      formData.transactions = !formData.transactions.length
        ? [{type: '', amount1: '', amount2: ''}]
        : formData.transactions.map(d =>
        {
          return {
            type: d.type,
            amount1: d.amount1 ? ValueInputView.formatValue(d.amount1) : '',
            amount2: d.amount2 ? ValueInputView.formatValue(d.amount2) : ''
          };
        });

      return formData;
    },

    serializeForm: function(data)
    {
      data.transactions = {};

      this.$('.fa-edit-transactions-item').each((i, itemEl) =>
      {
        const typeEl = itemEl.querySelector('input[name$=".type"]');
        const amount1El = itemEl.querySelector('input[name$=".amount1"]');
        const amount2El = itemEl.querySelector('input[name$=".amount2"]');

        if (/^[A-Za-z0-9]{3}$/.test(typeEl.value))
        {
          data.transactions[typeEl.value] = {
            amount1: amount1El ? ValueInputView.parseValue(amount1El.value) : 0,
            amount2: amount2El ? ValueInputView.parseValue(amount2El.value) : 0
          };
        }
      });

      data.transactions = _.map(data.transactions, (d, type) =>
      {
        return {
          type,
          amount1: d.amount1,
          amount2: d.amount2
        };
      });
    }

  });
});
