import { mkdir, writeFile } from 'fs/promises';
import inquirer from 'inquirer'
import yaml from 'js-yaml';
import path from 'path';
import templates from './schemas';

interface InitArgs {
  template: string | undefined
}

export const init = async ({ template }: InitArgs) => {
  console.log("Brick setup:")
  const answers = await inquirer.prompt([
    {
      type: 'input',
      default: '.',
      name: 'path',
      message: 'Directory for graphql schema file (bricks.graphqls)'
    },
    {
      type: 'list',
      name: 'template',
      message: 'Start with a pre-made schema template?',
      choices: [
        { value: 'none', name: 'None' },
        { value: 'home-page', name: 'Home Page' },
        // { value: 'blog', name: 'Blog' },
        // { value: 'marketing', name: 'Marketing' }
      ]
    }
  ]);

  await writeFile('brick.yml', yaml.dump({ schema: answers.path }));

  await mkdir(answers.path, {recursive: true})
  await writeFile(path.join(answers.path, 'bricks.schema'), templates[answers.template])

  console.log(answers);
}

export const push = () => {

}

export const pull = () => {

}