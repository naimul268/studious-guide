#!/bin/bash

rm -rf docs/vendor

mkdir -p docs/vendor

touch docs/vendor/.gitkeep

mkdir -p docs/vendor/three/build docs/vendor/three/examples/jsm

cp node_modules/three/build/three.module.js docs/vendor/three/build/three.module.js

cp -r node_modules/three/examples/jsm/. docs/vendor/three/examples/jsm/

mkdir -p docs/vendor/jquery/

cp node_modules/jquery/dist/jquery.min.js docs/vendor/jquery/jquery.min.js
