/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.BGP_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                bgpGridViewMockData: 'config/infra/bgp/test/ui/views/bgpGridView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/bgp/get-bgp-routers'),
                    response: {data:'bgpGridViewMockData.bgpMockData'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_infra_bgp',
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: configBGPPageLoader.bgpView,
            tests: [
                {
                    viewId: ctwl.BGP_GRID_ID,
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
