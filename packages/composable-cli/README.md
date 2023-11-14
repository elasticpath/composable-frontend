# `Beta` Elastic Path Composable CLI

### This package is not feature complete and is work in progress.

This package contains the executable for running [Elastic Path Commerce Cloud](https://www.elasticpath.com/) Schematics.

## Installation

`yarn global add composable-cli` or `npm install -g composable-cli`

## Generating a storefront

### Login to Elastic Path 

```bash
composable-cli login
```

### Generate a D2C (Direct-to-consumer) storefront

```bash
composable-cli generate d2c my-storefront
```

Select your Elastic Path store from the list of stores.

### Getting help

```bash
composable-cli --help
```

## Integrations

### Configuring Algolia integration

```bash
composable-cli int algolia
```

## Elastic Path Payments Setup

### Configuring Elastic Path Payments

```bash
composable-cli p ep-payments
```