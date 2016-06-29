/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UDDashboardView = ContrailView.extend({
        el: $(contentContainer),

        initialize: function (p) {
            var self = this
        },

        render: function () {
            var self = this

            //TODO should it be in hashParams?
            var urlParams = layoutHandler.getURLHashObj()
            // get dashboard and tab ids from url params / loaded widgets or generate default
            self.currentDashboard = urlParams.p.split('_').slice(-1).pop() || self.model.dashboardIds()[0] || 'udd0'
            self.currentTab = urlParams.tab || self.model.tabIds(self.currentDashboard)[0] || 'tab1'

            // TODO render dashboards in menu
            
            self.renderView4Config(self.$el, null, self.getViewConfig())
        },

        getViewConfig: function () {
            var self = this
            var currentTabNumber = 0 // get from array
            var tabIds = self.model.tabIds(self.currentDashboard)
            // add default tab
            if (_.isEmpty(tabIds)) tabIds.push(self.currentTab)
            
            var tabs = _.map(tabIds, function (tabId) {
                return self.getTabViewConfig(tabId)
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
                                    viewConfig: {
                                        theme: 'classic',
                                        active: currentTabNumber,
                                        tabs: tabs,
                                        onAdd: function (title) {
                                            this.renderNewTab('widget-layout-tabs-view', [self.getTabViewConfig(title)], true)
                                        },
                                        extendable: true,
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },
        
        getTabViewConfig: function (tabId) {
            var self = this

            var defaultTabConfig = {
                view: 'GridStackView',
                viewPathPrefix: 'reports/udd/ui/js/views/',
                viewConfig: {
                    dashboardId: self.currentDashboard,
                    tabId: tabId,
                },
                tabConfig: {
                    activate: function (event, ui) {
                        self.$('#' + tabId +' svg').trigger('refresh')
                    },
                    onRemove: function () {
                        if (this.model.isEmpty()) return true
                        var proceed = confirm('Are you sure to delete "' + this.title + '" tab and all of its widgets?')
                        if (proceed) {
                            _.each(this.model.models, function (widget) {
                                widget.destroy()
                            })
                        }
                        // TODO error handling
                        return proceed
                    },
                    removable: true,
                },
            }
            var config = _.extend({}, defaultTabConfig)
            config.elementId = tabId
            config.title = tabId
            config.model = self.model.filterBy(self.currentDashboard, tabId)
            config.viewConfig.tabId = tabId
            return config
        }
    })

    return UDDashboardView
})
