/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
  var NodeProvider = require('/reports/udd/ui/js/providers/node.js')
  var TrafficProvider = require('/reports/udd/ui/js/providers/traffic.js')

  var Widget = Backbone.Model.extend({
    initialize: function (p) {
      var self = this
      if (!p || !p.type) return
      if (p.type === 'node') self.provider = new NodeProvider(p.data)
      if (p.type === 'traffic') self.provider = new TrafficProvider(p.data)
    }
  })
  return Widget
})
