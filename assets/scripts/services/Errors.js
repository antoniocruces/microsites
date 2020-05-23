import Utils from './Utils.js'

const Errors = () => {
	// Errors & Warnings
	M.add({
		el: window,
		event: 'error',
		fn: function (msg, url, lineNo, columnNo, error) {
			let string = msg instanceof ErrorEvent ? msg.message.toLowerCase() : msg.toLowerCase();
			let substring = 'script error';
			let message; // = string.indexOf(substring) > -1 ? Utils.c('script error; see console').uf() : '';
			let cleanmsg = txt => {
				txt = txt.replace('uncaught error: ', '');
				txt = txt.replace('unhandled rejection: ', '');
				return txt;
			}
			if(G.debugmode) {
				message = [
					'MSG: <strong class="color-red-400">' + Utils.c(cleanmsg(string)).uf() + '</strong>',
					'<br />',
					'MOD: ' + url,
					'<br />',
					'LIN: ' + lineNo + ', ' + columnNo,
				].join('');
			} else {
				message = '<span class="w3-text-red">' + Utils.c(cleanmsg(string)).uf() + '</span>';
			}
			
			if(window.O) Utils.overlay();
			
			document.querySelector('.modal-title').innerHTML = `<span class="w3-tag w3-xlarge w3-padding w3-red w3-center">Pathwise. ERROR</span>`;
			document.querySelector('.modal-body').innerHTML = `<div class="w3-panel"><p>${message}</p></div>`;
			document.querySelector('.modal-mask').style.display = 'block';
			document.querySelector('.modal').style.display = 'block';
			
			M.add({
				el: document.querySelector('.modal-close'),
				event: 'click',
				fn: Utils.closemodal
			});
			
			string = substring = message = cleanmsg = undefined;
			return false;
		}
	});
	M.add({
		el: window,
		event: 'unhandledrejection',
		fn: function(event) {
			event.preventDefault();
			let message = [Utils.c('asynchronous operation').uf(), '. ', event.reason, '.'].join('');
		    if(localStorage.getItem('pwdebugmode')) {
			    console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
			}
		    throw new Error(message);
		}
	});
}

export default Errors;
