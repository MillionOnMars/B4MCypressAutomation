export const setupTestQualityTracking = () => {
    const issuesFilePath = 'cypress/reports/testQuality.json';
    let testIssues = new Set();

    before(() => {
        cy.task('writeFile', {
            filePath: issuesFilePath,
            content: { 
                issues: [], 
                totalIssues: 0,
                summary: {
                    // By Category
                    selectorIssues: 0,
                    dataValidation: 0,
                    visibilityIssues: 0,
                    performance: 0,
                    
                    // By Type (legacy support)
                    fragileSelectors: 0,
                    missingTestIds: 0,
                    missingAriaLabels: 0,
                    contentNotFound: 0,
                    elementNotFound: 0,
                    
                    // By Severity
                    high: 0,
                    medium: 0
                }
            }
        });
    });

    beforeEach(() => {
        testIssues.clear();
    });

    // Intercept test failures to analyze all types of issues
    Cypress.on('fail', (error, runnable) => {
        const testTitle = runnable.title;
        const suiteName = runnable.parent?.title || 'Unknown Suite';
        
        // Analyze the error message for various test quality issues
        const errorMessage = error.message;
        const issues = analyzeTestFailure(errorMessage, testTitle, suiteName);
        
        issues.forEach(issue => {
            const issueKey = JSON.stringify(issue);
            testIssues.add(issueKey);
        });

        // Re-throw the error to maintain normal Cypress behavior
        throw error;
    });

    afterEach(() => {
        if (testIssues.size > 0) {
            const uniqueIssues = Array.from(testIssues).map(issueKey => JSON.parse(issueKey));
            
            cy.task('updateTestQualityLog', {
                filePath: issuesFilePath,
                newIssues: uniqueIssues
            }).then(() => {
                cy.log(`Logged ${uniqueIssues.length} test quality issues`);
                testIssues.clear();
            });
        }
    });
};

/**
 * Analyzes error messages to detect various test failure types
 * Categories: Selector Issues, Data Validation, Visibility Issues, Performance
 */
