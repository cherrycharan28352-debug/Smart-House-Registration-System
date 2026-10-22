import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Filter,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import { getHouses, getLocalitiesMeta } from '../services/houseService';
import { downloadBulkHousesPDF, downloadBulkHousesExcel } from '../services/exportService';
import { useToast } from '../context/ToastContext';

const ExportPage = () => {
  const toast = useToast();
  const [localities, setLocalities] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const meta = await getLocalitiesMeta();
        setLocalities(meta.localities || []);
      } catch (err) {
        console.warn('Meta fetch error:', err);
      }
    };
    loadMeta();
  }, []);

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      toast.info('Querying database and generating multi-page PDF compilation...');
      // Fetch matching house IDs
      const res = await getHouses({
        limit: 100,
        locality: selectedLocality,
        houseType: selectedType
      });

      const ids = res.data.map((h) => h.houseId || h._id);
      if (ids.length === 0) {
        toast.warning('No house records match the selected export criteria.');
        setExportingPDF(false);
        return;
      }

      await downloadBulkHousesPDF(ids);
      toast.success(`Successfully exported PDF compilation for ${ids.length} houses.`);
    } catch (err) {
      toast.error('Failed to generate bulk PDF export.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      toast.info('Generating 4-sheet formatted Excel workbook (.xlsx)...');
      const res = await getHouses({
        limit: 250,
        locality: selectedLocality,
        houseType: selectedType
      });

      const ids = res.data.map((h) => h.houseId || h._id);
      if (ids.length === 0) {
        toast.warning('No house records match the selected export criteria.');
        setExportingExcel(false);
        return;
      }

      await downloadBulkHousesExcel(ids);
      toast.success(`Successfully exported 4-sheet Excel workbook for ${ids.length} houses.`);
    } catch (err) {
      toast.error('Failed to generate Excel workbook export.');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-400" />
          Authorized Census & Administrative Exports
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Official PDF & Excel Export Center
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Generate official police household survey dossiers, multi-page PDF certificates with QR codes and photos, or 4-sheet Excel workbooks with full relational schemas.
        </p>
      </div>

      {/* Scope and Filter Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Filter className="w-4 h-4 mr-2 text-blue-600" />
            Define Export Filter Parameters (Optional)
          </h3>
          <span className="text-xs text-slate-400">Leave blank to export all records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Filter by Locality</label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="">All Localities</option>
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Filter by House Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="">All House Types</option>
              <option value="Independent house">Independent house</option>
              <option value="Apartment">Apartment</option>
              <option value="Rental house">Rental house</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two Export Channel Cards (PDF & Excel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Channel */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Official PDF Dossier Export
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generates a print-ready, high-resolution multi-page PDF compilation formatted to Karnataka State Police survey standards.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>Verification QR Code embedded in document header</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>House architecture, floors, rooms, and ownership</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>Precise GPS geocoordinates & Google Maps hyperlinks</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>Household family member census tables</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>Saved house photographs & category captions</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={exportingPDF}
            onClick={handleExportPDF}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4 mr-2" />
            {exportingPDF ? 'Generating Compilation PDF...' : 'Download PDF Report'}
          </button>
        </div>

        {/* Excel Channel */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                4-Sheet Excel Master Workbook (.xlsx)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Engineered with ExcelJS containing relational worksheets, column autofilters, frozen headers, and styling.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Sheet 1:</strong> House Details (Addresses, GPS, status)
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Sheet 2:</strong> Owner Details (Contacts, ownership, IDs)
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Sheet 3:</strong> Family Details (Relationships, occupations)
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Sheet 4:</strong> Photo References (Categories, safe paths)
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                <span>Bold headers, colored banner fills, and auto-filters</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={exportingExcel}
            onClick={handleExportExcel}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4 mr-2" />
            {exportingExcel ? 'Generating Excel Workbook...' : 'Download Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-start space-x-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Data Protection Notice: Generated exports contain authenticated registry data. In adherence to Section 13 security guidelines, password hashes, secrets, and internal authentication tokens are never included in exports.
        </span>
      </div>
    </div>
  );
};

export default ExportPage;
