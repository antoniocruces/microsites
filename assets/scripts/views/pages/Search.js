import Utils from './../../services/Utils.js'

let Database;
let Queries;
//let Charts;
let Stats;
//let Helpers;
let Maps;

let Search = {
	render: async () => {
		try {
			let text = await Utils.gettext('search');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		Promise.all([
			import('../../services/Database.js'),
			import('../../services/Queries.js'),
			/* import('../../services/Charts.js'), */
			import('../../services/Stats.js'),
			/* import('../../services/StatsHelpers.js'), */
			import('../../services/Maps.js'),
		]).then(function(modules) {
			Database = modules.shift().default;
			Queries = modules.shift().default;
			//Charts = modules.shift().default;
			Stats = modules.shift().default;
			//Helpers = modules.shift().default;
			Maps = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				init();
			});
		});

		function init() {
			// Variables
			let request = Utils.parseRequestURL();
			let outputWrp = Utils.byId('database-search-container');
			let outputAnl = Utils.byId('database-search-analysis');
			let outputElm = Utils.byId('database-search-result');
			let outputRls = Utils.byId('database-search-relations');
			//let execute = Utils.byId('src-calculate');
			
			if(Utils.byId('search-warning')) Utils.byId('search-warning').style.display = G.db === null ? 'block' : 'none';
			if(Utils.byId('search-container')) Utils.byId('search-container').style.display = G.db !== null ? 'block' : 'none';
			
			if(G.db) {
				setupsearch();
			} else {
				if(O) Utils.overlay();
			}

			function setupsearch() {
				setlisteners();
				Utils.byId('query-rowlimit').value = G.dblimit;

				let record = request.id || null;
				if(record && isNaN(record)) {
					document.querySelector('.src-text').value = decodeURI(record);
					showValuesList({target: Utils.byId('src-button')});
					return;
				}
				
				if(record && !isNaN(record)) {
					let query = Queries.find(o => o.name === `single record`) || null;
					if(!query) throw new Error(Utils.c('internal error').uf());
					
					let command = query.definition.split('@@@').join(record);
					command = command.replace('@y@', Utils.c('years'));
					command = command.replace('@m@', Utils.c('months'));
					command = command.replace('@w@', Utils.c('weeks'));
					command = command.replace('@d@', Utils.c('days'));
					
					Database.calculatequery(command).then(results => {
						if (!results) {
							Utils.overlay(false);
							throw new Error(event.data.errmsg);
						}
						outputElm.innerHTML = '';
						outputElm.innerHTML = Database.singlerecord(results);
						outputAnl.innerHTML = Database.singlerecordanalysis(results);
						outputRls.innerHTML = Database.singlerecordrelations(results);

						let relations = [];

						results[1].values.forEach(o => {
							if(iscoordinates(o[2])) {
								relations.push({
									ID: results[0].values[0][0], 
									rtitle: String(o[0]).trim(),
									ridtype: String(results[0].values[0][1]).trim(),
									rkey: Utils.c(`main record`),
									prtitle: String(results[0].values[0][2]).trim(),
									longitude: parseFloat(o[2].split(',')[1]),
									latitude: parseFloat(o[2].split(',')[0]),
									town: null, 
									region: null, 
									country: null, 
									place: null,
									gender: null,
									starty: null,
									startm: null,
									startd: null,
									agey: null,
									agem: null,
									aged: null,
								});
							}
						});
						results
							.filter(o => o.values.length)
							.filter(o => ['inbound', 'outbound'].includes(o.values[0][0]))
							.map(o => o.values).flatten().forEach(o => {
								relations.push({
									ID: o[0] === 'inbound' ? o[1] : o[2],
									rtitle: String(o[0]).trim(),
									ridtype: String(o[3]).trim(), 
									rkey: String(o[4]).trim(), 
									prtitle: String(o[5]).trim(), 
									longitude: parseFloat(o[7]), 
									latitude: parseFloat(o[8]), 
									town: String(o[9]).trim(), 
									region: String(o[10]).trim(), 
									country: String(o[11]).trim(), 
									place: Utils.placefromfields(String(o[9]).trim(), String(o[10]).trim(), String(o[11]).trim()),
									gender: String(o[12]).trim(),
									starty: Number(o[13]),
									startm: Number(o[14]),
									startd: Number(o[15]),
									agey: Number(o[16]),
									agem: Number(o[17]),
									aged: Number(o[18]),
								});
							});
						
						let struct = relationsnetwork(relations);
						let fields = G.frequences.fields;

						Stats.frequences(record, fields, relations);
						Stats.relations(record, struct);
						
						outputWrp.style.display = 'block';

						document.querySelectorAll('.map-point-trigger').forEach(o => {
							M.add({
								el: o,
								event: 'click',
								fn: singlemap
							});
						});
						document.querySelectorAll('.accordionlink').forEach(elm => {
							M.add({
								el: elm,
								event: 'click',
								fn: Utils.accordionlistener
							});
					    });
						document.querySelectorAll('.howtocite').forEach(elm => {
							M.add({
								el: elm,
								event: 'click',
								fn: showhowtocite
							});
						});
						document.querySelectorAll('.help-window').forEach(elm => {
							M.add({
								el: elm,
								event: 'click',
								fn: Utils.helplistener
							});
					    });
						
						if(O) Utils.overlay();
						
						record = query = command = relations = struct = fields = undefined;
					});
				} else {
					if(O) Utils.overlay();
				}
			}
			
			function relationsnetwork(relations) {
				if(relations.length < 1) return;
		
				let getcolor = prtype => Utils.rgb2hex(Utils.getcolorfromcss(`.${prtype}`, 'color'));
				let color = o => o === 'inbound' ? getcolor('w3-highway-red-text') : getcolor('w3-highway-green-text');

				let point = relations[0];

				let tmp = relations.filter((o, i) => i > 0).map(o => Object.assign({}, o, {
					color: color(o.rtitle),
					place: Utils.placefromfields(o.town, o.region, o.country, true),
					value: 1,
					name: o.prtitle,
				}));

				let relatives = tmp.reduce((acc, { rtitle, place, ...rest }) => {
					acc[rtitle] = acc[rtitle] || {name: rtitle, children: []};
					acc[rtitle][place] = acc[rtitle][place] || {name: place, children: []};
					acc[rtitle][place].children.push(rest);
					return acc;
				}, {});
				
				let struct = {name: point.prtitle, children: []};
				['outbound', 'inbound'].forEach(o => {
					if(relatives[o]) {
						let out = {name: Utils.c(o), children: []};
						let ind = relatives[o];
						Object.keys(ind).forEach(k => {
							if(!['name', 'children'].includes(k)) out.children.push(ind[k]);
						});
						struct.children.push(out);
						out = ind = undefined;
					}
				});

				getcolor = color = point = tmp = relatives = undefined;
				return struct;
			}
			
			function setsearchval(text) {
				Utils.byId('search').querySelector('.src-text').value = decodeURI(text);
			}
			
			function verifytext(e) {
				if(e.keyCode) {
					if(e.keyCode === 13) {
						e.preventDefault();
						Utils.byId('src-button').click();
						return;
					}
				}
				let parent = e.target.parentNode.parentNode;
				let value = e.target.value.trim();
				let invalidchars = ['[', ']'];	
				function contains(e) {
					return value.indexOf(e) > -1;
				}
			
				var isvalid = !invalidchars.some(contains);
				if (!isvalid || value === '') {
					e.target.classList.add('invalid');
					parent.querySelector('.src-search').classList.add('disabled');
				} else {
					e.target.classList.remove('invalid');
					parent.querySelector('.src-search').classList.remove('disabled');
				}
				
				return isvalid;
			}
	
			function showValuesList(e) {
				let parent = e.target.parentNode.parentNode;
				let qname = 'filtered search list values';
				let query = Queries.find(o => o.name === qname).definition || null;
				let result = [];
				
				if(parent.querySelector('.src-text').value.trim() !== '') {
					let condition = `*${Database.prepareglobstring(parent.querySelector('.src-text').value.trim())}*`;
					query = query.split('@@@').join(condition);
					query = query.split('###').join(G.dblimit);

					if(!O) Utils.overlay();
					Utils.sleep().then(() => {
						Database.calculatequery(query).then(results => {
							if (!results) {
								if(O) Utils.overlay();
								throw new Error(Utils.c('query error').uf());
							}
							if (!results.length) {
								if(O) Utils.overlay();
								throw new Error(Utils.c('no results').uf());
							}
	
							let rows = 0;
							document.querySelector('.modal-title').innerHTML = [
								`<span class="w3-text-theme">`,
								`${G.appdata.name}. ${Utils.c('value list').uf()}`,
								`</span>`
							].join('');
							for (let i = 0; i < results.length; i++) {
								rows += results[i].values.length;
	
								let rated = Database.ratearray(
									parent.querySelector('.src-text').value.trim(), 
									results[i].values.map(o => `${o[3]} ${o[6]}`),
									results[i].values
								);
								let data = rated.ratings.map(o => [...o.value]);
								let outputElm = document.querySelector('.modal-body');
								outputElm.innerHTML = '';
								let p = document.createElement('p');
								let div = document.createElement('div');
								p.innerHTML = [
									`<strong style="font-size:larger">`,
									`${rows.toLocaleString(Utils.l)} `,
									`${Utils.c('matches')}`,
									`</strong> `,
									`(${Utils.c('max')} ${G.dblimit.toLocaleString(Utils.l)}).`,
								].join('');
								outputElm.appendChild(p);
								div.style.height = '40vh';
								div.style.overflow = 'hidden';
								div.style.overflowY = 'scroll';
	
								div.appendChild(
									Database.searchlistcreate(
										data, 
										'search', 
										parent.querySelector('.src-text').value.trim()
									)
								);
								outputElm.appendChild(div);
								
								div.querySelectorAll('li.src-proposed-values').forEach(s => {								
									M.add({
										el: s,
										event: 'click',
										fn: setsearchval.bind(null, s.textContent)
									});
									
								});
								
								rated = data = outputElm = p = div = undefined;
							}
							document.querySelector('.modal-mask').style.display = 'block';
							document.querySelector('.modal').style.display = 'block';
	
							M.add({
								el: document.querySelector('.modal-close'),
								event: 'click',
								fn: Utils.closemodal
							});
	
							results = rows = undefined;
							parent = condition = query = qname = result = undefined;
							if(O) Utils.overlay();
						});
					});
				} else {
					throw new Error(Utils.c('value cannot be blank').uf());
				}
			}
			
			// Listeners & Helpers
			function setlisteners() {
				document.querySelectorAll('.src-text').forEach(s => {
					M.add({
						el: s,
						event: 'keyup',
						fn: verifytext
					});
					M.add({
						el: s,
						event: 'input',
						fn: verifytext
					});
					M.add({
						el: s,
						event: 'blur',
						fn: verifytext
					});
					M.add({
						el: s,
						event: 'focus',
						fn: verifytext
					});
				});
				document.querySelectorAll('.src-search').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: showValuesList
					});
				});
				M.add({
					el: document.querySelector('#query-rowlimit'),
					event: 'change',
					fn: setlimits
				});
				document.querySelectorAll('.tabs').forEach(elm => {
					M.add({
						el: elm,
						event: 'click',
						fn: tablistener
					});
			    });
			};
			
			// General helper functions
			function checkfloat(value) {
				let parsed = Number.parseFloat(value);
				return (!Number.isNaN(parsed)) && (!Number.isInteger(parsed))
			}
			function iscoordinates(val) {
				let valid = true;
				if(!val) return false;
				if(String(val).trim === '') return false;
				let array = String(val).split(',');
				if(array.length < 2) return false;
				array.forEach((o, i) => {
					if(i < 2) {
						if(!checkfloat(o)) valid = false;
					}
				});
				array = undefined;
				return valid;
			}
			/*
			function getcolor(prtype) {
				return Utils.rgb2hex(Utils.getcolorfromcss(`.${prtype}`, 'color'));
			}
			*/
			// Listeners functions
			function setlimits(event) {
				G.dblimit = event.target.value;
			}
			function tablistener(e) {
				document.querySelectorAll('[id^="chart_"]').forEach(c => {
					// Nothing at present
				});
			}
			function showhowtocite(e) {
				let uri = decodeURI(e.target.dataset.uri);
				let title = decodeURI(e.target.dataset.title);
				let nid = decodeURI(e.target.dataset.nid);
				Utils.howtocite(uri, title, nid);
			}
			
			function singlemap(e) {
				let point = e.target.dataset.coordinates || '0,0,0';
				let lat = parseFloat(point.split(',')[0]);
				let lon = parseFloat(point.split(',')[1]);
				let cid = e.target.dataset.cid;
				let title = e.target.dataset.title || Utils.c('n/a');
				let text = '[no text]';

				let query = Utils.paramstring({
					lat: lat.toFixed(6),
					lon: lon.toFixed(6),
					osm_type: 'N',
					format: 'json',
					zoom: 18,
					limit: 1,
					'accept-language': Utils.l,
					addressdetails: 1,
				});
				Utils.fetchtextasync(G.nominatimserver.address + query).then(res => {
					res = JSON.parse(res);
					text = `${Utils.c('calculated address').uf()}: ${res.display_name}`;

					let titleElm = document.querySelector('.modal-title');
					let outputElm = document.querySelector('.modal-body');
					titleElm.innerHTML = title;
					outputElm.innerHTML = '';
					outputElm.dataset.map = cid;
					
					let wrapper = document.createElement('div');
					wrapper.id = 'txt-body';
					
					let div = document.createElement('div');
					div.id = cid;
					div.style.height = '40vh';
					div.style.padding = '0';
					div.style.marginLeft = 'auto';
					div.style.marginRight = 'auto';
					div.innerHTML = `${Utils.c('working').uf()}&hellip;`;
					
					wrapper.appendChild(div);
					outputElm.appendChild(wrapper);
			
					document.querySelector('.modal-mask').style.display = 'block';
					document.querySelector('.modal').style.display = 'block';
	
					Maps.point(
						cid, 
						{
							lon: lon, 
							lat: lat
						}, 
						{
							markerFile: './assets/images/favicons/favicon-16x16.png',
							markerWidth: 16,
							markerHeight: 16,
						},
						14, 
						title, 
						text, 
						'cartodbvoyager'
					);
					point = lat = lon = cid = title = text = undefined;
					titleElm = outputElm = wrapper = div = undefined;
				});
			}
		}
	}
}

export default Search;
