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
            url: '/api/tenants/config/domains',
            fnName: 'domainsMockData'
        });
        routes.push({
            url: '/api/tenants/config/projects',
            fnName: 'projectMockData'
        });

        routes.push({
            url: '/api/tenants/projects/default-domain',
            fnName: 'projectMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/networking/network/stats/top',
            fnName: 'portDistributionMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/monitoring/project-connected-graph',
            fnName: 'projectConnectedGraph'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/monitoring/project-config-graph',
            fnName: 'projectConfigGraph'
        })

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-networks/details',
            fnName: 'networksMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machines/details',
            fnName: 'virtualMachinesDetailsMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'networksMockStatData'
        });
        routes.push({
            url: '/api/tenants/get-project-role',
            fnName: 'empty'
        });
        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machine-interfaces/summary',
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
                "project-tabs": "project-networks"
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function () {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_NETWORK_GRID_ID,
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
                                dataParsers: {}
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
