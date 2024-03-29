#!/bin/bash
find ../ -mindepth 1 ! -path '*/.*/*' ! -name '.*' -exec rm -rf {} +
mv ./dist/* ../

