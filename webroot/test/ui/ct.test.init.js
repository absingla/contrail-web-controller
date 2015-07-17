/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc;

var allTestFiles = [], nmTestKarma = window.__karma__;

for (var file in nmTestKarma.files) {
    if (/Test\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

var depArray = [
    'jquery',
    'underscore',
    'validation',
    'core-constants',
    'core-utils',
    'core-formatters',
    'knockout',
    'core-cache',
    'contrail-common',

    'text!/base/contrail-web-core/webroot/views/contrail-common.view',
    'text!monitor/networking/ui/templates/networking.tmpl',
    'web-utils',

    'controller-constants',
    'controller-grid-config', 'nm-grid-config',
    'controller-graph-config', 'nm-graph-config',
    'controller-labels',
    'controller-messages',
    'controller-parsers', 'nm-parsers',
    'controller-view-config', 'nm-view-config',

    'handlebars-utils', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils', 'dashboard-utils',
    'joint.contrail', 'text', 'contrail-all-8', 'contrail-all-9'
];

require(['jquery', 'knockout'], function ($, Knockout) {
    window.ko = Knockout;
    loadCommonTemplates();
    require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, Knockout, Cache, cc, ccView, nmView, wu,
                                Constants, GridConfig, NMGridConfig, GraphConfig, NMGraphConfig, Labels, Messages, Parsers, NMParsers, ViewConfig, NMViewConfig) {
        cowc = new CoreConstants();
        cowu = new CoreUtils();
        cowf = new CoreFormatters();
        cowch = new Cache();
        kbValidation = validation;
        initBackboneValidation(_);
        initCustomKOBindings(Knockout);
        initDomEvents();

        ctwc = new Constants();
        ctwl = new Labels();
        ctwm = new Messages();

        ctwgc = new GridConfig();
        nmwgc = new NMGridConfig();

        ctwgrc = new GraphConfig();
        nmwgrc = new NMGraphConfig();

        ctwp = new Parsers();
        nmwp = new NMParsers();

        ctwvc = new ViewConfig();
        nmwvc = new NMViewConfig();

        $("body").append('<div id="pageHeader" class="navbar navbar-inverse navbar-fixed-top"> ' +
            '<div class="navbar-inner"> ' +
            '<div class="container-fluid"> ' +
            '<a href="#" class="brand"> <img class="logo" src="/img/sdn-logo.png"/> </a> ' +
            '<ul style="width:270px" class="nav ace-nav pull-right"> ' +
            '<li id="user-profile" class="hide"> ' +
            '<a data-toggle="dropdown" href="#" class="user-menu dropdown-toggle"> ' +
            '<i class="icon-user icon-only icon-2"></i> ' +
            '<span id="user_info"></span> ' +
            '<i class="icon-caret-down"></i> ' +
            '</a> ' +
            '<ul class="pull-right dropdown-menu dropdown-caret dropdown-closer" id="user_menu"> ' +
            '<li> ' +
            '<a href="logout"> ' +
            '<i class="icon-off"></i>' +
            'Logout </a>' +
            ' </li> ' +
            '</ul> ' +
            '</li> <li onclick="showMoreAlerts();"> ' +
            '<a href="javascript:void(0);"> ' +
            '<i class="icon-bell-alt icon-only icon-2"></i> <span id="alert_info">Alerts</span> <!-- <i class="icon-caret-down"></i> --> ' +
            '</a> </li> </ul> <div id="nav-search"> ' +
            '<form id="search-form" onsubmit="searchSiteMap();"> <span class="input-icon"> ' +
            '<input type="text" placeholder="Search Sitemap" class="input-small search-query" id="nav-search-input" autocomplete="off"> ' +
            '<i class="icon-search" id="nav-search-icon"></i> </span> ' +
            '</form> </div> </div> <!--/.container-fluid-->' +
            '</div> <!--/.navbar-inner--> </div>'
        );

        $("body").append('<div class="container-fluid" id="main-container"> ' +
            '<a id="menu-toggler" href="#"> ' +
            '<span></span> ' +
            '</a> ' +
            '<div id="sidebar"> ' +
            '<div id="sidebar-shortcuts"> ' +
            '</div> ' +
            '<ul id="menu" class="nav nav-list"></ul> ' +
            '</div> ' +
            '<div id="main-content" class="clearfix"> ' +
            '<div id="breadcrumbs" class="fixed"> ' +
            '<ul id="breadcrumb" class="breadcrumb"> ' +
            '</ul> ' +
            '<div class="hardrefresh breadcrumb" style="display:none"> ' +
            '<span> <i class="icon-time" style="cursor:default"></i></span><span data-bind="text:timeObj.timeStr"></span> ' +
            '<span class="loading"><i class="icon-spinner icon-spin"></i></span> ' +
            '<span class="refresh" title="refresh" style="color: #3182bd;cursor:pointer">Refresh</i></span> ' +
            '</div> ' +
            '</div> ' +
            '<div id="page-content" class="clearfix"> ' +
            '<div id="content-container"></div> ' +
            '</div> ' +
            '</div> </div>'
        );
        $("body").append(ccView);
        $("body").append(nmView);

        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/bootstrap/css/bootstrap.min.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/bootstrap/css/bootstrap-responsive.min.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/jquery-ui/css/jquery-ui.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.jquery.ui.css"/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/font-awesome/css/font-awesome.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/nvd3/css/nv.d3.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/select2/styles/select2.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/datetimepicker/styles/jquery.datetimepicker.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/slickgrid/styles/slick.grid.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/jquery/css/jquery.steps.css/>');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/jquery-contextMenu/css/jquery.contextMenu.css/>');

        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail-all.css" />');

        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.layout.css" />');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.elements.css" />');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.responsive.css" />');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.custom.css" />');
        $("body").append('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.font.css" />');

        requirejs(['text!menu.xml'], function(menuXML){
            requirejs(['mockdata-core-slickgrid', 'co-test-utils'], function(CoreSlickGridMockData, TestUtils){
                var fakeServer = sinon.fakeServer.create();
                console.log();
                TestUtils.getRegExForUrl()
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/api/admin/webconfig/featurePkg/webController'), [200, {"Content-Type": "application/json"}, JSON.stringify(CoreSlickGridMockData.webControllerMockData)]);
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/api/admin/webconfig/features/disabled'), [200, {"Content-Type": "application/json"}, JSON.stringify(CoreSlickGridMockData.disabledFeatureMockData)]);
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/api/service/networking/web-server-info'), [200, {"Content-Type": "application/json"}, JSON.stringify(CoreSlickGridMockData.webServerInfoMockData)]);
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/menu.xml'), [200, {"Content-Type": "application/xml"}, menuXML]);

                requirejs(['controller-utils', 'nm-utils', 'contrail-layout', '/base/contrail-web-controller/webroot/monitor/networking/ui/js/networking.main.js'], function (ControllerUtils, NMControllerUtils) {
                    ctwu = new ControllerUtils();
                    nmwu = new NMControllerUtils();
                    //TODO: Auto Respond = True
                    while(fakeServer.queue.length > 0){
                        fakeServer.respond();
                    }

                    ctInitComplete = true;
                    require(allTestFiles, function () {
                        requirejs.config({
                            // dynamically load all test files
                            deps    : allTestFiles,
                            callback: window.__karma__.start
                        });
                    });
                });
            });
        });
    });
});

