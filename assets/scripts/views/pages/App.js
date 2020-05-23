import Utils from '../../services/Utils.js'

let Charts;

let App = {
	render: async () => {
		try {
			let text = await Utils.gettext('app');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		Promise.all([
			import('../../services/Charts.js'),
		]).then(function(modules) {
			Charts = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				init();
			});
		});

		function init() {
			let binfo = Utils.browserinfo();
			let bspeed = Utils.cpuspeed() || {
				ops: Infinity,
				duration: Infinity,
			};
			let bmemory = window.performance.memory || {
				jsHeapSizeLimit: Infinity, 
				totalJSHeapSize: Infinity,
				usedJSHeapSize: Infinity,
			};
	
			Utils.msg('features-browser', `${binfo.sName} ${binfo.sVersion} (${binfo.platform})`);
			Utils.msg('features-cookies', Utils.c(binfo.sCookieEnabled.toString()));
			Utils.msg('features-device', binfo.sDevice);
			Utils.msg('features-languages', `${binfo.sLanguages} (${binfo.sLanguage})`);
			Utils.msg('features-online',  Utils.c(binfo.sOnline.toString()));
			Utils.msg('features-referrer', binfo.sReferrer);
			Utils.msg('features-screenresolution', binfo.sScreenResolution);
			Utils.msg('features-timezone', binfo.sTimeZone);
	
			Utils.msg('features-ip', G.currentgeoipdata.ip || Utils.c('n/a'));
			Utils.msg('features-organization', G.currentgeoipdata.organization_name || Utils.c('n/a'));
			Utils.msg('features-location', [
				G.currentgeoipdata.country || Utils.c('n/a'),
				G.currentgeoipdata.region || Utils.c('n/a'),
				G.currentgeoipdata.city || Utils.c('n/a'),
				[
					`${Utils.c('accuracy')}: ${G.currentgeoipdata.accuracy || Utils.c('n/a')} `,
					`${G.currentgeoipdata.accuracyunits || 'km'}`,
				].join(' '),
			].join('; '));
			Utils.msg('features-position', [
				`<a href="javascript:;" class="geoipinfo" data-type="globe">`,
				`${G.currentgeoipdata.latitude ? Utils.ddtodms(G.currentgeoipdata.latitude, false) : Utils.c('n/a')}, `,
				`${G.currentgeoipdata.longitude ? Utils.ddtodms(G.currentgeoipdata.longitude, true) : Utils.c('n/a')}`,
				`</a>`,
			].join(''));
			
			document.querySelectorAll('.geoipinfo').forEach(elm => {
				M.add({
					el: elm,
					event: 'click',
					fn: Charts.geoipinfolistener
				});
		    });

			Utils.msg('features-calculatedspeed', [
				`${bspeed.duration.toLocaleString(Utils.l)} ms, `,
				`${bspeed.ops.toLocaleString(Utils.l)} OPS`,
			].join(''));
			Utils.msg('features-memory', [
				`T ${Utils.humansize(bmemory.totalJSHeapSize)} `,
				`U ${Utils.humansize(bmemory.usedJSHeapSize)} `,
				`M ${Utils.humansize(bmemory.jsHeapSizeLimit)}`
			].join(''));
	
			if(Utils.isavalidbrowser()) {
				if(Utils.byId('features-browser')) Utils.byId('features-browser').classList.remove('w3-text-red');
				if(Utils.byId('features-browser')) Utils.byId('features-browser').classList.add('w3-text-green');
			} else {
				if(Utils.byId('features-browser')) Utils.byId('features-browser').classList.remove('w3-text-green');
				if(Utils.byId('features-browser')) Utils.byId('features-browser').classList.add('w3-text-red');
				if(Utils.byId('unusability-warning')) Utils.msg('unusability-warning', `<strong>${Utils.c('not suitable browser').uf()}</strong>`);
				if(Utils.byId('unusability-warning')) Utils.byId('unusability-warning').classList.add('w3-text-red');
				if(Utils.byId('unusability-warning')) Utils.byId('unusability-warning').styles.display = 'block';
			}
			
			Utils.fetchtextasync(`./assets/netstatus/?u=${G.dataserver}d`).then(res => {
				if(!res) return;
				if(res.status < 200 && res.status > 299) throw new Error;
				if(Utils.byId('servers-data')) Utils.msg('servers-data', `${res} ms`);
				if(Number(res) < G.servermaxttl) {
					if(Utils.byId('servers-data')) Utils.byId('servers-data').classList.remove('w3-text-red');
					if(Utils.byId('servers-data')) Utils.byId('servers-data').classList.add('w3-text-green');
					if(Utils.byId('servers-data-url')) Utils.byId('servers-data-url').innerHTML = G.dataserver;
				}
				if(Number(res) < 0) {
					if(Utils.byId('servers-data')) Utils.byId('servers-data').classList.remove('w3-text-green');
					if(Utils.byId('servers-data')) Utils.byId('servers-data').classList.add('w3-text-red');
					if(Utils.byId('servers-data-url')) Utils.byId('servers-data-url').innerHTML = G.dataserver;
				}
			}).catch(error => {
				if(Utils.byId('servers-data')) Utils.msg('servers-data', Utils.c('N/A'));
				if(Utils.byId('servers-data')) Utils.byId('servers-data').classList.remove('w3-text-green');
				if(Utils.byId('servers-data')) Utils.byId('servers-data').classList.add('w3-text-red');
				if(Utils.byId('servers-data-url')) Utils.byId('servers-data-url').innerHTML = G.dataserver;
				throw new Error(Utils.c('unresponsive data server').uf());
			});
			Utils.fetchtextasync(`./assets/netstatus/?u=${G.appserver}`).then(res => {
				if(!res) return;
				if(res.status < 200 && res.status > 299) return;
				Utils.msg('servers-app', `${res} ms`);
				if(Number(res) < G.servermaxttl) {
					if(Utils.byId('servers-app')) Utils.byId('servers-app').classList.remove('w3-text-red');
					if(Utils.byId('servers-app')) Utils.byId('servers-app').classList.add('w3-text-green');
					if(Utils.byId('servers-app-url')) Utils.byId('servers-app-url').innerHTML = G.appserver;
				}
			}).catch(error => {
				if(Utils.byId('servers-app')) Utils.msg('servers-app', Utils.c('N/A'));
				if(Utils.byId('servers-app')) Utils.byId('servers-app').classList.remove('w3-text-green');
				if(Utils.byId('servers-app')) Utils.byId('servers-app').classList.add('w3-text-red');
				if(Utils.byId('servers-app-url')) Utils.byId('servers-app-url').innerHTML = G.appserver;
				throw new Error(Utils.c('unresponsive app server').uf());
			});
			Utils.fetchtextasync(`./assets/dbstatus`).then(text => {
			 	// NOTE: when SSL, change to https: // expofinder.uma.es/dbstatus.php
				if(!text) throw new Error(Utils.c('unresponsive data server').uf());
				if(!Utils.isvalidjson(text)) throw new Error(Utils.c('invalid response').uf());
				let res = JSON.parse(text);
				if(res.status < 200 && res.status > 299) return;

				let total = Object.values(res).reduce((a, b) => a + b, 0);
				G.rdbrecords = total;
				G.estimateddownloadtime = total * G.downloadratio;

				let values = [];
				Object.keys(res).forEach(o => {
					let color = Utils.getcolorfromcss(`.${G.primaryrecords[o].color}`, 'background-color');
					values.push({
						x: Utils.c(o), 
						value: res[o],
						fill: Utils.rgb2hex(color),
					});
					color = undefined;
				});
				
				Charts.pie(values, 'servers-database', Utils.c('status').uf());
				
				Utils.byId('servers-database').style.display = 'block';
				Utils.byId('connectivity-loader').style.display = 'none';
				if(O) Utils.overlay();
				
				total = values = undefined;
			}).catch(error => {
				if(Utils.byId('servers-database')) Utils.byId('servers-database').style.display = 'none';
				if(Utils.byId('connectivity-loader')) Utils.byId('connectivity-loader').style.display = 'none';
				if(Utils.byId('servers-database-warning')) Utils.byId('servers-database-warning').style.display = 'block';

				if(O) Utils.overlay();
				//throw new Error(Utils.c(error.message));
			});
			
			binfo = bspeed = bmemory = undefined;
		}
	}
}

export default App;
