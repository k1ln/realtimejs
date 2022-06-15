class Xvarglobal {
    constructor() {
        this.caching = false;
        this.Templatesloaded = false;
        this.Xvars_for_while_update = [];
        this.Xvars_style_for_while_update = [];
        this.Xvars = [];
        this.Templates = [];
        this.Xvars_template_for_while_update = [];
        this.Xvars_props_for_while_update = [];
        this.Xvars_list_for_while_update = [];
        this.validator = {
            bindElement: 'real-x',
            caching: false,
            get(target, key) {
                if (typeof target[key] === 'object' && target[key] !== null && target[key].function == undefined) {
                    return new Proxy(target[key], XVARCLASS.validator)
                } else {
                    var newkey = key.replaceAll("!", "");
                    if (target[key] !== undefined || target[newkey] !== undefined) {
                        if (key.substr(0, 1) == "!") {
                            if (key.substr(0, 2) == "!!") {
                                return target[newkey];
                            } else {
                                var funct = () => {
                                    return target[key].value;
                                };
                                var functstring = funct.toString();
                                var targetnewkeyfunctiontoString = target[newkey].function.toString();
                                if (target[newkey].function !== undefined && targetnewkeyfunctiontoString != functstring) {
                                    var txt = target[newkey].function.toString();
                                    var pos1 = txt.indexOf("{") + 1;
                                    var pos2 = txt.lastIndexOf("}");
                                    var txtfunc = txt.substr(pos1, pos2 - pos1);
                                    return txtfunc;
                                } else {
                                    if (target[newkey].function !== undefined) {
                                        return target[newkey].function();
                                    } else {
                                        return target[newkey].value;
                                    }
                                }
                            }
                        } else {
                            if (target[key].function !== undefined) {
                                if (this.caching == false) {
                                    return target[key].function();
                                } else {
                                    return target[key].value;
                                }
                            } else {

                                return target[key].value;
                            }
                        }
                    }
                }
            },
            set(target, key, value) {
                if (typeof target[key] !== 'object') {
                    target[key] = {};
                }
                if (XVARCLASS.Xvars.includes(target[key]) == false) {
                    XVARCLASS.Xvars[XVARCLASS.Xvars.length] = target[key];
                }
                target[key].parent = target;

                if (typeof value == 'string') {
                    var value2 = value.replace(/ {4}|[\t\n\r]/gm, '');
                    // var value2 = value;
                    if (value2.substr(0, 2) == "$:") {
                        if (value2.substr(0, 4) == '$:()') {
                            value2 = value2.replaceAll(";", ";\n")
                            target[key].function = new Function(value2.substr(4, value2.length - 4));
                        } else {
                            target[key].function = new Function("return " + value2.substr(2, value2.length - 2));
                        }
                        if (this.caching == true) {
                            var TopParent = false;
                            var parent = {};
                            while (TopParent == false) {
                                if (target.parent !== undefined) {
                                    parent = target.parent;
                                } else {
                                    parent = target;
                                }
                                TopParent == true;
                            }
                            if (TopParent) {
                                var keys = parent.keys();
                                var i = 0;
                                while (i < keys.length) {
                                    //console.log(keys[i]);
                                    i++;
                                }
                            }
                        }
                        try {
                            target[key].value = target[key].function();
                        } catch (e) {
                            target[key].value = "#ERROR SEE LOG"
                            console.log("Following error happened at target:" + target + " key:" + key);
                            console.log(e);
                        }
                    } else {
                        target[key].value = value;
                        target[key].function = () => {
                            return target[key].value;
                        }
                    }

                } else if (typeof value == "function") {
                    target[key].function = value;
                    target[key].value = target[key].function();
                } else {

                    target[key].value = value;
                    target[key].function = () => {
                        return target[key].value;
                    }
                }

                XVARCLASS.updateXElements();
                XVARCLASS.updateStyleElements();
                XVARCLASS.updateTemplateElements();
                XVARCLASS.updatePropsElements();
                return true;
            }
        }
    }

    async awaitPost(url, requestobject) {
        var xhr = new XMLHttpRequest();
        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 300) {
                        reject("Error, status code = " + xhr.status)
                    } else {
                        if (xhr.responseText === "Session abgelaufen!") {
                            console.log("Session abgelaufen")
                            resolve(xhr.responseText);
                        } else {
                            resolve(JSON.parse(xhr.responseText));
                        }
                    }
                }
            }.bind(this);
            xhr.open('POST', url, true)
            if (requestobject instanceof FormData) {
                xhr.send(requestobject);
            } else {
                xhr.send(JSON.stringify(requestobject));
            }
        }.bind(this));
    }

    updateElementProps(key) {
        var element = this.Xvars_props_for_while_update[key];
        var ii = 0;
        var elementlength = element.length;
        while (ii < elementlength) {
            if (element[ii] == undefined) {
                this.Xvars_props_for_while_update[key].splice(ii, 1);
                element = this.Xvars_props_for_while_update[key];
                elementlength = element.length;
            } else {
                if (this.parse(element[ii].props) !== element[ii].el.getAttribute("x-props")) {
                    element[ii].el.setAttribute("x-props", this.parse(element[ii].props));
                }
                ii++;
            }
        }
    }

    updatePropsElements(l) {
        if (l !== undefined) {
            if (this.Xvars_props_for_while_update[l]) {
                this.updateElementProps(l);
            }
        } else {
            var i = 0;
            var keys = Object.keys(this.Xvars_props_for_while_update);
            var Xvars_props_for_while_update_length = keys.length;
            while (i < Xvars_props_for_while_update_length) {
                this.updateElementProps(keys[i]);
                i++;
            }
        }

    }

    updateElementTemplate(key) {
        var element = this.Xvars_template_for_while_update[key];
        var ii = 0;
        var elementlength = element.length;
        while (ii < elementlength) {
            if (element[ii] == undefined) {
                this.Xvars_template_for_while_update[key].splice(ii, 1);
                element = this.Xvars_template_for_while_update[key];
                elementlength = element.length;
            } else {
                if (this.parse(element[ii].templatefile) !== element[ii].el.getAttribute("x-name")) {
                    element[ii].el.setAttribute("x-name", this.parse(element[ii].templatefile));
                }
                ii++;
            }
        }
    }

    updateTemplateElements(l) {
        if (l !== undefined) {
            if (this.Xvars_templkate_for_while_update[l]) {
                this.updateElementTemplate(l);
            }
        } else {
            var i = 0;
            var keys = Object.keys(this.Xvars_template_for_while_update);
            var Xvars_template_for_while_update_length = keys.length;
            while (i < Xvars_template_for_while_update_length) {
                this.updateElementTemplate(keys[i]);
                i++;
            }
        }

    }


    updateElementStyle(key) {
        var element = this.Xvars_style_for_while_update[key];
        var ii = 0;
        var elementlength = element.length;
        while (ii < elementlength) {
            if (element[ii] == undefined) {
                this.Xvars_style_for_while_update[key].splice(ii, 1);
                element = this.Xvars_style_for_while_update[key];
                elementlength = element.length;
            } else {
                // Hier style anpassen
                var obj = element[ii];
                var value = this.parse(obj.value);
                if (obj.isStyle) {
                    if (obj.el.style[obj.styleAttr] !== value) {
                        obj.el.style[obj.styleAttr] = value;
                    }
                } else {
                    if (obj.el.getAttribute(obj.styleAttr) !== value) {
                        obj.el.setAttribute(obj.styleAttr, value);
                    }
                }
                ii++;
            }
        }
    }

    updateStyleElements(l) {
        if (l !== undefined) {
            if (this.Xvars_style_for_while_update[l]) {
                this.updateElementStyle(l);
            }
        } else {
            var i = 0;
            var keys = Object.keys(this.Xvars_style_for_while_update);
            var Xvars_style_for_while_update_length = keys.length;
            while (i < Xvars_style_for_while_update_length) {
                this.updateElementStyle(keys[i]);
                i++;
            }
        }

    }

    updateXElements() {
        var i = 0;
        var keys = Object.keys(this.Xvars_for_while_update);
        var Xvars_for_while_update_length = keys.length;
        while (i < Xvars_for_while_update_length) {
            var element = this.Xvars_for_while_update[keys[i]];

            var ii = 0;
            var elementlength = element.length;
            while (ii < elementlength) {
                if (element[ii] == undefined) {
                    this.Xvars_for_while_update[keys[i]].splice(ii, 1);
                    element = this.Xvars_for_while_update[keys[i]];
                    elementlength = element.length;
                } else {
                    var value = this.parse(element[ii].dataset.link);
                    if (element[ii].tagName == "INPUT") {
                        element[ii].value = value;
                    } else {
                        element[ii].innerHTML = value;
                    }

                    ii++;
                }
            }
            i++;
        }
    }

    parse(str) {
        if (str.substr(0, 5) !== 'props') {
            try {
                return Function(`'use strict'; return (${str})`)()
            } catch {
                return undefined;
            }  
        }
    }

    pushy(element, link) {
        if (link.substr(0, 5) !== "props") {
            if (XVARCLASS.Xvars_for_while_update[link] == undefined) {
                XVARCLASS.Xvars_for_while_update[link] = [];
            }
            if (XVARCLASS.Xvars_for_while_update[link].includes(element) == false) {
                XVARCLASS.Xvars_for_while_update[link].push(element);
            };

        }
    }

    pushvar(x) {
        this.Xvars[this.Xvars.length] = x;
    }
}

