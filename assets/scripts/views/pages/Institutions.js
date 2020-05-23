import Utils from '../../services/Utils.js'

let Institutions = {
	render: async () => {
		try {
			let text = await Utils.gettext('institutions');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Institutions;
