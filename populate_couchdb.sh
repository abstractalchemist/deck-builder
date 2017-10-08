#!/bin/bash

HOST=localhost
PORT=5984

curl -X DELETE http://$HOST:$PORT/cardsets
curl -X PUT http://$HOST:$PORT/cardsets
curl -X PUT http://$HOST:$PORT/cardsets/sets -d '{"sets":[{"id":"vivid_strike_ws","label":"Vivid Strike"},{"id":"nanoha_movie_ws","label":"Nanoha Movie"},{"id":"love_love_v1","label":"Love Live v1"}]}'

curl -X DELETE http://$HOST:$PORT/cardmapping
curl -X PUT http://$HOST:$PORT/cardmapping
curl -X PUT http://$HOST:$PORT/cardmapping/mapping -d '{"mapping":[{"prefix":"vs_w50","db":"vivid_strike_ws"},{"prefix":"n1_w32","db":"nanoha_movie_ws"},{"prefix":"n2_w32","db":"nanoha_movie_ws"},{"prefix":"ll_w24","db":"love_love_v1"}]}'

recreate() {
    curl -X DELETE http://$HOST:$PORT/$1
    curl -X PUT http://$HOST:$PORT/$1
    node entry.js $1 $HOST
}

recreate vivid_strike_ws
recreate nanoha_movie_ws
recreate love_love_v1

