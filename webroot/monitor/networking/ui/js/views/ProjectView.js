/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ProjectView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            cowu.renderView4Config(self.$el, null, getProjectViewConfig(viewConfig));
        }

    });

    var getProjectViewConfig = function (viewConfig) {
        var projectFQN = viewConfig['projectFQN'],
            projectUUID = viewConfig['projectUUID'];

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                                            $('#' + ctwl.PROJECT_PORT_DIST_ID).find('svg').trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_NETWORKS) {
                                            $('#' + ctwl.PROJECT_NETWORK_GRID_ID).data('contrailGrid').refreshView();
                                        } else if (selTab == ctwl.TITLE_INSTANCES) {
                                            $('#' + ctwl.PROJECT_INSTANCE_GRID_ID).data('contrailGrid').refreshView();
                                        }
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.PROJECT_PORTS_SCATTER_CHART_ID,
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            view: "ScatterChartView",
                                            viewConfig: {
                                                class: "port-distribution-chart",
                                                ajaxConfig: {
                                                    url: ctwc.get(ctwc.URL_PORT_DISTRIBUTION, projectFQN),
                                                    type: 'GET'
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
                                                        fqName: projectFQN,
                                                        yLbl: ctwl.Y_AXIS_TITLE_BW,
                                                        link: {
                                                            hashParams: {
                                                                q: {
                                                                    view: 'list',
                                                                    type: 'project',
                                                                    fqName: projectFQN,
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
                                            elementId: ctwl.PROJECT_NETWORKS_ID,
                                            title: ctwl.TITLE_NETWORKS,
                                            view: "NetworkListView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                projectFQN: projectFQN,
                                                parentType: 'project'
                                            }
                                        },
                                        {
                                            elementId: ctwl.PROJECT_INSTANCES_ID,
                                            title: ctwl.TITLE_INSTANCES,
                                            view: "InstanceListView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                parentUUID: projectUUID,
                                                parentType: 'project'
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

    return ProjectView;
});
