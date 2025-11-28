<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package MediaManager
 */

require dirname(__DIR__, 2) . '/vendor/autoload.php';

// Load plugin classes needed in tests.
require dirname(__DIR__, 2) . '/includes/class-taxonomy.php';
require dirname(__DIR__, 2) . '/includes/class-suggestions.php';
require dirname(__DIR__, 2) . '/includes/class-admin.php';
