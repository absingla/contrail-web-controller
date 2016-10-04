/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.BGP_AS_A_SERVICE_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                bgpAsAServiceGridViewMockData: 'config/services/bgpasaservice/test/ui/views/bgpAsAServiceGridView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/domains'),
                    response: {data: 'bgpAsAServiceGridViewMockData.bgpAsAServiceDomainsData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/projects/default-domain'),
                    response: {data: 'bgpAsAServiceGridViewMockData.bgpAsAServicePojectsData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/get-bgp-as-a-services/90ab868a-da21-4ed9-922f-a309967eb0a0'),
                    response: {data: 'bgpAsAServiceGridViewMockData.bgpAsAServiceMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
                    response: {data: '{}'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_sc_bgpasaservice'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configBGPAsAServicePageLoader.bgpAsAServiceView,
            tests: [
                {
                    viewId: ctwc.BGP_AS_A_SERVICE_GRID_ID,
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);

    return pageTestConfig;
});
