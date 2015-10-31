/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var StatQueryResultView = QueryResultView.extend({
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
                    statRemoteConfig = {
                        url: "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(postDataObj)
                    },
                    listModelConfig = {
                        remote: {
                            ajaxConfig: statRemoteConfig,
                            dataParser: function(response) {
                                return response['data'];
                            }
                        }
                    };

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                contrailListModel = new ContrailListModel(listModelConfig);
                modelMap[cowc.UMID_STAT_QUERY_FORM_MODEL] = queryFormModel;
                self.renderView4Config(self.$el, contrailListModel, self.getStatResultGridTabViewConfig(postDataObj, statRemoteConfig, serverCurrentTime), null, null, modelMap, function(statResultView) {
                    var selectArray = queryFormModel.select().replace(/ /g, "").split(",");

                    if(selectArray.indexOf("T=") != -1) {
                        contrailListModel.onAllRequestsComplete.subscribe(function () {
                            //TODO: Load chart only if data is not queued.
                            if (contrailListModel.getItems().length > 0) {
                                statResultView.childViewMap[cowl.QE_STAT_QUERY_TAB_ID].renderNewTab(cowl.QE_STAT_QUERY_TAB_ID, self.getStatResultChartTabViewConfig(postDataObj));
                            }
                        });
                    }
                });
            });
        },

        getStatResultGridTabViewConfig: function (postDataObj, statRemoteConfig, serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                statGridColumns = qewgc.getColumnDisplay4Grid(postDataObj.formModelAttrs.table_name, cowc.QE_STAT_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: cowl.QE_STAT_QUERY_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    tabs: [
                        {
                            elementId: cowl.QE_STAT_QUERY_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            view: "GridView",
                            tabConfig: {
                                activate: function (event, ui) {
                                    if ($('#' + cowl.QE_STAT_QUERY_GRID_ID)) {
                                        $('#' + cowl.QE_STAT_QUERY_GRID_ID).data('contrailGrid').refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                elementConfig: getStatQueryGridConfig(statRemoteConfig, statGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        },

        getStatResultChartTabViewConfig: function(postDataObj) {
            var queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                statChartTabViewConfig = [];

            statChartTabViewConfig.push({
                elementId: cowl.QE_STAT_QUERY_CHART_ID,
                title: cowl.TITLE_CHART,
                view: "StatLineChartView",
                viewPathPrefix: "reports/qe/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                tabConfig: {
                    activate: function (event, ui) {
                        $('#' + cowl.QE_STAT_QUERY_CHART_ID).find('svg').trigger('refresh');
                        if ($('#' + cowl.QE_STAT_QUERY_CHART_GRID_ID).data('contrailGrid')) {
                            $('#' + cowl.QE_STAT_QUERY_CHART_GRID_ID).data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate: true
                },
                viewConfig: {
                    queryId: postDataObj.queryId,
                    selectArray: selectArray
                }
            });

            return statChartTabViewConfig;
        }

    });

    function getStatQueryGridConfig(statRemoteConfig, statGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_STATS_QUERY,
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
                        ajaxConfig: statRemoteConfig,
                        dataParser: function(response) {
                            console.log(response);
                            return response['data'];
                        },
                        serverSidePagination: true
                    }
                }
            },
            columnHeader: {
                columns: statGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return StatQueryResultView;
});