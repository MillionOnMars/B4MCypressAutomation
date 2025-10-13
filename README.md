# B4M Cypress Automation Documentation

## Access link below:

https://docs.google.com/document/d/1XNTYcTEuANtSM--3GpszeGbDDyzmIvGqJX9gx1typ_o/edit?tab=t.0

---

![Cypress](https://img.shields.io/badge/Cypress-69D3A7?style=flat-square&logo=cypress&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

Comprehensive end-to-end test automation suite for Bike4Mind (B4M) platform using Cypress framework.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Reporting](#reporting)
- [CI/CD Integration](#cicd-integration)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🔍 Overview

This project provides automated testing for the Bike4Mind platform, covering critical user workflows including authentication, user registration, project management, notebook functionality, and prompt operations. The test suite is designed to run against both staging and production environments with comprehensive reporting and Slack integration.

## ✨ Features

- **Comprehensive Test Coverage**: Authentication, Signup, Projects, Notebooks, and Prompts
- **Multi-environment Support**: Staging and Production environments
- **Slack Integration**: Automated test result notifications
- **Visual Reports**: Mochawesome HTML reports with charts and embedded screenshots
- **Error Tracking**: Console error monitoring and reporting
- **Selector Quality Tracking**: Identifies missing test IDs, aria labels, and fragile selectors
- **CI/CD Ready**: GitHub Actions workflow included
- **Credits Monitoring**: Track usage credits across different models
- **Public Report Sharing**: Ngrok integration for temporary report hosting

## 🛠 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Chrome browser (for headless testing)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/MillionOnMars/B4MCypressAutomation.git
cd B4MCypressAutomation
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Configuration

### Environment Configuration

The test suite supports two environments:
- **Staging**: `https://app.staging.bike4mind.com/` (default)
- **Production**: `https://app.bike4mind.com/`

Set the environment using:
```bash
export CYPRESS_APP_URL=https://app.bike4mind.com/  # For production
```

### Test Data

Test fixtures are located in `cypress/fixtures/`:
- `accounts.json`: Test user credentials and signup data
- `prompts.json`: Test prompts and validation data
- `credits.json`: Credits tracking data

## 🚀 Running Tests

### Interactive Mode
```bash
npm run cypress:open
```

### Headless Mode
```bash
npm run cypress:run
```

### With Slack Notifications
```bash
npm run test:slack
```

This command will:
1. Clean previous reports
2. Run all test specs
3. Generate HTML reports
4. Send results to Slack with public report link

### Analyze Selector Quality
```bash
npm run analyze:selectors
```

This command analyzes your test failures and generates a report identifying:
- Fragile CSS selectors that may break with UI updates
- Elements missing `data-testid` attributes
- Interactive elements lacking `aria-label` for accessibility

### Individual Test Files
```bash
npx cypress run --spec "cypress/e2e/Auth.cy.js"
```

## 📁 Test Structure

```
cypress/
├── e2e/                    # Test specification files
│   ├── Auth.cy.js         # Authentication tests
│   ├── Signup.cy.js       # User registration tests
│   ├── Projects.cy.js     # Project management tests
│   ├── Notebook.cy.js     # Notebook functionality tests
│   └── Prompts.cy.js      # Prompt operations tests
├── fixtures/              # Test data
│   ├── accounts.json      # User credentials
│   ├── prompts.json       # Test prompts
│   └── credits.json       # Credits data
├── support/               # Support files and page objects
│   ├── Auth.js           # Authentication page object
│   ├── Signup.js         # Signup page object
│   ├── Projects.js       # Projects page object
│   ├── Notebook.js       # Notebook page object
│   ├── login.js          # Login utilities
│   ├── commands.js       # Custom commands
│   └── e2e.js           # Global configuration
└── reports/              # Generated test reports
```

### Test Specs Overview

| Test Suite | Description | Key Features |
|------------|-------------|--------------|
| **Auth.cy.js** | Authentication workflows | Login, logout, access control |
| **Signup.cy.js** | User registration | Account creation, validation |
| **Projects.cy.js** | Project management | Create, edit, delete projects |
| **Notebook.cy.js** | Notebook operations | Notebook creation, management |
| **Prompts.cy.js** | Prompt functionality | Prompt creation, validation |

## 📊 Reporting

### Report Generation
The test suite generates comprehensive reports using Mochawesome:
- HTML reports with interactive charts
- Embedded screenshots for failed tests
- JSON reports for CI/CD integration
- Test execution summaries

### Report Features
- **Test Results**: Pass/fail statistics by spec file
- **Credits Usage**: Model-specific credit consumption tracking
- **Error Logs**: Console error tracking and deduplication
- **Selector Quality**: Identifies UI elements needing better test attributes
- **Visual Evidence**: Screenshots and videos for failures
- **Public Sharing**: 1-hour accessible reports via Ngrok

### Selector Quality Tracking 🔍

The test suite automatically tracks selector quality issues when tests fail:

**Tracked Issues:**
- 🔴 **Fragile CSS Selectors**: Elements using complex MUI class chains
- 🟡 **Missing Test IDs**: Elements without `data-testid` attributes  
- 🟡 **Missing Aria Labels**: Interactive elements lacking accessibility attributes

**Report Location:** `cypress/reports/selectorQuality.json`

**View Detailed Report:**
```bash
npm run analyze:selectors
```

**Benefits:**
- Improves test reliability and reduces flakiness
- Enhances application accessibility
- Makes tests easier to maintain
- Self-documenting UI element purposes

**Documentation:** See `cypress/reports/SELECTOR_QUALITY_GUIDE.md` for detailed guidance on fixing selector quality issues.

### Slack Integration
Automated Slack notifications include:
- Test execution summary
- Credits usage breakdown
- Console error counts
- Selector quality issues summary
- Direct links to full HTML reports
- Real-time failure alerts

## 🔄 CI/CD Integration

### GitHub Actions
The project includes a GitHub Actions workflow (`.github/workflows/cypress.yml`) that:
- Runs tests on push and pull requests
- Supports multiple Node.js versions
- Caches dependencies for faster builds
- Generates and stores test artifacts

### Manual Workflow Trigger
Tests can be manually triggered via GitHub Actions interface with environment selection.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow existing code patterns and conventions
- Add meaningful test descriptions and comments
- Update documentation for new features
- Ensure tests pass before submitting PRs

## 🔧 Troubleshooting

### Common Issues

**Tests failing to start:**
- Verify Node.js version compatibility
- Clear `node_modules` and reinstall dependencies
- Check environment variable configuration

**Browser launch issues:**
- Ensure Chrome is installed and updated
- Check system permissions for browser access
- Try different browser options in cypress.config.js

**Report generation failures:**
- Verify write permissions for `cypress/reports/` directory
- Check available disk space
- Ensure all dependencies are properly installed

**Slack notifications not working:**
- Verify webhook URL configuration
- Check network connectivity
- Validate Slack channel permissions

### Debug Mode
Enable Cypress debug mode:
```bash
DEBUG=cypress:* npm run cypress:run
```

### Log Files
Check `cron.log` for scheduled execution logs and debugging information.

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Mochawesome Reporter](https://github.com/adamgruber/mochawesome)
- [Slack Webhook Integration](https://api.slack.com/messaging/webhooks)
- [Original Documentation](https://docs.google.com/document/d/1XNTYcTEuANtSM--3GpszeGbDDyzmIvGqJX9gx1typ_o/edit?tab=t.0)

---

**Repository**: [B4MCypressAutomation](https://github.com/MillionOnMars/B4MCypressAutomation)  
**Issues**: [Report Issues](https://github.com/MillionOnMars/B4MCypressAutomation/issues)