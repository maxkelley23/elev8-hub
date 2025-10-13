/**
 * Campaign Export Utilities
 *
 * Exports campaigns to various formats:
 * - Instantly.ai CSV
 * - LinkedIn CSV
 * - JSON backup
 */

import type { CampaignPlan, CampaignMessage } from '@/types/campaign';

// =====================================================
// INSTANTLY.AI CSV EXPORT
// =====================================================

/**
 * Generate Instantly.ai compatible CSV
 * Format: firstName, email, companyName, step1_subject, step1_body, step2_subject, etc.
 */
export function generateInstantlyCSV(messages: CampaignMessage[]): string {
  // Filter only email messages
  const emailMessages = messages.filter(m => m.channel === 'email');

  // Build header row
  const headers = ['firstName', 'email', 'companyName'];

  emailMessages.forEach((msg, index) => {
    const stepNum = index + 1;
    headers.push(`step${stepNum}_subject`);
    headers.push(`step${stepNum}_body`);
  });

  // Build example data row with variable placeholders
  const exampleRow = [
    '{{recipient.f_name}}',
    '{{recipient.email}}',
    '{{company.name}}',
  ];

  emailMessages.forEach((msg) => {
    // Use subjectA as the primary subject
    exampleRow.push(msg.subjectA || '');
    exampleRow.push(msg.body);
  });

  // Convert to CSV
  const csvRows = [
    headers.join(','),
    exampleRow.map(field => `"${field.replace(/"/g, '""')}"`).join(','),
  ];

  return csvRows.join('\n');
}

// =====================================================
// LINKEDIN CSV EXPORT
// =====================================================

/**
 * Generate LinkedIn Sales Navigator / Expandi compatible CSV
 * Format: profileUrl, firstName, lastName, companyName, message1, delay1, message2, delay2, etc.
 */
export function generateLinkedInCSV(
  messages: CampaignMessage[],
  plan: CampaignPlan
): string {
  // Filter only LinkedIn messages
  const linkedInMessages = messages.filter(m => m.channel === 'linkedin');

  if (linkedInMessages.length === 0) {
    throw new Error('No LinkedIn messages found in campaign');
  }

  // Build header row
  const headers = ['profileUrl', 'firstName', 'lastName', 'companyName'];

  linkedInMessages.forEach((msg, index) => {
    const stepNum = index + 1;
    headers.push(`message${stepNum}`);
    headers.push(`delay${stepNum}`);
  });

  // Build example data row
  const exampleRow = [
    '{{recipient.linkedin_url}}',
    '{{recipient.f_name}}',
    '{{recipient.l_name}}',
    '{{company.name}}',
  ];

  linkedInMessages.forEach((msg) => {
    exampleRow.push(msg.body);
    // Find the delay from the plan
    const planStep = plan.steps.find(s => s.n === msg.step);
    exampleRow.push(planStep?.delay.toString() || '0');
  });

  // Convert to CSV
  const csvRows = [
    headers.join(','),
    exampleRow.map(field => `"${field.replace(/"/g, '""')}"`).join(','),
  ];

  return csvRows.join('\n');
}

// =====================================================
// JSON BACKUP EXPORT
// =====================================================

/**
 * Generate complete JSON backup of campaign
 */
export function generateJSONBackup(campaignData: {
  plan: CampaignPlan;
  messages: CampaignMessage[];
  intake?: any;
  metadata?: any;
}): string {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    campaign: campaignData,
  };

  return JSON.stringify(backup, null, 2);
}

// =====================================================
// DOWNLOAD HELPERS
// =====================================================

/**
 * Trigger browser download of a text file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${baseName}-${timestamp}.${extension}`;
}

// =====================================================
// EXPORT FORMAT VALIDATION
// =====================================================

/**
 * Validate that campaign has required fields for export
 */
export function validateForExport(messages: CampaignMessage[], format: 'instantly' | 'linkedin'): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (format === 'instantly') {
    const emailMessages = messages.filter(m => m.channel === 'email');

    if (emailMessages.length === 0) {
      errors.push('No email messages found in campaign');
    }

    emailMessages.forEach((msg, index) => {
      if (!msg.subjectA) {
        errors.push(`Step ${index + 1}: Missing subject line`);
      }
      if (!msg.body) {
        errors.push(`Step ${index + 1}: Missing email body`);
      }
    });
  }

  if (format === 'linkedin') {
    const linkedInMessages = messages.filter(m => m.channel === 'linkedin');

    if (linkedInMessages.length === 0) {
      errors.push('No LinkedIn messages found in campaign');
    }

    linkedInMessages.forEach((msg, index) => {
      if (!msg.body) {
        errors.push(`Step ${index + 1}: Missing message body`);
      }
      if (msg.body.length > 300) {
        errors.push(`Step ${index + 1}: Message exceeds 300 character limit (${msg.body.length} chars)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// VARIABLE EXTRACTION
// =====================================================

/**
 * Extract all variables used in campaign messages
 */
export function extractVariables(messages: CampaignMessage[]): string[] {
  const variableSet = new Set<string>();
  const variableRegex = /\{\{([^}]+)\}\}/g;

  messages.forEach((msg) => {
    const fields = [msg.subjectA, msg.subjectB, msg.preheader, msg.body, msg.smsBody];

    fields.forEach((field) => {
      if (field) {
        let match;
        while ((match = variableRegex.exec(field)) !== null) {
          variableSet.add(match[1].trim());
        }
      }
    });
  });

  return Array.from(variableSet).sort();
}
