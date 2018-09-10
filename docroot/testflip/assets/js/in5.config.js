
var useBookmark = false;
var limitWebAppToDevice = true;
var stopIFrameOnNewPage = true;
var resetSliderScrollY = true;
var enablePullTabs = true;
var useSmoothSwipeOnImageSequences = true;
var bookmarkName = 'in5_bookmark_' + location.href.substr(location.host.length);
var touchEnabled = 'ontouchstart' in document.documentElement;
var clickEv = (touchEnabled) ? 'vclick' : 'click';
var prefix = (function () {
  	var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['','o']))[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  return { dom: dom, lowercase: pre, css: '-' + pre + '-', js: pre[0].toUpperCase() + pre.substr(1)};
})();
var pre = (document.createElement('div').style['WebkitTransform'] != undefined) ? '-webkit-' : '';
var useSwipe = true;
var pageMode = 'flip';
var pageW = 612, pageH = 792;
var isLiquid = (pageMode.indexOf('liquid') != -1), flip = (pageMode.indexOf('flip') != -1);
var multifile = false;
var arrowNav = true;
var lazyLoad = true;
var scaleMode = 'none_desktop';
var webAppType = '';
var useTracker = false;
var shareInfo = {btns:[], align:"left"};
var maxScaleWidth, maxScaleHeight;
var webAppEmailSubject = 'Check out this Web App for {deviceName}';
var webAppEmailBody = 'Add this Web App to Your {deviceName} by visiting: ';
var sliderSettings = {}, nav = {}, in5 = {},
viewOpts = ({});
var uAgent = navigator.userAgent.toLowerCase();
var isIPad = uAgent.indexOf("ipad") > -1, isIPhone = uAgent.indexOf("iphone") > -1,
	isWebkit = 'WebkitAppearance' in document.documentElement.style,
	isAndroid = uAgent.indexOf('android') > -1, isChrome = uAgent.indexOf('chrome') > -1,
	isBaker = uAgent.indexOf("bakerframework") > -1, isLocal = (location.protocol === 'file:');
navigator.standalone = navigator.standalone || checkStandalone();
if(isLocal) $('html').addClass('local');
if(location.href.indexOf('OverlayResources') !== -1) $('html').addClass('dps');
if(isBaker) { useSwipe=false; $('html').addClass('baker'); }
if(isIPad || isIPhone) { $('html').addClass('ios'); }
if(uAgent.indexOf('safari') > -1 && !isChrome) {
$('html').addClass('safari');
if(uAgent.indexOf('windows') > -1){$('html').addClass('win-safari')};
window.setInterval=function(f,t){var i=window.setInterval.count?++window.setInterval.count:window.setInterval.count=1;var a=arguments;window.setInterval[i]=function(){if(window.setInterval[i].active){if(typeof f=="string"){eval(f)}else if(a.length>2){f.apply(this,Array.prototype.slice.call(a,2))}else{f()}setTimeout(window.setInterval[i],t)}};window.setInterval[i].active=true;setTimeout(window.setInterval[i],t);return{intervalId:i}};window.clearInterval=function(e){window.setInterval[e.intervalId].active=false}
}

function checkStandalone(){
	if(isAndroid){
		if(uAgent.match(/chrome.(?:(3[8-9])|(?:[4-9][0-9]))/i) ){ return (screen.height-window.outerHeight<80); }
		return true; /*bypass install screen until better implementation is available*/
		/*return (screen.height-document.documentElement.clientHeight<40); old android hack*/
	}
}

function go(e, objArr, triggerEvent){ 
	if(nav.activeView && triggerEvent === 'pageload'){
		var now = new Date().getTime(), goContent = JSON.stringify(objArr);
		if(in5.lastGoStart && now - in5.lastGoStart<200 && in5.lastGoContent == goContent){return;}
		in5.lastGoStart=now, in5.lastGoContent=goContent;
	}
	new AnimationSequence(e,objArr,triggerEvent); 
}
function playAnim(e,item,objArr){ new AnimationItem(objArr,{pointer:-1,next:function(){}}).go(); }
function AnimationSequence(e, objArr, triggerEv){
	this.triggerEvent = triggerEv, this.incomingEvent = e, 
	this.items=[], this.pointer=-1;
	var i=0; len = this.length = objArr.length;
	for(i;i<len;i++){ this.items.push(new AnimationItem(objArr[i], this)); }
	this.next = function(){
		if(this.pointer === null) return;
		this.pointer++;
		if(this.pointer >= this.length) { this.pointer=null; return; }
		var item = this.items[this.pointer];
		item.go();
		if(item.link){ this.next(); }
	};
	this.next();
}
AnimationSequence.prototype.name = "AnimationSequence";
AnimationSequence.prototype.toString = function(){return this.name;};

