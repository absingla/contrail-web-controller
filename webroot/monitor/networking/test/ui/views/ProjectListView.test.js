/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'controller-constants',
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite',
], function (ctConstants, cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite) {

    var moduleId = cttm.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        /*
         /api/tenants/config/domains
         /api/tenants/projects/default-domain
         /api/tenant/networking/virtual-networks/details?count=25
         /api/tenant/networking/stats
         */
        var routesConfig = {
            mockDataFiles: {
                projectListViewMockData: 'monitor/networking/test/ui/views/ProjectListView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_DOMAINS),
                    response: {data: 'projectListViewMockData.domainsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_PROJECTS),
                    response: {data: 'projectListViewMockData.projectsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_PROJECTS_VCENTER_OR_CONFIG),
                    response: {data: 'projectListViewMockData.projectsMockData'}
                },
                {
                    method:"POST",
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_NETWORKS_DETAILS),
                    response: {data: 'projectListViewMockData.networksMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_VM_VN_STATS),
                    response: {data: 'projectListViewMockData.networksMockStatData'}
                }
            ]
        };
        return routesConfig;
    };

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);

    return pageTestConfig;
});
