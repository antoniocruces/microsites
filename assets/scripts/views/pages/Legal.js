import Utils from '../../services/Utils.js'

let Legal = {
	render: async () => {
		try {
			let text = await Utils.gettext('legal');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Legal;
