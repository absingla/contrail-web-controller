/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'reports/qe/ui/js/qe.model.config',
    'reports/qe/ui/js/qe.constants',
    'text!reports/qe/ui/templates/qe.tmpl',
    'reports/qe/ui/js/qe.main'
], function (_, QEModelConfig, QEConstants, QETemplates) {
    qewmc = new QEModelConfig();
    qewc = new QEConstants();

    $("body").append(QETemplates);

    var initJSpath = pkgBaseDir + '/reports/qe/ui/js/qe.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});