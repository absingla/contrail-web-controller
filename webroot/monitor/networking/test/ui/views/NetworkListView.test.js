/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'network-list-view-mock-data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite',
    'network-list-view-custom-test-suite'
], function (cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite,
             CustomTestSuite) {

    var moduleId = cttm.NETWORKS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/projects\/default-domain.*$/,
            body: JSON.stringify(TestMockdata.projectMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS),
            body: JSON.stringify(TestMockdata.networksMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            body: JSON.stringify(TestMockdata.networksMockStatData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            view: 'list',
            type: 'network'
        }
    };
    pageConfig.loadTimeout = 2000;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.NETWORKS_PORTS_SCATTER_CHART_ID,
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        }
                    ]
                },
                {
                    viewId: 'project-network-grid',
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        },
                        {
                            class: GridListModelTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW,
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
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        },
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});