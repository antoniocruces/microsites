import Utils from '../../services/Utils.js'

let Development = {
	render: async () => {
		try {
			let text = await Utils.gettext('development');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Development;
