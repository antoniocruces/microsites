import Utils from './../../services/Utils.js'

let Queries;
let Database;

let Indexed = {
	render: async () => {
		try {
			let text = await Utils.gettext('indexed');
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
					let activeindex = request.id || G.appactiveindex;
					if(G.appactiveindex !== request.id && request.id) G.appactiveindex = request.id;
					let indexes = G.appcollections[G.appactivecollection].indexes;
					let indextabs = ['-'].concat(Array 
						.apply(null, {length: 26}) 
						.map((x, i) => String.fromCharCode(65 + i)))
						.map(o => {
							let selected = activeindex.toUpperCase() === o.toUpperCase() ? ' w3-theme-l1' : '';
							return `<a href="./#/indexed/${o}" class="w3-bar-item w3-button${selected}" style="padding:8px">${o}</a>`;
						});
					
					document.querySelectorAll('.custom-description').forEach(o => {
						if(o.dataset.collection === G.appactivecollection) {
							o.style.display = 'block';
						} else {
							o.style.display = 'none';							
						}
					});
						
					Utils.msg(
						'index-tabs',
						indextabs.join('\n')
					);
					Utils.msg(
						'index-title',
						[
							`<h4>`,
							`<span class="w3-theme-d1 w3-padding">`,
							`${Utils.c('by').uf()} ${indexes.map(o => Utils.c(o)).join(', ')}`,
							`</span>`,
							`<span class="w3-margin-left">`,
							`<input id="index-filter" type="search" class="w3-input" `,
							`placeholder="${Utils.c('search')}..." `,
							`style="display:inline;width:auto">`,
							`<span id="index-count" class="w3-margin-left"></span>`,
							`</span>`,
							`</h4>`,
						].join('')
					);
					
					Utils.byId('database-listing-result').style.display = 'block';

					let query = Queries.find(o => o.name === `collection primary records listing`) || null;
					if(!query) throw new Error(Utils.c('internal error').uf());
					
					let command = query.definition;
					
					let wheretail = '';
					if(G.appcollections[G.appactivecollection].dbprkey) {
						if(G.appcollections[G.appactivecollection].dbtaxrkey && G.appcollections[G.appactivecollection].dbtaxvalue) {
							wheretail = [
								` AND p.rkey = "${G.appcollections[G.appactivecollection].dbprkey}" `,
								`AND p.ID IN(SELECT ID FROM tax WHERE rkey = "${G.appcollections[G.appactivecollection].dbtaxrkey}" `,
								`AND value IN(${G.appcollections[G.appactivecollection].dbtaxvalue})) `,
							].join('');
						} else {
							wheretail = [
								` AND p.rkey = "${G.appcollections[G.appactivecollection].dbprkey}"`,
							].join('');
						}
					}
					if(activeindex === '-') {
						command = command.split('&&&').join([
							`(SUBSTR(${indexes[0]}, 1) < "A"${wheretail} OR SUBSTR(${indexes[0]}, 1) > "z") `,
							`AND ${indexes[0]} IS NOT NULL AND TRIM(${indexes[0]}) <> ""`,
						].join(''));						
					} else {
						command = command.split('&&&').join([
							`${indexes[0]} LIKE "${activeindex}%"${wheretail} `,
							`AND ${indexes[0]} IS NOT NULL AND TRIM(${indexes[0]}) <> ""`,
						].join(''));
					}
					command = command.split('@@@').join(`${indexes.join(', ')}`);

					Database.calculaterows(command).then(res => {
						if(!res.length) {
							Utils.msg(
								'database-listing-result',
								[
									`<div class="w3-panel w3-pale-red w3-leftbar w3-border-red w3-padding-large">`,
									Utils.c('no results').uf(),
									`</div>`,
								].join('')
							);
							Utils.byId('database-result').style.display = 'block';
							if(O) Utils.overlay();
							query = command = activeindex = indexes = wheretail = undefined;
							return;
						}
						if(!res[0].values.length) {
							Utils.msg(
								'database-listing-result',
								[
									`<div class="w3-panel w3-pale-red w3-leftbar w3-border-red w3-padding-large">`,
									Utils.c('no results').uf(),
									`</div>`,
								].join('')
							);
							Utils.byId('database-result').style.display = 'block';
							if(O) Utils.overlay();
							query = command = activeindex = indexes = wheretail = undefined;
							return;
						}
						let result = res[0];

						let list = [];
						let fields = indexes.filter(o => o !== 'value');
						let values = result.values.map(o => {
							let obj = {};
							for(let i = 0; i < result.columns.length; i++) {
								obj[result.columns[i]] = o[i];
							}
							return obj;
						});
						values.forEach(o => {
							let row = [];
							let pr = G.primaryrecords[o.rkey];
							let icon = `<i class="fas fa-${pr.icon} ${pr.color}-text"></i>`;
							row.push([
								`<h5 class="w3-text-theme">`,
								`<a href="./#/search/${o.ID}">${icon} ${Utils.escapeHTML(o.value)}</a>`,
								`</h5>`,
								`<p>`,
								Object.entries(o)
									.filter(f => fields.includes(f[0]))
									.map(e => [
										`${e[0] === indexes[0] ? '<b>' : ''}`,
										`${Utils.c(e[0]).uf()}: `,
										`${e[1]}${e[0] === indexes[0] ? '</b>' : ''}`,
									].join('')).join('. '),
								`</p>`,
							].join(''));
							list.push(row);
						});
						
						outputElm.innerHTML = '';
						outputElm.appendChild(
							Database.listcreate('database-listing-result', list, '', true)
						);
						
						Utils.msg('index-count', values.length.toLocaleString(Utils.l));
						
						Utils.byId('database-result').style.display = 'block';
						
						setlisteners();
						
						query = command = activeindex = indexes = wheretail = undefined;
						result = indextabs = list = fields = values = undefined;
						if(O) Utils.overlay();
					});
				} else {
					if(O) Utils.overlay();
					Utils.byId('database-result').style.display = 'none';
				}
			}
				
			// Listeners & Helpers
			function setlisteners() {
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
				Utils.msg('index-count', cvis.toLocaleString(Utils.l));
			}
		}
	}
}

export default Indexed;
