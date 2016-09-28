/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InstanceView.mock.data',
    'co-details-view-test-suite',
], function (cotc, cotr, cttu, cttm, TestMockdata, TabsViewTestSuite, DetailsViewTestSuite) {

    var moduleId = cttm.INSTANCE_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;
    
    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                instanceViewMockData: 'monitor/networking/test/ui/views/InstanceView.mock.data.js'
            },
            routes: []
        };
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/config/domains'),
            response: {data: 'instanceViewMockData.domainsMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/config/projects'),
            response: {data: 'instanceViewMockData.projectsMockData'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
            response: {data: '{}'}
        });
        routesConfig.routes.push( {
            urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain'),
            response: {data: 'instanceViewMockData.projectsMockData'}
        });
        routesConfig.routes.push( {
            urlRegex: cttu.getRegExForUrl('/api/tenants/networks/default-domain:demo'),
            response: {data: 'instanceViewMockData.demoProjectMockData'}
        });
        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/admin/reports/query'),
            response: {data: 'instanceViewMockData.reportsQueryMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
            response: {data: 'instanceViewMockData.virtualMachineMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine'),
            response: {data: 'instanceViewMockData.virtualMachineStatsMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/instance-connected-graph'),
            response: {data: 'instanceViewMockData.virtualMachineConnectedGraphMockData'}
        });
        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            response: {data: 'instanceViewMockData.networkingStatsMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/flow-series/vm'),
            response: {data: 'instanceViewMockData.virtualMachineFlowSeriesMockData'}
        });
        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            response: {data: 'instanceViewMockData.virtualMachineInterfacesMockData'}
        });
        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
            response: {data: 'instanceViewMockData.networkingStatsTopMockData'}
        });
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
            },
            "reload": "false",
            "tab": {
                "instance-tabs": "instance-details"
            }
        }
    };

    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.INSTANCE_DETAILS_ID,
                    suites: [
                        {
                            class: DetailsViewTestSuite,
                            groups: ['all'],
                            modelConfig: {
                                dataGenerator: cttu.commonDetailsDataGenerator
                            }
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
