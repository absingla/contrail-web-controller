/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTConstants = function () {
        this.URL_PROJECT_VISUALIZATION = '/api/tenant/monitoring/project-topology?fqName={0}';
        this.URL_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port';
        this.URL_PROJECT_NETWORKS = '/api/tenant/networking/virtual-networks/details?fqn={0}';
        this.URL_PROJECT_INSTANCES = '/api/tenant/networking/virtual-machines/details?fqnUUID={0}&count=50&type=project';

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
