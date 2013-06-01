(function( $, win, doc ) {
  "use strict";

	location.querystring = (function() {
		// The return is a collection of key/value pairs
		var result = {};

		// Gets the query string with a preceeding '?'
		var querystring = location.search;

		// document.location.search is empty if a query string is absent
		if (!querystring) {
			return result;
		}

		// substring(1) to remove the '?'
		var pairs = querystring.substring(1).split("&");
		var splitPair;

		// Load the key/values of the return collection
		for (var i = 0; i < pairs.length; i++) {
			splitPair = pairs[i].split("=");
			result[splitPair[0]] = splitPair[1];
		}

		return result;
	})();

	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
			for (var i=0;i<vars.length;i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return pair[1];
				}
			}
		return null;
	}


	function sortSize(a,b) {
		if (parseInt(a[1], 10) > parseInt(b[1], 10)) { return 1; }
		if (parseInt(a[1], 10) < parseInt(b[1], 10)) { return -1; }
		return 0;
	}

	function sortSizeDesc(a,b) { return (-sortSize(a,b)); }

	function sortLastmod(a,b) {
		if(a[2] > b[2]) { return 1; }
		if(a[2] < b[2]) { return -1; }
		return 0;
	}

	function sortLastmodDesc(a,b) { return (-sortLastmod(a,b)); }

	function sortName(a,b) {
		if(a[0] > b[0]) { return 1; }
		if(a[0] < b[0]) { return -1; }
		return 0;
	}

	function sortNameDesc(a,b) { return -sortName(a,b); }
	//document.write('http://'+location.hostname);

	function getSort(){
		var s = getQueryVariable("sort"),
				d = getQueryVariable("sortdir");
		if(s=='size'){ return d == 'desc' ? sortSizeDesc : sortSize;}
		if(s=='name'){ return d == 'desc' ? sortNameDesc : sortName;}
		if(s=='lastmod'){ return d == 'desc' ? sortLastmodDesc : sortLastmod;}
		return sortName;
	}

	function getNextSortDir(sortCol){
		if (sortCol == getQueryVariable("sort")) {
			return getQueryVariable("sortdir") == 'desc' ? 'asc' : 'desc';
		}
		return 'asc';
	}

	function createRequestObject(){
		var request_o; //declare the variable to hold the object.
		var browser = navigator.appName; //find the browser name
		if(browser == "Microsoft Internet Explorer"){
			/* Create the object using MSIE's method */
			request_o = new ActiveXObject("Microsoft.XMLHTTP");
		}else{
			/* Create the object using other browser's method */
			request_o = new XMLHttpRequest();
		}
		return request_o; //return the object
	}

	/* You can get more specific with version information by using 
		parseInt(navigator.appVersion)
		Which will extract an integer value containing the version 
		of the browser being used.
	*/
	/* The variable http will hold our new XMLHttpRequest object. */
	var http = createRequestObject();

	function getList(){
		http.open('get', location.protocol+'//'+'i.awe-so.me.s3.amazonaws.com/');
		http.onreadystatechange = handleList;
		http.send(null);
	}

	function handleList(){
		if(http.readyState == 4){
			var response = http.responseXML,
			filex = response.getElementsByTagName('Contents'),
			res = '<th><tr><td><a href="?sort=name&sortdir=' + getNextSortDir('name') + '">Name</a></td><td><a href="?sort=lastmod&sortdir=' + getNextSortDir('lastmod') + '">Last Modified</a></td><td><a href="?sort=size&sortdir=' + getNextSortDir('size') + '">Size</a></td></tr></th>',
			fileList = [],
			fileData, size, name, lastmod, link;

			for(var i=0; i<filex.length; i++){
				fileData = [];
				size = filex[i].getElementsByTagName('Size')[0].firstChild.data,
				name = filex[i].getElementsByTagName('Key')[0].firstChild.data,
				lastmod = filex[i].getElementsByTagName('LastModified')[0].firstChild.data,
				link = '<A HREF="' + location.protocol+'//'+'i.awe-so.me/'+name+'">'+name+'</A>';
				fileData[0] = name;
				fileData[1] = size;
				fileData[2] = lastmod;
				fileData[3] = link;
				fileList[i] = fileData;
			}

			fileList.sort(getSort());
			//document.write(getSort());
			for(i=0; i<fileList.length; i++){ //length is the same as count($array)

				fileData = fileList[i];
				name = fileData[0];
				size = Math.floor((fileData[1]/1024), 10);
				size = ( size > 1024 ) ? size = (size/1024).toFixed(1) + 'M' : size = size;
				lastmod = fileData[2];
				link = fileData[3];
				if (name.indexOf('.gif') > 0) {
					res = res + '<tr><td>' + link + '</td><td>' + lastmod + '</td><td>' + size + '</td></tr>';
				}
			}

			document.getElementById('bucket_list').innerHTML = res;
			var links = $('tr td');
			hoverMaker(links);
		}
	}

	var hoverMaker = function(links) {
		var imageMagic = function(el, top){
			var src =	el.attr('href'),
			winH =	window.outerHeight,
			winW =	window.outerWidth,
			myImage = new Image();
			myImage.name = src;
			myImage.src = src;
			myImage.onload = function(){
				el.append(myImage);
				el.find('img').css({position:'absolute', left:'50%', opacity:'0', display:'block', width:'auto'}).addClass('superMagic');

				var superMagic = $('.superMagic');

				if (superMagic.outerWidth() > winW) {
					superMagic.css('width', winH - 550 + 'px');
				}

				if (superMagic.outerHeight() > winH) {
					superMagic.css('height', winH - 200 + 'px');
				}

				superMagic.css('top', top).animate({opacity: 1}, 250);
			};
		};

		links.on('mouseenter', 'a', function(){
			var top = $('body').scrollTop() + 20;
			imageMagic($(this), top);
		}).on('mouseleave', 'a', function(){
			$(this).find('.superMagic').animate({opacity: 0}, 250).remove();
		});

		links.on('focus', 'a', function(){
			var top = $('body').scrollTop() + 20;
			imageMagic($(this), top);
		}).on('blur', 'a', function(){
			$(this).find('.superMagic').animate({opacity: 0}, 250).remove();
		});
	};

	getList();

})(jQuery, window, document);