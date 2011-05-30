
var QuickSlideConfig;(function(config){var popupVisible=false,loadingSpinner=new Image(),popupImg=new Image(),popupBox=document.createElement("div"),popupNext,popupPrev,normalizeEvent,addListener,triggerEvent,setupGalleryLinks,setPopup,getLinkNodes,recenterBox;normalizeEvent=function(e){if(!e.stopPropagation){e.stopPropagation=function(){this.cancelBubble=true;};e.preventDefault=function(){this.returnValue=false;};}
if(e.srcElement&&!e.target){e.target=e.srcElement;}
return e;};addListener=function(node,type,handler){var wrapHandler=function(e){handler.apply(node,[normalizeEvent(e||window.event)]);};if(node.attachEvent){node.attachEvent("on"+type,wrapHandler);}else{node.addEventListener(type,wrapHandler,false);}
return{node:node,type:type,handler:wrapHandler};};triggerEvent=function(node,type){var evt;if(document.createEventObject){evt=document.createEventObject();return node.fireEvent("on"+type,evt);}else{evt=document.createEvent("HTMLEvents");evt.initEvent(type,true,true);return!node.dispatchEvent(evt);}};setupGalleryLinks=function(){var galleryLinks,i,len;galleryLinks=document.querySelectorAll("a[rel=quickslide]");for(i=0,len=galleryLinks.length;i<len;i+=1){addListener(galleryLinks[i],"click",function(e){e.preventDefault();if(popupVisible){triggerEvent(popupBox,"click");}
setPopup(this);});}};setPopup=function(fromNode){if(popupImg.src===fromNode.href){popupImg.src="";}
popupImg.src=fromNode.href;popupBox.style.width=loadingSpinner.width+"px";popupBox.style.height=loadingSpinner.height+"px";document.body.appendChild(popupBox);recenterBox(popupBox,loadingSpinner);popupVisible=true;};recenterBox=function(box,srcImg){var s=box.style,cw,ch;if(document.documentElement&&document.documentElement.offsetWidth){cw=document.documentElement.offsetWidth;ch=document.documentElement.offsetHeight;}else{cw=window.innerWidth;ch=window.innerHeight;}
ch-=document.body.scrollTop;if(config.auto_fit){if(srcImg.width>cw-25){console.log("too wide:",srcImg.width,cw);srcImg.width=cw-25;}
if(srcImg.height>ch-40){console.log("too high:",srcImg.height,ch);srcImg.height=ch-40;}}
s.width=srcImg.width+"px";s.height=srcImg.height+"px";s.top=(Math.round((ch-srcImg.height-40)/2)+
document.body.scrollTop)+"px";s.left=Math.round((cw-srcImg.width)/2)+"px";};config=config||{};loadingSpinner.src=config.loading_spinner_url||"images/loading-spinner.gif";popupBox.appendChild(loadingSpinner);popupBox.className="quickslide-popup-box";addListener(popupBox,"click",function(e){try{popupBox.removeChild(popupImg);}catch(err){}
popupBox.appendChild(loadingSpinner);document.body.removeChild(popupBox);popupVisible=false;});addListener(popupImg,"load",function(e){var mw=config.max_width,mh=config.max_height;popupBox.removeChild(loadingSpinner);if(mw&&popupImg.width>mw){popupImg.width=mw;}
if(mh&&popupImg.height>mh){popupImg.height=mh;}
popupBox.appendChild(popupImg);recenterBox(popupBox,popupImg);});addListener(window,"load",function(){setupGalleryLinks();});}(QuickSlideConfig));