XVARCLASS = new Xvarglobal();

class Xvar {
    constructor() {
        var x = {};
        //XVARCLASS.Xvars_for_while_update.push(x);

        return new Proxy(x, XVARCLASS.validator);
    }
    static table(rows) {
        var x = {};
        var i = 0;
        while (i < rows) {
            var xx = {};
            //xx.title = title + "[" + i + "]";
            //XVARCLASS.Xvars_for_while_update.push(xx);
            x[i] = new Proxy(xx, XVARCLASS.validator);
            i++;
        }
        return x;
    }

    static async awaitPost(url, requestobject) {
        var xhr = new XMLHttpRequest();
        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 300) {
                        reject("Error, status code = " + xhr.status)
                    } else {
                        if (xhr.responseText === "Session abgelaufen!") {
                            console.log("Session abgelaufen")
                            resolve(xhr.responseText);
                        } else {
                            resolve(JSON.parse(xhr.responseText));
                        }
                    }
                }
            }.bind(this);
            xhr.open('POST', url, true)
            if (requestobject instanceof FormData) {
                xhr.send(requestobject);
            } else {
                xhr.send(JSON.stringify(requestobject));
            }
        }.bind(this));
    }

    static checkForXvar(newValue) {
        var attributeType = 'string';
        if (newValue) {
            var keyarr = newValue.split("[");
            if (keyarr.length > 1) {
                //parent.innerHTML = '';
                var key = keyarr[keyarr.length - 1];
                key = key.replaceAll("]", "").replaceAll("\"", "").replaceAll("'", "");
                key = '!!' + key;
                var i = 1;
                var link = keyarr[0];
                while (i < keyarr.length) {
                    if (i < keyarr.length - 1) {
                        link = link + "[" + keyarr[i];
                    } else {
                        link = link + "['" + key + "']";
                    }
                    i++;
                }
                try {
                    var blxvar = Function(`'use strict'; return XVARCLASS.Xvars.includes(${link});`)();
                    if (blxvar == true) {
                        attributeType = 'Xvar';
                    }
                } catch {}
                //console.log("newValueType:" + atrributeType);
            }
            return attributeType;
        }

    }

    static createXel(element, attributes) {
        var htmlelement = HTMLElementsArr[element];
        //var str =  `${user.name} liked your post about strings`;
        var str = `
        class X${element} extends ${htmlelement} {
            constructor(...args) {
                super(...args);
                //console.log("Custom div Element constructing!");
                this.subscribedAttributes = [];
        }
        static get observedAttributes() {return ["data-x","data-link","x-repeat","repeat-x",`;

        var iattributes = 0;
        var attributeslength = attributes.length;
        while (iattributes < attributeslength) {
            if (HTMLStyleAttributesArr[attributes[iattributes]] !== undefined) {
                attributes[iattributes] = "style-" + attributes[iattributes];
            }
            if (iattributes == attributeslength - 1) {
                str += "'" + attributes[iattributes] + "'";
            } else {
                str += "'" + attributes[iattributes] + "',";
            }
            iattributes++;
        }
        str += "];}";
        str += `
        connectedCallback() {
            var link = this.dataset.link;
            if(link !== undefined) {
                if(XVARCLASS.Xvars_for_while_update[link]==undefined) {
                    XVARCLASS.Xvars_for_while_update[link] = [];
                } 
                if(XVARCLASS.Xvars_for_while_update[link].includes(this)==false) {
                    XVARCLASS.Xvars_for_while_update[link].push(this);
                } 
                this.innerHTML = this.parse(link);
            }
        }
    
        parse(str) {
            if(str.substr(0,5)!=="props") {
              try {
                return Function(\`'use strict'; return (\${str})\`)()
              } catch {
                return undefined;
              }
            }
        }
    
        disconnectedCallback() {
            var link = this.dataset.link;
            if(link !== undefined) {
                var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
                if (index > -1) {
                    XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
                }
            }
            this.cleanStyleWhileArray();
        }
        resetchildnodes(element,props)
        {
            var children = element.childNodes;
            if(children!==undefined) {
                var ichildren = 0;
                var childrenlength = children.length;
                while(ichildren<childrenlength) {
                    var digdeeper = true;
                    if(children[ichildren].getAttribute !== undefined 
                    && children[ichildren].getAttribute("is") !== undefined
                    && children[ichildren].getAttribute("is") !== null) {
                        //console.log(children[ichildren].getAttribute("is"));
                        if(children[ichildren].getAttribute("is").substr(0,2)=="x-") {
                            for (var i = 0, atts = children[ichildren].attributes, n = atts.length, arr = []; i < n; i++){
                              if(HTMLStyleAttributes.includes(atts[i].nodeName.substr(6,atts[i].nodeName.length-6))|| 
                              EventsArr.includes(atts[i].nodeName)) {
                                children[ichildren].setAttribute(atts[i].nodeName,atts[i].nodeValue.replace("props",props));
                              }
                            }
                            var xprops = children[ichildren].getAttribute("data-link");
                            if(xprops !== undefined && xprops !== '' && xprops!==null
                            && children[ichildren].getAttribute("data-link") !== xprops.replace("props",props)) {
                                children[ichildren].setAttribute("data-link",xprops.replace("props",props));
                            }
                            var xprops = children[ichildren].getAttribute("x-repeat");
                            if(xprops !== undefined && xprops !== '' && xprops !== null) {
                                digdeeper = false;
                                if(children[ichildren].getAttribute("x-repeat") !== xprops.replace("props",props)) {
                                    children[ichildren].setAttribute("x-repeat",xprops.replace("props",props));
                                }
                            }
                        }
                    } 
                    else if(children[ichildren].tagName=="X-TEMPLATE") {
                        var xprops = children[ichildren].getAttribute("x-name");
                        if(xprops !== undefined && xprops !== '') {
                            children[ichildren].setAttribute("x-name", xprops.replace("props",props));
                        }
                        var xprops = children[ichildren].getAttribute("x-props");
                        if(xprops !== undefined && xprops !== '') {
                            children[ichildren].setAttribute("x-props",xprops.replace("props",props));
                        }
                        digdeeper = false;
                    }
                    if(digdeeper) {
                        this.resetchildnodes(children[ichildren],props);
                    }
                    ichildren++;                
                }
            }
            
            return;
        }
        cleanStyleWhileArray()
        {
            var keys = Object.keys(XVARCLASS.Xvars_style_for_while_update);
            var iarr = 0;
            var Xlength = keys.length
    
            while(iarr < Xlength) {
                var iiarr = 0;
                var k = XVARCLASS.Xvars_style_for_while_update[keys[iarr]]
                var klength = k.length;
                while(iiarr < klength) {
                    if(k[iiarr]==undefined || k[iiarr].el == this) {
                        k.splice(iiarr, 1);
                        iiarr--;
                        klength = k.length;
                    }
                    iiarr++;
                }
                iarr++;
            }
        }
        attributeChangedCallback(name, oldValue, newValue) {
            //console.log("AttributeName"+name);
            if(name == "data-x") {
                this.innerHTML = newValue;
            }
            else if(name=="data-link") {
                var link = oldValue;
                if(XVARCLASS.Xvars_for_while_update[link]) {
                    var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
                    if (index > -1) {
                        XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
                    }
                }
                   
                var link = newValue;
                if(link.substr(0,5)!=="props") {
                    if(XVARCLASS.Xvars_for_while_update[link]==undefined) {
                        XVARCLASS.Xvars_for_while_update[link] = [];
                    } 
                    if(XVARCLASS.Xvars_for_while_update[link].includes(this)==false) {
                        XVARCLASS.Xvars_for_while_update[link].push(this);
                    } 
                }
            }
            else if (name=="repeat-x" || name=="x-repeat") {
                var templstr = "";
                if(this.getAttribute("data-firstload")==null) {
                  this.setAttribute("data-template",this.innerHTML);
                  this.setAttribute("data-firstload",true);
                  templstr = this.innerHTML;
                } else {
                  templstr = this.getAttribute("data-template",this.innerHTML);
                }
                this.xrepeat = newValue;
                var templstr2 = "";
                if(this.tagName=="TBODY") {
                  templstr2 = "<table><tbody>";
                  templstr2 += templstr;
                  templstr2 += "</tbody></table>";
                  templstr = templstr2;
                }
                if(this.tagName=="TABLE") {
                  templstr2 = "<table>";
                  templstr2 += templstr;
                  templstr2 += "</table>";
                  templstr = templstr2;
                }
                if(templstr=="") {
                    document.addEventListener("DOMContentLoaded", function (){
                        var newValue = this.xrepeat;
                        var arr = this.parse(newValue);
                        templstr = this.innerHTML;
                        if(arr) {
                            var keys = Object.keys(arr);
                            var keyslength = keys.length;
                            if(keyslength > 0) {
                                var bigstr = "";
                                var ikeys = 0;
                                //console.log(this);
                                while(ikeys<keyslength) {
                                    var newValuestr = newValue + "[" + ikeys + "]";
                                    let doc = document.implementation.createHTMLDocument();
                                    doc.body.innerHTML = templstr;
                                    this.resetchildnodes(doc.body,newValuestr);
                                    
                                    if(this.tagName=="TBODY") {
                                      bigstr += doc.body.getElementsByTagName("tbody")[0].innerHTML;
                                    } else if(this.tagName=="TABLE") {
                                      bigstr += doc.body.getElementsByTagName("table")[0].innerHTML;
                                    } else {
                                      bigstr += doc.body.innerHTML;
                                    }
                                      ikeys++;
                                }
                                this.innerHTML = bigstr;
                            }
                        }
                    }.bind(this));
                }
                else
                {
                    var arr = this.parse(newValue);
                    if(arr) {
                        var keys = Object.keys(arr);
                        var keyslength = keys.length;
                        if(keyslength > 0) {
                            var bigstr = "";
                            var ikeys = 0;
                            //console.log(this);
                            while(ikeys<keyslength) {
                                var newValuestr = newValue + "[" + ikeys + "]";
                                let doc = document.implementation.createHTMLDocument();
                                
                                doc.body.innerHTML = templstr;
                                
                                this.resetchildnodes(doc.body,newValuestr);
                                
                                if(this.tagName=="TBODY") {
                                  bigstr += doc.body.getElementsByTagName("tbody")[0].innerHTML;
                                } else if(this.tagName=="TABLE") {
                                  bigstr += doc.body.getElementsByTagName("table")[0].innerHTML;
                                } else {
                                  bigstr += doc.body.innerHTML;
                                }
                                ikeys++;
                            }
                            this.innerHTML = bigstr;
                        }
                    }
                }
            }
            else
            {
                var cssName = name.replace("style-","");
                var attributeType = 'string'; 
                var keyarr = newValue.split("[");
                if(keyarr.length > 1) {
                    //parent.innerHTML = '';
                    var key = keyarr[keyarr.length-1];
                    key     = key.replaceAll("]","").replaceAll("\\"","").replaceAll("'","");
                    key = '!!'+key;
                    var i = 1;
                    var link = keyarr[0];
                    while(i<keyarr.length) {
                        if(i<keyarr.length-1) {
                            link = link + "[" + keyarr[i];
                        } else {
                            link = link + "['" + key + "']";
                        }
                        i++;
                    }
                }
                try {
                    var blxvar = Function(\`'use strict'; return XVARCLASS.Xvars.includes(\${link});\`)();
                    if(blxvar==true) {
                        attributeType = 'Xvar';    
                    }
                }
                catch{}
                //console.log("newValueType:" + attributeType);
                var isStyle = true;
                var css = HTMLStyleAttributesArr[cssName];
                this.cleanStyleWhileArray();
                if(attributeType=='Xvar') {
                    if(css!==undefined) {
                        var value = this.parse(newValue);
                        if (this.style[css]!==value) {
                            this.style[css] = value;
                        }
                    } else {
                        css = cssName;
                        isStyle = false;
                        this.setAttribute(name,Function(\`'use strict'; return \${newValue};\`)());
                    }
                    if (this.subscribedAttributes[cssName]==undefined) {
                        var obj = {};
                        obj.el = this;
                        obj.styleAttr = css;
                        obj.isStyle = isStyle;
                        obj.value = newValue;
                        if (XVARCLASS.Xvars_style_for_while_update[newValue] == undefined) {
                            XVARCLASS.Xvars_style_for_while_update[newValue] = [];
                        }
                        XVARCLASS.Xvars_style_for_while_update[newValue].push(obj);
                    }
                    this.subscribedAttributes[cssName] = true;
                } else {
                    if(css!==undefined) {
                        var value = this.parse(newValue);
                        if(value!==undefined) {
                          if (this.style[css]!==value) {
                              this.style[css] = value;
                          }
                        } else {
                          if (this.style[css]!==newValue) {
                              this.style[css] = newValue;
                          }
                        }
                    }
                }
            }   
        }
    }
    
    customElements.define('x-${element}', X${element}, { extends: "${element}" });
    `;
        const script = document.createElement("script");
        script.textContent = str;
        //console.log(str);
        document.head.appendChild(script);
        //console.log(str);
    }

    static async awaitLoad(url) {
        var xhr = new XMLHttpRequest();
        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 300) {
                        reject("Error, status code = " + xhr.status)
                    } else {
                        resolve(xhr.responseText);
                    }
                }
            };
            xhr.open('GET', url, true)
            xhr.send();
        });
    }

    static updateTemplateComponents() {
        XVARCLASS.Templatesloaded = true;
        //console.log(document.readyState);
        if (document.readyState === 'complete'||document.readyState === 'interactive') {
            //console.log("UPdate!")
            var templates = document.getElementsByTagName("x-template");
            var itemplate = 0;
            var templateslength = templates.length;
            while (itemplate < templateslength) {
                templates[itemplate].renderAfterTemplatesLoaded();
                itemplate++;
            };
        } else {
            setTimeout(this.updateTemplateComponents, 10);
        }
    }

    static async loadTemplates(templates) {
        var i = 0;
        //console.log(2);
        while (i < templates.length) {
            var str = await Xvar.awaitLoad(templates[i].url);
            if (str.substr(0, 5) !== 'Error') {
                XVARCLASS.Templates[templates[i].name] = str;
            }
            //console.log("Templates loading"+i);
            i++;
        }
        //console.log("Templates loaded")
        this.updateTemplateComponents();
        return;
    }
    static setInnerHTML(elm, html, props) {
        elm.innerHTML = html;
        //console.log("SetNewscripts");
        Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes)
                .forEach(attr => newScript.setAttribute(attr.name, attr.value));
            var script = oldScript.innerHTML; 
            if(props){
                script = script.replaceAll("props",props)
            }
            newScript.appendChild(document.createTextNode(script));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
}


