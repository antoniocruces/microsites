Object.defineProperties(HTMLElement.prototype, {
	print: {
		configurable: true,
		enumerable: true,
		writable: true,
		value: function(query) {
			/*
			query = document.body.dataset ? 
				(document.body.dataset || {currentpage: 'untitled'}).currentpage : 
				'untitled';
			*/
			query = (document.body.dataset || {currentpage: 'untitled'}).currentpage;
			if(this.dataset && this.dataset.title) query = this.dataset.title;

			let xframe = document.createElement('IFRAME');
			let ad = appdata;
			let appdatatxt = [
				`${ad.name} v${ad.version}.${ad.subversion}.${ad.release}`,
				`${ad.date}. ${ad.license}. ${ad.author}. ${ad.authoremail}. `,
				`${ad.supporter}. ${ad.supporteremail}`,
			].join('');
			let curdate = new Date().toLocaleDateString(lang, {dateStyle: 'long', timeStyle: 'long'});
			let copyright = [
				`&copy; 2020. All rights reserved / Derechos reservados`,
				`Printed / Impreso: ${curdate}`,
			].join('. ');
			let txt = [
				`<h4 class="w3-text-theme">Generic citation / Cita genérica</h4>`,
				`<p>`,
				`Microsite SQLab. `,
				`(Microsite Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
				`Available at / Disponible en ${window.location.href}.`, 
				`</p>`,
			].join('');
			let tail = [
				`<p>${appdatatxt}</p>`,
				`<p>${copyright}</p>`,
				txt,
				`<p>`,
				`<img style="-webkit-user-select:none;margin:auto;" `,
				`src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURI(window.location.href)}">`,
				`</p>`,
			].join('');

			xframe.domain = document.domain;
			xframe.style.position = 'absolute';
			xframe.style.top = '-10000px';
			document.body.appendChild(xframe);
			
			xframe.contentDocument.write([
				`<h3 class="w3-text-grey">${ad.name} v${ad.version}.${ad.subversion}.${ad.release}</h3>`,
				`<h1>SQLab</h1><hr>`,
				this.outerHTML,
				`<hr>`,
				tail,
			].join('\n'));

			for(let i = 0; i < document.styleSheets.length; i++) {
				let ssheet = document.styleSheets[i];
				if(ssheet.href) {
					let ifstyle = xframe.contentDocument.createElement('link');
					ifstyle.rel = 'stylesheet';
					ifstyle.href = ssheet.href;			
					xframe.contentWindow.document.head.appendChild(ifstyle);
					ifstyle = undefined;
				}
				ssheet = undefined;
			}
			
			if(!O) debounce(overlay(), 50);
			setTimeout(function() {
				xframe.focus();
				xframe.contentWindow.print();
				xframe.parentNode.removeChild(xframe);
				ad = appdatatxt = curdate = copyright = tail = txt = undefined;
				if(O) debounce(overlay(), 50);
			}, 3000);
			window.focus();
		}
	}
});

window.O = false;

let appdata = {
	name: 'Microsites SQLab',
	filename: 'pathwise',
	shortname: 'mssqlab',
	version: 1,
	subversion: 0,
	release: 0,
	date: '2020-01-01',
	license: 'CC BY-SA 4.0',
	licenseurl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
	author: 'Antonio Cruces Rodríguez',
	authoremail: 'antonio.cruces@uma.es',
	supporter: 'iArtHis Research Group',
	supporteremail: 'nro@uma.es',
};

let fetchtextasync = async uri => {
	let response = await fetch(uri);
	return await response.text();
};

