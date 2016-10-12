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

    var moduleId = cttm.LOGS_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                statsQueryQueueMockData: 'reports/qe/test/ui/views/StatsQueryQueueView.mock.data.js'
            },
            routes: [
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=sqq'),
                    response: {data: 'statsQueryQueueMockData.statQueryQueueMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/qe/query'),
                    response: {data: 'statsQueryQueueMockData.statViewQueryQueueMockData'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_stat_queue',
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
        $('.grid-action-dropdown').trigger('click');
        $('.tooltip-success').click();
        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);
    
    return pageTestConfig;
});
