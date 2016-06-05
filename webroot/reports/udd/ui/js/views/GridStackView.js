/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * View for collection of widgets
 * Utilizes grid layout from gridstack jquery module
 */
define(function (require) {
    var _ = require('lodash')
    var GridStack = require('/assets/gridstack/js/gridstack.js')
    var WidgetsCollection = require('/reports/udd/ui/js/models/WidgetsCollection.js')
    var ContrailView = require('contrail-view')

    var GridStackView = ContrailView.extend({
        initialize: function (p) {
            var self = this
            self.p = {
                animate: true,
                width: 2,
                float: false,
                removeTimeout: 100,
                acceptWidgets: '.grid-stack-item',
                handle: '.panel-heading',
                verticalMargin: 8,
                cellHeight: 60
            }
            var viewConfig = self.attributes.viewConfig;

            self.model = new WidgetsCollection()
            self.model.url = viewConfig.dataUrl;

            self.listenTo(self.model, 'add', self.onModelAdded)
        },

        id: 'widgets',
        template: Handlebars.compile(require('text!/reports/udd/ui/templates/layout.html')),
        widgetTemplate: Handlebars.compile(require('text!/reports/udd/ui/templates/widget.html')),
        events: {
            'change .grid-stack': 'onAddWidget',
            'click .grid-stack-item .close': 'onRemoveWidget',
            'resizestop .grid-stack': 'onResize',
            'click .placeholder': 'add',
        },
        placeholderHTML: Handlebars.compile(require('text!/reports/udd/ui/templates/layoutPlaceholder.html'))(),

        render: function () {
            var self = this
            self.$el.html(self.template({width: self.p.width}))
            self.initLayout()
            self.model.fetch()
            return self
        },

        initLayout: function () {
            var self = this
            var $grid = self.$('.grid-stack')

            $grid.gridstack(self.p)
            self.grid = $grid.data('gridstack')
            self.placeHolder = self.grid.addWidget(self.placeholderHTML, 0, 10, 1, 1, true)
            self.grid.disable(self.placeholder)
        },

        add: function () {
            var self = this
            self.model.set({width: self.p.width})
        },

        clear: function () {
            var self = this
            self.grid.removeAll()
            return false
        },

        // *Add a single widget to the area by creating a view for it
        onModelAdded: function (model) {
            $m = model
            var self = this
            var id = model.get('id')
            var widgetConfig = model.get('config') || {}
            widgetConfig.id = id
            self.grid.addWidget(self.widgetTemplate(widgetConfig),
                                widgetConfig.x,
                                widgetConfig.y,
                                widgetConfig.width,
                                widgetConfig.height)

            var el = self.$('#' + id)
            self.renderView4Config(el, model, {
                view: "WidgetView",
                elementId: id,
                viewPathPrefix: "reports/udd/ui/js/views/",
                viewConfig: {}
            }, null, null, null, function () {
                self.grid.minWidth(el, 1)
                self.grid.minHeight(el, 6)
            });
        },

        onAddWidget: function (event, items) {
            var self = this
            if (!event || !event.target.classList.contains('grid-stack')) return
            if (items.length === 1 && items[0].el.hasClass('placeholder')) return
            self.grid.move(self.placeholder, 0, Infinity)
        },

        onRemoveWidget: function (e) {
            var self = this
            var el = self.$(e.currentTarget).parents('.grid-stack-item')
            self.grid.removeWidget(el)
        },

        onResize: function (event, ui) {
            var self = this
            var widget = _.find(self.childViewMap, function (w) {
                return w.$el[0] === ui.element[0]
            })
            var viewId = widget.getContentVC().elementId
            var chartView = widget.childViewMap[viewId].childViewMap
            var chartType = Object.keys(chartView)[0]
            chartView[chartType].chartModel.update()
        }
    })
    return GridStackView;
})
