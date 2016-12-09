/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view",
    "contrail-list-model",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, ContrailView, ContrailListModel, qeUtils) {
    function getChildView(rootView, subViewID) {
        if (rootView === null || rootView.childViewMap === null || rootView.childViewMap === undefined) {
            return null;
        } else {
            var childViewMap = rootView.childViewMap,
                subView = childViewMap[subViewID] || null;

            if (!subView) {
                _.forEach(childViewMap, function(view, viewID) {
                    if (!subView) {
                        subView = getChildView(view, subViewID);
                    }
                });
            }

            return subView;
        }
    }

    var ProjectListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                contrailListModel = new ContrailListModel(getProjectListModelConfig());

            self.renderView4Config(self.$el, contrailListModel, getProjectListViewConfig(), null, null, null, function(view) {
                var scatterBubbleChartDemoView = getChildView(view, ctwl.PROJECTS_SCATTER_CHART_ID + "_demo");
                if (scatterBubbleChartDemoView !== null) {
                    scatterBubbleChartDemoView.model.onAllRequestsComplete.subscribe(function() {
                        if (scatterBubbleChartDemoView.model.error) {
                            scatterBubbleChartDemoView.chartView.eventObject.trigger("message", {
                                componentId: "XYChartView",
                                action: "update",
                                messages: [
                                    {
                                        message: "Failed to load."
                                    }
                                ]
                            });
                        } else {
                            scatterBubbleChartDemoView.chartView.eventObject.trigger("clearMessage", "XYChartView");
                        }
                    });
                    scatterBubbleChartDemoView.chartView.eventObject.trigger("message", {
                        componentId: "XYChartView",
                        action: "new",
                        messages: [
                            {
                                // title: "New Message",
                                message: "Loading...."
                            }
                        ]
                    });
                }
            });
        }
    });

    function getProjectListModelConfig() {
        return {
            remote: {
                ajaxConfig: {
                        url: ctwc.getProjectsURL({name: ctwc.COOKIE_DOMAIN}, {getProjectsFromIdentity: true}),
                        type: 'GET'
                },
                dataParser: nmwp.projectDataParser,
                hlRemoteConfig: nmwgc.getProjectDetailsHLazyRemoteConfig()
            },
            cacheConfig: {
                ucid: ctwc.UCID_COOKIE_DOMAIN_PROJECT_LIST
            }
        };
    };

    function getProjectListViewConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'Interfaces',
                                        yLabel: 'Networks',
                                        forceX: [0, 10],
                                        forceY: [0, 10],
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        xLabelFormat: d3.format(".01f"),
                                        tooltipConfigCB: getProjectTooltipConfig,
                                        clickCB: onScatterChartClick,
                                        sizeFieldName: 'throughput',
                                        noDataMessage: "No project available."
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_SCATTER_CHART_ID + "_demo",
                                title: ctwl.TITLE_PROJECTS + " demo",
                                view: "ChartView",
                                viewPathPrefix: "js/charts/",
                                viewConfig: {
                                    // loadChartInChunks: true,
                                    chartOptions: ctwvc.getNewNetworkInterfaceChartOptions("networkInterface")
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ProjectGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {pagerOptions: { options: { pageSize: 10, pageSizeSelect: [10, 50, 100] } }}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var onScatterChartClick = function(chartConfig) {
        var projectFQN = chartConfig.name;
        ctwu.setProjectURLHashParams(null, projectFQN, true);
    };

    var getProjectTooltipConfig = function(data) {
        var projectFQNObj = data.name.split(':');

        return {
            title: {
                name: projectFQNObj[1],
                type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_NETWORK
            },
            content: {
                iconClass: 'icon-contrail-project',
                info: [
                    {label: 'Domain', value: projectFQNObj[0]},
                    {label:'Networks', value: data['y']},
                    {label:'Interfaces', value: data['x']},
                    {label:'Throughput', value:formatThroughput(data['throughput'])}
                ],
                actions: [
                    {
                        type: 'link',
                        text: 'View',
                        iconClass: 'fa fa-external-link',
                        callback: onScatterChartClick
                    }
                ]
            }
        };
    };

    return ProjectListView;
});
