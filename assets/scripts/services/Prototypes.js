import Config from './Config.js'
import Utils from './Utils.js'
import HowToCiteText from './HowToCiteText.js'

const Prototypes = () => {
	// HTML Elements
	Object.defineProperties(HTMLElement.prototype, {
		print: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(query) {
				query = (document.body.dataset || {currentpage: 'untitled'}).currentpage;
				if(this.dataset && this.dataset.title) query = this.dataset.title;

				let xframe = document.createElement('IFRAME');
				let ad = Config.appdata;
				let appdata = [
					`${ad.name} v${ad.version}.${ad.subversion}.${ad.release}`,
					`${ad.date}. ${ad.license}. ${ad.author}. ${ad.authoremail}. `,
					`${ad.supporter}. ${ad.supporteremail}`,
				].join('');
				let curdate = new Date().toLocaleDateString(Utils.l, {dateStyle: 'long', timeStyle: 'long'});
				let copyright = [
					`&copy; 2020. All rights reserved / Derechos reservados`,
					`Printed / Impreso: ${curdate}`,
				].join('. ');
				let txt = HowToCiteText[Utils.l];
				let replacer = (text, u, t) => {
					let xcl = G.appactivecollection;
					let xnm = G.appcollections[xcl].name;
					let xds = G.appcollections[xcl].name;
					let out = text;
					let ctm = new Date();
					out = out.split('[sn]').join(xnm);
					out = out.split('[ln]').join(xds);
					out = out.split('[u]').join(u);
					out = out.split('[r]').join(t);
					out = out.split('[d]').join(`[${ctm.toLocaleDateString(Utils.l)}]`);
					xcl = xnm = xds = undefined;
					return out;
				};
				let tail = [
					`<p>${appdata}</p>`,
					`<p>${copyright}</p>`,
					replacer(txt.generic, window.location.href, query),
					`<p>`,
					`<img style="-webkit-user-select:none;margin:auto;" `,
					`src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURI(window.location.href)}">`,
					`</p>`,
				].join('');

				xframe.domain = document.domain;
				xframe.style.position = 'absolute';
				xframe.style.top = '-10000px';
				document.body.appendChild(xframe);
				
				xframe.contentDocument.write([
					`<h3 class="w3-text-grey">${G.appdata.name} v${ad.version}.${ad.subversion}.${ad.release}</h3>`,
					`<h1>${Utils.c(query).uf()}</h1><hr>`,
					this.outerHTML,
					`<hr>`,
					tail,
				].join('\n'));

				for(let i = 0; i < document.styleSheets.length; i++) {
					let ssheet = document.styleSheets[i];
					if(ssheet.href) {
						let ifstyle = xframe.contentDocument.createElement('link');
						ifstyle.rel = 'stylesheet';
						ifstyle.href = ssheet.href;			
						xframe.contentWindow.document.head.appendChild(ifstyle);
						ifstyle = undefined;
					}
					ssheet = undefined;
				}
				
				if(!O) Utils.overlay();
				setTimeout(function() {
					xframe.focus();
					xframe.contentWindow.print();
					xframe.parentNode.removeChild(xframe);
					ad = appdata = curdate = copyright = tail = txt = replacer = undefined;
					if(O) Utils.overlay();
				}, 3000);
				window.focus();
			}
		}
	});
	
	// Arrays
	Object.defineProperties(Array.prototype, {
		valid: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return !this.empty();
			}
		},
		empty: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return this.length === 0;
			}
		},
		isNaN: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				if(this.empty()) return NaN;
				return this.some(function(a){return isNaN(a)});
			}
		},
		solid: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return this.filter(a => a !== undefined && a !== 'undefined' && a!== void(0) && a !== null);
			}
		},
		stack: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				if(this.empty()) return []; 
				return this.map(function(a,b) { return this.reduce(function(c, d, e) { return c + ((e <= b) ? d : 0); }); }, this);
			}
		},
		module: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				return Math.sqrt(this.solid().reduce(function(a, b) { return a + b * b; }, 0));
			}
		},
		normalize: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmpa = this.module();
				return (tmpa !== 0) ? this.map(function(a,b) { return a / tmpa; }) : NaN;
			}
		},
		OR: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(arrB) {
				if(!arrB) return [];
				let tmpa = this.concat(arrB).unique();
				return (tmpa.isNaN()) ? tmpa.solid().sort() : tmpa.solid().sort((a, b) => a - b);
			}
		},
		AND: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(arrB) {
				if(!arrB) return [];
				let tmpa = this.filter(a => arrB.indexOf(a) > -1).unique();
				return (tmpa.isNaN()) ? tmpa.solid().sort() : tmpa.solid().sort((a, b) => a - b);
			}
		},
		XOR: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(arrB) {
				if(!arrB) return [];
				return this
					.filter(function (a) { return arrB.indexOf(a) < 0; })
					.unique()
					.OR(arrB.filter(function (b) { return this.indexOf(b) < 0; }, this)
					.unique());
			}
		},
		max: {
			configurable: true,
			enumerable: false,
			writable: true,
			value: function() {
				if(this.empty()) return NaN; 
				return this.isNaN() ? this.solid().sort().reverse()[0] : Math.max.apply(Math, this.solid());
			},
		},
		min: {
			configurable: true,
			enumerable: false,
			writable: true,
			value: function() {
				if(this.empty()) return NaN; 
				return this.isNaN() ? this.solid().sort()[0] : Math.min.apply(Math, this.solid());
			},
		},
		range: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(singlevalue = true) {
				if(this.empty()) return [NaN, NaN];
				if(singlevalue) {
					if(this.isNaN()) return NaN;
					return this.max() - this.min();
				} else {
					return [this.min(), this.max()];
				}
			},
		},
		midrange: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(start, end) {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				return this.range() / 2;
			},
		},
		intervals: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(num) {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let arr = this.slice();
				let max = arr.max();
				let min = arr.min();
				let c = Math.floor((max - min) / num);
				let r = [];
				for(let i = 0; i <= max; i += c) {
					let a = i == 0 ? i : i += 1;
					let b = i + c > max ? max : i + c;
					if (a < max) r.push([a, b])
				}
				return r;
			},
		},
		sum: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				return this.solid().reduce((a, b) => a + b, 0);
			},
		},
		percentile: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(i = 0) {
				if(this.empty()) return NaN; 
				let	tmpa = this.isNaN() ? this.solid().sort() : this.solid().sort((a, b) => a - b);
				let n = Math.floor(tmpa.length * i / 100);
				let m = (tmpa.length * i) % 100;
				return m === 0 ? (tmpa[n - 1] + tmpa[n]) / 2 : tmpa[n];
			},
		},
		frequency: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return {}; 
				if(this.isNaN()) return NaN;
				return this.reduce(function(a, b) {
					a[b] = (a[b] + 1) || 1;
					return a;
				}, {});
			},
		},
		mean: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(m = 1) {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				// mean (-1: harmo, 0: geo, 1: arit, 2: quad, ... n: n-mean)
				let tmpa = this.solid();
				let tmpb = tmpa.length;
				return (tmpb == 0) ? 
					null : 
					(m === 0) ? 
						Math.pow(tmpa.reduce(function(a, b) { return a * b; }), 1 / tmpb) : 
						Math.pow(tmpa.reduce(function(a, b) { return a + Math.pow(b, m)}, 0) / tmpb, (1 / m));
			},
		},
		median: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				return this.percentile(50);
			},
		},
		mode: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return []; 
				//if(this.isNaN()) return NaN;
				let tmpo = this.frequency();
				let mx = Math.max.apply(Math, Object.keys(tmpo).map(key => tmpo[key]));
				return Object.keys(tmpo).filter(a => tmpo[a] === mx).map(a => isNaN(a) ? a : 1 * a);	
			},
		},
		populationVariance: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let	tmpa = this.solid();
				let tmpb = this.mean(1);
				return tmpa.length < 2 ? null : tmpa.reduce((a, b) => a + Math.pow(b - tmpb, 2), 0) / tmpa.length;
			},
		},
		variance: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let	tmpa = this.solid();
				let tmpb = this.mean(1);
				if(tmpa.length < 2) return null;
				return tmpa.reduce((a, b) => a + Math.pow(b - tmpb, 2), 0) / (tmpa.length - 1);
			},
		},
		covariance: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(arrB) {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				if(this.length !== arrB.length) return null;
				let tmpa = this.map((a, b) => a * arrB[b]);
				return tmpa.mean(1) - (this.mean(1) * arrB.mean(1));
			},
		},
		populationstandardDeviation: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmpa = this.populationVariance();
				return tmpa !== null ? Math.sqrt(tmpa) : null;
			},
		},
		standardDeviation: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmpa = this.variance();
				return tmpa !== null ? Math.sqrt(tmpa) : null;
			},
		},
		standardError: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmpa = this.variance();
				return tmpa !== null ? Math.sqrt(tmpa / (this.length - 1)) : null;
			},
		},
		meanAbsoluteDeviation: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let mean = this.mean();
				return this.map(num => Math.abs(num - mean));
			},
		},
		correlation: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(arrB) {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmp = this.variance();
				return (tmp === null || tmp === 0 || arrB.variance === 0) ? 
					null : 
					this.covariance(arrB) / (tmp * arrB.variance());
			},
		},
		coefficientOfVariation: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				return this.mean(1) !== 0 ? this.standardDeviation() / this.mean(1) : null;
			},
		},
		fisherSkewness: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmpa = this.solid();
				let amean= this.mean(1);
				let tmpb = tmpa.map(a => Math.pow(a - amean, 3));
				return this.standardDeviation() !== 0 ? tmpb.mean(1) / Math.pow(this.standardDeviation(), 3) : NaN;
			},
		},
		kurtosis: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return NaN; 
				if(this.isNaN()) return NaN;
				let tmpa = this.solid();
				let amean = this.mean(1);
				let tmpb = tmpa.map(a => Math.pow(a - amean, 4));
				return this.standardDeviation() !== 0 ? (tmpb.mean(1) / Math.pow(this.standardDeviation(), 4)) - 3 : NaN;
			},
		},
		entropy: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.empty()) return {
					min: NaN, 
					max: NaN, 
					current: NaN, 
					percent: NaN, 
					homogeneity: NaN,
				}; 
				if(this.isNaN()) return NaN;
				let array = this.slice();
				let entrp = arr => {
					return [...new Set(arr)]
						.map(item => arr.filter(o => o === item).length)
						.reduce((sum, frequency) => {
							let p = frequency / arr.length;
							return sum + p * Math.log2(1 / p);
						}, 0);
				};
				let maxarray = array.map((o, i) => String(i));
				let maxent = entrp(maxarray);
				let curent = entrp(array);
				let percent = curent / maxent;
				let homogeneity = 1 - percent;
				if(maxent === 0) maxent = 1;
				entrp = maxarray = array = undefined;
				return {
					min: 0, 
					max: maxent === 0 ? 1 : maxent, 
					current: curent, 
					percent: isNaN(percent) ? 0 : percent, 
					homogeneity: isNaN(homogeneity) ? 1 : homogeneity,
				};
			},
		},
		gaussiansort: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(index = null) {
				let _a = this.slice();
				_a.sort((a, b) => index ? a[index] - b[index] : a - b);
				_a.reverse();
				let _out = [];
				for (let i = 0, l = _a.length; i < l; i++) {
					if(i % 2) {
						_out.push(_a[i]);
					} else { 
						_out.splice(0, 0, _a[i]);
					}
				}
				_a = undefined;
				return _out;
			}
		},
		outliers: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				let data = {
					'lower_outlier': NaN,
					'q1': NaN,
					'median': NaN,
					'q3': NaN,
					'higher_outlier': NaN,
					'values': [],
				}
				if(this.empty()) return data; 
				if(this.isNaN()) return NaN;

				let array = this.slice();
				let AC = array.length;
				array = array.sort((a,b) => a - b);
		
				let MI = Math.floor(AC / 2);
				let MX = AC - 1;
		
				data['lower_outlier'] = array[0];
				data['min'] = array[0];
				data['median'] = array[MI];
				data['max'] = array[MX];
				data['higher_outlier'] = array[MX];
		
				let LV = [];
				let UV = [];
		
				let G = Number(MI);
				if (AC % 2 == 0) {
					data['median'] = Math.round((data['median'] + array[(MI - 1)]) / 2);
					G = G - 1;
				}
				array.map((v, i) => {
					if (i < G) {
						LV.push(v)
					} else if (i > MI) {
						UV.push(v);
					}
				});
		
				let LVC = LV.length;
				let LVM = Math.floor(LVC / 2);
				data['q1'] = (LVC % 2 == 0) ? Math.round((LV[LVM] + LV[(LVM - 1)]) / 2) : LV[LVM];
		
				let HVC = UV.length;
				let HVM = Math.floor(LVC / 2);
				data['q3'] = (HVC % 2 == 0) ? Math.round((UV[HVM] + UV[(HVM - 1)]) / 2) : UV[HVM];
		
				let IQR = data['q3'] - data['q1'];
				let UQR = data['max'] - data['q3'];
				if (data['q1'] > IQR) data['min'] = data['q1'] - IQR;
				if (UQR > IQR) data['max'] = data['q3'] - IQR;
		
				let set = new Set(array.filter(o => o < data.q1 || o > data.q3));
				data.values = array.map((o, i) => ({index: i, value: o, outlier: set.has(o)}));
				delete data.min;
				delete data.max;
				
				array = AC = MI = MX = LV = UV = G = LVC = LVM = undefined;
				HVC = HVM = IQR = UQR = set = undefined;
				return data;
			},
		},
		empiricalRule: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				// Returns the the ranges expected for the data from applying the emperical rule.
				// The empirical rule states that for perfectly normal data:
				//    - 68% of the measurements will fall within 1 standard deviation of the mean.
				//    - 95% will fall within 2 standard deviations.
				//    - 99.7% will fall withing 3 standard deviations.
				// The closer a data set is to normal, the closer this approxmiation will fit the data.
				if(this.empty()) return {
					'68%': {
						type: 0.68,
						mean: NaN,
						stdev: NaN,
						lower: NaN,
						upper: NaN
					},
					'95%': {
						type: 0.95,
						mean: NaN,
						stdev: NaN,
						lower: NaN,
						upper: NaN
					},
					'99.7%': {
						type: 0.997,
						mean: NaN,
						stdev: NaN,
						lower: NaN,
						upper: NaN
					}
				};
				if(this.isNaN()) return NaN;
				const samplemean = this.mean(1);
				const stdev = this.standardDeviation();
				
				return {
					'68%': {
						type: 0.68,
						mean: samplemean,
						stdev: stdev,
						lower: samplemean - stdev,
						upper: samplemean + stdev
					},
					'95%': {
						type: 0.95,
						mean: samplemean,
						stdev: stdev,
						lower: samplemean - stdev * 2,
						upper: samplemean + stdev * 2
					},
					'99.7%': {
						type: 0.997,
						mean: samplemean,
						stdev: stdev,
						lower: samplemean - stdev * 3,
						upper: samplemean + stdev * 3
					}
				};
			},
		},
		combinations: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(p) {
			    // p = array elements taken p at a time
				if(p > this.length || p <= 0) return [];
				if(p === this.length) return [this];
			
				let combs;
				if(p === 1) {
					combs = [];
					for(let i = 0, len = this.length; i < len; i++) {
						combs.push([this[i]]);
					}
					return combs;
				}
				
				let head;
				let tailcombs;
						
				combs = [];
				for(let i = 0, len = this.length; i < len - p + 1; i++) {
					head = this.slice(i, i + 1);
					tailcombs = this.slice(i + 1).combinations(p - 1);
					for(let j = 0, jlen = tailcombs.length; j < jlen; j++) {
						combs.push(head.concat(tailcombs[j]));
					}
				}
				head = tailcombs = undefined;
				return combs;
			},
		},
		permutations: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				if(this.length === 0) return [[]];
				let result = [];
				for(let i = 0, len = this.length; i < len; i++) {
					let copy = Object.create(this);
					let head = copy.splice(i, 1);
					let rest = copy.permutations();
					for(let j = 0, jlen = rest.length; j < jlen; j++) {
						let next = head.concat(rest[j]);
						result.push(next);
						next = undefined;
					}
					copy = head = rest = undefined;
				}
				return result;
			},
		},
		arrangements: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(p) {
			    // p = array elements taken p at a time
				var combinations = this.combinations(p);
				var arrangements = [];
				combinations.forEach(function(combination) {
					var ps = combination.permutations();
					ps.forEach(function(p) {
						arrangements.push(p);
					});
					ps = undefined;
				});
				combinations = undefined;
				return arrangements;
			},
		},
		unique: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
			    return Array.from(new Set(this));
			},
		},
		flatten: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
			    return Array.prototype.flat ? this.flat(1) : Array.prototype.concat(...this);
			},
		},
	});
	// Numbers
	Object.defineProperties(Number.prototype, {
		valid: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return this !== null;
			}
		},
		empty: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return this === 0;
			}
		},
		clamp: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(min, max) {
				return Math.min(Math.max(this, min), max);
			}
		},
		between: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(a, b, inclusive = true) {
				let min = Math.min(a, b);
				let max = Math.max(a, b);
				return inclusive ? this >= min && this <= max : this > min && this < max;
			}
		},
		range: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(end = 0) {
				return (new Array(end - this + 1)).fill(undefined).map((_, i) => i + this);
			}
		},
	});
	// Strings
	Object.defineProperties(String.prototype, {
		valid: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return !this.empty();
			}
		},
		empty: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				return this.toString().trim().length === 0;
			}
		},
		na: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				return this.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
			},
		},
		uf: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				return this.charAt(0).toUpperCase() + this.slice(1);
			},
		},
		truncate: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(n = 50, usewords = false) {
				if(this.length <= n) return this;
				let sub = this.substr(0, n-1);
				return `${usewords ? sub.substr(0, sub.lastIndexOf(' ')) : sub}...`;
			},
		},
		words: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
				return input.toLowerCase().na().match(/\b[\w']+\b/g);
			},
		},
		soundex: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function(numeric = true) {
				let a = this.na().toLowerCase().split('');
				let f = a.shift();
				let r = '';
				let codes = {
					a: '', e: '', i: '', o: '', u: '',
					b: 1, f: 1, p: 1, v: 1,
					c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
					d: 3, t: 3,
					l: 4,
					m: 5, n: 5,
					r: 6
				};
				
				r = (numeric ? f.charCodeAt(0) : f) + a
					.map(function (v, i, a) { return codes[v] })
					.filter(function (v, i, a) {
						return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
					})
					.join('');
				
				return Number((r + '000').slice(0, 4));
			},
		},
		hashCode: {
			configurable: true,
			enumerable: true,
			writable: true,
		    value: function() {
			    // ever returns a positive number
				let hash = 0;
				let i = 0;
				let len = this.length;
				while (i < len) {
					hash = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
				}
				return (hash + 2147483647) + 1;
			},
		},
	});
	// Based on AustinBratcher https://gist.github.com/AustinBratcher/f0f80b278fc2ac5bd1dd97c5a2e0563b but slightly modified.
	Object.defineProperties(Set.prototype, {
		isSubset: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// true if all elements in s exist in this
				let itr = s.values();
				let matchFound = true;
				let ent;
				while ((ent = itr.next()) && !ent.done && matchFound) {
					matchFound = this.has(ent.value)
				}
				return matchFound;
			}
		},
		isProperSubset: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// true if all elements in s exist in this and s is not equal to this
				return this.isSubset(s) && this.size !== s.size;
			}
		},
		isDisjoint: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// returns true if no elements in s exist in this
				let itr = s.values(),
					matchFound = false,
					ent;
				while ((ent = itr.next()) && !ent.done && !matchFound) {
					matchFound = this.has(ent.value)
				}
				return !matchFound;
			}
		},
		union: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// returns new set containing all members of both this and s
				return new Set([...this, ...s]);
			}
		},
		intersection: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// returns new set containing all members that exist in both this and s
				let t = new Set();
				this.forEach(val => {
					if (s.has(val)) t.add(val);
				})
				return t;
			}
		},
		difference: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// returns new set containing all members of this that are not members of s
				let t = new Set();
				this.forEach(val => {
					if (!s.has(val)) t.add(val);
				})
				return t;
			}
		},
		symmetricDifference: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// returns a set containing all members of this not in s and all members of s not in this 
				return this.difference(s).union(s.difference(this));
			}
		},
		cartesianProduct: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(s) {
				// returns set containing arrays of all possible pairs of elemnts in this and s
				let t = new Set();
				this.forEach(thisVal => {
					s.forEach(sVal => {
						t.add([thisVal, sVal]);
					});
				})
				return t;
			}
		},
		subsetOfSize: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function(size) {
				// returns new set containing arrays all possible subsets of size "size"
				// based on: https://gist.github.com/axelpale/3118596
				if (size > this.size || size <= 0) return new Set([
					[]
				]);
				let elements = [...this];
				if (size === 1) return new Set(elements.map(v => [v]));
				if (size === this.size) return new Set([elements]);
				let t = new Set();
				for (let i = 0; i < elements.length - size + 1; i++) {
					let head = elements.slice(i, i + 1);
					let tailSet = new Set(elements.slice(i + 1));
					tailSet.subsetsOfSize(size - 1).forEach(v => {
						t.add(head.concat(v));
					})
				}
				return t;
			}
		},
		powerSet: {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function() {
				// returns a new set containing arrays of all possible subsets of this
				// Warning: this becomes very slow for sets over the size of 20 elements.
				// A set with 20 elements will have 1048576 subsets. This grows exponentially
				// with larger sets.
				// Based on: https://stackoverflow.com/a/47147597
		
				return new Set([...this].reduce((subsets, val) => {
					return subsets.concat(
						subsets.map(set => [val, ...set])
					)
				}, [[]]));
			}
		},
	});
};

export default Prototypes;
