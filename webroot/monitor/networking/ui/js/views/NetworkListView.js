/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var NetworkListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var ajaxConfig = {
                url: ctwc.get(ctwc.URL_NETWORKS_DETAILS_IN_CHUNKS, 10),
                type: "POST"
            };

            var listModelConfig = {
                remote: {
                    ajaxConfig: ajaxConfig,
                    dataParser: ctwp.networkDataParser
                },
                lazyRemote: ctwgc.getVNDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK),
                cacheConfig: {
                    getDataFromCache: function (ucid) {
                        return mnPageLoader.mnView.listCache[ucid];
                    },
                    setData2Cache: function (ucid, dataObject) {
                        mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                    },
                    ucid: ctwc.UCID_ALL_VN
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            cowu.renderView4Config(this.$el, contrailListModel, getNetworkListViewConfig());
        }
    });

    var getNetworkListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORKS_PORTS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    loadChartInChunks: true,
                                    parseFn: function (response) {
                                        return {
                                            d: [{key: 'Networks', values: response}],
                                            xLbl: 'Interfaces',
                                            yLbl: 'Connected Networks',
                                            forceX: [0, 5],
                                            forceY: [0, 10],
                                            link: {
                                                hashParams: {
                                                    q: { view: 'list', type: 'network', fqName: 'default:domain', source: 'uve', context: 'domain' }
                                                },
                                                conf: {p: 'mon_networking_networks', merge: false}
                                            },
                                            chartOptions: {tooltipFn: tenantNetworkMonitor.networkTooltipFn, clickFn: onScatterChartClick},
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
                                elementId: ctwl.PROJECT_NETWORKS_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "NetworkGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: null, parentType: 'project'}
                            }
                        ]
                    }
                ]
            }
        }
    };

    function onScatterChartClick(chartConfig) {
        var obj = {
            fqName: chartConfig['name'],
            view: "details",
            type: "network"
        };

        layoutHandler.setURLHashParams(obj, {
            p: "mon_networking_networks",
            merge: false
        });
    };

    return NetworkListView;
});