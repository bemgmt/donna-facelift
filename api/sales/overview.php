<?php
require_once __DIR__ . '/../_auth.php';
require_once __DIR__ . '/../lib/ApiResponder.php';
$auth = donna_cors_and_auth();
ApiResponder::initTraceId();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = [
        'contacts' => [],
        'leads' => [],
        'stats' => [
            'total_contacts' => 0,
            'hot_leads' => 0,
            'conversion_rate' => 0.0
        ]
    ];
    ApiResponder::jsonSuccess($data);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $input['action'] ?? '';

// Load mail helper for actions that need it
require_once __DIR__ . '/../lib/mail.php';
if (function_exists('donna_load_env')) { donna_load_env(); }

switch ($action) {
    case 'send_email':
        $email = $input['email'] ?? [];
        $to = trim($email['to'] ?? '');
        $subject = trim($email['subject'] ?? '');
        $body = trim($email['body'] ?? '');
        $from = trim($email['from'] ?? (getenv('EMAIL_FROM') ?: ''));
        $from_name = trim($email['from_name'] ?? (getenv('EMAIL_FROM_NAME') ?: 'DONNA'));

        $validation = ApiResponder::validateRequired(['to' => $to, 'subject' => $subject, 'body' => $body], ['to', 'subject', 'body']);
        if (!$validation['valid']) {
            ApiResponder::jsonValidationError($validation['message']);
        }

        try {
            // Prefer PHPMailer when available; fallback to raw SMTP
            if (function_exists('donna_phpmailer_send')) {
                $res = donna_phpmailer_send(['to'=>$to,'subject'=>$subject,'body'=>$body,'from'=>$from,'from_name'=>$from_name]);
                if (!$res['success'] && function_exists('donna_smtp_send')) {
                    $res = donna_smtp_send(['to'=>$to,'subject'=>$subject,'body'=>$body,'from'=>$from,'from_name'=>$from_name]);
                }
            } elseif (function_exists('donna_smtp_send')) {
                $res = donna_smtp_send(['to'=>$to,'subject'=>$subject,'body'=>$body,'from'=>$from,'from_name'=>$from_name]);
            } else {
                $res = ['success'=>false,'error'=>'mail helper missing'];
            }

            if ($res['success']) {
                ApiResponder::jsonSuccess(['message' => 'Email sent', 'to' => $to]);
            } else {
                ApiResponder::jsonError($res['error'] ?? 'send failed');
            }
        } catch (Exception $e) {
            ApiResponder::jsonServerError('Email sending failed: ' . $e->getMessage());
        }

    case 'send_text':
        ApiResponder::jsonSuccess(['message' => 'Text queued']);

    default:
        ApiResponder::jsonSuccess(['action' => $action]);
}

