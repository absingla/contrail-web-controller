/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var projectsPageLoader = new ProjectsPageLoader();

function ProjectsPageLoader() {
    this.load = function (paramObject) {
        var currMenuObj = globalObj.currMenuObj,
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathClustersView = rootDir + '/js/views/ProjectsView.js',
            hashParams = paramObject['hashParams'];

        check4CTInit(function () {
            requirejs([pathClustersView], function (ProjectsView) {
                var projectsView = new ProjectsView();
                projectsView.render({hashParams: hashParams});
            });
        });
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };
    this.destroy = function () {
    };
};

function check4CTInit(callback) {
    if (!ctInitComplete) {
        requirejs(['controller-init'], function () {
            ctInitComplete = true;
            callback()
        });
    } else {
        callback();
    }
};