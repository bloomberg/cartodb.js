

/**
 * geocoders for different services
 *
 * should implement a function called geocode the gets
 * the address and call callback with a list of placemarks with lat, lon
 * (at least)
 */

cdb.geo.geocoder.YAHOO = {

  keys: {
    app_id: "nLQPTdTV34FB9L3yK2dCXydWXRv3ZKzyu_BdCSrmCBAM1HgGErsCyCbBbVP2Yg--"
  },

  geocode: function(address, callback) {
    address = address.toLowerCase()
      .replace(/é/g,'e')
      .replace(/á/g,'a')
      .replace(/í/g,'i')
      .replace(/ó/g,'o')
      .replace(/ú/g,'u')
      .replace(/ /g,'+');

      var protocol = '';
      if(location.protocol.indexOf('http') === -1) {
        protocol = 'http:';
      }

      $.getJSON(protocol + '//query.yahooapis.com/v1/public/yql?q='+encodeURIComponent('SELECT * FROM json WHERE url="http://where.yahooapis.com/geocode?q=' + address + '&appid=' + this.keys.app_id + '&flags=JX"') + '&format=json&callback=?', function(data) {

         var coordinates = [];
         if (data && data.query && data.query.results && data.query.results.json && data.query.results.json.ResultSet && data.query.results.json.ResultSet.Found != "0") {

          // Could be an array or an object |arg!
          var res;

          if (_.isArray(data.query.results.json.ResultSet.Results)) {
            res = data.query.results.json.ResultSet.Results;
          } else {
            res = [data.query.results.json.ResultSet.Results];
          }

          for(var i in res) {
            var r = res[i]
              , position;

            position = {
              lat: r.latitude,
              lon: r.longitude
            };

            if (r.boundingbox) {
              position.boundingbox = r.boundingbox;
            }

            coordinates.push(position);
          }
        }

        callback(coordinates);
      });
  }
}



cdb.geo.geocoder.NOKIA = {

  keys: {
    app_id:   "KuYppsdXZznpffJsKT24",
    app_code: "A7tBPacePg9Mj_zghvKt9Q"
  },

  geocode: function(address, callback) {
    address = address.toLowerCase()
      .replace(/é/g,'e')
      .replace(/á/g,'a')
      .replace(/í/g,'i')
      .replace(/ó/g,'o')
      .replace(/ú/g,'u');

      var protocol = '';
      if(location.protocol.indexOf('http') === -1) {
        protocol = 'http:';
      }

      $.getJSON(protocol + '//places.nlp.nokia.com/places/v1/discover/search/?q=' + encodeURIComponent(address) + '&app_id=' + this.keys.app_id + '&app_code=' + this.keys.app_code + '&Accept-Language=en-US&at=0,0&callback=?', function(data) {

         var coordinates = [];
         if (data && data.results && data.results.items && data.results.items.length > 0) {

          var res = data.results.items;

          for(var i in res) {
            var r = res[i]
              , position;

            position = {
              lat: r.position[0],
              lon: r.position[1]
            };

            if (r.bbox) {
              position.boundingbox = {
                north: r.bbox[3],
                south: r.bbox[1],
                east: r.bbox[2],
                west: r.bbox[0]
              }
            }
            if (r.category) {
              position.type = r.category.id;
            }
            if (r.title) {
              position.title = r.title;
            }
            coordinates.push(position);
          }
        }

        if (callback) {
          callback.call(this, coordinates);
        }
      });
  }
}

cdb.geo.geocoder.BING = {

  keys: {
    api_key:   "AiYSWJYqsRki5Kkx-0Q9BN4IIw6OOLrJvc1Iw7ll_BQAPq7YJ2-0y0gtq5DdGY1L",
  },

  geocode: function(address, callback) {
    address = address.toLowerCase()
      .replace(/é/g,'e')
      .replace(/á/g,'a')
      .replace(/í/g,'i')
      .replace(/ó/g,'o')
      .replace(/ú/g,'u');

      var protocol = '';
      if(location.protocol.indexOf('https') === -1) {
        protocol = 'https:';
      }
      $.ajax({
          url: protocol + '//dev.virtualearth.net/REST/v1/Locations?q=' + encodeURIComponent(address) + '&maxResults=1' + '&key=' + this.keys.api_key,
          dataType: 'jsonp',
          jsonp: "jsonp",
          success: function(data){
            var coordinates = [];
            if (data && data.resourceSets[0].resources) {
            
              var res = data.resourceSets[0].resources;

              for(var i in res) {
                var r=res[i],position;

                if(r.point){
                  position = {
                    lat: r.point.coordinates[0],
                    lon: r.point.coordinates[1]
                  };
                }

                if (r.bbox) {
                  position.boundingbox = {
                    north: r.bbox[2],
                    south: r.bbox[0],
                    east: r.bbox[3],
                    west: r.bbox[1]
                  }
                }
                
                coordinates.push(position);
            }
          }
          if (callback) {
            callback.call(this, coordinates);
        }
        }
      }
    );
  }
}

cdb.geo.geocoder.HERE = {

  // url: "geocoder.cit.api.here.com/6.2/geocode.json",
  url: "geocoder.api.here.com/6.2/geocode.json",

  keys: {
    app_id:   "dpVmd7FBsTAcNEkUDZlA",
    app_code: "h5jBMDW1x8bSFNEySGGLLA",
    gen: 9,
    maxresults: 1
  },

  geocode: function(address, callback) {
    address = address.toLowerCase()
      .replace(/é/g,'e')
      .replace(/á/g,'a')
      .replace(/í/g,'i')
      .replace(/ó/g,'o')
      .replace(/ú/g,'u');

      var protocol = '';
      if ( location.protocol.indexOf('http') === -1 ) {
        protocol = 'http:';
      } else if ( location.protocol === 'https:' || location.protocol === 'http:' ) {
        protocol =  location.protocol;
      }

      var here_url = protocol + '//' + this.url + '?';

      var key, i = 0;
      for (key in this.keys) {
        if (this.keys.hasOwnProperty(key)) {
          if ( i !== 0 ) {
            here_url+='&';
          }
          here_url+= key + '=' + this.keys[key];
          i++;
        }
      }
      here_url+= '&searchtext=' + encodeURIComponent(address);

      $.getJSON(here_url, function(data) {

         var _location, position, category;
         var coordinates = [];

         try {
           _location = data.Response.View[0].Result[0].Location;
           category = _location.LocationType;
         } catch (e) {
           console.error("Error geocoding e:", e);
           return;
         }

         if ( _location ) {
             position = {
              lat: _location.DisplayPosition.Latitude,
              lon: _location.DisplayPosition.Longitude
            };

            if ( _location.MapView ) {
                position.boundingbox = {
                    north: _location.MapView.TopLeft.Latitude,
                    south: _location.MapView.BottomRight.Latitude,
                    east: _location.MapView.BottomRight.Longitude,
                    west: _location.MapView.TopLeft.Longitude
                };
            }

            if ( _location.Address.Label ) {
              position.title = _location.Address.Label;
            }

            if ( category ) {
              position.type = category;
            }

            coordinates.push(position);
        }

        if (callback) {
          callback.call(this, coordinates);
        }
      }).fail(function( jqxhr, textStatus, error ) {
         var err = textStatus + ", " + error;
         console.error( "Geocoder request failure: " + err + "\nURL was:" + here_url );
      });
  }
}
