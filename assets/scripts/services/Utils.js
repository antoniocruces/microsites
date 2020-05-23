import Config from './Config.js'
import HowToCiteText from './HowToCiteText.js'

const Utils = {
	/* Basic helpers */
	 
	l: localStorage.getItem('pwlang'),
	c: text => C[Utils.l] && C[Utils.l][text] || text,
	isNumeric: num => (typeof(num) === 'number' || typeof(num) === 'string' && num.trim() !== '') && !isNaN(num),
	cleardomnode: cid => {
		let node;
		if(cid instanceof Element || cid instanceof HTMLDocument) {
			node = cid;  
		} else {
			node = Utils.byId(cid);
		}
		if(node) {
			let cnode = node.cloneNode(false);
			node.parentNode.replaceChild(cnode, node);	
		}
		node = undefined;
	},
	escapeHTML: str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
	highlighttext: (a, b) => b.na().replace(new RegExp(a.na(), 'gi'), match => `<mark>${match}</mark>`),
	blinkelement: (elm, interval, duration = 0) => {
		elm.style.visibility = (elm.style.visibility === 'hidden' ? 'visible' : 'hidden');
		if(duration > 0) {
			setTimeout(Utils.blinkelement, interval, elm, interval, duration - interval);
		} else {
			elm.style.visibility = 'visible';
		}
	},
	appdata: (nameonly = true) => {
		let out = [];
		out.push([
			`${Config.appdata.name} `,
			`v${Config.appdata.version}.`,
			`${Config.appdata.subversion}.`,
			`${Config.appdata.release}`,
		].join(''));
		if(!nameonly) {
			out.push([
				`${Config.appdata.date}. `,
				`${Config.appdata.license}. `,
				`${Config.appdata.author}. `,
				`${Config.appdata.authoremail}. `,
				`${Config.appdata.supporter}. `,
				`${Config.appdata.supporteremail}`,
			].join(''));
		}
		return out.join('. ');
	},
	sleep: (ms = 50) => new Promise(resolve => setTimeout(resolve, ms)),
	byId: cid => document.getElementById(cid) || null,
	msg: (cid, txt = '') => {
		if(!cid) return;
		Utils.byId(cid).innerHTML = txt;
	},
    unpack: (rows, key) => rows.map(row => row[key]),
	getrandomelement: items => items[items.length * Math.random() | 0],
	randomname: (prefix, suffix) => {
		prefix = prefix || G.appdata.shortname;
		suffix = suffix || '.json';
		return `${prefix}_${(Math.random().toString(36).substring(7))}${suffix}`;
	},
	getcolorfromcss: (rule, type) => {
		let sheet = Array.from(document.styleSheets).filter(o => o.ownerNode.id === 'colors');
		let rules = Array.from(sheet[0].cssRules);
		let element = rules.find(o => o.selectorText === rule);
		sheet = rules = undefined;
		return element.style[type];
	},
	rgb2hex: rgb => {
		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		return (rgb && rgb.length === 4) ? '#' +
			('0' + parseInt(rgb[1],10).toString(16)).slice(-2) +
			('0' + parseInt(rgb[2],10).toString(16)).slice(-2) +
			('0' + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	},
	prcolor: prname => {
		if(!prname) return;
		let probject = Object.values(G.primaryrecords).find(o => o.name === prname);
		if(!probject) return;
		return Utils.rgb2hex(Utils.getcolorfromcss(`.${probject.color}`, 'color'));
	},
	pricon: prname => {
		if(!prname) return;
		let probject = Object.values(G.primaryrecords).find(o => o.name === prname);
		if(!probject) return;
		return `<i class="fas fa-${probject.icon} ${probject.color}-text"></i>`;
	},
	colorslist: values => {
		let vals = Object.values(G.primaryrecords).filter(o => values.includes(o.name));
		let getcolor = color => Utils.rgb2hex(Utils.getcolorfromcss(`.${color}`, 'background-color'));
		return vals.map(o => ({name: o.name, color: getcolor(o.color)})).sort((a, b) => a.name.localeCompare(b.name));
	},
	placefromfields: (town = null, region = null, country = null, countryfirst = true) => {
		if(countryfirst) {
			return [
				country ? country : Utils.c('n/d'),
				region ? region : Utils.c('n/d'),
				town ? town : Utils.c('n/d'),
			].join('; ');
		} else {
			return [
				town ? town : Utils.c('n/d'),
				region ? region : Utils.c('n/d'),
				country ? country : Utils.c('n/d'),
			].join('; ');
		}
	},
	fold: obj => Object.values(obj).map(o => String(o).toLowerCase().na()).join(' ⊃ '),
	decade: (year = 0) => Math.floor(year / 10) * 10,
	humansize: size => {
		let i = Math.floor(Math.log(size) / Math.log(1024));
		return ((size / Math.pow(1024, i)).toFixed(2) * 1).toLocaleString(Utils.l) + ['B', 'KB', 'MB', 'GB', 'TB'][i];
	},
	isvalidjson: str => {
		try {
			JSON.parse(str);
		} catch(e) {
			return false;
		}
		return true;
	},
	viewporttopixels: value => {
		let parts = value.match(/([0-9\.]+)(vh|vw)/);
		let q = Number(parts[1]);
		let side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]];
		parts = undefined;
		return side * (q/100);
	},
	ddtodms: (dd, islng) => {
		let dir = dd < 0 ? islng ? 'W' : 'S' : islng ? 'E' : 'N';
		let absdd = Math.abs(dd);
		let deg = absdd | 0;
		let frac = absdd - deg;
		let min = (frac * 60) | 0;
		let dsm = 'º';
		let ssm = '\'';
		let msm = '"';
		let sec = frac * 3600 - min * 60;
		sec = Math.round(sec * 100) / 100;
		absdd = frac = undefined;
		return `${deg}${dsm} ${min}${msm} ${sec}${ssm} ${dir}`;
	},
	paramstring: obj => {
		let params = [];
		for (let i in obj) {
			params.push(`${encodeURIComponent(i)}=${encodeURIComponent(obj[i])}`);
		}
		return '/?' + params.join('&');
	},
	
	/* Request tools */
	
	parseRequestURL : (uri = null) => {
		try {
			let url = uri ? new URL(uri).hash : location.hash.slice(1).toLowerCase() || '/';
			let r = url.split("/")
			let request = {
				resource: null,
				id: null,
				verb: null,
				query: null
			}
			request.resource = r[1]
			request.id = r[2]
			request.verb = r[3]
			request.query = r[4]
			return request
		} catch(error) {
			throw new Error(Utils.c('internal error'));			
		}
	}, 
	
	/* Listeners */
	
	mainlisteners: () => {
		M.add({
			el: window,
			event: 'resize',
			fn: Utils.tablistener
		});
		M.add({
			el: window,
			event: 'scroll',
			fn: Utils.scrolllistener
		});
		M.add({
			el: document,
			event: 'DOMContentLoaded',
			fn: Utils.domcontentloadedlistener
		});

		document.querySelectorAll('.modal-close').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.closemodal
			});
		});
		document.querySelectorAll('.modal-print').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.printmodal
			});
		});
		document.querySelectorAll('.print-page').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.printpage
			});
		});
		document.querySelectorAll('#open-nav, #close-nav').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.sidebarhandler
			});
	    });
		document.querySelectorAll('.gotop').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.gopagetophandler
			});
	    });
		document.querySelectorAll('.gobottom').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.gopagebottomhandler
			});
	    });
		document.querySelectorAll('.styler').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.stylerhandler
			});
	    });
		document.querySelectorAll('.typer').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.typerhandler
			});
	    });
		document.querySelectorAll('.scaler').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.scalerhandler
			});
	    });
		document.querySelectorAll('.reset-options').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.resetstyleshandler
			});
	    });
		document.querySelectorAll('.sidebar-category').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.sidebarlistener
			});
	    });
		document.querySelectorAll('.help-window').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.helplistener
			});
	    });
		document.querySelectorAll('.tablink').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.tablistener
			});
	    });
		document.querySelectorAll('.accordionlink').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.accordionlistener
			});
	    });
	    
		M.add({
			el: document,
			event: 'copy',
			fn: Utils.clipboardbrand
		});
	},
	
	/* Listeners Helpers */
	sidebarhandler: e => {
		let sidebar = Utils.byId('app-sidebar');
		//let overlay = Utils.byId('app-overlay');
		if (sidebar.style.display === 'block') {
			sidebar.style.zIndex = 0;
			sidebar.style.display = 'none';
			//overlay.style.display = 'none';
		} else {
			sidebar.style.zIndex = 8003;
			sidebar.style.display = 'block';
			//overlay.style.display = 'block';
		}
	},
	scrolllistener: e => {
		if(document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			document.querySelectorAll('.gotop').forEach(o => {
				o.style.display = 'block';
			});
			document.querySelectorAll('.gobottom').forEach(o => {
				o.style.display = 'none';
			});
		} else {
			document.querySelectorAll('.gotop').forEach(o => {
				o.style.display = 'none';
			});
			document.querySelectorAll('.gobottom').forEach(o => {
				o.style.display = 'block';
			});
		}
	},
	gopagetophandler: e => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	},
	gopagebottomhandler: e => {
		window.scrollTo(0, document.body.scrollHeight);
	},
	stylerhandler: e => {
		if(!O) Utils.overlay();
		let newstyle = `${G.appw3stylepath}w3-theme-${e.target.dataset.style || G.appdata.activestyles.style}.css`;
		Utils.byId('w3-css-theme').setAttribute('href', newstyle);
		localStorage.setItem('pwstyle', e.target.dataset.style || G.appdata.activestyles.style);
		document.querySelectorAll('.styler').forEach(elm => {
			if(elm.dataset.style === localStorage.getItem('pwstyle')) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		if(O) Utils.overlay();
		newstyle = undefined;
	},
	typerhandler: e => {
		if(!O) Utils.overlay();
		let newstyle = `${G.appstylepath}app-fonts-${e.target.dataset.typo || G.appdata.activestyles.typo}.css`;
		Utils.byId('fonts').setAttribute('href', newstyle);
		localStorage.setItem('pwtypo', e.target.dataset.typo || G.appdata.activestyles.typo);
		document.querySelectorAll('.typer').forEach(elm => {
			if(elm.dataset.typo === localStorage.getItem('pwtypo')) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		if(O) Utils.overlay();
		newstyle = undefined;
	},
	scalerhandler: e => {
		if(!O) Utils.overlay();
		localStorage.setItem('pwscale', e.target.dataset.scale || G.appdata.activestyles.scale);
		G.appdata.activestyles.scale = localStorage.getItem('pwscale');
		document.querySelectorAll('.scaler').forEach(elm => {
			if(elm.dataset.scale === localStorage.getItem('pwscale')) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		window.dispatchEvent(new Event('hashchange'));
		if(O) Utils.overlay();
	},
	resetstyleshandler: e => {
		if(!O) Utils.overlay();
		let newstyle = `${G.appw3stylepath}w3-theme-${G.appdata.activestyles.style}.css`;
		let newtypo = `${G.appstylepath}app-fonts-${G.appdata.activestyles.typo}.css`;
		Utils.byId('w3-css-theme').setAttribute('href', newstyle);
		Utils.byId('fonts').setAttribute('href', newtypo);
		localStorage.setItem('pwstyle', G.appdata.activestyles.style);
		localStorage.setItem('pwtypo', G.appdata.activestyles.typo);
		localStorage.setItem('pwscale', G.appdata.activestyles.scale);
		document.querySelectorAll('.styler').forEach(elm => {
			if(elm.dataset.style === G.appdata.activestyles.style) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		document.querySelectorAll('.typer').forEach(elm => {
			if(elm.dataset.typo === G.appdata.activestyles.typo) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		document.querySelectorAll('.scaler').forEach(elm => {
			if(elm.dataset.scale === G.appdata.activestyles.scale) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		if(O) Utils.overlay();
		newstyle = newtypo = undefined;
	},
	sidebarlistener: e => {
		if(e.target.classList.contains('active')) {
			e.target.classList.remove('active');
		} else {
			e.target.classList.add('active');
		}
	},
	helplistener: e => {
		if(!(e.target.dataset || {help: null}).help) return;
		Utils.showhelp(e.target.dataset.help);
	},
	domcontentloadedlistener: e => {
		if(!Utils.isavalidbrowser()) {
			alert(Utils.c('the browser is not valid to run Pathwise').uf());
			window.location.href = 'https://www.google.com/';
			return;
		}
		new EUCookies();
		//cookies = undefined;
	},
	tablistener: e => {
		if(document.querySelectorAll('.tablink').length && (e.target.dataset || {target: null}).target) {
			document.querySelectorAll('.tablink').forEach(o => {
				if(o.classList.contains('tabbar')) {
					o.classList.remove('w3-theme-l3');
				} else {
					o.classList.remove('w3-border-red');
				}
			});
			document.querySelectorAll('.tab').forEach(o => {
				o.style.display = 'none';
			});
			e.target.classList.add(e.target.classList.contains('tabbar') ? 'w3-theme-l3' : 'w3-border-red');
			Utils.byId(e.target.dataset.target).style.display = 'block';
		}
		Object.keys(G.lmaps).forEach(k => {
			if(G.lmaps[k].map) G.lmaps[k].map.checkSize();
		});
	},
	accordionlistener: e => {
		if(!e.target.dataset) return;
		if(!e.target.dataset.target) return;
		Utils.byId(e.target.dataset.target).classList.toggle('w3-show');
	},
	collapsiblelistener: e => {
		e.target.classList.toggle('collapsible');
		let content = e.target.nextElementSibling;
		content.style.display = content.style.display === 'block' ? 'none' : 'block';
		content = undefined;
	},
	acceptcookies: e => {
		e.preventDefault();
		let elm = document.querySelector('.pwcookies');
		elm.style.display = 'none';
		elm.parentNode.removeChild(elm);
		document.querySelector('.modal-mask').style.display = 'none';
		localStorage.setItem('pwcookies', true);
	},
	rejectcookies: e => {
		e.preventDefault();
		let elm = document.querySelector('.pwcookies');
		elm.style.display = 'none';
		elm.parentNode.removeChild(elm);
		document.querySelector('.modal-mask').style.display = 'none';
		window.location.href = "https://www.google.com/";
	},
	cookiesinfo: e => {
		e.preventDefault();
		Utils.gettext(`hlp-cookies`).then(obj => {
			if(!obj.ok) return;
			let text = obj.text;
			document.querySelector('.modal-title').innerHTML = [
				`<span class="color-blue-400">${G.appdata.name}. `,
				`${Utils.c('help').uf()}</span>`,
			].join('');
			let div = document.createElement('div');
			div.id = 'txt-body';
			div.style.height = '40vh';
			div.style.overflow = 'hidden';
			div.style.overflowY = 'scroll';
			div.style.padding = '10px 20px';
			div.innerHTML = text;
			document.querySelector('.modal-body').appendChild(div);
			document.querySelector('.modal-mask').style.display = 'block';
			document.querySelector('.modal').style.display = 'block';
			text = undefined;
		});
		M.add({
			el: document.querySelector('.modal-close'),
			event: 'click',
			fn: Utils.closemodal
		});
		M.add({
			el: document.querySelector('.modal-print'),
			event: 'click',
			fn: Utils.printmodal
		});
	},
	printtable: event => {
		let target = (event.target.dataset.table || null) ? event.target.dataset.table : event.target.parentNode.dataset.table;
		Utils.byId(target).print();
	},
	printpage: event => Utils.byId('content_container').print(),

	/* Badges & Signs */
	
	filterbadge: () => {
		if(Utils.byId('flt-badge')) {
			if(!G.db) {
				Utils.byId('flt-badge').innerHTML = [
					`<span class="w3-tag">${G.appactivecollection.toUpperCase()}</span> `,
					`&empty;`
				].join('');
				Utils.byId('flt-badge').classList.remove('w3-text-yellow');
				Utils.byId('global-search').style.display = 'none';
			} else {
				Utils.byId('global-search').style.display = 'block';
				if(G.dbfilteredlength === G.dbposlength) {
					Utils.byId('flt-badge').innerHTML = [
						`<span class="w3-tag">${G.appactivecollection.toUpperCase()}</span> `,
						`${G.dbposlength.toLocaleString(Utils.l)}`
					].join('');
					Utils.byId('flt-badge').classList.remove('w3-text-yellow');
				} else {
					Utils.byId('flt-badge').innerHTML = [
						`<span class="w3-tag">${G.appactivecollection.toUpperCase()}</span> `,
						`${G.dbposlength.toLocaleString(Utils.l)}`
					].join('');
					Utils.byId('flt-badge').classList.add('w3-text-yellow');
				}
			}
		}
	},
	dbloadedindicator: () => {
		if(!G.db) {
			document.querySelectorAll('.nav-logo img').forEach(elm => {
				elm.classList.add('w3-grayscale-max');
			});
		} else {
			document.querySelectorAll('.nav-logo img').forEach(elm => {
				elm.classList.remove('w3-grayscale-max');
			});
		}
	},
	perftimer: (start = true, msg = null, cid = 'performance-msg', includemark = true) => {
		if(!Utils.byId(cid)) return;
		if(start) {
			window.T = !window.performance || !performance.now ? Date.now : performance.now();
		} else {
			let dt = (performance.now() - window.T).toFixed(3);
			let tt = [
				includemark ? `<mark>` : ``,
				`${msg ? msg + '. ' : ''}${(dt / 1000).toLocaleString(Utils.l) + ' s'}`,
				includemark ? `</mark>` : ``,
			].join('');
			Utils.msg(cid, tt); 
		}
	},
	pageloadtime: () => {
		if(!window.performance) return null; 
		let tim = window.performance.timing;
		return tim.domContentLoadedEventEnd - tim.navigationStart;
	},
	
	/* Printing & Clipboard */
	copytoclipboard: e => {
		let range = document.createRange();
		let cid = e.target.dataset.cid || '';
		range.selectNode(document.getElementById(cid));
		window.getSelection().removeAllRanges(); 
		window.getSelection().addRange(range); 
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
		if(Utils.byId(cid + '-copy-link')) {
			Utils.msg(cid + '-copy-link', Utils.c('copied').uf());
			Utils.byId(cid + '-copy-link').classList.add('w3-green');
			window.setTimeout(() => {
				Utils.byId(cid + '-copy-link').classList.remove('w3-green');
				Utils.msg(cid + '-copy-link', Utils.c('copy').uf());
			}, 500);
		}
	},
	clipboardbrand: e => {
		let txt = HowToCiteText[Utils.l];
		let replacer = (text, u) => {
			let xcl = G.appactivecollection;
			let xnm = G.appcollections[xcl].name;
			let xds = G.appcollections[xcl].name;
			let out = text;
			let ctm = new Date();
			out = out.split('[sn]').join(xnm);
			out = out.split('[ln]').join(xds);
			out = out.split('[u]').join(u);
			out = out.split('[d]').join(`[${ctm.toLocaleDateString(Utils.l)}]`);
			xcl = xnm = xds = undefined;
			return out;
		};
		let tail = replacer(txt.clipboard, window.location.href);
		event.clipboardData.setData('text', document.getSelection() + '\n\n-----\n' + tail);
		event.preventDefault();
		txt = replacer = tail = undefined;
	},
	
	/* File fetching */
	headerstoobject: hdr => {
		let out = {};
		hdr.trim()
			.split(/[\r\n]+/)
			.map(value => value.split(/: /))
			.forEach(keyValue => {
				out[keyValue[0].trim()] = keyValue[1].trim();
			});
		return out;
	},
	getremoteheaders: url => {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			let method = 'head';
			xhr.open(method,url,true);
			xhr.send(null);
			xhr.onreadystatechange = () => {
				if(xhr.readyState === 2) {
					resolve(Utils.headerstoobject(xhr.getAllResponseHeaders()));
				} else {
					reject(xhr.readyState);
				}
			}
		});	
	},
	gettext: async file => {
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'text/plain'
			}
		};
		const lang = Utils.l || localStorage.getItem('pwlang');
		try {
			const response = await fetch(`./assets/templates/${lang}/${file}.html`, options)
			if(response.ok) {
				const text = await response.text();
				return {
					ok: true,
					text: text,
				};
			} else {
				throw new Error(Utils.c('NERR'));
			}
		} catch (err) {
			return {
				ok: false,
				text: err.message.replace('Error: <', '<'),	
			};
		}
	},
	fetchjsonasync: (url, options) => {
		if(!options) options = {};
		if(options.credentials === null) options.credentials = 'same-origin';
		if(options.mode === null) options.mode = 'no-cors';
		return fetch(url, options).then(response => {
			if(response.status >= 200 && response.status < 300) {
				return Promise.resolve(response.json());
			} else {
				let error = new Error(response.statusText || response.status);
				error.response = response;
				return Promise.reject(error)
			}
		});
	},
	fetchtextasync: async uri => {
		let response = await fetch(uri);
		return await response.text();
	},
	loadscript: (file, zone = 'head') => {
		let script = document.createElement('script');
		script.type = 'application/javascript';
		script.src = file;
		document[zone].appendChild(script);
	},
	fetchipdata: () => {
		Utils.fetchjsonasync(G.geoipserver).then(json => {
			let options = {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0
			};

			function success(pos) {
				json.latitude = pos.coords.latitude;
				json.longitude = pos.coords.longitude;
				json.accuracy = pos.coords.accuracy;
				json.accuracyunits = 'm';
				G.currentgeoipdata = json;
				if(pos.coords.latitude && pos.coords.longitude) {
					let query = Utils.paramstring({
						lat: pos.coords.latitude.toFixed(6),
						lon: pos.coords.longitude.toFixed(6),
						osm_type: 'N',
						format: 'json',
						zoom: 18,
						limit: 1,
						'accept-language': Utils.l,
						addressdetails: 1,
					});
					Utils.fetchtextasync(G.nominatimserver.address + query).then(res => {
						res = JSON.parse(res);
						json.city = res.address.city;
						json.country = res.address.country;
						json.region = res.address.state;
					});
				}
			};
			function error(err) {
				console.warn('ERROR(' + err.code + '): ' + err.message);
				G.currentgeoipdata = json;
			};

			navigator.geolocation.getCurrentPosition(success, error, options);
		}).catch(error => {
			throw new Error(`${Utils.c('geolocation error')}: ${String(error)}`);
		});
	},
	     
	/* Overlays */
	overlay: () => {
		let status = window.O;
		if(!status) {
			document.querySelector('.siteoverlay').style.display = 'block';
			document.querySelectorAll('input').forEach(o => o.style.pointerEvents = 'none');
			document.querySelectorAll('a').forEach(o => o.classList.add('disabled'));
			document.querySelectorAll('button').forEach(o => o.disabled = true);
			document.querySelectorAll('.gotolinks').forEach(o => o.disabled = true);
			window.O = true;
		} else {
			document.querySelector('.siteoverlay').style.display = 'none';
			document.querySelectorAll('input').forEach(o => o.style.pointerEvents = 'auto');
			document.querySelectorAll('a').forEach(o => o.classList.remove('disabled'));
			document.querySelectorAll('button').forEach(o => o.disabled = false);
			document.querySelectorAll('.gotolinks').forEach(o => o.disabled = false);
			window.O = false;
		}
		status = undefined;
	},
	
	/* System info */

	howtocite: (uri, title, nid) => {
		let titleElm = document.querySelector('.modal-title');
		let outputElm = document.querySelector('.modal-body');
		titleElm.innerHTML = `${G.appdata.name}. ${Utils.c('how to cite').uf()}`;
		outputElm.innerHTML = '';
		
		let txt = HowToCiteText[Utils.l];
		
		let replacer = (text, u, t) => {
			let xcl = G.appactivecollection;
			let xnm = G.appcollections[xcl].name;
			let xds = G.appcollections[xcl].name;
			let out = text;
			let ctm = new Date();
			out = out.split('[sn]').join(xnm);
			out = out.split('[ln]').join(xds);
			out = out.split('[u]').join(u);
			out = out.split('[r]').join(t);
			out = out.split('[d]').join(`[${ctm.toLocaleDateString(Utils.l)}]`);
			xcl = xnm = xds = undefined;
			return out;
		};
		
		let wrapper = document.createElement('div');
		wrapper.id = 'txt-body';
		wrapper.style.padding = '0';
		
		wrapper.innerHTML = [
			`<div id="howtocite-text" class="w3-row w3-margin-top">`,
			replacer(txt.generic, uri, Utils.escapeHTML(title)),
			replacer(txt.info, uri, Utils.escapeHTML(title)),
			replacer(txt.graphic, uri, Utils.escapeHTML(title)),
			`</div>`,
			`<p>`,
			`<button id="howtocite-text-copy-link" data-cid="howtocite-text" `,
			`class="w3-button w3-theme-d5">${Utils.c('copy').uf()}</button>`,
			`</p>`,
		].join('');
		outputElm.appendChild(wrapper);

		document.querySelector('.modal-mask').style.display = 'block';
		document.querySelector('.modal').style.display = 'block';

		M.add({
			el: Utils.byId('howtocite-text-copy-link'),
			event: 'click',
			fn: Utils.copytoclipboard
		});
				
		titleElm = outputElm = txt = wrapper = undefined;
	},
	browserinfo: () => {
		let ua = navigator.userAgent;
		let oBrowserInfo = {};
		let ismobile = () => (/Mobi/.test(navigator.userAgent));
		
		let sTempInfo;
		let sBrowserString = ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([0-9|\.]+)/i) || [];
			
		if (/trident/i.test(sBrowserString[1])) {
			sTempInfo = /\brv[ :]+(\d+)/g.exec(ua) || [];
			oBrowserInfo.sName = 'MSIE';
			oBrowserInfo.sVersion = sTempInfo[1];
			ua = ismobile = sTempInfo = sBrowserString = undefined;
			return oBrowserInfo;
		}
		
		if (sBrowserString[1] === 'Chrome') {
			sTempInfo = ua.match(/\b(OPR|Edge)\/(\d+)/);
			//Opera/Edge case:
			if (sTempInfo !== null) {
				if (sTempInfo.indexOf('Edge')) {
					oBrowserInfo.sName = 'MSIE'; //mark ms edge browser as MSIE
				} else {
					oBrowserInfo.sName = 'Opera';
				}
				oBrowserInfo.sVersion = sTempInfo.slice(1);
				ua = ismobile = sTempInfo = sBrowserString = undefined;
				return oBrowserInfo;
			}
		}
		
		sBrowserString = sBrowserString[2] ? 
			[sBrowserString[1], sBrowserString[2]] : 
			[navigator.appName, navigator.appVersion, '-?'];
			
		sTempInfo = ua.match(/version\/(\d+)/i);
	
		if (sTempInfo !== null) {
			sBrowserString.splice(1, 1, sTempInfo[1]);
		}
		
		oBrowserInfo.sLanguage = navigator.language;
		oBrowserInfo.sLanguages = navigator.languages.join(', ');
		oBrowserInfo.sUserAgent = navigator.userAgent;
		oBrowserInfo.sDevice = ismobile() ? Utils.c('mobile') : Utils.c('desktop');
		oBrowserInfo.sReferrer = document.referrer || Utils.c('N/A');
		oBrowserInfo.sOnline = navigator.onLine;
		oBrowserInfo.sTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		oBrowserInfo.sScreenResolution = [
			`${window.screen.availWidth} x ${window.screen.availHeight} `,
			`(${window.screen.width} x ${window.screen.height})`,
		].join('');
		oBrowserInfo.sCookieEnabled = navigator.cookieEnabled;
		oBrowserInfo.sName = sBrowserString[0];
		oBrowserInfo.sVersion = sBrowserString[1];
		oBrowserInfo.platform = navigator.platform || Utils.c('unknown');
		oBrowserInfo.hwConcurrence = navigator.hardwareConcurrency || Utils.c('unknown');
		ua = ismobile = sTempInfo = sBrowserString = undefined;
		return oBrowserInfo;
	},
	isavalidbrowser: () => {
		let browser = Utils.browserinfo();
		let bname = ['chrome', 'safari', 'opera', 'firefox'].indexOf(browser.sName.toLowerCase());
		let bver = Array.isArray(browser.sVersion) ? browser.sVersion[0] : browser.sVersion.split('.')[0];
		browser = undefined;
		return bname > -1 && ['56', '11', '4', '51'][bname] <= bver;
	},
	cpuspeed: () => {
		performance.clearMarks();
		performance.clearMeasures();
		performance.mark('loop-s');	
		for (let i = 150000000; i > 0; i--) {} 
		performance.mark('loop-e');
		performance.measure('speed', 'loop-s', 'loop-e');
		let measures = performance.getEntriesByName('speed');
		return {
			duration: measures[0].duration,
			ops: 150000000 / measures[0].duration
		}
	},
	
	/* Modal */
	closemodal: () => {
		let retainmask = !localStorage.getItem('pwcookies');
		document.querySelectorAll('li.flt-proposed-values').forEach(o => M.remove(o, 'click'));
		Utils.cleardomnode(document.querySelector('.modal-title'));
		Utils.cleardomnode(document.querySelector('.modal-body'));
		if(!retainmask) document.querySelector('.modal-mask').style.display = 'none';
		document.querySelector('.modal').style.display = 'none';
		if(Utils.byId('modal-body').dataset && Utils.byId('modal-body').title) Utils.byId('modal-body').removeAttribute('data-title');
		retainmask = undefined;
	},
	printmodal: (e) => {
		let modaltitle = document.querySelector('.modal-title');
		let title = Utils.c('untitled').uf();
		if(modaltitle) title = modaltitle.innerText;
		Utils.byId('modal-body').dataset.title = title;
		Utils.byId('modal-body').print();
		modaltitle = title = undefined;
	},
	showhelp: sname => {
		Utils.gettext(`hlp-${sname}`).then(obj => {
			if(!obj.ok) return;
			let text = obj.text;
			Utils.cleardomnode(document.querySelector('.modal-title'));
			Utils.cleardomnode(document.querySelector('.modal-body'));
			document.querySelector('.modal-title').innerHTML = [
				`<span class="color-blue-400">Pathwise. `,
				`${Utils.c('help').uf()}</span>`,
			].join('');
			let div = document.createElement('div');
			div.id = 'txt-body';
			div.style.height = '40vh';
			div.style.overflow = 'hidden';
			div.style.overflowY = 'scroll';
			div.style.padding = '10px 20px';
			div.innerHTML = text;
			document.querySelector('.modal-body').appendChild(div);
			document.querySelector('.modal-mask').style.display = 'block';
			document.querySelector('.modal').style.display = 'block';
			text = undefined;
		});
	},
	autoresizer: () => {
		document.querySelectorAll('[data-autoresize]').forEach(element => {
			element.style.boxSizing = 'border-box';
			let offset = element.offsetHeight - element.clientHeight;
			M.add({
				el: document,
				event: 'input',
				fn: e => {
					e.target.style.height = 'auto';
					e.target.style.height = e.target.scrollHeight + offset + 'px';
				}
			});
			element.removeAttribute('data-autoresize');
		});
	},
	
	/* Throttling & Debouncing */

	debounce: (func, wait, immediate) => {
		// Example: 
		// let myEfficientFn = debounce(function() {
		//	[...]
		//}, 250);
		//window.addEventListener('resize', myEfficientFn);
		let timeout;
		return function() {
			let context = this;
			let args = arguments;
			let later = function() {
				timeout = null;
				if(!immediate) func.apply(context, args);
			};
			let callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if(callNow) func.apply(context, args);
		};
	},
	throttle: (callback, limit) => {
		let wait = false;
		return function() {
			if(!wait) {
				callback.apply(null, arguments);
				wait = true;
				setTimeout(function() {
					wait = false;
				}, limit);
			}
		}
	},
	
	/* TO DELETE IF NOT USEFUL IN THIS CONTEXT */
	duallistbox: (sid, did) => {
		//Utils.listbox_moveacross('pivot-b', 'pivot-a');
		let src = Utils.byId(sid);
		let dst = Utils.byId(did);
		if(!src || !dst) return;
		for (let count = 0, len = src.options.length; count < len; count++) {
			if(src.options[count]) {
				if(src.options[count].selected === true) {
					let opt = src.options[count];
					let newopt = document.createElement('option');
					newopt.value = opt.value;
					newopt.text = opt.text;
					newopt.selected = true;
					try {
						dst.add(newopt, null);
						src.remove(count, null);
					} catch (error) {
						dst.add(newopt);
						src.remove(count);
					}
					count--;
				}
			}
		}
	},
}

export default Utils;
