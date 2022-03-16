
        class Xspan extends HTMLSpanElement {
          constructor(...args) {
              super(...args);
              //console.log("Custom div Element constructing!");
              this.subscribedAttributes = [];
      }
      static get observedAttributes() {return ["data-x","data-link","x-repeat","repeat-x",'style-color'];}
      connectedCallback() {
          var link = this.dataset.link;
          if(link !== undefined)
          {
              if(XVARCLASS.Xvars_for_while_update[link]==undefined)
              {
                  XVARCLASS.Xvars_for_while_update[link] = [];
              } 
              if(XVARCLASS.Xvars_for_while_update[link].includes(this)==false)
              {
                  XVARCLASS.Xvars_for_while_update[link].push(this);
              } 
              this.innerHTML = this.parse(link);
          }
      }
  
      parse(str) {
          if(str.substr(0,5)!=="props")
          {
            try{
              return Function(`'use strict'; return (${str})`)()
            }
            catch{
              return undefined;
            }
          }
      }
  
      disconnectedCallback() {
          var link = this.dataset.link;
          if(link !== undefined)
          {
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
          if(children!==undefined)
          {
              var ichildren = 0;
              var childrenlength = children.length;
              while(ichildren<childrenlength)
              {
                  var digdeeper = true;
                  if(children[ichildren].getAttribute !== undefined 
                  && children[ichildren].getAttribute("is") !== undefined
                  && children[ichildren].getAttribute("is") !== null)
                  {
                      
                      //console.log(children[ichildren].getAttribute("is"));
                      if(children[ichildren].getAttribute("is").substr(0,2)=="x-")
                      {
                          for (var i = 0, atts = children[ichildren].attributes, n = atts.length, arr = []; i < n; i++){
                            if(HTMLStyleAttributes.includes(atts[i].nodeName.substr(6,atts[i].nodeName.length-6)) || 
                            EventsArr.includes(atts[i].nodeName))
                            {
                              children[ichildren].setAttribute(atts[i].nodeName,atts[i].nodeValue.replace("props",props));
                            }
                          }
                          var xprops = children[ichildren].getAttribute("data-link");
                          if(xprops !== undefined && xprops !== '' && xprops!==null
                          && children[ichildren].getAttribute("data-link") !== xprops.replace("props",props))
                          {
                              children[ichildren].setAttribute("data-link",xprops.replace("props",props));
                          }
                          var xprops = children[ichildren].getAttribute("x-repeat");
                          if(xprops !== undefined && xprops !== '' && xprops !== null)
                          {
                              digdeeper = false;
                              if(children[ichildren].getAttribute("x-repeat") !== xprops.replace("props",props))
                              {
                                  children[ichildren].setAttribute("x-repeat",xprops.replace("props",props));
                              }
                          }
                      }
                  } 
                  else if(children[ichildren].tagName=="X-TEMPLATE")
                  {
                      var xprops = children[ichildren].getAttribute("x-name");
                      if(xprops !== undefined && xprops !== '')
                      {
                          children[ichildren].setAttribute("x-name", xprops.replace("props",props));
                      }
                      var xprops = children[ichildren].getAttribute("x-props");
                      if(xprops !== undefined && xprops !== '')
                      {
                          children[ichildren].setAttribute("x-props",xprops.replace("props",props));
                      }
                      digdeeper = false;
                  }
                  if(digdeeper)
                  {
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
  
          while(iarr < Xlength)
          {
              var iiarr = 0;
              var k = XVARCLASS.Xvars_style_for_while_update[keys[iarr]]
              var klength = k.length;
              while(iiarr < klength)
              {
                  if(k[iiarr]==undefined || k[iiarr].el == this) 
                  {
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
          if(name == "data-x")
          {
              this.innerHTML = newValue;
          }
          else if(name=="data-link")
          {
              var link = oldValue;
              if(XVARCLASS.Xvars_for_while_update[link])
              {
                  var index = XVARCLASS.Xvars_for_while_update[link].indexOf(this);
                  if (index > -1) {
                      XVARCLASS.Xvars_for_while_update[link].splice(index, 1);
                  }
              }
                 
              var link = newValue;
              if(link.substr(0,5)!=="props")
              {
                  if(XVARCLASS.Xvars_for_while_update[link]==undefined)
                  {
                      XVARCLASS.Xvars_for_while_update[link] = [];
                  } 
                  if(XVARCLASS.Xvars_for_while_update[link].includes(this)==false)
                  {
                      XVARCLASS.Xvars_for_while_update[link].push(this);
                  } 
              }
          }
          else if (name=="repeat-x" || name=="x-repeat")
          {
              var templstr = "";
              if(this.getAttribute("data-firstload")==null)
              {
                this.setAttribute("data-template",this.innerHTML);
                this.setAttribute("data-firstload",true);
                templstr = this.innerHTML;
              }
              else
              {
                templstr = this.getAttribute("data-template",this.innerHTML);
              }
              this.xrepeat = newValue;
              var templstr2 = "";
              if(this.tagName=="TBODY")
              {
                templstr2 = "<table><tbody>";
                templstr2 += templstr;
                templstr2 += "</tbody></table>";
                templstr = templstr2;
              }
              if(this.tagName=="TABLE")
              {
                templstr2 = "<table>";
                templstr2 += templstr;
                templstr2 += "</table>";
                templstr = templstr2;
              }
              if(templstr=="")
              {
                  document.addEventListener("DOMContentLoaded", function (){
                      var newValue = this.xrepeat;
                      var arr = this.parse(newValue);
                      templstr = this.innerHTML;
                      if(arr)
                      {
                          var keys = Object.keys(arr);
                          var keyslength = keys.length;
                          if(keyslength > 0)
                          {
                              var bigstr = "";
                              var ikeys = 0;
                              console.log(this);
                              while(ikeys<keyslength)
                              {
                                  var newValuestr = newValue + "[" + ikeys + "]";
                                  let doc = document.implementation.createHTMLDocument();
                                  doc.body.innerHTML = templstr;
                                  this.resetchildnodes(doc.body,newValuestr);
                                  if(this.tagName=="TBODY")
                                  {
                                    bigstr += doc.body.getElementsByTagName("tbody")[0].innerHTML;
                                  }
                                  else if(this.tagName=="TABLE")
                                  {
                                    bigstr += doc.body.getElementsByTagName("table")[0].innerHTML;
                                  }
                                  else
                                  {
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
                  if(arr)
                  {
                      var keys = Object.keys(arr);
                      var keyslength = keys.length;
                      if(keyslength > 0)
                      {
                          var bigstr = "";
                          var ikeys = 0;
                          console.log(this);
                          while(ikeys<keyslength)
                          {
                              var newValuestr = newValue + "[" + ikeys + "]";
                              let doc = document.implementation.createHTMLDocument();
                              
                              doc.body.innerHTML = templstr;
                              
                              this.resetchildnodes(doc.body,newValuestr);
                              
                              if(this.tagName=="TBODY")
                              {
                                bigstr += doc.body.getElementsByTagName("tbody")[0].innerHTML;
                              }
                              else if(this.tagName=="TABLE")
                              {
                                bigstr += doc.body.getElementsByTagName("table")[0].innerHTML;
                              }
                              else
                              {
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
              if(keyarr.length > 1) 
              {
                  //parent.innerHTML = '';
                  var key = keyarr[keyarr.length-1];
                  key     = key.replaceAll("]","").replaceAll("\"","").replaceAll("'","");
                  key = '!!'+key;
                  var i = 1;
                  var link = keyarr[0];
                  while(i<keyarr.length)
                  {
                      if(i<keyarr.length-1)
                      {
                          link = link + "[" + keyarr[i];
                      }
                      else
                      {
                          link = link + "['" + key + "']";
                      }
                      i++;
                  }
                 
              }
              try{
                  var blxvar = Function(`'use strict'; return XVARCLASS.Xvars.includes(${link});`)();
                  if(blxvar==true)
                  {
                      attributeType = 'Xvar';    
                  }
              }
              catch{}
              //console.log("newValueType:" + attributeType);
              var isStyle = true;
              var css = HTMLStyleAttributesArr[cssName];
              this.cleanStyleWhileArray();
              if(attributeType=='Xvar')
              {
                  if(css!==undefined)
                  {
                      var value = this.parse(newValue);
                      if (this.style[css]!==value)
                      {
                          this.style[css] = value;
                      }
                  }
                  else
                  {
                      css = cssName;
                      isStyle = false;
                      this.setAttribute(name,Function(`'use strict'; return ${newValue};`)());
                  }
                  if (this.subscribedAttributes[cssName]==undefined)
                  {
                      var obj = {};
                      obj.el = this;
                      obj.styleAttr = css;
                      obj.isStyle = isStyle;
                      obj.value = newValue;
                      if (XVARCLASS.Xvars_style_for_while_update[newValue] == undefined)
                      {
                          XVARCLASS.Xvars_style_for_while_update[newValue] = [];
                      }
                      XVARCLASS.Xvars_style_for_while_update[newValue].push(obj);
                  }
                  this.subscribedAttributes[cssName] = true;
              }
              else
              {
                  if(css!==undefined)
                  {
                      var value = this.parse(newValue);
                      if(value!==undefined)
                      {
                        if (this.style[css]!==value)
                        {
                            this.style[css] = value;
                        }
                      }
                      else
                      {
                        if (this.style[css]!==newValue)
                        {
                            this.style[css] = newValue;
                        }
                      }   
                  }
              }
          }   
      }
  }
  
  customElements.define('x-span', Xspan, { extends: "span" });
  