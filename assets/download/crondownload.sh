#!/bin/bash

SZ=$(curl -so /dev/null http://expofinder.uma.es/wp-content/uploads/downloads/pathwise.db -w '%{size_download}')

if [ "$SZ" -gt 605 ]
then 
curl http://expofinder.uma.es/wp-content/uploads/downloads/pathwise.db -o /mnt/web210/e0/47/53653747/htdocs/microsites/assets/static/pathwise.db
else
echo "REMOTE SOURCE FAIL"
fi