/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-chart-view-zoom-scatter-test-suite',
], function (cotc, cotr, cttu, cttm, ZoomScatterChartViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

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
            url: '/api/tenants/get-project-role',
            fnName: 'empty'
        });
        routes.push({
            url: '/api/tenants/projects/default-domain',
            fnName: 'projectMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenants/networks/default-domain:admin',
            fnName: 'networksForAdminProjectMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend',
            fnName: 'networkSummaryForFrontEndNetworkMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend',
            fnName: 'flowSeriesForFrontendVNMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend',
            fnName: 'networkStatsForFrontendVNMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend',
            fnName: 'networkConnectedGraphForFrontEndNetworkMockData'
        });

        routes.push({
            method: "GET",
            url: '/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend',
            fnName: 'networkConfigGraphForFrontEndNetworkMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn',
            fnName: 'virtualMachineDetailsByUUIDMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machines/summary',
            fnName: 'virtualMachinesSummaryMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machine-interfaces/summary',
            fnName: 'virtualMachinesInterfacesMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'virtualMachinesStatsMockData'
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/NetworkView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            view: 'details',
            type: 'network',
            "focusedElement": {
                "fqName": "default-domain:admin:frontend",
                "type": "virtual-network"
            },
            tab: {
                "network-tabs": "network-port-distribution"
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function () {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.NETWORK_PORT_DIST_ID,
                    suites: [
                        {
                            class: ZoomScatterChartViewTestSuite,
                            groups: ['all']
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
            cotc.PAGE_INIT_TIMEOUT * 20
        );

        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;
});
