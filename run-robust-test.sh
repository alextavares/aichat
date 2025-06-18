#!/bin/bash
cd ~/inneraiclone
cp /mnt/c/codigos/inneraiclone/test-robust.js .
node test-robust.js
echo -e "\n📸 Screenshots gerados:"
ls -la *.png 2>/dev/null