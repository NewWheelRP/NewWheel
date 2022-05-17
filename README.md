# This is a **Work In Progress** core for New Wheel RP

<div align="center">
    <img href="https://projecterror.dev" width="150" src="https://i.tasoagc.dev/c1pD" alt="Material-UI logo" />
</div>
<h1 align="center">FiveM TypeScript Resource Boilerplate</h1>

<div align="center">
This is a simple boilerplate for getting started with TypeScript game-scripts, in FiveM.
</div>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/project-error/pe-utils/master/LICENSE)
![Discord](https://img.shields.io/discord/791854454760013827?label=Our%20Discord)
</div>

This repository is a basic boilerplate for getting started
with TypeScript resources in FiveM. This boilerplate only comes with
development dependencies needed for FiveM-centered TypeScript transpilation, the rest
is up to you.

*Note: This boilerplate is targeting TypeScript in context of game-scripts,
if you wish to use TypeScript in NUI, take a look at our other [boilerplate](https://github.com/project-error/fivem-react-boilerplate-lua)*

## Foreword

Although there already is a well established TypeScript boilerplate,
made by [d0p3t](https://github.com/d0p3t/fivem-ts-boilerplate) for the FiveM ecosystem,
he has unfortunately passed away, leaving it unmaintained. This boilerplate is simply
a more up to date alternative.

## Requirements
* Node > v14

## Getting Started

First clone the repository or use the template option
and place it within your `resources` folder

**Install Dependencies**

Navigate into the newly cloned folder and execute
the following command, to install dependencies.

```sh
pnpm i
```

## Development

### Hot Building

While developing your resource, this boilerplate offers
a `watch`script that will automatically hot rebuild on any
change within the `client` or `server` directories.

```sh
pnpm run watch
```
*This script still requires you restart the resource for the
changes to be reflected in-game*

### Entry Points
**Client** - `./client/client.ts`

**Server** - `./server/server.ts`

## Production Build
Once you have completed the development phase of your resource,
you must create an optimized & minimized production build, using
the `build` script.

```sh
pnpm run build
```

### Additional Notes

Need further support? Join our [Discord](https://discord.com/invite/HYwBjTbAY5)!