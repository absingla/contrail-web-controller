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

    var moduleId = cttm.PHYSICAL_ROUTERS_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                physicalRoutersGridViewMockData: 'config/physicaldevices/physicalrouters/test/ui/views/physicalRoutersGridView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/physical-routers-with-intf-count'),
                    response: {data : 'physicalRoutersGridViewMockData.physcalRoutersMockData'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_pd_physicalRouters'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configPhysicalRoutersPageLoader.physicalRoutersView,
            tests: [
                {
                    viewId: ctwl.PHYSICAL_ROUTERS_GRID_ID,
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
