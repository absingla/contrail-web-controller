/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * widget content view
 */
define(function (require) {
    var WidgetContentView = require('reports/udd/ui/js/views/WidgetContentView')

    var WidgetLineChartView = WidgetContentView.extend({
        render: function () {
            var self = this

            //TODO add config of chart here
            self.renderView4Config(self.$el, null, self.getContentViewConfig(), null, null, null, function () {
                // update actual chart on window resize
                nv.utils.windowResize(self.childViewMap['lineWithFocusChart'].chartModel.update)
            })
        },

        getContentViewConfig: function () {
            var self = this
            var dataConfigModel = self.model.get('dataConfigModel')
            var contentConfigModel = self.model.get('contentConfigModel')
            var queryRequestPostData = dataConfigModel.getQueryRequestPostData(+ new Date)

            var queryResultRemoteConfig = {
                url: "/api/qe/query",
                type: 'POST',
                data: JSON.stringify(queryRequestPostData)
            };

            var listModelConfig = {
                remote: {
                    ajaxConfig: queryResultRemoteConfig,
                    dataParser: function (response) {
                        return response['data'];
                    }
                }
            };

            return {
                view: "LineWithFocusChartView",
                elementId: 'lineWithFocusChart',
                viewConfig: {
                    modelConfig: listModelConfig,
                    parseFn: function (responseArray) {
                        if (responseArray.length == 0) {
                            return [];
                        }
                        var queryCount = {values: [], color: contentConfigModel.get('color')},
                            chartData = [queryCount];

                        for (var i = 0; i < responseArray.length; i++) {
                            var ts = Math.floor(responseArray[i]["T="] / 1000);
                            queryCount.values.push({x: ts, y: responseArray[i][contentConfigModel.get('yAxisValue')]});
                        }
                        return chartData;
                    },
                    chartOptions: {
                        axisLabelDistance: 5,
                        height: 300,
                        yAxisLabel: contentConfigModel.get('yAxisLabel'),
                        forceY: [0, 10],
                        yFormatter: function (d) {
                            return d;
                        }
                    }
                }
            }
        }
    });

    return WidgetLineChartView;
});
