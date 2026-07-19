#!/bin/sh
echo "main bot SUPPORT_URL:"
grep SUPPORT_URL /root/telegram-bot/.env
docker exec telegram-bot printenv SUPPORT_URL
echo "site:"
grep -o 'be_tango_support_bot[^" ]*' /var/www/betango.dance/index.html | sort -u | head
