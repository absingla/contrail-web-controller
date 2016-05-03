/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
  var CustomModel = require('/reports/udd/ui/js/providers/customModel.js')

  return CustomModel.extend({
    url: '/reports/udd/data/cpu.json',

    parse: function (data) {
      var d3_category5 = ['#1f77b4', '#6baed6', '#ff7f0e', '#2ca02c', '#9e9ac8']
      var cpuUtilization = {key: 'CPU Utilization (%)', values: [], bar: true, color: d3_category5[1]}
      var memoryUsage = {key: 'Memory Usage', values: [], color: d3_category5[3]}
      var chartData = [memoryUsage, cpuUtilization]

      for (var i = 0; i < data.length; i++) {
        var ts = Math.floor(data[i]['T'] / 1000)
        cpuUtilization.values.push({x: ts, y: data[i]['cpu_stats.cpu_one_min_avg']})
        memoryUsage.values.push({x: ts, y: data[i]['cpu_stats.rss']})
      }
      return {chartData}
    }
  })
})
