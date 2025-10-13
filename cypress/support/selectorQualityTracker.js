export const setupSelectorQualityTracking = () => {
    const issuesFilePath = 'cypress/reports/selectorQuality.json';
    let selectorIssues = new Set();

    before(() => {
        cy.task('writeFile', {
            filePath: issuesFilePath,
            content: { 
                issues: [], 
                totalIssues: 0,
                summary: {
                    fragileSelectors: 0,
                    missingTestIds: 0,
                    missingAriaLabels: 0
                }
            }
        });
    });

    beforeEach(() => {
        selectorIssues.clear();
    });

    // Intercept test failures to analyze selectors
    Cypress.on('fail', (error, runnable) => {
        const testTitle = runnable.title;
        const suiteName = runnable.parent?.title || 'Unknown Suite';
        
        // Analyze the error message for selector issues
        const errorMessage = error.message;
        const issues = analyzeSelectorQuality(errorMessage, testTitle, suiteName);
        
        issues.forEach(issue => {
            const issueKey = JSON.stringify(issue);
            selectorIssues.add(issueKey);
        });

        // Re-throw the error to maintain normal Cypress behavior
        throw error;
    });

    afterEach(() => {
        if (selectorIssues.size > 0) {
            const uniqueIssues = Array.from(selectorIssues).map(issueKey => JSON.parse(issueKey));
            
            cy.task('updateSelectorQualityLog', {
                filePath: issuesFilePath,
                newIssues: uniqueIssues
            }).then(() => {
                cy.log(`Logged ${uniqueIssues.length} selector quality issues`);
                selectorIssues.clear();
            });
        }
    });
};

/**
 * Analyzes error messages to detect fragile selectors and missing attributes
 */
function analyzeSelectorQuality(errorMessage, testTitle, suiteName) {
    const issues = [];
    
    // Pattern 1: Complex MUI class chains (fragile selectors)
    const muiClassPattern = /<([a-z]+)\.([^>]*MuiButton[^>]*|[^>]*MuiTypography[^>]*|[^>]*MuiSheet[^>]*|[^>]*MuiDrawer[^>]*|[^>]*css-[a-z0-9]+[^>]*)>/gi;
    let match;
    
    while ((match = muiClassPattern.exec(errorMessage)) !== null) {
        const fullElement = match[0];
        const elementTag = match[1];
        const classString = match[2];
        
        // Check if element has many classes (indicating fragile selector)
        const classCount = (classString.match(/\./g) || []).length;
        
        if (classCount >= 3) {
            issues.push({
                type: 'Fragile CSS Selector',
                severity: 'high',
                selector: fullElement,
                recommendation: `Use data-testid or aria-label for <${elementTag}> element`,
                element: elementTag,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Pattern 2: Class-only selectors (from "Expected to find element" errors)
    const classSelectorPattern = /Expected to find element:\s*`([^`]+)`/gi;
    while ((match = classSelectorPattern.exec(errorMessage)) !== null) {
        const selector = match[1];
        
        // Check if it's a class selector without data-testid or aria attributes
        if (selector.startsWith('.') && !selector.includes('[data-testid') && !selector.includes('[aria-')) {
            issues.push({
                type: 'Missing Test ID',
                severity: 'medium',
                selector: selector,
                recommendation: 'Add data-testid attribute to this element',
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Pattern 3: Elements covered by other elements (often aria-label would help)
    const coveredPattern = /is not visible because it's being covered by another element/i;
    if (coveredPattern.test(errorMessage)) {
        // Extract the element from the error
        const elementMatch = /<([a-z]+)[^>]*>/i.exec(errorMessage);
        if (elementMatch) {
            issues.push({
                type: 'Missing Aria Label',
                severity: 'medium',
                selector: elementMatch[0],
                recommendation: 'Add aria-label to help identify this element when covered',
                element: elementMatch[1],
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Pattern 4: Elements with display:none parent (better selectors could help)
    const displayNonePattern = /has CSS property:\s*`display: none`/i;
    if (displayNonePattern.test(errorMessage)) {
        const elementMatch = /<([a-z]+)[^>]*>/i.exec(errorMessage);
        if (elementMatch) {
            issues.push({
                type: 'Fragile Selector - Parent Hidden',
                severity: 'high',
                selector: elementMatch[0],
                recommendation: 'Use more specific data-testid or wait for parent to be visible',
                element: elementMatch[1],
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    return issues;
}