function AnimationItem(obj, seq){
	this.data = obj, this.dataID = obj.id, this.$element = $('[data-id='+this.dataID+']'),
	this.element = this.$element[0], this.action = obj.act, this.sequence = seq,
	this.animCSS = this.$element.attr('data-ani'), this.loops = obj.n, this.delay = obj.del,
	this.unroll = obj.unroll, this.link = obj.link, this.index = seq.pointer;
	this._prep = function(){
		switch(this.action) {
			case 'reverse': this.reverse(); break;
			case 'play': this.play(); return false;
			case 'stop': this.$element.css(pre+'animation','none'); return false;
			case 'pause': this.$element.css(pre+'animation-play-state','paused'); break;
			case 'resume': this.$element.css(pre+'animation-play-state','running'); break;
			case 'stopall': $('.activePage').find('[data-ani]').css(pre+'animation','none'); break;
		}
	}, this._forceRedraw = function() { this.element.offsetWidth = this.element.offsetWidth; },
	this.stop = function() {this.$element.css(pre+'animation','none'); this.active=false;},
	this.play = function(){
		if(!this.$element.length) { this.next(); return; }
		this.stop(), this._forceRedraw(), this.active = true;
		var ani = this.animCSS, delay = (this.delay) ? this.delay+'s' : '0s', 
			dir = (this._reverse) ? 'reverse' : 'normal';
		if(this.loops && this.loops != 1) ani = ani.replace(/(?:\d+$)/,this.loops);
		if(!this._unrolling) {
			if(this.unroll) { this.setRollOff(); }
			if(this.sequence.length > 1) {
			this.$element.data('animationItem',this).one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', 
			function(e){ $(this).data('animationItem').next();  });
			}
		}
		this.$element.css({animation:ani, '-webkit-animation':ani, 
		'animation-delay':delay, '-webkit-animation-delay':delay, 
		'animation-direction':dir, '-webkit-animation-direction':dir}).removeClass('hidden');
		return this;
	}, this.reverse = function() { this._reverse = 1; return this.play(); }, 
	this.doRollOff = function() { this._unrolling=1; this.reverse(); this._unrolling=0; },
	this.setRollOff = function(){
		$(this.unroll).data('unrollItem',this).one('mouseleave', function(e) { $(this).data('unrollItem').doRollOff();  });
	}, this.next = function() { this.active = false; if(!this.link) { this.sequence.next(); } },
	this.go = function(){ if(this._prep()){this.play();}return true;};
}
AnimationItem.prototype.name = "AnimationItem";
AnimationItem.prototype.toString = function(){return this.name;};

function toggleAudio(btn){
	var elem = $(btn).siblings('audio')[0];
	if(elem == undefined) elem = $(btn).siblings().find('audio')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player || elem, media = player.media || elem;
	if(media.paused) player.play();
	else player.pause();
	} catch(e){}
}

function playMedia(dataID, from) {
	var elem = $('audio,video').filter('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
		var player = elem.player || elem;
		player.play();
		if(from != undefined && from != -1) try{ setTimeout(function(){player.setCurrentTime(from);}, 500); }catch(e){}
	} catch(e){console.log(e);}
}

function stopMedia(dataID){ pauseMedia(dataID,true); }
function pauseMedia(dataID, rewind) {
	var elem = $('audio,video').filter('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player || elem;
	player.pause();
	if(rewind) elem.currentTime = 0;
	} catch(e){}
}

function stopAllMedia(targ) {
	if(!targ) targ = document;
	$(targ).find('audio,video').each(function() {
		var media = $(this)[0], player = media.player || media;
		try{player.pause(); media.currentTime = 0;}catch(e){}
	});
}

function stopIframe(targ){
	$(targ).find('iframe').each(function(index,elem){
		var j = $(elem), src = j.attr('src');
		j.attr('src', '');
		if(j.attr('data-src')) j.siblings('.cover').show();
		else j.attr('src', src);
	});
}

function autoPlayMedia(i,elem) {
	if($(elem).parents('.state').not('.active').length) return; /*skip hidden video in MSOs*/
	var delay = parseFloat($(elem).attr('data-autodelay'))* 1000 || 250+i;
	try{ setTimeout(function(){var player = elem.player || elem; player.play();}, delay); }catch(e){}
}	

function onNewPage(e, data){
	seqPos = 0;
	if(!multifile) stopAllMedia();
	if(data == undefined || data.index == undefined) return;
	if(!multifile) {
		if(data.slider && data.slider.scrollAdjust){
			data.slider.scrollAdjust();
			delete data.slider.scrollAdjust;
		} else if(resetSliderScrollY && sliderSettings.useSlider && $(window).scrollTop()>2){$(window).scrollTop(0);}
		$('.page [data-hidestart]').addClass('hidden');
		if(stopIFrameOnNewPage && nav.previousPageIndex != undefined) { stopIframe($('.page').eq(nav.previousPageIndex)); };
		nav.current = data.index+1;
		nav.previousPageIndex = data.index;
		if(useBookmark && localStorage) localStorage[bookmarkName] = nav.current;
		if(lazyLoad && !data.view) loadImages(data.index);
	}
	var activePages = [], $pages=$('.page').removeClass('activePage'),$active;
	if(data.view){
		var pageObjs = $sl.data().pageObjs;
		if(data.view[0] > 0 && pageObjs[data.view[0]]) activePages.push(pageObjs[data.view[0]]);
		if(data.view[1] > 0 && pageObjs[data.view[1]]) activePages.push(pageObjs[data.view[1]]);
		nav.activeView = data.view, $active = $(activePages);
		if(lazyLoad) {
			loadPageImages(pageObjs[data.view[0]]); 
			if(data.view[1]){
				loadPageImages(pageObjs[data.view[1]]);
				setTimeout(function(){loadPageImages(pageObjs[data.view[1]+1]); loadPageImages(pageObjs[data.view[1]+2]);},100);
			} else {
				setTimeout(function(){loadPageImages(pageObjs[data.view[0]+1]);},100);
			}
			if(data.view[0]>3){ setTimeout(function(){loadPageImages(pageObjs[data.view[0]-2]); loadPageImages(pageObjs[data.view[0]-1]);},250);}
		}
	} else { 
		$active = $pages.eq(data.index);
	}
	var refreshPage = false;
	$active.each(function(index,el) {
		var $el = $(el).addClass('activePage').show(), aniLoad = $el.attr('data-ani-load');
		$el.find('audio,video').filter('[data-autoplay]').each(function(i,elem){autoPlayMedia(i, elem)});
		if(aniLoad && aniLoad.length) setTimeout(function(){ eval(aniLoad); },1);/*to do:remove timeout*/
		if(refreshPage || (data.view && !$el.is(':visible'))){ $el.parents('.turn-page-wrapper').redraw(), refreshPage = true; }
	});
	$('.activePage .cover').filter('[data-delay]').each(function(index,el){
		setTimeout(function(){ $(el).trigger(clickEv); }, parseFloat($(el).attr('data-delay'))*1000 );
		return false;
	});
	$('.activePage .mso > .state.active').trigger('newState');
	$(document).trigger('pageRendered', data);
}

