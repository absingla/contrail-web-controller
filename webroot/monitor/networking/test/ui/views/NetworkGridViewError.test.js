/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/NetworkListView.mock.data',
    'co-grid-view-error-test-suite'
], function (cotc,cotr, cttu, cttm, TestMockdata, GridViewErrorTestSuite) {

    var moduleId = cttm.NETWORKS_GRID_VIEW_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    testServerConfig.getRoutesConfig = function() {
        var routesConfig = {
            mockDataFiles : {
                networkListViewMockDataFile: "monitor/networking/test/ui/views/NetworkListView.mock.data.js"
            },
            routes: []
        };

        routesConfig.routes.push({
            hits: 1,
            url: '/api/tenant/monitoring/alarms',
            response: {
                code: 200,
                data: "{}"
            }
        });

        routesConfig.routes.push({
            urlMatch: "/api/tenants/config/domains.*$",
            response: {
                data: "networkListViewMockDataFile.domains"
            }
        });

        routesConfig.routes.push({
            urlRegex: '/\/api\/tenants\/config\/projects\/default-domain.*$/',
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
                code: 404,
                data: ""
            }
        });

        return routesConfig;
    };

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
                    viewId: 'project-network-grid',
                    suites: [
                        {
                            class: GridViewErrorTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        };
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);

    return pageTestConfig;
});
