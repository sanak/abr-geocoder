# abr-geocoder REST API

[日本語 (Japanese)](./README.api.ja.md)

Address Base Registry Geocoder REST API by Japan Digital Agency
- Assigns a town ID.
- Normalizes address strings.
- Outputs latitude and longitude pair with matched level.

## Index
- [abr-geocoder Rest API](#abr-geocoder-rest-api)
  - [Index](#index)
  - [Documents](#documents)
  - [Requirement](#requirement)
  - [Prework](#prework)
    - [Install](#install)
    - [Download](#download)
  - [Usage](#usage)
    - [API Startup](#api-startup)
  - [API Specification](#api-specification)


## Documents
- [Contributing this project](docs/CONTRIBUTING.md)

-------

## Requirement

This command requires **node.js version 18 or above**.  
Since Docker is used to launch the API, Docker must be installed.

## Prework

### Install
See [Install](./README.md#install).

### Download
See [Download](./README.md#download).

## Usage

### API Startup

#### Go to abr-geocoder directory
```
$ cd {Install to Path}/abr-geocoder
```
#### Execute docker build
```
$ docker image build -t abrg-api . 
```

#### docker startup
```
$ docker run -v ~/.abr-geocoder:/root/.abr-geocoder -p 3000:3000 abrg-api
```

### Request
`query`: `東京都千代田区紀尾井町1-3`
```
$ curl http://localhost:3000/abr-geocoder/%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%8D%83%E4%BB%A3%E7%94%B0%E5%8C%BA%E7%B4%80%E5%B0%BE%E4%BA%95%E7%94%BA1-3.json
```

## API Specification
See abr-geocoder Rest API Specification for API specifications.