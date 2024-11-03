#!/bin/bash
export PATH="$PATH:./node_modules/.bin"
set -e
set -x

gem install jekyll bundler
ls .