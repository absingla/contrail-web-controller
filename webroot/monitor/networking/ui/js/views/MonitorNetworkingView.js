/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var MonitorNetworkingView = Backbone.View.extend({
        el: $(contentContainer),

        graphCache: {},

        renderProject: function (viewConfig) {
            var self = this, domain = cowc.DEFAULT_DOMAIN,
                projectFQN = (contrail.checkIfExist(viewConfig.hashParams.fqName)) ? viewConfig.hashParams.fqName : null,
                projectUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;


            renderProjectDropdown(domain, projectFQN, projectUUID, function (projectFQN, projectUUID) {
                _ignoreOnHashChange = true;
                layoutHandler.setURLHashObj({
                    p: 'mon_net_projects-beta',
                    q: {
                        fqName: projectFQN,
                        uuid: projectUUID
                    }
                });
                self.renderProjectCB(projectFQN, projectUUID);
            });
        },

        renderProjectCB: function (projectFQN, projectUUID) {
            var connectedGraph = getGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONNECTED_GRAPH, projectFQN), projectFQN, ':connected', 'Project'),
                configGraph = getGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONFIG_GRAPH, projectFQN), projectFQN, ':config', 'Project');

            cowu.renderView4Config(this.$el, null, getProjectConfig(connectedGraph, configGraph, projectFQN, projectUUID));
        },

        renderNetwork: function (viewConfig) {
            var self = this, domain = cowc.DEFAULT_DOMAIN,
                networkFQN = (contrail.checkIfExist(viewConfig.hashParams.fqName)) ? viewConfig.hashParams.fqName : null,
                networkUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;

            if(networkUUID == null || networkUUID == '') {
                // TODO: Network UUID should be present in url
                networkUUID = getUUIDByName(networkFQN);
            }

            var connectedGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), networkFQN, ':connected', 'Network'),
                configGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), networkFQN, ':config', 'Network');

            cowu.renderView4Config(this.$el, null, getNetworkConfig(connectedGraph, configGraph, networkFQN, networkUUID));
        },

        renderNetworkList: function (projectFQN) {
            cowu.renderView4Config(this.$el, null, getNetworkListConfig(projectFQN));
        },

        renderInstance: function (viewConfig) {
            var self = this, domain = cowc.DEFAULT_DOMAIN,
                networkFQN = (contrail.checkIfExist(viewConfig.hashParams.vn)) ? viewConfig.hashParams.vn : null,
                instanceUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;

            var connectedGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), instanceUUID, ':connected', 'Instance'),
                configGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), networkFQN, ':config', 'Instance');

            cowu.renderView4Config(this.$el, null, getInstanceConfig(connectedGraph, configGraph, networkFQN, instanceUUID));
        },

        renderInstanceList: function (projectUUID) {
            cowu.renderView4Config(this.$el, null, getInstanceListConfig(projectUUID));
        }

    });

    var renderProjectDropdown = function (domain, projectFQN, projectUUID, changeCB) {
        var that = this;

        $.ajax({
            url: networkPopulateFns.getProjectsURL(domain),
            async: false
        }).done(function (projectList) {
            if (projectList.projects.length > 0) {

                pushBreadcrumbDropdown('projectDropdown');

                if (projectFQN == null) {
                    projectFQN = projectList.projects[0].fq_name.join(':');
                    projectUUID = projectList.projects[0].uuid
                }

                var projects = $.map(projectList.projects, function (n, i) {
                    if (projectUUID == null && projectFQN == n.fq_name.join(':')) {
                        projectUUID = n.uuid
                    }

                    return {
                        name: n.fq_name.join(':'),
                        value: n.uuid
                    };
                });

                var projectDropdown = $('#projectDropdown').contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: projects,
                    change: function (e) {
                        var projectFQN = $('#projectDropdown').data('contrailDropdown').text(),
                            projectUUID = $('#projectDropdown').data('contrailDropdown').value();

                        changeCB(projectFQN, projectUUID);
                    }
                }).data('contrailDropdown');

                projectDropdown.text(projectFQN);
                changeCB(projectFQN, projectUUID);

            } else {
                that.$el.html(ctwm.NO_PROJECT_FOUND);
            }
        }).fail(function (errObj, status, errorText) {
            that.$el.html("Error");
        });

    }

    var getProjectConfig = function (connectedGraph, configGraph, projectFQN, projectUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_PROJECT_VIEW_ID,
                                view: "ProjectView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: projectFQN, projectUUID: projectUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getNetworkConfig = function (connectedGraph, configGraph, networkFQN, networkUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_NETWORK_VIEW_ID,
                                view: "NetworkView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {networkFQN: networkFQN, networkUUID: networkUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getInstanceConfig = function (connectedGraph, configGraph, networkFQN, instanceUUID) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCE_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {connectedGraph: connectedGraph, configGraph: configGraph}
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_INSTANCE_VIEW_ID,
                                view: "InstanceView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {networkFQN: networkFQN, instanceUUID: instanceUUID}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getNetworkListConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORKS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_NETWORKS,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    ajaxConfig: {
                                        url: ctwc.get(ctwc.URL_NETWORKS_DETAILS),
                                        type: "POST"
                                    },
                                    chartConfig: {

                                    },
                                    parseFn: function (response) {
                                        return {
                                            d: [{key: 'Networks', values: networksScatterChartDataParser(response['data']['value'])}],
                                            xLbl: 'Interfaces',
                                            yLbl: 'Connected Networks',
                                            forceX: [0, 5],
                                            forceY: [0, 10],
                                            link: {
                                                hashParams: {
                                                    q: { view: 'list', type: 'network', fqName: 'default:domain', source: 'uve', context: 'domain' }
                                                },
                                                conf: {p: 'mon_net_networks-beta', merge: false}
                                            },
                                            chartOptions: {tooltipFn: tenantNetworkMonitor.networkTooltipFn},
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
                                view: "NetworkListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectFQN: null, parentType: 'domain'}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getInstanceListConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCES_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "InstanceListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {projectUUID: null, parentType: 'domain'}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getGraphConfig = function(url, fqName, keySuffix, focusedElement) {
        return {
            remote: {
                ajaxConfig: {
                    url: url,
                    type: 'GET'
                }
            },
            fqName: fqName,
            uniqueKey: fqName + keySuffix,
            focusedElement: focusedElement
        };

    }

    function networksScatterChartDataParser(vnList) {
        var chartData = [],
            vnObject;

        $.each(vnList, function (idx, d) {
            var vnObject = {};
            vnObject['name'] = d['name'];
            vnObject['uuid'] = d['uuid'];
            vnObject['project'] = vnObject['name'].split(':').slice(0, 2).join(':');
            vnObject['intfCnt'] = ifNull(jsonPath(d, '$..interface_list')[0], []).length;
            vnObject['vnCnt'] = ifNull(jsonPath(d, '$..connected_networks')[0], []).length;
            vnObject['inThroughput'] = ifNull(jsonPath(d, '$..in_bandwidth_usage')[0], 0);
            vnObject['outThroughput'] = ifNull(jsonPath(d, '$..out_bandwidth_usage')[0], 0);
            vnObject['throughput'] = vnObject['inThroughput'] + vnObject['outThroughput'];
            vnObject['x'] = vnObject['intfCnt'];
            vnObject['y'] = vnObject['vnCnt'];
            vnObject['size'] = vnObject['throughput'] + 1;
            vnObject['type'] = 'network';
            vnObject['inBytes'] = $.isNumeric(d['inBytes']) ? d['inBytes'] : 0;
            vnObject['outBytes'] = $.isNumeric(d['outBytes']) ? d['outBytes'] : 0;
            chartData.push(vnObject);
        });

        return chartData;
    }

    return MonitorNetworkingView;
});