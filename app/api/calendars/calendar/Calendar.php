<?php
namespace SP\App\Api\Calendars\Calendar;

require_once __DIR__.'/../../crud/CRUD.php';
use SP\App\Api\Crud\CRUD;

class Calendar extends CRUD
{
    protected $table = 'calendar';
}
