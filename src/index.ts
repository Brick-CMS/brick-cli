#!/usr/bin/env node

import {ArgumentParser} from 'argparse';

import * as actions from './actions';

const parser = new ArgumentParser({
  description: "Companion CLI for brickcms.io",
  usage: "yarn brick [command]",
});

const subparsers = parser.add_subparsers({title: "commands", metavar: '', dest: 'subparser'})

const init = subparsers.add_parser('init', {help: "Intitialize a new project"});
init.add_argument('-t', '--template', {help: "Name of schema template to use. Omit to select interactively.", required: false});

const push = subparsers.add_parser('push', {help: "Push current schema to Brick"});
push.add_argument('-k', '--api-key', {help: "Organization API Key. Uses the environment variable BRICK_API_KEY if omitted.", required: false});
push.add_argument('-f', '--force', {help: "Force pushes the schema despite any breaking changes detected. Use at your own risk.", required: false, action: 'store_true'});

const pull = subparsers.add_parser('pull', {help: "Pull latest schema from Brick"});
pull.add_argument('-k', '--api-key', {help: "Organization API Key. Uses the environment variable BRICK_API_KEY if omitted.", required: false});

const result = parser.parse_args();

const {subparser, ...args} = result;
if (subparser in actions) {
  actions[subparser](args);
} else {
  parser.print_help()
}