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
            instanceDetailsUrl = ctwc.get(ctwc.URL_INSTANCE_SUMMARY, instanceUUID);

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
                                                ajaxConfig: {
                                                    url: instanceDetailsUrl,
                                                    type: 'GET'
                                                },
                                                templateConfig: getDetailsViewTemplateConfig(),
                                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                                dataParser: function(response) {
                                                    return {value: response};
                                                }
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
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    valueType: 'text'
                                                },
                                                {
                                                    key: 'vRouter',
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
                                            title: ctwl.TITLE_CPU_INFO,
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.cpu_one_min_avg',
                                                    valueType: 'text'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                    valueType: 'format-bytes',
                                                    valueFormat: 'kByte'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                    valueType: 'format-bytes',
                                                    valueFormat: 'kByte'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span12',
                                    rows: [
                                        {
                                            templateGenerator: 'BlockGridTemplateGenerator',
                                            title: ctwl.TITLE_INTERFACES,
                                            key: 'value.UveVirtualMachineAgent.interface_list',
                                            templateGeneratorConfig: {
                                                titleColumn: {
                                                    key: 'uuid',
                                                    valueType: 'text'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'uuid',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'mac_address',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'ip_address',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'ip6_address',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'label',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'Gateway',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'active',
                                                        valueType: 'text'
                                                    },
                                                    {
                                                        key: 'l2_active',
                                                        valueType: 'text'
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    return InstanceView;
});
