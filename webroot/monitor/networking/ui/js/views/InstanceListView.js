/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var InstanceListView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var ajaxConfig = {
                url: ctwc.URL_INSTANCE_DETAILS_IN_CHUNKS,
                type: 'POST',
                data: JSON.stringify({
                    data: [{"type": ctwc.TYPE_VIRTUAL_MACHINE, "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')}]
                })
            };

            var listModelConfig = {
                remote: {
                    ajaxConfig: ajaxConfig,
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
                    ucid: ctwc.UCID_ALL_VM
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            cowu.renderView4Config(this.$el, contrailListModel, getInstanceListViewConfig());
        }
    });

    var getInstanceListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCES_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "InstanceGridView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return InstanceListView;
});