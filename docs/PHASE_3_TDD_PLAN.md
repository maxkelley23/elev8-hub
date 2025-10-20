# PHASE 3 - UI Components with TDD
## Complete Implementation Plan for Voice Assistant Builder Wizard

**Status**: Foundation Complete ✅
**Current Phase**: 3.2 - Step Components
**Last Updated**: 2025-10-20

---

## Table of Contents
1. [Overview](#overview)
2. [TDD Process](#tdd-process)
3. [Phase 3.1 - Hook (COMPLETE)](#phase-31---hook-complete)
4. [Phase 3.2 - Step Components](#phase-32---step-components)
5. [Phase 3.3 - Preview Panels](#phase-33---preview-panels)
6. [Phase 3.4 - Orchestration](#phase-34---orchestration)
7. [Testing Strategy](#testing-strategy)
8. [Commit Convention](#commit-convention)

---

## Overview

### Architecture
```
useAssistantWizard Hook (State Management)
├── formData (AssistantBuilderInput)
├── currentStep (6 steps)
├── validationErrors (per-step)
├── livePreview (prompt + config)
└── Actions (updateField, navigate, validate)
        ↓
        6 Step Components
        ├── StepBasics
        ├── StepCapabilities
        ├── StepCompliance
        ├── StepPersona
        ├── StepKnowledge
        └── StepPreview
        ↓
        Preview Panels (read-only)
        ├── PromptPreview
        └── ConfigPreview
        ↓
        Main Orchestrator
        ├── WizardStepper (navigation)
        ├── Step Navigation Buttons
        └── Layout
```

### Step Flow
```
basics → capabilities → compliance → persona → knowledge → preview
```

### Validation Requirements

| Step | Required Fields | Rules |
|------|----------------|-------|
| **basics** | company.name | Must not be empty |
| **capabilities** | At least one | Tools OR small talk OR email collection |
| **compliance** | disclosures | At least one disclosure required |
| **persona** | language | At least one language selected |
| **knowledge** | FAQs (if any) | Questions and answers must both exist |
| **preview** | prompt | Must generate valid prompt |

---

## TDD Process

### Red-Green-Refactor Cycle

For **EACH** component/test:

```
1. RED: Write failing test
   ✗ Test fails

2. GREEN: Implement minimal code
   ✓ Test passes

3. REFACTOR: Clean up, optimize
   ✓ Test still passes

4. COMMIT: Atomic git commit
   → git commit -m "..."
```

### Example Full Cycle

```typescript
// Step 1: RED - Write failing test
describe('StepBasics', () => {
  it('should render company name input', () => {
    const { getByLabelText } = render(
      <StepBasics
        data={{ name: '', industry: '', valueProposition: '', mission: '' }}
        onChange={vi.fn()}
        errors={{}}
      />
    );
    expect(getByLabelText(/company name/i)).toBeInTheDocument();
  });
});
// ✗ FAILS - Component doesn't exist

// Step 2: GREEN - Implement minimal code
export function StepBasics({ data, onChange, errors }) {
  return (
    <input
      aria-label="Company Name"
      value={data.name}
      onChange={(e) => onChange('company.name', e.target.value)}
    />
  );
}
// ✓ PASSES

// Step 3: REFACTOR - Add features, clean up
export function StepBasics({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <label htmlFor="company-name">Company Name *</label>
      <input
        id="company-name"
        value={data.name}
        onChange={(e) => onChange('company.name', e.target.value)}
        placeholder="Your Company Name"
      />
      {errors.name && <ErrorMessage>{errors.name[0]}</ErrorMessage>}
    </div>
  );
}
// ✓ PASSES

// Step 4: COMMIT
// git commit -m "feat: Implement StepBasics company name field with validation"
```

---

## PHASE 3.1 - Hook (COMPLETE) ✅

### Status
- ✅ State management implemented
- ✅ Form data with nested updates
- ✅ Per-step validation (all 6 steps)
- ✅ localStorage persistence
- ✅ Live preview generation
- ✅ All 5 Code Rabbit issues fixed

### Key Features
```typescript
const wizard = useAssistantWizard();

// State
wizard.currentStep        // 'basics' | 'capabilities' | ...
wizard.completedSteps    // ['basics', 'capabilities']
wizard.formData          // AssistantBuilderInput
wizard.isDirty           // boolean
wizard.isHydrated        // boolean (localStorage loaded)
wizard.validationErrors  // { [step]: [errors] }
wizard.livePreview       // { prompt, config }

// Actions
wizard.updateField('company.name', 'TestCo')
wizard.goToNextStep()
wizard.goToPreviousStep()
wizard.goToStep('compliance')
wizard.validateStep('basics')    // true/false
wizard.resetForm()
wizard.clearDraft()
wizard.exportConfig()             // { builderInput, generatedPrompt, vapiConfig, exportedAt }
wizard.isComplete()              // boolean
wizard.getProgressPercentage()   // 0-100
```

### Location
- Implementation: `src/hooks/useAssistantWizard.ts`
- Export: Re-exported from `src/hooks/index.ts`

---

## PHASE 3.2 - Step Components

### Directory Structure
```
src/components/assistants/
├── wizard/
│   ├── StepBasics.tsx
│   ├── StepCapabilities.tsx
│   ├── StepCompliance.tsx
│   ├── StepPersona.tsx
│   ├── StepKnowledge.tsx
│   ├── StepPreview.tsx
│   ├── WizardStepper.tsx
│   └── __tests__/
│       ├── StepBasics.test.tsx
│       ├── StepCapabilities.test.tsx
│       ├── ...
│       └── WizardStepper.test.tsx
└── AssistantWizard.tsx
```

### Implementation Order
1. **StepBasics** (✓ START HERE)
2. **StepCapabilities**
3. **StepCompliance**
4. **StepPersona**
5. **StepKnowledge**
6. **StepPreview**
7. **WizardStepper**

---

### 3.2.1 - StepBasics Component

**Purpose**: Collect company information (name, industry, value proposition, mission)

**Props Interface**
```typescript
interface StepBasicsProps {
  data: {
    name: string;
    industry: string;
    valueProposition: string;
    mission: string;
  };
  onChange: (path: string, value: string) => void;
  errors: Record<string, string[]>;
}
```

**TDD Tests**
```typescript
describe('StepBasics', () => {
  describe('Rendering', () => {
    it('should render all four input fields', () => {...});
    it('should render required asterisk on company name', () => {...});
    it('should have proper labels for accessibility', () => {...});
  });

  describe('Form Interaction', () => {
    it('should update company name onChange', () => {...});
    it('should update industry onChange', () => {...});
    it('should update valueProposition onChange', () => {...});
    it('should update mission onChange', () => {...});
  });

  describe('Validation & Errors', () => {
    it('should display company name error when provided', () => {...});
    it('should display validation errors for other fields', () => {...});
    it('should style input as error when errors exist', () => {...});
  });

  describe('Helpers & UX', () => {
    it('should show character counter for value proposition', () => {...});
    it('should show max-length warning when approaching limit', () => {...});
    it('should have helpful placeholder text', () => {...});
  });
});
```

**Implementation Checklist**
- [ ] Create `src/components/assistants/wizard/StepBasics.tsx`
- [ ] Create `src/components/assistants/wizard/__tests__/StepBasics.test.tsx`
- [ ] Write all failing tests (RED)
- [ ] Implement component (GREEN)
- [ ] Refactor for clarity (REFACTOR)
- [ ] All tests pass ✓
- [ ] Commit with message

**Expected Line Count**: 80-120 lines (component + tests combined)

---

### 3.2.2 - StepCapabilities Component

**Purpose**: Configure what the assistant can do (tools, small talk, email collection)

**Props Interface**
```typescript
interface StepCapabilitiesProps {
  data: {
    tools: Array<{ name: string; description: string; parameters: any }>;
    allowSmallTalk: boolean;
    collectEmail: boolean;
  };
  onChange: (path: string, value: any) => void;
  onAddTool?: (tool: Tool) => void;
  errors: Record<string, string[]>;
}
```

**TDD Tests**
```typescript
describe('StepCapabilities', () => {
  describe('Small Talk Toggle', () => {
    it('should render small talk toggle', () => {...});
    it('should call onChange when toggled', () => {...});
  });

  describe('Email Collection Toggle', () => {
    it('should render email collection toggle', () => {...});
    it('should call onChange when toggled', () => {...});
  });

  describe('Tools Section', () => {
    it('should render tools list', () => {...});
    it('should render add tool button', () => {...});
    it('should remove tool when delete clicked', () => {...});
  });

  describe('Validation', () => {
    it('should show error if no capabilities enabled', () => {...});
  });
});
```

**Implementation Checklist**
- [ ] Create component file
- [ ] Create test file
- [ ] Implement toggles for small talk and email
- [ ] Implement tools list with add/remove
- [ ] Add custom tool modal (optional for MVP)
- [ ] All tests pass ✓
- [ ] Commit

---

### 3.2.3 - StepCompliance Component

**Purpose**: Set compliance rules (disclosures, forbidden topics, escalation)

**Props Interface**
```typescript
interface StepComplianceProps {
  data: {
    disclosures: string[];
    forbiddenTopics: string[];
    escalationTriggers: string[];
    handoffInstructions: string;
    safetyGuidelines: string;
  };
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}
```

**TDD Tests**
```typescript
describe('StepCompliance', () => {
  describe('Disclosures Array', () => {
    it('should render disclosures list', () => {...});
    it('should add disclosure when button clicked', () => {...});
    it('should remove disclosure when delete clicked', () => {...});
  });

  describe('Forbidden Topics Array', () => {
    it('should add/remove forbidden topics', () => {...});
  });

  describe('Escalation Triggers Array', () => {
    it('should add/remove escalation triggers', () => {...});
  });

  describe('Textareas', () => {
    it('should render handoff instructions textarea', () => {...});
    it('should render safety guidelines textarea', () => {...});
  });

  describe('Validation', () => {
    it('should show error if no disclosures', () => {...});
  });
});
```

**Reusable Component**: Create `ArrayFieldEditor` component for add/remove list items

**Implementation Checklist**
- [ ] Create `ArrayFieldEditor` helper component
- [ ] Create `StepCompliance.tsx`
- [ ] Create tests
- [ ] Implement all fields
- [ ] All tests pass ✓
- [ ] Commit

---

### 3.2.4 - StepPersona Component

**Purpose**: Configure voice personality (tone, energy, pacing, language)

**Props Interface**
```typescript
interface StepPersonaProps {
  data: {
    voice: 'confident_warm' | 'friendly_casual' | 'professional_formal' | 'supportive_compassionate';
    energy: 'low' | 'medium' | 'high';
    pacing: 'slow' | 'moderate' | 'fast';
    language: string[];
    fillerPreference: 'none' | 'brief' | 'detailed';
  };
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}
```

**TDD Tests**
```typescript
describe('StepPersona', () => {
  describe('Voice Selector', () => {
    it('should render 4 voice options', () => {...});
    it('should select voice on click', () => {...});
  });

  describe('Energy Selector', () => {
    it('should render 3 energy options', () => {...});
  });

  describe('Pacing Selector', () => {
    it('should render 3 pacing options', () => {...});
  });

  describe('Language Multi-Select', () => {
    it('should render language options', () => {...});
    it('should add language when selected', () => {...});
    it('should remove language when deselected', () => {...});
  });

  describe('Filler Preference', () => {
    it('should render 3 filler options', () => {...});
  });

  describe('Validation', () => {
    it('should show error if no languages selected', () => {...});
  });
});
```

**Implementation Checklist**
- [ ] Create component
- [ ] Create tests
- [ ] Implement all selectors
- [ ] Multi-language support
- [ ] All tests pass ✓
- [ ] Commit

---

### 3.2.5 - StepKnowledge Component

**Purpose**: Add FAQs, objection handling, and policies

**Props Interface**
```typescript
interface StepKnowledgeProps {
  data: {
    faqs: Array<{ question: string; answer: string }>;
    objectionHandling: Array<{ objection: string; response: string }>;
    policies: string[];
  };
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}
```

**TDD Tests**
```typescript
describe('StepKnowledge', () => {
  describe('FAQs', () => {
    it('should render FAQs list', () => {...});
    it('should add FAQ when button clicked', () => {...});
    it('should update question and answer', () => {...});
    it('should remove FAQ', () => {...});
  });

  describe('Objection Handling', () => {
    it('should add/update/remove objections', () => {...});
  });

  describe('Policies', () => {
    it('should add/remove policies', () => {...});
  });

  describe('Validation', () => {
    it('should show error if FAQ missing question or answer', () => {...});
  });
});
```

**Implementation Checklist**
- [ ] Create component
- [ ] Create tests
- [ ] Implement Q&A pair editor
- [ ] Implement policies list
- [ ] All tests pass ✓
- [ ] Commit

---

### 3.2.6 - StepPreview Component

**Purpose**: Show final preview (read-only) of all settings

**Props Interface**
```typescript
interface StepPreviewProps {
  data: AssistantBuilderInput;
  livePreview: {
    prompt: string;
    config: VapiAssistantCreatePayload;
  };
}
```

**TDD Tests**
```typescript
describe('StepPreview', () => {
  describe('Summary Section', () => {
    it('should show company name', () => {...});
    it('should show objective', () => {...});
    it('should show key settings', () => {...});
  });

  describe('Prompt Preview', () => {
    it('should render prompt in read-only format', () => {...});
  });

  describe('Config Preview', () => {
    it('should render config in JSON format', () => {...});
  });
});
```

**Implementation Checklist**
- [ ] Create component
- [ ] Create tests
- [ ] Display all key settings
- [ ] Show generated prompt
- [ ] Show generated config
- [ ] All tests pass ✓
- [ ] Commit

---

### 3.2.7 - WizardStepper Component

**Purpose**: Visual navigation showing all 6 steps and current progress

**Props Interface**
```typescript
interface WizardStepperProps {
  currentStep: AssistantWizardStep;
  completedSteps: AssistantWizardStep[];
  onStepClick: (step: AssistantWizardStep) => void;
}
```

**TDD Tests**
```typescript
describe('WizardStepper', () => {
  it('should render all 6 steps', () => {...});
  it('should highlight current step', () => {...});
  it('should show checkmark on completed steps', () => {...});
  it('should disable future steps', () => {...});
  it('should call onStepClick when completed step clicked', () => {...});
  it('should not allow clicking future steps', () => {...});
});
```

**Implementation Checklist**
- [ ] Create component
- [ ] Create tests
- [ ] Visual styling (highlight, checkmark, disabled)
- [ ] Click handlers
- [ ] All tests pass ✓
- [ ] Commit

---

## PHASE 3.3 - Preview Panels

### 3.3.1 - PromptPreview Component

**Location**: `src/components/assistants/preview/PromptPreview.tsx`

**Purpose**: Display generated system prompt with copy/download

**Features**
- [ ] Monospace font display
- [ ] Character count + token estimate
- [ ] Copy button with confirmation
- [ ] Download as text file
- [ ] Warning if > 8000 chars

**Tests**
```typescript
describe('PromptPreview', () => {
  it('should render prompt in monospace', () => {...});
  it('should show character and token count', () => {...});
  it('should copy to clipboard', () => {...});
  it('should show "copied" confirmation', () => {...});
  it('should have download button', () => {...});
  it('should warn if > 8000 chars', () => {...});
});
```

**Implementation Checklist**
- [ ] Create component
- [ ] Create tests
- [ ] Implement all features
- [ ] All tests pass ✓
- [ ] Commit

---

### 3.3.2 - ConfigPreview Component

**Location**: `src/components/assistants/preview/ConfigPreview.tsx`

**Purpose**: Display Vapi config JSON with validation status

**Features**
- [ ] JSON syntax highlighting
- [ ] Validation status (valid/invalid)
- [ ] Copy button
- [ ] Download as JSON file
- [ ] Collapsible sections
- [ ] Error messages if invalid

**Tests**
```typescript
describe('ConfigPreview', () => {
  it('should render JSON with syntax highlighting', () => {...});
  it('should show validation status', () => {...});
  it('should show copy button', () => {...});
  it('should have download button', () => {...});
  it('should show error if invalid', () => {...});
});
```

**Implementation Checklist**
- [ ] Create component
- [ ] Create tests
- [ ] Syntax highlighting (use simple CSS or library)
- [ ] Validation feedback
- [ ] All tests pass ✓
- [ ] Commit

---

## PHASE 3.4 - Orchestration

### 3.4.1 - Update Wizard Page

**Location**: `src/app/assistants/new/page.tsx`

**Changes**
- [ ] Import hook
- [ ] Check `isHydrated` before rendering (prevent flicker)
- [ ] Show loading skeleton if not hydrated
- [ ] Render correct step component based on `currentStep`
- [ ] Show navigation buttons
- [ ] Update button text on final step ("Complete" instead of "Next")
- [ ] Add progress indicator

**Code Structure**
```typescript
'use client';

import { useAssistantWizard } from '@/hooks/useAssistantWizard';
import { StepBasics, StepCapabilities, /* ... */ } from '@/components/assistants/wizard';
import { PromptPreview, ConfigPreview } from '@/components/assistants/preview';

export default function AssistantWizardPage() {
  const wizard = useAssistantWizard();

  if (!wizard.isHydrated) {
    return <WizardSkeleton />; // Prevent render flicker
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Wizard Steps */}
      <div className="lg:col-span-2">
        <WizardStepper {...wizard} />

        {wizard.currentStep === 'basics' && (
          <StepBasics
            data={wizard.formData.company}
            onChange={wizard.updateField}
            errors={wizard.validationErrors}
          />
        )}

        {/* Repeat for all steps */}

        <Navigation wizard={wizard} />
      </div>

      {/* Right: Live Preview (Sticky) */}
      <div className="sticky top-20 space-y-4">
        <PromptPreview prompt={wizard.livePreview.prompt} />
        <ConfigPreview config={wizard.livePreview.config} />
      </div>
    </div>
  );
}
```

---

### 3.4.2 - Navigation Component

**Purpose**: Previous/Next buttons with smart behavior

**Features**
- [ ] "Previous" button (disabled on basics)
- [ ] "Next" button (disabled on preview, shows "Complete")
- [ ] Validation feedback
- [ ] Progress indicator

---

### 3.4.3 - Wizard Layout Component

**Purpose**: Shared layout for all wizard pages

**Features**
- [ ] Header with title/description
- [ ] Breadcrumbs (optional)
- [ ] Help/docs sidebar link

---

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock props and callbacks
- Test state transitions
- Test error states

### Integration Tests
- Test full wizard flow (basics → preview)
- Test form persistence
- Test validation prevents progression
- Test live preview updates

### Coverage Goals
- Unit tests: **90%+**
- Integration: **80%+**
- Overall: **85%+**

### Running Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/components/assistants/wizard/StepBasics.test.tsx

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

---

## Commit Convention

### Format
```
<type>: <description>

<details>

PHASE X.Y: <milestone>
```

### Types
- `feat`: New component/feature
- `fix`: Bug fix
- `refactor`: Code cleanup
- `test`: Test additions

### Examples
```bash
feat: Implement StepBasics component with validation

- Company name, industry, value prop, mission fields
- Character counter for value prop
- Validation error display
- 8 test cases all passing

PHASE 3.2.1: Complete

git commit -m "..."
```

```bash
refactor: Extract ArrayFieldEditor helper component

- Reusable for StepCompliance, StepKnowledge
- Cleaner add/remove list UX
- All existing tests still pass

PHASE 3.2: Ongoing
```

---

## Progress Tracker

### PHASE 3.1 ✅
- [x] useAssistantWizard hook
- [x] Per-step validation (all 6 steps)
- [x] localStorage persistence
- [x] Live preview generation
- [x] Fix all Code Rabbit issues

### PHASE 3.2 (IN PROGRESS)
- [ ] StepBasics
- [ ] StepCapabilities
- [ ] StepCompliance
- [ ] StepPersona
- [ ] StepKnowledge
- [ ] StepPreview
- [ ] WizardStepper

### PHASE 3.3 (PENDING)
- [ ] PromptPreview
- [ ] ConfigPreview

### PHASE 3.4 (PENDING)
- [ ] Update wizard page
- [ ] Navigation component
- [ ] Wizard layout

---

## Quick Reference

### File Structure to Create
```
src/components/assistants/
├── wizard/
│   ├── StepBasics.tsx
│   ├── StepCapabilities.tsx
│   ├── StepCompliance.tsx
│   ├── StepPersona.tsx
│   ├── StepKnowledge.tsx
│   ├── StepPreview.tsx
│   ├── WizardStepper.tsx
│   ├── Navigation.tsx
│   └── __tests__/
│       ├── StepBasics.test.tsx
│       ├── StepCapabilities.test.tsx
│       ├── StepCompliance.test.tsx
│       ├── StepPersona.test.tsx
│       ├── StepKnowledge.test.tsx
│       ├── StepPreview.test.tsx
│       └── WizardStepper.test.tsx
├── preview/
│   ├── PromptPreview.tsx
│   ├── ConfigPreview.tsx
│   └── __tests__/
│       ├── PromptPreview.test.tsx
│       └── ConfigPreview.test.tsx
└── AssistantWizard.tsx

src/hooks/
├── useAssistantWizard.ts (DONE ✅)
└── index.ts (export)
```

### Key Props Pattern
```typescript
interface StepProps {
  data: /* relevant part of AssistantBuilderInput */;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}
```

### Test Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepBasics } from '../StepBasics';

describe('StepBasics', () => {
  it('should do X', () => {
    const mockOnChange = vi.fn();
    render(
      <StepBasics
        data={{ name: '', industry: '', valueProposition: '', mission: '' }}
        onChange={mockOnChange}
        errors={{}}
      />
    );

    // Test here
    expect(mockOnChange).toHaveBeenCalledWith('company.name', 'value');
  });
});
```

---

## Key Reminders

✅ **TDD First**: Write test, watch fail, implement, pass, refactor
✅ **Atomic Commits**: One feature per commit
✅ **Test Coverage**: Aim for 90%+
✅ **isHydrated Check**: Always prevent render flicker
✅ **Safe Updates**: Use createEmptyVapiConfig() pattern
✅ **Validation**: All 6 steps have validation
✅ **Props Consistency**: All steps follow same pattern

---

## Next Steps

1. **START HERE**: Implement `StepBasics` using TDD
   - Write tests first
   - Implement minimal component
   - Refactor for clarity
   - Commit

2. **Then**: Build remaining step components (follow same pattern)

3. **Finally**: Wire up preview panels and orchestrator

---

**Happy coding!** 🚀
Follow the TDD process strictly - it will ensure quality and prevent bugs.