function loadImages(pageIndex) {
	var pages = $('.page');
	loadPageImages(pages.eq(pageIndex));
	loadPageImages(pages.eq(pageIndex+1));
	if(pageIndex > 0){ loadPageImages(pages.eq(pageIndex-1)); }
}

function loadPageImages(targPage){
	if(targPage && !targPage.data('loaded')){
		targPage.find('img').filter('[data-src]').each(function(index,el){ 
			var $el = $(el);
			if((!isWebkit || !isLocal) && $el.hasClass('svg-img')){
				$el.parent().load($el.attr('data-src')+' svg',function(resp,status,xhr){
					if(status==='error'){$el.attr('src', $el.attr('data-src'));}
				});
			} else{$el.attr('src', $el.attr('data-src'));}
			$el.removeAttr('data-src');
		});
		targPage.data('loaded', true);
	}
}

/*to do:check for when multiple pages are visible*/
function checkScroll(e, mode){
	if(window.scrolling) return;
	var docMin, docMax, docSpan, elemSpan, elemMin, elemMax, elemCenter;
	var vertMode = (mode === 'v');
	docMin = (vertMode) ? $(window).scrollTop() : $(window).scrollLeft();
	docMax = (vertMode) ? docMin + $(window).height(): docMin + $(window).width();
	docSpan = docMax - docMin;
    $('.pages .page').not('.activePage').each(function(index,elem) {
    	elemMin = (vertMode) ? Math.floor($(elem).offset().top) : Math.floor($(elem).offset().left);
    	elemMax = (vertMode) ? Math.ceil(elemMin + $(elem).height()) : Math.ceil(elemMin + $(elem).width());
    	elemSpan = elemMax - elemMin;
    	if(docSpan <= elemSpan) {
    		elemCenter = elemMin + elemSpan*.5;
    		if(elemCenter < docMax && elemCenter > docMin){
    			$(document).trigger('newPage', {index:$(elem).index()});
				return;
    		}
    	}else if((elemMax <= docMax) && (elemMin >= docMin)) {
    		$(document).trigger('newPage', {index:$(elem).index()});
    		return;
		}
    });
}

function onNewState(e){
	var targState = $(e.target).show();
	var aniLoad = targState.attr('data-ani-load');
	if(aniLoad && aniLoad.length) eval(aniLoad);
	stopAllMedia(targState.siblings('.state'));
	targState.find('audio,video').filter('[data-autoplay="1"]').each(function(i,elem){autoPlayMedia(i, elem)});
	targState.find('[data-autostart="1"]').each(function(i,el){toFirstState(el); startSlideShowDelayed(el); });
	targState.siblings('.state').find('[data-hidestart]').addClass('hidden');
}

function nextState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	if(mso.attr('class').indexOf('flipcard-') > -1) { mso.toggleClass('flipped'); return false; }

	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current+1 < states.length) {
		mso.each(function(index,elem) {
			if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade, function(){$(this).removeClass('transition')});
				el.children('.state').eq(current+1).addClass('active').hide().fadeIn(elem.crossfade, function(e) { last.hide(); $(this).trigger('newState'); });
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current+1).addClass('active').trigger('newState');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade, function(){$(this).removeClass('transition')});
				el.children('.state').first().addClass('active').hide().fadeIn(elem.crossfade, function(e) { last.hide(); $(this).trigger('newState');});
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').first().addClass('active').trigger('newState');
	 	});
	}
}

function prevState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(mso.attr('class').indexOf('flipcard-') > -1){mso.removeClass('flipped');return false;}
	if(current-1 > -1) {
		mso.each(function(index,elem) {
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade,function(){$(this).removeClass('transition')});
				el.children('.state').eq(current-1).addClass('active').hide().fadeIn(elem.crossfade,function(e) { last.hide(); $(this).trigger('newState');});
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current-1).addClass('active').trigger('newState');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade,function(){$(this).removeClass('transition')});
				el.children('.state').last().addClass('active').hide().fadeIn(elem.crossfade,function(e) { last.hide(); $(this).trigger('newState');});
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').last().addClass('active').trigger('newState');
	 	});
	}
}

function toState(dataID, stateIndex, restoreOnRollOut, restoreTarg){
	if(restoreOnRollOut) {
		var current = $('[data-id=' + dataID + ']').children('.state.active').first().index();
		$(restoreTarg).mouseleave(function() { toState(dataID, current); });
	}
	$('[data-id=' + dataID + ']').each(function(index,elem) {
		var $el = $(elem);
		$el.removeClass('hidden').children('.state').removeClass('active').hide().eq(stateIndex).addClass('active').show().trigger('newState');
		if($el.attr('class').indexOf('flipcard-')>-1){$el[stateIndex>0?'addClass':'removeClass']('flipped').children.attr('display','');return false;}
		if(elem.playing) stopSlideShow(elem);
	});
}

function toFirstState(el) { var f = (el.reverse) ? $(el).children('.state').length-1 : 0; toState($(el).attr('data-id'), f); }

