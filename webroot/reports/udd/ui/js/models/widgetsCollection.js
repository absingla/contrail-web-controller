/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
  var Widget = require('/reports/udd/ui/js/models/widgetModel.js')

  var WidgetsCollection = Backbone.Collection.extend({
    url: '/reports/udd/data/widgets.json',

    initialize: function (options) {
      this.model = Widget
    }
  })
  return WidgetsCollection
})
