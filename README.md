## Compile

```
npm install
npm run build
```

## Example useages

You need an Open api version 3 specification and a HAR file. Compile the program then run as follows:

Basic

```
node dist/index.js scenarios/har/2/openapi.yaml scenarios/har/2/http.json
```

With api coverage

```
node dist/index.js -c scenarios/har/2/openapi.yaml scenarios/har/2/http.json
```

Verbose logging of results

```
node dist/index.js -v scenarios/har/2/openapi.yaml scenarios/har/2/http.json
```

If there are any found errors they will be printed to **stderr** and the program will exit with error code 1.

## Using Docker

This project can be built and run as docker container

### Build Image example

```

docker buildx build -t test .

```

### Run as a container example

```

docker run -t -v $PWD:/foobar test -c foobar/scenarios/har/2/openapi.yaml foobar/scenarios/har/2/http.har

```
