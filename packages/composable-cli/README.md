# `Beta` Elastic Path Composable CLI

### This package is not feature complete and is work in progress.

This package contains the executable for running [Elastic Path Commerce Cloud](https://www.elasticpath.com/) Schematics.

## Installation

`yarn global add composable-cli` or `npm install -g composable-cli`

## Generating a storefront

### Login to Elasticpath 

```bash
composable-cli login
```

### Generate a D2C (Direct-to-consumer) storefront

```bash
composable-cli generate d2c my-storefront
```

Select your Elasticpath store from the list of stores.

### Getting help

```bash
composable-cli --help
```

## Configuring Algolia integration

```bash
composable-cli int algolia
```