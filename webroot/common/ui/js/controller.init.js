/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'joint.contrail',
    'controller-constants',
    'controller-labels',
    'controller-utils',
    'controller-messages',
    'controller-grid-config',
    'controller-graph-config',
    'controller-parsers',
    'controller-view-config'
], function (Joint, Constants, Labels, Utils, Messages, GridConfig, GraphConfig, Parsers, ViewConfig) {
    joint = Joint;
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new Utils;
    ctwm = new Messages();
    ctwgc = new GridConfig();
    ctwgrc = new GraphConfig();
    ctwp = new Parsers();
    ctwvc = new ViewConfig();

    var deferredObj = contentHandler.initFeatureAppDefObjMap[FEATURE_PCK_WEB_CONTROLLER];

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
