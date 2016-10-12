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
    'co-chart-view-zoom-scatter-test-suite',
    'network-list-view-custom-test-suite'
], function (ctConstants, cotc, cotr, cttu, cttm,
             GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite,
             CustomTestSuite) {

    var moduleId = cttm.NETWORKS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles : {
                networkListViewMockDataFile: "monitor/networking/test/ui/views/NetworkListView.mock.data.js"
            },
            routes: []
        };

        /**
         * Routes Definition for NetworkListView
         * routes = array of route objects
         * route = {
         *      method: //HTTP method. GET/POST
         *      hits: // Number of times the url will send a response.
         *      url: // url string to match
         *      urlMatch: // string to generate a RegExp match
         *      urlRegexp: // a RegExp made toString()
         *      response: {
         *         data: // data payload to be used while responding. define of the form mockDataFileKey.mockDataAttr
         *              // file key must be defined in the mockDataFiles.
         *         code: // response code to be sent
         *     }
         * }
         */
        routesConfig.routes.push({
            hits: 1,
            url: '/api/tenant/monitoring/alarms',
            response: {
                code: 200,
                data: "{}"
            }
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_DOMAINS),
            response: {
                data: "networkListViewMockDataFile.domains"
            }
        });

        routesConfig.routes.push({
            urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_PROJECTS),
            response: {
                data: "networkListViewMockDataFile.projectDomain"
            }
        });

        routesConfig.routes.push({
            urlRegex: '/\/api\/tenants\/get-project-role.*$/',
            response: {
                data: "{}"
            }
        });

        routesConfig.routes.push({
            urlRegex: '/\/api\/tenants\/networks\/default-domain:admin.*$/',
            response: {
                data: "networkListViewMockDataFile.projects"
            }
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: '/\/api\/tenant\/networking\/virtual-networks\/details\?.*$/',
            response: {
                data: "networkListViewMockDataFile.networks"
            }
        });

        routesConfig.routes.push({
            method: "POST",
            urlRegex: '/\/api\/tenant\/networking\/stats.*$/',
            response: {
                data: "networkListViewMockDataFile.networksStat"
            }
        });

        return routesConfig;
    }

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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);

    return pageTestConfig;
});
