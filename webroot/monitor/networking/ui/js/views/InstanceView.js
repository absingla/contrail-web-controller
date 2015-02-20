/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            cowu.renderView4Config(self.$el, null, getInstanceViewConfig(viewConfig));
        }

    });

    var getInstanceViewConfig = function (viewConfig) {
        var instanceUUID = viewConfig['instanceUUID'],
            url = ctwc.get(ctwc.URL_INSTANCE_SUMMARY, instanceUUID);

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCE_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.INSTANCE_DETAILS_ID,
                                            title: ctwl.TITLE_DETAILS,
                                            view: "DetailsView",
                                            viewConfig: {
                                                url: url
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return InstanceView;
});
