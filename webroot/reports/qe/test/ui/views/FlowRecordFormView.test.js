/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-view-test-suite',
    'flow-record-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.FLOW_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles : {
                flowQueryQueueMockData: 'reports/qe/test/ui/views/FlowQueryQueueView.mock.data.js'
            },
            routes: [
                {
                    method:"GET",
                    url: '/api/qe/query/queue?queryQueue=fqq',
                    response: {data: 'flowQueryQueueMockData.viewQueryQueueMockData'}
                },
                {
                    method: "GET",
                    url: '/api/qe/table/schema/FlowSeriesTable',
                    response: {data: 'flowQueryQueueMockData.flowSchemaTable'}
                },
                {
                    method: "GET",
                    url: '/api/service/networking/web-server-info',
                    response: {data: 'flowQueryQueueMockData.serverInfo'}
                },
                {
                    method: "POST",
                    url: cotc.URL_QE_QUERY,
                    response: {data:'flowQueryQueueMockData.getFlowViewQueryMockData'}
                },
                {
                    method: "POST",
                    url: cotc.URL_COLUMN_VALUES,
                    response: {data: 'flowQueryQueueMockData.postValues'}
                }
            ]
        };
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_flow_series',
        q: {
            label: 'Flow Series'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: controllerQEPageLoader.controllerQEView,
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
