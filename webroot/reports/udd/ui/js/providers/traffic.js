/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
  var CustomModel = require('/reports/udd/ui/js/providers/customModel.js')

  return CustomModel.extend({
    url: '/reports/udd/data/traffic.json',

    parse: function (data) {
      return {chartData: data}
    },

    getViewFinderPoint: function (time) {
      var navDate = d3.time.format('%x %H:%M')(new Date(time))
      return new Date(navDate).getTime()
    },

    interpolateSankey: function (points) {
      var x0 = points[0][0], y0 = points[0][1], x1, y1, x2,
      path = [x0, ',', y0],
      i = 0, n = points.length
      while (++i < n) {
        x1 = points[i][0], y1 = points[i][1], x2 = (x0 + x1) / 2
        path.push('C', x2, ',', y0, ' ', x2, ',', y1, ' ', x1, ',', y1)
        x0 = x1, y0 = y1
      }
      return path.join('')
    }
  })
})
