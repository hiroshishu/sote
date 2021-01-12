#!/usr/bin/env bash
set -o errexit
set -x
set -a
set -m


scp -i ~/Downloads/other-mongo.pem centos@18.166.235.68:/data/app/nginx/conf/nginx.conf .
