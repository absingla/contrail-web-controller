/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-view-test-suite',
    'stats-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.STAT_FORM_CUSTOM_TEST;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                statsQueryQueueMockData: 'reports/qe/test/ui/views/StatsQueryQueueView.mock.data.js'
            },
            routes: [
                {
                    method:"GET",
                    url: '/api/qe/query/queue?queryQueue=sqq',
                    response: {data: 'statsQueryQueueMockData.statQueryQueueMockData'}
                },
                {
                    method: "GET",
                    url: '/api/service/networking/web-server-info',
                    response: {data: 'statsQueryQueueMockData.webServerInfo'}
                },
                {
                    method: "GET",
                    url: '/api/qe/table/schema/vrouter',
                    response: {data: 'statsQueryQueueMockData.vrouterSchema'}
                },
                {
                    method: "GET",
                    url: '/api/qe/table/schema/StatTable.CollectorDbStats.cql_stats.errors',
                    response: {data: 'statsQueryQueueMockData.cql_stats_errors'}
                },
                {
                    method: "POST",
                    url: '/api/qe/query',
                    response: {data: 'statsQueryQueueMockData.statViewQueryQueueMockData'}
                },
                {
                    method: "POST",
                    url: "/api/qe/table/column/values",
                    response: {data: "statsQueryQueueMockData.values"}
                }
            ]
        };
        return routesConfig;
    };

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);

    return pageTestConfig;
});
