import Utils from './Utils.js'

import EUCookies from './EUCookies.js'
import Nav from '../../scripts/views/components/Nav.js'
import Footer from '../../scripts/views/components/Footer.js' 

// Routing
const routes = {
	'/': 'Home', 
	'/home': 'Home', 
	'/home/:id': 'Home', 
	'/app': 'App', 
	'/legends': 'Legends', 
	'/data': 'Load', 
	'/load': 'Load', 
	'/sql': 'SQL',
	'/filter': 'Filter', 
	'/search/:id/:verb': 'Search',
	'/search/:id': 'Search',
	'/search': 'Search',
	'/listing/:id/:verb/:query': 'Listing',
	'/listing/:id/:verb': 'Listing',
	'/listing/:id': 'Listing',
	'/listing': 'Listing',
	'/indexed': 'Indexed',
	'/indexed/:id': 'Indexed',
	'/semantic': 'Semantic',
	'/semantic/:id': 'Semantic',
	'/semantic/:id/:verb': 'Semantic',
	'/pathwise': 'Pathwise',
	'/howtocite': 'HowToCite',
	'/contact': 'Contact',
	'/development': 'Development',
	'/licenses': 'Licenses',
	'/legal': 'Legal',
	'/help': 'FAQ',
	'/faq': 'FAQ',
	'/documents': 'Purpose',
	'/purpose': 'Purpose',
	'/projects': 'Projects',
	'/institutions': 'Institutions',
	'/resources': 'Resources',
	'/ontology': 'Ontology',
	'/manual': 'Manual',
	/*
	'/groups': Groups,
	'/networks': Relations,
	'/paths': Paths,
	'/export': Export,
	'/p/:id': Post,
	*/
};

const Router = async () => {
	M.removeAll();

	Utils.cleardomnode('nav_container');
	Utils.cleardomnode('content_container');
	Utils.cleardomnode('footer_container');
	
	Utils.msg(
		'content_container',
		[
			`<div class="loader-wrapper">`,
			`<div class="spinloader" style="margin:60px auto 60px 250px">Trabajando&hellip;</div>`,
			`</div>`,
		].join('')
	);

	const nav = null || document.getElementById('nav_container');
	const content = null || document.getElementById('content_container');
	const footer = null || document.getElementById('footer_container');

	let lang = localStorage.getItem('pwlang') || null;
	if (!lang) {
		lang = window.navigator.language.split('-')[0].toLowerCase() === 'es' ? 'es' : 'en';
		localStorage.setItem('pwlang', lang);
		lang = localStorage.getItem('pwlang');
	}
	
	let debugmode = localStorage.getItem('pwdebugmode') || null;
	if (!debugmode) {
		localStorage.setItem('pwdebugmode', G.debugmode);
	}

	if(nav) {
		let response = await Nav.render();
		if(response.ok) {
			nav.innerHTML = response.text;
			await Nav.after_render();
		} else {
			nav.innerHTML = 'ERROR';
		}
		nav.style.display = 'block';
		response = undefined;
	}
	if(content) {
		if(!O) Utils.overlay();
		let request = !localStorage.getItem('pwcookies') ? 
			{resource: null, id: null, verb: null, query: null} : 
			Utils.parseRequestURL();
		let parsedURL = (request.resource ? '/' + request.resource : '/') + 
			(request.id ? '/:id' : '') + 
			(request.verb ? '/:verb' : '');
		let page = routes[parsedURL] ? routes[parsedURL] : 'Error404';
		let cmodule = null;
		document.body.dataset.currentpage = page;
		Promise.all([
			import(`../views/pages/${page}.js`),
		]).then(function(modules) {
			cmodule = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				cmodule.render().then(obj => {
					if(obj.ok) {
						content.innerHTML = obj.text;
						cmodule.after_render();
					} else {
						content.innerHTML = obj.text;
					}
					
					Utils.filterbadge();
					Utils.dbloadedindicator();
					Utils.autoresizer();
					
					// Listeners
					Utils.mainlisteners();

					checkcookies();
					if(O) Utils.overlay();
					request = parsedURL = page = cmodule = undefined;
				}).catch(error => {
					request = parsedURL = page = cmodule = undefined;
					throw new Error(Utils.c(error.message));
				});
			}).catch(error => {
				request = parsedURL = page = cmodule = undefined;
				throw new Error(Utils.c(error.message));
			});
		}).catch(error => {
			request = parsedURL = page = cmodule = undefined;
			throw new Error(Utils.c(error.message));
		});

		if(G.appuseworker) {
			if(!G.worker) {
				let wtype = Utils.browserinfo().sName.toLowerCase() === 'safari' ? 'asm' : 'wasm';
				G.worker = new Worker(`./assets/vendor/kripken/worker.sql-${wtype}-debug.js`);
				M.add({
					el: G.worker,
					event: 'error',
					fn:  e => {
					    if(localStorage.getItem('pwdebugmode')) {
						    console.error(Utils.c('worker error').uf() + ': ', e);
						}
						throw new Error([Utils.c('worker error').uf() + ': ', e].join(''));
					}
				});
			}
		} else {
			Utils.loadscript('./assets/vendor/kripken/sql-wasm.js');
		}
	}
		
	if(footer) {
		document.querySelector('footer').style.display = 'none';
		let response = await Footer.render();
		if(response.ok) {
			footer.innerHTML = response.text;
			await Footer.after_render();
		} else {
			footer.innerHTML = 'ERROR';
		}
		document.querySelector('footer').style.display = 'block';
		response = undefined;
	}

	// EU Cookies
	function checkcookies() {
		if(!localStorage.getItem('pwcookies')) {
			document.querySelector('.modal-mask').style.display = 'block';
			document.body.innerHTML += [
				`<div class="pwcookies" `,
				`style="position:fixed;left:0;bottom:0;background-color:#000;`,
				`color:#fff;text-align:center;width:100%;z-index:99999;">`,
				`<p style="margin:1.75em;">`,
				EUCookies[lang].text,
				`</p><p style="margin:1.75em;">`,
				`<a href="javascript:;" id="cookies-info" class="w3-button w3-white">`,
				EUCookies[lang].legalinfo,
				`</a>`,
				`<a href="javascript:;" id="cookies-accept" class="w3-button w3-white" style="margin-left:5px">`,
				EUCookies[lang].accept,
				`</a>`,
				`<a href="javascript:;" id="cookies-reject" class="w3-button w3-white" style="margin-left:5px">`,
				EUCookies[lang].reject,
				`</a>`,
				`</p>`,
				`</div>`,
			].join('');
			
			document.querySelectorAll('.modal-close').forEach(elm => {
				M.add({
					el: elm,
					event: 'click',
					fn: Utils.closemodal
				});
			});

			M.add({
				el: document.querySelector('#cookies-info'),
				event: 'click',
				fn: Utils.cookiesinfo
			});
	
			M.add({
				el: document.querySelector('#cookies-accept'),
				event: 'click',
				fn: Utils.acceptcookies
			});
	
			M.add({
				el: document.querySelector('#cookies-reject'),
				event: 'click',
				fn: Utils.rejectcookies
			});
		}
	}
}

export default Router;
