const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");
const {paginateRest, composePaginateRest } = require("@octokit/plugin-paginate-rest");
const MyOctokit  = Octokit.plugin(paginateRest);
const octokit = new MyOctokit({ auth: core.getInput("github-token"), baseUrl: 'https://api.github.com' });

const owner = github.context.payload.repository.owner.login;
const repo = github.context.payload.repository.name;
const milestone = github.context.payload.milestone.title;

function doesVersionMatch(milestone, tag) {
    //milestone version: "1.16.5-1.20.0" (historically "1.20.0")
    //tag version: "release/v1.16.5-1.20.0"
    const milestoneVersion = milestone.match(/\d+\.\d+\.\d+/g);
    const tagVersion = tag.match(/\d+\.\d+\.\d+/g);
    console.log("doesVersionMatch: ", milestoneVersion, tagVersion);

    //we need to compare both semvers that we find: MC version and mod version
    return milestoneVersion !== null && tagVersion !== null && milestoneVersion[0] === tagVersion[0] && milestoneVersion[1] === tagVersion[1];
}

(async() => {
    const tags = await octokit.paginate(octokit.rest.repos.listTags, {
        owner,
        repo,
        per_page: 100
    },
    response => response.data);
    const tag = tags.find(t => doesVersionMatch(milestone, t.name));
    core.setOutput("tag", tag.name);
})();