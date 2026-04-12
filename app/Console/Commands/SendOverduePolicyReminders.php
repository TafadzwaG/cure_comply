<?php

namespace App\Console\Commands;

use App\Services\PolicyWorkflowService;
use Illuminate\Console\Command;

class SendOverduePolicyReminders extends Command
{
    protected $signature = 'policies:send-overdue-reminders';

    protected $description = 'Mark overdue policy acknowledgments and send reminder notifications.';

    public function handle(PolicyWorkflowService $policyWorkflowService): int
    {
        $sent = $policyWorkflowService->sendOverdueReminders();

        $this->info(sprintf('Processed overdue policy reminders. Sent %d reminder%s.', $sent, $sent === 1 ? '' : 's'));

        return self::SUCCESS;
    }
}
