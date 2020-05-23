const Queries = [
	{
		group: 'load',
		name: `filter table setup first`,
		definition: [
			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS tpos;`,
			`CREATE TABLE tpos AS `,
			`SELECT * FROM pos p `,
			`WHERE ###;`,
			`COMMIT;`,

			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS tdrel;`,

			`CREATE TABLE tdrel AS `,
			`SELECT `,
			`DISTINCT rel.RID AS ID `,
			`FROM rel INNER JOIN tpos ON rel.ID = tpos.ID;`,
			`COMMIT;`,

			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS tirel;`,
			`CREATE TABLE tirel AS `,
			`SELECT `,
			`DISTINCT rel.ID AS ID `,
			`FROM rel INNER JOIN tpos ON rel.RID = tpos.ID;`,
			`COMMIT;`,

			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS flt;`,
			`CREATE TABLE flt AS `,
			`SELECT `,
			`DISTINCT ID AS ID `,
			`FROM (`,
			`SELECT ID FROM tpos `,
			`UNION `,
			`SELECT ID FROM tdrel `,
			`UNION `,
			`SELECT ID FROM tirel `,
			`);`,
			`COMMIT;`,

			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS lnk;`,
			`CREATE TABLE lnk AS `,
			`SELECT DISTINCT `,
			`"loutbound" AS rtitle, `,
			`rel.ID AS origin, `,
			`p0.rkey AS orkey, `,
			`p0.value AS ovalue, `,
			`rel.rkey AS link, `,
			`rel.RID AS target, `,
			`p1.rkey AS trkey, `,
			`p1.value as tvalue `,
			`FROM `,
			`rel `,
			`LEFT JOIN pos p0 ON rel.ID = p0.ID `,
			`LEFT JOIN pos p1 ON rel.RID = p1.ID `,
			`UNION `,
			`SELECT DISTINCT `,
			`"linbound" AS rtitle, `,
			`rel.RID AS origin, `,
			`p0.rkey AS orkey, `,
			`p0.value AS ovalue, `,
			`rel.rkey AS link, `,
			`rel.ID AS target, `,
			`p1.rkey AS trkey, `,
			`p1.value as tvalue `,
			`FROM `,
			`rel `,
			`LEFT JOIN pos p0 ON rel.RID = p0.ID `,
			`LEFT JOIN pos p1 ON rel.ID = p1.ID;`,
			`COMMIT;`,

			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS tpos;`,
			`COMMIT;`,
			
			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS tdrel;`,
			`COMMIT;`,
			
			`BEGIN TRANSACTION;`,
			`DROP TABLE IF EXISTS tirel;`,
			`COMMIT;`,
		].join(''),
	},
	/*
	{
		group: 'setup',
		name: `filter table setup following`,
		definition: [
			`SELECT rkey, COUNT(ID) filtered FROM pos `,
			`GROUP BY rkey ORDER BY rkey;`,
		].join(''),
	},
	*/
	{
		group: 'setup',
		name: `tables structure`,
		definition: [
			`SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;`,
		].join(''),
	},
	{
		group: 'load',
		name: `primary records count`,
		definition: [
			`SELECT count(ID) count FROM pos WHERE ID IN (SELECT ID FROM flt);`,
		].join(''),
	},
	{
		group: 'load',
		name: `database count`,
		definition: [
			`SELECT SUM(count) count FROM (`,
			`SELECT count(ID) count FROM pos WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM met WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM tax WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM rel WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM rel WHERE RID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM gen WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM age WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM map WHERE ID IN (SELECT ID FROM flt) UNION ALL `,
			`SELECT count(ID) count FROM pla WHERE ID IN (SELECT ID FROM flt) `,
			`);`,
		].join(''),
	},
	{
		group: 'load',
		name: `auxiliary tables`,
		definition: [
			`SELECT rtype, count(ID) count FROM age WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype UNION ALL `,
			`SELECT rtype, count(ID) count FROM gen WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype UNION ALL `,
			`SELECT rtype, count(ID) count FROM pla WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype UNION ALL `,
			`SELECT rtype, count(ID) count FROM map WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype `,
			`ORDER BY rtype;`,		
		].join(''),
	},
	{
		group: 'load',
		name: `count by type`,
		definition: [
			`SELECT rtype, count(ID) count FROM pos WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype UNION ALL `,
			`SELECT rtype, count(ID) count FROM met WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype UNION ALL `,
			`SELECT rtype, count(ID) count FROM tax WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype UNION ALL `,
			`SELECT rtype, count(ID) count FROM rel WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype `,
			`ORDER BY rtype;`,		
		].join(''),
	},
	{
		group: 'load',
		name: `count by relations type`,
		definition: [
			`SELECT DISTINCT `,
			`idtype, rkey, ridtype, `,
			`COUNT(DISTINCT ID) AS countid, `,
			`COUNT(DISTINCT RID) AS countrid `,
			`FROM rel `,
			`WHERE `,
			`ID IN (SELECT ID FROM flt) `,
			`AND `,
			`RID IN (SELECT ID FROM flt) `,
			`GROUP BY idtype, rkey, ridtype `,
			`ORDER BY idtype, rkey, ridtype;`,
		].join(''),
	},
	{
		group: 'load',
		name: `count by type and key`,
		definition: [
			`SELECT rtype, rkey, count(ID) count FROM pos WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype, rkey UNION ALL `,
			`SELECT rtype, rkey, count(ID) count FROM met WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype, rkey UNION ALL `,
			`SELECT rtype, rkey, count(ID) count FROM tax WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype, rkey UNION ALL `,
			`SELECT rtype, idtype || " > " || ridtype AS rkey, count(ID) count FROM rel WHERE ID IN (SELECT ID FROM flt) GROUP BY rtype, rkey `,
			`ORDER BY rtype, rkey;`,
		].join(''),
	},
	{
		group: 'load',
		name: `count pos by type`,
		definition: [
			`SELECT rkey, count(ID) count FROM pos WHERE ID IN (SELECT ID FROM flt) GROUP BY rkey;`,
		].join(''),
	},
	{
		group: 'utility',
		name: `features list`,
		definition: [
			`SELECT DISTINCT "pos" as rtable, p.rkey, p.rkey AS rtxt FROM pos p `,
			`UNION ALL `,
			`SELECT DISTINCT "met" as rtable, m.rkey, p.rkey || ': ' || m.rkey AS rtxt FROM met m INNER JOIN pos p ON m.ID = p.ID `,
			`UNION ALL `,
			`SELECT DISTINCT "tax" as rtable, t.rkey, p.rkey || ': ' || t.rkey AS rtxt FROM tax t INNER JOIN pos p ON t.ID = p.ID `,
			`ORDER BY rtxt;`,
			`SELECT DISTINCT idtype, ridtype, rkey, `,
			`rkey || ' (' || ridtype || ')' AS skey `,
			`FROM rel `,
			`ORDER BY idtype, rkey, ridtype;`,
			,
		].join(''),
	},
	{
		group: 'utility',
		name: `filter list`,
		definition: [
			`SELECT DISTINCT value FROM ### WHERE @@@ ORDER BY value LIMIT 100;`,
		].join(''),
	},
	{
		group: 'listing',
		name: `plain listing`,
		definition: [
			`SELECT COUNT(p.ID) count `,
			`FROM pos p INNER JOIN flt f `,
			`ON p.ID = f.ID `,
			`&&&`,
			`;`,
			`SELECT p.rkey, `,
			`'<a href="./#/search/' || p.ID || '">' || p.value || '</a>' value `,
			`FROM pos p `,
			`&&&`,
			`ORDER BY @@@ `,
			`$$$;`,
		].join(''),
	},
	{
		group: 'listing',
		name: `primary records listing`,
		definition: [
			`SELECT COUNT(DISTINCT(p.ID)) count `,
			`FROM pos p `,
			`###`,
			`INNER JOIN flt `,
			`ON p.ID = flt.ID `,
			`&&&;`,
			`SELECT p.rkey, `,
			`'<a href="./#/search/' || p.ID || '">' || p.value || '</a>' AS value `,
			`%%%`,
			`FROM pos p `,
			`###`,
			`INNER JOIN flt `,
			`ON p.ID = flt.ID `,
			`&&&`,
			`GROUP BY p.ID, p.rkey, p.value `,
			`ORDER BY @@@ `,
			`$$$;`,
		].join(''),
	},

	{
		group: 'indexed search',
		name: `collection primary records listing`,
		definition: [
			`SELECT `,
			`p.ID,`,
			`p.rkey,`,
			`p.value,`,
			`COALESCE(a.starty, '-') AS year,`,
			`COALESCE(a.startm, '-') AS month,`,
			`COALESCE(a.startd, '-') AS day,`,
			`COALESCE(NULLIF(l.town, ''), '-') AS town, `,
			`COALESCE(NULLIF(l.region, ''), '-') AS region, `,
			`COALESCE(NULLIF(l.country, ''), '-') AS country `,
			`FROM pos p `,
			`LEFT JOIN pla l `,
			`ON p.ID = l.ID `,
			`LEFT JOIN age a `,
			`ON p.ID = a.ID `,
			`INNER JOIN flt `,
			`ON p.ID = flt.ID `,
			`WHERE &&& `,
			`ORDER BY @@@;`,
		].join(''),
	},

	{
		group: 'search',
		name: `search list values`,
		definition: [
			`SELECT ID, rkey, value FROM pos WHERE @@@ ORDER BY rkey, value, ID LIMIT 1000;`,
		].join(''),
	},
	{
		group: 'search',
		name: `filtered search list values`,
		definition: [
			`SELECT p.ID AS ID, p.rtype AS rtype, p.rkey AS rkey, p.value AS value, `,
			`'' AS dtype, '' AS dkey, `,
			`'' AS abstract, `,
			`3 AS relevance `,
			`FROM pos p INNER JOIN flt ON p.ID = flt.ID `,
			`WHERE p.value GLOB '@@@' `,
			
			`UNION ALL `,
			
			`SELECT p.ID AS ID, p.rtype AS rtype, p.rkey AS rkey, p.value AS value, `,
			`m.rtype AS dtype, m.rkey AS dkey, `,
			`m.value AS abstract, `,
			`2 AS relevance `,
			`FROM met m INNER JOIN flt ON m.ID = flt.ID `,
			`INNER JOIN pos p ON m.ID = p.ID `,
			`WHERE m.value GLOB '@@@' `,
			
			`UNION ALL `,
			
			`SELECT p.ID AS ID, p.rtype AS rtype, p.rkey AS rkey, p.value AS value, `,
			`t.rtype AS dtype, t.rkey AS dkey, `,
			`t.value AS abstract, `,
			`1 AS relevance `,
			`FROM tax t INNER JOIN flt ON t.ID = flt.ID `,
			`INNER JOIN pos p ON t.ID = p.ID `,
			`WHERE t.value GLOB '@@@' `,
			
			`ORDER BY relevance DESC, rtype, rkey, value, abstract `,
			`LIMIT ###;`,
		].join(''),
	},
	{
		group: 'search',
		name: `single record`,
		definition: [
			`SELECT ID, rkey, value FROM pos WHERE ID = @@@ LIMIT 1;`,

			`SELECT "metadata" AS rtitle, rkey, value FROM met WHERE ID = @@@ `,
			`UNION ALL `,
			`SELECT "metadata" AS rtitle, "@y@" AS rkey, agey AS value FROM age WHERE ID = @@@ `,
			`UNION ALL `,
			`SELECT "metadata" AS rtitle, "@m@" AS rkey, agem AS value FROM age WHERE ID = @@@ `,
			`UNION ALL `,
			`SELECT "metadata" AS rtitle, "@w@" AS rkey, agew AS value FROM age WHERE ID = @@@ `,
			`UNION ALL `,
			`SELECT "metadata" AS rtitle, "@d@" AS rkey, aged AS value FROM age WHERE ID = @@@ `,
			`ORDER BY rkey, value;`,

			`SELECT "taxonomies" AS rtitle, rkey, value FROM tax WHERE ID = @@@ ORDER BY rkey, value;`,
			
			`SELECT "outbound" AS rtitle, r.ID, r.RID, r.ridtype, r.rkey, p.value, '>' AS bound, `,
			`m.longitude, m.latitude, `,
			`l.town, l.region, l.country, `,
			`g.gender, `,
			`a.starty, a.startm, a.startd, `,
			`a.agey, a.agem, a.aged `,
			`FROM rel r INNER JOIN pos p ON r.RID = p.ID `,
			`LEFT JOIN map m ON r.RID = m.ID `,
			`LEFT JOIN pla l ON r.RID = l.ID `,
			`LEFT JOIN gen g ON r.RID = g.ID `,
			`LEFT JOIN age a ON r.RID = a.ID `,
			`WHERE r.ID = @@@ `,
			`ORDER BY r.rkey, r.ridtype, p.value;`,
			
			`SELECT "inbound" AS rtitle, r.ID, r.RID, r.idtype, r.rkey, p.value, '<' AS bound, `,
			`m.longitude, m.latitude, `,
			`l.town, l.region, l.country, `,
			`g.gender, `,
			`a.starty, a.startm, a.startd, `,
			`a.agey, a.agem, a.aged `,
			`FROM rel r INNER JOIN pos p ON r.ID = p.ID `,
			`LEFT JOIN map m ON r.ID = m.ID `,
			`LEFT JOIN pla l ON r.ID = l.ID `,
			`LEFT JOIN gen g ON r.ID = g.ID `,
			`LEFT JOIN age a ON r.ID = a.ID `,
			`WHERE r.RID = @@@ `,
			`ORDER BY r.rkey, r.idtype, p.value;`,
			
			/* WATCH OUT START */
			`SELECT DISTINCT `,
			`r0.rtitle AS srtitle, `,
			`r0.origin AS spoint, `,
			`r0.orkey AS srkey, `,
			`r0.ovalue AS svalue, `,
			`r0.link AS swlink, `,
			`r1.origin AS wpoint, `,
			`r1.orkey AS wrkey, `,
			`r1.ovalue AS wvalue, `,
			`r1.link AS welink, `,
			`r1.target AS epoint, `,
			`r1.trkey AS erkey, `,
			`r1.tvalue AS evalue `,
			`FROM `,
			`lnk AS r0 `,
			`LEFT JOIN `,
			`lnk AS r1 ON r0.target = r1.origin `,
			`WHERE spoint <> epoint `,
			`AND spoint = @@@ `,
			`ORDER BY `,
			`srtitle, swlink, wrkey, wvalue, welink, erkey, evalue;`,
			/* WATCH OUT END */
		].join(''),
	},
	{
		group: 'map',
		name: `dynamic map`,
		definition: [
			`SELECT ID, rtype, latitude, longitude `,
			`FROM map `,
			`WHERE ID = @@@ LIMIT 1;`,
		].join(''),
	},
	{
		group: 'semantic',
		name: `semantic index`,
		definition: {
			es: [
				{
					table: 'gen',
					type: 'actor',
					color: '2018-tofu',
					text: 'género',
					field: 'gender',
					where: 'rtype="género"'
				},
				{
					table: 'met',
					type: 'exposición',
					color: '2018-almond-buff',
					text: 'acceso',
					field: 'value',
					where: 'rkey="acceso"'
				},
				{
					table: 'met',
					type: 'empresa',
					color: '2018-almond-buff',
					text: 'dimensión',
					field: 'value',
					where: 'rkey="dimensión"'
				},
				{
					table: 'met',
					type: 'exposición',
					color: '2018-almond-buff',
					text: 'geoetiqueta',
					field: 'value',
					where: 'rkey="geoetiqueta"'
				},
				{
					table: 'met',
					type: 'entidad',
					color: '2018-almond-buff',
					text: 'máximo responsable',
					field: 'value',
					where: 'rkey="máximo responsable"'
				},
				{
					table: 'met',
					type: 'entidad',
					color: '2018-almond-buff',
					text: 'nombre alternativo',
					field: 'value',
					where: 'rkey="nombre alternativo"'
				},
				{
					table: 'met',
					type: 'entidad',
					color: '2018-almond-buff',
					text: 'sede',
					field: 'value',
					where: 'rkey="sede"'
				},
				{
					table: 'met',
					type: 'actor',
					color: '2018-almond-buff',
					text: 'tipo de actor',
					field: 'value',
					where: 'rkey="tipo de actor"'
				},
				{
					table: 'met',
					type: 'catálogo',
					color: '2018-almond-buff',
					text: 'tipo de catálogo',
					field: 'value',
					where: 'rkey="tipo de catálogo"'
				},
				{
					table: 'met',
					type: 'obra de arte',
					color: '2018-almond-buff',
					text: 'título alternativo',
					field: 'value',
					where: 'rkey="título alternativo"'
				},
				{
					table: 'pla',
					type: 'obra de arte',
					color: '2018-meerkat',
					text: 'lugar de creación de la obra; localidad',
					field: 'town',
					where: 'rtype="lugar de creación de la obra"'
				},
				{
					table: 'pla',
					type: 'obra de arte',
					color: '2018-meerkat',
					text: 'lugar de creación de la obra; región',
					field: 'region',
					where: 'rtype="lugar de creación de la obra"'
				},
				{
					table: 'pla',
					type: 'obra de arte',
					color: '2018-meerkat',
					text: 'lugar de creación de la obra; país',
					field: 'country',
					where: 'rtype="lugar de creación de la obra"'
				},
				{
					table: 'pla',
					type: 'entidad',
					color: '2018-meerkat',
					text: 'lugar de la sede; localidad',
					field: 'town',
					where: 'rtype="lugar de la sede"'
				},
				{
					table: 'pla',
					type: 'entidad',
					color: '2018-meerkat',
					text: 'lugar de la sede; región',
					field: 'region',
					where: 'rtype="lugar de la sede"'
				},
				{
					table: 'pla',
					type: 'entidad',
					color: '2018-meerkat',
					text: 'lugar de la sede; país',
					field: 'country',
					where: 'rtype="lugar de la sede"'
				},
				{
					table: 'pla',
					type: 'catálogo',
					color: '2018-meerkat',
					text: 'lugar de publicación; localidad',
					field: 'town',
					where: 'rtype="lugar de publicación"'
				},
				{
					table: 'pla',
					type: 'catálogo',
					color: '2018-meerkat',
					text: 'lugar de publicación; región',
					field: 'region',
					where: 'rtype="lugar de publicación"'
				},
				{
					table: 'pla',
					type: 'catálogo',
					color: '2018-meerkat',
					text: 'lugar de publicación; país',
					field: 'country',
					where: 'rtype="lugar de publicación"'
				},
				{
					table: 'pla',
					type: 'exposición',
					color: '2018-meerkat',
					text: 'lugar donde se celebra; localidad',
					field: 'town',
					where: 'rtype="lugar donde se celebra"'
				},
				{
					table: 'pla',
					type: 'exposición',
					color: '2018-meerkat',
					text: 'lugar donde se celebra; región',
					field: 'region',
					where: 'rtype="lugar donde se celebra"'
				},
				{
					table: 'pla',
					type: 'exposición',
					color: '2018-meerkat',
					text: 'lugar donde se celebra; país',
					field: 'country',
					where: 'rtype="lugar donde se celebra"'
				},
				{
					table: 'pla',
					type: 'actor',
					color: '2018-meerkat',
					text: 'nacionalidad de origen; localidad',
					field: 'town',
					where: 'rtype="nacionalidad de origen"'
				},
				{
					table: 'pla',
					type: 'actor',
					color: '2018-meerkat',
					text: 'nacionalidad de origen; región',
					field: 'region',
					where: 'rtype="nacionalidad de origen"'
				},
				{
					table: 'pla',
					type: 'actor',
					color: '2018-meerkat',
					text: 'nacionalidad de origen; país',
					field: 'country',
					where: 'rtype="nacionalidad de origen"'
				},
				{
					table: 'tax',
					type: 'actor',
					color: '2018-limelight',
					text: 'actividad de actor',
					field: 'value',
					where: 'rkey="actividad de actor"'
				},
				{
					table: 'tax',
					type: 'empresa',
					color: '2018-limelight',
					text: 'categoría ISIC4 de empresa',
					field: 'value',
					where: 'rkey="categoría ISIC4 de empresa"'
				},
				{
					table: 'tax',
					type: 'catálogo',
					color: '2018-limelight',
					text: 'categoría de documento',
					field: 'value',
					where: 'rkey="categoría de documento"'
				},
				{
					table: 'tax',
					type: 'catálogo',
					color: '2018-limelight',
					text: 'editorial de catálogo',
					field: 'value',
					where: 'rkey="editorial de catálogo"'
				},
				{
					table: 'tax',
					type: 'exposición',
					color: '2018-limelight',
					text: 'movimiento artístico',
					field: 'value',
					where: 'rkey="movimiento artístico"'
				},
				{
					table: 'tax',
					type: 'exposición',
					color: '2018-limelight',
					text: 'periodo histórico',
					field: 'value',
					where: 'rkey="periodo histórico"'
				},
				{
					table: 'tax',
					type: 'exposición',
					color: '2018-limelight',
					text: 'tipo de exposición',
					field: 'value',
					where: 'rkey="tipo de exposición"'
				},
				{
					table: 'tax',
					type: 'obra de arte',
					color: '2018-limelight',
					text: 'tipo de obra de arte',
					field: 'value',
					where: 'rkey="tipo de obra de arte"'
				},
				{
					table: 'tax',
					type: 'catálogo',
					color: '2018-limelight',
					text: 'tipología de catálogo',
					field: 'value',
					where: 'rkey="tipología de catálogo"'
				},
				{
					table: 'tax',
					type: 'entidad',
					color: '2018-limelight',
					text: 'tipología de entidad',
					field: 'value',
					where: 'rkey="tipología de entidad"'
				},
				{
					table: 'tax',
					type: 'entidad',
					color: '2018-limelight',
					text: 'titularidad de entidad',
					field: 'value',
					where: 'rkey="titularidad de entidad"'
				}
			],
			en: [
				{
					table: 'gen',
					type: 'actor',
					color: '2018-tofu',
					text: 'gender',
					field: 'gender',
					where: 'rtype="gender"'
				},
				{
					table: 'met',
					type: 'exhibition',
					color: '2018-almond-buff',
					text: 'access',
					field: 'value',
					where: 'rkey="access"'
				},
				{
					table: 'met',
					type: 'company',
					color: '2018-almond-buff',
					text: 'dimension',
					field: 'value',
					where: 'rkey="dimension"'
				},
				{
					table: 'met',
					type: 'exhibition',
					color: '2018-almond-buff',
					text: 'geotag',
					field: 'value',
					where: 'rkey="geotag"'
				},
				{
					table: 'met',
					type: 'entity',
					color: '2018-almond-buff',
					text: 'chief executive',
					field: 'value',
					where: 'rkey="chief executive"'
				},
				{
					table: 'met',
					type: 'entity',
					color: '2018-almond-buff',
					text: 'alternate name',
					field: 'value',
					where: 'rkey="alternate name"'
				},
				{
					table: 'met',
					type: 'entity',
					color: '2018-almond-buff',
					text: 'venue',
					field: 'value',
					where: 'rkey="venue"'
				},
				{
					table: 'met',
					type: 'actor',
					color: '2018-almond-buff',
					text: 'actor\'s type',
					field: 'value',
					where: 'rkey="actor\'s type"'
				},
				{
					table: 'met',
					type: 'catalog',
					color: '2018-almond-buff',
					text: 'catalog type',
					field: 'value',
					where: 'rkey="catalog type"'
				},
				{
					table: 'met',
					type: 'artwork',
					color: '2018-almond-buff',
					text: 'alternate title',
					field: 'value',
					where: 'rkey="alternate title"'
				},
				{
					table: 'pla',
					type: 'artwork',
					color: '2018-meerkat',
					text: 'artwork creation place; town',
					field: 'town',
					where: 'rtype="artwork creation place"'
				},
				{
					table: 'pla',
					type: 'artwork',
					color: '2018-meerkat',
					text: 'artwork creation place; region',
					field: 'region',
					where: 'rtype="artwork creation place"'
				},
				{
					table: 'pla',
					type: 'artwork',
					color: '2018-meerkat',
					text: 'artwork creation place; country',
					field: 'country',
					where: 'rtype="artwork creation place"'
				},
				{
					table: 'pla',
					type: 'entity',
					color: '2018-meerkat',
					text: 'entity venue place; town',
					field: 'town',
					where: 'rtype="lentity venue place"'
				},
				{
					table: 'pla',
					type: 'entity',
					color: '2018-meerkat',
					text: 'entity venue place; region',
					field: 'region',
					where: 'rtype="entity venue place"'
				},
				{
					table: 'pla',
					type: 'entity',
					color: '2018-meerkat',
					text: 'entity venue place; country',
					field: 'country',
					where: 'rtype="entity venue place"'
				},
				{
					table: 'pla',
					type: 'catalog',
					color: '2018-meerkat',
					text: 'publishing place; town',
					field: 'town',
					where: 'rtype="publishing place"'
				},
				{
					table: 'pla',
					type: 'catalog',
					color: '2018-meerkat',
					text: 'publishing place; region',
					field: 'region',
					where: 'rtype="publishing place"'
				},
				{
					table: 'pla',
					type: 'catalog',
					color: '2018-meerkat',
					text: 'publishing place; country',
					field: 'country',
					where: 'rtype="publishing place"'
				},
				{
					table: 'pla',
					type: 'exhibition',
					color: '2018-meerkat',
					text: 'venue place; town',
					field: 'town',
					where: 'rtype="venue place"'
				},
				{
					table: 'pla',
					type: 'exhibition',
					color: '2018-meerkat',
					text: 'venue place; region',
					field: 'region',
					where: 'rtype="venue place"'
				},
				{
					table: 'pla',
					type: 'exhibition',
					color: '2018-meerkat',
					text: 'venue place; country',
					field: 'country',
					where: 'rtype="venue place"'
				},
				{
					table: 'pla',
					type: 'actor',
					color: '2018-meerkat',
					text: 'citizenship; town',
					field: 'town',
					where: 'rtype="citizenship"'
				},
				{
					table: 'pla',
					type: 'actor',
					color: '2018-meerkat',
					text: 'citizenship; region',
					field: 'region',
					where: 'rtype="citizenship"'
				},
				{
					table: 'pla',
					type: 'actor',
					color: '2018-meerkat',
					text: 'citizenship; country',
					field: 'country',
					where: 'rtype="citizenship"'
				},
				{
					table: 'tax',
					type: 'actor',
					color: '2018-limelight',
					text: 'actor\'s activity',
					field: 'value',
					where: 'rkey="actor\'s activity"'
				},
				{
					table: 'tax',
					type: 'company',
					color: '2018-limelight',
					text: 'ISIC4 category',
					field: 'value',
					where: 'rkey="ISIC4 category"'
				},
				{
					table: 'tax',
					type: 'catalog',
					color: '2018-limelight',
					text: 'document category',
					field: 'value',
					where: 'rkey="document category"'
				},
				{
					table: 'tax',
					type: 'catalog',
					color: '2018-limelight',
					text: 'publisher',
					field: 'value',
					where: 'rkey="publisher"'
				},
				{
					table: 'tax',
					type: 'exhibition',
					color: '2018-limelight',
					text: 'movement',
					field: 'value',
					where: 'rkey="movement"'
				},
				{
					table: 'tax',
					type: 'exhibition',
					color: '2018-limelight',
					text: 'period',
					field: 'value',
					where: 'rkey="period"'
				},
				{
					table: 'tax',
					type: 'exhibition',
					color: '2018-limelight',
					text: 'exhibition type',
					field: 'value',
					where: 'rkey="exhibition type"'
				},
				{
					table: 'tax',
					type: 'artwork',
					color: '2018-limelight',
					text: 'artwork type',
					field: 'value',
					where: 'rkey="artwork type"'
				},
				{
					table: 'tax',
					type: 'catalog',
					color: '2018-limelight',
					text: 'catalog typology',
					field: 'value',
					where: 'rkey="catalog typology"'
				},
				{
					table: 'tax',
					type: 'entity',
					color: '2018-limelight',
					text: 'typology',
					field: 'value',
					where: 'rkey="typology"'
				},
				{
					table: 'tax',
					type: 'entity',
					color: '2018-limelight',
					text: 'ownership',
					field: 'value',
					where: 'rkey="ownership"'
				}
			]
		},
	},
];

export default Queries;
