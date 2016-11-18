/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, ContrailView, ContrailListModel, qewu) {
    var InterfaceListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                networkSelectedValueData = viewConfig.networkSelectedValueData,
                domainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectSelectedValueData = $('#' + ctwl.PROJECTS_BREADCRUMB_DROPDOWN).data('contrailDropdown').getSelectedData()[0],
                projectUUID = (projectSelectedValueData.value === 'all') ? null : projectSelectedValueData.value,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : domainFQN + ':' + projectSelectedValueData.name,
                parentFQN = null,
                contrailListModel;

            if(projectUUID != null) {
                var networkUUID = (networkSelectedValueData.value === 'all') ? null : networkSelectedValueData.value,
                    networkFQN = (networkSelectedValueData.value === 'all') ? null : projectFQN + ':' + networkSelectedValueData.name,
                    parentUUID = (networkUUID == null) ? projectUUID : networkUUID,
                    parentFQN = (networkUUID == null) ? projectFQN : networkFQN,

                    parentHashtype = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_NETWORK,
                    extendedHashOb = {};

                contrailListModel = new ContrailListModel(getInterfaceListModelConfig(parentUUID,
                                                                                      parentFQN));

                self.renderView4Config(self.$el, contrailListModel, getInterfaceListViewConfig(networkFQN));
                extendedHashOb[parentHashtype] = parentFQN;
                //ctwu.setNetwork4InstanceListURLHashParams(extendedHashOb);

            } else {
                contrailListModel = new ContrailListModel(getInterfaceListModelConfig(null,
                                                                                      parentFQN));

                self.renderView4Config(self.$el, contrailListModel, getInterfaceListViewConfig());
                //ctwu.setNetwork4InstanceListURLHashParams({});
            }
        }
    });

    function getInterfaceListModelConfig (parentUUID, parentFQN) {
        var ajaxConfig = {
            url : ctwc.get(ctwc.URL_GET_NETWORK_INTERFACES, 100, 1000, $.now()),
            type: 'POST',
            data: JSON.stringify({
                id: qewu.generateQueryUUID(),
                FQN: parentFQN
            })
        };

        return {
            remote: {
                ajaxConfig: ajaxConfig,
                dataParser: ctwp.interfaceDataParser,
                hpCompleteCallback: function(response, contrailListModel) {
                    var configUUIDCnt = 0;
                    var dataItems = contrailListModel.getItems();
                    try {
                        var configUUIDList = contrailListModel.getHLData().response[0].configVMIList;
                        configUUIDCnt = configUUIDList.length;
                    } catch(e) {
                        configUUIDCnt = 0;
                    }
                    var tmpUUIDObjs = {};
                    var opDataCnt = dataItems.length;
                    var missingUUIDList = [];
                    for (i = 0; i < opDataCnt; i++) {
                        var uuid = getValueByJsonPath(dataItems[i], "uuid", null);
                        tmpUUIDObjs[uuid] = dataItems[i];
                    }
                    for (var i = 0; i < configUUIDCnt; i++) {
                        uuid = configUUIDList[i].uuid;
                        if (null == tmpUUIDObjs[uuid]) {
                            missingUUIDList.push({uuid : uuid});
                        }
                    }
                    contrailListModel.addData(missingUUIDList);
                },
                hlRemoteConfig: {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.get(ctwc.URL_GET_INTERFACES_LIST, $.now()),
                            type: 'POST',
                            data: JSON.stringify({
                                reqId: qewu.generateQueryUUID(),
                                FQN: parentFQN,
                                fqnUUID: parentUUID
                            })
                        },
                        dataParser: function(vmiList) {
                            var retArr = [];
                            var opVMIList = vmiList.opVMIList;
                            if ((null == opVMIList) || (!opVMIList.length)) {
                                return retArr;
                            }
                            _.each(opVMIList, function(vmiUUID) {
                                retArr.push({
                                    name: vmiUUID,
                                    vmiName: "",
                                    value: {
                                    }
                                });
                            });
                            return retArr;
                        },
                    },
                    vlRemoteConfig: {
                        vlRemoteList: nmwgc.getInterfaceStatsLazyRemoteConfig()
                    }
                },
                cacheConfig : {
                    ucid: (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" + 'virtual-interfaces') : ctwc.UCID_ALL_INTERFACES_LIST
                }
            }
        }
    }

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
