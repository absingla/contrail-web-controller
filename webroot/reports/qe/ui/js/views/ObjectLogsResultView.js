/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var ObjectLogsResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = qewu.getCurrentTime4Client(),
                queryFormModel = self.model,
                contrailListModel;

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                var postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime),
                    olRemoteConfig = {
                        url: "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(postDataObj)
                    },
                    listModelConfig = {
                        remote: {
                            ajaxConfig: olRemoteConfig,
                            dataParser: function(response) {
                                var gridData = response['data'];
                                for (var i = 0 ; i < gridData.length; i++) {
                                    gridData[i]["ObjectLog"] = contrail.checkIfExist(gridData[i]["ObjectLog"]) ? qewu.formatXML2JSON(gridData[i]["ObjectLog"]) : null;
                                    gridData[i]["SystemLog"] = contrail.checkIfExist(gridData[i]["SystemLog"]) ? qewu.formatXML2JSON(gridData[i]["SystemLog"], true) : null;
                                }
                                return gridData;
                            }
                        }
                    };

                contrailListModel = new ContrailListModel(listModelConfig);
                self.renderView4Config(self.$el, contrailListModel, self.getViewConfig(postDataObj, listModelConfig, serverCurrentTime))
            });
        },

        getViewConfig: function (postDataObj, listModelConfig, serverCurrentTime) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                olGridColumns = qewgc.getColumnDisplay4Grid(postDataObj.formModelAttrs.table_name, cowc.QE_OBJECT_TABLE_TYPE, selectArray);

            var resultsViewConfig = {
                elementId: cowl.QE_OBJECT_LOGS_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_OVERCAST,
                    activate: function (e, ui) {},
                    tabs: [
                        {
                            elementId: cowl.QE_OBJECT_LOGS_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            view: "GridView",
                            viewConfig: {
                                elementConfig: getObjectLogsGridConfig(listModelConfig, olGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        }
    });

    function getObjectLogsGridConfig(listModelConfig, olGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_OBJECT_LOGS,
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
                    checkboxSelectable: false
                },
                dataSource: { remote: $.extend(true, {}, listModelConfig.remote, { serverSidePagination: true }) }
            },
            columnHeader: {
                columns: olGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 20, pageSizeSelect: [10, 20, 50, 100] } })
            }
        };
        return gridElementConfig;
    };

    return ObjectLogsResultView;
});