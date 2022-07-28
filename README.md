## Compile

```
npm install
npm run build
```

## Example usages

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

## Generate a HAR file

To record requests and responses to a HAR file, you can use the [google/martian proxy](https://github.com/google/martian).

```sh
# Start your server

# Start the proxy with HAR logging enabled
$GOPATH/bin/proxy -har &

# Make requests to your endpoints through the proxy, this could for example be
# done in a test suite.
# Here we assume that the server is running on localhost:8000 with one endpoint,
# `/ping`
export http_proxy=localhost:8080
curl localhost:8000/ping

# Save the HAR log to a file
curl http://martian.proxy/logs > http.json
```

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
