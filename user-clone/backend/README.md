# Backend API Documentation

## /user/register endpoint

### Description

Register a user by creating a user account with provided information

### HTTP method

`POST`

### Endpoint

`user/register`

### Request Body

The request body should be in JSON format and include the following fields:

- `fullname` (object)
  - `firstname` (string, required): User's first name (minimum 3 character)
  - `lastname` (string, optional): User's last name (minimum 3 characters)
- `email` (string, required): User's email address (must be a valid email)
- `password` (string, required): User's password (minimum 6 characters)

### Response Body

The response body is in JSON format and includes the following fields:

- `token` (string): Token created by jwttoken, using only the \_id of the user trying to sign in
- `user` (object): The user that registered with their details
  - `fullname` (object)
    - `firstname` (string, required): User's first name (minimum 3 character)
    - `lastname` (string, optional): User's last name (minimum 3 characters)
  - `email` (string, required): User's email address (must be a valid email)
  - `password` (string, required): User's password (minimum 6 characters)
