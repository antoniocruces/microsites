import Utils from '../../services/Utils.js'
import FeedParser from '../../services/FeedParser.js'

let Maps;
let Charts;

let Contact = {
	render: async () => {
		try {
			let text = await Utils.gettext('contact');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		Promise.all([
			import('../../services/Maps.js'),
			import('../../services/Charts.js'),
		]).then(function(modules) {
			Maps = modules.shift().default;
			Charts = modules.shift().default;
			if(!O) Utils.overlay();
			Utils.sleep().then(() => {
				init();
			});
		});

		function init() {
			Maps.simple(
				'contact', 
				[
					{
						lat: G.appdata.institution.coordinates.lat, 
						lon: G.appdata.institution.coordinates.lon,
						title: G.appdata.supporter,
						text: G.appdata.institution.name[Utils.l],
						symbol: {
							markerFile: './assets/images/logos/logo-uma-40x37.png',
							markerWidth: 40,
							markerHeight: 37,
						},
					},
				],
				16,
				G.appdata.institution.coordinates.lon,
				G.appdata.institution.coordinates.lat
			);

			['w3-panel', 'w3-pale-blue', 'w3-leftbar', 'w3-border-blue', 'w3-padding-large'].forEach(o => {
				Utils.byId('current-location').classList.add(o);
			});

			Utils.msg(
				'current-location',
				[
					[
						G.currentgeoipdata.ip || Utils.c('n/a'),
						G.currentgeoipdata.organization_name || Utils.c('n/a'),
						[
							G.currentgeoipdata.country || Utils.c('n/a'),
							G.currentgeoipdata.region || Utils.c('n/a'),
							G.currentgeoipdata.city || Utils.c('n/a'),
							[ 
								`${Utils.c('accuracy')} ${G.currentgeoipdata.accuracy || Utils.c('n/a')} `,
								`${G.currentgeoipdata.accuracyunits || 'km'}`,
							].join(' '),
						].join(', '),
						[
							`<a href="javascript:;" class="geoipinfo" data-type="globe">`,
							`${G.currentgeoipdata.latitude ? Utils.ddtodms(G.currentgeoipdata.latitude, false) : Utils.c('n/a')}, `,
							`${G.currentgeoipdata.longitude ? Utils.ddtodms(G.currentgeoipdata.longitude, true) : Utils.c('n/a')}`,
							`</a>`,
						].join(''),
					].join('; '),
				].join(' ')
			);

			Utils.fetchtextasync('./assets/rss').then(txt => {
				let feed = FeedParser(txt);
				let news = [];
				news.push(`<ul class="w3-ul">`);
				feed.forEach(o => {
					let ndate = new Date(o.date).toLocaleDateString(Utils.l, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
					news.push([
						`<li class="w3-bar" style="padding:0">`,
						`<h4 class="w3-text-indigo">`,
						`<a target="_blank" rel="noopener" href="${o.link}">`,
						`${o.title}`,
						`</a>`,
						`</h4>`,
						`<p>`,
						`<span class="w3-small w3-text-grey">`,
						`${ndate}. <i class="fas fa-tags"></i> ${o.categories.uf()}`,
						`</span><br>`,
						`${o.description}`,
						`</p>`,
						`</li>`,
					].join(''));
					ndate = undefined;
				});
				news.push(`</ul>`);
				if(Utils.byId('news-container')) {
					if(feed.length) {
						Utils.msg('news-container', news.join('\n'));
					} else {
						Utils.msg(
							'news-container',
							[
								`<span class="w3-text-red">${Utils.c('no results').uf()}</span>`,
							].join('')
						);
					}
				}

				feed = news = undefined;
			});

			document.querySelectorAll('.geoipinfo').forEach(elm => {
				M.add({
					el: elm,
					event: 'click',
					fn: Charts.geoipinfolistener
				});
		    });
			document.querySelectorAll('.send-message').forEach(elm => {
				M.add({
					el: elm,
					event: 'click',
					fn: sendmessage
				});
		    });

			function sendmessage(e) {
				if(String(Utils.byId('msg-name').value).trim() === '') {
					throw new Error(Utils.c('name') + ': ' + Utils.c('value cannot be blank'));
				}
				if(String(Utils.byId('msg-message').value).trim() === '') {
					throw new Error(Utils.c('message') + ': ' + Utils.c('value cannot be blank'));
				}
				window.open([
					`mailto:antonio.cruces@uma.es`,
					`?`,
					`cc=nro@uma.es&`,
					`subject=Microsites [`,
					encodeURI(Utils.byId('msg-name').value),
					`]: `,
					encodeURI(Utils.byId('msg-subject').value),
					`&body=`,
					encodeURI(Utils.byId('msg-message').value),
				].join(''));
			}
			
		    if(O) Utils.overlay();
		}
	}
}

export default Contact;
