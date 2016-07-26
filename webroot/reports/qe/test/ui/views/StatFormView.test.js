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
    'stat-form-view-custom-test-suite'
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewTestSuite, CustomTestSuite) {

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
            url: ctwc.URL_QUERY_RESULT,
            body: JSON.stringify(TestMockdata.statViewQueryQueueMockData)
        }));


        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: ctwc.URL_COLUMN_VALUES,
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

        $($('span.add-on')[0]).trigger('click');
        $($('.ui-menu-item')[0]).trigger('click');
        $($('.add-on .icon-pencil')[0]).trigger('click');

        setTimeout(function(){
            $('.selectAllLink').trigger('click');
            $('.btnSave').trigger('click');
            $("#run_query").trigger('click');
            setTimeout(function(){
                onAllViewsRenderComplete.notify();
                defObj.resolve();
            },cotc.PAGE_INIT_TIMEOUT * 10);

        },  cotc.PAGE_INIT_TIMEOUT * 10);
        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);

    cotr.startTestRunner(pageTestConfig);


});
