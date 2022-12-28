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

    namePrefix: '',

    required: true,

    readOnly: false,

    countTransactions: () => 0,

    events: {
      'click .btn[data-action="transactions:add"]'()
      {
        const $transactions = this.$('.fa-edit-transactions-item').first().clone().css({display: 'none'});
        const $input = $transactions.find('input').val('').first();

        $transactions.appendTo(this.$id('transactions')).fadeIn('fast');
        $input.focus();
        this.model.trigger('dirty');
        this.trigger('change');
      },

      'click .btn[data-action="transactions:remove"]'(e)
      {
        const $transactions = this.$(e.target).closest('.fa-edit-transactions-item');

        if (this.$('.fa-edit-transactions-item').length === 1)
        {
          $transactions.find('input').val('').first().focus();
        }
        else
        {
          this.$('.btn[data-action="transactions:remove"]').prop('disabled', true);

          $transactions.fadeOut('fast', () =>
          {
            $transactions.remove();
            this.$('.btn[data-action="transactions:remove"]').prop('disabled', false);
            this.$('.fa-edit-transactions-item').last().find('input').first().select();
            this.model.trigger('dirty');
            this.trigger('change');
          });
        }
      },

      'keydown input'(e)
      {
        if (e.key === 'Enter')
        {
          this.checkValidity();
        }
      },

      'blur input'()
      {
        this.checkValidity();
      },

      'change .fa-edit-transactions-value'(e)
      {
        const value = ValueInputView.parseValue(e.target.value);

        e.target.value = value ? ValueInputView.formatValue(value) : '';

        this.trigger('change');
      }
    },

    initialize()
    {
      this.requiredEnabled = false;

      this.listenTo(this.model, 'required', requiredEnabled =>
      {
        this.requiredEnabled = requiredEnabled;
        this.checkValidity();
      });
    },

    getTemplateData()
    {
      return {
        namePrefix: this.namePrefix,
        required: this.required,
        readOnly: this.readOnly,
        transactionCount: Math.max(1, this.countTransactions())
      };
    },

    checkValidity()
    {
      let valid = false;
      const $transactions = this.$('input[name$=".type"]').each((i, el) =>
      {
        valid = valid || new RegExp(el.pattern).test(el.value);
      });

      $transactions[0].setCustomValidity(
        !this.requiredEnabled || valid ? '' : this.t('fa-common', 'FORM:edit:transactions:invalid')
      );
    },

    serializeToForm(formData)
    {
      formData.transactions = !(formData.transactions || []).length
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

    serializeForm(data)
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
