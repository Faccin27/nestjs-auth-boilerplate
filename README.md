<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# NestJSApiBoilerplateJWT

An API Boilerplate to create a ready-to-use REST API in seconds with NestJS 11.x and JWT Auth System :heart_eyes_cat:

## Installation

```bash
   pnpm install
```

## Set Environment for secret key JWT and other configurations

```bash
   cp .env.example .env
```

To set up on multiple environments, such as development, staging or production, we do as follows:

```bash
   cp .env.example .env.development # or .env.staging, etc
```

## Config settings .env for sending a notification when a user registers, forgets password or changes password

```
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_AUTH_USER=[:user]
   EMAIL_AUTH_PASSWORD=[:password]
   EMAIL_DEBUG=true
   EMAIL_LOGGER=true
```
## Running the app

```bash
    # development
    $ pnpm start

    # watch mode
    $ pnpm start:dev

    # production mode
    $ pnpm start:prod
```


```bash
   pnpm start:repl
```

## Docker

There is a `docker-compose.yml` file for starting MySQL with Docker.

`$ docker-compose up db`

After running, you can stop the Docker container with

`$ docker-compose down`

## Url Swagger for Api Documentation

```

http://127.0.0.1:3000/docs

```

or

```

http://127.0.0.1:3000/docs-json

```

or

```

http://127.0.0.1:3000/docs-yaml


NODE_ENV=[:enviroments]
```

## Configuring the SERVER_PORT environment variable as the default port if you don't want to use the default

```
   SERVER_PORT=3333
```

## Configuring the ENDPOINT_URL_CORS environment variable for app frontend

```
   ENDPOINT_URL_CORS='http://127.0.0.1:4200'
```

## License

[MIT licensed](LICENSE)
