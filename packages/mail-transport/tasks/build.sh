#!/usr/bin/env bash

set -e

buildDir=dist

rm -rf $buildDir;

tsConfigPath=tsconfig.json
tsc -p $tsConfigPath && tsc-alias -p $tsConfigPath
mv $buildDir/index.d.ts .
