/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {

    var LineChart4TableView = ContrailView.extend({
        render: function () {
            var self = this

            self.renderView4Config(self.$el, null, self.getContentViewConfig(self.model.model().attributes), null, null, null, function () {
                nv.utils.windowResize(self.childViewMap['lineWithFocusChart'].chartModel.update)
            })
        },

        getContentViewConfig: function (data) {
            var self = this
            var queryRequestPostData = self.model.getQueryRequestPostData(+ new Date)

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
                        var queryCount = {values: [], color: cowc.D3_COLOR_CATEGORY5[0]},
                            chartData = [queryCount];

                        for (var i = 0; i < responseArray.length; i++) {
                            var ts = Math.floor(responseArray[i]["T="] / 1000);
                            queryCount.values.push({x: ts, y: responseArray[i][data.yAxisValue]});
                        }
                        return chartData;
                    },
                    chartOptions: {
                        axisLabelDistance: 5,
                        height: 300,
                        yAxisLabel: data.yAxisLabel,
                        forceY: [0, 10],
                        yFormatter: function (d) {
                            return d;
                        }
                    }
                }
            }
        }
    });

    return LineChart4TableView;
});
