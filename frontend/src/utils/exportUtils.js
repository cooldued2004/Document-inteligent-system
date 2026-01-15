/**
 * Export Utilities - Handle multiple export formats
 */

export const exportToJSON = (data, filename = 'extracted_data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
};

export const exportToCSV = (data, filename = 'extracted_data.csv') => {
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Get all unique entity types
  const entityTypes = Object.keys(data);
  
  // Create header
  csvContent += entityTypes.join(',') + '\n';
  
  // Get max length to determine rows
  const maxLength = Math.max(...entityTypes.map(type => (data[type] || []).length));
  
  // Create rows
  for (let i = 0; i < maxLength; i++) {
    const row = entityTypes.map(type => {
      const value = (data[type] || [])[i] || '';
      // Escape quotes in CSV
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvContent += row.join(',') + '\n';
  }
  
  const blob = new Blob([decodeURIComponent(csvContent.substring(17))], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

export const exportToXML = (data, filename = 'extracted_data.xml') => {
  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<extraction>\n';
  
  Object.entries(data).forEach(([key, values]) => {
    if (values && values.length > 0) {
      xmlContent += `  <${key}>\n`;
      values.forEach(value => {
        const escaped = String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        xmlContent += `    <item>${escaped}</item>\n`;
      });
      xmlContent += `  </${key}>\n`;
    }
  });
  
  xmlContent += '</extraction>';
  
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  downloadBlob(blob, filename);
};

export const exportToPlainText = (data, filename = 'extracted_data.txt') => {
  let textContent = 'EXTRACTED DOCUMENT INFORMATION\n';
  textContent += '='.repeat(50) + '\n\n';
  
  Object.entries(data).forEach(([key, values]) => {
    if (values && values.length > 0) {
      const label = key.replace(/_/g, ' ').toUpperCase();
      textContent += `${label}:\n`;
      values.forEach(value => {
        textContent += `  - ${value}\n`;
      });
      textContent += '\n';
    }
  });
  
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, filename);
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
