const issuesFilePath = 'cypress/reports/testQuality.json';
let testIssues = new Set();

export const setupTestQualityTracking = () => {
    console.log('[Test Quality] Setting up test quality tracking...');
    
    // Intercept test failures to analyze all types of issues
    Cypress.on('fail', (error, runnable) => {
        console.log('[Test Quality] Test failed, analyzing error...');
        const testTitle = runnable.title;
        const suiteName = runnable.parent?.title || 'Unknown Suite';
        
        // Analyze the error message for various test quality issues
        const errorMessage = error.message;
        console.log(`[Test Quality] Error message: ${errorMessage.substring(0, 100)}...`);
        
        const issues = analyzeTestFailure(errorMessage, testTitle, suiteName);
        console.log(`[Test Quality] Found ${issues.length} issues`);
        
        // Add issues to the set
        issues.forEach(issue => {
            const issueKey = JSON.stringify(issue);
            testIssues.add(issueKey);
        });

        // Log for debugging
        if (issues.length > 0) {
            console.log(`[Test Quality] Detected ${issues.length} issue(s) in ${testTitle}`);
            issues.forEach(issue => console.log(`  - ${issue.type}: ${issue.category}`));
        } else {
            console.log(`[Test Quality] No issues detected for: ${testTitle}`);
        }

        // Re-throw the error to maintain normal Cypress behavior
        throw error;
    });
};

