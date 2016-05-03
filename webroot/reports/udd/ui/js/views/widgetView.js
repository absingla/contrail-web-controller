/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
  var NodeStat = require('/reports/udd/ui/js/views/nodeStatView.js')
  var TrafficStat = require('/reports/udd/ui/js/views/trafficStatView.js')
  var ProviderConfig = require('/reports/udd/ui/js/views/providerConfigView.js')

  return Backbone.View.extend({
    className: 'widget',
    template: Handlebars.compile(require('text!/reports/udd/ui/templates/widget.html')),
    events: {
      'click .close':   'remove',
      'click .panel-heading .config':  'flipCard',
      'click .title': 'onTitleClick',
      'blur .panel-heading>input': 'onTitleChange',
      'click .save': 'saveConfig',
    },

    initialize: function (p) {
      var self = this
      var type = self.model.get('type')
      if (type === 'node') self.chart = new NodeStat({ model: self.model.provider})
      if (type === 'traffic') self.chart = new TrafficStat({ model: self.model.provider})
      //self.providerConfig = new ProviderConfig({ model: self.model.provider})
      if (!type) return
      self.model.provider.fetch()
      self.listenTo(self.model.provider, 'change', self.updateSaveBtn)
    },

    render: function () {
      var self = this
      self.$el.html(self.template(self.model.toJSON()))
      self.$('.front .panel-body').html(self.chart.$el)
      //self.providerConfig.setElement(self.$('.back .panel-body'))
      return self
    },

    remove: function () {
      var self = this
      self.model.destroy()
    },

    flipCard: function () {
      var self = this
      self.$('.front').toggle()
      self.$('.back').toggle()
    },

    onTitleClick: function (e) {
      var self = this
      var title = self.model.get('title')
      self.$('.title').remove()
      self.$('.panel-heading').prepend($(`<input type="text" value="${ title }"/>`))
      self.$('.panel-heading>input').focus()
      return true
    },

    onTitleChange: function (e) {
      var self = this
      var newTitle = self.$('.panel-heading>input').val()
      self.model.set('title', newTitle)
      self.$('.panel-heading>input').remove()
      self.$('.panel-heading').prepend(`<span class="title">${ newTitle }</span>`)
    },

    updateSaveBtn: function () {
      var self = this
      self.$('.save').toggleClass('disabled', !self.model.provider.isDirty())
    },

    saveConfig: function () {
      var self = this
      self.chart.model.save()
    }
  })
})
