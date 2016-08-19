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

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testType = cotc.VIEW_TEST;
    var testServerRoutes = function() {
        var routes = [];

        routes.push({
            method:"GET",
            url: '/api/qe/query/queue?queryQueue=fqq',
            fnName: 'viewQueryQueueMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/qe/table/schema/FlowSeriesTable',
            fnName: 'flowSchemaTable'
        });

        routes.push({
            method: "GET",
            url: '/api/service/networking/web-server-info',
            fnName: 'serverInfo'
        });

        routes.push({
            method: "POST",
            url: cotc.URL_QE_QUERY,
            fnName:'getFlowViewQueryMockData'
        });


        routes.push({
            method: "POST",
            url: cotc.URL_COLUMN_VALUES,
            fnName: 'postValues'
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'reports/qe/test/ui/views/FlowQueryQueueView.mock.data.js';

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;

});
