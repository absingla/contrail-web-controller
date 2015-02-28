/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    '/monitor/networking/ui/js/views/BreadcrumbView.js'
], function (_, Backbone, BreadcrumbView) {
    var MonitorNetworkingView = Backbone.View.extend({
        el: $(contentContainer),
        graphCache: {},
        chartCache: {},
        listCache: {},

        renderProjectList: function () {
            cowu.renderView4Config(this.$el, null, getProjectListConfig());
        },

        renderProject: function (viewConfig) {
            var self = this,
                fqName = (contrail.checkIfExist(viewConfig.hashParams.fqName) ? viewConfig.hashParams.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (selectedValueData) {
                    self.renderProjectCB(selectedValueData);
                });
            });
       },

        renderProjectCB: function (projectObj) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectFQN = domain + ':' + projectObj.name,
                projectUUID = projectObj.value;

            contrail.setCookie('project', projectObj.name);

            _ignoreOnHashChange = true;
            layoutHandler.setURLHashObj({
                p: 'mon_net_projects-beta',
                q: {
                    fqName: projectFQN,
                    view:'details'
                }
            });

            var connectedGraph = getGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONNECTED_GRAPH, projectFQN), projectFQN, ':connected', 'Project'),
                configGraph = getGraphConfig(ctwc.get(ctwc.URL_PROJECT_CONFIG_GRAPH, projectFQN), projectFQN, ':config', 'Project');

            cowu.renderView4Config(this.$el, null, getProjectConfig(connectedGraph, configGraph, projectFQN, projectUUID));
        },

        renderNetwork: function (viewConfig) {
            var self = this,
                fqName = (contrail.checkIfExist(viewConfig.hashParams.fqName) ? viewConfig.hashParams.fqName : null),
                breadcrumbView = new BreadcrumbView();

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData) {

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName, function (networkSelectedValueData) {
                        self.renderNetworkCB(networkSelectedValueData);
                    });
                }, function (selectedValueData) {
                    self.renderProjectCB(selectedValueData);
                });
            });
        },

        renderNetworkCB: function(networkObj) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name,
                networkUUID = networkObj.value;

            contrail.setCookie(cowc.COOKIE_VIRTUAL_NETWORK, networkObj.name);

            _ignoreOnHashChange = true;
            layoutHandler.setURLHashObj({
                p: 'mon_net_networks-beta',
                q: {
                    fqName: networkFQN,
                    view:'details',
                    type: 'network'
                }
            });

            var connectedGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), networkFQN, ':connected', 'Network'),
                configGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), networkFQN, ':config', 'Network');

            cowu.renderView4Config(this.$el, null, getNetworkConfig(connectedGraph, configGraph, networkFQN, networkUUID));
        },

        renderNetworkList: function (projectFQN) {
            cowu.renderView4Config(this.$el, null, getNetworkListConfig(projectFQN));
        },

        renderInstance: function (viewConfig) {
            var self = this,
                breadcrumbView = new BreadcrumbView(),
                fqName = (contrail.checkIfExist(viewConfig.hashParams.vn)) ? viewConfig.hashParams.vn : null,
                instanceUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;

            breadcrumbView.renderDomainBreadcrumbDropdown(fqName, function (selectedValueData) {
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);

                breadcrumbView.renderProjectBreadcrumbDropdown(fqName, function (projectSelectedValueData) {

                    breadcrumbView.renderNetworkBreadcrumbDropdown(fqName,
                        function (networkSelectedValueData) {
                            self.renderInstanceCB(networkSelectedValueData, instanceUUID);
                        }, function (networkSelectedValueData) {
                            self.renderNetworkCB(networkSelectedValueData);
                        }
                    );
                }, function (selectedValueData) {
                    self.renderProjectCB(selectedValueData);
                });
            });
        },

        renderInstanceCB: function(networkObj, instanceUUID) {
            var self = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                networkFQN = domain + ':' + project + ':' + networkObj.name;

            var connectedGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONNECTED_GRAPH, networkFQN), instanceUUID, ':connected', 'Instance'),
                configGraph = getGraphConfig(ctwc.get(ctwc.URL_NETWORK_CONFIG_GRAPH, networkFQN), networkFQN, ':config', 'Instance');

            cowu.renderView4Config(this.$el, null, getInstanceConfig(connectedGraph, configGraph, networkFQN, instanceUUID));
        },

        renderInstanceList: function (projectUUID) {
            cowu.renderView4Config(this.$el, null, getInstanceListConfig(projectUUID));
        },

        renderFlowList: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getFlowListConfig(viewConfig));
        }
    });

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

    var getProjectListConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_PROJECT_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    /*{
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    ajaxConfig: {
                                        url: ctwc.get(ctwc.URL_ALL_NETWORKS_DETAILS),
                                        type: "POST"
                                    },
                                    chartConfig: {

                                    },
                                    parseFn: function (response) {
                                        return {
                                            d: [{key: 'Projects', values: networksScatterChartDataParser(response['data']['value'])}],
                                            xLbl: 'Interfaces',
                                            yLbl: 'Networks',
                                            forceX: [0, 5],
                                            forceY: [0, 10],
                                            link: {
                                                hashParams: {
                                                    q: {
                                                        view: 'list',
                                                        type: 'project',
                                                        fqName: 'default:domain',
                                                        context: 'domain',
                                                        source: 'uve'
                                                    }
                                                },
                                                conf: {p: 'mon_net_project', merge: false}
                                            },
                                            chartOptions: {tooltipFn: tenantNetworkMonitor.projectTooltipFn},
                                            hideLoadingIcon: false
                                        }
                                    }
                                }
                            },
                        ]
                    },*/
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECTS_ID,
                                title: ctwl.TITLE_PROJECTS,
                                view: "ProjectListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {parentType: 'domain'}
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
                                        url: ctwc.get(ctwc.URL_ALL_NETWORKS_DETAILS),
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
                                viewConfig: {projectFQN: null, parentType: 'project'}
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getFlowListConfig = function (config) {
        var viewConfig = config['hashParams'],
            url = constructReqURL($.extend({}, getURLConfigForGrid(viewConfig), {protocol:['tcp','icmp','udp']}));

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_FLOW_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_SCATTER_CHART_ID,
                                title: ctwl.TITLE_FLOWS,
                                view: "ScatterChartView",
                                viewConfig: {
                                    class: "port-distribution-chart",
                                    ajaxConfig: {
                                        url: url,
                                        type: "GET"
                                    },
                                    parseFn: function(response) {
                                        var portData = constructDataForPortdist(response, getURLConfigForGrid(viewConfig)),
                                            portTitle = (viewConfig['portType'] == 'src') ? ctwl.SOURCE_PORT : ctwl.DESTINATION_PORT,
                                            portRange = [], startPort, endPort,
                                            portDistributionParams = $.deparamURLArgs(url),
                                            valueField, portType,
                                            portType = 'port', flowCntField = 'flowCnt';

                                        if(viewConfig['port'].indexOf('-') > -1) {
                                            portRange = viewConfig['port'].split("-");
                                            startPort = parseInt(portRange[0]);
                                            endPort= parseInt(portRange[1]);
                                            //TODO pushBreadcrumb([viewConfig['fqName'],portTitle + 's (' + viewConfig['port'] + ')']);
                                        } else {
                                            portRange = [viewConfig['port'],viewConfig['port']];
                                            //TODO pushBreadcrumb([viewConfig['fqName'],portTitle + ' ' + viewConfig['port']]);
                                        }

                                        portData = $.map(portData,function(currObj,idx) {
                                            if(currObj[portType] >= portRange[0] && currObj[portType] <= parseInt(portRange[1])) {
                                                return currObj;
                                            }
                                            else {
                                                return null;
                                            }
                                        });

                                        portData = tenantNetworkMonitorUtils.parsePortDistribution(portData,$.extend({startTime:portDistributionParams['startTime'],endTime:portDistributionParams['endTime'],
                                                        bandwidthField:'bytes',flowCntField:flowCntField,portField:'port',startPort:startPort,endPort:endPort},{portType:viewConfig['portType']}));

                                        var retObj = {
                                                d            : [{key: ctwl.SOURCE_PORT, values:portData}],
                                                forceX       : [startPort, endPort],
                                                xLblFormat   : d3.format(''),
                                                yDataType    : 'bytes',
                                                fqName       : viewConfig['fqName'],
                                                yLbl         : ctwl.Y_AXIS_TITLE_BW,
                                                link         : {hashParams:{q:{view:'list', type:'network', fqName:viewConfig['fqName'], context:'domain'}}},
                                                chartOptions : {tooltipFn:tenantNetworkMonitor.portTooltipFn},
                                                title        : ctwl.TITLE_PORT_DISTRIBUTION,
                                                xLbl         : ctwl.X_AXIS_TITLE_PORT
                                            };

                                        return retObj;
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.FLOWS_GRID_ID,
                                title: ctwl.TITLE_FLOWS,
                                view: "FlowListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: viewConfig
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
            cacheConfig: {
                ucid: fqName + keySuffix
            },
            focusedElement: focusedElement
        };

    };

    function networksScatterChartDataParser(vnList) {
        var chartData = [];

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

    function constructDataForPortdist (response, obj) {
        var portCF = crossfilter(response['data']), portDim, portArr = [], portGroup;

        if (obj['port'].indexOf('-') > -1) {
            var data = {
                portType: obj['portType'],
                minPort: obj['port'].split('-')[0],
                maxPort: obj['port'].split('-')[1],
                data: response['data']
            };
            //manageDataSource.setPortRangeData(obj['fqName'], data);
        }

        if (obj['portType'] == 'src') {
            portDim = portCF.dimension(function (d) {
                return d['sport'];
            });
        }
        else {
            portDim = portCF.dimension(function (d) {
                return d['dport'];
            });
        }

        portGroup = portDim.group().reduceSum(function (d) {
            return d['sum_bytes']
        });
        $.each(portGroup.top(Infinity), function (idx, portObj) {
            portDim.filterAll();
            var flowCnt = 0,
                matchedRecords = portDim.filter(portObj['key']).top(Infinity);

            $.each(matchedRecords, function (idx, currPortObj) {
                flowCnt += currPortObj['flow_count'];
            });

            portArr.push({
                port   : portObj['key'],
                bytes  : portObj['value'],
                flowCnt: flowCnt
            });
        });
        return portArr;
    };

    var getURLConfigForGrid = function (viewConfig) {
        var urlConfigObj = {
            'container': "#content-container",
            'context'  : "network",
            'type'     : "portRangeDetail",
            'startTime': viewConfig['startTime'],
            'endTime'  : viewConfig['endTime'],
            'fqName'   : viewConfig['fqName'],
            'port'     : viewConfig['port'],
            'portType' : viewConfig['portType']
        };
        return urlConfigObj;
    };

    return MonitorNetworkingView;
});