#!/usr/bin/env bash
set -e
git pull
rm -rf dist
npm run build:prod

rm -rf dist/pdf

tar -zcvf dist.tar.gz dist
scp -i ~/Downloads/other-mongo.pem dist.tar.gz centos@18.166.235.68:/home/centos

ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 \
  "cd /home/centos; rm -rf dist; tar -zxvf dist.tar.gz; cp -rf pdf dist/"

exit
ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68

rm -rf dist

ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 "cd /home/centos; tar -zxvf dist.tar.gz; cp -rf pdf dist/"
