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
    var InstanceListView = ContrailView.extend({
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
                        parentType = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_VN,
                        parentHashtype = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_NETWORK,
                        extendedHashOb = {};

                    contrailListModel = new ContrailListModel(getInstanceListModelConfig(parentUUID, parentType, parentFQN, serverCurrentTime));

                    self.renderView4Config(self.$el, contrailListModel, getInstanceListViewConfig(parentUUID, parentType, parentFQN));
                    extendedHashOb[parentHashtype] = parentFQN;
                    ctwu.setNetwork4InstanceListURLHashParams(extendedHashOb);

                } else {
                    contrailListModel = new ContrailListModel(getInstanceListModelConfig(null, null, null, serverCurrentTime));

                    self.renderView4Config(self.$el, contrailListModel, getInstanceListViewConfig(null, null, null));
                    ctwu.setNetwork4InstanceListURLHashParams({});
                }
            });
        }
    });

    function getInstanceListModelConfig(parentUUID, parentType, parentFQN, serverCurrentTime) {
        var ajaxConfig = {
            url: ctwc.get(ctwc.URL_GET_INSTANCES, 'analytics', parentType, 100, 500, $.now()),
            type: 'POST',
            data: JSON.stringify({
                id: qewu.generateQueryUUID(),
                FQN: parentFQN,
                originResponseChunk: parentUUID ? null : true,
                originConcurrentLimit: parentUUID ? null : 10,
                data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
            })
        };

        return {
            remote: {
                //Get the list of instances via Analytics API
                ajaxConfig: ajaxConfig,
                dataParser: ctwp.instanceDataParser,
                //Get the list of instances via Config API
                hlRemoteConfig: {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.get(ctwc.URL_GET_INSTANCES_LIST, 'config', parentType, 100, 500, $.now()),
                            type: 'POST',
                            data: JSON.stringify({
                                reqId: qewu.generateQueryUUID(),
                                FQN: parentFQN,
                                fqnUUID: parentUUID,
                                data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                            })
                        },
                        dataParser: function(vmList) {
                            var retArr = [];
                            if (vmList.length > 0) {
                                _.each(vmList, function(vmUUID) {
                                    retArr.push({
                                        name: vmUUID,
                                        vmName: "",
                                        value: {
                                            UveVirtualMachineAgent: {}
                                        }
                                    });
                                });
                            }
                            return retArr;
                        },
                        completeCallback: function(response, contrailListModel, parentListModelArray) {
                            // var response = contrailListModel.getItems(),
                            //     parentListModel = parentListModelArray[0];
                            //
                            // if (response.length > 0) {
                            //     //parentListModel.error = true;
                            //     _.each(response, function(item) {
                            //         //parentListModel.errorList.push({});
                            //         delete item.cgrid;
                            //     });
                            //     parentListModel.addData(response);
                            // }
                        }
                    },
                    vlRemoteConfig: {
                        vlRemoteList: [
                            {
                                getAjaxConfig: function (responseJSON) {
                                    var uuids, lazyAjaxConfig;

                                    uuids = $.map(responseJSON, function (item) {
                                        return item['name'];
                                    });
                                    
                                    var queryAttrs = ctqeu.getQueryPostData(cowc.QE_STAT_TABLE_TYPE, ctwc.TYPE_VIRTUAL_MACHINE, 60, serverCurrentTime);

                                    if (uuids.length > 100) {
                                        queryAttrs['where_json'] = [[{"name": "vm_uuid", "value": "", "op": 7}]];
                                    } else if(uuids.length > 0) {
                                        var whereClauseArr = [];
                                        _.each(uuids, function(uuid) {
                                            whereClauseArr.push([{
                                                name : "vm_uuid",
                                                value: uuid,
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
                                    var statDataList = ctwp.parseInstanceStats({value: response.data}, ctwc.TYPE_VIRTUAL_MACHINE),
                                        dataItems = contrailListModel.getItems(),
                                        updatedDataItems = [],
                                        statData;

                                    for (var j = 0; j < statDataList.length; j++) {
                                        statData = statDataList[j];
                                        for (var i = 0; i < dataItems.length; i++) {
                                            var dataItem = dataItems[i];
                                            if (statData['name'] == dataItem['name']) {
                                                dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                                                dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                                                updatedDataItems.push(dataItem);
                                                break;
                                            }
                                        }
                                    }
                                    contrailListModel.updateData(updatedDataItems);
                                }
                            },
                        ],
                        completeCallback: function (contrailListModel, parentModelList) {
                            var configItems = contrailListModel.getItems(),
                                opApiItems = parentModelList[0].getItems(),
                                updatedDataItems = [],
                                addDataItems = [];
                            for (var j = 0; j < configItems.length; j++) {
                                var found = false;
                                for (var i = 0; i < opApiItems.length; i++) {
                                    if (configItems[j]['name'] == opApiItems[i]['name']) {
                                        opApiItems[i]['inBytes60'] = ifNull(configItems[j]['inBytes60'], 0);
                                        opApiItems[i]['outBytes60'] = ifNull(configItems[j]['outBytes60'], 0);
                                        updatedDataItems.push(opApiItems[i]);
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    //Case: VM UUID preset in Config API not in Opserver API.
                                    delete configItems[j]['cgrid'];
                                    addDataItems.push(configItems[j]);
                                }
                            }
                            parentModelList[0].updateData(updatedDataItems);
                            if (addDataItems.length > 0) {
                                parentModelList[0].addData(addDataItems);
                            }
                        }
                    }
                }
            },
            vlRemoteConfig: {
                vlRemoteList: ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE)
            },
            cacheConfig : {
                ucid: (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" + 'virtual-machines') : ctwc.UCID_ALL_VM_LIST
            }
        };
    }

    function getInstanceListViewConfig(parentUUID, parentType, parentFQN) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCES_CPU_MEM_CHART_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'CPU Utilization (%)',
                                        yLabel: 'Memory Usage',
                                        forceX: [0, 1],
                                        forceY: [0, 1000],
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        yLabelFormat: function(yValue) {
                                            var formattedValue = formatBytes(yValue * 1024, true);
                                            return formattedValue;
                                        },
                                        xLabelFormat: d3.format(".01f"),
                                        tooltipConfigCB: getInstanceTooltipConfig,
                                        clickCB: onScatterChartClick,
                                        sizeFieldName: 'throughput',
                                        margin: {left: 60},
                                        noDataMessage: "No virtual machine available."
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCES_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "InstanceGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    parentUUID: parentUUID,
                                    parentType: parentType,
                                    parentFQN: parentFQN,
                                    pagerOptions: { options: { pageSize: 8, pageSizeSelect: [8, 25, 50, 100] } }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function onScatterChartClick (chartConfig) {
        var instanceUUID = chartConfig['name'],
            networkFQN = chartConfig['vnFQN'],
            vmName = chartConfig['vmName'];

        if (contrail.checkIfExist(networkFQN) && !ctwu.isServiceVN(networkFQN)) {
            ctwu.setInstanceURLHashParams(null, networkFQN, instanceUUID, vmName, true);
        }
    };

    function getInstanceTooltipConfig(data) {
        var vmUUID = data.name,
            vnFQN = data.vnFQN,
            tooltipConfig = {
                title: {
                    name: vmUUID,
                    type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE
                },
                content: {
                    iconClass: 'icon-contrail-virtual-machine font-size-30',
                    info: [
                        {label: 'Name', value: data.vmName},
                        {label: 'UUID', value: vmUUID},
                        //{label: 'Network', value: data.vnFQN},
                        {label:'CPU Utilization', value: d3.format('.02f')(data['x']) + " %"},
                        {label:'Memory Usage', value: formatBytes(data['y'] * 1024, false, null, 1)},
                        {label:'Throughput', value:formatThroughput(data['throughput'])}
                    ]
                },
                dimension: {
                    width: 400
                }
            };
        if (contrail.checkIfExist(vnFQN) && !ctwu.isServiceVN(vnFQN)) {
            tooltipConfig['content']['actions'] = [
                {
                    type: 'link',
                    text: 'View',
                    iconClass: 'fa fa-external-link',
                    callback: onScatterChartClick
                }
            ];
        }

        return tooltipConfig;
    };

    return InstanceListView;
});