function startSlideShowDelayed(el) { 
	var mso=$(el); 
	setTimeout(function(){ startSlideShow(el); }, parseFloat(mso.attr('data-autostartdelay'))*1000 + (mso.is(':visible')?el.duration*1000:0)); 
}

function startSlideShow(el){
	if(el.playing || $(el).is(':hidden')) return;
	el.playing = true;
	el.loopcount = 0;
	var func = (el.reverse) ? prevState : nextState;
	func($(el).attr('data-id'), true );
	el.playint = setInterval(function(){ func($(el).attr('data-id'), true ); }, el.duration*1000);
}

function stopSlideShow(elem) {
	elem.playing = false;
	if(elem.hasOwnProperty('playint')) clearInterval(elem.playint);
	$(elem).find('.state').css('display','').css('opacity','1');
}

function hide(dataID) { $('[data-id=' + dataID + ']').addClass('hidden'); }
function show(dataID) { $('[data-id=' + dataID + ']').removeClass('hidden'); }
function loadFrame(iframe){ iframe.src = $(iframe).attr('data-src'); }
function animateImageSeq(dir,rev,amt,threshold,msoID,loopSwipe,init){
	if(init) {
		in5.swipeStartTime = new Date().getTime()-20, 
		in5.swipePosVal = 0, amt /= threshold, threshold *= .001;
	}
	var lastPos = in5.swipePosVal;
	in5.swipeTimeElapsed = new Date().getTime()-in5.swipeStartTime;
	in5.swipePosVal = imageSeqEase(in5.swipeTimeElapsed,0,amt,360);
	if(init || (in5.swipePosVal-lastPos) >= threshold) {
		switch(dir){
			case "left":
				if(rev) prevState(msoID, loopSwipe);
				else nextState(msoID, loopSwipe);
				break;
			case "right":
				if(rev) nextState(msoID, loopSwipe);
				else prevState(msoID, loopSwipe);
				break;
		}
	}
	if(in5.swipeTimeElapsed < 300 || Math.ceil(in5.swipePosVal)<amt){ setTimeout(function(){ 
		animateImageSeq(dir,rev,amt,threshold,msoID,loopSwipe); },20); }
}
function imageSeqEase(t,b,c,d){return c*((t=t/d-1)*t*t+1)+b; }
function initWebApp(){
	var isDevice, deviceName, nameForNonDeviceFile = webAppType, nameForDeviceFile = webAppType, styleStr="position:fixed;width:100%;";
	switch(webAppType){
		case 'ipad': deviceName2 = deviceName = 'iPad'; isDevice = isIPad; break;
		case 'iphone': deviceName2 = deviceName = 'iPhone'; isDevice = isIPhone; styleStr+="bottom:0;"; break;
		case 'android': deviceName2 = deviceName = 'Android'; isDevice = isAndroid; break;
		default:
			deviceName = 'Mobile'; deviceName2 = 'Mobile Device';
			isDevice = (isAndroid || isIPad || isIPhone);
			nameForDeviceFile = (isAndroid) ? 'android' : ((isIPad) ? 'ipad' : 'iphone');
	}
	if(isDevice){
		if(!navigator.standalone) {
			$('#container-wrap').hide();
			if(window.stop && !$('html').is('[manifest]')/*does not have app cache*/){
				window.stop();
				$('body').addClass('loaded');
			}
			if(uAgent.indexOf('crios/')>-1){
				$('body').css({'background':'#fff','padding':'20px'}).append('<p style="font-family:sans-serif;">In order to install this Web App to your Home Screen, you will need to open it with <strong style="font-weight:bold;">Safari</strong>.<br><br><em style="font-style:italic;">Install to Home Screen</em> is not supported in Chrome.<br><br>You can copy and paste the web address above.</p>');
				return true;
			}
			$('body').addClass('webapp-instructions').css('background','#fff)').append('<img style="'+styleStr+'" src="assets/images/add_to_home_'+nameForDeviceFile+'.png" />');
			return true;
		}
	} else if(limitWebAppToDevice) {
		$('#container-wrap').hide();
		if(window.stop){
			$('body').addClass('loaded').find('#toloadIndicator').hide();
			window.stop();
		}
		var sendLinkURL = 'mailto:?subject=' + escape(webAppEmailSubject.split('{deviceName}').join(deviceName)) +'&amp;body=' + escape(webAppEmailBody.split('{deviceName}').join(deviceName2)) +
		(location.protocol == 'file:' ? '%28Post%20to%20a%20web%20server%20to%20show%20URL%29' : location.href) +'"><img src="assets/images/non_'+nameForNonDeviceFile+'.png';
		$('body').addClass('webapp-instructions').css('background','#fff').append('<a href="'+sendLinkURL+'" /></a>').find('#container-wrap').hide();
		return true;
	}
	return false;
}


