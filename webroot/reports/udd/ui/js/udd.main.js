/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var uddLoader = new UDDashboardLoader();


function UDDashboardLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            UDDViewPath = ctBaseDir + '/reports/udd/ui/js/views/GridStackView.js',
            UDDModelPath = ctBaseDir + '/reports/udd/ui/js/models/WidgetsCollection.js',
            loadingStartedDefObj = paramObject['loadingStartedDefObj'],
            widgetsUrl = '/api/udd/widget/'

        self.hashParams = paramObject['hashParams'],
        //TODO should it be in hashParams?
        self.hashParams.dashboard = layoutHandler.getURLHashObj().p.split('_').slice(-1).pop()

        require([UDDViewPath, UDDModelPath], function (LayoutView, WidgetsCollection) {
            self.allWidgets = new WidgetsCollection(null, {url: widgetsUrl})
            self.visibleWidgets = new WidgetsCollection(null, {url:  widgetsUrl})
            self.layoutView = new LayoutView({model: self.visibleWidgets})
            self.allWidgets.fetch().done(self.onDataLoaded.bind(self))

            if (contrail.checkIfExist(loadingStartedDefObj)) {
                loadingStartedDefObj.resolve();
            }
        })
    }

    // on results fetched get all dashboards and tabs from collection of all widgets by user
    // And render subset of widgets defined by first or specified by url dashboard and tab
    this.onDataLoaded = function () {
        var self = this
        self.dashboards = self.allWidgets.pluck('dashboardId')
        self.tabs = self.allWidgets.pluck('tabId')

        // TODO render dashboards in menu

        // get dashboard and tab ids from url params / loaded widgets or generate default
        var currentDashboard = self.hashParams.dashboard || self.dashboards[0] || 'udd0'
        var currentTab = self.hashParams.tab || self.tabs[0] || 'tab1'
        self.layoutView.render({
            dashboardId: currentDashboard,
            tabId: currentTab,
        })

        var filteredWidgets = self.allWidgets.filter(function (model) {
            return model.get('dashboardId') === currentDashboard
        })
        self.visibleWidgets.set(filteredWidgets)
    }

    this.destroy = function () {
    }

    this.updateViewByHash = function (currPageQueryStr) {
    }

};
