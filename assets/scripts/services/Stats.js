import Utils from './Utils.js'
import Database from './Database.js'
import Helpers from './StatsHelpers.js'
import Charts from './Charts.js'
import Tags from './Tags.js'

const Stats = {
	frequences: (nid, fields, table) => {
		// joint symbol = ' ⊃ '
		if(!nid || !fields || !table) return;
		let out = [];

		function calculate_frequences(e) {
			let keys = [];
			let list = [];
			let whitelist = G.frequences.whitelist;
			let nest = (items, id = null, link = 'parent_id') => items
				.filter(item => item[link] === id)
				.map(item => ({ ...item, children: nest(items, item.id) }));
			let hasvalues = (vals, nonzero = true) => {
				let original = Object.values(vals);
				let isok = true;
				original.forEach(v => {
					if(v === null) {
						isok = false;
					} else {
						switch(typeof v) {
							case 'number':
								if(nonzero) {
									if(v === 0) isok = false;
								}
								break;
							case 'object':
								if(Array.isArray(v)) {
									if(v.length === 0) isok = false;
								} else {
									if(Object.keys(v).length === 0) isok = false;
								}
								break;
							case 'string':
							default:
								if(String(v).trim() === '') isok = false;
								if(Utils.c(String(v).trim().toLowerCase()) === Utils.c('null')) isok = false;
								if(nonzero && Number(v) === 0) isok = false;
								break;
						}
					}
				});
				return isok;
			}
			let notnulls = Utils.byId(`analysis_features_nulls_${nid}`) ? 
				Utils.byId(`analysis_features_nulls_${nid}`).checked : 
				false;
			document.querySelectorAll('.tag').forEach(elm => {
				keys.push(elm.dataset.value);
			});
			if(!keys.length) {
				keys = list = whitelist = undefined;
				return;
			}

			table.forEach(t => {
				let tmp = {};
				keys.forEach(f => {
					if(whitelist.includes(f)) {
						tmp[f] = f === 'decade' ? 
							Utils.decade(t.starty) : 
							G.frequences.agelist.includes(f) ? 
								t[`age${f.charAt(0)}`] : 
								t[`start${f.charAt(0)}`];
					} else {
						tmp[f] = t[f];
					}
				});
				if(notnulls) {
					if(hasvalues(tmp)) list.push(tmp);
				} else {
					list.push(tmp);
				}
				tmp = undefined;
			});

			let tmp = Helpers.frequence(list);
			let outliers = tmp.map(o => o[1]).outliers();

			let q1 = tmp.map(o => o[1]).percentile(25); //outliers.q1;
			let q3 = tmp.map(o => o[1]).percentile(75); //outliers.q3;
			let set = new Set((outliers || {values: []}).values.filter(o => o.outlier).map(o => o.value));

			let firstcolor = '#ff6666'; //colorset.next().hex;
			let secondcolor = '#ff9999'; //colorset.next().hex;
			let thirdcolor = '#ffcccc'; // colorset.next().hex;
			
			let frequences = tmp.map(o => Object.assign({}, {
				fields: o[0], 
				count: o[1], 
				outlier: set.has(o[1]),
				linecolor: '#ccc',
			}));
			if(Utils.byId(`analysis_features_outliers_${nid}`).checked) {
				frequences = frequences.filter(o => o.outlier)
			}
			let calcs = {
				count: frequences.length,
				sum: frequences.map(o => o.count).sum(),
				outliers: frequences.filter(o => o.outlier).length,
				mode: frequences.map(o => o.count).mode(),
				mean: frequences.map(o => o.count).mean(1),
				median: frequences.map(o => o.count).median(),
				stdev: frequences.map(o => o.count).standardDeviation(),
				sterror: frequences.map(o => o.count).standardError(),
				q1: q1,
				q3: q3,
				entropy: frequences.map(o => o.count).entropy(),
				kurtosis: frequences.map(o => o.count).kurtosis(),
				skewness: frequences.map(o => o.count).fisherSkewness(),
				gaussian: frequences.gaussiansort('count'),
				empiricalrule: null,
				valids: list.length,
				outlierspercent: frequences.filter(o => o.outlier).length / frequences.length,
				validspercent: list.length / table.length,
			};
			
			calcs.empiricalrule = calcs.gaussian.map(o => o.count).empiricalRule();
			
			let sigmas = {
				t: [calcs.empiricalrule['99.7%'].lower, calcs.empiricalrule['99.7%'].upper],
				s: [calcs.empiricalrule['95%'].lower, calcs.empiricalrule['95%'].upper],
				f: [calcs.empiricalrule['68%'].lower, calcs.empiricalrule['68%'].upper],
			};
			
			calcs.gaussian = calcs.gaussian.map(o => {
				if(Number(o.count).between(sigmas.t[0], sigmas.t[1])) o.linecolor = thirdcolor;
				if(Number(o.count).between(sigmas.s[0], sigmas.s[1])) o.linecolor = secondcolor;
				if(Number(o.count).between(sigmas.f[0], sigmas.f[1])) o.linecolor = firstcolor;
				return o;
			});

			let ranges = Object.assign({}, G.frequences.confidencelevels);
			let confidences = {
				homogeneity: {
					sample: null,
				},
				kurtosis: {
					full: ranges.kurtosis.min.range(ranges.kurtosis.max),
					ok: [],
					sample: null,
				},
				skewness: {
					full: ranges.skewness.min.range(ranges.skewness.max),
					ok: [],
					sample: null,
				},
			};
			confidences.kurtosis.ok = [confidences.kurtosis.full.percentile(25), confidences.kurtosis.full.percentile(75)];
			confidences.skewness.ok = [confidences.skewness.full.percentile(25), confidences.skewness.full.percentile(75)];
			
			confidences.homogeneity.sample = [
				`<strong class="w3-text-`,
				calcs.entropy.homogeneity.between(0.7, 1) ? 'green' : calcs.entropy.homogeneity < 0.4 ? 'red' : 'amber',
				`">`,
				`${(calcs.entropy.homogeneity * 100).toLocaleString(Utils.l)}`,
				`%</strong>`,
			].join('');
			confidences.kurtosis.sample = [
				`<strong class="w3-text-`,
				calcs.kurtosis.between(confidences.kurtosis.ok.min(), confidences.kurtosis.ok.max()) ? 
					'green' : 
					calcs.kurtosis.between(confidences.kurtosis.full.min(), confidences.kurtosis.full.max()) ? 'amber' : 'red',
				`">`,
				`${calcs.kurtosis.toLocaleString(Utils.l)}`,
				`%</strong>`,
			].join('');
			confidences.skewness.sample = [
				`<strong class="w3-text-`,
				calcs.skewness.between(confidences.skewness.ok.min(), confidences.skewness.ok.max()) ? 
					'green' : 
					calcs.skewness.between(confidences.skewness.full.min(), confidences.skewness.full.max()) ? 'amber' : 'red',
				`">`,
				`${calcs.skewness.toLocaleString(Utils.l)}`,
				`%</strong>`,
			].join('');
				
			Utils.cleardomnode(Utils.byId(`analysis_descriptive_stats_${nid}`));
			Utils.cleardomnode(Utils.byId(`frequences_table_${nid}`));
			
			let percolors = {
				outliers: calcs.outlierspercent < 0.2 ? 'green' : calcs.outlierspercent < 0.5 ? 'orange' : 'red',
				valids: calcs.validspercent < 0.2 ? 'red' : calcs.validspercent < 0.5 ? 'orange' : 'green',
			};
			Utils.msg(
				`analysis_descriptive_stats_${nid}`,
					[
						`${Utils.c('count')}: <strong>${calcs.count.toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('sum')}: <strong>${calcs.sum.toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('outliers')}: <strong>${calcs.outliers.toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('q1/q3')}: <strong>${calcs.q1.toLocaleString(Utils.l)} / ${calcs.q3.toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('mean')}: <strong>${calcs.mean.toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('median')}: <strong>${calcs.median.toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('mode')}: <strong>[${calcs.mode.join(', ')}]</strong>`,
						`${Utils.c('standard deviation')}: <strong>${(calcs.stdev || 0).toLocaleString(Utils.l)}</strong>`,
						`${Utils.c('standard error')}: <strong>${(calcs.sterror || 0).toLocaleString(Utils.l)}</strong>`,
						[
							`${Utils.c('entropy')}: `,
							`<strong>${calcs.entropy.current.toLocaleString(Utils.l)}</strong>`,
							` / `,
							`<strong>${calcs.entropy.max.toLocaleString(Utils.l)}</strong>`,
						].join(''),
						`${Utils.c('homogeneity')}: ${confidences.homogeneity.sample}`,
						`${Utils.c('kurtosis')}: ${confidences.kurtosis.sample}`,
						`${Utils.c('skewness')}: ${confidences.skewness.sample}`,
						[
							`${Utils.c('outliers percent')}: `,
							`<strong class="w3-text-${percolors.outliers}">${(calcs.outlierspercent * 100).toLocaleString(Utils.l)}%</strong>`,
						].join(''),
						[
							`${Utils.c('valid percent')}: `,
							`<strong class="w3-text-${percolors.valids}">${(calcs.validspercent * 100).toLocaleString(Utils.l)}%</strong>`,
						].join(''),
					].join('; ')
			);
			Utils.byId(`analysis_descriptive_stats_${nid}`).style.display = 'block';
			percolors = undefined;
			
			if(frequences.length) {
				Utils.byId(`frequences_table_${nid}`).appendChild(Database.tablecreate(
					Utils.c('frequences table').uf(), 
					Object.keys(frequences[0]).map(o => Utils.c(o)), 
					frequences.map(o => Object.values(o))
				));
				
				Utils.byId(`frequences_chart_normalized_${nid}`).style.display = 'block';
				//Utils.byId(`frequences_chart_linear_${nid}`).style.display = 'block';
				
				let cranges = {};
				calcs.gaussian.forEach((o, i) => {
					if(!Object.keys(cranges).includes(o.linecolor)) {
						cranges[o.linecolor] = {start: o.fields, end: o.fields};
					} else {
						cranges[o.linecolor].end = o.fields;
					}
				});
				Charts.area(
					`frequences_chart_normalized_${nid}`, 
					calcs.gaussian.map(o => Object.assign({}, o, {
						xlabel: o.fields, 
						yvalue: o.count,
						linecolor: o.linecolor,
					})),
					Utils.c('normalized'),
					Utils.c('count'),
					Utils.c('frequence'),
					cranges
				);
				/*
				Charts.area(
					`frequences_chart_linear_${nid}`, 
					frequences.map(o => Object.assign({}, o, {
						xlabel: o.fields, 
						yvalue: o.count,
						linecolor: o.linecolor,
					})),
					Utils.c('linear')
				);
				Charts.forcedirected(
					`frequences_chart_linear_${nid}`, 
					frequences.map(o => Object.assign({}, o, {
						xlabel: o.fields, 
						yvalue: o.count,
						linecolor: o.linecolor,
					})),
					Utils.c('linear')
				);
				*/
			}
			
			keys = list = whitelist = hasvalues = tmp = outliers = q1 = q3 = set = undefined;
			frequences = calcs = undefined;
			ranges = confidences = undefined;
			firstcolor = secondcolor = thirdcolor = sigmas = undefined;
		}
		
		out.push([
			`<h4 class="w3-text-theme">`,
			Utils.c('frequences').uf(),
			`</h4>`,
			
			`<p>`,
			`${Utils.c('include').uf()}:&nbsp;&nbsp;`,

			`<input type="checkbox" class="w3-check lst-features" id="analysis_features_outliers_${nid}">`,
			`<label class="chk" for="analysis_features_outliers_${nid}" style="display:inline">${Utils.c('outliers only')}</label>`,

			`<input type="checkbox" class="w3-check w3-margin-left lst-features" id="analysis_features_nulls_${nid}">`,
			`<label class="chk" for="analysis_features_nulls_${nid}" style="display:inline">${Utils.c('valid only')}</label>`,

			`<a class="help-window w3-margin-left" data-help="frequences" `,
			`href="javascript:;">[${Utils.c('help')}]</a>`,
			`</p>`,

			`<div class="w3-row-padding" style="padding-left:0;padding-right:0">`,
			`<div class="w3-col s12 m10 l10" style="padding-left:0;height:43px">`,
			`<input class="w3-input" id="frequences_input_${nid}" placeholder="${Utils.c('field')}">`,
			`</div>`,
			`<div class="w3-col s12 m2 l2" style="padding-right:0">`,
			`<button class="w3-button w3-theme-d5" `,
			`id="frequences_calculate_${nid}">${Utils.c('calculate')}</button>`,
			`</div>`,
			`</div>`,
			
			`<div id="analysis_descriptive_stats_${nid}" `,
			`class="w3-panel w3-light-grey w3-leftbar w3-padding-large w3-margin-top" `,
			`style="display:none">`,
			`</div>`,

			`<div id="frequences_table_${nid}" class="w3-row"></div>`,
			
			`<div id="frequences_chart_normalized_${nid}" class="w3-panel w3-border w3-margin-top" style="height:550px;display:none"></div>`,
			`<div id="frequences_chart_linear_${nid}" class="w3-panel w3-border w3-margin-top" style="height:550px;display:none"></div>`,
		].join(''));
		
		Utils.msg(`frequences_${nid}`, out.join('\n'));

		new Tags(
			Utils.byId(`frequences_input_${nid}`),
			fields.map(o => ({name: Utils.c(o), value: o})).sort((a, b) => a.name.localeCompare(b.name)),
			'name',
			'value',
			true
		);
		
		Utils.byId(`frequences_${nid}`).querySelectorAll('.help-window').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: Utils.helplistener
			});
	    });
		M.add({
			el: Utils.byId(`frequences_calculate_${nid}`),
			event: 'click',
			fn: calculate_frequences
		});
		M.add({
			el: Utils.byId(`analysis_features_outliers_${nid}`),
			event: 'click',
			fn: calculate_frequences
		});
		M.add({
			el: Utils.byId(`analysis_features_nulls_${nid}`),
			event: 'click',
			fn: calculate_frequences
		});
		
		document.querySelectorAll('.export-table').forEach(o => {
			M.add({
				el: o,
				event: 'click',
				fn: Database.exporttable
			});
		});						
		document.querySelectorAll('.print-table').forEach(o => {
			M.add({
				el: o,
				event: 'click',
				fn: Utils.printtable
			});
		});	
	},
	relations: (nid, relations) => {
		if(!nid || !relations) return;
		let out = [];
		/*
		function calculate_relations(e) {
			Charts.forcedirected(
				`${nid}`, 
				relations,
				Utils.c('force directed')
			);
		}
		*/
		out.push([
			`<h4 class="w3-text-theme">`,
			Utils.c('relations').uf(),
			`</h4>`,
			
			`<p>`,
			`${Utils.c('include').uf()}:&nbsp;&nbsp;`,

			`<input type="checkbox" class="w3-check lst-features" id="relations_second_order_${nid}">`,
			`<label class="chk" for="analysis_features_outliers_${nid}" style="display:inline">${Utils.c('second order')}</label>`,

			`<a class="help-window w3-tooltip w3-margin-left" data-help="relations" href="javascript:;">[*]`,
			`<span style="position:absolute;left:0;bottom:18px;width:180px" `,
			`class="w3-text w3-tag">${Utils.c('help')}</span>`,
			`</a>`,
			`</p>`,

			`<div class="w3-row-padding" style="padding-left:0;padding-right:0">`,
			`<div class="w3-col s12 m10 l10" style="padding-left:0;height:43px">`,
			`<input class="w3-input" id="relations_input_${nid}" placeholder="${Utils.c('field')}">`,
			`</div>`,
			`<div class="w3-col s12 m2 l2" style="padding-right:0">`,
			`<button class="w3-button w3-theme-d5" `,
			`id="relations_calculate_${nid}">${Utils.c('calculate')}</button>`,
			`</div>`,
			`</div>`,
			
			`<div id="relations_descriptive_stats_${nid}" `,
			`class="w3-panel w3-light-grey w3-leftbar w3-padding-large w3-margin-top" `,
			`style="display:none">`,
			`</div>`,

			`<div id="relations_table_${nid}" class="w3-row"></div>`,
			
			`<div id="graph_${nid}" class="w3-panel w3-border w3-margin-top" style="height:550px;display:none"></div>`,
		].join(''));
		
		Utils.msg(`relations_${nid}`, out.join('\n'));
	},
};

export default Stats;
