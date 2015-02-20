/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTLabels = function () {
        this.get = function (key) {
            var keyArray, newKey;
            if (_.has(labelMap, key)) {
                return labelMap[key];
            } else {
                keyArray = key.split('.');
                newKey = keyArray[keyArray.length - 1];
                if (keyArray.length > 1 && _.has(labelMap, newKey)) {
                    return labelMap[newKey];
                } else {
                    return newKey.charAt(0).toUpperCase() + newKey.slice(1);
                }
            }
        };

        this.getInLowerCase = function (key) {
            var label = this.get(key);
            return label.toLowerCase();
        };

        this.getInUpperCase = function (key) {
            var label = this.get(key);
            return label.toUpperCase();
        };

        this.getFirstCharUpperCase = function (key) {
            var label = this.get(key);

            label = label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            return label;
        };

        var labelMap = {

            /* Network Details */
            name: 'Name',
            connected_networks: 'Connected Networks',
            ingress_flow_count: 'Ingress Flow Count',
            egress_flow_count: 'Egress Flow Count',
            acl: 'ACL',
            total_acl_rules: 'Total ACL Rules',
            interface_list: 'Interfaces',
            in_bytes: 'Traffic In',
            out_bytes: 'Traffic Out',
            virtualmachine_list: 'Instances',

            /* Instance Details */
            cpu_one_min_avg: 'CPU',
            rss: 'Memory Used',
            vm_memory_quota: 'Memory Total',
            vRouter: 'Virtual Router',

            /*Interface Details */
            uuid: 'UUID',
            mac_address: 'MAC Address',
            ip_address: 'IPV4 Address',
            ip6_address: 'IPV6 Address',
            gateway: 'Gateway',
            label: 'Label',
            active: 'Active',
            l2_active: 'L2 Active'

        };

        this.MONITOR_PROJECT_LIST_ID = "monitor-project-list";
        this.MONITOR_PROJECT_ID = "monitor-project";
        this.MONITOR_PROJECT_VIEW_ID = "monitor-project-view";
        this.MONITOR_NETWORK_LIST_ID = "monitor-network-list";
        this.MONITOR_NETWORK_LIST_VIEW_ID = "monitor-network-list-view";
        this.MONITOR_NETWORK_ID = "monitor-network";
        this.MONITOR_NETWORK_VIEW_ID = "monitor-network-view";
        this.MONITOR_INSTANCE_LIST_ID = "monitor-instance-list";
        this.MONITOR_INSTANCE_LIST_VIEW_ID = "monitor-instance-list-view";
        this.MONITOR_INSTANCE_ID = "monitor-instance";
        this.MONITOR_INSTANCE_VIEW_ID = "monitor-instance-view";

        this.PROJECT_GRAPH_ID = "project-graph";
        this.PROJECT_DETAILS_ID = "project-details";
        this.PROJECT_TABS_ID = "project-tabs";
        this.PROJECT_PORT_DIST_ID = "project-port-distribution";
        this.PROJECT_PORT_DIST_CHART_ID = "port-distribution-chart";
        this.PROJECT_NETWORKS_ID = "project-networks";
        this.PROJECT_NETWORK_GRID_ID = "project-network-grid";
        this.PROJECT_INSTANCES_ID = "project-instances";
        this.PROJECT_INSTANCE_GRID_ID = "project-instance-grid";

        this.NETWORK_GRAPH_ID = "network-graph";
        this.NETWORK_TABS_ID = "network-tabs";
        this.NETWORK_DETAILS_ID = "network-details";
        this.NETWORK_PORT_DIST_ID = "network-port-distribution";
        this.NETWORK_INSTANCES_ID = "network-instances";

        this.INSTANCE_GRAPH_ID = "instance-graph";
        this.INSTANCE_TABS_ID = "instance-tabs";
        this.INSTANCE_DETAILS_ID = "instance-details";

        this.TITLE_NETWORKS = "Networks";
        this.TITLE_NETWORKS_SUMMARY = "Networks Summary";
        this.TITLE_NETWORK_DETAILS = "Network Details";

        this.TITLE_INSTANCES = "Instances";
        this.TITLE_INSTANCES_SUMMARY = "Instances Summary";
        this.TITLE_INSTANCE_DETAILS = "Instance Details";

        this.TITLE_DETAILS = "Details";
        this.TITLE_INTERFACES = "Interfaces";
        this.TITLE_CPU_INFO = "CPU Info";
        this.TITLE_TRAFFIC_DETAILS = "Traffic Details";
        this.TITLE_PORT_DISTRIBUTION = "Port Distribution";

        this.X_AXIS_TITLE_PORT = "Port";
        this.Y_AXIS_TITLE_BW = "Bandwidth";
    };
    return CTLabels;
});