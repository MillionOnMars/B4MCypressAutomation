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

        // Format test results for each spec file
        const specResults = results.runs.map(run => {
            return `• File: ${run.spec.name}\n  ↳ Total: ${run.stats.tests}\n  ↳ Passing: ${run.stats.passes}\n  ↳ Failing: ${run.stats.failures}`;
        }).join('\n\n');

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
                        text: `*Test Run Summary*\n${specResults}\n\n*Credits Usage*\n${creditsResults}\n\n*Overall Results*\n• Total: ${results.totalTests}\n• Passing: ${results.totalPassed}\n• Failing: ${results.totalFailed}\n\n*Full Report*\n<${reportUrl}|View Full Report> _(Report will be available for 1 hour)_`
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
