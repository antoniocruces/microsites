import Utils from '../../services/Utils.js'

let Database;

let SQL = {
	render: async () => {
		try {
			let text = await Utils.gettext('sql');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		if(!O) Utils.overlay();
		Utils.sleep().then(() => {
			init();
		});
		Promise.all([
			import('../../services/Database.js'),
		]).then(function(modules) {
			Database = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				init();
			});
		});
		
		function init() {
			// Variables
			let outputElm = Utils.byId('database-listing-result');
			let editor = Utils.byId('commands-editor');
			
			Utils.byId('database-result').style.display = 'none';
			
			if(G.db) {
				Utils.byId('execute-trigger').disabled = false;
				Utils.byId('clear-trigger').disabled = false;
				Utils.byId('query-rowlimit').disabled = false;
				editor.disabled = false;
				Utils.byId('sql-warning').style.display = 'none';
				Utils.byId('sql-form').style.display = 'block';
				editor.readOnly = false;
			} else {
				Utils.byId('execute-trigger').disabled = true;
				Utils.byId('clear-trigger').disabled = true;
				Utils.byId('query-rowlimit').disabled = true;
				editor.disabled = true;
				Utils.byId('sql-warning').style.display = 'block';
				Utils.byId('sql-form').style.display = 'none';
				editor.readOnly = true;
			}
			
			if(G.dblastsql) editor.value = G.dblastsql;
			
			Utils.byId('query-rowlimit').value = G.dblimit;
			
			if(O) Utils.overlay();
			
			function verifysql(sql){
				if(sql.substr(-1) === ';') sql = sql.slice(0, -1);
				let array = sql.split(';');
				let isdirty = false;
				let findings = [];
				array.forEach(o => {
					let command = o.toLowerCase().split(' ');
					let blacklist = new Set(['limit', 'offset']);
					command.forEach(q => {
						if(blacklist.has(q)) {
							isdirty = true;
							findings.push(q.toUpperCase());
						}
					});
				});
				return findings;
			}
			
			function execute(commands) {
				outputElm.innerHTML = [
					`${Utils.c('fetching').uf()}...`,
					`<span class="float-right">${G.graphicloader}</span>`,
				].join('');

				Database.calculatequery(commands).then(results => {
					if(!results) {
						throw new Error(Utils.c('SQL syntax error'));
					}
					if(!results.length) results.push({columns: [], values: []});
					listresults(results);
					if(O) Utils.overlay();
				});
			}
			
			function listresults(results) {
				Utils.perftimer(true);
				outputElm.innerHTML = '';
				let rows = 0;
				if(results.length) {
					for (let i = 0; i < results.length; i++) {
						let title = `${Utils.c('query').uf()} #${i}`;
						outputElm.appendChild(Database.tablecreate(title, results[i].columns, results[i].values));
						rows += results[i].values.length;
						title = undefined;
					}
				} else {
					let div = document.createElement('div');
					let p = document.createElement('p');
					p.classList.add('alert');
					p.classList.add('alert-danger');
					p.innerHTML = Utils.c('no results').uf();
					div.appendChild(p);
					outputElm.appendChild(div);
					div = p = undefined;
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
				Utils.perftimer(false, [
					`${Utils.c('displaying').uf()}: `,
					`${rows.toLocaleString(Utils.l)} `,
					`${Utils.c('rows')}`
				].join(''));
				Utils.byId('database-result').style.display = 'block';
				rows = undefined;
			}
			
			// Listeners & Helpers
			function setlimits(event) {
				G.dblimit = event.target.value;
			}
			function executeeditor() {
				let val = editor.value;
				if(val.substr(-1) === ';') val = val.slice(0, -1);
				let ver = verifysql(val);
				if(ver.length) {
					throw new Error([
						Utils.c('forbidden tokens in SQL commands').uf(),
						`: ${ver.join(', ')}`,
					].join(''));
				}
				let commands = val.split(';').map(o => o.trim());
				let maxlength = Number(document.querySelector('#query-rowlimit').value);
				
				commands = commands.map(o => {
					let isselect = o.toUpperCase().substr(0, 7) === 'SELECT ';
					return `${o}${isselect ? ' LIMIT ' + maxlength : ''};`;
				});
				
				let finalcommandset = commands.join('');
				G.dblastsql = val;

				if(!O) Utils.overlay();
				Utils.sleep().then(() => {
					execute(finalcommandset);
				});
			}
			function cleareditor() {
				editor.value = '';
			}
	
			M.add({
				el: document.querySelector('#query-rowlimit'),
				event: 'click',
				fn: setlimits
			});
			M.add({
				el: document.querySelector('#execute-trigger'),
				event: 'click',
				fn: executeeditor
			});
			M.add({
				el: document.querySelector('#clear-trigger'),
				event: 'click',
				fn: cleareditor
			});
		}
	}
}

export default SQL;