function initClickEvents(){
	$('#container').find('*').each(function(index,el){
		var clickArr=[],$el=$(el),args,postArr=[];
		$.each(el.attributes,function(ind,attrib){
			var at=attrib.name, aval=attrib.value;
			switch(at){
				case 'onclick': postArr.push(function(){$el.attr('data-onclick',aval).removeAttr(at);}); clickArr.push(function(event){eval($el.attr('data-onclick'));/*name must be 'event'*/ }); break;
				case 'data-ani-click': clickArr.push(function(e){		if($(e.target).closest('a,button,input,select,textarea,.mejs-overlay-button,map,[onclick],[data-useswipe="1"],[data-tapstart="1"],.panzoom',$el).length>0)return; /*exclude clicks on these*/
			if($el.hasClass('activePage')) eval(aval); }); break;
				case 'data-click-show': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ show(val); }); }); break;
				case 'data-click-hide': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ hide(val); }); $el.parent('a').trigger(clickEv); }); break;
				case 'data-click-next':clickArr.push(function(e){ args=($el.attr('data-loop')=='1'); $.each(aval.split(','), function(i,val){ nextState(val,args); }); }); break;				
				case 'data-click-prev': clickArr.push(function(e){ args=($el.attr('data-loop')=='1'); $.each(aval.split(','), function(i,val){ prevState(val,args); }); }); break;
				case 'data-click-state': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ args=val.split(':'); toState(args[0],args[1]); }); }); break;
				case 'data-click-play': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ args=val.split(':'); playMedia(args[0],args[1]); }) });	break;
				case 'data-click-pause': clickArr.push(function(e){$.each(aval.split(','), function(i,val){ pauseMedia(val); }) }); break;
				case 'data-click-stop': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ pauseMedia(val,true);}) }); break;
				case 'data-click-stopall': clickArr.push(function(e){stopAllMedia();}); break;
			}
		});
		$.each(postArr,function(i,func){func();});
		var pd = touchEnabled || clickArr.length===1;
		if(clickArr.length) { $el.on(clickEv,function(e){$.each(clickArr,function(i,func){func.call(el,e);}); $(this).parents('a').trigger(clickEv); if(pd){return false;} e.stopPropagation();  }); }
	});
}

$(window).on('hashchange', function(e){ checkHashData(e); });
function checkHashData(e){
	if(multifile){
		var hash = location.hash.split('#').join('');
		if(hash.length){
			var pie = hash.split('&'), plen = pie.length, piece, parts, $c = $('#container'),
			offset = $c.offset(), cScale = getCurrentScale($c);
			while(plen--){
				piece = pie[plen], parts = piece.split('=');
				switch(parts[0]){
					case 'refy':$(document).scrollTop(parseInt(parts[1])*cScale + offset.top); break;
				}
			}
		}
	} else {
		var p = getHashPage();
		if(p > 0) nav.to(p);
		else if(e && $.scrollTo && !!$(window).scrollTop()){checkScroll(e,pageMode.substr(2));} 
	}
}

function initPullTabs(){
	if(enablePullTabs) {
	$('.scroll-horiz > *').each(function(index,elem){
		var left = parseFloat($(elem).css('left'));
		if(left < 0){ $(elem).css({left:'auto',right:left+'px'}).attr('style', $(elem).attr('style').replace(/( \!important)*;/g,' !important;')).parent('.scroll-horiz').addClass('pulltab-left'); }
	});
	$('.scroll-vert > *').each(function(index,elem){
		var top = parseFloat($(elem).css('top'));
		if(top < 0){ $(elem).css({top:'auto',bottom:top+'px'}).attr('style', $(elem).attr('style').replace(/( \!important)*;/g,' !important;')).parent('.scroll-vert').addClass('pulltab-top'); }
	});
	}
}

function initAnimationAttribs() {
	var $ani = $('[data-ani]');
	$ani.on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', 
		function(e){
		var jel = $(this);
		if((jel.attr('style')||'').indexOf('reverse')<0) {
			if(jel.attr('data-hideend')=='1') jel.addClass('hidden');
		}else { 
			jel.css(pre+'animation', 'none'); 
			if(jel.attr('data-hidestart')=='1') jel.addClass('hidden');
		}
        return false;
	}).each(function(index,el){
		var $el = $(el),hs=($el.attr('data-hidestart')=='1'),he=($el.attr('data-hideend')=='1');
		if(!multifile && (hs || he)){
		$(document).on('newPage',function(e,data){
			var onpage = $.contains($('.page').eq(data.index)[0],el),style=$el.attr('style')||'';
			if(!onpage){
				if(he) $el.removeClass('hidden');
				if(hs) $el.addClass('hidden');
				$el.attr('style',style.replace(/(?:animation[^;]+;*\s*)/,'')); 
			}
		}); }
	});
}

function initMSOs(){
	var $msos = $('.mso');
	if(!$msos.length) return;
	$msos.filter('.flipcard-up,.flipcard-side').on(clickEv,function(e){if(!$(e.target).parents('a').length){$(this).toggleClass('flipped');return false;}});
	$msos.find('.state').on('newState', function(e){ onNewState(e); });
	$msos.filter('.slideshow').each(function(index,el) {
		var mso = $(el), msoID = mso.attr('data-id'), loopSwipe = (mso.attr('data-loopswipe') == '1');
		var msoSwipe = (mso.attr('data-useswipe') == '1');
		el.duration = parseFloat(mso.attr('data-duration'));
		el.loopmax = parseInt(mso.attr('data-loopmax'));
		el.crossfade = parseFloat(mso.attr('data-crossfade')) * 1000;
		el.reverse = mso.attr('data-reverse') == '1';
		el.pageIndex = mso.parents('.page').index();
		if(mso.attr('data-tapstart') == '1' && !msoSwipe) {
			mso.on(clickEv, function(e) {
			if(!this.playing) startSlideShow(this);
			else stopSlideShow(this);
			return false;
			});
		}
		if(mso.attr('data-autostart') == '1') {
			$(document).on('pageRendered', function(e, data) {
				if(mso.parents('.activePage').length) startSlideShowDelayed(el);
				else if (el.playing) stopSlideShow(el);
			});
		}
		if(msoSwipe) {
			if(useSmoothSwipeOnImageSequences && mso.hasClass('seq')){
				var triggerDist, lastPos,rev = el.reverse;
				mso.swipe({
					allowPageScroll:'vertical',fingers:1,maxTimeThreshold:9999,triggerOnTouchLeave:true,
					swipeStatus:function(evt,phase,dir,dist,dur,fingers,fingerData,currentDir) {
						switch(phase){
							case 'move':
								stepDist = Math.abs(dist - lastPos);
								if(stepDist < triggerDist) return;
								switch(currentDir){
									case "left":
										if(rev) prevState(msoID, loopSwipe);
										else nextState(msoID, loopSwipe);
										lastPos = dist;	
										break;
									case "right":
										if(rev) nextState(msoID, loopSwipe);
										else prevState(msoID, loopSwipe);
										lastPos = dist;	
										break;
								}
								break;
							case 'start': lastPos = 0; triggerDist = mso.width()/mso.find('.state').length*.5; break;
							case 'end':animateImageSeq(currentDir,rev,stepDist,triggerDist,msoID,loopSwipe,true); break;
						}
					},
				});
			} else {
				mso.swipe({
				allowPageScroll:'vertical', fingers:1, triggerOnTouchEnd:false, triggerOnTouchLeave:true,
				swipe:function(event, direction, distance, duration, fingerCount) {
					switch(direction) {
						case "left":
							if(el.reverse) prevState(msoID, loopSwipe);
							else nextState(msoID, loopSwipe);
							break;
						case "right":
							if(el.reverse) nextState(msoID, loopSwipe);
							else prevState(msoID, loopSwipe);
							break;		
					}
				} });
			}
		}
	});
}

