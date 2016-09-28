/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
], function (cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;
    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function () {
        var routesConfig = {
            mockDataFiles: {
                dashboardViewMockDataFile: "monitor/networking/test/ui/views/DashboardView.mock.data.js"
            },
            routes: []
        };

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/config/domains'),
            response: {data: 'dashboardViewMockDataFile.domainsMockData'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/config/projects'),
            response: {data: 'dashboardViewMockDataFile.projectMockData'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain'),
            response: {data: 'dashboardViewMockDataFile.projectMockData'}
        });

        routesConfig.routes.push({
            method: "GET",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
            response: {data: 'dashboardViewMockDataFile.portDistributionMockData'}
        });

        routesConfig.routes.push({
            method: "GET",
            urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph'),
            response: {data: 'dashboardViewMockDataFile.projectConnectedGraph'}
        });

        routesConfig.routes.push({
            method: "GET",
            urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph'),
            response: {data: 'dashboardViewMockDataFile.projectConfigGraph'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details'),
            response: {data: 'dashboardViewMockDataFile.networksMockData'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
            response: {data: 'dashboardViewMockDataFile.virtualMachinesDetailsMockData'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
            response: {data: '{}'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            response: {data: 'dashboardViewMockDataFile.networksMockStatData'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            response: {data: 'dashboardViewMockDataFile.virtualMachinesSummaryMockData'}
        });

        return routesConfig;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/DashboardView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_dashboard',
        q: {
            view: 'details',
            type: 'project',
            "reload": "false",
            "tab": {
                "project-tabs": "project-interfaces"
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function () {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_INTERFACE_GRID_ID,
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
                                    mockDataParseFn: cttu.deleteSizeField,
                                    gridDataParseFn: cttu.deleteSizeField
                                }
                            }
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

        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;
});
