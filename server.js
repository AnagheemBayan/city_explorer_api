'use strict';
require('dotenv').config();
const PORT  = process.env.PORT ;
const express = require('express');
const cors = require('cors'); 
const app = express();
app.use(cors());
const superAgent= require('superagent');
const { response } = require('express');
const locationKey=process.env.location;
const weatherKey=process.env.weather;
const park=process.env.park;
app.get('/location', getLocation);
app.get('/weather',getWeather);
app.get('/park',getPark);
let lat ;
let lon ;


// start write the location server 
function getLocation(request, response){
 try{
  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${city}&format=json`;
  superAgent.get(url).then(res=>{
   let data=res.body[0];
   let locationObject = new Location(city,data.display_name,data.lat,data.lon);
   lat=data.lat;
   lon=data.lon;
   response.send(locationObject);
  });
  response.send(locationObject);
 } catch(error){
     response.status(500).send('something went wrong ')
 }
 

}




function LocationConstructor(search_query, formatted_query, latitude, longitude){
    this.search_query= search_query;
    this. formatted_query= formatted_query;
    this.latitude= latitude;
    this.longitude = longitude;
  }
  
  //   start the weather server 
  let weatherArray=[];
  function weatherCnstructor(forecast,time){
      this.forecast=forecast;
      this.time = time;
      weatherArray.push(this);

    }
    
    function getWeather(req,res){

    try{
        weatherArray=[];
        let url=`http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${weatherKey}`
        superAgent.get(url).then(response=>{
          let dataWeather=response.body;
          dataWeather.data.map(element =>{
          let newData = new weatherCnstructor(element.valid_date,element.weather.description);
        })
        res.send(weatherArray);
        });
    catch(error){
        res.status(500).send('something went wrong ')

    }

    }

  // start park function 

    let parkArr=[];
   function Park(name,url,des,fee,address){
    this.name=name;
    this.url=url;
    this.des=des;
    this.fee=fee;
    this.address=address;
    parkArr.push(this);

   }
    function getPark(request,res){
      let url=`https://developer.nps.gov/api/v1/parks?api_key=${park}`
      superAgent.get(url).then(response=>{
        let dataPark=response.body.data;
        dataPark.forEach(element =>{
          let name= element.fullName;
          let url=element.url;
          let des=element.description;
          let fee=element.entranceFees.cost;
          let address= element.addresses[0].line1 + ','+ element.addresses[0].city + ','+ element.addresses[0].stateCode + ','+ element.addresses[0].postalCode;
          let newPark = new Park(name,url,des,fee,address);
      })
        res.send(parkArr);
      });
    }
    app.listen(PORT, ()=>{
      console.log(`app is listening on port ${PORT}`);
    });