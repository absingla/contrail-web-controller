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
            var that = this,
                domain = cowc.DEFAULT_DOMAIN,
                projectFQN = (contrail.checkIfExist(viewConfig.hashParams.fqName)) ? viewConfig.hashParams.fqName : null,
                projectUUID = (contrail.checkIfExist(viewConfig.hashParams.uuid)) ? viewConfig.hashParams.uuid : null;


            that.renderProjectDropdown(domain, projectFQN, projectUUID, function (projectFQN, projectUUID) {
                _ignoreOnHashChange = true;
                layoutHandler.setURLHashObj({
                    p: 'mon_net_projects-beta',
                    q: {
                        fqName: projectFQN,
                        uuid: projectUUID
                    }
                });
                that.renderProjectGraph(projectFQN, projectUUID);
            });

        },

        renderProjectDropdown: function (domain, projectFQN, projectUUID, changeCB) {
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

        },

        renderProjectGraph: function (projectFQN, projectUUID) {
            var that = this,
                vConfig = {
                    url: ctwc.get(ctwc.URL_PROJECT_GRAPH, projectFQN),
                    fqName: projectFQN,
                    focusedElement: 'Project'
                };

            var networkRemoteConfig = {
                url: ctwc.get(ctwc.URL_PROJECT_NETWORKS, projectFQN),
                type: 'POST',
                data: JSON.stringify({
                    data: [{
                        "type": ctwc.TYPE_VIRTUAL_NETWORK,
                        "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                    }]
                })
            };

            var instanceRemoteConfig = {
                url: ctwc.get(ctwc.URL_PROJECT_INSTANCES, projectUUID),
                type: 'POST',
                data: JSON.stringify({
                    data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                })
            };

            cowu.renderView4Config(that.$el, null, getProjectsViewConfig(vConfig, projectFQN, networkRemoteConfig, instanceRemoteConfig));
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
                                elementId: ctwl.PROJECTS_GRAPH_ID,
                                view: "NetworkingGraphView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
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
                                        if (selTab == ctwl.TITLE_PORT_DISTRIBUTION) {
                                            $('#' + ctwl.PROJECTS_PORT_DIST_ID).find('svg').trigger('refresh');
                                        } else if (selTab == ctwl.TITLE_NETWORKS) {
                                            $('#' + ctwl.PROJECT_NETWORKS_ID).data('contrailGrid').refreshView();
                                        } else if (selTab == ctwl.TITLE_INSTANCES) {
                                            $('#' + ctwl.PROJECT_INSTANCES_ID).data('contrailGrid').refreshView();
                                        }
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.PROJECTS_PORT_DIST_ID,
                                            title: ctwl.TITLE_PORT_DISTRIBUTION,
                                            view: "ChartView",
                                            viewConfig: {
                                                class: ctwl.PORT_DIST_CHART_ID,
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
                                                        chartOptions: {tooltipFn: tenantNetworkMonitor.portTooltipFn},
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
                    },
                    lazyRemote: getLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE)
                }
            },
            columnHeader: {
                columns: ctwgc.projectInstancesColumns
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
    }

    return ProjectsView;
});
