import Utils from '../../services/Utils.js'

let Queries;
let Database;
let Charts;

let App = {
	render: async () => {
		try {
			let text = await Utils.gettext('load');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		Promise.all([
			import('../../services/Queries.js'),
			import('../../services/Database.js'),
			import('../../services/Charts.js'),
		]).then(function(modules) {
			Queries = modules.shift().default;
			Database = modules.shift().default;
			Charts = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				init();
			});
		});

		function init() {
			let outputElm = Utils.byId('database-listing-result');
			let dbFileElm = Utils.byId('dbfile');
			let download = Utils.byId('download');
			let dbFileTrigger = Utils.byId('dbfiletrigger');

			Utils.msg(
				'file-msg',
				Utils.c('ready').uf()
			);
			
			datavalidity();
			isloading();
			verifydb();

			// Helper functions
			function verifydb() {
				if(G.db) {
					Utils.msg('performance-msg', `${Utils.c('working').uf()}&hellip;`);
					let filedata = [
						G.dbfile.name,
						G.dbfile.type,
						`${G.dbfile.size.toLocaleString(Utils.l)} B`,
						`${(G.dbfile.time / 1000).toLocaleString(Utils.l)} s`,
						G.dbfile.date.toLocaleDateString(Utils.l, {dateStyle: 'long', timeStyle: 'long'})
					].join('; ');
					Utils.perftimer(
						false, 
						`${Utils.c('database').uf()}: ${filedata}. ${Utils.c('loading').uf()}`, 
						'file-msg',
						false
					);
					filedata = undefined;
					execute();
				} else {
					downloadfile();
				}
			}
			
			function isloading() {
				if(G.isdownloading === true) {
					Utils.msg('file-loading-spin', '<i class="fas fa-cog fa-spin w3-text-red"></i>');
					Utils.msg('file-loading', Utils.c('download in process').uf() + '&hellip;');			
				}
			}

			function datavalidity() {
				Utils.getremoteheaders(`./assets/static/${G.appdata.filename}.db`).then(res => {
					if(res) {
						let typesel = Utils.byId('download-type');
						if(typesel) {
							let optcurrent = Array.from(typesel.options).find(o => o.value === 'current');
							let optcopy = Array.from(typesel.options).find(o => o.value === 'copy');
							if(optcurrent) {
								optcurrent.innerHTML = [
									`${Utils.c('current').uf()}: `,
									`${new Date().toLocaleDateString()}`,
								].join('');
							}
							if(optcopy) {
								let copytext = [
									`${Utils.c('copy').uf()}: `,
									`${new Date(res['last-modified']).toLocaleDateString()}, `,
									`${Utils.humansize(Number(res['content-length']))}`,
								].join('');
								optcopy.innerHTML = copytext;
								copytext = undefined;
							}
							optcurrent = optcopy = undefined;
						}
						typesel = undefined;
					}
					res = undefined;
				}).catch(err => {
					throw new Error(Utils.c('communication error'));
				});
			}
			
			// Run a command in the database
			function execute() {
				Utils.msg(
					'fileread-message',
					`<i class="fas fa-cog fa-spin w3-text-red"></i>`
				);
				
				Utils.perftimer(true);
				
				let queries = Queries.filter(q => q.group === 'load');
				let commands = queries.map(q => q.definition).join('');
				let fkey = G.appcollections[G.appactivecollection];

				if(fkey.sql) commands = commands.split('###').join(fkey.sql);
				fkey = undefined;

				if(!O) Utils.overlay();

				Database.calculatequery(commands).then(results => {
					if(!results) {
						showhideresults(false);
						Utils.msg('performance-msg', '');
						G.db = null;
						G.dbloaded = false;
						G.dbfilteredtypes = [];
						G.dbtypes = [];
						Utils.dbloadedindicator();
						Utils.perftimer(false);
						if(O) Utils.overlay();
						throw new Error(Utils.c('database error').uf());
					}
					if(!Array.isArray(results)) {
						showhideresults(false);
						Utils.msg('performance-msg', '');
						G.db = null;
						G.dbloaded = false;
						G.dbfilteredtypes = [];
						G.dbtypes = [];
						Utils.dbloadedindicator();
						Utils.perftimer(false);
						if(O) Utils.overlay();
						throw new Error(Utils.c('database error').uf());
					}
					
					listresults(results, queries.filter((o, i) => i > 0));

					let tablestructquery = Queries
						.filter(q => q.group === 'setup')
						.find(o => o.name === 'tables structure').definition;

					Database.calculatequery(tablestructquery).then(tres => {
						if(!tres) {
							showhideresults(false);
							Utils.msg('performance-msg', '');
							G.db = null;
							G.dbloaded = false;
							Utils.dbloadedindicator();
							if(O) Utils.overlay();
							throw new Error(Utils.c('database error').uf());
						}
						if(!Array.isArray(tres)) {
							showhideresults(false);
							Utils.msg('performance-msg', '');
							G.db = null;
							G.dbloaded = false;
							Utils.dbloadedindicator();
							if(O) Utils.overlay();
							throw new Error(Utils.c('database error').uf());
						}
						let tbres = tres[0];
						let tbelm = Utils.byId('database-load-structure');
						tbelm.innerHTML = '';
						tbelm.appendChild(
							Database.tablecreate(
								Utils.c('tables'), 
								[
									'name',
									'description',
									'fields'
								], 
								tbres.values.map(r => {
									let tmp = r[1];
									let tm1 = tmp.split('(')[1];
									let tm2 = tm1.replace(')', '').split(',').map(q => q.trim()).join(', ');
									tmp = tm1 = undefined;
									return [r[0], C[Utils.l].struct[r[0]], tm2];
								})
							)
						);

						Utils.perftimer(false, Utils.c('displaying').uf());
						if(O) Utils.overlay();
						results = tbres = tbelm = undefined;
					});
				});
			}
	
			function showhideresults(show = true) {
				if(show) {
					document.querySelectorAll('.tabbar').forEach(o => {
						if(o.dataset && o.dataset.target === 'database-listing-result') {
							o.style.display = 'block';
							o.click();
						}
					});
				} else {
					document.querySelectorAll('.tabbar').forEach(o => {
						if(o.dataset && o.dataset.target === 'step2') o.click();
					});
				}
			}
			
			function listresults(results, queries) {
				Utils.byId('fileread-message').innerHTML = '';
				outputElm.innerHTML = '';
				outputElm.style.marginBottom = '0';

				if(results.length) {
					let sankey = [];
					let tree = {};
					Object.keys(G.primaryrecords)
						.filter(f => G.primaryrecords[f].lang === Utils.l)
						.forEach(o => tree[o] = {
							id: o,  
							name: o, 
							parent: `${Utils.c('primary records')}`,
						});
					for(let i = 0; i < results.length; i++) {
						if(i === 0) {
							G.dbposlength = results[i].values.flatten().sum();
							if(!G.dbfilter.length) {
								G.dbfilteredlength = G.dbposlength;
								G.dbpagination.listing.total = 
									Math.ceil(G.dbposlength / G.dbrecordsperpage);
								G.dbpagination.listing.current = 1;
							}
						} else {
							let title = Utils.c(queries[i].name).uf();
							outputElm.appendChild(Database.tablecreate(title, results[i].columns, results[i].values));
							title = undefined;
						}
						
						if(queries[i].name === 'count by relations type') {
							results[i].values.forEach(o => {
								sankey.push({
									from: `${o[0]} > `, 
									to: o[1], 
									value: o[3],
									fill: Utils.getcolorfromcss(`.${G.primaryrecords[o[0]].color}`, 'background-color')
								});
								sankey.push({
									from: o[1], 
									to: `> ${o[2]}`, 
									value: o[4],
									fill: Utils.getcolorfromcss(`.${G.primaryrecords[o[2]].color}`, 'background-color')
								});
								
								tree[`${o[0]} > ${o[1]}`] = {
									id: `${o[0]} > ${o[1]}`,
									name: `${o[0]} > ${o[1]}`,
									parent: o[0],
									value: o[3],
								};
								tree[`${o[1]} > ${o[2]}`] = {
									id: `${o[1]} > ${o[2]}`,
									name: `${o[1]} > ${o[2]}`,
									parent: o[2],
									value: o[4],
								};
							});
						}
						if(queries[i].name === 'count pos by type') {
							let total = results[i].values.map(o => o[1]).sum();
							tree[`${Utils.c('primary records')}`] = {
								id: `${Utils.c('primary records')}`,
								name: `${Utils.c('primary records')}`,
								parent: null,
								value: total,
							};
							total = undefined;
						}
					}
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
					
					Utils.cleardomnode('database-load-analysis');
					Utils.msg(
						'database-load-analysis',
						[
							`<style type="text/css">`,
							`.anychart-tooltip{font-size:0.6em;background:#fff;`,
							`color:#333;box-shadow:0 0 5px #333;padding:20px;}`,
							`.anychart-tooltip h5{margin:0 0 5px;}`,
							`.anychart-tooltip ul{margin:0 0 5px;}`,
							`</style>`,
							`<div id="sankey_relations" class="w3-row w3-padding" style="height:85vh"></div>`,
							`<div id="treemap_relations" class="w3-row w3-padding" style="height:65vh"></div>`,
						].join('\n')
					);

					Charts.sankey(
						'sankey_relations', 
						sankey, 
						`${Utils.c('relations').uf()}: ${Utils.c('flows')} (${Utils.c('sankey')})`
					);
					Charts.treemap(
						'treemap_relations', 
						Object.values(tree), 
						`${Utils.c('relations').uf()}: ${Utils.c('treemap')}`
					);
				} else {
					let div = document.createElement('blockquote');
					let p = document.createElement('p');
					p.classList.add('error');
					p.classList.add('bg-error');
					p.innerHTML = Utils.c('no results').uf();
					div.appendChild(p);
					outputElm.appendChild(div);
					div = p = undefined;
				}
				Utils.filterbadge();
				showhideresults(true);
			}
			
			// Load a db from a file & download remote db file
			function copyarraybuffer(src)  {
				let dst = new ArrayBuffer(src.byteLength);
				new Uint8Array(dst).set(new Uint8Array(src));
				return dst;
			}

			function loaddatabase() {
				return new Promise((resolve, reject) => {
					if(G.db) resolve(true);
					Utils.msg('file-msg', '');
					let xhr = new XMLHttpRequest();
					xhr.open('GET', `./assets/static/${G.appdata.filename}.db`, true);
					xhr.responseType = 'arraybuffer';
					let filedate = null;
					let filesize = null;
					let filetime = null;
					
					xhr.onload = e => {
						filetime = window.performance.now() - filetime;
						Utils.msg('file-msg', Utils.c('ready').uf());
						if(G.appuseworker) {
							G.db = copyarraybuffer(xhr.response);
							G.worker.onmessage = function (db) {
								G.dbloaded = true;
								G.dbfile.name = 'pathwise.db';
								G.dbfile.date = filedate;
								G.dbfile.size = filesize;
								G.dbfile.type = 'SQLite v3';
								G.dbfile.time = filetime;
								Utils.dbloadedindicator();
								resolve(true);
							};
							try {
								G.worker.postMessage({ 
									action: 'open', 
									buffer: copyarraybuffer(G.db) 
								}, [copyarraybuffer(G.db)]);
							}
							catch (exception) {
								G.db = null;
								G.dbfile.name = null;
								G.dbfile.date = null;
								G.dbfile.size = null;
								G.dbfile.type = null;
								G.dbfile.time = null;
								Utils.dbloadedindicator();
								if(O) Utils.overlay();
								reject(false);
							}
						} else {
							let config = {
								locateFile: filename => `./assets/vendor/kripken/${filename}`
							};
							window.initSqlJs(config).then(function (SQL) {
								G.dbfile.bin = new Uint8Array(xhr.response);
								if (G.dbfile.bin) {
									G.db = new SQL.Database(G.dbfile.bin);
									G.dbfile.name = 'pathwise.db';
									G.dbfile.date = filedate;
									G.dbfile.size = filesize;
									G.dbfile.type = 'SQLite v3';
									G.dbfile.bin = null;
									resolve(true);
								} else {
									G.db = null;
									G.dbfile.name = null;
									G.dbfile.date = null;
									G.dbfile.size = null;
									G.dbfile.type = null;
									G.dbfile.bin = null;
									Utils.dbloadedindicator();
									if(O) Utils.overlay();
									reject(false);
								}
							});
						}
					};

					xhr.onreadystatechange = function() {
						if(this.readyState == 2) {
							if(this.getResponseHeader('Last-Modified')) {
								filedate = new Date(this.getResponseHeader('Last-Modified'));
							}
						}
					}
					
					xhr.onprogress = function (event) {
						let meter = document.querySelector('.meterloading');
						let textm = document.querySelector('#performance-msg');
						let stars = (l, t) => {
							let fills = Math.round((l / t) * 10);
							let voids = 10 - fills;
							let fillc = '*';
							let voidc = '·';
							return `${fillc.repeat(fills)}${voidc.repeat(voids)}`;
						};
						if(!filesize) filesize = event.total;
						if(meter && textm) {
							let currenttime = window.performance.now();
							let elapsed = Math.round((currenttime - filetime) / 1000);
							let speed = Math.round(event.loaded / elapsed);
							meter.innerHTML = [							
								`${Utils.c('download in process').uf()}. `,
								`<code class="w3-codespan">${stars(event.loaded, event.total)}</code> `,
								`${parseInt((event.loaded / event.total) * 100)}%. `,
								`${Utils.c('elapsed').uf()}: ${elapsed.toLocaleString(Utils.l)} s. `,
								`${Utils.c('speed').uf()}: ${Utils.humansize(speed)}/s.`,
							].join('');
							textm.innerHTML = [
								`${Utils.c('loading').uf()}: `,
								`${Utils.humansize(event.loaded || 0)} / `,
								`${Utils.humansize(event.total || 0)}`
							].join('');
							currenttime = elapsed = speed = undefined;
						}
						meter = textm = stars = undefined;
					};

					if(!O) Utils.overlay();
					filetime = window.performance.now();
					xhr.send();
				});
			}

			function downloadfile() {
				if(G.db) {
					if(!O) Utils.overlay();
					showhideresults(true);
					G.dbloaded = true;
					Utils.dbloadedindicator();
					execute();
					isdate = dbf = date = undefined;
					return;
				}
				if(!O) Utils.overlay();
				if(G.isdownloading === true) {
					if(O) Utils.overlay();
					throw new Error(Utils.c('downloading in process').uf());
				}
				
				loaddatabase().then(result => {
					Utils.byId('performance-msg').innerHTML = '';
					let isdate = obj => Object.prototype.toString.call(obj) === "[object Date]";
					let dbf = G.dbfile;
					let date = isdate(dbf.date) ? 
						dbf.date.toLocaleDateString(Utils.l, {dateStyle: 'long', timeStyle: 'long'}) : 
						Utils.c('invalid');
					Utils.msg(
						'file-msg',
						[
							`${Utils.c('database').uf()}: `, 
							`${dbf.name}; ${dbf.size.toLocaleString(Utils.l)} B; `,
							`${date}; `,
							`${(G.dbfile.time / 1000).toLocaleString(Utils.l)} s`,
						].join('')
					);
					showhideresults(true);
					G.dbloaded = true;
					Utils.dbloadedindicator();
					execute();
					isdate = dbf = date = undefined;
				});
			}
			
			// Listeners & helpers
		}				
	}
}

export default App;
