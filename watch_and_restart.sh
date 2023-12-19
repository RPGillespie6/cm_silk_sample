#!/bin/bash
# Requires https://github.com/cespare/reflex
set -ex

reflex -g editor.js -- sh -c 'npx esbuild editor.js --bundle --outfile=editor.bundle.js'