let escapeHTML = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let exportcsv = (table, separator = '\t') => {
	let csv_string = Array.from(table.rows).slice()
		.map(row =>
			Array.from(row.cells).map(cell => {
				if(cell.innerText.replace(/ /g, '').match(/[\s,"]/)) {
					return '"' + cell.innerText.replace(/"/g, '""') + '"';
				}
				return cell.innerText;
			}).join(separator)
		)
		.filter(o => o.trim() !== '').join('\n');

	let filename = (Math.random().toString(36).substring(7)) + '.csv';
	let link = document.createElement('a');
	link.style.display = 'none';
	link.setAttribute('target', '_blank');
	link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
	link.setAttribute('download', filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	csv_string = filename = link = undefined;
};

let lang = localStorage.getItem('pwlang') || null;
if(!lang) {
	lang = window.navigator.language.split('-')[0].toLowerCase() === 'es' ? 'es' : 'en';
	localStorage.setItem('pwlang', lang);
	lang = localStorage.getItem('pwlang');
}
let execBtn = document.getElementById('execute');
let outputElm = document.getElementById('output');
let errorElm = document.getElementById('error');
let commandsElm = document.getElementById('commands');
let dbFileElm = document.getElementById('dbfile');
let savedbElm = document.getElementById('savedb');
let perfElm = document.getElementById('perf');
let limit = 1000;

let langstrings = {
	en: {
		title: '<span class="w3-text-light-blue">SQLab</span>. <small>Online SQL interpreter</small>',
		intro: [
			`Load a Microsites PW database (SQLite, .db) and type the commands you want. `,
			`Separate different queries with <mark>&nbsp;;&nbsp;</mark>. `,
			`To get some help on SQL commands, `,
			`<a href="https://www.sqlitetutorial.net/" target="_blank" rel="nofollow">click here</a>.`,
		].join(''),
		cheatsheet: 'CTRL + &crarr; = execute SQL commands; CTRL + S = save database; CTRL + P = print result.',
		load: 'load',
		execute: 'execute',
		save: 'save',
		download: 'download',
		results: 'Results',
		executing: 'Executing SQL',
		displaying: 'Displaying results',
		fetching: 'Fetching results...',
		loading: 'Loading database from file',
		exporting: 'Exporting the database',
		noresults: 'no results',
		working: 'working...',
		limit: 'max rows',
		query: 'query',
		rows: 'rows',
		help: 'Help',
		workshop: 'Workshop',
		print: 'print',
		export: 'export',
		hscroll: 'use horizontal scrolling to display the whole table, if necessary',
	},
	es: {
		title: '<span class="w3-text-light-blue">SQLab</span>. <small>Intérprete SQL</small>',		
		intro: [
			`Cargue una base de datos Microsites PW (SQLite, .db) y escriba los comandos que desee. `,
			`Separe cada consulta con <mark>&nbsp;;&nbsp;</mark>. `,
			`Si desea ayuda sobre los comandos SQL, `,
			`<a href="https://www.sqlitetutorial.net/" target="_blank" rel="nofollow">pulse aquí</a>.`,
		].join(''),
		cheatsheet: 'CTRL + &crarr; = ejecutar comandos SQL; CTRL + S = guardar base de datos; CTRL + P = imprimir resultado.',
		load: 'cargar',
		execute: 'ejecutar',
		save: 'guardar',
		download: 'descargar',
		results: 'Resultados',
		executing: 'Ejecución SQL',
		displaying: 'Mostrar resultados',
		fetching: 'Obtener resultados...',
		loading: 'Cargar base de datos desde archivo',
		exporting: 'Exportar la base de datos',
		noresults: 'sin resultados',
		working: 'trabajando...',
		limit: 'máximo de filas',
		query: 'consulta',
		rows: 'filas',
		help: 'Ayuda',
		workshop: 'Taller',
		print: 'imprimir',
		export: 'exportar',
		hscroll: 'si es necesario, use el desplazamiento horizontal para mostrar la tabla completa',
	}
};

let overlay = () => {
	let status = window.O;
	if(!status) {
		document.querySelector('.siteoverlay').style.display = 'block';
		document.querySelectorAll('input').forEach(o => o.style.pointerEvents = 'none');
		document.querySelectorAll('a').forEach(o => o.classList.add('disabled'));
		document.querySelectorAll('button').forEach(o => o.disabled = true);
		window.O = true;
	} else {
		document.querySelector('.siteoverlay').style.display = 'none';
		document.querySelectorAll('input').forEach(o => o.style.pointerEvents = 'auto');
		document.querySelectorAll('a').forEach(o => o.classList.remove('disabled'));
		document.querySelectorAll('button').forEach(o => o.disabled = false);
		window.O = false;
	}
	status = undefined;
};

function debounce(func, wait, immediate) {
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
};

function print(text) {
	outputElm.innerHTML = text.replace(/\n/g, '<br>');
}

function error(e) {
	console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
	outputElm.textContent = '';
}

function noerror() {
	errorElm.style.height = '0';
}

function execute(commands) {
	debounce(overlay(), 50);
	tic();
	worker.onmessage = function (event) {
		let results = event.data.results;
		toc(langstrings[lang].executing);
		if (!results) {
			error({message: event.data.error});
			let tit = document.createElement('h4');
			tit.classList.add('w3-text-red');
			tit.innerHTML = langstrings[lang].noresults;
			outputElm.appendChild(tit);
			document.getElementById('results').style.display = 'none';
			debounce(overlay(), 50);
			return;
		}

		tic();
		outputElm.innerHTML = '';
		if(results.length) {
			for (let i = 0; i < results.length; i++) {
				outputElm.appendChild(tableCreate(results[i].columns, results[i].values, i));
			}
			document.getElementById('results').style.display = 'block';
		} else {
			let tit = document.createElement('h4');
			tit.classList.add('w3-text-red');
			tit.innerHTML = langstrings[lang].noresults;
			outputElm.appendChild(tit);
			document.getElementById('results').style.display = 'none';
		}
		toc(langstrings[lang].displaying);
		debounce(overlay(), 50);
	}
	worker.postMessage({ action: 'exec', sql: commands });
	outputElm.innerHTML = langstrings[lang].fetching;
}

// Create an HTML table
let tableCreate = function() {
	function valconcat(vals, tagName) {
		if (vals.length === 0) return '';
		let open = '<' + tagName + '>';
		let close = '</' + tagName + '>';
		return `${open}${vals.join(close + open)}${close}`;
	}
	return function (columns, values, nid) {
		if(!values.length) return langstrings[lang].noresults;
		
		let wrp = document.createElement('div')
		let tit = document.createElement('h4');
		let par = document.createElement('p');
		wrp.id = 'tablewrap' + nid;
		par.classList.add('w3-small', 'w3-no-print', 'lang');
		par.innerHTML = langstrings[lang].hscroll;
		tit.classList.add('w3-text-teal');
		tit.innerHTML = [
			`${langstrings[lang].query} #${nid} `,
			`[${values.length.toLocaleString()} ${langstrings[lang].rows}]`,
			`<span class="w3-margin-left w3-no-print">`,
			`<a href="javascript:exportcsv(document.getElementById('datatable${nid}'));">`,
			langstrings[lang].export,
			`</a>`,
			`<a class="w3-margin-left" href="javascript:document.getElementById('tablewrap${nid}').print();">`,
			langstrings[lang].print,
			`</a>`,
			`</span>`,
		].join('');
		let tbl = document.createElement('table');
		tbl.id = 'datatable' + nid;
		tbl.classList.add('w3-table');
		tbl.classList.add('w3-bordered');
		tbl.classList.add('w3-striped');
		tbl.classList.add('margin-bottom-extra');
		let html = '<thead>' + valconcat(columns, 'th') + '</thead>';
		let rows = values.map(function (v) { return valconcat(v.map(x => escapeHTML(x)), 'td'); });
		html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
		tbl.innerHTML = html;
		wrp.appendChild(tit);
		wrp.appendChild(par);
		wrp.appendChild(tbl);
		tit = par = tbl = undefined;
		return wrp;
	}
}();

function execEditorContents() {
	noerror();
	let commands = editor.getValue().split(';').map(o => o.trim()).filter(o => o !== '');
	let out = [];
	commands.forEach(o => {
		if(o.substr(0, 7).toUpperCase() === 'SELECT ') {
			if(!o.toUpperCase().includes(' LIMIT')) {
				out.push(`${o} LIMIT ${limit}`);
			} else {
				out.push(o);
			}
		} else {
			out.push(o);
		}
	})
	execute(out.join(';'));
}
execBtn.addEventListener('click', execEditorContents, true);

let tictime;
if(!window.performance || !performance.now) { window.performance = { now: Date.now } }
function tic() { tictime = performance.now() }
function toc(msg) {
	let dt = performance.now() - tictime;
	console.log(`${(msg || 'toc')}: ${dt}ms`);
	perfElm.textContent = `${(msg || 'toc')}: ${dt.toLocaleString()}ms`;
}

function printresult() {
	document.getElementById('output').print();	
}

let editor = CodeMirror.fromTextArea(commandsElm, {
	mode: 'text/x-mysql',
	viewportMargin: Infinity,
	indentWithTabs: true,
	smartIndent: true,
	lineNumbers: true,
	matchBrackets: true,
	autofocus: true,
	extraKeys: {
		'Ctrl-Enter': execEditorContents,
		'Ctrl-S': savedb,
		'Ctrl-P': printresult,
	}
});

dbFileElm.onchange = function () {
	let f = dbFileElm.files[0];
	let r = new FileReader();
	r.onload = function () {
		worker.onmessage = function () {
			toc(langstrings[lang].loading);
			editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		tic();
		try {
			worker.postMessage({ action: 'open', buffer: r.result }, [r.result]);
		}
		catch (exception) {
			worker.postMessage({ action: 'open', buffer: r.result });
		}
	}
	r.readAsArrayBuffer(f);
}

function savedb() {
	worker.onmessage = function (event) {
		toc(langstrings[lang].exporting);
		let arraybuff = event.data.buffer;
		let blob = new Blob([arraybuff]);
		let a = document.createElement('a');
		document.body.appendChild(a);
		a.href = window.URL.createObjectURL(blob);
		a.download = `${appdata.shortname}_exp_${Math.random().toString(36).substring(7)}.db`;
		a.onclick = function () {
			setTimeout(function () {
				window.URL.revokeObjectURL(a.href);
			}, 1500);
		};
		a.click();
	};
	tic();
	worker.postMessage({ action: 'export' });
}
savedbElm.addEventListener('click', savedb, true);

function tablistener(e) {
	if(document.querySelectorAll('.tablink').length && (e.target.dataset || {target: null}).target) {
		document.querySelectorAll('.tablink').forEach(o => {
			o.classList.remove('w3-gray');
		});
		document.querySelectorAll('.tab').forEach(o => {
			o.style.display = 'none';
		});
		e.target.classList.add('w3-gray');
		document.getElementById(e.target.dataset.target).style.display = 'block';
	}
}
document.querySelectorAll('.tablink').forEach(elm => {
	elm.addEventListener('click', tablistener, true);
});

async function readhelp() {
	document.getElementById('sqlab-help').innerHTML = await fetchtextasync(`./assets/docs/hlp-${lang}.html`);
}

function init() {
	debounce(overlay(), 50);
	
	document.getElementById('language').innerHTML = lang.toUpperCase();
	document.querySelectorAll('.lang').forEach(o => {
		o.innerHTML = langstrings[lang][o.dataset.text];
	});
	document.querySelectorAll('.limit').forEach(o => {
		o.addEventListener('click', function(e) {
			limit = parseInt(e.target.value, 10);
		}, true);
	});
		
	document.getElementById('printcururl').innerHTML = window.location.href;
	document.getElementById('printqr').src = [
		`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${window.location.href}`,
	].join('');
	document.getElementById('printcurdate').innerHTML = new Date().toLocaleDateString(lang, {dateStyle: 'long', timeStyle: 'long'});
	document.getElementById('printappdata').innerHTML = [
		`${appdata.name} v${appdata.version}.${appdata.subversion}.${appdata.release}`,
		`${appdata.date}. ${appdata.license}. ${appdata.author}. ${appdata.authoremail}. `,
		`${appdata.supporter}. ${appdata.supporteremail}`,
	].join('');
	
	readhelp().then(res => w3CodeColor());

	debounce(overlay(), 50);
}


// Init

let worker = new Worker('../assets/vendor/kripken/worker.sql-wasm.js');
worker.onerror = error;
worker.postMessage({ action: 'open' });

init();
