/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {

    var onClickGrid = function (e, selRowDataItem) {
        var name = $(e.target).attr('name'),
            fqName, uuid, vn;

        if ($.inArray(name, ['network']) > -1) {
            fqName = selRowDataItem['name'];
            uuid = selRowDataItem['uuid'];
            layoutHandler.setURLHashParams({ fqName: fqName, uuid: uuid, type: "network", view: "details" }, {p: "mon_networking_networks", merge: false});
        } else if ($.inArray(name, ['instance']) > -1) {
            vn = selRowDataItem['vnFQN'];
            uuid = selRowDataItem['name'];
            layoutHandler.setURLHashParams({ uuid: uuid, vn: vn, type: "instance", view: "details" }, {p: "mon_networking_instances", merge: false});
        }
    };

    var CTGridConfig = function () {
        this.projectNetworksColumns = [
            {
                field: 'name',
                name: 'Network',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'name', name: 'network', rowData: dc});
                },
                events: {
                    onClick: onClickGrid
                },
                minWidth: 200,
                searchFn: function (d) {
                    return d['name'];
                },
                searchable: true,
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'instCnt',
                name: 'Instances',
                minWidth: 200
            },
            {
                field: '',
                name: 'Traffic In/Out (Last 1 Hr)',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes60']), formatBytes(dc['outBytes60']));
                }
            },
            {
                field: 'outBytes',
                name: 'Throughput In/Out',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatThroughput(dc['inThroughput']), formatThroughput(dc['outThroughput']));
                }
            }
        ];

        this.projectInstancesColumns = [
            {
                field: 'vmName',
                name: 'Instance',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'vmName', tooltip: true, name: 'instance', rowData: dc});
                },
                minWidth: 150,
                searchable: true,
                events: {
                    onClick: onClickGrid
                },
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'vn',
                name: 'Virtual Network',
                formatter: function (r, c, v, cd, dc) {
                    return getMultiValueStr(dc['vn']);
                },
                minWidth: 200,
                searchable: true
            },
            {
                field: 'intfCnt',
                name: 'Interfaces',
                minWidth: 100
            },
            {
                field: 'vRouter',
                name: 'Virtual Router',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'vRouter', tooltip: true, name: 'vRouter', rowData: dc});
                },
                minWidth: 100,
                events: {
                    onClick: onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'ip',
                name: 'IP Address',
                formatter: function (r, c, v, cd, dc) {
                    return formatIPArr(dc['ip']);
                },
                minWidth: 100
            },
            {
                field: 'floatingIP',
                name: 'Floating IPs In/Out',
                formatter: function (r, c, v, cd, dc) {
                    return getMultiValueStr(dc['floatingIP']);
                },
                minWidth: 200
            },
            {
                field: '',
                name: 'Traffic In/Out (Last 1 Hr)',
                formatter: function (r, c, v, cd, dc) {
                    return formatBytes(dc['inBytes60']) + ' / ' + formatBytes(dc['outBytes60']);
                },
                minWidth: 200
            }
        ];

        this.projectsColumns = [
            {
                field: 'name',
                name: 'Project',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'name', tooltip: true, name: 'project', rowData: dc});
                },
                minWidth: 200,
                searchable: true,
                events: {
                    onClick: onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'vnCnt',
                name: 'Networks',
                minWidth: 200
            },
            {
                field: '',
                name: 'Traffic In/Out (Last 1 hr)',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes60']), formatBytes(dc['outBytes60']));
                }
            },
            {
                field: '',
                name: 'Throughput In/Out',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatThroughput(dc['inThroughput']), formatThroughput(dc['outThroughput']));
                }
            }
        ];

        this.getVNDetailsLazyRemoteConfig = function(type) {
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
                        var statDataList = ctwp.statsOracleParseFn(response[0], type),
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
            ];
        };

        this.getVMDetailsLazyRemoteConfig = function (type) {
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
                                    dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                                    dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                                    break;
                                }
                            }
                        }
                        contrailListModel.updateData(dataItems);
                    }
                }
            ];
        }

        this.getProjectDetailsHLazyRemoteConfig = function () {
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_NETWORKS_DETAILS_IN_CHUNKS,
                        type: 'POST',
                        data: JSON.stringify({
                            data: [{
                                "type": ctwc.TYPE_VIRTUAL_NETWORK,
                                "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                            }]
                        })
                    },
                    dataParser: ctwp.networkDataParser
                },
                vlRemoteConfig: {
                    completeCallback: function(contrailListModel, parentListModel) {
                        ctwp.projectNetworksDataParser(parentListModel, contrailListModel);
                    }
                },
                lazyRemote: ctwgc.getVNDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK),
                cacheConfig: {
                    getDataFromCache: function (ucid) {
                        return mnPageLoader.mnView.listCache[ucid];
                    },
                    setData2Cache: function (ucid, dataObject) {
                        mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                    },
                    ucid: ctwc.UCID_ALL_VN
                }
            };
        };

        this.projectFlowsColumns = [
            {
                field: 'destvn',
                name: 'Destination VN',
                minWidth: 215,
                searchFn: function (d) {
                    return d['destvn'];
                },
                searchable: true
            },
            {
                field: 'sourceip',
                name: 'Source IP',
                minWidth: 100,
                searchFn: function (d) {
                    return d['sourceip'];
                },
                searchable: true
            },
            {
                field: 'destip',
                name: 'Destination IP',
                minWidth: 100,
                searchFn: function (d) {
                    return d['destip'];
                },
                searchable: true
            },
            {
                field: 'protocol',
                name: 'Protocol',
                formatter:function(r,c,v,cd,dc){
                    return getProtocolName(dc['protocol']);
                },
                minWidth: 60,
                searchFn: function (d) {
                    return d['protocol'];
                },
                searchable: true
            },
            {
                field: 'sport',
                name: 'Source Port',
                minWidth: 80,
                searchFn: function (d) {
                    return d['sport'];
                },
                searchable: true
            },
            {
                field: 'dport',
                name: 'Destination Port',
                minWidth: 110,
                searchFn: function (d) {
                    return d['dport'];
                },
                searchable: true
            },
            {
                field: 'sum_bytes',
                name: 'Sum(Bytes)',
                minWidth: 80,
                searchFn: function (d) {
                    return d['sum_bytes'];
                },
                searchable: true
            },
            {
                field: 'sum_packets',
                name: 'Sum(Packets)',
                minWidth: 90,
                searchFn: function (d) {
                    return d['sum_packets'];
                },
                searchable: true
            },
            {
                field: 'flow_count',
                name: 'Flow Count',
                minWidth: 90,
                searchFn: function (d) {
                    return d['flowcnt'];
                },
                searchable: true
            }
        ];
    };

    return CTGridConfig;
});