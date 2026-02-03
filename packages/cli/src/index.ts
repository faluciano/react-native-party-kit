#!/usr/bin/env node
import { Command } from "commander";
import { bundleCommand } from "./commands/bundle";
import { simulateCommand } from "./commands/simulate";
import { initCommand } from "./commands/init";

const program = new Command();

program
  .name("party-kit")
  .description("CLI for React Native Party Kit")
  .version("0.0.4");

program.addCommand(bundleCommand);
program.addCommand(simulateCommand);
program.addCommand(initCommand);

program.parse();
