// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/fa-common/templates/assetNameBuilderDialog'
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

      'change #-category': 'updateCategory',

      'input input.form-control': 'updateResult',
      'change input.form-control': 'updateResult',

      'submit': function()
      {
        this.stageView.$id('assetName').val(this.$id('result').text());

        viewport.closeDialog();

        return false;
      }

    },

    initialize()
    {
      this.categories = {
        line: [
          {value: this.t('assetNameBuilder:value:lineText')},
          {}
        ],
        incLine: [
          {value: this.t('assetNameBuilder:value:inc')},
          {},
          {maxLength: 30}
        ],
        tester: [
          {value: this.t('assetNameBuilder:value:tester')},
          {},
          {}
        ],
        puncher: [
          {value: this.t('assetNameBuilder:value:puncher')},
          {help: this.t('assetNameBuilder:help:manName')},
          {help: this.t('assetNameBuilder:help:no')},
          {help: this.t('assetNameBuilder:help:model')},
          {help: this.t('assetNameBuilder:help:serial')}
        ],
        presser: [
          {value: this.t('assetNameBuilder:value:presser')},
          {help: this.t('assetNameBuilder:help:manName')},
          {help: this.t('assetNameBuilder:help:no')},
          {help: this.t('assetNameBuilder:help:model')},
          {help: this.t('assetNameBuilder:help:serial')}
        ],
        miller: [
          {value: this.t('assetNameBuilder:value:miller')},
          {help: this.t('assetNameBuilder:help:manName')},
          {help: this.t('assetNameBuilder:help:no')},
          {help: this.t('assetNameBuilder:help:model')},
          {help: this.t('assetNameBuilder:help:serial')}
        ],
        grinder: [
          {value: this.t('assetNameBuilder:value:grinder')},
          {help: this.t('assetNameBuilder:help:manName')},
          {help: this.t('assetNameBuilder:help:no')},
          {help: this.t('assetNameBuilder:help:model')},
          {help: this.t('assetNameBuilder:help:serial')}
        ],
        lathe: [
          {value: this.t('assetNameBuilder:value:lathe')},
          {help: this.t('assetNameBuilder:help:manName')},
          {help: this.t('assetNameBuilder:help:no')},
          {help: this.t('assetNameBuilder:help:model')},
          {help: this.t('assetNameBuilder:help:serial')}
        ],
        machine: [
          {},
          {help: this.t('assetNameBuilder:help:manName')},
          {help: this.t('assetNameBuilder:help:model')},
          {help: this.t('assetNameBuilder:help:serial')}
        ],
        dedTools: [
          {value: this.t('assetNameBuilder:value:inc')},
          {help: this.t('assetNameBuilder:help:incName')},
          {help: this.t('assetNameBuilder:help:incDesc'), maxLength: 20},
          {help: this.t('assetNameBuilder:help:manName')},
          {}
        ],
        stdTools: [
          {value: this.t('assetNameBuilder:value:inc')},
          {help: this.t('assetNameBuilder:help:incName')},
          {help: this.t('assetNameBuilder:help:incDesc'), maxLength: 20},
          {help: this.t('assetNameBuilder:help:manName')},
          {}
        ],
        incOther: [
          {value: this.t('assetNameBuilder:value:inc')},
          {help: this.t('assetNameBuilder:help:incName')},
          {help: this.t('assetNameBuilder:help:incDesc'), maxLength: 20},
          {optional: true}
        ],
        racks: [
          {value: this.t('assetNameBuilder:value:racks')},
          {help: this.t('assetNameBuilder:help:manName')},
          {},
          {}
        ],
        casting: [
          {value: this.t('assetNameBuilder:value:casting')},
          {help: this.t('assetNameBuilder:help:supplier')},
          {help: this.t('assetNameBuilder:help:family')},
          {help: this.t('assetNameBuilder:help:compName')},
          {help: this.t('assetNameBuilder:help:nc12'), maxLength: 12}
        ],
        injection: [
          {value: this.t('assetNameBuilder:value:injection')},
          {help: this.t('assetNameBuilder:help:supplier')},
          {help: this.t('assetNameBuilder:help:family')},
          {help: this.t('assetNameBuilder:help:compName')},
          {help: this.t('assetNameBuilder:help:nc12'), maxLength: 12}
        ],
        dies: [
          {maxLength: 15},
          {help: this.t('assetNameBuilder:help:supplier')},
          {help: this.t('assetNameBuilder:help:family')},
          {help: this.t('assetNameBuilder:help:compName')},
          {help: this.t('assetNameBuilder:help:nc12'), maxLength: 12}
        ],
        other: [
          {maxLength: 15},
          {help: this.t('assetNameBuilder:help:supplier')},
          {help: this.t('assetNameBuilder:help:family')},
          {help: this.t('assetNameBuilder:help:compName')},
          {help: this.t('assetNameBuilder:help:nc12'), maxLength: 12}
        ]
      };
    },

    getTemplateData: function()
    {
      return {
        categories: Object.keys(this.categories)
      };
    },

    afterRender()
    {
      this.stageView.$id('assetName').val().split('/').forEach((part, i) =>
      {
        this.$id(`p${i + 1}`).val(part);
      });

      this.updateResult();
    },

    updateCategory()
    {
      const id = this.$id('category').val();
      const parts = this.categories[id] || [];

      for (let i = 0; i < 5; ++i)
      {
        const no = i + 1;
        const part = parts[i];
        const $value = this.$id(`p${no}`);
        const $group = $value.closest('.form-group');
        const $label = $group.find('.control-label');
        const $help = $group.find('.help-block');

        if (!part)
        {
          $label.removeClass('is-required');

          $value
            .prop('disabled', true)
            .prop('readOnly', false)
            .prop('required', false)
            .val('');

          $help.addClass('hidden');

          continue;
        }

        $label[0].classList.toggle('is-required', !part.optional);

        $value
          .prop('disabled', false)
          .prop('required', !part.optional)
          .prop('maxLength', part.maxLength || 40);

        if (part.value)
        {
          $value.val(part.value).prop('readOnly', true);
        }
        else
        {
          $value.val('').prop('readOnly', false);
        }

        if (!part.help && this.t.has(`assetNameBuilder:category:${id}:${no}`))
        {
          part.help = this.t(`assetNameBuilder:category:${id}:${no}`);
        }

        if (part.help)
        {
          $help.text(part.help).removeClass('hidden');
        }
        else
        {
          $help.addClass('hidden');
        }
      }

      this.updateResult();

      viewport.adjustDialogBackdrop();
    },

    updateResult()
    {
      const result = [];

      for (let no = 1; no <= 5; ++no)
      {
        const $value = this.$id(`p${no}`);

        if (!$value[0].disabled)
        {
          result.push($value.val().trim());
        }
      }

      this.$id('result').text(result.join('/'));
    }

  }, {

    showDialog: function(stageView)
    {
      viewport.showDialog(new this({stageView}), t('fa-common', 'assetNameBuilder:title'));
    }

  });
});
