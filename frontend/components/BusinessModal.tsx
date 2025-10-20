'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';
import type { BusinessResult } from '@/lib/store';

interface BusinessModalProps {
  business: BusinessResult | null;
  onClose: () => void;
}

export default function BusinessModal({ business, onClose }: BusinessModalProps) {
  if (!business) return null;

  return (
    <Dialog open={!!business} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{business.business_name || 'Business Details'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">General Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Business Name" value={business.business_name} />
              <InfoField label="Business ID" value={business.business_id} />
              <InfoField label="Business ALEI" value={business.business_alei} />
              <InfoField label="Status" value={business.business_status} />
              <InfoField label="Date Formed" value={business.date_formed} />
              <InfoField label="Email" value={business.business_email} />
              <InfoField label="Citizenship/Formation" value={business.citizenship_formation} />
              <InfoField label="Keywords" value={business.keyword} />
              <InfoField label="Business Address" value={business.business_address} span={2} />
              <InfoField label="Mailing Address" value={business.mailing_address} span={2} />
              <InfoField label="Requires Annual Filing" value={business.requires_annual_filing} />
              <InfoField label="Annual Report Due" value={business.annual_report_due} />
              <InfoField label="Public Substatus" value={business.public_substatus} />
              <InfoField label="Last Report Filed" value={business.last_report_filed} />
              <InfoField label="NAICS Code" value={business.naics_code} />
              <InfoField label="NAICS Sub Code" value={business.naics_sub_code} />
            </div>
          </div>

          <Separator />

          {/* Principal Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Principal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Principal Name" value={business.principal_name} />
              <InfoField label="Principal Title" value={business.principal_title} />
              <InfoField label="Principal Business Address" value={business.principal_business_address} span={2} />
              <InfoField label="Principal Residence Address" value={business.principal_residence_address} span={2} />
            </div>
          </div>

          <Separator />

          {/* Agent Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Agent Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Agent Name" value={business.agent_name} span={2} />
              <InfoField label="Agent Business Address" value={business.agent_business_address} span={2} />
              <InfoField label="Agent Mailing Address" value={business.agent_mailing_address} span={2} />
              <InfoField label="Agent Residence Address" value={business.agent_residence_address} span={2} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({ label, value, span = 1 }: { label: string; value: string | null; span?: number }) {
  return (
    <div className={`${span === 2 ? 'col-span-2' : ''}`}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value || 'N/A'}</div>
    </div>
  );
}
