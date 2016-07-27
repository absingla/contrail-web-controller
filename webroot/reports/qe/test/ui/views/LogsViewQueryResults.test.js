/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'reports/qe/test/ui/views/LogsQueryQueueView.mock.data',
    'co-grid-view-test-suite'
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewTestSuite) {

    var moduleId = cttm.LOGS_VIEW_QUERY_COMMON_TEST_MODULE;

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
            method: "POST",
            url: cotc.URL_QE_QUERY,
            body: JSON.stringify(TestMockdata.logsViewQueryMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'query_log_queue',
        q: {
            label: 'Query Queue'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);

    cotr.startTestRunner(pageTestConfig);
});
