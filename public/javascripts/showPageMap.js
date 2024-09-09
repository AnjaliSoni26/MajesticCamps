
//1. js for showing map " mapboxgl.Map "
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]  [-74.5, 40]
    zoom: 9, // starting zoom
});

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

// make marker at the passed coordinates
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)// set marker at[lng, lat] 
    .setPopup(//setiing popup
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h2> ${campground.title}</h2> <p>${campground.location}</p>`
            )
    )
    .addTo(map)                                // on above map