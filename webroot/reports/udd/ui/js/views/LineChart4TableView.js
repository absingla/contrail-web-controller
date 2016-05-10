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
            var self = this,
                viewConfig = self.attributes.viewConfig;

            self.renderView4Config(self.$el, null, self.getContentViewConfig(viewConfig))
        },

        getContentViewConfig: function (viewConfig) {
            var queryRequestPostData = {
                async: false,
                autoSort: true,
                chunk: 1,
                chunkSize: 15000,
                formModelAttrs: {
                    table_name: "StatTable.QueryPerfInfo.query_stats",
                    table_type: "STAT",
                    direction: "1",
                    filter_json: null,
                    filters: "",
                    from_time: 1462844869870,
                    from_time_utc: 1462844880000,
                    limit: "15000",
                    query_prefix: "stat",
                    select: "T=, Source, COUNT(query_stats), name",
                    time_granularity: 60,
                    time_granularity_unit: "secs",
                    time_range: "3600",
                    to_time: 1462846716271,
                    to_time_utc: 1462846740000,
                    where: ""
                }
            };

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
                viewConfig: {
                    modelConfig: listModelConfig,
                    parseFn: function (responseArray) {
                        if (responseArray.length == 0) {
                            return [];
                        }
                        var queryCount = {key: "Query Count", values: [], color: cowc.D3_COLOR_CATEGORY5[0]},
                            chartData = [queryCount];

                        for (var i = 0; i < responseArray.length; i++) {
                            var ts = Math.floor(responseArray[i]["T="] / 1000);
                            queryCount.values.push({x: ts, y: responseArray[i]['COUNT(query_stats)']});
                        }
                        return chartData;
                    },
                    chartOptions: {
                        axisLabelDistance: 5,
                        height: 300,
                        yAxisLabel: 'Query Count',
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