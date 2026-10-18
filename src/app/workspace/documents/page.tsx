'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { LegalDocument } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  FileText,
  Lock,
  Download,
  Plus,
  ShieldCheck,
  FileCheck,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DocumentsPage() {
  const { activeOrg, currentUser, can } = useTenant();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LegalDocument['category']>('legal');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [isConfidential, setIsConfidential] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadDocs() {
    setIsLoading(true);
    try {
      const data = await DataRepository.getLegalDocuments(activeOrg.id);
      setDocuments(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocs();
  }, [activeOrg.id]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) return;
    setIsSubmitting(true);
    try {
      await DataRepository.uploadLegalDocument({
        orgId: activeOrg.id,
        title: title.trim(),
        category,
        fileName: fileName.trim(),
        fileSize,
        isConfidential,
        uploadedById: currentUser.id,
      });
      setTitle('');
      setFileName('');
      setIsUploadOpen(false);
      await loadDocs();
    } finally {
      setIsSubmitting(false);
    }
  }

  const canViewConfidential = can('documents:view_legal');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Legal & Confidential Documents Vault
            </h1>
            <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider">
              Protected Access
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Proprietary contracts, NDAs, 50% patent royalty assignments, and legal handbooks for {activeOrg.name}.
          </p>
        </div>

        {can('documents:upload') && (
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Document
          </Button>
        )}
      </div>

      {/* Security Warning Notice */}
      <Card className="p-4 border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-amber-950 dark:text-amber-200">
              Access Restricted by Row Level Security (RLS) & Server RBAC
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              Only authorized roles (Supreme Admin, Department Leads, and Patent Inventors) can access and download confidential IP contracts. Public downloads are strictly prohibited.
            </p>
          </div>
        </div>
      </Card>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-zinc-500">Loading documents vault...</div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isRestrictedForUser = doc.is_confidential && !canViewConfidential;

            return (
              <Card
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg shrink-0 mt-0.5">
                    {doc.category === 'ip_patent' ? (
                      <Award className="w-5 h-5 text-purple-600" />
                    ) : doc.category === 'nda' ? (
                      <Lock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {doc.title}
                      </h3>
                      {doc.is_confidential ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Confidential
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200">
                          Standard
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      File: <span className="font-mono">{doc.file_name}</span> ({doc.file_size}) • Uploaded {formatDate(doc.uploaded_at)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {isRestrictedForUser ? (
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-1 rounded border border-rose-200">
                      Access Denied (Role Restricted)
                    </span>
                  ) : (
                    <a
                      href={doc.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Document
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Legal / Confidential Document"
        description="Add a binding contract, NDA, or IP patent assignment to the company vault."
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Document Title *"
            placeholder="e.g. Master Intellectual Property Agreement 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LegalDocument['category'])}
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="legal">Legal Handbook / Policy</option>
                <option value="nda">Mutual NDA</option>
                <option value="ip_patent">Patent & Royalty Assignment</option>
                <option value="contract">Client & Vendor Contract</option>
              </select>
            </div>

            <Input
              label="File Name *"
              placeholder="e.g. patent-agreement-v1.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950 h-4 w-4"
            />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Mark as Strictly Confidential (Leadership & Inventor only)
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Upload to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
