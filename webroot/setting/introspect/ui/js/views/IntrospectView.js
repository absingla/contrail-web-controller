/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var IntrospectView = ContrailView.extend({
        el: $(contentContainer),

        renderIntrospect: function (viewConfig) {
            this.renderView4Config(this.$el, null, getControlIntrospectViewConfig(viewConfig));
        }

    });

    function getControlIntrospectViewConfig(config) {
        var hashParams = config['hashParams'],
            introspectType = hashParams['type'];

        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'introspect-' + hashParams['type'],
                                view: "IntrospectFormView",
                                viewPathPrefix: "setting/introspect/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: cowl.QE_FLOW_SERIES_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.get(introspectType) + ' ' + ctwl.TITLE_INTROSPECT,
                                                iconClass: "icon-search"
                                            },
                                            controls: {
                                                top: {
                                                    default: {
                                                        collapseable: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return IntrospectView;
});