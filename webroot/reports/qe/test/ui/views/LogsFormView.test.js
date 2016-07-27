/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'reports/qe/test/ui/views/LogsQueryQueueView.mock.data',
    'co-grid-view-test-suite',
    'logs-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.LOGS_QUERY_QUEUE_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse({
            method:"GET",
            url: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=lqq'),
            body: JSON.stringify(TestMockdata.logsQueryQueueMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/qe/table/schema/MessageTable'),
            body: JSON.stringify(TestMockdata.logsSchemaTable)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/service/networking/web-server-info'),
            body: JSON.stringify(TestMockdata.serverInfo)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cotc.URL_QE_QUERY,
            body: JSON.stringify(TestMockdata.logsViewQueryMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cotc.URL_COLUMN_VALUES,
            body: JSON.stringify(TestMockdata.values)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);
    cotr.startTestRunner(pageTestConfig);
});
