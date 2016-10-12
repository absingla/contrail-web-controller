/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'controller-constants',
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InstanceView.mock.data',
    'co-tabs-view-test-suite'
], function (ctConstants, cotc, cotr, cttu, cttm, TestMockdata, TabsViewTestSuite) {

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
        
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                instanceViewMockData: 'monitor/networking/test/ui/views/InstanceView.mock.data.js'
            },
            routes: [
                {
                    hits: 1,
                    url: '/api/tenant/monitoring/alarms',
                    response: {
                        code: 200,
                        data: "{}"
                    }
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_DOMAINS),
                    response: {data: 'instanceViewMockData.domainsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_PROJECTS),
                    response: {data: 'instanceViewMockData.projectsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
                    response: {data: '{}'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/networks/default-domain:admin'),
                    response: {data: 'instanceViewMockData.adminProjectMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain'),
                    response: {data: 'instanceViewMockData.projectsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/networks/default-domain:demo'),
                    response: {data: 'instanceViewMockData.demoProjectMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
                    response: {data: 'instanceViewMockData.virtualMachineMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine'),
                    response: {data: 'instanceViewMockData.virtualMachineStatsMockData'}
                },
                {
                    urlRegex:cttu.getRegExForUrl('/api/tenant/monitoring/instance-connected-graph'),
                    response: {data: 'instanceViewMockData.virtualMachineConnectedGraphMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/admin/reports/query'),
                    response: {data: 'instanceViewMockData.reportsQueryMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/flow-series/vm'),
                    response: {data: 'instanceViewMockData.virtualMachineFlowSeriesMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
                    response: {data: 'instanceViewMockData.virtualMachineInterfacesMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
                    response: {data: 'instanceViewMockData.networkingStatsTopMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
                    response: {data: 'instanceViewMockData.networkingStatsMockData'}
                }
            ]
        };

        return routesConfig;
    };

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig, testInitFn);
    return pageTestConfig;

});