class xelement extends HTMLElement {
    constructor() {
        super();
        // element created
    }

    connectedCallback() {
        var link = this.dataset.link;
        if (XVARCLASS.Xvars_for_while_update[link] == undefined) {
            XVARCLASS.Xvars_for_while_update[link] = [];
        }
        if (XVARCLASS.Xvars_for_while_update[link].includes(this) == false) {
            XVARCLASS.Xvars_for_while_update[link].push(this);
        }
        this.innerHTML = this.parse(link);
    }

    parse(str) {
        if (str.substr(0, 5) !== "props") {
            try {
                return Function(`'use strict'; return (${str})`)();
            } catch {
                return undefined;
            }
            
        }
    }

    disconnectedCallback() {
        var link = this.dataset.link;
        var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
        if (index > -1) {
            XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
        }
    }

    static get observedAttributes() {
        return ["data-x", "data-link"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "data-x") {
            this.innerHTML = newValue;
        } else if (name == "data-link") {
            var link = oldValue;
            if (oldValue) {
                var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
                if (index > -1) {
                    XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
                }
            }

            var link = newValue;
            if (XVARCLASS.Xvars_for_while_update[link] == undefined) {
                XVARCLASS.Xvars_for_while_update[link] = [];
            }
            if (XVARCLASS.Xvars_for_while_update[link].includes(this) == false) {
                XVARCLASS.Xvars_for_while_update[link].push(this);
            }
        }
    }
}

