/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/networking/routeaggregate/test/ui/views/routeAggregateGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.ROUTE_AGGREGATE_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerRoutes = function() {
        var responses = [];
        responses.push({
            url: '/tenants/config/domains',
            fnName: 'routeAggregateDomainsData'
        });
        responses.push({
            url:'/tenants/config/projects/default-domain',
            fnName: 'routeAggregatePojectsData'
        });
        responses.push({
            url: '/tenants/config/route-aggregates/ee14bbf4-a3fc-4f98-a7b3-f1fe1d8b29bb',
            fnName: 'routeAggregateMockData'
        });

        return responses;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_net_rtaggregates'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configRouteAggregatePageLoader.routeAggregateView,
            tests: [
                {
                    viewId: ctwc.ROUTE_AGGREGATE_GRID_ID,
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, pageConfig, getTestConfig);
    pageTestConfig.mockDataFile = 'config/networking/routeaggregate/test/ui/views/routeAggregateGridView.mock.data.js';

    pageTestConfig.getTestServerRoutes = testServerRoutes;
    return pageTestConfig;

});
