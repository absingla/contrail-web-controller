/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            cowu.renderView4Config(self.$el, null, getNetworkViewConfig(viewConfig));
        }
    });

    var getNetworkViewConfig = function (viewConfig) {
        var networkFQN = viewConfig['networkFQN'],
            networkUUID = viewConfig['networkUUID'],
            networkDetailsUrl = ctwc.get(ctwc.URL_NETWORK_SUMMARY, networkFQN);

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                                            $('#' + ctwl.NETWORK_PORT_DIST_ID).find('svg').trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_INSTANCES) {
                                            $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                        } else if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
                                            $('#' + ctwl.NETWORK_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                                        }
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.NETWORK_DETAILS_ID,
                                            title: ctwl.TITLE_DETAILS,
                                            view: "DetailsView",
                                            viewConfig: {
                                                ajaxConfig: {
                                                    url: networkDetailsUrl,
                                                    type: 'GET'
                                                },
                                                templateConfig: getDetailsViewTemplateConfig(),
                                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                                dataParser: function (response) {
                                                    return (!$.isEmptyObject(response)) ? response['value'][0] : response;
                                                }
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_INSTANCES_ID,
                                            title: ctwl.TITLE_INSTANCES,
                                            view: "InstanceListView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                parentUUID: networkUUID,
                                                parentType: 'vn'
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_TRAFFIC_STATS_ID,
                                            title: ctwl.TITLE_TRAFFIC_STATISTICS,
                                            view: "LineWithFocusChartView",
                                            viewConfig: {
                                                ajaxConfig: {
                                                    url: ctwc.get(ctwc.URL_NETWORK_TRAFFIC_STATS, 60, networkFQN, 120),
                                                    type: 'GET'
                                                },
                                                parseFn: parseLineChartData
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_PORT_DIST_ID,
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            view: "ScatterChartView",
                                            viewConfig: {
                                                class: "port-distribution-chart",
                                                ajaxConfig: {
                                                    url: ctwc.get(ctwc.URL_PORT_DISTRIBUTION, networkFQN),
                                                    type: "GET"
                                                },
                                                parseFn: function (response) {
                                                    var retObj = {
                                                        d: [{
                                                            key: 'Source Port',
                                                            values: tenantNetworkMonitorUtils.parsePortDistribution(ifNull(response['sport'], []), {
                                                                startTime: response['startTime'],
                                                                endTime: response['endTime'],
                                                                bandwidthField: 'outBytes',
                                                                flowCntField: 'outFlowCount',
                                                                portField: 'sport'
                                                            })
                                                        },
                                                            {
                                                                key: 'Destination Port',
                                                                values: tenantNetworkMonitorUtils.parsePortDistribution(ifNull(response['dport'], []), {
                                                                    startTime: response['startTime'],
                                                                    endTime: response['endTime'],
                                                                    bandwidthField: 'inBytes',
                                                                    flowCntField: 'inFlowCount',
                                                                    portField: 'dport'
                                                                })
                                                            }],
                                                        forceX: [0, 1000],
                                                        xLblFormat: d3.format(''),
                                                        yDataType: 'bytes',
                                                        fqName: networkFQN,
                                                        yLbl: ctwl.Y_AXIS_TITLE_BW,
                                                        link: {
                                                            hashParams: {
                                                                q: {
                                                                    view: 'list',
                                                                    type: 'network',
                                                                    fqName: networkFQN,
                                                                    context: 'domain'
                                                                }
                                                            }
                                                        },
                                                        chartOptions: {
                                                            clickFn: function(chartConfig){
                                                                var obj= {
                                                                    fqName:chartConfig['fqName'],
                                                                    port:chartConfig['range']
                                                                };
                                                                if(chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
                                                                    obj['startTime'] = chartConfig['startTime'];
                                                                    obj['endTime'] = chartConfig['endTime'];
                                                                }

                                                                if(chartConfig['type'] == 'sport')
                                                                    obj['portType']='src';
                                                                else if(chartConfig['type'] == 'dport')
                                                                    obj['portType']='dst';

                                                                obj['type'] = "flow";
                                                                obj['view'] = "list";
                                                                layoutHandler.setURLHashParams(obj, {p:"mon_net_networks-beta", merge:false});
                                                            },
                                                            tooltipFn: tenantNetworkMonitor.portTooltipFn
                                                        },
                                                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                                                        xLbl: ctwl.X_AXIS_TITLE_PORT
                                                    }
                                                    return retObj;
                                                }
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_PORT_HEAT_CHART_ID,
                                            title: ctwl.TITLE_PORT_MAP,
                                            view: "HeatChartView",
                                            viewConfig: {
                                                ajaxConfig: {
                                                    url: ctwc.get(ctwc.URL_NETWORK_SUMMARY, networkFQN),
                                                    type: 'GET'
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getDetailsViewTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_NETWORK_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualNetworkConfig.connected_networks',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'link',
                                                        template: ctwc.URL_NETWORK,
                                                        params: {
                                                            fqName: 'value.UveVirtualNetworkConfig.connected_networks'
                                                        }
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.acl',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.total_acl_rules',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.interface_list',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'length'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.virtualmachine_list',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'link',
                                                        template: ctwc.URL_INSTANCE,
                                                        params: {
                                                            vn: 'name'
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_TRAFFIC_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.ingress_flow_count',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.egress_flow_count',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.in_bytes',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'byte'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualNetworkAgent.out_bytes',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'byte'
                                                    }
                                                },
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span12',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_VRF_STATS,
                                            key: 'value.UveVirtualNetworkAgent.vrf_stats_list',
                                            templateGenerator: 'BlockGridTemplateGenerator',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'name',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'encaps',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'l2_encaps',
                                                        templateGenerator: 'TextGenerator'
                                                    }

                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    function parseLineChartData(response) {
        var rawdata = response['flow-series'],
            inBytes = {key: "In Bytes", values: [], color: d3_category5[0]}, outBytes = {
                key: "Out Bytes",
                values: [],
                color: d3_category5[1]
            },
            inPackets = {key: "In Packets", values: []}, outPackets = {key: "Out Packets", values: []},
            chartData = [inBytes, outBytes];

        for (var i = 0; i < rawdata.length; i++) {
            var ts = Math.floor(rawdata[i].time / 1000);
            inBytes.values.push({x: ts, y: rawdata[i].inBytes});
            outBytes.values.push({x: ts, y: rawdata[i].outBytes});
            inPackets.values.push({x: ts, y: rawdata[i].inPkts});
            outPackets.values.push({x: ts, y: rawdata[i].outPkts});
        }
        return chartData;
    };

    return NetworkTabView;
});
