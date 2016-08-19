/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InstanceView.mock.data',
    'co-chart-view-line-bar-test-suite',
], function (cotc, cotr, cttu, cttm, TestMockdata, LineBarChartViewTestSuite) {

    var moduleId = cttm.INSTANCE_VIEW_COMMON_TEST_MODULE;

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

        routes.push( {
            url: '/api/tenants/projects/default-domain',
            fnName: 'projectMockData'
        });
        routes.push( {
            url: '/api/tenants/networks/default-domain:demo',
            fnName: 'demoProjectMockData'
        });
        routes.push({
            url: '/api/tenant/networking/virtual-machines/details',
            fnName: 'virtualMachineMockData'
        });
        routes.push({
            url: '/api/tenant/networking/virtual-machine',
            fnName: 'virtualMachineStatsMockData'
        });
        routes.push({
            url: '/api/tenant/monitoring/instance-connected-graph',
            fnName: 'virtualMachineConnectedGraphMockData'
        });
        routes.push({
            method: "POST",
            url: '/api/admin/reports/query',
            fnName: 'reportsQueryMockData'
        });
        routes.push({
            url: '/api/tenant/networking/flow-series/vm',
            fnName: 'virtualMachineFlowSeriesMockData'
        });
        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machine-interfaces/summary',
            fnName: 'virtualMachineInterfacesMockData'
        });
        routes.push({
            url: '/api/tenant/networking/network/stats/top',
            fnName: 'networkingStatsTopMockData'
        });
        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'networkingStatsMockData'
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile =  'monitor/networking/test/ui/views/InstanceView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();

    pageConfig.hashParams = {
        p: 'mon_networking_instances',
        q: {
            view: 'details',
            type: 'instance',
            "focusedElement": {
                "fqName": "default-domain:demo:st_vn101",
                "type": "virtual-machine",
                "uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                "vmName": "st_vn101_vm21"
            },
            "reload": "false",
            "tab": {
                "instance-tabs": "instance-cpu-mem-stats"
            }
        }
    };

    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.INSTANCE_CPU_MEM_STATS_ID,
                    suites: [
                        {
                            class: LineBarChartViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

    };

    var testInitFn = function(defObj, onAllViewsRenderComplete) {

        setTimeout(function() {
                /**
                 * Tabs are already rendered so by default the event will not get fired.
                 * call the notify once tabs are activated.
                 */
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