function initLightbox(){
	$('.lightbox').filter(':not(svg *)').filter(':not([href*=lightbox\\=0])').filter(isBaker?':not([href*=referrer\\=Baker])':'*').colorbox({iframe:true, width:"85%", height:"85%"});
		$('svg .lightbox').each(function(index,el){
			var jel = $(el);
			var xref = jel.attr('xlink:href');
			if(xref.indexOf('lightbox=0') != -1) return;
			if(!isBaker || xref.indexOf('referrer=Baker') != -1){
				jel.on(clickEv, function(){
				$.colorbox({iframe:true, width:"85%", height:"85%", href:$(this).attr('xlink:href')});
				return false;
				});
			}
		});
		$('.thumb').colorbox({maxWidth:"85%", maxHeight:"85%"});
		$('[aria-details]').each(function(index,el){
			var jel=$(el), det = jel.attr('aria-details'), jid = jel.attr('id')||'',ext = det.slice(-5) === '.html';
			/*self = det.split('_').pop().split('.')[0] == jid.split('_').pop(),*/ 
			jel.on(clickEv,function(){
				if(ext) $.colorbox({iframe:isLocal&&pre.length/*chrome loc fallback*/, width:"85%", maxWidth:'600px', height:"85%", href:det});
				else $.colorbox({inline:true, width:"85%", height:"85%", href:$('#'+det)});
				return false;
		}); });
		$(window).on('resize orientationchange', function(e){ if($('#cboxWrapper:visible').length) $.colorbox.resize({width:"85%", height:"85%"}); });
}

function initPageMode(){
	if(multifile){
		$('.page [data-hidestart]').addClass('hidden');
		if(!lazyLoad){ $('.svg-img').each(function(){ $(this).parent().load($(this).attr('src')+' svg'); }); }
		$('#prefooter').css('min-height', $('.page').height());
		nav = { current:parseInt(location.href.split('/').pop().split('.html').join('')),
		to:function(n,coords){
			if(n <= 0 || n > nav.numPages) return;
			var targPage = (n*.0001).toFixed(4).substr(2) + '.html';
			if(coords && coords.length) targPage += '#refx='+coords[0]+'&refy='+coords[1];
			if(targPage == location.href.split('/').pop()) $(window).trigger('hashchange');
			else location.assign(targPage);
		} };
	} else if(flip){
		nav = { 
			next:function() { $sl.turn("next"); }, 
			back:function() { $sl.turn("previous"); }, 
			to:function(n) { $sl.turn("page", n);},
			reposition:function(view){
				var dispNum = $sl.turn('display') == 'single' ? 1 : 2;
				if(dispNum === 1) { $sl.css(prefix.css+'transform', 'translateX(0px)'); return; }
				if(!view[0] || !view[1]) {
					var mult = view[0]==0 ? -.5 : .5;
					$sl.css(prefix.css+'transform', 'translateX('+pageW*mult+'px)');
				}else { $sl.css(prefix.css+'transform', 'translateX(0px)'); }
			}
		};
		initPageFlip = function(){
			var $pages = $('.pages');
			if($pages.attr('data-dir')==='rtl'){
				$pages = $pages.find('.page');
				var i=1,len=$pages.length-1,cp,np;
				for(i;i<len;i+=2){cp=$($pages[i]),np=$($pages[i+1]),cp.before(np);}
			}
			var ori = getOrientation(), disp = (ori=='landscape') ? 'double' : 'single';
			var spreadW = (disp==='double') ? pageW*2 : pageW;
			if(!$(window).data('lastOrientation')) { $sl.turn({gradients: true, acceleration: true, display:disp, width:spreadW, height:pageH}); }
			else { 
				$sl.turn('size', spreadW, pageH).turn('display', disp).turn('resize'); 
				if(disp=='double') { try{$(document).trigger('newPage', {index:$sl.turn('page')-1,'view':$sl.turn('view')}); }catch(err){} }
			}
			$(window).data('lastOrientation', ori);
			nav.reposition($sl.turn('view'));
		};
		initPageFlip();
		$sl.turn("disable", true).on('turning',function(e,n,v){nav.update(n);}).on('turned',function(e,n,v){ 
			nav.reposition(v); try{$(document).trigger('newPage', {index:n-1,'view':v});}catch(err){} });
		$(window).on('orientationchange resize', function(event) {
			if($(window).data('lastOrientation') != getOrientation()) { initPageFlip(); }
		});
		nav.to(getStartPage());
	} else if(isLiquid) {
		if(!lazyLoad){ $('.svg-img').each(function(){ $(this).parent().load($(this).attr('src')+' svg'); }); }
		nav = { numPages:$('.pages .page').length,
		current:1,update:function(){},
		to:function(n){
			if(n < 1 || n > nav.numPages) return;
			$(document).trigger('newPage',{index:n-1});
			this.update(n);
		} };
		nav.to(getStartPage()); /*init*/
	} else if($.hasOwnProperty('scrollTo')){
		arrowNav = false;
		var dir = (pageMode[2] == 'h') ? 'x' : 'y';
		nav = { numPages:$('.pages .page').length,
			back:function(ref){var ind=$(ref).parent('.page').prev().index(); if(ind!=-1) nav.to(ind+1);},
			next:function(ref){var ind=$(ref).parent('.page').next().index(); if(ind!=-1) nav.to(ind+1);},
			to:function(n,c){
				window.scrolling = true;
				var scrollTarg;
				if(c){ 
					var offset = $('.page').eq(n-1).offset();
					scrollTarg = {left:offset.left+c[0],top:offset.top+c[1]};					
				} else { scrollTarg = $('.page').eq(n-1)[0]; }
				$.scrollTo(scrollTarg, 500, {axis:dir, onAfter:function(){window.scrolling=false}});
				$(document).trigger('newPage', {index:n-1});} };
			nav.to(getStartPage());
	}
	if(useSwipe && !$('#container > ul.thumbs').length) initPageSwipe();
}

