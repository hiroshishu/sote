#!/usr/bin/env bash
set -x
rm dist.tar.gz
rm -rf dist
set -e
git pull
npm run build:prod
