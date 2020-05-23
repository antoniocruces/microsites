import Utils from '../../services/Utils.js'

let Pathwise = {
	render: async () => {
		try {
			let text = await Utils.gettext('pathwise');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		function showvideo() {
			let titleElm = document.querySelector('.modal-title');
			let outputElm = document.querySelector('.modal-body');
			titleElm.innerHTML = `${G.appdata.name}. ${Utils.c('promotional video').uf()}`;
			outputElm.innerHTML = '';
			
			let wrapper = document.createElement('div');
			wrapper.id = 'txt-body';
			wrapper.style.padding = '0';
			wrapper.innerHTML = [
				`<div class="w3-display-container w3-margin-top">`,
				`<video id="video" autoplay loop style="width:100%">`,
				`<source id="video-source" src="./assets/video/p.mp4" `,
				`type="video/mp4"></source>`,
				`</video>`,
				`</div>`,
				`<p>`,
				`<button class="w3-button w3-theme-d5" id="alternatesound" href="javascript:;">`,
				`${Utils.c('alternate sound')}`,
				`</button>`,
				`<button class="w3-button w3-theme-d5" id="alternatepause" href="javascript:;">`,
				`${Utils.c('alternate pause')}`,
				`</button>`,
				`</p>`,
			].join('');
			outputElm.appendChild(wrapper);
	
			document.querySelector('.modal-mask').style.display = 'block';
			document.querySelector('.modal').style.display = 'block';
			
			M.add({
				el: Utils.byId('alternatesound'),
				event: 'click',
				fn: alternatesound
			});
			
			M.add({
				el: Utils.byId('alternatepause'),
				event: 'click',
				fn: alternatepause
			});
			
			titleElm = outputElm = wrapper = undefined;
		}

		if(Utils.byId('showvideo')) {
			M.add({
				el: Utils.byId('showvideo'),
				event: 'click',
				fn: showvideo
			});
		}

		function alternatesound(e) {
			Utils.byId('video').muted = !Utils.byId('video').muted; 
			if(Utils.byId('video').muted) {
				e.target.classList.remove('w3-theme-d5');
				e.target.classList.add('w3-theme-l2');
			} else {
				e.target.classList.remove('w3-theme-l2');
				e.target.classList.add('w3-theme-d5');
			}
		}
		
		function alternatepause(e) {
			if(Utils.byId('video').paused) { 
				Utils.byId('video').play();
				e.target.classList.remove('w3-theme-l2');
				e.target.classList.add('w3-theme-d5');
			} else {
				Utils.byId('video').pause();
				e.target.classList.remove('w3-theme-d5');
				e.target.classList.add('w3-theme-l2');
			}
		}
	}
}

export default Pathwise;
