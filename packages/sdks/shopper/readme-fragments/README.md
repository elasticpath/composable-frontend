# README Fragments

This directory contains custom fragments that are injected into the auto-generated README during the build process.

## Available Injection Points

- `afterIntro.md` - Content inserted after the main introduction
- `beforeInstallation.md` - Content inserted before the Installation section
- `afterOperations.md` - Content inserted after the Available Operations section

## Usage

1. Create a markdown file (`.md`) or EJS template (`.ejs`) with one of the supported names
2. The content will be automatically included when running `pnpm oas:openapi-ts`
3. The fragments support full markdown syntax

## Example

The `afterIntro.md` file in this directory adds React Query documentation to the README.