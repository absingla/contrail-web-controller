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
                this.nmView.renderProject({hashParams: hashParams});
                break;

            case 'renderNetworkList':
                this.nmView.renderNetworkList({hashParams: hashParams});
                break;

            case 'renderInstanceList':
                this.nmView.renderInstanceList({hashParams: hashParams});
                break;
        }
    },

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
