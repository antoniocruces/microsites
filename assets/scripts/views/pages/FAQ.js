import Utils from '../../services/Utils.js'

let FAQ = {
	render: async () => {
		try {
			let text = await Utils.gettext('faq');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {		
		document.querySelectorAll('.blinker').forEach(s => {
			M.add({
				el: s,
				event: 'click',
				fn: blinker
			});
		});
		function blinker(e) {
			let elm = (e.target.dataset || {target: null}).target;
			if(elm) {
				Utils.blinkelement(Utils.byId(elm), 200, 3000);
			}
		}
	}
}

export default FAQ;
