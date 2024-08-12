const core = require('@actions/core')
const compose = require('docker-compose')
const utils = require('./utils')

try {
  const composeFiles = utils.parseComposeFiles(core.getMultilineInput('compose-file'))
  if (!composeFiles.length) {
    return
  }

  const service = core.getInput('service', { required: true })

  const options = {
    // executablePath: 'docker',
    config: composeFiles,
    log: true,
    // composeOptions: ['compose', ...utils.parseFlags(core.getInput('compose-flags'))],
    composeOptions: utils.parseFlags(core.getInput('compose-flags')),
    commandOptions: utils.parseFlags(core.getInput('run-flags')),
  }

  compose
    .run(service, core.getInput('command') || [], options)
    .then(() => {
      console.log('done !!!')
    })
    .catch(err => {
      core.setFailed(`compose run failed ${JSON.stringify(err)}`)
    })
    .finally(() => {
      try {
        const options = {
          config: composeFiles,
          log: true,
          composeOptions: utils.parseFlags(core.getInput('compose-flags')),
          commandOptions: utils.parseFlags(core.getInput('down-flags')),
        }

        compose.down(options).then(
          () => {
            console.log('compose removed')
          },
          err => {
            core.setFailed(`compose down failed ${err}`)
          },
        )
      } catch (error) {
        core.setFailed(error.message)
      }
    })
} catch (error) {
  core.setFailed(error.message)
}
