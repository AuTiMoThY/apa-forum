<?php
namespace App\Models;

use CodeIgniter\Model;

class AppBreakoutLecturerModel extends Model
{
    protected $table         = 'app_breakout_lecturer';
    protected $primaryKey    = 'id';
    protected $allowedFields = [
        'group_id',
        'name',
        'image',
        'title',
        'intro',
        'sort_order',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
