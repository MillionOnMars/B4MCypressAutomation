#!/usr/bin/env node

/**
 * Analyze Test Quality Report
 * 
 * This script reads the testQuality.json file and generates a human-readable
 * report showing test quality issues including selectors, data validation, visibility, and performance.
 * 
 * Usage: node scripts/analyze-selector-quality.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const REPORT_PATH = path.join(__dirname, '..', 'cypress', 'reports', 'testQuality.json');

function main() {
    console.log('\n' + chalk.cyan('='.repeat(80)));
    console.log(chalk.cyan.bold('  TEST QUALITY ANALYSIS REPORT'));
    console.log(chalk.cyan('='.repeat(80)) + '\n');

    // Check if report exists
    if (!fs.existsSync(REPORT_PATH)) {
        console.log(chalk.red('❌ No test quality report found at:'));
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

    // Display guide reference
    if (report.totalIssues > 0) {
        console.log(chalk.bold('📚 For detailed guidance, see:'));
        console.log(chalk.cyan('   cypress/reports/SELECTOR_QUALITY_GUIDE.md\n'));
    }

    console.log(chalk.cyan('='.repeat(80)) + '\n');
}

function displaySummary(report) {
    console.log(chalk.bold('📊 SUMMARY'));
    console.log(chalk.gray('-'.repeat(80)));
    console.log(chalk.gray(`Last Update: ${new Date(report.lastUpdate).toLocaleString()}`));
    console.log();

    const { summary, issues } = report;
    const total = report.totalIssues;

    if (total === 0) {
        console.log(chalk.green.bold('✅ No test quality issues found! Great job! 🎉\n'));
        return;
    }

    console.log(`Total Issues: ${chalk.red.bold(total.toString())}\n`);
    
    // Calculate severity breakdown by category
    const categories = [
        { name: 'Selector Issues', emoji: '🔴', key: 'selectorIssues', categoryName: 'Selector Issue' },
        { name: 'Data Validation', emoji: '📊', key: 'dataValidation', categoryName: 'Data Validation' },
        { name: 'Visibility Issues', emoji: '👁️ ', key: 'visibilityIssues', categoryName: 'Visibility Issue' },
        { name: 'Performance', emoji: '⏱️ ', key: 'performance', categoryName: 'Performance' }
    ];

    // Calculate high/medium breakdown for each category
    const categoryBreakdown = categories.map(cat => {
        const categoryIssues = issues.filter(i => i.category === cat.categoryName);
        const high = categoryIssues.filter(i => i.severity === 'high').length;
        const medium = categoryIssues.filter(i => i.severity === 'medium').length;
        const categoryTotal = summary[cat.key] || 0;
        return { ...cat, high, medium, total: categoryTotal };
    });

    // Display table header
    console.log(chalk.bold('Category                 High  Medium   Total'));
    console.log(chalk.gray('─'.repeat(50)));

    // Display each category row
    categoryBreakdown.forEach(cat => {
        // Account for emoji width variations by using fixed padding
        const name = `${cat.emoji} ${cat.name}`.padEnd(25);
        const highStr = cat.high.toString().padStart(4);
        const mediumStr = cat.medium.toString().padStart(7);
        const totalStr = cat.total.toString().padStart(7);
        
        const highColor = cat.high > 0 ? chalk.red.bold : chalk.gray;
        const mediumColor = cat.medium > 0 ? chalk.yellow.bold : chalk.gray;
        const totalColor = cat.total > 0 ? chalk.cyan.bold : chalk.gray;
        
        console.log(
            `${name} ${highColor(highStr)} ${mediumColor(mediumStr)} ${totalColor(totalStr)}`
        );
    });

    // Display total row
    console.log(chalk.gray('─'.repeat(50)));
    const totalHigh = summary.high || 0;
    const totalMedium = summary.medium || 0;
    const totalName = 'Total'.padEnd(25);
    console.log(
        chalk.bold(`${totalName} ${chalk.red.bold(totalHigh.toString().padStart(4))} ${chalk.yellow.bold(totalMedium.toString().padStart(7))} ${chalk.cyan.bold(total.toString().padStart(7))}`)
    );
    console.log();
}

function groupIssuesBySuite(issues) {
    const grouped = {};
    
    issues.forEach(issue => {
        const suite = issue.suite || 'Unknown Suite';
        if (!grouped[suite]) {
            grouped[suite] = {
                selectorIssues: [],
                dataValidation: [],
                visibilityIssues: [],
                performance: [],
                other: []
            };
        }

        // Group by category
        if (issue.category === 'Selector Issue') {
            grouped[suite].selectorIssues.push(issue);
        } else if (issue.category === 'Data Validation') {
            grouped[suite].dataValidation.push(issue);
        } else if (issue.category === 'Visibility Issue') {
            grouped[suite].visibilityIssues.push(issue);
        } else if (issue.category === 'Performance') {
            grouped[suite].performance.push(issue);
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
            suiteIssues.selectorIssues.length + 
            suiteIssues.dataValidation.length + 
            suiteIssues.visibilityIssues.length +
            suiteIssues.performance.length +
            suiteIssues.other.length;

        console.log(`\n📦 ${chalk.bold(suite)} (${total} issues)`);
        console.log('   ' + chalk.gray('─'.repeat(76)));

        // Display selector issues
        if (suiteIssues.selectorIssues.length > 0) {
            console.log(chalk.red.bold(`\n   🔴 Selector Issues (${suiteIssues.selectorIssues.length})`));
            suiteIssues.selectorIssues.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Type: ${issue.type}`));
                if (issue.selector) console.log(chalk.gray(`      Selector: ${issue.selector}`));
            });
            // Show one recommendation for all selector issues
            console.log(chalk.cyan(`\n      💡 Recommendation:`));
            console.log(chalk.cyan(`         → Add data-testid attributes to elements`));
            console.log(chalk.dim(`         → Example: <button data-testid="create-button">Create</button>`));
            console.log(chalk.cyan(`         → Use semantic HTML with aria-label`));
            console.log(chalk.dim(`         → See SELECTOR_QUALITY_GUIDE.md for details`));
        }

        // Display data validation issues
        if (suiteIssues.dataValidation.length > 0) {
            console.log(chalk.yellow.bold(`\n   📊 Data Validation Issues (${suiteIssues.dataValidation.length})`));
            suiteIssues.dataValidation.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Type: ${issue.type}`));
                if (issue.expectedContent) console.log(chalk.gray(`      Expected: "${issue.expectedContent}"`));
                if (issue.context) console.log(chalk.gray(`      Context: ${issue.context}`));
            });
            // Show one recommendation for all data validation issues
            console.log(chalk.cyan(`\n      💡 Recommendation:`));
            console.log(chalk.cyan(`         → Review prompts in fixtures/prompts.json`));
            console.log(chalk.cyan(`         → Verify AI responses contain expected keywords`));
            console.log(chalk.cyan(`         → Use multiple expected values: ["word1", "word2"]`));
            console.log(chalk.dim(`         → Check if model supports this type of query`));
        }

        // Display visibility issues
        if (suiteIssues.visibilityIssues.length > 0) {
            console.log(chalk.yellow.bold(`\n   👁️  Visibility Issues (${suiteIssues.visibilityIssues.length})`));
            suiteIssues.visibilityIssues.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Type: ${issue.type}`));
                if (issue.coveringElement) console.log(chalk.gray(`      Covered by: ${issue.coveringElement}`));
                if (issue.selector) console.log(chalk.gray(`      Element: ${issue.selector}`));
            });
            // Show one recommendation for all visibility issues
            console.log(chalk.cyan(`\n      💡 Recommendation:`));
            console.log(chalk.cyan(`         → Close modals/drawers before clicking`));
            console.log(chalk.cyan(`         → Wait for animations to complete`));
            console.log(chalk.cyan(`         → Check z-index layering`));
            console.log(chalk.dim(`         → Use cy.wait() for dynamic content`));
        }

        // Display performance issues
        if (suiteIssues.performance.length > 0) {
            console.log(chalk.blue.bold(`\n   ⏱️  Performance Issues (${suiteIssues.performance.length})`));
            suiteIssues.performance.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Type: ${issue.type}`));
                if (issue.timeout) console.log(chalk.gray(`      Timeout: ${issue.timeout}ms`));
            });
            // Show one recommendation for all performance issues
            console.log(chalk.cyan(`\n      💡 Recommendation:`));
            console.log(chalk.cyan(`         → Increase timeout for slow AI responses`));
            console.log(chalk.cyan(`         → Check network connectivity`));
            console.log(chalk.cyan(`         → Verify backend service is responding`));
            console.log(chalk.dim(`         → Consider using cy.intercept() to mock slow requests`));
        }

        // Display other issues
        if (suiteIssues.other.length > 0) {
            console.log(chalk.blue.bold(`\n   ℹ️  Other Issues (${suiteIssues.other.length})`));
            suiteIssues.other.forEach(issue => {
                console.log(chalk.yellow(`\n      Test: "${issue.test}"`));
                console.log(chalk.gray(`      Type: ${issue.type}`));
                console.log(chalk.cyan(`      💡 ${issue.recommendation}`));
            });
        }
    });

    console.log();
}


// Run the script
main();

