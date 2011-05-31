
var QuickSlideConfig;(function(config){var popupVisible=false,loadingSpinner=document.createElement("img"),popupImg,popupBox=document.createElement("div"),popupNext,popupPrev,normalizeEvent,addListener,triggerEvent,setupGalleryLinks,setPopup,getLinkNodes,recenterBox,popupLoaded;normalizeEvent=function(e){if(!e.stopPropagation){e.stopPropagation=function(){this.cancelBubble=true;};e.preventDefault=function(){this.returnValue=false;};}
if(e.srcElement&&!e.target){e.target=e.srcElement;}
return e;};addListener=function(node,type,handler){var wrapHandler=function(e){handler.apply(node,[normalizeEvent(e||window.event)]);};if(node.attachEvent){node.attachEvent("on"+type,wrapHandler);}else{node.addEventListener(type,wrapHandler,false);}
return{node:node,type:type,handler:wrapHandler};};triggerEvent=function(node,type){var evt;if(document.createEventObject){evt=document.createEventObject();return node.fireEvent("on"+type,evt);}else{evt=document.createEvent("HTMLEvents");evt.initEvent(type,true,true);return!node.dispatchEvent(evt);}};setupGalleryLinks=function(){var galleryLinks,i,len;galleryLinks=document.querySelectorAll("a[rel=quickslide]");for(i=0,len=galleryLinks.length;i<len;i+=1){addListener(galleryLinks[i],"click",function(e){e.preventDefault();if(popupVisible){triggerEvent(popupBox,"click");}
setPopup(this);});}};setPopup=function(fromNode){document.body.appendChild(popupBox);popupBox.appendChild(loadingSpinner);recenterBox(popupBox,loadingSpinner);popupImg=new Image();addListener(popupImg,"load",popupLoaded);popupImg.src=fromNode.href;popupVisible=true;};recenterBox=function(box,srcImg,log){var bs=box.style,cw,ch,scrollTop=document.body.scrollTop||(document.documentElement&&document.documentElement.scrollTop),px,py,w,h,s,mw=config.max_width,mh=config.max_height;cw=window.innerWidth||document.documentElement.clientWidth;ch=window.innerHeight||document.documentElement.clientHeight;w=srcImg.width;h=srcImg.height;if(mw&&w>mw){h=Math.round(h*mw/w);w=mw;srcImg.style.maxWidth=mw+"px";}
if(mh&&h>mh){w=Math.round(w*mh/h);h=mh;srcImg.style.maxHeight=mh+"px";}
px=box.offsetWidth-w;py=box.offsetHeight-h;if(config.auto_fit){if(w+px>cw){h=Math.round(h*(cw-px)/w);w=cw-px;srcImg.style.maxWidth=w+"px";}
if(h+py>ch){w=Math.round(w*(ch-py)/h);h=ch-py;srcImg.style.maxHeight=(ch-py)+"px";}}
if(log){console.log("Image height:",h);console.log("Scroll pos:",scrollTop);console.log("Window height:",ch);}
if(config.absolute_position){bs.top=(Math.round((ch-h)/2)-(py/2))+"px";}else{bs.top=(Math.round((ch-h)/2)+scrollTop-(py/2))+"px";}
bs.left=(Math.round((cw-w)/2)-px/2)+"px";};config=config||{};loadingSpinner.src=config.loading_spinner_url||"loading-spinner.gif";popupBox.appendChild(loadingSpinner);popupBox.className="quickslide-popup-box";popupBox.style.position=config.absolute_position?"absolute":"fixed";addListener(popupBox,"click",function(e){try{popupBox.removeChild(popupImg);}catch(err){}
popupImg.src="";popupBox.appendChild(loadingSpinner);document.body.removeChild(popupBox);popupVisible=false;});popupLoaded=function(){popupBox.removeChild(loadingSpinner);popupBox.appendChild(popupImg);recenterBox(popupBox,popupImg);};addListener(window,"load",function(){setupGalleryLinks();});}(QuickSlideConfig));