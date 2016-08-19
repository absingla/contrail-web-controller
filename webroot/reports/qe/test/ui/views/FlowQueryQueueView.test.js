/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, GridViewTestSuite) {

    var moduleId = cttm.FLOW_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testType = cotc.VIEW_TEST;
    var testServerRoutes = function() {
        var routes = [];

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=fqq').toString(),
            fnName: "viewQueryQueueMockData"
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'reports/qe/test/ui/views/FlowQueryQueueView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_flow_queue',
        q: {
            label: 'Query Queue'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function () {
        return {
            rootView: qePageLoader.qeView,
            tests: [
                {
                    viewId: cowl.QE_QUERY_QUEUE_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        }

                    ]
                }
            ]
        };
    };

    var testInitFn = function (defObj, onAllViewsRenderComplete) {

        setTimeout(function () {
                onAllViewsRenderComplete.notify();
                defObj.resolve();
            },
            // Add necessary timeout for the tab elements to load properly and resolve the promise
            cotc.PAGE_INIT_TIMEOUT * 10
        );
        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;
});
