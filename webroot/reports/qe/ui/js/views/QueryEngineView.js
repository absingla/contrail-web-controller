/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var QueryEngineView = ContrailView.extend({
        el: $(contentContainer),

        renderFlowSeries: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlowSeriesViewConfig(viewConfig));
        },

        renderStatQuery: function (viewConfig) {
            this.renderView4Config(this.$el, null, getStatQueryViewConfig(viewConfig));
        },

        renderObjectLogs: function (viewConfig) {
            this.renderView4Config(this.$el, null, getObjectLogsViewConfig(viewConfig));
        },

        renderFlowQueue: function (viewConfig) {
            this.renderView4Config(this.$el, null, getQueueViewConfig(viewConfig));
        }
    });

    function getFlowSeriesViewConfig(config) {
        var hashParams = config['hashParams'];

        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_FLOW_SERIES_ID,
                                view: "FlowSeriesFormView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: cowl.QE_FLOW_SERIES_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.TITLE_QUERY,
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

    function getStatQueryViewConfig(config) {
        var hashParams = config['hashParams'];

        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_STAT_QUERY_ID,
                                view: "StatQueryFormView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: cowl.QE_STAT_QUERY_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.TITLE_QUERY,
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

    function getObjectLogsViewConfig(config) {
        var hashParams = config['hashParams'];

        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_OBJECT_LOGS_ID,
                                view: "ObjectLogsFormView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: cowl.QE_OBJECT_LOGS_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.TITLE_QUERY,
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

    function getQueueViewConfig(config) {
        var hashParams = config['hashParams'];

        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_FLOW_QUEUE_ID,
                                view: "QueryQueueView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    queueType: cowc.QE_FLOW_QUERY_QUEUE
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return QueryEngineView;
});