<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GenericActionMailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $subject,
        protected string $title,
        protected string $message,
        protected ?string $actionUrl = null,
        protected ?string $actionLabel = null,
    ) {
        $this->queue = 'mail';
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage())
            ->subject($this->subject)
            ->greeting('Hello,')
            ->line($this->title)
            ->line($this->message);

        if ($this->actionUrl && $this->actionLabel) {
            $mail->action($this->actionLabel, $this->actionUrl);
        }

        return $mail;
    }
}
