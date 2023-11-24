#!/usr/bin/env bash

self=$(readlink -f "$0")
basedir=$(dirname "$self")

cd ${basedir}/../../..

podman run --rm -p 8000:8000 -v ${PWD}:/docs docker.io/squidfunk/mkdocs-material serve --config-file packages/documentation/en-US/mkdocs.yml
