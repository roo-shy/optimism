#!/bin/bash

set -e

yarn build:typescript &
yarn build:contracts
