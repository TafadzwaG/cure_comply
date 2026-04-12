<?php

namespace App\Support;

final class Permissions
{
    public const MANAGE_TENANTS = 'manage tenants';
    public const MANAGE_USERS = 'manage users';
    public const INVITE_EMPLOYEES = 'invite employees';
    public const MANAGE_DEPARTMENTS = 'manage departments';
    public const MANAGE_COURSES = 'manage courses';
    public const MANAGE_LESSONS = 'manage lessons';
    public const ASSIGN_TRAINING = 'assign training';
    public const MANAGE_TESTS = 'manage tests';
    public const TAKE_TESTS = 'take tests';
    public const MANAGE_COMPLIANCE_FRAMEWORKS = 'manage compliance frameworks';
    public const MANAGE_COMPLIANCE_SUBMISSIONS = 'manage compliance submissions';
    public const ANSWER_COMPLIANCE_QUESTIONS = 'answer compliance questions';
    public const UPLOAD_EVIDENCE = 'upload evidence';
    public const REVIEW_EVIDENCE = 'review evidence';
    public const CALCULATE_COMPLIANCE_SCORES = 'calculate compliance scores';
    public const VIEW_REPORTS = 'view reports';
    public const EXPORT_REPORTS = 'export reports';
    public const VIEW_FILE_LIBRARY = 'view file library';
    public const MANAGE_FILE_LIBRARY = 'manage file library';
    public const VIEW_POLICIES = 'view policies';
    public const MANAGE_POLICIES = 'manage policies';
    public const ASSIGN_POLICIES = 'assign policies';
    public const ACKNOWLEDGE_POLICIES = 'acknowledge policies';
    public const IMPERSONATE_USERS = 'impersonate users';
    public const VIEW_AUDIT_LOGS = 'view audit logs';

    public static function all(): array
    {
        return [
            self::MANAGE_TENANTS,
            self::MANAGE_USERS,
            self::INVITE_EMPLOYEES,
            self::MANAGE_DEPARTMENTS,
            self::MANAGE_COURSES,
            self::MANAGE_LESSONS,
            self::ASSIGN_TRAINING,
            self::MANAGE_TESTS,
            self::TAKE_TESTS,
            self::MANAGE_COMPLIANCE_FRAMEWORKS,
            self::MANAGE_COMPLIANCE_SUBMISSIONS,
            self::ANSWER_COMPLIANCE_QUESTIONS,
            self::UPLOAD_EVIDENCE,
            self::REVIEW_EVIDENCE,
            self::CALCULATE_COMPLIANCE_SCORES,
            self::VIEW_REPORTS,
            self::EXPORT_REPORTS,
            self::VIEW_FILE_LIBRARY,
            self::MANAGE_FILE_LIBRARY,
            self::VIEW_POLICIES,
            self::MANAGE_POLICIES,
            self::ASSIGN_POLICIES,
            self::ACKNOWLEDGE_POLICIES,
            self::IMPERSONATE_USERS,
            self::VIEW_AUDIT_LOGS,
        ];
    }
}
