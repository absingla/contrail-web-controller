/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/**
 * View for collection of widgets
 * Utilizes grid layout from gridstack jquery module
 */
define(function (require) {
    var GridStack = require('/assets/gridstack/js/gridstack.js')
    var Widget = require('/reports/udd/ui/js/views/widgetView.js')
    var $ = require('jquery')
    var _ = require('lodash')

    return Backbone.View.extend({
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
                cellHeight: 60,
            }
            self.widgets = {}

            self.listenTo(self.model, 'add', self.onModelAdded)
        },

        id: 'widgets',
        template: Handlebars.compile(require('text!/reports/udd/ui/templates/layout.html')),
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
            self.model.set({width: 3})
        },

        clear: function () {
            var self = this
            self.grid.removeAll()
            return false
        },

        // *Add a single widget to the area by creating a view for it
        onModelAdded: function (model) {
            var self = this
            var view = new Widget({ model })
            self.widgets[view.cid] = view
            var el = view.render().el
            self.grid.addWidget(el, model.get('x'), model.get('y'), model.get('width'), model.get('height'))
            self.grid.minWidth(el, view.chart.p.minWidth)
            self.grid.minHeight(el, view.chart.p.minHeight)
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
            var widget = _.find(self.widgets, function (w) { return w.$el[0] === ui.element[0]})
            widget.chart.chart.update()
        }
    })
})
