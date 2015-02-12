/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTConstants = function () {
        this.URL_PROJECT_GRAPH = '/api/tenant/monitoring/project-topology?fqName={0}';
        this.URL_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port';
        this.URL_PROJECT_NETWORKS = '/api/tenant/networking/virtual-networks/details?count=50&fqn={0}';
        this.URL_PROJECT_INSTANCES = '/api/tenant/networking/virtual-machines/details?fqnUUID={0}&count=50&type=project';
        this.URL_VM_VN_STATS = '/api/tenant/networking/stats';

        this.FILTERS_COLUMN_VN = ['UveVirtualNetworkAgent:interface_list', 'UveVirtualNetworkAgent:in_bandwidth_usage', 'UveVirtualNetworkAgent:out_bandwidth_usage',
            'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes', 'UveVirtualNetworkConfig:connected_networks',
            'UveVirtualNetworkAgent:virtualmachine_list'];
        this.FILTERS_COLUMN_VM = ['UveVirtualMachineAgent:interface_list', 'UveVirtualMachineAgent:vrouter', 'UveVirtualMachineAgent:fip_stats_list'];

        this.TYPE_VIRTUAL_NETWORK = "virtual-network";
        this.TYPE_VIRTUAL_MACHINE = "virtual-machine";

        this.get = function () {
            var args = arguments;
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };
    };
    return CTConstants;
});
