/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'controller-constants',
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/ProjectView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (ctConstants, cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var testServerConfig = cotr.getDefaultTestServerConfig();
    testServerConfig.getRoutesConfig = function () {
        var routesConfig = {
            mockDataFiles: {
                projectViewMockData: 'monitor/networking/test/ui/views/ProjectView.mock.data.js'
            },
            routes: [
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_DOMAINS),
                    response: {data: 'projectViewMockData.domainsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl(ctConstants.URL_ALL_PROJECTS),
                    response: {data: 'projectViewMockData.projectsMockData'}
                },
                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/projects/default-domain'),
                    response: {data: 'projectViewMockData.projectsMockData'}
                },

                {
                    urlRegex: cttu.getRegExForUrl('/api/tenants/get-project-role'),
                    response: {data: '{}'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
                    response: {data: 'projectViewMockData.portDistributionMockData'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph'),
                    response: {data: 'projectViewMockData.projectConnectedGraph'}
                },
                {
                    method: "GET",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph'),
                    response: {data: 'projectViewMockData.projectConfigGraph'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details'),
                    response: {data: 'projectViewMockData.networksMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
                    response: {data: 'projectViewMockData.virtualMachinesDetailsMockData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/stats'),
                    response: {data: 'projectViewMockData.networksMockStatData'}
                },
                {
                    method: "POST",
                    urlRegex: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
                    response: {data: 'projectViewMockData.virtualMachinesSummaryMockData'}
                }
            ]
        };

        return routesConfig;
    };

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_projects',
        q: {
            view: 'details',
            type: 'project',
            "focusedElement": {
                "fqName": "default-domain:admin",
                "type": "project"
            },
            "tab": {
                "project-tabs": "project-interfaces"
            },
            "reload": "false"
        }
    };

    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_INTERFACE_GRID_ID,
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
                                dataParsers: {}
                            }
                        }
                    ]
                }
            ]
        } ;

    };

    /**
     * testInitFn is not truly required here as tab will be activated via URL on page load.
     * implementing this function can add some timeout till the QUnit can be fired.
     * manually notify the renderComplete event as rootView will not trigger one in this case as all views
     * are already rendered.
     * @param defObj
     * @param renderComplete
     */
    var testInitFn = function(defObj, renderComplete) {
        setTimeout(function() {
            renderComplete.notify();
            defObj.resolve();
        }, cotc.PAGE_INIT_TIMEOUT * 10);

        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
