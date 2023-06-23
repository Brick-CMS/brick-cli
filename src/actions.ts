import fs, { promises as fsPromises } from 'fs';
import inquirer from 'inquirer'
import yaml from 'js-yaml';
import path from 'path';
import templates from './schemas';
import fetch from 'node-fetch';

interface InitArgs {
  template: string | undefined
}

interface WithApiKey {
  api_key: string
}

interface BrickConfig {
  schema: string,
  slug: string,
}

export const init = async ({ template }: InitArgs) => {
  console.log("Brick setup:")
  const answers = await inquirer.prompt([
    {
      type: 'input',
      default: './brick',
      name: 'path',
      message: 'Directory for graphql schema files'
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Organization slug (log into Brick for this)'
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

  const schemaPath = path.join(answers.path, 'brick.graphqls');
  await fsPromises.writeFile('brick.yml', yaml.dump({ slug: answers.slug, schema: schemaPath } as BrickConfig));

  await fsPromises.mkdir(answers.path, {recursive: true})
  await fsPromises.writeFile(schemaPath, templates[answers.template])
}

export const push = async (args: WithApiKey) => {
  const document = yaml.load(fs.readFileSync(path.resolve('brick.yml')).toString()) as BrickConfig
  const schema = document.schema;
  const sdl = fs.readFileSync(path.resolve(schema)).toString();

  const data = JSON.stringify({
    sdl
  });

  console.log("Uploading schema...")

  try {
    const response = await fetch(`${process.env.UPLOAD_HOST || 'https://brick-cms.com'}/api/upload`, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${args.api_key || process.env.BRICK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: data
    });

    if (response.ok) {
      console.log("Schema Successfully Uploaded")
      return;
    }
  } catch (e) {
    console.log("Unable to reach Brick");
  }
  console.error("Problem Uploading. Check your API key.");
}

export const pull = () => {

}