customElements.define("real-x", xelement);

class RealInput extends HTMLInputElement {
    constructor(...args) {
        super(...args);
        this.formulavisible = false;
        //var shadowRoot = this.attachShadow({mode: 'open'});

        /*let inputElement = document.createElement('input');
        inputElement.setAttribute('type', this.getAttribute('type'));
        
        inputElement.addEventListener('input', () => {
          console.log('focus on spot input');
        });
        
        this.shadowRoot.appendChild(inputElement);
        */
        /*let span = document.createElement('span');
        span.addEventListener('dblclick', () => {
          this.innerHTML = '';
          this.parentNode.formulavisible = true;
            
          let inputElement = document.createElement('input');
          inputElement.setAttribute('type', text);
          inputElement.value = Function(`'use strict'; return (${this.parentNode.dataset.link})`)(); 
          inputElement.addEventListener('input', () => {
              Function(`'use strict'; ${this.parent.dataset.link} = ${this.value};`)()
          });
          this.shadowRoot.appendChild(inputElement);
        });
        span.innerHTML = Function(`'use strict'; return (${this.dataset.link})`)();
        shadowRoot.appendChild(span);*/
    }
    static get observedAttributes() {
        return ["data-x", "data-link"];
    }

    connectedCallback() {
        var link = this.dataset.link;
        this.style.display = 'block';
        let span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.height = this.parentNode.offsetHeight;
        span.style.width = this.parentNode.offsetWidth;

        span.setAttribute("data-link", this.dataset.link);
        span.addEventListener('dblclick', this.changeToInput);
        var func = this.dataset.link;
        span.innerHTML = Function('return (' + func + ')')();
        this.appendChild(span);
        XVARCLASS.pushy(span, link);
    }




    parse(str) {
        try{
            return Function(`'use strict'; return (${str})`)()
        } catch {
            return undefined
        }
    }

    disconnectedCallback() {

    }

    static get observedAttributes() {
        return ["data-link"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "data-link" && oldValue !== newValue) {

        }
    }

}

customElements.define("real-input", RealInput);

class InputX extends HTMLElement {
    constructor(...args) {
        super(...args);
        this.formulavisible = false;
        //var shadowRoot = this.attachShadow({mode: 'open'});

        /*let inputElement = document.createElement('input');
        inputElement.setAttribute('type', this.getAttribute('type'));
        
        inputElement.addEventListener('input', () => {
          console.log('focus on spot input');
        });
        
        this.shadowRoot.appendChild(inputElement);
        */
        /*let span = document.createElement('span');
        span.addEventListener('dblclick', () => {
          this.innerHTML = '';
          this.parentNode.formulavisible = true;
            
          let inputElement = document.createElement('input');
          inputElement.setAttribute('type', text);
          inputElement.value = Function(`'use strict'; return (${this.parentNode.dataset.link})`)(); 
          inputElement.addEventListener('input', () => {
              Function(`'use strict'; ${this.parent.dataset.link} = ${this.value};`)()
          });
          this.shadowRoot.appendChild(inputElement);
        });
        span.innerHTML = Function(`'use strict'; return (${this.dataset.link})`)();
        shadowRoot.appendChild(span);*/
    }
    static get observedAttributes() {
        return ["data-x", "data-link"];
    }