// Initialize the test quality file before all tests
before(function() {
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
                assertionErrors: 0,
                
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

// Clear issues before each test
beforeEach(function() {
    testIssues.clear();
});

// Log issues after each test (runs even on failure)
afterEach(function() {
    console.log(`[Test Quality] afterEach: ${testIssues.size} issues collected`);
    if (testIssues.size > 0) {
        const uniqueIssues = Array.from(testIssues).map(issueKey => JSON.parse(issueKey));
        console.log(`[Test Quality] Logging ${uniqueIssues.length} issues:`, uniqueIssues.map(i => i.type));
        
        cy.task('updateTestQualityLog', {
            filePath: issuesFilePath,
            newIssues: uniqueIssues
        }, { log: false }).then(() => {
            cy.log(`✓ Logged ${uniqueIssues.length} test quality issue(s)`);
            console.log(`[Test Quality] Successfully logged ${uniqueIssues.length} issues`);
        });
    } else {
        console.log('[Test Quality] No issues to log');
    }
});

/**
 * Analyzes error messages to detect various test failure types
 * Categories: Selector Issues, Data Validation, Visibility Issues, Performance, Assertion Errors
 */
function analyzeTestFailure(errorMessage, testTitle, suiteName) {
    const issues = [];
    let match;
    
    // Check if this is an AssertionError
    const isAssertionError = errorMessage.includes('AssertionError');
    console.log(`[Test Quality] isAssertionError: ${isAssertionError}`);
    console.log(`[Test Quality] Error type: ${isAssertionError ? 'Assertion' : 'Non-Assertion'}`);
    
    // Only process non-assertion patterns if it's NOT an AssertionError
    if (!isAssertionError) {
        // Pattern 1: Content/Text not found (non-assertion errors)
        const contentNotFoundPattern = /Expected to find content:\s*['"]([^'"]+)['"].*but never did/i;
        const withinContentPattern = /Expected to find content:\s*['"]([^'"]+)['"].*within.*<([^>]+)>.*but never did/i;
        
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
    
    // Pattern 7: Timeout errors (only if not an assertion error)
    const timeoutPattern = /Timed out retrying after (\d+)ms/i;
    if ((match = timeoutPattern.exec(errorMessage)) !== null && !isAssertionError && issues.length === 0) {
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
    
    // ==================== ASSERTION ERROR PATTERNS ====================
    // Only process assertion patterns if this is an AssertionError
    if (isAssertionError) {
        // Extract the core assertion message (remove "Timed out retrying after Xms:" prefix if present)
        const coreMessage = errorMessage.replace(/^.*?Timed out retrying after \d+ms:\s*/i, '');
        console.log(`[Test Quality] Core message (first 200 chars): ${coreMessage.substring(0, 200)}`);
        
        // Pattern 8a: Streaming not complete error from verifyAnswers (check first - most specific)
        const streamingPattern = /Waiting for streaming to complete.*expected.*to be true/i;
        if (streamingPattern.test(coreMessage)) {
            issues.push({
                type: 'AI Response - Streaming Timeout',
                category: 'Performance',
                severity: 'high',
                errorMessage: coreMessage,
                recommendation: `AI response streaming did not complete in time.\n\nPossible causes:\n  1. Response is taking too long to generate\n  2. Streaming may have stalled or stopped\n  3. Network connectivity issues\n  4. Backend service timeout\n  5. Text stability check is too strict\n\nRecommendations:\n  - Increase timeout in verifyAnswers options\n  - Check backend logs for AI service errors\n  - Verify network stability\n  - Review text stability logic (may need adjustment)\n  - Check if this is a consistently slow prompt`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 8b: verifyAnswers custom error - answers not found (OR logic)
        else if ((match = /At least one of \[([^\]]+)\] should be visible in (.+?)(?::|$)/i.exec(coreMessage)) !== null) {
            console.log('[Test Quality] Pattern 8b matched! verifyAnswers error detected');
            const expectedAnswers = match[1];
            const selector = match[2];
            const isAIResponse = selector.includes('ai-response');
            console.log(`[Test Quality] Expected answers: ${expectedAnswers}`);
            console.log(`[Test Quality] Selector: ${selector}`);
            console.log(`[Test Quality] Is AI Response: ${isAIResponse}`);
            
            issues.push({
                type: isAIResponse ? 'AI Response Validation - Streaming Issue' : 'Content Validation Failed',
                category: 'Data Validation',
                severity: 'high',
                expectedAnswers: expectedAnswers.split(',').map(a => a.trim()),
                selector: selector,
                errorMessage: coreMessage,
                recommendation: isAIResponse 
                    ? `AI response validation failed. None of the expected answers [${expectedAnswers}] were found in ${selector}.\n\nPossible causes:\n  1. Streaming not complete - Response still generating (most common)\n  2. AI model didn't include expected keywords in response\n  3. Prompt in fixtures/prompts.json needs adjustment\n  4. Model doesn't support this type of query\n  5. File upload (if applicable) wasn't processed correctly\n\nRecommendations:\n  - Verify streaming completion logic in verifyAnswers\n  - Check if AI response contains ANY relevant content\n  - Review prompt quality and expected answers\n  - Try with a more deterministic prompt`
                    : `Content validation failed. None of [${expectedAnswers}] found in ${selector}. Check:\n  1. Verify content is rendered\n  2. Ensure sufficient wait time\n  3. Check if selector is correct\n  4. Review expected values in test data`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 8c: Content not found within specific element (verifyAnswers AND logic failure)
        else if ((match = /Expected to find content:\s*['"]([^'"]+)['"].*within.*<([^>]+)>.*but never did/i.exec(coreMessage)) !== null) {
            const expectedContent = match[1];
            const withinElement = match[2];
            const isAIResponse = coreMessage.includes('ai-response') || withinElement.includes('ai-response');
            
            issues.push({
                type: isAIResponse ? 'AI Response Validation - Content Missing' : 'Assertion Failure - Content Not Found',
                category: isAIResponse ? 'Data Validation' : 'Assertion Error',
                severity: 'high',
                expectedContent: expectedContent,
                selector: withinElement,
                errorMessage: coreMessage,
                recommendation: isAIResponse
                    ? `AI response missing expected content "${expectedContent}".\n\nPossible causes:\n  1. Streaming not complete when checked\n  2. AI model didn't include this specific keyword\n  3. Prompt needs to be more specific\n  4. Model response is incomplete or truncated\n\nRecommendations:\n  - Check if response streaming completed\n  - Review actual AI response content in the UI\n  - Adjust prompt to be more explicit\n  - Consider using 'or' logic with multiple acceptable answers`
                    : `Expected content "${expectedContent}" not found in ${withinElement}. Check:\n  1. Content exists in the target element\n  2. Wait time is sufficient\n  3. Element selector is correct\n  4. Expected text matches actual content`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 8d: General content not found in assertion errors
        else if ((match = /Expected to find content:\s*['"]([^'"]+)['"].*but never did/i.exec(coreMessage)) !== null) {
            const expectedContent = match[1];
            issues.push({
                type: 'Assertion Failure - Content Not Found',
                category: 'Assertion Error',
                severity: 'high',
                expectedContent: expectedContent,
                errorMessage: coreMessage,
                recommendation: `Expected content "${expectedContent}" was not found. Check:\n  1. Verify the content exists in the UI\n  2. Check if content is dynamically loaded\n  3. Ensure sufficient wait time for content to appear\n  4. Review if the expected text is correct`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 8e: Network/API errors (fetch failed, network error, CORS, etc.)
        else if (/(?:fetch failed|network error|network request failed|cors|failed to fetch|ERR_CONNECTION)/i.test(coreMessage)) {
            issues.push({
                type: 'Network/API Error',
                category: 'Performance',
                severity: 'high',
                errorMessage: coreMessage,
                recommendation: `Network or API request failed.\n\nPossible causes:\n  1. Backend service is down or unreachable\n  2. Network connectivity issues\n  3. CORS configuration problems\n  4. API endpoint changed or invalid\n  5. Request timeout\n\nRecommendations:\n  - Check if backend services are running\n  - Verify API endpoints are correct\n  - Review network logs in browser DevTools\n  - Check CORS configuration if cross-origin\n  - Increase timeout if request is slow`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 8f: File upload errors
        else if (/(?:upload|file).*(?:failed|error|invalid)/i.test(coreMessage) || /invalid file type|file size|file format/i.test(coreMessage)) {
            issues.push({
                type: 'File Upload Error',
                category: 'Data Validation',
                severity: 'high',
                errorMessage: coreMessage,
                recommendation: `File upload operation failed.\n\nPossible causes:\n  1. File type not supported\n  2. File size exceeds limit\n  3. File path incorrect in test\n  4. Upload endpoint error\n  5. Missing file in fixtures\n\nRecommendations:\n  - Verify file exists in cypress/fixtures/\n  - Check file type is supported\n  - Review file size limits\n  - Check upload API endpoint\n  - Review backend logs for upload errors`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 8g: Authentication/Authorization errors
        else if (/(?:401|403|unauthorized|forbidden|authentication|not authenticated|login required|permission denied|access denied)/i.test(coreMessage)) {
            issues.push({
                type: 'Authentication/Authorization Error',
                category: 'Assertion Error',
                severity: 'high',
                errorMessage: coreMessage,
                recommendation: `Authentication or authorization failed.\n\nPossible causes:\n  1. User not logged in or session expired\n  2. Invalid credentials in test data\n  3. Insufficient permissions for operation\n  4. Token expired or invalid\n  5. Auth state not properly set up\n\nRecommendations:\n  - Verify login is successful before this test\n  - Check credentials in fixtures/accounts.json\n  - Review user permissions/roles\n  - Check if auth token is being sent\n  - Ensure beforeEach login hook is working`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 9: Boolean assertions (expected true/false to be true/false)
        else if ((match = /expected\s+(true|false)\s+to\s+(?:be|equal)\s+(true|false)/i.exec(coreMessage)) !== null) {
            const actual = match[1];
            const expected = match[2];
            
            // Extract context from the message before "expected"
            const contextMatch = /^(.+?):\s*expected/i.exec(coreMessage);
            const context = contextMatch ? contextMatch[1].trim() : 'Assertion failed';
            
            issues.push({
                type: 'Assertion Failure - Boolean',
                category: 'Assertion Error',
                severity: 'high',
                expected: expected,
                actual: actual,
                context: context,
                errorMessage: coreMessage,
                recommendation: `Boolean assertion failed: ${context}. Check:\n  1. Verify the condition logic in your test\n  2. Ensure elements or data exist as expected\n  3. Check if custom assertion message provides clues\n  4. Review the test's preconditions`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 10: "expected X to be Y" - General state/value assertions (visible, hidden, checked, etc.)
        else if ((match = /expected\s+['"]?(.+?)['"]?\s+to\s+be\s+['"]?([^'"]+?)['"]?$/i.exec(coreMessage)) !== null) {
            const subject = match[1].trim();
            const expectedState = match[2].trim();
            
            issues.push({
                type: 'Assertion Failure - State',
                category: 'Assertion Error',
                severity: 'medium',
                subject: subject,
                expectedState: expectedState,
                errorMessage: coreMessage,
                recommendation: `Expected '${subject}' to be '${expectedState}'. Check:\n  1. Verify element reaches the expected state\n  2. Wait for animations/transitions to complete\n  3. Check if element selector is correct\n  4. Ensure proper visibility/rendering conditions`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 10: "expected X to equal/deep.equal Y"
        else if ((match = /expected\s+(.+?)\s+to\s+(equal|deep\.equal|strictly\s+equal|eql)\s+(.+)/i.exec(coreMessage)) !== null) {
            const actual = match[1].trim();
            const assertion = match[2].trim();
            const expected = match[3].trim();
            
            issues.push({
                type: 'Assertion Failure - Equality',
                category: 'Assertion Error',
                severity: 'high',
                expected: expected,
                actual: actual,
                assertionType: assertion,
                errorMessage: coreMessage,
                recommendation: `Expected ${actual} to ${assertion} ${expected}. Check:\n  1. Verify expected values in fixtures/test data\n  2. Check if API response structure changed\n  3. Ensure data is fully loaded before assertion\n  4. Review data type compatibility`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 11: "expected X to have length/contain/include Y"
        else if ((match = /expected\s+(.+?)\s+to\s+(have\s+(?:a\s+)?length|contain|include)\s+(.+)/i.exec(coreMessage)) !== null) {
            const subject = match[1].trim();
            const assertion = match[2].trim();
            const expected = match[3].trim();
            
            issues.push({
                type: 'Assertion Failure - Collection',
                category: 'Assertion Error',
                severity: 'medium',
                subject: subject,
                assertionType: assertion,
                expected: expected,
                errorMessage: coreMessage,
                recommendation: `Expected ${subject} to ${assertion} ${expected}. Check:\n  1. Verify collection/array contents\n  2. Check if filters are applied correctly\n  3. Ensure all items are loaded (pagination)\n  4. Review test data consistency`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 12: "expected X to have property/attribute/class Y"
        else if ((match = /expected\s+(.+?)\s+to\s+have\s+(property|attribute|class)\s+(.+)/i.exec(coreMessage)) !== null) {
            const subject = match[1].trim();
            const type = match[2].trim();
            const expected = match[3].trim();
            
            issues.push({
                type: `Assertion Failure - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                category: 'Assertion Error',
                severity: 'medium',
                subject: subject,
                expected: expected,
                errorMessage: coreMessage,
                recommendation: `Expected ${type} '${expected}' not found. Check:\n  1. Verify the ${type} exists on the element\n  2. Check if naming conventions changed\n  3. Ensure proper rendering/initialization\n  4. Review component library updates`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 13: "expected X to exist/not exist"
        else if ((match = /expected\s+(.+?)\s+(not\s+)?to\s+exist/i.exec(coreMessage)) !== null) {
            const subject = match[1].trim();
            const shouldNotExist = !!match[2];
            
            issues.push({
                type: 'Assertion Failure - Existence',
                category: 'Assertion Error',
                severity: 'high',
                subject: subject,
                shouldNotExist: shouldNotExist,
                errorMessage: coreMessage,
                recommendation: shouldNotExist 
                    ? `Expected '${subject}' not to exist but it does. Check:\n  1. Verify element is properly removed\n  2. Check if delete action completed\n  3. Review cleanup operations`
                    : `Expected '${subject}' to exist but it doesn't. Check:\n  1. Verify element is rendered\n  2. Check if creation completed\n  3. Review permissions/feature flags`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 14: Generic "expected X to ..." catch-all for any other assertion patterns
        else if ((match = /expected\s+(.+?)\s+to\s+(.+)/i.exec(coreMessage)) !== null) {
            const subject = match[1].trim();
            const expectation = match[2].trim();
            
            issues.push({
                type: 'Assertion Failure - General',
                category: 'Assertion Error',
                severity: 'medium',
                subject: subject,
                expectation: expectation,
                errorMessage: coreMessage,
                recommendation: `Assertion failed: expected ${subject} to ${expectation}. Check:\n  1. Review the full error message for context\n  2. Verify test expectations match actual behavior\n  3. Check if feature implementation changed\n  4. Ensure test data and fixtures are up to date`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
        // Pattern 15: Catch-all for any other AssertionError format
        else {
            issues.push({
                type: 'Assertion Failure - Unknown',
                category: 'Assertion Error',
                severity: 'medium',
                errorMessage: coreMessage,
                recommendation: `Assertion failed. Review the error message:\n"${coreMessage.substring(0, 200)}..."\n\nCheck:\n  1. Review the custom assertion message for clues\n  2. Verify test expectations\n  3. Check if this is a custom chai assertion\n  4. Ensure test setup is correct`,
                test: testTitle,
                suite: suiteName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    console.log(`[Test Quality] Returning ${issues.length} issue(s) from analyzeTestFailure`);
    if (issues.length > 0) {
        console.log(`[Test Quality] Issue types:`, issues.map(i => i.type));
    }
    return issues;
}

