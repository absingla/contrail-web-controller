/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'controller-constants',
    'controller-grid-config',
    'controller-labels',
    'controller-utils',
    'controller-messages'
], function (_, Constants, GridConfig, Labels, CTUtils, Messages) {
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new CTUtils;
    ctwm = new Messages();
    ctwgc = new GridConfig();
    initCTWebCache();
});

function initCTWebCache() {};