#!/usr/bin/env node

/**
 * Analyze Selector Quality Report
 * 
 * This script reads the selectorQuality.json file and generates a human-readable
 * report showing which UI elements need better test identifiers and accessibility attributes.
 * 
 * Usage: node scripts/analyze-selector-quality.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const REPORT_PATH = path.join(__dirname, '..', 'cypress', 'reports', 'selectorQuality.json');

function main() {
    console.log('\n' + chalk.cyan('='.repeat(80)));
    console.log(chalk.cyan.bold('  SELECTOR QUALITY ANALYSIS REPORT'));
    console.log(chalk.cyan('='.repeat(80)) + '\n');

    // Check if report exists
    if (!fs.existsSync(REPORT_PATH)) {
        console.log(chalk.red('❌ No selector quality report found at:'));
        console.log(`   ${REPORT_PATH}\n`);
        console.log(chalk.yellow('💡 Run your Cypress tests first to generate the report.\n'));
        process.exit(1);
    }

    // Read and parse the report
    let report;
    try {
        const reportData = fs.readFileSync(REPORT_PATH, 'utf8');
        report = JSON.parse(reportData);
    } catch (error) {
        console.log(chalk.red('❌ Error reading report file:'), error.message);
        process.exit(1);
    }

    // Display summary
    displaySummary(report);

    // Group issues by suite and type
    const issuesBySuite = groupIssuesBySuite(report.issues);
    
    // Display detailed issues
    displayDetailedIssues(issuesBySuite);

    // Display recommendations
    displayRecommendations(report);

    console.log(chalk.cyan('='.repeat(80)) + '\n');
}

function displaySummary(report) {
    console.log(chalk.bold('📊 SUMMARY'));
    console.log(chalk.gray('-'.repeat(80)));
    console.log(chalk.gray(`Last Update: ${new Date(report.lastUpdate).toLocaleString()}`));
    console.log();

    const { summary } = report;
    const total = report.totalIssues;

    if (total === 0) {
        console.log(chalk.green.bold('✅ No selector quality issues found! Great job! 🎉\n'));
        return;
    }

    console.log(`Total Issues: ${chalk.red.bold(total.toString())}`);
    console.log();
    console.log(`  🔴 Fragile Selectors:      ${chalk.red.bold(summary.fragileSelectors.toString().padStart(3))}`);
    console.log(`  🟡 Missing Test IDs:       ${chalk.yellow.bold(summary.missingTestIds.toString().padStart(3))}`);
    console.log(`  🟡 Missing Aria Labels:    ${chalk.yellow.bold(summary.missingAriaLabels.toString().padStart(3))}`);
    console.log();
}

function groupIssuesBySuite(issues) {
    const grouped = {};
    
    issues.forEach(issue => {
        const suite = issue.suite || 'Unknown Suite';
        if (!grouped[suite]) {
            grouped[suite] = {
                fragile: [],
                missingTestIds: [],
                missingAria: [],
                other: []
            };
        }

        if (issue.type?.includes('Fragile')) {
            grouped[suite].fragile.push(issue);
        } else if (issue.type === 'Missing Test ID') {
            grouped[suite].missingTestIds.push(issue);
        } else if (issue.type === 'Missing Aria Label') {
            grouped[suite].missingAria.push(issue);
        } else {
            grouped[suite].other.push(issue);
        }
    });

    return grouped;
}

function displayDetailedIssues(issuesBySuite) {
    console.log(chalk.bold('📋 DETAILED ISSUES'));
    console.log(chalk.gray('-'.repeat(80)));
    console.log();

    const suites = Object.keys(issuesBySuite).sort();
    
    if (suites.length === 0) {
        console.log('No issues to display.\n');
        return;
    }

    suites.forEach(suite => {
        const suiteIssues = issuesBySuite[suite];
        const total = 
            suiteIssues.fragile.length + 
            suiteIssues.missingTestIds.length + 
            suiteIssues.missingAria.length +
            suiteIssues.other.length;

        console.log(`\n📦 ${chalk.bold(suite)} (${total} issues)`);
        console.log('   ' + chalk.gray('─'.repeat(76)));

        // Display fragile selectors (high priority)
        if (suiteIssues.fragile.length > 0) {
            console.log(chalk.red.bold(`\n   🔴 Fragile CSS Selectors (${suiteIssues.fragile.length})`));
            suiteIssues.fragile.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Selector: ${issue.selector}`));
                console.log(chalk.cyan(`      ⚠️  ${issue.recommendation}`));
            });
        }

        // Display missing test IDs
        if (suiteIssues.missingTestIds.length > 0) {
            console.log(chalk.yellow.bold(`\n   🟡 Missing Test IDs (${suiteIssues.missingTestIds.length})`));
            suiteIssues.missingTestIds.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Selector: ${issue.selector}`));
                console.log(chalk.cyan(`      ⚠️  ${issue.recommendation}`));
            });
        }

        // Display missing aria labels
        if (suiteIssues.missingAria.length > 0) {
            console.log(chalk.yellow.bold(`\n   🟡 Missing Aria Labels (${suiteIssues.missingAria.length})`));
            suiteIssues.missingAria.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Element: ${issue.element || 'unknown'}`));
                console.log(chalk.cyan(`      ⚠️  ${issue.recommendation}`));
            });
        }

        // Display other issues
        if (suiteIssues.other.length > 0) {
            console.log(chalk.blue.bold(`\n   ℹ️  Other Issues (${suiteIssues.other.length})`));
            suiteIssues.other.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Type: ${issue.type}`));
                console.log(chalk.cyan(`      ⚠️  ${issue.recommendation}`));
            });
        }
    });

    console.log();
}

function displayRecommendations(report) {
    if (report.totalIssues === 0) return;

    console.log(chalk.bold('💡 RECOMMENDATIONS'));
    console.log(chalk.gray('-'.repeat(80)));
    console.log();

    const { summary } = report;

    if (summary.fragileSelectors > 0) {
        console.log(chalk.red.bold('🔴 High Priority: Fix Fragile Selectors'));
        console.log(chalk.gray('   These are most likely to break with UI updates.'));
        console.log(chalk.cyan('   → Add data-testid attributes to elements'));
        console.log(chalk.dim('   → Example: <button data-testid="create-button">Create</button>'));
        console.log();
    }

    if (summary.missingTestIds > 0) {
        console.log(chalk.yellow.bold('🟡 Medium Priority: Add Test IDs'));
        console.log(chalk.gray('   Improve test reliability with semantic identifiers.'));
        console.log(chalk.cyan('   → Replace class selectors with data-testid'));
        console.log(chalk.dim('   → Use descriptive names like "view-system-prompt-button"'));
        console.log();
    }

    if (summary.missingAriaLabels > 0) {
        console.log(chalk.yellow.bold('🟡 Medium Priority: Add Aria Labels'));
        console.log(chalk.gray('   Improve accessibility and test reliability.'));
        console.log(chalk.cyan('   → Add aria-label to interactive elements'));
        console.log(chalk.dim('   → Use clear descriptions like "Close dialog"'));
        console.log();
    }

    console.log(chalk.bold('📚 For detailed guidance, see:'));
    console.log(chalk.cyan('   cypress/reports/SELECTOR_QUALITY_GUIDE.md'));
    console.log();
}

// Run the script
main();

