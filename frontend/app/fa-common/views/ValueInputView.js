// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-common/templates/valueInput'
], function(
  View,
  template
) {
  'use strict';

  function parseValue(str)
  {
    var value = str.replace(/[^0-9,.]+/g, '');
    var negative = str.charAt(0) === '-';
    var integer = 0;
    var decimal = 0;
    var matches = value.match(/^(.*?)[,.]([0-9]{1,2})$/);

    if (matches)
    {
      integer = parseInt(matches[1].replace(/[^0-9]+/g, ''), 10);
      decimal = matches[2];
    }
    else
    {
      integer = parseInt(value.replace(/[^0-9]+/g, ''), 10);
    }

    value = parseFloat(integer.toString() + '.' + decimal.toString()) || 0;

    if (negative)
    {
      value *= -1;
    }

    return value;
  }

  function formatValue(num)
  {
    return num === 0 ? '' : num.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return View.extend({

    template: template,

    property: 'value',

    required: true,

    readOnly: false,

    events: {
      'keydown #-value': function(e)
      {
        if (e.key === 'Enter')
        {
          this.setValue(parseValue(e.target.value));
        }
      },
      'blur #-value': function(e)
      {
        this.setValue(parseValue(e.target.value));
      },
      'change #-value': function()
      {
        this.trigger('change');
      }
    },

    getTemplateData: function()
    {
      return {
        property: this.property,
        required: this.required,
        readOnly: this.readOnly
      };
    },

    serializeToForm: function(formData)
    {
      if (!formData[this.property])
      {
        formData[this.property] = '';
      }
      else
      {
        formData[this.property] = formatValue(formData[this.property]);
      }
    },

    serializeForm: function(data)
    {
      data[this.property] = parseValue(this.$id('value').val());
    },

    setValue: function(newValue)
    {
      this.$id('value').val(formatValue(newValue));
    }

  }, {

    parseValue: parseValue,
    formatValue: formatValue

  });
});
