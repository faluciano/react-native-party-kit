#!/usr/bin/env node
import { Command } from "commander";
import { bundleCommand } from "./commands/bundle";
import { simulateCommand } from "./commands/simulate";
import { initCommand } from "./commands/init";

const program = new Command();

program.name("couch-kit").description("CLI for Couch Kit").version("0.0.6");

program.addCommand(bundleCommand);
program.addCommand(simulateCommand);
program.addCommand(initCommand);

program.parse();
