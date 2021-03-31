'use strict';
let lat;
let lon;
require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const superAgent = require('superagent');
const locationKey = process.env.location;
const weatherKey = process.env.weather;
const park_Key = process.env.park;
const movieKey=process.env.movie;
const yelpKey=process.env.yelp;
const DATABASE_URL = process.env.DATABASE_URL;

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/parks', getPark);
app.get('/movies',getMovies);
// app.get('/yelp',getYelp);
app.use('*', handleError);

const pg = require('pg');
const client = new pg.Client(DATABASE_URL);
client.on('error', err => {
  console.log('No Database are found')
});

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('app is listning on port' + PORT);
  });
}).catch(err => {
  console.log('Sorry there is an error' + err);
});



function handleError(req, res) {
  res.status(404).send('No server found ');
}

// start write the location server 
function getLocation(request, response) {
  
  let city = request.query.city;
  const sqlSearch = "SELECT * FROM locations WHERE  search_query=$1 "
  const sqlSearchArr = [city]
  client.query(sqlSearch, sqlSearchArr).then((data)=>{
    if(data.rowCount === 0){
      let url = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${city}&format=json`;
      superAgent.get(url).then(res => {
        let data = res.body[0];
        lat = data.lat;
        lon = data.lon;
        let locationObject = new Location(city, data.display_name,data.lat,data.lon);
        const insertValue = 'INSERT INTO locations (search_query,formatted_query, latitude,longitude) VALUES ($1, $2 ,$3 ,$4);';
        const newRow = [locationObject.search_query, locationObject.formatted_query ,locationObject.latitude,locationObject.longitude];
        client.query(insertValue, newRow)
        .then((data) => {
          response.send(data.rows[0]);
          
        });
      })
      
    } else {
      response.send(data.rows[0]);
    }
  })
  
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// Weather server function:

function getWeather(req, res) {
  weatherArray = [];
  let url = `http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${weatherKey}`
  superAgent.get(url).then(response => {
    let dataWeather = response.body
    dataWeather.data.map(element => {
     let newLocation = new weatherCnstructor(element.valid_date, element.weather.description);
    })
    res.send(weatherArray);
  })
    .catch((error) => {
      res.status(500).send('something wrong');

    })
}



// start park function

function getPark(request, res) {
  let url = `https://developer.nps.gov/api/v1/parks?api_key=${park_Key}&q=${request.query.search_query}`
  console.log(url);
  superAgent.get(url).then(response => {
    const data = response.body.data.map(data => {

      let name = data.fullNam;
      let url = data.url;
      let des = data.description;
      let fee = data.entranceFees[0].cost;
      let address = data.addresses[0].line1 + data.addresses[0].city;
      return new Park(name, url, des, fee, address);
    })

    res.send(data);
  })
    .catch((error) => {
    res.status(500).send('something wrong');
    })
  }

 
    function getMovies(request, response){
        let url = `http://api.themoviedb.org/3/movie/top_rated?api_key=${movieKey}&query=${request.query.city}`
        superAgent.get(url).then(res => {
            let movieData = res.body.results;
            movieData.map(element => {   
            let title= element.title;
            let view = element.overview;
            let avarage= element.vote_average;
            let count = element.vote_count;
            let pop= element.popularity;
            let relase = element.release_date;
            let imgUrl= `https://image.tmdb.org/t/p/w500${image_url}`;
            let newMovie= new Movies(title,view,avarage,count,pop,relase,imgUrl);
        });
            
            response.send(movieArr)
        }) .catch((error) => {
          response.status(500).send('something wrong');
          })
        }
      
    
  


  // function getYelp(request,response){


  // }
  // \\\\\\\\\\\\\\\\\\\\\\ THE CONSTRUCORS FOR FUNCTIONS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


    function Location(search_query, formatted_query, latitude, longitude) {
      this.search_query = search_query;
      this.formatted_query = formatted_query;
      this.latitude = latitude;
      this.longitude = longitude;
    }

    // //////////////////////////////////////////////////////////////////////
    
    
    let weatherArray = [];
    function weatherCnstructor(forecast, time) {
      this.forecast = forecast;
      this.time = time;
      weatherArray.push(this);
      
    }
    
    // /////////////////////////////////////

    function Park(name, url, des, fee, address) {
      this.name = name;
      this.url = url;
      this.des = des;
      this.fee = fee;
      this.address = address;
     
    }
   let movieArr =[];
    function Movies(title, overview, average_votes, total_votes, image_url, popularity, released_on) {
      this.title = title;
      this.overview =overview ;
      this.average_votes = average_votes;
      this.total_votes = total_votes;
      this.popularity =popularity;
      this.released_on =released_on;
      this.image_url = image_url;
      movieArr.push(this);
  
  }
  
  function Yelp(name ,image_url,price,rating,url) {
    this.name = name;
    this.image_url = image_url;
    this.price = price;
    this.rating =rating;
    this.url =url;
  }


