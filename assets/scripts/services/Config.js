const Config = {
	apppath: 'microsites',
	appdata: {
		name: 'Microsites',
		filename: 'pathwise',
		shortname: 'ms',
		version: 1,
		subversion: 0,
		release: 0,
		date: '2020-01-01',
		license: 'CC BY-SA 4.0',
		licenseurl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
		author: 'Antonio Cruces Rodríguez',
		authoremail: 'antonio.cruces@uma.es',
		authorurl: 'https://hdplus.es',
		authorsitename: 'HD+',
		supporter: 'iArtHis Research Group',
		supporteremail: 'nro@uma.es',
		supporterurl: 'https://iarthislab.es/',
		supportersitename: 'iArtHis',
		institution: {
			name: {
				es: 'Departamento de Historia del Arte, UMA',
				en: 'Art History Department, UMA',
			},
			coordinates: {
				lat: 36.716718,
				lon: -4.471054,
			}
		},
		activestyles: {
			style: 'blue-grey',
			typo: 'sans-serif',	
			scale: 'blues',
		},
	},
	appw3stylepath: './assets/vendor/w3/',
	appstylepath: './assets/styles/',
	appcollections: {
		g: {
			dbprkey: 'entidad',
			dbtaxrkey: 'tipología de entidad',
			dbtaxvalue: '"Galería de arte", "Colectivos de artistas"',
			sql: [
				`p.rkey = "entidad" `,
				`AND `,
				`p.ID IN (SELECT ID FROM tax WHERE rkey IN("tipología de entidad") `,
				`AND value IN ("Galería de arte", "Colectivos de artistas")) `,
				`AND `,
				`p.ID IN (SELECT ID FROM met WHERE rkey IN("lugar de la sede") `,
				`AND (value LIKE "%; España" OR value LIKE "%;España"))`,
			].join(''),
			name: 'Galleries',
			description: {
				en: 'Art Galleries',
				es: 'Galerías de arte',
			},
			indexes: ['town', 'region', 'country', 'value'],
		},
		c: {
			dbprkey: 'catálogo',
			dbtaxrkey: null,
			dbtaxvalue: null,
			sql: [
				`p.rkey = "catálogo" `,
			].join(''),
			name: 'ArtCatalogs',
			description: {
				en: 'Art Catalogs',
				es: 'Catálogos de arte',
			},
			indexes: ['value'],
		},
		x: {
			dbprkey: 'exposición',
			dbtaxrkey: null,
			dbtaxvalue: null,
			sql: [
				`p.rkey = "exposición" `,
				`AND `,
				`p.ID IN(`,
				`SELECT ID FROM age WHERE starty BETWEEN 2008 AND 2018) `,
				`AND `,
				`p.ID IN(`,
				`SELECT ID FROM pla WHERE region LIKE "andalucía" AND rtype = "lugar donde se celebra") `,
			].join(''),
			name: 'Andalex',
			description: {
				en: 'Andalex',
				es: 'Exposiciones en Andalucía 2008-2018',
			},
			indexes: ['town', 'region', 'country', 'value'],
		},
		p: {
			sql: [
				`p.rkey LIKE "%" `,
			].join(''),
			name: 'PW Database',
			description: {
				en: 'PW Database',
				es: 'Base de datos completa Pathwise/Expofinder',
			},
			indexes: ['value'],
		},
	},
	appactiveindex: 'A',
	appactivecollection: 'c',
	appactivesemantic: {item: 0, value: ''},
	appuseworker: true,
	appmenus: [
		{menu: 'home', submenu: 'home'},
		{menu: 'home', submenu: 'pathwise'},
		{menu: 'home', submenu: 'howtocite'},
		{menu: 'home', submenu: 'legal'},
		{menu: 'home', submenu: 'licenses'},
		{menu: 'home', submenu: 'development'},
		{menu: 'home', submenu: 'contact'},
		{menu: 'help', submenu: 'faq'},
		{menu: 'documents', submenu: 'purpose'},
		{menu: 'documents', submenu: 'projects'},
		{menu: 'documents', submenu: 'institutions'},
		{menu: 'documents', submenu: 'resources'},
		{menu: 'documents', submenu: 'ontology'},
		{menu: 'documents', submenu: 'manual'},
		{menu: 'data', submenu: 'load'},
		{menu: 'data', submenu: 'indexed'},
		{menu: 'data', submenu: 'semantic'},
		{menu: 'data', submenu: 'listing'},
		{menu: 'data', submenu: 'search'},
		{menu: 'data', submenu: 'sql'},
		{menu: 'options', submenu: 'app'},
		{menu: 'options', submenu: 'legends'},
		{menu: 'help', submenu: 'faq'},
	],

	appscales: {
		/* By https://colorbrewer2.org/#type=sequential&scheme=BuGn&n=9 */
		colors: {
			greens: ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b'],
			blues: ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'],
			purples: ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'],
			reds: ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'],
		},
	},
	
	debugmode: false,
	
	downloadratio: 0.8,
	rdbrecords: 0,
	estimateddownloadtime: 0,
	isdownloading: false,
	
	db: null,
	dbloaded: false,
	dbfile: {name: null, size: null, type: null, bin: null, time: null},
	dblastsql: null,
	dbrecordsperpage: 10,
	dbposlength: null,
	dbpagination: {
		listing: {total: null, current: null},
	},
	dblimit: 1000,
	dbtypes: [],
	
	dbfilter: [],
	dbfilterrelations: [],
	dbfilterrelationslist: [],
	dbfilterfeatures: [],
	dbfilteredlength: null,
	dbfilteredtypes: [],
	dbfilterincluderelatives: false,
		
	dblistingfeatures: {
		gender: false,
		date: false,
		place: false,
		taxonomies: false,
	},
    
	servermaxttl: 120,
	
	dataserver: 'expofinder.uma.es',
	appserver: 'hdplus.es',
	nominatimserver: {
		base: 'https://nominatim.openstreetmap.org/',
		search: 'search?q=###&format=json&addressdetails=1&limit=10',
		address: 'https://nominatim.openstreetmap.org/reverse',
	},
	geoipserver: 'https://get.geojs.io/v1/ip/geo.json',
	currentgeoipdata: {},
	
	agerkeys: {
		'_cp__boo_publishing_date': null,
		'_cp__exh_start_date': '_cp__exh_end_date',
		'_cp__exh_exhibition_start_date': '_cp__exh_exhibition_end_date',
		'_cp__peo_birth_date': '_cp__peo_death_date',
		'_cp__art_artwork_start_date': '_cp__art_artwork_end_date',
	},

	relationtypes: {
		metadata: {
			symbol: 'diamond',
		},
		inbound: {
			symbol: 'triangle-left',
		},
		outbound: {
			symbol: 'triangle-right',
		},
	},
	
	frequences: {
		fields: [
			'rtitle', 'ridtype', 'rkey', 
			'town', 'region', 'country', 
			'gender', 'decade', 'year', 
			'month', 'day', 'years', 
			'months', 'days',
		],
		whitelist: [
			'decade', 'year', 'month', 
			'day', 'years', 'months', 
			'days',
		],
		agelist: [
			'years', 'months', 'days',
		],
		confidencelevels: {
			kurtosis: {
				max: 2,
				min: -2,
			},
			skewness: {
				max: 2,
				min: -2,
			},
		}
	},
	
	lmaps: [],
	
	lmapsdefaults: {
		baselayer: 'cartodbvoyager',
		centroids: {
			es: {
				lat: 51.1069818075, /* Germany */
				lon: 10.385780508,
			},
			en: {
				lat: 13.441656257, /* USA */
				lon: 144.76791022,
			}
		},
		zoom: 4,
		maxzoom: 20,
		minzoom: 0,
		overlays: [
			{
				file: 'world_continents', 
				name: {en: 'world continents', es: 'continentes'}, 
				color: '#00a8e8', opacity: 1, 
				weight: 1, fillColor: '#00a8e8', fillOpacity: 0.2, field: ['continent'],
				fieldname: ['continent']
			},
			{
				file: 'world_admin_level_0', 
				name: {en: 'world admin level 0', es: 'límites nivel 0'}, 
				color: '#2c739e', opacity: 1, 
				weight: 1, fillColor: '#2c739e', fillOpacity: 0.2, field: ['ADMIN', 'ISO_A3'],
				fieldname: ['country', 'ISO code']
			},
			{
				file: 'world_admin_level_1', 
				name: {en: 'world admin level 1', es: 'límites nivel 1'}, 
				color: '#d3372f', opacity: 1, 
				weight: 1, fillColor: '#d3372f', fillOpacity: 0.2, field: ['country', 'ISO3166-1-Alpha-3', 'name'], 
				fieldname: ['country', 'ISO code', 'region or province']
			},
			{
				file: 'eu_countries', 
				name: {en: 'EU countries', es: 'países UE'}, 
				color: '#6bf178', opacity: 1, 
				weight: 1, fillColor: '#6bf178', fillOpacity: 0.2, field: ['country', 'population2009'],
				fieldname: ['country', 'population']
			},
			{
				file: 'spain_regions', 
				name: {en: 'Spain regions', es: 'España. Comunidades Autónomas'}, 
				color: '#d8973c', opacity: 1, 
				weight: 1, fillColor: '#d8973c', fillOpacity: 0.2, field: ['nombre'],
				fieldname: ['region']
			},
			{
				file: 'spain_provinces', 
				name: {en: 'Spain provinces', es: 'España. Provincias'}, 
				color: '#0090c1', opacity: 1, 
				weight: 1, fillColor: '#0090c1', fillOpacity: 0.2, field: ['nombre'],
				fieldname: ['province']
			},
			{
				file: 'spain_municipalities', 
				name: {en: 'Spain municipalities', es: 'España. Municipios'}, 
				color: '#a42cd6', opacity: 1, 
				weight: 1, fillColor: '#a42cd6', fillOpacity: 0.2, field: ['ComAutonom', 'Provincia', 'Texto'],
				fieldname: ['region', 'province', 'municipality']
			},
			{
				file: 'spain_quarters', 
				name: {en: 'Spain quarters', es: 'España. Barrios'}, 
				color: '#f2c56d', opacity: 1, 
				weight: 1, fillColor: '#f2c56d', fillOpacity: 0.2, field: ['municipio', 'distrito', 'barrio'],
				fieldname: ['municipality', 'district', 'quarter']
			},
			{
				file: 'spain_malaga_districts', 
				name: {en: 'Spain. Málaga districts', es: 'España. Málaga. Distritos'}, 
				color: '#7a6262', opacity: 1, 
				weight: 1, fillColor: '#7a6262', fillOpacity: 0.2, field: ['NUMERO', 'NOMBRE'],
				fieldname: ['number', 'district']
			},
			{
				file: 'spain_malaga_quarters', 
				name: {en: 'Spain. Málaga quarters', es: 'España. Málaga. Barrios'}, 
				color: '#ea805b', opacity: 1, 
				weight: 1, fillColor: '#ea805b', fillOpacity: 0.2, field: ['NUMBARRIO', 'NOMBARRIO'],
				fieldname: ['number', 'quarter']
			},
			{
				file: 'spain_malaga_schools', 
				name: {en: 'Spain. Málaga schools', es: 'España. Málaga. Colegios'}, 
				color: '#6d9c00', opacity: 1, 
				weight: 1, fillColor: '#6d9c00', fillOpacity: 0.2, field: ['Denominaci', 'Nombre', 'Dependenci', 'Enseñanzas'],
				fieldname: ['type', 'name', 'ownership', 'teachings']
			},
			{
				file: 'spain_malaga_cultural_centers', 
				name: {en: 'Spain. Málaga cultural centers', es: 'España. Málaga. Centros culturales'}, 
				color: '#5f2580', opacity: 1, 
				weight: 1, fillColor: '#5f2580', fillOpacity: 0.2, field: ['TIPO', 'NOMBRE'],
				fieldname: ['type', 'name']
			},
			{
				file: 'spain_madrid_districts', 
				name: {en: 'Spain. Madrid districts', es: 'España. Madrid. Distritos'}, 
				color: '#7a6262', opacity: 1, 
				weight: 1, fillColor: '#7a6262', fillOpacity: 0.2, field: ['CODDISTRIT', 'NOMBRE'],
				fieldname: ['number', 'district']
			},
	
		],
	},
	
	primaryrecords: {
		artwork: {
			lang: 'en',
			name: 'artwork',
			shortcut: 'art',
			records: 0,
			color: 'w3-safety-orange',
			icon: 'palette',
			age: 'agey',
		},
		book: {
			lang: 'en',
			name: 'book',
			shortcut: 'cat',
			records: 0,
			color: 'w3-safety-purple',
			icon: 'book',
			age: 'agey',
		},
		company: {
			lang: 'en',
			name: 'company',
			shortcut: 'com',
			records: 0,
			color: 'w3-safety-yellow',
			icon: 'tools',
			age: null,
		},
		entity: {
			lang: 'en',
			name: 'entity',
			shortcut: 'ent',
			records: 0,
			color: 'w3-safety-green',
			icon: 'university',
			age: null,
		},
		exhibition: {
			lang: 'en',
			name: 'exhibition',
			shortcut: 'exh',
			records: 0,
			color: 'w3-safety-red',
			icon: 'images',
			age: 'agew',
		},
		person: {
			lang: 'en',
			name: 'person',
			shortcut: 'act',
			records: 0,
			color: 'w3-safety-blue',
			icon: 'user',
			age: 'agey',
		},

		'obra de arte': {
			lang: 'es',
			name: 'obra de arte',
			shortcut: 'art',
			records: 0,
			color: 'w3-safety-orange',
			icon: 'palette',
			age: 'agey',
		},
		'catálogo': {
			lang: 'es',
			name: 'catálogo',
			shortcut: 'cat',
			records: 0,
			color: 'w3-safety-purple',
			icon: 'book',
			age: 'agey',
		},
		'empresa': {
			lang: 'es',
			name: 'empresa',
			shortcut: 'com',
			records: 0,
			color: 'w3-safety-yellow',
			icon: 'tools',
			age: null,
		},
		'entidad': {
			lang: 'es',
			name: 'entidad',
			shortcut: 'ent',
			records: 0,
			color: 'w3-safety-green',
			icon: 'university',
			age: null,
		},
		'exposición': {
			lang: 'es',
			name: 'exposición',
			shortcut: 'exh',
			records: 0,
			color: 'w3-safety-red',
			icon: 'images',
			age: 'agew',
		},
		'actor': {
			lang: 'es',
			name: 'actor',
			shortcut: 'act',
			records: 0,
			color: 'w3-safety-blue',
			icon: 'user',
			age: 'agey',
		},
	},
};

export default Config;
