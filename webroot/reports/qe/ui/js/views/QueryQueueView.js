/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {
    var QueryQueueView = QueryResultView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryQueuePageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_QUEUE_PAGE),
                queryQueueType = viewConfig.queueType,
                queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX;

            self.$el.append(queryQueuePageTmpl({queryQueueType: queryQueueType }));

            var queueRemoteConfig = {
                ajaxConfig: {
                    url: "/api/qe/query/queue?queryQueue=" + queryQueueType,
                    type: 'GET'
                },
                dataParser: function (response) {
                    return response;
                }
            };

            var listModelConfig = {
                remote: queueRemoteConfig
            };

            self.model = new ContrailListModel(listModelConfig);
            self.renderView4Config($(queryQueueGridId), self.model, self.getQueryQueueViewConfig(queueRemoteConfig));
        },

        getQueryQueueViewConfig: function (queueRemoteConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryQueueType = viewConfig.queueType,
                pagerOptions = viewConfig['pagerOptions'],
                queueColorMap = [null, null, null, null, null];

            var resultsViewConfig = {
                elementId: cowl.QE_QUERY_QUEUE_GRID_ID,
                title: cowl.TITLE_QUERY_QUEUE,
                view: "GridView",
                viewConfig: {
                    elementConfig: getQueryQueueGridConfig(queryQueueType, queueRemoteConfig, pagerOptions, self, queueColorMap)
                }
            };

            return resultsViewConfig;
        },

        renderQueryResultGrid: function(queryQueueItem, queryResultType, queueColorMap, renderCompleteCB) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                childViewMap = self.childViewMap,
                queryQueueResultTabView = contrail.checkIfExist(childViewMap[cowl.QE_QUERY_QUEUE_TABS_ID]) ? childViewMap[cowl.QE_QUERY_QUEUE_TABS_ID] : null,
                queryQueueType = viewConfig.queueType,
                queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX,
                queryQueueResultId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_RESULT_SUFFIX;

            $(queryQueueGridId).data('contrailGrid').collapse();

            if (queryQueueResultTabView === null) {
                self.renderView4Config($(queryQueueResultId), null, getQueryQueueTabViewConfig(queryQueueItem, queryResultType, queueColorMap), null, null, modelMap, function() {
                    queryQueueResultTabView = contrail.checkIfExist(childViewMap[cowl.QE_QUERY_QUEUE_TABS_ID]) ? childViewMap[cowl.QE_QUERY_QUEUE_TABS_ID] : null,
                    self.renderQueryResultChart(queryQueueResultTabView, queryQueueItem, modelMap, renderCompleteCB);
                });
            } else {
                queryQueueResultTabView.renderNewTab(cowl.QE_QUERY_QUEUE_TABS_ID, getQueryResultGridTabViewConfig(queryQueueItem, queryResultType, queueColorMap), true, modelMap, function() {
                    self.renderQueryResultChart(queryQueueResultTabView, queryQueueItem, modelMap, renderCompleteCB);
                });
            }
        },

        renderQueryResultChart: function(queryQueueResultTabView, queryQueueItem, modelMap, renderCompleteCB) {
            var queryId = queryQueueItem.queryReqObj.queryId,
                selectStr = queryQueueItem.queryReqObj.formModelAttrs.select,
                formQueryIdSuffix = '-' + queryId,
                queryResultChartId = cowl.QE_QUERY_RESULT_CHART_ID + formQueryIdSuffix,
                selectArray = selectStr.replace(/ /g, "").split(","),
                queryResultListModel = modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL],
                queryQueueTabId = cowl.QE_QUERY_QUEUE_TABS_ID;

            if (selectArray.indexOf("T=") !== -1 && $('#' + queryResultChartId).length === 0) {
                if (!(queryResultListModel.isRequestInProgress()) && queryResultListModel.getItems().length > 0) {
                    queryQueueResultTabView.renderNewTab(queryQueueTabId, getQueryResultChartTabViewConfig(queryQueueItem), false, modelMap, function() {
                        renderCompleteCB();
                    });
                } else {
                    queryResultListModel.onAllRequestsComplete.subscribe(function () {
                        if (queryResultListModel.getItems().length > 0) {
                            queryQueueResultTabView.renderNewTab(queryQueueTabId, getQueryResultChartTabViewConfig(queryQueueItem), false, modelMap, function() {
                                renderCompleteCB();
                            });
                        }
                    });
                }
            }

            renderCompleteCB();

        }

    });

    function getQueryQueueGridConfig(queryQueueType, queueRemoteConfig, pagerOptions, queryQueueView, queueColorMap) {
        return {
            header: {
                title: {
                    text: cowl.TITLE_QUERY_QUEUE
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                },
                advanceControls: [
                    {
                        type: 'link',
                        linkElementId: cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID,
                        disabledLink: true,
                        title: cowl.TITLE_DELETE_ALL_QUERY_QUEUE,
                        iconClass: 'icon-trash',
                        onClick: function (event, gridContainer, key) {
                            if (!$('#' + cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID).hasClass('disabled-link')) {
                                var gridCheckedRows = $(gridContainer).data('contrailGrid').getCheckedRows(),
                                    queryIds = $.map(gridCheckedRows, function(rowValue, rowKey) {
                                        return rowValue.queryReqObj.queryId;
                                    });

                                showDeleteQueueModal(queryQueueType, queryIds, queueColorMap);
                            }
                        }
                    }
                ]
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#' + cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID).addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#' + cowl.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID).removeClass('disabled-link');
                        }
                    },
                    actionCell: function(dc){
                        return getQueueActionColumn(queryQueueType, dc, queryQueueView, queueColorMap);
                    }
                },
                dataSource: {
                    remote: queueRemoteConfig
                }
            },
            columnHeader: {
                columns: qewgc.getQueueColumnDisplay()
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 25, 50] } })
            }
        };
    };

    function getQueueActionColumn(queryQueueType, queryQueueItem, queryQueueView, queueColorMap) {
        var queryQueueListModel = queryQueueView.model,
            queryFormModelData = queryQueueItem.queryReqObj.formModelAttrs,
            status = queryQueueItem.status,
            queryId = queryQueueItem.queryReqObj.queryId,
            errorMessage = queryQueueItem.errorMessage,
            reRunTimeRange = queryFormModelData.rerun_time_range,
            actionCell = [];

        if(status == 'queued'){
            return actionCell;
        }

        if(status != "error") {
            actionCell.push({
                title: cowl.TITLE_VIEW_QUERY_RESULT,
                iconClass: 'icon-list-alt',
                onClick: function(rowIndex){
                    var queryQueueItem = queryQueueListModel.getItem(rowIndex);
                    viewQueryResultAction (queryQueueItem, queryQueueView, queueColorMap, 'queue');

                }
            });

            actionCell.push({
                title: cowl.TITLE_MODIFY_QUERY,
                iconClass: 'icon-pencil',
                onClick: function(rowIndex){
                    var queryQueueItem = queryQueueListModel.getItem(rowIndex);
                    queryQueueItem.queryReqObj.formModelAttrs.time_range = -1;
                    loadFeature({
                        p: 'query_flow_series',
                        q: {
                            queryType: cowc.QUERY_TYPE_MODIFY,
                            queryFormAttributes: queryQueueItem.queryReqObj.formModelAttrs
                        }
                    });
                }
            });
        } else if(errorMessage != null) {
            if(errorMessage.message != null && errorMessage.message != '') {
                errorMessage = errorMessage.message;
            }
            actionCell.push({
                title: cowl.TITLE_VIEW_QUERY_ERROR,
                iconClass: 'icon-exclamation-sign',
                onClick: function(rowIndex){
                    //TODO - create info modal
                    showInfoWindow(errorMessage, cowl.TITLE_ERROR);
                }
            });
        }

        if(reRunTimeRange !== null && reRunTimeRange != -1) {
            actionCell.push({
                title: cowl.  TITLE_RERUN_QUERY,
                iconClass: 'icon-repeat',
                onClick: function(rowIndex){
                    var queryQueueItem = queryQueueListModel.getItem(rowIndex);
                    loadFeature({
                        p: 'query_flow_series',
                        q: {
                            queryType: cowc.QUERY_TYPE_RERUN,
                            queryFormAttributes: queryQueueItem.queryReqObj.formModelAttrs
                        }
                    });
                }
            });
        }

        actionCell.push({
            title: cowl.TITLE_DELETE_QUERY,
            iconClass: 'icon-trash',
            onClick: function(rowIndex){
                showDeleteQueueModal(queryQueueType, [queryId], queueColorMap)
            }
        });

        return actionCell;
    };

    function viewQueryResultAction (queryQueueItem, queryQueueView, queueColorMap, queryType) {
        if (_.compact(queueColorMap).length < 5) {
            var queryId = queryQueueItem.queryReqObj.queryId,
                badgeColorKey = getBadgeColorkey4Value(queueColorMap, null),
                queryQueueResultGridTabLinkId = cowl.QE_QUERY_QUEUE_RESULT_GRID_TAB_ID + '-' + queryId + '-tab-link',
                queryQueueResultChartTabLinkId = cowl.QE_QUERY_QUEUE_RESULT_CHART_TAB_ID + '-' + queryId + '-tab-link';

            if ($('#' + queryQueueResultGridTabLinkId).length === 0) {
                queryQueueView.renderQueryResultGrid(queryQueueItem, queryType, queueColorMap, function() {
                    $('#label-icon-badge-' + queryId).addClass('icon-badge-color-' + badgeColorKey);
                    $('#' + queryQueueResultGridTabLinkId).find('.contrail-tab-link-icon').addClass('icon-badge-color-' + badgeColorKey);
                    $('#' + queryQueueResultGridTabLinkId).data('badge_color_key', badgeColorKey);

                    $('#' + queryQueueResultChartTabLinkId).find('.contrail-tab-link-icon').addClass('icon-badge-color-' + badgeColorKey);
                    $('#' + queryQueueResultChartTabLinkId).data('badge_color_key', badgeColorKey);
                    queueColorMap[badgeColorKey] = queryId;
                });
            } else {
                //TODO - create info modal
                showInfoWindow(cowm.QE_QUERY_QUEUE_RESULT_ALREADY_LOADED, cowl.TITLE_ERROR);
            }
        } else {
            //TODO - create info modal
            showInfoWindow(cowm.QE_MAX_QUERY_QUEUE_RESULT_VIEW_INFO, cowl.TITLE_ERROR);
        }
    }

    function showDeleteQueueModal(queryQueueType, queryIds, queueColorMap) {
        var modalId = queryQueueType + cowl.QE_WHERE_MODAL_SUFFIX;
        cowu.createModal({
            modalId: modalId,
            className: 'modal-700',
            title: cowl.TITLE_DELETE_QUERY,
            btnName: 'Confirm',
            body: cowm.QE_DELETE_QUERY_CONFIRM,
            onSave: function () {
                var postDataJSON = {queryQueue: queryQueueType, queryIds: queryIds},
                    ajaxConfig = {
                        url: '/api/qe/query',
                        type: 'DELETE',
                        data: JSON.stringify(postDataJSON)
                    };
                contrail.ajaxHandler(ajaxConfig, null, function() {
                    var queryQueueGridId = cowc.QE_HASH_ELEMENT_PREFIX + queryQueueType + cowc.QE_QUEUE_GRID_SUFFIX;
                    $(queryQueueGridId).data('contrailGrid').refreshData();

                    $.each(queryIds, function(queryIdKey, queryIdValue) {
                        removeBadgeColorFromQueryQueue(queueColorMap, queryIdValue.queryId);
                    });
                });
                $("#" + modalId).modal('hide');
            }, onCancel: function () {
                $("#" + modalId).modal('hide');
            }
        });
    }

    function getQueryQueueTabViewConfig(queryQueueItem, queryResultType, queueColorMap) {
        return {
            elementId: cowl.QE_QUERY_QUEUE_TABS_ID,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                tabs: getQueryResultGridTabViewConfig(queryQueueItem, queryResultType, queueColorMap)
            }
        };
    };

    function getQueryResultGridTabViewConfig(queryQueueItem, queryResultType, queueColorMap) {
        var queryFormAttributes = queryQueueItem.queryReqObj,
            queryId = queryFormAttributes.queryId,
            queryIdSuffix = '-' + queryId,
            queryResultGridId = cowl.QE_QUERY_RESULT_GRID_ID + queryIdSuffix,
            queryResultTextId = cowl.QE_QUERY_RESULT_TEXT_ID + '-grid' + queryIdSuffix,
            queryQueueResultGridTabId = cowl.QE_QUERY_QUEUE_RESULT_GRID_TAB_ID + queryIdSuffix;

        return [{
            elementId: queryQueueResultGridTabId,
            title: 'Result',
            iconClass: 'icon-table',
            view: "SectionView",
            tabConfig: {
                activate: function(event, ui) {
                    if ($('#' + queryResultGridId).data('contrailGrid')) {
                        $('#' + queryResultGridId).data('contrailGrid').refreshView();
                    }
                },
                removable: true,
                onRemoveTab: function () {
                    removeBadgeColorFromQueryQueue(queueColorMap, queryId);
                }
            },
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: queryResultTextId,
                                view: 'QueryTextView',
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    queryFormAttributes: queryFormAttributes
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: queryResultGridId,
                                view: 'QueryResultGridView',
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    queryResultPostData: { queryId: queryId },
                                    queryFormAttributes: queryFormAttributes
                                }
                            }
                        ]
                    }
                ]
            }
        }];
    }

    function getQueryResultChartTabViewConfig(queryQueueItem) {
        var queryId = queryQueueItem.queryReqObj.queryId,
            queryFormAttributes = queryQueueItem.queryReqObj,
            queryIdSuffix = '-' + queryId,
            queryResultChartId = cowl.QE_QUERY_RESULT_CHART_ID + queryIdSuffix,
            queryResultChartGridId = cowl.QE_QUERY_RESULT_CHART_GRID_ID + queryIdSuffix,
            queryResultChartTabViewConfig = [],
            queryResultTextId = cowl.QE_QUERY_RESULT_TEXT_ID + '-chart' + queryIdSuffix,
            queryQueueResultChartTabId = cowl.QE_QUERY_QUEUE_RESULT_CHART_TAB_ID + queryIdSuffix;

        queryResultChartTabViewConfig.push({
            elementId: queryQueueResultChartTabId,
            title: 'Chart',
            iconClass: 'icon-table',
            view: "SectionView",
            tabConfig: {
                activate: function (event, ui) {
                    $('#' + queryResultChartId).find('svg').trigger('refresh');
                    if ($('#' + queryResultChartGridId).data('contrailGrid')) {
                        $('#' + queryResultChartGridId).data('contrailGrid').refreshView();
                    }
                },
                renderOnActivate: true,
                removable: true
            },
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: queryResultTextId,
                                view: 'QueryTextView',
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    queryFormAttributes: queryFormAttributes
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: queryResultChartId,
                                title: cowl.TITLE_CHART,
                                iconClass: 'icon-bar-chart',
                                view: "QueryResultLineChartView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    queryId: queryId,
                                    queryFormAttributes: queryFormAttributes.formModelAttrs,
                                    queryResultChartId: queryResultChartId,
                                    queryResultChartGridId: queryResultChartGridId
                                }
                            }
                        ]
                    }
                ]
            }
        });

        return queryResultChartTabViewConfig;
    }

    function removeBadgeColorFromQueryQueue(queueColorMap, queryId) {
        var badgeColorKey = getBadgeColorkey4Value(queueColorMap, queryId);

        if (badgeColorKey !== null) {
            $('#label-icon-badge-' + queryId).removeClass('icon-badge-color-' + badgeColorKey);
            queueColorMap[badgeColorKey] = null;

        }
    }

    function getBadgeColorkey4Value(queueColorMap, value) {
        var badgeColorKey = null;

        $.each(queueColorMap, function(colorKey, colorValue) {
            if (colorValue === value) {
                badgeColorKey = colorKey;
                return false;
            }
        });

        return badgeColorKey
    }

    return QueryQueueView;
});