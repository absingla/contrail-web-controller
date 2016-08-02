/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var rbacUtils = function(){
         this.configRBAC = function(model, callbackObj, options) {
             var ajaxConfig = {}, ajaxMethod, returnFlag = false,
             putData, rbacPostData, gridData, rowsCnt, dataLen, mode,
             defaultAALName = "default-api-access-list",
             rbacRuleObj, attr, uuid,
             domain = options.isGlobal ? "default-domain":
                 contrail.getCookie(cowc.COOKIE_DOMAIN),
             project, fqName = [], parentType,
             validations = [
                 {
                     key : null,
                     type : cowc.OBJECT_TYPE_MODEL,
                     getValidation : "rbacValidations"
                 },
                 {
                     key : 'rule_perms',
                     type : cowc.OBJECT_TYPE_COLLECTION,
                     getValidation : 'rbacRulePermsValidations'
                 }
             ];
             if (model.isDeepValid(validations)) {
                 attr = model.model().attributes;
                 gridData = getValueByJsonPath(options, "gridData", []);
                 rowIndex = getValueByJsonPath(options, "rowIndex");
                 mode = getValueByJsonPath(options, "mode", "");
                 putData = getValueByJsonPath(options,
                         "configData", null);
                 uuid =
                     getValueByJsonPath(putData, "api-access-list;uuid",
                                        null);
                 rbacRuleObj = {
                                   rule_object: attr.rule_object,
                                   rule_field: attr.rule_field,
                                   rule_perms: model.getRulePerms(attr)
                               };
                 if (null == uuid) {
                     fqName.push(domain);
                     if(options.isProject) {
                         parentType = "project";
                         project = contrail.getCookie(cowc.COOKIE_PROJECT);
                         fqName.push(project);
                     } else {
                         parentType = "domain";
                     }
                     fqName.push(defaultAALName);
                     putData = {};
                     putData["api-access-list"] = {};
                     putData["api-access-list"]["parent_type"] = parentType;
                     putData["api-access-list"]["fq_name"] = fqName;
                     putData["api-access-list"]["display_name"] =
                         defaultAALName;
                     putData["api-access-list"]["api_access_list_entries"] = {};
                 }

                 if (mode === ctwl.CREATE_ACTION) {
                     /* Add */
                     gridData.push(rbacRuleObj);
                     putData["api-access-list"]["api_access_list_entries"]
                         ["rbac_rule"] = gridData;
                 } else if(mode === ctwl.EDIT_ACTION) {
                     /* Edit */
                     putData["api-access-list"]["api_access_list_entries"]
                         ['rbac_rule'] = gridData;
                     putData["api-access-list"]["api_access_list_entries"]
                         ['rbac_rule'][rowIndex] = rbacRuleObj;
                 } else if(mode === "insert") {
                     /* Insert a rbac rule next to current row */
                     gridData.splice(rowIndex + 1, 0, rbacRuleObj);
                     putData["api-access-list"]["api_access_list_entries"]
                     ["rbac_rule"] = gridData;
                 }
                 dataLen =
                     putData["api-access-list"]["api_access_list_entries"]
                     ['rbac_rule'].length;
                 for (var i = 0; i < dataLen; i++) {
                     ctwu.deleteCGridData(
                         putData["api-access-list"]["api_access_list_entries"]
                             ['rbac_rule'][i]);
                 }

                 if(null == uuid) {
                     rbacPostData = {"data":[{"data": putData,
                                 "reqUrl": "/api-access-lists"}]};
                     ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                 } else {
                     rbacPostData = {"data":[{"data": putData,
                                 "reqUrl": "/api-access-list/" +
                                 uuid}]};
                     ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                 }

                 ajaxConfig.type  = "POST";
                 ajaxConfig.data  = JSON.stringify(rbacPostData);

                 contrail.ajaxHandler(ajaxConfig, function () {
                     if (contrail.checkIfFunction(callbackObj.init)) {
                         callbackObj.init();
                     }
                 }, function (response) {
                     if (contrail.checkIfFunction(callbackObj.success)) {
                         callbackObj.success();
                     }
                     returnFlag = true;
                 }, function (error) {
                     if (contrail.checkIfFunction(callbackObj.error)) {
                         callbackObj.error(error);
                     }
                     returnFlag = false;
                 });
             } else {
                 if (contrail.checkIfFunction(callbackObj.error)) {
                     callbackObj.error(model.getFormErrorText(
                             ctwc.RBAC_PREFIX_ID));
                 }
             }
             return returnFlag;
         };

         this.deleteRBAC = function(callbackObj, options) {
             var ajaxConfig = {}, returnFlag = false, i, rowIdxLen, dataLen,
             gridData = getValueByJsonPath(options, "gridData", []),
             rowIndexes = getValueByJsonPath(options, "rowIndexes"),
             putData = getValueByJsonPath(options,
                     "configData", null),
             uuid =
                 getValueByJsonPath(putData, "api-access-list;uuid",
                                null), rbacPostData;
             putData['api-access-list']['api_access_list_entries'] = {};
             putData['api-access-list']['api_access_list_entries']
                 ['rbac_rule'] = gridData;
             rowIndexes.sort(function(a, b) { return (b - a)});
             rowIdxLen = rowIndexes.length;
             for (i = 0; i < rowIdxLen; i++) {
                 var rowIndex = rowIndexes[i];
                 putData['api-access-list']['api_access_list_entries']
                     ['rbac_rule'].splice(rowIndex, 1);
             }
             dataLen =
                 putData['api-access-list']['api_access_list_entries']
                     ['rbac_rule'].length;
             for (i = 0; i < dataLen; i++) {
                 delete
                     putData['api-access-list']['api_access_list_entries']
                         ['rbac_rule'][i]['cgrid'];
             }

             rbacPostData = {"data":[{"data": putData,
                 "reqUrl": "/api-access-list/" +
                 uuid}]};
             ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
             ajaxConfig.type  = "POST";
             ajaxConfig.data  = JSON.stringify(rbacPostData);

             contrail.ajaxHandler(ajaxConfig, function () {
                 if (contrail.checkIfFunction(callbackObj.init)) {
                     callbackObj.init();
                 }
             }, function (response) {
                 if (contrail.checkIfFunction(callbackObj.success)) {
                     callbackObj.success();
                 }
                 returnFlag = true;
             }, function (error) {
                 if (contrail.checkIfFunction(callbackObj.error)) {
                     callbackObj.error(error);
                 }
                 returnFlag = false;
             });
             return returnFlag;
         };

         this.getConfigData = function(viewConfig){
             return getValueByJsonPath(viewConfig, "rbacData;configData", {});
         };

         this.getTextForRoleCrud = function(roleCrud) {
             var roleCrudArry = roleCrud.split(""), roleCrudStr = "";
             _.each(roleCrudArry, function(roleCrudKey, i){
                 _.each(ctwc.RBAC_ROLE_CRUD_LIST, function(roleCrudItem){
                     if(roleCrudKey === roleCrudItem.value) {
                         if(i === 0) {
                             roleCrudStr = roleCrudItem.text;
                         } else {
                             roleCrudStr += ", " + roleCrudItem.text;
                         }
                     }
                 });
             });
             return roleCrudStr;
         };

         this.getRBACDetailsTemplateConfig = function() {
             return {
                 templateGenerator: 'RowSectionTemplateGenerator',
                 templateGeneratorConfig: {
                     rows: [{
                         templateGenerator: 'ColumnSectionTemplateGenerator',
                         templateGeneratorConfig: {
                             columns: [{
                                 class: 'col-xs-6',
                                 rows: [{
                                     title: 'Details',
                                     templateGenerator:
                                         'BlockListTemplateGenerator',
                                     templateGeneratorConfig: [{
                                         key: "rule_object",
                                         templateGenerator: "TextGenerator",
                                         label: "Object.Property",
                                         templateGeneratorConfig: {
                                             formatter: "ObjPropFormatter"
                                         }
                                     },{
                                         key: "rule_perms",
                                         templateGenerator: "TextGenerator",
                                         label: "API Access Rules",
                                         templateGeneratorConfig: {
                                             formatter: "RoleAccessFormatter"
                                         }
                                     }]
                                 }]
                             }]
                         }
                     }]
                 }
             };
         };

         this.rbacGridColumns = function(rbacFormatters) {
             return {
                 columns: [
                    {
                         field: "rule_object",
                         name: "Object.Property",
                         sortable: true,
                         formatter: rbacFormatters.objPropFormatter
                     },
                     {
                         field: "role_name",
                         name: "Role",
                         sortable: true,
                         formatter: rbacFormatters.roleFormatter
                     },
                     {
                         field: "role_crud",
                         name: "Access",
                         sortable: true,
                         formatter: rbacFormatters.accessFormatter
                     }
                 ]
             };

         };
     };
     return rbacUtils;
 });

