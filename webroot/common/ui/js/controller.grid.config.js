/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTGridConfig = function () {
        this.projectNetworksColumns = [
            {
                field: 'name',
                name: 'Network',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'name', name: 'network', rowData: dc});
                },
                events: {
                    onClick: onClickGridLink
                },
                minWidth: 400,
                searchFn: function (d) {
                    return d['name'];
                },
                searchable: true,
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'instCnt',
                name: 'Instances',
                minWidth: 100
            },
            {
                field: 'inBytes',
                name: 'Traffic (In/Out in last 1 hr)',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes']), formatBytes(dc['outBytes']));
                }
            },
            {
                field: 'outBytes',
                name: 'Throughput (In/Out)',
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
            {
                field: 'name',
                name: 'UUID',
                minWidth: 250,
                searchable: true
            },
            {
                field: 'vn',
                name: 'Virtual Network',
                formatter: function (r, c, v, cd, dc) {
                    return getMultiValueStr(dc['vn']);
                },
                minWidth: 220,
                searchable: true
            },
            {
                field: 'intfCnt',
                name: 'Interfaces',
                minWidth: 60
            },
            {
                field: 'vRouter',
                name: 'vRouter',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'vRouter', tooltip: true, name: 'vRouter', rowData: dc});
                },
                minWidth: 80,
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
                minWidth: 130
            },
            {
                field: 'floatingIP',
                name: 'Floating IPs (In/Out)',
                formatter: function (r, c, v, cd, dc) {
                    return getMultiValueStr(dc['floatingIP']);
                },
                minWidth: 100
            },
            {
                field: 'inBytes',
                name: 'Traffic (In/Out) <br/> (Last 1 hr)',
                formatter: function (r, c, v, cd, dc) {
                    return formatBytes(dc['inBytes']) + ' / ' + formatBytes(dc['outBytes']);
                },
                minWidth: 150
            }
        ];
    };

    return CTGridConfig;
});