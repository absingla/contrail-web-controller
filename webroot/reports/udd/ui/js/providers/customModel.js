/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * Adds dirty state to the model (changed but not yet synced with server)
 */
define(function (require) {
  return Backbone.Model.extend({

    initialize: function (p) {
      var self = this
      self.on('sync', self.onFetch)
    },

    onFetch: function () {
      var self = this
      self._attributes = _.clone(self.attributes)
    },

    isDirty: function () {
      var self = this
      return !_.isEqual(self._attributes, self.attributes)
    }
  })
})
