/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'];

            var networkRemoteConfig = {
                url: projectFQN != null ? ctwc.get(ctwc.URL_PROJECT_NETWORKS, projectFQN) : ctwc.URL_NETWORKS,
                type: 'POST',
                data: JSON.stringify({
                    data: [{
                        "type": ctwc.TYPE_VIRTUAL_NETWORK,
                        "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                    }]
                })
            };

            cowu.renderView4Config(that.$el, null, getProjectsViewConfig(networkRemoteConfig));

        }
    });

    var getProjectsViewConfig = function (networkRemoteConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECTS_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_NETWORK_GRID_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectNetworksConfig(networkRemoteConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectNetworksConfig = function (networkRemoteConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_NETWORKS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    detail: {
                        template: cowu.generateDetailTemplate(getDetailTemplateConfig(), 'controller')
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: networkRemoteConfig,
                        dataParser: tenantNetworkMonitorUtils.projectNetworksParseFn
                    },
                    lazyRemote: getLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
                }
            },
            columnHeader: {
                columns: ctwgc.projectNetworksColumns
            }
        };
        return gridElementConfig;
    };

    var getLazyRemoteConfig = function (type) {
        return [
            {
                getAjaxConfig: function (responseJSON) {
                    var uuids, lazyAjaxConfig;

                    uuids = $.map(responseJSON, function (item) {
                        return item['name'];
                    });

                    lazyAjaxConfig = {
                        url: ctwc.URL_VM_VN_STATS,
                        type: 'POST',
                        data: JSON.stringify({
                            data: {
                                type: type,
                                uuids: uuids.join(','),
                                minSince: 60,
                                useServerTime: true
                            }
                        })
                    }
                    return lazyAjaxConfig;
                },
                successCallback: function (response, contrailDataView) {
                    var statDataList = tenantNetworkMonitorUtils.statsOracleParseFn(response[0], type),
                        dataItems = contrailDataView.getItems(),
                        statData;

                    for (var j = 0; j < statDataList.length; j++) {
                        statData = statDataList[j];
                        for (var i = 0; i < dataItems.length; i++) {
                            var dataItem = dataItems[i];
                            if (statData['name'] == dataItem['name']) {
                                dataItem['inBytes'] = ifNull(statData['inBytes'], 0);
                                dataItem['outBytes'] = ifNull(statData['outBytes'], 0);
                                break;
                            }
                        }
                    }
                    contrailDataView.updateData(dataItems);
                }
            }
        ];
    };

    function getDetailTemplateConfig() {
        return {
            templateGenerator: 'SectionTemplateGenerator',
            templateGeneratorConfig: {
                columns: [
                    {
                        class: 'span6',
                        rows: [
                            {
                                templateGenerator: 'BlockListTemplateGenerator',
                                title: ctwl.TITLE_NETWORK_DETAILS,
                                templateGeneratorConfig: [
                                    {
                                        key: 'value.UveVirtualNetworkConfig.connected_networks',
                                        valueType: 'text'
                                    },

                                    {
                                        key: 'value.UveVirtualNetworkAgent.acl',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.total_acl_rules',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.interface_list',
                                        valueType: 'length'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.virtualmachine_list',
                                        valueType: 'text'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        class: 'span6',
                        rows: [
                            {
                                templateGenerator: 'BlockListTemplateGenerator',
                                title: ctwl.TITLE_TRAFFIC_DETAILS,
                                templateGeneratorConfig: [
                                    {
                                        key: 'value.UveVirtualNetworkAgent.ingress_flow_count',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.egress_flow_count',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.in_bytes',
                                        valueType: 'format-bytes'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.out_bytes',
                                        valueType: 'format-bytes'
                                    },
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    };

    return NetworkListView;
})
;
