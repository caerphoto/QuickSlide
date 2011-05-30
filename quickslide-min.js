
var QuickSlideConfig;(function(config){var popupVisible=false,loadingSpinner=document.createElement("img"),popupImg,popupBox=document.createElement("div"),popupNext,popupPrev,normalizeEvent,addListener,triggerEvent,setupGalleryLinks,setPopup,getLinkNodes,recenterBox,popupLoaded;normalizeEvent=function(e){if(!e.stopPropagation){e.stopPropagation=function(){this.cancelBubble=true;};e.preventDefault=function(){this.returnValue=false;};}
if(e.srcElement&&!e.target){e.target=e.srcElement;}
return e;};addListener=function(node,type,handler){var wrapHandler=function(e){handler.apply(node,[normalizeEvent(e||window.event)]);};if(node.attachEvent){node.attachEvent("on"+type,wrapHandler);}else{node.addEventListener(type,wrapHandler,false);}
return{node:node,type:type,handler:wrapHandler};};triggerEvent=function(node,type){var evt;if(document.createEventObject){evt=document.createEventObject();return node.fireEvent("on"+type,evt);}else{evt=document.createEvent("HTMLEvents");evt.initEvent(type,true,true);return!node.dispatchEvent(evt);}};setupGalleryLinks=function(){var galleryLinks,i,len;galleryLinks=document.querySelectorAll("a[rel=quickslide]");for(i=0,len=galleryLinks.length;i<len;i+=1){addListener(galleryLinks[i],"click",function(e){e.preventDefault();if(popupVisible){triggerEvent(popupBox,"click");}
setPopup(this);});}};setPopup=function(fromNode){document.body.appendChild(popupBox);popupBox.appendChild(loadingSpinner);recenterBox(popupBox,loadingSpinner);popupImg=new Image();addListener(popupImg,"load",popupLoaded);popupImg.src=fromNode.href;popupVisible=true;};recenterBox=function(box,srcImg){var bs=box.style,cw,ch,scrollTop=document.body.scrollTop||(document.documentElement&&document.documentElement.scrollTop),px,py,w,h,s;cw=document.documentElement.clientWidth;ch=document.documentElement.clientHeight;w=srcImg.width;h=srcImg.height;px=box.offsetWidth-w;py=box.offsetHeight-h;if(config.auto_fit){if(w+px>cw){s=cw/w;w=w*s;h=h*s;}
if(h+py>ch){s=ch/h;w=w*s;h=h*s;}}
srcImg.setAttribute("width",w-px);srcImg.setAttribute("height",h-py);bs.top=(Math.round((ch-h)/2)+scrollTop)+"px";bs.left=Math.round((cw-w)/2)+"px";};config=config||{};loadingSpinner.src=config.loading_spinner_url||"loading-spinner.gif";popupBox.appendChild(loadingSpinner);popupBox.className="quickslide-popup-box";popupBox.style.position="absolute";addListener(popupBox,"click",function(e){try{popupBox.removeChild(popupImg);}catch(err){}
popupImg.src="";popupBox.appendChild(loadingSpinner);document.body.removeChild(popupBox);popupVisible=false;});popupLoaded=function(){var w,h,mw=config.max_width,mh=config.max_height,s;popupBox.removeChild(loadingSpinner);w=popupImg.width;h=popupImg.height;if(mw&&w>mw){s=mw/w;w=w*s;h=h*s;}
if(mh&&h>mh){s=mh/h;w=w*s;h=h*s;}
popupImg.setAttribute("width",w);popupImg.setAttribute("height",h);popupBox.appendChild(popupImg);recenterBox(popupBox,popupImg);};addListener(window,"load",function(){setupGalleryLinks();});}(QuickSlideConfig));