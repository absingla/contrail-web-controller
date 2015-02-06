/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ProjectsView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var that = this;

            $.ajax({
                url: networkPopulateFns.getProjectsURL('default-domain'),
                async: false
            }).done(function (projectList) {
                if (projectList.projects.length > 0) {
                    var projectFQN = projectList.projects[0].fq_name.join(':'),
                        projectUUID = projectList.projects[0]['uuid'],
                        vConfig = {
                            url: ctwc.get(ctwc.URL_PROJECT_VISUALIZATION, projectFQN),
                            selectorId: '#topology',
                            fqName: projectFQN,
                            focusedElement: 'Project'
                        };

                    var vnColumnfilters = ['UveVirtualNetworkAgent:interface_list', 'UveVirtualNetworkAgent:in_bandwidth_usage', 'UveVirtualNetworkAgent:out_bandwidth_usage',
                        'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes', 'UveVirtualNetworkConfig:connected_networks',
                        'UveVirtualNetworkAgent:virtualmachine_list'];

                    var iColumnFilters = ['UveVirtualMachineAgent:interface_list', 'UveVirtualMachineAgent:vrouter', 'UveVirtualMachineAgent:fip_stats_list'];

                    var networkRemoteConfig = {
                        url: ctwc.get(ctwc.URL_PROJECT_NETWORKS, projectFQN),
                        type: 'POST',
                        data: {data: [{"type": "virtual-network", "cfilt": vnColumnfilters.join(',')}]}
                    };

                    var instanceRemoteConfig = {
                        url: ctwc.get(ctwc.URL_PROJECT_INSTANCES, projectUUID),
                        type: 'POST',
                        data: {
                            data: [{"type": "virtual-machine", "cfilt": iColumnFilters.join(',')}]
                        }
                    };

                    cowu.renderView4Config(that.$el, null, getProjectsViewConfig(vConfig, projectFQN, networkRemoteConfig, instanceRemoteConfig));
                } else {
                    that.$el.html("No Project Found");
                }
            }).fail(function (errObj, status, errorText) {
                that.$el.html("Error");
            });
        }
    });

    var getProjectsViewConfig = function (vConfig, projectFQN, networkRemoteConfig, instanceRemoteConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECTS_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_VISUALIZATION_ID,
                                view: "VisualizationView",
                                viewConfig: {elementConfig: vConfig}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                        if (selTab == 'Port Distribution') {
                                            $('#' + ctwl.PROJECTS_PORT_DIST_ID).find('svg').trigger('refresh');
                                        } else if (selTab == 'Networks') {
                                            $('#' + ctwl.PROJECT_NETWORKS_ID).data('contrailGrid').refreshView();
                                        } else if (selTab == 'Instances') {
                                            $('#' + ctwl.PROJECT_INSTANCES_ID).data('contrailGrid').refreshView();
                                        }
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.PROJECTS_PORT_DIST_ID,
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            view: "ChartView",
                                            viewConfig: {
                                                class: "port-distribution-chart",
                                                url: ctwc.get(ctwc.URL_PORT_DISTRIBUTION, projectFQN),
                                                renderFn: 'initScatterChart',
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
                                                        yLbl: 'Bandwidth',
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
                                                        chartOptions: {tooltipFn: tenantNetworkMonitor.portTooltipFn},
                                                        title: 'Port Distribution',
                                                        xLbl: 'Port'
                                                    }
                                                    return retObj;
                                                }
                                            }
                                        },
                                        {
                                            elementId: ctwl.PROJECT_NETWORKS_ID,
                                            title: ctwl.TITLE_NETWORKS,
                                            view: "GridView",
                                            viewConfig: {
                                                elementConfig: getProjectNetworksConfig(networkRemoteConfig)
                                            }
                                        },
                                        {
                                            elementId: ctwl.PROJECT_INSTANCES_ID,
                                            title: ctwl.TITLE_INSTANCES,
                                            view: "GridView",
                                            viewConfig: {
                                                elementConfig: getProjectInstancesConfig(instanceRemoteConfig)
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
                    checkboxSelectable: false
                },
                dataSource: {
                    remote: {
                        ajaxConfig: networkRemoteConfig,
                        dataParser: tenantNetworkMonitorUtils.projectNetworksParseFn
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectNetworksColumns
            }
        };
        return gridElementConfig;
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_INSTANCES_SUMMARY
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
                    checkboxSelectable: false
                },
                dataSource: {
                    remote: {
                        ajaxConfig: instanceRemoteConfig,
                        dataParser: tenantNetworkMonitorUtils.projectInstanceParseFn
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectInstancesColumns
            }
        };
        return gridElementConfig;
    };

    return ProjectsView;
});
