# authentication_boilerplate

This is an authentication boilerplate for a node backend. 

## Needed to run

1. Sendgrid account (free tier is 100 emails a day )
2. Node
3. Mongo
4. Postman or App to link


## How to setup
First go ahead and change these to your email a key of your choice and sendgrid user and password.  
  
    APP_SECRET=somekey
    SEND_GRID_EMAIL= your@email.com
    SEND_GRID_USER=[sendgriduser]
    SEND_GRID_PASS=[sendgridpass]

Then run npm install and then npm run dev.

## API Routes

All routes run through the following 

    /api/auth/
to run register you need to call a post:

    /api/auth/register 
  
    {
      "fullName":"aname",
      "email":"email@email.com",
      "companyName": "name",
      "password": "password"
     }

to run login you need to call a post:

    /api/auth/login 
  
    {
      "email":"email@email.com",
      "password": "password"
     }
     
to run forgot password you need to call a post:

    /api/auth/forgot-password 
  
    {
      "email":"email@email.com",
     }
     
 to run resetPassword you need to call a post:

    /api/auth/reset-password
  
    {
      "password":"newpassword",
      "confirmPassword":"newpassword",
      reset_password_token: "reset_token_from_email"
     }
     
Any issues or feature requests please use the issue template (ISSUE_TEMPLATE.MD  in the root)
