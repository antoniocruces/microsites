import Utils from '../../services/Utils.js'

let Queries;
let Database;

let Filter = {
	render: async () => {
		try {
			let text = await Utils.gettext('filter');
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
			let outputElm = Utils.byId('database-listing-result');
			let execute = Utils.byId('flt-calculate');
			let clearFilter = Utils.byId('flt-clear');
			
			Utils.byId('filter-warning').style.display = G.db === null ? 'block' : 'none';
			Utils.byId('filter-container').style.display = G.db !== null ? 'block' : 'none';
			initfilter();
			
			// Common helper functions
			function validcondition(feature = '', operator = 'LIKE', value = '') {
				return ['IS NULL', 'IS NOT NULL'].includes(operator) ? 
					String(feature).trim() !== '' :
					String(feature).trim() !== '' && String(value).trim() !== '';
			}
			
			function enablebuttons() {
				if(!G.db) return;
				let disable = false;

				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				groups.forEach(g => {
					let conditions = g.querySelectorAll('.flt-condition');
					conditions.forEach(o => {
						let feature = o.querySelector('.flt-feature').value;
						let operator = o.querySelector('.flt-operator').value;
						let value = o.querySelector('.flt-value').value;
						if(!validcondition(feature, operator, value)) {
							disable = true;
							o.querySelector('.flt-feature').style.background = 'rgb(248, 248, 248)';
							o.querySelector('.flt-operator').style.background = 'rgb(248, 248, 248)';
							o.querySelector('.flt-value').style.background = 'rgb(248, 248, 248)';
						} else {
							o.querySelector('.flt-feature').style.background = 'rgb(244, 250, 244)';
							o.querySelector('.flt-operator').style.background = 'rgb(244, 250, 244)';
							o.querySelector('.flt-value').style.background = 'rgb(244, 250, 244)';
						}
					});
					conditions = undefined;
				});
				
				if(disable) {
					execute.classList.add('disabled');
					clearFilter.classList.add('disabled');
				} else {
					execute.classList.remove('disabled');
					clearFilter.classList.remove('disabled');
				}
				
				execute.disabled = disable;
				clearFilter.disabled = disable;
				
				if(G.dbfilter.length < 1) {
					Utils.byId('flt-save').classList.add('disabled');
				} else {
					Utils.byId('flt-save').classList.remove('disabled');
				}
				
				disable = groups = undefined;
			}
	
			function initfilter() {
				if(!G.db) {
					if(O) Utils.overlay();			
					return;
				}
				if(G.dbfilter.length === 0) {
					generatefields();
				} else {
					fillfields();
				}
				setlisteners();
				validate();
				listresults();
			}
			
			function sqltohuman() {
				let out = [''];
				if(!G.dbfilter.length) return out.join('');
				
				G.dbfilter.forEach((g, i) => {
					let link = i === 0 ? '' : `${Utils.c(g.link)} `;
					let relation = g.relation === '||' ? `${Utils.c('none')} ${Utils.c('relation')}` : 
						g.relation === '||%' ? `${Utils.c('any')} ${Utils.c('relation')}` : [
							`${g.relation.split('|')[0]} `,
							`${Utils.c('related to')} `,
							`${g.relation.split('|')[1]} `,
							`${Utils.c('as')} `,
							`${g.relation.split('|')[2]}`,
						].join('');
					out.push([
						`<li>`,
						`<strong>${link}${relation}</strong>; `,
						g.conditions
							.map(o => `${o.field} ${Utils.c(o.operator)} "${o.value}"`)
							.join(` ${Utils.c('and')} `),
						`</li>`,
					].join(''));
					link = relation = undefined;
				});
				
				return [
					`<ol class="custom-counter">`,
					out.join('\n'),
					`</ol>`
				].join('');
			}
			
			// Fields and validation helper functions
			function generatefields() {
				if(!G.db) return;
				if(G.dbfilterfeatures.length > 0 || G.dbfilterrelationslist.length > 0) {
					fillfields();
					return;
				} else {
					let commands = Queries.find(o => o.name === 'features list').definition;
					Database.calculatequery(commands).then(results => {
						if(!results) throw new Error(Utils.c('database error').uf());
						if(!Array.isArray(results)) throw new Error(Utils.c('database error').uf());
						if(!results[0].values) throw new Error(Utils.c('database error').uf());
						for (let i = 0; i < results.length; i++) {
							if(i === 0) {
								G.dbfilterfeatures.length = 0;
								results[i].values.forEach(a => {
									G.dbfilterfeatures.push([a[0], a[1], a[2]]);
								});
							} else {
								G.dbfilterrelationslist.length = 0;
								results[i].values.forEach(a => {
									G.dbfilterrelationslist.push([a[0], a[1], a[2], a[3]]);
								});
							}
						}
						commands = results = undefined;
						fillfields();
					});
				}
			}
			
			function fillfields() {
				if(!G.db) return;
				
				if(G.dbfilter.length) {
					removeallgroups();
					G.dbfilter.forEach((g, i) => {
						if(i > 0) makegroup({target: Utils.byId('filter').querySelector('.flt-group')});
						if(g.conditions.length) {
							/*
							let trigger = Utils.byId('filter')
								.querySelector(`.flt-group[data-order="${i}"] .flt-condition-add .tooltip img`);
							*/
							let trigger = Utils.byId('filter')
								.querySelector(`.flt-group[data-order="${i}"] .flt-condition-add`);
							g.conditions.forEach((c, n) => {
								if(n > 0) makecondition({target: trigger});
							});
							trigger = undefined;
						}
					});
				}

				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				
				groups.forEach((g, i) => {
					let s = null;
					let parent = null;
					let ancestor = null;
					let gid = i;
					let cid = null;
					let fid = null;
					
					s = g.querySelector('.flt-link');
					parent = s.parentNode.parentNode;
					if(i !== 0) {
						parent.style.display = 'inline';
						fid = G.dbfilter[i];
						if(fid) s.value = fid.link;
					} else {
						parent.style.display = 'none';
					}

					s = g.querySelector('.flt-relation');
					if(s.innerHTML === '') {
						let out = [];
						out.push(`<option value="||">* ${Utils.c('relation')} (${Utils.c('none')})</option>`);
						out.push(`<option value="||%">${Utils.c('relation')} (${Utils.c('any')})</option>`);
						let idt = null;
						G.dbfilterrelationslist.forEach(a => {
							if(idt !== a[0]) {
								out.push(`<optgroup label="${a[0]}">`);
							}
							out.push(`<option value="${a[0]}|${a[1]}|${a[2]}">${a[3]}</option>`);
							idt = a[0];
						});
						s.innerHTML = out.join('\n');
						out = idt = undefined;
					}
					s.value = '||';
					s.disabled = false;
					fid = G.dbfilter[i];
					if(fid) s.value = fid.relation;

					g.querySelectorAll('.flt-condition').forEach(c => {
						cid = Number(c.dataset.condition);
						s = c.querySelector('.flt-feature');
						if(!s.options.length) {
							let out = [];
							out.push(`<option value="">* ${Utils.c('feature')}</option>`);
							G.dbfilterfeatures.forEach(a => {
								out.push(`<option value="${a[0]}|${a[1]}">${a[2]}</option>`);
							});
							s.innerHTML = out.join('\n');
							out = undefined;
						}
						s.value = '';
						//s.selectedIndex = 0;
						s.disabled = false;
						fid = G.dbfilter.length ? 
							G.dbfilter.find(o => o.id === gid).conditions.find(o => o.id === cid) : 
							null;
						if(fid) s.value = `${fid.table}|${fid.field}`;
						
						s = c.querySelector('.flt-operator');
						s.disabled = false;
						fid = G.dbfilter.length ? 
							G.dbfilter.find(o => o.id === gid).conditions.find(o => o.id === cid) : 
							null;
						if(fid) s.value = fid.operator;

						s = c.querySelector('.flt-value');
						s.disabled = false;
						fid = G.dbfilter.length ? 
							G.dbfilter.find(o => o.id === gid).conditions.find(o => o.id === cid) : 
							null;
						if(fid) s.value = fid.value;
					});
					s = parent = ancestor = gid = fid = cid = undefined;
				});
			}
				
			function validate() {
				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				groups.forEach((g, i) => {
					if(i === 0) {
						g.querySelector('.flt-group-remove').style.display = 'none';
					}
					let conditions = g.querySelectorAll('.flt-condition');
					conditions.forEach(o => {
						let fea = o.querySelector('.flt-feature');
						let ope = o.querySelector('.flt-operator');
						let val = o.querySelector('.flt-value');
						if(!validcondition(fea.value, ope.value, val.value)) {
							[fea, ope, val].forEach(c => c.classList.add('invalid'));
						} else {
							[fea, ope, val].forEach(c => c.classList.remove('invalid'));
						}
					});
					conditions = undefined;
				});
				enablebuttons();
				
				groups = undefined;
			}			
			
			// Conditions management
			function makegroup(e) {
				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				let parent = groups[groups.length - 1];
				let ancestor = parent.parentNode;
				let gid = groups.length;
				
				let newgroup = parent.cloneNode(true);
				newgroup.dataset.order = gid;
				newgroup.querySelector('.flt-group-id').innerHTML = gid + 1;
				if(gid > 0) {
					newgroup.querySelector('.flt-link-wrapper').style.display = 'block';
					newgroup.querySelector('.flt-group-remove').style.display = 'inline-block';
					newgroup.querySelector('.flt-link-field').style.display = 'inline';
				}

				removegrouplisteners(newgroup);

				let conditions = newgroup.querySelectorAll('.flt-condition');
				conditions.forEach((o, i) => {
					if(i > 0) {
						removelisteners(o);
						newgroup.removeChild(o);
					} else {
						o.querySelector('.flt-feature').value = '';
						o.querySelector('.flt-feature').disabled = false;
						o.querySelector('.flt-feature').classList.add('invalid');
						
						o.querySelector('.flt-operator').value = 'LIKE';
						o.querySelector('.flt-operator').disabled = false;
						o.querySelector('.flt-operator').classList.add('invalid');
						
						o.querySelector('.flt-value').value = '';
						o.querySelector('.flt-value').classList.add('invalid');
					}
				});

				ancestor.appendChild(newgroup);

				groups = Utils.byId('filter').querySelectorAll('.flt-group');
				groups.forEach((g, i) => {
					g.dataset.order = i;
					g.querySelector('.flt-group-id').innerHTML = i + 1;
				});
				
				setlisteners();
				
				ancestor = groups = parent = gid = newgroup = conditions = undefined;
			}

			function makecondition(e) {
				let parent = e.target.parentNode.parentNode;
				let gid = Number(parent.dataset.order);
				let cid = parent.querySelectorAll('.flt-condition').length;

				let filter = Utils.byId('filter')
					.querySelector(`.flt-group[data-order="${gid}"]`);
				let newcondition = filter.querySelector('.flt-condition').cloneNode(true);
				newcondition.dataset.condition = cid;

				newcondition.querySelector('.flt-feature').value = '';
				newcondition.querySelector('.flt-feature').disabled = false;
				newcondition.querySelector('.flt-feature').classList.add('invalid');
				
				newcondition.querySelector('.flt-operator').value = 'LIKE';
				newcondition.querySelector('.flt-operator').disabled = false;
				newcondition.querySelector('.flt-operator').classList.add('invalid');
				
				newcondition.querySelector('.flt-value').value = '';
				newcondition.querySelector('.flt-value').classList.add('invalid');
				filter.appendChild(newcondition);
				
				setlisteners();
				
				parent = gid = cid = filter = newcondition = undefined;
			}
			
			function removecondition(e) {
				let parent = e.target.parentNode.parentNode;
				let cid = Number(parent.dataset.condition);
				if(cid !== 0) {
					parent.parentNode.removeChild(parent);
					removelisteners(parent);
				} else {
					parent.querySelector('.flt-feature').value = '';
					parent.querySelector('.flt-operator').value = 'LIKE';
					parent.querySelector('.flt-value').value = '';
				}
				
				setlisteners();
				enablebuttons();
				
				parent = cid = undefined;
			}

			function removegroup(e) {
				let parent = e.target.parentNode.parentNode;
				let ancestor = parent.parentNode;
				
				let conditions = e.target.querySelectorAll('.flt-condition');
				
				removegrouplisteners(e.target);
				conditions.forEach((o, i) => {
					removelisteners(o);
				});
				ancestor.removeChild(parent);
				
				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				groups.forEach((g, i) => {
					g.dataset.order = i;
					g.querySelector('.flt-group-id').innerHTML = i + 1;
				});
				
				parent = ancestor = conditions = groups = undefined;
			}
			
			function removegrouplisteners(o) {
				M.remove(o.querySelector('.flt-link'), 'click');
				M.remove(o.querySelector('.flt-condition-add'), 'click');
				M.remove(o.querySelector('.flt-group-remove'), 'click');
			}
			
			function removelisteners(o) {
				M.remove(o.querySelector('.flt-feature'), 'change');
				M.remove(o.querySelector('.flt-feature'), 'blur');
				M.remove(o.querySelector('.flt-feature'), 'focus');
				M.remove(o.querySelector('.flt-operator'), 'change');
				M.remove(o.querySelector('.flt-operator'), 'blur');
				M.remove(o.querySelector('.flt-operator'), 'focus');
				M.remove(o.querySelector('.flt-relation'), 'change');
				M.remove(o.querySelector('.flt-relation'), 'blur');
				M.remove(o.querySelector('.flt-relation'), 'focus');
				M.remove(o.querySelector('.flt-value'), 'keyup');
				M.remove(o.querySelector('.flt-value'), 'input');
				M.remove(o.querySelector('.flt-value'), 'blur');
				M.remove(o.querySelector('.flt-value'), 'focus');
				M.remove(o.querySelector('.flt-condition-remove'), 'click');
				M.remove(o.querySelector('.flt-condition-list'), 'click');
			}
	
			function removeallgroups() {
				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				groups.forEach((g, i) => {
					if(i !== 0) {
						removegroup({target: g.querySelector('.flt-group-remove')});
					} else {
						g.querySelector('.flt-relation').value = '||';
						g.querySelector('.flt-link').value = 'AND';
						g.querySelectorAll('.flt-condition').forEach((c, n) => {
							removecondition({target: c.querySelector('.flt-condition-remove')});
						});
					}
				});
				groups = undefined;
				enablebuttons();
			}
			
			// DB Operations
			function buildOperation(condition) {
				let blacklist = new Set(['IS NULL', 'IS NOT NULL']);
				let val = blacklist.has(condition.operator) ? `` : ` "${condition.value}"`;
				let out = [];
				out.push(`rkey = "${condition.field}"`);
				out.push(`value ${condition.operator}${val}`);
				blacklist = val = undefined;
				return out.join(' AND ');
			}
					
			function showValuesList(e) {
				let ancestor = e.target.parentNode.parentNode.parentNode;
				let parent = e.target.parentNode.parentNode;

				let gid = Number(ancestor.dataset.order);
				let cid = Number(parent.dataset.condition);
							
				let group = {link: '', relation: '', conditions: []};
				let condition = {table: null, field: null, operator: 'LIKE', value: null};
				
				let query = Queries.find(o => o.name === 'filter list').definition || null;
				let result = [];
	
				condition.table = parent.querySelector(`.flt-feature`).value.split('|')[0] || '';
				condition.field = parent.querySelector(`.flt-feature`).value.split('|')[1] || '';
				condition.operator = parent.querySelector(`.flt-operator`).value;
				condition.value = parent.querySelector(`.flt-value`).value;
				
				group.link = ancestor.querySelector(`.flt-link`).value;
				
				if(condition.field && condition.operator && condition.value && query) {
					query = query.split('@@@').join(buildOperation(condition));
					query = query.replace('###', condition.table);
					Database.calculatequery(query).then(results => {
						if (!results) {
							enablebuttons();
							throw new Error(Utils.c('database error'));
						}
						if (!results.length) {
							enablebuttons();
							throw new Error(Utils.c('no results').uf());
						}
						let rows = 0;
						document.querySelector('.modal-title').innerHTML = [
							`<span class="color-blue-400">`,
							`Pathwise. ${Utils.c('value list').uf()}`,
							`</span>`
						].join('');
						
						for (let i = 0; i < results.length; i++) {
							rows += results[i].values.length;
	
							let outputElm = document.querySelector('.modal-body');
							outputElm.innerHTML = '';
							let p = document.createElement('p');
							let div = document.createElement('div');
							p.innerHTML = [
								`<strong style="font-size:larger">`,
								`${rows.toLocaleString(Utils.l)} `,
								`${Utils.c('matches')}`,
								`</strong> `,
								`(${Utils.c('max')} 100).`,
							].join('');
							outputElm.appendChild(p);
							div.style.height = '40vh';
							div.style.overflow = 'hidden';
							div.style.overflowY = 'scroll';
							div.appendChild(Database.listcreate(
								parent.dataset.order, 
								results[i].values, 
								'flt-proposed-values'
							));
							outputElm.appendChild(div);
							
							div.querySelectorAll('li.flt-proposed-values').forEach(o => {
								M.add({
									el: o,
									event: 'click',
									fn: setvalueval.bind(null, gid, cid, o.textContent)
								});
							});
							
							outputElm = p = div = rows = undefined;
						}
						document.querySelector('.modal-mask').style.display = 'block';
						document.querySelector('.modal').style.display = 'block';

						ancestor = group = results = rows = undefined;
						parent = condition = query = result = undefined;
					});
				} else {
					ancestor = parent = gid = cid = group = undefined;
					condition = query = result = undefined;
					throw new Error(Utils.c('value cannot be blank').uf());
				}
			}
				
			function calculate() {
				G.dbfilter = [];
				let groups = Utils.byId('filter').querySelectorAll('.flt-group');
				groups.forEach((g, i) => {
					let group = {
						id: i,
						link: i === 0 ? '' : (g.querySelector('.flt-link') || {value: 'AND'}).value || 'AND',
						relation: (g.querySelector('.flt-relation') || {value: '||'}).value, 
						conditions: [],
					};
					let conditions = g.querySelectorAll('.flt-condition');
					conditions.forEach((c, n) => {
						group.conditions.push({
							id: n,
							table: (c.querySelector(`.flt-feature`) || {value: '|'}).value.split('|')[0] || '',
							field: (c.querySelector(`.flt-feature`) || {value: '|'}).value.split('|')[1] || '',
							operator: c.querySelector(`.flt-operator`).value,
							value: c.querySelector(`.flt-value`).value,
						});
					});
					G.dbfilter.push(group);
				});
				enablebuttons();
			}
			
			function executequery()	{
				let queries = [];
				let finalquery = '';
				G.dbfilter.forEach(g => {
					let conditions = g.conditions.map(o => {
						let str = ['GLOB', 'NOT GLOB'].includes(o.operator) ? 
							Database.prepareglobstring(o.value) : 
							o.value;
						return [
							`SELECT ID FROM ${o.table} `,
							`WHERE rkey = "${o.field}" AND `,
							`value ${o.operator}`,
							['IS NULL', 'IS NOT NULL'].includes(o.operator) ? `` : ` "${str}"`,
						].join('')
					}).join(' INTERSECT ');
					let query = '';
					if(g.relation === '||') {
						query = [
							`SELECT DISTINCT(ID) AS NID FROM (${conditions})`,
						].join('');
					} else {
						query = [
							`SELECT DISTINCT(NID) AS NID FROM `,
							
							`(`,
							
							`SELECT ID AS NID FROM rel WHERE `,
							`rkey LIKE "${g.relation.split('|')[2]}" AND `,
							`RID IN (${conditions}) `,
							
							`UNION `,
							
							`SELECT RID AS NID FROM rel WHERE `,
							`rkey LIKE "${g.relation.split('|')[2]}" AND `,
							`RID IN (${conditions})`,

							`UNION `,
							
							`SELECT ID AS NID FROM rel WHERE `,
							`rkey LIKE "${g.relation.split('|')[2]}" AND `,
							`ID IN (${conditions})`,
														
							`UNION `,
							
							`SELECT RID AS NID FROM rel WHERE `,
							`rkey LIKE "${g.relation.split('|')[2]}" AND `,
							`ID IN (${conditions})`,

							`)`,
						].join('');
					}
						
					queries.push(query);
					conditions = query = undefined;
				});
				finalquery += 'SELECT DISTINCT ID FROM pos WHERE ';
				queries.forEach((q, i) => {
					if(i === 0) {
						finalquery += 'ID IN(' + q + ') '
					} else {
						finalquery += '\n' + G.dbfilter[i].link + ' ID IN(' + q + ') '
					}
				});
				if(!G.dbfilterincluderelatives) {
					finalquery = finalquery.trim() + ';';
				} else {
					
				}
				
				//console.log(finalquery)
				let command = [
					`BEGIN TRANSACTION;`,
					`DROP TABLE IF EXISTS tmp;`,
					`CREATE TABLE tmp AS `,
					finalquery,
					`COMMIT;`,
					`BEGIN TRANSACTION;`,
					`DROP TABLE IF EXISTS flt;`,
					`CREATE TABLE flt AS `,
					`SELECT DISTINCT(NID) AS ID FROM(`,
					`SELECT ID AS NID FROM rel WHERE RID IN (SELECT ID FROM tmp) `,
					`UNION `,
					`SELECT RID AS NID FROM rel WHERE ID IN (SELECT ID FROM tmp) `,
					`UNION `,
					`SELECT ID AS NID FROM tmp`,
					`);`,
					`COMMIT;`,
					`BEGIN TRANSACTION;`,
					`DROP TABLE IF EXISTS tmp;`,
					`COMMIT;`,					
					`SELECT p.rkey, COUNT(p.ID) count FROM `,
					`pos p INNER JOIN flt f ON p.ID = f.ID `,
					`GROUP BY p.rkey `,
					`ORDER BY p.rkey;`,
				].join('');

				Database.calculatequery(command).then(results => {
					Utils.perftimer(false, Utils.c('executing SQL').uf());
					if (!results) {
						clearfilterdata();
						if(O) Utils.overlay();
					}
					Utils.perftimer(true);
					outputElm.innerHTML = '';
					let rows = 0;
					if(results.length) {
						for (let i = 0; i < results.length; i++) {
							if(i === 0) {
								G.dbfilteredtypes.forEach(r => {
									let res = results[i].values.find(o => o[0] === r.rkey);
									if(res) {
										r.filtered = res[1];
										r.percent = Math.round((res[1] / r.total) * 100, 1);
									} else {
										r.filtered = 0;
										r.percent = 0;
									}
								});
							}
							let columns = Object.keys(G.dbfilteredtypes[0]);
							let values = G.dbfilteredtypes.map(o => Object.values(o));
							let title = `${Utils.c('matches').uf()}`;
							outputElm.appendChild(Database.tablecreate(title, columns, values));
							rows += values.length;
							title = undefined;
							if(i === results.length - 1) {
								G.dbfilteredlength = results[i].values.map(o => o[1]).flatten().sum();
								G.dbpagination.listing.total = 
									Math.ceil(G.dbfilteredlength / G.dbrecordsperpage);
								G.dbpagination.listing.current = 1;
							}
							let humanquery = document.createElement('div');
							humanquery.classList.add('w3-panel');
							humanquery.classList.add('w3-leftbar');
							humanquery.classList.add('w3-light-grey');
							humanquery.innerHTML = [
								`<h4>${Utils.c('active filter').toUpperCase()}</h4>`,
								`${sqltohuman()}`,
							].join('');
							outputElm.appendChild(humanquery);
							
							columns = values = title = humanquery = undefined;
						}
					} else {
						let div = document.createElement('div');
						div.classList.add('w3-panel');
						div.classList.add('w3-pale-red');
						div.classList.add('w3-leftbar');
						div.classList.add('w3-border-red');
						div.classList.add('w3-padding-large');
						div.innerHTML = [
							Utils.c('no results').uf(),
						].join('');
						outputElm.appendChild(div);
						
						G.dbfilteredlength = 0;
						G.dbpagination.listing.total = 
							Math.ceil(G.dbfilteredlength / G.dbrecordsperpage);
						G.dbpagination.listing.current = 1;

						div = undefined;
					}
					Utils.perftimer(false, `${Utils.c('displaying').uf()}: ${rows} ${Utils.c('rows')}`);
	
					Utils.filterbadge();	
			
					results = rows = undefined;
					
					document.querySelectorAll('.export-table').forEach(o => {
						M.add({
							el: o,
							event: 'click',
							fn: exporttable
						});
					});						
					document.querySelectorAll('.print-table').forEach(o => {
						M.add({
							el: o,
							event: 'click',
							fn: printtable
						});
					});
					if(O) Utils.overlay();
				});					
			}

			function listresults() {
				outputElm.innerHTML = '';
				if(G.dbfilteredtypes.length) {
					let title = Utils.c('filtered by record type').uf();
					let columns = Object.keys(G.dbfilteredtypes[0]).map(o => Utils.c(o));
					let values = G.dbfilteredtypes.map(o => Object.values(o));
					outputElm.appendChild(Database.tablecreate(title, columns, values));
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
					let humanquery = document.createElement('div');
					humanquery.classList.add('w3-panel');
					humanquery.classList.add('w3-leftbar');
					humanquery.classList.add('w3-light-grey');
					humanquery.innerHTML = [
						`<h4>${Utils.c('active filter').toUpperCase()}</h4>`,
						`${sqltohuman()}`,
					].join('');
					outputElm.appendChild(humanquery);
				} else {
					let div = document.createElement('div');
					div.classList.add('w3-panel');
					div.classList.add('w3-pale-red');
					div.classList.add('w3-leftbar');
					div.classList.add('w3-border-red');
					div.classList.add('w3-padding-large');
					div.innerHTML = [
						Utils.c('no results').uf(),
					].join('');
					outputElm.appendChild(div);
					div = undefined;
				}
				Utils.filterbadge();
				if(O) Utils.overlay();			
			}

			function clearfilterdata() {
				let filtertablequery = [
					`BEGIN TRANSACTION;`,
					`DROP TABLE IF EXISTS flt;`,
					`CREATE TABLE flt AS `,
					`SELECT ID FROM pos;`,
					`COMMIT;`,
					`SELECT rkey, COUNT(ID) filtered FROM pos GROUP BY rkey ORDER BY rkey;`,
				].join('');
				Database.calculatequery(filtertablequery).then(results => {
					if(!results) {
						G.dbfilteredlength = 0;
						G.dbpagination.listing.total = 0;
						G.dbpagination.listing.current = 1;
						initfilter();
						throw new Error(Utils.c('no results'));
					}
					if(results.length) {
						for(let i = 0; i < results.length; i++) {
							if(i === 0) {
								G.dbfilteredlength = results[i].values.map(o => o[1]).flatten().sum();
								G.dbpagination.listing.total = 
									Math.ceil(G.dbfilteredlength / G.dbrecordsperpage);
								G.dbpagination.listing.current = 1;
								G.dbfilteredtypes = [];
								G.dbtypes = [];
								results[i].values.forEach(o => {
									G.dbfilteredtypes.push({
										rkey: o[0],
										filtered: o[1],
										total: o[1],
										percent: Math.round((o[1] / o[1]) * 100, 1),
									});
									G.dbtypes.push(o[0]);
								});
							}
						}
						initfilter();
					}
				});
			}
			
			// Listeners & Helpers
			function setlisteners() {
				document.querySelectorAll('.flt-value').forEach(s => {
					M.add({
						el: s,
						event: 'keyup',
						fn: validate
					});
					M.add({
						el: s,
						event: 'input',
						fn: validate
					});
					M.add({
						el: s,
						event: 'blur',
						fn: validate
					});
					M.add({
						el: s,
						event: 'focus',
						fn: validate
					});
				});
				document.querySelectorAll('.flt-relation, .flt-feature, .flt-operator').forEach(s => {
					M.add({
						el: s,
						event: 'change',
						fn: validate
					});
					M.add({
						el: s,
						event: 'blur',
						fn: validate
					});
					M.add({
						el: s,
						event: 'focus',
						fn: validate
					});
				});
				document.querySelectorAll('#flt-group-add').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: makegroup
					});
				});
				document.querySelectorAll('.flt-condition-add').forEach((s, i) => {
					M.add({
						el: s,
						event: 'click',
						fn: makecondition
					});
				});
				document.querySelectorAll('#flt-clear').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: callremoveallgroups
					});
				});
				document.querySelectorAll('.flt-group-remove').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: removegroup
					});
				});
				document.querySelectorAll('.flt-relatives').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: includerelatives
					});
				});
				document.querySelectorAll('.flt-condition-remove').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: removecondition
					});
				});
				document.querySelectorAll('.flt-condition-list').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: showValuesList
					});
				});
				document.querySelectorAll('#flt-calculate').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: callcalculate
					});
				});				
				document.querySelectorAll('#flt-save').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: callsave
					});
				});
				document.querySelectorAll('#flt-load').forEach(s => {
					M.add({
						el: s,
						event: 'click',
						fn: callload
					});
				});
				document.querySelectorAll('#flt-file').forEach(s => {
					M.add({
						el: s,
						event: 'change',
						fn: readfile
					});
				});
			};
			
			// Listeners helper functions
			function setvalueval(gid, cid, text) {
				Utils.byId('filter')
					.querySelector(`.flt-group[data-order="${gid}"] .flt-condition[data-condition="${cid}"]`)
					.querySelector('.flt-value').value = decodeURI(text);
				Utils.closemodal();
				enablebuttons();
			}
	
			function callcalculate(e) {
				if(!O) Utils.overlay();
				Utils.sleep().then(() => {
					calculate();
					executequery();
				});
			}

			function callremoveallgroups(e) {
				G.dbfilter = [];
				removeallgroups();
				let clear = confirm(Utils.c('Remove filter?'));
				if(clear) {
					clearfilterdata();
				}
			}
	
			function callsave(e) {
				Database.exportjson(G.dbfilter);
			}
			
			function includerelatives(e) {
				G.dbfilterincluderelatives = !G.dbfilterincluderelatives;
				e.target.checked = G.dbfilterincluderelatives;
			}
			
			function readfile() {
				let f = Utils.byId('flt-file').files[0];
				let r = new FileReader();
				r.onload = function () {
					function isvalid(str) {
						try {
							let jsn = JSON.parse(str);
							if(typeof jsn === 'object') {
								if(Array.isArray(jsn)) {
									if(Database.comparearrays(
										['id', 'link', 'relation', 'conditions'], 
										Object.keys(jsn[0])
									)) {
										return true;
									} else {
										return false;
									}
								} else {
									return false;
								}
							} else {
								return false;
							}
						} catch (e) {
							return false;
						}
					}
					if(isvalid(String(r.result))) {
						let json = JSON.parse(String(r.result));
						G.dbfilter = json;
						initfilter();
						calculate();
						r = undefined;
						Utils.byId('flt-file').value = '';
					} else {
						r = undefined;
						Utils.byId('flt-file').value = '';
						throw new Error(Utils.c('invalid file'));						
					}
				}
				r.readAsText(f);
			}
	
			function callload(e) {
				document.querySelector('input#flt-file').click();
			}
			
			// Table export & print
			function exporttable(event) {
				Database.exportcsv(event.target.parentNode.parentNode);
			}
			function printtable(event) {
				Utils.printitem(event.target.parentNode.parentNode.id);
			}
		}
	}
};

export default Filter;
