// ==UserScript==
// @name         Xplan Field Revealor
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Helps Xplan user determine the xplan field names. This is useful when using the API or Xmerge
// @author       Tim Hill
// @homepage     https://timhill-iress.github.io/xplanFieldRevealer/index.html
// @supportURL   https://github.com/timhill-iress/xplanFieldRevealer/issues
// @match        https://*.xplan.iress.co.uk/*
// @match        https://timhilltest.xplan.aws-wealth-staging-uk.iress.online/*
// @downloadURL  https://raw.githack.com/timhill-iress/xplanFieldRevealer/master/dist/xplanFieldRevealer.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addStyle() {
        var css = document.createElement('style');
        var styles = ".xplan-field-revealer .bubble{background:#ffa;border:1px solid #2b2929;display:inline-block;padding:5px;position:relative}.xplan-field-revealer .bubble:after{border-color:#ffa transparent;top:-10px;z-index:1}.xplan-field-revealer .bubble:after,.xplan-field-revealer .bubble:before{border-style:solid;border-width:0 10px 10px;content:"";display:block;position:absolute;width:0}.xplan-field-revealer .bubble:before{border-color:#2b2929 transparent;top:-11px;z-index:0}.xplan-field-revealer{margin-bottom:5px;margin-top:10px}.xplan-field-revealer-hidden{display:none}.xfr-title{font-weight:700}";
        if (css.styleSheet) css.styleSheet.cssText = styles;
        else css.appendChild(document.createTextNode(styles));

        document.getElementsByTagName("head")[0].appendChild(css);

    }

    function createFieldDetails(groupName, el) {
        var name = el.name;
        var help = [];
        try{
            var tooltip = el.dataset.orgTitle;
            if (typeof tooltip == "undefined") {
                tooltip = el.title;
            }
            if (tooltip) {
                //When the tooltip starts with a '[' e.g. '[Insurance Group] Policy Owner' this is how the field appears in Xport
                var title = tooltip.startsWith("[") ? "Xport fieldname" : "Description";
                help.push({ title: title, value: tooltip });
            }
        }catch(err){
            console.log(err);
        }

        //input names are often 'entity:policy_owner:0:', in this case policy_owner is the internal xplan field name
        var nameParts = name.split(":");
        if (nameParts.length > 1) {
            help.push({ title: "Groupname", value: groupName });
            //The internal field name is used by both Xmerge and the RAPI
            help.push({ title: "RAPI / Xmerge fieldname", value: nameParts[1] });
        }
        //The input field name may be of some help
        help.push({ title: "HTML fieldname", value: name });
        return help;

    }

    function findGroupName(el) {
        //Find parent form
        var form = el.form;
        var name = null;
        //Various ways to guess at the groupname
        //look for a hidden field with name list_name
        if (form) {
            var listName = form.querySelector("input[name=list_name]");
            if (!listName) {
                if (form.name == "editclient") {
                    name = "entity"
                }
            }else{
                name = listName.value;
            }
            var groupName = form.querySelector("input[name=group_name]");
            if( groupName && name){
                name += "_" + groupName.value;
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
            helpHtml += `<div><span class='xfr-title'>${h.title}: </span><span class='xfr-value'>${h.value}</span></div>`;
        });
        return helpHtml;
    }

    function isHidden(el) {
        return (el.offsetParent === null)
    }

    function addDivs(showHidden) {
        document.querySelectorAll("div.xplan-field-revealer").forEach( x => x.remove());
        var mainEl = document.querySelector("#pagecontent") || document.body;
        var footerEl = document.createElement('div');
        footerEl.className = "xplan-field-revealer";
        mainEl.appendChild(footerEl);
        footerEl.insertAdjacentHTML('beforeend','<p>Xplan Field Revealer(v1.0.4):</p>');


        var selected = document.querySelectorAll("select,input,textarea");
        var hiddenCount = 0;
        selected.forEach(
            function (el) {
                var groupName = findGroupName(el);
                var help = createFieldDetails(groupName, el);
                if (help) {
                    var style = 'xplan-field-revealer';
                    if( isHidden(el)){
                        if( !showHidden){
                            hiddenCount++;
                            style += ' xplan-field-revealer-hidden';
                        }
                    }
                    el.insertAdjacentHTML('afterend',`<div class="${style}"><div class="bubble">${divFormatter(help)}</div></div>`);
                }
            }
        );
        footerEl.insertAdjacentHTML('beforeend',`Found ${selected.length} fields, ${hiddenCount} are hidden.</p>`);
        if( hiddenCount > 0){
            var showHiddenEl = document.createElement('a');
            showHiddenEl.appendChild(document.createTextNode('show hidden.'));
            showHiddenEl.addEventListener('click', x => addDivs(true));
            footerEl.appendChild(showHiddenEl);
        }
    }

    addStyle();
    addDivs(false);
})();