    connectedCallback() {
        var link = this.dataset.link;
        this.style.display = 'block';
        if (this.style.width == 0) {
            this.style.width = 'auto';
            //this.style.minWidth = this.style.width;

        }
        if (this.style.height == 0) {
            this.style.height = 'auto';
            //this.style.minHeight = this.style.height;
        }
        //this.innerHTML = "<span>"+this.parse(link)+"</span>";
        let span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.height = this.parentNode.offsetHeight;
        span.style.width = this.parentNode.offsetWidth;

        span.setAttribute("data-link", this.dataset.link);
        span.addEventListener('dblclick', this.changeToInput);
        var func = this.dataset.link;
        span.innerHTML = Function('return (' + func + ')')();
        this.appendChild(span);
        XVARCLASS.pushy(span, link);
    }

    createSpan() {
        this.innerHTML = '';
        let span = document.createElement('span');
        span.setAttribute("data-link", this.dataset.link);
        span.addEventListener('dblclick', this.changeToInput);
        span.innerHTML = Function(`'use strict'; return (${this.dataset.link})`)();
        this.appendChild(span);
    }

    changeToSpan() {
        var parent = this.parentNode;
        var link = parent.dataset.link;
        parent.innerHTML = '';
        let span = document.createElement('span');
        span.setAttribute("data-link", link);
        span.addEventListener('dblclick', parent.changeToInput);
        span.innerHTML = Function(`'use strict'; return (${link})`)();
        parent.appendChild(span);
        XVARCLASS.pushy(span, link);
    }

    changeToInput() {
        var parent = this.parentNode;
        let inputElement = document.createElement('textarea');
        inputElement.style.display = 'inline-block';
        var keyarr = this.dataset.link.split("[");
        if (keyarr.length > 1) {
            parent.innerHTML = '';
            var key = keyarr[keyarr.length - 1];
            key = key.replaceAll("]", "").replaceAll("\"", "").replaceAll("'", "");
            key = '!' + key;
            var i = 1;
            var link = keyarr[0];
            while (i < keyarr.length) {

                if (i < keyarr.length - 1) {
                    link = link + "[" + keyarr[i];
                } else {
                    link = link + "['" + key + "']";
                }
                i++;
            }
            inputElement.setAttribute("data-link", link);
            //console.log(Function(`'use strict'; return (${link})`)());
            inputElement.value = Function(`'use strict'; return (${link})`)();
            /*inputElement.addEventListener('input', () => {
                Function(`'use strict'; ${parent.dataset.link} = ${this.value};`)()
            });*/
            inputElement.addEventListener('dblclick', parent.changeToSpan);
            parent.appendChild(inputElement);
            inputElement.style.height = 'auto';
            inputElement.style.height = inputElement.scrollHeight + 'px';
            inputElement.style.width = inputElement.scrollWidth + 'px';
            var button = document.createElement("button");
            button.addEventListener('click', parent.changeFormulaTo);
            button.innerHTML = "Change";
            parent.appendChild(button);
        }
        //console.log("ChangeToInput");
    }

    changeFormulaTo() {
        var txt = this.parentNode.getElementsByTagName('textarea')[0].value;
        if (txt.indexOf("return") !== -1) {
            txt = "$:()\n" + txt;
        }
        var t = `${this.parentNode.dataset.link} = \`${txt}\`;`;
        //console.log(t);
        Function(`${this.parentNode.dataset.link} = \`${txt}\`;`)()
    }


    parse(str) {
        try {
            return Function(`'use strict'; return (${str})`)()
        } catch {
            return undefined
        }
    }

    setValue(link, str) {
        return Function(`'use strict'; ${link} = ${str}; return true;`)()
    }

    disconnectedCallback() {
        var link = this.dataset.link;
        var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
        if (index > -1) {
            XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
        }
    }