function initBackboneValidation (_) {
    _.extend(kbValidation.callbacks, {
        valid  : function (view, attr, selector) {
            /*
             var $el = $(view.modalElementId).find('[name=' + attr + ']'),
             $group = $el.closest('.form-element');

                 $group.removeClass('has-error');
             $group.find('.help-block').html('').addClass('hidden');
             */
        },
        invalid: function (view, attr, error, selector, validation) {
            var model = view.model;
            model.validateAttr(attr, validation);
            /*
             var $el = $(view.modalElementId).find('[name=' + attr + ']'),
             $group = $el.closest('.form-element');
             $group.addClass('has-error');
             $group.find('.help-block').html(error).removeClass('hidden');
             */
        }
    });
};

function initCustomKOBindings (Knockout) {
    Knockout.bindingHandlers.contrailDropdown = {
        init  : function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueObj = valueAccessor(),
                allBindings = allBindingsAccessor(),
                dropDown = $(element).contrailDropdown(valueObj).data('contrailDropdown');

            if (allBindings.value) {
                var value = Knockout.utils.unwrapObservable(allBindings.value);
                if (typeof value === 'function') {
                    dropDown.value(value());
                } else {
                    dropDown.value(value);
                }
            }
            else {
                dropDown.value('');
            }

            Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).select2('destroy');
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).trigger('change');
        }
    };

    Knockout.bindingHandlers.contrailMultiselect = {
        init  : function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueObj = valueAccessor(),
                allBindings = allBindingsAccessor(),
                lookupKey = allBindings.lookupKey,
                multiselect = $(element).contrailMultiselect(valueObj).data('contrailMultiselect');

            if (allBindings.value) {
                var value = Knockout.utils.unwrapObservable(allBindings.value);
                if (typeof value === 'function') {
                    multiselect.value(value());
                } else {
                    multiselect.value(value);
                }
            }

            Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).select2('destroy');
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).trigger('change');
        }
    };

    Knockout.bindingHandlers.select2 = {
        init: function (element, valueAccessor) {
            var options = Knockout.toJS(valueAccessor()) || {};
            setTimeout(function () {
                $(element).select2(options);
            }, 0);
        }
    };

    var updateSelect2 = function (element) {
        var el = $(element);
        if (el.data('select2')) {
            el.trigger('change');
        }
    }
    var updateSelect2Options = Knockout.bindingHandlers['options']['update'];

    Knockout.bindingHandlers['options']['update'] = function (element) {
        var r = updateSelect2Options.apply(null, arguments);
        updateSelect2(element);
        return r;
    };

    var updateSelect2SelectedOptions = Knockout.bindingHandlers['selectedOptions']['update'];

    Knockout.bindingHandlers['selectedOptions']['update'] = function (element) {
        var r = updateSelect2SelectedOptions.apply(null, arguments);
        updateSelect2(element);
        return r;
    };
};

