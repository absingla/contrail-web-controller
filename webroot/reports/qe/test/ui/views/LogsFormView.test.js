/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-view-test-suite',
    'logs-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.LOGS_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles : {
                logsQueryQueueMockData: 'reports/qe/test/ui/views/LogsQueryQueueView.mock.data.js'
            },
            routes: [
                {
                    method:"GET",
                    url: '/api/qe/query/queue?queryQueue=lqq',
                    response: {data: 'logsQueryQueueMockData.logsQueryQueueMockData'}
                },
                {
                    method: "GET",
                    url: '/api/qe/table/schema/MessageTable',
                    response: {data: 'logsQueryQueueMockData.logsSchemaTable'}
                },
                {
                    method: "GET",
                    url: '/api/service/networking/web-server-info',
                    response: {data: 'logsQueryQueueMockData.serverInfo'}
                },
                {
                    method: "POST",
                    url: cotc.URL_QE_QUERY,
                    response: {data: 'logsQueryQueueMockData.logsViewQueryMockData'}
                },
                {
                    method: "POST",
                    url: cotc.URL_COLUMN_VALUES,
                    response: {data: 'logsQueryQueueMockData.values'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_log_system',
        q: {
            label: 'System Logs'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: qePageLoader.qeView,
            tests: [
                {
                    viewId: cowl.QE_QUERY_RESULT_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        {
                            class: CustomTestSuite,
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
        cotu.triggerClickOnElement("#run_query");
        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig, testInitFn);

    return pageTestConfig;
});
