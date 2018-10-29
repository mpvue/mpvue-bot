function match (issueLines, issueConfig, comments) {
  const issueBodyTitle = issueLines[0];
  issueLines = issueLines.slice(1);
  let closeComments = [comments.closeIssue];
  let match = true;
  // 第一行issue标题不能含有模板标题
  if (issueConfig.bannedTitle && issueBodyTitle.includes(`[${issueConfig.bannedTitle}]`)) {
    closeComments.push(comments.titleComment);
  }
  // 包含全部小标题
  if (issueConfig.subtitles && !issueConfig.subtitles.every(subtitle => issueLines.find(line => line.includes(subtitle)))) {
    closeComments.push(comments.subtitleComment);
  }
  // 不能含有无效内容
  if (issueConfig.bannedContents && issueConfig.bannedContents.some(content => issueLines.find(line => line.includes(`[${content}]`) || line.includes(`(${content})`)))) {
    closeComments.push(comments.contentComment);
  }
  if (closeComments.length > 1) {
    match = false;
  }
  return {
    match,
    closeComments
  };
}

function issueMatch (issueBody, issueConfigs = [], comments) {
  if (issueConfigs.length < 2) {
    return true;
  }
  let issueLines = issueBody
    .split(/\n/)
    .map(line => line.replace(/\r|\*|#/ig, '').trim())
    .filter(line => !!line);
  if (!issueLines || issueLines.length <= 1) {
    return false;
  }
  const matches = [match(issueLines, issueConfigs[0], comments), match(issueLines, issueConfigs[1], comments)];
  const matchIdx = matches.findIndex(match => match.match);
  if (matchIdx > -1) {
    return {
      match: true,
      closeComments: []
    };
  }
  const closeComments = matches.map(match => match.closeComments);
  return {
    match: false,
    closeComments: closeComments[1].length < closeComments[0].length ? closeComments[1] : closeComments[0]
  };
}

module.exports = issueMatch;
