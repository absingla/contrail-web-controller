/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'query-line-chart-view'
], function (_, ContrailView, ContrailListModel, QueryLineChartView) {

    var FlowSeriesLineChartView = QueryLineChartView.extend({
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                queryId = viewConfig['queryId'],
                selectArray = viewConfig['selectArray'],
                contrailListModel = this.model,
                chartViewConfig = getQueryChartViewConfig(queryId, selectArray);

            if(!(contrailListModel.isRequestInProgress())) {
                self.renderView4Config(self.$el, null, chartViewConfig);
            }

            contrailListModel.onAllRequestsComplete.subscribe(function() {
                self.renderView4Config(self.$el, null, chartViewConfig);
            });
        }
    });

    function getQueryChartViewConfig(queryId, selectArray) {
        var chartUrl = '/api/admin/reports/query/chart-data?queryId=' + queryId,
            flowUrl = '/api/admin/reports/query/flow-classes?queryId=' + queryId;

        return {
            elementId: ctwl.QE_FLOW_SERIES_CHART_PAGE_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.QE_FLOW_SERIES_LINE_CHART_ID,
                                title: cowl.TITLE_CHART,
                                view: "LineWithFocusChartView",
                                viewConfig: {
                                    chartOptions: {
                                        axisLabelDistance: 5,
                                        yAxisLabel: 'Sum(Bytes)',
                                        forceY: [0, 60],
                                        yFormatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1); }
                                    },
                                    modelConfig: {
                                        remote: {
                                            ajaxConfig: {
                                                url: chartUrl,
                                                type: 'GET'
                                            },
                                            dataParser: function(response) {
                                                var chartData = qewp.fsQueryDataParser(response);
                                                //TODO: Add Missing Points
                                                //qewu.addFlowMissingPoints
                                                return chartData;
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.QE_FLOW_SERIES_CHART_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getChartGridViewConfig(flowUrl, selectArray)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getChartGridViewConfig(flowUrl, selectArray) {
        var columnDisplay = qewgc.getColumnDisplay4Grid(qewc.FC_QUERY_PREFIX, selectArray),
            display = [
                {
                    id: 'fc-checkbox', field:"", name:"", resizable: false, width:30, minWidth: 30, sortable: false, searchable: false, exportConfig: { allow: false },
                    formatter: function(r, c, v, cd, dc){
                        return '<input id="fc-checkbox-' + dc.cgrid +'" type="checkbox" onchange="loadSelectedFSChart(this)" value="' + dc.flow_class_id + '" data-id="' + dc.cgrid + '"class="ace-input"/><span class="ace-lbl"></span>';
                    }
                },
                {
                    id: 'fc-label', field:"", name:"", resizable: false, sortable: false, width: 30, minWidth: 30, searchable: false, exportConfig: { allow: false },
                    formatter: function(r, c, v, cd, dc){
                        return '<span id="label-sum-bytes-'+ dc.cgrid + '" class="label-icon-badge hide"><i class="icon-circle"></i></span> \
                		<span id="label-sum-packets-' + dc.cgrid + '" class="label-icon-badge hide"><i class="icon-circle"></i></span>';
                    }
                }
            ];

        columnDisplay = display.concat(columnDisplay);

        var viewConfig = {
            header: {},
            columnHeader: {
                columns: columnDisplay
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30
                },
                dataSource:{
                    remote: {
                        ajaxConfig: {
                            url: flowUrl,
                            type: 'GET'
                        },
                        serverSidePagination: true
                    }
                }
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 100,
                        pageSizeSelect: [100, 200, 500]
                    }
                }
            }
        };

        return viewConfig;
    };

    return FlowSeriesLineChartView;
});