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
        baseUnit         : 'minutes',
        btnId            : 'fs-query-submit',
        elementId        : 'fs-results',
        export           : true,
        fromTime         : 1443129342000,
        gridHeight       : 480,
        height           : 300,
        interval         : '60',
        labelStep        : 1,
        pageSize         : 100,
        queryId          : 'B1620E36-BC79-4DBE-88FB-52238EDFAA5B-1443131142072',
        queryPrefix      : 'fs',
        refreshChart     : false,
        serverCurrentTime: 1443131142000,
        showChartToggle  : true,
        timeOut          : 120000,
        toTime           : 1443131142000,
        y2AxisLabel      : '',
        yAxisLabel       : 'SUM(Bytes)'
      }

      self.listenTo(self.model, 'sync', self.render)
    },

    render: function () {
      var self = this
      self.$el.html('<svg></svg>')
      nv.addGraph(() => {
        var values = self.model.get('chartData')[0].values, sampleCnt = values.length, start, end, brushExtent = null

        if (self.p.chart.defaultSelRange != null && sampleCnt >= self.p.chart.defaultSelRange) {
          start = values[sampleCnt - self.p.chart.defaultSelRange]
          end = values[sampleCnt - 1]
          brushExtent = [self.model.getViewFinderPoint(start.x), self.model.getViewFinderPoint(end.x)]
        } else if (sampleCnt >= 20) {
          start = values[sampleCnt - 20]
          end = values[sampleCnt - 1]
          brushExtent = [self.model.getViewFinderPoint(start.x), self.model.getViewFinderPoint(end.x)]
        }

        self.chart = nv.models.lineWithFocusChart().brushExtent(brushExtent)
        self.chart.interpolate(self.model.interpolateSankey)

        self.chart.xAxis.tickFormat((d) => {
          return d3.time.format('%H:%M:%S')(new Date(d))
        })

        self.chart.x2Axis.tickFormat((d) => {
          return d3.time.format('%H:%M:%S')(new Date(d))
        })

        self.chart.yAxis.axisLabel(self.p.chart.yAxisLabel)
        self.chart.y2Axis.axisLabel(self.p.chart.y2AxisLabel)

        self.chart.lines.forceY([0])
        self.chart.lines2.forceY([0])

        //Store the chart object as a rawData attribute so that the chart can be updated dynamically
        self.$el.data('chart', self.chart)
        if (!(self.$el.is(':visible'))) {
          self.$el.find('svg').bind('refresh', () => {
            d3.select(self.$('svg')[0])
            .datum(self.model.get('chartData'))
            .transition()
            .duration(500)
            .call(self.chart)
          })
        } else {
          d3.select(self.$('svg')[0])
            .datum(self.model.get('chartData'))
            .transition()
            .duration(500)
            .call(self.chart)
        }

        nv.utils.windowResize(self.chart.update)
      })
    }
  })
})