    static get observedAttributes() {
        return ["data-link"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        /*if(name == "data-link" && oldValue!==newValue)
        {
            if(this.getElementsByTagName("span").length>0)
            {
                this.changeToSpan();
            }
            else
            {
                this.changeToInput();
            }
        }*/

        /*if(this.formulavisible)
        {
            this.value = newValue;
        }
        else
        {
            if(oldValue!==null && oldValue!==undefined)
            {
                var link = oldValue;
                var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
                if (index > -1) {
                    XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
                }   
            }
            var link = newValue;
            if(XVARCLASS.Xvars_for_while_update[link]==undefined)
            {
                XVARCLASS.Xvars_for_while_update[link] = [];
            }  
            XVARCLASS.Xvars_for_while_update[link].push(this);
        }*/
    }
};
customElements.define('input-x', InputX);

var HTMLElementsArr = {
    'a': 'HTMLAnchorElement',
    'area': 'HTMLAreaElement',
    'audio': 'HTMLAudioElement',
    'br': 'HTMLBRElement',
    'base': 'HTMLBaseElement',
    'basefont': 'HTMLBaseFontElement',
    'body': 'HTMLBodyElement',
    'button': 'HTMLButtonElement',
    'canvas': 'HTMLCanvasElement',
    'dl': 'HTMLDListElement',
    'data': 'HTMLDataElement',
    'datalist': 'HTMLDataListElement',
    'dialog': 'HTMLDialogElement',
    'div': 'HTMLDivElement',
    'document': 'HTMLDocument',
    'embed': 'HTMLEmbedElement',
    'fieldset': 'HTMLFieldSetElement',
    'form': 'HTMLFormElement',
    'frameset': 'HTMLFrameSetElement',
    'hr': 'HTMLHRElement',
    'head': 'HTMLHeadElement',
    'heading': 'HTMLHeadingElement',
    'iframe': 'HTMLIFrameElement',
    'img': 'HTMLImageElement',
    'input': 'HTMLInputElement',
    'label': 'HTMLLabelElement',
    'legend': 'HTMLLegendElement',
    'link': 'HTMLLinkElement',
    'map': 'HTMLMapElement',
    'media': 'HTMLMediaElement',
    'meta': 'HTMLMetaElement',
    'meter': 'HTMLMeterElement',
    'ol': 'HTMLOListElement',
    'object': 'HTMLObjectElement',
    'optgroup': 'HTMLOptGroupElement',
    'option': 'HTMLOptionElement',
    'output': 'HTMLOutputElement',
    'p': 'HTMLParagraphElement',
    'param': 'HTMLParamElement',
    'picture': 'HTMLPictureElement',
    'pre': 'HTMLPreElement',
    'progress': 'HTMLProgressElement',
    'q': 'HTMLQuoteElement',
    'script': 'HTMLScriptElement',
    'select': 'HTMLSelectElement',
    'source': 'HTMLSourceElement',
    'span': 'HTMLSpanElement',
    'style': 'HTMLStyleElement',
    'caption': 'HTMLTableCaptionElement',
    'col': 'HTMLTableColElement',
    'td': 'HTMLTableCellElement',
    'table': 'HTMLTableElement',
    'th': 'HTMLTableHeaderCellElement',
    'tr': 'HTMLTableRowElement',
    'tbody': 'HTMLTableSectionElement',
    'template': 'HTMLTemplateElement',
    'textarea': 'HTMLTextAreaElement',
    'time': 'HTMLTimeElement',
    'title': 'HTMLTitleElement',
    'track': 'HTMLTrackElement',
    'ul': 'HTMLUListElement',
    'video': 'HTMLVideoElement',
};

var HTMLStyleAttributesArr = {
    "align-content": "alignContent",
    "align-items": "alignItems",
    "align-self": "alignSelf",
    "all": "all",
    "animation": "animation",
    "animation-delay": "animationDelay",
    "animation-direction": "animationDirection",
    "animation-duration": "animationDuration",
    "animation-fill-mode": "animationFillMode",
    "animation-iteration-count": "animationIterationCount",
    "animation-name": "animationName",
    "animation-play-state": "animationPlayState",
    "animation-timing-function": "animationTimingFunction",
    "backface-visibility": "backfaceVisibility",
    "background": "background",
    "background-attachment": "backgroundAttachment",
    "background-blend-mode": "backgroundBlendMode",
    "background-clip": "backgroundClip",
    "background-color": "backgroundColor",
    "background-image": "backgroundImage",
    "background-origin": "backgroundOrigin",
    "background-position": "backgroundPosition",
    "background-repeat": "backgroundRepeat",
    "background-size": "backgroundSize",
    "border": "border",
    "border-bottom": "borderBottom",
    "border-bottom-color": "borderBottomColor",
    "border-bottom-left-radius": "borderBottomLeftRadius",
    "border-bottom-right-radius": "borderBottomRightRadius",
    "border-bottom-style": "borderBottomStyle",
    "border-bottom-width": "borderBottomWidth",
    "border-collapse": "borderCollapse",
    "border-color": "borderColor",
    "border-image": "borderImage",
    "border-image-outset": "borderImageOutset",
    "border-image-repeat": "borderImageRepeat",
    "border-image-slice": "borderImageSlice",
    "border-image-source": "borderImageSource",
    "border-image-width": "borderImageWidth",
    "border-left": "borderLeft",
    "border-left-color": "borderLeftColor",
    "border-left-style": "borderLeftStyle",
    "border-left-width": "borderLeftWidth",
    "border-radius": "borderRadius",
    "border-right": "borderRight",
    "border-right-color": "borderRightColor",
    "border-right-style": "borderRightStyle",
    "border-right-width": "borderRightWidth",
    "border-spacing": "borderSpacing",
    "border-style": "borderStyle",
    "border-top": "borderTop",
    "border-top-color": "borderTopColor",
    "border-top-left-radius": "borderTopLeftRadius",
    "border-top-right-radius": "borderTopRightRadius",
    "border-top-style": "borderTopStyle",
    "border-top-width": "borderTopWidth",
    "border-width": "borderWidth",
    "bottom": "bottom",
    "box-shadow": "boxShadow",
    "box-sizing": "boxSizing",
    "break-after": "breakAfter",
    "break-before": "breakBefore",
    "break-inside": "breakInside",
    "caption-side": "captionSide",
    "caret-color": "caretColor",
    "clear": "clear",
    "clip": "clip",
    "color": "color",
    "column-count": "columnCount",
    "column-fill": "columnFill",
    "column-gap": "columnGap",
    "column-rule": "columnRule",
    "column-rule-color": "columnRuleColor",
    "column-rule-style": "columnRuleStyle",
    "column-rule-width": "columnRuleWidth",
    "column-span": "columnSpan",
    "column-width": "columnWidth",
    "columns": "columns",
    "counter-increment": "counterIncrement ",
    "counter-reset": "counterReset",
    "cursor": "cursor",
    "direction": "direction",
    "display": "display",
    "empty-cells": "emptyCells",
    "filter": "filter",
    "flex": "flex",
    "flex-basis": "flexBasis",
    "flex-direction": "flexDirection",
    "flex-flow": "flexFlow",
    "flex-grow": "flexGrow",
    "flex-shrink": "flexShrink",
    "flex-wrap": "flexWrap",
    "float": "cssFloat",
    "font": "font",
    "font-family": "fontFamily",
    "font-feature-settings": "fontFeatureSettings",
    "font-kerning": "fontKerning",
    "font-size": "fontSize",
    "font-size-adjust": "fontSizeAdjust",
    "font-stretch": "fontStretch",
    "font-style": "fontStyle",
    "font-variant": "fontVariant",
    "font-variant-caps": "fontVariantCaps",
    "font-weight": "fontWeight",
    "gap": "gap",
    "grid": "grid",
    "grid-area": "gridArea",
    "grid-auto-columns": "gridAutoColumns",
    "grid-auto-flow": "gridAutoFlow",
    "grid-auto-rows": "gridAutoRows",
    "grid-column": "gridColumn",
    "grid-column-end": "gridColumnEnd",
    "grid-column-gap": "gridColumnGap",
    "grid-column-start": "gridColumnStart",
    "grid-gap": "gridGap",
    "grid-row": "gridRow",
    "grid-row-end": "gridRowEnd",
    "grid-row-gap": "gridRowGap",
    "grid-row-start": "gridRowStart",
    "grid-template": "gridTemplate",
    "grid-template-areas": "gridTemplateAreas",
    "grid-template-columns": "gridTemplateColumns",
    "grid-template-rows": "gridTemplateRows",
    "hanging-punctuation": "hangingPunctuation",
    "height": "height",
    "hyphens": "hyphens",
    "isolation": "isolation",
    "justify-content": "justifyContent",
    "left": "left",
    "letter-spacing": "letterSpacing",
    "line-height": "lineHeight",
    "list-style": "listStyle",
    "list-style-image": "listStyleImage",
    "list-style-position": "listStylePosition",
    "list-style-type": "listStyleType",
    "margin": "margin",
    "margin-bottom": "marginBottom",
    "margin-left": "marginLeft",
    "margin-right": "marginRight",
    "margin-top": "marginTop",
    "max-height": "maxHeight",
    "max-width": "maxWidth",
    "min-height": "minHeight",
    "min-width": "minWidth",
    "mix-blend-mode": "mixBlendMode",
    "object-fit": "objectFit",
    "object-position": "objectPosition",
    "opacity": "opacity",
    "order": "order",
    "outline": "outline",
    "outline-color": "outlineColor",
    "outline-offset": "outlineOffset",
    "outline-style": "outlineStyle",
    "outline-width": "outlineWidth",
    "overflow": "overflow",
    "overflow-x": "overflowX",
    "overflow-y": "overflowY",
    "padding": "padding",
    "padding-bottom": "paddingBottom",
    "padding-left": "paddingLeft",
    "padding-right": "paddingRight",
    "padding-top": "paddingTop",
    "page-break-after": "pageBreakAfter",
    "page-break-before": "pageBreakBefore",
    "page-break-inside": "pageBreakInside",
    "perspective": "perspective",
    "perspective-origin": "perspectiveOrigin",
    "pointer-events": "pointerEvents",
    "position": "position",
    "quotes": "quotes",
    "resize": "resize",
    "right": "right",
    "row-gap": "rowGap",
    "scroll-behavior": "scrollBehavior",
    "tab-size": "tabSize",
    "table-layout": "tableLayout",
    "text-align": "textAlign",
    "text-align-last": "textAlignLast",
    "text-decoration": "textDecoration",
    "text-decoration-color": "textDecorationColor",
    "text-decoration-line": "textDecorationLine",
    "text-decoration-style": "textDecorationStyle",
    "text-indent": "textIndent",
    "text-justify": "textJustify",
    "text-overflow": "textOverflow",
    "text-shadow": "textShadow",
    "text-transform": "textTransform",
    "top": "top",
    "transform": "transform",
    "transform-origin": "transformOrigin",
    "transform-style": "transformStyle",
    "transition": "transition",
    "transition-delay": "transitionDelay",
    "transition-duration": "transitionDuration",
    "transition-property": "transitionProperty",
    "transition-timing-function": "transitionTimingFunction",
    "unicode-bidi": "unicodeBidi",
    "user-select": "userSelect",
    "vertical-align": "verticalAlign",
    "visibility": "visibility",
    "white-space": "whiteSpace",
    "width": "width",
    "word-break": "wordBreak",
    "word-spacing": "wordSpacing",
    "word-wrap": "wordWrap",
    "writing-mode": "writingMode",
    "z-index": "zIndex"
};

var HTMLStyleAttributes = [
    "align-content",
    "align-items",
    "align-self",
    "all",
    "animation-delay",
    "animation-direction",
    "animation-duration",
    "animation-fill-mode",
    "animation-iteration-count",
    "animation-name",
    "animation-play-state",
    "animation-timing-function",
    "backface-visibility",
    "background",
    "background-attachment",
    "background-blend-mode",
    "background-clip",
    "background-color",
    "background-image",
    "background-origin",
    "background-position",
    "background-repeat",
    "background-size",
    "border",
    "border-bottom",
    "border-bottom-color",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-bottom-style",
    "border-bottom-width",
    "border-collapse",
    "border-color",
    "border-image",
    "border-image-outset",
    "border-image-repeat",
    "border-image-slice",
    "border-image-source",
    "border-image-width",
    "border-left",
    "border-left-color",
    "border-left-style",
    "border-left-width",
    "border-radius",
    "border-right",
    "border-right-color",
    "border-right-style",
    "border-right-width",
    "border-spacing",
    "border-style",
    "border-top",
    "border-top-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-top-style",
    "border-top-width",
    "border-width",
    "bottom",
    "box-shadow",
    "box-sizing",
    "break-after",
    "break-before",
    "break-inside",
    "caption-side",
    "caret-color",
    "clear",
    "clip",
    "color",
    "column-count",
    "column-fill",
    "column-gap",
    "column-rule",
    "column-rule-color",
    "column-rule-style",
    "column-rule-width",
    "column-span",
    "column-width",
    "columns",
    "counter-increment",
    "counter-reset",
    "cursor",
    "direction",
    "display",
    "empty-cells",
    "filter",
    "flex",
    "flex-basis",
    "flex-direction",
    "flex-flow",
    "flex-grow",
    "flex-shrink",
    "flex-wrap",
    "float",
    "font",
    "font-family",
    "font-feature-settings",
    "font-kerning",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-variant-caps",
    "font-weight",
    "gap",
    "grid",
    "grid-area",
    "grid-auto-columns",
    "grid-auto-flow",
    "grid-auto-rows",
    "grid-column",
    "grid-column-end",
    "grid-column-gap",
    "grid-column-start",
    "grid-gap",
    "grid-row",
    "grid-row-end",
    "grid-row-gap",
    "grid-row-start",
    "grid-template",
    "grid-template-areas",
    "grid-template-columns",
    "grid-template-rows",
    "hanging-punctuation",
    "height",
    "hyphens",
    "isolation",
    "justify-content",
    "left",
    "letter-spacing",
    "line-height",
    "list-style",
    "list-style-image",
    "list-style-position",
    "list-style-type",
    "margin",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "margin-top",
    "max-height",
    "max-width",
    "min-height",
    "min-width",
    "mix-blend-mode",
    "object-fit",
    "object-position",
    "opacity",
    "order",
    "outline",
    "outline-color",
    "outline-offset",
    "outline-style",
    "outline-width",
    "overflow",
    "overflow-x",
    "overflow-y",
    "padding",
    "padding-bottom",
    "padding-left",
    "padding-right",
    "padding-top",
    "page-break-after",
    "page-break-before",
    "page-break-inside",
    "perspective",
    "perspective-origin",
    "pointer-events",
    "position",
    "quotes",
    "resize",
    "right",
    "row-gap",
    "scroll-behavior",
    "tab-size",
    "table-layout",
    "text-align",
    "text-align-last",
    "text-decoration",
    "text-decoration-color",
    "text-decoration-line",
    "text-decoration-style",
    "text-indent",
    "text-justify",
    "text-overflow",
    "text-shadow",
    "text-transform",
    "top",
    "transform",
    "transform-origin",
    "transform-style",
    "transition",
    "transition-delay",
    "transition-duration",
    "transition-property",
    "transition-timing-function",
    "unicode-bidi",
    "user-select",
    "vertical-align",
    "visibility",
    "white-space",
    "width",
    "word-break",
    "word-spacing",
    "word-wrap",
    "writing-mode",
    "z-index"
];
var EventsArr = [
    "onclick",
    "onkeydown",
    "onchange",
    "onkeyup",
    "onmousemove",
    "onkeypress",
    "ondblclick",
    "onmousedown",
    "onmouseout",
    "onmouseover",
    "onmouseup",
    "onwheel",
    "ondrag",
    "ondragend",
    "ondragenter",
    "ondragleave",
    "ondragover",
    "ondragstart",
    "ondrop",
    "onscroll"
]
class xtemplate extends HTMLElement {
    constructor() {
        super();
        this.rendered = false;
        this.templatefile = '';
        this.props = '';
        // element created
    }

