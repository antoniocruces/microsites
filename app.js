'use strict';

import Config from './assets/scripts/services/Config.js'
import Cultures from './assets/scripts/services/Cultures.js'
import Errors from './assets/scripts/services/Errors.js'
import Utils from './assets/scripts/services/Utils.js'
import Monitor from './assets/scripts/services/Monitor.js'
import Prototypes from './assets/scripts/services/Prototypes.js'
import Router from './assets/scripts/services/Router.js'

window.C = Cultures;
window.G = Config;
window.B = Utils.browserinfo();
window.M = new Monitor;

window.O = false; // overlay
window.T = null; // timer

Prototypes();
Errors();

if(B.sName.toLowerCase() === 'safari' || B.sName.toLowerCase() === 'firefox') G.appuseworker = false;

if(!Utils.isavalidbrowser()) {
	alert(Utils.c('the browser is not valid to run Pathwise').uf());
	window.location.href = 'https://www.google.com/';
}

if(!Object.keys(G.currentgeoipdata).length) Utils.fetchipdata();

let style = localStorage.getItem('pwstyle') || null;
let typo = localStorage.getItem('pwtypo') || null;
let scale = localStorage.getItem('pwscale') || null;

if(style) Utils.stylerhandler({target: {dataset: {style: style}}});
if(typo) Utils.typerhandler({target: {dataset: {typo: typo}}});
if(scale) Utils.scalerhandler({target: {dataset: {scale: scale}}});

if(!style || !typo || !scale) Utils.resetstyleshandler();

style = typo = scale = undefined;

document.querySelectorAll('.modal-head').forEach(o => {
	o.innerHTML = G.appdata.name;
});
document.querySelectorAll('.modal-close span').forEach(o => {
	o.innerHTML = Utils.c('close').uf();
});
document.querySelectorAll('.modal-print span').forEach(o => {
	o.innerHTML = Utils.c('print').uf();
});
document.querySelectorAll('.modal-save span').forEach(o => {
	o.innerHTML = Utils.c('save').uf();
});
document.querySelectorAll('#global-search').forEach(o => {
	o.placeholder = `${Utils.c('search').uf()}...`;
});

let rpp = localStorage.getItem('pwrowsperpage') || null;
if(rpp) G.dbrecordsperpage = parseInt(rpp);
rpp = undefined;

// Listeners 
M.add({
	el: window,
	event: 'hashchange',
	fn: Router
});
M.add({
	el: window,
	event: 'load',
	fn: Router
});
M.add({
	el: window,
	event: 'beforeunload',
	fn: function (event) {
	let confirmationmsg = '';
		event.returnValue = confirmationmsg;
		return confirmationmsg;
	}
});
