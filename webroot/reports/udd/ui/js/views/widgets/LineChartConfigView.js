/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define(function (require) {
    var ContrailView = require('contrail-view')
    var Knockback = require('knockback')

    var LineChartConfigView = ContrailView.extend({
        events: {
            'click #update_widget': 'onChange'
        },

        initialize: function () {
            var self = this
        },

        render: function () {
            var self = this

            var elementId = self.attributes.elementId

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), null,null,null, function () {
                Knockback.applyBindings(self.model, self.$el[0])
            })
        },

        getViewConfig: function () {
            var self = this
            return {
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'color', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'Line Color',
                                        path: 'color',
                                        dataBindValue: 'color',
                                        class: 'span9',
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'yAxisLabel', view: 'FormInputView',
                                    viewConfig: {
                                        label: 'y Axis Label',
                                        path: 'yAxisLabel',
                                        dataBindValue: 'yAxisLabel',
                                        class: 'span9',
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'yAxisValue', view: 'FormDropdownView',
                                    viewConfig: {
                                        label: 'y Axis Value',
                                        path: 'yAxisValue',
                                        dataBindValue: 'yAxisValue',
                                        class: 'span9',
                                        elementConfig: {data: self.model.model().get('yAxisValues')}}
                                }
                            ]
                        }, {
                            columns: [
                                {
                                    elementId: 'update_widget', view: 'FormButtonView', label: 'Update Widget',
                                    viewConfig: {
                                        class: 'display-inline-block margin-5-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        },

        onChange: function () {
            this.trigger('change')
        }
    })
    return LineChartConfigView;
})
