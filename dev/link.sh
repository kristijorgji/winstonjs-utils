#!/usr/bin/env bash

<< ////

Usage:
This script will link everything under _common to every subproject (package)
This is avoid having to change same files in every package, instead can change the real file at _common
and all soft links will be updated automatically

////

script_directory="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${script_directory}/common.sh"

workdir=$(pwd)
commonFilesPath=$(abspath "$workdir/_common")

for commonItem in $commonFilesPath/* ; do
    for d in packages/*/ ; do
        absProjectPath=$(abspath $d)
        ln -s "$commonItem" "$absProjectPath/"
        echo -e "soft linked $commonItem to $absProjectPath\n"
    done
done
