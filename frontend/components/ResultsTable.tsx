'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { RefreshCw, Download } from 'lucide-react';
import { resultsApi, statusApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import BusinessModal from './BusinessModal';
import type { BusinessResult } from '@/lib/store';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

export default function ResultsTable() {
  const { results, setResults, status, setStatus, currentPage, setCurrentPage, totalPages, totalResults } = useStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    business_name: '',
    business_status: '',
    keyword: '',
    naics_code: '',
  });
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const isBusy = status.status === 'busy';

  useEffect(() => {
    loadResults();
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadResults();
  }, [currentPage]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 50 };
      if (search) params.search = search;
      if (filters.business_name) params.business_name = filters.business_name;
      if (filters.business_status) params.business_status = filters.business_status;
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.naics_code) params.naics_code = filters.naics_code;

      const data = await resultsApi.getAll(params);
      setResults(data.results, data.total, data.page, data.total_pages);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const data = await statusApi.get();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleUpdate = async () => {
    if (isBusy) return;
    try {
      await resultsApi.update();
      alert('Update started. The data will be refreshed in the background.');
    } catch (error: any) {
      console.error('Failed to start update:', error);
      if (error.response?.status === 409) {
        alert('An update is already in progress.');
      } else {
        alert('Failed to start update. Please try again.');
      }
    }
  };

  const handleRefresh = () => {
    loadResults();
    loadStatus();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadResults();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadResults();
  };

  const truncateText = (text: string | null, maxLength: number = 40) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const columns: ColumnDef<BusinessResult>[] = [
    {
      accessorKey: 'business_name',
      header: 'Business Name',
      size: 250,
      cell: ({ row }) => (
        <div className="font-medium" title={row.original.business_name || ''}>
          {truncateText(row.original.business_name)}
        </div>
      ),
    },
    {
      accessorKey: 'business_alei',
      header: 'ALEI',
      size: 150,
      cell: ({ row }) => (
        <div title={row.original.business_alei || ''}>
          {truncateText(row.original.business_alei, 20)}
        </div>
      ),
    },
    {
      accessorKey: 'business_status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => row.original.business_status || 'N/A',
    },
    {
      accessorKey: 'date_formed',
      header: 'Date Formed',
      size: 130,
      cell: ({ row }) => row.original.date_formed || 'N/A',
    },
    {
      accessorKey: 'keyword',
      header: 'Keywords',
      size: 180,
      cell: ({ row }) => (
        <div title={row.original.keyword}>
          {truncateText(row.original.keyword, 30)}
        </div>
      ),
    },
    {
      accessorKey: 'naics_code',
      header: 'NAICS',
      size: 100,
      cell: ({ row }) => row.original.naics_code || 'N/A',
    },
    {
      accessorKey: 'business_email',
      header: 'Email',
      size: 200,
      cell: ({ row }) => (
        <div title={row.original.business_email || ''}>
          {truncateText(row.original.business_email, 25)}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  });

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Business Results</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleUpdate} disabled={isBusy} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Update Data
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Unified search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Input
          placeholder="Filter by business name..."
          value={filters.business_name}
          onChange={(e) => handleFilterChange('business_name', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
        />
        <Input
          placeholder="Filter by status..."
          value={filters.business_status}
          onChange={(e) => handleFilterChange('business_status', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
        />
        <Input
          placeholder="Filter by keyword..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
        />
        <Input
          placeholder="Filter by NAICS..."
          value={filters.naics_code}
          onChange={(e) => handleFilterChange('naics_code', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
        />
      </div>

      {/* Status Info */}
      {isBusy && (
        <div className="mb-4 p-2 bg-blue-100 dark:bg-blue-900 rounded text-sm">
          Update in progress: {status.progress?.keywords_done || 0} / {status.progress?.total_keywords || 0} keywords
        </div>
      )}

      {/* Results Table */}
      <div className="flex-1 overflow-auto border rounded">
        <table className="w-full" style={{ width: table.getCenterTotalSize() }}>
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      position: 'relative',
                    }}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary ${
                        header.column.getIsResizing() ? 'bg-primary' : ''
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer relative border-b hover:bg-accent/50 transition-colors"
                  onMouseEnter={() => setHoveredRow(row.original.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => setSelectedBusiness(row.original)}
                >
                  {hoveredRow === row.original.id && (
                    <td
                      colSpan={columns.length}
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white font-medium z-10"
                    >
                      To show in detailed mode, Click
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="px-4 py-3 text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Total: {totalResults} results
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>

      <BusinessModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
    </Card>
  );
}
