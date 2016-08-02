/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-view-model'
], function (_, ContrailView, ContrailViewModel) {
    var ConnectedNetworkTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {

            var self = this, viewConfig = this.attributes.viewConfig;

            var modelMap = {},
                modelConfig = getNetworkConfigModelConfig(viewConfig);

            modelMap[modelConfig.cacheConfig.ucid] = new ContrailViewModel(modelConfig);

            self.renderView4Config(self.$el, null, getNetworkConfigTabViewConfig(viewConfig), null, null, modelMap);
        }
    });

    function getNetworkConfigModelConfig(viewConfig) {
        var ajaxConfig,
            dataParser,
            cacheConfig;

        switch (viewConfig.elementType) {
            case ctwc.GRAPH_ELEMENT_NETWORK_POLICY:

                var policyUUID = viewConfig.nodeDetails.uuid,
                    networkPolicyDetailsUrl = ctwc.get(ctwc.URL_NETWORK_POLICY_DETAIL, policyUUID);

                ajaxConfig = {
                    url: networkPolicyDetailsUrl,
                    type: 'GET'
                };

                cacheConfig = {
                    ucid: ctwc.get(ctwc.UCID_NETWORK_POLICY_LIST, policyUUID)
                };

                dataParser = function (response) {
                    return (!$.isEmptyObject(response)) ? response['network-policy'] : response;
                };

                break;

            case ctwc.GRAPH_ELEMENT_SECURITY_GROUP:
                var sgUUID = viewConfig.nodeDetails.uuid;

                ajaxConfig = {
                    url: ctwc.URL_GET_CONFIG_DETAILS,
                    type: 'POST',
                    data: JSON.stringify({
                        data: [{"type": ctwc.TYPE_SECURITY_GROUPS, "obj_uuids": [sgUUID]}]
                    })
                };

                cacheConfig = {
                    ucid: ctwc.get(ctwc.UCID_SECURITY_GROUP_LIST, sgUUID)
                };

                dataParser = function (response) {
                    return (!$.isEmptyObject(response)) ? response[0]['security-groups'][0]['security-group'] : response;
                };

                break;


            case ctwc.GRAPH_ELEMENT_NETWORK_IPAM:
                var ipamUUID = viewConfig.nodeDetails.uuid;

                ajaxConfig = {
                    url: ctwc.URL_GET_CONFIG_DETAILS,
                    type: 'POST',
                    data: JSON.stringify({
                        data: [{"type": ctwc.TYPE_NETWORK_IPAMS, "obj_uuids": [ipamUUID]}]
                    })
                };

                cacheConfig = {
                    ucid: ctwc.get(ctwc.UCID_NETWORK_IPAM_LIST, ipamUUID)
                };

                dataParser = function (response) {
                    return (!$.isEmptyObject(response)) ? response[0]['network-ipams'][0]['network-ipam'] : response;
                };

                break;

        }

        return {
            remote: {
                ajaxConfig: ajaxConfig,
                dataParser: dataParser
            },
            cacheConfig: cacheConfig
        };
    }

    function getNetworkConfigTabViewConfig(viewConfig) {

        switch (viewConfig.elementType) {

            case ctwc.GRAPH_ELEMENT_NETWORK_POLICY:
                var policyUUID = viewConfig.nodeDetails.uuid;
                var activateFn = function (e, ui) {
                    var selTab = $(ui.newTab.context).text();
                };

                var tabConfig = [
                    {
                        elementId: ctwl.MONITOR_NETWORK_POLICY_DETAILS_ID,
                        title: ctwl.TITLE_DETAILS,
                        view: "DetailsView",
                        viewConfig: {
                            templateConfig: getNetworkPolicyDetailsTemplateConfig(),
                            modelKey: ctwc.get(ctwc.UCID_NETWORK_POLICY_LIST, policyUUID)
                        }
                    },
                    {
                        elementId: ctwl.MONITOR_NETWORK_POLICY_RULES_ID,
                        title: ctwl.TITLE_RULES,
                        view: "DetailsView",
                        viewConfig: {
                            templateConfig: getNetworkPolicyRulesTemplateConfig(),
                            modelKey: ctwc.get(ctwc.UCID_NETWORK_POLICY_LIST, policyUUID)
                        }
                    }
                ];
                break;

            case ctwc.GRAPH_ELEMENT_SECURITY_GROUP:
                var sgUUID = viewConfig.nodeDetails.uuid;
                var activateFn = function (e, ui) {
                    var selTab = $(ui.newTab.context).text();
                };

                var tabConfig = [
                    {
                        elementId: ctwl.MONITOR_SECURITY_GROUP_DETAILS_ID,
                        title: ctwl.TITLE_DETAILS,
                        view: "DetailsView",
                        viewConfig: {
                            templateConfig: getSecurityGroupDetailsTemplateConfig(),
                            modelKey: ctwc.get(ctwc.UCID_SECURITY_GROUP_LIST, sgUUID)
                        }
                    },
                    {
                        elementId: ctwl.MONITOR_SECURITY_GROUP_RULES_ID,
                        title: ctwl.TITLE_RULES,
                        view: "DetailsView",
                        viewConfig: {
                            templateConfig: getSecurityGroupRulesTemplateConfig(),
                            modelKey: ctwc.get(ctwc.UCID_SECURITY_GROUP_LIST, sgUUID)
                        }
                    }
                ];
                break;

            case ctwc.GRAPH_ELEMENT_NETWORK_IPAM:
                var ipamUUID = viewConfig.nodeDetails.uuid;
                var activateFn = function (e, ui) {
                    var selTab = $(ui.newTab.context).text();
                };

                var tabConfig = [
                    {
                        elementId: ctwl.MONITOR_NETWORK_IPAM_DETAILS_ID,
                        title: ctwl.TITLE_DETAILS,
                        view: "DetailsView",
                        viewConfig: {
                            templateConfig: getNetworkIpamDetailsTemplateConfig(),
                            modelKey: ctwc.get(ctwc.UCID_NETWORK_IPAM_LIST, ipamUUID)
                        }
                    }
                ];
                break;


        }


        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_NETWORK_CONFIG_VIEW_ID, '-section']),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.MONITOR_NETWORK_CONFIG_TABS_ID,
                                view: "TabsView",
                                viewConfig: {
                                    theme: 'classic',
                                    active: 0,
                                    activate: activateFn,
                                    tabs: tabConfig
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getNetworkPolicyDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: ctwl.TITLE_MONITOR_NETWORK_POLICY_SUMMARY,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass: 'col-xs-3',
                                    key: 'fq_name',
                                    label: 'Display Name',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'nameFromFQName',
                                        sortable: {
                                            sortBy: 'formattedValue'
                                        }
                                    }
                                }, {
                                    keyClass: 'col-xs-3',
                                    key: 'uuid',
                                    label: 'UUID',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    keyClass: 'col-xs-3',
                                    key: 'virtual_network_back_refs',
                                    label: 'Connected networks',
                                    templateGenerator: 'LinkGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'associatedNetworks',
                                        template: ctwc.URL_NETWORK,
                                        params: {}
                                    }
                                }, {
                                    keyClass: 'col-xs-3',
                                    label: 'Rules Count',
                                    key: 'network_policy_entries.policy_rule',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'length',
                                        sortable: {
                                            sortBy: 'formattedValue'
                                        }
                                    }
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    function getNetworkPolicyRulesTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    title: ctwl.TITLE_MONITOR_NETWORK_POLICY_RULES,
                    templateGenerator: 'BlockListTemplateGenerator',
                    templateGeneratorConfig: [{
                        key: 'network_policy_entries.policy_rule',
                        showKey: false,
                        templateGenerator: 'PolicyRuleGenerator',
                        templateGeneratorConfig: {
                            params: {}
                        }
                    }]
                }]
            }
        };
    };

    function getSecurityGroupDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: ctwl.TITLE_MONITOR_SECURITY_GROUP_SUMMARY,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass: 'col-xs-3',
                                    key: 'fq_name',
                                    label: 'Display Name',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'nameFromFQName'
                                    }
                                }, {
                                    keyClass: 'col-xs-3',
                                    key: 'uuid',
                                    label: 'UUID',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    keyClass: 'col-xs-3',
                                    label: 'Rules Count',
                                    key: 'security_group_entries.policy_rule',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'length'
                                    }
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    function getSecurityGroupRulesTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    title: ctwl.TITLE_MONITOR_NETWORK_POLICY_RULES,
                    templateGenerator: 'BlockListTemplateGenerator',
                    templateGeneratorConfig: [{
                        key: 'security_group_entries.policy_rule',
                        showKey: false,
                        templateGenerator: 'PolicyRuleGenerator',
                        templateGeneratorConfig: {
                            params: {}
                        }
                    }]
                }]
            }
        };
    };

    function getNetworkIpamDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: ctwl.TITLE_MONITOR_NETWORK_IPAM_SUMMARY,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass: 'col-xs-3',
                                    key: 'fq_name',
                                    label: 'Display Name',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'nameFromFQName',
                                        sortable: {
                                            sortBy: 'formattedValue'
                                        }
                                    }
                                }, {
                                    keyClass: 'col-xs-3',
                                    key: 'uuid',
                                    label: 'UUID',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    keyClass: 'col-xs-3',
                                    label: 'DNS Method',
                                    key: 'network_ipam_mgmt.ipam_dns_method',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'dnsMethod'
                                    }
                                }, {
                                    keyClass: 'col-xs-3',
                                    label: 'NTP Server IP',
                                    key: 'network_ipam_mgmt.dhcp_option_list',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'NTPServerIPFromDHCPOption'
                                    }
                                }, {
                                    keyClass: 'col-xs-3',
                                    label: 'Domain Name',
                                    key: 'network_ipam_mgmt.dhcp_option_list',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: 'domainNameFromDHCPOption'
                                    }
                                },
                                    //    {
                                    //    label: 'IP Blocks',
                                    //    key: 'virtual_network_back_refs',
                                    //    templateGenerator: 'TextGenerator',
                                    //    templateGeneratorConfig: {
                                    //        formatter: 'IPBlockFormatter'
                                    //    }
                                    //}
                                ]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    return ConnectedNetworkTabView;
});