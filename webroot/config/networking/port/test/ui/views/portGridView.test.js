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

    var testServerRoutes = function() {
        var routes = [];

        routes.push( {
            url: '/api/tenants/config/domains',
            fnName: 'portDomainsData'
        });
        routes.push({
            url: '/api/tenants/config/projects/default-domain',
            fnName: 'portPojectsData'
        });
        routes.push( {
            url:  '/api/tenants/config/get-config-uuid-list',
            fnName: 'portUUIDListData'
        });
        routes.push( {
            url: '/api/tenants/config/get-virtual-machine-details-paged',
            method : 'POST',
            fnName: 'portMockData'
        });

        routes.push({
            url: '/api/tenants/get-project-role',
            fnName: 'empty'
        });
        return routes;
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'config/networking/port/test/ui/views/portGridView.mock.data.js';
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
