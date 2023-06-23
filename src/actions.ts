import fs, { promises as fsPromises } from 'fs';
import inquirer from 'inquirer'
import yaml from 'js-yaml';
import path from 'path';
import templates from './schemas';
import http from 'http';

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

export const push = (args: WithApiKey) => {
  const document = yaml.load(fs.readFileSync(path.resolve('brick.yml')).toString()) as BrickConfig
  const schema = document.schema;
  const sdl = fs.readFileSync(path.resolve(schema)).toString();

  const data = JSON.stringify({
    sdl
  });

  console.log("Uploading schema...")

  const options = {
    hostname: process.env.UPLOAD_HOSTNAME || 'brick-cms.com',
    port: process.env.UPLOAD_PORT || 80,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${args.api_key || process.env.BRICK_API_KEY}`
    },
  };

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', d => {
      process.stdout.write(d);
    });
  });

  req.on('error', error => {
    console.error("Something went wrong while uploading schema\n", error);
  });

  req.write(data);
  req.end();
}

export const pull = () => {

}