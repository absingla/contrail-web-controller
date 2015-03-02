/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var InstanceGridView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var that = this,
                viewConfig = this.attributes.viewConfig,
                parentUUID = viewConfig['parentUUID'],
                parentType = viewConfig['parentType'];

            var instanceRemoteConfig = {
                url: parentUUID != null ? ctwc.get(ctwc.URL_PROJECT_INSTANCES_DETAILS, parentUUID, parentType) : ctwc.URL_INSTANCE_DETAILS_IN_CHUNKS,
                type: 'POST',
                data: JSON.stringify({
                    data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                })
            };

            // TODO: Handle multi-tenancy
            var ucid = (parentUUID != null) ? (parentUUID + ":" + 'virtual-machines') : ctwc.UCID_ALL_VM;

            cowu.renderView4Config(that.$el, this.model, getInstanceListViewConfig(instanceRemoteConfig, ucid));
        }
    });

    var getInstanceListViewConfig = function (instanceRemoteConfig, ucid) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCE_GRID_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectInstancesConfig(instanceRemoteConfig, ucid)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig, ucid) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_INSTANCES_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getInstanceDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: instanceRemoteConfig,
                        dataParser: ctwp.instanceDataParser
                    },
                    lazyRemote: ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE),
                    cacheConfig : {
                        getDataFromCache: function (ucid) {
                            return mnPageLoader.mnView.listCache[ucid];
                        },
                        setData2Cache: function (ucid, dataObject) {
                            mnPageLoader.mnView.listCache[ucid] = {lastUpdateTime: $.now(), dataObject: dataObject};
                        },
                        ucid: ucid
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectInstancesColumns
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 25,
                        pageSizeSelect: [25, 50, 100]
                    }

                }
            }
        };
        return gridElementConfig;
    };

    var getInstanceDetailsTemplateConfig = function() {
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
                                            title: ctwl.TITLE_INSTANCE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
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
                                            title: ctwl.TITLE_CPU_INFO,
                                            templateGenerator: 'BlockListTemplateGenerator',
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

    return InstanceGridView;
});
