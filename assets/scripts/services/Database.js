import Utils from './Utils.js'
import Pagination from './Pagination.js'
//import Queries from './Queries.js'

const Database = { 
	isdbloaded: () => !!G.db,
	
	tablecreate: (title, columns, values, lastpage = null, currentpage = null, url = null, sort = null, query = null) => {
		function valconcat(vals, tag, numr, surl = null, ssort = null) {
			if (vals.length === 0) return '';
			vals = vals.map((o, i) => {
				let xtag = tag === 'td' ? `${tag} data-label="${Utils.c(columns[i])}"` : tag;
				let sortable = ssort !== null;
				let isnum = numr[i]; 
				let formattext = str => {
					let regexp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
					return regexp.test(str) ? 
						`<span class="empty-circle" style="background-color:${str}"></span>` : 
						Utils.c(str);
				};
				let val = Utils.isNumeric(o) ? o.toLocaleString(Utils.l) : formattext(o);
				let arrow = !ssort ? '' : ssort.includes('-') ? '&darr;' : '&uarr;';
				let sign = !ssort ? '' : ssort.includes('-') ? '+' : '-';
				let signed = !ssort ? '' : ssort.replace('-', '').replace('+', '');
				let srtprefix = !sortable ? '' : 
					`<a href="./#/${surl}/1/${o}${sign}">`;
				let srtsuffix = !sortable ? '' : 
					`</a>`;
				return [
					`<${xtag}${isnum ? ' class="w3-right-align"' : String(val).length > 100 ? ' class="force-wrap"' : ''}>`,
					`${srtprefix}`,
					`${query ? Database.highlight(val, query) : val}${!sortable ? '' : (o === signed ? arrow : '')}`,
					`${srtsuffix}`,
					`</${tag}>`,
				].join('');
			});
			return `<tr>${vals.join('')}</tr>`;
		}
		function valsalignment(vals) {
			let invert = a => a[0].map((col, c) => a.map((row, r) => a[r][c]));
			let out = [];
			invert(vals).forEach(o => out.push(!o.some(isNaN)));
			return out;
		}
		
		if(!values.length) {
			let div = document.createElement('div');
			let p = document.createElement('div');
			p.classList.add('w3-panel');
			p.classList.add('w3-pale-red');
			p.classList.add('w3-leftbar');
			p.classList.add('w3-border-red');
			p.classList.add('w3-padding-large');
			p.innerHTML = [
				Utils.c('no results').uf(),
			].join('');
			div.appendChild(p);
			p = undefined;
			return div;
		}
		
		let numerics = valsalignment(values);
		
		let pageselector = null;
		let ispaginated = (lastpage !== null && currentpage !== null && url !== null);
		if(ispaginated) {
			Pagination.initialPagination(lastpage);
			let pages = Pagination.getUpdatedPageList(currentpage);
			let first = pages.filter(o => !isNaN(o)).map(o => Number(o)).filter(o => ![1, lastpage].includes(o)).min();
			let last = pages.filter(o => !isNaN(o)).map(o => Number(o)).filter(o => ![1, lastpage].includes(o)).max();
			pageselector = [];
			
			pageselector.push('<div class="w3-row w3-margin-top w3-no-print">');

			pageselector.push('<div class="w3-col w3-container s12 m10 l10" style="padding-left:0">');
			pageselector.push('<div class="w3-bar">');
			pages.forEach(o => {
				let dpage = o === '&laquo;' ? first - 1 : o === '&raquo;' ? last + 1 : o; 
				pageselector.push([
					`<a href="javascript:;" data-page="${dpage}" `,
					`data-type="link" `,
					`data-url="${url}" `,
					`data-sort="${sort}" `,
					`class="w3-bar-item w3-button${o === currentpage ? ' w3-blue' : ''}`,
					`${o === '...' ? ' cursor-default w3-text-grey' : ' w3-hover-blue lst-goto-page'}">`,
					`${o}</a>`,
				].join(''));
				dpage = undefined;
			});	
			pageselector.push('</div>');
			pageselector.push('</div>');
			
			pageselector.push('<div class="w3-col w3-container w3-right-align s12 m2 l2" style="padding-right:0">');
			pageselector.push([
				`<select class="w3-select slc-goto-page" `,
				`data-type="link" `,
				`data-url="${url}" `,
				`data-sort="${sort}">`,
			].join(''));
			Array.from({length: lastpage}, (v, k) => k + 1).forEach(o => {
				pageselector.push(`<option value="${o}"${String(o) === String(currentpage) ? ' selected' : ''}>${o}</option>`);
			});
			pageselector.push('</select>');
			pageselector.push('</div>');

			pageselector.push('</div>');
		}

		let div = document.createElement('div');
		let tbl = document.createElement('table');
		let pdv = document.createElement('div');

		div.classList.add('listing');
		let pgs = null;
		if(pageselector) {
			pgs = document.createElement('div');
			pgs.innerHTML = pageselector.join('');
		}
		let tblid = `tbl-${(Math.random().toString(36).substring(7))}`;
		tbl.id = tblid;
		tbl.classList.add('w3-table');
		
		tbl.classList.add('rt');
		tbl.classList.add('cf');
		
		tbl.classList.add('w3-bordered');
		tbl.classList.add('w3-striped');
		tbl.classList.add('w3-hoverable');
		
		let rows = values.map(v => valconcat(v, 'td', numerics));
		
		pdv.classList.add('w3-row');
		let prehtml = [
			`<div class="w3-col w3-padding-16 s12 m8 l8 table-title">`,
			`<em>${title}</em> (${values.length.toLocaleString(Utils.l)})`,
			`</div>`,
			`<div class="w3-col w3-right-align w3-padding-16 s12 m4 l4">`,
			`<a class="w3-tooltip w3-margin-right export-table w3-no-print" data-table="${tblid}" `,
			`href="javascript:;">`,
			`<i class="fas fa-save"></i>`,
			`<span style="position:absolute;left:0;bottom:24px"class="w3-text w3-tag">`,
			Utils.c('save'),
			`</span>`,
			`</a>`,
			`&nbsp;`,
			`<a class="w3-tooltip${ispaginated ? ' w3-margin-right' : ''} print-table w3-no-print" data-table="${tblid}" `,
			`href="javascript:;">`,
			`<i class="fas fa-print"></i>`,
			`<span style="position:absolute;left:0;bottom:24px"class="w3-text w3-tag">`,
			Utils.c('print'),
			`</span>`,
			`</a>`,
		].join('');
		if(ispaginated) {
			prehtml += [
				`&nbsp;`,
				`<a class="w3-tooltip rowsperpage-table w3-no-print" `,
				`data-url="${url}" `,
				`data-sort="${!sort ? '' : sort}" `,
				`data-currentpage="${!currentpage ? '' : currentpage}" `,
				`data-query="${!query ? '' : query}" `,
				`href="javascript:;">`,
				`<i class="fas fa-list-ol"></i>`,
				`<span style="position:absolute;left:0;bottom:24px"class="w3-text w3-tag">`,
				`${Utils.c('rows')}&hellip; (${G.dbrecordsperpage})`,
				`</span>`,
				`</a>`,
			].join('');
		}
		prehtml += [
			`</div>`,
			`</div>`,
		].join('');
		pdv.innerHTML = prehtml;
		
		let html = [
			`<caption class="w3-print-only w3-center"><h3>${title}</h3></caption>`,
			`<thead class="cf">`,
			`${valconcat(columns, 'th', numerics, url, sort)}`,
			`</thead>`,
			`<tbody>${valconcat(rows, 'tr', numerics)}</tbody>`,
		].join('\n');

		tbl.innerHTML = html;
		
		if(pgs) div.appendChild(pgs);
		div.appendChild(pdv);
		div.appendChild(tbl);
		if(ispaginated) {
			let tmpdiv = document.createElement('div');
			tmpdiv.innerHTML = pageselector.join('\n');
			div.appendChild(tmpdiv);
			tmpdiv = undefined;
		}
		prehtml = html = pdv = rows = pgs = undefined;
		return div;
	},
	listcreate: (fid, values, sclass = '', isul = false) => {
		function valconcat(vals, tag) {
			if (vals.length === 0) return '';
			return vals.map(o => [
				`<${tag} class="${sclass}"`,
				`>`,
				`${o}`,
				`</${tag}>`,
			].join('')).join('\n');
		}
		let tbl = values.length ? document.createElement(!isul ? 'ol' : 'ul') : document.createElement('div');
		if(isul) {
			tbl.classList.add('w3-ul');
			tbl.classList.add('w3-hoverable');
		}
		if(!values.length) {
			tbl.classList.add('w3-panel');
			tbl.classList.add('w3-pale-red');
			tbl.classList.add('w3-leftbar');
			tbl.classList.add('w3-border-red');
			tbl.classList.add('w3-padding-large');
			tbl.classList.add('w3-no-print');
		}
		tbl.innerHTML = values.length ? 
			values.map(v => valconcat(v, 'li', fid)).join('') : 
			Utils.c('no results').uf();
		return tbl;
	},
	linkablelistcreate: (values, url, leftpr = true, idfield = 0, left = 1, right = 2) => {
		if(!values) {
			throw new Error(Utils.c('internal error'));
		}
		function valconcat(o) {
			let val = !leftpr ? 
				`${o[left]}` : 
				[
					`<span class="${G.primaryrecords[o[left]] ? G.primaryrecords[o[left]].color : ''}">`,
					`${o[left]}`,
					`</span>`,
				].join('');
			return [
				`<dt>`,
				`${val}`,
				`</dt>`,
				`<dd>`,
				`<a href="./#/${url}/${o[idfield]}">${o[right]}</a>`,
				`</dd>`,
			].join('\n');
		}
		let tbl = values.length ? document.createElement('dl') : document.createElement('p');
		tbl.innerHTML = values.length ? 
			values.map(v => valconcat(v)).join('') : 
			Utils.c('no results').uf();
		return tbl;
	},
	searchlistcreate: (values, url, query = null) => {
		if(!values) {
			throw new Error(Utils.c('internal error'));
		}
		function valconcat(o) {
			let val = [
				`<span class="w3-tag ${G.primaryrecords[o[2]] ? G.primaryrecords[o[2]].color : ''}">`,
				`<i class="fas fa-${G.primaryrecords[o[2]] ? G.primaryrecords[o[2]].icon : ''} w3-margin-right"></i>`,
				`${o[2]}`,
				`</span>`,
			].join('');
			let rating = (o[7] + o[8]) / 4;
			let ratingpercent = (rating * 100).toFixed(2);
			let ratingstars = Math.round(rating * 5);
			let ratinglabel = [
				`<small class="w3-text-green">`,
				`${'&#9733;'.repeat(ratingstars)}`,
				`${'&#9734;'.repeat(5 - ratingstars)}`,
				` ${ratingpercent}%`,
				`</small><br />`,
			].join('');
			let txt = o[4] !== '' && o[5] !== '' ? 
				[
					`${ratinglabel} <a href="./#/${url}/${o[0]}">${Database.highlight(o[3], query)}</a>`,
					`<br />`,
					`<small class="w3-text-green">`,
					`${Utils.c('in').uf()} ${o[4]} "${o[5]}": `,
					`${Database.highlight(o[6], query)}`,
					`</small>`,
				].join('') : 
				[
					`${ratinglabel} <a href="./#/${url}/${o[0]}">${Database.highlight(o[3], query)}</a>`,
				].join('');
			rating = ratingpercent = undefined;
			return [
				`<dt>`,
				`${val}`,
				`</dt>`,
				`<dd>`,
				`${txt}`,
				`</dd>`,
			].join('\n');
		}
		let tbl = values.length ? document.createElement('dl') : document.createElement('p');
		tbl.innerHTML = values.length ? 
			values.map(v => valconcat(v)).join('') : 
			Utils.c('no results').uf();
		return tbl;
	},
	collapsiblelist: data => {
		if('object' !== typeof data) return;
		let out = [];
		Object.keys(data).sort((a, b) => a.trim().localeCompare(b.trim())).forEach((k, i) => {
			out.push([
				`<details>`,
				`<summary>`,
				`${k.split(': ')[0]} (`,
				`${Number(k.split(': ')[1]).toLocaleString(Utils.l)} `,
				`${Utils.c(Number(k.split(': ')[1]) === 1 ? 'item' : 'items')}`,
				`)`,
				`</summary>`,
				`<ul class="no-margin-bottom no-bullets"><li>`,
				`${data[k].join('</li><li>')}`,
				`</li></ul>`,
				`</details>`,
			].join(''));
		});
		return out.join('\n');
	},
		
	/* Records */
	
	singlerecord: data => {
		let out = [];
		let cid = `PW_SNG_${Math.random().toString(36).substring(7)}`;
		let color = null;
		let mapcolor = null;
		let icon = null;
		let title = null;
		let type = null;
		let nid = null;
				
		function checkfloat(value) {
			let parsed = Number.parseFloat(value);
			return (!Number.isNaN(parsed)) && (!Number.isInteger(parsed))
		}
		function thousands(val) {
			return !Utils.isNumeric(val) ? val : Number(val).toLocaleString(Utils.l);
		}
		function iscoordinates(val) {
			let valid = true;
			if(!val) return false;
			if(String(val).trim === '') return false;
			let array = String(val).split(',');
			if(array.length < 2) return false;
			array.forEach((o, i) => {
				if(i < 2) {
					if(!checkfloat(o)) valid = false;
				}
			});
			array = undefined;
			return valid;
		}
		function isurl(url) {
			let elm = document.createElement('input');
			if(!url) return false;
			let out = null;
			elm.setAttribute('type', 'url');
			elm.value = url;
			out = elm.validity.valid;
			elm = undefined;
			return out;
		}
		function setvalue(val) {
			// valtype: 0 = none, 1 = coordinates, 2 = URL
			let valtype = iscoordinates(val) ? 1 : isurl(val) ? 2 : 0;
			switch(valtype) {
				case 1:
					return [
						`<a class="map-point-trigger" href="javascript:;" `,
						`data-coordinates="${val}" `,
						`data-cid="${cid}" `,
						`data-title="${title}" `,
						`data-color="${mapcolor}" `,
						`data-size="15"`,
						`>`,
						`${Utils.c(val)}`,
						`</a>`,
					].join('');
					break;
				case 2:
					return [
						`<a rel="nofollow" target="_blank" `,
						`href="${val}"`,
						`>`,
						`${Utils.c(val)}`,
						`</a>`,
					].join('');
					break;
				default:
					return [
						`${Utils.c(thousands(val))}`,
					].join('');
					break;
			}
		}
		
		let request = Utils.parseRequestURL();
		if(request.verb) {
			document.querySelector('.src-hstback').style.display = 'inline-block';
		} else {
			document.querySelector('.src-hstback').style.display = 'none';
		}
		
		let gtype = null;
		data.forEach((result, i) => {
			switch(i) {
				case 0:
					nid =  result.values[0][0];
					type = result.values[0][1];
					gtype = result.values[0][1];
					title = result.values[0][2];
					color = `${G.primaryrecords[type].color}-text`;
					icon = G.primaryrecords[type].icon;
					mapcolor = Utils.getcolorfromcss(`.${color}`, 'color');
					out.push([
						`<h4 class="${color}" style="padding-left:0">`,
						`<span class="w3-margin-right w3-tooltip">`,
						`<i class="fas fa-${icon}"></i>`,
						`<span style="position:absolute;left:0;bottom:18px;width:180px" `,
						`class="w3-text w3-tag">${type}; ID: ${nid}</span>`,
						`</span>`,
						`${Utils.escapeHTML(title)}`,
						`</h4>`,
						
						`<p>`,
						`<a class="howtocite w3-margin-right" `,
						`data-uri="${encodeURI(window.location.href)}" `,
						`data-title="${encodeURI(title)}" `,
						`data-nid="${encodeURI(nid)}" `,
						`href="javascript:;">${Utils.c('how to cite')}</a>`,
						`<a class="help-window" `,
						`id="rel-hlp" data-help="relationlevels" href="javascript:;">`,
						`${Utils.c('relation levels')}</a>`,
						`</p>`,
					].join(''));
					break;
				default:
					if(result.values.length) {
						let sels = {
							inbound: {prefix: 'first degree', color: 'w3-highway-red-text'},
							outbound: {prefix: 'first degree', color: 'w3-highway-green-text'},
							linbound: {prefix: 'second degree', color: 'w3-highway-orange-text'},
							loutbound: {prefix: 'second degree', color: 'w3-highway-schoolbus-text'},
						};
						let gmap = Array.from(result.values.reduce(
							(entryMap, e) => entryMap.set(e[0], [...entryMap.get(e[0]) || [], e]),
							new Map()
						));
						gmap.forEach(gm => {
							let tmplinks = {};
							let rtitle = gm[0];
							let islink = Object.keys(sels).includes(rtitle);
							out.push([
								`<h4 class="`,
								islink ? sels[rtitle].color : 'w3-text-theme',
								` w3-border-bottom">`,
								islink ? `${Utils.c(sels[rtitle].prefix).uf()}. ` : '',
								`${Utils.c(rtitle).uf()}`,
								`<span class="float-right">[${gm[1].length.toLocaleString(Utils.l)}]</span>`,
								`</h4>`,
							].join(''));
							out.push(`<ul class="fa-ul">`);
							gm[1].forEach(r => {
								if(rtitle !== r[0]) {
									rtitle = r[0];
									islink = Object.keys(sels).includes(rtitle);
									out.push(`</ul>`);
									out.push([
										`<h4 class="`,
										islink ? sels[rtitle].color : 'w3-text-theme',
										` w3-border-bottom">`,
										islink ? `${Utils.c(sels[rtitle].prefix).uf()}. ` : '',
										`${Utils.c(rtitle).uf()}`,
										/* `${rtitle}`, */
										`<span class="float-right">[${result.values.length.toLocaleString(Utils.l)}]</span>`,
										`</h4>`,
									].join(''));
									out.push(`<ul class="fa-ul">`);
								}
								if(islink) {
									if(rtitle === 'linbound' || rtitle === 'loutbound') {
										if(!String(r[10]).empty() && r[10]) {
											if(!Object.keys(tmplinks).includes(`${r[4]}&hellip;`)) {
												tmplinks[`${r[4]}&hellip;`] = [];
											}
											let ricon6 = G.primaryrecords[r[6]].icon;
											let rcolor6 = G.primaryrecords[r[6]].color;
											let ricon10 = G.primaryrecords[r[10]].icon;
											let rcolor10 = G.primaryrecords[r[10]].color;
											tmplinks[`${r[4]}&hellip;`].push([
												`&#8627; `,
												
												`${r[6]} `,
												`<i class="fas fa-${ricon6} ${rcolor6}-text" style="margin-right:8px;"></i>`,
												`<a href="./#/search/${r[5]}/${nid}">`,
												`${r[7]}`,
												`</a> `,
		
												`${Utils.c(rtitle === 'loutbound' ? '&rarr;' : '&larr;')} `,
	
												`<b>${r[8]}</b> `,
	
												`<i class="fas fa-${ricon10} ${rcolor10}-text" style="margin-right:8px;"></i>`,
												`<a href="./#/search/${r[9]}/${nid}">`,
												`${r[11]}`,
												`</a>`,
											].join(''));
											ricon6 = rcolor6 = ricon10 = rcolor10 = undefined;
										} else {
											if(!Object.keys(tmplinks).includes(`${Utils.c('acting as')} ${r[4]} ${Utils.c('in')}&hellip;`)) {
												tmplinks[`${Utils.c('acting as')} ${r[4]} ${Utils.c('in')}&hellip;`] = [];
											}
											let ricon6 = G.primaryrecords[r[6]].icon;
											let rcolor6 = G.primaryrecords[r[6]].color;
											tmplinks[`${Utils.c('acting as')} ${r[4]} ${Utils.c('in')}&hellip;`].push([
												`&#8627; `,
		
												`<i class="fas fa-${ricon6} ${rcolor6}-text" style="margin-right:8px;"></i>`,
												`<a href="./#/search/${r[5]}/${nid}">`,
												`${r[7]}`,
												`</a>`,
											].join(''));
											ricon6 = rcolor6 = undefined;
										}
									} else {
										if(!Object.keys(tmplinks).includes(r[4])) {
											tmplinks[r[4]] = [];
										}
										let ricon = G.primaryrecords[r[3]].icon;
										let rcolor = G.primaryrecords[r[3]].color;
										tmplinks[r[4]].push([
											`&#8627; `,
		
											`<i class="fas fa-${ricon} ${rcolor}-text" style="margin-right:8px;"></i>`,
											`${r[3]} `,
											`<a href="./#/search/${r[6] === '<' ? r[1] : r[2]}/${nid}">`,
											`${r[5]}`,
											`</a> `,
										].join(''));
										ricon = rcolor = undefined;
									}
								} else {
									let icontype = rtitle === 'taxonomies' ? 'tags' : 'info-circle';
									let blfields = ['months', 'days', 'weeks', 'meses', 'días', 'semanas'];
									let bltypes = ['actor'];
									if(bltypes.includes(gtype) && blfields.includes(r[1])) {
										// nothing to print: is banned
									} else {
										out.push([
											`<li><span class="fa-li"><i class="fas fa-${icontype} w3-text-light-grey"></i></span>`,
											`${Utils.c(r[1])}: `,
											`<strong>${setvalue(r[2])}</strong>`,
											`</li>`,
										].join(''));
									}
									icontype = blfields = bltypes = undefined;
								}
							});
							Object.keys(tmplinks).forEach((o, n) => {
								out.push([
									`<li class="w3-margin-bottom"><span class="fa-li"><i class="fas fa-exchange-alt w3-text-light-grey"></i></span>`,
									`<span class="w3-tag w3-light-grey cursor-pointer accordionlink" data-target="prlinks-${rtitle}-${n}">`,
									`${o} [${tmplinks[o].length}]`,
									`</span>`,
									`<div id="prlinks-${rtitle}-${n}" class="w3-hide w3-border-bottom">`,
									`<ul class="w3-ul">`,
									tmplinks[o].map(k => `<li>${k}</li>`).join('\n'),
									`</ul>`,
									`</div>`,
									`</li>`,
								].join('\n'));
							});
							out.push('</ul>');
							rtitle = islink = tmplinks = gm = undefined;
						});
						sels = gmap = undefined;
					}
					break;
			}
		});

		cid = color = mapcolor = icon = undefined;
		title = type = nid = undefined;
		checkfloat = iscoordinates = isurl = setvalue = gtype = undefined;

		return out.join('');
	},
	singlerecordanalysis: data => {
		let out = [];
		let nid = null;
		let color = null;
		let background = null;
		//let mapcolor = null;
		let icon = null;
		let title = null;
		let type = null;
		
		data.forEach((result, i) => {
			switch(i) {
				case 0:
					nid =  result.values[0][0];
					type = result.values[0][1];
					title = result.values[0][2];
					color = `${G.primaryrecords[type].color}-text`;
					//background = G.primaryrecords[type].background;
					//mapcolor = Utils.getcolorfromcss(`.${color}`, 'color');
					icon = G.primaryrecords[type].icon;
					out.push([
						`<h4 class="${color}" style="padding-left:0">`,
						`<span class="w3-margin-right w3-tooltip">`,
						`<i class="fas fa-${icon}"></i>`,
						`<span style="position:absolute;left:0;bottom:18px;width:180px" `,
						`class="w3-text w3-tag">${type}; ID: ${nid}</span>`,
						`</span>`,
						`${Utils.escapeHTML(title)}`,
						`</h4>`,
					].join(''));

					out.push([
						`<div id="frequences_${nid}" class="row" style="width:100%"></div>`,
					].join(''));
					break;
				default:
					break;
			}
		});
		
		return out.join('');
	},
	singlerecordrelations: data => {
		let out = [];
		let nid = null;
		let color = null;
		let background = null;
		let mapcolor = null;
		let icon = null;
		let title = null;
		let type = null;
		
		data.forEach((result, i) => {
			switch(i) {
				case 0:
					nid =  result.values[0][0];
					type = result.values[0][1];
					title = result.values[0][2];
					color = `${G.primaryrecords[type].color}-text`;
					background = G.primaryrecords[type].background;
					mapcolor = Utils.getcolorfromcss(`.${color}`, 'color');
					icon = G.primaryrecords[type].icon;
					out.push([
						`<h4 class="${color}" style="padding-left:0">`,
						`<span class="w3-margin-right w3-tooltip">`,
						`<i class="fas fa-${icon}"></i>`,
						`<span style="position:absolute;left:0;bottom:18px;width:180px" `,
						`class="w3-text w3-tag">${type}; ID: ${nid}</span>`,
						`</span>`,
						`${Utils.escapeHTML(title)}`,
						`</h4>`,
					].join(''));

					out.push([
						`<div id="relations_${nid}" class="row" style="width:100%"></div>`,
					].join(''));
					break;
				default:
					break;
			}
		});
		
		return out.join('');
	},
	
	/* Legends */
	prlegend: () => {
		let out = [];
		let prr = Object.assign({}, G.primaryrecords);
		let ul = document.createElement('ul');
		ul.classList.add('prlegend');
		ul.style.paddingLeft = 0;
		ul.style.marginBottom = '0.25em';
		Object.keys(prr).filter(o => prr[o].lang === Utils.l).forEach(o => {
			let color = Utils.rgb2hex(Utils.getcolorfromcss(`.${prr[o].color}`, 'color'));
			out.push([
				`<li>`,
				`<span class="empty-diamond" `,
				`style="height:12px;width:12px;margin-right:5px;background-color:${color}">`,
				`</span>`,
				o,
				`</li>`,
			].join('\n'));
			color = undefined;
		});
		ul.innerHTML = out.join('\n');
		out = prr = undefined;
		return ul;
	},
	
	/* Google style queries */
	tokenize: input => {
		input = input.trim();
	
		let pattern = /(\w+:|-|\+)?("[^"]*"|'[^']*'|[^\s]+)/g;
		let results = [];
		let matched;
	
		while(matched = pattern.exec(input)) {
			let prefix = matched[1];
			let term = matched[2];
			let result = {};
	
			if(/^".+"$/.test(term)) {
				term = term.replace(/"/g, '');
				result.phrase = true;
			}
			if(/^'.+'$/.test(term)) {
				term = term.replace(/'/g, '');
				result.phrase = true;
			}
	
			result.term = term;
	
			if (prefix) {
				if (prefix == '-') {
					result.exclude = true;
				} else if (prefix == '+') {
					result.include = true;
				} else {
					result.tag = prefix.slice(0, -1);
				}
			}
	
			results.push(result);
			prefix = term = result = undefined;
		}
	
		pattern = matched = undefined;
		
		return results;
	},
	
	/* Exportation */
	
	exportcsv: (table, separator = '\t') => {
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
	},
	exportjson: (object = {}) => {
		let exportable = JSON.stringify(object, null, 4);

		let filename = `PW_FILTER_${Math.random().toString(36).substring(7)}.json`;
		let link = document.createElement('a');
		link.style.display = 'none';
		link.setAttribute('target', '_blank');
		link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportable));
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		exportable = filename = link = undefined;
	},
	exportimage: function (content, filename, contentType = 'application/octet-stream') {
		let a = document.createElement('a');
		let blob = new Blob([content], {
			'type': contentType
		});

		a.href = window.URL.createObjectURL(blob, {oneTimeOnly: true});
		a.download = filename;
		document.body.appendChild(a);

		a.onclick = () => {
			window.setTimeout(() => { 
				window.URL.revokeObjectURL(a.href); 
				document.body.removeChild(a);
				a = blob = undefined;
			}, 0);
		};		
		
		a.click();
	},
	
	/* String comparison */
	/* As seen at https://github.com/aceakash/string-similarity but slightly modified */
	comparestrings: (first, second) => {
		first = first.replace(/\s+/g, '');
		second = second.replace(/\s+/g, '');
		
		if (!first.length && !second.length) return 1; // if both are empty strings
		if (!first.length || !second.length) return 0; // if only one is empty string
		if (first === second) return 1; // identical
		if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
		if (first.length < 2 || second.length < 2) return 0;  // if either is a 1-letter string
		
		let firstBigrams = new Map();
		for(let i = 0, len = first.length; i < len - 1; i++) {
			const bigram = first.substring(i, i + 2);
			const count = firstBigrams.has(bigram)
				? firstBigrams.get(bigram) + 1
				: 1;
			firstBigrams.set(bigram, count);
		};
		
		let intersectionSize = 0;
		for(let i = 0, len = second.length; i < len - 1; i++) {
			const bigram = second.substring(i, i + 2);
			const count = firstBigrams.has(bigram)
				? firstBigrams.get(bigram)
				: 0;
			if(count > 0) {
				firstBigrams.set(bigram, count - 1);
				intersectionSize++;
			}
		}
		
		firstBigrams = undefined;
		return (2.0 * intersectionSize) / (first.length + second.length - 2);
	},
	comparearrays: (a, b) => a.every(e => b.includes(e)),
	ratearray: (mainString, targetStrings, targetArray) => {
		function areargsvalid(mainString, targetStrings, targetArray) {
			if (typeof mainString !== 'string') return false;
			if (!Array.isArray(targetStrings)) return false;
			if (!Array.isArray(targetArray)) return false;
			if (!targetStrings.length) return false;
			if (!targetArray.length) return false;
			if (targetStrings.length !== targetArray.length) return false;
			if (targetStrings.find(s => typeof s !== 'string')) return false;
			return true;
		}
		if (!areargsvalid(mainString, targetStrings, targetArray)) throw new Error('findbestmatch: bad arguments');
		
		let ratings = [];
		let bestMatchIndex = 0;
		
		for(let i = 0, len = targetStrings.length; i < len; i++) {
			const currentTargetString = targetStrings[i];
			const currentRating = Database.comparestrings(mainString, currentTargetString);
			ratings.push({
				target: currentTargetString, 
				rating: currentRating,
				value: [].concat(targetArray[i], [currentRating]),
			});
			if(currentRating > ratings[bestMatchIndex].rating) bestMatchIndex = i;
		}
		
		let bestMatch = ratings[bestMatchIndex]
		
		return { ratings, bestMatch, bestMatchIndex };
	},
	prepareglobstring: string => {
		let array = string.toLowerCase().split('');
		let replacements = {
			'a': 'aáàâä',
			'e': 'eéèêë',
			'i': 'iíìîï',
			'o': 'oóòôö',
			'u': 'uúùûü',
			'á': 'aáàâä',
			'é': 'eéèêë',
			'í': 'iíìîï',
			'ó': 'oóòôö',
			'ú': 'uúùûü',
			'à': 'aáàâä',
			'è': 'eéèêë',
			'ì': 'iíìîï',
			'ò': 'oóòôö',
			'ù': 'uúùûü',
			'â': 'aáàâä',
			'ê': 'eéèêë',
			'î': 'iíìîï',
			'ô': 'oóòôö',
			'û': 'uúùûü',
			'ä': 'aáàâä',
			'ë': 'eéèêë',
			'ï': 'iíìîï',
			'ö': 'oóòôö',
			'ü': 'uúùûü',
		};
		let alphabet = new Set('bcdfghjklmnñpqrstvwxyz'.split(''));
		let out = [];
		array.forEach(o => {
			if(alphabet.has(o)) {
				out.push(`[${o}${o.toUpperCase()}]`);
			} else if(replacements[o]) {
				out.push(`[${replacements[o]}${replacements[o].toUpperCase()}]`);
			} else {
				if(o === `'` || o === `"`) {
					out.push(`?`);
				} else {
					out.push(o);
				}
			}
		});
		array = replacements = alphabet = undefined;
		return out.join('');
	},
	highlight: (txt, term) => {
		if(!txt) return txt;
		if(!term) return txt;
		let text = txt;
		let regex = new RegExp(Database.prepareglobstring(decodeURI(term)), 'gi')
		return text.replace(regex, str => `<span style="background-color:yellow;">${str}</span>`);
	},

	/* Various helper functions */
	groupby: (arr, criteria) => {
		return arr.reduce(function (obj, item) {
			let key = typeof criteria === 'function' ? criteria(item) : item[criteria];
			if(!obj.hasOwnProperty(key)) obj[key] = [];
			obj[key].push(item);
			key = undefined;
			return obj;
		}, {});
	},
	groupbymultiple: (objectArray, ...properties) => {
		return [...Object.values(objectArray.reduce((accumulator, object) => {
			const key = JSON.stringify(properties.map((x) => object[x] || null));
			if (!accumulator[key]) {
				accumulator[key] = [];
			}
			accumulator[key].push(object);
			return accumulator;
		}, {}))];
	},
	
	/* EventListeners Functions */
	exporttable: event => {
		let target = (event.target.dataset.table || null) ? event.target.dataset.table : event.target.parentNode.dataset.table;
		Database.exportcsv(Utils.byId(target))
	}, 
	rowsperpagelist: event => {
		//let url = event.target.dataset.url === '' ? null : event.target.dataset.url;
		//let sort = event.target.dataset.sort === '' ? null : event.target.dataset.sort;
		//let currentpage = event.target.dataset.currentpage === '' ? null : event.target.dataset.currentpage;
		let query = event.target.dataset.query === '' ? null : event.target.dataset.query;
		
		let div = document.createElement('div');
		div.style.height = '40vh';
		div.style.overflow = 'hidden';
		div.style.overflowY = 'scroll';
		let array = [...Array(30).keys()].map(o => [`${String((o + 1) * 10)} ${Utils.c('rows')}`]);
		let list = Database.listcreate(null, array, 'tbl-rowsperpage', true);
		div.appendChild(list);
		document.querySelector('.modal-title').innerHTML = [
			`<span class="color-blue-400">`,
			`Pathwise. `,
			`${Utils.c('rows per page').uf()} `,
			`(${G.dbrecordsperpage})`,
			`</span>`,
		].join('');
		document.querySelector('.modal-body').appendChild(div);
		document.querySelector('.modal-mask').style.display = 'block';
		document.querySelector('.modal').style.display = 'block';
		div.querySelectorAll('li.tbl-rowsperpage').forEach(o => {
			M.add({
				el: o,
				event: 'click',
				fn: () => {
					G.dbrecordsperpage = Number(o.textContent.replace(' ' + Utils.c('rows'), ''));
					localStorage.setItem('pwrowsperpage', G.dbrecordsperpage);
					window.dispatchEvent(new Event('hashchange'));
					Utils.closemodal();
				}
			});
		});
		div = array = list = undefined;
	},
		
	/* Database Operations */
	calculatequery: command => {
		return new Promise((resolve, reject) => {
			if(G.appuseworker) {
				G.worker.onmessage = function (event) {
					resolve(event.data.results);
				};
				G.worker.onerror = function (event) {
					reject(event);
				};
				G.worker.postMessage({ action: 'exec', sql: command });
			} else {
				resolve(G.db.exec(command));
			}
		});
	},
	calculaterows: command => {
		return new Promise((resolve, reject) => {
			let aquery = command.split(';');
			Database.calculatequery(aquery[0] + ';').then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	},
};

export default Database;
