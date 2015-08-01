/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-utils',
    'network-list-view-mockdata',
    'test-messages',
], function (TestUtils, TestMockdata, TestMessages) {
    var self = this;
    module(TestMessages.NETWORKS_GRID_MODULE, {
        setup: function () {
            self.server = TestUtils.getFakeServer({autoRespondAfter: 400});

            $.ajaxSetup({
                cache: true
            });
        },
        teardown: function () {
            self.server.restore();
            delete self.server;
        }
    });

    self.commonTestDataConfig = [
        {
            id: 'project-network-grid',
            type: cotc.TYPE_GRID_VIEW_TEST,
            tests: [
                {
                    testSuite: cotc.GRID_VIEW_DATAVIEW_TEST,
                    dataParsers: {
                        gridDataParseFn: deleteSizeField,
                        mockDataParseFn: deleteSizeField
                    },
                    testCases: 'all'
                },
                {
                    testSuite: cotc.GRID_VIEW_GRID_TEST,
                    testCases: 'all'
                }
            ]
        }
    ];

    function deleteSizeField(dataArr) {
        _.each(dataArr, function(data) {
            if (contrail.checkIfExist(data.size)) {
                delete data.size;
            }
        });
        return dataArr;
    }

    asyncTest(TestMessages.TEST_LOAD_NETWORKS_GRID, function (assert) {
        expect(0);
        var hashParams = {
            p: 'mon_networking_networks',
            q: {
                view: 'list',
                type: 'network'
            }
        };
        loadFeature(hashParams);
        contentHandler.featureAppDefObj.done(function () {
            var fakeServer = self.server;

            fakeServer.respondWith( "GET", TestUtils.getRegExForUrl(ctwc.URL_ALL_DOMAINS), [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.domainsMockData)]);
            fakeServer.respondWith( "GET", /\/api\/tenants\/projects\/default-domain.*$/, [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.projectMockData)]);
            fakeServer.respondWith( "POST", TestUtils.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS), [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockData)]);
            fakeServer.respondWith( "POST", TestUtils.getRegExForUrl(ctwc.URL_VM_VN_STATS), [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockStatData)]);

            setTimeout(function() {
                var mockDataDefObj = $.Deferred();
                var rootViewObj = mnPageLoader.mnView;

                //create and update mock data in test config
                TestUtils.createMockData(rootViewObj, self.commonTestDataConfig, mockDataDefObj);

                $.when(mockDataDefObj).done(function() {
                    TestUtils.executeCommonTests(self.commonTestDataConfig);
                    QUnit.start();
                });
            }, 2000);
        });
    });
});