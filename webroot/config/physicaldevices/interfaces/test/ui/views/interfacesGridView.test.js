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

    var moduleId = cttm.PHYSICAL_INTERFACES_GRID_VIEW_COMMON_TEST_MODULE;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testType = cotc.VIEW_TEST;

    var testServerRoutes = function() {
        var routes = [];

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/config/physical-routers-list').toString(),
            fnName: 'physicalRouterListMockData'
        });

        routes.push({
            method : "POST",
            url: cttu.getRegExForUrl('/api/tenants/config/get-interfaces').toString(),
            fnName: 'physicalInterfacesMockData'
        });
        return routes;
    };
    
    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'config/physicaldevices/interfaces/test/ui/views/interfacesGridView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_pd_interfaces',
        q: {
            'uuid' : '8d2dd1b7-279b-4237-873e-41cf4fbcfe1d'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configInterfacesPageLoader.interfacesView,
            tests: [
                {
                    viewId: ctwl.INTERFACES_GRID_ID,
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
