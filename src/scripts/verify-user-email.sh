#!/bin/bash

user_pool_id="ap-southeast-1_MGxohyEmC"
max_user_count=10000

for ((i=1; i<=$max_user_count; i++)); do
    username="betestuser$i"
    aws cognito-idp admin-confirm-sign-up --user-pool-id "$user_pool_id" --username "$username"
    aws cognito-idp admin-update-user-attributes --user-pool-id "$user_pool_id" --username "$username" --user-attributes Name=email_verified,Value=true
    echo confirmed email for user "$username"
done
