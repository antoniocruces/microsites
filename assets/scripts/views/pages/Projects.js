import Utils from '../../services/Utils.js'

let Projects = {
	render: async () => {
		try {
			let text = await Utils.gettext('projects');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
	}
}

export default Projects;
