const require = url => {
	if(url.toLowerCase().substr(-3) !== '.js') url += '.js'; 
	if(!require.cache) require.cache = []; 
	let exports = require.cache[url]; 
	if(!exports) { 
		try {
			exports = {};
			let X = new XMLHttpRequest();
			X.open('GET', url, 0); 
			X.send();
			if(X.status && X.status !== 200) throw new Error(X.statusText);
			let source = X.responseText;
			if(source.substr(0, 10) === '(function(') { 
				let moduleStart = source.indexOf('{');
				let moduleEnd = source.lastIndexOf('})');
				let CDTcomment = source.indexOf('//@ ');
				if(CDTcomment > -1 && CDTcomment < moduleStart + 6) moduleStart = source.indexOf('\n', CDTcomment);
				source = source.slice(moduleStart + 1, moduleEnd - 1); 
			} 
			source = "//@ sourceURL=" + window.location.origin + url + '\n' + source;
			let module = { id: url, uri: url, exports:exports }; 
			let anonFn = new Function('require', 'exports', 'module', source);
			anonFn(require, exports, module);
			require.cache[url] = exports = module.exports; 
		} catch(err) {
			throw new Error('Error loading module ' + url + ': ' + err);
		}
	}
	return exports; 
};

export default require
