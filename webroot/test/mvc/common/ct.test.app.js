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
        controllerTestAppPathObj ["controller-graph-config"]     = "common/ui/js/controller.graph.config";
        controllerTestAppPathObj ["controller-labels"]           = "common/ui/js/controller.labels";
        controllerTestAppPathObj ["controller-utils"]            = "common/ui/js/controller.utils";
        controllerTestAppPathObj ["controller-messages"]         = "common/ui/js/controller.messages";
        controllerTestAppPathObj ["controller-parsers"]          = "common/ui/js/controller.parsers";
        controllerTestAppPathObj ["controller-view-config"]      = "common/ui/js/controller.view.config";
        controllerTestAppPathObj ["controller-init"]             = "common/ui/js/controller.init";

        controllerTestAppPathObj ["test-slickgrid-utils"]        = "/base/contrail-web-core/webroot/test/mvc/common/co.test.utils";
        controllerTestAppPathObj ["mockdata-core-slickgrid"]     = "/base/contrail-web-core/webroot/test/mvc/common/co.test.mockdata";
        controllerTestAppPathObj ["test-slickgrid"]              = "/base/contrail-web-core/webroot/test/mvc/slickgrid/slickgrid.test.common";
        controllerTestAppPathObj ["test-nm-slickgrid-mockdata"]  = "monitor/networking/ui/test/ui/NetworkListViewMockData";
        controllerTestAppPathObj ["test-slickgrid-messages"]     = "test/mvc/common/ct.test.messages";

        /* Controller Test Utils Init*/
        controllerTestAppPathObj["ct-test-init"]                 = "test/mvc/common/ct.test.init";

        return controllerTestAppPathObj;
    };

    function getControllerTestAppMap(map) {
        return map;
    };

    function getControllerTestAppShim(shim) {
        return shim;
    };

});