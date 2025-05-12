/**
 * React Email Renderer
 * 
 * This module provides utilities to render React Email components to HTML
 * for use with our consolidated email system.
 */

import { render } from '@react-email/render';

/**
 * Renders a React Email component to HTML
 * 
 * @param {React.Component} Component - The React Email component to render
 * @param {Object} props - Props to pass to the component
 * @returns {string} HTML string of the rendered email
 */
export function renderReactEmailToHtml(Component, props) {
  try {
    // Render the React Email component to HTML
    return render(Component(props));
  } catch (error) {
    console.error('Error rendering React Email component:', error);
    throw error;
  }
}

/**
 * Creates an email template from a React Email component
 * for use with the emailTemplates system
 * 
 * @param {React.Component} Component - The React Email component
 * @param {Function} subjectFn - Function that takes props and returns the subject line
 * @returns {Function} A template function compatible with emailTemplates
 */
export function createTemplateFromReactEmail(Component, subjectFn) {
  return (data) => {
    const html = renderReactEmailToHtml(Component, data);
    const subject = subjectFn(data);
    
    return {
      subject,
      html
    };
  };
}

/**
 * Wraps a React Email component in a standard template
 * that can be used with the emailService
 */
export function createEmailServiceTemplate(Component, options = {}) {
  const { 
    getSubject = (data) => options.subject || 'Viva Pharmacy',
    getPreheader = (data) => ''
  } = options;
  
  return (data) => {
    const html = renderReactEmailToHtml(Component, data);
    const subject = getSubject(data);
    
    return {
      subject,
      html
    };
  };
} 