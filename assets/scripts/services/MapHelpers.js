import Utils from './Utils.js'
import Database from './Database.js'

const providers = { 
	osmstandard: {
		name: 'OSM Standard',
		urlTemplate: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
		attribution: '&copy; <a href="http://www.osm.org" target="_blank">OpenStreetMap</a> contributors'
	},
	osmbike: {
		name: 'OSM Bike',
		urlTemplate: 'https://c.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
		attribution: '&copy; <a href="http://www.osm.org" target="_blank">OpenStreetMap</a> contributors'
	},
	osmtransport: {
		name: 'OSM Transport',
		urlTemplate: 'https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
		attribution: '&copy; <a href="http://www.osm.org" target="_blank">OpenStreetMap</a> contributors'
	},
	osmthumanitarian: {
		name: 'OSM Humanitarian',
		urlTemplate: 'https://tile-b.openstreetmap.fr/hot/{z}/{x}/{y}.png',
		attribution: '&copy; <a href="http://www.osm.org" target="_blank">OpenStreetMap</a> contributors'
	},
	cartodbpositron: {
		name: 'CartoDB Positron',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbdarkmatter: {
		name: 'CartoDB Dark Matter',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbdarkmatternolalels: {
		name: 'CartoDB Dark Matter No Labels',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbdarkmatteronlylalels: {
		name: 'CartoDB Dark Matter Only Labels',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbvoyager: {
		name: 'CartoDB Voyager',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbvoyagernolabels: {
		name: 'CartoDB Voyager No Labels',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbvoyageronlylabels: {
		name: 'CartoDB Voyager Only Labels',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	cartodbvoyagerlabelsunder: {
		name: 'CartoDB Voyager Labels Under',
		urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
		attribution: [
			`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors `,
			`&copy; <a href="https://carto.com/attributions">CARTO</a>`,
		].join(''),
		subdomains: ['a', 'b', 'c', 'd'],
		maxZoom: 19,
	},
	esriworldtopomap: {
		name: 'Esri WorldTopoMap',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, `,
			`NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), `,
			`and the GIS User Community`,
		].join(''),
	},
	esriworldimagery: {
		name: 'Esri WorldImagery',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, `,
			`IGN, IGP, UPR-EGP, and the GIS User Community`,
		].join(''),
	},
	esriworldterrain: {
		name: 'Esri WorldTerrain',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS`,
		].join(''),
		maxZoom: 13,
	},
	esriworldshadedrelief: {
		name: 'Esri WorldShadedRelief',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Source: Esri`,
		].join(''),
		maxZoom: 13,
	},
	esriworldphysical: {
		name: 'Esri WorldPhysical',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Source: US National Park Service`,
		].join(''),
		maxZoom: 8,
	},
	esrioceanbasemap: {
		name: 'Esri OceanBasemap',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri`,
		].join(''),
		maxZoom: 13,
	},
	esriworlgraycanvas: {
		name: 'Esri WorldGrayCanvas',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ`,
		].join(''),
	},
	esrinatgeoworldmap: {
		name: 'Esri NatGeoWorldMap',
		urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		attribution: [
			`Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, `,
			`ESA, METI, NRCAN, GEBCO, NOAA, iPC`,
		].join(''),
		maxZoom: 16,
	},
};

const ReverseGeocode = (nid, y, x) => {
	let query = Utils.paramstring({
		lat: y.toFixed(6),
		lon: x.toFixed(6),
		osm_type: 'N',
		format: 'json',
		zoom: 18,
		limit: 1,
		'accept-language': Utils.l,
		addressdetails: 1,
	});
	Utils.fetchtextasync(G.nominatimserver.address + query).then(res => {
		res = JSON.parse(res);
		let displayname = res.display_name || `${Utils.c('no address available')}`;
		let coordinates = [
			Utils.ddtodms(y, false),
			', ',
			Utils.ddtodms(x, true)
		].join('');
		Utils.msg(
			`address_${nid}`,
			displayname + ' ' + coordinates
		);
		query = displayname = coordinates = undefined;
	}).catch(err => {
		let coordinates = [
			Utils.ddtodms(y, false),
			', ',
			Utils.ddtodms(x, true)
		].join('');
		Utils.msg(
			`address_${nid}`,
			coordinates
		);
		err = query = coordinates = undefined;
	});
};

const Overlays = item => {
	return new Promise((resolve, reject) => {
		if(!item) reject(Utils.c('invalid geoJSON file'));
		Utils.fetchjsonasync(`./assets/data/geojson/${item}.json`).then(json => {
			if(json) {
				let obj = G.lmapsdefaults.overlays.find(o => o.file === item);
				if(obj) {
					json.features = json.features.map(o => {
						let fields = obj.field;
						let out = [];
						fields.forEach((f, i) => {
							out.push([
								`<tr>`,
								`<td class="no-padding align-left">`,
								`${Utils.c(obj.fieldname[i]).uf()}`,
								`</td>`,
								`<td class="no-padding align-right">`,
								`${Utils.isNumeric(o.properties[f]) ? Number(o.properties[f]).toLocaleString(Utils.l) : o.properties[f]}`,
								`</td>`,
								`</tr>`,
							].join('\n'));
						})
						o.properties.popupcontent = [
							`<table style="margin:0 0 15px 0">`,
							`<thead>`,
							`<tr>`,
							`<th class="no-padding align-left">${Utils.c('field')}</th>`,
							`<th class="no-padding align-right">${Utils.c('value')}</th>`,
							`</tr>`,
							`</thead>`,
							`<tbody>${out.join('\n')}</tbody>`,
							`</table>`,
						].join('');
						fields = out = undefined;
						return o;
					});
				}
				obj = undefined;
				resolve(json);
			} else {
				reject(Utils.c('invalid geoJSON object'));
			}
		});
	});
};

const Providers = (layer = null) => layer ? providers[layer] : Object.keys(providers)
	.map(o => ({key: o, name: providers[o].name}))
	.sort((a, b) => a.name.localeCompare(b.name));

/*
const Turf = () => {
	return new Promise((resolve, reject) => {
		let script = document.createElement('script');
		script.type = 'application/javascript';
		script.src = file;
		script.onload = () => {
			let xturf = Object.assign({}, turf);
			turf = undefined;
			resolve(xturf);
		};
		document.head.appendChild(script);
	});
}
Utils.loadscript('https://npmcdn.com/@turf/turf/turf.min.js');
*/

export { Providers, Overlays, ReverseGeocode };
