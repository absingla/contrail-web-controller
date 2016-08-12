/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailView = require('contrail-view')
    var qewu = require('core-basedir/js/common/qe.utils')

    var UDDashboardView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function () {
            var self = this

            // TODO should it be in hashParams?
            var urlParams = window.layoutHandler.getURLHashObj()
            // get dashboard and tab ids from url params / loaded widgets or generate default
            self.currentDashboard = urlParams.p.split('_').slice(-1).pop() || self.model.dashboardIds()[0] || 'udd0'
            self.currentTab = urlParams.tab || self.model.tabIds(self.currentDashboard)[0] || qewu.generateQueryUUID().slice(0, 36)

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
                                        theme: 'overcast',
                                        active: currentTabNumber,
                                        tabs: tabs,
                                        onAdd: function (title) {
                                            var tabViewConfigs = [self.getTabViewConfig(qewu.generateQueryUUID().slice(0, 36), title)]
                                            this.renderNewTab('widget-layout-tabs-view', tabViewConfigs, true)
                                        },
                                        extendable: true,
                                    },
                                },
                            ],
                        },
                    ],
                },
            }
        },

        getTabViewConfig: function (tabId, tabName) {
            var self = this

            var defaultTabConfig = {
                view: 'GridStackView',
                viewPathPrefix: 'reports/udd/ui/js/views/',
                viewConfig: {
                    dashboardId: self.currentDashboard,
                    tabId: tabId,
                    tabName: tabName,
                },
                tabConfig: {
                    activate: function (event, ui) {
                        // TODO as we don't know the actual content of the widget use view.update()
                        self.$('#' + tabId + ' svg').trigger('refresh')
                    },
                    onEdit: function (newTitle) {
                        var proceed = false
                        if (!newTitle) {
                            if (this.model.isEmpty()) return true
                            proceed = confirm('Are you sure to delete all widgets in this tab?')
                            if (proceed) {
                                _.each(this.model.models, function (widget) {
                                    widget.destroy()
                                })
                            }
                        } else this.model.setTabName(newTitle)
                        // TODO error handling
                        return proceed
                    },
                    editable: true,
                },
            }
            var config = _.extend({}, defaultTabConfig)
            config.elementId = tabId
            config.model = self.model.filterBy(self.currentDashboard, tabId)
            if (config.model.isEmpty()) {
                config.title = tabName || tabId
                config.model.setTabName(config.title)
            } else config.title = config.model.getTabName(tabId)

            config.viewConfig.tabId = tabId
            return config
        },
    })

    return UDDashboardView
})