    connectedCallback() {
        //this.checkForXvar()
    }

    parse(str) {
        try {
            return Function(`'use strict'; return (${str})`)()
        } catch {
            return undefined
        }
    }

    disconnectedCallback() {
        var link = this.dataset.link;
        var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
        if (index > -1) {
            XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
        }

        var keys = Object.keys(this.Xvars_style_for_while_update);
        var iarr = 0;
        var Xlength = keys.length

        while (iarr < Xlength) {
            var iiarr = 0;
            var k = XVARCLASS.Xvars_style_for_while_update[keys[iarr]]
            XXLength = k.length;
            while (iiarr < XXLength) {
                if (k[iiarr].el == this) {
                    k.splice(iiarr, 1);
                    iiarr--;
                }
                iiarr++;
            }
            iarr++;
        }

    }

    static get observedAttributes() {
        return ["x-name", "x-props"];
    }

    cleanTemplateWhileArray() {
        var keys = Object.keys(XVARCLASS.Xvars_template_for_while_update);
        var iarr = 0;
        var Xlength = keys.length

        while (iarr < Xlength) {
            var iiarr = 0;
            var k = XVARCLASS.Xvars_template_for_while_update[keys[iarr]]
            var klength = k.length;
            while (iiarr < klength) {
                if (k[iiarr] == undefined || k[iiarr].el == this) {
                    k.splice(iiarr, 1);
                    iiarr--;
                    klength = k.length;
                }
                iiarr++;
            }
            iarr++;
        }
    }


