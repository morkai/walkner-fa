// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/templates/participantsInput',
  'app/fa-common/templates/participant'
], function(
  _,
  View,
  setUpUserSelect2,
  template,
  participantTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .btn[data-action="committee:add"]': function()
      {
        this.addParticipant();
        this.$('.fa-edit-participant').last().find('input').select2('focus');
        this.model.trigger('dirty');
      },

      'click .btn[data-action="committee:remove"]': function(e)
      {
        var view = this;
        var $participant = view.$(e.target).closest('.fa-edit-participant');

        view.$('.btn[data-action="committee:remove"]').prop('disabled', true);

        $participant.fadeOut('fast', function()
        {
          $participant.find('input').select2('destroy');
          $participant.remove();
          view.$('.btn[data-action="committee:remove"]').prop('disabled', false);
          view.$('.fa-edit-participant').last().find('input').select2('focus');
          view.$('.fa-edit-participant-label').each(function(i)
          {
            if (view.options.owner && i === 0)
            {
              return;
            }

            this.textContent = view.t('fa-common', 'FORM:edit:committee:person', {
              no: i + (view.options.owner ? 0 : 1)
            });
          });
          view.toggleAddParticipantLabel();
          view.model.trigger('dirty');
        });
      }
    },

    initialize: function()
    {
      this.options.owner = this.options.owner !== false;
      this.options.required = this.options.required !== false;
    },

    getTemplateData: function()
    {
      return {
        label: this.options.label || this.t('PROPERTY:committee'),
        required: this.options.required,
        owner: this.options.owner,
        committee: this.model.get('committee')
      };
    },

    afterRender: function()
    {
      var view = this;

      view.setUpUserSelect2(view.$id('owner'), view.model.get('owner'));

      view.model.get('committee').forEach(function(user)
      {
        view.addParticipant(user);
      });

      if (this.$('.fa-edit-participant').length === 0)
      {
        view.addParticipant();
      }
    },

    setUpUserSelect2: function($input, user)
    {
      if (!$input.length)
      {
        return;
      }

      setUpUserSelect2($input, {
        width: '359px'
      });

      if (user)
      {
        $input.select2('data', {
          id: user._id,
          text: user.label
        });
      }
    },

    hasAnyParticipants: function()
    {
      var data = {};

      this.serializeForm(data);

      return !!data.owner || data.committee.length > 0;
    },

    addParticipant: function(user)
    {
      var $participants = this.$id('participants');
      var $tr = this.renderPartial(participantTemplate, {
        no: $participants.children().length + (this.options.owner ? 0 : 1),
        value: user ? user._id : ''
      });

      $tr.css({display: 'none'});
      this.setUpUserSelect2($tr.find('input'), user);
      $participants.append($tr);
      $tr.fadeIn('fast');

      this.toggleAddParticipantLabel();
    },

    toggleAddParticipantLabel: function()
    {
      this.$('.btn[data-action="committee:add"]').find('span').text(
        this.t('fa-common', 'FORM:edit:committee:add', {
          count: this.$('.fa-edit-participant').length - (this.options.owner ? 1 : 0)
        })
      );
    },

    serializeUserInfo: function($select2)
    {
      var data = $select2.select2('data');

      return !data ? null : {
        _id: data.id,
        label: data.text
      };
    },

    serializeForm: function(data)
    {
      var view = this;

      if (this.options.owner)
      {
        data.owner = view.serializeUserInfo(this.$id('owner'));
      }

      var committee = {};

      view.$('input[name="committee[]"]')
        .map(function() { return view.serializeUserInfo(view.$(this)); })
        .get()
        .forEach(function(user)
        {
          if (user && !committee[user._id])
          {
            committee[user._id] = user;
          }
        });

      data.committee = _.values(committee);
    }

  });
});
