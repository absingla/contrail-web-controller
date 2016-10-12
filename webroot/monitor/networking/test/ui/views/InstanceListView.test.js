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
    'co-chart-view-zoom-scatter-test-suite'
], function (ctConstants, cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite) {

    var moduleId = cttm.INSTANCES_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;
    
    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                instanceListViewMockData: 'monitor/networking/test/ui/views/InstanceListView.mock.data.js'
            },
            routes: []
        };
        
        /*
         /api/tenants/config/domains
         /api/tenants/config/projects                            need to add [done]
         /api/tenants/networks/default-domain:admin              need to add [done]
         /api/tenant/networking/virtual-machines/details?fqnUUID=ba710bf3-922d-4cda-bbb4-a2e2e76533bf&count=25&type=project  need  to add [POST request]  [done]
         /api/tenant/networking/stats [done]
         /api/tenant/networking/virtual-machine-interfaces/summary  need to add
         */

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_DOMAINS),
            response:  {data: 'instanceListViewMockData.domainsMockData'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            response:  {data: 'instanceListViewMockData.virtualMachinesMockStatData'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_PROJECTS),
            response:  {data: 'instanceListViewMockData.projectsMockData'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
            response:  {data: '{}'}
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain:admin'),
            response:  {data: 'instanceListViewMockData.adminProjectMockData'}
        });

         routesConfig.routes.push({
             urlRegex: cttu.getRegExForUrl('/api/tenants/networks/default-domain:admin'),
             response:  {data: 'instanceListViewMockData.tenantsNetworkMockData'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
            response:  {data: 'instanceListViewMockData.virtualMachinesMockData'}
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            response:  {data: 'instanceListViewMockData.virtualMachinesInterfacesMockData'}
        });

        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_instances',
        q: {
            view: 'list',
            type: 'instance',
            project: 'default-domain:admin'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'instances-cpu-mem-chart',
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: 'project-instance-grid',
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        /**
                         * TODO issue with grid rows inconsistent wrt mockdata.
                         * only 1 row with second data item gets loaded in grid sometimes.*/
                        //{
                        //    class: GridListModelTestSuite,
                        //    groups: ['all'],
                        //    modelConfig: {
                        //        dataGenerator: cttu.commonGridDataGenerator,
                        //        dataParsers: {
                        //            mockDataParseFn: cttu.deleteFieldsForInstanceListViewScatterChart,
                        //            gridDataParseFn: cttu.deleteFieldsForInstanceListViewScatterChart
                        //        }
                        //    }
                        //}
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;
});
