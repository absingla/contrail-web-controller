/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-view-test-suite',
    'stat-form-view-custom-test-suite',
    'co-test-utils',
], function (cotc,cotr, cttu, cttm, GridViewTestSuite, CustomTestSuite, cotu) {

    var moduleId = cttm.STAT_FORM_CUSTOM_TEST;

    var testType = cotc.VIEW_TEST;
    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {
    var routes = [];

        routes.push({
            method:"GET",
            url: '/api/qe/query/queue?queryQueue=sqq',
            fnName: 'statQueryQueueMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/service/networking/web-server-info',
            fnName: 'webServerInfo'
        });

        routes.push({
            method: "GET",
            url: '/api/qe/table/schema/vrouter',
            fnName: 'vrouterSchema'
        });

        routes.push({
            method: "GET",
            url: '/api/qe/table/schema/StatTable.CollectorDbStats.cql_stats.errors',
            fnName: 'cql_stats_errors'
        });

        routes.push({
            method: "POST",
            url: '/api/qe/query',
            fnName: 'statViewQueryQueueMockData'
        });


        routes.push({
            method: "POST",
            url: "/api/qe/table/column/values",
            fnName: "values"
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile ='reports/qe/test/ui/views/StatQueryQueueView.mock.data.js';
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;
});
