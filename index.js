const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: core.getInput("github-token"), baseUrl: 'https://api.github.com' });
const owner = github.context.payload.repository.owner.login;
const repo = github.context.payload.repository.name;
const milestone = github.context.payload.milestone.title;

function doesVersionMatch(milestone, tag) {
    //milestone version: "1.16.5-1.20.0" (historically "1.20.0")
    //tag version: "release/v1.16.5-1.20.0"
    const milestoneVersion = milestone.title.match(/\d+\.\d+\.\d+/g);
    const tagVersion = tag.match(/\d+\.\d+\.\d+/g);
    console.log("doesVersionMatch: ", milestoneVersion, tagVersion);

    //we need to compare both semvers that we find: MC version and mod version
    return milestoneVersion !== null && tagVersion !== null && milestoneVersion[0] === tagVersion[0] && milestoneVersion[1] === tagVersion[1];
}

octokit.rest.repos.listTags({
    owner,
    repo,
}).then(tags => {
    const tag = tags.data.find(t => doesVersionMatch(milestone, t.name));
    core.setOutput("tag", tag.name);
});

