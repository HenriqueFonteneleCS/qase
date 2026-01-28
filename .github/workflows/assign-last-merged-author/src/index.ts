import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
    try {
        const token = core.getInput('github_token');
        const targetRepoInput = core.getInput('target_repo');
        const octokit = github.getOctokit(token);

        const context = github.context;

        // Get current PR details
        const prNumber = parseInt(core.getInput('pr_number')) || context.payload.pull_request?.number;

        if (!prNumber) {
            core.setFailed('No PR number provided or found in context.');
            return;
        }

        const { data: currentPr } = await octokit.rest.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
        });

        const targetBranch = currentPr.base.ref;
        core.info(`Current PR targets branch: ${targetBranch}`);

        // Parse target repo owner and name
        const [targetOwner, targetRepo] = targetRepoInput.split('/');

        // Fetch closed PRs from target repo targeting the same branch, sorted by updated desc (closest proxy to merged)
        // We filter for merged ones manually or via state=closed
        const { data: closedPrs } = await octokit.rest.pulls.list({
            owner: targetOwner,
            repo: targetRepo,
            state: 'closed',
            base: targetBranch,
            sort: 'updated',
            direction: 'desc',
            per_page: 20, // Fetch a few to find the last merged one
        });

        const lastMergedPr = closedPrs.find(pr => pr.merged_at !== null);

        if (!lastMergedPr) {
            core.info(`No merged PRs found in ${targetRepoInput} targeting ${targetBranch}.`);
            return;
        }

        const lastAuthor = lastMergedPr.user?.login;
        const currentAuthor = currentPr.user?.login;

        core.info(`Last merged PR #${lastMergedPr.number} in ${targetRepoInput} by ${lastAuthor}`);

        if (lastAuthor && lastAuthor !== currentAuthor) {
            core.info(`Assigning ${lastAuthor} as a reviewer to PR #${prNumber}`);
            await octokit.rest.pulls.requestReviewers({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: prNumber,
                reviewers: [lastAuthor],
            });
        } else {
            core.info(`Last author (${lastAuthor}) is the same as current author (${currentAuthor}) or undefined. Skipping assignment.`);
        }

    } catch (error: any) {
        core.setFailed(error.message);
    }
}

run();
