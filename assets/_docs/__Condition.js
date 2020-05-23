import Utils from './Utils.js'

// As seen at https://www.cssscript.com/condition-autocomplete-es6/ but very seriously modified

const Condition = config => {
	init(config);

	let startat = -1;
	let conditionsize = 0;
	const lookupcssclass = 'condition-lookup'
	const listcssclass = 'condition-li'

	function init(config) {
		let verify = () => (
			config !== undefined && 
			config.id !== undefined	&& 			
			config.list !== undefined && 			
			config.symbol !== undefined		
		);
		if(!verify()) {
			error();
			return;
		}

		M.add({
			el: document.getElementById(config.id),
			event: 'keyup',
			fn: e => conditionevent(e)
		});
		M.add({
			el: document.getElementById(config.id),
			event: 'click',
			fn: e => hidelookup()
		});
	}

	function conditionevent(e) {
		let value = e.target.value;
		let start = e.target.selectionStart;
		let character = value.substring(start - 1, start);

		if(character === config.symbol) {
			startat = start;
			lookupsetup(e.target);
			return;
		}
		if(character === ' ' || value.trim() === '') {
			startat = -1;
			hidelookup();
			return;
		}
		if(startat > -1) {
			setconditionlist(e.target);
			conditionsize++;
			return;
		}
	}

	function extractcondition(value) {
		let condition = value.substring(startat, value.length);
		let whitespaceindex = condition.indexOf(' ');
		let endat = whitespaceindex > -1 ? whitespaceindex : value.length;

		condition = condition.substring(0, endat);
		whitespaceindex = endat = undefined;
		return condition.toLowerCase();
	}

	function setconditionlist(textarea) {
		const condition = extractcondition(textarea.value);

		const li = list => [
			`<li class="${listcssclass}" `,
			`data-value="${list.value}" data-text="${list.text}">`,
			`${list.text}`,
			`</li>`,
		].join('');
		
		const items = config.list
			.filter(item => item.value.toLowerCase().includes(condition) || item.text.toLowerCase().includes(condition))
			.map(item => li(item));

		if(!items.length) {
			hidelookup();
			return;
		}

		filllookup(textarea, `<ul>${items.join('')}</ul>`);
	}

	function getcoords(textarea) {
		let replica = document.createElement('div');

		const copystyle = getComputedStyle(textarea);
		for(const prop of copystyle) {
			replica.style[prop] = copystyle[prop]
		}
		replica.style.height = 'auto';
		replica.style.width = 'auto';

		let span = document.createElement('span');
		replica.appendChild(span);

		let content = textarea.value.substr(0, textarea.selectionStart);
		let contentlines = content.split(/[\n\r]/g);
		let currentline = content.substr(0, content.selectionStart).split(/[\n\r]/g).length;

		let replicacontent = ''
		contentlines.map((l, i) => {
			if (i === (currentline - 1) && i < contentlines.length) {
				replicacontent += contentlines[i];
				return;
			}
			replicacontent += '\n'
		});

		span.innerHTML = replicacontent.replace(/\n$/, '\n\\001');

		document.body.appendChild(replica);

		const {
			offsetWidth: spanWidth,
			offsetHeight: spanHeight
		} = span;

		document.body.removeChild(replica);

		return {
			x: spanWidth + textarea.offsetLeft,
			y: spanHeight + textarea.offsetTop
		}
	}

	function lookupsetup(textarea) {
		let lookupElement = document.getElementsByClassName(lookupcssclass);
		let lookup;

		if (lookupElement.length) {
			lookup = lookupElement[0];
		} else {
			lookup = document.createElement('div');
			lookup.className = lookupcssclass;
			document.body.appendChild(lookup);
		}

		let coords = getcoords(textarea);
		lookup.style.position = 'absolute';
		lookup.style.left = coords.x + 'px';
		lookup.style.top = coords.y + 'px';
		lookup.style.zIndex = '5000'
	}

	function filllookup(textarea, content) {
		let lookup = document.getElementsByClassName(lookupcssclass);
		lookup[0].innerHTML = content;
		bindevent(textarea);
		if (lookup[0].style.display === 'none') {
			lookup[0].style.display = 'inline';
		}
	}

	function hidelookup() {
		let lookup = document.getElementsByClassName(lookupcssclass);
		if (lookup.length) {
			if (lookup[0].style.display !== 'none') {
				lookup[0].style.display = 'none';
			}
		}
	}

	function insertintoinput(e, textarea) {
		let element = e.target.className === listcssclass ? e.target : e.target.parentElement;
		const first = textarea.value.substr(0, startat);
		const last = textarea.value.substr(startat + conditionsize, textarea.value.length);
		const content = `${first}${element.dataset.text}${config.symbol}${last} `;
		textarea.value = content;
		textarea.focus();
		conditionsize = element.dataset.value.length;
		hidelookup();
	}

	function bindevent(textarea) {
		const list = document.getElementsByClassName(listcssclass);
		Array.from(list).forEach(element => {
			M.add({
				el: element,
				event: 'click',
				fn: e => insertintoinput(e, textarea)
			});
		});
	}

	function error() {
		throw new Error('@condition: missing parameters');
	}
}

export default Condition;
