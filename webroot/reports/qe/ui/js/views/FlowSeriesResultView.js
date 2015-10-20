/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var FlowSeriesResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = qewu.getCurrentTime4Client(),
                queryFormModel = self.model,
                timeRange = parseInt(queryFormModel.time_range()),
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                contrailListModel;

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                var postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime),
                    fsRemoteConfig = {
                        url: "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(postDataObj)
                    },
                    listModelConfig = {
                        remote: {
                            ajaxConfig: fsRemoteConfig,
                            dataParser: function(response) {
                                return response['data'];
                            },
                            successCallback: function(response, contrailListModel) {
                                // TODO: Show Message if query is queued.
                            }
                        }
                    };

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                contrailListModel = new ContrailListModel(listModelConfig);
                modelMap[cowc.UMID_FLOW_SERIES_FORM_MODEL] = queryFormModel;
                self.renderView4Config(self.$el, contrailListModel, self.getViewConfig(postDataObj, fsRemoteConfig, serverCurrentTime), null, null, modelMap);
            });
        },

        getViewConfig: function (postDataObj, fsRemoteConfig, serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                fsGridColumns = qewgc.getColumnDisplay4Grid(cowc.FLOW_SERIES_TABLE, cowc.QE_FLOW_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: cowl.QE_FLOW_SERIES_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    tabs: [
                        {
                            elementId: cowl.QE_FLOW_SERIES_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            view: "GridView",
                            tabConfig: {
                                activate: function(event, ui) {
                                    if ($('#' + cowl.QE_FLOW_SERIES_GRID_ID).data('contrailGrid')) {
                                        $('#' + cowl.QE_FLOW_SERIES_GRID_ID).data('contrailGrid').refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                elementConfig: getFlowSeriesGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            if(selectArray.indexOf("T=") != -1) {
                resultsViewConfig['viewConfig']['tabs'].push({
                    elementId: cowl.QE_FLOW_SERIES_CHART_ID,
                    title: cowl.TITLE_CHART,
                    view: "FlowSeriesLineChartView",
                    viewPathPrefix: "reports/qe/ui/js/views/",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    tabConfig: {
                        activate: function (event, ui) {
                            $('#' + cowl.QE_FLOW_SERIES_CHART_ID).find('svg').trigger('refresh');
                            if ($('#' + cowl.QE_FLOW_SERIES_CHART_GRID_ID).data('contrailGrid')) {
                                $('#' + cowl.QE_FLOW_SERIES_CHART_GRID_ID).data('contrailGrid').refreshView();
                            }
                        }
                    },
                    viewConfig: {
                        queryId: postDataObj.queryId,
                        selectArray: selectArray
                    }
                });
            }

            return resultsViewConfig;
        }
    });

    function getFlowSeriesGridConfig(fsRemoteConfig, fsGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_FLOW_SERIES,
                    icon : 'icon-table'
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30
                },
                dataSource: {
                    remote: {
                        ajaxConfig: fsRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        },
                        serverSidePagination: true
                    }
                }
            },
            columnHeader: {
                columns: fsGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return FlowSeriesResultView;
});