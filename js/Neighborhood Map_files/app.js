var searchData = [];
var displayData =[];
var places;

function nonce_generate() {
	return (Math.floor(Math.random() * 1e12).toString());
}

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
		oauth_timestamp: Math.floor(Date.now()/1000),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_version : '1.0',
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

		success: function(results) {
			handleResults(results);

		},

		error: function() {
			console.log('Failed');
		}
	};

	$.ajax(settings);
}


var searchTerms = ["coffee","restaurants","parks","museums"];
var len = searchTerms.length;
for (var i = 0; i < len ; i++) {

    var searchTerm = searchTerms[i];
	getYelpData(searchTerm);
}



function handleResults(results)
{
	$.each(results, function(key, value)
	{
		if(key == "businesses")
		{
	 		var searchData = value;
			$.each(searchData,function(key,value)
			{
				  var businesses = value ;
				  var businessObj = {
				  					"name": businesses.name,
				  					"id": businesses.id,
				  					"rating" : businesses.rating,
				  					"url" : businesses.url,
				  					"location":{
			    			  					 "lat": businesses.location.coordinate.latitude,
			    			  					 "lng": businesses.location.coordinate.longitude
				  					           },
				  					"categories" : businesses.categories[0]
				  					};
				  displayData.push(businessObj);
			});
            knock(displayData);


			 for (var i = 0; i < displayData.length; i++)
			 {

	        	var location = displayData[i].location;

	        	var marker = new google.maps.Marker({
	     		position: location,
	      		map: map,
	    		});
	    	    attachInfoWindow(marker, displayData[i].name, displayData[i].url, displayData[i].rating);
	        }

		}

	});
}

function attachInfoWindow(marker, name, url, rating) {

      var contentString = '<div id="content">'+
	            '<div id="siteNotice">'+
	            '</div>'+
	            '<h1 id="firstHeading" class="firstHeading">'+ name +'</h1>'+
	            '<div id="bodyContent">'+
	            '<p><b>Yelp Rating: '+rating+'</b><a href="'+url+'">'+
	            'Checkout here for more information, images and reviews</a> '+
	            '</p>'+
	            '</div>'+
	            '</div>';

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker.addListener('click', function()
        {
          infowindow.open(marker.get('map'), marker);
        });
      }


function knock()
{


    	places = displayData ;

        var vm = AppViewModel(places);
        vm.query.subscribe(vm.search);
		ko.applyBindings(vm);



	  //   var viewModel =
	  //   {
	  //     places: ko.observableArray(places),

	  //     query: ko.observable(''),

	  //     search : function(value)
	  //     {
	  //       viewModel.places.removeAll();

	  //       for (var i = 0; i < places.length; i++)
	  //       {

			// 	if(places[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0)
			// 	{

	  //           viewModel.places.push(places[i]);
	  //           }
	  //       };

	  //     },

	  //     showMessage : function()
	  //     {

   //        }
	  //   };

	  //   viewModel.query.subscribe(viewModel.search);

	  //   ko.applyBindings(viewModel);
   // }
}

function AppViewModel(places)
{
	var self = this;
	self.places = ko.observableArray(places);
	query = ko.observable('');
	console.log(places.length);
	self.search = function(value)
	{
		self.places.removeAll();
		for (var i = 0; i < places.length; i++)
	        {
				if(places[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0)
				{
	            self.places.push(places[i]);
	            }
	        }

	};
}





