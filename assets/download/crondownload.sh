#!/bin/bash

SZ=$(curl -so NOT_PUBLIC_URL -w '%{size_download}')

if [ "$SZ" -gt 605 ]
then 
curl NOT_PUBLIC_URL -o NOT_PUBLIC_URL
else
echo "REMOTE SOURCE FAIL"
fi