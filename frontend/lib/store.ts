import { create } from 'zustand';

export interface Keyword {
  id: number;
  keyword: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessResult {
  id: number;
  business_id: string | null;
  keyword: string;
  business_name: string | null;
  business_alei: string | null;
  business_status: string | null;
  date_formed: string | null;
  business_email: string | null;
  citizenship_formation: string | null;
  business_address: string | null;
  mailing_address: string | null;
  requires_annual_filing: string | null;
  annual_report_due: string | null;
  public_substatus: string | null;
  naics_code: string | null;
  naics_sub_code: string | null;
  last_report_filed: string | null;
  principal_name: string | null;
  principal_business_address: string | null;
  principal_title: string | null;
  principal_residence_address: string | null;
  agent_name: string | null;
  agent_business_address: string | null;
  agent_mailing_address: string | null;
  agent_residence_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusResponse {
  status: 'idle' | 'busy';
  last_update: string | null;
  progress: {
    keywords_done: number;
    total_keywords: number;
  } | null;
}

interface StoreState {
  theme: 'light' | 'dark';
  keywords: Keyword[];
  results: BusinessResult[];
  status: StatusResponse;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  setTheme: (theme: 'light' | 'dark') => void;
  setKeywords: (keywords: Keyword[]) => void;
  setResults: (results: BusinessResult[], total: number, page: number, totalPages: number) => void;
  setStatus: (status: StatusResponse) => void;
  setCurrentPage: (page: number) => void;
}

export const useStore = create<StoreState>((set) => {
  // Load theme from localStorage
  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') as 'light' | 'dark' : 'light';
  
  return {
    theme: savedTheme || 'light',
    keywords: [],
    results: [],
    status: {
      status: 'idle',
      last_update: null,
      progress: null
    },
    totalResults: 0,
    currentPage: 1,
    totalPages: 0,
    setTheme: (theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
      set({ theme });
    },
    setKeywords: (keywords) => set({ keywords }),
    setResults: (results, total, page, totalPages) => 
      set({ results, totalResults: total, currentPage: page, totalPages }),
    setStatus: (status) => set({ status }),
    setCurrentPage: (page) => set({ currentPage: page }),
  };
});
