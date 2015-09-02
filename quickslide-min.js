
(function(root,factory){if(typeof define==="function"&&define.amd){define(factory);}else{root.QuickSlide=factory();}}(this,function(){"use strict";var popupImg;var popupBox;var dimmer;var popupCaption;var sizeTimer;var config={use_dimmer:false,absolute_position:false,show_caption:true,auto_fit:true,auto_detect:false,no_wait:false,navigation:true};var imageLinks=[];var currentLink=null;if(document.getElementById("quickslide-popup-box")||document.getElementById("lightbox")){return;}
function nonWhitespace(text){return!(/^\s+$/).test(text);}
function addClassTo(element,className){var elementClasses=element.className.split(" ").filter(nonWhitespace);var newClasses=className.split(" ").filter(nonWhitespace);newClasses.forEach(function(c){if(elementClasses.indexOf(c)===-1){elementClasses.push(c);}});element.className=elementClasses.join(" ");}
function removeClassFrom(element,className){var elementClasses=element.className.split(" ").filter(nonWhitespace);var classesToRemove=className.split(" ").filter(nonWhitespace);var index=elementClasses.length-1;while(index>=0){if(classesToRemove.indexOf(elementClasses[index])!==-1){elementClasses.splice(index,1);}
index-=1;}
element.className=elementClasses.join(" ");}
function isImageLink(link){var href=link.getAttribute("href");var imgExt=/\.(jp(e?)g|png|gif|svg)$/i;var redirect=/=http/;return imgExt.test(href)&&!redirect.test(href)&&!link.onclick;}
function shouldHandle(testEl){var nodeName=testEl.nodeName.toUpperCase();var rel=(testEl.getAttribute("rel")||"").toUpperCase();return nodeName==="A"&&(rel==="QUICKSLIDE"||(config.auto_detect&&isImageLink(testEl)));}
function collectLinks(){var allLinks=document.querySelectorAll("a");return Array.prototype.filter.call(allLinks,function(link){return shouldHandle(link);});}
function setEventHandlers(){document.body.addEventListener("click",function(e){var el=e.target;if(e.shiftKey){e.shiftKey=false;return false;}
if(e.button&&e.button===1){return true;}
while(el&&!shouldHandle(el)&&el!==this){el=el.parentNode;}
if(el&&shouldHandle(el)){e.preventDefault();setPopupFromNode(el);}},false);}
function recenterBox(box,srcImg){var bs=box.style,cw,ch,scrollTop=document.body.scrollTop||(document.documentElement&&document.documentElement.scrollTop),px=0,py=0,w,h,cr,mw=config.max_width,mh=config.max_height;cw=window.innerWidth||document.documentElement.clientWidth;ch=window.innerHeight||document.documentElement.clientHeight;if(srcImg){w=srcImg.width;h=srcImg.height;if(mw&&w>mw){h=Math.round(h*mw/w);w=mw;srcImg.style.maxWidth=mw+"px";srcImg.style.maxHeight=h+"px";}
if(mh&&h>mh){w=Math.round(w*mh/h);h=mh;srcImg.style.maxHeight=mh+"px";srcImg.style.maxWidth=w+"px";}
if(config.show_caption){popupCaption.style.maxWidth=w+"px";}
px=box.offsetWidth-w;py=box.offsetHeight-h;if(config.auto_fit!==false){if(w+px>cw){h=Math.round(h*(cw-px)/w);w=cw-px;srcImg.style.maxWidth=w+"px";srcImg.style.maxHeight=h+"px";}
if(h+py>ch){w=Math.round(w*(ch-py)/h);h=ch-py;srcImg.style.maxHeight=h+"px";srcImg.style.maxWidth=w+"px";}}}else{cr=box.getBoundingClientRect();w=cr.right-cr.left;h=cr.bottom-cr.top;}
bs.top=(Math.round((ch-h)/2)+
(config.absolute_position?scrollTop:0)-
(py/2))+"px";bs.left=(Math.round((cw-w)/2)-px/2)+"px";}
function setPopupFromNode(node){var caption;if(config.use_dimmer){dimmer.style.display="";}
addClassTo(popupBox,"loading");popupBox.style.display="";recenterBox(popupBox);if(popupImg&&popupImg.parentNode===popupBox){popupBox.removeChild(popupImg);}
popupImg=document.createElement("img");popupImg.className="quickslide-image";popupImg.style.display="none";popupImg.addEventListener("error",function(){if(!popupImg.width&&!popupImg.height){hidePopup();window.location=popupImg.src;}},false);if(config.show_caption){popupCaption.style.display="none";caption=node.getAttribute("title");if(!caption){caption=node.getAttribute("href").split("/");caption=caption[caption.length-1];}
popupCaption.innerHTML=caption;}
popupImg.addEventListener("load",function(){removeClassFrom(popupBox,"loading");addClassTo(popupBox,"loaded");},false);popupImg.src=node.getAttribute("href");sizeTimer=setInterval(function(){if(popupImg.width||popupImg.height){clearInterval(sizeTimer);showImage();}},100);currentLink=node;}
function showImage(){removeClassFrom(popupBox,"loading loaded");popupImg.style.display="";if(config.show_caption){popupBox.insertBefore(popupImg,popupCaption);popupCaption.style.display="";}else{popupBox.appendChild(popupImg);}
recenterBox(popupBox,popupImg);}
function hidePopup(){clearInterval(sizeTimer);if(popupBox.parentNode===document.body){popupBox.style.display="none";if(config.use_dimmer){dimmer.style.display="none";}}}
function changePopupSourceBy(delta){var index=imageLinks.indexOf(currentLink);if(index===-1){return;}
index+=delta;if(index===-1){index=imageLinks.length-1;}else if(index>=imageLinks.length-1){index=0;}
setPopupFromNode(imageLinks[index]);}
function applyConfig(newConfig){var key;if(!newConfig||typeof newConfig!=="object"){return;}
for(key in config){if(!config.hasOwnProperty(key)){continue;}
if(newConfig.hasOwnProperty(key)){config[key]=newConfig[key];}}}
function init(){var s;var navPrev,navNext;popupBox=document.createElement("div");popupBox.className="quickslide-popup-box";s=popupBox.style;s.position=config.absolute_position?"absolute":"fixed";s.zIndex="9999";s.display="none";popupBox.addEventListener("click",function(evt){var delta=parseInt(evt.target.getAttribute("data-delta"),10);if(evt.target.nodeName.toUpperCase()==="A"&&delta){changePopupSourceBy(delta);evt.stopPropagation();evt.preventDefault();return false;}
hidePopup();},false);document.body.appendChild(popupBox);if(config.use_dimmer){dimmer=document.createElement("div");dimmer.className="quickslide-dimmer";s=dimmer.style;s.position="fixed";s.zIndex="9998";s.top="0";s.right="0";s.bottom="0";s.left="0";s.display="none";dimmer.addEventListener("click",function(){hidePopup();},false);document.body.appendChild(dimmer);}
if(config.navigation){navPrev=document.createElement("a");navNext=document.createElement("a");navPrev.href=navNext.href="#";navPrev.setAttribute("data-delta",-1);navNext.setAttribute("data-delta",1);navPrev.className="quickslide-nav quickslide-nav-prev";navNext.className="quickslide-nav quickslide-nav-next";navPrev.appendChild(document.createTextNode("Previous"));navNext.appendChild(document.createTextNode("Next"));popupBox.appendChild(navPrev);popupBox.appendChild(navNext);}
document.body.addEventListener("keydown",function(e){if(e.keyCode===27){hidePopup();}
if(e.keyCode===37){changePopupSourceBy(-1);}
if(e.keyCode===39){changePopupSourceBy(1);}},false);if(config.show_caption){popupCaption=document.createElement("div");popupCaption.className="quickslide-caption";popupBox.appendChild(popupCaption);}
setEventHandlers();imageLinks=collectLinks();}
return function(userConfig){applyConfig(userConfig);if(config.no_wait&&document.body){init();}else{window.addEventListener("load",function(){init();},false);}};}));