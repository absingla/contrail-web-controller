/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

require(["/base/contrail-web-core/webroot/js/core-app-config.js"], function() {
    requirejs.config({
        baseUrl    : "/base/contrail-web-controller/webroot",
        paths      : getControllerTestAppPaths(coreAppPaths),
        map        : getControllerTestAppMap(coreAppMap),
        shim       : getControllerTestAppShim(coreAppShim),
        waitSeconds: 0
    });

    require(['ct-test-init'], function() {});

    function getControllerTestAppPaths(paths) {
        var coreBasePath = "/base/contrail-web-core/webroot", controllerTestAppPathObj = {};
        for (var key in paths) {
            if (paths.hasOwnProperty(key)) {
                var value = paths[key];
                if (key == 'core-basedir') {
                    controllerTestAppPathObj [key] = coreBasePath;
                } else {
                    controllerTestAppPathObj [key] = coreBasePath + value;
                }
            }
        }

        /* Controller Init*/

        controllerTestAppPathObj ["controller-basedir"]          = "/base/contrail-web-controller/webroot";

        controllerTestAppPathObj ["controller-constants"]        = "common/ui/js/controller.constants";
        controllerTestAppPathObj ["controller-grid-config"]      = "common/ui/js/controller.grid.config";
        controllerTestAppPathObj ["nm-grid-config"]              = "monitor/networking/ui/js/nm.grid.config";
        controllerTestAppPathObj ["controller-graph-config"]     = "common/ui/js/controller.graph.config";
        controllerTestAppPathObj ["nm-graph-config"]             = "monitor/networking/ui/js/nm.graph.config";
        controllerTestAppPathObj ["controller-labels"]           = "common/ui/js/controller.labels";
        controllerTestAppPathObj ["controller-utils"]            = "common/ui/js/controller.utils";
        controllerTestAppPathObj ["controller-messages"]         = "common/ui/js/controller.messages";
        controllerTestAppPathObj ["controller-parsers"]          = "common/ui/js/controller.parsers";
        controllerTestAppPathObj ["controller-view-config"]      = "common/ui/js/controller.view.config";
        controllerTestAppPathObj ["nm-view-config"]              = "monitor/networking/ui/js/nm.view.config";
        controllerTestAppPathObj ["controller-init"]             = "common/ui/js/controller.init";

        controllerTestAppPathObj ["co-test-utils"]               = "/base/contrail-web-core/webroot/test/ui/co.test.utils";
        controllerTestAppPathObj ["mockdata-core-slickgrid"]     = "/base/contrail-web-core/webroot/test/ui/co.test.mockdata";
        controllerTestAppPathObj ["test-slickgrid"]              = "/base/contrail-web-core/webroot/test/ui/slickgrid.test.common";
        controllerTestAppPathObj ["network-list-view-mockdata"]  = "monitor/networking/ui/test/ui/NetworkListViewMockData";
        controllerTestAppPathObj ["test-messages"]               = "test/ui/ct.test.messages";

        controllerTestAppPathObj["ct-test-init"]                 = "test/ui/ct.test.init";

        return controllerTestAppPathObj;
    };

    function getControllerTestAppMap(map) {
        return map;
    };

    function getControllerTestAppShim(shim) {
        return shim;
    };

});