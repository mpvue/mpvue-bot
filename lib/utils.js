function match (str, subStrs) {
  return subStrs.every(subStr => str.includes(subStr));
}

function issueMatch (issueBody, issueConfigs = [], comments) {
  let issueLines = issueBody
    .split(/\n/)
    .map(line => line.replace(/\r|\*|#/ig, '').trim())
    .filter(line => !!line)
  if (!issueLines || issueLines.length <= 1) {
    return false;
  }
  const issueBodyTitle = issueLines[0];
  issueLines = issueLines.slice(1);
  let match = true;
  let closeComments = [comments.closeIssue];
  issueConfigs.forEach(issueConfig => {
    if (!match) {
      return;
    }
    // 第一行issue标题不能含有模板标题
    if (issueConfig.bannedTitle && `[${issueConfig.bannedTitle}]` === issueBodyTitle) {
      closeComments.push(comments.titleComment);
    }
    // 包含全部小标题
    if (issueConfig.subtitles && !issueConfig.subtitles.every(subtitle => issueLines.find(line => subtitle === line))) {
      closeComments.push(comments.subtitleComment);
    }
    // 不能含有无效内容
    if (issueConfig.bannedContents && issueConfig.bannedContents.some(content => issueLines.find(line => line === `[${content}]` || line === `(${content})`))) {
      closeComments.push(comments.contentComment);
    }
    if (closeComments.length > 1) {
      match = false;
    }
  });
  return {
    match,
    closeComments
  };
}

module.exports = issueMatch;