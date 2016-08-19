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

    var testServerRoutes = function() {
    var routes = [];

    routes.push({
        url: cttu.getRegExForUrl('/api/tenants/config/domains').toString(),
        fnName: 'bgpAsAServiceDomainsData'
    });
    routes.push( {
        url: cttu.getRegExForUrl('/api/tenants/config/projects/default-domain').toString(),
        fnName: 'bgpAsAServicePojectsData'
    });

    routes.push({
        url: cttu.getRegExForUrl('/api/tenants/config/get-bgp-as-a-services/90ab868a-da21-4ed9-922f-a309967eb0a0').toString(),
        fnName: 'bgpAsAServiceMockData'
    });
    routes.push({
        url: cttu.getRegExForUrl('/api/tenants/get-project-role').toString(),
        fnName: 'empty'
    });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'config/services/bgpasaservice/test/ui/views/bgpAsAServiceGridView.mock.data.js';

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
