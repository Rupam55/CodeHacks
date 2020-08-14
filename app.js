//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const _ = require("lodash");
const request = require("request");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// custom variable

var usern = "";
var rating = "";
var rank = "";

var map_done = {};
var map_notdone = {};

var map_const_done = {};
var const_ques = [];

var people = [];

// get route

app.get("/", function (req, res) {
	res.render("login");
});

app.get("/homepage", function (req, res) {
	usern = req.query.username;
	console.log(usern);
	request("https://codeforces.com/api/user.info?handles=" + usern, function (error, response, body) {
		if (error) {
			alert("something went wrong");
			console.log(error);
		} else {
			if (response.statusCode == 200) {
				var ques = JSON.parse(body);
				usern = ques["result"][0]["handle"];
				rating = ques["result"][0]["rating"];
				rank = ques["result"][0]["rank"];
				// console.log(usern,rating,rank);
				var newques = [];
				request("https://codeforces.com/api/user.status?handle=" + usern, function (error, response, body1) {
					if (error) {
						alert("something went wrong");
						console.log(error);
					} else {
						if (response.statusCode == 200) {
							var userdata = JSON.parse(body1);
							var ques_done = [];
							var ques_notdone = [];
							for (var i = 0; i < userdata["result"].length; i++) {
								if (userdata["result"][i]["verdict"] === "OK") {
									ques_done.push(userdata["result"][i]["problem"]["name"]);
									map_done[userdata["result"][i]["problem"]["name"]] = "present";
								} else if (userdata["result"][i]["verdict"] === "WRONG_ANSWER") {
									ques_notdone.push(userdata["result"][i]["problem"]["name"]);
									map_notdone[userdata["result"][i]["problem"]["name"]] = "present";
								}
							}
							res.render("dashboard", { QUES: newques, DATA: ques_done, usern: usern, rating: rating, rank: rank });
						}
					}
				});
			}
		}
	});
});

app.get("/compete", function (req, res) {
	var empty = [];
	var people = [];
	res.render("compete", {Peo : people , ques: empty, usern: usern, rating: rating, rank: rank });
});

// post route

app.post("/homepage", function (req, res) {
	const tags = req.body.tags;
	const rating_this = req.body.rating;
	console.log(tags, rating_this);

	request("https://codeforces.com/api/problemset.problems?tags=" + tags, function (error, response, body) {
		if (error) {
			alert("something went wrong");
			console.log(error);
		} else {
			if (response.statusCode == 200) {
				var ques_done = [];
				var data = JSON.parse(body);
				var i = 0,
					y = 0;
				var newques = [];
				while (i < 6) {
					var q_name = data["result"]["problems"][y]["name"];
					if (data["result"]["problems"][y]["rating"] < rating_this && data["result"]["problems"][y]["rating"] >= rating_this - 200) {
						if (map_done[q_name] === "present") {
							console.log(q_name);
						} else {
							i++;
							newques.push(data["result"]["problems"][y]);
						}
					}
					y++;
				}
				console.log(newques.length);
				res.render("dashboard", { QUES: newques, DATA: ques_done, usern: usern, rating: rating, rank: rank });
			}
		}
	});
});

app.post("/addpeople", function (req, res) {
	people = [];
	people = req.param("person");
	console.log(people);

	var empty = [];
	request("https://codeforces.com/api/user.status?handle=rupam909", function (error, response, body1) {
		if (error) {
			alert("something went wrong");
			console.log(error);
		} else {
			if (response.statusCode == 200) {
				var userdata = JSON.parse(body1);
				for (var i = 0; i < userdata["result"].length; i++) {
					if (userdata["result"][i]["verdict"] === "OK") {
						map_const_done[userdata["result"][i]["problem"]["name"]] = "present";
					}
				}

				request("https://codeforces.com/api/user.status?handle=rv6023", function (error, response, body1) {
					if (error) {
						alert("something went wrong");
						console.log(error);
					} else {
						if (response.statusCode == 200) {
							var userdata = JSON.parse(body1);
							for (var i = 0; i < userdata["result"].length; i++) {
								if (userdata["result"][i]["verdict"] === "OK") {
									map_const_done[userdata["result"][i]["problem"]["name"]] = "present";
								}
							}

							var count = 0;
							for (var i in map_const_done) {
								count++;
							}
							console.log(count);
							res.render("compete", {Peo : people, ques: empty, usern: usern, rating: rating, rank: rank });
						}
					}
				});
			}
		}
	});
});

app.post("/compete", function (req, res) {
	const_ques = [];
	request("https://codeforces.com/api/problemset.problems?tags=implementation", function (error, response, body) {
		if (error) {
			alert("something went wrong");
			console.log(error);
		} else {
			if (response.statusCode == 200) {
				var data = JSON.parse(body);
				var i = 0,
					y = 0;
				while (i < 2) {
					var q_name = data["result"]["problems"][y]["name"];
					if (data["result"]["problems"][y]["rating"] < 1200) {
						if (map_const_done[q_name] === "present" || map_const_done[q_name] === "used") {
							console.log(q_name);
						} else {
							i++;
							const_ques.push(data["result"]["problems"][y]);
							map_const_done[q_name] = "used";
						}
					}
					y++;
				}

				request("https://codeforces.com/api/problemset.problems?tags=brute%20force", function (error, response, body1) {
					if (error) {
						alert("something went wrong");
						console.log(error);
					} else {
						if (response.statusCode == 200) {
							var data = JSON.parse(body1);
							i = 0;
							y = 0;
							while (i < 2) {
								var q_name = data["result"]["problems"][y]["name"];
								if (data["result"]["problems"][y]["rating"] < 1200) {
									if (map_const_done[q_name] === "present" || map_const_done[q_name] === "used") {
										console.log(q_name);
									} else {
										i++;
										const_ques.push(data["result"]["problems"][y]);
										map_const_done[q_name] = "used";
									}
								}
								y++;
							}
							console.log(const_ques.length);
							res.render("compete", {Peo : people, ques: const_ques, usern: usern, rating: rating, rank: rank });
						}
					}
				});
			}
		}
	});
});

// listen route

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
	console.log("server started at 3000 port");
});
