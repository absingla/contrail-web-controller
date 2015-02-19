/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {

    var onClickGrid = function (e,selRowDataItem){
        var networkFQN = selRowDataItem['name'];
        layoutHandler.setURLHashParams({fqName:networkFQN, type: "network", view: "details"}, {p:"mon_net_networks-beta", merge:false});
    }

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
                field: 'inBytes',
                name: 'Traffic In/Out (Last 1 Hr)',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes']), formatBytes(dc['outBytes']));
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
                    onClick: onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue'
            },
            //{
            //    field: 'name',
            //    name: 'UUID',
            //    minWidth: 250,
            //    searchable: true
            //},
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
                field: 'inBytes',
                name: 'Traffic In/Out (Last 1 Hr)',
                formatter: function (r, c, v, cd, dc) {
                    return formatBytes(dc['inBytes']) + ' / ' + formatBytes(dc['outBytes']);
                },
                minWidth: 200
            }
        ];
    };

    return CTGridConfig;
});