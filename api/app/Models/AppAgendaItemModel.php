<?php
namespace App\Models;

use CodeIgniter\Model;

class AppAgendaItemModel extends Model
{
    protected $table         = 'app_agenda_item';
    protected $primaryKey    = 'id';
    protected $allowedFields = [
        'day_id',
        'session',
        'type',
        'topic',
        'sort_order',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
