/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-utils',
    'contrail-list-model',
    'contrail-view-model'
], function (cotu, ContrailListModel, ContrailViewModel) {

    this.getRegExForUrl = function (url) {
        var regexUrlMap = {
                '/api/tenants/config/get-bgp-as-a-services/90ab868a-da21-4ed9-922f-a309967eb0a0' :/\/api\/tenants\/config\/get-bgp-as-a-services\/90ab868a-da21-4ed9-922f-a309967eb0a0.*$/,
                '/api/tenants/config/projects': /\/api\/tenants\/config\/projects.*$/,
                '/api/tenants/projects': /\/api\/tenants\/projects.*$/,
                '/api/tenant/networking/virtual-networks/details': /\/api\/tenant\/networking\/virtual-networks\/details\?.*$/,

                '/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend': /\/api\/tenant\/networking\/virtual-network\/summary\?fqNameRegExp=default-domain%3Aadmin%3Afrontend.*$/,

                '/api/tenant/networking/virtual-machines/details': /\/api\/tenant\/networking\/virtual-machines\/details\?.*$/,
                '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary\?.*$/,
                '/api/tenant/networking/virtual-machine-interfaces/summary': /\/api\/tenant\/networking\/virtual-machine-interfaces\/summary.*$/,
                '/api/tenant/networking/stats': /\/api\/tenant\/networking\/stats.*$/,
                '/api/admin/reports/query' : /\/api\/admin\/reports\/query.*$/,
                '/api/admin/error' : /\/api\/admin\/error.*$/,
                '/api/tenant/networking/network/stats/top' :  /\/api\/tenant\/networking\/network\/stats\/top.*$/,
                '/api/tenant/monitoring/project-connected-graph': /\/api\/tenant\/monitoring\/project-connected-graph.*$/,
                '/api/tenant/monitoring/project-config-graph': /\/api\/tenant\/monitoring\/project-config-graph.*$/,

                '/api/tenants/networks/default-domain:admin': /\/api\/tenants\/networks\/default-domain:admin.*$/,
                '/api/tenants/projects/default-domain:admin': /\/api\/tenants\/projects\/default-domain:admin.*$/,
                '/api/tenants/config/route-aggregates/ee14bbf4-a3fc-4f98-a7b3-f1fe1d8b29bb' : /\/api\/tenants\/config\/route-aggregates\/ee14bbf4-a3fc-4f98-a7b3-f1fe1d8b29bb.*$/,
                '/api/tenants/projects/default-domain': /\/api\/tenants\/projects\/default-domain.*$/,
                '/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend' : /\/api\/tenant\/networking\/flow-series\/vn\?minsSince=120&fqName=default-domain%3Aadmin%3Afrontend.*$/,
                '/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend': /\/api\/tenant\/networking\/network\/stats\/top\?minsSince=10&fqName=default-domain%3Aadmin%3Afrontend.*$/,
                '/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend': /\/api\/tenant\/monitoring\/network-connected-graph\?fqName=default-domain%3Aadmin%3Afrontend.*$/,
                '/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend': /\/api\/tenant\/monitoring\/network-config-graph\?fqName=default-domain%3Aadmin%3Afrontend.*$/,
                '/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn': /\/api\/tenant\/networking\/virtual-machines\/details\?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn.*$/,
                '/api/tenant/networking/virtual-machines/summary': /\/api\/tenant\/networking\/virtual-machines\/summary.*$/,

                '/api/tenants/config/physical-routers-with-intf-count':/\/api\/tenants\/config\/physical-routers-with-intf-count.*$/,
                '/api/tenants/config/physical-routers-list': /\/api\/tenants\/config\/physical-routers-list.*$/,
                '/api/tenants/config/bgp/get-bgp-routers' : /\/api\/tenants\/config\/bgp\/get-bgp-routers.*$/,
                'tenants/config/domains' : /\/api\/tenants\/config\/domains.*$/,
                '/api/qe/table/schema/vrouter' :/\/api\/qe\/table\/schema\/vrouter.*$/,
                '/api/tenants/config/get-config-details' : /\/api\/tenants\/config\/get-config-details.*$/,
                '/api/tenants/config/get-virtual-machine-details-paged': /\/api\/tenants\/config\/get-virtual-machine-details-paged.*$/,
                '/api/tenants/config/get-config-uuid-list': /\/api\/tenants\/config\/get-config-uuid-list.*$/,
                '/api/tenants/config/list-virtual-DNSs/07fbaa4b-c7b8-4f3d-996e-9d8b1830b288' :/\/api\/tenants\/config\/list-virtual-DNSs\/07fbaa4b-c7b8-4f3d-996e-9d8b1830b288.*$/,
                '/api/tenants/config/get-interfaces' :/\/api\/tenants\/config\/get-interfaces.*$/,
                '/api/qe/query/queue?queryQueue=fqq':/\/api\/qe\/query\/queue\?queryQueue=fqq.*$/,
                '/api/qe/query/queue?queryQueue=lqq':/\/api\/qe\/query\/queue\?queryQueue=lqq.*$/,
                '/api/qe/query/queue?queryQueue=sqq':/\/api\/qe\/query\/queue\?queryQueue=sqq.*$/,
                '/api/qe/query':/\/api\/qe\/query.*$/,
                '/api/tenants/networking/stats': /\/api\/tenants\/networking\/stats.*$/,
                '/api/qe/table/column/values': /\/api\/qe\/table\/column\/values.*$/,
                '/api/qe/table/schema/FlowSeriesTable':/\/api\/qe\/table\/schema\/FlowSeriesTable.*$/,
                '/api/service/networking/web-server-info':/\/api\/service\/networking\/web-server-info.*$/,
                '/api/qe/table/schema/MessageTable':/\/api\/qe\/table\/schema\/MessageTable.*$/,
                '/api/qe/table/schema/StatTable.CollectorDbStats.cql_stats.errors':/\/api\/qe\/table\/schema\/StatTable.CollectorDbStats.cql_stats.errors.*$/,
                '/api/tenant/monitoring/instance-connected-graph': /\/api\/tenant\/monitoring\/instance\-connected\-graph.*$/,
                '/api/tenant/networking/virtual-machine':/\/api\/tenant\/networking\/virtual\-machine.*$/,
                '/api/tenants/networks/default-domain:demo': /\/api\/tenants\/networks\/default\-domain\:demo.*$/,
                '/api/tenants/projects/default-domain': /\/api\/tenants\/projects\/default\-domain\.*$/,
                '/api/tenant/networking/flow-series/vm':/\/api\/tenant\/networking\/flow\-series\/vm.*$/,
                '/api/tenant/networking/network/stats/top':/\/api\/tenant\/networking\/network\/stats\/top.*$/,
                '/api/tenants/get-project-role':/\/api\/tenants\/get-project-role.*$/,
                '/api/tenants/config/projects':/\/api\/tenants\/config\/projects.*$/,
                '/api/tenants/config/domains':/\/api\/tenants\/config\/domains.*$/,
                '/api/tenants/config/projects/default-domain' :/\/api\/tenants\/config\/projects\/default-domain.*$/,
                '/api/admin/reports/query/chart-data' : /\/api\/admin\/reports\/query\/chart-data.*$/,
                '/api/admin/reports/query?port=34560-34815&timeRange=600&table=FlowSeriesTable': /\/api\/admin\/reports\/query\?port=34560-34815&timeRange=600&table=FlowSeriesTable.*$/,
                '/api/admin/reports/query?port=9110&timeRange=600&table=FlowSeriesTable': /\/api\/admin\/reports\/query\?port=9110&timeRange=600&table=FlowSeriesTable.*$/
        };
        return regexUrlMap[url].toString();
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

    this.deleteFieldsForNetworkListViewScatterChart = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
            if (contrail.checkIfExist(data.color)) {
                delete data.color;
            }
        });
        return dataArr;
    };

    this.deleteFieldsForInstanceListViewScatterChart = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
            if (contrail.checkIfExist(data.color)) {
                delete data.color;
            }
        });
        return dataArr;
    };

    this.deleteFieldsForProjectListViewScatterChart = function (dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
            if (contrail.checkIfExist(data.color)) {
                delete data.color;
            }
        });
        return dataArr;
    };

    this.commonDetailsDataGenerator = function (viewObj, defObj) {
        var viewConfig = cotu.getViewConfigObj(viewObj),
            modelMap = viewObj.modelMap,
            modelData = viewConfig.data,
            ajaxConfig = viewConfig.ajaxConfig,
            dataParser = viewConfig.dataParser,
            contrailViewModel;

        if (modelMap != null && modelMap[viewConfig.modelKey] != null) {
            contrailViewModel = modelMap[viewConfig.modelKey];
            defObj.resolve();
        } else {
            var modelRemoteDataConfig = {
                remote: {
                    ajaxConfig: ajaxConfig,
                    dataParser: dataParser
                }
            };
            contrailViewModel = new ContrailViewModel($.extend(true, {data: modelData}, modelRemoteDataConfig));
        }
        return contrailViewModel;
    }

    return {
        self: self,
        getRegExForUrl: getRegExForUrl,
        commonGridDataGenerator: commonGridDataGenerator,
        commonDetailsDataGenerator: commonDetailsDataGenerator,
        deleteSizeField: deleteSizeField,
        deleteFieldsForNetworkListViewScatterChart: deleteFieldsForNetworkListViewScatterChart,
        deleteFieldsForInstanceListViewScatterChart: deleteFieldsForInstanceListViewScatterChart,
        deleteFieldsForProjectListViewScatterChart: deleteFieldsForProjectListViewScatterChart
    };

});
