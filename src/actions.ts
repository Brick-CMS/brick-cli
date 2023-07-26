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

interface WithForce {
  force: boolean
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

export const push = async (args: WithApiKey & WithForce) => {
  const document = yaml.load(fs.readFileSync(path.resolve('brick.yml')).toString()) as BrickConfig
  const schema = document.schema;
  const sdl = fs.readFileSync(path.resolve(schema)).toString();

  const data = JSON.stringify({
    sdl
  });

  console.log("Uploading schema...")

  try {
    const searchParams = {force: String(args.force)}
    const response = await fetch(`${process.env.UPLOAD_HOST || 'https://brick-cms.com'}/api/upload?${new URLSearchParams(searchParams).toString()}`, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${args.api_key || process.env.BRICK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: data
    });

    if (response.ok) {
      console.log("Schema Successfully Uploaded")
      const body = await response.json();

      if (body.info?.length > 0 || body.error.length > 0) {
        console.log("Schema diffs reported:\n");
        console.log(body.info, body.error);
      }
      return;
    } else if (response.status === 401) {
      console.error("Permissions issue when Uploading Schema. Check your API key.")
    } else {
      console.error("Problem Uploading Schema.")

      const body = await response.json();
      console.error(body.error);
      console.log("If you wish to push anyway, you can pass -f to force push the schema.")
    }
  } catch (e) {
    console.log("Unable to reach Brick");
  }
}

export const pull = () => {

}