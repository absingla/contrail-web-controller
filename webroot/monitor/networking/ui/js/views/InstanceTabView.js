/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceTabView = Backbone.View.extend({
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
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'vRouter',
                                                    templateGenerator: 'TextGenerator'
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
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.rss',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
                                                },
                                                {
                                                    key: 'value.UveVirtualMachineAgent.cpu_info.vm_memory_quota',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'kilo-byte'
                                                    }
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
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                dataColumn: [
                                                    {
                                                        key: 'uuid',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'mac_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'ip_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'ip6_address',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'label',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'Gateway',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'active',
                                                        templateGenerator: 'TextGenerator'
                                                    },
                                                    {
                                                        key: 'l2_active',
                                                        templateGenerator: 'TextGenerator'
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

    return InstanceTabView;
});
