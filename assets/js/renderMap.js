var map, options, position, infoWindow, markers = [];


function initAutocomplete() {

    var options = {
        mapTypeControl: false,
        center: {lat: 34.052235, lng: -118.243683},
        zoom: 10
    }

    map = new google.maps.Map(document.getElementById('map'), options);
    infoWindow = new google.maps.InfoWindow;

    function renderMarker(spot) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + spot.latitude + '&lon=' + spot.longitude + '&units=metric&APPID=de8d8dab5a26d471361f3c19704e9c3f';
        $.getJSON(url, {}, function (spotWeather) {
            var $ul = $('select#destination-input');

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


            spot.wind_speed = Math.round(spotWeather.wind.speed);

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
                infoWindow.setContent(marker.title + '<br/>wiatr: ' + spot.wind_speed);
                infoWindow.open(map, marker);
            });

            $ul.append('<option value="' + marker.position+ '">' + spot.spot_name + ' (' + spot.wind_speed + ')');
        });
    }

    if (localStorage.spotsData) {
        var spotsData = JSON.parse(localStorage.spotsData);
        $.each(spotsData, function (idx, item) {

            renderMarker(item);

        })
    } else {
        $.getJSON('http://api.spitcast.com/api/spot/all', {}, function (spotsData) {

            localStorage.spotsData = JSON.stringify(spotsData);

            $.each(spotsData, function (idx, item) {

                renderMarker(item);


            })
        });
    }



    new AutocompleteDirectionsHandler(map);

}

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, {placeIdOnly: true});
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {placeIdOnly: true});

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function() {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route({
        origin: {'placeId': this.originPlaceId},
        destination: {'placeId': this.destinationPlaceId},
        travelMode: this.travelMode
    }, function(response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};


