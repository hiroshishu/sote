#!/usr/bin/env bash
set -x
rm dist.tar.gz
rm -rf dist
set -e
git pull
npm run build:prod

cp public/data/settingsm.json dist/data/settings.json
tar -zcvf dist.tar.gz dist > /dev/null
