#!/usr/bin/env bash

self=$(readlink -f "$0")
basedir=$(dirname "$self")

cd ${basedir}/../../..

podman run --rm -v ${PWD}:/docs docker.io/squidfunk/mkdocs-material build --config-file packages/documentation/en-US/mkdocs.yml --site-dir=../public/en-US
