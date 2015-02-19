/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var nmPageLoader = new NetworkMonitoringLoader();

function NetworkMonitoringLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathMNView = rootDir + '/js/views/MonitorNetworkingView.js',
            renderFn = paramObject['function'];

        check4CTInit(function () {
            if (self.nmView == null) {
                requirejs([pathMNView], function (nmView) {
                    self.nmView = new nmView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
        });
    };
    this.renderView = function (renderFn, hashParams) {
        switch (renderFn) {
            case 'renderProject':
                if (hashParams.view == "details") {
                    this.nmView.renderProject({hashParams: hashParams});
                } else {
                    this.nmView.renderProject({hashParams: hashParams});
                }
                break;

            case 'renderNetworks':
                if (hashParams.view == "details") {

                    this.nmView.renderNetwork({hashParams: hashParams});
                } else {
                    this.nmView.renderNetworkList({hashParams: hashParams});
                }
                break;

            case 'renderInstanceList':
                if (hashParams.view == "details") {
                    this.nmView.renderInstanceList({hashParams: hashParams});
                } else {
                    this.nmView.renderInstanceList({hashParams: hashParams});
                }
                break;
        }
    },

    this.updateViewByHash = function (hashObj, lastHashObj) {

        if(hashObj.type == "network"){
            renderFn = "renderNetworks";
        } else if (hashObj.type == "project"){
            renderFn = "renderProject"
        } else if (hashObj.type == "network"){
            renderFn = "renderInstanceList"
        }
        this.load({hashParams: hashObj, 'function': renderFn});
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
