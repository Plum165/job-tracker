import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { parseExcelOrCsvFile, ParsedExcelRow } from '../../lib/excelParser';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  HardDrive,
  Info,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';

export const DataManagementView: React.FC = () => {
  const {
    importExcelRows,
    exportBackupJSON,
    importBackupJSON,
    exportToExcel,
    clearAllData,
  } = useWorkspace();

  // Excel Import state
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Backup file import state
  const [backupJsonStr, setBackupJsonStr] = useState('');

  // Handle Excel/CSV File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError('');
    setImportSuccessMsg('');

    try {
      const rows = await parseExcelOrCsvFile(file);
      setParsedRows(rows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file.';
      setParseError(msg);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmExcelImport = () => {
    if (parsedRows.length === 0) return;
    importExcelRows(parsedRows);
    setImportSuccessMsg(`Successfully imported ${parsedRows.length} opportunities from spreadsheet!`);
    setParsedRows([]);
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setBackupJsonStr(content);
        importBackupJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span>Data Management, Imports & Offline Backups</span>
        </h2>
        <p className="text-xs text-slate-500">
          Import job spreadsheets from Excel/CSV, backup your private notes to JSON, or export your full catalog.
        </p>
      </div>

      {/* Section 1: Excel & CSV Spreadsheet Import Wizard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Import Existing Excel or CSV Sheet</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload your spreadsheet (.xlsx, .xls, .csv). Columns like Company, Position, Location, and Closing Date will be auto-detected.
            </p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
            <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to select or drag & drop Excel / CSV file
            </div>
            <div className="text-[11px] text-slate-400">
              Supports .xlsx, .xls, and .csv files
            </div>
          </label>
        </div>

        {isParsing && <p className="text-xs text-emerald-600 font-semibold">Parsing spreadsheet...</p>}

        {parseError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {importSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {/* Parsed Rows Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Auto-Mapped Rows Preview ({parsedRows.length} items found)
              </h4>
              <button
                onClick={handleConfirmExcelImport}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Confirm & Import All Rows
              </button>
            </div>

            <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-2">Company</th>
                    <th className="p-2">Job Title</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Closing Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2 font-bold">{r.mapped.companyName}</td>
                      <td className="p-2">{r.mapped.jobTitle}</td>
                      <td className="p-2">{r.mapped.jobCategory}</td>
                      <td className="p-2">{r.mapped.location}</td>
                      <td className="p-2">{r.mapped.closingDate}</td>
                      <td className="p-2">{r.initialStatus || '⚪ Not started'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Backup & Restore Private JSON Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export JSON */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Export Private Workspace (JSON)
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download a full JSON backup of your private notes, application dates, recruiter contacts, and custom opportunities to keep on your computer.
          </p>
          <button
            onClick={exportBackupJSON}
            className="w-full py-2.5 px-4 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Private Backup (.json)</span>
          </button>
        </div>

        {/* Restore JSON */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Restore Private Backup (JSON)
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Switching devices or restoring notes? Select a previously exported JSON backup file to restore your workspace.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleBackupFileSelect}
            className="hidden"
            id="json-backup-input"
          />
          <label
            htmlFor="json-backup-input"
            className="w-full py-2.5 px-4 text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-center block"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Backup File (.json)</span>
          </label>
        </div>
      </div>

      {/* Section 3: Export Catalog to Excel & Clear Storage Safeguard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span>Export Catalog & Status to Excel (.xlsx)</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate an Excel spreadsheet combining all company opportunities and your private application tracking status.
          </p>
          <button
            onClick={exportToExcel}
            className="py-2.5 px-4 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Clear Local Storage</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Resets all local private states, custom opportunities, and saved recruiter contacts back to defaults.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all locally stored application data?')) {
                clearAllData();
              }
            }}
            className="py-2.5 px-4 text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Local Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
