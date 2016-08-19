/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/dns/records/test/ui/views/dnsRecordsGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.DNS_RECORDS_GRID_VIEW_TEST_MODULE;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    var testType = cotc.VIEW_TEST;

    var testServerRoutes = function() {
        var routes = [];
        routes.push({
            url :  '/api/tenants/config/domains',
            fnName: 'dnsRecordsDomainMockData'
        });
        routes.push({
            url :  '/api/tenants/config/list-virtual-DNSs/07fbaa4b-c7b8-4f3d-996e-9d8b1830b288',
            fnName: 'dnsServerListMockData'
        });

        routes.push({
            url : '/api/tenants/config/get-config-details',
            method: "POST",
            fnName: 'dnsRecordsMockData'
        });
        return routes;
    };
    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'config/dns/records/test/ui/views/dnsRecordsGridView.mock.data.js';


    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_dns_records',
        q: {
            uuid:'e59247c6-280f-47b7-a3f3-994f3108cf93'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configDNSRecordsLoader.dnsRecordsView,
            tests: [
                {
                    viewId: ctwc.DNS_RECORDS_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
