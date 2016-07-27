/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'reports/qe/test/ui/views/FlowQueryQueueView.mock.data',
    'co-grid-view-test-suite',
    'flow-record-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.FLOW_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse({
            method:"GET",
            url: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=fqq'),
            body: JSON.stringify(TestMockdata.viewQueryQueueMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/qe/table/schema/FlowSeriesTable'),
            body: JSON.stringify(TestMockdata.flowSchemaTable)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/service/networking/web-server-info'),
            body: JSON.stringify(TestMockdata.serverInfo)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cotc.URL_QE_QUERY,
            body: JSON.stringify(TestMockdata.getFlowViewQueryMockData)
        }));


        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cotc.URL_COLUMN_VALUES,
            body: JSON.stringify(TestMockdata.postValues)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);
    cotr.startTestRunner(pageTestConfig);
});
