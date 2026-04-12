import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
    permissions: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    badgeCount?: number;
}

export interface SharedData {
    name: string;
    auth: Auth;
    tenant?: Tenant | null;
    branding?: TenantBranding | null;
    impersonation: {
        active: boolean;
        impersonator_id?: number | null;
        impersonator_name?: string | null;
    };
    notifications?: NotificationItem[];
    notification_unread_count?: number;
    recent_exports?: ExportRequestSummary[];
    flash: {
        success?: string | null;
        error?: string | null;
        pendingFrameworks?: PendingFramework[] | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    tenant_id?: number | null;
    name: string;
    email: string;
    archived_email?: string | null;
    deactivated_at?: string | null;
    status?: string;
    display_role?: string | null;
    roles?: Array<{ id: number; name: string }>;
    last_login_at?: string | null;
    last_password_changed_at?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    employee_profile?: EmployeeProfile | null;
    tenant?: Tenant | null;
    permissions?: Array<{ id: number; name: string }>;
    [key: string]: unknown;
}

export interface Tenant {
    id: number;
    name: string;
    status: string;
    registration_number?: string | null;
    industry?: string | null;
    company_size?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    logo_url?: string | null;
    logo_path?: string | null;
    primary_color?: string | null;
    branding?: TenantBranding | null;
    created_at?: string;
}

export interface TenantBranding {
    tenant_id?: number | null;
    tenant_name?: string | null;
    logo_url?: string | null;
    primary_color: string;
    primary_foreground: string;
    primary_hsl: string;
    soft_color: string;
    soft_border_color: string;
    sidebar_primary: string;
    sidebar_primary_foreground: string;
    sidebar_accent: string;
    sidebar_accent_foreground: string;
    sidebar_border: string;
    ring_color: string;
    is_customized: boolean;
}

export interface Department {
    id: number;
    tenant_id?: number | null;
    name: string;
    status: string;
    description?: string | null;
    employee_profiles_count?: number;
}

export interface EmployeeProfile {
    id: number;
    tenant_id?: number | null;
    user_id: number;
    department_id?: number | null;
    manager_id?: number | null;
    job_title?: string | null;
    branch?: string | null;
    employee_number?: string | null;
    phone?: string | null;
    alternate_phone?: string | null;
    employment_type?: string | null;
    start_date?: string | null;
    risk_level?: string | null;
    status: string;
    department?: Department | null;
    manager?: Pick<User, 'id' | 'name' | 'email'> | null;
    direct_reports?: EmployeeProfile[];
    user?: User;
    training_completion_percentage?: number;
    overdue_assignments_count?: number;
    latest_test_percentage?: number | null;
    last_login_at?: string | null;
    manager_name?: string | null;
    summary?: {
        assigned_courses: number;
        completed_courses: number;
        overdue_courses: number;
        completed_lessons: number;
        assigned_tests: number;
        pending_tests: number;
        tests_taken: number;
        best_test_score: number | null;
        latest_test_score: number | null;
        responses_answered: number;
        evidence_uploaded: number;
        flagged_responses: number;
    };
    access?: {
        role_names: string[];
        permission_names: string[];
    };
    assignments?: Array<{
        id: number;
        course: string | null;
        status: string | null;
        due_date: string | null;
        assigned_at: string | null;
    }>;
    lesson_progress?: Array<{
        id: number;
        lesson: string | null;
        status: string | null;
        completed_at: string | null;
    }>;
    test_assignments?: Array<{
        id: number;
        test: string | null;
        status: string | null;
        assigned_at: string | null;
        due_date: string | null;
    }>;
    test_attempts?: Array<{
        id: number;
        test: string | null;
        attempt_number: number;
        percentage: number | null;
        result_status: string | null;
        submitted_at: string | null;
    }>;
    compliance?: {
        responses: Array<{
            id: number;
            question: string | null;
            framework: string | null;
            status: string | null;
            response_score: number | null;
            answered_at: string | null;
        }>;
        evidence_uploads: Array<{
            id: number;
            original_name: string;
            framework: string | null;
            review_status: string | null;
            uploaded_at: string | null;
        }>;
        review_activity: Array<{
            id: number;
            file: string | null;
            review_status: string | null;
            reviewed_at: string | null;
            review_comment: string | null;
        }>;
    };
    activity?: Array<{
        id: number;
        action: string;
        entity_type: string;
        created_at: string;
    }>;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface TableFilters {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    status?: string;
    [key: string]: string | number | null | undefined;
}

export interface TableFilterOption {
    label: string;
    value: string;
}

export interface TableFilterConfig {
    key: string;
    label: string;
    options: TableFilterOption[];
}

export interface IndexStat {
    label: string;
    value: string | number;
    detail?: string;
    icon?: LucideIcon | null;
}

export interface PendingItem {
    type: 'tenant_approval' | 'course_assignment' | 'compliance_submission' | 'evidence_review';
    id: number;
    title: string;
    description: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    href: string;
    due_date?: string | null;
    created_at?: string | null;
}

export interface PendingFramework {
    id: number;
    name: string;
    version?: string | null;
    pending_count: number;
    submissions: Array<{
        id: number;
        title: string;
        status: string;
        href: string;
    }>;
}

export interface IndexAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon | null;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
}

export interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    action_url?: string | null;
    is_read: boolean;
    read_at?: string | null;
    created_at: string;
}

export interface ExportRequestSummary {
    id: number;
    source: string;
    format: string;
    status: string;
    file_name?: string | null;
    completed_at?: string | null;
    created_at: string;
    download_url?: string | null;
}

export interface LibraryFileSummary {
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    original_name: string;
    mime_type?: string | null;
    file_size: number;
    file_type: string;
    scope: 'shared' | 'tenant';
    scope_label: string;
    tenant?: {
        id: number;
        name: string;
    } | null;
    uploader?: {
        id: number;
        name: string;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
    download_url: string;
    abilities: {
        canEdit: boolean;
        canDelete: boolean;
        canDownload: boolean;
    };
}
