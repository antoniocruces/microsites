import Utils from './Utils.js'

/*
	Calculates entropy and conditional entropy as defined in Information Theory 
	(https: //en.wikipedia.org/wiki/Entropy_(information_theory))

	entropy = -Sum(P_i*log_2(P_i))
*/

const Helpers = {
	frequence: list => {
		let tmp = list.reduce((acc, e) => acc.set(Utils.fold(e), (acc.get(Utils.fold(e)) || 0) + 1), new Map());
		return [...tmp.entries()].sort((a, b) => b[1] - a[1]);
	},
	chebyshev_inequality: k => {
		// Returns the minimum proportion of measurements that will fall within k standard deviations of the mean
		// Can be used for any set of measurements
		if(k < 1) throw new Error(Utils.c('internal error'));
		return 1 - 1 / k ** 2;
	},
	hampel_filter: (data, half_window, threshold) => {
		// Hampel Filter, used for detecting and removing outliers in a moving window via Median Absolute Deviation (MAD).
		// Parameters:
		//    data: array of numbers to be examined.
		//    half_window: integer representing half the moving window size to use.
		//    threshold: integer for the maximum multiple of the MAD before it's considered an outlier and replaced with the median.
		// Returns: {data: updated array, ind: original indicies of removed outliers}
		if(typeof threshold === 'undefined') threshold = 3;
		if(typeof half_window === 'undefined') half_window = 6;
		let n = data.length;
		let data_copy = data.slice();
		let ind = [];
		let L = 1.4826;
		for(let i = half_window + 1; i < n - half_window; i++) {
			let med = data.slice(i - half_window, i + half_window).median();
			let MAD = L * (data.slice(i - half_window, i + half_window).map(e => Math.abs(e - med))).median();
			if(Math.abs(data[i] - med) / MAD > threshold) {
				data_copy[i] = med;
				ind = ind.concat(i);
			}
			med = MAD = undefined;
		}
		n = L = undefined;
		return {data: data_copy, outliers: ind};
	},
	stringentropy: str => {
		const len = str.length;
		const frequencies = Array.from(str)
			.reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {});
		return Object.values(frequencies)
			.reduce((sum, f) => sum - f/len * Math.log2(f/len), 0);
	},
	entropy: (...values) => {
		let calculationResult = 0;
		let fraction = 0;
		/*
		if(values === undefined) {
			throw new Error(Utils.c('internal error'));
		}
		*/
		const valuesSum = values.reduce((sum, curr) => sum + curr, 0);
	
		for(let v of values) {
			if (v !== 0) {
				fraction = v / valuesSum;
				calculationResult += fraction * Math.log2(fraction);
			}
		}
		fraction = undefined;
		return -1 * calculationResult;
	},
	information: (...values) => {
		// Values in format {fraction: 2/3, entropyTuple: [1, 2, 3]}
		let calculationResult = 0;
	
		//if (values === undefined) {
		//	throw new Error(Utils.c('internal error'));
		//}
	
		for(let v of values) {
			let {
				fraction,
				entropyTuple
			} = v;
			if (!entropyTuple) {
				throw new Error(Utils.c('internal error'));
			}
	
			calculationResult += fraction * Helpers.entropy(...entropyTuple);
		}
	
		return calculationResult;
	},
};

export default Helpers;
