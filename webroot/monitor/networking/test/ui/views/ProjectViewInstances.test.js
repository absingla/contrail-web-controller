/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/ProjectView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testServerConfig = cotr.getDefaultTestServerConfig();

    var testType = cotc.VIEW_TEST;

    var testServerRoutes = function() {
        var routes = [];

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/config/domains').toString(),
            fnName: 'domainsMockData'
        });

        routes.push( {
            url: cttu.getRegExForUrl('/api/tenants/config/projects').toString(),
            fnName: 'projectMockData'
        });

        routes.push( {
            url: cttu.getRegExForUrl('/api/tenants/projects/default-domain').toString(),
            fnName: 'projectMockData'
        });

        routes.push({
            url: cttu.getRegExForUrl('/api/tenants/get-project-role').toString(),
            fnName: 'empty'
        });

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top').toString(),
            fnName: 'portDistributionMockData'
        });

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph').toString(),
            fnName: 'projectConnectedGraph'
        });

        routes.push({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph').toString(),
            fnName: 'projectConfigGraph'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details').toString(),
            fnName: 'networksMockData'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details').toString(),
            fnName: 'virtualMachinesDetailsMockData'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats').toString(),
            fnName: 'networksMockStatData'
        });

        routes.push({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary').toString(),
            fnName: 'virtualMachinesSummaryMockData'
        });
            return routes;
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
                "project-tabs": "project-instances"
            },
            "reload": "false"
        }
    };

    testServerConfig.getRoutesConfig = testServerRoutes;
    testServerConfig.responseDataFile = 'monitor/networking/test/ui/views/ProjectView.mock.data.js';
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_INSTANCE_GRID_ID,
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

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType,testServerConfig, pageConfig, getTestConfig);
    return pageTestConfig;

});
