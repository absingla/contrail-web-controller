/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var uddLoader = new UDDashboardLoader();


function UDDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            UDDViewPath = ctBaseDir + 'reports/udd/ui/js/views/UDDashboardView.js',
            UDDModelPath = ctBaseDir + 'reports/udd/ui/js/models/WidgetsCollection.js',
            loadingStartedDefObj = paramObject['loadingStartedDefObj'],
            widgetsUrl = '/api/udd/widget/';

        self.hashParams = paramObject['hashParams']

        require([UDDViewPath, UDDModelPath], function (UDDView, WidgetsCollection) {
            self.widgets = new WidgetsCollection(null, {url: widgetsUrl})
            self.uddView = new UDDView({model: self.widgets})
            self.widgets.fetch().done(self.uddView.render.bind(self.uddView))

            if (contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        })
    }
};
