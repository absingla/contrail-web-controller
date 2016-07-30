/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-basedir/js/common/qe.utils',
    'controller-basedir/common/ui/js/controller.qe.utils'
], function (_, ContrailView, ContrailListModel, qewu, ctqeu) {
    var InterfaceListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                networkSelectedValueData = viewConfig.networkSelectedValueData,
                domainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectSelectedValueData = $('#' + ctwl.PROJECTS_BREADCRUMB_DROPDOWN).data('contrailDropdown').getSelectedData()[0],
                projectUUID = (projectSelectedValueData.value === 'all') ? null : projectSelectedValueData.value,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : domainFQN + ':' + projectSelectedValueData.name,
                contrailListModel;

            qewu.fetchServerCurrentTime(function(serverCurrentTime) {
                if(projectUUID != null) {
                    var networkUUID = (networkSelectedValueData.value === 'all') ? null : networkSelectedValueData.value,
                        networkFQN = (networkSelectedValueData.value === 'all') ? null : projectFQN + ':' + networkSelectedValueData.name,
                        parentUUID = (networkUUID == null) ? projectUUID : networkUUID,
                        parentFQN = (networkUUID == null) ? projectFQN : networkFQN,

                        parentType = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_VIRTUAL_NETWORK,
                        parentHashtype = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_NETWORK,
                        extendedHashOb = {};

                    contrailListModel = new ContrailListModel(getInterfaceListModelConfig(parentUUID, null, projectFQN, networkFQN, parentType), serverCurrentTime);

                    self.renderView4Config(self.$el, contrailListModel, getInterfaceListViewConfig(networkFQN));
                    extendedHashOb[parentHashtype] = parentFQN;
                    //ctwu.setNetwork4InstanceListURLHashParams(extendedHashOb);

                } else {
                    parentType = ctwc.TYPE_DOMAIN;
                    contrailListModel = new ContrailListModel(getInterfaceListModelConfig(null, domainFQN, null, null, parentType, serverCurrentTime));

                    self.renderView4Config(self.$el, contrailListModel, getInterfaceListViewConfig());
                    //ctwu.setNetwork4InstanceListURLHashParams({});
                }
            });
            
        }
    });

    function getInterfaceListModelConfig (parentUUID, domainFQN, projectFQN, networkFQN, parentType, serverCurrentTime) {
        var ajaxPostFilter = {};

        if (parentType === ctwc.TYPE_DOMAIN) {
            ajaxPostFilter.domainFQN = domainFQN;
            ajaxPostFilter.parentType = parentType;
        } else if (parentType === ctwc.TYPE_PROJECT) {
            ajaxPostFilter.projectFQN = projectFQN;
            ajaxPostFilter.parentType = parentType;
        } else if (parentType === ctwc.TYPE_VIRTUAL_NETWORK) {
            ajaxPostFilter.networkFQN = networkFQN;
            ajaxPostFilter.parentType = parentType;
        }
        var ajaxConfig = {
            url : ctwc.URL_VM_INTERFACES,
            type: 'POST',
            data: JSON.stringify(ajaxPostFilter)
        };

        return {
            remote: {
                ajaxConfig: ajaxConfig,
                dataParser: ctwp.interfaceDataParser
            },
            vlRemoteConfig: {
                vlRemoteList: [
                    {
                        getAjaxConfig: function (responseJSON) {
                            var ifNames, lazyAjaxConfig;

                            ifNames = $.map(responseJSON, function (item) {
                                return item['name'];
                            });

                            var queryAttrs = ctqeu.getQueryPostData(cowc.QE_STAT_TABLE_TYPE, ctwc.TYPE_VIRTUAL_MACHINE_INTERFACE, 60, serverCurrentTime);

                            if (ifNames.length > 100) {
                                queryAttrs['where_json'] = [[{"name": "name", "value": "", "op": 7}]];
                            } else if(ifNames.length > 0) {
                                var whereClauseArr = [];
                                _.each(ifNames, function(ifName) {
                                    whereClauseArr.push([{
                                        name : "name",
                                        value: ifName,
                                        op: "1"
                                    }]);
                                });
                                queryAttrs['where_json'] = whereClauseArr;
                            } else {
                                return;
                            }

                            lazyAjaxConfig = {
                                url: cowc.URL_QE_QUERY,
                                type: 'POST',
                                data: JSON.stringify({
                                    queryAttrs: queryAttrs,
                                    async: false,
                                    queryId: qewu.generateQueryUUID()
                                })
                            }
                            return lazyAjaxConfig;
                        },
                        successCallback: function (response, contrailListModel) {
                            var statDataList = ctwp.parseInstanceInterfaceStats({value: response.data}),
                                dataItems = contrailListModel.getItems(),
                                statData;

                            for (var j = 0; j < statDataList.length; j++) {
                                statData = statDataList[j];
                                for (var i = 0; i < dataItems.length; i++) {
                                    var dataItem = dataItems[i];
                                    if (statData['name'] == dataItem['name']) {
                                        dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                                        dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                                        break;
                                    }
                                }
                            }
                            contrailListModel.updateData(dataItems);
                        }
                    }
                ] 
                
            },
            cacheConfig : {
                ucid: (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" + 'virtual-interfaces') : ctwc.UCID_ALL_INTERFACES_LIST
            }
        };
    };

    function getInterfaceListViewConfig(networkFQN) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INTERFACE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INTERFACES_TRAFFIC_THROUGHPUT_CHART_ID,
                                title: ctwl.TITLE_INTERFACES,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'Throughput Out',
                                        yLabel: 'Throughput In',
                                        forceX: [0, 1],
                                        forceY: [0, 1000],
                                        xField: 'throughput',
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        yLabelFormat: function(yValue) {
                                            var formattedValue = formatThroughput(yValue, true);
                                            return formattedValue;
                                        },
                                        xLabelFormat: function(xValue) {
                                            var formattedValue = formatThroughput(xValue, true);
                                            return formattedValue;
                                        },
                                        clickCB: function(){},
                                        tooltipConfigCB: getInterfaceTooltipConfig,
                                        margin: {left: 60},
                                        noDataMessage: ctwl.TITLE_NO_INTERFACES_AVAIL
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INTERFACES_ID,
                                title: ctwl.TITLE_INTERFACES,
                                view: "InterfaceGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    parentType: ctwc.TYPE_VIRTUAL_NETWORK,
                                    networkFQN: networkFQN,
                                    elementId: ctwl.INTERFACE_GRID_ID
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getInterfaceTooltipConfig (data) {
        var tooltipConfig = {
            title: {
                name: data.ip,
                type: ctwl.TITLE_GRAPH_ELEMENT_INTERFACE
            },
            content: {
                iconClass: 'icon-contrail-virtual-machine-interface-top',
                info: [
                    {label: 'UUID', value: data.uuid},
                    {label: 'MAC Address', value: data.mac_address},
                    {label: 'Instance Name', value: data.vm_name},
                    {label: 'Virtual Network', value: data.virtual_network},
                    {label: 'Total Throughput', value: formatThroughput(data['throughput'])},
                    {label: 'Total Traffic', value: formatBytes(data.inBytes60 + data.outBytes60, false, null, 1)}
                ]
            },
            dimension: {
                width: 400
            }
        };
        return tooltipConfig;
    };

    return InterfaceListView;
});