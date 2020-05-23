import Utils from '../../services/Utils.js'

let Footer = {
	render: async () => {
		try {
			let text = await Utils.gettext('footer');
			return text;
		} catch(e) {
			console.log(e);
		}
	}, 
	after_render: async () => {
		let lastm = new Date(document.lastModified)
			.toLocaleDateString(localStorage.getItem('pwlang'), {dateStyle: 'medium'});
		Utils.msg(
			'footer_container',
			[
				`&copy; ${new Date(G.appdata.date).getFullYear()} `,

		    	`v${G.appdata.version}.`,
		    	`${G.appdata.subversion}.${G.appdata.release} `,
		    	`${Utils.l ? Utils.l.toUpperCase() : ''}. `,
				
				`<a href="${G.appdata.licenseurl}" target="_blank" rel="nofollow">`, 
				`${G.appdata.license}</a>. `,
				
				`<a href="${G.appdata.supporterurl}" target="_blank" rel="nofollow">`,
				`${G.appdata.supportersitename}</a> / `,
				`<a href="${G.appdata.authorurl}" target="_blank">`,
				`${G.appdata.authorsitename}</a> &#8286; `,
				`<span class="hidden-small w3-tooltip"" id="last-modified">`,
				`${lastm}`,
				`<span style="position:absolute;left:0;bottom:24px;width:100px" class="w3-text w3-tag">${Utils.c('last modified')}</span>`,
				`</span> &#8286; `,
				`<span class="hidden-small w3-tooltip" id="page-load-time">`,
				`${Utils.pageloadtime()}ms`,
				`<span style="position:absolute;left:0;bottom:24px;width:150px" class="w3-text w3-tag">${Utils.c('page load lapse')}</span>`,
				`</span> &#8286; `,
				
				`<a href="javascript:;" class="print-page" title="${Utils.c('print page')}">`,
				`<i class="fas fa-print"></i>`,
				`</a>`,
				
				`<a class="gotop float-right" title="${Utils.c('go top')}">&uarr;</a>`,
				`<a class="gobottom float-right" title="${Utils.c('go bottom')}">&darr;</a>`,
			].join('')
		)
		Utils.byId('footer_container').style.display = 'block';

		lastm = undefined;
	}
}

export default Footer;
