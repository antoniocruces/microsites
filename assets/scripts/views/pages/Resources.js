import Utils from '../../services/Utils.js'

let Resources = {
	render: async () => {
		try {
			let text = await Utils.gettext('resources');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Resources;
