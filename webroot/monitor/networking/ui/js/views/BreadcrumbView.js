/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var BreadcrumbView = Backbone.View.extend({

        renderDomainBreadcrumbDropdown: function(fqName, initCB, changeCB) {
            contrail.ajaxHandler({
                url: '/api/tenants/config/domains', //TODO - Move to Constants
                async: false
            }, function(){

            }, function(response) {
                if (response.domains.length > 0) {

                    var domainDropdownElementId = ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
                        domainDropdownElement = constructBreadcrumbDropdownDOM(domainDropdownElementId),
                        selectedValueData = null,
                        urlDomainFQN = ((contrail.checkIfExist(fqName)) ? fqName.split(':').splice(0,1).join(':') : null),
                        cookieDomainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                        urlDataKey = null, cookieDataKey = null;

                    var dropdownData = $.map(response.domains, function (n, i) {
                        if (urlDomainFQN == n.fq_name.join(':')) {
                            urlDataKey = i;
                        }

                        if (cookieDomainFQN == n.fq_name.join(':')) {
                            cookieDataKey = i;
                        }

                        return {
                            name: n.fq_name[0],
                            value: n.uuid
                        };
                    });

                    selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                    var domainDropdown = domainDropdownElement.contrailDropdown({
                        dataTextField: "name",
                        dataValueField: "value",
                        data: dropdownData,
                        change: function (e) {
                            var selectedValueData = {
                                name: domainDropdownElement.data('contrailDropdown').text(),
                                value: domainDropdownElement.data('contrailDropdown').value()
                            };

                            (contrail.checkIfFunction(changeCB) ? changeCB(selectedValueData) : initCB(selectedValueData));
                            destroyBreadcrumbDropdownDOM(ctwl.PROJECTS_BREADCRUMB_DROPDOWN);
                            destroyBreadcrumbDropdownDOM(ctwl.NETWORKS_BREADCRUMB_DROPDOWN);
                        }
                    }).data('contrailDropdown');

                    domainDropdown.text(selectedValueData.name);
                    initCB(selectedValueData);

                } else {
                    //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
                }
            }, function(error) {
               // TODO - show some error message
            });
        },

        renderProjectBreadcrumbDropdown: function(fqName, initCB, changeCB) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
            contrail.ajaxHandler({
                url: networkPopulateFns.getProjectsURL(domain),
                async: false
            }, function(){

            }, function(response) {
                if (response.projects.length > 0) {

                    var projectDropdownElementId = ctwl.PROJECTS_BREADCRUMB_DROPDOWN,
                        projectDropdownElement = constructBreadcrumbDropdownDOM(projectDropdownElementId),
                        selectedValueData = null,
                        urlProjectFQN = ((contrail.checkIfExist(fqName)) ? fqName.split(':').splice(0,2).join(':') : null),
                        cookieProjectFQN = domain + ':' + contrail.getCookie(cowc.COOKIE_PROJECT),
                        urlDataKey = null, cookieDataKey = null;

                    var dropdownData = $.map(response.projects, function (n, i) {
                        if (urlProjectFQN == n.fq_name.join(':')) {
                            urlDataKey = i;
                        }

                        if (cookieProjectFQN == n.fq_name.join(':')) {
                            cookieDataKey = i;
                        }

                        return {
                            name: n.fq_name[1],
                            value: n.uuid
                        };
                    });

                    selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                    var projectDropdown = projectDropdownElement.contrailDropdown({
                        dataTextField: "name",
                        dataValueField: "value",
                        data: dropdownData,
                        change: function (e) {
                            var selectedValueData = {
                                name: projectDropdownElement.data('contrailDropdown').text(),
                                value: projectDropdownElement.data('contrailDropdown').value()
                            };

                            (contrail.checkIfFunction(changeCB) ? changeCB(selectedValueData) : initCB(selectedValueData));
                            destroyBreadcrumbDropdownDOM(ctwl.NETWORKS_BREADCRUMB_DROPDOWN);
                        }
                    }).data('contrailDropdown');

                    projectDropdown.text(selectedValueData.name);
                    initCB(selectedValueData);

                } else {
                    //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
                }
            }, function(error) {
               // TODO - show some error message
            });
        },

        renderNetworkBreadcrumbDropdown: function(fqName, initCB, changeCB) {
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                projectFQN = domain + ':' + project;
            contrail.ajaxHandler({
                url: '/api/tenants/networks/' + projectFQN, //TODO - Move to Constants
                async: false
            }, function(){

            }, function(response) {
                if (response['virtual-networks'].length > 0) {

                    var networkDropdownElementId = ctwl.NETWORKS_BREADCRUMB_DROPDOWN,
                        networkDropdownElement = constructBreadcrumbDropdownDOM(networkDropdownElementId),
                        selectedValueData = null,
                        urlNetworkFQN = ((contrail.checkIfExist(fqName)) ? fqName.split(':').splice(0,3).join(':') : null),
                        cookieNetworkFQN = projectFQN + ':' + contrail.getCookie(cowc.COOKIE_VIRTUAL_NETWORK),
                        urlDataKey = null, cookieDataKey = null;

                    var dropdownData = $.map(response['virtual-networks'], function (n, i) {
                        if (urlNetworkFQN == n.fq_name.join(':')) {
                            urlDataKey = i;
                        }

                        if (cookieNetworkFQN == n.fq_name.join(':')) {
                            cookieDataKey = i;
                        }

                        return {
                            name: n.fq_name[2],
                            value: n.uuid
                        };
                    });

                    selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                    var networkDropdown = networkDropdownElement.contrailDropdown({
                        dataTextField: "name",
                        dataValueField: "value",
                        data: dropdownData,
                        change: function (e) {
                            var selectedValueData = {
                                name: networkDropdownElement.data('contrailDropdown').text(),
                                value: networkDropdownElement.data('contrailDropdown').value()
                            };

                            (contrail.checkIfFunction(changeCB) ? changeCB(selectedValueData) : initCB(selectedValueData));
                        }
                    }).data('contrailDropdown');

                    networkDropdown.text(selectedValueData.name);
                    initCB(selectedValueData);

                } else {
                    //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
                }
            }, function(error) {
               // TODO - show some error message
            });
        }

    });

    var constructBreadcrumbDropdownDOM = function(breadcrumbDropdownId) {
        var breadcrumbElement = $('#breadcrumb'); //TODO - move to constants

        destroyBreadcrumbDropdownDOM(breadcrumbDropdownId);

        breadcrumbElement.children('li').removeClass('active');
        breadcrumbElement.children('li:last').append('<span class="divider"><i class="icon-angle-right"></i></span>');
        breadcrumbElement.append('<li class="active ' + breadcrumbDropdownId +'"><div id="' + breadcrumbDropdownId + '"></div></li>');

        return $('#' + breadcrumbDropdownId);
    };

    var destroyBreadcrumbDropdownDOM = function(breadcrumbDropdownId){
        if (contrail.checkIfExist($('#' + breadcrumbDropdownId).data('contrailDropdown'))) {
            $('#' + breadcrumbDropdownId).data('contrailDropdown').destroy();
            if($('li.' + breadcrumbDropdownId).hasClass('active')) {
                $('li.' + breadcrumbDropdownId).prev().addClass('active')
            }
            $('li.' + breadcrumbDropdownId).prev().find('.divider').remove();
            $('li.' + breadcrumbDropdownId).remove();
        }
    };

    return BreadcrumbView;
});