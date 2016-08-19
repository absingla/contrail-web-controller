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

    var testServerRoutes = function() {
        var routes = [];

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/config/domains').toString(),
            fnName: 'domainsMockData'
        });
        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/config/projects').toString(),
            fnName: 'projectMockData'
        });

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/projects/default-domain').toString(),
            fnName: 'projectMockData'
        });

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top').toString(),
            fnName: 'portDistributionMockData'
        });

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph').toString(),
            fnName: 'projectConnectedGraph'
        });

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph').toString(),
            fnName: 'projectConfigGraph'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details').toString(),
            fnName: 'networksMockData'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details').toString(),
            fnName: 'virtualMachinesDetailsMockData'
        });

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/get-project-role').toString(),
            fnName: 'empty'
         });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats').toString(),
            fnName: 'networksMockStatData'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary').toString(),
            fnName: 'virtualMachinesSummaryMockData'
        });
        return routes;
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;
});
