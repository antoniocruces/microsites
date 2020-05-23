import Utils from '../../services/Utils.js'
import ChangeCollectionMsg from '../../services/ChangeCollectionMsg.js'

let Home = {
	render: async () => {
		try {
			let text = await Utils.gettext(`home-${G.appactivecollection}`);
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		datavalidity();
		
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
				`<source id="video-source" src="./assets/video/${G.appactivecollection}.mp4" `,
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

		document.querySelectorAll('.collection').forEach(elm => {
			M.add({
				el: elm,
				event: 'click',
				fn: changecollection
			});
		});

		function datavalidity() {
			let hours = (df) => {
				let s = new Date(df).getTime();
				let f = new Date().getTime();
				let td = (f - s);
				let shour = 60 * 60 * 1000;
				let hours = Math.floor(td / shour);
				
				return hours;
			};
			Utils.getremoteheaders(`./assets/static/${G.appdata.filename}.db`).then(res => {
				if(res) {
					let typesel = Utils.byId('data-validity');
					let hoursel = Utils.byId('hours-ago');
					let dateformat = {
							weekday: 'long', 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric', 
							hour: 'numeric', 
							minute: 'numeric', 
							second: 'numeric', 
							timeZoneName: 'long'
					};
					if(typesel) {
						typesel.innerHTML = [
							`${new Date(res['last-modified']).toLocaleDateString(Utils.l, dateformat)}, `,
							`${Utils.humansize(Number(res['content-length']))}`,
						].join('');
					}
					if(hoursel) {
						hoursel.innerHTML = hours(res['last-modified']);
					}
					typesel = hours = undefined;
				}
				res = undefined;
			}).catch(err => {
				//throw new Error(Utils.c('communication error'));
				console.error(err, Utils.c('communication error'));
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

		function changecollection(e) {
			let elm = e.target;
			if(!elm.dataset) return;
			if(!elm.dataset.collection) return;
			let msg = ChangeCollectionMsg[Utils.l].message;
			let replacer = (text, u) => {
				let oldc = G.appcollections[G.appactivecollection].name;
				let newc = G.appcollections[elm.dataset.collection].name;
				let out = text;
				out = out.split('[old]').join(oldc);
				out = out.split('[new]').join(newc);
				oldc = newc = undefined;
				return out;
			};
			if(!G.db) {
				G.appactivecollection = elm.dataset.collection;
				window.location.href = `./#/home/${elm.dataset.collection}`;
				elm = msg = replacer = undefined;
			} else {
				if(confirm(replacer(msg))) {
					G.appactivecollection = elm.dataset.collection;
					elm = msg = replacer = undefined;
					window.location.href = './#/data';
				} else {
					elm = msg = replacer = undefined;
				}
			}
		}

	    /* INACTIVE WHILE APP IS UNDER DEVELOPMENT */
	    /*
		if('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register(`/${G.apppath}/sw.js`)
				.then(() => console.log('Service Worker Registered'));
		}
	
		let deferredPrompt;
		const addBtn = Utils.byId('addtohs-button');
		if(addBtn) addBtn.classList.add('hide');
	
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			addBtn.classList.remove('hide');
			addBtn.addEventListener('click', (e) => {
				addBtn.classList.add('hide');
				deferredPrompt.prompt();
				deferredPrompt.userChoice.then((choiceResult) => {
					if(choiceResult.outcome === 'accepted') {
						console.log('User accepted the add app to home screen prompt');
					} else {
						console.log('User dismissed the add app to home screen prompt');
					}
					deferredPrompt = null;
				});
			});
		});
		*/
	}
}

export default Home;
