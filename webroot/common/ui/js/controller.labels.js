/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTLabels = function () {
        this.get = function (key) {
            var keyArray, newKey;
            if (_.has(labelMap, key)) {
                return labelMap[key];
            } else {
                keyArray = key.split('.');
                newKey = keyArray[keyArray.length - 1];
                if (keyArray.length > 1 && _.has(labelMap, newKey)) {
                    return labelMap[newKey];
                } else {
                    return newKey.charAt(0).toUpperCase() + newKey.slice(1);
                }
            }
        };

        this.getInLowerCase = function (key) {
            var label = this.get(key);
            return label.toLowerCase();
        };

        this.getInUpperCase = function (key) {
            var label = this.get(key);
            return label.toUpperCase();
        };

        this.getFirstCharUpperCase = function (key) {
            var label = this.get(key);

            label = label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            return label;
        };

        var labelMap = {};

        this.MONITOR_PROJECTS_ID = "monitor-projects";
        this.PROJECTS_GRAPH_ID = "projects-visualization";
        this.PROJECTS_TABS_ID = "projects-tabs";
        this.PROJECTS_PORT_DIST_ID = "projects-port-distribution";
        this.PORT_DIST_CHART_ID = "port-distribution-chart";
        this.PROJECT_NETWORKS_ID = "project-networks";
        this.PROJECT_INSTANCES_ID = "project-instances";

        this.TITLE_PORT_DISTRIBUTION = "Port Distribution";
        this.TITLE_NETWORKS = "Networks";
        this.TITLE_INSTANCES = "Instances";
        this.TITLE_NETWORKS_SUMMARY = "Networks Summary";
        this.TITLE_INSTANCES_SUMMARY = "Instances Summary";

        this.X_AXIS_TITLE_PORT = "Port";
        this.Y_AXIS_TITLE_BW = "Bandwidth";
    };
    return CTLabels;
});