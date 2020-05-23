import Utils from '../../services/Utils.js'

let HowToCite = {
	render: async () => {
		try {
			let text = await Utils.gettext('howtocite');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default HowToCite;
