import Utils from '../../services/Utils.js'
import ChangeCollectionMsg from '../../services/ChangeCollectionMsg.js'

let Nav = {
	render: async () => {
		try {
			let tmp = await Utils.gettext('nav');
			if(tmp.ok) {
				tmp.text = tmp.text.replace(/XXX/g, localStorage.getItem('pwlang') === 'es' ? 'English' : 'Español');
				tmp.text = tmp.text.replace(/settings/g, localStorage.getItem('pwlang') === 'es' ? 'en-lang' : 'es-lang');
			}
			return tmp;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		let request = !localStorage.getItem('pwcookies') ? 
			{resource: null, id: null, verb: null, query: null} : 
			Utils.parseRequestURL();
		
	    // Language selectors
	    document.querySelectorAll('.lang-selector').forEach(elm => {
			M.add({
				el: elm,
				event: 'click', 
				fn: function handler(e) {
					let lang = localStorage.getItem('pwlang') || null;
					if (!lang) {
						lang = window.navigator.language.split('-')[0].toLowerCase() === 'es' ? 'es' : 'en';
						localStorage.setItem('pwlang', lang);
						lang = localStorage.getItem('pwlang');
					};
					if(lang === 'es') {
						localStorage.setItem('pwlang', 'en');
					} else {
						localStorage.setItem('pwlang', 'es');
					}
					window.location.reload();
				}
			});
		});
		
		let activepage = request.resource || 'home';

	    // Active collection
		let parsedid = request.id;
		if(parsedid && activepage === 'home') G.appactivecollection = parsedid;

		let menus = G.appmenus.map(o => o.menu);
		let submenus = G.appmenus.map(o => o.submenu);
		
		let opt = null;
		let pag = null;
		
		if(menus.includes(activepage)) {
			opt = activepage;
			pag = G.appmenus.filter(o => o.menu === activepage)[0].submenu;
		} else if(submenus.includes(activepage)) {
			pag = activepage;
			opt = G.appmenus.filter(o => o.submenu === activepage)[0].menu;			
		} else {
			activepage = 'home';
			pag = activepage;
			opt = G.appmenus.filter(o => o.submenu === activepage)[0].menu;			
		}

		document.querySelectorAll('[id^="nav-options-"]').forEach(o => {
			o.style.display = o.id.split('-')[2] === opt ? 'block' : 'none';
		});

		document.querySelectorAll('.nav-links').forEach(elm => {
			if(elm.id === `nav-${pag}`) {
				elm.classList.add('w3-theme-l4');
			} else {
				elm.classList.remove('w3-theme-l4');
			}
		});

		document.querySelectorAll('.collection').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: changecollection
			});
			if(elm.dataset.collection === G.appactivecollection) {
				elm.classList.add('w3-theme-d4');
			} else {
				elm.classList.remove('w3-theme-d4');
			}
		});
		
		document.querySelectorAll('.styler').forEach(elm => {
			if(elm.dataset.style === localStorage.getItem('pwstyle')) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		document.querySelectorAll('.typer').forEach(elm => {
			if(elm.dataset.typo === localStorage.getItem('pwtypo')) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});
		document.querySelectorAll('.scaler').forEach(elm => {
			if(elm.dataset.scale === localStorage.getItem('pwscale')) {
				elm.classList.add('glowing-border');
			} else {
				elm.classList.remove('glowing-border');
			}
		});

		if(Utils.byId('global-search')) {
			M.add({
				el: Utils.byId('global-search'),
				event: 'search',
				fn: gosearch
			});
		}

		if(Utils.byId('scollection')) Utils.byId('scollection').innerHTML = G.appactivecollection.toUpperCase();

		Utils.dbloadedindicator();

		function gosearch(e) {
			if(String(e.target.value).trim() !== '') {
				window.location.href = `./#/search/${encodeURI(String(e.target.value).trim())}`;
			}
		}
		
		function changecollection(e) {
			let request = Utils.parseRequestURL();
			let elm = e.target;
			if(!elm.dataset) return;
			if(!elm.dataset.collection) return;
			let msg = ChangeCollectionMsg[Utils.l].message;
			let replacer = (text, u) => {
				let oldc = G.appcollections[G.appactivecollection].name;
				let newc = G.appcollections[elm.dataset.collection].name;
				let out = text;
				out = out.split('[old]').join(oldc);
				out = out.split('[new]').join(newc);
				oldc = newc = undefined;
				return out;
			};
			if(!G.db) {
				G.appactivecollection = elm.dataset.collection;
				elm = msg = replacer = undefined;
				window.dispatchEvent(new Event('hashchange'));
			} else {
				if(confirm(replacer(msg))) {
					G.appactivecollection = elm.dataset.collection;
					elm = msg = replacer = undefined;
					window.location.href = './#/data';
					if(request.resource === 'data') window.dispatchEvent(new Event('hashchange'));
				} else {
					elm = msg = replacer = undefined;
				}
			}
		}
		
		request = activepage = parsedid = menus = submenus = opt = pag = undefined;
	}
}

export default Nav;
