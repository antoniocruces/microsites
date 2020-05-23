import Utils from '../../services/Utils.js'

let Purpose = {
	render: async () => {
		try {
			let text = await Utils.gettext('purpose');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Purpose;
