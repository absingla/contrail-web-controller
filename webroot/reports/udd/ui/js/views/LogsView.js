/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContrailView = require('contrail-view')

    var LogsView = ContrailView.extend({

        initialize: function () {
            var self = this
            self.model.onDataUpdate.subscribe(function () {
                self.render()
            })
            self.template = window.contrail.getTemplate4Id('logList-template')
        },

        render: function () {
            var self = this
            var list = self.model.getItems()
            self.$el.html(self.template(self._format(list.slice(0, 5))))
        },

        _format: function (data) {
            var UVEModuleIds = window.monitorInfraConstants.UVEModuleIds
            var retArr = $.map(data, function (obj) {
                obj.message = window.cowu.formatXML2JSON(obj.Xmlmessage)
                obj.timeStr = window.diffDates(new window.XDate(obj.MessageTS / 1000), new window.XDate())
                if (obj.Source === null) {
                    obj.moduleId = window.contrail.format('{0}', obj.ModuleId)
                } else {
                    obj.moduleId = window.contrail.format('{0} ({1})', obj.ModuleId, obj.Source)
                }
                if ($.inArray(obj.ModuleId, [UVEModuleIds.DISCOVERY_SERVICE,
                    UVEModuleIds.SERVICE_MONITOR, UVEModuleIds.SCHEMA,
                    UVEModuleIds.CONFIG_NODE]) !== -1) {
                    obj.link = {
                        p: 'mon_infra_config',
                        q: {
                            type: 'configNode',
                            view: 'details',
                            focusedElement: {
                                node: obj.Source,
                                tab: 'details',
                            },
                        },
                    }
                } else if ($.inArray(obj.ModuleId, [UVEModuleIds.COLLECTOR,
                    UVEModuleIds.OPSERVER, UVEModuleIds.QUERYENGINE],
                    obj.ModuleId) !== -1) {
                    obj.link = {
                        p: 'mon_infra_analytics',
                        q: {
                            type: 'controlNode',
                            view: 'details',
                            focusedElement: {
                                node: obj.Source,
                                tab: 'details',
                            },
                        },
                    }
                } else if ($.inArray(obj.ModuleId, [UVEModuleIds.VROUTER_AGENT]) !== -1) {
                    obj.link = {
                        p: 'mon_infra_vrouter',
                        q: {
                            type: 'vRouter',
                            view: 'details',
                            focusedElement: {
                                node: obj.Source,
                                tab: 'details',
                            },
                        },
                    }
                } else if ($.inArray(obj.ModuleId, [UVEModuleIds.CONTROLNODE]) !== -1) {
                    obj.link = {
                        p: 'mon_infra_control',
                        q: {
                            type: 'controlNode',
                            view: 'details',
                            focusedElement: {
                                node: obj.Source,
                                tab: 'details',
                            },
                        },
                    }
                }
                return obj
            })
            return retArr
        },
    })
    return LogsView
})
