/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InterfaceListView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite) {

    var moduleId = cttm.INTERFACES_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {
        var routes = [];
        /*
            /api/tenants/config/domains
            /api/tenants/config/projects
            /api/tenants/networks/default-domain:admin
            /api/tenant/networking/stats
            /api/tenant/networking/virtual-machine-interfaces/summary
        */

        routes.push({
            url: '/api/tenants/config/domains',
            fnName: 'domainsMockData'
        });
        routes.push({
            url: '/api/tenants/config/projects',
            fnName: 'projectMockData'
        });
        routes.push({
            url: '/api/tenants/get-project-role',
            fnName: 'empty'
        });
        routes.push({
            url: '/api/tenants/networks/default-domain:admin',
            fnName: 'adminProjectMockData'
        });
        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'interfacesMockStatData'
        });
        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machine-interfaces/summary',
            fnName: 'virtualMachinesInterfacesMockData'
        });
        return routes;
    };
    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/InterfaceListView.mock.data.js';;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_interfaces',
        q: {
            view: 'list',
            type: 'interface'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'interfaces-traffic-throughput-chart',
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: 'interface-grid',
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;
});
