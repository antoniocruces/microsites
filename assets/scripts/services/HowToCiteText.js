const HowToCiteText = {
	en: {
		generic: [
			`<h4 class="w3-text-theme">Generic citation</h4>`,
			`<p>`,
			`[sn]. [ln] Microsite. `,
			`([sn] Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
			`Available at [u] [d].`, 
			`</p>`,
		].join(''),
		info: [
			`<h4 class="w3-text-theme">Information obtained</h4>`,
			`<p>`,
			`[r] at [sn]. [ln] Microsite. `,
			`([sn] Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
			`Available at [u] [d].`, 
			`</p>`,
		].join(''),
		graphic: [
			`<h4 class="w3-text-theme">Maps, figures and/or charts/graphs</h4>`,
			`<p>`,
			`© [sn] Project [u] [d].`, 
			`</p>`,
		].join(''),
		clipboard: [
			`[sn]. [ln] Microsite. `,
			`([sn] Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
			`Available at [u] [d].`, 
		].join(''),
	},
	es: {
		generic: [
			`<h4 class="w3-text-theme">Cita genérica</h4>`,
			`<p>`,
			`[sn]. Microsite de [ln]. `,
			`([sn] Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
			`Disponible en [u] [d].`, 
			`</p>`,
		].join(''),
		info: [
			`<h4 class="w3-text-theme">Información obtenida</h4>`,
			`<p>`,
			`[r] en [sn]. Microsite de [ln]. `,
			`([sn] Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
			`Disponible en [u] [d].`, 
			`</p>`,
		].join(''),
		graphic: [
			`<h4 class="w3-text-theme">Mapas, figuras y/o gráficos</h4>`,
			`<p>`,
			`© [sn] Project [u] [d].`, 
			`</p>`,
		].join(''),
		clipboard: [
			`[sn]. Microsite de [ln]. `,
			`([sn] Project, dir. Nuria Rodríguez Ortega, iArtHis / Universidad de Málaga). `,
			`Disponible en [u] [d].`, 
		].join(''),
	},
}

export default HowToCiteText;
