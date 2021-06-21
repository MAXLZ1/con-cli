#!/usr/bin/env node
import { Command } from 'commander'
import { name, version } from './package.json'
import { create } from './utils/create'
import ls from './utils/ls'
import chalk from 'chalk'
import envinfo from 'envinfo'

const program = new Command(name)
program.version(version)

// create app
program
  .command('create [project-name]')
  .description('create a new project powered by con-cli')
  .option('-t, --template <template>', 'Select a template for your project')
  .option('-pm, --packageManager <packageManager>', 'Select the package manager for your project')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .action((project, options) => {
    create(project, options)
  })

program
  .command('ls')
  .description('Show all template')
  .action(() => {
    ls()
  })

// info
program
  .command('info')
  .description('print debugging information about your environment')
  .action(() => {
    console.log(chalk.bold('\nEnvironment Info:'))
    envinfo.run({
      System: ['OS', 'CPU', 'Memory'],
      Binaries: ['Node', 'Yarn', 'npm'],
      Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
      npmGlobalPackages: ['con-cli']
    }).then(console.log)
  })
program.parse(process.argv)
