const issueMatch = require('./lib/utils.js')
const defaultConfig = require('./lib/defaultConfig.js')

const issueEvents = ['issues.opened', 'issues.edited', 'issues.reopened']

module.exports = app => {
  app.on(issueEvents, async context => {
    const repoConfig = await context.config('issue_template.yml')
    const config = Object.assign({}, defaultConfig, repoConfig)
    const issueBody = context.payload.issue.body
    const params = {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      number: context.payload.issue.number
    }
    if (!issueMatch(issueBody, config.issueConfigs)) {
      const issueComment = context.issue({ body: config.comments.closeIssue })
      context.github.issues.createComment(issueComment)
      return context.github.issues.edit({
        ...params,
        state: 'closed'
      })
    }
    return context.github.issues.edit({
      ...params,
      state: 'open'
    })
  })
}