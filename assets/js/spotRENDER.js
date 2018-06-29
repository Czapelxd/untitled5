$( function() {


    var select = $( "#minbeds" );
    var slider = $( "<div id='slider' style='display: none'></div>" ).insertAfter( select ).slider({
        range: "min",
        min: 1,
        max: 3,
        value: select[ 0 ].selectedIndex,
        slide: function( event, ui ) {
            select[ 0 ].selectedIndex = ui.value;
        },
        change: function (event, ui) {
            console.log(ui.value);

            $.each(markers, function (index, marker) {
                if (marker.wind <= ui.value + 19 && ui.value == 1) {
                    marker.setMap(map);
                } else if (marker.wind > ui.value + 18 && marker.wind <= ui.value + 23 && ui.value == 2) {
                    marker.setMap(map);
                } else if (marker.wind > ui.value + 22 && ui.value == 3) {
                    marker.setMap(map);
                } else {
                    marker.setMap(null);
                }
            });


        }
    });
    $( "#minbeds" ).on( "change", function() {
        slider.slider( "value", this.selectedIndex);
    });





    // $( "#slider-range" ).slider({
    //     orientation: "vertical",
    //     range: true,
    //     min: 0,
    //     max: 40,
    //     values: [0, 10],
    //     slide: function( event, ui ) {
    //         $( "#amount1" ).val( ui.values[ 0 ] + "knots") +  $( "#amount2" ).val(ui.values[ 1 ] + "knots" );
    //     },
    //     change: function( event, ui ) {
    //         console.log(ui.value);
    //         $.each(markers, function (index, marker) {
    //             if (marker.wind > ui.values[ 0 ] && marker.wind < ui.values[ 1 ]){
    //                 marker.setMap(map);
    //             } else {
    //                 marker.setMap(null);
    //             }
    //         });
    //     }
    //
    // });

    // $(".slider").slider().slider("pips");

    $( "#slider-range-min" ).slider({
        range: "min",
        value: 37,
        min: 1,
        max: 100,
        slide: function( event, ui ) {
            $( "#rangeStart" ).val( + ui.value );
        },
        change: function( event, ui ) {
            console.log(ui.value);
            $.each(markers, function (index, marker) {
                if (marker.distance <= ui.value){
                    marker.setMap(map);
                } else {
                    marker.setMap(null);
                }
            });
        }
    });

    $( "#rangeStart" ).val(  $( "#slider-range-min" ).slider( "value" ) );

} );