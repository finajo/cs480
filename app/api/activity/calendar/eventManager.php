<?php
namespace SP\App\Api\Activity\Calendar;

require_once 'CalEvent.php';
require_once __DIR__.'/../../crud/ActivityCrudManager.php';

use SP\App\Api\CRUD\ActivityCrudManager;

/**
* @var mixed[] $request Array with event bindings to create event.
*/
$request = json_decode(file_get_contents('php://input'), true);

$manager = new ActivityCrudManager(
    $_SERVER['REQUEST_METHOD'],
    new CalEvent(),
    $request,
    isset($_GET['id']) ? $_GET['id'] : null,
    isset($_GET['byUser']) ? $_GET['byUser'] : null,
    isset($_GET['where']) ? $_GET['where'] : null,
    isset($_GET['bindings']) ? $_GET['bindings'] : null
);

echo json_encode($manager->getResponse());
