const issuesFilePath = 'cypress/reports/testQuality.json';
let testIssues = new Set();

export const setupTestQualityTracking = () => {
    console.log('[Test Quality] Setting up test quality tracking...');

    // Intercept test failures to categorize them
    Cypress.on('fail', (error, runnable) => {
        console.log('[Test Quality] Test failed, analyzing error...');
        const testTitle = runnable.title;
        const suiteName = runnable.parent?.title || 'Unknown Suite';

        // Analyze the error message for categorization
        const errorMessage = error.message;
        console.log(`[Test Quality] Error message: ${errorMessage.substring(0, 100)}...`);

        const issue = categorizeTestFailure(errorMessage, testTitle, suiteName);
        console.log(`[Test Quality] Categorized as: ${issue.category}`);

        // Add issue to the set
        const issueKey = JSON.stringify(issue);
        testIssues.add(issueKey);

        console.log(`[Test Quality] Issue: ${issue.category} - ${testTitle}`);

        // Re-throw the error to maintain normal Cypress behavior
        throw error;
    });
};

// Initialize the test quality file before all tests
// Only resets on the very first spec, preserves data on subsequent specs
before(function() {
    cy.task('initializeTestQualityLog', {
        filePath: issuesFilePath
    });
});

// Clear issues before each test
beforeEach(function() {
    testIssues.clear();
});

// Log issues after each test (runs even on failure)
// Only logs when ALL retry attempts have been exhausted
afterEach(function() {
    const currentTest = this.currentTest || Cypress.currentTest;
    const state = currentTest.state;
    const attempts = currentTest._currentRetry || 0;
    const maxRetries = Cypress.config('retries');

    // Only log if:
    // 1. Test failed (state === 'failed')
    // 2. All retries exhausted (attempts >= maxRetries OR state === 'passed')
    const shouldLog = (state === 'failed' && attempts >= maxRetries) || state === 'passed';

    console.log(`[Test Quality] afterEach: ${testIssues.size} issues collected, state: ${state}, attempt: ${attempts + 1}/${maxRetries + 1}, shouldLog: ${shouldLog}`);

    if (testIssues.size > 0 && shouldLog) {
        const uniqueIssues = Array.from(testIssues).map(issueKey => JSON.parse(issueKey));
        console.log(`[Test Quality] Logging ${uniqueIssues.length} issues:`, uniqueIssues.map(i => i.category));

        cy.task('updateTestQualityLog', {
            filePath: issuesFilePath,
            newIssues: uniqueIssues
        }, { log: false }).then(() => {
            cy.log(`✓ Logged ${uniqueIssues.length} test quality issue(s)`);
            console.log(`[Test Quality] Successfully logged ${uniqueIssues.length} issues`);
        });
    } else if (testIssues.size > 0 && !shouldLog) {
        console.log('[Test Quality] Issues detected but not logging yet (retry available)');
    } else {
        console.log('[Test Quality] No issues to log');
    }
});

/**
 * Categorizes test failures into 2 categories:
 * 1. Failed - Likely Bug: ALL finalCheck failures
 * 2. Selector Issue: EVERYTHING else
 */
function categorizeTestFailure(errorMessage, testTitle, suiteName) {
    console.log(`[Test Quality] Categorizing error for: ${testTitle}`);

    // Check for FINAL_CHECK_BUG marker → LIKELY_BUG
    if (errorMessage.includes('[FINAL_CHECK_BUG]')) {
        console.log('[Test Quality] Detected FINAL_CHECK_BUG marker → Failed - Likely Bug');
        return {
            type: 'Final Verification Failed',
            category: 'Failed - Likely Bug',
            description: 'Final check failed - likely application bug',
            errorMessage: errorMessage,
            recommendation: 'This failure occurred at the final verification step. Investigate the application functionality, not the test selectors.',
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        };
    }

    // Everything else → Selector Issue
    console.log('[Test Quality] Not from finalCheck → Selector Issue');
    return {
        type: 'Test Failed',
        category: 'Selector Issue',
        description: 'Test failed - check selectors or test setup',
        errorMessage: errorMessage,
        recommendation: 'Review test selectors, wait times, and test setup. Update data-testid attributes if needed.',
        test: testTitle,
        suite: suiteName,
        timestamp: new Date().toISOString()
    };
}
