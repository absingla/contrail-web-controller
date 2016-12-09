/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'moment',
    "protocol",
    'contrail-view-model',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, moment, protocolUtils, ContrailViewModel, qeUtils) {
    var CTViewConfig = function () {
        var self = this;

        self.getInstanceTabViewConfig = function (viewConfig) {
            var instanceUUID = viewConfig['instanceUUID'],
                instanceDetailsUrl = ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID),
                networkFQN = viewConfig['networkFQN'],
                tabsToDisplay = viewConfig['tabsToDisplay'],
                tabObjs = [];
            var allTabs = self.getInstanceDetailPageTabConfig(viewConfig);
            if (tabsToDisplay == null) {
                tabObjs = allTabs;
            } else if (typeof tabsToDisplay =='string' || $.isArray(tabsToDisplay)) {
                if(typeof tabsToDisplay == 'string') {
                    tabsToDisplay = [tabsToDisplay];
                }
                for(var i = 0; i < tabsToDisplay.length; i++ ) {
                    $.each(allTabs,function(idx,obj) {
                        if(obj['view'] == tabsToDisplay[i])
                            tabObjs.push(obj);
                    });
                }
            }
            return {
                elementId: ctwl.INSTANCE_TABS_ID,
                view: "TabsView",
                viewConfig: {
                    theme: 'classic',
                    active: 1,
                    tabs: tabObjs
                }
            };
        };

        self.getInstanceDetailPageTabConfig = function (viewConfig) {
            var instanceUUID = viewConfig['instanceUUID'];
            var networkFQN = viewConfig['networkFQN'];
            var instanceDetailsUrl = ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID);

            return [
                    {
                        elementId: ctwl.INSTANCE_DETAILS_ID,
                        title: ctwl.TITLE_DETAILS,
                        view: "DetailsView",
                        viewConfig: {
                            ajaxConfig: {
                                url: instanceDetailsUrl,
                                type: 'GET'
                            },
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            templateConfig: ctwu.getInstanceDetailsTemplateConfig(),
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            dataParser: function (response) {
                                return {
                                    name: instanceUUID,
                                    value: response
                                };
                            }
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_INTERFACE_ID,
                        title: ctwl.TITLE_INTERFACES,
                        view: "InterfaceGridView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ($('#' + ctwl.INSTANCE_INTERFACE_GRID_ID).data('contrailGrid')) {
                                    $('#' + ctwl.INSTANCE_INTERFACE_GRID_ID).data('contrailGrid').refreshView();
                                }
                            }
                        },
                        viewConfig: {
                            parentType: ctwc.TYPE_VIRTUAL_MACHINE,
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID,
                            networkFQN: networkFQN,
                            elementId: ctwl.INSTANCE_INTERFACE_GRID_ID
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_TRAFFIC_STATS_ID,
                        title: ctwl.TITLE_TRAFFIC_STATISTICS,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        view: "InstanceTrafficStatsView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        tabConfig: {
                            renderOnActivate: true,
                            activate: function(event, ui) {
                                $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).find('svg').trigger('refresh');
                            }
                        },
                        viewConfig: {
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID,
                            parseFn: ctwp.parseTrafficLineChartData
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_PORT_DIST_ID,
                        title: ctwl.TITLE_PORT_DISTRIBUTION,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        view: "InstancePortDistributionView",
                        viewPathPrefix: "monitor/networking/ui/js/views/",
                        tabConfig: {
                            renderOnActivate: true,
                            // activate: function(event, ui) {
                            //     $('#' + ctwl.INSTANCE_PORT_DIST_CHART_ID).trigger('refresh');
                            // }
                        },
                        viewConfig: {
                            modelKey: ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID),
                            instanceUUID: instanceUUID
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_PORT_HEAT_CHART_ID,
                        title: ctwl.TITLE_PORT_MAP,
                        view: "HeatChartView",
                        viewConfig: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID),
                                type: 'GET'
                            },
                            chartOptions: {getClickFn: function(){}}
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_CPU_MEM_STATS_ID,
                        title: ctwl.TITLE_CPU_MEMORY,
                        view: "LineBarWithFocusChartView",
                        tabConfig: {
                            renderOnActivate: true,
                            activate: function(event, ui) {
                                $('#' + ctwl.INSTANCE_CPU_MEM_STATS_ID).find('svg').trigger('refresh');
                            }
                        },
                        viewConfig: {
                            modelConfig: getInstanceCPUMemModelConfig(networkFQN, instanceUUID),
                            parseFn: ctwp.parseCPUMemLineChartData,
                            chartOptions: {
                                forceY1: [0, 0.5]
                            }
                        }
                    },
                    {
                        elementId: ctwl.INSTANCE_CPU_MEM_STATS_ID + "-new2",
                        title: ctwl.TITLE_CPU_MEMORY,
                        view: "ChartView",
                        viewPathPrefix: 'js/charts/',
                        tabConfig: {
                            renderOnActivate: true
                        },
                        viewConfig: {
                            modelConfig: getInstanceCPUMemModelConfig(networkFQN, instanceUUID),
                            chartOptions: {
                                chartId: "cpumem",
                                type: "XYChartView",
                                chartHeight: 600,
                                handlers: [
                                    {
                                        type: 'dataProvider',
                                        config: {
                                            formatData: ctwp.parseCPUMemChartData
                                        }
                                    },
                                    {
                                        type: 'bindingHandler',
                                        config: {
                                            bindings: [
                                                {
                                                    sourceComponent: 'compositeY',
                                                    sourceModel: 'config',
                                                    sourcePath: 'plot',
                                                    targetComponent: 'controlPanel',
                                                    targetModel: 'config',
                                                    action: 'sync'
                                                }
                                            ]
                                        },
                                    }
                                ],
                                components: [
                                    {
                                        type: 'compositeY',
                                        config: {
                                            el: "#cpumem-xyChart",
                                            marginLeft: 70,
                                            marginRight: 80,
                                            marginInner: 5,
                                            chartHeight: 400,
                                            //chartWidthDelta: -40,
                                            axis: {
                                                x: {
                                                    formatter: function(value) {
                                                        return moment(value).format("HH:m");
                                                    }
                                                },
                                                y1: {
                                                    position: "left",
                                                    formatter: d3.format(".01f"),
                                                    //domain: [0, undefined],
                                                },
                                                y2: {
                                                    position: "right",
                                                    formatter: function (y2Value) {
                                                        console.log(y2Value);
                                                        return formatBytes(y2Value * 1024, true);
                                                    },
                                                    //[min, max] when a value is set to undefined, will use whatever chart calculated value
                                                    //with following config, will force min to 0 and max to chart calculated max scale.
                                                    //domain: [0, undefined],
                                                }
                                            },
                                            plot: {
                                                "x": {
                                                    accessor: "ts",
                                                    label: "Time",
                                                    axis: "x"
                                                },
                                                "y": [
                                                    {
                                                        accessor: "cpu_one_min_avg",
                                                        label: 'CPU 1min Avg',
                                                        color: cowc.D3_COLOR_CATEGORY5[1],
                                                        enabled: true,
                                                        chart: "stackedBar",
                                                        axis: "y1",
                                                        tooltip: "cpuMemTooltip"
                                                    },
                                                    {
                                                        accessor: "rss",
                                                        label: "Memory Usage" ,
                                                        color: cowc.D3_COLOR_CATEGORY5[3],
                                                        enabled: true,
                                                        chart: "line",
                                                        axis: "y2",
                                                        tooltip: "cpuMemTooltip"
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        id: 'cpuMemTooltip',
                                        type: 'tooltip',
                                        config: {
                                            dataConfig: [
                                                {
                                                    accessor: "ts",
                                                    labelFormatter: function (key) {
                                                        return 'Time'
                                                    },
                                                    valueFormatter: function(value) {
                                                        return moment(value).format("HH:m:s");
                                                    }
                                                },
                                                {
                                                    accessor: "cpu_one_min_avg",
                                                    labelFormatter: function (key) {
                                                        return 'CPU 1min Average'
                                                    },
                                                    valueFormatter: function(value) {
                                                        return d3.round(value, 1) + " %";
                                                    }
                                                },
                                                {
                                                    accessor: "rss",
                                                    labelFormatter: function(name) {
                                                        return "Memory Usage";
                                                    },
                                                    valueFormatter: function(value) {
                                                        return formatBytes(value * 1024, false, 2, 3);
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'controlPanel',
                                        config: {
                                            el: "#cpumem-controlPanel",
                                            enable: true,
                                            buttons: [
                                                {
                                                    name: "filter",
                                                    title: "Filter",
                                                    iconClass: 'fa fa-filter',
                                                    events: {
                                                        click: "filterVariables"
                                                    },
                                                    panel: {
                                                        name: "accessorData",
                                                        width: "350px"
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'navigation',
                                        config: {
                                            el: "#cpumem-navigation",
                                            enable: true,
                                            marginLeft: 70,
                                            marginRight: 80,
                                            chartWidthDelta: -40,
                                            marginInner: 5,
                                            chartHeight: 200,
                                            selection: [75, 100],
                                            axis: {
                                                x: {
                                                    formatter: function(value) {
                                                        return d3.time.format("%H:%M")(value);
                                                    }
                                                },
                                                y1: {
                                                    position: "left",
                                                    formatter: d3.format(".01f")
                                                },
                                                y2: {
                                                    position: "right",
                                                    formatter: function (y2Value) {
                                                        return formatBytes(y2Value * 1024, true);
                                                    },
                                                    //[min, max] when a value is set to undefined, will use whatever chart calculated value
                                                    //with following config, will force min to 0 and max to chart calculated max scale.
                                                    //domain: [0, undefined],
                                                }
                                            },
                                            plot: {
                                                x: {
                                                    accessor: "ts",
                                                    label: "Time"
                                                },
                                                y: [
                                                    {
                                                        accessor: "cpu_one_min_avg",
                                                        color: cowc.D3_COLOR_CATEGORY5[1],
                                                        label: 'CPU 1min Avg',
                                                        enable: true,
                                                        chart: "stackedBar",
                                                        axis: "y1"
                                                    },
                                                    {
                                                        accessor: "rss",
                                                        color: cowc.D3_COLOR_CATEGORY5[3],
                                                        label: 'Memory Usage',
                                                        enable: true,
                                                        chart: "line",
                                                        axis: "y2"
                                                    }

                                                ]
                                            }
                                        }
                                    },
                                    {
                                        type: 'legend',
                                        config: {
                                            el: '#cpumem-legend',
                                            sourceComponent: 'compositeY'
                                        }
                                    },
                                    {
                                        type: 'crosshair',
                                        config: {
                                            el: '#cpumem-xyChart',
                                            sourceComponent: 'compositeY'
                                        }
                                    }
                                ]
                            }
                        }
                    }
            ];
        };

        self.getInstanceTabViewModelConfig = function (instanceUUID) {
            var modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);
            var viewModelConfig = {
                modelKey: modelKey,
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_INSTANCE_DETAIL, instanceUUID),
                        type: 'GET'
                    },
                    dataParser: function(response) {
                        return {name: instanceUUID, value: response};
                    }
                },
                cacheConfig: {
                    ucid: ctwc.UCID_PREFIX_MN_UVES + instanceUUID
                },
                vlRemoteConfig: {
                    vlRemoteList: ctwgc.getVMInterfacesLazyRemoteConfig()
                }
            };

            return new ContrailViewModel(viewModelConfig);
        };

        self.getHeatChartClickFn = function(selector, response) {
            return function(clickData) {
                var currHashObj = layoutHandler.getURLHashObj(),
                    startRange = ((64 * clickData.y) + clickData.x) * 256,
                    endRange = startRange + 255,
                    hashParams = {};

                hashParams['fqName'] = currHashObj['q']['fqName'];
                hashParams['port'] = startRange + "-" + endRange;
                hashParams['startTime'] = new XDate().addMinutes(-10).getTime();
                hashParams['endTime'] = new XDate().getTime();
                hashParams['portType'] = response['type'];
                hashParams['protocol'] = protocolUtils.getProtocolCode(response['pType']);
                hashParams['type'] = "flow";
                hashParams['view'] = "list";

                layoutHandler.setURLHashParams(hashParams, {p: 'mon_networking_networks'});
            }
        };

        self.getDomainBreadcrumbDropdownViewConfig = function (hashParams, customDomainDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null),
                defaultDropdownoptions = {
                    urlValue: (urlValue !== null) ? urlValue.split(':').splice(0,1).join(':') : null,
                    cookieKey: cowc.COOKIE_DOMAIN
                },
                dropdownOptions = $.extend(true, {}, defaultDropdownoptions, customDomainDropdownOptions);

            return {
                elementId: ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: ctwu.getDomainListModelConfig(),
                    dropdownOptions: dropdownOptions
                }
            };
        };
        self.getGlobalSysConfigBCDropdownViewConfig =
            function (hashParams, customDropdownOptions) {
            var urlValue =
                (contrail.checkIfKeyExistInObject(true,
                                                  hashParams,
                                                  'focusedElement.fqName') ?
                 hashParams.focusedElement.fqName : null),
                defaultDropdownoptions = {
                    urlValue: (urlValue !== null) ? urlValue.split(':').splice(0,1).join(':') : null,
                    cookieKey: 'globalSystemConfig'
                },
                dropdownOptions =
                    $.extend(true, {}, defaultDropdownoptions,
                             customDropdownOptions);

            return {
                elementId: ctwl.GLOBALSYS_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: ctwu.getGlobalSysConfigListModelConfig(),
                    dropdownOptions: dropdownOptions
                }
            };
        };

        self.getSASetBCDropdownViewConfig = function (hashParams,
                                                      customDropDownOptions) {
            var urlValue =
                (contrail.checkIfKeyExistInObject(true, hashParams,
                                                  'focusedElement.fqName') ?
                 hashParams.focusedElement.fqName : null),
                defaultDropdownoptions = {
                    urlValue: (urlValue !== null) ?
                                  urlValue.split(':').splice(0,1).join(':') :
                                  null,
                    cookieKey: 'serviceApplSet'
                },
                dropdownOptions =
                    $.extend(true, {}, defaultDropdownoptions,
                             customDropDownOptions);
            return {
                elementId: ctwl.SASET_BREADCRUMB_DROPDOWN,
                view: "BreadcrumbDropdownView",
                viewConfig: {
                    modelConfig: ctwu.getSASetListModelConfig(),
                    dropdownOptions: dropdownOptions
                }
            }
        }

        self.getProjectBreadcrumbDropdownViewConfig = function(hashParams, customProjectDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

            return function(domainSelectedValueData) {

                var defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(1, 1).join(':') : null,
                        cookieKey: cowc.COOKIE_PROJECT,
                        parentSelectedValueData: domainSelectedValueData,
                        preSelectCB : function(selectedValueData) {
                            if(getValueByJsonPath(selectedValueData,'value') != null) {
                                return $.ajax({
                                            type:"GET",
                                            url:'/api/tenants/get-project-role?id=' +
                                                selectedValueData['value'] +
                                                '&project=' +
                                                selectedValueData['name']
                                        });
                            } else {
                                var defObj = $.Deferred();
                                defObj.resolve();
                                return defObj;
                            }
                        }
                    },
                    dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customProjectDropdownOptions);

                return {
                    elementId: ctwl.PROJECTS_BREADCRUMB_DROPDOWN,
                    view: "BreadcrumbDropdownView",
                    viewConfig: {
                        modelConfig:
                            ctwu.getProjectListModelConfig(domainSelectedValueData,
                                                           dropdownOptions),
                        dropdownOptions: dropdownOptions
                    }
                }
            };
        };
        self.getDNSBreadcrumbDropdownViewConfig = function(hashParams, customDNSDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

            return function(domainSelectedValueData) {
                var domain = domainSelectedValueData.value,
                    defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(1, 1).join(':') : null,
                        cookieKey: 'dnsServer',
                        parentSelectedValueData: domainSelectedValueData
                    },
                    dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customDNSDropdownOptions);

                return {
                    elementId: ctwl.DNS_BREADCRUMB_DROPDOWN,
                    view: "BreadcrumbDropdownView",
                    viewConfig: {
                        modelConfig: ctwu.getDNSListModelConfig(domain),
                        dropdownOptions: dropdownOptions
                    }
                }
            };
        };

        self.getNetworkBreadcrumbDropdownViewConfig = function(hashParams, customNetworkDropdownOptions) {
            var urlValue = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.fqName') ? hashParams.focusedElement.fqName : null);

            return function(projectSelectedValueData) {
                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                    projectFQN = domain + ':' + projectSelectedValueData.name,
                    defaultDropdownOptions = {
                        urlValue: (urlValue !== null) ? urlValue.split(':').splice(2, 1).join(':') : null,
                        cookieKey: cowc.COOKIE_VIRTUAL_NETWORK,
                        parentSelectedValueData: projectSelectedValueData
                    },
                    dropdownOptions = $.extend(true, {}, defaultDropdownOptions, customNetworkDropdownOptions),
                    modelConfig = (projectSelectedValueData.value === 'all') ? null : ctwu.getNetworkListModelConfig(projectFQN);

                return {
                    elementId: ctwl.NETWORKS_BREADCRUMB_DROPDOWN,
                    view: "BreadcrumbDropdownView",
                    viewConfig: {
                        modelConfig: modelConfig,
                        dropdownOptions: dropdownOptions
                    }
                };
            }
        };

        self.getInstanceBreadcrumbTextViewConfig = function(hashParams, customInstanceTextOptions) {
            var instanceUUID = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.uuid')) ? hashParams.focusedElement.uuid : null,
                vmName = (contrail.checkIfKeyExistInObject(true, hashParams, 'focusedElement.vmName')) ? hashParams.focusedElement.vmName : null,
                urlValue = (contrail.checkIfExist(vmName) && vmName != "") ? vmName : instanceUUID;


            return function(networkSelectedValueData) {
                var defaultTextOptions = {
                        urlValue: (urlValue !== null) ? urlValue : null,
                        parentSelectedValueData: networkSelectedValueData
                    },
                    textOptions = $.extend(true, {}, defaultTextOptions, customInstanceTextOptions);

                return {
                    elementId: ctwl.INSTANCE_BREADCRUMB_TEXT,
                    view: "BreadcrumbTextView",
                    viewConfig: {
                        textOptions: textOptions
                    }
                };
            }
        };

        self.getUnderlayDefaultTabConfig = function (viewConfig) {
            return [
                {
                    elementId: ctwc.UNDERLAY_SEARCHFLOW_TAB_ID,
                    title: ctwl.UNDERLAY_SEARCHFLOW_TITLE,
                    view: "SearchFlowFormView",
                    viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {
                        viewConfig: {
                            model: viewConfig.model
                        },
                        widgetConfig: {
                            elementId: ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.UNDERLAY_SEARCHFLOW_WIDGET_TITLE,
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },{
                    elementId: ctwc.UNDERLAY_TRACEFLOW_TAB_ID,
                    title: ctwl.UNDERLAY_TRACEFLOW_TITLE,
                    view: "TraceFlowTabView",
                    viewPathPrefix:
                        ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {
                        viewConfig: {
                            model: viewConfig.model
                        },
                        widgetConfig: {
                            elementId: ctwc.UNDERLAY_TRACEFLOW_TAB_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.UNDERLAY_TRACEFLOW_TITLE,
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    tabConfig: {
                        activate: function (event, ui){
                            if($("#"+ ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid') != null) {
                                $("#"+ ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: false
                    }
                }
            ];
        };

        self.getUnderlayPRouterTabConfig = function (viewConfig) {
          return [
              {
                  elementId: ctwc.UNDERLAY_DETAILS_TAB_ID,
                  title: ctwl.TITLE_DETAILS,
                  view: "UnderlayDetailsView",
                  viewPathPrefix:
                      ctwl.UNDERLAY_VIEWPATH_PREFIX,
                  app: cowc.APP_CONTRAIL_CONTROLLER,
                  viewConfig: {},
                  tabConfig: {
                      activate: function (event, ui) {
                          if ($('#' + ctwc.UNDERLAY_DETAILS_TAB_ID)) {
                              $('#' + ctwc.UNDERLAY_DETAILS_TAB_ID).trigger('refresh');
                          }
                      },
                      renderOnActivate: false
                  }
              }, {
                  elementId: ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID,
                  title: ctwl.UNDERLAY_PROUTER_INTERFACES_TITLE,
                  view: "PRouterInterfaceView",
                  viewPathPrefix:
                      ctwl.UNDERLAY_VIEWPATH_PREFIX,
                  app: cowc.APP_CONTRAIL_CONTROLLER,
                  viewConfig: {},
                  tabConfig: {
                      activate: function (event, ui){
                          if($("#"+ ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID).
                               data('contrailGrid') != null) {
                              $("#"+ ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID).
                                  data('contrailGrid').refreshView();
                          }
                      },
                      renderOnActivate: false
                  }
              }
          ];
        };

        self.getUnderlayPRouterLinkTabConfig = function () {
            return [
                {
                    elementId: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID,
                    title: ctwl.UNDERLAY_TRAFFIC_STATISTICS,
                    view: "TrafficStatisticsView",
                    viewPathPrefix:
                        ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {

                    }
                }
            ];
        };

        self.getPortDistChartOptions = function() {
            return {
                bindingHandler: {
                    bindings: [
                        {
                            sourceComponent: 'mainChart',
                            sourceModel: 'config',
                            sourcePath: 'accessorData',
                            targetComponent: 'controlPanel',
                            targetModel: 'config',
                            action: 'sync'
                        }
                    ]
                },
                controlPanel: {
                    enable: true,
                    buttons: [
                        {
                            name: "filter",
                            title: "Filter",
                            iconClass: 'fa fa-filter',
                            events: {
                                click: "filterVariables"
                            },
                            panel: {
                                name: "accessorData",
                                width: "350px"
                            }
                        },
                        {
                            name: "zoomIn",
                            title: "Zoom In",
                            iconClass: 'fa fa-search-plus'
                        },
                        {
                            name: "zoomOut",
                            title: "Zoom Out",
                            iconClass: 'fa fa-search-minus'
                        },
                        {
                            name: "zoomReset",
                            title: "Zoom Reset",
                            iconClass: 'fa fa-times-circle-o'
                        }
                    ]
                },
                navigation: {
                    enable: true,
                    marginLeft: 70,
                    marginRight: 70,
                    xAccessor: 'x',
                    accessorData: {
                        'y' : {
                            label: 'Bandwidth (Last 5 Mins)',
                            enable: true,
                            y: 1,
                            chartType: 'line',
                            tooltip : {
                                nameFormatter: function(name) {
                                    return "Bandwidth";
                                },
                                valueFormatter: function(value) {
                                    return formatBytes(value * 1024, false, 2, 3);
                                }
                            }
                        },
                        'y2' : {
                            label: 'Bandwidth (Last 10 Mins)',
                            enable: true,
                            y: 2,
                            chartType: 'line',
                            tooltip : {
                                nameFormatter: function(name) {
                                    return "Bandwidth";
                                },
                                valueFormatter: function(value) {
                                    return formatBytes(value * 1024, false, 2, 3);
                                }
                            }
                        }
                    },
                    axis: {
                        x: {
                            formatter: d3.format(".2f"),
                            scale: 'scaleLinear',
                            domain: [0, 20000],
                            nice: true
                        }
                    }
                },
                xyChart: {
                    xLabel: ctwl.X_AXIS_TITLE_PORT,
                    tooltip: {
                        contentCB: ctwgrc.getPortDistributionTooltipConfig(onScatterChartClick),
                        clickCB: onScatterChartClick,
                    },
                    xAccessor: 'x',
                    chartWidthDelta: -40,
                    marginLeft: 70,
                    marginRight: 70,
                    marginTop: 10,
                    marginBottom: 40,
                    marginInner: 10,
                    rRange: [2, 10],
                    accessorData: {
                        'y' : {
                            label: ctwl.Y_AXIS_TITLE_BW,
                            enable: false,
                            y: 1,
                            chartType: 'scatterBubble',
                            sizeAccessor: 'flowCnt',
                            shape: 'circle',
                            tooltip : {
                                nameFormatter: function(name) {
                                    return "Bandwidth";
                                },
                                valueFormatter: function(value) {
                                    return formatBytes(value * 1024, false, 2, 3);
                                }
                            }
                        },
                        'y2' : {
                            label: 'Bandwidth (Last 10 Mins)',
                            enable: true,
                            y: 2,
                            chartType: 'scatterBubble',
                            sizeAccessor: 'flowCnt',
                            shape: 'circle',
                            tooltip : {
                                nameFormatter: function(name) {
                                    return "Bandwidth";
                                },
                                valueFormatter: function(value) {
                                    return formatBytes(value * 1024, false, 2, 3);
                                }
                            }
                        }
                    },
                    axis: {
                        x: {
                            formatter: d3.format(".0f"),
                            scale: 'scalePow',
                            nice: true
                        },
                        y1: {

                        },
                        y2: {
                            //labelMargin: 60
                        }
                    }
                },
                message: {
                    noDataMessage: cowm.DATA_SUCCESS_EMPTY,
                }
            }
        };

        self.getNewPortDistChartOptions = function(chartId) {
            function numberFormatFunction (number) {
                return _.isUndefined(number) ? NaN : number.toFixed(2);
            }

            function byteFormatFunction(bytes) {
                return window.formatBytes(bytes * 1024, false, false, 2);
            }

            return {
                containerClassNames: "zoom-scatter-chart-container colmask rightmenu",
                chartId: chartId,
                type: "XYChartView",
                components: [
                    {
                        type: "compositeY",
                        config: {
                            el: "#" + chartId + "-xyChart",
                            yTicks: 6,
                            marginInner: 20,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 450,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        label: "Bandwidth (Last 5 Mins)",
                                        enabled: true,
                                        axis: "y1",
                                        chart: "scatterBubble",
                                        sizeAccessor: "flowCnt",
                                        sizeAxis: "rAxis",
                                        shape: "circle",
                                    }, {
                                        accessor: "y2",
                                        label: "Bandwidth (Last 10 Mins)",
                                        enabled: true,
                                        axis: "y2",
                                        chart: "scatterBubble",
                                        sizeAccessor: "flowCnt",
                                        sizeAxis: "rAxis",
                                        shape: "circle",
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    label: "Port",
                                    scale: "scaleLinear",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: byteFormatFunction,

                                    labelMargin: 10
                                },
                                y2: {
                                    position: "right",
                                    formatter: byteFormatFunction,
                                    labelMargin: 10
                                },
                                rAxis: {
                                    range: [5, 20]
                                }
                            }
                        },
                    }, {
                        type: "tooltip",
                        config: {
                            title: "BUBBLE",
                            dataConfig: [
                                {
                                    accessor: "x",
                                    labelFormatter: function () {
                                        return "Port";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "y",
                                    labelFormatter: function () {
                                        return "Bandwidth (Last 5 Mins)";
                                    },
                                    valueFormatter: byteFormatFunction
                                }, {
                                    accessor: "y2",
                                    labelFormatter: function () {
                                        return "Bandwidth (Last 10 Mins)";
                                    },
                                    valueFormatter: byteFormatFunction
                                }, {
                                    accessor: "flowCnt",
                                    labelFormatter: function () {
                                        return "Flow Count";
                                    },
                                    valueFormatter: numberFormatFunction
                                }
                            ],
                        },
                    }, {
                        type: "navigation",
                        config: {
                            el: "#" + chartId + "-navigation",
                            marginInner: 10,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 250,
                            yTicks: 6,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        chart: "line",
                                        enabled: true,
                                        label: "Bandwidth (Last 5 Mins)",
                                        axis: "y1"
                                    }, {
                                        accessor: "y2",
                                        chart: "line",
                                        enabled: true,
                                        label: "Bandwidth (Last 10 Mins)",
                                        axis: "y2"
                                    },
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".2f"),
                                    label: "Port",
                                    scale: "scaleLinear",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: byteFormatFunction,
                                    labelMargin: 10
                                },
                                y2: {
                                    position: "right",
                                    formatter: byteFormatFunction,
                                    labelMargin: 10
                                }
                            }
                        }
                    }, {
                        type: "controlPanel",
                        config: {
                            el: "#" + chartId + "-controlPanel",
                            enabled: true,
                            buttons: [
                                {
                                    name: "zoomIn",
                                    title: "Zoom In",
                                    iconClass: "fa fa-search-plus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomOut",
                                    title: "Zoom Out",
                                    iconClass: "fa fa-search-minus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomReset",
                                    title: "Zoom Reset",
                                    iconClass: "fa fa-times-circle-o",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomSelection",
                                    title: "Zoom by Selection",
                                    iconClass: "fa fa-crop",
                                    events: {
                                        click: ""
                                    }
                                }
                            ]
                        }
                    }, {
                        type: "message",
                        config: {
                            el: "#" + chartId + "-statusMsg",
                            enable: true,
                        }
                    }
                ],
                dataConfig: {
                    dataParser: function(data) {
                        console.count("chart option - data parser");
                        console.log(data);
                        return data;
                    }
                }
            };
        };

        self.getNewNetworkInterfaceChartOptions = function(chartId) {
            function numberFormatFunction (number) {
                return _.isUndefined(number) ? NaN : number.toFixed(2);
            }

            return {
                containerClassNames: "zoom-scatter-chart-container colmask rightmenu",
                chartId: chartId,
                type: "XYChartView",
                components: [
                    {
                        type: "compositeY",
                        config: {
                            el: "#" + chartId + "-xyChart",
                            yTicks: 4,
                            marginInner: 20,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 250,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        label: "Networks",
                                        enabled: true,
                                        axis: "y1",
                                        chart: "scatterBubble",
                                        sizeAccessor: "throughput",
                                        sizeAxis: "rAxis",
                                        shape: "circle",
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    label: "Interfaces",
                                    scale: "scaleLinear",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: window.d3.format(".0f"),
                                    labelMargin: 10
                                },
                                rAxis: {
                                    range: [5, 20]
                                }
                            }
                        },
                    }, {
                        type: "tooltip",
                        config: {
                            title: "BUBBLE",
                            dataConfig: [
                                {
                                    accessor: "x",
                                    labelFormatter: function () {
                                        return "Interfaces";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "y",
                                    labelFormatter: function () {
                                        return "Networks";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "throughput",
                                    labelFormatter: function () {
                                        return "Throughput";
                                    },
                                    valueFormatter: numberFormatFunction
                                }
                            ],
                        },
                    }, {
                        type: "navigation",
                        config: {
                            el: "#" + chartId + "-navigation",
                            marginInner: 10,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 180,
                            yTicks: 4,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        chart: "line",
                                        enabled: true,
                                        label: "Networks",
                                        axis: "y1"
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    scale: "scaleLinear",
                                    label: "Interfaces",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: window.d3.format(".0f"),
                                    labelMargin: 10
                                }
                            }
                        }
                    }, {
                        type: "controlPanel",
                        config: {
                            el: "#" + chartId + "-controlPanel",
                            enabled: true,
                            buttons: [
                                {
                                    name: "zoomIn",
                                    title: "Zoom In",
                                    iconClass: "fa fa-search-plus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomOut",
                                    title: "Zoom Out",
                                    iconClass: "fa fa-search-minus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomReset",
                                    title: "Zoom Reset",
                                    iconClass: "fa fa-times-circle-o",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomSelection",
                                    title: "Zoom by Selection",
                                    iconClass: "fa fa-crop",
                                    events: {
                                        click: ""
                                    }
                                }
                            ]
                        }
                    }, {
                        type: "message",
                        config: {
                            el: "#" + chartId + "-statusMsg",
                            enable: true,
                        }
                    }
                ],
                dataConfig: {
                    dataParser: function(data) {
                        console.count("chart option - data parser");
                        console.log(data);
                        return data;
                    }
                }
            };
        };

        self.getNewConnectedNetworkInterfaceChartOptions = function(chartId) {
            function numberFormatFunction (number) {
                return _.isUndefined(number) ? NaN : number.toFixed(2);
            }

            return {
                containerClassNames: "zoom-scatter-chart-container colmask rightmenu",
                chartId: chartId,
                type: "XYChartView",
                components: [
                    {
                        type: "compositeY",
                        config: {
                            el: "#" + chartId + "-xyChart",
                            yTicks: 4,
                            marginInner: 20,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 250,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        label: "Connected Networks",
                                        enabled: true,
                                        axis: "y1",
                                        chart: "scatterBubble",
                                        sizeAccessor: "throughput",
                                        sizeAxis: "rAxis",
                                        shape: "circle",
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    label: "Interfaces",
                                    scale: "scaleLinear",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: window.d3.format(".0f"),
                                    labelMargin: 10
                                },
                                rAxis: {
                                    range: [5, 20]
                                }
                            }
                        },
                    }, {
                        type: "tooltip",
                        config: {
                            title: "BUBBLE",
                            dataConfig: [
                                {
                                    accessor: "x",
                                    labelFormatter: function () {
                                        return "Interfaces";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "y",
                                    labelFormatter: function () {
                                        return "Connected Networks";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "throughput",
                                    labelFormatter: function () {
                                        return "Throughput";
                                    },
                                    valueFormatter: numberFormatFunction
                                }
                            ],
                        },
                    }, {
                        type: "navigation",
                        config: {
                            el: "#" + chartId + "-navigation",
                            marginInner: 10,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 180,
                            yTicks: 4,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        chart: "line",
                                        enabled: true,
                                        label: "Connected Networks",
                                        axis: "y1"
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    scale: "scaleLinear",
                                    label: "Interfaces",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: window.d3.format(".0f"),
                                    labelMargin: 10
                                }
                            }
                        }
                    }, {
                        type: "controlPanel",
                        config: {
                            el: "#" + chartId + "-controlPanel",
                            enabled: true,
                            buttons: [
                                {
                                    name: "zoomIn",
                                    title: "Zoom In",
                                    iconClass: "fa fa-search-plus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomOut",
                                    title: "Zoom Out",
                                    iconClass: "fa fa-search-minus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomReset",
                                    title: "Zoom Reset",
                                    iconClass: "fa fa-times-circle-o",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomSelection",
                                    title: "Zoom by Selection",
                                    iconClass: "fa fa-crop",
                                    events: {
                                        click: ""
                                    }
                                }
                            ]
                        }
                    }, {
                        type: "message",
                        config: {
                            el: "#" + chartId + "-statusMsg",
                            enable: true,
                        }
                    }
                ],
                dataConfig: {
                    dataParser: function(data) {
                        console.count("chart option - data parser");
                        console.log(data);
                        return data;
                    }
                }
            };
        };

        self.getNewCPUMemoryChartOptions = function(chartId) {
            function numberFormatFunction (number) {
                return _.isUndefined(number) ? NaN : number.toFixed(2);
            }

            return {
                containerClassNames: "zoom-scatter-chart-container colmask rightmenu",
                chartId: chartId,
                type: "XYChartView",
                components: [
                    {
                        type: "compositeY",
                        config: {
                            el: "#" + chartId + "-xyChart",
                            yTicks: 4,
                            marginInner: 20,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 250,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        label: "Memory Usage",
                                        enabled: true,
                                        axis: "y1",
                                        chart: "scatterBubble",
                                        sizeAccessor: "throughput",
                                        sizeAxis: "rAxis",
                                        shape: "circle",
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    label: "CPU Utilization (%)",
                                    scale: "scaleLinear",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: window.d3.format(".0f"),
                                    labelMargin: 10
                                },
                                rAxis: {
                                    range: [5, 20]
                                }
                            }
                        },
                    }, {
                        type: "tooltip",
                        config: {
                            title: "BUBBLE",
                            dataConfig: [
                                {
                                    accessor: "x",
                                    labelFormatter: function () {
                                        return "CPU Utilization (%)";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "y",
                                    labelFormatter: function () {
                                        return "Memory Usage";
                                    },
                                    valueFormatter: numberFormatFunction
                                }, {
                                    accessor: "throughput",
                                    labelFormatter: function () {
                                        return "Throughput";
                                    },
                                    valueFormatter: numberFormatFunction
                                }
                            ],
                        },
                    }, {
                        type: "navigation",
                        config: {
                            el: "#" + chartId + "-navigation",
                            marginInner: 10,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 180,
                            yTicks: 4,
                            plot: {
                                x: {
                                    accessor: "x",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "y",
                                        chart: "line",
                                        enabled: true,
                                        label: "Memory Usage",
                                        axis: "y1"
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: window.d3.format(".0f"),
                                    scale: "scaleLinear",
                                    label: "CPU Utilization (%)",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: window.d3.format(".0f"),
                                    labelMargin: 10
                                }
                            }
                        }
                    }, {
                        type: "controlPanel",
                        config: {
                            el: "#" + chartId + "-controlPanel",
                            enabled: true,
                            buttons: [
                                {
                                    name: "zoomIn",
                                    title: "Zoom In",
                                    iconClass: "fa fa-search-plus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomOut",
                                    title: "Zoom Out",
                                    iconClass: "fa fa-search-minus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomReset",
                                    title: "Zoom Reset",
                                    iconClass: "fa fa-times-circle-o",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomSelection",
                                    title: "Zoom by Selection",
                                    iconClass: "fa fa-crop",
                                    events: {
                                        click: ""
                                    }
                                }
                            ]
                        }
                    }, {
                        type: "message",
                        config: {
                            el: "#" + chartId + "-statusMsg",
                            enable: true,
                        }
                    }
                ],
                dataConfig: {
                    dataParser: function(data) {
                        console.count("chart option - data parser");
                        console.log(data);
                        return data;
                    }
                }
            };
        };

        self.getNewThroughputInOutChartOptions = function(chartId) {
            function numberFormatFunction (number) {
                return _.isUndefined(number) ? NaN : number.toFixed(2);
            }

            return {
                containerClassNames: "zoom-scatter-chart-container colmask rightmenu",
                chartId: chartId,
                type: "XYChartView",
                components: [
                    {
                        type: "compositeY",
                        config: {
                            el: "#" + chartId + "-xyChart",
                            yTicks: 4,
                            marginInner: 20,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 250,
                            plot: {
                                x: {
                                    accessor: "in_bw_usage",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "out_bw_usage",
                                        label: "Throughput In",
                                        enabled: true,
                                        axis: "y1",
                                        chart: "scatterBubble",
                                        sizeAccessor: "throughput",
                                        sizeAxis: "rAxis",
                                        shape: "circle",
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: function(value) {
                                        return window.formatThroughput(value, true);
                                    },
                                    label: "Throughput Out",
                                    scale: "scaleLinear",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: function(value) {
                                        return window.formatThroughput(value, true);
                                    },
                                    labelMargin: 10
                                },
                                rAxis: {
                                    range: [5, 20]
                                }
                            }
                        },
                    }, {
                        type: "tooltip",
                        config: {
                            title: "BUBBLE",
                            dataConfig: [
                                {
                                    accessor: "in_bw_usage",
                                    labelFormatter: function () {
                                        return "Throughput Out";
                                    },
                                    valueFormatter: function(value) {
                                        return window.formatThroughput(value, true);
                                    }
                                }, {
                                    accessor: "out_bw_usage",
                                    labelFormatter: function () {
                                        return "Throughput In";
                                    },
                                    valueFormatter: function(value) {
                                        return window.formatThroughput(value, true);
                                    }
                                }, {
                                    accessor: "throughput",
                                    labelFormatter: function () {
                                        return "Throughput";
                                    },
                                    valueFormatter: numberFormatFunction
                                }
                            ],
                        },
                    }, {
                        type: "navigation",
                        config: {
                            el: "#" + chartId + "-navigation",
                            marginInner: 10,
                            marginLeft: 75,
                            marginRight: 75,
                            marginBottom: 50,
                            chartHeight: 180,
                            yTicks: 4,
                            plot: {
                                x: {
                                    accessor: "in_bw_usage",
                                    axis: "x"
                                },
                                y: [
                                    {
                                        accessor: "out_bw_usage",
                                        chart: "line",
                                        enabled: true,
                                        label: "Throughput In",
                                        axis: "y1"
                                    }
                                ]
                            },
                            axis: {
                                x: {
                                    position: "bottom",
                                    formatter: function(value) {
                                        return window.formatThroughput(value, true);
                                    },
                                    scale: "scaleLinear",
                                    label: "Throughput Out",
                                    nice: true,
                                    labelMargin: 15
                                },
                                y1: {
                                    position: "left",
                                    formatter: function(value) {
                                        return window.formatThroughput(value, true);
                                    },
                                    labelMargin: 10
                                }
                            }
                        }
                    }, {
                        type: "controlPanel",
                        config: {
                            el: "#" + chartId + "-controlPanel",
                            enabled: true,
                            buttons: [
                                {
                                    name: "zoomIn",
                                    title: "Zoom In",
                                    iconClass: "fa fa-search-plus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomOut",
                                    title: "Zoom Out",
                                    iconClass: "fa fa-search-minus",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomReset",
                                    title: "Zoom Reset",
                                    iconClass: "fa fa-times-circle-o",
                                    events: {
                                        click: ""
                                    }
                                }, {
                                    name: "zoomSelection",
                                    title: "Zoom by Selection",
                                    iconClass: "fa fa-crop",
                                    events: {
                                        click: ""
                                    }
                                }
                            ]
                        }
                    }, {
                        type: "message",
                        config: {
                            el: "#" + chartId + "-statusMsg",
                            enable: true,
                        }
                    }
                ],
                dataConfig: {
                    dataParser: function(data) {
                        console.count("chart option - data parser");
                        console.log(data);
                        return data;
                    }
                }
            };
        };

        self.getVRouterDetailsPageTabs = function (viewConfig) {
            var tabViewConfig = [
                {
                    elementId: 'vrouter_detail_tab_id',
                    title: 'Details',
                    view: "VRouterDetailPageView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_DETAIL_PAGE_ID)) {
                                $('#' + ctwl.VROUTER_DETAIL_PAGE_ID).trigger('refresh');
                            }
                        }
                    }
                },{
                    elementId: 'vrouter_interfaces_tab_id',
                    title: 'Interfaces',
                    view: "VRouterInterfacesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_INTERFACES_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX +
                                        ' ' + ctwl.VROUTER_INTERFACES_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true,
                                            collapsedOnLoad:true
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_INTERFACES_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_INTERFACES_GRID_ID).data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: 'vrouter_networks_tab_id',
                    title: 'Networks',
                    view: "VRouterNetworksFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_NETWORKS_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX + ' ' + ctwl.VROUTER_NETWORKS_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true,
                                            collapsedOnLoad:true
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_NETWORKS_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_NETWORKS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: 'vrouter_acl_tab_id',
                    title: 'ACL',
                    view: "VRouterACLFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_ACL_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX +
                                        ' ' + ctwl.VROUTER_ACL_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true,
                                            collapsedOnLoad:true
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_ACL_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_ACL_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: 'vrouter_flows_tab_id',
                    title: 'Flows',
                    view: "VRouterFlowsFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_FLOWS_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: 'vrouter_routes_tab_id',
                    title: 'Routes',
                    view: "VRouterRoutesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_ROUTES_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId: ctwl.VROUTER_CONSOLE_LOGS_VIEW_ID,
                    title: 'Console',
                    view: "NodeConsoleLogsView",
                    viewConfig: $.extend(viewConfig,
                            {nodeType:monitorInfraConstants.COMPUTE_NODE}),
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).data('contrailGrid')) {
                                $('#' + cowl.QE_SYSTEM_LOGS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                },{
                    elementId:
                        ctwl.VROUTER_ALARMS_GRID_VIEW_ID,
                    title: 'Alarms',
                    view: "VRouterAlarmGridView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.ALARMS_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                }
            ];
            var vRouterType = viewConfig['vRouterType'];
            if (vRouterType != null && vRouterType.indexOf('hypervisor') > -1 ) {
                var instanceTabViewConfig = {
                    elementId: 'vrouter_virtualmachines',
                    title: 'Instances',
                    view: "VRouterVirtualMachinesGridView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig,
                    tabConfig: {
                        activate: function(event, ui) {
                            if ($('#' + ctwl.VROUTER_INSTANCE_GRID_ID).data('contrailGrid')) {
                                $('#' + ctwl.VROUTER_INSTANCE_GRID_ID).
                                    data('contrailGrid').refreshView();
                            }
                        },
                        renderOnActivate: true
                    }
                };
                tabViewConfig.splice(6,0,instanceTabViewConfig);
            }
            return tabViewConfig;
        };
        self.getDetailRowInstanceTemplateConfig = function () {
            return {
                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'col-xs-6',
                                        rows: [{
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGenerator:
                                                'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: "name",
                                                    label: "FQN",
                                                    templateGenerator: "TextGenerator"
                                                },{
                                                    key: 'vRouter',
                                                    templateGenerator: 'LinkGenerator',
                                                    templateGeneratorConfig: {
                                                        template: ctwc.URL_VROUTER,
                                                        params: {}
                                                    }
                                                },{
                                                    key: 'vn',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: 'ip',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: 'intfCnt',
                                                    templateGenerator: 'TextGenerator'
                                             }]
                                       }]
                                    },
                                    {
                                        class: 'col-xs-6',
                                        rows: [{
                                            title: ctwl.TITLE_CPU_MEMORY_INFO,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                    templateGenerator: 'TextGenerator'
                                                },{
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                },{
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                }
                                             ]
                                        }]
                                    }
                                ]
                            }
                        },
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'col-xs-12',
                                        rows: [{
                                            title: 'Interface Details',
                                            key: 'value.UveVirtualMachineAgent.interface_details',
                                            templateGenerator: 'BlockArrayListTemplateGenerator',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'active',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'status-boolean'
                                                        }
                                                    },
                                                    {
                                                        key: 'ip',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'mac_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'virtual_network',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'floatingIP',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'is_health_check_active',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'status-boolean'
                                                        }
                                                    },
                                                    {
                                                        key: 'health_check_instance_list',
                                                        templateGenerator: 'BlockGridTemplateGenerator',
                                                        templateGeneratorConfig: {
                                                            dataColumn: [
                                                                {
                                                                    key: 'uuid',
                                                                    templateGenerator: 'TextGenerator',
                                                                    templateGeneratorConfig: {
                                                                        width: 100
                                                                    }
                                                                },
                                                                {
                                                                    key: 'name',
                                                                    templateGenerator: 'TextGenerator',
                                                                    templateGeneratorConfig: {
                                                                        width: 90
                                                                    }
                                                                },
                                                                {
                                                                    key: 'status',
                                                                    templateGenerator: 'TextGenerator',
                                                                    templateGeneratorConfig: {
                                                                        width: 45
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }]
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        };
    };

    function getInstanceCPUMemModelConfig(networkFQN, instanceUUID) {
        var where = "(name = " + instanceUUID + ")";
        var table = "StatTable.VirtualMachineStats.cpu_stats";
        var qObj = {table: table, minsSince: "120", where: where};
        var postData = qeUtils.formatQEUIQuery(qObj);

        var modelConfig = {
            remote: {
                ajaxConfig: {
                    url: cowc.URL_QE_QUERY,
                    type: 'POST',
                    data: JSON.stringify(postData)
                },
                dataParser: function (response) {
                    return response['data']
                }
            },
            cacheConfig: {
                ucid: ctwc.get(ctwc.UCID_INSTANCE_CPU_MEMORY_LIST, networkFQN, instanceUUID)
            }
        };

        return modelConfig;
    };

    function onScatterChartClick(chartConfig) {
        var hashParams= {
            fqName:chartConfig['fqName'],
            port:chartConfig['range'],
            type: 'flow',
            view: 'list'
        };

        if(chartConfig['startTime'] != null && chartConfig['endTime'] != null) {
            hashParams['startTime'] = chartConfig['startTime'];
            hashParams['endTime'] = chartConfig['endTime'];
        }

        if(chartConfig['type'] == 'sport') {
            hashParams['portType'] = 'src';
        } else if(chartConfig['type'] == 'dport') {
            hashParams['portType'] = 'dst';
        }

        if(contrail.checkIfExist(chartConfig['ipAddress'])) {
            hashParams['ip'] = chartConfig['ipAddress'];
        }

        layoutHandler.setURLHashParams(hashParams, {p:"mon_networking_networks", merge:false});
    };

    function getControlPanelFilterConfig() {
        return {
            groups: [
                {
                    id: 'by-node-color',
                    title: false,
                    type: 'checkbox-circle',
                    items: [
                        {
                            text: 'Source Port',
                            labelCssClass: 'default',
                            filterFn: function(d) { return d.type === 'sport'; }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'medium',
                            filterFn: function(d) { return d.type === 'dport'; }
                        }
                    ]
                }
            ]
        };
    };

    function getControlPanelLegendConfig() {
        return {
            groups: [
                {
                    id: 'by-node-color',
                    title: 'Port Type',
                    items: [
                        {
                            text: 'Source Port',
                            labelCssClass: 'fa fa-circle default',
                            events: {
                                click: function (event) {}
                            }
                        },
                        {
                            text: 'Destination Port',
                            labelCssClass: 'fa fa-circle medium',
                            events: {
                                click: function (event) {}
                            }
                        }
                    ]
                },
                {
                    id: 'by-node-size',
                    title: 'Port Size',
                    items: [
                        {
                            text: 'Flow Count',
                            labelCssClass: 'fa fa-circle',
                            events: {
                                click: function (event) {}
                            }
                        }
                    ]
                }
            ]
        };
    };

    return CTViewConfig;
});
