# Hotel Admin API

## Description

Hotel management is impossible to do properly without a system. Therefore, this project aims to offer an API able to perform daily tasks in this context.

## Installation

There are some prerequisites to run this project:

- Install the correct NodeJS version (use `nvm`)
- Install Docker and `docker compose`

```bash
# install dependencies
$ yarn install
# start database
$ yarn database:up
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

[MIT licensed](LICENSE).
