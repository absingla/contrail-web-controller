/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
  return Backbone.View.extend({
    template: Handlebars.compile(require('text!/reports/udd/ui/templates/providerConfig.html')),

    events: {
      'input .config': 'updateModel',
    },

    initialize: function (p) {
      var self = this
      self.listenTo(self.model, 'sync', self.render)
    },

    render: function () {
      var self = this
      self.$el.html(self.template(self.model.toJSON()))
      return self
    },

    updateModel: function (e) {
      var self = this
      e.stopPropagation()
      var field = self.$(e.target)
      var attr = field.attr('name')
      var value = field.val()
      if (value === '') self.model.unset(attr)
      else self.model.set(attr, value)
    }
  })
})
