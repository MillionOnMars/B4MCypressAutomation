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

        // Wait for JSON reports to be written
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Merge JSON reports using mochawesome-merge
        const { merge } = require('mochawesome-merge');
        const mergedJson = await merge({
            files: [`${reportsDir}/*.json`]
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

        // Read test quality report (separate from test failures)
        let qualityReport = '';
        let qualityIssues = '';
        try {
            const qualityPath = path.join(reportsDir, 'testQuality.json');
            const qualityData = await fs.readFile(qualityPath, 'utf8');
            const quality = JSON.parse(qualityData);
            
            if (quality.totalIssues > 0) {
                const summary = quality.summary;
                qualityReport = `🔍 *Code Quality Issues* (Selector/Performance)\n` +
                    `• Total: ${quality.totalIssues} issues (🔴 ${summary.high || 0} High, 🟡 ${summary.medium || 0} Medium)\n` +
                    `• Selector Issues: ${summary.selectorIssues || 0}\n` +
                    `• Data Validation: ${summary.dataValidation || 0}\n` +
                    `• Visibility Issues: ${summary.visibilityIssues || 0}\n` +
                    `• Performance: ${summary.performance || 0}`;
                
                // Get top 3 high severity issues
                const topIssues = quality.issues
                    .filter(i => i.severity === 'high')
                    .slice(0, 3)
                    .map(issue => {
                        const rec = issue.recommendation.split('\n')[0];
                        return `  • [${issue.category}] ${issue.test}\n    ↳ ${issue.type}`;
                    })
                    .join('\n');
                
                if (topIssues) {
                    qualityIssues = `\n\n*Top Quality Issues:*\n${topIssues}`;
                }
            } else {
                qualityReport = `🔍 *Code Quality* ✅\n• No selector or performance issues detected!`;
            }
        } catch (error) {
            qualityReport = `🔍 *Code Quality*\n• No quality report available`;
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
            `*🧪 Test Run Summary*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `*Overall*: ${results.totalPassed}/${results.totalTests} passed ${results.totalFailed > 0 ? '❌' : '✅'}`,
            `\n*Spec Files*`,
            specResults,
            failureDetails,
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `\n💳 *Credits Usage*`,
            creditsResults,
            consoleErrorsReport,
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `\n${qualityReport}`,
            qualityIssues,
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `\n📊 *Full Report*`,
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
