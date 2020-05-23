<?php
	//error_reporting(E_ALL);
	//ini_set('display_errors', 1);

	// Used to enable cross-domain AJAX calls.
	// Example: index.php?url=http://www.example.org/resource.json

	$cusr = $_REQUEST['u'] ?? 'FKUSR';
	$cpwd = $_REQUEST['p'] ?? 'FKPWD';
	$lang = $_REQUEST['l'] ?? 'es';

	$sec = "http://expofinder.uma.es/wp-admin/admin-ajax.php?q=pathfinder&action=csl_generic_ajax_call&f=json&c=z&x=c&u=$cusr@$cpwd";
	$dfile = file_get_contents($sec);
	$isauth = json_decode($dfile)->credentials->cauth;
	if(!$isauth) {
		header('HTTP/1.0 403 Forbidden');
		echo 'Forbidden';
		exit(0);
	}
	
	$url = "http://expofinder.uma.es/wp-content/themes/csl/pathwise.php?l=$lang";
	
	if (substr ($url, 0, 7) != "http://"
		&& substr ($url, 0, 8) != "https://"
		&& substr ($url, 0, 6) != "ftp://") {
		// NB: only absolute URLs are allowed -
		// otherwise the script could be used to access local-to-file system files
		die("ERROR: The argument 'url' must be an absolute URL beginning with 'http://', 'https://', or 'ftp://'.");
	}

	// temporarily override CURLs user agent with the user's own
	ini_set("user_agent", $_SERVER['HTTP_USER_AGENT']);

	// enable access from all domains
	enable_cors();

	switch ($_SERVER["REQUEST_METHOD"]) {
		case "GET":
			get($url);
			break;
		default:
			post($url);
			break;
	}


	// get the contents of the URL and echo the results
	function get($url) {
		$dfile = file_get_contents($url);
		$size = 0;
		if(is_array($http_response_header)) {
			foreach($http_response_header as $resp) {
				if(strpos($resp, 'Content-Length: ') === 0) {
					$size = explode(': ', $resp)[1];
				}
			}
		}
		//$dsize = filesize($file);
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="pathwise.db"');
		header('Expires: 0');
		header("Content-length: $size");
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		flush(); // Flush system output buffer
		echo $dfile;
	}

	// gets over HTTPS
	function getSSL($url) {
	    $ch = curl_init();
	    curl_setopt($ch, CURLOPT_HEADER, false);
	    curl_setopt($ch, CURLOPT_URL, $url);
	    curl_setopt($ch, CURLOPT_SSLVERSION,3); 
	    $result = curl_exec($ch);
	    curl_close($ch);
	    return $result[0];
	}

	// post (or put or delete?) the encoded form to the URL and echo the results
	function post($url) {
		$postdata = http_build_query(
		    array()
		);

		$opts = array('http' =>
		    array(
		        'method'  => $_SERVER['REQUEST_METHOD'],
		        'header'  => 'Content-type: application/x-www-form-urlencoded',
		        'content' => $postdata
		    )
		);

		$context  = stream_context_create($opts);

		// get the contents of the external URL and echo it
		echo file_get_contents($url, false, $context);
	}

	/**
	 *  An example CORS-compliant method.  It will allow any GET, POST, or OPTIONS requests from any
	 *  origin.
	 *
	 *  In a production environment, you probably want to be more restrictive, but this gives you
	 *  the general idea of what is involved.  For the nitty-gritty low-down, read:
	 *
	 *  - https://developer.mozilla.org/en/HTTP_access_control
	 *  - http://www.w3.org/TR/cors/
	 *
	 */
	function enable_cors() {
		// Allow from any origin
		if (isset($_SERVER['HTTP_ORIGIN'])) {
			header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
			header('Access-Control-Allow-Credentials: true');;
			header('Access-Control-Max-Age: 86400');	// cache for 1 day
			header('Access-Control-Expose-Headers: Content-Length');
		} else {
			header("Access-Control-Allow-Origin: *");
			header('Access-Control-Allow-Credentials: true');;
			header('Access-Control-Max-Age: 86400');	// cache for 1 day
			header('Access-Control-Expose-Headers: Content-Length');
		}

		// Access-Control headers are received during OPTIONS requests
		if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

			if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
				header("Access-Control-Allow-Methods: GET, POST, OPTIONS");		 

			if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
				header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

			exit(0);
		}
	}
?>