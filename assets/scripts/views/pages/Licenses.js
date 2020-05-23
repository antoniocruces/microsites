import Utils from '../../services/Utils.js'

let Licenses = {
	render: async () => {
		try {
			let text = await Utils.gettext('licenses');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		M.add({
			el: Utils.byId('license-code-copy-link'),
			event: 'click',
			fn: Utils.copytoclipboard
		});
	}
}

export default Licenses;
