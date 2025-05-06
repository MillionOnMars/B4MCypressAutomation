module.exports = {
    reporterEnabled: 'cypress-slack-reporter',
    reporterOptions: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: '#b4m-automation-results',
        // title: 'B4M Automation Test Results',
        reportHtml: true,
        screenshotOnFail: true
    }
};