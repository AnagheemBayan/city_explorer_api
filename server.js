'use strict';

const PORT  = process.env.PORT  || 3000;
const express = require('express');
const cors = require('cors'); 
const app = express();
app.use(cors());

// start write the location server 

app.get('/location', getLocation);

function getLocation(request, response){
  let city = request.query.city;
  let locationData = require('./data/location.json');
  let getLocationObject = locationData[0];
  let locationObject = new Location(city,getLocationObject.display_name,getLocationObject.lat,getLocationObject.lon);
  response.send(locationObject);

}

function Location(search_query, formatted_query, latitude, longitude){
    this.search_query= search_query;
    this. formatted_query= formatted_query;
    this.latitude= latitude;
    this.longitude = longitude;
  }
  
  //   start the weather server 
  
  
  app.get('/weather',getWeather);

  let weatherArray=[];
  
  function weatherCnstructor(forecast,time){
      this.forecast=forecast;
      this.time = time;
      weatherArray.push(this);

    }
    
    function getWeather(req,res){
        if(weatherArray){
            weatherArray=[];
        }
        
        let weatherData = require('./data/ weather.json');
        let weather = weatherData.data;
        weather.forEach(element =>{
            let newData = new weatherCnstructor(element.valid_date,element.weather.description);
            
        });
        res.send(weatherArray);
    }
    
    
    app.listen(PORT, ()=>{
      console.log(`app is listening on port ${PORT}`);
    });