function initPageSwipe(){
	var container = $('#container'), scrollStart, scrollFunc = vertMode ? 'scrollLeft':'scrollTop';
	var vertMode = (pageMode.substr(0,1) == "v");
	if(vertMode) $.fn.swipe.defaults.excludedElements+=",.scroll";
	container.swipe({
		allowPageScroll: (vertMode ? 'horizontal' : 'vertical'),
		preventDefaultEvents:false,
		fingers:1, threshold:150,
		excludedElements: $.fn.swipe.defaults.excludedElements+ ',.mejs-overlay-button,map,[onclick],[data-useswipe="1"],[data-tapstart="1"],.panzoom,.scroll-horiz',
		swipeStatus:function(event, phase) {
			switch(phase){ case 'start': scrollStart = $(window)[scrollFunc](); break; }
		},swipe:function(event, direction, distance, duration, fingerCount) {
			if(Math.abs($(window)[scrollFunc]()-scrollStart)>distance) return;
			switch(direction) {
				case "left": if(!vertMode) nav.next(); break;
				case "right": if(!vertMode) nav.back(); break;
				case "up": if(vertMode) nav.next(); break;
				case "down": if(vertMode) nav.back(); break;		
			}
		}
	});
}

$(function(){
	if(webAppType.length && initWebApp()) return false;
	$(document).on('newPage', function(e, data) { onNewPage(e, data); });
	if(!multifile && pageMode.substr(0,2) === 'cs') $(document).on('scroll', function(e){ checkScroll(e, pageMode.substr(2)); });
	if($('ul.thumbs').length) $('#in5footer').hide();
	$sl = $('#slider');
	initPageMode();
	if($('.panzoom').length) initPanZoom();
	$('[target=_app]').each(function(){var jel=$(this); jel.on(clickEv,function(){location=jel.attr('href');return false;}) });
	if($.colorbox) initLightbox();
	$('img').on('dragstart', function(e) { e.preventDefault(); });
	$('.cover').on(clickEv, function() { loadFrame($(this).hide().siblings('iframe')[0]); return false; });
	addNavProps();
	initPullTabs();
	initAnimationAttribs();
	initMSOs();
	initClickEvents();
		setTimeout(function(){checkHashData();},50);
});

function getOrientation() {
	if(window.orientation === undefined) return window.outerWidth > window.outerHeight ? 'landscape' : 'portrait';   		
    return (Math.abs(window.orientation) === 90) ? 'landscape' : 'portrait';
}

function addNavProps(){
	if(nav.numPages === undefined) nav.numPages=30;
	nav.first = function(){nav.to(1)};
	nav.last = function(){nav.to(nav.numPages)};
	nav.previousPageIndex = nav ? nav.previousPageIndex : undefined;
	if(nav.back === undefined) nav.back = function(ref){nav.to(nav.current-1);};
	if(nav.next === undefined) nav.next = function(ref){nav.to(nav.current+1);};
	nav.update = function(n){
		if(arrowNav && nav.numPages>1){
			var view = flip ? $sl.turn('view') : {view:[]};
			if(view === undefined) return false;
			$('nav#page-nav:hidden, nav#page-nav #backBtn, nav#page-nav #nextBtn').show();
			if(n?n<2:(flip?(view[0] < 2 || view[1] < 2):nav.current < 2)) $('nav #backBtn').hide();
			if(n?n>=nav.numPages:(flip?(view[0] === nav.numPages || view[1] === nav.numPages):nav.current >= nav.numPages)) $('nav #nextBtn').hide();
		}
	};
	$('nav#page-nav #nextBtn').on(clickEv, function(){ nav.next(); return false; });
	$('nav#page-nav #backBtn').on(clickEv, function(){ nav.back(); return false; });
	nav.update();
}

