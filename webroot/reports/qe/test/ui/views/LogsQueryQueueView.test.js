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

    var testServerRoutes = function() {
        var responses = [];
        responses.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=lqq').toString(),
            fnName: 'logsQueryQueueMockData'
        });
        return responses;
    };
    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_log_queue',
        q: {
            label: 'Query Queue'
        }
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile ='reports/qe/test/ui/views/LogsQueryQueueView.mock.data.js';

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
                            groups: ['body']
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;
});