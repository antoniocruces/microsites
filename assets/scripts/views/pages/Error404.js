import Utils from '../../services/Utils.js'

let Error404 = {
	render: async () => {
		try {
			let text = await Utils.gettext('error404');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Error404;
