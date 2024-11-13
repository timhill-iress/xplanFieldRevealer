// ==UserScript==
// @name         Xplan Field Revealor
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  Helps Xplan user determine the xplan field names. This is useful when using the API or Xmerge
// @author       Tim Hill
// @homepage     https://timhill-iress.github.io/xplanFieldRevealer/index.html
// @supportURL   https://github.com/timhill-iress/xplanFieldRevealer/issues
// @match        https://*.xplan.iress.co.uk/*
// @match        https://*.xplan.aws-wealth-staging-uk.iress.online/*
// @downloadURL  https://cdn.jsdelivr.net/gh/timhill-iress/xplanFieldRevealer/dist/xplanFieldRevealer.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addStyle() {
        let css = document.createElement('style');
        let styles = '.xplan-field-revealer .bubble{background:#f5f5f5;border:3px solid #3c1e46;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,.1);color:#3c1e46;display:inline-block;padding:10px 15px;position:relative}.xplan-field-revealer .bubble:after{border-color:#f5f5f5 transparent;top:-7px;z-index:1}.xplan-field-revealer .bubble:after,.xplan-field-revealer .bubble:before{border-style:solid;border-width:0 10px 10px;content:"";display:block;position:absolute;width:0}.xplan-field-revealer .bubble:before{border-color:#3c1e46 transparent;top:-10px;z-index:0}.xplan-field-revealer{margin-bottom:5px;margin-top:10px}.xplan-field-revealer-hidden{display:none}.xfr-title{font-weight:700}.xfr-value-rapi{color:#ff425e}';
        if (css.styleSheet) css.styleSheet.cssText = styles;
        else css.appendChild(document.createTextNode(styles));

        document.getElementsByTagName("head")[0].appendChild(css);

    }

    function createFieldDetails(groupName, el) {
        let name = el.name;
        let help = [];
        try{
            let tooltip = el.dataset.orgTitle;
            if (typeof tooltip == "undefined") {
                tooltip = el.title;
            }
            if (tooltip) {
                //When the tooltip starts with a '[' e.g. '[Insurance Group] Policy Owner' this is how the field appears in Xport
                let title = tooltip.startsWith("[") ? "Xport fieldname" : "Description";
                help.push({ title: title, value: tooltip, type: "desc" });
            }
        }catch(err){
            console.log(err);
        }

        //input names are often 'entity:policy_owner:0:', in this case policy_owner is the internal xplan field name
        let nameParts = name.split(":");
        if (nameParts.length > 1) {
            help.push({ title: "Groupname", value: groupName, type: "group" });
            //The internal field name is used by both Xmerge and the RAPI
            help.push({ title: "RAPI / Xmerge fieldname", value: nameParts[1], type: "rapi" });
        }
        //The input field name may be of some help
        help.push({ title: "HTML fieldname", value: name, type: "html" });
        return help;

    }

    function findGroupName(el) {
        //Find parent form
        let form = el.form;
        let name = null;
        //Various ways to guess at the groupname
        //look for a hidden field with name list_name
        if (form) {
            let listName = form.querySelector("input[name=list_name]");
            if (!listName) {
                if (form.name == "editclient") {
                    name = "entity"
                }
            }else{
                name = listName.value;
            }
            let groupName = form.querySelector("input[name=group_name]");
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
        let helpHtml = "";
        help.forEach(function (h) {
            helpHtml += `<div><span class='xfr-title'>${h.title}: </span><span class='xfr-value-${h.type}'>${h.value}</span></div>`;
        });
        return helpHtml;
    }

    function isHidden(el) {
        return (el.offsetParent === null)
    }

    function addDivs(showHidden) {
        document.querySelectorAll("div.xplan-field-revealer").forEach( x => x.remove());
        let mainEl = document.querySelector("#pagecontent") || document.body;
        let footerEl = document.createElement('div');
        footerEl.className = "xplan-field-revealer";
        mainEl.appendChild(footerEl);
        footerEl.insertAdjacentHTML('beforeend','<p>Xplan Field Revealer(v1.0.6):</p>');


        let selected = document.querySelectorAll("select,input,textarea");
        let hiddenCount = 0;
        selected.forEach(
            function (el) {
                let groupName = findGroupName(el);
                let help = createFieldDetails(groupName, el);
                if (help) {
                    let style = 'xplan-field-revealer';
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
            let showHiddenEl = document.createElement('a');
            showHiddenEl.appendChild(document.createTextNode('show hidden.'));
            showHiddenEl.addEventListener('click', x => addDivs(true));
            footerEl.appendChild(showHiddenEl);
        }
    }

    addStyle();
    addDivs(false);
})();
