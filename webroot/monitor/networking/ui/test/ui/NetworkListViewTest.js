/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'monitor/networking/ui/js/views/MonitorNetworkingView',
    'co-test-utils',
    'network-list-view-mockdata',
    'test-slickgrid'
], function (MonitorNetworkingView, TestUtils, TestMockdata, TestSlickGrid) {
    module('Networks Grid -  NM Tests', {
        setup: function () {
            this.server = sinon.fakeServer.create();
            $.ajaxSetup({
                cache: true
            });
        },
        teardown: function () {
            this.server.restore();
            delete this.server;
        }
    });

    var monitorNetworkingView = new MonitorNetworkingView();

    asyncTest("Test Load Networks Grid", function (assert) {
        expect(0);
        var fakeServer = this.server,
            testConfigObj = {
                'prefixId': 'project-network-grid',
                'cols': ctwgc.projectNetworksColumns,
                'addnCols': ['detail'],
                'gridElId': '#' + ctwl.PROJECT_NETWORK_GRID_ID
            };
        fakeServer.respondWith(
            "POST", TestUtils.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS),
            [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockData)]);
        fakeServer.respondWith(
            "POST", TestUtils.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockStatData)]);

        mnPageLoader.renderView('renderNetworks', {
            "view": "list",
            "type": "network",
            "source": "uve"
        }, monitorNetworkingView);
        fakeServer.respond();
        TestUtils.startQunitWithTimeout(3000);

        TestSlickGrid.executeSlickGridTests(ctwl.PROJECT_NETWORK_GRID_ID, TestMockdata.networksMockData, testConfigObj);
    });
});