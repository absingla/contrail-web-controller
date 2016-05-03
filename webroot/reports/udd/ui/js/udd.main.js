/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var uddLoader = new UDDashboardLoader();

function UDDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathUDDView = ctBaseDir + '/reports/udd/ui/js/views/UDDashboardView.js',
            pathModel = ctBaseDir + '/reports/udd/ui/js/models/widgetsCollection.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        require([pathUDDView, pathModel], function (UDDashboardView, WidgetsCollection) {
            self.model = {}
            self.model.userWidgets = new WidgetsCollection()
            self.uddView = new UDDashboardView(self.model);
            self.renderView(renderFn, hashParams);
            if (contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        });
    };
    this.renderView = function (renderFn, hashParams, view) {
        $(contentContainer).empty();
        switch (renderFn) {
            case 'renderNetworkingUDD':
                this.uddView.renderNetworkingUDD({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (currPageQueryStr) {
        var renderFn;

        this.load({hashParams: currPageQueryStr, 'function': renderFn});
    };

    this.destroy = function () {
        //TODO: Implement required destroy (if any)
    };
};
