import Utils from '../../services/Utils.js'

let Legends = {
	render: async () => {
		try {
			let text = await Utils.gettext('legends');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Legends;
