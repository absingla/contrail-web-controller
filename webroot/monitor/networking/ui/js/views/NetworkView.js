/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var NetworkView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            cowu.renderView4Config(self.$el, null, getNetworkViewConfig(viewConfig));
        }

    });

    var getNetworkViewConfig = function (viewConfig) {
        var networkFQN = viewConfig['networkFQN'],
            networkUUID = viewConfig['networkUUID'],
            networkDetailsUrl = ctwc.get(ctwc.URL_NETWORK_SUMMARY, networkFQN);;

        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    activate: function (e, ui) {
                                        var selTab = $(ui.newTab.context).text();
                                    },
                                    tabs: [
                                        {
                                            elementId: ctwl.NETWORK_DETAILS_ID,
                                            title: ctwl.TITLE_DETAILS,
                                            view: "DetailsView",
                                            viewConfig: {
                                                ajaxConfig: {
                                                    url: networkDetailsUrl,
                                                    type: 'GET'
                                                },
                                                templateConfig: getDetailsViewTemplateConfig(),
                                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                                dataParser: function(response) {
                                                    return response['value'][0];
                                                }
                                            }
                                        },
                                        {
                                            elementId: ctwl.NETWORK_INSTANCES_ID,
                                            title: ctwl.TITLE_INSTANCES,
                                            view: "InstanceListView",
                                            app: cowc.APP_CONTRAIL_CONTROLLER,
                                            viewConfig: {
                                                parentUUID: networkUUID,
                                                parentType: 'vn'
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

    function getDetailsViewTemplateConfig() {
        return {
            templateGenerator: 'ColumnSectionTemplateGenerator',
            templateGeneratorConfig: {
                columns: [
                    {
                        class: 'span6',
                        rows: [
                            {
                                templateGenerator: 'BlockListTemplateGenerator',
                                title: ctwl.TITLE_NETWORK_DETAILS,
                                templateGeneratorConfig: [
                                    {
                                        key: 'value.UveVirtualNetworkConfig.connected_networks',
                                        valueType: 'text'
                                    },

                                    {
                                        key: 'value.UveVirtualNetworkAgent.acl',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.total_acl_rules',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.interface_list',
                                        valueType: 'length'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.virtualmachine_list',
                                        valueType: 'text'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        class: 'span6',
                        rows: [
                            {
                                templateGenerator: 'BlockListTemplateGenerator',
                                title: ctwl.TITLE_TRAFFIC_DETAILS,
                                templateGeneratorConfig: [
                                    {
                                        key: 'value.UveVirtualNetworkAgent.ingress_flow_count',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.egress_flow_count',
                                        valueType: 'text'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.in_bytes',
                                        valueType: 'format-bytes'
                                    },
                                    {
                                        key: 'value.UveVirtualNetworkAgent.out_bytes',
                                        valueType: 'format-bytes'
                                    },
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    };

    return NetworkView;
});
