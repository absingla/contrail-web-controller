/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
window.uddLoader = new UDDashboardLoader()

function UDDashboardLoader () {
    this.load = function (paramObject) {
        var self = this
        var UDDViewPath = window.ctBaseDir + 'reports/udd/ui/js/views/UDDashboardView.js'
        var UDDModelPath = window.ctBaseDir + 'reports/udd/ui/js/models/WidgetsCollection.js'
        var loadingStartedDefObj = paramObject.loadingStartedDefObj
        var widgetsUrl = '/api/udd/widget/'

        self.hashParams = paramObject.hashParams

        require([UDDViewPath, UDDModelPath], function (UDDView, WidgetsCollection) {
            self.widgets = new WidgetsCollection(null, {url: widgetsUrl})
            self.uddView = new UDDView({model: self.widgets})
            self.widgets.fetch().done(self.uddView.render.bind(self.uddView))

            if (window.contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        })
    }
}
