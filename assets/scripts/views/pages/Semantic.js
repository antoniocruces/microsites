import Utils from './../../services/Utils.js'

let Queries;
let Database;

let Semantic = {
	render: async () => {
		try {
			let text = await Utils.gettext('semantic');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		Promise.all([
			import('../../services/Queries.js'),
			import('../../services/Database.js'),
		]).then(function(modules) {
			Queries = modules.shift().default;
			Database = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				init();
			});
		});
		
		function init() {
			// Variables
			let request = Utils.parseRequestURL();
			let outputElm = Utils.byId('database-listing-result');
	
			if(!G.db) {
				Utils.byId('filter-warning').style.display = 'block';
				if(O) Utils.overlay();
				return;
			} else {
				Utils.byId('filter-warning').style.display = 'none';
				setuplisting();
			}
			
			function setuplisting() {
				if(G.db) {
					let item = parseInt(decodeURI(request.id || G.appactivesemantic.item), 10);
					let value = decodeURI(request.verb || G.appactivesemantic.value);
					let query = (Queries.find(o => o.name === 'semantic index') || {definition: {es: [], en: []}}).definition[Utils.l];
					let options = query.map((o, i) => ({index: i, text: o.text, color: o.color, type: o.type}));
					Utils.byId('smn-units-list').innerHTML = '';
					let tmp = [];
					options.forEach(o => {
						tmp.push([
							`<a href="./#/semantic/${o.index}" `,
							`class="w3-${o.color} w3-bar-item w3-button">`,
							`${Utils.pricon(o.type)} ${o.text}`,
							`</a>`,
						].join(''));
					});

					Utils.msg('smn-units-list', tmp.join('\n'));
					Utils.msg('smn-units-total', options.length.toLocaleString(Utils.l));
					
					Utils.byId('database-result').style.display = 'block';
					
					if(request.id) {
						showlisting(request.id);
					} else {
						if(O) Utils.overlay();
					}
					
					item = value = query = options = undefined;
				} else {
					if(O) Utils.overlay();
					Utils.byId('database-result').style.display = 'none';
				}
			}
				
			function showlisting(qid) {
				if(!qid || qid === undefined) return;
				let query = (Queries.find(o => o.name === 'semantic index') || {definition: {es: [], en: []}}).definition[Utils.l];
				qid = parseInt(qid, 10);
				if(isNaN(qid)) return;
				if(!query[qid]) {
					throw new Error(Utils.c('internal error'));
				}
				let sel = query[qid];
				let commands = !request.verb ? 
					[
						`SELECT ${sel.field} text, COUNT(*) count `,
						`FROM ${sel.table} `,
						`WHERE ${sel.where} `,
						`AND ${sel.field} IS NOT NULL `,
						`AND TRIM(${sel.field}) <> '' `,
						`GROUP BY ${sel.field} ORDER BY ${sel.field}`,	
					].join('') : 
					[
						`SELECT '<a href="./#/search/' || p.ID || '">' || TRIM(p.value) || '</a>' title `,
						`FROM pos p INNER JOIN ${sel.table} x ON p.ID = x.ID `, 
						`WHERE x.${sel.where} `,
						`AND x.${sel.field} LIKE "${decodeURI(request.verb)}" `,
						`AND p.value IS NOT NULL `,
						`AND p.value <> '' `,
						`ORDER BY TRIM(p.value), p.ID`,
					].join('');
				
				if(!O) Utils.overlay();

				Database.calculatequery(commands).then(results => {
					let result = results[0].values;

					Utils.msg('smn-title', [
						`<h4 class="w3-text-theme w3-bottombar w3-border-grey">`,
						`${sel.text} &rarr; `,
						`${request.verb ? decodeURI(request.verb) : '*'}`, 
						`<span id="index-count" class="w3-right">[`,
						result.length.toLocaleString(Utils.l),
						`]</span>`,
						`</h4>`,
					].join(''));
					
					outputElm.innerHTML = '';
					outputElm.appendChild(
						Database.listcreate(
							'database-listing-result', 
							request.verb ? result : result.map(o => [
								[
									`<a href="./#/semantic/${qid}/${encodeURI(o[0])}">${o[0]}</a> `,
									`<span class="w3-right">[${o[1].toLocaleString(Utils.l)}]</span>`,
								].join(''),
							]), 
							'', 
							true
						)
					);

					Utils.byId('database-result').style.display = 'block';
					if(O) Utils.overlay();
					
					setlisteners();
					
					result = query = sel = undefined;
				});
			}
			
			// Listeners & Helpers
			function setlisteners() {
				Utils.byId('index-filter').style.display = 'block';
				M.add({
					el: Utils.byId('index-filter'),
					event: 'keyup',
					fn: searchlist
				});
				M.add({
					el: Utils.byId('index-filter'),
					event: 'search',
					fn: searchlist
				});
				M.add({
					el: Utils.byId('index-filter'),
					event: 'change',
					fn: searchlist
				});
			}
			
			// Listeners helper functions
			function searchlist(e) {
				let input = e.target;
				let filter = input.value.toUpperCase();
				let ul = Utils.byId('database-listing-result').getElementsByTagName('ul')[0];
				let li = ul.getElementsByTagName('li');
				let cvis = 0;
				let chid = 0;
				
				for(let i = 0, len = li.length; i < len; i++) {
					let txtValue = li[i].textContent || li[i].innerText;
					if(txtValue.toUpperCase().indexOf(filter) > -1) {
						li[i].style.display = '';
						cvis++;
					} else {
						li[i].style.display = 'none';
						chid++;
					}
				}
				Utils.msg('index-count', `[${cvis.toLocaleString(Utils.l)}]`);
			}
		}
	}
}

export default Semantic;
