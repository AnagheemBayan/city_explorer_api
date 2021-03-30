'use strict';
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
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });
client.connect().then(() => {
app.listen(process.env.PORT || PORT, () => {
console.log('Server Start at ' + PORT + ' .... ');
  })
});

    app.get('/location', getLocation);
    app.get('/weather', getWeather);
    app.get('/parks', getPark);
    app.use('*', handleError);
    let lat;
    let lon;

    function handleError(req, res) {
      res.status(404).send('No server found ');
    }


    // start write the location server 
    function getLocation(request, response) {
      let city = request.query.city;
      let url = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${city}&format=json`;
      superAgent.get(url).then(res => {
        let data = res.body[0];
        let locationObject = new Location(city, data.display_name, data.lat, data.lon);
        lat = data.lat;
        lon = data.lon;
        client.query(`INSERT INTO locations(search_query, formatted_query, latitude, longitude) values ('${locationObject.search_query}', '${locationObject.formatted_query}','${locationObject.latitude}', '${locationObject.longitude}')`);

        response.send(locationObject);
      });
    }

    function Location(search_query, formatted_query, latitude, longitude) {
      this.search_query = search_query;
      this.formatted_query = formatted_query;
      this.latitude = latitude;
      this.longitude = longitude;
    }

    //   start the weather server 
    let weatherArray = [];
    function weatherCnstructor(forecast, time) {
      this.forecast = forecast;
      this.time = time;
      weatherArray.push(this);

    }

    function getWeather(req, res) {
      weatherArray = [];
      let url = `http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${weatherKey}`
      superAgent.get(url).then(response => {
        let dataWeather = response.body;
        dataWeather.data.map(element => {
          let newData = new weatherCnstructor(element.valid_date, element.weather.description);
        })
        res.send(weatherArray);
      })
        .catch((error) => {
          res.status(500).send('something wrong');

        })
    }

    // start park function 

    let parkArr = [];
    function Park(name, url, des, fee, address) {
      this.name = name;
      this.url = url;
      this.des = des;
      this.fee = fee;
      this.address = address;
      // parkArr.push(this);

    }
    function getPark(request, res) {

      // parkArr=[];
      let url = `https://developer.nps.gov/api/v1/parks?api_key=${park_Key}&q=${request.query}.search_query}`

      superAgent.get(url).then(response => {
        console.log(response);
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
    app.listen(PORT, () => {
      console.log(`app is listening on port ${PORT}`);
    });
