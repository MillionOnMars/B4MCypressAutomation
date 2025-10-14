# Selector Quality Tracking Guide

## Overview

The Selector Quality Tracker automatically monitors test failures and identifies UI elements that lack proper test identifiers or accessibility attributes. This helps improve both test reliability and application accessibility.

## What It Tracks

### 1. **Fragile CSS Selectors** 🔴 High Severity
Elements identified by complex CSS class chains that are likely to break with UI updates.

**Example:**
```
<button.MuiButton-root.MuiButton-fullWidth.MuiButton-variantPlain.MuiButton-colorPrimary.MuiButton-sizeMd.css-o64qwn>
```

**Problem:** CSS classes (especially MUI generated classes like `css-o64qwn`) change frequently and make tests brittle.

**Solution:** Add a `data-testid` attribute:
```jsx
<button 
  data-testid="create-notebook-button"
  className="MuiButton-root MuiButton-fullWidth..."
>
  Create Notebook
</button>
```

### 2. **Missing Test IDs** 🟡 Medium Severity
Elements selected by class names without semantic identifiers.

**Example:**
```
.project-system-prompt-item-view-button
```

**Problem:** While better than generated classes, these can still change and lack semantic meaning.

**Solution:** Add `data-testid`:
```jsx
<button 
  data-testid="system-prompt-view-button"
  className="project-system-prompt-item-view-button"
>
  View
</button>
```

### 3. **Missing Aria Labels** 🟡 Medium Severity
Interactive elements that are covered by other elements or lack accessibility attributes.

**Problem:** Elements that are hard to target in tests are also hard for screen readers to identify.

**Solution:** Add descriptive `aria-label`:
```jsx
<button 
  data-testid="close-modal-button"
  aria-label="Close system prompt modal"
  className="MuiModalClose-sizeMd"
>
  ×
</button>
```

## Report Structure

The `testQuality.json` file contains:

```json
{
  "lastUpdate": "2025-10-13T10:30:00.000Z",
  "totalIssues": 15,
  "summary": {
    "fragileSelectors": 8,
    "missingTestIds": 5,
    "missingAriaLabels": 2
  },
  "issues": [
    {
      "type": "Fragile CSS Selector",
      "severity": "high",
      "selector": "<button.MuiButton-root...>",
      "recommendation": "Use data-testid or aria-label for <button> element",
      "element": "button",
      "test": "Create notebook",
      "suite": "Project Operations",
      "timestamp": "2025-10-13T10:30:00.000Z"
    }
  ]
}
```

## How to Fix Issues

### Priority Order
1. **High severity (fragile selectors)** - Fix these first as they're most likely to break
2. **Medium severity (missing test IDs)** - Improve test reliability
3. **Medium severity (missing aria labels)** - Enhance accessibility

### Best Practices

#### 1. Use `data-testid` for Test-Specific Selectors
```jsx
// ❌ Bad
<button className="submit-button">Submit</button>
cy.get('.submit-button').click();

// ✅ Good
<button data-testid="submit-button">Submit</button>
cy.get('[data-testid="submit-button"]').click();
```

#### 2. Use `aria-label` for Accessibility and Testing
```jsx
// ❌ Bad
<button>
  <CloseIcon />
</button>

// ✅ Good
<button aria-label="Close dialog">
  <CloseIcon />
</button>
cy.get('[aria-label="Close dialog"]').click();
```

#### 3. Combine Both for Maximum Clarity
```jsx
// ✅ Best
<button 
  data-testid="delete-project-button"
  aria-label="Delete project: My Project"
>
  Delete
</button>
```

#### 4. Use Semantic HTML
```jsx
// ❌ Avoid
<div onClick={handleSubmit}>Submit</div>

// ✅ Better
<button onClick={handleSubmit}>Submit</button>
```

## Naming Conventions

### `data-testid` Format
Use kebab-case with descriptive, action-oriented names:
- `create-notebook-button`
- `project-settings-modal`
- `system-prompt-menu-item`
- `user-profile-dropdown`

### `aria-label` Format
Use clear, descriptive phrases that explain the element's purpose:
- `"Create new notebook"`
- `"Open project settings"`
- `"View system prompt details"`
- `"Delete prompt: sinigang"`

## GitHub Actions Integration

### Slack Notifications
The workflow automatically reports selector quality issues:

**In main test summary:**
```
🔍 Selector Quality Issues: 15 found
  • Fragile selectors: 8
  • Missing test IDs: 5
  • Missing aria labels: 2
```

**Separate alert (when > 5 issues):**
```
🔍 Found 15 selector quality issues!
• Fragile selectors: 8
• Missing test IDs: 5
• Missing aria labels: 2

These elements need data-testid or aria-label attributes for better test reliability.
```

### Artifacts
The `testQuality.json` report is uploaded with each test run and retained for 14 days.

## Example Fixes for Your Current Issues

Based on the errors you provided:

### Issue 1: Create Notebook Button
```jsx
// Current (fragile)
<button className="MuiButton-root MuiButton-fullWidth...">
  Create Notebook
</button>

// Fixed
<button 
  data-testid="create-notebook-button"
  aria-label="Create new notebook"
  className="MuiButton-root MuiButton-fullWidth..."
>
  Create Notebook
</button>
```

### Issue 2: Project System Prompt View Button
```jsx
// Current
<button className="project-system-prompt-item-view-button">
  View
</button>

// Fixed
<button 
  data-testid="view-system-prompt-button"
  aria-label="View system prompt"
  className="project-system-prompt-item-view-button"
>
  View
</button>
```

### Issue 3: System Prompt Menu Button
```jsx
// Current
<button className="project-system-prompt-item-menu-button">
  ⋮
</button>

// Fixed
<button 
  data-testid="system-prompt-menu-button"
  aria-label="Open system prompt menu"
  className="project-system-prompt-item-menu-button"
>
  ⋮
</button>
```

## Benefits

1. **More Reliable Tests** - Tests won't break when CSS changes
2. **Better Accessibility** - Aria labels help screen reader users
3. **Easier Debugging** - Clear selectors make tests easier to understand
4. **Self-Documenting Code** - Good attribute names explain UI purpose
5. **Faster Development** - Developers can easily find the right selectors

## Questions?

For more information, see:
- [Cypress Best Practices - Selecting Elements](https://docs.cypress.io/guides/references/best-practices#Selecting-Elements)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Testing Library - Priority](https://testing-library.com/docs/queries/about/#priority)