function analyzeTestFailure(errorMessage, testTitle, suiteName) {
    const issues = [];
    let match;
    
    // Pattern 1: Content/Text not found
    const contentNotFoundPattern = /Expected to find content:\s*'([^']+)'.*but never did/i;
    const withinContentPattern = /Expected to find content:\s*'([^']+)'.*within.*<([^>]+)>.*but never did/i;
    
    if ((match = withinContentPattern.exec(errorMessage)) !== null) {
        const expectedContent = match[1];
        const withinElement = match[2];
        issues.push({
            type: 'Content Not Found',
            category: 'Data Validation',
            severity: 'high',
            expectedContent: expectedContent,
            context: `within ${withinElement}`,
            selector: withinElement,
            recommendation: `Expected content "${expectedContent}" was not found. Check if:\n  1. The AI response contains the expected keyword\n  2. The response time is sufficient\n  3. The prompt in fixtures/prompts.json is accurate\n  4. The model supports this type of query`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    } else if ((match = contentNotFoundPattern.exec(errorMessage)) !== null) {
        const expectedContent = match[1];
        issues.push({
            type: 'Content Not Found',
            category: 'Data Validation',
            severity: 'high',
            expectedContent: expectedContent,
            recommendation: `Expected content "${expectedContent}" was not found. Check if:\n  1. The element exists with correct content\n  2. The content is dynamically loaded and needs more wait time\n  3. The expected text in fixtures is correct`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    }
    
    // Pattern 2: Element not found with timeout
    const elementNotFoundPattern = /Expected to find element:\s*`([^`]+)`.*but never found it/i;
    if ((match = elementNotFoundPattern.exec(errorMessage)) !== null) {
        const selector = match[1];
        const isClassSelector = selector.startsWith('.');
        const isDataTestId = selector.includes('[data-testid');
        const isAriaLabel = selector.includes('[aria-');
        
        issues.push({
            type: 'Element Not Found',
            category: 'Selector Issue',
            severity: isClassSelector ? 'high' : 'medium',
            selector: selector,
            recommendation: isClassSelector 
                ? `Fragile CSS class selector "${selector}" not found. Consider:\n  1. Add data-testid attribute for stability\n  2. Check if UI has changed\n  3. Verify element is actually rendered\n  4. Check if feature is behind a feature flag`
                : `Element "${selector}" not found. Check if:\n  1. Element exists in current UI state\n  2. Navigation is complete before searching\n  3. Element requires specific user permissions`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    }
    
    // Pattern 3: Complex MUI class chains (fragile selectors in error details)
    const muiClassPattern = /<([a-z]+)\.([^>]*MuiButton[^>]*|[^>]*MuiTypography[^>]*|[^>]*MuiSheet[^>]*|[^>]*MuiDrawer[^>]*|[^>]*css-[a-z0-9]+[^>]*)>/gi;
    
    while ((match = muiClassPattern.exec(errorMessage)) !== null) {
        const fullElement = match[0];
        const elementTag = match[1];
        const classString = match[2];
        
        // Check if element has many classes (indicating fragile selector)
        const classCount = (classString.match(/\./g) || []).length;
        
        if (classCount >= 3) {
            issues.push({
                type: 'Fragile CSS Selector',
                category: 'Selector Issue',
                severity: 'high',
                selector: fullElement,
                recommendation: `Complex MUI selector detected for <${elementTag}>. Recommend:\n  1. Add data-testid="${elementTag.toLowerCase()}-[purpose]"\n  2. Use semantic HTML with aria-label\n  3. Target by role and accessible name`,
                element: elementTag,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Pattern 4: Elements covered by other elements
    const coveredPattern = /is not visible because it's being covered by another element:\s*`<([^>]+)>`/i;
    if ((match = coveredPattern.exec(errorMessage)) !== null) {
        const coveringElement = match[1];
        issues.push({
            type: 'Element Covered',
            category: 'Visibility Issue',
            severity: 'medium',
            coveringElement: coveringElement,
            recommendation: `Element is covered by ${coveringElement}. Solutions:\n  1. Close overlays/modals before clicking\n  2. Use {force: true} if intentional (not recommended)\n  3. Wait for animations to complete\n  4. Check z-index layering issues`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    }
    
    // Pattern 5: Elements with display:none or visibility issues
    const displayNonePattern = /has CSS property:\s*`display: none`/i;
    const positionFixedPattern = /has CSS property:\s*`position: fixed`.*being covered/i;
    
    if (displayNonePattern.test(errorMessage)) {
        const elementMatch = /<([a-z]+)[^>]*>/i.exec(errorMessage);
        if (elementMatch) {
            issues.push({
                type: 'Element Hidden',
                category: 'Visibility Issue',
                severity: 'high',
                selector: elementMatch[0],
                recommendation: `Element is hidden (display: none). Check:\n  1. Ensure parent containers are expanded/visible\n  2. Wait for conditional rendering\n  3. Verify feature flags or permissions\n  4. Check if element is in collapsed accordion/drawer`,
                element: elementMatch[1],
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    } else if (positionFixedPattern.test(errorMessage)) {
        issues.push({
            type: 'Fixed Position Element Covered',
            category: 'Visibility Issue',
            severity: 'medium',
            recommendation: `Fixed position element is covered. Likely causes:\n  1. Modal backdrop is still visible\n  2. Drawer/sidebar not fully closed\n  3. Need to dismiss overlay before proceeding`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    }
    
    // Pattern 6: Expected element to be visible but it's not
    const expectedVisiblePattern = /expected.*to be 'visible'/i;
    if (expectedVisiblePattern.test(errorMessage) && issues.length === 0) {
        issues.push({
            type: 'Element Not Visible',
            category: 'Visibility Issue',
            severity: 'medium',
            recommendation: `Element exists but is not visible. Check:\n  1. CSS visibility/opacity properties\n  2. Element is within viewport\n  3. Parent containers are expanded\n  4. Animations have completed`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    }
    
    // Pattern 7: Timeout errors
    const timeoutPattern = /Timed out retrying after (\d+)ms/i;
    if ((match = timeoutPattern.exec(errorMessage)) !== null && issues.length === 0) {
        const timeout = match[1];
        issues.push({
            type: 'Timeout',
            category: 'Performance',
            severity: 'medium',
            timeout: timeout,
            recommendation: `Operation timed out after ${timeout}ms. Consider:\n  1. Increase timeout for slow operations (AI responses)\n  2. Check network connectivity\n  3. Verify backend service is responding\n  4. Check if element selector changed`,
            test: testTitle,
            suite: suiteName,
            timestamp: new Date().toISOString()
        });
    }
    
    return issues;
}

