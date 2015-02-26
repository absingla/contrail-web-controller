/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig,
                parentUUID = viewConfig['parentUUID'],
                parentType = viewConfig['parentType'];

            var instanceRemoteConfig = {
                url: parentUUID != null ? ctwc.get(ctwc.URL_PROJECT_INSTANCES_DETAILS, parentUUID, parentType) : ctwc.URL_INSTANCES,
                type: 'POST',
                data: JSON.stringify({
                    data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                })
            };

            // TODO: Handle multi-tenancy
            var ucid = (parentUUID != null) ? (parentUUID + ":" + 'virtual-machines') : "default-domain:virtual-machines";

            cowu.renderView4Config(that.$el, null, getInstanceListViewConfig(instanceRemoteConfig, ucid));
        }
    });

    var getInstanceListViewConfig = function (instanceRemoteConfig, ucid) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCE_GRID_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectInstancesConfig(instanceRemoteConfig, ucid)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig, ucid) {
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
                    checkboxSelectable: false,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: instanceRemoteConfig,
                        dataParser: instanceDataParser
                    },
                    lazyRemote: getLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE),
                    cacheConfig : {
                        getDataFromCache: function (ucid) {
                            return mnPageLoader.mnView.listCache[ucid];
                        },
                        setData2Cache: function (ucid, dataObject) {
                            mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                        },
                        ucid: ucid
                    }
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
                successCallback: function (response, contrailListModel) {
                    var statDataList = tenantNetworkMonitorUtils.statsOracleParseFn(response[0], type),
                        dataItems = contrailListModel.getItems(),
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
                    contrailListModel.updateData(dataItems);
                }
            }
        ];
    }

    var getDetailsTemplateConfig = function() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'vRouter',
                                                    templateGenerator: 'TextGenerator'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_CPU_INFO,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span12',
                                    rows: [
                                        {
                                            templateGenerator: 'BlockGridTemplateGenerator',
                                            title: ctwl.TITLE_INTERFACES,
                                            key: 'value.UveVirtualMachineAgent.interface_list',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'uuid',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'mac_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'ip_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'ip6_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'label',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'Gateway',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'active',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'l2_active',
                                                        templateGenerator: 'TextGenerator'
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    var instanceDataParser = function(response) {
        var retArr = $.map(ifNull(response['data']['value'],response), function (currObject, idx) {
            var currObj = currObject['value'];
            var intfStats = getValueByJsonPath(currObj,'VirtualMachineStats;if_stats;0;StatTable.VirtualMachineStats.if_stats',[]);
            currObject['rawData'] = $.extend(true,{},currObj);
            currObject['inBytes'] = '-';
            currObject['outBytes'] = '-';
            // If we append * wildcard stats info are not there in response,so we changed it to flat
            currObject['url'] = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp=' + currObject['name'] + '?flat';
            currObject['vmName'] = ifNull(jsonPath(currObj, '$..vm_name')[0], '-');
            var vRouter = getValueByJsonPath(currObj,'UveVirtualMachineAgent;vrouter');
            currObject['vRouter'] = ifNull(tenantNetworkMonitorUtils.getDataBasedOnSource(vRouter), '-');
            currObject['intfCnt'] = ifNull(jsonPath(currObj, '$..interface_list')[0], []).length;
            currObject['vn'] = ifNull(jsonPath(currObj, '$..interface_list[*].virtual_network'),[]);
            //Parse the VN only if it exists
            if(currObject['vn'] != false) {
                if(currObject['vn'].length != 0) {
                    currObject['vnFQN'] = currObject['vn'][0];
                }
                currObject['vn'] = tenantNetworkMonitorUtils.formatVN(currObject['vn']);
            }
            currObject['ip'] = [];
            var intfList = tenantNetworkMonitorUtils.getDataBasedOnSource(getValueByJsonPath(currObj,'UveVirtualMachineAgent;interface_list',[]));
            for(var i = 0; i < intfList.length; i++ ) {
                if(intfList[i]['ip6_active'] == true) {
                    if(intfList[i]['ip_address'] != '0.0.0.0')
                        currObject['ip'].push(intfList[i]['ip_address']);
                    if(intfList[i]['ip6_address'] != null)
                        currObject['ip'].push(intfList[i]['ip6_address']);
                } else {
                    if(intfList[i]['ip_address'] != '0.0.0.0')
                        currObject['ip'].push(intfList[i]['ip_address']);
                }
            }
            var fipStatsList = getValueByJsonPath(currObj,'UveVirtualMachineAgent:fip_stats_list');
            var floatingIPs = ifNull(tenantNetworkMonitorUtils.getDataBasedOnSource(fipStatsList), []);
            currObject['floatingIP'] = [];
            if(getValueByJsonPath(currObj,'VirtualMachineStats;if_stats') != null) {
                currObject['inBytes'] = 0;
                currObject['outBytes'] = 0;
            }
            $.each(floatingIPs, function(idx, fipObj){
                currObject['floatingIP'].push(contrail.format('{0}<br/> ({1}/{2})', fipObj['ip_address'],formatBytes(ifNull(fipObj['in_bytes'],'-')),
                    formatBytes(ifNull(fipObj['out_bytes'],'-'))));
            });
            $.each(intfStats, function (idx, value) {
                currObject['inBytes'] += ifNull(value['SUM(if_stats.in_bytes)'],0);
            });
            $.each(intfStats, function (idx, value) {
                currObject['outBytes'] += ifNull(value['SUM(if_stats.out_bytes)'],0);
            });
            return currObject;
        });
        return retArr;
    }

    return InstanceListView;
})
;
