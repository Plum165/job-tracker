import * as XLSX from 'xlsx';
import {
  ApplicationStatus,
  EmploymentType,
  JobCategory,
  JobOpportunity,
  UserApplicationState,
  WorkArrangement,
} from '../types';

export interface ParsedExcelRow {
  raw: Record<string, unknown>;
  mapped: Partial<JobOpportunity>;
  initialStatus?: ApplicationStatus;
  initialNotes?: string;
  isValid: boolean;
  errorReason?: string;
}

/**
 * Smart column name matching helper
 */
function findHeaderValue(row: Record<string, unknown>, possibleHeaders: string[]): string {
  const keys = Object.keys(row);
  for (const possible of possibleHeaders) {
    const matchKey = keys.find(
      (k) => k.trim().toLowerCase() === possible.toLowerCase()
    );
    if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null) {
      return String(row[matchKey]).trim();
    }
  }
  return '';
}

/**
 * Parses an Excel (.xlsx / .xls) or CSV file into JobOpportunity candidate rows
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParsedExcelRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet contains no readable sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
  });

  if (!rawRows.length) {
    throw new Error('Spreadsheet is empty or has no data rows.');
  }

  const results: ParsedExcelRow[] = rawRows.map((row, index) => {
    const companyName = findHeaderValue(row, [
      'Company Name',
      'Company',
      'Employer',
      'Organization',
      'Firm',
    ]);
    const jobTitle = findHeaderValue(row, [
      'Job Title',
      'Title',
      'Position',
      'Role',
      'Job',
      'Opportunity',
    ]);
    const location =
      findHeaderValue(row, ['Location', 'City', 'Region', 'Country']) ||
      'South Africa / Remote';
    const closingDate =
      findHeaderValue(row, [
        'Closing Date',
        'Deadline',
        'Application Closing Date',
        'End Date',
        'Due Date',
        'Apply By',
      ]) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const applicationLink =
      findHeaderValue(row, [
        'Application Link',
        'Link',
        'URL',
        'Apply Link',
        'Job Link',
        'Website',
      ]) || 'https://google.com';

    const categoryRaw = findHeaderValue(row, [
      'Category',
      'Job Category',
      'Field',
      'Department',
      'Stream',
    ]);
    let category: JobCategory = 'Software Engineering';
    if (categoryRaw) {
      const lowerCat = categoryRaw.toLowerCase();
      if (lowerCat.includes('data')) category = 'Data Science';
      else if (lowerCat.includes('grad')) category = 'Graduate Programme';
      else if (lowerCat.includes('intern')) category = 'Internship';
      else if (lowerCat.includes('design') || lowerCat.includes('product'))
        category = 'Product & Design';
      else if (lowerCat.includes('fin') || lowerCat.includes('bank'))
        category = 'Finance & Fintech';
      else if (lowerCat.includes('sec') || lowerCat.includes('cyber'))
        category = 'Cybersecurity';
    }

    const arrangementRaw = findHeaderValue(row, [
      'Work Arrangement',
      'Arrangement',
      'Type',
      'Remote/Hybrid',
    ]);
    let workArrangement: WorkArrangement = 'Hybrid';
    if (arrangementRaw.toLowerCase().includes('remote')) workArrangement = 'Remote';
    else if (arrangementRaw.toLowerCase().includes('site')) workArrangement = 'On-site';

    const employmentRaw = findHeaderValue(row, [
      'Employment Type',
      'Role Type',
      'Contract Type',
    ]);
    let employmentType: EmploymentType = 'Graduate role';
    if (employmentRaw.toLowerCase().includes('intern')) employmentType = 'Internship';
    else if (employmentRaw.toLowerCase().includes('perm')) employmentType = 'Permanent';

    const description =
      findHeaderValue(row, ['Description', 'Company Description', 'Summary', 'Details']) ||
      `Opportunity at ${companyName || 'Company'}`;
      
    const statusRaw = findHeaderValue(row, ['Status', 'My Status', 'Application Status']);
    let initialStatus: ApplicationStatus | undefined;
    if (statusRaw) {
      const st = statusRaw.toLowerCase();
      if (st.includes('research')) initialStatus = ApplicationStatus.RESEARCHING;
      else if (st.includes('prep')) initialStatus = ApplicationStatus.PREPARING;
      else if (st.includes('applied') || st.includes('wait')) initialStatus = ApplicationStatus.APPLIED;
      else if (st.includes('interview')) initialStatus = ApplicationStatus.INTERVIEW;
      else if (st.includes('offer')) initialStatus = ApplicationStatus.OFFER;
      else if (st.includes('reject')) initialStatus = ApplicationStatus.REJECTED;
      else if (st.includes('close') || st.includes('miss')) initialStatus = ApplicationStatus.CLOSED;
      else if (st.includes('withdraw')) initialStatus = ApplicationStatus.WITHDRAWN;
      else initialStatus = ApplicationStatus.NOT_STARTED;
    }

    const initialNotes = findHeaderValue(row, ['Personal Notes', 'Notes', 'My Notes', 'Comments']);

    const tagsRaw = findHeaderValue(row, ['Tags', 'Keywords', 'Labels']);
    const tags = tagsRaw
      ? tagsRaw.split(/[,;]/).map((t) => t.trim())
      : ['Imported', companyName ? companyName.split(' ')[0] : 'Job'];

    const isValid = Boolean(companyName && jobTitle);
    const errorReason = !isValid
      ? `Row #${index + 2}: Missing mandatory ${!companyName ? 'Company Name' : 'Job Title'}`
      : undefined;

    const oppId = `imported-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`;

    return {
      raw: row,
      mapped: {
        id: oppId,
        companyName: companyName || 'Unknown Company',
        jobTitle: jobTitle || 'Job Opportunity',
        jobCategory: category,
        companyDescription: description,
        companyWebsite: applicationLink.startsWith('http') ? applicationLink : `https://${applicationLink}`,
        applicationLink: applicationLink.startsWith('http') ? applicationLink : `https://${applicationLink}`,
        location,
        workArrangement,
        employmentType,
        dateAdded: new Date().toISOString().split('T')[0],
        closingDate: closingDate.split('T')[0],
        tags,
        isShared: false,
      },
      initialStatus,
      initialNotes,
      isValid,
      errorReason,
    };
  });

  return results;
}

/**
 * Exports current opportunities catalog + user private tracking data to Excel
 */
