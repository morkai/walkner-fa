// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/fa-reqTpls/templates/form',
  'app/fa-reqTpls/templates/formCellsRow'
], function(
  viewport,
  FormView,
  template,
  cellsRowTemplate
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'click #-addCell': function()
      {
        this.addCell({
          target: '',
          value: ''
        });
      },

      'click .btn[data-action="removeCell"]': function(e)
      {
        const $row = this.$(e.target).closest('tr');

        $row.fadeOut('fast', () => $row.remove());
      },

      'click .btn[data-action="moveCellDown"]': function(e)
      {
        const $rows = this.$id('cells').children();
        const $row = this.$(e.target).closest('tr');
        const $next = $row.next();

        if ($rows.length === 1)
        {
          return;
        }

        if ($next.length)
        {
          $row.insertAfter($next);
        }
        else
        {
          $row.insertBefore($rows.first());
        }

        e.currentTarget.focus();
      },

      'click .btn[data-action="moveCellUp"]': function(e)
      {
        const $rows = this.$id('cells').children();
        const $row = this.$(e.target).closest('tr');
        const $prev = $row.prev();

        if ($rows.length === 1)
        {
          return;
        }

        if ($prev.length)
        {
          $row.insertBefore($prev);
        }
        else
        {
          $row.insertAfter($rows.last());
        }

        e.currentTarget.focus();
      },

      'change #-_id': function()
      {
        this.toggleVars();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.cellI = 0;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      (this.model.get('cells') || []).forEach(this.addCell, this);

      if (this.editMode)
      {
        this.$id('_id').prop('disabled', true);
      }

      this.toggleVars();
    },

    serializeForm: function(formData)
    {
      formData.cells = (formData.cells || [])
        .filter(cell => !!cell.target && /^[A-Z]+/.test(cell.target))
        .map(cell =>
        {
          if (!cell.value)
          {
            cell.value = '';
          }

          return cell;
        });

      return formData;
    },

    submitRequest: function()
    {
      const file = this.$id('inputFile')[0];

      if (!file.value)
      {
        return FormView.prototype.submitRequest.apply(this, arguments);
      }

      viewport.msg.saving();

      this.$('.panel-footer').find('.btn').prop('disabled', true);

      const formData = new FormData();

      formData.append('file', file.files[0]);

      const req = this.ajax({
        type: 'POST',
        url: '/fa/attachments;upload',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(this.handleFailure.bind(this));

      req.done(attachment =>
      {
        this.model.set('inputFile', attachment);

        FormView.prototype.submitRequest.apply(this, arguments);
      });
    },

    handleSuccess: function()
    {
      viewport.msg.saved();

      return FormView.prototype.handleSuccess.apply(this, arguments);
    },

    handleFailure: function()
    {
      viewport.msg.savingFailed();

      return FormView.prototype.handleFailure.apply(this, arguments);
    },

    addCell: function(cell)
    {
      const $cell = this.renderPartial(cellsRowTemplate, {
        i: this.cellI++,
        cell
      });

      this.$id('cells').append($cell);
    },

    toggleVars: function()
    {
      const type = this.$id('_id').val();

      this.$('tbody[data-types]').each((i, el) =>
      {
        el.classList.toggle('hidden', !el.dataset.types.includes(type));
      });
    }

  });
});
