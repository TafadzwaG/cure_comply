import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { useForm } from '@inertiajs/react';
import { Building, Building2, Layers3, ShieldCheck, Users } from 'lucide-react';

export default function DepartmentsCreate({
    tenants = [],
}: {
    tenants?: Array<{ id: number; name: string }>;
}) {
    const isSuperAdminFlow = tenants.length > 0;
    const form = useForm({
        tenant_id: '',
        name: '',
        description: '',
        status: 'active',
    });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Add New Department" description="Create a department and keep ownership, reporting, and employee structure aligned." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Department Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isSuperAdminFlow ? (
                                <div className="space-y-2">
                                    <Label>Tenant</Label>
                                    <Select value={form.data.tenant_id} onValueChange={(value) => form.setData('tenant_id', value)}>
                                        <SelectTrigger>
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
                                <Label>Department name</Label>
                                <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Department name" />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Describe the department purpose"
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.status} />
                            </div>

                            <Button
                                onClick={() =>
                                    form.transform((data) => ({
                                        ...data,
                                        tenant_id: data.tenant_id ? Number(data.tenant_id) : undefined,
                                    })).post(route('departments.store'))
                                }
                            >
                                Save Department
                            </Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="Departments shape employee grouping, ownership, and downstream reporting."
                        items={[
                            {
                                title: 'Structure is recorded',
                                description: 'The department becomes available for employee allocation and operational reporting.',
                                icon: Building2,
                            },
                            ...(isSuperAdminFlow
                                ? [
                                          {
                                              title: 'Tenant ownership is explicit',
                                              description: 'As a super admin, you choose the tenant workspace before the department is created.',
                                              icon: Building,
                                          },
                                  ]
                                : [
                                      {
                                          title: 'Data stays tenant-safe',
                                          description: 'The new department is created inside the active tenant workspace only.',
                                          icon: ShieldCheck,
                                      },
                                  ]),
                            {
                                title: 'Assignments align better',
                                description: 'Training and compliance ownership can be mapped against the department immediately.',
                                icon: Layers3,
                            },
                            {
                                title: 'Employees can be allocated',
                                description: 'Existing profiles can be updated to point to the department right after creation.',
                                icon: Users,
                            },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
