 // Global declaration of variables that are used in multiple fuctions
 var searchData = [];
 var displayData = [];
 var places;
 var markers = [];
 var lastOpenedInfoWindow;
 var $errorHandling = $('#myMain');

 // The searchTerms array consists of search terms for different categories of places
 var searchTerms = ["coffee", "restaurants", "parks", "museums"];
 var len = searchTerms.length;
 for (var i = 0; i < len; i++) {
   var searchTerm = searchTerms[i];
   // Yelp Data related to each serachTerm(category) is fetched using the fuction getYelpData()
   getYelpData(searchTerm);
 }

 function nonce_generate() {
   return (Math.floor(Math.random() * 1e12).toString());
 }

 // The function getYelpData gets the data from the yelp API, based on the search term (coffee,restaurants, parks, museums)
 // passed to the function
 function getYelpData(searchTerm) {

   var term = searchTerm;
   var results = '';
   var YELP_KEY_SECRET = 'DgexYSis1Cfg39Oax0tz4fvaOj4';
   var YELP_TOKEN_SECRET = 'je9SKFBwj3Lku37payRcAxMlgOw';
   var yelp_url = 'http://api.yelp.com/v2/search?';

   var parameters = {
     oauth_consumer_key: 'aiOs7xkmnFT7gRN6J81lcw',
     oauth_token: 'KTzPA1hG2gNUekjW0XwC6HdGjwZ4HTxq',
     oauth_nonce: nonce_generate(),
     oauth_timestamp: Math.floor(Date.now() / 1000),
     oauth_signature_method: 'HMAC-SHA1',
     oauth_version: '1.0',
     callback: 'cb',
     term: term,
     bounds: '37.2871651879,-122.5263977051|37.8142214209,-121.7848205566',
     limit: '20',
     sort: '2'
   };

   var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
   parameters.oauth_signature = encodedSignature;


   var settings = {
     url: yelp_url,
     data: parameters,
     cache: true,
     dataType: 'jsonp',

     // The results that are returned by the yelp API are sent to handleResults fuction for processing
     success: function(results) {
       handleResults(results);
     },

     // This function is used to handle the errors occured when connecting to Yelp API
     error: function() {
       // Creating a new DIV on the Page
       var newDiv = document.createElement("div");
       // Creating an error message to be displayed to the user
       var newContent = document.createTextNode("Places cannot be loaded this time, please check back later");
       // Adding content to the DIV element
       newDiv.appendChild(newContent);
       var currentDiv = document.getElementById("myMain");
       // Placing the newly created div before an existing div
       document.body.insertBefore(newDiv, currentDiv);
     }
   };
   $.ajax(settings);
 }

 // This function iterates over the json objects containing the results
 function handleResults(results) {
   $.each(results, function(key, value) {
     var tempDispData = []
     if (key == "businesses") {
       var searchData = value;
       $.each(searchData, function(key, value) {
         var businesses = value;
         // A business Object is created for each of the Places passed back
         var businessObj = {
           "name": businesses.name,
           "id": businesses.id,
           "rating": businesses.rating,
           "url": businesses.url,
           "location": {
             "lat": businesses.location.coordinate.latitude,
             "lng": businesses.location.coordinate.longitude
           },
           "categories": businesses.categories[0]
         };
         // The business object is pushed into the tempDispData and displayData Arrays
         tempDispData.push(businessObj);
         displayData.push(businessObj);
       });

       // For each of the places in the tempDispData a marker is created
       for (var i = 0; i < tempDispData.length; i++) {
         var location = tempDispData[i].location;
         var name = tempDispData[i].name;
         var rating = tempDispData[i].rating;
         var url = tempDispData[i].url;
         markPlace(location, name, url, rating);
       }
       // fuction knock() is called by passing the displayData Array
       knock(displayData);
     }

   });
 }

 // This function is used to display marker for each place
 function markPlace(location, name, url, rating) {
   var marker = new google.maps.Marker({
     position: location,
     map: map
   });
   // each marker is passed in to the markers array
   markers.push(marker);
   attachInfoWindow(marker, name, url, rating);
   return marker;
 }



 // This fuction creates and attaches info window to every marker on the map
 function attachInfoWindow(marker, name, url, rating) {
   var contentString = '<div id="content">' +
     '<div id="siteNotice">' +
     '</div>' +
     '<h1 id="firstHeading" class="firstHeading">' + name + '</h1>' +
     '<div id="bodyContent">' +
     '<p><b>Yelp Rating: ' + rating + '</b><a href="' + url + '">' +
     'Checkout here for more information, images and reviews</a> ' +
     '</p>' +
     '</div>' +
     '</div>';

   var infowindow = new google.maps.InfoWindow({
     content: contentString
   });

   // This function adds bouncing animation to the marker when clicked
   function toggleBounce() {
     if (marker.getAnimation() != null) {
       marker.setAnimation(null);
     } else {
       marker.setAnimation(google.maps.Animation.BOUNCE);
     }
   }

   marker.addListener('click', function() {
     closeInfoWindow();
     toggleBounce();
     infowindow.open(marker.get('map'), marker);
     setTimeout(toggleBounce, 1500);
     lastOpenedInfoWindow = infowindow;
   });
 } // attachInfoWindow

 // This function closes any previously opened InfoWindow
 function closeInfoWindow() {
   if (lastOpenedInfoWindow) {
     lastOpenedInfoWindow.close();
   }
 }

 // This function binds the HTML elements to the AppViewModel
 function knock() {
   places = displayData;
   var vm = new AppViewModel(places);
   vm.query.subscribe(vm.search);
   ko.applyBindings(vm);
 }


 // This function contains all the list fuctionality functions handled by knockout.js
 function AppViewModel(places) {
   var self = this;
   self.places = ko.observableArray(places);
   self.query = ko.observable('');

   // This function is used to search the places on the list and updates the list according to the search
   self.search = function(value) {
     self.places.removeAll();
     setMapOnAll(null);
     for (var i = 0; i < places.length; i++) {
       if (places[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
         self.places.push(places[i]);
         var loc = places[i].location
         var name = places[i].name;
         var url = places[i].url;
         var rating = places[i].rating;
         markPlace(loc, name, url, rating);
       }
     }

   };

   // This function opens the info window of the marker when a list item is clicked
   showMeTheMarker = function() {
     var location = this.location;
     var name = this.name;
     var url = this.url;
     var rating = this.rating;

     for (var i = 0; i < markers.length; i++) {

       markerLat = markers[i].get('position').lat().toString();
       markerLng = markers[i].get('position').lng().toString();

       locationLat = location.lat.toString();
       locationLng = location.lng.toString();

       if (markerLat == locationLat) {

         var marker = new google.maps.Marker({
           position: location,
           map: markers[i].get('map')
         });

         var contentString = '<div id="content">' +
           '<div id="siteNotice">' +
           '</div>' +
           '<h1 id="firstHeading" class="firstHeading">' + name + '</h1>' +
           '<div id="bodyContent">' +
           '<p><b>Yelp Rating: ' + rating + '</b><a href="' + url + '">' +
           'Checkout here for more information, images and reviews</a> ' +
           '</p>' +
           '</div>' +
           '</div>';

         var infowindow = new google.maps.InfoWindow({
           content: contentString
         });
         closeInfoWindow();
         infowindow.open(marker.get('map'), marker);
         lastOpenedInfoWindow = infowindow;

       }

     };
   };
 }

 // This function is used to set or delete the markers on the map
 function setMapOnAll(map) {
   for (var i = 0; i < markers.length; i++) {
     markers[i].setMap(map);
   }
 }