import moment from 'moment';

import { DataIndexPage } from '@/components/data-index-page';
import { EmptyState } from '@/components/empty-state';
import { SortableTableHead } from '@/components/sortable-table-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, LibraryFileSummary, Paginated, SharedData, TableFilters, Tenant } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { Download, FileText, Files, FolderOpen, Loader2, MoreHorizontal, Pencil, ShieldCheck, Trash2, UploadCloud, X } from 'lucide-react';
import { DragEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CategoryOption {
    label: string;
    value: string;
}

interface TenantOption {
    id: number;
    name: string;
}

interface Props {
    files: Paginated<LibraryFileSummary>;
    filters: TableFilters & {
        scope?: string;
        category?: string;
        tenant_id?: string | number | null;
    };
    stats: {
        visible: number;
        shared: number;
        tenant: number;
        categories: number;
    };
    categories: CategoryOption[];
    tenants: TenantOption[];
    canManage: boolean;
    isSuperAdmin: boolean;
}

interface FileFormData {
    title: string;
    description: string;
    category: string;
    scope: 'shared' | 'tenant';
    tenant_id: string;
    file: File | null;
}

export default function LibraryFilesIndex({ files, filters, stats, categories, tenants, canManage, isSuperAdmin }: Props) {
    const { tenant } = usePage<SharedData>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<LibraryFileSummary | null>(null);
    const currentScope = String(filters.scope ?? (isSuperAdmin ? 'all' : 'shared'));

    const statItems: IndexStat[] = [
        { label: 'Visible files', value: stats.visible, detail: 'Documents accessible in the current workspace.', icon: Files },
        { label: 'Shared', value: stats.shared, detail: 'Platform-wide reference files.', icon: FileText },
        { label: 'Company files', value: stats.tenant, detail: 'Tenant-owned documents and templates.', icon: FolderOpen },
        { label: 'Categories', value: stats.categories, detail: 'Unique classification buckets in use.', icon: ShieldCheck },
    ];

    const tabAddon = (
        <Tabs
            value={currentScope}
            onValueChange={(value) =>
                router.get(
                    route('files.index'),
                    sanitizeFilters({
                        ...filters,
                        scope: value,
                        tenant_id: value === 'shared' ? undefined : filters.tenant_id,
                        page: undefined,
                    }),
                    { preserveScroll: true, preserveState: true, replace: true },
                )
            }
        >
            <TabsList className="w-full justify-start">
                <TabsTrigger value="shared">Shared files</TabsTrigger>
                {!isSuperAdmin ? <TabsTrigger value="tenant">My company files</TabsTrigger> : null}
                {isSuperAdmin ? <TabsTrigger value="all">All files</TabsTrigger> : null}
            </TabsList>
        </Tabs>
    );

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Files"
                    description="A private document library for shared regulations, platform references, and company-specific files."
                    stats={statItems}
                    actions={
                        canManage
                            ? [
                                  {
                                      label: 'Upload File',
                                      onClick: () => {
                                          setEditingFile(null);
                                          setDialogOpen(true);
                                      },
                                      icon: UploadCloud,
                                  },
                              ]
                            : []
                    }
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'category',
                            label: 'Category',
                            options: categories,
                        },
                        ...(isSuperAdmin
                            ? [
                                  {
                                      key: 'tenant_id',
                                      label: 'Tenant',
                                      options: tenants.map((tenant) => ({ label: tenant.name, value: String(tenant.id) })),
                                  },
                              ]
                            : []),
                    ]}
                    paginated={files}
                    tableTitle="Document library"
                    tableDescription="Files are stored privately and only downloaded through an authorized route."
                    tableToolbarAddon={tabAddon}
                >
                    {files.data.length ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableTableHead label="Title" column="title" filters={filters} />
                                        <SortableTableHead label="Category" column="category" filters={filters} />
                                        <TableHead>Scope</TableHead>
                                        <TableHead>Type</TableHead>
                                        <SortableTableHead label="Size" column="file_size" filters={filters} />
                                        <TableHead>Uploaded by</TableHead>
                                        <SortableTableHead label="Uploaded" column="created_at" filters={filters} />
                                        <TableHead className="w-[140px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.data.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-foreground">{file.title}</p>
                                                    <p className="text-xs text-muted-foreground">{file.original_name}</p>
                                                    {file.description ? <p className="max-w-md text-sm text-muted-foreground">{file.description}</p> : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{file.category ?? 'Other'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={file.scope === 'shared' ? 'border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300' : ''}>
                                                    {file.scope_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{file.file_type}</TableCell>
                                            <TableCell>{formatFileSize(file.file_size)}</TableCell>
                                            <TableCell>{file.uploader?.name ?? 'Unknown user'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span>{file.created_at ? moment(file.created_at).format('DD MMM YYYY') : 'Recently'}</span>
                                                    <span className="text-xs text-muted-foreground">{file.created_at ? moment(file.created_at).fromNow() : ''}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button asChild size="sm" variant="outline">
                                                        <a href={file.download_url}>
                                                            <Download className="size-4" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                    {file.abilities.canEdit || file.abilities.canDelete ? (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button type="button" size="icon" variant="ghost" aria-label={`Open actions for ${file.title}`}>
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {file.abilities.canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setEditingFile(file);
                                                                            setDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {file.abilities.canEdit && file.abilities.canDelete ? <DropdownMenuSeparator /> : null}
                                                                {file.abilities.canDelete ? (
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={() => {
                                                                            if (window.confirm(`Remove "${file.title}" from the library?`)) {
                                                                                router.delete(route('files.destroy', file.id), {
                                                                                    preserveScroll: true,
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={FileText}
                            title="No files available"
                            description={
                                currentScope === 'tenant'
                                    ? 'No tenant files match the current filters.'
                                    : currentScope === 'shared'
                                      ? 'No shared files match the current filters.'
                                      : 'No library files match the current filters.'
                            }
                        />
                    )}
                </DataIndexPage>

                <LibraryFileDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingFile={editingFile}
                    categories={categories}
                    tenants={tenants}
                    isSuperAdmin={isSuperAdmin}
                    currentTenant={tenant ?? null}
                />
            </div>
        </PlatformLayout>
    );
}

function LibraryFileDialog({
    open,
    onOpenChange,
    editingFile,
    categories,
    tenants,
    isSuperAdmin,
    currentTenant,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingFile: LibraryFileSummary | null;
    categories: CategoryOption[];
    tenants: TenantOption[];
    isSuperAdmin: boolean;
    currentTenant: Tenant | null;
}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const defaultScope = isSuperAdmin ? 'shared' : 'tenant';
    const defaultCategory = categories[0]?.value ?? 'Reference';
    const form = useForm<FileFormData>({
        title: '',
        description: '',
        category: defaultCategory,
        scope: defaultScope,
        tenant_id: '',
        file: null,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        form.clearErrors();
        form.setData({
            title: editingFile?.title ?? '',
            description: editingFile?.description ?? '',
            category: editingFile?.category ?? defaultCategory,
            scope: editingFile?.scope ?? defaultScope,
            tenant_id: editingFile?.tenant?.id ? String(editingFile.tenant.id) : '',
            file: null,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsDragging(false);
    }, [open, editingFile, defaultCategory, defaultScope]);

    const selectedFileName = form.data.file?.name;
    const scopeIsTenant = form.data.scope === 'tenant';

    const submit = () => {
        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
            onError: (errors: Record<string, string>) => {
                const message = Object.values(errors).join('\n');
                toast.error(message || 'The file could not be saved.');
            },
        };

        if (editingFile) {
            form.transform((data) => ({
                ...data,
                _method: 'patch',
            })).post(route('files.update', editingFile.id), options);

            return;
        }

        form.transform((data) => data);
        form.post(route('files.store'), options);
    };

    const applyFile = (file: File | null) => {
        form.setData('file', file);
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        applyFile(event.dataTransfer.files?.[0] ?? null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingFile ? 'Edit library file' : 'Upload library file'}</DialogTitle>
                    <DialogDescription>
                        {editingFile
                            ? 'Update the title, category, scope, or replace the current file.'
                            : 'Add a new reference or tenant document to the private file library.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Title" error={form.errors.title}>
                            <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="e.g. CDPA Chapter 12:07" />
                        </Field>

                        <Field label="Category" error={form.errors.category}>
                            <Select value={form.data.category} onValueChange={(value) => form.setData('category', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {categories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <Field label="Description" error={form.errors.description}>
                        <Textarea
                            rows={4}
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                            placeholder="Short context about when users should download or reference this document."
                        />
                    </Field>

                    {isSuperAdmin ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Scope" error={form.errors.scope}>
                                <Select
                                    value={form.data.scope}
                                    onValueChange={(value: 'shared' | 'tenant') => {
                                        form.setData('scope', value);

                                        if (value === 'shared') {
                                            form.setData('tenant_id', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select scope" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="shared">Shared platform file</SelectItem>
                                            <SelectItem value="tenant">Tenant-specific file</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Tenant" error={form.errors.tenant_id}>
                                <Select
                                    value={form.data.tenant_id || undefined}
                                    onValueChange={(value) => form.setData('tenant_id', value)}
                                    disabled={!scopeIsTenant}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={scopeIsTenant ? 'Select tenant' : 'Shared file'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {tenants.map((tenant) => (
                                                <SelectItem key={tenant.id} value={String(tenant.id)}>
                                                    {tenant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                            This file will be stored under <span className="font-medium text-foreground">{currentTenant?.name ?? 'your company'}</span>.
                        </div>
                    )}

                    <Field label="File" error={form.errors.file}>
                        <label
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className="block"
                        >
                            <div
                                className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-6 py-8 text-center transition-colors hover:border-[#14417A]/40 hover:bg-[#14417A]/5"
                                style={isDragging ? { borderColor: '#14417A', backgroundColor: 'rgba(20, 65, 122, 0.05)' } : undefined}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#14417A]/10 bg-[#14417A]/5">
                                    <UploadCloud className="size-5 text-[#14417A]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium">{selectedFileName ?? (editingFile ? 'Replace the current file or keep the existing upload' : 'Drag and drop a file here')}</div>
                                    <div className="text-xs text-muted-foreground">PDF, Word, Excel, CSV, PNG, or JPG. Maximum file size: 20 MB.</div>
                                </div>
                                {selectedFileName ? <div className="text-xs text-muted-foreground">{(form.data.file!.size / 1024).toFixed(1)} KB selected</div> : null}
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                                onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
                                className="sr-only"
                            />
                        </label>

                        {editingFile && !selectedFileName ? (
                            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                                Current file: <span className="font-medium text-foreground">{editingFile.original_name}</span>
                            </div>
                        ) : null}

                        {selectedFileName ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    applyFile(null);

                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                            >
                                <X className="size-4" />
                                Clear selected file
                            </Button>
                        ) : null}
                    </Field>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={submit} disabled={form.processing}>
                        {form.processing ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                        {editingFile ? 'Save changes' : 'Upload file'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

function formatFileSize(bytes?: number | null) {
    if (!bytes || bytes <= 0) {
        return 'Unknown size';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size % 1 === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function sanitizeFilters(filters: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}