export function exportOpportunitiesToExcel(
  opportunities: JobOpportunity[],
  privateStates: Record<string, UserApplicationState>
): void {
  const exportRows = opportunities.map((opp) => {
    const pState = privateStates[opp.id];
    return {
      'Company Name': opp.companyName,
      'Job Title': opp.jobTitle,
      Category: opp.jobCategory,
      Location: opp.location,
      'Work Arrangement': opp.workArrangement,
      'Employment Type': opp.employmentType,
      'Closing Date': opp.closingDate,
      'Application Link': opp.applicationLink,
      'Shared/Local': opp.isShared ? 'Shared Catalog' : 'Local Custom',
      'My Status': pState ? pState.status : ApplicationStatus.NOT_STARTED,
      'My Priority': pState ? pState.priority : 'Medium',
      'Date Applied': pState?.dateApplied || '',
      'Follow-Up Date': pState?.followUpDate || '',
      'Personal Notes': pState?.personalNotes || '',
      'CV Ready': pState?.documentsPrepared?.cvReady ? 'Yes' : 'No',
      'Cover Letter Ready': pState?.documentsPrepared?.coverLetterReady ? 'Yes' : 'No',
      'Portfolio Included': pState?.documentsPrepared?.portfolioIncluded ? 'Yes' : 'No',
      Tags: opp.tags.join(', '),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Set column widths for clean reading
  worksheet['!cols'] = [
    { wch: 20 }, // Company Name
    { wch: 28 }, // Job Title
    { wch: 20 }, // Category
    { wch: 22 }, // Location
    { wch: 16 }, // Work Arrangement
    { wch: 16 }, // Employment Type
    { wch: 14 }, // Closing Date
    { wch: 35 }, // Application Link
    { wch: 16 }, // Shared/Local
    { wch: 22 }, // My Status
    { wch: 12 }, // My Priority
    { wch: 14 }, // Date Applied
    { wch: 14 }, // Follow-up Date
    { wch: 35 }, // Personal Notes
    { wch: 10 }, // CV Ready
    { wch: 18 }, // Cover Letter Ready
    { wch: 16 }, // Portfolio Included
    { wch: 25 }, // Tags
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Opportunities');

  const fileName = `Opportunity_Hub_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
