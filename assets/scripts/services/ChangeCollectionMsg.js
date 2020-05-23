const ChangeCollectionMsg = {
	en: {
		message: [
			`Do you want change active collection from [old] to [new]?`,
			'\n' ,
			`Be warned about two important facts: if database is not loaded, `,
			`this operation will be done now, and the appropriate subset will be set; `,
			`if database is already loaded, this not will be reloaded, because it is `,
			`present in memory, but data itself will change, because a new subset will be selected.`,
		].join(''),
	},
	es: {
		message: [
			`¿Desea cambiar la colección activa de [old] a [new]?`,
			'\n' ,
			`Tenga en cuenta dos hechos importantes: si la base de datos no está cargada, `,
			`esta operación se realizará ahora y se establecerá el subconjunto apropiado; `,
			`si la base de datos ya está cargada, esta no se volverá a cargar, porque está presente `,
			`en la memoria, pero los datos en sí mismos cambiarán, porque se seleccionará un nuevo subconjunto.`,
		].join(''),
	},
}

export default ChangeCollectionMsg;
