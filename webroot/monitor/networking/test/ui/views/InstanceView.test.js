/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InstanceView.mock.data',
    'co-tabs-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, TabsViewTestSuite) {

    var moduleId = cttm.INSTANCE_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;
    var testServerConfig = cotr.getDefaultTestServerConfig();

        /**
         URIs
         /api/tenants/config/domains [done]
         /api/tenants/config/projects [done
         /api/tenants/projects/default-domain [done]
         /api/tenants/networks/default-domain:demo [done]
         /api/tenant/networking/virtual-machine [done]
         /api/tenant/monitoring/instance-connected-graph [done]
         /api/tenant/networking/virtual-machine-interfaces/summary [done]
         /api/tenant/networking/flow-series/vm [done]
         /api/tenant/networking/network/stats/top [done]
         /api/tenant/networking/stats [done]
         */
        
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
            url: '/api/tenants/networks/default-domain:admin',
            fnName: 'adminProjectMockData'
        });

        routes.push( {
            url: '/api/tenants/projects/default-domain',
            fnName: 'projectMockData'
        });

        routes.push({
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
            url:'/api/tenant/monitoring/instance-connected-graph',
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
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    /**
     * Test cases for components in each project tab will be tested in their respective tab pages.
     */
    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                 {
                    viewId: ctwl.INSTANCE_TABS_ID,
                    suites: [
                        {
                            class: TabsViewTestSuite,
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
            cotc.PAGE_INIT_TIMEOUT * 10
        );

        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;

});
