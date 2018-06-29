var map, options, position, infoWindow, markers = [];


function initAutocomplete() {

    var options = {
        center: {lat: 34.052235, lng: -118.243683},
        zoom: 10
    }

    map = new google.maps.Map(document.getElementById('map'), options);
    infoWindow = new google.maps.InfoWindow;

    var $ul = $('div#panel ul');


    // var input = document.getElementById('pac-input');
    //
    // var autocomplete = new google.maps.places.Autocomplete(input);
    // autocomplete.bindTo('bounds', map);
    //
    //
    // var infowindow = new google.maps.InfoWindow();
    // var infowindowContent = document.getElementById('infowindow-content');
    // infowindow.setContent(infowindowContent);
    // var marker = new google.maps.Marker({
    //     map: map
    // });
    // marker.addListener('click', function() {
    //     infowindow.open(map, marker);
    // });
    //
    // autocomplete.addListener('place_changed', function() {
    //     infowindow.close();
    //     var place = autocomplete.getPlace();
    //     if (!place.geometry) {
    //         return;
    //     }
    //
    //     if (place.geometry.viewport) {
    //         map.fitBounds(place.geometry.viewport);
    //     } else {
    //         map.setCenter(place.geometry.location);
    //         map.setZoom(17);
    //     }
    //
    //     // Set the position of the marker using the place ID and location.
    //     marker.setPlace({
    //         placeId: place.place_id,
    //         location: place.geometry.location
    //     });
    //     marker.setVisible(true);
    //
    //     infowindowContent.children['place-name'].textContent = place.name;
    //     infowindowContent.children['place-id'].textContent = spot.wind_speed;
    //     infowindowContent.children['place-address'].textContent =
    //         place.formatted_address;
    //     infowindow.open(map, marker);
    // });



    function renderMarker(spot) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + spot.latitude + '&lon=' + spot.longitude + '&units=metric&APPID=de8d8dab5a26d471361f3c19704e9c3f';
        $.getJSON(url, {}, function (spotWeather) {
            var $ul = $('div#panel ul');

            var R = 6371e3; // metres
            var φ1 = options.center.lat*Math.PI/180;
            var φ2 = spot.latitude*Math.PI/180;
            var Δφ = (spot.latitude-options.center.lat)*Math.PI/180;
            var Δλ = (options.center.lng-spot.longitude)*Math.PI/180;

            var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            var d = R * c/1800;


            console.log(d);

            spot.wind_speed = Math.round(spotWeather.wind.speed);

            // Creating a marker and putting it on the map
            var marker = new google.maps.Marker({
                id: spot.spot_id,
                position: new google.maps.LatLng(spot.latitude, spot.longitude),
                distance: d,
                map: map,
                title: spot.spot_name,
                wind: spot.wind_speed
            });

            markers.push(marker);

            google.maps.event.addListener(marker, "click", function (e) {
                infoWindow.setContent(marker.title + '<br/>wiatr: ' + spot.wind_speed + '<br/>'+marker.distance);
                infoWindow.open(map, marker);
            });

            $ul.append('<li data-id="' + spot.spot_id + '">' + spot.spot_name + ' (' + spot.wind_speed + ')<li>');
        });
    }

    // function renderMarker(spot) {
    //
    //     var R = 6371e3; // metres
    //     var φ1 = options.center.lat*Math.PI/180;
    //     var φ2 = spot.latitude*Math.PI/180;
    //     var Δφ = (spot.latitude-options.center.lat)*Math.PI/180;
    //     var Δλ = (options.center.lng-spot.longitude)*Math.PI/180;
    //
    //     var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    //         Math.cos(φ1) * Math.cos(φ2) *
    //         Math.sin(Δλ/2) * Math.sin(Δλ/2);
    //     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    //
    //     var d = R * c/1800;
    //
    //
    //     console.log(d);
    //
    //
    //             // Creating a marker and putting it on the map
    //             var marker = new google.maps.Marker({
    //                 id: spot.spot_id,
    //                 position: new google.maps.LatLng(spot.latitude, spot.longitude),
    //                 distance: d,
    //                 map: map,
    //                 title: spot.spot_name,
    //             });
    //
    //             markers.push(marker);
    //
    //             google.maps.event.addListener(marker, "click", function (e) {
    //                 infoWindow.setContent(marker.title + '<br/>wiatr: ' + spot.wind_speed + '<br/>'+marker.distance);
    //                 infoWindow.open(map, marker);
    //             });
    //
    //             $ul.append('<li data-id="' + spot.spot_id + '">' + spot.spot_name + ' (' + spot.wind_speed + ')<li>');
    //
    // }



    if (localStorage.spotsData) {
        var spotsData = JSON.parse(localStorage.spotsData);
        $.each(spotsData, function (idx, item) {

            renderMarker(item);

        })
    } else {
        $.getJSON('http://api.spitcast.com/api/spot/all', {}, function (spotsData) {
            // $ul.appendChild('<ul>');

            localStorage.spotsData = JSON.stringify(spotsData);

            $.each(spotsData, function (idx, item) {

                renderMarker(item);


            })
        });
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                marker.setPosition(pos);
                map.setCenter(pos);
            }, function () {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
        }
    }


    getLocation()

}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}