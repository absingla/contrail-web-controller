/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite'
], function (cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite) {

    var moduleId = cttm.INSTANCES_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;
    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {
        var routes = [];

        /*
         /api/tenants/config/domains
         /api/tenants/config/projects                            need to add [done]
         /api/tenants/networks/default-domain:admin              need to add [done]
         /api/tenant/networking/virtual-machines/details?fqnUUID=ba710bf3-922d-4cda-bbb4-a2e2e76533bf&count=25&type=project  need  to add [POST request]  [done]
         /api/tenant/networking/stats [done]
         /api/tenant/networking/virtual-machine-interfaces/summary  need to add
         */

        routes.push({
            url: '/api/tenants/config/domains',
            fnName: 'domainsMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/stats',
            fnName: 'virtualMachinesMockStatData'
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
            url: '/api/tenants/projects/default-domain:admin',
            fnName: 'adminProjectMockData'
        });

         routes.push({
             url: '/api/tenants/networks/default-domain:admin',
             fnName: 'tenantsNetworkMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machines/details',
            fnName: 'virtualMachinesMockData'
        });

        routes.push({
            method: "POST",
            url: '/api/tenant/networking/virtual-machine-interfaces/summary',
            fnName: 'virtualMachinesInterfacesMockData'
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/InstanceListView.mock.data.js';

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
