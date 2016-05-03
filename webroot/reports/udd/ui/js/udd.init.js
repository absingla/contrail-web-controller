/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

define([
    'underscore',
    'reports/udd/ui/js/udd.main'
], function (_) {

    var initJSpath = pkgBaseDir + '/reports/udd/ui/js/udd.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if (contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
