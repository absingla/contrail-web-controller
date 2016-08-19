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
    'co-chart-view-zoom-scatter-test-suite',
    'network-list-view-custom-test-suite'
], function (cotc,cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite,
             CustomTestSuite) {

    var moduleId = cttm.NETWORKS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testServerRoutes = function() {

        var routes = [];

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/config/domains').toString(),
            fnName: 'domainsMockData'
        });

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/config/projects/default-domain').toString(),
            fnName: 'projectDomainMockData'
        });

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/get-project-role').toString(),
            fnName: 'empty'
        });
        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/networks/default-domain:admin').toString(),
            fnName: 'projectMockData'
        });
        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details').toString(),
            fnName: 'networksMockData'
        });
        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats').toString(),
            fnName: 'networksMockStatData'
        });

        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile =  'monitor/networking/test/ui/views/NetworkListView.mock.data.js';

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            view: 'list',
            type: 'network'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.NETWORKS_PORTS_SCATTER_CHART_ID,
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: 'project-network-grid',
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
                                    mockDataParseFn: cttu.deleteFieldsForNetworkListViewScatterChart,
                                    gridDataParseFn: cttu.deleteFieldsForNetworkListViewScatterChart
                                }
                            }
                        },
                        {
                            class: CustomTestSuite,
                            groups: ['all']
                        },
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
