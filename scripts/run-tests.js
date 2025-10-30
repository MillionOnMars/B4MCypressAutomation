const cypress = require('cypress');
const { IncomingWebhook } = require('@slack/webhook');
const path = require('path');
const fs = require('fs').promises;
const httpServer = require('http-server');
const net = require('net');
const ngrok = require('ngrok');

const findAvailablePort = async (startPort) => {
    const isPortAvailable = (port) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.once('close', () => resolve(true));
                server.close();
            });
            server.on('error', () => resolve(false));
        });
    };

    let port = startPort;
    while (!(await isPortAvailable(port))) {
        port++;
    }
    return port;
};

const cleanupReports = async (reportsDir) => {
    try {
        // Remove existing reports directory
        await fs.rm(reportsDir, { recursive: true, force: true });
        // Create fresh reports directory
        await fs.mkdir(reportsDir, { recursive: true });
        console.log('Reports directory cleaned successfully');
    } catch (error) {
        console.error('Error cleaning reports:', error);
    }
};

async function runTests() {
    try {
        const projectRoot = path.resolve(__dirname, '..');
        const reportsDir = path.join(projectRoot, 'cypress', 'reports');
        const creditsPath = path.join(projectRoot, 'cypress', 'fixtures', 'credits.json');
        const webhook = new IncomingWebhook('https://hooks.slack.com/services/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');

        // Clean up reports before running tests
        await cleanupReports(reportsDir);

        // Run Cypress tests with updated Mochawesome configuration
        const results = await cypress.run({
            config: {
                video: true,
                screenshotOnRunFailure: true
            },
            reporter: 'mochawesome',
            reporterOptions: {
                reportDir: reportsDir,
                overwrite: false,
                html: false,
                json: true,
                timestamp: true,
                reportFilename: 'mochawesome-[name]',
                charts: true,
                embeddedScreenshots: true
            }
        });

        // Wait for JSON reports and test quality files to be written
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Additional wait to ensure testQuality.json is fully written
        const maxWaitTime = 10000; // 10 seconds max
        const startWait = Date.now();
        const qualityPath = path.join(reportsDir, 'testQuality.json');
        while (!await fs.access(qualityPath).then(() => true).catch(() => false)) {
            if (Date.now() - startWait > maxWaitTime) {
                console.log('[Quality] Warning: testQuality.json not found after 10 seconds');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (await fs.access(qualityPath).then(() => true).catch(() => false)) {
            console.log('[Quality] testQuality.json found and ready to read');
        }

        // Merge JSON reports using mochawesome-merge
        const { merge } = require('mochawesome-merge');
        const mergedJson = await merge({
            files: [`${reportsDir}/mochawesome*.json`]
        });

        // Generate HTML report from merged JSON
        const generator = require('mochawesome-report-generator');
        await generator.create(mergedJson, {
            reportDir: reportsDir,
            reportTitle: 'B4M Automation Test Results',
            inline: true,
            charts: true,
            reportFilename: 'mochawesome'
        });

        // Read credits.json file
        const creditsData = await fs.readFile(creditsPath, 'utf8');
        const credits = JSON.parse(creditsData);
        
        // Format credits data
        const creditsResults = credits.map(credit => 
            `• Model: ${credit.textModel}\n  ↳ Credits: ${credit.Credits}`
        ).join('\n');

        // Read test quality report (simplified 2-category format)
        let qualityReport = '';
        try {
            console.log(`[Quality] Reading from: ${qualityPath}`);
            const qualityData = await fs.readFile(qualityPath, 'utf8');
            const quality = JSON.parse(qualityData);
            console.log(`[Quality] Found ${quality.totalIssues} total issues`);
            console.log(`[Quality] Summary:`, JSON.stringify(quality.summary, null, 2));

            if (quality.totalIssues > 0) {
                const summary = quality.summary;
                qualityReport = `📊 *Test Categorization*\n` +
                    `• Failed - Likely Bug: ${summary.likelyBug || 0}\n` +
                    `• Selector Issue: ${summary.selectorIssue || 0}`;
            } else {
                qualityReport = `📊 *Test Categorization* ✅\n• No issues detected`;
            }
        } catch (error) {
            console.error('[Quality] Error reading test quality file:', error.message);
            qualityReport = `📊 *Test Categorization*\n• No categorization available`;
        }

        // Read console errors
        let consoleErrorsReport = '';
        try {
            const errorsPath = path.join(reportsDir, 'consoleErrors.json');
            const errorsData = await fs.readFile(errorsPath, 'utf8');
            const errors = JSON.parse(errorsData);
            
            if (errors.totalErrors > 0) {
                consoleErrorsReport = `\n\n*Console Errors* ⚠️\n• Total: ${errors.totalErrors}`;
            }
        } catch (error) {
            // Console errors file might not exist
        }

        // Read saved results to get failure details
        let failureDetails = '';
        try {
            const resultsPath = path.join(reportsDir, 'results.json');
            const resultsData = await fs.readFile(resultsPath, 'utf8');
            const savedResults = JSON.parse(resultsData);
            
            if (savedResults.failures && savedResults.failures.length > 0) {
                // Group failures by spec
                const failuresBySpec = {};
                savedResults.failures.forEach(failure => {
                    if (!failuresBySpec[failure.specName]) {
                        failuresBySpec[failure.specName] = [];
                    }
                    failuresBySpec[failure.specName].push(failure);
                });

                // Format failures for Slack
                const failureMessages = Object.keys(failuresBySpec).map(specName => {
                    const specFailures = failuresBySpec[specName];
                    const failureList = specFailures.map(f => {
                        // Truncate error message to first line only
                        const errorFirstLine = f.error.split('\n')[0].substring(0, 150);
                        return `    ❌ ${f.testName}\n       ${errorFirstLine}`;
                    }).join('\n');
                    return `  📄 *${specName}*\n${failureList}`;
                }).join('\n\n');

                failureDetails = `\n\n*Failed Tests* ❌\n${failureMessages}`;
            }
        } catch (error) {
            console.error('Error reading failure details:', error);
        }

        // Format test results for each spec file
        const specResults = results.runs.map(run => {
            const status = run.stats.failures > 0 ? '❌' : '✅';
            return `${status} *${run.spec.name}*\n  • Total: ${run.stats.tests} | Passed: ${run.stats.passes} | Failed: ${run.stats.failures}`;
        }).join('\n');

        // Find available port
        const port = await findAvailablePort(8080);
        
        // Start HTTP server for reports
        const server = httpServer.createServer({
            root: reportsDir,
            cors: true,
            cache: -1,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        });
        
        server.listen(port);
        console.log(`Report server started on port ${port}`);

        // Initialize ngrok
        await ngrok.authtoken('2wfmG5B19oCwk0G5rRIocSuCFB1_5bCU2BS9d5U37z65bXo1C');
        
        const publicUrl = await ngrok.connect({
            addr: port,
            proto: 'http',
            bind_tls: true
        });

        console.log(`Ngrok tunnel created: ${publicUrl}`);

        // Generate public report URL
        const reportUrl = `${publicUrl}/mochawesome.html`;
        console.log(`Public report URL: ${reportUrl}`);

        // Build Slack message with clear sections
        const slackMessage = [
            `*🧪 CYPRESS TESTS ${results.totalFailed > 0 ? 'FAILED' : 'PASSED'}*`,
            `Environment: ${process.env.CYPRESS_APP_URL || 'Staging'}`,
            `Branch: ${process.env.GITHUB_REF_NAME || process.env.BRANCH || 'local'}`,
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `\n📊 *Test Results*`,
            `✅ Passed: ${results.totalPassed}`,
            qualityReport.includes('Likely Bug') ? `❌ ${qualityReport}` : qualityReport,
            `⏭️  Skipped: ${results.totalSkipped}`,
            `📝 Total: ${results.totalTests}`,
            failureDetails,
            consoleErrorsReport,
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `\n💳 *Credits Usage*`,
            creditsResults,
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `\n📄 *Full Report*`,
            `<${reportUrl}|View Detailed HTML Report> _(Available for 1 hour)_`
        ].filter(Boolean).join('\n');

        // Send results to Slack with public URL
        await webhook.send({
            channel: '#b4m-automation-results',
            username: 'Cypress Test Reporter',
            icon_emoji: ':cypress:',
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: slackMessage
                    }
                }
            ]
        });

        // Keep server running for 1 hour then shut down
        setTimeout(async () => {
            await ngrok.disconnect();
            server.close();
            console.log('Report server and tunnel stopped');
        }, 3600000);

        console.log('Test results sent to Slack successfully');

    } catch (error) {
        console.error('Error running tests:', error);
        await ngrok.kill(); // Ensure ngrok is killed on error
        process.exit(1);
    }
}

runTests();
