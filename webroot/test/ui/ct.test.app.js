/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var coreBaseDir = "/base/contrail-web-core/webroot",
    ctBaseDir = "/base/contrail-web-controller/webroot",
    pkgBaseDir = ctBaseDir,
    featurePkg = 'webController';

var ctwu, ctwc, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc;

require([
    coreBaseDir + '/js/core-app-utils.js',
    coreBaseDir + '/test/ui/js/co.test.app.utils.js'
], function () {

    requirejs.config({
        baseUrl: ctBaseDir,
        paths: getControllerTestAppPaths(coreBaseDir),
        map: coreAppMap,
        shim: coreAppShim,
        waitSeconds: 0
    });

    require(['co-test-init'], function () {
        setFeaturePkgAndInit(featurePkg);
    });

    function getControllerTestAppPaths(coreBaseDir) {
        var controllerTestAppPathObj = {};

        var coreAppPaths = getCoreAppPaths(coreBaseDir);
        var coreTestAppPaths = getCoreTestAppPaths(coreBaseDir);

        for (var key in coreAppPaths) {
            if (coreAppPaths.hasOwnProperty(key)) {
                var value = coreAppPaths[key];
                controllerTestAppPathObj[key] = value;
            }
        }

        for (var key in coreTestAppPaths) {
            if (coreTestAppPaths.hasOwnProperty(key)) {
                var value = coreTestAppPaths[key];
                controllerTestAppPathObj[key] = value;
            }
        }

        controllerTestAppPathObj["network-list-view-mockdata"] = ctBaseDir + "/monitor/networking/ui/test/ui/NetworkListViewMockData";
        controllerTestAppPathObj["test-messages"] = ctBaseDir + "/test/ui/ct.test.messages";

        return controllerTestAppPathObj;
    };

});