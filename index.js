const issueMatch = require('./lib/utils.js')
const defaultConfig = require('./lib/defaultConfig.js')

const issueEvents = ['issues.opened', 'issues.edited']

module.exports = app => {
  app.on(issueEvents, async context => {
    let config = {}
    try {
      const repoConfig = await context.config('issue_template.yml')
      config = repoConfig ? repoConfig : defaultConfig;
    } catch (e) {
      config = defaultConfig;
    }
    const issueBody = context.payload.issue.body;
    const params = {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      number: context.payload.issue.number
    };
    const { match, closeComments } = issueMatch(issueBody, config.issueConfigs, config.comments);
    if (!match) {
      const issueComment = context.issue({ body: closeComments.join('\n') });
      if (context.payload.action === 'created' || context.payload.action === 'opened') {
        context.github.issues.createComment(issueComment);
      }
      return context.github.issues.edit({
        ...params,
        state: 'closed'
      });
    }
    return context.github.issues.edit({
      ...params,
      state: 'open'
    });
  })
}