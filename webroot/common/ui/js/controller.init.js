/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'controller-constants',
    'controller-labels',
    'controller-utils',
    'controller-messages',
    'controller-grid-config',
    'nm-grid-config',
    'controller-graph-config',
    'nm-graph-config',
    'controller-parsers',
    'controller-view-config',
    'nm-view-config'
], function (_, Constants, Labels, Utils, Messages, GridConfig, NMGridConfig, GraphConfig, NMGraphConfig, Parsers, ViewConfig, NMViewConfig) {
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new Utils;
    ctwm = new Messages();
    ctwgc = new GridConfig();
    nmwgc = new NMGridConfig();
    ctwgrc = new GraphConfig();
    nmwgrc = new NMGraphConfig();
    ctwp = new Parsers();
    ctwvc = new ViewConfig();
    nmwvc = new NMViewConfig();
    ctInitComplete = true;
});