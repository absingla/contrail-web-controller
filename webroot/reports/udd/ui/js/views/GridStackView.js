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
    var ContrailView = require('contrail-view')

    var GridStackView = ContrailView.extend({
        initialize: function (p) {
            var self = this
            self.p = _.extend({
                animate: false,
                width: 2,
                float: false,
                removeTimeout: 100,
                acceptWidgets: '.grid-stack-item',
                handle: '.panel-heading',
                verticalMargin: 8,
                cellHeight: 60,
                minWidth: 1,
                minHeight: 6,
            }, self.attributes.viewConfig)

            self.listenTo(self.model, 'add', self.onAdd)
            self.listenTo(self.model, 'remove', self.onRemove)
            //self.listenTo(self.model, 'reset', self.clear)
        },

        id: 'widgets',
        template: Handlebars.compile(require('text!/reports/udd/ui/templates/layout.html')),
        widgetTemplate: Handlebars.compile(require('text!/reports/udd/ui/templates/widget.html')),
        events: {
            'change .grid-stack': 'onChange',
            'resizestop .grid-stack': 'onResize',
            'click .placeholder': 'add',
        },
        placeholderHTML: Handlebars.compile(require('text!/reports/udd/ui/templates/layoutPlaceholder.html'))(),

        render: function () {
            var self = this
            self.$el.html(self.template({width: self.p.width}))
            self.initLayout()
            _.each(self.model.models, function (model) {
                self.onAdd(model)
            })
            return self
        },

        initLayout: function () {
            var self = this
            var $grid = self.$('.grid-stack')

            $grid.gridstack(self.p)
            self.grid = $grid.data('gridstack')
            self.placeHolder = self.$el.append(self.placeholderHTML)
        },

        add: function () {
            var self = this
            // place widget last
            var cellsX = _.map(self.model.models, function (m) { return m.attributes.configModel.x()})
            var cellsY = _.map(self.model.models, function (m) { return m.attributes.configModel.y()})
            function getMax(value) { return Math.max(value) }
            var x = _.isEmpty(cellsX) ? 0 : _.sortBy(cellsX, getMax)[0] + self.p.minWidth
            var y = _.isEmpty(cellsY) ? 0 : _.sortBy(cellsY, getMax)[0] || 0 + self.p.minHeight
            console.log(x, y)
            self.model.add({
                dashboardId: self.p.dashboardId,
                tabId: self.p.tabId,
                config: {x: x, y: y, width: self.p.width, height: self.p.minHeight}
            })
        },

        clear: function () {
            var self = this
            self.grid.removeAll()
            return false
        },

        // *Add a single widget to the area by creating a view for it
        onAdd: function (model) {
            var self = this
            var id = model.get('id')
            var widgetConfig = model.get('configModel').model().toJSON() || {}
            widgetConfig.id = id
            self.grid.addWidget(self.widgetTemplate(widgetConfig),
                                widgetConfig.x,
                                widgetConfig.y,
                                widgetConfig.width,
                                widgetConfig.height,
                                false,                  // autoposition
                                self.p.minWidth,        // minWidth
                                undefined,              // maxWidth
                                self.p.minHeight,       // minHeight
                                undefined,              // maxHeight
                                id)

            var el = self.$('#' + id)
            self.renderView4Config(el, model, {
                view: "WidgetView",
                elementId: id,
                viewPathPrefix: "reports/udd/ui/js/views/",
                viewConfig: {}
            })
        },

        onRemove: function (model) {
            var self = this
            var el = self.$('#' + model.id)
            self.grid.removeWidget(el)
        },

        onResize: function (event, ui) {
            var self = this
            var widget = _.find(self.childViewMap, function (w) {
                return w.$el[0] === ui.element[0]
            })
            widget.resize()
        },
        // update widget model config on gridstack items change
        onChange: function (event, items) {
            var self = this
            _.each(items, function (item) {
                if (!item.id) return
                var widgetView = self.childViewMap[item.id]
                if (!widgetView) return
                var config = widgetView.model.get('configModel')
                config.x(item.x)
                config.y(item.y)
                config.width(item.width)
                config.height(item.height)
            })
        }
    })
    return GridStackView;
})
