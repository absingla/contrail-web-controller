/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite',
], function (cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite) {

    var moduleId = cttm.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {
        var routes = [];

        /*
            /api/tenants/config/domains
            /api/tenants/projects/default-domain
            /api/tenant/networking/virtual-networks/details?count=25
            /api/tenant/networking/stats
        */

        routes.push({
            url: '/api/tenants/config/domains',
            fnName: 'domainsMockData'
        });
        routes.push({
            url: '/api/tenants/config/projects',
            fnName: 'projectMockData'
        });

        routes.push( {
            url: '/api/tenants/projects',
            fnName: 'projectMockData'
        });

        routes.push({
            method:"POST",
            url: '/api/tenant/networking/virtual-networks/details',
            fnName: 'networksMockData'
        });
        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'networksMockStatData'
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/ProjectListView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_projects',
        q: {
            view: 'list',
            type: 'project'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'projects-scatter-chart',
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: 'projects-grid',
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        {
                            class: GridListModelTestSuite,
                            groups: ['all'],
                            modelConfig: {
                                dataGenerator: cttu.commonGridDataGenerator,
                                dataParsers: {
                                    mockDataParseFn: cttu.deleteFieldsForProjectListViewScatterChart,
                                    gridDataParseFn: cttu.deleteFieldsForProjectListViewScatterChart
                                }
                            }
                        },
                        //{
                        //    class: CustomTestSuite,
                        //    groups: ['all']
                        //},
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
