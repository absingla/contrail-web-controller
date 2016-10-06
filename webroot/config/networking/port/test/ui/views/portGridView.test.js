/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.PORT_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles: {
                portGridViewMockData: 'config/networking/port/test/ui/views/portGridView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/domains'),
                    response: {data: 'portGridViewMockData.portDomainsData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
                    response: {data: 'portGridViewMockData.portPojectsData'}
                },
                {
                    urlRegex:  cttu.getRegExForUrl('/api/tenants/config/get-config-uuid-list'),
                    response: {data: 'portGridViewMockData.portUUIDListData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/config/get-virtual-machine-details-paged'),
                    method : 'POST',
                    response: {data: 'portGridViewMockData.portMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
                    response: {data: '{}'}
                }
            ]
        };
        
        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_net_ports'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configPortLoader.portView,
            tests: [
                {
                    viewId: ctwc.PORT_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);

    return pageTestConfig;
});
