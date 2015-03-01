/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var ProjectListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var ajaxConfig = {
                url: networkPopulateFns.getProjectsURL(ctwc.DEFAULT_DOMAIN),
                type: 'GET'
            };

            var listModelConfig = {
                remote: {
                    ajaxConfig: ajaxConfig,
                    hlRemoteConfig: ctwgc.getProjectDetailsHLazyRemoteConfig(),
                    dataParser: ctwp.projectDataParser
                },
                cacheConfig: {
                    getDataFromCache: function (ucid) {
                        return mnPageLoader.mnView.listCache[ucid];
                    },
                    setData2Cache: function (ucid, dataObject) {
                        mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                    },
                    ucid: ctwc.UCID_DEFAULT_DOMAIN_PROJECTS //TODO: Handle multi-tenancy
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            cowu.renderView4Config(this.$el, contrailListModel, getProjectListViewConfig());
        }
    });

    var getProjectListViewConfig = function () {
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
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    chartConfig: {},
                                    parseFn: function (response) {
                                        return {
                                            d: [{
                                                key: 'Projects',
                                                values: response
                                            }],
                                            xLbl: 'Interfaces',
                                            yLbl: 'Networks',
                                            forceX: [0, 5],
                                            forceY: [0, 10],
                                            link: {
                                                hashParams: {
                                                    q: {
                                                        view: 'details',
                                                        type: 'project',
                                                        source: 'uve'
                                                    }
                                                },
                                                conf: {p: 'mon_net_project-beta', merge: false}
                                            },
                                            chartOptions: {tooltipFn: tenantNetworkMonitor.projectTooltipFn},
                                            hideLoadingIcon: false
                                        }
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ProjectGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return ProjectListView;
})
;