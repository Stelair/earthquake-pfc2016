var datos,
	map,
	tiempoRefresco = 3600000; //1h = 3.6e+6 ms;

window.setInterval(peticionAjax(), tiempoRefresco); 


function peticionAjax(url) {
	console.log('Inicio Sismo');
	
	var url = url || 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';

	// Inicilizamos Mapa
	initMapa();

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4) {
			if (xmlHttp.status >= 100 && xmlHttp.status <= 300) {
						
						datos = JSON.parse(xmlHttp.responseText);
						console.log( "La solicitud se ha completado correctamente." );
						console.info(datos);

						var contenido = '';
						
						// Inicializamos Mapa de Google
						

						if (datos.length != 0) {

							document.getElementById('sis_cargando').style.display = 'none';


							for (var i= 0; i < datos.features.length; i++ ) {
								dibujarMapa(datos.features[i]);
								//contenido += dibujarHTML(datos.features[i]);
							}

							//document.body.innerHTML = contenido;
							//document.querySelector('#sis_info > div').innerHTML = contenido;
						}
						
						else {
							console.warn('No ha habido ningún simo !!!')
						}
					
						
			} else if (xmlHttp.status >= 400 && xmlHttp.status <= 600) {
				errorDatos(JSON.parse(xmlHttp.responseText));
			}
		}
	};
	xmlHttp.open("GET", url, true);
	xmlHttp.send();
} 


function dibujarMapa(datosSismo) {
	
	var heatmapData = [];
	var coords = datosSismo.geometry.coordinates;
	var latLng = new google.maps.LatLng(coords[1],coords[0]);
	var lugar = datosSismo.properties.title
	

	//Mostrar Info Mapa
  	var contentString = dibujarHTML(datosSismo);

	var infowindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 250
	});


	var marker = new google.maps.Marker({
		position: latLng,
		map: map,
		title: lugar
	});

	marker.addListener('click', function() {
    	infowindow.open(map, marker);
  	});
	
	var magnitude = datosSismo.properties.mag;
  
	
	var weightedLoc = {
		location: latLng,
		weight: Math.pow(2, magnitude)
	};
	
	heatmapData.push(weightedLoc);
	
	var heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      dissipating: false,
      map: map
    });
}


function dibujarHTML(datosSismo) { 
	var contenido = '';
	console.info(datosSismo.properties.title);

	contenido += '<div class="sis-info" id="' + datosSismo.properties.code + '">';
	contenido += '<h3>' + datosSismo.properties.place + '</h3>';
	contenido += '<ul>';
	contenido += '<li><p><strong>Magnitud </strong>' + datosSismo.properties.mag + '</p></li>';
	contenido += '<li><p><strong>Tipo </strong>' + datosSismo.properties.type + '</p></li>';
	contenido += '<li><p><strong>Hora </strong></p>';
	contenido += '<p>' + formatearFechaUTC(datosSismo.properties.time) + '</p>';
	contenido += '<p>' + formatearFechaMiZonaHoraria(datosSismo.properties.time) + '<span> (tu zona horaria)</span></p></li>';
	contenido += '<li><a class="sis-btn" href=" ' + datosSismo.properties.url + '">Más información</a></li>';
	contenido += '</ul>'; 
	contenido += '</div>'; 
	
	return contenido
}


function formatearFechaUTC(time) {

	var fecha = new Date(time);
	
	var opciones = { 
		//weekday: 'long',
		year: 'numeric', 
		month: 'numeric', 
		day: 'numeric',
		timeZone:  'UTC',
		timeZoneName: 'short',
		hour: 'numeric',
		minute: 'numeric', 
		second:'numeric',
		hour12: false
	};

	var fechaUTC = Intl.DateTimeFormat('es-ES', opciones).format(fecha)
		console.log('Fecha UTC: ' + fechaUTC);
		
	return fechaUTC;
}


function formatearFechaMiZonaHoraria(time) {

	var fecha = new Date(time);
	var opciones = { 
		year: 'numeric', 
		month: 'numeric', 
		day: 'numeric',
		timeZoneName: 'short',
		hour: 'numeric',
		minute: 'numeric', 
		second:'numeric',
		hour12: false
	};

	var fechaMiZonaHoraria = fecha.toLocaleString('es-ES', opciones);
	console.log('Fecha Local: ' + fechaMiZonaHoraria);

	return fechaMiZonaHoraria;
}


function errorDatos(error) {
	document.getElementById('sis_cargando').style.display = 'none';
	document.getElementById('sis_error').style.display = 'block';
	document.querySelector('sis-error>div').innerHTML = '<img src="http://www.404notfound.fr/assets/images/pages/img/androiddev101.jpg">';
	console.error('ERROR! 404', error)
}


// MAPA GOOGLE APPI
function initMapa() {

	var spain = { lat: 40.3964, lng: -3.7129 }; 
	
	var mapOptions = {
    zoom: 2,
    center: spain,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: true,
    disableDefaultUI: true
  };

  map = new google.maps.Map(document.getElementById('map_epicenter'), mapOptions);
}


// Filters
document.getElementById("past_hour_m4").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_hour.geojson';
	peticionAjax(url);

});
document.getElementById("past_hour_m2").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson';
	peticionAjax(url);
});
document.getElementById("past_hour_m1").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson';
	peticionAjax(url);
});
document.getElementById("past_hour_all").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
	peticionAjax(url);
});


document.getElementById("past_day_m4").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';
	peticionAjax(url);
});
document.getElementById("past_day_m2").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
	peticionAjax(url);
});
document.getElementById("past_day_m1").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson';
	peticionAjax(url);
});
document.getElementById("past_day_all").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
	peticionAjax(url);
});


document.getElementById("past_7_days_m4").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';
	
});
document.getElementById("past_7_days_m2").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
	
});
document.getElementById("past_7_days_m1").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson';
	
});
document.getElementById("past_7_days_all").addEventListener('click', function() {
	var url = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
	
});

