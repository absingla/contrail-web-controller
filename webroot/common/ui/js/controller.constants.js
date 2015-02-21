/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTConstants = function () {
        this.URL_PROJECT_CONNECTED_GRAPH = '/api/tenant/monitoring/project-connected-graph?fqName={0}';
        this.URL_PROJECT_CONFIG_GRAPH = '/api/tenant/monitoring/project-config-graph?fqName={0}';
        this.URL_PROJECT_INSTANCES_DETAILS = '/api/tenant/networking/virtual-machines/details?fqnUUID={0}&count=25&type={1}';
        this.URL_PROJECT_NETWORKS = '/api/tenant/networking/virtual-networks/details?count=25&fqn={0}';

        this.URL_NETWORK_CONNECTED_GRAPH = '/api/tenant/monitoring/network-connected-graph?fqName={0}';
        this.URL_NETWORK_CONFIG_GRAPH = '/api/tenant/monitoring/network-config-graph?fqName={0}';
        this.URL_NETWORK_SUMMARY = 'api/tenant/networking/virtual-network/summary?fqNameRegExp={0}'
        this.URL_NETWORKS_DETAILS = '/api/tenant/networking/virtual-networks/details?count=25';

        this.URL_INSTANCE_SUMMARY = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp={0}?flat';
        this.URL_INSTANCES = '/api/tenant/networking/virtual-machines/details?count=25';


        this.URL_VM_VN_STATS = '/api/tenant/networking/stats';
        this.URL_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port';

        this.FILTERS_COLUMN_VN = ['UveVirtualNetworkAgent:interface_list', 'UveVirtualNetworkAgent:in_bandwidth_usage', 'UveVirtualNetworkAgent:out_bandwidth_usage',
            'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes', 'UveVirtualNetworkConfig:connected_networks',
            'UveVirtualNetworkAgent:virtualmachine_list', 'UveVirtualNetworkAgent:acl', 'UveVirtualNetworkAgent:total_acl_rules', 'UveVirtualNetworkAgent:ingress_flow_count', 'UveVirtualNetworkAgent:egress_flow_count',
            'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes', 'UveVirtualNetworkAgent:vrf_stats_list'];

        this.FILTERS_COLUMN_VM = ['UveVirtualMachineAgent:interface_list', 'UveVirtualMachineAgent:vrouter', 'UveVirtualMachineAgent:fip_stats_list',
            'UveVirtualMachineAgent:cpu_info', 'UveVirtualMachineAgent:if_bmap_list'];

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
