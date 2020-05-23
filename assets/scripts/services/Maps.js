import Utils from './Utils.js'
//import Database from './Database.js'
//import Queries from './Queries.js'
import * as Helpers from './MapHelpers.js'

import * as maptalks from '../../vendor/maptalks/maptalks.es.js'

const Maps = { 
	point: (nid, center, symbol, zoom = 14, title = 'untitled', text = '', mapbase = 'cartodbvoyager') => {
		console.log(nid, center)
		try {
			let map = new maptalks.Map(nid, {
				center: [center.lon, center.lat],
				zoom: zoom,
				baseLayer: new maptalks.TileLayer('base', Helpers.Providers(mapbase)),
				pitch: 45,
				dragPitch: true,
				dragRotate: true,
				dragRotatePitch: true,
				attribution: true,
				scaleControl: {
					position: 'top-right',
				}, 
				overviewControl: {
					maximize: false,
				}, 
				centerCross: true,
			});

			new maptalks.control.Toolbar({
				position: 'top-left',
				items: [
					{
						item: 'H',
						click: () => {
							point.closeInfoWindow();
							map.setCenterAndZoom([center.lon, center.lat], zoom);
						},
					}, 
					{
						item: 'F',
						click: () => {
							if(!map.isFullScreen()) {
								map.requestFullScreen();
							} else {
								map.cancelFullScreen();
								map.setCenterAndZoom([center.lon, center.lat], zoom);
							}
						},
					}, 
					{
						item: 'X',
						click: () => {
							let tmp = map.toDataURL({
								mimeType: 'image/png',
								save: true,
								fileName: G.appdata.shortname + '_' + (Math.random().toString(36).substring(7)) + '.png',
							});
							tmp = undefined;
						},
					}, 
					{
						item: '+',
						click: () => {
							if(map.getZoom() < map.getMaxZoom()) map.zoomIn();
						},
					}, 
					{
						item: '-',
						click: () => {
							if(map.getZoom() > map.getMinZoom()) map.zoomOut();
						},
					}, 
				],
			}).addTo(map);
			
			let point = new maptalks.Marker([center.lon, center.lat], {
				visible: true,
				editable: true,
				cursor: 'pointer',
				shadowBlur: 0,
				shadowColor: 'black',
				draggable: false,
				dragShadow: false,
				drawOnAxis: null,
				symbol: symbol,
			});
			
			new maptalks.VectorLayer('vector', point).addTo(map);
			point.setInfoWindow({
				title: title,
				content: `${text}<br><small>${Utils.c('drag + ctrl + left/right button = tilt and rotate')}</small>`,
			});

			point.openInfoWindow();
		} catch(err) {
			Utils.msg(nid, Utils.c('no map available'));
			throw new Error(Utils.c('no map available'));
		}
	},
	simple: (nid, data = [], zoom, lon, lat) => {
		if(!Utils.byId(`map_${nid}`)) return;
		G.lmaps.forEach(o => {
			if (o && o.remove) {
				o.off();
				o.remove();
			}
		});
		G.lmaps = [];
		
		G.lmaps[`map_${nid}`] = {};
		let map = G.lmaps[`map_${nid}`];
		let base = Helpers.Providers(G.lmapsdefaults.baselayer);
		
		map.map = new maptalks.Map(`map_${nid}`, {
			center: [
				lon || G.lmapsdefaults.centroids[Utils.l].lon, 
				lat || G.lmapsdefaults.centroids[Utils.l].lat, 
			],
			zoom: zoom || G.lmapsdefaults.zoom,
			baseLayer: new maptalks.TileLayer('base', base),
			dragPitch: true,
			dragRotate: true,
			dragRotatePitch: true,
			centerCross: true,
			scaleControl: {
				position: 'top-right',
			}, 
			overviewControl: {maximize: false}, 
			layers: [
				new maptalks.VectorLayer('places'),
				new maptalks.VectorLayer('overlay'),
				new maptalks.VectorLayer('data'),
			],
		});

		map.tools = {
			toolbar: null,
			distance: {
				active: false,
				item: null,
			},
			area: {
				active: false,
				item: null,
			},
		};
		
		map.tools.toolbar = new maptalks.control.Toolbar({
			position: 'top-left',
			items: [
				{
					item: 'F',
					click: () => {
						if(!map.map.isFullScreen()) {
							map.map.requestFullScreen();
						} else {
							map.map.cancelFullScreen();
						}
					},
				}, 
				{
					item: 'X',
					click: () => {
						let tmp = map.map.toDataURL({
							mimeType: 'image/png',
							save: true,
							fileName: G.appdata.shortname + '_' + (Math.random().toString(36).substring(7)) + '.png',
						});
						tmp = undefined;
					},
				}, 
				{
					item: 'D',
					click: () => {
						if(!map.tools.distance.active) {
							map.tools.distance.item = new maptalks.DistanceTool({
								language: Utils.l,
								imperial: Utils.l !== 'es',
							}).addTo(map.map);
							map.tools.distance.active = true;
							if(map.tools.area.active) {
								map.tools.area.item.remove();
								map.tools.toolbar.options.items[3].item = `D`;
							}
							map.tools.toolbar.options.items[2].item = `D &laquo;`;
							map.tools.toolbar.update();
						} else {
							map.tools.distance.item.remove();
							map.tools.distance.active = false;
							map.tools.toolbar.options.items[2].item = `D`;
							map.tools.toolbar.update();
						}
					},
				}, 
				{
					item: 'A',
					click: (e) => {
						if(!map.tools.area.active) {
							map.tools.area.item = new maptalks.AreaTool({
								language: Utils.l,
								imperial: Utils.l !== 'es',
							}).addTo(map.map);
							map.tools.area.active = true;
							if(map.tools.distance.active) {
								map.tools.distance.item.remove();
								map.tools.toolbar.options.items[2].item = `D`;
							}
							map.tools.toolbar.options.items[3].item = `A &laquo;`;
							map.tools.toolbar.update();
						} else {
							map.tools.area.item.remove();
							map.tools.area.active = false;
							map.tools.toolbar.options.items[3].item = `A`;
							map.tools.toolbar.update();
						}
					},
				},
				{
					item: '+',
					click: () => {
						map.map.zoomIn();
					},
				}, 
				{
					item: '-',
					click: () => {
						map.map.zoomOut();
					},
				}, 
			],
		}).addTo(map.map);

		data.forEach(o => {
			let point = new maptalks.Marker([o.lon, o.lat], {
				visible: true,
				editable: false,
				cursor: 'pointer',
				shadowBlur: 0,
				shadowColor: 'black',
				draggable: false,
				dragShadow: false,
				drawOnAxis: null,
				symbol: o.symbol,
			});
			
			let layer = map.map.getLayer('data');
			point.addTo(layer);
			point.setInfoWindow({
				title: o.title,
				content: o.text,
			});
		})

		Utils.msg(
			`address_${nid}`,
			'&hellip;'
		);
		Helpers.ReverseGeocode(nid, map.map.getCenter().y, map.map.getCenter().x);
		
		map.map.on('moveend', () => {
			Utils.msg(
				`address_${nid}`,
				'&hellip;'
			);
			let map = G.lmaps[`map_${nid}`];
			Helpers.ReverseGeocode(nid, map.map.getCenter().y, map.map.getCenter().x);
			map = undefined;
		});

		let tmp = Helpers.Providers();
		
		Utils.byId(`baselayers_${nid}`).innerHTML = tmp.map(o => [
			`<option value="${o.key}"`,
			`${o.key === G.lmapsdefaults.baselayer ? ' selected' : ''}>`,
			`${o.name}</option>`,
		].join('\n'));
		Utils.byId(`overlays_${nid}`).innerHTML = 
			`<option value="" selected>${Utils.c('overlay')}</option>` + 
			G.lmapsdefaults.overlays
				.sort((a, b) => a.name[Utils.l].localeCompare(b.name[Utils.l]))
				.map(o => `<option value="${o.file}">${o.name[Utils.l]}</option>`) ;

		map.baselayer = Helpers.Providers(G.lmapsdefaults.baselayer);
		map.overlay = null;
		
		M.add({
			el: Utils.byId(`baselayers_${nid}`),
			event: 'change',
			fn: changebaselayer
		});

		M.add({
			el: Utils.byId(`overlays_${nid}`),
			event: 'change',
			fn: changeoverlay
		});
		
		M.add({
			el: Utils.byId(`search_${nid}`),
			event: 'search',
			fn: search
		});

		function changebaselayer(e) {
			//let mid = e.target.id.replace('baselayers', 'map');
			let tmp = G.lmaps[`map_${nid}`].map;
			tmp.removeBaseLayer();
			G.lmaps[`map_${nid}`].baselayer = Helpers.Providers(e.target.value);
			let lay = {
				urlTemplate: G.lmaps[`map_${nid}`].baselayer.urlTemplate,
				attribution: G.lmaps[`map_${nid}`].baselayer.attribution,
				subdomains: G.lmaps[`map_${nid}`].baselayer.subdomains || [],
				maxZoom: G.lmaps[`map_${nid}`].baselayer.maxZoom || G.lmapsdefaults.maxzoom,
				minZoom: G.lmaps[`map_${nid}`].baselayer.minZoom || G.lmapsdefaults.minzoom,
				crossOrigin: 'anonymous',
			};
			tmp.setBaseLayer(new maptalks.TileLayer('base', lay));
			tmp = lay = undefined;
		}
		
		function changeoverlay(e) {
			//let mid = e.target.id.replace('overlays', 'map');
			let tmp = G.lmaps[`map_${nid}`].map;
			tmp.getLayer('overlay').clear();
			if(String(e.target.value).trim() === '') {
				return;
			}
			if(!O) Utils.overlay();
			Helpers.Overlays(e.target.value).then(geojson => {
				if(!geojson) return;
				let features = G.lmapsdefaults.overlays.find(o => o.file === e.target.value);
				let style = !features ? {} : {
					lineColor: features.color,
					lineWidth: features.weight,
					lineOpacity: features.opacity,
					polygonFill: features.fillColor,
					polygonOpacity: features.fillOpacity,
					lineDasharray: null,
				};
				let i18nname = features ? 
					G.lmapsdefaults.overlays.find(o => o.file === e.target.value).name[Utils.l] : 
					Utils.c('n/a').uf();
				geojson.features.filter(o => o).forEach(g => {
					if(g.geometry) {
						let geometry = maptalks.GeoJSON.toGeometry(g);
						geometry.setSymbol(style);
						geometry.addTo(tmp.getLayer('overlay'));
						geometry.setInfoWindow({
							title: i18nname,
							content: g.properties.popupcontent,
							autoPan: true,
							width: 300,
							minHeight: 120,
							custom: false,
							autoOpenOn: 'dblclick',  
							autoCloseOn: 'click',
						});
					}
				});

				tmp.fitExtent(tmp.getLayer('overlay').getExtent(), 0);
				if(O) Utils.overlay();
				features = style = i18nname = undefined;
			}).catch(error => {
				mid = tmp = undefined;
				throw new Error(Utils.c('internal error'));
			});
		}

		function search(e) {
			if(String(e.target.value).trim() === '') {
				searchremove();
				return;
			}
			let mid = e.target.id.replace('search', 'map');
			let url = [
				G.nominatimserver.base,
				G.nominatimserver.search.split('###').join(String(e.target.value).trim()),
			].join('');
			if(!O) Utils.overlay();
			Utils.fetchtextasync(url).then(txt => {
				try {
					let data = JSON.parse(txt);
					if(data.length) {
						document.querySelector('.modal-title').innerHTML = [
							`<span class="color-blue-400">`,
							`${G.appdata.name}. ${Utils.c('value list').uf()}`,
							`</span>`
						].join('');
						let outputElm = document.querySelector('.modal-body');
						outputElm.innerHTML = '';
						let p = document.createElement('p');
						let div = document.createElement('div');
						p.innerHTML = [
							`<strong style="font-size:larger">`,
							`${data.length.toLocaleString(Utils.l)} `,
							`${Utils.c('matches')}`,
							`</strong> `,
							`(${Utils.c('max')} 10).`,
						].join('');
						outputElm.appendChild(p);
						div.style.height = '40vh';
						div.style.overflow = 'hidden';
						div.style.overflowY = 'scroll';
						div.style.border = '1px #fff solid';
						div.style.padding = '10px 20px';
						div.innerHTML = '<ul>' + data.map(o => {
							return [
								`<li>`,
								`<a href="javascript:;" class="map-proposed-values" `,
								`data-mid="${mid}" `,
								`data-display="${o.display_name}" `,
								`data-bbox="${o.boundingbox.join(',')}" `,
								`data-lat="${o.lat}" `,
								`data-lon="${o.lon}">`,
								o.display_name,
								`</a>`,
								`</li>`,
							].join('');
						}).join('\n') + '</ul>';
						outputElm.appendChild(div);
						
						document.querySelector('.modal-mask').style.display = 'block';
						document.querySelector('.modal').style.display = 'block';
		
						div.querySelectorAll('a.map-proposed-values').forEach(s => {
							M.add({
								el: s,
								event: 'click',
								fn: goplace
							});
						});
		
						M.add({
							el: document.querySelector('.modal-close'),
							event: 'click',
							fn: Utils.closemodal
						});
						
						mid = url = data = outputElm = p = div = undefined;
						if(O) Utils.overlay();
					} else {
						if(O) Utils.overlay();
						throw new Error(Utils.c('no results'));
					}
					data = undefined;
				} catch(error) {
					if(O) Utils.overlay;
					throw new Error(Utils.c(error));
				}
			});
		}

		function goplace(e, place = {}) {
			let bbox = (place.bbox || e.target.dataset.bbox).split(',').map(o => parseFloat(o));
			let lat = parseFloat(place.lat || e.target.dataset.lat);
			let lon = parseFloat(place.lon || e.target.dataset.lon);
			let mid = place.mid || e.target.dataset.mid;
			//let display = place.display || e.target.dataset.display;
			let map = G.lmaps[mid].map;

			let polygon = new maptalks.Rectangle(
				new maptalks.Coordinate({x: bbox[2], y: bbox[1]}), 
				map.computeLength(
					new maptalks.Coordinate({x: bbox[2], y: bbox[1]}),
					new maptalks.Coordinate({x: bbox[3], y: bbox[1]}),
				),
				map.computeLength(
					new maptalks.Coordinate({x: bbox[2], y: bbox[0]}),
					new maptalks.Coordinate({x: bbox[3], y: bbox[0]}),
				),
				{
					symbol : {
						lineColor: '#f20',
						polygonFill: '#fff',
						polygonOpacity: 0.5,
						lineDasharray: [5, 5],
					}
				}
			);

			let symbol = {
				markerType : 'x',
				markerLineColor : '#f00',
				markerLineWidth : 4,
				markerWidth : 20,
				markerHeight : 20
			};
			let coordinate = {x: lon, y: lat};
			map.getLayer('places')
				.clear()
				.addGeometry(new maptalks.Marker(coordinate, {symbol: symbol}));
			map.getLayer('places').addGeometry(polygon);
			map.panTo(coordinate);
			map.fitExtent(polygon.getExtent(), 0);

			bbox = lat = lon = mid = map = symbol = polygon = coordinate = undefined;
		}

		function searchremove() {
			G.lmaps[`map_${nid}`].map.getLayer('places').clear();
			Utils.byId(`search_${nid}`).value = '';
		}

		base = tmp = undefined;
	},
};

export default Maps;
