<?php

$status   = (int)$_SERVER['REDIRECT_STATUS'];
$language = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
$rmessage = $_REQUEST['m'];
$rtitle = $_REQUEST['t'];

$codes=array(
      200 => array('200 OK', 'La solicitud es correcta.'),
      400 => array('400 Bad Request', 'La solicitud contiene sintaxis errónea.'),
      401 => array('401 Unauthorized', 'Acceso a recurso no autorizado.'),
      402 => array('402 Payment Required', 'Se requiere pago previo.'),
      403 => array('403 Forbidden', 'Acceso prohibido a personal no autorizado.'),
      404 => array('404 Not found', 'El recurso solicitado no existe.'),
      405 => array('405 Method Not Allowed', 'El método empleado en la solicitud no es adecuado para el tipo de recurso solicitado.'),
      406 => array('406 Not Acceptable', 'Ninguno de los métodos aceptables propuestos por el cliente lo es para el servidor.'),
      407 => array('407 Proxy Authentication Required', 'Es necesario que el servidor proxy autorice la petición.'),
      408 => array('408 Request Timeout', 'El tiempo requerido para completar la solicitud realizada por el cliente ha excedido el límite máximo permitido.'),
      409 => array('409 Conflict', 'La solicitud no puede ser procesada por un conflicto con el estado actual del recurso que la solicitud identifica.'),
      410 => array('410 Gone', 'El recurso solicitado ya no está disponible y no lo estará de nuevo.'),
      411 => array('411 Length Required', 'La longitud del contenido de la solicitud especificada por el cliente no es correcta.'),
      412 => array('412 Precondition Failed', 'El servidor no es capaz de cumplir con algunas de las condiciones impuestas por el cliente en su petición.'),
      413 => array('413 Request Entity Too Large', 'La entidad cuyo acceso solicita el cliente excede la longitud máxima permitida.'),      
      414 => array('414 Request URI Too Large', 'La URI de la petición del navegador excede la longitud máxima permitida.'),
      415 => array('415 Unsupported Media Type', 'El formato de la solicitud del cliente no es aceptable para el servidor.'),

      416 => array('416 Requested Range Not Satisfiable', 'El rango de acceso solicitado por el cliente no es aceptable para el navegador.'),
      417 => array('417 Expectation Failed', 'El servidor no ha aceptado los requerimientos de la cabecera Expect de la petición realizada por el cliente.'),

      429 => array('429 Too Many Requests', 'El servidor ha detectado un número excesivo de conexiones solicitadas por el cliente.'),
      431 => array('431 Request Header Fileds Too Large', 'Una o más cabeceras de la solicitud realizada por el cliente excede el máximo permitido.'),
      451 => array('451 Unavailable for Legal Reasons', 'El recurso solicitado ha sido eliminado como consecuencia de una orden judicial o sentencia emitida por un tribunal.'),
      
      500 => array('500 Internal Server Error', 'Se ha producido un error interno en el servidor.'),
      501 => array('501 Not Implemented', 'El servidor no soporta alguna funcionalidad necesaria para responder a la solicitud del cliente.'),
      502 => array('502 Bad Gateway', 'La respuesta ofrecida por el servidor contactado a través de pasarela no es aceptable.'),
      503 => array('503 Service Unavailable', 'En estos momentos el servidor no puede responder a la solicitud del cliente.'),
      504 => array('504 Gateway Timeout', 'La respuesta ofrecida por el servidor contactado a través de pasarela ha excedido el tiempo máximo aceptable.'),
      505 => array('505 HTTP Version Not Supported', 'El servidor no soporta la versión HTTP solicitada por el cliente.'),
      506 => array('506 Variant Also Negotiates (RFC 2295)', 'El servidor ha detectado una referencia circular al procesar la parte de la negociación del contenido de la solicitud del cliente.'),
      507 => array('507 Insufficient Storage (WebDAV - RFC 4918)', 'El servidor no puede crear o modificar el recurso solicitado porque no hay suficiente espacio de almacenamiento libre.'),
      508 => array('508 Loop Detected (WebDAV)', 'La petición no se puede procesar porque el servidor ha encontrado un bucle infinito al intentar procesarla.'),
      509 => array('509 Exceeded Bandwidth (Unofficial)', 'Límite de ancho de banda excedido.'),
      510 => array('510 Not Extended (RFC 2774)', 'La petición del cliente debe añadir más extensiones para que el servidor pueda procesarla.'),
      511 => array('511 Network Authentication Required', 'El cliente debe autenticarse para poder realizar peticiones.'),
);

$errortitle = $rtitle ? $rtitle : $codes[$status][0];
$message    = $rmessage ? $rmessage : $codes[$status][1];

