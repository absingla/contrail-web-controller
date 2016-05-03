/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
  return Backbone.View.extend({
    className: 'chart',

    initialize: function (p) {
      var self = this

      self.p = {
        minHeight: 6,
      }
      self.p.chart = {
        height           : 300,
        axisLabelDistance: 5,
        y1AxisLabel      : 'CPU Utilization (%)',
        y2AxisLabel      : 'Memory Usage (Bytes)',
        forceY1          : [0, 5],
        forceY2          : [0, 5],
        y2Formatter      : function (y2Value) {
          return y2Value
        },
        y1Formatter      : d3.format('.01f'),
        showLegend       : true
      }

      self.listenTo(self.model, 'sync', self.render)
    },

    render: function () {
      var self = this
      self.$el.html('<svg></svg>')
      nv.addGraph( () => {
        self.chart = nv.models.linePlusBarChart()
          .margin({top: 50, right: 100, bottom: 30, left: 70})
          .legendRightAxisHint(' [Using Right Axis]')
          .color(d3.scale.category10().range())

        self.chart.xAxis.tickFormat((d) => {
          return d3.time.format('%H:%M')(new Date(d))
        })

        self.chart.x2Axis.axisLabel('Time').tickFormat( (d) => {
          return d3.time.format('%H:%M')(new Date(d))
        })

        self.chart.y1Axis.axisLabel(self.p.chart.y1AxisLabel)
          .axisLabelDistance(self.p.chart.axisLabelDistance)
          .tickFormat(self.p.chart['y1Formatter'])
          .showMaxMin(false)

        self.chart.y2Axis.axisLabel(self.p.chart.y2AxisLabel)
          .axisLabelDistance(self.p.chart.axisLabelDistance)
          .tickFormat(self.p.chart['y2Formatter'])
          .showMaxMin(false)
        self.chart.showLegend(self.p.chart.showLegend)

        d3.select(self.$('svg')[0])
          .datum(self.model.get('chartData'))
          .transition()
          .duration(500)
          .call(self.chart)

        nv.utils.windowResize(self.chart.update)

        self.chart.dispatch.on('stateChange', (e) => {
          nv.log('New State:', JSON.stringify(e))
        })

      })
      return self
    }
  })
})
