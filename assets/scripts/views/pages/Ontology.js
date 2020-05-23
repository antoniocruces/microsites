import Utils from '../../services/Utils.js'

let Ontology = {
	render: async () => {
		try {
			let text = await Utils.gettext('ontology');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Ontology;