function scaleFlipLayout(getOnly,sf) {
	var targW = $sl.turn('display') == 'single' ? pageW :pageW*2,scaleFactor=sf||getScaleFactor(targW,pageH);
	if(getOnly) return scaleFactor;
	try{$sl.turn("stop");}catch(err){}
	$('.page-scale-wrap').css(prefix.css+'transform',
		'scale('+scaleFactor+','+scaleFactor+')').css(prefix.css+'transform-origin', '0 0 0');
	$sl.turn('size', targW*scaleFactor, pageH*scaleFactor).turn('resize');
	if(!getOnly && !sf) $('body').removeClass('zoomed');
}
function getScaleFactor(targW, targH){
	var maxWF = maxScaleWidth ? maxScaleWidth/targW : Infinity, maxHF = maxScaleHeight ? maxScaleHeight/targH : Infinity;
	switch(window.scaleModeType) {
		case undefined: return 1;
		case 'width': return Math.min(maxWF,$(window).innerWidth()/targW);
		case 'height': return Math.min(maxHF,($(window).innerHeight()-(($('#viewer-options-bar:visible').height()||0) + ($('#viewer_progress_bar:visible').height()||0)))/targH);
		default: var xScale = Math.min(maxWF,$(window).innerWidth()/targW), yScale = Math.min(maxHF,($(window).innerHeight()-(($('#viewer-options-bar:visible').height()||0) + ($('#viewer_progress_bar:visible').height()||0)))/targH);
		if(xScale <= yScale) { $(document.body).attr('data-scaled-to','w'); return xScale; }
		else { $(document.body).attr('data-scaled-to','h'); return yScale; }
	}
}

var CSSMtx = (window.hasOwnProperty('WebKitCSSMatrix')) ? WebKitCSSMatrix : MSCSSMatrix;
function getCurrentScale(targ){ 
	var targ = targ instanceof jQuery ? targ[0] : targ;
	return $('body').is('[data-scaled-to]') ? new CSSMtx(window.getComputedStyle(targ).transform).a : 1;
}

$(window).load(function(){
	$('body').addClass('loaded');
	if(arrowNav && isLiquid) $('nav:hidden').show();
	if(flip){ $sl.turn("disable", false); }
	
	initMedia(sliderSettings != undefined);
});

function initMedia(hasSlider){
	if(isBaker) return;
	if(!$('video,audio').length) {
		if(multifile) $(document).trigger('newPage', {index:0});
	 	return;
	}
	if(!window.mejs || $('video,audio').mediaelementplayer == undefined) {
		setTimeout(function(){initMedia(hasSlider);}, 50);
		return;
	 }
	var playerMode = (uAgent.indexOf('firefox') > -1 
		&& isLocal && parseInt(jQuery.browser.version)<22) ? 'shim' : 'auto';
	if((isIPad || isIPhone) && $('audio,video').filter('[data-autoplay]').length) {
		$('.page').one('touchstart', function(e){
			$(e.currentTarget).next().find('audio,video').filter('[data-autoplay]').each(function(){ if(this.load) this.load(); });
		});
	}
	if(hasSlider && (isIPad || isIPhone)) $('video,audio').mediaelementplayer({success:onMediaLoadSuccess});
	else { $('video,audio').mediaelementplayer({pluginPath:'assets/media/',iPadUseNativeControls:true, iPhoneUseNativeControls:true, mode:playerMode,
		AndroidUseNativeControls:true, enableKeyboard:false, success:onMediaLoadSuccess});
	}
}

var mediaLoaded = 0;
function onMediaLoadSuccess (me, domObj) {
	mediaLoaded++;
	$(document).trigger('mediaElementLoaded', {mediaElement:me,element:domObj});
	if(isLiquid && me.pluginType) $(document).trigger('newPage', {index:$('.activePage').index()});
	if($(domObj).hasClass('mejs-fsonly')) {me.addEventListener('play',function(){ try{domObj.player.enterFullScreen(); me.enterFullScreen();}catch(e){} }) };
	if($(domObj).attr('data-stoplast') == '1') { if(domObj.hasOwnProperty('player')) domObj.player.options.autoRewind = false; };
	me.addEventListener('play',function(){ $(document).trigger('mediaPlayback', {me:me,domObj:domObj}); });
	if(me.pluginType == 'flash' && $(domObj).attr('loop') == 'loop') { me.addEventListener('ended', function() { domObj.player.play(); }); }
	if(mediaLoaded === $('audio,video').length) allMediaLoaded();
}

function allMediaLoaded(){
	if(multifile) {$(document).trigger('newPage', {index:0}); }
	$(document).trigger('allMediaElementsLoaded');
}

if(isBaker){
	$(window).on('blur', function(e){
		stopAllMedia(this.document);
		$(window).scrollTop(0);
		$('.page [data-hidestart]').addClass('hidden');
		$(window).data('focused', false);
	}).on('focus', function(e) {
		if(!$(window).data('focused')) $(document).trigger('newPage', {index:0});
		$(window).data('focused', true);
	});
	$(function(){ $('.page [data-hidestart]').addClass('hidden'); }); 
}

function getStartPage(){
	if(multifile) return 1;
	var p = getHashPage();
	if(p > 0) return p;
	if(!useBookmark || !localStorage) return 1;
	if(!localStorage[bookmarkName]) return 1;
	return localStorage[bookmarkName];
}
function getHashPage(){
	var q=location.hash.substr(1),px=q.indexOf('p=');
	return px>-1?parseInt(q.substr(px+2))||-1:-1;
}

$.fn.redraw = function(){
	return $(this).each(function(){
		var disp = this.style.display;
		this.style.display = 'none';
		var redraw = this.offsetHeight;
		this.style.display = disp;
	});
};