?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />

		<title>Pathwise</title>
		
		<link rel="canonical" href="https://microsites.hdplus.es/" />
	
		<meta name="author" content="Antonio Cruces Rodríguez. iArtHis_LAB. Universidad de Málaga" />
		<meta name="copyright" content="Antonio Cruces Rodríguez. iArtHis_LAB. Universidad de Málaga" />
		<meta name="description" content="A Digital Art History KDD Tool" />
		<meta name="keywords" content="digital art history, knowledge discovery in databases, kdd" />	
		<meta name="robots" content="index, follow" />
	
		<meta property="og:locale" content="es_ES" />
		<meta property="og:type" content="website" />
		<meta property="og:title" content="Microsites PW" />
		<meta property="og:description" content="A Digital Art History KDD Tool" />
		<meta property="og:url" content="https://hdplus.es/microsites/" />
		<meta property="og:site_name" content="Microsites PW" />
		<meta property="og:image" content="https://hdplus.es/microsites/assets/images/og/pathwise.png" />
		<meta property="og:image:secure_url" content="https://hdplus.es/microsites/assets/images/og/pathwise.png" />
		<meta property="og:image:width" content="600" />
		<meta property="og:image:height" content="315" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:description" content="A Digital Art History KDD Tool" />
		<meta name="twitter:title" content="Pathwise" />
		<meta name="twitter:site" content="@iarthislab" />
		<meta name="twitter:image" content="https://hdplus.es/microsites/assets/images/og/pathwise.pn" />
		<meta name="twitter:creator" content="@iarthislab" />
	
		<link rel="apple-touch-icon" sizes="180x180" href="./assets/images/favicons/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="./assets/images/favicons/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="./assets/images/favicons/favicon-16x16.png">
		<link rel="manifest" href="./assets/images/favicons/site.webmanifest">
		<link rel="mask-icon" href="./assets/images/favicons/safari-pinned-tab.svg" color="#5bbad5">
		<link rel="shortcut icon" href="./assets/images/favicons/favicon.ico">
		
		<meta name="msapplication-TileColor" content="#da532c">
		<meta name="msapplication-config" content="./assets/images/favicons/browserconfig.xml">
		<meta name="theme-color" content="#ffffff">

		<script type="application/ld+json">
			{"@context":"http://www.schema.org","@type":"EducationalOrganization","name":"iArtHis_LAB Research Group","url":"https://iarthislab.es/","logo":"https://iarthislab.es/wp-content/uploads/2018/03/iarthis_logo_uma.png","image":"https://iarthislab.es/wp-content/uploads/2018/03/iarthis_logo_uma.png","description":"iArtHis_Lab is a research, innovation and training laboratory for the development of digital studies on artistic culture, and in particular for the progress and consolidation of the Digital Art History in Spain","address":{"@type":"PostalAddress","streetAddress":"Dpto. Historia del Arte Universidad de Málaga, Facultad de Filosofía y Letras, Campus de Teatinos, s/n","postOfficeBoxNumber":"29071","addressLocality":"Málaga","addressRegion":"Málaga","postalCode":"29071","addressCountry":"España"},"geo":{"@type":"GeoCoordinates","latitude":"36.7154799","longitude":"-4.4709432"},"hasMap":"https://www.google.com/maps/@36.7154799,-4.4709432,18.1z","openingHours":"Mo 09:00-20:00 Tu 09:00-20:00 We 09:00-20:00 Th 09:00-20:00 Fr 09:00-20:00"}
		</script>

		<link rel="dns-prefetch" href="//fonts.googleapis.com" />
		<link rel="preconnect" href="//fonts.googleapis.com" />
	
		<link rel="stylesheet" id="w3-css" href="./assets/vendor/w3/w3.css">
		<link rel="stylesheet" id="w3-css-theme" href="./assets/vendor/w3/w3-theme-blue-grey.css">
		<link rel="stylesheet" id="fontawesome" type="text/css" href="./assets/vendor/fontawesome/css/all.css" />
		<link rel="stylesheet" id="fonts" type="text/css" href="./assets/styles/app-fonts-sans-serif.css" />
		<link rel="stylesheet" id="screen" type="text/css" href="./assets/styles/app-styles.css" />
		<link rel="stylesheet" id="print" type="text/css" href="./assets/styles/app-print.css" />
	</head>
	<body>
		<div class="error404 w3-display-container">
			<div class="w3-display-middle w3-center">
				<img class="spinner-logo" src="./assets/images/logos/pathwise-logo.svg" height="100" width="100" />

				<h1 class="w3-text-red">
					This page is shown because Pathwise is in an unrecoverable error condition.
				</h1>
				<h1 class="w3-text-red">
					Esta página se muestra porque Pathwise está en una condición de error irrecuperable.
				</h1>
				<h2 class="w3-text-red"><?php echo $errortitle; ?></h3>

				<p>
					Error description / Descripción del error: 
					<strong>
						<span class="w3-text-red" id="err-description"><?php echo $message; ?></span>
					</strong>
				</p>
				<p>
					<a href="./#/" class="w3-button w3-black w3-center">Go home page / Ir a página inicial</a>
				</p>
			</div>
		</div>
	</body>
</html>
