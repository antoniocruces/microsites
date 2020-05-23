import Utils from './../../services/Utils.js'

let Queries;
let Database;

let Listing = {
	render: async () => {
		try {
			let text = await Utils.gettext('listing');
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
			/*
			function normalizequery(text) {
				return text.toLowerCase().replace(/[áéíóúàèìòùäëïöüâêîôûç]/gi, '_');
			}
			*/
			function setuplisting() {
				if(G.db) {
					Utils.byId('database-listing-result').style.display = 'block';
					
										
					Object.keys(G.dblistingfeatures).forEach(o => {
						Utils.byId(`lst-features-${o}`).checked = G.dblistingfeatures[o];
					});
					
					setlisteners();
					let searchterm = request.query || null;								
					let order = request.verb || 'rkey+';
					let sort = [
						{
							url: 'icon+', 
							orderby: 'p.rkey ASC, p.value ASC'
						},
						{
							url: 'icon-', 
							orderby: 'p.rkey DESC, p.value ASC'
						},
						{
							url: 'rkey+', 
							orderby: 'p.rkey ASC, p.value ASC'
						},
						{
							url: 'rkey-', 
							orderby: 'p.rkey DESC, p.value ASC'
						},
						{
							url: 'value+', 
							orderby: 'p.value ASC, p.rkey ASC'
						},
						{
							url: 'value-', 
							orderby: 'p.value DESC, p.rkey ASC'
						},
						{
							url: 'features+', 
							orderby: 'features ASC, p.rkey ASC, p.value ASC'
						},
						{
							url: 'features-', 
							orderby: 'features DESC, p.rkey ASC, p.value ASC'
						},
					];
					let orderby = sort.find(o => o.url === order);
						
					let query = Queries.find(o => o.name === `primary records listing`) || null;
					if(!query) throw new Error(Utils.c('internal error').uf());
	
					let command = query.definition;

					let currentpage = request.id || null ? 
						(isNaN(request.id) ? 0 : Number(request.id)) : 
						G.dbpagination.listing.current;
					
					
					command = command.split('@@@').join(orderby.orderby);

					if(searchterm) {
						searchterm = String(searchterm).na();
						currentpage = currentpage === 0 ? 1 : currentpage;
					}
					
					let features = [];
					Object.keys(G.dblistingfeatures).forEach(o => {
						if(G.dblistingfeatures[o]) {
							switch(o) {
								case 'gender':
									features.push({
										table: `LEFT JOIN gen g ON p.ID = g.ID`,
										fields: [
											`'${Utils.c('gender').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(g.gender, '∅') || '</strong>. '`,
										].join(''),
										where: [
											`g.gender GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*"`,
										].join(''),
									});
									break;
								case 'date':
									features.push({
										table: `LEFT JOIN age a ON p.ID = a.ID`,
										fields: [
											`'${Utils.c('date').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(a.start, '∅') || '</strong>. ' || `,
											`'${Utils.c('years').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(a.agey, '∅') || '</strong>. ' || `,
											`'${Utils.c('months').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(a.agem, '∅') || '</strong>. ' || `,
											`'${Utils.c('weeks').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(a.agew, '∅') || '</strong>. ' || `,
											`'${Utils.c('days').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(a.aged, '∅') || '</strong>. '`,
										].join(''),
										where: [
											`a.start GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.end GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.starty GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.startm GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.startd GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.startw GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.endy GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.endm GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.endd GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.endw GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.agey GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.agem GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.aged GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`a.agew GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
										].join(''),
									});
									break;
								case 'place':
									features.push({
										table: `LEFT JOIN pla l ON p.ID = l.ID`,
										fields: [
											`'${Utils.c('town').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(NULLIF(l.town, ''), '∅') || '</strong>. ' || `,
											`'${Utils.c('region').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(NULLIF(l.region, ''), '∅') || '</strong>. ' || `,
											`'${Utils.c('country').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(NULLIF(l.country, ''), '∅') || '</strong>. '`,
										].join(''),
										where: [
											`l.town GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`l.region GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
											`OR `,
											`l.country GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
										].join(''),
									});
									break;
								case 'taxonomies':
									features.push({
										table: `LEFT JOIN tax t ON p.ID = t.ID`,
										fields: [
											`'${Utils.c('taxonomies').uf()}' || ': ' || `,
											`'<strong>' || COALESCE(GROUP_CONCAT(t.value, '. '), '∅') || '</strong>. '`,
										].join(''),
										where: [
											`t.value GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*"`,
										].join(''),
									});
									break;
								default:
									break;
							}
						}
					});
					
					let xtables = '';
					let xfields = '';
					let xwheres = '';
					if(features.length) {
						xtables += `${features.map(o => o.table).join(' ')} `;
						xfields += `, ${features.map(o => o.fields).join(' || \' \' || ').trim()} AS features `;
						xwheres += ` OR ${features.map(o => o.where).join(' OR ')}`;
					}
					if(searchterm) {
						command = command.split('&&&').join([
							`WHERE p.value GLOB "*${Database.prepareglobstring(decodeURI(searchterm))}*" `,
							`${xwheres}`
						].join(''));
					} else {
						command = command.split('&&&').join('');
					}
					command = command.split('###').join(xtables);
					command = command.split('%%%').join(xfields);
					
					features = xtables = xfields = xwheres = undefined;

					Utils.perftimer(true);
					
					Database.calculaterows(command).then(res => {
						if(!res) throw new Error(Utils.c('database error').uf());
						if(!Array.isArray(res)) throw new Error(Utils.c('database error').uf());
						if(!res[0].values) throw new Error(Utils.c('database error').uf());
						
						G.dbpagination.listing.total = Math.ceil(res[0].values[0][0] / G.dbrecordsperpage);
						let lastpage = G.dbpagination.listing.total;
						if(!G.dbpagination.listing.current) {
							G.dbpagination.listing.current = 1
						}
						currentpage = currentpage > lastpage ? lastpage : currentpage;
						currentpage = currentpage === 0 ? 1 : currentpage;
						let offset = (currentpage - 1) * G.dbrecordsperpage;
						
						command = command.split('$$$').join( 
							`LIMIT ${G.dbrecordsperpage} OFFSET ${offset}`
						);
						
						let rows = res[0].values[0][0];
						res = undefined;

						Database.calculatequery(command.split(';')[1]).then(results => {
							if(!results) results = [];
							if(!results.length) results.push({columns: [], values: []});
							
							if(results.length) {
								results[0].columns = ['icon'].concat(results[0].columns);
								results[0].values = results[0].values.map(o => [Utils.pricon(o[0])].concat(o));
							}
							
							listresults(
								results, 
								lastpage, 
								currentpage, 
								orderby, 
								searchterm, 
								query
							);
							
							Utils.perftimer(false, [
								`${Utils.c('displaying').uf()}: `,
								`${rows.toLocaleString(Utils.l)} `,
								`${Utils.c('rows')}`
							].join(''));
							Utils.byId('database-result').style.display = 'block';
							if(O) Utils.overlay();
							
							searchterm = lastpage = currentpage = orderby = undefined;
							offset = order = sort = undefined;
							query = command = results = undefined;
						});
					});
				} else {
					if(O) Utils.overlay();
					Utils.byId('database-result').style.display = 'none';
				}
			}

			function listresults(results, lastpage, currentpage, orderby, searchterm, query) {
				Utils.perftimer(true);
				outputElm.innerHTML = '';
				let isvalid = Array.isArray(results) && results[0].values;
				if(!isvalid) throw new Error(Utils.c().uf('invalid result'));
				if(results[0].values.length === 0) {
					Utils.perftimer(
						false, 
						`${Utils.c('displaying').uf()}: 0 ${Utils.c('rows')}` 
					);
					let srt = searchterm ? [
						`${Utils.c('search term').uf()}: "${decodeURI(searchterm)}". `,
						`<a href="./#/listing/" class="float-right">${Utils.c('reset').uf()}</a>`,
					].join('') : ``;
					let elm = document.createElement('blockquote');
					elm.classList.add('error');
					elm.classList.add('bg-error');
					elm.innerHTML = [
						`${Utils.c('no results').uf()}. `,
						srt,
					].join('').trim();
					outputElm.appendChild(elm);
					elm = undefined;
					return;
				}

				let rows = G.dbfilteredlength ? G.dbfilteredlength : (G.dbposlength || 0);
				for(let i = 0; i < results.length; i++) {
					let title = Utils.c(query.name).uf();
					outputElm.appendChild(Database.tablecreate(
						title, 
						results[i].columns, 
						results[i].values, 
						lastpage, 
						currentpage, 
						'listing',
						orderby.url,
						searchterm
					));
					outputElm.style.display = 'block';
					document.querySelectorAll('.export-table').forEach(o => {
						M.add({
							el: o,
							event: 'click',
							fn: Database.exporttable
						});
					});						
					document.querySelectorAll('.print-table').forEach(o => {
						M.add({
							el: o,
							event: 'click',
							fn: Utils.printtable
						});
					});						
					document.querySelectorAll('.rowsperpage-table').forEach(o => {
						M.add({
							el: o,
							event: 'click',
							fn: Database.rowsperpagelist
						});
					});						
					if(searchterm) Utils.byId('tablesearch').value = decodeURI(searchterm);
					title = undefined;
				}				
				Utils.perftimer(
					false, 
					`${Utils.c('displaying').uf()}: ${rows.toLocaleString(Utils.l)} ${Utils.c('rows')}` 
				);
				if(document.querySelector('#tablesearch-trigger')) {
					M.add({
						el: document.querySelector('#tablesearch-trigger'),
						event: 'click',
						fn: searchtable
					});
				}
				if(document.querySelector('#tablesearch-reset')) {
					M.add({
						el: document.querySelector('#tablesearch-reset'),
						event: 'click',
						fn: resettable
					});
				}
				
				document.querySelectorAll('.lst-goto-page').forEach(elm => {
					M.add({
						el: elm,
						event: 'click',
						fn: gotopage
					});
				});
				document.querySelectorAll('.slc-goto-page').forEach(elm => {
					M.add({
						el: elm,
						event: 'change',
						fn: gotopage
					});
				});
				rows = undefined;
			}
				
			// Listeners & Helpers
			function setlisteners() {
				document.querySelectorAll('.lst-features').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: includefeatures
					});
				});
			}
			/*
			function loadingmessage() {
				if(Utils.byId('database-listing-result')) {
					Utils.msg(
						'database-listing-result',
						`${Utils.c('fetching').uf()}&hellip; <i class="fas fa-cog fa-spin w3-text-red"></i>`
					);
				}
			}
			*/
			// Listeners helper functions
			function includefeatures(e) {
				let type = e.target.dataset.feature;
				G.dblistingfeatures[type] = !G.dblistingfeatures[type];
				e.target.checked = G.dblistingfeatures[type];
				type = undefined;
				window.dispatchEvent(new HashChangeEvent('hashchange'));
			}
			function searchtable(event) {
				let order = request.verb || 'rkey+';
				let currentpage = request.id || null ? 
					(isNaN(request.id) ? 0 : Number(request.id)) : 
					G.dbpagination.listing.current;
				let href = [
					`./#/listing/${currentpage}/`,
					`${order}/`,
					`${encodeURI(Utils.byId('tablesearch').value)}`,
				].join('');
				window.location.href = href;
			}
			function resettable(event) {
				window.location.href = './#/listing/';
			}
			function gotopage(event) {
				let lst = event.target;
				let val = event.target.value ? event.target.value : event.target.dataset.page;
				let tbl = document.querySelector('#tablesearch');
				let url = lst.dataset.url || '';
				let sort = lst.dataset.sort || null;
				let query = !tbl ? null : !tbl.value ? null : String(tbl.value).trim();
				let href = `./#/${url}/${val}${sort !== null ? '/' + sort : ''}${query !== null ? '/' + query : ''}`;
				lst = val = url = sort = query = undefined;
				window.location.href = href;
			}
		}
	}
}

export default Listing;
