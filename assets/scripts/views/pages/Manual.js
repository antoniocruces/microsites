import Utils from '../../services/Utils.js'

let Manual = {
	render: async () => {
		try {
			let text = await Utils.gettext('manual');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Manual;
