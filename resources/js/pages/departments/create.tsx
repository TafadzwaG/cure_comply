import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import { Building, Building2, Layers3, Plus, ShieldCheck, Users } from 'lucide-react';

export default function DepartmentsCreate({
    tenants = [],
    isSuperAdmin = false,
}: {
    tenants?: Array<{ id: number; name: string }>;
    isSuperAdmin?: boolean;
}) {
    const isSuperAdminFlow = isSuperAdmin;

    const form = useForm({
        tenant_id: '',
        name: '',
        description: '',
        status: 'active',
    });

    const guidanceItems = [
        {
            title: 'Structure is recorded',
            description:
                'The department becomes available for employee allocation and operational reporting.',
            icon: Building2,
        },
        ...(isSuperAdminFlow
            ? [
                  {
                      title: 'Tenant ownership is explicit',
                      description:
                          'As a super admin, you choose the tenant workspace before the department is created.',
                      icon: Building,
                  },
              ]
            : [
                  {
                      title: 'Data stays tenant-safe',
                      description:
                          'The new department is created inside the active tenant workspace only.',
                      icon: ShieldCheck,
                  },
              ]),
        {
            title: 'Assignments align better',
            description:
                'Training and compliance ownership can be mapped against the department immediately.',
            icon: Layers3,
        },
        {
            title: 'Employees can be allocated',
            description:
                'Existing profiles can be updated to point to the department right after creation.',
            icon: Users,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <Card className="rounded-md border-border/60 shadow-none">
                    <CardContent className="rounded-md bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl space-y-2">
                                <div className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
                                    PrivacyCure Department Builder
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Add a new department
                                </h1>
                                <p className="text-sm text-white/80">
                                    Create a department and keep ownership, reporting, and employee structure aligned.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    <Link href={route('departments.index')}>Back to Departments</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="rounded-md border-border/60 shadow-none">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-base font-medium">Department Details</CardTitle>
                            <CardDescription>
                                Set the tenant, name, description, and status for this department.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6">
                            <form
                                className="space-y-5"
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    form.post(route('departments.store'));
                                }}
                            >
                            {isSuperAdminFlow ? (
                                <div className="space-y-2">
                                    <Label htmlFor="tenant_id">Tenant</Label>
                                    <Select
                                        value={form.data.tenant_id}
                                        onValueChange={(value) => form.setData('tenant_id', value)}
                                    >
                                        <SelectTrigger id="tenant_id" className="rounded-md border-border/60">
                                            <SelectValue placeholder="Select tenant workspace" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tenants.map((tenant) => (
                                                <SelectItem key={tenant.id} value={String(tenant.id)}>
                                                    {tenant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.tenant_id} />
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <Label htmlFor="name">Department name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Department name"
                                    className="rounded-md border-border/60"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Describe the department purpose"
                                    className="min-h-[140px] rounded-md border-border/60"
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={form.data.status}
                                        onValueChange={(value) => form.setData('status', value)}
                                    >
                                        <SelectTrigger id="status" className="rounded-md border-border/60">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.status} />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Workspace scope</span>
                                    <div className="flex h-10 items-center rounded-md border border-border/60 bg-muted/20 px-3 text-sm font-medium">
                                        {isSuperAdminFlow ? 'Tenant selected manually' : 'Current tenant only'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Department ownership is always scoped to a tenant workspace.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-md border border-border/60 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <Building2 className="h-4 w-4 text-[#14417A]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Department note</p>
                                        <p className="text-sm text-muted-foreground">
                                            After creating the department, you can allocate employees and align
                                            reporting structures immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button type="submit" disabled={form.processing} className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Saving...' : 'Save Department'}
                                </Button>

                                <Button asChild variant="outline" className="rounded-md border-border/60">
                                    <Link href={route('departments.index')}>Cancel</Link>
                                </Button>
                            </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardHeader className="border-b border-border/60">
                                <CardTitle className="text-base font-medium">What happens next</CardTitle>
                                <CardDescription>
                                    Departments shape employee grouping, ownership, and downstream reporting.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 p-6">
                                {guidanceItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="flex items-start gap-3 rounded-md border border-border/60 p-4"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                                <Icon className="h-4 w-4 text-[#14417A]" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <ShieldCheck className="h-4 w-4 text-[#14417A]" />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Recommended workflow</p>
                                        <p className="text-sm text-muted-foreground">
                                            Create the department first, then allocate employees and align ownership,
                                            reporting, and operational structure from there.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}
