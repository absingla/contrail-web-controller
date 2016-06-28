/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UDDashboardView = ContrailView.extend({
        el: $(contentContainer),
        className: 'widgets',

        initialize: function (p) {
            var self = this
        },

        render: function () {
            var self = this

            //TODO should it be in hashParams?
            var urlParams = layoutHandler.getURLHashObj()
            // get dashboard and tab ids from url params / loaded widgets or generate default
            self.currentDashboard = urlParams.p.split('_').slice(-1).pop() || self.model.dashboardIds()[0] || 'udd0'
            self.currentTab = urlParams.tab || self.model.tabIds()[0] || 'tab1'

            // TODO render dashboards in menu
            
            self.renderView4Config(self.$el, null, self.getViewConfig())
        },

        getViewConfig: function () {
            var self = this
            var currentTabNumber = 1 // get from array
            var tabIds = self.model.tabIds()
            // add default tab
            if (_.isEmpty(tabIds)) tabIds.push(self.currentTab)
            var tabs = _.map(tabIds, function (tabId) {
                return {
                    elementId: tabId,
                    model: self.model.filterBy(self.currentDashboard, self.currentTab),
                    title: tabId,
                    view: 'GridStackView',
                    viewPathPrefix: 'reports/udd/ui/js/views/',
                    viewConfig: {
                        dashboardId: self.currentDashboard,
                        tabId: self.currentTab
                    },
                }
            })
            return {
                elementId: 'widget-layout-tabs-view-section',
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'widget-layout-tabs-view',
                                    view: 'TabsView',
                                    //viewPathPrefix: 'core-basedir/js/views/TabsView'
                                    viewConfig: {
                                        theme: 'classic',
                                        active: currentTabNumber,
                                        tabs: tabs,
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },
    })

    return UDDashboardView
})
