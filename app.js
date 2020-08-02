//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const _ = require("lodash");
const request = require('request');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// custom variable

var usern = "";
var rating = "";
var rank = "";

// get route

app.get('/', function (req, res) {
    res.render('login');
})

app.get("/homepage", function (req, res) {
    usern = req.query.username;
    console.log(usern);
    request('https://codeforces.com/api/user.info?handles='+usern, function (error, response, body) {
        if (error) {
            alert("something went wrong");
            console.log(error);
        }
        else {
            if (response.statusCode == 200) {
                var userdata = JSON.parse(body);
                usern = userdata["result"][0]["handle"];
                rating = userdata["result"][0]["rating"];
                rank = userdata["result"][0]["rank"];
                // console.log(usern,rating,rank);
                var newdata = [];
                res.render('dashboard', { data: newdata , usern : usern , rating : rating , rank : rank });
            }
        }
    })
});

app.get("/compete", function (req, res) {
    var newdata = [];
    console.log(newdata.length);
    res.render('compete', { data: newdata });
});


// post route


app.post("/homepage", function (req, res) {
    const tags = req.body.tags;
    const rating = req.body.rating;
    console.log(tags,rating);
    
    request('https://codeforces.com/api/problemset.problems?tags='+tags, function (error, response, body) {
        if (error) {
            alert("something went wrong");
            console.log(error);
        }
        else {
            if (response.statusCode == 200) {
                var data = JSON.parse(body);
                var i=0,y=0;
                var newdata = [];
                while(i<6){
                    if(data["result"]["problems"][y]["rating"] < rating && data["result"]["problems"][y]["rating"] >= rating - 200){  
                        i++;
                        newdata.push(data["result"]["problems"][y]);
                        console.log(data["result"]["problems"][y]["rating"]);
                    }
                    y++;
                }
                console.log(newdata.length);
                res.render('dashboard', { data: newdata , usern : usern , rating : rating , rank : rank });
            }
        }
    })
});


// listen route

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("server started at 3000 port");
});
