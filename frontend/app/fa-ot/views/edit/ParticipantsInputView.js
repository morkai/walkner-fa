// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/fa-ot/templates/edit/participantsInput',
  'app/fa-ot/templates/edit/participant'
], function(
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

        $participant.fadeOut('fast', function()
        {
          $participant.find('input').select2('destroy');
          $participant.remove();
          view.$('.fa-edit-participant').last().find('input').select2('focus');
          view.$('.fa-edit-participant-label').each(function(i)
          {
            if (i > 0)
            {
              this.textContent = view.t('FORM:edit:committee:person', {no: i});
            }
          });
          view.toggleAddParticipantLabel();
          view.model.trigger('dirty');
        });
      }
    },

    getTemplateData: function()
    {
      return {
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
    },

    setUpUserSelect2: function($input, user)
    {
      setUpUserSelect2($input, {
        width: '292px'
      });

      if (user)
      {
        $input.select2('data', {
          id: user._id,
          text: user.label
        });
      }
    },

    addParticipant: function(user)
    {
      var $participants = this.$id('participants');
      var $tr = this.renderPartial(participantTemplate, {
        no: $participants.children().length,
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
        this.t('FORM:edit:committee:add', {
          count: this.$('.fa-edit-participant').length - 1
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

      data.owner = view.serializeUserInfo(this.$id('owner'));

      data.committee = view.$('input[name="committee[]"]')
        .map(function() { return view.serializeUserInfo(view.$(this)); })
        .get()
        .filter(function(v) { return !!v; });
    }

  });
});
