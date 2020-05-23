SELECT 
	x.rtitle,
	x.ridtype,
	x.rkey,
	x.town AS facet, 
	x.taxonomy_name,
	x.taxonomy,
	COUNT(rtitle) AS count
FROM (
	SELECT "outbound" AS rtitle, r.ridtype, r.rkey, 
	l.town, 
	t.rkey AS taxonomy_name, t.value AS taxonomy 

	FROM rel r INNER JOIN pos p ON r.RID = p.ID 
	LEFT JOIN tax t ON r.RID = t.ID 
	LEFT JOIN pla l ON r.RID = l.ID 
	WHERE r.ID = 6664 
	
	UNION ALL 
	
	SELECT "inbound" AS rtitle, r.idtype, r.rkey, 
	l.town, 
	t.rkey AS taxonomy_name, t.value AS taxonomy

	FROM rel r INNER JOIN pos p ON r.ID = p.ID 
	LEFT JOIN tax t ON r.ID = t.ID 
	LEFT JOIN pla l ON t.ID = l.ID 
	WHERE r.RID = 6664 
) AS x 

GROUP BY 
	x.rtitle,
	x.ridtype,
	x.rkey,
	x.town, 
	x.taxonomy_name,
	x.taxonomy;