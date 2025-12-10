<?php
/**
 * Chatbot Settings API - Manage chatbot configuration
 * Updated to use DataAccessInterface instead of direct file operations
 */

require_once __DIR__ . '/_auth.php';
require_once __DIR__ . '/lib/response-cache.php';
require_once __DIR__ . '/../lib/DataAccessFactory.php';

$auth = donna_cors_and_auth();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $dal = DataAccessFactory::create();

    switch ($method) {
        case 'GET':
            handleGetSettings($dal, $auth);
            break;

        case 'POST':
            handleUpdateSettings($dal, $auth);
            break;

        case 'PUT':
            handleUpdateSettings($dal, $auth);
            break;

        case 'DELETE':
            handleResetSettings($dal, $auth);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE']
            ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

function handleGetSettings($dal, $auth) {
    respond_with_cache('chatbot_settings_' . $auth['user_id'], function() use ($dal, $auth) {
        try {
            // Get user-specific settings
            $userSettings = $dal->getUserMemory($auth['user_id'], 'chatbot_settings');

            // Get global/system settings
            $globalSettings = $dal->getUserMemory('system', 'chatbot_global_settings');

            // Merge settings with user settings taking precedence
            $defaultSettings = [
                'theme' => 'light',
                'language' => 'en',
                'auto_save' => true,
                'notifications' => true,
                'response_style' => 'professional',
                'max_context_length' => 4000,
                'temperature' => 0.7,
                'model' => 'gpt-4',
                'features' => [
                    'email_integration' => true,
                    'calendar_integration' => false,
                    'file_upload' => true,
                    'voice_input' => false
                ]
            ];

            $settings = array_merge(
                $defaultSettings,
                is_array($globalSettings) ? $globalSettings : [],
                is_array($userSettings) ? $userSettings : []
            );

            return [
                'success' => true,
                'data' => $settings,
                'user_id' => $auth['user_id'],
                'has_user_settings' => !empty($userSettings),
                'has_global_settings' => !empty($globalSettings)
            ];

        } catch (Exception $e) {
            // Fallback to file-based settings if database fails
            return handleGetSettingsFromFile($auth);
        }
    }, 300);
}

function handleGetSettingsFromFile($auth) {
    $settingsFile = __DIR__ . '/../data/chatbot_settings.json';

    if (file_exists($settingsFile)) {
        $json = file_get_contents($settingsFile);
        $settings = json_decode($json, true);

        return [
            'success' => true,
            'data' => $settings,
            'source' => 'file_fallback'
        ];
    } else {
        return [
            'success' => true,
            'data' => null,
            'source' => 'file_fallback'
        ];
    }
}

function handleUpdateSettings($dal, $auth) {
    invalidate_cache('chatbot_settings_' . $auth['user_id']);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON input'
        ]);
        return;
    }

    try {
        // Validate settings
        $validatedSettings = validateSettings($input);

        // Store user-specific settings
        $success = $dal->setUserMemory(
            $auth['user_id'],
            'chatbot_settings',
            $validatedSettings,
            'chatbot_config'
        );

        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $validatedSettings
            ]);
        } else {
            throw new Exception('Failed to save settings to database');
        }

    } catch (Exception $e) {
        // Fallback to file storage
        try {
            $settingsFile = __DIR__ . '/../data/chatbot_settings.json';
            if (!file_exists(dirname($settingsFile))) {
                mkdir(dirname($settingsFile), 0777, true);
            }

            file_put_contents($settingsFile, json_encode($input, JSON_PRETTY_PRINT));

            echo json_encode([
                'success' => true,
                'message' => 'Settings updated successfully (file fallback)',
                'source' => 'file_fallback'
            ]);

        } catch (Exception $fileError) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to save settings',
                'message' => $e->getMessage(),
                'fallback_error' => $fileError->getMessage()
            ]);
        }
    }
}

function handleResetSettings($dal, $auth) {
    invalidate_cache('chatbot_settings_' . $auth['user_id']);

    try {
        $success = $dal->deleteUserMemory($auth['user_id'], 'chatbot_settings');

        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Settings reset to defaults'
            ]);
        } else {
            throw new Exception('Failed to reset settings');
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to reset settings',
            'message' => $e->getMessage()
        ]);
    }
}

function validateSettings($settings) {
    $validated = [];

    // Validate theme
    if (isset($settings['theme'])) {
        $validated['theme'] = in_array($settings['theme'], ['light', 'dark', 'auto'])
            ? $settings['theme'] : 'light';
    }

    // Validate language
    if (isset($settings['language'])) {
        $validated['language'] = preg_match('/^[a-z]{2}$/', $settings['language'])
            ? $settings['language'] : 'en';
    }

    // Validate boolean settings
    $booleanSettings = ['auto_save', 'notifications'];
    foreach ($booleanSettings as $setting) {
        if (isset($settings[$setting])) {
            $validated[$setting] = (bool)$settings[$setting];
        }
    }

    // Validate response style
    if (isset($settings['response_style'])) {
        $validated['response_style'] = in_array($settings['response_style'],
            ['professional', 'casual', 'friendly', 'technical'])
            ? $settings['response_style'] : 'professional';
    }

    // Validate numeric settings
    if (isset($settings['max_context_length'])) {
        $validated['max_context_length'] = max(1000, min(8000, (int)$settings['max_context_length']));
    }

    if (isset($settings['temperature'])) {
        $validated['temperature'] = max(0.0, min(2.0, (float)$settings['temperature']));
    }

    // Validate model
    if (isset($settings['model'])) {
        $validated['model'] = in_array($settings['model'],
            ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet'])
            ? $settings['model'] : 'gpt-4';
    }

    // Validate features
    if (isset($settings['features']) && is_array($settings['features'])) {
        $validated['features'] = [];
        $allowedFeatures = ['email_integration', 'calendar_integration', 'file_upload', 'voice_input'];

        foreach ($allowedFeatures as $feature) {
            if (isset($settings['features'][$feature])) {
                $validated['features'][$feature] = (bool)$settings['features'][$feature];
            }
        }
    }

    // Copy any other valid settings
    $otherSettings = ['custom_prompts', 'shortcuts', 'integrations'];
    foreach ($otherSettings as $setting) {
        if (isset($settings[$setting])) {
            $validated[$setting] = $settings[$setting];
        }
    }

    return $validated;
}
?>

