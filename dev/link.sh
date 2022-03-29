#!/usr/bin/env bash

<< ////

Usage:
This script will link everything under _common to every subproject (package)
This is avoid having to change same files in every package, instead can change the real file at _common
and all soft links will be updated automatically

It will use relative paths in order to be able to reproduce results in any machine
////

script_directory="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${script_directory}/common.sh"

commonFilesRelPath="_common"
echo $commonFilesRelPath
for commonItem in $commonFilesRelPath/* ; do
    for d in packages/*/ ; do
        commonItemRelToPackagePath="../../$commonItem"
        ln -sf "$commonItemRelToPackagePath" "$d/"
        echo -e "soft linked $commonItemRelToPackagePath to $d\n"
    done
done