function initDomEvents () {
    $(document)
        .off('click', '.group-detail-action-item')
        .on('click', '.group-detail-action-item', function (event) {
            if (!$(this).hasClass('selected')) {
                var thisParent = $(this).parents('.group-detail-container'),
                    newSelectedView = $(this).data('view');

                thisParent.find('.group-detail-item').hide();
                thisParent.find('.group-detail-' + newSelectedView).show();

                thisParent.find('.group-detail-action-item').removeClass('selected');
                $(this).addClass('selected');

                if (contrail.checkIfExist($(this).parents('.slick-row-detail').data('cgrid'))) {
                    $(this).parents('.contrail-grid').data('contrailGrid').adjustDetailRowHeight($(this).parents('.slick-row-detail').data('cgrid'));
                }
            }
        });

    $(document)
        .off('click', '.input-type-toggle-action')
        .on('click', '.input-type-toggle-action', function (event) {
            var input = $(this).parent().find('input');
            if (input.prop('type') == 'text') {
                input.prop('type', 'password');
                $(this).removeClass('blue');
            } else {
                input.prop('type', 'text');
                $(this).addClass('blue');
            }
        });
};

function loadCommonTemplates() {
    //Set the base URI
    if (document.location.pathname.indexOf('/vcenter') == 0)
        $('head').append('<base href="/vcenter/" />');
    templateLoader = (function ($, host) {
        //Loads external templates from path and injects in to page DOM
        return {
            loadExtTemplate: function (path, deferredObj, containerName) {
                if (deferredObj != null)
                    deferredObj.resolve();
            }
        };
    })(jQuery, document);
};