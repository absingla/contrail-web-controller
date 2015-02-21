/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkView = Backbone.View.extend({
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
                                                    return response['value'][0];
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
                                                url: ctwc.get(ctwc.URL_NETWORK_TRAFFIC_STATS, 60, networkFQN, 120),
                                                parseTSChartData: 'parseTSChartData',
                                                successHandlerTSChart: 'successHandlerTSChart'
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
                                                        chartOptions: {tooltipFn: tenantNetworkMonitor.portTooltipFn},
                                                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                                                        xLbl: ctwl.X_AXIS_TITLE_PORT
                                                    }
                                                    return retObj;
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
            templateGenerator: 'ColumnSectionTemplateGenerator',
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

    function parseTSChartData(response, cbParams) {
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

    function successHandlerTSChart(data, cbParams) {
        var selectorId = "#" + $(cbParams.selector).attr('id');
        var options = {
            height: 300,
            yAxisLabel: 'Bytes per 30 secs',
            y2AxisLabel: 'Bytes per min'
        };
        initTrafficTSChart(selectorId, data, options, null, "formatSumBytes", "formatSumBytes");
    };

    return NetworkView;
});
