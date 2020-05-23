import Utils from './Utils.js'

const notdefined = x => x == null || 
	(typeof x == 'number' && isNaN(x)) || 
	(x.length < 1 && typeof x != 'function') || 
	(typeof x == 'object' && x.constructor.name == 'Object' && Object.keys(x).length < 1);
const staticprops = obj => {
	return function(props, enumerable) {
		let staticProps = {};
		for(let propName in props) {
			let staticProp = {
				configurable: false,
				enumerable: enumerable
			};
			let prop = props[propName];
			if(typeof prop === 'function') {
				staticProp.get = prop;
			} else {
				staticProp.value = prop;
				staticProp.writable = false;
			}
			staticProps[propName] = staticProp;
			prop = undefined;
		}
		Object.defineProperties(obj, staticProps);
	};
};

	
class OLAP {
	/* As seen at https://github.com/fibo/OLAP-cube but seriously modified */
	/**
	 * Create an OLAP table.
	 *
	 * var table = new OLAP({
	 *   dimensions: [ 'year', 'month' ],
	 *   points: [ [2016, 'Gen'], [2016, 'Feb'], [2016, 'Mar'] ],
	 *   fields: ['revenue'],
	 *   data: [[100], [170], [280]]
	 * })
	 */
	constructor() {
		const arg = Object.assign({
			dimensions: [],
			points: [],
			fields: [],
			data: []
		}, arguments[0]);

		const dimensions = arg.dimensions;
		const points = arg.points;
		const fields = arg.fields;
		const data = arg.data;

		const tableHasData = data.length > 0;

		if (tableHasData) {
			const invalidSlices = data.filter((slice) => slice.length !== fields.length);
			if(invalidSlices.length > 0) {
				throw new TypeError(Utils.c('invalid slices'));
			}

			const invalidPoints = points.filter((p) => p.length !== dimensions.length);
			if(invalidPoints.length > 0) {
				throw new TypeError(Utils.c('invalid points'));
			}

			if(data.length !== points.length) {
				throw new TypeError(Utils.c('orphan slices'));
			}
		}

		const enumerable = true;
		
		staticprops(this)({
			dimensions,
			fields
		}, enumerable);

		staticprops(this)({
			points,
			data,
			structure: {
				dimensions,
				fields
			}
		});

		staticprops(this)({
			header: () => this.dimensions.concat(this.fields),
			rows: () => this.points.map((p, i) => p.concat(this.data[i]))
		});
	}

	/**
	 * Add a set of rows to the table.
	 *
	 * table.addRows({
	 *   header: ['year', 'month', 'revenue'],
	 *   rows: [
	 *     [ 2016, 'Gen', 100 ],
	 *     [ 2016, 'Feb', 170 ],
	 *     [ 2016, 'Mar', 280 ]
	 *   ]
	 * })
	 */

	addRows(arg) {
		const header = arg.header;
		const rows = arg.rows;

		const dimensions = this.dimensions;
		const fields = this.fields;

		if (header.length !== (dimensions.length + fields.length)) {
			throw new TypeError(Utils.c('invalid header'));
		}

		const data = [...this.data];
		const points = [...this.points];

		rows.forEach((row) => {
			let point = [];
			let cells = [];

			for(let i in row) {
				const key = header[i];
				let dimIndex = dimensions.indexOf(key);
				let fieldIndex = fields.indexOf(key);

				if (dimIndex > -1) {
					point.splice(dimIndex, 0, row[i]);
				} else if (fieldIndex > -1) {
					cells.splice(fieldIndex, 0, row[i]);
				} else {
					throw new TypeError(Utils.c('invalid row'));
				}
			}

			let pointIndex = null;
			points.forEach((p, index) => {
				if(p.filter((coord, i) => coord === point[i]).length === point.length) {
					pointIndex = index;
				}
			});

			if(pointIndex === null) {
				pointIndex = points.length;
				points.push(point);
			}

			data.splice(pointIndex, 0, cells);
		});

		return new OLAP(
			Object.assign({}, this.structure, {
				points,
				data
			})
		);
	}

	/**
	 * Slice operator picks a rectangular subset of a cube by choosing a single value of its dimensions.
	 *
	 * @param {String} dimension
	 * @param {*} filter
	 * @returns {Object} table
	 */

	slice(dimension, filter) {
		const structure = this.structure;
		let points = [];
		let data = [];

		const dimensionIndex = structure.dimensions.indexOf(dimension);
		if(dimensionIndex === -1) {
			throw new TypeError(`${Utils.c('dimension not found')}: ${dimension}`);
		};

		this.points.forEach((point, i) => {
			if (point[dimensionIndex] === filter) {
				data.push(this.data[i])
				points.push(this.points[i])
			}
		});

		return new OLAP(
			Object.assign({}, structure, {
				points,
				data
			})
		);
	}

	/**
	 * Dice operator picks a subcube by choosing a specific values of multiple dimensions.
	 *
	 * @param {Function} selector
	 * @returns {Object} table
	 */

	dice(selector) {
		let points = [];
		let data = [];

		this.points.forEach((point, i) => {
			if (selector(point)) {
				data.push(this.data[i]);
				points.push(this.points[i]);
			}
		});

		return new OLAP(
			Object.assign({}, this.structure, {
				points,
				data
			})
		);
	}

	/**
	 * A roll-up involves summarizing the data along a dimension.
	 *
	 * @param {String} dimension
	 * @param {Array} fields
	 * @param {Function} aggregator
	 * @param {*} initialValue
	 * @returns {Object} table
	 */

	rollup(dimension, fields, aggregator, initialValue) {
		let points = [];
		let dataObj = {};
		let rolledupData = [];
		let seen = {};

		const dimensionIndex = this.structure.dimensions.indexOf(dimension);
		const numDimensions = this.structure.dimensions.length;

		const structure = {
			dimensions: [dimension],
			fields
		};

		this.rows.forEach(row => {
			const point = row[dimensionIndex];
			if(!seen[point]) {
				points.push([point]);
				seen[point] = true;
			}

			const fields = row.slice(numDimensions);
			if(notdefined(dataObj[point])) dataObj[point] = [];

			dataObj[point].push(fields);
		})

		points.forEach(point => {
			rolledupData.push(dataObj[point].reduce(aggregator, initialValue));
		});

		return new OLAP(
			Object.assign({}, structure, {
				points,
				data: rolledupData
			})
		);
	}
}

export default OLAP;

