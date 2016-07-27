/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'reports/qe/test/ui/views/StatQueryQueueView.mock.data',
    'co-grid-view-test-suite',
    'stat-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.STAT_FORM_CUSTOM_TEST;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse({
            method:"GET",
            url: cttu.getRegExForUrl('/api/qe/query/queue?queryQueue=sqq'),
            body: JSON.stringify(TestMockdata.statQueryQueueMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/service/networking/web-server-info'),
            body: JSON.stringify(TestMockdata.webServerInfo)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/qe/table/schema/StatTable.CollectorDbStats.cql_stats.errors'),
            body: JSON.stringify(TestMockdata.cql_stats_errors)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cotc.URL_QE_QUERY,
            body: JSON.stringify(TestMockdata.statViewQueryQueueMockData)
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
        p: 'query_stat_query',
        q: {
            label: 'Query'
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
                            groups: ['error']
                        }
                    ]
                }
            ]
        };
    };

    var testInitFn = function (defObj, onAllViewsRenderComplete) {

        cotu.triggerClickOnElement($('span.add-on')[0]);
        cotu.triggerClickOnElement($('.ui-menu-item')[0]);
        cotu.triggerClickOnElement($('.add-on .icon-pencil')[0]);

        setTimeout(function(){
            cotu.triggerClickOnElement('.selectAllLink');
            cotu.triggerClickOnElement('.btnSave');
            cotu.triggerClickOnElement("#run_query");
            setTimeout(function(){
                onAllViewsRenderComplete.notify();
                defObj.resolve();
            },cotc.PAGE_INIT_TIMEOUT * 10);

        },  cotc.FORM_ACTIONS_TIMEOUT/2);
        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);
    cotr.startTestRunner(pageTestConfig);
});
