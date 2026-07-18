<?php
namespace App\Models;

use CodeIgniter\Model;

class AppBreakoutGroupModel extends Model
{
    protected $table         = 'app_breakout_group';
    protected $primaryKey    = 'id';
    protected $allowedFields = [
        'code',
        'title',
        'content',
        'sort_order',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
