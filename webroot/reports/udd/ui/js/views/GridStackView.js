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
            'change .grid-stack': 'onChange',
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
            self.placeHolder = self.grid.addWidget(self.placeholderHTML, 0, 1000, self.p.minWidth, 1, true)
            self.grid.disable(self.placeholder)
        },

        add: function () {
            var self = this
            var x = _.sortBy(_.map(self.model.models, 'attributes.config.x'), function (x) { return Math.max(x) })[0] + self.p.minWidth
            var y = _.sortBy(_.map(self.model.models, 'attributes.config.y'), function (y) { return Math.max(y) })[0] + self.p.minHeight
            console.log(x, y)
            self.model.set({config: {x: x, y: y, width: self.p.width, height: self.p.minHeight}})
        },

        clear: function () {
            var self = this
            self.grid.removeAll()
            return false
        },

        // *Add a single widget to the area by creating a view for it
        onModelAdded: function (model) {
            var self = this
            var id = model.get('id')
            var widgetConfig = model.get('config') || {}
            widgetConfig.id = id
            self.grid.addWidget(self.widgetTemplate(widgetConfig),
                                widgetConfig.x,
                                widgetConfig.y,
                                widgetConfig.width,
                                widgetConfig.height,
                                false,                  // autoposition
                                self.p.minWidth,                      // minWidth
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
            }, null, null, null, function () {
                self.grid.minWidth(el, self.p.minWidth)
                self.grid.minHeight(el, self.p.minHeight)
            });
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
            widget.resize()
        },

        onChange: function (event, items) {
            var self = this
            _.each(items, function (item) {
                if (!item.id || !item._updating) return
                var widgetView = self.childViewMap[item.id]
                if (!widgetView) return
                var config = widgetView.model.get('config')
                config.x = item.x
                config.y = item.y
                config.width = item.width
                config.height = item.height
                widgetView.model.set('config', config)
            })
        }
    })
    return GridStackView;
})
