import Utils from './Utils.js'
import Database from './Database.js'
import Queries from './Queries.js'

import '../../vendor/anychart/js/anychart-custom-build.min.js'

const Charts = {
	pie: (values, cid, title = 'untitled') => {
		if(!cid) return;
		if(!values) return;
		anychart.onDocumentReady(function() {
			Utils.cleardomnode(cid);
			if(Utils.l === 'es') {
				anychart.format.locales['es-es'] = C.es.ac;
				anychart.format.inputLocale('es-es');
				anychart.format.outputLocale('es-es');
			}
			let chart = anychart.pie(values);
			let date = new Date()
			chart.innerRadius('30%');
			chart.container(cid);
			chart.credits().enabled(false);
			chart.title(`${title} ${date.toLocaleDateString(Utils.l)}`);
			chart.labels().position('outside');
			chart.tooltip().format(`${Utils.c('value')}: {%Value}`);
			chart.legend().position('right');
			chart.legend().align('top');
			chart.legend().itemsLayout('vertical');
			chart.title().orientation('bottom');
			chart.title().align('left');
			chart.contextMenu(true);
			chart.draw();
			
			chart = undefined;
		});
	},
	singlepointmap: e => {
		let type = e.target.dataset.type || 'plain';
		let point = e.target.dataset.coordinates || '0,0,0';
		let lat = parseFloat(point.split(',')[0]);
		let lon = parseFloat(point.split(',')[1]);
		let cid = e.target.dataset.cid;
		let title = e.target.dataset.title || Utils.c('n/a');
		let text = e.target.dataset.text || e.target.dataset.title;
		let shorttext = e.target.dataset.shorttext || e.target.dataset.title;

		let titleElm = document.querySelector('.modal-title');
		let outputElm = document.querySelector('.modal-body');
		titleElm.innerHTML = title;
		outputElm.innerHTML = '';
		outputElm.dataset.map = cid;
		
		let wrapper = document.createElement('div');
		wrapper.id = 'txt-body';
		
		let div = document.createElement('div');
		div.id = cid;
		div.style.height = '40vh';
		div.style.width = window.screen.availWidth < 420 ? '220px' : '500px';
		div.style.padding = '0';
		div.style.marginLeft = 'auto';
		div.style.marginRight = 'auto';
		div.innerHTML = `${Utils.c('working').uf()}&hellip;`;
		
		wrapper.appendChild(div);
		outputElm.appendChild(wrapper);

		document.querySelector('.modal-mask').style.display = 'block';
		document.querySelector('.modal').style.display = 'block';

		Utils.fetchjsonasync(`./assets/vendor/anychart/geodata/custom/world/world.json`).then(json => {
			anychart.onDocumentReady(function() {
				Utils.cleardomnode(cid);
			    let data = [
			    	{name: shorttext, lat: point.split(',')[0], long: point.split(',')[1]}
			    ];
			    let map = anychart.map();
				map.credits().enabled(false);
			
				map.unboundRegions()
					.enabled(true)
					.fill('#E1E1E1')
					.stroke('#D2D2D2');
				map.padding([10, 0, 10, 10]).geoData(json);
				map.interactivity().selectionMode('none');
				map.title()
					.enabled(true)
					.useHtml(true)
					.padding([10, 0, 10, 0])
					.text(text);
			
			    let mapseries = map.marker(anychart.data.set(data));
			
			    mapseries.size(5).geoIdField('code_hasc');
			
				mapseries.hovered()
					.size(8)
					.stroke(mapseries.stroke())
					.fill(mapseries.fill());
				
				mapseries.tooltip()
					.useHtml(true)
					.title(false)
					.separator(false)
					.format(function() {
						return text;
					});

				let zoomController = anychart.ui.zoom();
				zoomController.render(map);
			
				map.container(cid);
				map.draw();
							
				type = point = lat = lon = cid = title = shorttext = undefined;
				titleElm = outputElm = wrapper = div = data = mapseries = map = zoomController = undefined;
			});
		});
	},
	area: (cid, cdata, title = 'untitled', ytitle = 'untitled', seriesname = 'untitled', cranges = {}) => {
		if(!cid) return;
		if(!cdata) return;
		anychart.onDocumentReady(function () {
			Utils.cleardomnode(cid);
			if(Utils.l === 'es') {
				anychart.format.locales['es-es'] = C.es.ac;
				anychart.format.inputLocale('es-es');
				anychart.format.outputLocale('es-es');
			}
			let dataSet = anychart.data.set(cdata.map(o => [o.xlabel, o.count]));
		
			let seriesData = dataSet.mapAs({'x': 0, 'value': 1});
			
			let chart = anychart.area();
			chart.yAxis().labels().format('{%Value}');
			
			chart.animation(true);
		
			chart.yAxis().title(ytitle);
			chart.xAxis().labels().padding([5, 5, 0, 5]);
		
			chart.yGrid(true)
				.xGrid(true);
				
			if(Object.keys(cranges).length) {
				Object.keys(cranges).forEach((o, i) => {
					let cmarker = chart.rangeMarker(i);
					cmarker.from(cranges[o].start);
					cmarker.to(cranges[o].end);
					cmarker.axis(chart.xAxis());
					cmarker.fill(o);
					cmarker = undefined;
				});
			}

			let crosshair = chart.crosshair();
			crosshair.enabled(true)
				.yStroke(null)
				.xStroke('#fff')
				.zIndex(99);
			crosshair.yLabel(false);
			crosshair.xLabel(false);
		
			chart.title()
				.enabled(true)
				.useHtml(true)
				.text(title)
				.padding([0, 0, 20, 0]);
		
		    let series = chart.splineArea(seriesData);
			series.name(seriesname);
			series.color('Gold 0.5');
			series.markers()
				.enabled(true)
				.type('circle')
				.size(4)
				.stroke('1.5 #fff')
				.zIndex(100);
			
			chart.tooltip()
				.positionMode('chart')
				.anchor('right-top')
				.position('right-top')
				.offsetX(50)
				.offsetY(50);
		
			chart.interactivity().hoverMode('by-x');
		
		    chart.container(cid);
			chart.credits().enabled(false);
		    chart.draw();
		    
		});

	},
	venn: (cid, cdata, title = 'untitled') => {
		if(!cid) return;
		if(!cdata) return;
		if(cdata.length < 1) return;

		if(!O) Utils.overlay();
		anychart.onDocumentReady(function () {
			Utils.cleardomnode(cid);
			if(Utils.l === 'es') {
				anychart.format.locales['es-es'] = C.es.ac;
				anychart.format.inputLocale('es-es');
				anychart.format.outputLocale('es-es');
			}

			let chart = anychart.venn(cdata);
			chart.credits().enabled(false);
			chart.container(cid);

			chart.stroke('2 #ccc');
			chart.intersections().hovered().fill('black 0.25');
			
			chart.labels().format('{%name}\n{%value}');
			chart.labels().fontColor('#ddd');
			chart.intersections().labels(false);
			chart.tooltip().titleFormat('{%name}\n{%value}');
			chart.intersections().tooltip().format('{%x}\n{%name}\n{%value}');
			
			chart.legend()
				.position('right')
				.itemsLayout('vertical')
				.padding({left: 35});

			chart.draw();
        
			chart = undefined;
		});
	},
	sankey: (cid, cdata, title = 'untitled') => {
		if(!cid) return;
		if(!cdata) return;
		if(cdata.length < 1) return;

		if(!O) Utils.overlay();
		anychart.onDocumentReady(function () {
			Utils.cleardomnode(cid);
			if(Utils.l === 'es') {
				anychart.format.locales['es-es'] = C.es.ac;
				anychart.format.inputLocale('es-es');
				anychart.format.outputLocale('es-es');
			}

			let chart = anychart.sankey();
			chart.credits().enabled(false);
			chart.title(title);
			chart.title().padding([0, 0, 30, 0])
			chart.data(cdata);

			chart.padding(20, 20, 20, 40);
			chart.curveFactor(0.2);
			chart.nodeWidth(50);
			chart.nodePadding(30);
			chart.node().normal().labels()
				.anchor('center-bottom')
				.position('center-top');

			chart.node().tooltip().anchor('center-bottom');

			chart.flow().tooltip().enabled(false);
			chart.dropoff().tooltip().enabled(false);

			chart.node().tooltip().useHtml(true).format(function () {
				let tooltip = [];
				let income = 0;
				let outcome = 0;
				let ul = [];
				if(this.income.length) {
					ul = [];
					ul.push(`<ul>`);
					for(let i = 0; i < this.income.length; i++) {
						ul.push(`<li>${this.income[i].name}: ${this.income[i].value}</li>`);
						income += this.income[i].value;
					}
					ul.push(`</ul>`);
					tooltip.push(`<h5>${Utils.c('income')} (${income }):</h5>`);
					tooltip.push(ul.join(''));
				}
				if(this.outcome.length) {
					ul = [];
					ul.push(`<ul>`);
					for(let i = 0; i < this.outcome.length; i++) {
						ul.push(`<li>${this.outcome[i].name}: ${this.outcome[i].value}</li>`);
						outcome += this.outcome[i].value;
					}
					ul.push(`</ul>`);
					tooltip.push(`<h5>${Utils.c('outcome')} (${outcome}):</h5>`);
					tooltip.push(ul.join(''));
				}
				if(this.dropoff > 0) {
					tooltip.push(`<h5>${Utils.c('dropoff')}: ${this.dropoff}</h5>`);
				}
				if(this.isConflict) {
					if(income > outcome + this.dropoff) {
						let conflict = income - (outcome + this.dropoff);
						tooltip.push([
							`<h5>${Utils.c('balance')}:</h5>`,
							`<ul><li>${Utils.c('income is greater than outcome by')} ${conflict}</li></ul>`,
						].join(''));
						conflict = undefined;
					} else {
						let conflict = (outcome + this.dropoff) - income;
						tooltip.push([
							`<h5>${Utils.c('balance')}:</h5>`,
							`<ul><li>${Utils.c('outcome is greater than income by')} ${conflict}</li></ul>`,
						].join(''));
						conflict = undefined;
					}
				}
				income = outcome = ul = undefined;
				return tooltip.join('');
			});

			/*
			chart.node().labels().useHtml(true).format(function () {
				if (this.isConflict) {
					return '[' + this.name + ']';
				} else {
					return this.name;
				}
			});
			*/
 			chart.flow({
				normal: {
					fill: function () {
						return anychart.color.lighten(this.sourceColor, .5) + ' ' + .3
					},
				},
				hovered: {
					fill: function () {
						return this.sourceColor + ' ' + .9
					},
				}
			});

			chart.container(cid);
			chart.draw();
		});
	},
	treemap: (cid, cdata, title = 'untitled') => {
		if(!cid) return;
		if(!cdata) return;
		if(cdata.length < 1) return;

		if(!O) Utils.overlay();
		anychart.onDocumentReady(function () {
			Utils.cleardomnode(cid);
			if(Utils.l === 'es') {
				anychart.format.locales['es-es'] = C.es.ac;
				anychart.format.inputLocale('es-es');
				anychart.format.outputLocale('es-es');
			}

			let datatree = anychart.data.tree(cdata, 'as-table');
			let chart = anychart.treeMap(datatree);

			chart.title()
				.enabled(true)
				.useHtml(true)
				.padding([0, 0, 20, 0])
				.text(title);

			let intervals = cdata.filter(o => o.value && o.parent !== null).map(o => o.value).intervals(9);
			let ranges = [];
			intervals.forEach((o, i) => {
				if(i === 0) {
					ranges.push({less: o[1]});
				} else {
					if(i === intervals.length - 1) {
						ranges.push({greater: o[0]});
					} else {
						ranges.push({from: o[0], to: o[1]});
					}
				}
			});
			
			let scale = anychart.scales.ordinalColor(ranges);

			scale.colors(G.appscales.colors[G.appdata.activestyles.scale]);

			chart.padding([10, 10, 10, 20])
				.maxDepth(2)
				.selectionMode('none')
				.colorScale(scale)
				.hovered({fill: '#bdbdbd'});

			chart.legend()
				.enabled(true)
				.padding([0, 0, 0, 20])
				.position('right')
				.align('top')
				.itemsLayout('vertical');

			chart.labels()
				.useHtml(true)
				.fontSize(12)
				.format(function () {
					return [
						`<span style="color:`,
						this.value >= ranges.find(o => o.greater).greater ? '#ffffff' : '#212121',
						`">${this.getData('name')}</span>`,
					].join('');
				});

			chart.headers().format(function () {
				return this.getData('name');
			});

			chart.tooltip()
				.useHtml(true)
				.titleFormat(function () {
					return this.getData('name');
				})
				.format(function () {
					return [
						`<span style="color: #bfbfbf">${Utils.c('items')}: </span>`,
						anychart.format.number(this.value, {groupsSeparator: `${Utils.l === 'es' ? '.' : ','}`}),
					].join('');
				});

			
			chart.credits().enabled(false);
			chart.container(cid);
			chart.draw();
			
			datatree = chart = scale = undefined;
		});
	},
	forcedirect: (cid, cdata, title = 'untitled') => {
		if(!cid) return;
		if(!cdata) return;
		if(cdata.length < 1) return;

		if(!O) Utils.overlay();
		anychart.onDocumentReady(function () {
			Utils.cleardomnode(cid);
			if(Utils.l === 'es') {
				anychart.format.locales['es-es'] = C.es.ac;
				anychart.format.inputLocale('es-es');
				anychart.format.outputLocale('es-es');
			}

			let chart = anychart.venn(cdata);
			chart.credits().enabled(false);
			chart.container(cid);
		});
	},
	geoipinfolistener: e => {
		let trigger = {
			target: {
				dataset: {
					type: e.target.dataset.type || 'map',
					coordinates: [
						`${G.currentgeoipdata.latitude || '0'}`,
						`${G.currentgeoipdata.longitude || '0'}`,
						`0`,
					].join(','),
					cid: 'geoipmap',
					title: [
						`${G.appdata.name}`,
						`${Utils.c('geolocation').uf()}`,
					].join('. '),
					shorttext: G.currentgeoipdata.city || Utils.c('n/a'),
					text: [
						`${G.currentgeoipdata.ip || Utils.c('n/a')}; `, 
						`${G.currentgeoipdata.country || Utils.c('n/a')}; `,
						`${G.currentgeoipdata.region || Utils.c('n/a')};`,
						`${G.currentgeoipdata.city || Utils.c('n/a')}; `,
						`&#177; ${G.currentgeoipdata.accuracy || Utils.c('n/a')} `,
						`${G.currentgeoipdata.accuracyunits || Utils.c('n/a')}; `,
						`${G.currentgeoipdata.organization_name || Utils.c('n/a')}`,
					].join('\n'),
				},
			},
		};
		Charts.singlepointmap(trigger);
	},
};

export default Charts;
