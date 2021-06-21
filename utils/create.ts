import prompts, { Choice } from 'prompts'
import fs from 'fs'
import path from 'path'
import FRAMEWORKS from '../config/template.json'
import chalk from 'chalk'

export enum Template {
  // eslint-disable-next-line no-unused-vars
  ReactMobileAnt = 'template-react-mobile-ant',
  // eslint-disable-next-line no-unused-vars
  ReactMobileAntTs = 'template-react-mobile-ant-ts',
  // eslint-disable-next-line no-unused-vars
  ReactPcAnt = 'template-react-pc-ant',
  // eslint-disable-next-line no-unused-vars
  ReactPcAntTs = 'template-react-pc-ant-ts',
  // eslint-disable-next-line no-unused-vars
  VueMobileVant = 'template-vue-mobile-vant',
  // eslint-disable-next-line no-unused-vars
  VueMobileVantTs = 'template-vue-mobile-vant-ts',
  // eslint-disable-next-line no-unused-vars
  VuePcAnt = 'template-vue-pc-ant',
  // eslint-disable-next-line no-unused-vars
  VuePcAntTs = 'template-vue-pc-ant-ts',
}

export enum PackageManager {
  // eslint-disable-next-line no-unused-vars
  Yarn = 'yarn',
  // eslint-disable-next-line no-unused-vars
  Npm = 'npm',
  // eslint-disable-next-line no-unused-vars
  Cnpm = 'cnpm'
}

const pColor: string[] = ['#74b9ff', '#a29bfe', '#fab1a0']

// copy file
function copy (src: string, dest: string): void {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir (srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

export interface CreateOption {
  force: boolean,
  template: Template,
  packageManager: PackageManager
}

export async function create (project: string, option: CreateOption): Promise<void> {
  const cwd = process.cwd()
  let targetDir = project || 'vue-pc-ant-ts'
  let targetPath = path.resolve(cwd, targetDir)
  if (option.template && !(option.template in Template)) {
    let index = 0
    throw new Error(chalk.red('✖') +
      ' The template does not exist. You can choose a template from the following templates:' +
      FRAMEWORKS.reduce((pre, { framework, variants }) => {
        pre += variants.reduce((pre2, { platform, language, ui, color }) => {
          index++
          pre2 += chalk.hex(color).bold(`\n${index}、template-${framework}-${platform}-${ui}${language === 'TypeScript' ? '-ts' : ''}`)
          return pre2
        }, '')
        return pre
      }, '')
    )
  }
  const answers = await prompts([
    {
      type: project ? null : 'text',
      message: 'Project Name',
      name: 'projectName',
      initial: targetDir,
      onState: (state) => {
        targetDir = state.value.trim() || targetDir
        targetPath = path.resolve(cwd, targetDir)
      }
    },
    {
      type: () => fs.existsSync(targetPath) && !option.force ? 'confirm' : null,
      message: `Target directory "${targetDir}" is not empty. Remove existing files and continue?`,
      name: 'overwrite'
    },
    {
      type: (_, { overwrite }) => {
        if (overwrite === false) {
          throw new Error(chalk.red('✖') + ' Operation cancelled')
        }
        return null
      },
      name: 'overwriteChecker'
    },
    {
      type: option.template ? null : 'select',
      name: 'template',
      message: 'Choose a template',
      choices: FRAMEWORKS.reduce((pre: Choice[], { framework, variants }) => {
        pre.push(...variants.map(({ platform, desc, language, ui, color }) => ({
          title: chalk.hex(color).bold(`template-${framework}-${platform}-${ui}${language === 'TypeScript' ? '-ts' : ''}`),
          description: desc,
          value: `template-${framework}-${platform}-${ui}${language === 'TypeScript' ? '-ts' : ''}`
        })))
        return pre
      }, [])
    },
    {
      type: option.packageManager ? null : 'select',
      name: 'packageManager',
      message: 'Select the package manager',
      choices: Object.keys(PackageManager).map((pm: string, index): Choice => ({
        title: chalk.hex(pColor[index]).bold(pm.toLocaleLowerCase()),
        value: pm.toLocaleLowerCase()
      }))
    }
  ])
  console.log(targetPath)
  console.log(answers)
  // 创建项目
  if (!fs.existsSync(targetPath) || (fs.existsSync(targetPath) && answers.overwrite)) {
    copyDir(path.resolve(__dirname, `../template/${option.template || answers.template}`), targetPath)
    console.log(targetPath)
  }
}