    renderAfterTemplatesLoaded() {
        var attributeTypeTemplate = "string";
        var templatename = this.getAttribute("x-name");
        if (templatename) {
            attributeTypeTemplate = Xvar.checkForXvar(templatename);
        }
        var templatefile = '';
        var propsfile = '';

        if (attributeTypeTemplate == "Xvar") {
            templatefile = this.parse(templatename);
        } else {
            templatefile = templatename;
        }

        var attributeTypeProps = "string";
        var props = this.getAttribute("x-props");
        if (props) {
            attributeTypeProps = Xvar.checkForXvar(props);
        }


        if (attributeTypeProps == "Xvar") {
            propsfile = this.parse(props);
        } else {
            propsfile = props;
        }

        this.setAttribute("x-name", templatename);
        this.setAttribute("x-props", propsfile);

        if (attributeTypeTemplate == "Xvar" && XVARCLASS.Templatesloaded) {
            this.cleanTemplateWhileArray();
            var obj = {};
            obj.el = this;
            obj.props = props;
            obj.templatefile = templatename;
            if (XVARCLASS.Xvars_template_for_while_update[templatename] == undefined) {
                XVARCLASS.Xvars_template_for_while_update[templatename] = [];
            }
            XVARCLASS.Xvars_template_for_while_update[templatename].push(obj);
        }
        if (attributeTypeProps == "Xvar" && XVARCLASS.Templatesloaded) {
            this.cleanPropsWhileArray();
            var obj = {};
            obj.el = this;
            obj.props = props;
            obj.templatefile = templatename;
            if (XVARCLASS.Xvars_props_for_while_update[props] == undefined) {
                XVARCLASS.Xvars_props_for_while_update[props] = [];
            }
            XVARCLASS.Xvars_props_for_while_update[props].push(obj);
        }
    }

    cleanPropsWhileArray() {
        var keys = Object.keys(XVARCLASS.Xvars_props_for_while_update);
        var iarr = 0;
        var Xlength = keys.length

        while (iarr < Xlength) {
            var iiarr = 0;
            var k = XVARCLASS.Xvars_props_for_while_update[keys[iarr]]
            var klength = k.length;
            while (iiarr < klength) {
                if (k[iiarr] == undefined || k[iiarr].el == this) {
                    k.splice(iiarr, 1);
                    iiarr--;
                    klength = k.length;
                }
                iiarr++;
            }
            iarr++;
        }
    }

    resetchildnodes(element, props) {
        var children = element.childNodes;
        if (children !== undefined) {
            var ichildren = 0;
            var childrenlength = children.length;
            while (ichildren < childrenlength) {
                var digdeeper = true;
                if (children[ichildren].getAttribute !== undefined &&
                    children[ichildren].getAttribute("is") !== undefined &&
                    children[ichildren].getAttribute("is") !== null) {
                    //console.log(children[ichildren].getAttribute("is"));
                    if (children[ichildren].getAttribute("is").substr(0, 2) == "x-") {
                        var xprops = children[ichildren].getAttribute("data-link");
                        if (xprops !== undefined && xprops !== '' && xprops !== null &&
                            children[ichildren].getAttribute("data-link") !== xprops.replace("props", props)) {
                            children[ichildren].setAttribute("data-link", xprops.replace("props", props));
                        }
                        var xprops = children[ichildren].getAttribute("x-repeat");
                        if (xprops !== undefined && xprops !== '' && xprops !== null) {
                            digdeeper = false;
                            if (children[ichildren].getAttribute("x-repeat") !== xprops.replace("props", props)) {
                                children[ichildren].setAttribute("x-repeat", xprops.replace("props", props));
                            }
                        }
                    }
                } else if (children[ichildren].tagName == "X-TEMPLATE") {
                    var xprops = children[ichildren].getAttribute("x-name");
                    if (xprops !== undefined && xprops !== '') {
                        children[ichildren].setAttribute("x-name", xprops.replace("props", props));
                    }
                    var xprops = children[ichildren].getAttribute("x-props");
                    if (xprops !== undefined && xprops !== '') {
                        children[ichildren].setAttribute("x-props", xprops.replace("props", props));
                    }
                    digdeeper = false;
                }
                if (digdeeper) {
                    this.resetchildnodes(children[ichildren], props);
                }
                ichildren++;
            }
        }

        return;
    }

    renderTemplate(templatefile,props) {
        if(this.templatefile !== templatefile || this.props !== props) {
            if (props) {
                var str = XVARCLASS.Templates[templatefile];
                if (str) {
                    this.rendered = true;
                    this.templatefile = templatefile;
                    this.props = props;
                    let doc = document.implementation.createHTMLDocument();
                    doc.body.innerHTML = str;
                    var end = false;
                    this.resetchildnodes(doc.body, props);
                    str = doc.body.innerHTML;
                    if (this.innerHTML !== str) {
                        Xvar.setInnerHTML(this, str, props);
                    }
                }           
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "x-name") {
            var attributeType = "string";
            if (newValue) {
                attributeType = Xvar.checkForXvar(newValue);
            }
            var templatefile = '';
            var props = '';

            if (attributeType == "Xvar") {
                templatefile = this.parse(newValue);
            } else {
                templatefile = newValue;
            }
            props = this.getAttribute('x-props');
            if (Xvar.checkForXvar("x-props", props) == "Xvar") {
                props = this.parse(props);
            }

            this.renderTemplate(templatefile,props);
            
            if (attributeType == "Xvar" && XVARCLASS.Templatesloaded) {

                this.cleanTemplateWhileArray();
                var obj = {};
                obj.el = this;
                obj.props = props;
                obj.templatefile = newValue;
                if (XVARCLASS.Xvars_template_for_while_update[newValue] == undefined) {
                    XVARCLASS.Xvars_template_for_while_update[newValue] = [];
                }
                XVARCLASS.Xvars_template_for_while_update[newValue].push(obj);
            }
        } else if (name == "x-props") {
            var attributeType = "string";
            if (newValue) {
                attributeType = Xvar.checkForXvar(newValue);
            }
            var templatefile = '';
            var props = '';
            if (attributeType == "Xvar") {
                props = this.parse(newValue);
            } else {
                props = newValue;
            }
            templatefile = this.getAttribute('x-name');
            var attrtemplatefile = Xvar.checkForXvar(templatefile)
            if (attrtemplatefile == "Xvar") {
                templatefile = this.parse(templatefile);
            }
            //props = newValue;
            this.renderTemplate(templatefile,props);

            if (attributeType == "Xvar" && XVARCLASS.Templatesloaded) {
                this.cleanPropsWhileArray();
                var obj = {};
                obj.el = this;
                obj.props = newValue;
                obj.templatefile = templatefile;
                if (XVARCLASS.Xvars_props_for_while_update[newValue] == undefined) {
                    XVARCLASS.Xvars_props_for_while_update[newValue] = [];
                }
                XVARCLASS.Xvars_props_for_while_update[newValue].push(obj);
            }
        }
    }
}

customElements.define("x-template", xtemplate);
