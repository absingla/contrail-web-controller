/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-utils',
    'contrail-list-model'
], function (cotu, ContrailListModel) {

    this.getRegExForUrl = function (url) {
        var regexUrlMap = {
            '/api/tenants/config/domains': /\/api\/tenants\/config\/domains.*$/,
            '/api/tenants/config/projects': /\/api\/tenants\/config\/projects.*$/,
            '/api/tenant/networking/virtual-networks/details': /\/api\/tenant\/networking\/virtual-networks\/details\?.*$/,

            '/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend': /\/api\/tenant\/networking\/virtual-network\/summary\?fqNameRegExp=default-domain:admin:frontend.*$/,

            '/api/tenant/networking/virtual-machines/details': /\/api\/tenant\/networking\/virtual-machines\/details\?.*$/,
            '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary\?.*$/,
            '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary.*$/,
            '/api/tenant/networking/stats': /\/api\/tenant\/networking\/stats.*$/,
            '/api/admin/reports/query' : /\/api\/admin\/reports\/query.*$/,
            '/api/tenant/networking/network/stats/top' :  /\/api\/tenant\/networking\/network\/stats\/top.*$/,
            '/api/tenant/monitoring/project-connected-graph': /\/api\/tenant\/monitoring\/project-connected-graph.*$/,
            '/api/tenant/monitoring/project-config-graph': /\/api\/tenant\/monitoring\/project-config-graph.*$/,

            '/api/tenants/networks/default-domain:admin': /\/api\/tenants\/networks\/default-domain:admin.*$/,
            '/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend' : /\/api\/tenant\/networking\/flow-series\/vn\?minsSince=120&fqName=default-domain:admin:frontend.*$/,
            '/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend': /\/api\/tenant\/networking\/network\/stats\/top\?minsSince=10&fqName=default-domain:admin:frontend.*$/,
            '/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend': /\/api\/tenant\/monitoring\/network-connected-graph\?fqName=default-domain:admin:frontend.*$/,
            '/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend': /\/api\/tenant\/monitoring\/network-config-graph\?fqName=default-domain:admin:frontend.*$/,
            '/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&type=vn': /\/api\/tenant\/networking\/virtual-machines\/details\?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&type=vn.*$/,
            '/api/tenant/networking/virtual-machines/summary': /\/api\/tenant\/networking\/virtual-machines\/summary.*$/,

            '/api/admin/reports/query?port=34560-34815&timeRange=600&table=FlowSeriesTable': /\/api\/admin\/reports\/query\?port=34560-34815&timeRange=600&table=FlowSeriesTable.*$/,
            '/api/admin/reports/query?port=9110&timeRange=600&table=FlowSeriesTable': /\/api\/admin\/reports\/query\?port=9110&timeRange=600&table=FlowSeriesTable.*$/
        };

        return regexUrlMap [url];
    };

    this.commonGridDataGenerator = function (viewObj) {
        var viewConfig = cotu.getViewConfigObj(viewObj);
        var modelConfig = cotu.getGridDataSourceWithOnlyRemotes(viewConfig);
        var contrailListModel = new ContrailListModel(modelConfig);
        return contrailListModel;
    };

    this.deleteSizeField = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
        });
        return dataArr;
    };

    return {
        self: self,
        getRegExForUrl: getRegExForUrl,
        commonGridDataGenerator: commonGridDataGenerator,
        deleteSizeField: deleteSizeField
    };

});
