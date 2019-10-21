// ==UserScript==
// @name         Xplan Field Revealor
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Helps Xplan user determine the xplan field names. This is useful when using the API or Xmerge
// @author       Tim Hill
// @match        https://*.xplan.iress.co.uk/*
// @downloadURL  https://raw.githack.com/timhill-iress/xplanFieldRevealer/master/dist/xplanFieldRevealer.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    /* globals jQuery */

    function addStyle() {
        var css = document.createElement('style');
        css.type = 'text/css';
        var styles = "{css}";
        if (css.styleSheet) css.styleSheet.cssText = styles;
        else css.appendChild(document.createTextNode(styles));

        document.getElementsByTagName("head")[0].appendChild(css);

    }

    function createFieldDetails(groupName, el) {
        var name = el.name;
        //input names are often 'entity:policy_owner:0:', in this case polict_owner is the internal xplan field name
        var nameParts = name.split(":");
        if (nameParts.length > 1) {
            var help = [];
            var tooltip = el.dataset.orgTitle;
            if (typeof tooltip == "undefined") {
                tooltip = el.title;
            }
            if (tooltip) {
                //When the tooltip starts with a '[' e.g. '[Insurance Group] Policy Owner' this is how the field appears in Xport
                var title = tooltip.startsWith("[") ? "Xport fieldname" : "Description";
                help.push({ title: title, value: tooltip });
            }
            help.push({ title: "Groupname", value: groupName });
            //The internal field name is used by both Xmerge and the RAPI
            help.push({ title: "RAPI / Xmerge fieldname", value: nameParts[1] });

            return help;
        }
    }

    function findGroupName(el) {
        //Find parent form
        var form = el.form;
        var name = null;
        //Various ways to guess at the groupname
        //look for a hidden field with name list_name
        if (form) {
            var listName = jQuery(form).find("input:hidden[name=list_name]").val();
            if (!listName) {
                if (form.name == "editclient") {
                    name = "entity"
                }
            }else{
                name = listName;
            }
            var groupName = jQuery(form).find("input:hidden[name=group_name]").val();
            if( groupName && name){
                name += "_" + groupName;
            }

        }
        if (name && !name.startsWith("entity")) {
            name = "entity_" + name;
        }
        return name;
    }


    function divFormatter(help) {
        var helpHtml = "";
        help.forEach(function (h) {
            helpHtml += "<div><span class='xfr-title'>" + h.title + ":</span><span class='xfr-value'>" + h.value + "</span></div>";
        });
        return helpHtml;
    }

    function tooltipFormatter(help) {
        var helpText = "";
        help.forEach(function (h) {
            helpText += h.title + ": " + h.value + "\n";
        });
        return helpText;
    }

    function addToolTips() {
        jQuery("select,input,textarea").each(
            function (i, el) {
                var groupName = findGroupName(el);
                var help = createFieldDetails(groupName, el);
                if (help) {
                    //Only set the orgTitle once!
                    if (typeof el.dataset.orgTitle == "undefined") {
                        el.dataset.orgTitle = el.title;
                    }
                    el.title = tooltipFormatter(help);
                }
            }
        );
        alert("Hover over any input control to see the Xplan Fieldname");
    }



    function addDivs() {
        jQuery("select,input[type!=hidden],textarea").each(
            function (i, el) {
                var groupName = findGroupName(el);
                var help = createFieldDetails(groupName, el);
                if (help) {
                    var newEl = jQuery('<div class="xplan-field-revealer"></div>');
                    var innerEl = jQuery('<div class="bubble">' + divFormatter(help) + '</div>');
                    newEl.append(innerEl);
                    newEl.insertAfter(el);
                }
            }
        );
    }

    addStyle();
    jQuery("div.xplan-field-revealer").remove();
    //addToolTips();
    addDivs();
})();