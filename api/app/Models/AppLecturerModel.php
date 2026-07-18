<?php
namespace App\Models;

use CodeIgniter\Model;

class AppLecturerModel extends Model
{
    protected $table         = 'app_lecturer';
    protected $primaryKey    = 'id';
    protected $allowedFields = [
        'name',
        'image',
        'title',
        'intro',
        'heading',
        'content',
        'sort_order',
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
