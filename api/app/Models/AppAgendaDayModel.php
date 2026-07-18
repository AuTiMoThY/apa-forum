<?php
namespace App\Models;

use CodeIgniter\Model;

class AppAgendaDayModel extends Model
{
    protected $table         = 'app_agenda_day';
    protected $primaryKey    = 'id';
    protected $allowedFields = [
        'label',
        'sort_order',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
