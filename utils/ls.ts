import FRAMEWORKS from '../config/template.json'
import chalk from 'chalk'

export default function ls () {
  console.log(chalk.bold('The following templates are currently supported:'))
  console.log()
  let i = 0
  FRAMEWORKS.forEach(({ variants, framework }) => {
    variants.forEach(({ platform, ui, language, desc }) => {
      console.log(
        `  ${++i}、` +
        chalk.green.bold(`template-${framework}-${platform}-${ui}${language === 'TypeScript' ? '-ts' : ''}`) +
        `: ${desc}`
      )
    })
  })
  console.log()
}
